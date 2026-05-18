## Quick start video tutorial

What if your documentation could think like you do, navigating "if this, then that, except when…" logic to deliver precisely the right information? No LLM hallucinations. No decision-tree duplication. Just deterministic content.

### What does this extension do?

This extension lets you build documentation that branches in different directions.

You write content in Markdown. You organise it into maps. A map is a set of steps followed by options.

The key difference: maps can call other maps and return. This means you never duplicate content. You build reusable pieces, like functions in code.

The result is documentation that adapts to the user's situation without becoming a mess to maintain.

### The problem this solves

If you have ever copied and pasted the same paragraph into ten different documents, then updated it and missed a spot, you already know the pain.

The demo we will show you later is large - some pathways through it are hundreds of steps long. It proves this tool can handle massive, complex systems.

You will also see how breaking things into smaller pieces simplifies maintenance and lets different teams own different sections without conflict.

### How it solves it

This tutorial walks you through five core ideas that make this approach different.

- **Routing** - One map calls another, then returns. No duplication.
- **Nesting** - Maps inside maps. Handles hundreds of steps cleanly.
- **Absolute ownership** - Your Git repos. Your control. No subscription.
- **Publish to Markdown** - Standard files. Uninstall anytime. No lock-in.
- **Third-party guides** - Use guides others maintain. They update it; you keep working.

Each concept builds on the last. The video walks through them in order.

## What is routing?

Routing lets one map call another map and then return to where it started.

Think of it like a function call in code:
- The main map calls a sub-map.
- The sub-map runs its steps.
- When finished, control returns to the main map.

This keeps each map focused on one job. Complex logic lives in its own map.

A routed map is called at a decision point and can return through different exits, allowing the flow to branch and rejoin in multiple ways.

### A concrete example

Imagine an organisation that runs three similar but not identical production lines.

It builds one main diagnostic map for troubleshooting problems across all three lines.

At a certain point, the main map needs to know which line the problem is on. Instead of writing every possibility inside the main map, it routes to a sub-map specific to that line.

That sub-map handles the specialised checks and can exit in different ways depending on what it finds.

The main map only needs to know which exit was taken.

A routed map can have multiple exit points. For example, a sensor diagnostic map might have three exits: "sensor faulty", "wiring loose", or "no fault found". The calling map decides what to do next based on which exit is used.

### Benefits of routing

The map stays short. Each piece stays focused on its own level of detail. Specialised knowledge lives in its own place. The main map remains clean.

The user never sees irrelevant steps. Content appears only when needed. Your map stays simple and easy to maintain, even when procedures inside sub-maps change over time.

Routing also enables:
- **Deduplication** - The same sub-map can be routed to from multiple parent maps
- **Separation of concerns** - Different teams can own different sub-maps

### Summary

- **Deferred questions** - The amp asks for the specific operation only when the answer matters.
- **Routing to specialised sub-maps** - Each operation's unique details live in its own map.
- **Multiple exit points** - A sub-map can return through any exit it defines.
- **Deduplication** - The same sub-map serves many parent maps.

The result is a system that gives the minimal number of steps to a solution. The user is never asked a question or given an instruction that is not yet relevant.

## What is nesting?

Nesting means placing one map inside another map.

When Map A references Map B, Map B becomes a single step inside Map A. From the outside, Map B looks like any other step. But inside, Map B can be its own complete guide with multiple steps, options, and even its own nested maps.

This is similar to folders inside folders, or functions that call other functions.

### An example

Imagine a troubleshooting guide for a factory.

The top-level map has five steps: check power, check network, check sensors, check software, log the outcome.

The "check sensors" step could be a nested map. That map contains twenty steps about different sensors across different production lines.

The top-level map does not need to know about those twenty steps. It only sees one step called "check sensors". The complexity is hidden inside the nested map.

If the sensors change, you update only the nested map. The top-level map stays unchanged.

### Benefits of nesting

Nesting keeps large guides manageable. Without nesting, a guide with hundreds of steps becomes impossible to navigate and maintain.

With nesting, you can:
- Hide complexity inside smaller maps
- Reuse the same nested map in multiple parent maps
- Change something once, and every parent map sees the update
- Let different teams own different nested maps

