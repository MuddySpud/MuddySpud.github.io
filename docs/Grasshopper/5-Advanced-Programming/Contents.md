## 5. Advanced Programming

[5.1. Wait for a Time](#51-wait-for-a-time)

[5.2. Wait for Synchronization](#52-wait-for-synchronization)

[5.3. Create a Loop \[Coming Soon\]](#53-create-a-loop)

[5.4. Create a Condition \[Coming Soon\]](#54-create-a-condition)

[5.5. Custom Actions](#55-custom-actions)

---
### 5.1. Wait for a Time

#### Objective:

In this tutorial we'll create a [Wait Action](../../Overview/Glossary.md#wait-action) that pauses [Robot](../../Overview/Glossary.md#manipulator) execution for a fixed period of time using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Wait for a Time.gh](../ExampleFiles/Tutorials/5.1%20-%20Wait%20for%20a%20Time.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

In certain scenarios it may be necessary to have your [Robot](../../Overview/Glossary.md#manipulator) [Wait](../../Overview/Glossary.md#wait-action) in its current position. This could be because it's taking a measurement, a [Tool](../../Overview/Glossary.md#end-effector) is working or simply because something else is happening in the environment. If the time to [Wait](../../Overview/Glossary.md#wait-action) is a constant, such as the time required for a gripper to open, then a **Wait Time** [Action](../../Overview/Glossary.md#action) is a good solution.

#### How to:

We can create a [Wait Action](../../Overview/Glossary.md#wait-action) from the **HAL Robotics** tab, **Procedure** panel. The only thing required is the _Duration_. We can assign a time, say 2 seconds, and remember, if it's more natural to work in some other unit, the time unit can be changed by right-clicking on the _Duration_ input. The output of this component is an [Action](../../Overview/Glossary.md#action) which can be merged into any other sequence of [Actions](../../Overview/Glossary.md#action) you may have. Once that's merged, we can see in the **Procedure Browser** that we our [Wait Action](../../Overview/Glossary.md#wait-action) is listed and when we **Simulate** the [Robot](../../Overview/Glossary.md#manipulator) pauses for 2 seconds.

---
### 5.2. Wait for Synchronization

#### Objective:

In this tutorial we'll create a [Wait Action](../../Overview/Glossary.md#wait-action) that pauses [Robot](../../Overview/Glossary.md#manipulator) execution to synchronize multiple machines using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Wait for Synchronization.gh](../ExampleFiles/Tutorials/5.2%20-%20Wait%20for%20Synchronization.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

In certain scenarios it may be necessary to have your [Robot](../../Overview/Glossary.md#manipulator) [Wait](../../Overview/Glossary.md#wait-action) in its current position. This could be because it's taking a measurement, a [Tool](../../Overview/Glossary.md#end-effector) is working or simply because something else is happening in the environment. If the [Wait](../../Overview/Glossary.md#wait-action) duration is conditional on another [Robot](../../Overview/Glossary.md#manipulator) reaching a particular point in its [Procedure](../../Overview/Glossary.md#procedure) then a **Wait Sync** [Action](../../Overview/Glossary.md#action) is a good solution.

#### How to:

We can create a [Wait](../../Overview/Glossary.md#wait-action) [Action](../../Overview/Glossary.md#action) from the **HAL Robotics** tab, **Procedure** panel and switch to the **Wait Sync** overload. The only thing required here are our **Sync Settings**. We can create **Sync Settings** from the **Motion** panel. It's important to give our **Sync Settings** an identifiable name. The output of this component is an [Action](../../Overview/Glossary.md#action) which can be merged into any other sequence of [Actions](../../Overview/Glossary.md#action) you may have but given that this is a synchronization [Action](../../Overview/Glossary.md#action) it only really makes sense if it's used in more than one [Procedure](../../Overview/Glossary.md#procedure). I have prepared a very simple demo here with two [Robots](../../Overview/Glossary.md#manipulator) performing a single [Move Action](../../Overview/Glossary.md#motion-action) each. I'm going to copy and paste my [Wait](../../Overview/Glossary.md#wait-action) to ensure that the same **Sync Settings** is used for both [Wait Actions](../../Overview/Glossary.md#wait-action) and use [Wait](../../Overview/Glossary.md#wait-action) before [Move](../../Overview/Glossary.md#motion-action) in one case and after in the other. Once that's merged and **Solved**, we can see that the first [Robot](../../Overview/Glossary.md#manipulator) moves, the other waits until both synchronized [Waits](../../Overview/Glossary.md#wait-action) are executed and then the second [Robot](../../Overview/Glossary.md#manipulator) follows. This is a simple way to organize multiple [Robots](../../Overview/Glossary.md#manipulator) without synchronizing their [Motion](../../Overview/Glossary.md#motion-action).

---
### 5.3. Create a Loop
#### Coming Soon

---
### 5.4. Create a Condition
#### Coming Soon

---
### 5.5. Custom Actions

#### Objective:

In this tutorial we'll use a [Custom Action](../../Overview/Glossary.md#custom-action) to trigger an existing [Robot](../../Overview/Glossary.md#manipulator) function using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Custom Action.gh](../ExampleFiles/Tutorials/5.5%20-%20Custom%20Action.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

When working with a fully integrated [Cell](../../Overview/Glossary.md#cell) or using a [Robot](../../Overview/Glossary.md#manipulator) with pre-built functionality which isn't natively supported by the HAL Robotics Framework, you may want add code to your export which calls an existing function in the [Controller](../../Overview/Glossary.md#controller). We do this using [Custom Actions](../../Overview/Glossary.md#custom-action). Common for [Custom Actions](../../Overview/Glossary.md#custom-action) are opening or closing a gripper, running tool change procedures, starting logging, activating collision boxes, popping up messages to the operator etc.

#### How to:

We can create a [Custom Action](../../Overview/Glossary.md#custom-action) from the **HAL Robotics** tab, **Procedure** panel. The only thing required here is our _Code_. This should just be the textual representation of the code that you want to export. For example if you wanted to create a pop-up message on an ABB robot you could write _TPWrite "Hello Robot";_ and that exact line of code will be exported within your program.

Other than the _Alias_, which we recommend always setting, the other input is _Simulation_. This takes in a [Procedure](../../Overview/Glossary.md#procedure) which will change how this [Action](../../Overview/Glossary.md#action) is simulated but won't affect how it's [Exported](../../Overview/Glossary.md#export). If you know it's going to take a second for your gripper to close, for example, you could put a [Wait](../../Overview/Glossary.md#wait-action) [Action](../../Overview/Glossary.md#action) in your _Simulation_ and the program will pause when simulated but the code won't contain any [Wait](../../Overview/Glossary.md#wait-action) instructions.

---

[Continue to: 6. Control](../6-Control/Contents.md#6-control)