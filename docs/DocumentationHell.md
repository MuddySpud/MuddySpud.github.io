---
title: null
isGuide: true
mapFolderPath: tsmaps/%CE%9E%20DocumentationHell
fragsFolderPath: DocumentationHell_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"sz9d7M1im","path":"","fragmentFolderPath":"DocumentationHell_frags"},"fragment":{"id":"sz9d7M1im","topLevelMapKey":"sIhxfx02EB","mapKeyChain":"sIhxfx02EB","guideID":"sz9d7M1W2","guidePath":"c:/GitHub/MuddySpud/MuddySpud.github.io/tsmaps/DocumentationHell.tsmap","chartKey":"sIhxfx02EB","isLeaf":false,"options":[{"id":"sz9d8h2K4","order":1},{"id":"sz9d9n0dy","option":"show this step...","order":2,"isAncillary":true}]}} -->

*This is an experimental port from a C# server/database application — to a GitHub repo/VS Code extension. A concept driven by transformational conversations with a robotics firm — [HAL Robotics](https://hal-robotics.com).*

*This site is built with [Docs Assembler](https://marketplace.visualstudio.com/items?itemName=netoftrees.documentation-assembler) and hosted on [GitHub Pages](https://docs.github.com/en/pages). You can view the source code and documentation structure in the [Docs Assembler Demo repo](https://github.com/CompositeFlows/DocsAssemblerDemo).*

# Tame Documentation Hell: Treat Your Docs Like Code

#### The Universal Problem: Trapped Expertise

Imagine you need to print a document from your laptop, but it doesn't work. The issue could lie with the laptop, the printer, or the Wi-Fi connection.

Without a technical expert on hand to guide you, it is nearly impossible to determine the necessary steps to diagnose the fault, identify its cause, and implement a fix easily. If you have some IT knowledge, you might try searching online. However, a great deal of the advice you find is irrelevant to your specific situation, leaving you to experiment for hours — a frustrating process. 

If you have no IT experience, you have no chance at all.

Now, scale this problem up to a company that builds complicated medical machines. How do they capture an engineer's diagnostic process to train others? They can't use **decision trees**, as they explode into millions of unmanageable steps for complex systems — 95% of them duplicates. Consequently, they are forced to rely on static, 'flat' manuals. **The true, complex decision-making process is never documented; it remains informal tribal knowledge,** creating a single point of failure for the entire organisation.

The result is the same: organisations are fragile. They depend on a few experts, spend a fortune on training, and are one retirement away from a crisis. This is **documentation hell** — where critical knowledge is unrecorded, or scattered, and is impossibly difficult to use when it is needed most.

While the scale might change, the core problem remains the same for developers. It’s not just about writing docs — it’s about maintaining them. You’re likely all too familiar with the symptoms:

*   **Sprawling, duplicated content** that multiplies across guides, manuals, and wikis, making it impossible to know what’s accurate.
*   **Bug-prone updates:** You make a critical edit in one place, only to miss that same information duplicated in other files, instantly introducing inconsistencies.
*   **Brittle, unmanageable docs** that collapse under their own weight when you try to document complex, branching real-world scenarios.
*   **Wasting precious time** wrestling with static site generators and build scripts instead of writing code and building features.

What if you could solve this by applying the proven principles of software engineering directly to your documentation?

That’s the core idea behind [Docs Assembler](https://marketplace.visualstudio.com/items?itemName=netoftrees.documentation-assembler), a VS Code extension designed to help you build documentation systems with **modular, reusable components**. Think of it as bringing **class-based inheritance** to your content. It allows you to finally create a system where your documentation is as maintainable and scalable as your codebase.

## Designed for Developers, by Developers

The design of [Docs Assembler](https://marketplace.visualstudio.com/items?itemName=netoftrees.documentation-assembler) was driven by a fundamental need from teams like [HAL Robotics](https://hal-robotics.com): to have a powerful system that *respects developer workflows and sovereignty*. This isn't just a tool; it's a philosophy built on core principles that will feel immediately right:

*   **Familiarity & Control:** The entire system is built on the tools you already know and trust. Your documentation lives in **Git repos**, right alongside your code. Content is written in **Markdown files**, editable in any editor. Structure is defined in **JSON files** you can view and edit manually. There’s no new ecosystem to learn.
*   **Absolute Ownership:** You have **physical possession of your documentation**. It's your Markdown and JSON in your repo. You are never locked into a subscription or held ransom by a SaaS platform.
*   **Zero Lock-In:** This is a critical feature. **There are no consequences if you stop using Docs Assembler.** Since it publishes to standard Markdown, you can uninstall the extension and your documentation is still perfectly usable, editable, and ready for any other static site generator. Your content is always yours.
*   **Seamless Publishing:** It’s designed to publish directly to **GitHub Pages**, a platform developers already understand. Even Liquid scripts embedded in your Markdown work as expected.
*   **Built to Scale:** Like classes break down massive software systems, Docs Assembler's modules are designed to decompose enormous documentation sets into manageable, distributable units that different teams can own.
*   **Engineering Rigour:** It brings true software tooling to docs, with **IntelliSense for variables, full validation before publish, and automatic adjustment of relative URLs**, preventing broken links and ensuring robustness.

## How It Works: The Building Blocks

[Docs Assembler](https://marketplace.visualstudio.com/items?itemName=netoftrees.documentation-assembler) introduces key concepts that leverage this philosophy:

*   **Maps (.tsmap files):** These are the core building blocks — self-contained documentation modules (JSON files) that can be nested and composed, just like classes. Each Map can encapsulate anything from a simple procedure to an entire troubleshooting tutorial.
*   **Variables:** Define reusable text snippets for product names, error messages, or URLs. Change the variable in one place, and that change propagates everywhere it’s referenced, eliminating an entire class of errors.
*   **Inheritance & Composition:** Build sophisticated guides from simple, reusable blocks. A change to a base “Map” automatically propagates to all guides that use it.
*   **Compile to Docs:** The system assembles these components on-the-fly into clean, standard Markdown (a process akin to compiling code), ready for GitHub Pages. The result? You **maintain a single source of truth for your documentation**, not a dozen fractured copies.

## What is the ultimate aim?

**This is more than just better documentation. [Docs Assembler](https://marketplace.visualstudio.com/items?itemName=netoftrees.documentation-assembler) is a Decision Intelligence Platform. It’s about creating a structured, actionable authoritative frame of reference for complex operations.**

Consider managing emergencies at an oil refinery. The variables are endless: fires, explosions, earthquakes, power loss, IT failures, medical emergencies. The number of internal teams — incident commanders, operators, maintenance, security, medical, PR, IT, legal, HR — is large, and each needs tailored, timely steps. External stakeholders like emergency services and media introduce more jurisdiction-specific requirements. Add in site variability like equipment locations and local laws, and the complexity is staggering.

**Now imagine capturing all of that in a single, maintainable system.** Each team builds and maintains their own domain-specific maps. The result is a unified, validated, and always up-to-date source of truth that can guide an entire organisation through a crisis.

This structured knowledge base is also the perfect foundation for the future. On top of it, you could have a guide front-end (as shown in the HAL example) or a powerful **conversational interface powered by a Graph-Augmented LLM** — an AI that can answer complex questions and generate precise guidance because it’s grounded in your company’s specific knowledge, not just general information.

**This is the destination: turning trapped expertise into a dynamic, accurate, and actionable intelligent asset.**

