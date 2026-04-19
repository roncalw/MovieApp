# Working Rules

## Purpose

This file records repo-specific collaboration rules that should survive across chats.

## First Read Rule

- Before answering any repo-related request in this workspace, re-read `WORKING-RULES.md` first.
- Treat this file as the first local source of truth for workflow rules, backup rules, rollback rules, and recurring user preferences tied to this repo.
- Do not assume those workflow rules from memory when a quick re-read would avoid drift.

## Backup Before Edit

- Before editing any existing file, create a side backup first.
- Put the backup under `.codex/_rollback/`.
- The backup is for fast rollback of the most recent Codex edit without touching unrelated workspace changes.

## Rollback Rule

- If a recent Codex change is rejected, restore the file from the side backup immediately.
- Do not use Git to undo that kind of last-change rollback.
- Do not hunt through VS Code history first if the side backup already exists.
- The intended order is:
  1. side backup
  2. edit
  3. if needed, restore from side backup

## Git Rule

- Git is for intentional version control work, not for undoing one bad uncommitted edit during live collaboration.
- Do not rely on Git for rollback when the workspace may also contain other good uncommitted changes.

## VS Code History Rule

- VS Code history is a fallback only.
- Use it only if the side backup is missing or unusable.

## Chat Size Check Rule

- Key phrase:
  - `Check the size of this chat`
- When the user asks to check the size of the current chat thread, compare it against the biggest known local reference thread:
  - `FULL - READ ONLY`
- Use the quickest path only:
  1. identify the current session file
  2. read the file size of the current session file
  3. read the file size of the `FULL - READ ONLY` session file
  4. compare those two sizes
  5. stop
- Do not scan session contents.
- Do not run broad `rg`, `jq`, or full-history searches unless the user explicitly asks for deeper thread forensics.
- Prefer a direct file-size check over any content inspection.
- Answer with the smallest useful summary:
  - current size
  - `FULL - READ ONLY` size
  - percentage comparison

## Practical Naming

- Prefer obvious backup names that keep the source filename recognizable.
- Example:
  - `.codex/_rollback/ApplicationArchitecture.md.before-codex`
  - `.codex/_rollback/header-body-hierarchy.svg.before-codex`

## Scope

- Apply this workflow especially to markdown docs, diagrams, SVG files, notes, prompts, and other fast-iteration files.
- It is also appropriate for code files when the user may want a very fast revert of the latest edit only.
