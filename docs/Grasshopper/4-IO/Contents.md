## 4. IO

[4.1. Create a Signal](#41-create-a-signal)

[4.2. Change a Signal State](#42-change-a-signal-state)

---
### 4.1. Create a Signal

#### Objective:

In this tutorial we'll create a [Signal](../../Overview/Glossary.md#signal) that can be programmed in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Create a Signal.gh](../ExampleFiles/Tutorials/4.1%20-%20Create%20a%20Signal.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

Electrical Input and Output (I/O) [Signals](../../Overview/Glossary.md#signal) are used to activate or deactivate [Tools](../../Overview/Glossary.md#end-effector), trigger actions on remote machines or pass data between **Sensors**.

#### How to:

We can start creating a [Signal](../../Overview/Glossary.md#signal) by navigating to the **HAL Robotics** tab, **Cell** panel and selecting **Create Signal**. The templates of this component change between digital and analogue [Signals](../../Overview/Glossary.md#signal), whilst the overloads switch between inputs or outputs. The only compulsory input on the component is the _Alias_ which should exactly match the value assigned in your real [Controller](../../Overview/Glossary.md#controller). If your [Controller](../../Overview/Glossary.md#controller) handles aliases then that could be something like `DO_01` but if your controller only handle indices then this _Alias_ could simply be `2`. You can also change the _High_ and _Low_ voltage states of your [Signal](../../Overview/Glossary.md#signal) if you so wish or need. Once the [Signal](../../Overview/Glossary.md#signal) has been created, we can assign it to our [Controller](../../Overview/Glossary.md#controller) by dragging the [Signal](../../Overview/Glossary.md#signal) output to the **Controller's** _Signal_ input.

---
### 4.2. Change a Signal State

#### Objective:

In this tutorial we'll change the state of a [Signal](../../Overview/Glossary.md#signal) at runtime in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Change a Signal State.gh](../ExampleFiles/Tutorials/4.2%20-%20Change%20a%20Signal%20State.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.
- Reading or watching the [Create a Signal](../4-IO/Contents.md#41-create-a-signal) tutorial is highly recommended and this tutorial builds on its output.

#### Background:

Electrical Input and Output (I/O) [Signals](../../Overview/Glossary.md#signal) are used to activate or deactivate [Tools](../../Overview/Glossary.md#end-effector), trigger actions on remote machines or pass data between **Sensors**. The activation of these [Signals](../../Overview/Glossary.md#signal) needs to be triggered at the right time during program execution, something we can do easily with [Signal Actions](../../Overview/Glossary.md#signal-action).

#### How to:

In our previous tutorial, we created a digital output [Signal](../../Overview/Glossary.md#signal), assigned it an appropriate _Alias_ and hooked it up to a [Controller](../../Overview/Glossary.md#controller). We now want to change the state of that [Signal](../../Overview/Glossary.md#signal) during the execution of a [Procedure](../../Overview/Glossary.md#procedure). To do so we're going to get the **Change Signal State** component from the **HAL Robotics** tab, **Procedure** panel. Just like the **Create Signal** component we can change between digital and analogue with component templates and swap between input or output by changing overloads. We can assign our previously created [Signal](../../Overview/Glossary.md#signal) to the component's _Signal_ input and choose what effect we want to have on the [Signal](../../Overview/Glossary.md#signal) by right-clicking on the _Effect_ input. In this scenario we're going to `Set` the state. As we're setting the state, we need to pass in a _State_ which, for a digital signal, is a Boolean value where `true` is equivalent to High and `false` is equivalent to Low. The output of this component is an [Action](../../Overview/Glossary.md#action) which can be merged into any other sequence of [Actions](../../Overview/Glossary.md#action) you may have. Once that's merged, we can see in the **Procedure Browser** that we have some [Motion](../../Overview/Glossary.md#motion-action), our `Set DO_01 to high` [Action](../../Overview/Glossary.md#action) and then some more [Motion](../../Overview/Glossary.md#motion-action) to finish off the [Procedure](../../Overview/Glossary.md#procedure).

---

[Continue to: 5. Advanced Programming](../5-Flow-Control/Contents.md#5-advanced-programming)