import {Editor, MarkdownView, Notice, Plugin} from 'obsidian';
import {marked} from "marked";
import {AtlassianWikiMarkupRenderer, CodeBlockTheme, MarkdownToAtlassianWikiMarkupOptions} from "./confluenceRender";
import {ConfluenceStorageRenderer, MarkdownToStorageFormatOptions} from "./confluenceStorageRender";
import ConverterSettingTab from "./converterSettingTab";

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
						void this.convert2Clipboard(editor);
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

	private async convert2Clipboard(editor: Editor) {
		const selection = editor.getSelection();
		const content = selection || editor.getValue();
		let converted: string;

		if (this.settings.outputFormat === "storage") {
			// Confluence Storage Format (XHTML)
			const options: MarkdownToStorageFormatOptions = {
				codeBlock: {
					showLineNumbers: this.settings.codeBlockShowLineNumbers,
					collapse: this.settings.codeBlockCollapse
				},
				image: {
					defaultWidth: this.settings.defaultImageWidth > 0 ? this.settings.defaultImageWidth : undefined
				}
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
				}
			};
			converted = marked.parse(content, {
				renderer: new AtlassianWikiMarkupRenderer(options),
				async: false,
			});
		}

		try {
			await navigator.clipboard.writeText(converted);
			new Notice(`Copied to clipboard (${this.settings.outputFormat === "storage" ? "Storage Format" : "Wiki Markup"})`);
		} catch (e) {
			console.error("Confluence Converter: clipboard write failed", e);
			new Notice("Failed to copy to clipboard");
		}
	}
}

