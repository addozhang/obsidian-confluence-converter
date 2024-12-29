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

import {
	AtlassianSupportLanguage,
	markdownToWikiMarkupLanguageMapping,
} from "./language";
import {text} from "node:stream/consumers";
import {type} from "node:os";

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
	private rendererOptions?: MarkdownToAtlassianWikiMarkupOptions;

	public constructor(rendererOptions?: MarkdownToAtlassianWikiMarkupOptions) {
		super();
		this.rendererOptions = rendererOptions;
	}

	public paragraph({text}: Tokens.Paragraph): string {
		const replacedText = replaceSingleNewlineWithSpace(
			text,
			this.rendererOptions
		);
		const unescapedText = unescapeHtmlSpecialCharacteres(replacedText);
		return `${unescapedText}\n\n`;
	}

	public heading({text, depth}: Tokens.Heading): string {
		return `h${depth}. ${text}\n\n`;
	}

	public strong({text}: Tokens.Strong): string {
		return `*${text}*`;
	}

	public em({text}: Tokens.Em): string {
		return `_${text}_`;
	}

	public del({text}: Tokens.Del): string {
		return `-${text}-`;
	}

	public codespan({text}: Tokens.Codespan): string {
		return `{{${text}}}`;
	}

	public blockquote({text}: Tokens.Blockquote): string {
		return `{quote}${text.trim()}{quote}`;
	}

	public br(): string {
		return "\n";
	}

	public hr(): string {
		return "----\n";
	}

	public link({text, href, title}: Tokens.Link): string {
		const linkAlias = text === "" ? title : text;

		return linkAlias ? `[${linkAlias}|${href}]` : `[${href}]`;
	}


	public list({raw, ordered, start}: Tokens.List): string {
		const lines = raw
			.trim()
			.split("\n")
			.filter((line) => !!line);
		const type = ordered
			? ListHeadCharacter.Numbered
			: ListHeadCharacter.Bullet;
		const joinedLine = lines
			.map((line) => {
				return line.match(confluenceListRegExp)
					? `${type}${line}`
					: `${type} ${line}`;
			})
			.join("\n");

		return `\n${joinedLine}\n\n`;
	}

	public listitem({text}: Tokens.ListItem): string {
		return `${text}\n`;
	}

	public checkbox({checked}: Tokens.Checkbox): string {
		// Confluence wiki does not support checkbox.
		return "";
	}

	public image({href, title, text}: Tokens.Image): string {
		const params = {
			alt: text,
			title: title,
		};
		const paramsString = Object.entries(params)
			.filter(([, value]) => {
				return value !== null && value.trim() !== "";
			})
			// Sort by key to prevent the order from changing in the way of defining params
			.sort((a, b) => (a[0] > b[0] ? 1 : -1))
			.map(([key, value]) => `${key}=${value}`)
			.join(",");

		return paramsString === "" ? `!${href}!` : `!${href}|${paramsString}!`;
	}

	public table({header, rows}: Tokens.Table): string {
		console.log("header", header);
		console.log("rows", rows);
		const tableContent = header
			.map((cell, index) =>
				`||${cell.text}|${rows.map((row) => row[index].text).join("|")}|`
			)
			.join("\n");
		;
		return `${tableContent}\n`;
	}

	public tablerow({text}: Tokens.TableRow): string {
		console.log("text", text);
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

	public tablecell({text, header}: Tokens.TableCell): string {
		const type = header
			? TableCellTypeCharacter.Header
			: TableCellTypeCharacter.NonHeader;
		const emptyComplementedContent = text === "" ? "\u{0020}" : text;
		return `${type}${emptyComplementedContent}`;
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
