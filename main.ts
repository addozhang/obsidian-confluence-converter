import {MarkdownView, Plugin} from 'obsidian';
import {marked} from "marked";
import {AtlassianWikiMarkupRenderer} from "./confluenceRender";


export default class ConfluenceToolkit extends Plugin {

	async onload() {
		this.addCommand({
			id: 'convert-to-confluence-to-clipboard',
			name: 'Convert to Confluence and Copy to Clipboard',
			editorCheckCallback: (checking: boolean, editor, ctx) => {
				if (ctx instanceof MarkdownView) {
					if (!checking) {
						this.convert2Clipboard();
					}
					return true;
				}
				return false;
			}
		});
		this.addRibbonIcon('Confluence', 'Confluence Markup', async () => {
			await this.convert2Clipboard();
		});
	}

	onunload() {

	}

	private async convert2Clipboard() {
		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if(!editor) {
			return
		}
		let content = editor.getSelection() ? editor.getSelection() : editor.getValue();
		let converted = await marked(content, {renderer: new AtlassianWikiMarkupRenderer()});
		navigator.clipboard.writeText(converted);
	}
}

