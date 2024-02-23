import "obsidian";

declare module "obsidian" {
    interface MetadataCache {
        getBacklinksForFile: (file: TFile) =>
            | {
                  data: Record<string, LinkCache[]>;
              }
            | undefined;
    }
    interface DataAdapter {
        getBasePath: () => string;
    }
}
