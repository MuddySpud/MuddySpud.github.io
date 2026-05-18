## Node 1: Root
## Quick start video tutorial

What if your documentation could think like you do, navigating "if this, then that, except when…" logic to deliver precisely the right information? No LLM hallucinations. No decision-tree duplication. Just deterministic content.

Ancillaries (When selected insert extra sections into the step path):
- Explain LLM hallucinations
    - Link to remote guide Hallucinations from guidebank https://netoftrees.github.io/docs-assembler-demo/ 
- Explain decision-trees
    - Link to map 'What are decision-trees'
- What does deterministic mean here?
    - Link to map 'What is Deterministic'

Options (auxilliaries and options should be kept succinct and short):
- Blank - merge this node with the next node


## Node 2: 
### What does this extension do?

This extension lets you build documentation that branches in different directions.

You write content in Markdown. You organise it into maps. A map is a set of steps followed by options.

The key difference: maps can call other maps and return. This means you never duplicate content. You build reusable pieces, like functions in code.

The result is documentation that adapts to the user's situation without becoming a mess to maintain.

Options (auxilliaries and options should be kept succinct and short):
- View the tutorial built in the video (All the maps here will be built in the video tutorial)
    - Go to node 3.
- View the video
    - Link to video map 
        - this shows the video and then follows with these 
- View the demo used in this tutorial on the demo remote guide bank


## Node 3: 
### Why does this matter?

The demo we will show you later is big. Some pathways through it are hundreds of steps long. This extension (plus Git hosting) is designed for building documentation for complex systems.

If you've ever copied and pasted the same paragraph into ten different documents, then updated it and missed a spot, this tool solves that.

Options (auxilliaries and options should be kept succinct and short):
- Blank - merge this node with the next node


## Node 4: 
### The learning menu (Not a great title...)

This tutorial is to demonstrate what is unique about the approach used by thi sextension and how it enables you to build complex documentation or any for of text that would benefit from brnaching and deduplication. These are:
- modularisation and routing - multiple exits, deduplificatio, scalabilty etc.
- nesting and how it handles massive maps etc (the scalability proof).
- absolute ownership - git repos - owned by you, rollback, history, compare etc. - no subscription
- publish to markdown - can edit in any editor if uninstall extension - no lock-in
- remote guides - use third party published guides in your maps. Offloading maintaining those sections to teams more familiar with that component. Build your own ecosystem independently.


## Node 5:
Link to Routing sub-map.

Exits:
- Routing explanation completed


## Node 6:
Link to Nesting sub-map.

Exits:
- Routing explanation completed


## Node 7:
Link to absolute ownership sub-map.

Exits:
- Absolute ownership explanation completed


## Node 8:
Link to publish to markdown sub-map.

Exits:
- Publish to markdown explanation completed


## Node 9:
Link to remote guides sub-map.

Exits:
- Remote guides explanation completed


## Node 10:
Link to summarise benefits.

End



--------------------------------------------------

# Routing map

## Node 1: What is routing?

Main text:
Routing lets one map call another map and then return to where it started.

Think of it like a function call in code:
- The main map calls a sub-map.
- The sub-map runs its steps.
- When finished, control returns to the main map.

This keeps each map focused on one job. Complex logic lives in its own map, not cluttering the main path.

Options:
- Continue - see a concrete example


## Node 2: An example

Main text:
Imagine an organisation that runs three similar but not identical production lines.

It builds one main diagnostic map for troubleshooting problems across all three lines.

At a certain point the main map needs to know which line the problem is on. Instead of writing every possibility inside the main map, it routes to a smaller map that is specific to that line.

That sub-map handles the specialised checks and can exit in different ways depending on what it finds.

The main map does not need to know the details inside the sub-map. It only needs to know which exit was taken to decide what to do next.

Options:
- Continue - routing to remote guides


## Node 7: Routing to remote guides

Main text:
You can link to remote guides as you do maps. That remote guide might be written by the component vendor and hosted on their GitHub Pages site.

If the vendor updates their guide, your guide automatically uses the new version. You change nothing.


## Node 8: Benefits of routing

Main text:
The map stays short. Each piece stays focused on its own level of detail. Specialised knowledge lives in its own place. The main map remains clean.

The user never sees irrelevant steps. Content appears only when needed. Your map stays simple and easy to maintain, even as the procedures within the sub-maps or remote guides change over time.

Options:
- Continue to summary


## Node 9: Summary of the routing-first branch

Main text:
In this branch you have seen:

- Deferred questions - the guide asks for the specific operation only when the answer matters
- Routing to specialised sub-guides - each operation's unique details live in its own place
- Multiple exit points - a sub-guide can return different results (resolved locally, needs shared component, needs vendor)
- Remote guides - vendor-maintained content that appears only when required

The result is a diagnostic system that gives the minimal number of steps to a solution. The user is never asked a question or given an instruction that is not yet relevant.

EXIT:
- Continue

--------------------------------------------------
