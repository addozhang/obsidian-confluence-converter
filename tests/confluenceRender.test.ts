/**
 * Unit tests for Confluence Renderer
 */
import { marked } from "marked";
import { AtlassianWikiMarkupRenderer, CodeBlockTheme, MarkdownToAtlassianWikiMarkupOptions } from "../src/confluenceRender";

describe("AtlassianWikiMarkupRenderer", () => {
	let renderer: AtlassianWikiMarkupRenderer;

	beforeEach(() => {
		renderer = new AtlassianWikiMarkupRenderer();
	});

	describe("Text Formatting", () => {
		test("should convert bold text", () => {
			const markdown = "**bold text**";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("*bold text*");
		});

		test("should convert italic text", () => {
			const markdown = "*italic text*";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("_italic text_");
		});

		test("should convert strikethrough text", () => {
			const markdown = "~~strikethrough~~";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("-strikethrough-");
		});

		test("should convert inline code", () => {
			const markdown = "`inline code`";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("{{inline code}}");
		});
	});

	describe("Headings", () => {
		test.each([
			["# Heading 1", "h1. Heading 1"],
			["## Heading 2", "h2. Heading 2"],
			["### Heading 3", "h3. Heading 3"],
			["#### Heading 4", "h4. Heading 4"],
			["##### Heading 5", "h5. Heading 5"],
			["###### Heading 6", "h6. Heading 6"],
		])("should convert %s to %s", (markdown, expected) => {
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain(expected);
		});
	});

	describe("Lists", () => {
		test("should convert unordered list", () => {
			const markdown = `* Item 1
* Item 2
* Item 3`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("* Item 1");
			expect(result).toContain("* Item 2");
			expect(result).toContain("* Item 3");
		});

		test("should convert ordered list", () => {
			const markdown = `1. First
2. Second
3. Third`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("# First");
			expect(result).toContain("# Second");
			expect(result).toContain("# Third");
		});

		test("should convert nested unordered list", () => {
			const markdown = `* Item 1
  * Nested 1
  * Nested 2
* Item 2`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("** Nested 1");
			expect(result).toContain("** Nested 2");
		});

		test("should convert nested ordered list", () => {
			const markdown = `1. First
   1. Nested first
   2. Nested second
2. Second`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("## Nested first");
			expect(result).toContain("## Nested second");
		});
	
		describe("Multi-level nested lists", () => {
			test("should handle properly indented nested unordered list", () => {
				// Using 2-space indentation (each nested level adds 2 spaces)
				const markdown = [
					'* Level 1 item 1',
					'  * Level 2 item 1',
					'    * Level 3 item 1',
					'    * Level 3 item 2',
					'  * Level 2 item 2',
					'* Level 1 item 2'
				].join('\n');
				
				const result = marked.parse(markdown, { renderer, async: false }) as string;
				
				// Level 1 should have one *
				expect(result).toContain("* Level 1 item 1");
				expect(result).toContain("* Level 1 item 2");
				
				// Level 2 should have two **
				expect(result).toContain("** Level 2 item 1");
				expect(result).toContain("** Level 2 item 2");
				
				// Level 3 should have three ***
				expect(result).toContain("*** Level 3 item 1");
				expect(result).toContain("*** Level 3 item 2");
			});
	
			test("should handle properly indented nested ordered list", () => {
				// Using 3-space indentation for ordered lists (account for "1. " = 3 chars)
				const markdown = [
					'1. Level 1 item 1',
					'   1. Level 2 item 1',
					'      1. Level 3 item 1',
					'      2. Level 3 item 2',
					'   2. Level 2 item 2',
					'2. Level 1 item 2'
				].join('\n');
				
				const result = marked.parse(markdown, { renderer, async: false }) as string;
				
				// Level 1 should have one #
				expect(result).toContain("# Level 1 item 1");
				expect(result).toContain("# Level 1 item 2");
				
				// Level 2 should have two ##
				expect(result).toContain("## Level 2 item 1");
				expect(result).toContain("## Level 2 item 2");
				
				// Level 3 should have three ###
				expect(result).toContain("### Level 3 item 1");
				expect(result).toContain("### Level 3 item 2");
			});
		});
	});

	describe("Links", () => {
		test("should convert simple link", () => {
			const markdown = "[Link text](https://example.com)";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("[Link text|https://example.com]");
		});

		test("should convert link with title", () => {
			const markdown = '[Link](https://example.com "Title")';
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("[Link|https://example.com]");
		});

		test("should convert link without text", () => {
			const markdown = "[](https://example.com)";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("[https://example.com]");
		});
	});

	describe("Images", () => {
		test("should convert simple image", () => {
			const markdown = "![Alt text](image.png)";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("!image.png|alt=Alt text!");
		});

		test("should convert image with title", () => {
			const markdown = '![Alt](image.png "Title")';
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("!image.png|alt=Alt,title=Title!");
		});

		test("should convert Obsidian-style image", () => {
			const markdown = "![[screenshot.png]]";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("!screenshot.png!");
		});
	
		test("should apply default width to image", () => {
			const options: MarkdownToAtlassianWikiMarkupOptions = {
				image: {
					defaultWidth: 500
				}
			};
			const customRenderer = new AtlassianWikiMarkupRenderer(options);
			const markdown = "![Alt text](image.png)";
			const result = marked.parse(markdown, { renderer: customRenderer, async: false }) as string;
			expect(result.trim()).toContain("!image.png|alt=Alt text,width=500!");
		});
	
		test("should include width with other image params", () => {
			const options: MarkdownToAtlassianWikiMarkupOptions = {
				image: {
					defaultWidth: 600
				}
			};
			const customRenderer = new AtlassianWikiMarkupRenderer(options);
			const markdown = '![Alt](image.png "Title")';
			const result = marked.parse(markdown, { renderer: customRenderer, async: false }) as string;
			expect(result.trim()).toContain("!image.png|alt=Alt,title=Title,width=600!");
		});
	});

	describe("Code Blocks", () => {
		test("should convert code block with language", () => {
			const markdown = "```javascript\nconst x = 5;\n```";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("{code:collapse=false|language=javascript|linenumbers=false|theme=Confluence}");
			expect(result).toContain("const x = 5;");
			expect(result).toContain("{code}");
		});

		test("should convert code block without language", () => {
			const markdown = "```\nplain text\n```";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("{code:collapse=false|language=none|linenumbers=false|theme=Confluence}");
			expect(result).toContain("plain text");
		});

		test("should apply custom code block theme", () => {
			const options: MarkdownToAtlassianWikiMarkupOptions = {
				codeBlock: {
					theme: CodeBlockTheme.Midnight,
				},
			};
			const customRenderer = new AtlassianWikiMarkupRenderer(options);
			const markdown = "```js\ncode\n```";
			const result = marked.parse(markdown, { renderer: customRenderer, async: false }) as string;
			expect(result).toContain("theme=Midnight");
		});

		test("should apply line numbers setting", () => {
			const options: MarkdownToAtlassianWikiMarkupOptions = {
				codeBlock: {
					showLineNumbers: true,
				},
			};
			const customRenderer = new AtlassianWikiMarkupRenderer(options);
			const markdown = "```js\ncode\n```";
			const result = marked.parse(markdown, { renderer: customRenderer, async: false }) as string;
			expect(result).toContain("linenumbers=true");
		});

		test("should apply collapse setting", () => {
			const options: MarkdownToAtlassianWikiMarkupOptions = {
				codeBlock: {
					collapse: true,
				},
			};
			const customRenderer = new AtlassianWikiMarkupRenderer(options);
			const markdown = "```js\ncode\n```";
			const result = marked.parse(markdown, { renderer: customRenderer, async: false }) as string;
			expect(result).toContain("collapse=true");
		});
	});

	describe("Tables", () => {
		test("should convert simple table", () => {
			const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("|Header 1|");
			expect(result).toContain("|Header 2|");
			expect(result).toContain("|Cell 1|");
			expect(result).toContain("|Cell 2|");
		});

		test("should handle empty table cells", () => {
			const markdown = `| A | B |
|---|---|
|   | X |`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			// Empty cells should be complemented with space
			expect(result).toMatch(/\|\s+\|/);
		});
	});

	describe("Blockquotes", () => {
		test("should convert blockquote", () => {
			const markdown = "> This is a quote";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("{quote}");
			expect(result).toContain("This is a quote");
			expect(result).toContain("{quote}");
		});

		test("should convert multiline blockquote", () => {
			const markdown = `> Line 1
> Line 2`;
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("{quote}");
			expect(result).toContain("Line 1");
			expect(result).toContain("Line 2");
		});
	});

	describe("Special Elements", () => {
		test("should convert horizontal rule", () => {
			const markdown = "---";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toContain("----");
		});

		test("should convert line break", () => {
			const markdown = "Line 1  \nLine 2";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("\n");
		});

		test("should handle HTML br tags", () => {
			const markdown = "Text<br>Text";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("\n");
		});
	});

	describe("Complex Scenarios", () => {
		test("should handle nested formatting", () => {
			const markdown = "**bold with *italic* inside**";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("*bold with _italic_ inside*");
		});

		test("should handle code in list", () => {
			const markdown = "* Item with `code`";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("* Item with {{code}}");
		});

		test("should handle link in bold", () => {
			const markdown = "**[Link](https://example.com)**";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("*[Link|https://example.com]*");
		});
	});

	describe("Language Mapping", () => {
		test.each([
				["javascript", "javascript"],
				["js", "javascript"],
				["tsx", "javascript"],
				["python", "python"],
				["java", "java"],
				["bash", "bash"],
				["sh", "bash"],
				["shell", "bash"],
			])("should map %s to %s", (inputLang, expectedLang) => {
				const markdown = `\`\`\`${inputLang}\ncode\n\`\`\``;
				const result = marked.parse(markdown, { renderer, async: false }) as string;
				expect(result).toContain(`language=${expectedLang}`);
			});
		
		test("should use 'none' for unsupported typescript language", () => {
				// TypeScript is not in the language mapping, should default to none
				const markdown = "```typescript\ncode\n```";
				const result = marked.parse(markdown, { renderer, async: false }) as string;
				expect(result).toContain("language=none");
			});

		test("should use 'none' for unsupported languages", () => {
			const markdown = "```unknownlang\ncode\n```";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result).toContain("language=none");
		});
	});

	describe("Curly Braces Handling", () => {
		test("should escape curly braces in inline code", () => {
			const markdown = "`/api/users/{user-id}/name`";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			// Curly braces should be escaped to avoid conflicts with Confluence macros
			expect(result.trim()).toBe("{{/api/users/\\{user-id\\}/name}}");
		});

		test("should handle plain text with curly braces (NOT in code)", () => {
			const markdown = "/api/users/{user-id}/name";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			// Plain text should NOT have curly braces escaped
			expect(result.trim()).toBe("/api/users/{user-id}/name");
		});

		test("should NOT escape curly braces in code blocks", () => {
			const markdown = "```\n/api/users/{user-id}/name\n```";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			// Code blocks use {code:} macro, which handles curly braces differently
			expect(result).toContain("/api/users/{user-id}/name");
			expect(result).toContain("{code:");
			// Should NOT contain escaped braces
			expect(result).not.toContain("\\{");
		});

		test("should escape multiple curly braces in inline code", () => {
			const markdown = "`{a: {b: {c}}}`";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toBe("{{\\{a: \\{b: \\{c\\}\\}\\}}}");
		});

		test("should handle inline code with other special characters and curly braces", () => {
			const markdown = "`GET /api/{id}?param=value`";
			const result = marked.parse(markdown, { renderer, async: false }) as string;
			expect(result.trim()).toBe("{{GET /api/\\{id\\}?param=value}}");
		});
	});
});
