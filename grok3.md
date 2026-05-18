## Quick start video tutorial

What if your documentation could think like you do, navigating "if this, then that, except when..." logic to deliver precisely the right information? No LLM hallucinations. No decision-tree duplication. Just deterministic content.

### What does this extension do?

This extension lets you build documentation that branches in different directions.

You write content in Markdown. You organise it into maps. A map is a set of steps followed by options.

You edit inside VS Code using the visual Map Editor or the raw JSON files, with IntelliSense and automatic validation.

The key difference: maps can call other maps and return. You can also define variables for reusable text snippets and use ancillaries for collapsible sections. This means you never duplicate content. You build reusable pieces, like functions in code.

The result is documentation that adapts to the user's situation without becoming a mess to maintain.

### The problem this solves

If you have ever copied and pasted the same paragraph into ten different documents, then updated it and missed a spot, you already know the pain.

The real dread goes deeper:

- Sprawling, duplicated content across guides and wikis - impossible to know what is accurate
- Error-prone updates - you change something in one place, but miss the same information duplicated elsewhere
- Brittle, unmanageable documentation that cannot handle similar-but-different scenarios without creating contradictions

The demo we will show you later proves how encapsulation eliminates this dread. It is large - some pathways through it are hundreds of steps long. It proves this tool can handle massive, complex systems.

You will also see how breaking things into smaller pieces simplifies maintenance and lets different teams own different sections without conflict.

### How it solves it

This tutorial walks you through five core ideas that make this approach different:

- Routing - one map calls another, then returns
- Nesting - maps inside maps for massive guides
- Absolute ownership - your Git repos, no subscriptions
- Publish to Markdown - standard files, no lock-in
- Remote guides - use and reuse content that others maintain

Each concept builds on the last. The video walks through them in order.

## What is routing?

Routing lets one map call another map and then return to where it started.

Think of it like a function call in code:
- The main map calls a sub-map.
- The sub-map runs its steps.
- When finished, control returns to the main map.

This keeps each map focused on one job. Complex logic lives in its own map.

A routed map can have multiple exit points, allowing the flow to branch and rejoin in different ways.

### A concrete routing example

Imagine an organisation that runs three similar but not identical production lines.

It builds one main diagnostic map for troubleshooting problems across all three lines.

At a certain point the main map needs to know which line the problem is on. Instead of writing every possibility inside the main map, it routes to a sub-map specific to that line.

That sub-map handles the specialised checks and can exit in different ways depending on what it finds.

The main map only needs to know which exit was taken.

### Benefits of routing

The main map stays short. Each piece stays focused on its own level of detail. Specialised knowledge lives in a dedicated map.

The user never sees irrelevant steps. Content appears only when needed. Your map stays simple and easy to maintain, even when procedures inside sub-maps change.

Routing also enables:
- Deduplication - the same sub-map can be used from many parent maps
- Separation of concerns - different teams can own different sub-maps

### Routing summary

You have seen:
- Deferred questions - the guide asks for the specific operation only when the answer matters
- Routing to specialised sub-maps
- Multiple exit points
- Deduplication across parent maps

The result is the shortest useful path for the reader.
Later you'll see how to integrate expertise you don't own.

## What is nesting?

Nesting means placing one map inside another map.

When Map A references Map B, Map B becomes a single step inside Map A. From the outside it looks like any other step, but inside it can be its own complete guide.

This is similar to folders inside folders or functions that call other functions.

### Nesting example

Imagine a troubleshooting guide for a factory, although this could be any multi-variant system.

The top-level map refers to maps for all of the major assemblies of the factory line. Those in turn refer to their sub-assemblies, which refer to their machines, which refer to their components, and so on.

The top-level map does not need to know the internal steps of any nested map. If a component changes, you update only the nested map and all its parent maps automatically reflect the change.

### Benefits of nesting

Nesting keeps large maps manageable. Without it, a map with hundreds or even thousands of steps becomes impossible to navigate.

With nesting you can:
- Hide complexity inside smaller maps
- Reuse the same nested map in many places
- Change something once and every parent map updates automatically (single source of truth)
- Let different teams own different nested maps

The demo uses nesting heavily, which is why it stays organised even with pathways hundreds of steps long.

### Nesting summary

Nesting gives you encapsulation, reusability, and maintainability. Like classes in code, it is how you build massive, complex guides that remain straightforward to maintain and grow.

## What is absolute ownership?

Absolute ownership means all your content lives in standard Git repositories that you control.

You are not storing your documentation in a proprietary database or on someone else's server.

### Why Git instead of a database?

Git gives you:
- Full history - every change is tracked. You can see who changed what, and when.
- Instant rollback - revert to any previous version with one command.
- No new tools to learn - if you already use Git for code, you already know how to use it for documentation.
- Offline access - your files are on your hard drive.
- Standard diffing - see exactly what changed between two versions, line by line.

### Benefits of absolute ownership

- No subscription fees
- No vendor lock-in
- Use your existing Git workflow (pull requests, reviews, CI/CD)
- Backups are already handled

### Absolute ownership summary

You own your content completely. The extension is just a tool for editing it.

## What does "publish to Markdown" mean?

When you finish building your maps, the extension assembles them into standard Markdown files that any text editor can open. It automatically copies linked assets, validates the entire guide, fixes relative links, and prepares the files for any static host.

### Benefits of publishing to Markdown

- Uninstall the extension and the published files still work
- Edit anywhere with any Markdown editor
- Host anywhere (GitHub Pages, your own server, etc.)
- Readers never need the extension

### Publish to Markdown summary

The extension is a power tool for building. The output is ordinary Markdown that belongs to you.

## What are remote guides?

A remote guide is a guide published and hosted by a third party.

You simply link to it from your own map. When the reader reaches that step they are handed to the third-party guide, then return to your map when finished.

### Benefits of remote guides

- You do not have to copy or maintain their content
- Their experts keep their guide up to date - your map automatically reflects any changes
- You stay focused on what your team knows best
- You can build an ecosystem where different teams publish and reuse each other's guides

### Remote guides summary

Remote guides let you link instead of copy. The people who know the content best are the ones who maintain it.

## What you have learned

This tutorial introduced five core concepts that work together:

- Routing
- Nesting
- Absolute ownership
- Publish to Markdown
- Remote guides

You can also define **variables** for reusable text snippets (with automatic link fixing) and use **ancillaries** for collapsible sections that let readers expand or hide detail as needed.

Each concept solves a specific maintenance problem. Together they form a complete system.

### How they fit together

You write maps in VS Code. The maps live in Git repos you control (absolute ownership). You nest maps inside other maps to keep things organised (nesting).

When a decision point is reached, one map can route to another map - or to a remote guide - and return (routing).

When you are ready, the extension assembles everything into standard Markdown files (publish to Markdown). You host those files anywhere. Your readers see clean documentation.

If you uninstall the extension tomorrow, the published Markdown files remain. Your documentation is never trapped.

### Final summary

All files are plain JSON and Markdown. You cannot break anything permanently - Git has your history.