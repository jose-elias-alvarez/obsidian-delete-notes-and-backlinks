import { Plugin } from "obsidian";
import { DeleteNotesBulkDeleteModal } from "./components/bulk-delete-modal";
import { DeleteNotesConfirmationModal } from "./components/confirmation-modal";
import { DeleteNotesPluginSettingTab } from "./components/plugin-settings-tab";
import { DEFAULT_SETTINGS, DeleteNotesPluginSettings } from "./settings";

export default class DeleteNotesPlugin extends Plugin {
    settings: DeleteNotesPluginSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new DeleteNotesPluginSettingTab(this.app, this));

        this.addCommand({
            id: "delete-current-note",
            name: "Delete current note and backlinks",
            callback: async () => {
                const currentNote = this.app.workspace.getActiveFile();
                if (!currentNote) return;

                new DeleteNotesConfirmationModal(this.app, this, [
                    currentNote,
                ]).open();
            },
        });

        this.addCommand({
            id: "bulk-delete-notes",
            name: "Bulk delete notes and backlinks",
            callback: () => {
                new DeleteNotesBulkDeleteModal(this.app, this).open();
            },
        });
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
