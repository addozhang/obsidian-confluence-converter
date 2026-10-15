/**
 * Resolves links to headings within the same note into Confluence heading anchors.
 *
 * Obsidian notes link to their own headings in several ways, all of which should
 * end up pointing at the same Confluence heading:
 *   - Wikilinks:              [[#Parent#Heading|alias]]
 *   - URL-encoded links:      [text](#My%20Heading)
 *   - GitHub-style slugs:     [text](#my-heading)
 *   - Confluence-style ids:   [text](#My-Heading)
 *
 * Confluence Cloud identifies a heading by its text with whitespace replaced by
 * hyphens (case and punctuation preserved), e.g. "Bootstrapping (cold start)"
 * becomes "#Bootstrapping-(cold-start)".
 *
 * The Confluence Cloud editor discards fragment-only hrefs ("#anchor") when HTML is
 * pasted into it, so when the Confluence page URL is known the anchor is appended to
 * it to produce an absolute link that survives pasting.
 */
import {marked, Token, Tokens} from "marked";

export const PAGE_URL_FRONTMATTER_KEY = "confluence-page-url";

// Matches wikilinks to headings in the same note, e.g. [[#Heading]] or [[#Parent#Heading|alias]].
// Block references ([[#^block-id]]) are not headings and are left alone.
export const HEADING_WIKILINK_REGEXP = /(?<!!)\[\[#(?!\^)([^\]|]+)(?:\|([^\]]*))?\]\]/g;

const FRONTMATTER_REGEXP = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/;

export function stripFrontmatter(markdown: string): string {
	return markdown.replace(FRONTMATTER_REGEXP, "");
}

export function toConfluenceAnchor(headingText: string): string {
	return headingText.trim().replace(/\s+/g, "-");
}

function toGithubSlug(headingText: string): string {
	return headingText
		.trim()
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s_-]/gu, "")
		.replace(/\s/g, "-");
}

function plainText(tokens: Token[]): string {
	return tokens
		.map(token => {
			if ("tokens" in token && token.tokens) {
				return plainText(token.tokens);
			}
			return "text" in token && typeof token.text === "string" ? token.text : "";
		})
		.join("");
}

function collectHeadings(tokens: Token[], headings: string[]) {
	for (const token of tokens) {
		if (token.type === "heading") {
			headings.push(plainText(token.tokens ?? []));
		} else if (token.type === "list") {
			for (const item of (token as Tokens.List).items) {
				collectHeadings(item.tokens, headings);
			}
		} else if ("tokens" in token && token.tokens) {
			collectHeadings(token.tokens, headings);
		}
	}
}

function safeDecode(text: string): string {
	try {
		return decodeURIComponent(text);
	} catch {
		return text;
	}
}

export class HeadingAnchorResolver {
	private readonly headings: string[] = [];
	private readonly pageUrl: string;
	private anchorLinkCount = 0;

	/**
	 * @param markdown the full note, used to find the headings that links can point to
	 * @param pageUrl  URL of the Confluence page the content will be pasted into, if known
	 */
	public constructor(markdown = "", pageUrl?: string) {
		collectHeadings(marked.lexer(stripFrontmatter(markdown)), this.headings);
		this.pageUrl = (pageUrl ?? "").trim().replace(/#.*$/, "");
	}

	/** Number of heading links resolved so far. */
	public get resolvedCount(): number {
		return this.anchorLinkCount;
	}

	public get hasPageUrl(): boolean {
		return this.pageUrl !== "";
	}

	/**
	 * Converts a fragment ("#My%20Heading", "#my-heading", "Parent#Heading", ...) into
	 * the href of the matching Confluence heading.
	 */
	public resolve(fragment: string): string {
		this.anchorLinkCount++;
		const anchor = toConfluenceAnchor(this.findHeading(fragment));
		return `${this.pageUrl}#${anchor}`;
	}

	/** Text Obsidian displays for a heading wikilink without an alias. */
	public static wikilinkDisplayText(target: string): string {
		const segments = target.split("#").filter(segment => segment.trim() !== "");
		return (segments[segments.length - 1] ?? target).trim();
	}

	private findHeading(fragment: string): string {
		const decoded = safeDecode(fragment.replace(/^#/, ""));
		// Obsidian heading paths ("Parent#Child") target the last heading in the path
		const target = HeadingAnchorResolver.wikilinkDisplayText(decoded);

		const lowerTarget = target.toLowerCase();
		const matchers: ((heading: string) => boolean)[] = [
			heading => heading.trim() === target,
			heading => heading.trim().toLowerCase() === lowerTarget,
			heading => toConfluenceAnchor(heading).toLowerCase() === lowerTarget,
			heading => toGithubSlug(heading) === lowerTarget,
		];
		for (const matches of matchers) {
			const heading = this.headings.find(matches);
			if (heading !== undefined) {
				return heading;
			}
		}

		// Unknown heading (e.g. converting a selection of a note with no matching heading):
		// fall back to treating the fragment itself as the heading text.
		return target;
	}
}
