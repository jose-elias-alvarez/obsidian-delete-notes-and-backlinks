# Obsidian Delete Notes and Backlinks

A simple plugin to automatically delete backlinks when deleting Obsidian notes.

```markdown
Today I went to [[KFC]] and it was great.
```

```markdown
[[KFC|Kentucky Fried Chicken|]] is okay, but [[Popeye's]] is clearly better.
```

When you delete the note `KFC` using one of the plugin's commands, it'll find those backlinks and replace them with the following:

```markdown
Today I went to KFC and it was great.
```

```markdown
Kentucky Fried Chicken is okay, but [[Popeye's]] is clearly better.
```

## Warning

**Deleting backlinks is a destructive operation and cannot be undone**. Use this plugin with caution and be sure to back up your vault, especially when bulk deleting notes.

By default, deleted notes are sent to the system trash and may be recoverable, but if you configure the plugin to permanently delete notes, they're gone forever. Again, be careful.

## Usage

The plugin adds two commands:

-   `Delete current note and backlinks`: operates on the current note

This command is a drop-in replacement for Obsidian's default `Delete current file` command and can be bound to a key for convenience.

-   `Bulk delete notes and backlinks`: operates on a newline-separated list of notes

A handy way to generate such a list is to pull up Obsidian's search, click the `...` button below the search bar, select `Copy search results`, and select `Show path`.

## Configuration

### Confirmation

By default, the plugin prompts for confirmation on all operations. You can disable confirmation for the following operations:

-   Confirm when deleting single note
-   Confirm when deleting multiple notes
-   Confirm when deleting notes with no backlinks

### Deletion

By default, the plugin sends deleted notes to the system trash. You can select from the following options:

-   Move to system trash
-   Move to Obsidian trash (.trash folder)
-   Permanently delete
