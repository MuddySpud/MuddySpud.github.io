---
title: null
mapFolderPath: tsmaps/HAL/Grasshopper/%CE%9E%203-Motion
fragsFolderPath: HAL/Grasshopper/3-Motion_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLBeH06m","path":"HAL/Grasshopper","fragmentFolderPath":"HAL/Grasshopper/3-Motion_frags"},"fragment":{"id":"fdLBeH06m","topLevelMapKey":"cQTP3J01qB","mapKeyChain":"cQTP3J01qB","guideID":"fdLBeH1Po","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/Grasshopper/3-Motion.tsmap","parentFragmentID":null,"chartKey":"cQTP3J01qB","options":[]}} -->

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

In this tutorial we'll look at the different ways that we can create [Targets](/HAL/Overview/Glossary#target) in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG">  Create a Target.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/3.1%20-%20Create%20a%20Target.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

[Targets](/HAL/Overview/Glossary#target) are the way we define to where a [Robot](/HAL/Overview/Glossary#manipulator) should move. They do not, in and of themselves, define how a [Robot](/HAL/Overview/Glossary#manipulator) should move so we can mix and match [Target](/HAL/Overview/Glossary#target) creation techniques with different types of [Move](/HAL/Overview/Glossary#motion-action).

#### How to:

There are 2 main ways of creating [Targets](/HAL/Overview/Glossary#target), both of which are available from **Target** component in the **HAL Robotics** tab, **Motion** panel.

The first way of creating a [Target](/HAL/Overview/Glossary#target) is a [Cartesian](/HAL/Overview/Glossary#cartesian-space) [Target](/HAL/Overview/Glossary#target) from a **Frame**. When a [Robot](/HAL/Overview/Glossary#manipulator) moves to a [Cartesian](/HAL/Overview/Glossary#cartesian-space) [Target](/HAL/Overview/Glossary#target) the active [TCP](/HAL/Overview/Glossary#endpoint) of our [Robot](/HAL/Overview/Glossary#manipulator) will align with the [Target's](/HAL/Overview/Glossary#target) position and orientation. If we create a **Frame** in Grasshopper, such as by selecting a point and making it the origin of an XY Plane. When we assign this to our [Target](/HAL/Overview/Glossary#target) component and hide the previous components, we can see our [Target](/HAL/Overview/Glossary#target) axes centred on the point we had selected. Of course, because this is Grasshopper, if we move that point our [Target](/HAL/Overview/Glossary#target) moves with it. We can also set the [Reference](/HAL/Overview/Glossary#reference) here. Please take a look at the [References tutorial](/HAL/Grasshopper/2-Cell#22-create-a-reference) to see how those work.

The Z axis of this [Target](/HAL/Overview/Glossary#target) is pointing up. In our [Tool creation tutorial](/HAL/Grasshopper/2-Cell#22-create-a-tool), we recommended that the Z axis of [Tool](/HAL/Overview/Glossary#end-effector) [TCPs](/HAL/Overview/Glossary#endpoint) point out of the [Tool](/HAL/Overview/Glossary#end-effector), following the co-ordinate system flow of the Robot itself. That means that when our Robot reaches the [Target](/HAL/Overview/Glossary#target) we've just created, the [Tool](/HAL/Overview/Glossary#end-effector) will also be pointing up. That may be desirable but remember that setting the orientation of your [Targets](/HAL/Overview/Glossary#target) is just as important as their positions and therefore creating the correct **Frame** is critical. We have found a number of cases where creating [Targets](/HAL/Overview/Glossary#target) facing directly downwards, with their X axes towards world -X is a useful default and have added a shortcut to create those by-passing points directly to a [Target](/HAL/Overview/Glossary#target) parameter.

The other primary way of creating a [Target](/HAL/Overview/Glossary#target) is in [Joint space](/HAL/Overview/Glossary#joint-space), that is by defining the desired position of each active [Joint](/HAL/Overview/Glossary#joint) of your [Robot](/HAL/Overview/Glossary#manipulator). We can do this by changing the template of our [Target](/HAL/Overview/Glossary#target) component by right-clicking and selecting **From Joint Positions**. The inputs are now slightly different. We need to pass a [Mechanism](/HAL/Overview/Glossary#mechanism) into the component to visualize the [Robot](/HAL/Overview/Glossary#manipulator) in its final position and ensure that the _Positions_ we give are valid. The other required input is a list of the _Positions_ of each active [Robot](/HAL/Overview/Glossary#manipulator) [Joint](/HAL/Overview/Glossary#joint). It's important to note that unlike many other inputs in the HAL Robotics Framework these _Positions_ must be defined in SI units (metres and radians) because they can legitimately contain both lengths and angles. If we create a few sliders, six for a six-axis [Robot](/HAL/Overview/Glossary#manipulator), merge into a single list and ensure that we're in SI units we can visualize the final position of our [Robot](/HAL/Overview/Glossary#manipulator) at these [Joint](/HAL/Overview/Glossary#joint) positions.

Using these two [Target](/HAL/Overview/Glossary#target) creation methods we can get our [Robots](/HAL/Overview/Glossary#manipulator) to perform any motion we require. That being said, particularly in a Grasshopper-centric workflow, we often want to follow a Curve as we did in the [Getting Started](/HAL/Grasshopper/1-Getting-Started#1-getting-started) tutorial. To facilitate that we have included a **From Curve** template in the **Target** component. This variation of the component takes a _Curve_ and creates [Targets](/HAL/Overview/Glossary#target) to approximate the _Curve_. We do this by subdividing (or discretizing) it. The _Discretization_ can be controlled using the input and changed between straight line segments only or line segments and arcs. The accuracy of the approximation can be controlled using this _Tolerance_ input. The distance given here is the maximum allowed deviation from the input _Curve_.

All of these [Target](/HAL/Overview/Glossary#target) creation options give exactly the same types of [Target](/HAL/Overview/Glossary#target) so can be used interchangeably in your [Move](/HAL/Overview/Glossary#motion-action) components.

---
### 3.2. Modify a Target

#### Objective:

In this tutorial we'll look at the different utilities to modify [Targets](/HAL/Overview/Glossary#target) built in to the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Modify a Target.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/3.2%20-%20Modify%20a%20Target.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

[Targets](/HAL/Overview/Glossary#target) are the way we define to where a [Robot](/HAL/Overview/Glossary#manipulator) should move and defining them correctly is a fundamental step in the programming of a [Procedure](/HAL/Overview/Glossary#procedure). To facilitate certain recurring cases, we provide inbuilt [Target](/HAL/Overview/Glossary#target) modifiers.

#### How to:

The **Transform Target** component from the **HAL Robotics** tab, **Motion** panel offers several different ways of realigning your [Targets](/HAL/Overview/Glossary#target) to face vectors, curve tangents, mesh or surface normal, or any other direction you choose with a **Free Transformation**. To start let's stick with the **Parallel to Vector** template and try and get all of our [Targets](/HAL/Overview/Glossary#target) to face the base of our [Robot](/HAL/Overview/Glossary#manipulator) which happens to be at the world origin. This is often useful if your [Tool](/HAL/Overview/Glossary#end-effector) is free to rotate around its Z axis and can help to avoid reachability issues. We can use the **Target Properties** component to get the location of our [Targets](/HAL/Overview/Glossary#target), create an XY plane to represent the [Robot](/HAL/Overview/Glossary#manipulator) base frame and **Vector from 2 Points** component to find the vector between our [Targets](/HAL/Overview/Glossary#target) and the origin. We can use our new vector as the _Direction_ input in our [Target](/HAL/Overview/Glossary#target) modifier and pass our [Targets](/HAL/Overview/Glossary#target) to their input. Ensure the original [Targets](/HAL/Overview/Glossary#target) are hidden to make it easier to see our results. We should see that our [Targets](/HAL/Overview/Glossary#target) are all pointing towards the origin but not necessarily in the way we were expecting. That is because the _Axis_ defaults to `Z`. If we change this to `X` then we should see something closer to what we want. We can also _Flip_ the vectors so that our [Targets](/HAL/Overview/Glossary#target) face the opposite direction. If we don't want our [Targets](/HAL/Overview/Glossary#target) to all be facing down towards the origin as they are now, the we can discard the Z component of our input vector to keep our [Targets](/HAL/Overview/Glossary#target) horizontal.

Most variations of the **Transform Target** component work in a similar way so please play with those to discover what they can do. The one exception is the **Free Transform** template. This allows us to apply any transformation we want to our [Targets](/HAL/Overview/Glossary#target) by simply specifying translations and reorientations. The default _Reference_ for this transformation is the [Target](/HAL/Overview/Glossary#target) itself but we can specify a Plane as the _Reference_ to change the way our [Targets](/HAL/Overview/Glossary#target) are transformed.

The last [Target](/HAL/Overview/Glossary#target) modifier we're going to look at in this tutorial is the **Target Filter** component from the **HAL Robotics** tab, **Motion** panel. To demonstrate this functionality, we can divide a curve into a large number of [Targets](/HAL/Overview/Glossary#target). After a certain point adding more [Targets](/HAL/Overview/Glossary#target) is unnecessary, slows down code export and, in some circumstances, code execution. The **Target Filter** component takes our [Targets](/HAL/Overview/Glossary#target) and splits them into two lists, those that meet the _Position_ and _Orientation_ tolerances (_Remaining_) and those that don't (_Discarded_). It is therefore useful to hide the component output and display only the _Remaining_ [Targets](/HAL/Overview/Glossary#target). If we filter the targets to the nearest centimeter, we should see that far fewer remain and by changing the _Position_ tolerance the number of _Remaining_ [Targets](/HAL/Overview/Glossary#target) will vary accordingly.

---
### 3.3. Change Motion Settings

#### Objective:

In this tutorial we'll look at how to change the way in which a [Robot](/HAL/Overview/Glossary#manipulator) moves to you [Targets](/HAL/Overview/Glossary#target) using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Change Motion Settings.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/3.3%20-%20Change%20Motion%20Settings.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

**Motion Settings** control the way in which a [Robot](/HAL/Overview/Glossary#manipulator) moves between [Targets](/HAL/Overview/Glossary#target). They combine settings for the **Space**, **Speeds**, **Accelerations**, **Blends** and a number of other parameters to control how a [Robot](/HAL/Overview/Glossary#manipulator) gets to its destination.

#### How to:

The **Motion Settings** component can be found in the **HAL Robotics** tab, **Motion** panel and can be directly passed in to the **Move** component. The four settings mentioned previously are the first inputs on this component.

_Space_ controls which path the [Robot](/HAL/Overview/Glossary#manipulator) takes to a [Target](/HAL/Overview/Glossary#target). In `Cartesian` mode the [TCP](/HAL/Overview/Glossary#endpoint) moves in a very controlled manner along a straight line or arc. This is probably the easier motion type to visualize but can cause problems when moving between configurations or when trying to optimise cycle times. Moving in [Joint space](/HAL/Overview/Glossary#joint-space) means that each [Joint](/HAL/Overview/Glossary#joint) will move from one position to the next without consideration for the position of the [TCP](/HAL/Overview/Glossary#endpoint). [Joint space](/HAL/Overview/Glossary#joint-space) [Moves](/HAL/Overview/Glossary#motion-action) always end in the same configuration and are not liable to [Singularities](/HAL/Overview/Glossary#(kinematic)-singularity). It's often useful to start your [Procedures](/HAL/Overview/Glossary#procedure) with a [Motion](/HAL/Overview/Glossary#motion-action) in [Joint space](/HAL/Overview/Glossary#joint-space) to ensure your [Robot](/HAL/Overview/Glossary#manipulator) is always initialized to a known position and configuration. It's worth noting that when using [Joint space](/HAL/Overview/Glossary#joint-space) [Motions](/HAL/Overview/Glossary#motion-action) your [Toolpath](/HAL/Overview/Glossary#toolpath) will be dotted until the [Procedure](/HAL/Overview/Glossary#procedure) is [Solved](/HAL/Overview/Glossary#solving) because we can't know ahead of time exactly where the [TCP](/HAL/Overview/Glossary#endpoint) will go during that [Motion](/HAL/Overview/Glossary#motion-action). Once [Solved](/HAL/Overview/Glossary#solving), you will see the path your [TCP](/HAL/Overview/Glossary#endpoint) will actually take in space.

_Speed_ settings, as the name implies, constrain the speed of your [Robot](/HAL/Overview/Glossary#manipulator). They can be declared in [Cartesian space](/HAL/Overview/Glossary#cartesian-space) to directly limit the position or orientation _Speed_ of the [TCP](/HAL/Overview/Glossary#endpoint). You can also constrain the _Speeds_ of your [Robot's](/HAL/Overview/Glossary#manipulator) [Joints](/HAL/Overview/Glossary#joint) using the second overload or combine the two using the third overload. Please note that not all [Robot](/HAL/Overview/Glossary#manipulator) manufacturers support programmable [Joint](/HAL/Overview/Glossary#endpoint) speed constraints so there may be variations between your simulation and real [Robot](/HAL/Overview/Glossary#manipulator) when they are used.

_Acceleration_ settings constrain the acceleration of your [Robot](/HAL/Overview/Glossary#manipulator). They function in exactly the same way as the _Speeds_, constraining [Cartesian](/HAL/Overview/Glossary#cartesian-space) acceleration, [Joint](/HAL/Overview/Glossary#joint-space) acceleration or both.

_[Blends](/HAL/Overview/Glossary#blend)_ sometimes called zones or approximations change how close the [Robot](/HAL/Overview/Glossary#manipulator) needs to get to a [Target](/HAL/Overview/Glossary#target) before moving on to the next. It's useful to consider your _[Blends](/HAL/Overview/Glossary#blend)_ carefully because increasing their size can drastically improve cycle time by allowing the [Robot](/HAL/Overview/Glossary#manipulator) to maintain speed instead of coming to a stop at each [Target](/HAL/Overview/Glossary#target). _[Blends](/HAL/Overview/Glossary#blend)_ are most easily visualized in _Position_. If we set a 100 mm radius [Blend](/HAL/Overview/Glossary#blend), we can see circles appear around each [Target](/HAL/Overview/Glossary#target). These indicate that the [Robot](/HAL/Overview/Glossary#manipulator) will exactly follow our [Toolpath](/HAL/Overview/Glossary#toolpath) until it gets within 100 mm of the [Target](/HAL/Overview/Glossary#target), at which point it will start to deviate within that circle to keep its speed up and head towards the subsequent [Target](/HAL/Overview/Glossary#target). It will exactly follow our [Toolpath](/HAL/Overview/Glossary#toolpath) again when it leaves the circle. When we solve our [Procedure](/HAL/Overview/Glossary#procedure), we can see the path our [TCP](/HAL/Overview/Glossary#endpoint) will actually take getting close but not actually to all of our [Targets](/HAL/Overview/Glossary#target).

_Kinematic_ settings are a more advanced topic and will be discussed in future tutorials ([1](/HAL/Grasshopper/3-Motion#36-coupled-motion-and-resolving-targets),[2](/HAL/Grasshopper/3-Motion#38-add-target-constraints),[3](/HAL/Grasshopper/3-Motion#39-add-mechanism-constraints).

---
### 3.4. Combine Procedures and the Procedure Browser

#### Objective:

In this tutorial we'll see how to combine different [Procedures](/HAL/Overview/Glossary#procedure) to chain sequences using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Combine Procedures and the Procedure Browser.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/3.4%20-%20Combine%20Procedures%20and%20the%20Procedure%20Browser.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

[Procedures](/HAL/Overview/Glossary#procedure) are sequences of atomic [Actions](/HAL/Overview/Glossary#action), such as [Move](/HAL/Overview/Glossary#motion-action), [Wait](/HAL/Overview/Glossary#wait-action) or [Change Signal State](/HAL/Overview/Glossary#signal-action). Each of these are created individually but need to be combined to be executed one after the other by our [Robot](/HAL/Overview/Glossary#manipulator). [Procedures](/HAL/Overview/Glossary#procedure) can also be created as reusable sequences of [Actions](/HAL/Overview/Glossary#action) for example moving to a home position and opening a gripper.

#### How to:

To combine multiple [Procedures](/HAL/Overview/Glossary#procedure), we can use the **Combine Actions** component from the **HAL Robotics** tab, **Procedure** panel. This component allows us to name our new [Procedure](/HAL/Overview/Glossary#procedure) with the _Alias_ input. This is extremely useful for identifying your [Procedure](/HAL/Overview/Glossary#procedure) later, particularly when using it more than once. The only mandatory input for this component is the list of [Procedures](/HAL/Overview/Glossary#procedure) and [Actions](/HAL/Overview/Glossary#action) to be _Combined_. In Grasshopper we can pass any number of wires into the same input and the **Combine Actions** component will create a [Procedure](/HAL/Overview/Glossary#procedure) for each branch of items it gets. However, to ensure that we keep a clean document and an easy means of changing the order of [Procedures](/HAL/Overview/Glossary#procedure) it is recommended to use something like a **Merge** component and flattening all the inputs. Once those are _Combined_, we will have single [Procedure](/HAL/Overview/Glossary#procedure) that executes each of our sub-[Procedures](/HAL/Overview/Glossary#procedure) one after the other.

Once a [Procedure](/HAL/Overview/Glossary#procedure) has been assigned to a [Controller](/HAL/Overview/Glossary#controller) and [Solved](/HAL/Overview/Glossary#solving) it is useful to see how a [Simulation](/HAL/Overview/Glossary#73-simulation) is progressing through that [Procedure](/HAL/Overview/Glossary#procedure) so we can see where any issues may lie or which phases might be taking longer than we expect. We can do that using the **Procedure Browser**. To access the **Procedure Browser**, we need to ensure that we have an **Execution Control** connected to a complete **Execute** component. Once that's in place we can double-click on the **Execution Control** to open the **Procedure Browser**. In this window we can see our execution controls, reset, play/pause, next, previous and loop as well as all of our actions. Alongside that we have a time slider that allows you to speed up or slow down the [Simulation](/HAL/Overview/Glossary#73-simulation) of your [Procedures](/HAL/Overview/Glossary#procedure) without affecting your program itself. The rest of the **Procedure Browser** window shows the [Procedure](/HAL/Overview/Glossary#procedure) that you are executing and the progress of each [Action](/HAL/Overview/Glossary#action) within it. This **Procedure Browser** view also serves to demonstrate the purpose of the _Compact_ input on our **Combine Procedure** component. By default, _Compact_ is set to `true`. This compacts all of the incoming [Procedures](/HAL/Overview/Glossary#procedure) and creates a single, flat list of [Actions](/HAL/Overview/Glossary#action). If, however, we toggle _Compact_ to `false` we see that all of our previous [Procedures](/HAL/Overview/Glossary#procedure) are maintained in the hierarchy and can be collapsed or expanded to view their contents. The hierarchical, un-compacted mode can be particularly useful if you reuse sub-[Procedures](/HAL/Overview/Glossary#procedure).

---
### 3.5. Synchronize Motion

#### Objective:

In this tutorial we'll see how to synchronize the motion of multiple [Mechanisms](/HAL/Overview/Glossary#mechanism) using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Synchronize Motion.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/3.5%20-%20Synchronize%20Motion.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

When we have multiple [Robots](/HAL/Overview/Glossary#manipulator) or [Mechanisms](/HAL/Overview/Glossary#mechanism), such as [Positioners](/HAL/Overview/Glossary#positioner), in a [Cell](/HAL/Overview/Glossary#cell) it may be necessary for them to execute [Motion](/HAL/Overview/Glossary#motion-action) synchronously. This could be in scenarios such as two [Robots](/HAL/Overview/Glossary#manipulator) sharing a load between them or a [Positioner](/HAL/Overview/Glossary#positioner) reorientating a [Part](/HAL/Overview/Glossary#part) whilst a [Robot](/HAL/Overview/Glossary#manipulator) works on it.

#### How to:

In order to **Synchronize** [Motions](/HAL/Overview/Glossary#motion-action), we need to ensure we have multiple [Procedures](/HAL/Overview/Glossary#procedure) to work with and we always use one [Procedure](/HAL/Overview/Glossary#procedure) per [Mechanism](/HAL/Overview/Glossary#mechanism) we want to program, whether it's a [Robot](/HAL/Overview/Glossary#manipulator), **Track** or [Positioner](/HAL/Overview/Glossary#positioner). A setup for this could be as simple as having two [Robots](/HAL/Overview/Glossary#manipulator) each moving to a single [Target](/HAL/Overview/Glossary#target) in [Joint space](/HAL/Overview/Glossary#joint-space). To make this a little more demonstrative it would be preferable if the [Motions](/HAL/Overview/Glossary#motion-action) are dissimilar, for example one being long and the short or one fast and the other slow. To **Synchronize** the [Motions](/HAL/Overview/Glossary#motion-action), we need to assign them **Sync Settings**. The **Sync Settings** component can be found in the **HAL Robotics** tab, **Motion** panel. We should assign a unique name, using the _Alias_ input, to the **Sync Settings** to ensure that they are easily identifiable later. Once those **Sync Settings** have been created, they need to be assigned to both of our [Moves](/HAL/Overview/Glossary#motion-action). It is important to note that it must be the exact same **Sync Settings** passed to both. Your **Sync Settings** must only be used for one synchronous sequence of [Motions](/HAL/Overview/Glossary#motion-action) per [Procedure](/HAL/Overview/Glossary#procedure), and synchronous sequences must contain the same number of [Actions](/HAL/Overview/Glossary#action) in each [Procedure](/HAL/Overview/Glossary#procedure) in which they're used. We can now **Solve** and see that the duration of our [Moves](/HAL/Overview/Glossary#motion-action) has been adjusted so that they both take the same amount of time. Also critically important in **Synchronization**, is the fact that all the motions start at the same time. We can test this out be adding a [Move](/HAL/Overview/Glossary#motion-action) to one of the [Procedures](/HAL/Overview/Glossary#procedure) prior to the **Synchronous** [Moves](/HAL/Overview/Glossary#motion-action). When this is re-**Solved,** we can see that the second [Robot](/HAL/Overview/Glossary#manipulator) implicitly waits for the first [Robot's](/HAL/Overview/Glossary#manipulator) [Move](/HAL/Overview/Glossary#motion-action) to finish before they both start their **Synchronous** [Moves](/HAL/Overview/Glossary#motion-action).

---
### 3.6. Coupled Motion and Resolving Targets

#### Objective:

In this tutorial we'll see how to simplify the programming of multi-[Mechanism](/HAL/Overview/Glossary#mechanism) setups using **Target Resolvers** in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Resolve Targets.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/3.6%20-%20Resolve%20Targets.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

When we have multiple [Robots](/HAL/Overview/Glossary#manipulator) or [Mechanisms](/HAL/Overview/Glossary#mechanism), such as [Positioners](/HAL/Overview/Glossary#positioner), in a [Cell](/HAL/Overview/Glossary#cell) programming can become increasingly complex and, in many scenarios, we only really have one set of [Targets](/HAL/Overview/Glossary#target) that we care about which a [Positioner](/HAL/Overview/Glossary#positioner) should be relocating to facilitate access by a [Manipulator](/HAL/Overview/Glossary#manipulator). We refer to this configuration, where one [Mechanism](/HAL/Overview/Glossary#mechanism) displaces the [Targets](/HAL/Overview/Glossary#target) of another as **Coupled** motion.

#### How to:

As an example of this we can have a [Robot](/HAL/Overview/Glossary#manipulator) drawing a straight line between two [Targets](/HAL/Overview/Glossary#target) that are referenced on a rotary [Positioner](/HAL/Overview/Glossary#positioner). In order to setup **Coupled** motion we need to add some settings to all the **Motion Settings** that will be used in that **Coupled** configuration. We can create **Kinematic Settings** from the **HAL Robotics** tab, **Motion** panel and because we're dealing with multiple [Mechanisms](/HAL/Overview/Glossary#mechanism) we are going to change to the **Composite Kinematic Settings** template. We are now asked to input settings for the _Primary_ and _Secondary_ [Mechanisms](/HAL/Overview/Glossary#mechanism). The former is typically the [Mechanism](/HAL/Overview/Glossary#mechanism) that is moving the [Targets](/HAL/Overview/Glossary#target) around, historically termed "Master", and the latter is the [Mechanism](/HAL/Overview/Glossary#mechanism) moving to those [Targets](/HAL/Overview/Glossary#target), historically termed "Slave". In our case the [Targets](/HAL/Overview/Glossary#target) are referenced to the [Positioner](/HAL/Overview/Glossary#positioner) and the [Robot](/HAL/Overview/Glossary#manipulator) is following those [Targets](/HAL/Overview/Glossary#target) around. We don't need to assign any additional **Kinematic Settings** to our [Mechanisms](/HAL/Overview/Glossary#mechanism) so we can simply chain our [Mechanisms](/HAL/Overview/Glossary#mechanism) into simple Kinematic Settings and into their positions in the **Composite Kinematic Settings**. These **Composite Kinematic Settings** can now be added to our **Motion Settings** for the **Coupled** [Motions](/HAL/Overview/Glossary#motion-action). We have two separate sets of **Motion Settings** here; one is for the **Coupled** [Motion](/HAL/Overview/Glossary#motion-action) and the other is for an asynchronous initialization [Motion](/HAL/Overview/Glossary#motion-action) for each of the [Mechanisms](/HAL/Overview/Glossary#mechanism).

With our settings in place we can now look at programming the [Positioner](/HAL/Overview/Glossary#positioner). We could calculate the [Targets](/HAL/Overview/Glossary#target) for the [Positioner](/HAL/Overview/Glossary#positioner) and set them explicitly but when we're in a scenario like this welding example we can set some rules for the [Positioner](/HAL/Overview/Glossary#positioner) to follow. We do this using the **Target Resolvers** from the **HAL Robotics** tab, **Motion** panel. There are a few different templates to explore but, in our case, the first is the one we want. The **Vector Aligned** **Target Resolver** tells the positioner to point the given _Axis_ of our [Targets](/HAL/Overview/Glossary#target) towards a particular direction. If we can it's normally preferable to weld with Gravity so we're going to ask the [Positioner](/HAL/Overview/Glossary#positioner) to point the Z axis of our [Targets](/HAL/Overview/Glossary#target) straight down. The **Target Resolver** can be used in a **Move** just like a [Target](/HAL/Overview/Glossary#target) provided it is duplicated to match the number of "secondary" [Targets](/HAL/Overview/Glossary#target). To make that task easier we have included a template in **Move** called **Synchronized** which takes in a [Procedure](/HAL/Overview/Glossary#procedure) and a [Target](/HAL/Overview/Glossary#target), or **Target Resolver**, and will create all of the necessary [Moves](/HAL/Overview/Glossary#motion-action) for you with the correct synchronization settings to match the input _Procedure_. **Synchronized** [Move](/HAL/Overview/Glossary#motion-action) creates a [Procedure](/HAL/Overview/Glossary#procedure) as an output like any other **Move** and so it can be merged and **Combined** as we would normally with any other **Move**. With both of our [Procedures](/HAL/Overview/Glossary#procedure) now complete we can **Solve** and **Simulate** to see our [Positioner](/HAL/Overview/Glossary#positioner) aligning itself automatically to best present the [Targets](/HAL/Overview/Glossary#target) to the [Robot](/HAL/Overview/Glossary#manipulator).

---
### 3.7. Change a Tool at Runtime

#### Objective:

In this tutorial we'll see how to change the active [Tool](/HAL/Overview/Glossary#end-effector) of a [Mechanism](/HAL/Overview/Glossary#mechanism) during the execution of a [Procedure](/HAL/Overview/Glossary#procedure) in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Change a Tool at Runtime.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/3.7%20-%20Change%20a%20Tool%20at%20Runtime.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

There are scenarios in which a single [Robot](/HAL/Overview/Glossary#manipulator) may have access to multiple [Tools](/HAL/Overview/Glossary#end-effector) and the ability to change which [Tool](/HAL/Overview/Glossary#end-effector) is in use at runtime. This could be because, either, the [Tool](/HAL/Overview/Glossary#end-effector) itself has multiple [Endpoints](/HAL/Overview/Glossary#endpoint) or because automatic [Tool](/HAL/Overview/Glossary#end-effector) changing equipment is available in the [Cell](/HAL/Overview/Glossary#cell).

#### How to:

In preparation for this tutorial a number of things have been put in place. Firstly, three [Tools](/HAL/Overview/Glossary#end-effector) have been created; a simple cone, an interchange plate and a double cone with 2 distinct [Endpoints](/HAL/Overview/Glossary#endpoint). Secondly, these [Tools](/HAL/Overview/Glossary#end-effector) have each been positioned in front of the [Robot](/HAL/Overview/Glossary#manipulator) in a known location. And finally, a [Toolpath](/HAL/Overview/Glossary#toolpath) has been created to go to each of the [Tool](/HAL/Overview/Glossary#end-effector) picking positions with a jump in between. I have also prepared the standard **Combine**, **Solve**, and **Execute** flow.

The focus of this tutorial will be on the **Change Tool** component which can be found in the **HAL Robotics** tab under **Procedure**. Each version of this component will give us a [Procedure](/HAL/Overview/Glossary#procedure) that we can Combine with [Moves](/HAL/Overview/Glossary#motion-action) and [Waits](/HAL/Overview/Glossary#wait-action) as we have done countless times before. The **Change Tool** component has 3 templates and we'll cover them all, starting with **Detach Tool**. We're going to use this to remove the `Cone` [Tool](/HAL/Overview/Glossary#end-effector) that we've initially got attached to the [Robot](/HAL/Overview/Glossary#manipulator). We want to ensure the _Mechanism_ is the combined [Mechanism](/HAL/Overview/Glossary#mechanism) and we can specify the _Tool_ as the `Cone` [Tool](/HAL/Overview/Glossary#end-effector). The _Tool_ input is actually optional and the currently active [Tool](/HAL/Overview/Glossary#end-effector) will be removed if none is specified. We can weave this into our main [Procedure](/HAL/Overview/Glossary#procedure) and if you Solve and Execute, you'll see the Cone disappear when we hit the right [Target](/HAL/Overview/Glossary#target). The `Cone` is actually in the exact position we left it but it is no longer displayed because it's not part of our [Robot](/HAL/Overview/Glossary#manipulator). We can use the _Environment_ input on **Execute** to force the display of mobile, non-mechanism [Parts](/HAL/Overview/Glossary#part). If we now **Execute**, we should see the `Cone` hang in space where we detached it.

From here we're going to attach two [Tools](/HAL/Overview/Glossary#end-effector) to the [Robot](/HAL/Overview/Glossary#manipulator) in succession. The first is going to be the `Interface` which acts as something of a Tool Changer. Using the **Change Tool** component and the **Attach Tool** template we can set the combined [Mechanism](/HAL/Overview/Glossary#mechanism) as the _Mechanism_ again and the `Interface` as the _Tool_. Merging this into our [Procedure](/HAL/Overview/Glossary#procedure) will attach the `Interface` to our [Robot](/HAL/Overview/Glossary#manipulator) and we can visualize the [Parts](/HAL/Overview/Glossary#part) before they are attached using the same technique as for the `Cone`, passing the [Parts](/HAL/Overview/Glossary#part) into _Environment_ on **Execute**. If we repeat this process and attach the `MultiTool` this time, you should see that the `MultiTool` gets connected to the [Active Endpoint](/HAL/Overview/Glossary#endpoint) of the [Robot](/HAL/Overview/Glossary#manipulator), which in this case is the end of the `Interface`. This behavior may not always be desirable e.g. stationary tools, and can be modified in the overload of **Attach Tool**.

In this final combination of [Tools](/HAL/Overview/Glossary#end-effector) attached to the [Robot](/HAL/Overview/Glossary#manipulator) we have two distinct potential [Endpoints](/HAL/Overview/Glossary#endpoint). The final template of the **Change Tool** component allows us to set which [Endpoint](/HAL/Overview/Glossary#endpoint), or [Tool](/HAL/Overview/Glossary#end-effector) if you have multiple distinct [Tools](/HAL/Overview/Glossary#end-effector) attached, is currently Active. We do this by specifying, once again, the combined [Mechanism](/HAL/Overview/Glossary#mechanism), and the [Connection](/HAL/Overview/Glossary#connection) that we want to use as the [Active Endpoint](/HAL/Overview/Glossary#endpoint). To ensure consistent and deterministic output, I would recommend doing this immediately after attaching the `MultiTool` as well as when you may wish to switch between the two [Endpoints](/HAL/Overview/Glossary#endpoint). With that merged and our [Tool](/HAL/Overview/Glossary#end-effector) [Parts](/HAL/Overview/Glossary#part) in the _Environment_ we can see everything run.

---
### 3.8. Add Target Constraints
#### Coming Soon

---
### 3.9. Add Mechanism Constraints
#### Coming Soon

---
### 3.10. Using a Track

#### Objective:

In this tutorial we'll see how the previous tutorials on [synchronization](#35-synchronize-motion) and [Target Resolvers](#36-coupled-motion-and-resolving-targets) can be used together to program a **Track**, or [Linear Positioner](/HAL/Overview/Glossary#positioner), using the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Using a Track.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/3.10%20-%20Using%20a%20Track.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.
- Reading or watching the [Synchronize Motion](/HAL/Grasshopper/3-Motion#35-synchronize-motion) tutorial is highly recommended.
- Reading or watching the [Coupled Motion and Resolving Targets](/HAL/Grasshopper/3-Motion#36-coupled-motion-and-resolving-targets) tutorial is highly recommended.
- An extension to the HAL Robotics Framework that allows code export for external axes such as HAL.ABB or HAL.KUKA.

#### Background:

Mounting a [Robot](/HAL/Overview/Glossary#manipulator) on a **Track**, or linear axis [Positioner](/HAL/Overview/Glossary#positioner), can massively open up the usable space in a [Cell](/HAL/Overview/Glossary#cell). However, programming one [Mechanism](/HAL/Overview/Glossary#mechanism) whilst it's mounted on another can introduce a few complexities.

#### How to:

As per usual, we're going to start this session by modelling our [Cell](/HAL/Overview/Glossary#cell). This means picking our [Robot](/HAL/Overview/Glossary#manipulator), **Attaching** a [Tool](/HAL/Overview/Glossary#end-effector), and importing our [Positioner](/HAL/Overview/Glossary#positioner). This is where things start deviating slightly from our [synchronization](#35-synchronize-motion) tutorial. In this instance we actually want to mount one of our [Mechanisms](/HAL/Overview/Glossary#mechanism) on another. The HAL Robotics Framework doesn't really make a distinction between [Mechanism](/HAL/Overview/Glossary#mechanism) types e.g. [Positioner](/HAL/Overview/Glossary#positioner), [Robot](/HAL/Overview/Glossary#manipulator) or [Tool](/HAL/Overview/Glossary#end-effector), so we can use the exact same strategy as **Attaching** our [Tool](/HAL/Overview/Glossary#end-effector) to the [Robot](/HAL/Overview/Glossary#manipulator). We'll use the **Attach** component with the **Track** as the _Parent_ and the [Robot](/HAL/Overview/Glossary#manipulator) + [Tool](/HAL/Overview/Glossary#end-effector) combination as the _Child_. Ensure that _IsEndEffector_ is left as `true` because our _Child_ contains our desired [End Effector](/HAL/Overview/Glossary#end-effector). We can use the _Location_ and _InWorld_ parameters to adjust the position and orientation of the [Robot](/HAL/Overview/Glossary#manipulator) on the **Track**. This will create a single [Mechanism](/HAL/Overview/Glossary#mechanism) that we can program as we would any other [Mechanism](/HAL/Overview/Glossary#mechanism), however, this monolithic approach doesn't give us as much freedom as treating this like a multi-[Mechanism](/HAL/Overview/Glossary#mechanism) setup does. N.B. If you do use the single [Mechanism](/HAL/Overview/Glossary#mechanism) approach, ensure any [Joint space](/HAL/Overview/Glossary#joint-space) [Targets](/HAL/Overview/Glossary#target) are a) in SI units for the relevant joints, and b) are in the right order i.e. with the **Track** first in this case (_Parent_ joints followed by _Child_ joints). To return to a multi-[Mechanism](/HAL/Overview/Glossary#mechanism) scenario we can use the **Disassemble** component from **HAL Robotics** -\> **Cell**. This will split our [Mechanism](/HAL/Overview/Glossary#mechanism) into its constituent parts including its _SubMechanisms_, that is to say, the [Mechanisms](/HAL/Overview/Glossary#mechanism) which make it up. We can now treat the _SubMechanisms_ as we did our [Mechanisms](/HAL/Overview/Glossary#mechanism) in [previous](#35-synchronize-motion) [tutorials](#36-coupled-motion-and-resolving-targets).

There are a few subtleties to programming a **Track** so let's walk through an example. Let's start by preparing a simple curve following [Procedure](/HAL/Overview/Glossary#procedure) for the [Robot](/HAL/Overview/Glossary#manipulator) as we did in the [Getting Started tutorial](/HAL/Grasshopper/1-Getting-Started#1-getting-started). Ensure the **Track** is actually required by making this curve longer than the [Robot's](/HAL/Overview/Glossary#manipulator) reach. We can then program the **Track** using [Targets](/HAL/Overview/Glossary#target) as we do for any other [Mechanism](/HAL/Overview/Glossary#mechanism) for maximum control, or using the **Target Resolvers** seen in a [previous tutorial](#36-coupled-motion-and-resolving-targets) for a quick but effective approach. For a **Track** the **Offset** **Target Resolver** overload is of particular use. The default version of this component asks simply for an _Offset_ distance which is the distance the **Track's** [Endpoint](/HAL/Overview/Glossary#endpoint) (and by extension the [Robot's](/HAL/Overview/Glossary#manipulator) base) should be kept from the [Robot's](/HAL/Overview/Glossary#manipulator) [Target](/HAL/Overview/Glossary#target). Setting the _Offset_ to `0` or any value less than the distance between the **Track's** [Endpoint](/HAL/Overview/Glossary#endpoint) and [Target](/HAL/Overview/Glossary#target) will cause the **Track** to get as close to the [Target](/HAL/Overview/Glossary#target) as possible. To create a full [Procedure](/HAL/Overview/Glossary#procedure) for the **Track** we need to set some **Sync Settings** for the [Robot's](/HAL/Overview/Glossary#manipulator) [Move](/HAL/Overview/Glossary#motion-action) and can then use the **Synchronize** utility overload of the **Move** component to synchronize our **Target Resolver** with the full [Robot](/HAL/Overview/Glossary#manipulator) [Procedure](/HAL/Overview/Glossary#procedure) (see the [Synchronize Motion tutorial](/HAL/Grasshopper/3-Motion#35-synchronize-motion) for a refresher on how to do this). As one [Mechanism](/HAL/Overview/Glossary#mechanism) is moving another, you will also need to ensure that the **Kinematic Settings** are in place for this setup, with the **Track** as the _Primary_ and [Robot](/HAL/Overview/Glossary#manipulator) as a _Secondary_, in both the [Robot's](/HAL/Overview/Glossary#manipulator) [Move](/HAL/Overview/Glossary#motion-action) and the **Track's** (see the [Coupled Motion and Resolving Targets tutorial](/HAL/Grasshopper/3-Motion#36-coupled-motion-and-resolving-targets) as a reminder if needed). With this in place we are in a position to **Solve** and **Execute** and we should see both [Mechanisms](/HAL/Overview/Glossary#mechanism) moving as we expect.

Although [exporting](/HAL/Overview/Glossary#export) is covered in a later [tutorial](/HAL/Grasshopper/6-Control#62-export-a-procedure), there are a couple of things that need to be setup for external axes that are worth looking at here if your [Positioner](/HAL/Overview/Glossary#positioner) is an external axis and programmed within the same exported [Procedure](/HAL/Overview/Glossary#procedure) as your [Robot](/HAL/Overview/Glossary#manipulator).
1. You'll need to setup your [Joint Mappings](/HAL/Overview/Glossary#joint-mapping).  When you created or loaded your [Positioner](/HAL/Overview/Glossary#positioner) you will likely have glossed over the _Mapping(s)_ input. These values are 0-based indices of any external [axis](/HAL/Overview/Glossary#joint) that needs to be exported. In our example above, we have 6 axes in our [Robot](/HAL/Overview/Glossary#manipulator) and our [Positioner](/HAL/Overview/Glossary#positioner) comes after that. We can therefore assign it an index of `6` (0-based, so 7th when exported) or higher depending on the exact configuration of our real [Cell](/HAL/Overview/Glossary#cell).
2. You'll need to set your [Positioner](/HAL/Overview/Glossary#positioner) [Procedure](/HAL/Overview/Glossary#procedure) as a child of your [Robot](/HAL/Overview/Glossary#manipulator) [Procedure](/HAL/Overview/Glossary#procedure). This can be done in the [Controller](/HAL/Overview/Glossary#controller) configuration, accessible by double-clicking on your [Controller](/HAL/Overview/Glossary#controller) component. On the right-hand side of this window you should see both of the [Procedures](/HAL/Overview/Glossary#procedure) listed. Drag the [Positioner](/HAL/Overview/Glossary#positioner) [Procedure](/HAL/Overview/Glossary#procedure) onto the main [Procedure](/HAL/Overview/Glossary#procedure) to make it a child. As you're doing this, ensure that the _Task Alias_ of your main [Procedure](/HAL/Overview/Glossary#procedure) matches the target **Task** on your real [Controller](/HAL/Overview/Glossary#controller).

---

[Continue to: 4. I/O](/HAL/Grasshopper/4-IO#4-io)