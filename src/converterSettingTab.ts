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

		const codeBlock = containerEl.createDiv();

		new Setting(codeBlock)
			.setName("Code block theme")
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

