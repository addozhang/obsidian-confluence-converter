/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Tadayuki Onishi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import escapeStringRegexp from "escape-string-regexp";
import {Renderer, Tokens} from "marked";

import {AtlassianSupportLanguage, markdownToWikiMarkupLanguageMapping,} from "./language";

export const CodeBlockTheme = {
	DJango: "DJango",
	Emacs: "Emacs",
	FadeToGrey: "FadeToGrey",
	Midnight: "Midnight",
	RDark: "RDark",
	Eclipse: "Eclipse",
	Confluence: "Confluence",
} as const;
type CodeBlockTheme = typeof CodeBlockTheme[keyof typeof CodeBlockTheme];

export type MarkdownToAtlassianWikiMarkupOptions = {
	codeBlock?: {
		theme?: CodeBlockTheme;
		showLineNumbers?:
			| boolean
			| ((code: string, lang: AtlassianSupportLanguage) => boolean);
		collapse?:
			| boolean
			| ((code: string, lang: AtlassianSupportLanguage) => boolean);
	};
	image?: {
		defaultWidth?: number; // Default width in pixels (undefined means original size)
	};
	replaceNewLinesInParagraphs?: boolean | string;
};

type ListHeadCharacter = {
	Numbered: "#";
	Bullet: "*";
};
const ListHeadCharacter: ListHeadCharacter = {
	Numbered: "#",
	Bullet: "*",
};

type TableCellTypeCharacter = {
	Header: "||";
	NonHeader: "|";
};
const TableCellTypeCharacter: TableCellTypeCharacter = {
	Header: "||",
	NonHeader: "|",
};

const confluenceListRegExp = new RegExp(
	`^(${Object.values(ListHeadCharacter).map(escapeStringRegexp).join("|")})`
);

// RegExp to match markdown list markers (*, -, +, or 1., 2., etc.)
const markdownListRegExp = /^(\*|-|\+|\d+\.)\s/;

const replaceSingleNewlineWithSpace = (
	text: string,
	rendererOptions: MarkdownToAtlassianWikiMarkupOptions | undefined
): string => {
	const replaceNewLinesInParagraphs =
		rendererOptions?.replaceNewLinesInParagraphs || false;
	if (replaceNewLinesInParagraphs === false) return text;
	const replacementText =
		replaceNewLinesInParagraphs === true ? " " : replaceNewLinesInParagraphs;
	return text.replace(/((\r)?\n)/g, replacementText).trim();
};

const unescapeHtmlSpecialCharacteres = (text: string): string => {
	return text.replace(
		/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi,
		(substring: string, matchedString: string) => {
			const lowered = matchedString.toLowerCase();
			if (lowered === "colon") {
				return ":";
			}

			if (lowered === "amp") {
				return "&";
			}

			if (lowered === "lt") {
				return "<";
			}

			if (lowered === "gt") {
				return ">";
			}

			if (lowered === "quot") {
				return '"';
			}

			if (lowered.charAt(0) === "#" && lowered.charAt(1) === "x") {
				return String.fromCharCode(parseInt(lowered.substring(2), 16));
			}

			if (lowered.charAt(0) === "#" && lowered.charAt(1) !== "x") {
				return String.fromCharCode(Number(lowered.substring(1)));
			}

			return substring;
		}
	);
};

export class AtlassianWikiMarkupRenderer extends Renderer {
	private readonly rendererOptions?: MarkdownToAtlassianWikiMarkupOptions;

	public constructor(rendererOptions?: MarkdownToAtlassianWikiMarkupOptions) {
		super();
		this.rendererOptions = rendererOptions;
	}

	public paragraph({tokens}: Tokens.Paragraph): string {
		let out = this.parser.parseInline(tokens, this);
		const replacedText = replaceSingleNewlineWithSpace(
			out,
			this.rendererOptions
		);
		const unescapedText = unescapeHtmlSpecialCharacteres(replacedText);
		return `${unescapedText}\n\n`;
	}

	public heading({tokens, depth}: Tokens.Heading): string {
		return `h${depth}. ${this.parser.parseInline(tokens, this)}\n\n`;
	}

	public strong({tokens}: Tokens.Strong): string {
		return `*${this.parser.parseInline(tokens, this)}*`;
	}

	public em({tokens}: Tokens.Em): string {
		return `_${this.parser.parseInline(tokens, this)}_`;
	}

	public del({tokens}: Tokens.Del): string {
		return `-${this.parser.parseInline(tokens, this)}-`;
	}

	public codespan({text}: Tokens.Codespan): string {
		return `{{${text}}}`;
	}

	public text(token: Tokens.Text | Tokens.Escape): string {
		// Match Obsidian image syntax: ![[filename.png]]
		const text = token.text.replace(/!\[\[(.*?)\]\]/g, (match, filename) => {
			return `!${filename}!`;
		});
		return super.text({ ...token, text });
	}

	public blockquote({tokens}: Tokens.Blockquote): string {
		return `{quote}${(this.parser.parse(tokens))}{quote}\n`;
	}

	public br(): string {
		return "\n";
	}

	public hr(): string {
		return "----\n";
	}

	public link({href, title, text}: Tokens.Link): string {
		const linkAlias = text === "" ? title : text;
		return linkAlias ? `[${linkAlias}|${href}]` : `[${href}]`;
	}


