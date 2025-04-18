---
title: null
mapFolderPath: tsmaps/HAL/Grasshopper/%CE%9E%205-AdvancedProgramming
fragsFolderPath: HAL/Grasshopper/5-Advanced-Programming_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLC2K0fa","path":"HAL/Grasshopper","fragmentFolderPath":"HAL/Grasshopper/5-Advanced-Programming_frags"},"fragment":{"id":"fdLC2K0fa","topLevelMapKey":"eGVQIT27G","mapKeyChain":"eGVQIT27G","guideID":"fdLC2K2av","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/Grasshopper/5-AdvancedProgramming.tsmap","parentFragmentID":null,"chartKey":"eGVQIT27G","options":[]}} -->

## 5. Advanced Programming

[5.1. Wait for a Time](#51-wait-for-a-time)  
[5.2. Wait for Synchronization](#52-wait-for-synchronization)  
[5.3. Create a Loop \[Coming Soon\]](#53-create-a-loop)  
[5.4. Create a Condition \[Coming Soon\]](#54-create-a-condition)  
[5.5. Custom Actions](#55-custom-actions)  

---
### 5.1. Wait for a Time

#### Objective:

In this tutorial we'll create a [Wait Action](/HAL/Overview/Glossary#wait-action) that pauses [Robot](/HAL/Overview/Glossary#manipulator) execution for a fixed period of time using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Wait for a Time.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/5.1%20-%20Wait%20for%20a%20Time.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

In certain scenarios it may be necessary to have your [Robot](/HAL/Overview/Glossary#manipulator) [Wait](/HAL/Overview/Glossary#wait-action) in its current position. This could be because it's taking a measurement, a [Tool](/HAL/Overview/Glossary#end-effector) is working or simply because something else is happening in the environment. If the time to [Wait](/HAL/Overview/Glossary#wait-action) is a constant, such as the time required for a gripper to open, then a **Wait Time** [Action](/HAL/Overview/Glossary#action) is a good solution.

#### How to:

We can create a [Wait Action](/HAL/Overview/Glossary#wait-action) from the **HAL Robotics** tab, **Procedure** panel. The only thing required is the _Duration_. We can assign a time, say 2 seconds, and remember, if it's more natural to work in some other unit, the time unit can be changed by right-clicking on the _Duration_ input. The output of this component is an [Action](/HAL/Overview/Glossary#action) which can be merged into any other sequence of [Actions](/HAL/Overview/Glossary#action) you may have. Once that's merged, we can see in the **Procedure Browser** that we our [Wait Action](/HAL/Overview/Glossary#wait-action) is listed and when we **Simulate** the [Robot](/HAL/Overview/Glossary#manipulator) pauses for 2 seconds.

---
### 5.2. Wait for Synchronization

#### Objective:

In this tutorial we'll create a [Wait Action](/HAL/Overview/Glossary#wait-action) that pauses [Robot](/HAL/Overview/Glossary#manipulator) execution to synchronize multiple machines using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Wait for Synchronization.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/5.2%20-%20Wait%20for%20Synchronization.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

In certain scenarios it may be necessary to have your [Robot](/HAL/Overview/Glossary#manipulator) [Wait](/HAL/Overview/Glossary#wait-action) in its current position. This could be because it's taking a measurement, a [Tool](/HAL/Overview/Glossary#end-effector) is working or simply because something else is happening in the environment. If the [Wait](/HAL/Overview/Glossary#wait-action) duration is conditional on another [Robot](/HAL/Overview/Glossary#manipulator) reaching a particular point in its [Procedure](/HAL/Overview/Glossary#procedure) then a **Wait Sync** [Action](/HAL/Overview/Glossary#action) is a good solution.

#### How to:

We can create a [Wait](/HAL/Overview/Glossary#wait-action) [Action](/HAL/Overview/Glossary#action) from the **HAL Robotics** tab, **Procedure** panel and switch to the **Wait Sync** overload. The only thing required here are our **Sync Settings**. We can create **Sync Settings** from the **Motion** panel. It's important to give our **Sync Settings** an identifiable name. The output of this component is an [Action](/HAL/Overview/Glossary#action) which can be merged into any other sequence of [Actions](/HAL/Overview/Glossary#action) you may have but given that this is a synchronization [Action](/HAL/Overview/Glossary#action) it only really makes sense if it's used in more than one [Procedure](/HAL/Overview/Glossary#procedure). I have prepared a very simple demo here with two [Robots](/HAL/Overview/Glossary#manipulator) performing a single [Move Action](/HAL/Overview/Glossary#motion-action) each. I'm going to copy and paste my [Wait](/HAL/Overview/Glossary#wait-action) to ensure that the same **Sync Settings** is used for both [Wait Actions](/HAL/Overview/Glossary#wait-action) and use [Wait](/HAL/Overview/Glossary#wait-action) before [Move](/HAL/Overview/Glossary#motion-action) in one case and after in the other. Once that's merged and **Solved**, we can see that the first [Robot](/HAL/Overview/Glossary#manipulator) moves, the other waits until both synchronized [Waits](/HAL/Overview/Glossary#wait-action) are executed and then the second [Robot](/HAL/Overview/Glossary#manipulator) follows. This is a simple way to organize multiple [Robots](/HAL/Overview/Glossary#manipulator) without synchronizing their [Motion](/HAL/Overview/Glossary#motion-action).

---
### 5.3. Create a Loop
#### Coming Soon

---
### 5.4. Create a Condition
#### Coming Soon

---
### 5.5. Custom Actions

#### Objective:

In this tutorial we'll use a [Custom Action](/HAL/Overview/Glossary#custom-action) to trigger an existing [Robot](/HAL/Overview/Glossary#manipulator) function using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Custom Action.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/5.5%20-%20Custom%20Action.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

When working with a fully integrated [Cell](/HAL/Overview/Glossary#cell) or using a [Robot](/HAL/Overview/Glossary#manipulator) with pre-built functionality which isn't natively supported by the HAL Robotics Framework, you may want add code to your export which calls an existing function in the [Controller](/HAL/Overview/Glossary#controller). We do this using [Custom Actions](/HAL/Overview/Glossary#custom-action). Common for [Custom Actions](/HAL/Overview/Glossary#custom-action) are opening or closing a gripper, running tool change procedures, starting logging, activating collision boxes, popping up messages to the operator etc.

#### How to:

We can create a [Custom Action](/HAL/Overview/Glossary#custom-action) from the **HAL Robotics** tab, **Procedure** panel. The only thing required here is our _Code_. This should just be the textual representation of the code that you want to export. For example if you wanted to create a pop-up message on an ABB robot you could write _TPWrite "Hello Robot";_ and that exact line of code will be exported within your program.

Other than the _Alias_, which we recommend always setting, the other input is _Simulation_. This takes in a [Procedure](/HAL/Overview/Glossary#procedure) which will change how this [Action](/HAL/Overview/Glossary#action) is simulated but won't affect how it's [Exported](/HAL/Overview/Glossary#export). If you know it's going to take a second for your gripper to close, for example, you could put a [Wait](/HAL/Overview/Glossary#wait-action) [Action](/HAL/Overview/Glossary#action) in your _Simulation_ and the program will pause when simulated but the code won't contain any [Wait](/HAL/Overview/Glossary#wait-action) instructions.

---

[Continue to: 6. Control](/HAL/Grasshopper/6-Control#6-control)