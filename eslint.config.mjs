import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						"eslint.config.mjs",
						"manifest.json",
					],
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: [".json"],
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		plugins: {
			obsidianmd,
		},
		rules: {
			// sentence-case disabled: false positives on brand names
			// (Confluence, XHTML, Storage Format, Wiki Markup, etc.).
			"obsidianmd/ui/sentence-case": "off",
		},
	},
	globalIgnores([
		"node_modules",
		"dist",
		"main.js",
		"eslint.config.mjs",
		"jest.config.js",
		"tests/**",
		"test-samples/**",
	]),
);
