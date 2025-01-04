import {App, PluginSettingTab, Setting} from "obsidian";
import ConfluenceConverter from "./main";
import {CodeBlockTheme} from "./confluenceRender";

export default class ConverterSettingTab extends PluginSettingTab {
	private plugin: ConfluenceConverter;

	constructor(app: App, plugin: ConfluenceConverter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty()
		containerEl.createEl("h1", {text: "Confluence Converter Settings"});

		const codeBlock = containerEl.createDiv();

		new Setting(codeBlock)
			.setName("CodeBlock Theme")
			.setDesc("Select the code block theme.")
			.addDropdown(dd => {
				Object.entries(CodeBlockTheme).forEach(([key, value]) => {
					dd.addOption(key, value);
				});
				dd.setValue(this.plugin.settings.codeBlockTheme);
				dd.onChange(async (value) => {
					this.plugin.settings.codeBlockTheme = value;
				});
			});

		new Setting(codeBlock)
			.setName("Show Line Numbers")
			.setDesc("Show line numbers in code block.")
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.codeBlockShowLineNumbers);
				toggle.onChange(async (value) => {
					this.plugin.settings.codeBlockShowLineNumbers = value;
				});
			});

		new Setting(codeBlock)
			.setName("Collapse Code Block")
			.setDesc("Collapse code block.")
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.codeBlockCollapse);
				toggle.onChange(async (value) => {
					this.plugin.settings.codeBlockCollapse = value;
				});
			});

		new Setting(codeBlock)
			.setName("Debug")
			.setDesc("Enable debug mode to print all parse tokens.")
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.debug);
				toggle.onChange(async (value) => {
					this.plugin.settings.debug = value;
				});
			});
	}


	async hide() {
		await this.plugin.saveData(this.plugin.settings);
	}
}

