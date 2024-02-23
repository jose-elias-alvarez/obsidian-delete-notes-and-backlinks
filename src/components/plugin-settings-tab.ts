import { App, PluginSettingTab, Setting } from "obsidian";
import DeleteNotesPlugin from "../main";
import { DeleteMode } from "../settings";

export class DeleteNotesPluginSettingTab extends PluginSettingTab {
    plugin: DeleteNotesPlugin;

    constructor(app: App, plugin: DeleteNotesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Delete Notes Settings" });

        new Setting(containerEl)
            .setName("Deleted files")
            .setDesc("What happens to a file after you delete it.")
            .addDropdown((dropdown) => {
                dropdown
                    .addOptions({
                        [DeleteMode.System]: "Move to system trash",
                        [DeleteMode.Obsidian]:
                            "Move to Obsidian trash (.trash folder)",
                        [DeleteMode.Permanent]: "Permanently delete",
                        [DeleteMode.MoveToVaultFolder]: "Move to vault folder",
                        [DeleteMode.MoveToSystemFolder]:
                            "Move to system folder",
                    })
                    .setValue(this.plugin.settings.deleteMode.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.deleteMode = parseInt(value);
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName("Vault folder")
            .setDesc("Path to folder within vault to move deleted files to")
            .addText((text) => {
                text.setPlaceholder("Archive")
                    .setValue(this.plugin.settings.vaultFolder || "")
                    .onChange(async (value) => {
                        this.plugin.settings.vaultFolder = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName("System folder")
            .setDesc("Absolute path to system folder to move deleted files to")
            .addText((text) => {
                text.setPlaceholder("/Users/jose/Archive")
                    .setValue(this.plugin.settings.systemFolder || "")
                    .onChange(async (value) => {
                        this.plugin.settings.systemFolder = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName("Confirm when deleting single note")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.confirmOnDeleteSingleNote)
                    .onChange(async (value) => {
                        this.plugin.settings.confirmOnDeleteSingleNote = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName("Confirm when deleting multiple notes")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.confirmOnDeleteMultipleNotes)
                    .onChange(async (value) => {
                        this.plugin.settings.confirmOnDeleteMultipleNotes =
                            value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName("Confirm when deleting notes with no backlinks")
            .addToggle((toggle) => {
                toggle
                    .setValue(
                        this.plugin.settings.confirmOnDeleteNotesWithNoBacklinks
                    )
                    .onChange(async (value) => {
                        this.plugin.settings.confirmOnDeleteNotesWithNoBacklinks =
                            value;
                        await this.plugin.saveSettings();
                    });
            });
    }
}
