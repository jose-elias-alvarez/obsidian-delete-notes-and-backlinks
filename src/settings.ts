export enum DeleteMode {
    System,
    Obsidian,
    Permanent,
}

export interface DeleteNotesPluginSettings {
    confirmOnDeleteSingleNote: boolean;
    confirmOnDeleteMultipleNotes: boolean;
    confirmOnDeleteNotesWithNoBacklinks: boolean;
    deleteMode: DeleteMode;
}

export const DEFAULT_SETTINGS: DeleteNotesPluginSettings = {
    confirmOnDeleteSingleNote: true,
    confirmOnDeleteMultipleNotes: true,
    confirmOnDeleteNotesWithNoBacklinks: true,
    deleteMode: DeleteMode.System,
};
