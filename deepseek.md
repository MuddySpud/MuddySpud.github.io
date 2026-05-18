## Node 1: Root

Main text:
## Quick start video tutorial

What if your documentation could think like you do, navigating "if this, then that, except when…" logic to deliver precisely the right information? No LLM hallucinations. No decision-tree duplication. Just deterministic content.

Options:
- What are LLM hallucinations?
- What are decision trees in documentation?
- What does deterministic mean here?
- Continue - choose how you want to learn


## Node 2: The learning menu

Main text:

This tutorial can go in different directions depending on what you want to see first.

The video takes the routing-first branch - routing is the most distinctive feature of this system. Afterwards, you can come back and explore the other branches.

Options:
- Branch A - Show me the demo and explain storage (practical foundation)
- Branch B - Show me routing first - that sounds like the key idea (the video path)
- Branch C - Show me how nesting handles massive trees (the scalability proof)
- Branch D - Just take me on a single straight path (traditional tutorial)


## Node 3: What is routing? (Branch B - routing first)

Main text:
Routing lets one guide call another guide and then return to where it started.

Think of it like a function call in code:
- The main guide calls a sub-guide.
- The sub-guide runs its steps.
- When finished, control returns to the main guide.

This keeps each guide focused on one job. Complex logic lives in its own guide, not cluttering the main path.

Options:
- Continue - see a concrete example


## Node 4: A concrete routing example

Imagine an organisation that grew over time. It started with one core operation, then added a second to expand its product range - similar but not identical. Then a third.

The organisation builds a single diagnostic guide to troubleshoot problems across all three operations. When an issue arises in the core operation an engineer might need to refer to this guide and reaches a point where the next action depends on which operation is involved. For example, checking a component that exists on all three lines but behaves differently on each.

At that moment, under the hood, the guide hands the engineer to a sub-guide specific to that operation's components. That sub-guide handles the specialised steps and can exit in different ways depending on what it finds.

The main guide does not need to know what happened inside. It only needs to know which exit was taken to decide what to do next.

Options:
- Continue - routing to remote guides


## Node 5: Routing to remote guides

Main text:
That sub-guide might be written by the component vendor. In that case, they maintain its content, which may internally refer to their own suppliers' guides.

If the vendor updates their guide, your guide automatically uses the new version. You change nothing.

The guide stays short. Each piece stays focused on its own level of detail. Specialised knowledge lives in its own place. The main guide remains clean.

The user never sees irrelevant steps. The vendor's content appears only when needed. Your guide stays simple and easy to maintain, even as vendors change their procedures over time.

Options:
- Continue to summary


## Node 6: Summary of the routing-first branch

Main text:
In this branch you have seen:

- Deferred questions - the guide asks for the specific operation only when the answer matters
- Routing to specialised sub-guides - each operation's unique details live in its own place
- Multiple exit points - a sub-guide can return different results (resolved locally, needs shared component, needs vendor)
- Remote guides - vendor-maintained content that appears only when required

The result is a diagnostic system that gives the minimal number of steps to a solution. The user is never asked a question or given an instruction that is not yet relevant.

Options:
- Return to the learning menu
- Continue to the end


## Node 7: End node

Main text:
You have completed the routing-first branch of this tutorial.

The other branches (demo + storage, nesting + scale, the single straight path) are available from the learning menu. Each adds different details.

Next steps: install the Documentation Assembler extension, clone the demo repository, and try building a small map with routing yourself.

All files are plain JSON and Markdown.

Options:
- Restart the tutorial
- (End)