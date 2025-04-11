# Obsidian Confluence Toolkit

[![GitHub release](https://img.shields.io/github/release/addo/obsidian-confluence-toolkit.svg)](https://github.com/addo/obsidian-confluence-toolkit/releases/latest)
[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22obsidian-confluence-toolkit%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?search=confluence%20toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Obsidian plugin that enables seamless conversion and interaction between Obsidian Markdown and Confluence Wiki Markup.

## Features

- **Markdown to Confluence Conversion**: Transform your Obsidian notes into [Confluence Wiki Markup](https://confluence.atlassian.com/doc/confluence-wiki-markup-251003035.html) with a single command
- **Clipboard Integration**: Automatically copy converted content to clipboard for easy pasting into Confluence
- **Format Preservation**: Maintain heading structures, lists, code blocks, and other formatting elements during conversion
- **Syntax Highlighting**: Support for code blocks with language specification

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

### Basic Conversion

1. Open any note in Obsidian, or select part of the text
2. Use the command palette (Ctrl/Cmd+P) and search for "Convert to Confluence"
3. Run the command
4. The converted content will be automatically copied to your clipboard
5. Go to the Confluence editor and follow:
   - a. Select Insert > Markup
   - b. Select Markdown
   - c. Type or paste your text - the preview will show you how it will appear on your page
   - d. Select Insert.

### Keyboard Shortcut

Configure a custom keyboard shortcut for quick conversion:

1. Go to Settings > Hotkeys
2. Search for "Convert to Confluence"
3. Assign your preferred keyboard combination

## Configuration

Currently, the plugin works out of the box with no required configuration.

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
