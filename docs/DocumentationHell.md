---
layout: simple
title: null
isGuide: true
mapFolderPath: tsmaps/%CE%9E%20DocumentationHell
fragsFolderPath: DocumentationHell_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"smgeTb1ti","path":"","fragmentFolderPath":"DocumentationHell_frags"},"fragment":{"id":"smgeTb1ti","topLevelMapKey":"sIhxfx02EB","mapKeyChain":"sIhxfx02EB","guideID":"smgeTb2GE","guidePath":"c:/GitHub/MuddySpud/MuddySpud.github.io/tsmaps/DocumentationHell.tsmap","chartKey":"sIhxfx02EB","isLeaf":false,"options":[{"id":"smgeUs2XX","option":"Start the Lǜ Sēnlín Vertical Kitchen Garden Planner","order":1}]}} -->

*This is an experimental port from a c# server/database application - to a GitHub repo/vscode extension. A concept driven by transformational conversations with a robotics firm - [HAL Robotics](https://hal-robotics.com).*

This website is running on GitHub Pages, the repo is here: [Docs Assembler Demo repo](https://github.com/CompositeFlows/DocsAssemblerDemo)

# Tame Documentation Hell: Treat Your Docs Like Code

If you’re a developer, you know the pain of "documentation hell." It’s not just about writing docs—it’s about maintaining them. You’re likely all too familiar with the symptoms:

*   **Sprawling, duplicated content** that multiplies across guides, manuals, and wikis, making it impossible to know what’s accurate.
*   **Bug-prone updates:** You make a critical edit in one place, only to miss that same information duplicated in ten other files, instantly introducing inconsistencies.
*   **Brittle, unmanageable docs** that collapse under their own weight when you try to document complex, branching real-world scenarios.
*   **Wasting precious time** wrestling with static site generators and build scripts instead of writing code and building features.

What if you could solve this by applying the proven principles of software engineering directly to your documentation?

That’s the core idea behind **Docs Assembler**, a VS Code extension designed to help you build documentation systems with **modular, reusable components**. Think of it as **React for tech docs** or bringing **class-based inheritance** to your content. It allows you to finally create a system where your documentation is as maintainable and scalable as your codebase.

## Designed for Developers, by Developers

The design of Docs Assembler was driven by a fundamental need from teams like [HAL Robotics](https://hal-robotics.com): to have a powerful system that *respects developer workflows and sovereignty*. This isn't just a tool; it's a philosophy built on core principles that will feel immediately right:

*   **Familiarity & Control:** The entire system is built on the tools you already know and trust. Your documentation lives in **Git repos**, right alongside your code. Content is written in **Markdown files**, editable in any editor. Structure is defined in **JSON files** you can view and edit manually. There’s no new ecosystem to learn.
*   **Absolute Ownership:** You have **physical possession of your documentation**. It's your Markdown and JSON in your repo. You are never locked into a subscription or held ransom by a SaaS platform.
*   **Zero Lock-In:** This is a critical feature. **There are no consequences if you stop using Docs Assembler.** Since it publishes standard Markdown, you can uninstall the extension and your documentation is still perfectly usable, editable, and ready for any other static site generator. Your content is always yours.
*   **Seamless Publishing:** It’s designed to publish directly to **GitHub Pages**, a platform every developer already understands. Even Liquid scripts embedded in your Markdown work as expected.
*   **Built to Scale:** Like classes break down massive software systems, Docs Assembler's modules are designed to decompose enormous documentation sets into manageable, distributable units that different teams can own.
*   **Engineering Rigor:** It brings true software tooling to docs, with **IntelliSense for variables, full validation before publish, and automatic adjustment of relative URLs** when moving files, preventing broken links and ensuring robustness.

## How It Works: The Building Blocks

Docs Assembler introduces key concepts that leverage this philosophy:

*   **Maps (.tsmap files):** These are the core building blocks—self-contained documentation modules (JSON files) that can be nested and composed, just like classes. Each Map can encapsulate anything from a simple procedure to an entire troubleshooting tutorial.
*   **Variables:** Define reusable text snippets for product names, error messages, or URLs. Change the variable in one place, and that change propagates everywhere it’s referenced, eliminating an entire class of errors.
*   **Inheritance & Composition:** Build sophisticated guides from simple, reusable blocks. A change to a base “Map” automatically propagates to all guides that use it.
*   **Compile to Docs:** The system assembles these components on-the-fly into clean, standard Markdown, ready for GitHub Pages. The result? You **maintain a single source of truth for your documentation**, not a dozen fractured copies.

## What is the ultimate aim?

**This is more than just better documentation. Docs Assembler is a Decision Intelligence Platform. It’s about creating a structured, actionable source of truth for complex operations.**

Consider managing emergencies at an oil refinery. The variables are endless: fires, explosions, earthquakes, power loss, IT failures, medical emergencies. The number of internal teams—incident commanders, operators, maintenance, security, medical, PR, IT, legal, HR—is large, and each needs tailored, timely steps. External stakeholders like emergency services and media introduce more jurisdiction-specific requirements. Add in site variability like equipment locations and local laws, and the complexity is staggering.

**Now imagine capturing all of that in a single, maintainable system.** Each team builds and maintains their own domain-specific maps. The result is a unified, validated, and always up-to-date source of truth that can guide a entire organization through a crisis.

This structured knowledge base is also the perfect foundation for the future. On top of it, you could have a guide front-end (as shown in the HAL example) or a powerful **conversational interface powered by a Graph-Augmented LLM**—an AI that can answer complex questions and generate precise guidance because it’s grounded in your company’s specific knowledge, not just general information.

**This is the destination: turning trapped expertise into a dynamic, accurate, and actionable intelligent asset.**

## This Website is *One* Guide

This website is not just talking about Docs Assembler — it is a live demonstration of it. Every page, every word you're reading has been dynamically assembled from a complex structure of interconnected maps. It demonstrates that you can create and maintain an expansive documentation system with a similar ease to how you maintain your codebase.

To see the mechanics: Look at the section above 'What is the ultimate aim?' It is a single step in the opening map. Click the ancillary button at the end of that section: 'show the step' to see a screenshot of that exact step open in VS Code and drill into the features behind it. An ancillary is Docs Assembler's way of letting you expand information on-demand, without cluttering the main path for those who don't need it.

This is the proof. This is what treating docs like code looks like.

### See It in Action: A Complex Product Demo

This is where the theory becomes practice. To truly showcase the power of treating docs like code, we've built a demo guide for Lǜ Sēnlín Technologies, a fictitious innovator in modular food production systems.

Dive into the interactive guide to configure a Vertical Kitchen Garden — choosing frame size, modules, crops, and power options like the SolisCell™ battery and HotCarrier™ solar panels.

Every possible configuration path is built from Docs Assembler's reusable maps and variables. This demo illustrates how you can maintain a complex, decision-tree-style interface without the exponential complexity, making updates effortless and consistent across all documentation.

