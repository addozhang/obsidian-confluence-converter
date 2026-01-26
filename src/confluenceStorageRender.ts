/**
 * Confluence Storage Format (XHTML) Renderer
 * Converts Markdown to Confluence Storage Format for direct pasting into Confluence editor
 */
import {Renderer, Tokens} from "marked";
import {AtlassianSupportLanguage, markdownToWikiMarkupLanguageMapping} from "./language";

export type MarkdownToStorageFormatOptions = {
	codeBlock?: {
		showLineNumbers?: boolean | ((code: string, lang: AtlassianSupportLanguage) => boolean);
		collapse?: boolean | ((code: string, lang: AtlassianSupportLanguage) => boolean);
	};
};

/**
 * Confluence Storage Format Renderer
 * Generates XHTML that can be directly pasted into Confluence editor
 */
export class ConfluenceStorageRenderer extends Renderer {
	private readonly rendererOptions?: MarkdownToStorageFormatOptions;

	public constructor(rendererOptions?: MarkdownToStorageFormatOptions) {
		super();
		this.rendererOptions = rendererOptions;
	}

	public paragraph({tokens}: Tokens.Paragraph): string {
		const content = this.parser.parseInline(tokens, this);
		return `<p>${content}</p>`;
	}

	public heading({tokens, depth}: Tokens.Heading): string {
		const content = this.parser.parseInline(tokens, this);
		return `<h${depth}>${content}</h${depth}>`;
	}

	public strong({tokens}: Tokens.Strong): string {
		return `<strong>${this.parser.parseInline(tokens, this)}</strong>`;
	}

	public em({tokens}: Tokens.Em): string {
		return `<em>${this.parser.parseInline(tokens, this)}</em>`;
	}

	public del({tokens}: Tokens.Del): string {
		return `<s>${this.parser.parseInline(tokens, this)}</s>`;
	}

	public codespan({text}: Tokens.Codespan): string {
		return `<code>${this.escapeHtml(text)}</code>`;
	}

	public text(token: Tokens.Text | Tokens.Escape): string {
		// Match Obsidian image syntax: ![[filename.png]]
		// Note: This is raw text, not HTML, so we need to handle it carefully
		let text = token.text;
		
		// Check if this contains Obsidian image syntax
		if (text.includes("![[") && text.includes("]]")) {
			text = text.replace(/!\[\[(.*?)\]\]/g, (match, filename) => {
				// Return the XML structure without escaping it (it's our own generated XML)
				return `<ac:image><ri:attachment ri:filename="${filename}" /></ac:image>`;
			});
			// Don't escape the XML we just generated
			return text;
		}
		
		// For regular text, use parent's text handling which properly escapes
		return super.text(token);
	}

	public blockquote({tokens}: Tokens.Blockquote): string {
		const content = this.parser.parse(tokens);
		return `<blockquote>${content}</blockquote>`;
	}

	public br(): string {
		return "<br />";
	}

	public hr(): string {
		return "<hr />";
	}

	public link({href, title, text}: Tokens.Link): string {
		const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : "";
		return `<a href="${this.escapeHtml(href)}"${titleAttr}>${text}</a>`;
	}

	public list({items, ordered}: Tokens.List): string {
		const tag = ordered ? "ol" : "ul";
		let body = "";
		for (let i = 0; i < items.length; i++) {
			body += this.listitem(items[i]);
		}
		return `<${tag}>${body}</${tag}>`;
	}

	public listitem(item: Tokens.ListItem): string {
		let content = "";
		
		// Handle first text token
		if (item.tokens.length > 0 && item.tokens[0]?.type === "text") {
			content += this.parser.parseInline(item.tokens[0]?.tokens || [], this);
		}
		
		// Handle remaining tokens
		if (item.tokens.length > 1) {
			content += this.parser.parse(item.tokens.slice(1), !!item.loose);
		}
		
		return `<li>${content}</li>`;
	}

