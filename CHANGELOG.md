# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
