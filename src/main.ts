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
}

const DEFAULT_SETTINGS: ConverterSettings = {
	outputFormat: "storage",
	codeBlockTheme: "Confluence",
	codeBlockShowLineNumbers: false,
	codeBlockCollapse: false,
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
						this.convert2Clipboard(editor);
					}
					return true;
				}
				return false;
			}
		});
		// this.addRibbonIcon('home', 'Confluence Wiki Markup', async () => {
		// 	await this.convert2Clipboard();
		// });
		this.addSettingTab(new ConverterSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as ConverterSettings);
	}

	private async convert2Clipboard(editor: Editor) {
		let content = editor.getSelection() ? editor.getSelection() : editor.getValue();
		let converted: string;

		if (this.settings.outputFormat === "storage") {
			// Confluence Storage Format (XHTML)
			const options: MarkdownToStorageFormatOptions = {
				codeBlock: {
					showLineNumbers: this.settings.codeBlockShowLineNumbers,
					collapse: this.settings.codeBlockCollapse
				}
			};
			converted = marked.parse(content, {
				renderer: new ConfluenceStorageRenderer(options),
				async: false,
			}) as string;
		} else {
			// Wiki Markup Format
			const options: MarkdownToAtlassianWikiMarkupOptions = {
				codeBlock: {
					theme: CodeBlockTheme[this.settings.codeBlockTheme as keyof typeof CodeBlockTheme],
					showLineNumbers: this.settings.codeBlockShowLineNumbers,
					collapse: this.settings.codeBlockCollapse
				}
			};
			converted = marked.parse(content, {
				renderer: new AtlassianWikiMarkupRenderer(options),
				async: false,
			}) as string;
		}

		navigator.clipboard.writeText(converted)
			.then(_ => new Notice(`Copied to clipboard (${this.settings.outputFormat === "storage" ? "Storage Format" : "Wiki Markup"})`));
	}
}

