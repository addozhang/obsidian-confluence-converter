/**
 * Unit tests for Confluence Storage Format Renderer
 */
import { marked } from "marked";
import { ConfluenceStorageRenderer, MarkdownToStorageFormatOptions } from "../src/confluenceStorageRender";

describe("ConfluenceStorageRenderer", () => {
	let renderer: ConfluenceStorageRenderer;

	beforeEach(() => {
		renderer = new ConfluenceStorageRenderer();
	});

	describe("Text Formatting", () => {
		test("should convert bold text", () => {
			const markdown = "**bold text**";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("<strong>bold text</strong>");
		});

		test("should convert italic text", () => {
			const markdown = "*italic text*";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("<em>italic text</em>");
		});

		test("should convert strikethrough text", () => {
			const markdown = "~~strikethrough~~";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("<s>strikethrough</s>");
		});

		test("should convert inline code", () => {
			const markdown = "`inline code`";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("<code>inline code</code>");
		});

		test("should handle special characters in text", () => {
			const markdown = "Text with & \"quotes\"";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("&amp;");
			expect(result).toContain("&quot;quotes&quot;");
		});
	});

	describe("Headings", () => {
		test.each([
			["# Heading 1", "<h1>Heading 1</h1>"],
			["## Heading 2", "<h2>Heading 2</h2>"],
			["### Heading 3", "<h3>Heading 3</h3>"],
			["#### Heading 4", "<h4>Heading 4</h4>"],
			["##### Heading 5", "<h5>Heading 5</h5>"],
			["###### Heading 6", "<h6>Heading 6</h6>"],
		])("should convert %s to %s", (markdown, expected) => {
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain(expected);
		});
	});

	describe("Paragraphs", () => {
		test("should convert paragraph", () => {
			const markdown = "This is a paragraph.";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("<p>This is a paragraph.</p>");
		});
	});

	describe("Lists", () => {
		test("should convert unordered list", () => {
			const markdown = `* Item 1
* Item 2
* Item 3`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<ul>");
			expect(result).toContain("<li>Item 1</li>");
			expect(result).toContain("<li>Item 2</li>");
			expect(result).toContain("<li>Item 3</li>");
			expect(result).toContain("</ul>");
		});

		test("should convert ordered list", () => {
			const markdown = `1. First
2. Second
3. Third`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<ol>");
			expect(result).toContain("<li>First</li>");
			expect(result).toContain("<li>Second</li>");
			expect(result).toContain("<li>Third</li>");
			expect(result).toContain("</ol>");
		});

		test("should convert nested unordered list", () => {
			const markdown = `* Item 1
  * Nested 1
  * Nested 2
* Item 2`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<ul>");
			expect(result).toContain("<li>Nested 1</li>");
			expect(result).toContain("<li>Nested 2</li>");
		});
	});

	describe("Links", () => {
		test("should convert simple link", () => {
			const markdown = "[Link text](https://example.com)";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain('<a href="https://example.com">Link text</a>');
		});

		test("should convert link with title", () => {
			const markdown = '[Link](https://example.com "Title")';
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain('title="Title"');
		});

		test("should escape special characters in URLs", () => {
			const markdown = '[Link](https://example.com?a=1&b=2)';
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("&amp;");
		});
	});

	describe("Images", () => {
		test("should convert external image", () => {
			const markdown = "![Alt text](https://example.com/image.png)";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<ac:image");
			expect(result).toContain('<ri:url ri:value="https://example.com/image.png"');
			expect(result).toContain('alt="Alt text"');
		});

		test("should convert local image as attachment", () => {
			const markdown = "![Alt text](image.png)";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<ac:image");
			expect(result).toContain('<ri:attachment ri:filename="image.png"');
		});

		test("should convert Obsidian-style image", () => {
			const markdown = "![[screenshot.png]]";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain('<ri:attachment ri:filename="screenshot.png"');
		});
	
		test("should apply default width to external image", () => {
			const options: MarkdownToStorageFormatOptions = {
				image: {
					defaultWidth: 500
				}
			};
			const customRenderer = new ConfluenceStorageRenderer(options);
			const markdown = "![Alt text](https://example.com/image.png)";
			const result = marked.parse(markdown, { renderer: customRenderer, async: false }) as string;
			expect(result).toContain('<ac:image alt="Alt text" ac:width="500">');
			expect(result).toContain('<ri:url ri:value="https://example.com/image.png"');
		});
	
		test("should apply default width to local image", () => {
			const options: MarkdownToStorageFormatOptions = {
				image: {
					defaultWidth: 600
				}
			};
			const customRenderer = new ConfluenceStorageRenderer(options);
			const markdown = "![Alt](image.png)";
			const result = marked.parse(markdown, { renderer: customRenderer, async: false }) as string;
			expect(result).toContain('ac:width="600"');
			expect(result).toContain('<ri:attachment ri:filename="image.png"');
		});
	});

	describe("Code Blocks", () => {
		test("should convert code block with language", () => {
			const markdown = "```javascript\nconst x = 5;\n```";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain('<ac:structured-macro ac:name="code">');
			expect(result).toContain('<ac:parameter ac:name="language">javascript</ac:parameter>');
			expect(result).toContain("<![CDATA[const x = 5;");
			expect(result).toContain("</ac:structured-macro>");
		});

		test("should convert code block without language", () => {
			const markdown = "```\nplain text\n```";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain('<ac:structured-macro ac:name="code">');
			expect(result).toContain("<![CDATA[plain text");
		});

		test("should apply line numbers setting", () => {
			const options: MarkdownToStorageFormatOptions = {
				codeBlock: {
					showLineNumbers: true,
				},
			};
			const customRenderer = new ConfluenceStorageRenderer(options);
			const markdown = "```js\ncode\n```";
			const result = marked.parse(markdown, { renderer: customRenderer, async: false }) as string;
			expect(result).toContain('<ac:parameter ac:name="linenumbers">true</ac:parameter>');
		});

		test("should apply collapse setting", () => {
			const options: MarkdownToStorageFormatOptions = {
				codeBlock: {
					collapse: true,
				},
			};
			const customRenderer = new ConfluenceStorageRenderer(options);
			const markdown = "```js\ncode\n```";
			const result = marked.parse(markdown, { renderer: customRenderer, async: false }) as string;
			expect(result).toContain('<ac:parameter ac:name="collapse">true</ac:parameter>');
		});

		test("should escape HTML in code blocks", () => {
			const markdown = "```\n<script>alert('xss')</script>\n```";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("&lt;script&gt;");
			expect(result).toContain("&lt;/script&gt;");
		});
	});

	describe("Tables", () => {
		test("should convert simple table", () => {
			const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<table>");
			expect(result).toContain("<th>Header 1</th>");
			expect(result).toContain("<th>Header 2</th>");
			expect(result).toContain("<td>Cell 1</td>");
			expect(result).toContain("<td>Cell 2</td>");
			expect(result).toContain("</table>");
		});

		test("should handle empty table cells", () => {
			const markdown = `| A | B |
|---|---|
|   | X |`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toMatch(/<td>&nbsp;<\/td>/);
		});

		test("should handle table with formatting", () => {
			const markdown = `| Header |
|--------|
| **bold** |`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<strong>bold</strong>");
		});
	});

	describe("Blockquotes", () => {
		test("should convert blockquote", () => {
			const markdown = "> This is a quote";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<blockquote>");
			expect(result).toContain("This is a quote");
			expect(result).toContain("</blockquote>");
		});

		test("should convert multiline blockquote", () => {
			const markdown = `> Line 1
> Line 2`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<blockquote>");
			expect(result).toContain("Line 1");
			expect(result).toContain("Line 2");
		});
	});

	describe("Special Elements", () => {
		test("should convert horizontal rule", () => {
			const markdown = "---";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("<hr />");
		});

		test("should convert line break", () => {
			const markdown = "Line 1  \nLine 2";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<br />");
		});
	});

	describe("Complex Scenarios", () => {
		test("should handle nested formatting", () => {
			const markdown = "**bold with *italic* inside**";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<strong>bold with <em>italic</em> inside</strong>");
		});

		test("should handle code in list", () => {
			const markdown = "* Item with `code`";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<li>Item with <code>code</code></li>");
		});

		test("should handle link in bold", () => {
			const markdown = "**[Link](https://example.com)**";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<strong><a href");
		});
	});

	describe("Language Mapping", () => {
		test.each([
			["javascript", "javascript"],
			["js", "javascript"],
			["python", "python"],
			["java", "java"],
			["bash", "bash"],
			["sh", "bash"],
		])("should map %s to %s", (inputLang, expectedLang) => {
			const markdown = `\`\`\`${inputLang}\ncode\n\`\`\``;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain(`<ac:parameter ac:name="language">${expectedLang}</ac:parameter>`);
		});

		test("should handle unsupported languages gracefully", () => {
			const markdown = "```unknownlang\ncode\n```";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("<ac:structured-macro");
			expect(result).toContain("code");
		});
	});
});
