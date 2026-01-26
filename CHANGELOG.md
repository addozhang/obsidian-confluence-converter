# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.4] - 2026-01-26

### Fixed
- **Settings auto-save** - Critical fix for settings not being saved immediately
  - All settings now save instantly when changed (Output Format, Image Width, Code Block options)
  - Users no longer need to close settings panel for changes to take effect
  - **Fixes reported issue where image width setting wasn't applied**
  - Improved user experience with immediate feedback

### Technical Details
- Added `await this.plugin.saveData(this.plugin.settings)` to all onChange handlers in `converterSettingTab.ts`
- Ensures settings persistence before command execution
- Applies to: Output Format, Default Image Width, Code Block Theme, Show Line Numbers, Collapse Code Block

## [0.5.3] - 2026-01-26

### Fixed
- **Curly braces in inline code** - Fixed issue where `{...}` in inline code could conflict with Confluence macro syntax
  - Curly braces in inline code now properly escaped in Wiki Markup format (e.g., `{{/api/users/\{user-id\}/name}}`)
  - Storage Format handles curly braces correctly within `<code>` tags (no escaping needed)
  - Added 9 new test cases for curly braces handling in both formats
  - All 126 tests passing

### Technical Details
- Enhanced `codespan()` method in `AtlassianWikiMarkupRenderer` to escape `{` and `}` characters
- Prevents conflicts with Confluence macro syntax like `{macro:param=value}`
- Storage Format renderer already handles this correctly via HTML escaping

## [0.5.2] - 2026-01-26

### Added
- **Image size control** - New setting to specify default width for images
  - Configurable default image width in pixels (0 = original size)
  - Applies to both Storage Format and Wiki Markup output
  - Recommended values: 400-800 pixels
  - Automatic aspect ratio preservation

### Fixed
- **Multi-level nested lists bug in Wiki Markup format** - Fixed the issue where 3+ level nested lists were not correctly converted
  - Added detection for markdown list markers in text content
  - Implemented indentation-based nesting level calculation (2 spaces per level)
  - Added comprehensive test cases for multi-level nested lists (both ordered and unordered)
  - All 117 tests passing

### Technical Details
- Added `image.defaultWidth` option to both renderer types (`MarkdownToAtlassianWikiMarkupOptions` and `MarkdownToStorageFormatOptions`)
- Enhanced `list()` method in `AtlassianWikiMarkupRenderer` to handle markdown-formatted list items that Marked parser treats as plain text
- Added `markdownListRegExp` to detect markdown list markers (`*`, `-`, `+`, `1.`, etc.)
- Fixed test markdown strings to use `Array.join()` instead of template strings to avoid tab contamination
- New test cases for image width functionality (4 new tests)

## [0.5.0] - 2026-01-26

### Added
- **Confluence Storage Format (XHTML) support** - New recommended output format that can be directly pasted into Confluence editor
- Format selection in settings - Users can now choose between Storage Format (XHTML) and Wiki Markup
- Comprehensive test suite for Storage Format renderer (43 new tests)
- Format comparison documentation (`docs/FORMAT_COMPARISON.md`)
- Better user feedback - Conversion notice now shows which format was used

### Changed
- **Default output format changed to Storage Format** for better user experience
- Settings UI now conditionally shows theme option only for Wiki Markup mode
- Updated README with detailed format comparison and usage instructions
- Improved code block settings to work with both formats

### Fixed
- Removed unused imports in `confluenceRender.ts` (node:stream/consumers and node:os)

### Technical Details
- Added `ConfluenceStorageRenderer` class for XHTML generation
- Updated `ConverterSettings` interface to include `outputFormat` option
- Enhanced settings tab with format selection dropdown
- All 111 tests passing (68 original + 43 new)

## [0.4.0] - Previous Release

### Features
- Markdown to Confluence Wiki Markup conversion
- Clipboard integration
- Code block customization
- Support for various markdown elements

## Migration Guide

If you're upgrading from v0.4.0:
- The plugin will automatically use Storage Format by default
- Your existing Wiki Markup settings are preserved
- To continue using Wiki Markup, go to Settings > Confluence Converter > Output format > Select "Wiki Markup"
- No other configuration changes needed
