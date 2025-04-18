---
title: null
mapFolderPath: tsmaps/HAL/decode/%CE%9E%205-AdvancedProgramming-decode
fragsFolderPath: HAL/decode/5-Advanced-Programming_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLC9m2Xl","path":"HAL/decode","fragmentFolderPath":"HAL/decode/5-Advanced-Programming_frags"},"fragment":{"id":"fdLC9m2Xl","topLevelMapKey":"eGVQJR26Y","mapKeyChain":"eGVQJR26Y","guideID":"fdLC9m0IW","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/decode/5-AdvancedProgramming-decode.tsmap","parentFragmentID":null,"chartKey":"eGVQJR26Y","options":[]}} -->

## 5. Advanced Programming

[5.1. External Variables](#51-external-variables)  
[5.2. Procedures from Variables](#52-procedures-from-variables)  
[5.3. Geometry from Variables](#53-geometry-from-variables)  
[5.4. Reusing Controller Data](#54-resuing-controller-data)  

---
### 5.1. External Variables
#### Coming Soon

---
### 5.2. Procedures from Variables
#### Coming Soon

---
### 5.3. Geometry from Variables
#### Coming Soon

---
### 5.4. Reuse Controller Data

#### Objective:

In this tutorial we'll explore some advanced syntax which allows you to reference data and variables which are already declared on your [Controller](/HAL/Overview/Glossary#controller) or rename variables you [Export](/HAL/Overview/Glossary#export) using the HAL Robotics Framework.

#### Background:

When your [Robot](/HAL/Overview/Glossary#manipulator) and, more importantly, its [Controller](/HAL/Overview/Glossary#controller) were installed, it's possible that certain [Tools](/HAL/Overview/Glossary#end-effector) were calibrated and stored in the [Controller's](/HAL/Overview/Glossary#controller) system variables or that it would be helpful to name [Signals](/HAL/Overview/Glossary#signal) so they're immediately identifiable (e.g. _ToolOn_) but that they're named differently in your [Controller](/HAL/Overview/Glossary#controller) or even that your [Robot's](/HAL/Overview/Glossary#manipulator) language doesn't allow you to name [Signals](/HAL/Overview/Glossary#signal) at all. We have therefore given you the option of overriding the way elements are [Exported](/HAL/Overview/Glossary#export). These are generally useful for [Tools](/HAL/Overview/Glossary#end-effector), [References](/HAL/Overview/Glossary#reference) and [Signals](/HAL/Overview/Glossary#signal) but can be used for [Targets](/HAL/Overview/Glossary#target), [Motion Settings](/HAL/Overview/Glossary#motion-action) or any other declarable type.

#### How to:

These overrides are all done through the naming of objects, by using special syntax in their _Aliases_, activated or deactivated using the **Translation Overrides** _Step_. There are 3 scenarios we permit:
1. Forcing the declaration of the element, even in `Inline` mode, e.g. so you can make manual changes to the code later. 
2. Skipping the declaration of the element, e.g. because it's already in the [Controller's](/HAL/Overview/Glossary#controller) system variables and you want to use that data directly.
3. Renaming the element, e.g. the [Signal](/HAL/Overview/Glossary#signal) which you have called _ToolOn_ for legibility is actually called _DO-04_ or is index _3_ on the real [Controller](/HAL/Overview/Glossary#controller).
4. [Bonus] A combination of the above.

Overriding can be activated in the **Translation Overrides** _Step_ of compatible items by toggling **Override** on. You will then see a few options appear. **Mode** can be set between **Alias** and **Index**. The former will allow you to specify a new name for the item when it's exported. If the **Alias Override** is left blank, we will reuse the _Name_ specified in the object itself. In **Index** mode, we will try to [Export](/HAL/Overview/Glossary#export) the **Index** within an array in the native language e.g. `Tool[3]`. If **Skip Declaration** is activated, then we will _not_ [Export](/HAL/Overview/Glossary#export) any values for the item and assume that it is defined in your [Controller's](/HAL/Overview/Glossary#controller) system variables.

[<img src="/HAL/assets/images/decode/02-Network/Signals-AliasOverride.png">](/HAL/assets/images/decode/02-Network/Signals-AliasOverride.png){: .pad-top}
<em>Translation overrides give you extra control over how items are exported to your robot code.</em>{: .pad-bottom}

The syntax you will see is as follows:
1. Declare an override - Appends `@` to the _Alias_
2. Skip declaration - Appends `!` to the _Alias_
3. Renaming - Appends the new name to the _Alias_

Examples:

| Code                 | Description                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `MyTool`             | Regular tool declaration.                                                                     |
| `MyTool@`            | Forces the declaration of the tool.                                                           |
| `MyTool@toolData32`  | Forces the declaration of the tool, as a tool variable called toolData32.                     |
| `MyTool@!`           | No declaration – considers that a "MyTool" tool declaration already exists in the controller. |
| `MyTool@!toolData32` | No declaration – use the toolData32 tool variable from the controller.                        |

---