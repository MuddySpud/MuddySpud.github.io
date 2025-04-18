---
title: null
mapFolderPath: tsmaps/HAL/Grasshopper/%CE%9E%204-IO
fragsFolderPath: HAL/Grasshopper/4-IO_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLBcS1Dq","path":"HAL/Grasshopper","fragmentFolderPath":"HAL/Grasshopper/4-IO_frags"},"fragment":{"id":"fdLBcS1Dq","topLevelMapKey":"cQSuwS01HV","mapKeyChain":"cQSuwS01HV","guideID":"fdLBcS01L","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/Grasshopper/4-IO.tsmap","parentFragmentID":null,"chartKey":"cQSuwS01HV","options":[]}} -->

## 4. IO

[4.1. Create a Signal](#41-create-a-signal)  
[4.2. Change a Signal State](#42-change-a-signal-state)  

---
### 4.1. Create a Signal

#### Objective:

In this tutorial we'll create a [Signal](/HAL/Overview/Glossary#signal) that can be programmed in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Create a Signal.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/4.1%20-%20Create%20a%20Signal.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

Electrical Input and Output (I/O) [Signals](/HAL/Overview/Glossary#signal) are used to activate or deactivate [Tools](/HAL/Overview/Glossary#end-effector), trigger actions on remote machines or pass data between **Sensors**.

#### How to:

We can start creating a [Signal](/HAL/Overview/Glossary#signal) by navigating to the **HAL Robotics** tab, **Cell** panel and selecting **Create Signal**. The templates of this component change between digital and analogue [Signals](/HAL/Overview/Glossary#signal), whilst the overloads switch between inputs or outputs. The only compulsory input on the component is the _Alias_ which should exactly match the value assigned in your real [Controller](/HAL/Overview/Glossary#controller). If your [Controller](/HAL/Overview/Glossary#controller) handles aliases then that could be something like `DO_01` but if your controller only handle indices then this _Alias_ could simply be `2`. You can also change the _High_ and _Low_ voltage states of your [Signal](/HAL/Overview/Glossary#signal) if you so wish or need. Once the [Signal](/HAL/Overview/Glossary#signal) has been created, we can assign it to our [Controller](/HAL/Overview/Glossary#controller) by dragging the [Signal](/HAL/Overview/Glossary#signal) output to the **Controller's** _Signal_ input.

---
### 4.2. Change a Signal State

#### Objective:

In this tutorial we'll change the state of a [Signal](/HAL/Overview/Glossary#signal) at runtime in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Change a Signal State.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/4.2%20-%20Change%20a%20Signal%20State.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.
- Reading or watching the [Create a Signal](/HAL/Grasshopper/4-IO#41-create-a-signal) tutorial is highly recommended and this tutorial builds on its output.

#### Background:

Electrical Input and Output (I/O) [Signals](/HAL/Overview/Glossary#signal) are used to activate or deactivate [Tools](/HAL/Overview/Glossary#end-effector), trigger actions on remote machines or pass data between **Sensors**. The activation of these [Signals](/HAL/Overview/Glossary#signal) needs to be triggered at the right time during program execution, something we can do easily with [Signal Actions](/HAL/Overview/Glossary#signal-action).

#### How to:

In our previous tutorial, we created a digital output [Signal](/HAL/Overview/Glossary#signal), assigned it an appropriate _Alias_ and hooked it up to a [Controller](/HAL/Overview/Glossary#controller). We now want to change the state of that [Signal](/HAL/Overview/Glossary#signal) during the execution of a [Procedure](/HAL/Overview/Glossary#procedure). To do so we're going to get the **Change Signal State** component from the **HAL Robotics** tab, **Procedure** panel. Just like the **Create Signal** component we can change between digital and analogue with component templates and swap between input or output by changing overloads. We can assign our previously created [Signal](/HAL/Overview/Glossary#signal) to the component's _Signal_ input and choose what effect we want to have on the [Signal](/HAL/Overview/Glossary#signal) by right-clicking on the _Effect_ input. In this scenario we're going to `Set` the state. As we're setting the state, we need to pass in a _State_ which, for a digital signal, is a Boolean value where `true` is equivalent to High and `false` is equivalent to Low. The output of this component is an [Action](/HAL/Overview/Glossary#action) which can be merged into any other sequence of [Actions](/HAL/Overview/Glossary#action) you may have. Once that's merged, we can see in the **Procedure Browser** that we have some [Motion](/HAL/Overview/Glossary#motion-action), our `Set DO_01 to high` [Action](/HAL/Overview/Glossary#action) and then some more [Motion](/HAL/Overview/Glossary#motion-action) to finish off the [Procedure](/HAL/Overview/Glossary#procedure).

---

[Continue to: 5. Advanced Programming](/HAL/Grasshopper/5-Advanced-Programming#5-advanced-programming)