The demo we showed earlier has pathways hundreds of steps long. It stays organised because it uses nesting heavily.

### Summary

- **Nesting** - One map inside another, hiding complexity
- **Encapsulation** - The nested map's internal details stay hidden from the parent
- **Reusability** - The same nested map can be used in many parent maps
- **Maintainability** - Change a nested map once, and all parents update automatically

Nesting is how you build massive, complex guides without them falling apart. Each piece stays small and focused. The whole system scales.

## What is Absolute Ownership?

Absolute ownership means all your content lives in standard Git repositories that you control. You are not storing your documentation in a proprietary database or on someone else's server.

With traditional tools, your content is trapped. You might have an API, but you don't have the files. With this extension, you have the actual Markdown files on your local machine and in your own Git history.### Why Git instead of a database?

Most documentation tools use databases. They store your content in tables and blobs. You can only access it through their interface or their API.

Git gives you things a database cannot:

- **Full history** - Every change is tracked. You can see who changed what, and when.
- **Instant rollback** - Made a mistake? Revert to any previous version with one command.
- **No new tools to learn** - If you already use Git for code, you already know how to use it for documentation.
- **Offline access** - Your files are on your hard drive. You do not need an internet connection to write or edit.
- **Standard diffing** - See exactly what changed between two versions, line by line.

A database hides the complexity. Git gives you power and control.

### Benefits of absolute ownership

Because your content lives in Git repos you control:

- **No subscription fees** - The extension is free. Git hosting (GitHub, GitLab, Bitbucket) has free tiers. You can also host your own Git server.
- **No vendor lock-in** - Uninstall the extension tomorrow. Your files are still there. They are just Markdown.
- **Use your existing workflow** - Pull requests, code reviews, branch policies, CI/CD pipelines - all work the same for documentation as they do for code.
- **Your team already knows Git** - No training on a proprietary CMS. No new permissions model to learn.
- **Backups are already handled** - If you already back up your Git repos, you already back up your documentation.

You own your content completely. The extension is just a tool for editing it.

### Summary

- **Absolute ownership** - Your content lives in Git repos you control
- **No subscription** - The extension is free. Hosting is your choice
- **No lock-in** - Uninstall anytime. Your files remain
- **Git benefits** - History, rollback, diffing, offline access, no new tools
- **Existing workflows** - Pull requests, code reviews, CI/CD all work

The extension does not hold your content hostage. It simply helps you write and organise it.

## What does "publish to Markdown" mean?

When you finish building your maps, the extension assembles them into standard Markdown files.

These are not proprietary files. They are plain `.md` files that any text editor can open. VS Code, Notepad, Obsidian, Typora, even a basic text editor - they all work.

The Markdown files are what you publish to your hosting (GitHub Pages, your own server, or any static hosting). Your readers never see the maps. They see clean, readable documentation.

### No lock-in

Most documentation tools store your content in their own format or database. If you stop paying or want to leave, exporting your content is painful - if they let you export at all.

This extension works differently.

The maps you build are stored as JSON files. But the *output* - the final documentation - is Markdown. If you uninstall the extension tomorrow, you lose the ability to edit the maps. But you keep the published Markdown files.

You can continue editing those Markdown files with any editor. You lose the branching and routing features, but your documentation is not trapped.

### Benefits of publishing to Markdown

Because the final output is standard Markdown:

- **No vendor lock-in** - Uninstall the extension. Your published docs are still yours.
- **Edit anywhere** - Any Markdown editor works. No special software required.
- **Host anywhere** - Markdown files can be served from any web server, static hosting, or even a shared drive.
- **Readers never need the extension** - They just see normal documentation. No plugins, no special viewers.
- **Future-proof** - Markdown has been around for decades. It will still be readable in twenty years.

You can think of the extension as a power tool for *building* documentation. The output is standard. You are not locked into the tool.

### Summary

- **Publish to Markdown** - The final output is standard `.md` files
- **No lock-in** - Uninstall the extension. Your docs remain
- **Edit anywhere** - Any Markdown editor works
- **Host anywhere** - GitHub Pages, your own server, or any static hosting
- **Readers need nothing** - They just see normal documentation

The extension is a tool, not a prison. Use it while it helps you. Leave it if you need to. Your documentation stays yours.

