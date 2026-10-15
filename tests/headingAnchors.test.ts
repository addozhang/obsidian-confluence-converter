/**
 * Unit tests for links to headings within the same note
 */
import { marked } from "marked";
import { HeadingAnchorResolver, stripFrontmatter, toConfluenceAnchor } from "../src/headingAnchors";
import { ConfluenceStorageRenderer } from "../src/confluenceStorageRender";
import { AtlassianWikiMarkupRenderer } from "../src/confluenceRender";

const PAGE_URL = "https://example.atlassian.net/wiki/spaces/DOC/pages/123/My+Page";

const NOTE = `# Scenarios

## Bootstrapping (cold start)

Some text.

## **Bold** \`code\` heading
`;

describe("HeadingAnchorResolver", () => {
	test("should build Confluence anchors from heading text", () => {
		expect(toConfluenceAnchor("Bootstrapping (cold start)")).toBe("Bootstrapping-(cold-start)");
		expect(toConfluenceAnchor("  Spaced   out  ")).toBe("Spaced-out");
	});

	test.each([
		["URL-encoded heading text", "#Bootstrapping%20(cold%20start)"],
		["GitHub-style slug", "#bootstrapping-cold-start"],
		["Confluence-style anchor", "#Bootstrapping-(cold-start)"],
		["Obsidian heading path", "Scenarios#Bootstrapping (cold start)"],
		["heading text with different case", "#bootstrapping (COLD start)"],
	])("should resolve %s to the heading", (_, fragment) => {
		const resolver = new HeadingAnchorResolver(NOTE);
		expect(resolver.resolve(fragment)).toBe("#Bootstrapping-(cold-start)");
	});

	test("should use the plain text of formatted headings", () => {
		const resolver = new HeadingAnchorResolver(NOTE);
		expect(resolver.resolve("#bold-code-heading")).toBe("#Bold-code-heading");
	});

	test("should fall back to the fragment when no heading matches", () => {
		const resolver = new HeadingAnchorResolver(NOTE);
		expect(resolver.resolve("#Missing%20Heading")).toBe("#Missing-Heading");
	});

	test("should prefix the Confluence page URL when known", () => {
		const resolver = new HeadingAnchorResolver(NOTE, `${PAGE_URL}#old-anchor`);
		expect(resolver.hasPageUrl).toBe(true);
		expect(resolver.resolve("#bootstrapping-cold-start")).toBe(`${PAGE_URL}#Bootstrapping-(cold-start)`);
	});

	test("should count resolved links", () => {
		const resolver = new HeadingAnchorResolver(NOTE);
		expect(resolver.resolvedCount).toBe(0);
		resolver.resolve("#Scenarios");
		expect(resolver.resolvedCount).toBe(1);
	});

	test("should ignore headings in frontmatter", () => {
		expect(stripFrontmatter("---\nconfluence-page-url: x\n---\n# Title\n")).toBe("# Title\n");
		expect(stripFrontmatter("# Title\n---\nnot: frontmatter\n---\n")).toBe("# Title\n---\nnot: frontmatter\n---\n");
	});
});

describe("Heading links in Storage Format", () => {
	const render = (markdown: string, pageUrl?: string) => marked.parse(markdown, {
		renderer: new ConfluenceStorageRenderer({ headingAnchors: new HeadingAnchorResolver(NOTE, pageUrl) }),
		async: false,
	}) as string;

	test.each([
		"[Bootstrapping (cold start)](#Bootstrapping%20(cold%20start))",
		"[Bootstrapping (cold start)](#bootstrapping-cold-start)",
		"[Bootstrapping (cold start)](#Bootstrapping-(cold-start))",
		"[[#Scenarios#Bootstrapping (cold start)|Bootstrapping (cold start)]]",
		"[[#Bootstrapping (cold start)]]",
	])("should convert %s to an anchor link", (markdown) => {
		expect(render(markdown)).toBe('<p><a href="#Bootstrapping-(cold-start)">Bootstrapping (cold start)</a></p>');
	});

	test("should link to the Confluence page when its URL is known", () => {
		expect(render("[[#Bootstrapping (cold start)|cold start]]", PAGE_URL))
			.toBe(`<p><a href="${PAGE_URL}#Bootstrapping-(cold-start)">cold start</a></p>`);
	});

	test("should escape text around wikilinks", () => {
		expect(render("A & [[#Scenarios]] < B"))
			.toBe('<p>A &amp; <a href="#Scenarios">Scenarios</a> &lt; B</p>');
	});

	test("should convert wikilinks in list items", () => {
		expect(render("- [[#Scenarios|Go]]")).toBe('<ul><li><a href="#Scenarios">Go</a></li></ul>');
	});

	test("should handle images and heading links in the same text", () => {
		expect(render("![[diagram.png]] see [[#Scenarios]]"))
			.toBe('<p><ac:image><ri:attachment ri:filename="diagram.png" /></ac:image> see <a href="#Scenarios">Scenarios</a></p>');
	});

	test("should leave links to other notes and block references unchanged", () => {
		expect(render("[[Other note#Heading]] [[#^block-id]]")).toBe("<p>[[Other note#Heading]] [[#^block-id]]</p>");
	});

	test("should not change external links", () => {
		expect(render("[Site](https://example.com/page#section)"))
			.toBe('<p><a href="https://example.com/page#section">Site</a></p>');
	});
});

describe("Heading links in Wiki Markup", () => {
	const render = (markdown: string, pageUrl?: string) => marked.parse(markdown, {
		renderer: new AtlassianWikiMarkupRenderer({ headingAnchors: new HeadingAnchorResolver(NOTE, pageUrl) }),
		async: false,
	}) as string;

	test("should convert markdown heading links", () => {
		expect(render("[cold start](#bootstrapping-cold-start)").trim()).toBe("[cold start|#Bootstrapping-(cold-start)]");
	});

	test("should convert heading wikilinks", () => {
		expect(render("[[#Scenarios#Bootstrapping (cold start)]]", PAGE_URL).trim())
			.toBe(`[Bootstrapping (cold start)|${PAGE_URL}#Bootstrapping-(cold-start)]`);
	});
});
