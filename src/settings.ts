export enum DeleteMode {
    System,
    Obsidian,
    Permanent,
    MoveToVaultFolder,
    MoveToSystemFolder,
}

export interface DeleteNotesPluginSettings {
    confirmOnDeleteSingleNote: boolean;
    confirmOnDeleteMultipleNotes: boolean;
    confirmOnDeleteNotesWithNoBacklinks: boolean;
    deleteMode: DeleteMode;
    vaultFolder?: string;
    systemFolder?: string;
}

export const DEFAULT_SETTINGS: DeleteNotesPluginSettings = {
    confirmOnDeleteSingleNote: true,
    confirmOnDeleteMultipleNotes: true,
    confirmOnDeleteNotesWithNoBacklinks: true,
    deleteMode: DeleteMode.System,
};