	public list({items, ordered}: Tokens.List): string {
		let body = '';
		const type = ordered ? ListHeadCharacter.Numbered : ListHeadCharacter.Bullet;
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			let itemBody = this.listitem(item);
			body += itemBody
		}
		
		
		body = body.trim()
			.split('\n')
			.filter((line) => !!line)
			.map(line => {
				// Count leading spaces BEFORE trimming
				const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;
				const trimmed = line.trim();
				
				
				// Check if this is already a Confluence-formatted list item (from nested list() calls)
				if (confluenceListRegExp.test(trimmed)) {
					// Already has Confluence prefix, add one more level
					return `${type}${trimmed}`;
				}
				
				// Check if this is a markdown-formatted list item (marked treated as text)
				if (markdownListRegExp.test(trimmed)) {
					// Calculate nesting level based on indentation (2 spaces per level)
					const nestLevel = Math.floor(leadingSpaces / 2);
					// Remove markdown marker and add appropriate Confluence prefix
					const content = trimmed.replace(markdownListRegExp, '');
					const prefix = type.repeat(nestLevel + 1);
					return `${prefix} ${content}`;
				}
				
				// Regular content, add prefix with space
				return `${type} ${trimmed}`;
			})
			.join('\n');
		return `${body}\n\n`;
	}


	public listitem(item: Tokens.ListItem): string {
		let itemBody = '';
		if (item.tokens[0]?.type === "text") {
			itemBody += `${this.parser.parseInline(item.tokens[0]?.tokens || [], this)}\n`;
		}
		if (item.tokens.length > 1) {
			itemBody += this.parser.parse(item.tokens.slice(1), !!item.loose);
		}
		return `${itemBody}\n`;
	}

	public checkbox({checked}: Tokens.Checkbox): string {
		// Confluence wiki does not support checkbox.
		return "";
	}

	public image({href, title, text}: Tokens.Image): string {
		const params: Record<string, string | number | null> = {};
		
		if (text) params.alt = text;
		if (title) params.title = title;
		
		// Apply default width if configured
		const width = this.rendererOptions?.image?.defaultWidth;
		if (width) {
			params.width = width;
		}
		
		const paramsString = Object.entries(params)
			.filter(([, value]) => {
				return value !== null && value !== "" && String(value).trim() !== "";
			})
			// Sort by key to prevent the order from changing in the way of defining params
			.sort((a, b) => (a[0] > b[0] ? 1 : -1))
			.map(([key, value]) => `${key}=${value}`)
			.join(",");

		return paramsString === "" ? `!${href}!` : `!${href}|${paramsString}!`;
	}

	public table({header, rows}: Tokens.Table): string {
		let out = '';
		let headerBody = header
			.map(cell => `|${cell.text}|`)
			.join('');
		out += `|${headerBody}|`
		rows.forEach(row => {
			let rowBody = row
				.map(cell => this.tablecell(cell))
				.join('');
			out += `\n${rowBody}|`
		})

		return `${out}\n`;
	}

	public tablerow({text}: Tokens.TableRow): string {
		const removedEscapePipe = text.replace("\\|", "");
		const twoPipeMatch = removedEscapePipe.match(/\|\|(?!.*\|\|)/);
		const onePipeMatch = removedEscapePipe.match(/\|(?!.*\|)/);
		const rowCloseType = ((): TableCellTypeCharacter[keyof TableCellTypeCharacter] => {
			if (!onePipeMatch?.index) {
				throw new Error(
					"The table row expects at least one '|' in the table cell."
				);
			}

			if (twoPipeMatch?.index) {
				const indexDiff = onePipeMatch.index - twoPipeMatch.index;
				return indexDiff === 1
					? TableCellTypeCharacter.Header
					: TableCellTypeCharacter.NonHeader;
			}

			return TableCellTypeCharacter.NonHeader;
		})();

		return `${text}${rowCloseType}\n`;
	}

	public tablecell({text, tokens, header}: Tokens.TableCell): string {
		const type = header
			? TableCellTypeCharacter.Header
			: TableCellTypeCharacter.NonHeader;
		const emptyComplementedContent = text === "" ? "\u{0020}" : this.parser.parseInline(tokens, this);
		return `${type}${emptyComplementedContent}`;
	}

	html({text}: Tokens.HTML | Tokens.Tag): string {
		return text.replace(/<br>/g, '\n');
	}

	public code({text, lang, escaped}: Tokens.Code): string {
		const theme =
			(this.rendererOptions &&
				this.rendererOptions.codeBlock &&
				this.rendererOptions.codeBlock.theme) ||
			CodeBlockTheme.Confluence;

		const usingLang = lang
			? markdownToWikiMarkupLanguageMapping.get(lang.toLowerCase()) ||
			AtlassianSupportLanguage.None
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

		const params = {
			language: usingLang,
			theme: theme,
			linenumbers: isDisplayLinenumbers,
			collapse: isCollapseCodeBlock,
		};
		const paramsString = Object.entries(params)
			// Sort by key to prevent the order from changing in the way of defining params
			.sort((a, b) => (a[0] > b[0] ? 1 : -1))
			.map(([key, value]) => `${key}=${value}`)
			.join("|");
		return `{code:${paramsString}}\n${text}\n{code}\n\n`;
	}
}
