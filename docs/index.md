---
title: null
mapFolderPath: tsmaps/%CE%9E%20Introduction
fragsFolderPath: index_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLBtJ12r","path":"","fragmentFolderPath":"index_frags"},"fragment":{"id":"fdLBtJ12r","topLevelMapKey":"e9T3Wy02Xz","mapKeyChain":"e9T3Wy02Xz","guideID":"fdLBtJ03I","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/Introduction.tsmap","parentFragmentID":null,"chartKey":"e9T3Wy02Xz","options":[]}} -->

# Modular Documentation Demos

Docs Assembler, a VS Code extension, transforms documentation into modular "maps"—JSON-based trees that act as reusable, class-like component, letting experts encode interconnected problem-solving pathways without redundancy. Unlike traditional manuals limited to a single linear pathway, these maps mimic the brain’s networked thinking, where knowledge links dynamically across contexts (e.g., a screwdriver’s use applies to all screws, whether in furniture or machinery or electronics). Maps eliminate duplication by referencing shared solutions — like common repairs across lawnmower models — so experts maintain one source, not hundreds. Users start at the root, choosing options to generate precise, custom help articles, without sifting through irrelevant information.

Each step (node) in a map pulls content from a standalone markdown files This structure allows you to:

 - Edit documentation in your preferred markdown editor.
 - Reuse markdown across multiple steps or maps.
 - Use variables to inject dynamic content — supported by IntelliSense.

Maps bring object-oriented principles like encapsulation to documentation. How maps work:

 - Root step: Entry point.
 - Branches: Decision paths — comprised of steps (if/then, troubleshooting flows)
 - Solutions: Resolution endpoints.
 - Exits: Open paths requiring resolution in parent maps.

Maps and steps are interchangeable components. Substituting a step with a map incorporates all of its contents into that node. Any exits the map has beome options. When a map is published, it recursively expands all nested maps, verifies the output, and generates a guide in Jekyll Markdown format compatible with GitHub Pages. Why it matters:

For Authors:

 - Define clear pathways for documentation, and organise into reusable units.
 - Single-source updates propagate everywhere.
 - Complex workflows stay editable.

For Users:

Imagine a mechanic diagnosing a forklift's hydraulic pump: they don't need the full manual — just a precise, tailored guide generated from the map's logic. This linear path of steps becomes a custom article, shareable via URL. It cuts cognitive load and speeds up repairs.

Explorer demos to see maps and guides in action.

## Demos

## 1. Simple Guide

The simplest guide, with fixed steps presented as an article - like a manual, book, or essay.

Example: [Holly's Guide To Fix Red Dwarf Food Dispenser](/RedDwarf/RedDwarfFoodDispenserFix) 

Map: [RedDwarfFoodDispenserFix.tsmap](https://github.com/MuddyTurnip/MuddyTurnip.github.io/blob/main/tsmaps/RedDwarf/%CE%9E%20RedDwarfFoodDispenserFix)   
*To view the map clone the [repo](https://github.com/MuddyTurnip/MuddyTurnip.github.io) and install the [extension](https://marketplace.visualstudio.com/items?itemName=netoftrees.documentation-assembler).*

## 2. Simple Guide + Tools

Uses markdown, images, reusable steps, variables, and auto-adjusting links.

Example: [HAL Robotics decode 2-Cell](/HAL/decode/2-Cell)

Map: [2-Cell-decode.tsmap](https://github.com/MuddyTurnip/MuddyTurnip.github.io/blob/main/tsmaps/HAL/decode/%CE%9E%202-Cell-decode)   
*To view the map clone the [repo](https://github.com/MuddyTurnip/MuddyTurnip.github.io) and install the [extension](https://marketplace.visualstudio.com/items?itemName=netoftrees.documentation-assembler).*



## 3. Adaptive Guide

Adapts to your specific situation, generating a custom article with only the relevant steps.

Example: [DeLorean Time Machine Technical Manual](/BackToTheFuture/DeLorean-Time-Machine-Technical-Manual)

Map: [DeLoreanTimeMachineTechnicalManual.tsmap](https://github.com/MuddyTurnip/MuddyTurnip.github.io/blob/main/tsmaps/BackToTheFuture/%CE%9E%20DeLoreanTimeMachineTechnicalManual)   
*To view the map clone the [repo](https://github.com/MuddyTurnip/MuddyTurnip.github.io) and install the [extension](https://marketplace.visualstudio.com/items?itemName=netoftrees.documentation-assembler).*


## Guides within guides

Example: Coming soon...


