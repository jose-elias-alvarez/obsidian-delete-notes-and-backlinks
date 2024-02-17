import { App, Modal, Setting, TFile } from "obsidian";
import { NoteToDelete } from "../classes/note-to-delete";
import DeleteNotesPlugin from "../main";
import { formatNoun } from "../utils/format-noun";

export class DeleteNotesConfirmationModal extends Modal {
    plugin: DeleteNotesPlugin;
    notes: NoteToDelete[];

    constructor(app: App, plugin: DeleteNotesPlugin, files: TFile | TFile[]) {
        if (!Array.isArray(files)) files = [files];
        super(app);
        this.notes = files.map((file) => new NoteToDelete(file, plugin));
        this.plugin = plugin;
    }

    shouldDeleteWithoutConfirmation() {
        if (
            !this.plugin.settings.confirmOnDeleteSingleNote &&
            this.notes.length === 1
        ) {
            return true;
        }
        if (
            !this.plugin.settings.confirmOnDeleteMultipleNotes &&
            this.notes.length > 1
        ) {
            return true;
        }
        if (
            !this.plugin.settings.confirmOnDeleteNotesWithNoBacklinks &&
            this.notes.every((note) => !note.linkedFiles.length)
        ) {
            return true;
        }
        return false;
    }

    async onDelete() {
        for await (const note of this.notes) {
            await note.delete();
        }
        this.close();
    }

    async onOpen() {
        if (this.shouldDeleteWithoutConfirmation()) {
            await this.onDelete();
            return;
        }

        const { contentEl } = this;
        contentEl.createEl("h1", {
            text: `Delete ${formatNoun("note", this.notes.length)}`,
        });
        contentEl.createEl("p", {
            text: `Are you sure you want to delete the following ${
                this.notes.length
            } ${formatNoun(
                "note",
                this.notes.length
            )} and any associated backlinks? This cannot be undone!`,
        });
        for (const note of this.notes) {
            contentEl.createEl("strong", { text: note.file.path });
            const list = contentEl.createEl("ul");
            for (const linkedFile of note.linkedFiles) {
                list.createEl("li", {
                    text: `${linkedFile.file.path}: ${
                        linkedFile.backlinks.length
                    } ${formatNoun("backlink", linkedFile.backlinks.length)}`,
                });
            }
        }

        new Setting(contentEl)
            .addButton((button) => {
                button
                    .setButtonText("Delete")
                    .setWarning()
                    .onClick(async () => {
                        await this.onDelete();
                    });
            })
            .addButton((button) => {
                button.setButtonText("Cancel").onClick(() => this.close());
            });
    }
}
