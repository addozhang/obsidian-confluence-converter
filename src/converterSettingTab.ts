import {App, PluginSettingTab, Setting} from "obsidian";
import ConfluenceConverter, {OutputFormat} from "./main";
import {CodeBlockTheme} from "./confluenceRender";

export default class ConverterSettingTab extends PluginSettingTab {
	private plugin: ConfluenceConverter;

	constructor(app: App, plugin: ConfluenceConverter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		// Output Format Setting
		new Setting(containerEl)
			.setName("Output format")
			.setDesc("Choose the output format for conversion. Storage Format (recommended) can be directly pasted into Confluence editor. Wiki Markup requires using the Markup tool in Confluence.")
			.addDropdown(dd => {
				dd.addOption("storage", "Storage Format (XHTML) - Direct paste");
				dd.addOption("wikimarkup", "Wiki Markup - Legacy format");
				dd.setValue(this.plugin.settings.outputFormat);
				dd.onChange(async (value) => {
					this.plugin.settings.outputFormat = value as OutputFormat;
					this.display(); // Refresh to show/hide theme option
				});
			});

		// Image Settings
		new Setting(containerEl)
			.setName("Default image width")
			.setDesc("Set default width for images in pixels (0 = original size, recommended: 400-800)")
			.addText(text => {
				text.setPlaceholder("0");
				text.setValue(String(this.plugin.settings.defaultImageWidth));
				text.onChange(async (value) => {
					const width = parseInt(value);
					if (!isNaN(width) && width >= 0) {
						this.plugin.settings.defaultImageWidth = width;
					}
				});
			});

		const codeBlock = containerEl.createDiv();

		// Code block theme - only for Wiki Markup format
		if (this.plugin.settings.outputFormat === "wikimarkup") {
			new Setting(codeBlock)
				.setName("Code block theme")
				.setDesc("Select the code block theme (Wiki Markup only).")
				.addDropdown(dd => {
					Object.entries(CodeBlockTheme).forEach(([key, value]) => {
						dd.addOption(key, value);
					});
					dd.setValue(this.plugin.settings.codeBlockTheme);
					dd.onChange(async (value) => {
						this.plugin.settings.codeBlockTheme = value;
					});
				});
		}

		new Setting(codeBlock)
			.setName("Show line numbers")
			.setDesc("Show line numbers in code block.")
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.codeBlockShowLineNumbers);
				toggle.onChange(async (value) => {
					this.plugin.settings.codeBlockShowLineNumbers = value;
				});
			});

		new Setting(codeBlock)
			.setName("Collapse code block")
			.setDesc("Collapse code block.")
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.codeBlockCollapse);
				toggle.onChange(async (value) => {
					this.plugin.settings.codeBlockCollapse = value;
				});
			});
	}


	async hide() {
		await this.plugin.saveData(this.plugin.settings);
	}
}