	public checkbox({checked}: Tokens.Checkbox): string {
		// Confluence task list format
		return checked 
			? '<ac:task><ac:task-status>complete</ac:task-status><ac:task-body>' 
			: '<ac:task><ac:task-status>incomplete</ac:task-status><ac:task-body>';
	}

	public image({href, title, text}: Tokens.Image): string {
		const altAttr = text ? ` alt="${this.escapeHtml(text)}"` : "";
		const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : "";
		
		// If it's an attachment (local file), use Confluence attachment format
		if (!href.startsWith("http://") && !href.startsWith("https://")) {
			return `<ac:image${altAttr}><ri:attachment ri:filename="${this.escapeHtml(href)}" /></ac:image>`;
		}
		
		// External URL image
		return `<ac:image${altAttr}><ri:url ri:value="${this.escapeHtml(href)}" /></ac:image>`;
	}

	public table({header, rows}: Tokens.Table): string {
		let tableContent = "<table><tbody>";
		
		// Header row
		tableContent += "<tr>";
		for (const cell of header) {
			tableContent += `<th>${this.parser.parseInline(cell.tokens, this)}</th>`;
		}
		tableContent += "</tr>";
		
		// Body rows
		for (const row of rows) {
			tableContent += "<tr>";
			for (const cell of row) {
				const content = this.parser.parseInline(cell.tokens, this);
				tableContent += `<td>${content || "&nbsp;"}</td>`;
			}
			tableContent += "</tr>";
		}
		
		tableContent += "</tbody></table>";
		return tableContent;
	}

	public tablerow({text}: Tokens.TableRow): string {
		// Not used in the new implementation
		return "";
	}

	public tablecell({tokens}: Tokens.TableCell): string {
		// Not used in the new implementation
		return "";
	}

	public html({text}: Tokens.HTML | Tokens.Tag): string {
		// Pass through HTML, but be cautious
		return text;
	}

	public code({text, lang}: Tokens.Code): string {
		const usingLang = lang
			? markdownToWikiMarkupLanguageMapping.get(lang.toLowerCase()) || AtlassianSupportLanguage.None
			: AtlassianSupportLanguage.None;

		const isDisplayLinenumbers = ((): boolean => {
			const defaultValue = false;
			if (!this.rendererOptions?.codeBlock) {
				return defaultValue;
			}

			if (this.rendererOptions.codeBlock.showLineNumbers instanceof Function) {
				return this.rendererOptions.codeBlock.showLineNumbers(text, usingLang);
			}

			return this.rendererOptions.codeBlock.showLineNumbers ?? defaultValue;
		})();

		const isCollapseCodeBlock = ((): boolean => {
			const defaultValue = false;
			if (!this.rendererOptions?.codeBlock) {
				return defaultValue;
			}

			if (this.rendererOptions.codeBlock.collapse instanceof Function) {
				return this.rendererOptions.codeBlock.collapse(text, usingLang);
			}

			return this.rendererOptions.codeBlock.collapse ?? defaultValue;
		})();

		// Build Confluence code macro parameters
		const params: string[] = [];
		if (usingLang !== AtlassianSupportLanguage.None) {
			params.push(`<ac:parameter ac:name="language">${usingLang}</ac:parameter>`);
		}
		if (isDisplayLinenumbers) {
			params.push(`<ac:parameter ac:name="linenumbers">true</ac:parameter>`);
		}
		if (isCollapseCodeBlock) {
			params.push(`<ac:parameter ac:name="collapse">true</ac:parameter>`);
		}

		const paramsString = params.join("");
		const escapedCode = this.escapeHtml(text);

		return `<ac:structured-macro ac:name="code">${paramsString}<ac:plain-text-body><![CDATA[${escapedCode}]]></ac:plain-text-body></ac:structured-macro>`;
	}

	/**
	 * Escape HTML special characters
	 */
	private escapeHtml(text: string): string {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}
}
