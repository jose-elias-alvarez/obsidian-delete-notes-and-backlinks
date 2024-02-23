import { App, Modal, Notice, Setting, TFile } from "obsidian";
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

    onSuccess() {
        this.app.workspace.iterateAllLeaves((leaf) => {
            const leafPath = leaf.getViewState().state.file;
            if (this.notes.some((note) => leafPath === note.file.path)) {
                leaf.detach();
            }
        });
        new Notice(
            `Deleted ${this.notes.length} ${formatNoun(
                "note",
                this.notes.length
            )}`
        );
    }

    // workaround to open links from the modal
    // it's also possible to use real links + the obsidian URI scheme
    // but either way we need to hook into the event to close the modal,
    // so we might as well make it a little nicer
    createClickableWikilink(el: HTMLElement, linkPath: string) {
        const link = el.createEl("a", {
            text: linkPath,
            attr: {
                text: `[[${linkPath}]]`,
            },
        });
        link.addEventListener("click", (e) => {
            e.preventDefault();
            this.close();
            this.app.workspace.openLinkText(
                linkPath,
                "",
                e.ctrlKey || e.metaKey
            );
        });
        return link;
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
        try {
            for await (const note of this.notes) {
                await note.deleteBacklinks();
            }
            for await (const note of this.notes) {
                await note.delete();
            }
            this.onSuccess();
        } catch (error) {
            new Notice(`Failed to delete note: ${error.message}`);
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
            this.createClickableWikilink(
                contentEl.createEl("strong"),
                note.file.path
            );
            const list = contentEl.createEl("ul");
            for (const linkedFile of note.linkedFiles) {
                const listItem = list.createEl("li");
                this.createClickableWikilink(listItem, linkedFile.file.path);
                listItem.createEl("span", {
                    text: `: ${linkedFile.backlinks.length} ${formatNoun(
                        "backlink",
                        linkedFile.backlinks.length
                    )}`,
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
