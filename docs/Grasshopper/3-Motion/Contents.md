## 3. Motion

[3.1. Create a Target](#31-create-a-target)

[3.2. Modify a Target](#32-modify-a-target)

[3.3. Change Motion Settings](#33-change-motion-settings)

[3.4. Combine Procedures](#34-combine-procedures-and-the-procedure-browser)

[3.5. Synchronize Motion](#35-synchronize-motion)

[3.6. Coupled Motion and Resolving Targets](#36-coupled-motion-and-resolving-targets)

[3.7. Change a Tool at Runtime](#37-change-a-tool-at-runtime)

[3.8. Add Target Constraints \[Coming Soon\]](#38-add-target-constraints)

[3.9. Add Mechanism Constraints \[Coming Soon\]](#39-add-mechanism-constraints)

[3.10. Using a Track](#310-using-a-track)

---
### 3.1. Create a Target

#### Objective:

In this tutorial we'll look at the different ways that we can create [Targets](../../Overview/Glossary.md#target) in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG">  Create a Target.gh](../ExampleFiles/Tutorials/3.1%20-%20Create%20a%20Target.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

[Targets](../../Overview/Glossary.md#target) are the way we define to where a [Robot](../../Overview/Glossary.md#manipulator) should move. They do not, in and of themselves, define how a [Robot](../../Overview/Glossary.md#manipulator) should move so we can mix and match [Target](../../Overview/Glossary.md#target) creation techniques with different types of [Move](../../Overview/Glossary.md#motion-action).

#### How to:

There are 2 main ways of creating [Targets](../../Overview/Glossary.md#target), both of which are available from **Target** component in the **HAL Robotics** tab, **Motion** panel.

The first way of creating a [Target](../../Overview/Glossary.md#target) is a [Cartesian](../../Overview/Glossary.md#cartesian-space) [Target](../../Overview/Glossary.md#target) from a **Frame**. When a [Robot](../../Overview/Glossary.md#manipulator) moves to a [Cartesian](../../Overview/Glossary.md#cartesian-space) [Target](../../Overview/Glossary.md#target) the active [TCP](../../Overview/Glossary.md#endpoint) of our [Robot](../../Overview/Glossary.md#manipulator) will align with the [Target's](../../Overview/Glossary.md#target) position and orientation. If we create a **Frame** in Grasshopper, such as by selecting a point and making it the origin of an XY Plane. When we assign this to our [Target](../../Overview/Glossary.md#target) component and hide the previous components, we can see our [Target](../../Overview/Glossary.md#target) axes centred on the point we had selected. Of course, because this is Grasshopper, if we move that point our [Target](../../Overview/Glossary.md#target) moves with it. We can also set the [Reference](../../Overview/Glossary.md#reference) here. Please take a look at the [References tutorial](../2-Cell/Contents.md#22-create-a-reference) to see how those work.

The Z axis of this [Target](../../Overview/Glossary.md#target) is pointing up. In our [Tool creation tutorial](../2-Cell/Contents.md#22-create-a-tool), we recommended that the Z axis of [Tool](../../Overview/Glossary.md#end-effector) [TCPs](../../Overview/Glossary.md#endpoint) point out of the [Tool](../../Overview/Glossary.md#end-effector), following the co-ordinate system flow of the Robot itself. That means that when our Robot reaches the [Target](../../Overview/Glossary.md#target) we've just created, the [Tool](../../Overview/Glossary.md#end-effector) will also be pointing up. That may be desirable but remember that setting the orientation of your [Targets](../../Overview/Glossary.md#target) is just as important as their positions and therefore creating the correct **Frame** is critical. We have found a number of cases where creating [Targets](../../Overview/Glossary.md#target) facing directly downwards, with their X axes towards world -X is a useful default and have added a shortcut to create those by-passing points directly to a [Target](../../Overview/Glossary.md#target) parameter.

The other primary way of creating a [Target](../../Overview/Glossary.md#target) is in [Joint space](../../Overview/Glossary.md#joint-space), that is by defining the desired position of each active [Joint](../../Overview/Glossary.md#joint) of your [Robot](../../Overview/Glossary.md#manipulator). We can do this by changing the template of our [Target](../../Overview/Glossary.md#target) component by right-clicking and selecting **From Joint Positions**. The inputs are now slightly different. We need to pass a [Mechanism](../../Overview/Glossary.md#mechanism) into the component to visualize the [Robot](../../Overview/Glossary.md#manipulator) in its final position and ensure that the _Positions_ we give are valid. The other required input is a list of the _Positions_ of each active [Robot](../../Overview/Glossary.md#manipulator) [Joint](../../Overview/Glossary.md#joint). It's important to note that unlike many other inputs in the HAL Robotics Framework these _Positions_ must be defined in SI units (metres and radians) because they can legitimately contain both lengths and angles. If we create a few sliders, six for a six-axis [Robot](../../Overview/Glossary.md#manipulator), merge into a single list and ensure that we're in SI units we can visualize the final position of our [Robot](../../Overview/Glossary.md#manipulator) at these [Joint](../../Overview/Glossary.md#joint) positions.

Using these two [Target](../../Overview/Glossary.md#target) creation methods we can get our [Robots](../../Overview/Glossary.md#manipulator) to perform any motion we require. That being said, particularly in a Grasshopper-centric workflow, we often want to follow a Curve as we did in the [Getting Started](../1-Getting-Started/Contents.md#1-getting-started) tutorial. To facilitate that we have included a **From Curve** template in the **Target** component. This variation of the component takes a _Curve_ and creates [Targets](../../Overview/Glossary.md#target) to approximate the _Curve_. We do this by subdividing (or discretizing) it. The _Discretization_ can be controlled using the input and changed between straight line segments only or line segments and arcs. The accuracy of the approximation can be controlled using this _Tolerance_ input. The distance given here is the maximum allowed deviation from the input _Curve_.

All of these [Target](../../Overview/Glossary.md#target) creation options give exactly the same types of [Target](../../Overview/Glossary.md#target) so can be used interchangeably in your [Move](../../Overview/Glossary.md#motion-action) components.

---
### 3.2. Modify a Target

#### Objective:

In this tutorial we'll look at the different utilities to modify [Targets](../../Overview/Glossary.md#target) built in to the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Modify a Target.gh](../ExampleFiles/Tutorials/3.2%20-%20Modify%20a%20Target.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

[Targets](../../Overview/Glossary.md#target) are the way we define to where a [Robot](../../Overview/Glossary.md#manipulator) should move and defining them correctly is a fundamental step in the programming of a [Procedure](../../Overview/Glossary.md#procedure). To facilitate certain recurring cases, we provide inbuilt [Target](../../Overview/Glossary.md#target) modifiers.

#### How to:

The **Transform Target** component from the **HAL Robotics** tab, **Motion** panel offers several different ways of realigning your [Targets](../../Overview/Glossary.md#target) to face vectors, curve tangents, mesh or surface normal, or any other direction you choose with a **Free Transformation**. To start let's stick with the **Parallel to Vector** template and try and get all of our [Targets](../../Overview/Glossary.md#target) to face the base of our [Robot](../../Overview/Glossary.md#manipulator) which happens to be at the world origin. This is often useful if your [Tool](../../Overview/Glossary.md#end-effector) is free to rotate around its Z axis and can help to avoid reachability issues. We can use the **Target Properties** component to get the location of our [Targets](../../Overview/Glossary.md#target), create an XY plane to represent the [Robot](../../Overview/Glossary.md#manipulator) base frame and **Vector from 2 Points** component to find the vector between our [Targets](../../Overview/Glossary.md#target) and the origin. We can use our new vector as the _Direction_ input in our [Target](../../Overview/Glossary.md#target) modifier and pass our [Targets](../../Overview/Glossary.md#target) to their input. Ensure the original [Targets](../../Overview/Glossary.md#target) are hidden to make it easier to see our results. We should see that our [Targets](../../Overview/Glossary.md#target) are all pointing towards the origin but not necessarily in the way we were expecting. That is because the _Axis_ defaults to `Z`. If we change this to `X` then we should see something closer to what we want. We can also _Flip_ the vectors so that our [Targets](../../Overview/Glossary.md#target) face the opposite direction. If we don't want our [Targets](../../Overview/Glossary.md#target) to all be facing down towards the origin as they are now, the we can discard the Z component of our input vector to keep our [Targets](../../Overview/Glossary.md#target) horizontal.

Most variations of the **Transform Target** component work in a similar way so please play with those to discover what they can do. The one exception is the **Free Transform** template. This allows us to apply any transformation we want to our [Targets](../../Overview/Glossary.md#target) by simply specifying translations and reorientations. The default _Reference_ for this transformation is the [Target](../../Overview/Glossary.md#target) itself but we can specify a Plane as the _Reference_ to change the way our [Targets](../../Overview/Glossary.md#target) are transformed.

The last [Target](../../Overview/Glossary.md#target) modifier we're going to look at in this tutorial is the **Target Filter** component from the **HAL Robotics** tab, **Motion** panel. To demonstrate this functionality, we can divide a curve into a large number of [Targets](../../Overview/Glossary.md#target). After a certain point adding more [Targets](../../Overview/Glossary.md#target) is unnecessary, slows down code export and, in some circumstances, code execution. The **Target Filter** component takes our [Targets](../../Overview/Glossary.md#target) and splits them into two lists, those that meet the _Position_ and _Orientation_ tolerances (_Remaining_) and those that don't (_Discarded_). It is therefore useful to hide the component output and display only the _Remaining_ [Targets](../../Overview/Glossary.md#target). If we filter the targets to the nearest centimeter, we should see that far fewer remain and by changing the _Position_ tolerance the number of _Remaining_ [Targets](../../Overview/Glossary.md#target) will vary accordingly.

---
### 3.3. Change Motion Settings

#### Objective:

In this tutorial we'll look at how to change the way in which a [Robot](../../Overview/Glossary.md#manipulator) moves to you [Targets](../../Overview/Glossary.md#target) using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Change Motion Settings.gh](../ExampleFiles/Tutorials/3.3%20-%20Change%20Motion%20Settings.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

**Motion Settings** control the way in which a [Robot](../../Overview/Glossary.md#manipulator) moves between [Targets](../../Overview/Glossary.md#target). They combine settings for the **Space**, **Speeds**, **Accelerations**, **Blends** and a number of other parameters to control how a [Robot](../../Overview/Glossary.md#manipulator) gets to its destination.

#### How to:

The **Motion Settings** component can be found in the **HAL Robotics** tab, **Motion** panel and can be directly passed in to the **Move** component. The four settings mentioned previously are the first inputs on this component.

_Space_ controls which path the [Robot](../../Overview/Glossary.md#manipulator) takes to a [Target](../../Overview/Glossary.md#target). In `Cartesian` mode the [TCP](../../Overview/Glossary.md#endpoint) moves in a very controlled manner along a straight line or arc. This is probably the easier motion type to visualize but can cause problems when moving between configurations or when trying to optimise cycle times. Moving in [Joint space](../../Overview/Glossary.md#joint-space) means that each [Joint](../../Overview/Glossary.md#joint) will move from one position to the next without consideration for the position of the [TCP](../../Overview/Glossary.md#endpoint). [Joint space](../../Overview/Glossary.md#joint-space) [Moves](../../Overview/Glossary.md#motion-action) always end in the same configuration and are not liable to [Singularities](../../Overview/Glossary.md#(kinematic)-singularity). It's often useful to start your [Procedures](../../Overview/Glossary.md#procedure) with a [Motion](../../Overview/Glossary.md#motion-action) in [Joint space](../../Overview/Glossary.md#joint-space) to ensure your [Robot](../../Overview/Glossary.md#manipulator) is always initialized to a known position and configuration. It's worth noting that when using [Joint space](../../Overview/Glossary.md#joint-space) [Motions](../../Overview/Glossary.md#motion-action) your [Toolpath](../../Overview/Glossary.md#toolpath) will be dotted until the [Procedure](../../Overview/Glossary.md#procedure) is [Solved](../../Overview/Glossary.md#solving) because we can't know ahead of time exactly where the [TCP](../../Overview/Glossary.md#endpoint) will go during that [Motion](../../Overview/Glossary.md#motion-action). Once [Solved](../../Overview/Glossary.md#solving), you will see the path your [TCP](../../Overview/Glossary.md#endpoint) will actually take in space.

_Speed_ settings, as the name implies, constrain the speed of your [Robot](../../Overview/Glossary.md#manipulator). They can be declared in [Cartesian space](../../Overview/Glossary.md#cartesian-space) to directly limit the position or orientation _Speed_ of the [TCP](../../Overview/Glossary.md#endpoint). You can also constrain the _Speeds_ of your [Robot's](../../Overview/Glossary.md#manipulator) [Joints](../../Overview/Glossary.md#joint) using the second overload or combine the two using the third overload. Please note that not all [Robot](../../Overview/Glossary.md#manipulator) manufacturers support programmable [Joint](../../Overview/Glossary.md#endpoint) speed constraints so there may be variations between your simulation and real [Robot](../../Overview/Glossary.md#manipulator) when they are used.

_Acceleration_ settings constrain the acceleration of your [Robot](../../Overview/Glossary.md#manipulator). They function in exactly the same way as the _Speeds_, constraining [Cartesian](../../Overview/Glossary.md#cartesian-space) acceleration, [Joint](../../Overview/Glossary.md#joint-space) acceleration or both.

_[Blends](../../Overview/Glossary.md#blend)_ sometimes called zones or approximations change how close the [Robot](../../Overview/Glossary.md#manipulator) needs to get to a [Target](../../Overview/Glossary.md#target) before moving on to the next. It's useful to consider your _[Blends](../../Overview/Glossary.md#blend)_ carefully because increasing their size can drastically improve cycle time by allowing the [Robot](../../Overview/Glossary.md#manipulator) to maintain speed instead of coming to a stop at each [Target](../../Overview/Glossary.md#target). _[Blends](../../Overview/Glossary.md#blend)_ are most easily visualized in _Position_. If we set a 100 mm radius [Blend](../../Overview/Glossary.md#blend), we can see circles appear around each [Target](../../Overview/Glossary.md#target). These indicate that the [Robot](../../Overview/Glossary.md#manipulator) will exactly follow our [Toolpath](../../Overview/Glossary.md#toolpath) until it gets within 100 mm of the [Target](../../Overview/Glossary.md#target), at which point it will start to deviate within that circle to keep its speed up and head towards the subsequent [Target](../../Overview/Glossary.md#target). It will exactly follow our [Toolpath](../../Overview/Glossary.md#toolpath) again when it leaves the circle. When we solve our [Procedure](../../Overview/Glossary.md#procedure), we can see the path our [TCP](../../Overview/Glossary.md#endpoint) will actually take getting close but not actually to all of our [Targets](../../Overview/Glossary.md#target).

_Kinematic_ settings are a more advanced topic and will be discussed in future tutorials ([1](../3-Motion/Contents.md#36-coupled-motion-and-resolving-targets),[2](../3-Motion/Contents.md#38-add-target-constraints),[3](../3-Motion/Contents.md#39-add-mechanism-constraints)).

---
### 3.4. Combine Procedures and the Procedure Browser

#### Objective:

In this tutorial we'll see how to combine different [Procedures](../../Overview/Glossary.md#procedure) to chain sequences using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Combine Procedures and the Procedure Browser.gh](../ExampleFiles/Tutorials/3.4%20-%20Combine%20Procedures%20and%20the%20Procedure%20Browser.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

[Procedures](../../Overview/Glossary.md#procedure) are sequences of atomic [Actions](../../Overview/Glossary.md#action), such as [Move](../../Overview/Glossary.md#motion-action), [Wait](../../Overview/Glossary.md#wait-action) or [Change Signal State](../../Overview/Glossary.md#signal-action). Each of these are created individually but need to be combined to be executed one after the other by our [Robot](../../Overview/Glossary.md#manipulator). [Procedures](../../Overview/Glossary.md#procedure) can also be created as reusable sequences of [Actions](../../Overview/Glossary.md#action) for example moving to a home position and opening a gripper.

#### How to:

To combine multiple [Procedures](../../Overview/Glossary.md#procedure), we can use the **Combine Actions** component from the **HAL Robotics** tab, **Procedure** panel. This component allows us to name our new [Procedure](../../Overview/Glossary.md#procedure) with the _Alias_ input. This is extremely useful for identifying your [Procedure](../../Overview/Glossary.md#procedure) later, particularly when using it more than once. The only mandatory input for this component is the list of [Procedures](../../Overview/Glossary.md#procedure) and [Actions](../../Overview/Glossary.md#action) to be _Combined_. In Grasshopper we can pass any number of wires into the same input and the **Combine Actions** component will create a [Procedure](../../Overview/Glossary.md#procedure) for each branch of items it gets. However, to ensure that we keep a clean document and an easy means of changing the order of [Procedures](../../Overview/Glossary.md#procedure) it is recommended to use something like a **Merge** component and flattening all the inputs. Once those are _Combined_, we will have single [Procedure](../../Overview/Glossary.md#procedure) that executes each of our sub-[Procedures](../../Overview/Glossary.md#procedure) one after the other.

Once a [Procedure](../../Overview/Glossary.md#procedure) has been assigned to a [Controller](../../Overview/Glossary.md#controller) and [Solved](../../Overview/Glossary.md#solving) it is useful to see how a [Simulation](../../Overview/Glossary.md#73-simulation) is progressing through that [Procedure](../../Overview/Glossary.md#procedure) so we can see where any issues may lie or which phases might be taking longer than we expect. We can do that using the **Procedure Browser**. To access the **Procedure Browser**, we need to ensure that we have an **Execution Control** connected to a complete **Execute** component. Once that's in place we can double-click on the **Execution Control** to open the **Procedure Browser**. In this window we can see our execution controls, reset, play/pause, next, previous and loop as well as all of our actions. Alongside that we have a time slider that allows you to speed up or slow down the [Simulation](../../Overview/Glossary.md#73-simulation) of your [Procedures](../../Overview/Glossary.md#procedure) without affecting your program itself. The rest of the **Procedure Browser** window shows the [Procedure](../../Overview/Glossary.md#procedure) that you are executing and the progress of each [Action](../../Overview/Glossary.md#action) within it. This **Procedure Browser** view also serves to demonstrate the purpose of the _Compact_ input on our **Combine Procedure** component. By default, _Compact_ is set to `true`. This compacts all of the incoming [Procedures](../../Overview/Glossary.md#procedure) and creates a single, flat list of [Actions](../../Overview/Glossary.md#action). If, however, we toggle _Compact_ to `false` we see that all of our previous [Procedures](../../Overview/Glossary.md#procedure) are maintained in the hierarchy and can be collapsed or expanded to view their contents. The hierarchical, un-compacted mode can be particularly useful if you reuse sub-[Procedures](../../Overview/Glossary.md#procedure).

---
### 3.5. Synchronize Motion

#### Objective:

In this tutorial we'll see how to synchronize the motion of multiple [Mechanisms](../../Overview/Glossary.md#mechanism) using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Synchronize Motion.gh](../ExampleFiles/Tutorials/3.5%20-%20Synchronize%20Motion.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

When we have multiple [Robots](../../Overview/Glossary.md#manipulator) or [Mechanisms](../../Overview/Glossary.md#mechanism), such as [Positioners](../../Overview/Glossary.md#positioner), in a [Cell](../../Overview/Glossary.md#cell) it may be necessary for them to execute [Motion](../../Overview/Glossary.md#motion-action) synchronously. This could be in scenarios such as two [Robots](../../Overview/Glossary.md#manipulator) sharing a load between them or a [Positioner](../../Overview/Glossary.md#positioner) reorientating a [Part](../../Overview/Glossary.md#part) whilst a [Robot](../../Overview/Glossary.md#manipulator) works on it.

#### How to:

In order to **Synchronize** [Motions](../../Overview/Glossary.md#motion-action), we need to ensure we have multiple [Procedures](../../Overview/Glossary.md#procedure) to work with and we always use one [Procedure](../../Overview/Glossary.md#procedure) per [Mechanism](../../Overview/Glossary.md#mechanism) we want to program, whether it's a [Robot](../../Overview/Glossary.md#manipulator), **Track** or [Positioner](../../Overview/Glossary.md#positioner). A setup for this could be as simple as having two [Robots](../../Overview/Glossary.md#manipulator) each moving to a single [Target](../../Overview/Glossary.md#target) in [Joint space](../../Overview/Glossary.md#joint-space). To make this a little more demonstrative it would be preferable if the [Motions](../../Overview/Glossary.md#motion-action) are dissimilar, for example one being long and the short or one fast and the other slow. To **Synchronize** the [Motions](../../Overview/Glossary.md#motion-action), we need to assign them **Sync Settings**. The **Sync Settings** component can be found in the **HAL Robotics** tab, **Motion** panel. We should assign a unique name, using the _Alias_ input, to the **Sync Settings** to ensure that they are easily identifiable later. Once those **Sync Settings** have been created, they need to be assigned to both of our [Moves](../../Overview/Glossary.md#motion-action). It is important to note that it must be the exact same **Sync Settings** passed to both. Your **Sync Settings** must only be used for one synchronous sequence of [Motions](../../Overview/Glossary.md#motion-action) per [Procedure](../../Overview/Glossary.md#procedure), and synchronous sequences must contain the same number of [Actions](../../Overview/Glossary.md#action) in each [Procedure](../../Overview/Glossary.md#procedure) in which they're used. We can now **Solve** and see that the duration of our [Moves](../../Overview/Glossary.md#motion-action) has been adjusted so that they both take the same amount of time. Also critically important in **Synchronization**, is the fact that all the motions start at the same time. We can test this out be adding a [Move](../../Overview/Glossary.md#motion-action) to one of the [Procedures](../../Overview/Glossary.md#procedure) prior to the **Synchronous** [Moves](../../Overview/Glossary.md#motion-action). When this is re-**Solved,** we can see that the second [Robot](../../Overview/Glossary.md#manipulator) implicitly waits for the first [Robot's](../../Overview/Glossary.md#manipulator) [Move](../../Overview/Glossary.md#motion-action) to finish before they both start their **Synchronous** [Moves](../../Overview/Glossary.md#motion-action).

---
### 3.6. Coupled Motion and Resolving Targets

#### Objective:

In this tutorial we'll see how to simplify the programming of multi-[Mechanism](../../Overview/Glossary.md#mechanism) setups using **Target Resolvers** in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Resolve Targets.gh](../ExampleFiles/Tutorials/3.6%20-%20Resolve%20Targets.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

When we have multiple [Robots](../../Overview/Glossary.md#manipulator) or [Mechanisms](../../Overview/Glossary.md#mechanism), such as [Positioners](../../Overview/Glossary.md#positioner), in a [Cell](../../Overview/Glossary.md#cell) programming can become increasingly complex and, in many scenarios, we only really have one set of [Targets](../../Overview/Glossary.md#target) that we care about which a [Positioner](../../Overview/Glossary.md#positioner) should be relocating to facilitate access by a [Manipulator](../../Overview/Glossary.md#manipulator). We refer to this configuration, where one [Mechanism](../../Overview/Glossary.md#mechanism) displaces the [Targets](../../Overview/Glossary.md#target) of another as **Coupled** motion.

#### How to:

As an example of this we can have a [Robot](../../Overview/Glossary.md#manipulator) drawing a straight line between two [Targets](../../Overview/Glossary.md#target) that are referenced on a rotary [Positioner](../../Overview/Glossary.md#positioner). In order to setup **Coupled** motion we need to add some settings to all the **Motion Settings** that will be used in that **Coupled** configuration. We can create **Kinematic Settings** from the **HAL Robotics** tab, **Motion** panel and because we're dealing with multiple [Mechanisms](../../Overview/Glossary.md#mechanism) we are going to change to the **Composite Kinematic Settings** template. We are now asked to input settings for the _Primary_ and _Secondary_ [Mechanisms](../../Overview/Glossary.md#mechanism). The former is typically the [Mechanism](../../Overview/Glossary.md#mechanism) that is moving the [Targets](../../Overview/Glossary.md#target) around, historically termed "Master", and the latter is the [Mechanism](../../Overview/Glossary.md#mechanism) moving to those [Targets](../../Overview/Glossary.md#target), historically termed "Slave". In our case the [Targets](../../Overview/Glossary.md#target) are referenced to the [Positioner](../../Overview/Glossary.md#positioner) and the [Robot](../../Overview/Glossary.md#manipulator) is following those [Targets](../../Overview/Glossary.md#target) around. We don't need to assign any additional **Kinematic Settings** to our [Mechanisms](../../Overview/Glossary.md#mechanism) so we can simply chain our [Mechanisms](../../Overview/Glossary.md#mechanism) into simple Kinematic Settings and into their positions in the **Composite Kinematic Settings**. These **Composite Kinematic Settings** can now be added to our **Motion Settings** for the **Coupled** [Motions](../../Overview/Glossary.md#motion-action). We have two separate sets of **Motion Settings** here; one is for the **Coupled** [Motion](../../Overview/Glossary.md#motion-action) and the other is for an asynchronous initialization [Motion](../../Overview/Glossary.md#motion-action) for each of the [Mechanisms](../../Overview/Glossary.md#mechanism).

With our settings in place we can now look at programming the [Positioner](../../Overview/Glossary.md#positioner). We could calculate the [Targets](../../Overview/Glossary.md#target) for the [Positioner](../../Overview/Glossary.md#positioner) and set them explicitly but when we're in a scenario like this welding example we can set some rules for the [Positioner](../../Overview/Glossary.md#positioner) to follow. We do this using the **Target Resolvers** from the **HAL Robotics** tab, **Motion** panel. There are a few different templates to explore but, in our case, the first is the one we want. The **Vector Aligned** **Target Resolver** tells the positioner to point the given _Axis_ of our [Targets](../../Overview/Glossary.md#target) towards a particular direction. If we can it's normally preferable to weld with Gravity so we're going to ask the [Positioner](../../Overview/Glossary.md#positioner) to point the Z axis of our [Targets](../../Overview/Glossary.md#target) straight down. The **Target Resolver** can be used in a **Move** just like a [Target](../../Overview/Glossary.md#target) provided it is duplicated to match the number of "secondary" [Targets](../../Overview/Glossary.md#target). To make that task easier we have included a template in **Move** called **Synchronized** which takes in a [Procedure](../../Overview/Glossary.md#procedure) and a [Target](../../Overview/Glossary.md#target), or **Target Resolver**, and will create all of the necessary [Moves](../../Overview/Glossary.md#motion-action) for you with the correct synchronization settings to match the input _Procedure_. **Synchronized** [Move](../../Overview/Glossary.md#motion-action) creates a [Procedure](../../Overview/Glossary.md#procedure) as an output like any other **Move** and so it can be merged and **Combined** as we would normally with any other **Move**. With both of our [Procedures](../../Overview/Glossary.md#procedure) now complete we can **Solve** and **Simulate** to see our [Positioner](../../Overview/Glossary.md#positioner) aligning itself automatically to best present the [Targets](../../Overview/Glossary.md#target) to the [Robot](../../Overview/Glossary.md#manipulator).

---
### 3.7. Change a Tool at Runtime

#### Objective:

In this tutorial we'll see how to change the active [Tool](../../Overview/Glossary.md#end-effector) of a [Mechanism](../../Overview/Glossary.md#mechanism) during the execution of a [Procedure](../../Overview/Glossary.md#procedure) in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Change a Tool at Runtime.gh](../ExampleFiles/Tutorials/3.7%20-%20Change%20a%20Tool%20at%20Runtime.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

There are scenarios in which a single [Robot](../../Overview/Glossary.md#manipulator) may have access to multiple [Tools](../../Overview/Glossary.md#end-effector) and the ability to change which [Tool](../../Overview/Glossary.md#end-effector) is in use at runtime. This could be because, either, the [Tool](../../Overview/Glossary.md#end-effector) itself has multiple [Endpoints](../../Overview/Glossary.md#endpoint) or because automatic [Tool](../../Overview/Glossary.md#end-effector) changing equipment is available in the [Cell](../../Overview/Glossary.md#cell).

#### How to:

In preparation for this tutorial a number of things have been put in place. Firstly, three [Tools](../../Overview/Glossary.md#end-effector) have been created; a simple cone, an interchange plate and a double cone with 2 distinct [Endpoints](../../Overview/Glossary.md#endpoint). Secondly, these [Tools](../../Overview/Glossary.md#end-effector) have each been positioned in front of the [Robot](../../Overview/Glossary.md#manipulator) in a known location. And finally, a [Toolpath](../../Overview/Glossary.md#toolpath) has been created to go to each of the [Tool](../../Overview/Glossary.md#end-effector) picking positions with a jump in between. I have also prepared the standard **Combine**, **Solve**, and **Execute** flow.

The focus of this tutorial will be on the **Change Tool** component which can be found in the **HAL Robotics** tab under **Procedure**. Each version of this component will give us a [Procedure](../../Overview/Glossary.md#procedure) that we can Combine with [Moves](../../Overview/Glossary.md#motion-action) and [Waits](../../Overview/Glossary.md#wait-action) as we have done countless times before. The **Change Tool** component has 3 templates and we'll cover them all, starting with **Detach Tool**. We're going to use this to remove the `Cone` [Tool](../../Overview/Glossary.md#end-effector) that we've initially got attached to the [Robot](../../Overview/Glossary.md#manipulator). We want to ensure the _Mechanism_ is the combined [Mechanism](../../Overview/Glossary.md#mechanism) and we can specify the _Tool_ as the `Cone` [Tool](../../Overview/Glossary.md#end-effector). The _Tool_ input is actually optional and the currently active [Tool](../../Overview/Glossary.md#end-effector) will be removed if none is specified. We can weave this into our main [Procedure](../../Overview/Glossary.md#procedure) and if you Solve and Execute, you'll see the Cone disappear when we hit the right [Target](../../Overview/Glossary.md#target). The `Cone` is actually in the exact position we left it but it is no longer displayed because it's not part of our [Robot](../../Overview/Glossary.md#manipulator). We can use the _Environment_ input on **Execute** to force the display of mobile, non-mechanism [Parts](../../Overview/Glossary.md#part). If we now **Execute**, we should see the `Cone` hang in space where we detached it.

From here we're going to attach two [Tools](../../Overview/Glossary.md#end-effector) to the [Robot](../../Overview/Glossary.md#manipulator) in succession. The first is going to be the `Interface` which acts as something of a Tool Changer. Using the **Change Tool** component and the **Attach Tool** template we can set the combined [Mechanism](../../Overview/Glossary.md#mechanism) as the _Mechanism_ again and the `Interface` as the _Tool_. Merging this into our [Procedure](../../Overview/Glossary.md#procedure) will attach the `Interface` to our [Robot](../../Overview/Glossary.md#manipulator) and we can visualize the [Parts](../../Overview/Glossary.md#part) before they are attached using the same technique as for the `Cone`, passing the [Parts](../../Overview/Glossary.md#part) into _Environment_ on **Execute**. If we repeat this process and attach the `MultiTool` this time, you should see that the `MultiTool` gets connected to the [Active Endpoint](../../Overview/Glossary.md#endpoint) of the [Robot](../../Overview/Glossary.md#manipulator), which in this case is the end of the `Interface`. This behavior may not always be desirable e.g. stationary tools, and can be modified in the overload of **Attach Tool**.

In this final combination of [Tools](../../Overview/Glossary.md#end-effector) attached to the [Robot](../../Overview/Glossary.md#manipulator) we have two distinct potential [Endpoints](../../Overview/Glossary.md#endpoint). The final template of the **Change Tool** component allows us to set which [Endpoint](../../Overview/Glossary.md#endpoint), or [Tool](../../Overview/Glossary.md#end-effector) if you have multiple distinct [Tools](../../Overview/Glossary.md#end-effector) attached, is currently Active. We do this by specifying, once again, the combined [Mechanism](../../Overview/Glossary.md#mechanism), and the [Connection](../../Overview/Glossary.md#connection) that we want to use as the [Active Endpoint](../../Overview/Glossary.md#endpoint). To ensure consistent and deterministic output, I would recommend doing this immediately after attaching the `MultiTool` as well as when you may wish to switch between the two [Endpoints](../../Overview/Glossary.md#endpoint). With that merged and our [Tool](../../Overview/Glossary.md#end-effector) [Parts](../../Overview/Glossary.md#part) in the _Environment_ we can see everything run.

---
### 3.8. Add Target Constraints
#### Coming Soon

---
### 3.9. Add Mechanism Constraints
#### Coming Soon

---
### 3.10. Using a Track

#### Objective:

In this tutorial we'll see how the previous tutorials on [synchronization](#35-synchronize-motion) and [Target Resolvers](#36-coupled-motion-and-resolving-targets) can be used together to program a **Track**, or [Linear Positioner](../../Overview/Glossary.md#positioner), using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="../../assets/images/Grasshopper/GHFile16.PNG"> Using a Track.gh](../ExampleFiles/Tutorials/3.10%20-%20Using%20a%20Track.gh)

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.
- Reading or watching the [Synchronize Motion](../3-Motion/Contents.md#35-synchronize-motion) tutorial is highly recommended.
- Reading or watching the [Coupled Motion and Resolving Targets](../3-Motion/Contents.md#36-coupled-motion-and-resolving-targets) tutorial is highly recommended.
- An extension to the HAL Robotics Framework that allows code export for external axes such as HAL.ABB or HAL.KUKA.

#### Background:

Mounting a [Robot](../../Overview/Glossary.md#manipulator) on a **Track**, or linear axis [Positioner](../../Overview/Glossary.md#positioner), can massively open up the usable space in a [Cell](../../Overview/Glossary.md#cell). However, programming one [Mechanism](../../Overview/Glossary.md#mechanism) whilst it's mounted on another can introduce a few complexities.

#### How to:

As per usual, we're going to start this session by modelling our [Cell](../../Overview/Glossary.md#cell). This means picking our [Robot](../../Overview/Glossary.md#manipulator), **Attaching** a [Tool](../../Overview/Glossary.md#end-effector), and importing our [Positioner](../../Overview/Glossary.md#positioner). This is where things start deviating slightly from our [synchronization](#35-synchronize-motion) tutorial. In this instance we actually want to mount one of our [Mechanisms](../../Overview/Glossary.md#mechanism) on another. The HAL Robotics Framework doesn't really make a distinction between [Mechanism](../../Overview/Glossary.md#mechanism) types e.g. [Positioner](../../Overview/Glossary.md#positioner), [Robot](../../Overview/Glossary.md#manipulator) or [Tool](../../Overview/Glossary.md#end-effector), so we can use the exact same strategy as **Attaching** our [Tool](../../Overview/Glossary.md#end-effector) to the [Robot](../../Overview/Glossary.md#manipulator). We'll use the **Attach** component with the **Track** as the _Parent_ and the [Robot](../../Overview/Glossary.md#manipulator) + [Tool](../../Overview/Glossary.md#end-effector) combination as the _Child_. Ensure that _IsEndEffector_ is left as `true` because our _Child_ contains our desired [End Effector](../../Overview/Glossary.md#end-effector). We can use the _Location_ and _InWorld_ parameters to adjust the position and orientation of the [Robot](../../Overview/Glossary.md#manipulator) on the **Track**. This will create a single [Mechanism](../../Overview/Glossary.md#mechanism) that we can program as we would any other [Mechanism](../../Overview/Glossary.md#mechanism), however, this monolithic approach doesn't give us as much freedom as treating this like a multi-[Mechanism](../../Overview/Glossary.md#mechanism) setup does. N.B. If you do use the single [Mechanism](../../Overview/Glossary.md#mechanism) approach, ensure any [Joint space](../../Overview/Glossary.md#joint-space) [Targets](../../Overview/Glossary.md#target) are a) in SI units for the relevant joints, and b) are in the right order i.e. with the **Track** first in this case (_Parent_ joints followed by _Child_ joints). To return to a multi-[Mechanism](../../Overview/Glossary.md#mechanism) scenario we can use the **Disassemble** component from **HAL Robotics** -\> **Cell**. This will split our [Mechanism](../../Overview/Glossary.md#mechanism) into its constituent parts including its _SubMechanisms_, that is to say, the [Mechanisms](../../Overview/Glossary.md#mechanism) which make it up. We can now treat the _SubMechanisms_ as we did our [Mechanisms](../../Overview/Glossary.md#mechanism) in [previous](#35-synchronize-motion) [tutorials](#36-coupled-motion-and-resolving-targets).

There are a few subtleties to programming a **Track** so let's walk through an example. Let's start by preparing a simple curve following [Procedure](../../Overview/Glossary.md#procedure) for the [Robot](../../Overview/Glossary.md#manipulator) as we did in the [Getting Started tutorial](../1-Getting-Started/Contents.md#1-getting-started). Ensure the **Track** is actually required by making this curve longer than the [Robot's](../../Overview/Glossary.md#manipulator) reach. We can then program the **Track** using [Targets](../../Overview/Glossary.md#target) as we do for any other [Mechanism](../../Overview/Glossary.md#mechanism) for maximum control, or using the **Target Resolvers** seen in a [previous tutorial](#36-coupled-motion-and-resolving-targets) for a quick but effective approach. For a **Track** the **Offset** **Target Resolver** overload is of particular use. The default version of this component asks simply for an _Offset_ distance which is the distance the **Track's** [Endpoint](../../Overview/Glossary.md#endpoint) (and by extension the [Robot's](../../Overview/Glossary.md#manipulator) base) should be kept from the [Robot's](../../Overview/Glossary.md#manipulator) [Target](../../Overview/Glossary.md#target). Setting the _Offset_ to `0` or any value less than the distance between the **Track's** [Endpoint](../../Overview/Glossary.md#endpoint) and [Target](../../Overview/Glossary.md#target) will cause the **Track** to get as close to the [Target](../../Overview/Glossary.md#target) as possible. To create a full [Procedure](../../Overview/Glossary.md#procedure) for the **Track** we need to set some **Sync Settings** for the [Robot's](../../Overview/Glossary.md#manipulator) [Move](../../Overview/Glossary.md#motion-action) and can then use the **Synchronize** utility overload of the **Move** component to synchronize our **Target Resolver** with the full [Robot](../../Overview/Glossary.md#manipulator) [Procedure](../../Overview/Glossary.md#procedure) (see the [Synchronize Motion tutorial](../3-Motion/Contents.md#35-synchronize-motion) for a refresher on how to do this). As one [Mechanism](../../Overview/Glossary.md#mechanism) is moving another, you will also need to ensure that the **Kinematic Settings** are in place for this setup, with the **Track** as the _Primary_ and [Robot](../../Overview/Glossary.md#manipulator) as a _Secondary_, in both the [Robot's](../../Overview/Glossary.md#manipulator) [Move](../../Overview/Glossary.md#motion-action) and the **Track's** (see the [Coupled Motion and Resolving Targets tutorial](../3-Motion/Contents.md#36-coupled-motion-and-resolving-targets) as a reminder if needed). With this in place we are in a position to **Solve** and **Execute** and we should see both [Mechanisms](../../Overview/Glossary.md#mechanism) moving as we expect.

Although [exporting](../../Overview/Glossary.md#export) is covered in a later [tutorial](../6-Control/Contents.md#62-export-a-procedure), there are a couple of things that need to be setup for external axes that are worth looking at here if your [Positioner](../../Overview/Glossary.md#positioner) is an external axis and programmed within the same exported [Procedure](../../Overview/Glossary.md#procedure) as your [Robot](../../Overview/Glossary.md#manipulator).
1. You'll need to setup your [Joint Mappings](../../Overview/Glossary.md#joint-mapping).  When you created or loaded your [Positioner](../../Overview/Glossary.md#positioner) you will likely have glossed over the _Mapping(s)_ input. These values are 0-based indices of any external [axis](../../Overview/Glossary.md#joint) that needs to be exported. In our example above, we have 6 axes in our [Robot](../../Overview/Glossary.md#manipulator) and our [Positioner](../../Overview/Glossary.md#positioner) comes after that. We can therefore assign it an index of `6` (0-based, so 7th when exported) or higher depending on the exact configuration of our real [Cell](../../Overview/Glossary.md#cell).
2. You'll need to set your [Positioner](../../Overview/Glossary.md#positioner) [Procedure](../../Overview/Glossary.md#procedure) as a child of your [Robot](../../Overview/Glossary.md#manipulator) [Procedure](../../Overview/Glossary.md#procedure). This can be done in the [Controller](../../Overview/Glossary.md#controller) configuration, accessible by double-clicking on your [Controller](../../Overview/Glossary.md#controller) component. On the right-hand side of this window you should see both of the [Procedures](../../Overview/Glossary.md#procedure) listed. Drag the [Positioner](../../Overview/Glossary.md#positioner) [Procedure](../../Overview/Glossary.md#procedure) onto the main [Procedure](../../Overview/Glossary.md#procedure) to make it a child. As you're doing this, ensure that the _Task Alias_ of your main [Procedure](../../Overview/Glossary.md#procedure) matches the target **Task** on your real [Controller](../../Overview/Glossary.md#controller).

---

[Continue to: 4. I/O](../4-IO/Contents.md#4-io)