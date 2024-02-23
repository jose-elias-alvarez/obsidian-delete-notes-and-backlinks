import { TFile, normalizePath } from "obsidian";
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

    private async moveToVaultFolder() {
        const { vaultFolder } = this.plugin.settings;
        if (!vaultFolder) {
            throw new Error("Vault folder not set");
        }

        const normalizedFolder = normalizePath(vaultFolder);
        if (!this.plugin.app.vault.getAbstractFileByPath(normalizedFolder)) {
            throw new Error(`Vault folder ${normalizedFolder} does not exist`);
        }

        const newPath = normalizePath(vaultFolder + "/" + this.file.name);
        const fileInVaultFolder =
            this.plugin.app.vault.getAbstractFileByPath(newPath);
        if (fileInVaultFolder) {
            throw new Error(
                `File ${this.file.name} already exists in ${vaultFolder}`
            );
        }

        await this.plugin.app.vault.rename(this.file, newPath);
    }

    private async moveToSystemFolder() {
        const { systemFolder } = this.plugin.settings;
        if (!systemFolder) {
            throw new Error("System folder not set");
        }

        // since we're working outside of the vault, we need to use node modules,
        // which are only available on desktop
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require("fs/promises") as typeof import("fs/promises");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require("path") as typeof import("path");
        if (!fs || !path) {
            throw new Error("Cannot delete to system folder on this platform");
        }

        const normalizedFolder = path.normalize(systemFolder);
        try {
            await fs.access(normalizedFolder);
        } catch (error) {
            throw new Error(
                `System folder at ${normalizedFolder} does not exist`
            );
        }

        const oldPath = path.join(
            this.plugin.app.vault.adapter.getBasePath(),
            this.file.path
        );
        const newPath = path.join(normalizedFolder, this.file.name);
        try {
            await fs.access(newPath);
            throw new Error(
                `File ${this.file.name} already exists in ${systemFolder}`
            );
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
        }

        await fs.rename(oldPath, newPath);
    }

    public async deleteBacklinks() {
        for await (const linkedFile of this.linkedFiles) {
            let content = await this.plugin.app.vault.read(linkedFile.file);
            for (const link of linkedFile.backlinks) {
                content =
                    content.slice(0, link.position.start.offset) +
                    (link.displayText || link.link) +
                    content.slice(link.position.end.offset);
            }
            await this.plugin.app.vault.modify(linkedFile.file, content);
        }
    }

    public async delete() {
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
            case DeleteMode.MoveToVaultFolder: {
                await this.moveToVaultFolder();
                break;
            }
            case DeleteMode.MoveToSystemFolder: {
                await this.moveToSystemFolder();
                break;
            }
        }
    }
}