## What are remote guides?

A remote guide is a guide published by a third party.

You do not host it. You do not maintain it. You simply link to it from your own map.

When your reader reaches that step, they are handed to the third party's guide. They follow its steps, then return to your map when finished.

### Why use remote guides?

Without remote guides, you have two bad options:

- **Copy their content into your guide** - You duplicate everything. When they update, you must find every copy and update it too. You will miss spots.
- **Write your own version of their content** - You reinvent the wheel. You spend time on things you are not an expert in. You get it wrong.

With remote guides, you do neither. You link to their guide. They host and maintain it. You move on.

### Benefits of third party guides

Because you can link to guides maintained by others:

- **You save work** - Write once. Link to experts. Never duplicate their content.
- **Experts keep it up to date** - When a vendor updates their guide, your map automatically uses the new version. You change nothing.
- **You stay in your lane** - Focus on what your team knows best. For everything else, link to someone who knows it better.
- **Build an ecosystem** - Different teams across your organisation can publish their own guides and use each other's. A hardware team maintains the hardware guide. A software team maintains the software guide. A production line guide links to both.
- **Suppliers participate** - A component vendor can host their own troubleshooting guide. You link to it. They update it when they change their product.

The extension does not care where a guide lives. It only cares that it exists and follows the same map format.

### How it works

Under the hood, a remote guide is just a map published to a URL.

When you route to a remote guide, the extension fetches it from that URL at publish time. The remote content is assembled into your final documentation alongside your local content.

If the remote guide itself links to other remote guides, those are fetched too. The whole tree resolves automatically.

Your reader never knows which parts came from you and which came from a vendor. It all appears as one seamless guide.

## Summary

- **Third party guides** - Maps published and maintained by others
- **Link, don't copy** - You reference their guide instead of duplicating their content
- **Automatic updates** - When they change their guide, your guide gets the new version
- **Experts stay in charge** - Vendors, suppliers, or specialist teams maintain what they know best
- **Ecosystem thinking** - Build distributed documentation systems across teams and organisations

The result is less work for you, better accuracy for your readers, and a system that scales across your whole organisation.

## What you have learned

This tutorial introduced five core concepts that work together:

- **Routing** - One map calls another and returns. Control flows cleanly.
- **Nesting** - Maps inside maps. Complexity hides inside smaller pieces.
- **Absolute ownership** - Your Git repos. Your control. No subscription.
- **Publish to Markdown** - Standard files. Uninstall anytime. No lock-in.
- **Third party guides** - Experts maintain their own content. You just link.

Each concept solves a specific problem. Together, they form a complete system.

## How they fit together

Here is how the pieces work as a whole:

You write maps in VS Code. The maps live in Git repos you control (absolute ownership). You can nest maps inside other maps to keep things organised (nesting).

When a decision point is reached, one map can route to another map and return (routing). That routed map might be hosted by a vendor or another team (third party guides).

When you are ready to publish, the extension assembles everything into standard Markdown files (publish to Markdown). You host those files anywhere. Your readers see clean documentation.

If you uninstall the extension tomorrow, the published Markdown files remain. You lose the ability to edit the maps, but your documentation is not trapped.

### What this enables

This combination of features lets you build documentation that traditional tools cannot:

- **Massive scale** - Hundreds or thousands of steps, still organised
- **No duplication** - Write something once. Use it everywhere.
- **Team ownership** - Different teams own different maps. No merge conflicts on documentation.
- **Supplier integration** - Link to vendor guides. They update them. You do nothing.
- **Future safety** - No lock-in. Your published docs are standard Markdown.

You are not building a document. You are building a system.

### Next steps

You have completed the tutorial. Here is what to do next:

1. **Install the extension** - Search for "Documentation Assembler" in the VS Code marketplace.
2. **Clone the demo repository** - The demo you saw in this tutorial is available on GitHub.
3. **Open a map** - Look at how the routing, nesting, and remote guides are structured.
4. **Make a small change** - Add a node. Change some text. See how it works.
5. **Build your own map** - Start small. A single map with three options. Then add routing. Then nest a map inside another.

All files are plain JSON and Markdown. You cannot break anything permanently. Git has your history.


