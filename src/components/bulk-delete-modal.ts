import { App, Modal, Notice, Setting, TFile } from "obsidian";
import DeleteNotesPlugin from "../main";
import { DeleteNotesConfirmationModal } from "./confirmation-modal";

export class DeleteNotesBulkDeleteModal extends Modal {
    notePaths = "";
    plugin: DeleteNotesPlugin;

    constructor(app: App, plugin: DeleteNotesPlugin) {
        super(app);
        this.plugin = plugin;
    }

    async onSubmit() {
        const notes = this.notePaths
            .split("\n")
            .map((note) => this.plugin.app.vault.getAbstractFileByPath(note))
            .filter((note) => note instanceof TFile) as TFile[];
        if (!notes.length) {
            new Notice("No notes to delete!");
            return;
        }
        new DeleteNotesConfirmationModal(this.app, this.plugin, notes).open();
        this.close();
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h1", { text: "Bulk delete notes" });

        new Setting(contentEl)
            .setName("Notes to delete")
            .setDesc("One path per line, e.g. Note.md or Folder/Note.md")
            .addTextArea((text) => {
                text.onChange((value) => (this.notePaths = value));
            });
        new Setting(contentEl).addButton((button) => {
            button
                .setButtonText("Submit")
                .setWarning()
                .onClick(async () => {
                    await this.onSubmit();
                });
        });
    }
}
