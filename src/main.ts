import {Editor, MarkdownView, Notice, Plugin, TFile} from 'obsidian';
import {marked} from "marked";
import {AtlassianWikiMarkupRenderer, CodeBlockTheme, MarkdownToAtlassianWikiMarkupOptions} from "./confluenceRender";
import {ConfluenceStorageRenderer, MarkdownToStorageFormatOptions} from "./confluenceStorageRender";
import ConverterSettingTab from "./converterSettingTab";
import {HeadingAnchorResolver, PAGE_URL_FRONTMATTER_KEY, stripFrontmatter} from "./headingAnchors";

export type OutputFormat = "wikimarkup" | "storage";

interface ConverterSettings {
	outputFormat: OutputFormat;
	codeBlockTheme: string;
	codeBlockShowLineNumbers: boolean;
	codeBlockCollapse: boolean;
	defaultImageWidth: number;
}

const DEFAULT_SETTINGS: ConverterSettings = {
	outputFormat: "storage",
	codeBlockTheme: "Confluence",
	codeBlockShowLineNumbers: false,
	codeBlockCollapse: false,
	defaultImageWidth: 0, // 0 means no width limit (original size)
}

export default class ConfluenceConverter extends Plugin {

	settings: ConverterSettings;

	async onload() {
		await this.loadSettings();
		this.addCommand({
			id: 'convert-to-confluence-to-clipboard',
			name: 'Convert to Confluence wiki markup and copy to clipboard',
			editorCheckCallback: (checking: boolean, editor, ctx) => {
				if (ctx instanceof MarkdownView) {
					if (!checking) {
						void this.convert2Clipboard(editor, ctx.file);
					}
					return true;
				}
				return false;
			}
		});
		this.addSettingTab(new ConverterSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		const data = (await this.loadData()) as Partial<ConverterSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	private async convert2Clipboard(editor: Editor, file: TFile | null) {
		const selection = editor.getSelection();
		const note = editor.getValue();
		const content = selection || stripFrontmatter(note);
		let converted: string;

		// Headings are looked up in the whole note so that links in a selection still resolve
		const headingAnchors = new HeadingAnchorResolver(note, this.getConfluencePageUrl(file));

		if (this.settings.outputFormat === "storage") {
			// Confluence Storage Format (XHTML)
			const options: MarkdownToStorageFormatOptions = {
				codeBlock: {
					showLineNumbers: this.settings.codeBlockShowLineNumbers,
					collapse: this.settings.codeBlockCollapse
				},
				image: {
					defaultWidth: this.settings.defaultImageWidth > 0 ? this.settings.defaultImageWidth : undefined
				},
				headingAnchors,
			};
			converted = marked.parse(content, {
				renderer: new ConfluenceStorageRenderer(options),
				async: false,
			});
		} else {
			// Wiki Markup Format
			const options: MarkdownToAtlassianWikiMarkupOptions = {
				codeBlock: {
					theme: CodeBlockTheme[this.settings.codeBlockTheme as keyof typeof CodeBlockTheme],
					showLineNumbers: this.settings.codeBlockShowLineNumbers,
					collapse: this.settings.codeBlockCollapse
				},
				image: {
					defaultWidth: this.settings.defaultImageWidth > 0 ? this.settings.defaultImageWidth : undefined
				},
				headingAnchors,
			};
			converted = marked.parse(content, {
				renderer: new AtlassianWikiMarkupRenderer(options),
				async: false,
			});
		}

		try {
			await this.writeConvertedToClipboard(converted, content);
			new Notice(`Copied to clipboard (${this.settings.outputFormat === "storage" ? "Storage Format" : "Wiki Markup"})`);
			if (this.settings.outputFormat === "storage" && headingAnchors.resolvedCount > 0 && !headingAnchors.hasPageUrl) {
				// The Confluence editor drops "#heading" links on paste; they need an absolute page URL
				new Notice(`Links to headings will paste as plain text. Add a "${PAGE_URL_FRONTMATTER_KEY}" property with the Confluence page URL to keep them as links.`, 10000);
			}
		} catch (e) {
			console.error("Confluence Converter: clipboard write failed", e);
			new Notice("Failed to copy to clipboard");
		}
	}

	private getConfluencePageUrl(file: TFile | null): string | undefined {
		if (!file) {
			return undefined;
		}
		const value: unknown = this.app.metadataCache.getFileCache(file)?.frontmatter?.[PAGE_URL_FRONTMATTER_KEY];
		return typeof value === "string" ? value : undefined;
	}

	private async writeConvertedToClipboard(converted: string, originalMarkdown: string) {
		// Storage Format is meant to be pasted into the Confluence editor as
		// rich content, which only happens if the clipboard exposes text/html.
		// We additionally expose the original markdown as text/plain so that
		// pasting into a plain-text target (terminal, search box, etc.) yields
		// readable content instead of raw <ac:...> XHTML.
		if (this.settings.outputFormat === "storage" && navigator.clipboard.write && typeof ClipboardItem !== "undefined") {
			await navigator.clipboard.write([
				new ClipboardItem({
					"text/html": new Blob([converted], {type: "text/html"}),
					"text/plain": new Blob([originalMarkdown], {type: "text/plain"}),
				}),
			]);
			return;
		}

		await navigator.clipboard.writeText(converted);
	}
}
