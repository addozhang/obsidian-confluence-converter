# Obsidian Confluence Toolkit

[![GitHub release](https://img.shields.io/github/release/addo/obsidian-confluence-toolkit.svg)](https://github.com/addo/obsidian-confluence-toolkit/releases/latest)
[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22obsidian-confluence-toolkit%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?search=confluence%20toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Obsidian plugin that enables seamless conversion and interaction between Obsidian Markdown and Confluence Wiki Markup.

## Features

- **Two Output Formats**:
  - **Storage Format (XHTML)** - *Recommended* - Directly paste into Confluence editor without additional conversion
  - **Wiki Markup** - Legacy format for those who prefer traditional Confluence wiki markup
- **Clipboard Integration**: Automatically copy converted content to clipboard for easy pasting into Confluence
- **Format Preservation**: Maintain heading structures, lists, code blocks, tables, and other formatting elements during conversion
- **Syntax Highlighting**: Support for code blocks with language specification
- **Obsidian Compatibility**: Handles Obsidian-specific syntax like `![[image.png]]`
- **Configurable**: Customize code block themes (Wiki Markup), line numbers, and collapse settings

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings > Community plugins
2. Disable Safe mode if enabled
3. Click "Browse" to open the Community Plugins browser
4. Search for "Confluence Toolkit"
5. Click "Install"
6. Once installed, enable the plugin by toggling the switch

### Manual Installation

1. Download the latest release from the [GitHub releases page](https://github.com/addo/obsidian-confluence-toolkit/releases)
2. Extract the files to your Obsidian plugins folder: `{your-vault}/.obsidian/plugins/obsidian-confluence-toolkit/`
3. Restart Obsidian
4. Enable the plugin in Obsidian settings under "Community plugins"

## Usage

### Basic Conversion (Recommended - Storage Format)

1. Open any note in Obsidian, or select part of the text
2. Use the command palette (Ctrl/Cmd+P) and search for "Convert to Confluence"
3. Run the command
4. The converted content will be automatically copied to your clipboard in **Storage Format**
5. Go to Confluence and simply **paste (Ctrl/Cmd+V)** directly into the editor
6. Your content will appear with perfect formatting - no additional steps needed!

### Alternative - Wiki Markup Format

If you prefer the traditional Wiki Markup format:

1. Go to Settings > Confluence Converter
2. Change "Output format" to "Wiki Markup - Legacy format"
3. Follow the conversion steps above
4. In Confluence editor, use Insert > Markup, select your text format, and paste

### Keyboard Shortcut

Configure a custom keyboard shortcut for quick conversion:

1. Go to Settings > Hotkeys
2. Search for "Convert to Confluence"
3. Assign your preferred keyboard combination

## Configuration

Access plugin settings via Settings > Confluence Converter:

### Output Format
- **Storage Format (XHTML)** *(Recommended)* - Generates Confluence Storage Format that can be directly pasted into the Confluence editor. No additional conversion needed!
- **Wiki Markup** *(Legacy)* - Traditional Confluence Wiki Markup format. Requires using the Markup tool in Confluence for final insertion.

### Image Settings
- **Default Image Width** - Set default width for all images in pixels (0 = original size)
  - Recommended values: 400-800 pixels for optimal display
  - Applies to both Storage Format and Wiki Markup
  - Example: Setting to 600 will resize all images to 600px width while maintaining aspect ratio

### Code Block Settings
- **Theme** *(Wiki Markup only)* - Choose from DJango, Emacs, FadeToGrey, Midnight, RDark, Eclipse, or Confluence themes
- **Show Line Numbers** - Display line numbers in code blocks
- **Collapse Code Block** - Automatically collapse code blocks in Confluence

## Testing

The plugin includes a comprehensive test suite using Jest and TypeScript.

### Run Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- **Wiki Markup Tests** ([`tests/confluenceRender.test.ts`](tests/confluenceRender.test.ts)): Test Wiki Markup conversion functions
- **Storage Format Tests** ([`tests/confluenceStorageRender.test.ts`](tests/confluenceStorageRender.test.ts)): Test XHTML/Storage Format conversion
- **Integration Tests** ([`tests/integration.test.ts`](tests/integration.test.ts)): Test full document conversion using sample files
- **Sample Files** ([`test-samples/`](test-samples/)): Comprehensive Markdown and Confluence markup examples

See [`tests/README.md`](tests/README.md) for detailed testing documentation.

## Development

Contributions to this plugin are welcome. To contribute:

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/obsidian-confluence-toolkit.git`
3. Install dependencies: `npm install`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Acknowledgements

This plugin includes code adapted from [markdown-to-confluence-vscode](https://github.com/transnano/markdown-to-confluence-vscode) and updated to be compatible with [marked](https://github.com/markedjs/marked) version 15.0.4.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
