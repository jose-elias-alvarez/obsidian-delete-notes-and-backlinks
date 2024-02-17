import { TFile } from "obsidian";
import DeleteNotesPlugin from "../main";
import { DeleteMode } from "../settings";
import { LinkedFile } from "../types";

export class NoteToDelete {
    file: TFile;
    plugin: DeleteNotesPlugin;
    linkedFiles: LinkedFile[];

    constructor(file: TFile, plugin: DeleteNotesPlugin) {
        this.file = file;
        this.plugin = plugin;
        this.linkedFiles = Object.entries(
            this.plugin.app.metadataCache.getBacklinksForFile(this.file)
                ?.data || {}
        ).reduce((acc, [name, backlinks]) => {
            const backlinkFile =
                this.plugin.app.vault.getAbstractFileByPath(name);
            if (!(backlinkFile instanceof TFile)) return acc;
            return acc.concat({
                file: backlinkFile,
                backlinks,
            });
        }, [] as LinkedFile[]);
    }

    async delete() {
        for await (const linkedFile of this.linkedFiles) {
            let content = await this.plugin.app.vault.read(linkedFile.file);
            for (const link of linkedFile.backlinks) {
                content =
                    content.slice(0, link.position.start.offset) +
                    (link.displayText || link.link) +
                    content.slice(link.position.end.offset);
            }
            try {
                await this.plugin.app.vault.modify(linkedFile.file, content);
            } catch {
                // if this fails, we probably deleted the file already
                // so we'll ignore it
            }
        }
        switch (this.plugin.settings.deleteMode) {
            case DeleteMode.System: {
                await this.plugin.app.vault.trash(this.file, true);
                break;
            }
            case DeleteMode.Obsidian: {
                await this.plugin.app.vault.trash(this.file, false);
                break;
            }
            case DeleteMode.Permanent: {
                await this.plugin.app.vault.delete(this.file, true);
                break;
            }
        }
    }
}
