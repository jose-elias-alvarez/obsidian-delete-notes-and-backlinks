import { LinkCache, TFile } from "obsidian";

export interface LinkedFile {
    file: TFile;
    backlinks: LinkCache[];
}
