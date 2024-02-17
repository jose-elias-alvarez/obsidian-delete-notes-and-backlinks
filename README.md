# Obsidian Delete Notes and Backlinks

A simple plugin to automatically delete backlinks when deleting Obsidian notes.

## Warning

**Deleting backlinks is a destructive operation and cannot be undone**. Use this plugin with caution and be sure to back up your vault, especially when bulk deleting notes.

By default, deleted notes are sent to the system trash and can be recovered, but if you configure the plugin to permanently delete notes, they cannot be recovered.

## Usage

The plugin adds two commands:

-   Delete current note and backlinks: operates on the current note
-   Bulk delete notes and backlinks: operates on a newline-separated list of notes

Each command runs through the following steps:

1. Prompts for confirmation according to the configuration in [Confirmation](#confirmation)
2. Deletes the note(s) passed to the command according to the configuration in [Deletion](#deletion)
3. Deletes backlinks to the note(s) according to the logic in [Backlink Deletion](#backlink-deletion)

## Confirmation

By default, the plugin prompts for confirmation on all operations. You can disable confirmation for the following operations:

-   Confirm when deleting single note
-   Confirm when deleting multiple notes
-   Confirm when deleting notes with no backlinks

## Deletion

By default, the plugin sends deleted notes to the system trash. You can select from the following options:

-   Move to system trash
-   Move to Obsidian trash (.trash folder)
-   Permanently delete

## Backlink Deletion

The plugin deletes backlinks by replacing internal links with the link's display text. Let's say you have the following internal links pointing at the note `KFC`:

```markdown
Today I went to [[KFC]] and it was great.
```

```markdown
[[KFC|Kentucky Fried Chicken|]] is okay, but [[Popeye's]] is clearly better.
```

When you delete the note, the plugin will find its backlinks and replace them with the following:

```markdown
Today I went to KFC and it was great.
```

```markdown
Kentucky Fried Chicken is okay, but [[Popeye's]] is clearly better.
```
