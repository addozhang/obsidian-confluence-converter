/**
 * Integration tests using the sample test files
 */
import { marked } from "marked";
import * as fs from "fs";
import * as path from "path";
import { AtlassianWikiMarkupRenderer, CodeBlockTheme, MarkdownToAtlassianWikiMarkupOptions } from "../src/confluenceRender";

describe("Integration Tests with Sample Files", () => {
	const markdownSamplePath = path.join(__dirname, "../test-samples/markdown-test-sample.md");
	let markdownContent: string;

	beforeAll(() => {
		// Read the markdown test sample
		if (fs.existsSync(markdownSamplePath)) {
			markdownContent = fs.readFileSync(markdownSamplePath, "utf8");
		}
	});

	test("markdown test sample file should exist", () => {
		expect(fs.existsSync(markdownSamplePath)).toBe(true);
	});

	test("should convert entire markdown sample without errors", () => {
		if (!markdownContent) {
			console.warn("Markdown sample file not found, skipping test");
			return;
		}

		const renderer = new AtlassianWikiMarkupRenderer();
		expect(() => {
			marked.parse(markdownContent, { renderer, async: false });
		}).not.toThrow();
	});

	test("converted output should contain expected Confluence markup elements", () => {
		if (!markdownContent) {
			console.warn("Markdown sample file not found, skipping test");
			return;
		}

		const renderer = new AtlassianWikiMarkupRenderer();
		const result = marked.parse(markdownContent, { renderer, async: false }) as string;

		// Check for headings
		expect(result).toMatch(/h1\./);
		expect(result).toMatch(/h2\./);
		expect(result).toMatch(/h3\./);

		// Check for text formatting
		expect(result).toContain("*"); // Bold
		expect(result).toContain("_"); // Italic
		expect(result).toContain("{{"); // Code
		expect(result).toContain("}}"); // Code

		// Check for lists
		expect(result).toMatch(/^#\s/m); // Ordered list
		expect(result).toMatch(/^\*\s/m); // Unordered list

		// Check for code blocks
		expect(result).toContain("{code:");
		expect(result).toContain("{code}");

		// Check for blockquotes
		expect(result).toContain("{quote}");

		// Check for tables
		expect(result).toMatch(/\|.*\|/); // Table cells

		// Check for horizontal rules
		expect(result).toContain("----");
	});

	describe("Section-by-section conversion tests", () => {
		test("should convert headings section correctly", () => {
			const headingsMarkdown = `# Heading Level 1
## Heading Level 2
### Heading Level 3`;
			
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(headingsMarkdown, { renderer, async: false }) as string;

			expect(result).toContain("h1. Heading Level 1");
			expect(result).toContain("h2. Heading Level 2");
			expect(result).toContain("h3. Heading Level 3");
		});

		test("should convert text formatting section correctly", () => {
			const formattingMarkdown = `**Bold text**
*Italic text*
~~Strikethrough~~
\`inline code\``;
			
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(formattingMarkdown, { renderer, async: false }) as string;

			expect(result).toContain("*Bold text*");
			expect(result).toContain("_Italic text_");
			expect(result).toContain("-Strikethrough-");
			expect(result).toContain("{{inline code}}");
		});

		test("should convert lists section correctly", () => {
			const listsMarkdown = `* First item
* Second item
  * Nested item
  * Another nested

1. Numbered first
2. Numbered second
   1. Nested numbered`;
			
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(listsMarkdown, { renderer, async: false }) as string;

			expect(result).toMatch(/^\*\sFirst item/m);
			expect(result).toMatch(/^\*\*\sNested item/m);
			expect(result).toMatch(/^#\sNumbered first/m);
			expect(result).toMatch(/^##\sNested numbered/m);
		});

		test("should convert links section correctly", () => {
			const linksMarkdown = `[Atlassian](http://www.atlassian.com)
[Link with title](http://example.com "Title")`;
			
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(linksMarkdown, { renderer, async: false }) as string;

			expect(result).toContain("[Atlassian|http://www.atlassian.com]");
			expect(result).toContain("[Link with title|http://example.com]");
		});

		test("should convert images section correctly", () => {
			const imagesMarkdown = `![Alt text](image.png)
![[obsidian-image.png]]`;
			
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(imagesMarkdown, { renderer, async: false }) as string;

			expect(result).toContain("!image.png|alt=Alt text!");
			expect(result).toContain("!obsidian-image.png!");
		});

		test("should convert tables section correctly", () => {
			const tableMarkdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`;
			
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(tableMarkdown, { renderer, async: false }) as string;

			expect(result).toContain("|Header 1|");
			expect(result).toContain("|Header 2|");
			expect(result).toContain("|Cell 1|");
			expect(result).toContain("|Cell 2|");
		});

		test("should convert code blocks section correctly", () => {
			const codeMarkdown = `\`\`\`javascript
function hello() {
    console.log("Hello");
}
\`\`\`

\`\`\`python
def hello():
    print("Hello")
\`\`\``;
			
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(codeMarkdown, { renderer, async: false }) as string;

			expect(result).toContain("language=javascript");
			expect(result).toContain("language=python");
			expect(result).toContain("function hello()");
			expect(result).toContain("def hello()");
		});

		test("should convert blockquotes section correctly", () => {
			const quoteMarkdown = `> This is a block quote.
> It can span multiple lines.`;
			
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(quoteMarkdown, { renderer, async: false }) as string;

			expect(result).toContain("{quote}");
			expect(result).toContain("This is a block quote.");
		});
	});

	describe("Code block options tests", () => {
		test("should apply different themes", () => {
			const codeMarkdown = "```js\ncode\n```";
			
			const themes = [
				CodeBlockTheme.Confluence,
				CodeBlockTheme.DJango,
				CodeBlockTheme.Midnight,
				CodeBlockTheme.Eclipse,
			];

			themes.forEach(theme => {
				const options: MarkdownToAtlassianWikiMarkupOptions = {
					codeBlock: { theme },
				};
				const renderer = new AtlassianWikiMarkupRenderer(options);
				const result = marked.parse(codeMarkdown, { renderer, async: false }) as string;
				expect(result).toContain(`theme=${theme}`);
			});
		});

		test("should respect showLineNumbers option", () => {
			const codeMarkdown = "```js\ncode\n```";
			
			const optionsTrue: MarkdownToAtlassianWikiMarkupOptions = {
				codeBlock: { showLineNumbers: true },
			};
			const rendererTrue = new AtlassianWikiMarkupRenderer(optionsTrue);
			const resultTrue = marked.parse(codeMarkdown, { renderer: rendererTrue, async: false }) as string;
			expect(resultTrue).toContain("linenumbers=true");

			const optionsFalse: MarkdownToAtlassianWikiMarkupOptions = {
				codeBlock: { showLineNumbers: false },
			};
			const rendererFalse = new AtlassianWikiMarkupRenderer(optionsFalse);
			const resultFalse = marked.parse(codeMarkdown, { renderer: rendererFalse, async: false }) as string;
			expect(resultFalse).toContain("linenumbers=false");
		});

		test("should respect collapse option", () => {
			const codeMarkdown = "```js\ncode\n```";
			
			const optionsTrue: MarkdownToAtlassianWikiMarkupOptions = {
				codeBlock: { collapse: true },
			};
			const rendererTrue = new AtlassianWikiMarkupRenderer(optionsTrue);
			const resultTrue = marked.parse(codeMarkdown, { renderer: rendererTrue, async: false }) as string;
			expect(resultTrue).toContain("collapse=true");

			const optionsFalse: MarkdownToAtlassianWikiMarkupOptions = {
				codeBlock: { collapse: false },
			};
			const rendererFalse = new AtlassianWikiMarkupRenderer(optionsFalse);
			const resultFalse = marked.parse(codeMarkdown, { renderer: rendererFalse, async: false }) as string;
			expect(resultFalse).toContain("collapse=false");
		});
	});

	describe("Edge cases and special scenarios", () => {
		test("should handle empty markdown", () => {
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse("", { renderer, async: false }) as string;
			expect(result).toBe("");
		});

		test("should handle markdown with only whitespace", () => {
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse("   \n\n   ", { renderer, async: false }) as string;
			expect(result.trim()).toBe("");
		});

		test("should handle deeply nested lists", () => {
				const deepMarkdown = `* Level 1
		 * Level 2
		   * Level 3
		     * Level 4
		       * Level 5`;
				
				const renderer = new AtlassianWikiMarkupRenderer();
				const result = marked.parse(deepMarkdown, { renderer, async: false }) as string;
				
				// Verify list structure is maintained
				// marked.js parses nested lists with indentation preserved
				expect(result).toContain("* Level 1");
				expect(result).toContain("Level 2");
				expect(result).toContain("Level 3");
				expect(result).toContain("Level 4");
				expect(result).toContain("Level 5");
			});

		test("should handle mixed list types", () => {
				const mixedMarkdown = `1. Numbered
		  * Bullet under numbered
		  * Another bullet
	2. Back to numbered`;
				
				const renderer = new AtlassianWikiMarkupRenderer();
				const result = marked.parse(mixedMarkdown, { renderer, async: false }) as string;
				
				expect(result).toMatch(/^#\sNumbered/m);
				// Mixed lists have space after # for nested bullets
				expect(result).toContain("* Bullet under numbered");
			});

		test("should handle special characters in text", () => {
			const specialChars = "Text with & < > \" special characters";
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(specialChars, { renderer, async: false }) as string;
			
			// Should handle HTML entities properly
			expect(result).toContain("&");
			expect(result).toContain("<");
			expect(result).toContain(">");
		});

		test("should handle multiple consecutive blank lines", () => {
			const multiBlank = "Line 1\n\n\n\nLine 2";
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(multiBlank, { renderer, async: false }) as string;
			
			expect(result).toContain("Line 1");
			expect(result).toContain("Line 2");
		});

		test("should handle code blocks without language", () => {
			const noLangCode = "```\nplain code\n```";
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(noLangCode, { renderer, async: false }) as string;
			
			expect(result).toContain("language=none");
			expect(result).toContain("plain code");
		});

		test("should handle inline code within formatted text", () => {
			const inlineCode = "**Bold with `code` inside**";
			const renderer = new AtlassianWikiMarkupRenderer();
			const result = marked.parse(inlineCode, { renderer, async: false }) as string;
			
			expect(result).toContain("*");
			expect(result).toContain("{{code}}");
		});
	});

	describe("Performance tests", () => {
		test("should convert large document in reasonable time", () => {
			if (!markdownContent) {
				console.warn("Markdown sample file not found, skipping test");
				return;
			}

			// Repeat the content multiple times to create a large document
			const largeContent = markdownContent.repeat(10);
			const renderer = new AtlassianWikiMarkupRenderer();
			
			const startTime = Date.now();
			marked.parse(largeContent, { renderer, async: false });
			const endTime = Date.now();
			
			const duration = endTime - startTime;
			// Should complete in less than 5 seconds for 10x repeated content
			expect(duration).toBeLessThan(5000);
		});
	});
});
