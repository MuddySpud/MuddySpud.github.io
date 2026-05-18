## Node 1: Root
Main text:
## Quick start video tutorial

What if your documentation could think like you do, navigating "if this, then that, except when…" logic to deliver precisely the right information? No LLM hallucinations. No decision-tree duplication. Just deterministic content.

Ancillaries:
- Explain LLM hallucinations (links to remote guide when ready)
- Explain decision-trees (links to map 'What are decision-trees')
- What does deterministic mean here? (links to map 'What is Deterministic')

Options:
- Continue - choose how you want to learn


## Node 2: What does this extension do?
Main text:
This extension lets you build documentation that branches in different directions.

You write content in Markdown. You organise it into maps. A map is a set of steps followed by options.

The key difference: maps can call other maps and return. This means you never duplicate content. You build reusable pieces, like functions in code.

The result is documentation that adapts to the user's situation without becoming a mess to maintain.

Options:
- View the tutorial built in the video (the maps below are built live in the video)
- View the video
- View the demo used in this tutorial


## Node 3: Why does this matter?
Main text:
The demo we will show you at the end of the tutorial is big. Some pathways through it are hundreds of steps long. This extension (plus Git hosting) is designed for building documentation for complex systems like that.

If you've ever copied and pasted the same paragraph into ten different documents, then updated it and missed a spot, this tool solves that.

Options:
- Continue to learning menu


## Node 4: The learning menu
Main text:
This tutorial demonstrates what is unique about the extension and how it lets you build complex, branching documentation without duplication.

Choose any topic below. The video follows the routing path first.

Options:
- Routing and modularisation (the video path)
- Nesting and massive trees (scalability)
- Absolute ownership with Git (no subscriptions, full control)
- Publish to standard Markdown (no lock-in)
- Remote guides (use and reuse third-party content)


## Node 5: Link to Routing sub-map
Main text:
(Links to the Routing sub-map)

Exit:
- Routing explanation completed → return to learning menu


## Node 6: Link to Nesting sub-map
Main text:
(Links to the Nesting sub-map)

Exit:
- Nesting explanation completed → return to learning menu


## Node 7: Link to Absolute ownership sub-map
Main text:
(Links to the Absolute ownership sub-map)

Exit:
- Absolute ownership explanation completed → return to learning menu


## Node 8: Link to Publish to Markdown sub-map
Main text:
(Links to the Publish to Markdown sub-map)

Exit:
- Publish to Markdown explanation completed → return to learning menu


## Node 9: Link to Remote guides sub-map
Main text:
(Links to the Remote guides sub-map)

Exit:
- Remote guides explanation completed → return to learning menu


## Node 10: Summary of benefits
Main text:
You have now seen the main ideas that make Documentation Assembler different:

- Maps that can call other maps and return (routing)
- Deep nesting for very large guides
- Full ownership through Git with no subscriptions
- Publishing to ordinary Markdown files (no lock-in)
- Ability to reuse remote guides maintained by others

Next steps: install the extension, clone the demo repository, and start building your own maps.

Options:
- Return to learning menu
- Restart the tutorial
- (End)


______________________________________________________________


## Node 1: What is routing?
Main text:
Routing lets one map call another map and then return to where it started.

Think of it like a function call in code:
- The main map calls a sub-map.
- The sub-map runs its steps.
- When finished, control returns to the main map.

This keeps each map focused on one job. Complex logic lives in its own map.

Options:
- Continue - see a concrete example


## Node 2: A concrete example
Main text:
Imagine an organisation that runs three similar but not identical production lines.

It builds one main diagnostic map for troubleshooting problems across all three lines.

At a certain point the main map needs to know which line the problem is on. Instead of writing every possibility inside the main map, it routes to a smaller map specific to that line.

That sub-map handles the specialised checks and can exit in different ways depending on what it finds.

The main map only needs to know which exit was taken.

Options:
- Continue - routing to remote guides


## Node 3: Routing to remote guides
Main text:
Routing works the same way with remote guides.

A remote guide is a map published and maintained by someone else on their own site.

If the owner updates their remote guide, your guide automatically uses the new version.

Options:
- Continue - benefits of routing


## Node 4: Benefits of routing
Main text:
The main map stays short. Each piece stays focused on its own level of detail. Specialised knowledge lives in its own place.

The user never sees irrelevant steps. Content appears only when needed. Your guide stays simple and easy to maintain, even as procedures in sub-maps or remote guides change.

Options:
- Continue to summary


## Node 5: Summary
Main text:
You have seen:
- Deferred questions
- Routing to specialised sub-maps
- Multiple exit points
- Remote guides that update automatically

The result is the shortest useful path for the reader.

Exit:
- Routing explanation completed

______________________________________________________________


## Node 1: What is nesting?
Main text:
Nesting lets you place one map inside another map, as many levels deep as you need.

This is how the system handles massive guides without becoming unmanageable.

Options:
- Continue - see it in the demo


## Node 2: How nesting works in practice
Main text:
A single map can contain a small, focused piece of logic or content.

You can then use that map as one step inside a larger map.

Changes made in the nested map automatically update everywhere it is used.

In the demo, explore the main pathway and notice how the guide grows to hundreds of steps while staying organised.

Options:
- Continue to summary


## Node 3: Summary
Main text:
Nesting works like building blocks or classes in code. It is the reason very large guides remain easy to maintain.

Exit:
- Nesting explanation completed

______________________________________________________________


## Node 1: Absolute ownership
Main text:
All content lives in ordinary Git repositories that you fully control.

There are no subscriptions and no vendor lock-in.

Options:
- Continue


## Node 2: What this gives you
Main text:
- Full history, rollback, and compare tools from Git
- You can host the guide anywhere (GitHub Pages, GitLab Pages, your own server)
- You can uninstall the extension at any time and the published files still work

Options:
- Continue to summary


## Node 3: Summary
Main text:
You own the content completely. The extension is only the editor - never the storage.

Exit:
- Absolute ownership explanation completed

______________________________________________________________


## Node 1: Publish to Markdown
Main text:
When you publish a guide, the extension assembles all maps, variables, and routing into clean, standard Markdown files.

Options:
- Continue


## Node 2: Why this matters
Main text:
- The published guide works with any static site host
- You can edit the output files in any text editor
- If you ever uninstall the extension, your guides continue to work normally

Options:
- Continue to summary


## Node 3: Summary
Main text:
Publishing gives you ordinary Markdown with no hidden formats or lock-in.

Exit:
- Publish to Markdown explanation completed

______________________________________________________________


## Node 1: What are remote guides?
Main text:
A remote guide is a map (or set of maps) that someone else has published and maintains on their own site.

You can route to it exactly as you route to your own maps.

Options:
- Continue


## Node 2: How remote guides work
Main text:
If the owner updates their guide, your guide automatically uses the latest version - you change nothing.

This lets you reuse up-to-date content from vendors, libraries, or other teams without copying it.

Options:
- Continue to summary


## Node 3: Summary
Main text:
Remote guides let you build an ecosystem. Specialised knowledge stays with the people who know it best, while your own guide stays clean and maintainable.

Exit:
- Remote guides explanation completed

______________________________________________________________




______________________________________________________________




______________________________________________________________




______________________________________________________________




______________________________________________________________


