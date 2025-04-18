---
title: null
mapFolderPath: tsmaps/HAL/decode/%CE%9E%203-Programming
fragsFolderPath: HAL/decode/3-Programming_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLCJo1rc","path":"HAL/decode","fragmentFolderPath":"HAL/decode/3-Programming_frags"},"fragment":{"id":"fdLCJo1rc","topLevelMapKey":"eGWgw90N3","mapKeyChain":"eGWgw90N3","guideID":"fdLCJo0tS","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/decode/3-Programming.tsmap","parentFragmentID":null,"chartKey":"eGWgw90N3","options":[]}} -->

## 3. Programming

[3.0. Procedures](#30-procedures)  
[3.1. Move](#31-move)  
[3.2. Wait for a Time](#32-wait-for-a-time)  
[3.3. Set a Signal](#33-set-a-signal)  
[3.4. Paths](#34-paths)  
[3.5. Custom Actions](#35-custom-actions)  
[3.6. Structuring Procedures](#36-structuring-procedures)  
[3.7. Validation and Simulation](#37-validation-and-simulation)  

---
### 3.0. Procedures

#### Objective:

In this tutorial we'll cover the main structure and background of [Procedures](/HAL/Overview/Glossary#procedure) in _decode_.

#### Background:

[Procedures](/HAL/Overview/Glossary#procedure) are a sequence of [Actions](/HAL/Overview/Glossary#action) to be executed by a [Controller](/HAL/Overview/Glossary#controller). In the **Programming** screen you'll find tools to create individual, atomic [Actions](/HAL/Overview/Glossary#action) like [Move](/HAL/Overview/Glossary#motion-action) or [Wait](/HAL/Overview/Glossary#wait-action) as well as ones which generate complex [Toolpaths](/HAL/Overview/Glossary#toolpath) comprised of 10s, 100s or even 1000s of individual [Actions](/HAL/Overview/Glossary#action).

Each [Robot](/HAL/Overview/Glossary#manipulator) has a main [Procedure](/HAL/Overview/Glossary#procedure), always the first in the list, assigned to it. You can add [Procedures](/HAL/Overview/Glossary#procedure) to a [Robot](/HAL/Overview/Glossary#manipulator) to help you [structure your code](#36-structuring-procedures), but it's only the main one which will be [Solved](/HAL/Overview/Glossary#solving), [Simulated](/HAL/Overview/Glossary#73-simulation) or [Exported](/HAL/Overview/Glossary#74-control). [Procedures](/HAL/Overview/Glossary#procedure) can be added via the **+** button in the upper right-hand corner of the **Programming** screen and renamed,or removed through the menu button next to it.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-Complete-01.png">](/HAL/assets/images/decode/03-Programming/Programming-Complete-01.png){: .pad-top}
<em>Even complex Toolpaths can be kept to simple Procedures in _decode_.</em>{: .pad-bottom}

---
### 3.1. Move

#### Objective:

In this tutorial we'll look at the different ways that we can program individual [Motions](/HAL/Overview/Glossary#motion-action) in _decode_.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**

#### Background:

Motions are the fundamental building block of [Robot](/HAL/Overview/Glossary#manipulator) programming instructing the [Robot](/HAL/Overview/Glossary#manipulator) to go from its current position to somewhere else. We define where a [Robot](/HAL/Overview/Glossary#manipulator) should move using [Targets](/HAL/Overview/Glossary#target) and how they should get there with [Motion](/HAL/Overview/Glossary#motion-action) Settings.
We can mix and match [Target](/HAL/Overview/Glossary#target) creation techniques with different [Motion Spaces](/HAL/Overview/Glossary#joint-space) ass we'll see below.

#### How to:

From the **Programming** screen, select the [Group](#36-structuring-procedures) into which you want to add your new [Move](/HAL/Overview/Glossary#motion-action), or click anywhere in the white space to clear your current selection. You can always drag and drop [Actions](/HAL/Overview/Glossary#action) onto [Groups](#36-structuring-procedures) or in between other [Actions](/HAL/Overview/Glossary#action) to restructure your [Procedure](/HAL/Overview/Glossary#procedure) later. Either of those states will enable the _Item Type_ selector to list [Move](/HAL/Overview/Glossary#motion-action) as an option. Click **+** and you'll start creating a [Move](/HAL/Overview/Glossary#motion-action).

There are two _Steps_ here which align with the _where_ and _how_ the [Robot](/HAL/Overview/Glossary#manipulator) moves mentioned above.

There are 2 main ways of creating [Targets](/HAL/Overview/Glossary#target), both of which are found in the **Target** _Step_.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-Move-Target.png">](/HAL/assets/images/decode/03-Programming/Programming-Move-Target.png){: .pad-top}
<em>Targets in _decode_ can be edited in Joint or Cartesian spaces.</em>{: .pad-bottom}

The first way of creating a [Target](/HAL/Overview/Glossary#target) is in [Joint space](/HAL/Overview/Glossary#joint-space), that is by defining the desired position of each active [Joint](/HAL/Overview/Glossary#joint) of your [Robot](/HAL/Overview/Glossary#manipulator). The list of _Positions_ correspond to each active [Robot](/HAL/Overview/Glossary#manipulator) [Joint](/HAL/Overview/Glossary#joint). As you change these values, you can visualize the final position of our [Robot](/HAL/Overview/Glossary#manipulator) at these [Joint](/HAL/Overview/Glossary#joint) positions.

The other way of creating a [Target](/HAL/Overview/Glossary#target) is a [Cartesian](/HAL/Overview/Glossary#cartesian-space) [Target](/HAL/Overview/Glossary#target) from a **Frame**. When a [Robot](/HAL/Overview/Glossary#manipulator) moves to a [Cartesian](/HAL/Overview/Glossary#cartesian-space) [Target](/HAL/Overview/Glossary#target) the active [TCP](/HAL/Overview/Glossary#endpoint) of our [Robot](/HAL/Overview/Glossary#manipulator) will align with the [Target's](/HAL/Overview/Glossary#target) position and orientation. As you change the values of that **Frame** you can see our [Target](/HAL/Overview/Glossary#target) move and our [Robot](/HAL/Overview/Glossary#manipulator) moves with it. A **Frame** is always relative to a [Reference](/HAL/Overview/Glossary#reference) which can also be set here. Please take a look at the [References tutorial](/HAL/decode/2-Cell#23-create-a-reference) to see how those work.

At the top of the **Target** _Step_ is a crucial selector. It allows us to specify the [Motion Space](/HAL/Overview/Glossary#joint-space) in which we want to store the [Target](/HAL/Overview/Glossary#target). _N.B. This does not affect **how** we move to the [Target](/HAL/Overview/Glossary#target)._ 
Selecting [Joint Space](/HAL/Overview/Glossary#joint-space) will mean that we consider only those [Joint](/HAL/Overview/Glossary#joint) positions and we ignore the [Cartesian](/HAL/Overview/Glossary#cartesian-space) **Frame**. If, for example, you were to change the length of your [Tool](/HAL/Overview/Glossary#end-effector) or the location of a [Reference](/HAL/Overview/Glossary#reference), it wouldn't matter because these are fixed values for each [Joint](/HAL/Overview/Glossary#joint).
Selecting [Cartesian Space](/HAL/Overview/Glossary#cartesian-space) will mean that we only consider the [Cartesian](/HAL/Overview/Glossary#cartesian-space) **Frame**. If, for example, you were to change the length of your [Tool](/HAL/Overview/Glossary#end-effector) or the location of a [Reference](/HAL/Overview/Glossary#reference), we will recompute the values for each [Joint](/HAL/Overview/Glossary#joint) to get the [Robot](/HAL/Overview/Glossary#manipulator) into that position.

Either of these [Target](/HAL/Overview/Glossary#target) creation options give exactly the same types of [Target](/HAL/Overview/Glossary#target) so can be used with any **Motion Settings**.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-Move-MotionSettings.png">](/HAL/assets/images/decode/03-Programming/Programming-Move-MotionSettings.png){: .pad-top}
<em>Motion Settings tell the Robot how to get to the Target.</em>{: .pad-bottom}

_Motion Type_ controls which path the [Robot](/HAL/Overview/Glossary#manipulator) takes to a [Target](/HAL/Overview/Glossary#target). In `Cartesian` mode the [TCP](/HAL/Overview/Glossary#endpoint) moves in a very controlled manner along a straight line or arc. This is probably the easier motion type to visualize but can cause problems when moving between configurations or when trying to optimise cycle times. Moving in [Joint space](/HAL/Overview/Glossary#joint-space) means that each [Joint](/HAL/Overview/Glossary#joint) will move from one position to the next without consideration for the position of the [TCP](/HAL/Overview/Glossary#endpoint). [Joint space](/HAL/Overview/Glossary#joint-space) [Moves](/HAL/Overview/Glossary#motion-action) always end in the same configuration and are not liable to [Singularities](/HAL/Overview/Glossary#(kinematic)-singularity). It's often useful to start your [Procedures](/HAL/Overview/Glossary#procedure) with a [Motion](/HAL/Overview/Glossary#motion-action) in [Joint space](/HAL/Overview/Glossary#joint-space) to ensure your [Robot](/HAL/Overview/Glossary#manipulator) is always initialized to a known position and configuration. It's worth noting that when using [Joint space](/HAL/Overview/Glossary#joint-space) [Motions](/HAL/Overview/Glossary#motion-action) your [Toolpath](/HAL/Overview/Glossary#toolpath) preview will be dotted until the [Procedure](/HAL/Overview/Glossary#procedure) is [Solved](/HAL/Overview/Glossary#solving) because we can't know ahead of time exactly where the [TCP](/HAL/Overview/Glossary#endpoint) will go during that [Motion](/HAL/Overview/Glossary#motion-action). Once [Solved](/HAL/Overview/Glossary#solving), you will see the path your [TCP](/HAL/Overview/Glossary#endpoint) will actually take in space.

_[Blends](/HAL/Overview/Glossary#blend)_ sometimes called zones or approximations change how close the [Robot](/HAL/Overview/Glossary#manipulator) needs to get to a [Target](/HAL/Overview/Glossary#target) before moving on to the next. It's useful to consider your _[Blends](/HAL/Overview/Glossary#blend)_ carefully because increasing their size can drastically improve cycle time by allowing the [Robot](/HAL/Overview/Glossary#manipulator) to maintain speed instead of coming to a stop at each [Target](/HAL/Overview/Glossary#target). _[Blends](/HAL/Overview/Glossary#blend)_ are most easily visualized in _Position_. If we set a 100 mm radius [Blend](/HAL/Overview/Glossary#blend), we can see a circle appear around our [Target](/HAL/Overview/Glossary#target) (unless it's the very first in a Procedure). This indicates that the [Robot](/HAL/Overview/Glossary#manipulator) will exactly follow our [Toolpath](/HAL/Overview/Glossary#toolpath) until it gets within 100 mm of the [Target](/HAL/Overview/Glossary#target), at which point it will start to deviate within that circle to keep its speed up and head towards the subsequent [Target](/HAL/Overview/Glossary#target). It will exactly follow our [Toolpath](/HAL/Overview/Glossary#toolpath) again when it leaves the circle. When we solve our [Procedure](/HAL/Overview/Glossary#procedure), we can see the path our [TCP](/HAL/Overview/Glossary#endpoint) will actually take getting close but not actually to all of our [Targets](/HAL/Overview/Glossary#target).

_Speed_ settings, as the name implies, constrain the speed of your [Robot](/HAL/Overview/Glossary#manipulator). They can be declared in [Cartesian space](/HAL/Overview/Glossary#cartesian-space) to directly limit the position or orientation _Speed_ of the [TCP](/HAL/Overview/Glossary#endpoint). You can also constrain the _Speeds_ of your [Robot's](/HAL/Overview/Glossary#manipulator) [Joints](/HAL/Overview/Glossary#joint) using the second overload or combine the two using the third overload. Please note that not all [Robot](/HAL/Overview/Glossary#manipulator) manufacturers support programmable [Joint](/HAL/Overview/Glossary#endpoint) speed constraints so there may be variations between your simulation and real [Robot](/HAL/Overview/Glossary#manipulator) when they are used.

_Acceleration_ settings constrain the acceleration of your [Robot](/HAL/Overview/Glossary#manipulator). They function in exactly the same way as the _Speeds_, constraining [Cartesian](/HAL/Overview/Glossary#cartesian-space) acceleration, [Joint](/HAL/Overview/Glossary#joint-space) acceleration or both.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-Move-MotionSettings-Variable.png">](/HAL/assets/images/decode/03-Programming/Programming-Move-MotionSettings-Variable.png){: .pad-top}
<em>Linking Motion Settings to Variables helps speed up any changes you might need to make in the future and are necessary if you want an operator to be able to change a value.</em>{: .pad-bottom}

Once you are happy with the [Move](/HAL/Overview/Glossary#motion-action)'s setup, ensure the name makes it easy to identify and click **ok** in the upper right corner to return to the **Programming** screen.

---
### 3.2. Wait for a Time

#### Objective:

In this tutorial we'll create a [Wait Action](/HAL/Overview/Glossary#wait-action) that pauses [Robot](/HAL/Overview/Glossary#manipulator) execution for a fixed period of time using the HAL Robotics Framework for Grasshopper.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**

#### Background:

In certain scenarios it may be necessary to have your [Robot](/HAL/Overview/Glossary#manipulator) [Wait](/HAL/Overview/Glossary#wait-action) in its current position. This could be because it's taking a measurement, a [Tool](/HAL/Overview/Glossary#end-effector) is working or simply because something else is happening in the environment. If the time to [Wait](/HAL/Overview/Glossary#wait-action) is a constant, such as the time required for a gripper to open, then a **Wait Time** [Action](/HAL/Overview/Glossary#action) is a good solution.

#### How to:

From the **Programming** screen, select the [Group](#36-structuring-procedures) into which you want to add your new [Wait](/HAL/Overview/Glossary#wait-action), or click anywhere in the white space to clear your current selection. You can always drag and drop [Actions](/HAL/Overview/Glossary#action) onto [Groups](#36-structuring-procedures) or in between other [Actions](/HAL/Overview/Glossary#action) to restructure your [Procedure](/HAL/Overview/Glossary#procedure) later. Either of those states will enable the _Item Type_ selector to list [Wait](/HAL/Overview/Glossary#wait-action) as an option. Click **+** and you'll start creating a [Wait Action](/HAL/Overview/Glossary#wait-action).

[<img src="/HAL/assets/images/decode/03-Programming/Programming-WaitTime-Complete.png">](/HAL/assets/images/decode/03-Programming/Programming-WaitTime-Complete.png){: .pad-top}
<em>Waits allow the Robot to hold in position for a given time.</em>{: .pad-bottom}

The default, **From Time** _Creator_ will allow you to set the time for which the robot should pause. For example, if the _Time_ is set to 2 seconds, when we [Simulate](#37-validation-and-simulation) the [Robot](/HAL/Overview/Glossary#manipulator) pauses for 2 seconds.

Once you are happy with the [Wait](/HAL/Overview/Glossary#wait-action)'s setup, ensure the name makes it easy to identify and click **ok** in the upper right corner to return to the **Programming** screen.

---
### 3.3. Set a Signal

#### Objective:

In this tutorial we'll change the state of a [Signal](/HAL/Overview/Glossary#signal) at runtime in _decode_.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**
- A [Signal](/HAL/Overview/Glossary#signal) in your **Network**. If you don't have one, see the [Create a Signal](/HAL/decode/2-Cell#26-create-a-signal) tutorial for more information.

#### Background:

Electrical Input and Output (I/O) [Signals](/HAL/Overview/Glossary#signal) are used to activate or deactivate [Tools](/HAL/Overview/Glossary#end-effector), trigger actions on remote machines or pass data between **Sensors**. The activation of these [Signals](/HAL/Overview/Glossary#signal) needs to be triggered at the right time during program execution, something we can do easily with [Signal Actions](/HAL/Overview/Glossary#signal-action).

#### How to:

In our previous tutorial, we created a digital output [Signal](/HAL/Overview/Glossary#signal) within a [Controller](/HAL/Overview/Glossary#controller) and assigned it an appropriate _Name_.. We now want to change the state of that [Signal](/HAL/Overview/Glossary#signal) during the execution of a [Procedure](/HAL/Overview/Glossary#procedure). To do so, from the **Programming** screen, select the [Group](#36-structuring-procedures) into which you want to add your new [Signal Action](/HAL/Overview/Glossary#signal-action), or click anywhere in the white space to clear your current selection. You can always drag and drop [Actions](/HAL/Overview/Glossary#action) onto [Groups](#36-structuring-procedures) or in between other [Actions](/HAL/Overview/Glossary#action) to restructure your [Procedure](/HAL/Overview/Glossary#procedure) later. Either of those states will enable the _Item Type_ selector to list [Set Signal](/HAL/Overview/Glossary#signal-action) as an option. Click **+** and you'll start creating a [Signal Action](/HAL/Overview/Glossary#signal-action). 

[<img src="/HAL/assets/images/decode/03-Programming/Programming-SetSignal-Complete.png">](/HAL/assets/images/decode/03-Programming/Programming-SetSignal-Complete.png){: .pad-top}
<em>Signals can be used to activate or deactivate Tools or trigger actions.</em>{: .pad-bottom}

You'll have a _Creator_ for each type of [Signal](/HAL/Overview/Glossary#signal) available, e.g. **Set Digital Output** or **Set Analog Output**. Within each you will find a list of the relevant [Signals](/HAL/Overview/Glossary#signal) in your **Network** and a _Value_ which should be assigned.

Once you are happy with the [Signal Action](/HAL/Overview/Glossary#signal-action)'s setup, ensure the name makes it easy to identify and click **ok** in the upper right corner to return to the **Programming** screen.

---
### 3.4. Paths

#### Objective:

In this tutorial we'll see how to combine different [Procedures](/HAL/Overview/Glossary#procedure) to chain sequences using the HAL Robotics Framework for Grasshopper.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**
- A [CAD Model](/HAL/decode/2-Cell#24-create-a-part) in the **Scene**

#### Background:

Building [Procedures](/HAL/Overview/Glossary#procedure) [Action](/HAL/Overview/Glossary#action) by [Action](/HAL/Overview/Glossary#action) might be sufficient for some processes but longer Toolpaths can more easily be generated based on some sort of geometry, be that curves, surfaces or meshes. **Paths** allow exactly that including options for triggering sub-[Procedures](/HAL/Overview/Glossary#procedure) and jumping between different sections of the **Path**.

#### How to:

From the **Programming** screen, select the [Group](#36-structuring-procedures) into which you want to add your new **Path**, or click anywhere in the white space to clear your current selection. You can always drag and drop [Actions](/HAL/Overview/Glossary#action) onto [Groups](#36-structuring-procedures) or in between other [Actions](/HAL/Overview/Glossary#action) to restructure your [Procedure](/HAL/Overview/Glossary#procedure) later. Either of those states will enable the _Item Type_ selector to list **Path** as an option. Click **+** and you'll start creating a **Path**.

There are two _Creators_ in **Path**, **Follow Curve** and **Follow Pattern**. The former allows you to select or create curves within your **Scene** whilst the latter uses curves, surfaces or meshes as input regions that can be filled with a pattern. After that first **Curve** or **Pattern** creation section, the _Creators_ then follow exactly the same structure.

##### Follow Curve

There are lots of different ways to assign curves for the **Path** to follow, grouped in the **Source** setting. If you want to follow the edge of a CAD Model you have in your **Scene**, **From Model** lets you select that geometry. In the **From Model** settings you'll find a selector which allows you to add or remove curves to a collection. Click on **select** and then the **+** button in the pop-up to start selecting. Any eligible curves within your model will be highlighted when you hover over them and a single click will add them to the selection. You will see a banner appear above your 3D viewport which has extra information about the next step in the selection process, in this case how to confirm your selection and return to the pop-up. All the curves you selected will be listed here and can be individually removed using the **X** next to each item, or all cleared with the **X** next to he **+** button. You can return to adding or removing curves from the model by clicking the **+** again. When you're happy with your selection click **ok** and you'll be returned to the **Path** editor.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-FollowCurve-FromModel-Selector.png">](/HAL/assets/images/decode/03-Programming/Programming-FollowCurve-FromModel-Selector.png){: .pad-top}
<em>You can select the edges of CAD Models to get your Robots to follow them.</em>{: .pad-bottom}

The other **Sources** allow you to create curves on any CAD Models you have imported. They will all ask you for one or more **Host** **Locations** which can be selected on any CAD Model in your **Scene**, and then a series of relevant **Settings**. There lots of possibilities here so it's well worth experimenting with all the options to see what can be achieved. For example from the **Spiral** _Source_, setting the _Inner Radius_ and _Outer Radius_ to the same value (maybe even a [Variable](/HAL/decode/1-Getting-Started#14-variables)), and deactivating **Flat**, will allow you to create a cylindrical spiral at some point(s) on your CAD Model. Or linking your **Location(s)** to a [Variable](/HAL/decode/1-Getting-Started#14-variables) will allow you to apply several different curves to the same locations.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Concentric.png">](/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Concentric.png){: .pad-top}
<em>Complex curves can be generated all over your CAD Models.</em>{: .pad-bottom}

The **Modifiers** then allow you to manipulate those curves, _Flipping_ their direction to control which way the [Robot](/HAL/Overview/Glossary#manipulator) [Moves](/HAL/Overview/Glossary#motion-action) along them, _Extending_ them to over shoot (or using negative values to inset the start and end points). For **From Model** curves, _Join_ determines whether curves whose ends touch should be considered as a single joined curve or not and _Preserve Direction_ adds a little extra control over when that joining is applied.

##### Follow Pattern

Both **Follow Pattern** _Creators_ require some means of defining a **Region** to work. _Planar_ requires the selection of _Boundary_ curves from a CAD Model. Those can either be independent closed regions or one inside another which will be treated as holes within the outermost region. _Non-Planar_ regions need a surface or mesh from a CAD Model. It's best to explode complex models into their usable surfaces or meshes in your CAD editor of choice before importing them to make this easier. If you have curves within you CAD Models you can also set these are _Boundaries_ on the _Host_ surfaces but if no _Boundaries_ are specified we'll the edges of those surfaces in their stead.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Selector.png">](/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Selector.png){: .pad-top}
<em>Managing the separate surfaces in your original CAD file will make selection easier.</em>{: .pad-bottom}

With a **Region** in place, we can **Create a Pattern**. The _Pattern Type_ will determine the settings available so, again, it's worth experimenting to see what they all do. All _Pattern Types_ work well on _Planar_ **Regions** but we only recommend _Concentric_ or _Parallel_ on _Non-Planar_ **Regions**.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Concentric.png">](/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Concentric.png){: .pad-top}
<em>Entire surfaces, including non-planar ones, can be covered in patterns.</em>{: .pad-bottom}

##### Target Generation

The **Targets** _Step_ allows you to decide how the geometry we have no selected or created should be subdivided into [Moves](/HAL/Overview/Glossary#motion-action). The _Subdivision_ _Method_ allows you to decide how the inputs should be approximated whilst the _Tolerance_ allows you to specify how accurately the input should be followed. A larger _Tolerance_ value will allow greater deviation from the input but will result in fewer [Targets](/HAL/Overview/Glossary#target). Whilst it might seem desirable to make that as low as possible, having too many [Targets](/HAL/Overview/Glossary#target) will generate lots of code and may have a negative impact on [Robot](/HAL/Overview/Glossary#manipulator) performance. The **Guide** settings allow you to automatically orient your [Targets](/HAL/Overview/Glossary#target) to follow some geometry. For example if you were applying a _Pattern_ to a surface, the _Guide_ would enable you to keep all your [Targets](/HAL/Overview/Glossary#target) normal (perpendicular) to that surface, or if you have selected curves **From Model** you could keep one of the axes tangent to them (_Use Curve As Guide_).

[<img src="/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Guide.png">](/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Guide.png){: .pad-top}
<em>Targets can be aligned to a guide surface to maintain perpendicularity to that surface.</em>{: .pad-bottom}

**Transform [Targets](/HAL/Overview/Glossary#target)** allows you to offset your [Targets](/HAL/Overview/Glossary#target) uniformly. This is applied relative to the [Target](/HAL/Overview/Glossary#target) itself when in _Parent_ or to the _World_ when the Reference is set to the _World_. If for example you had a pattern across a surface with all of your [Targets](/HAL/Overview/Glossary#target)' Z-axes facing into that surface, you could moving them all off the surface by 20mm by setting the _Position Z_ value to `-20` (minus because it's in the opposite direction to the Z axis). Or you could rotate all of your [Targets](/HAL/Overview/Glossary#target) around their X-axes by changing the _Rotation X_ value.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Transform.png">](/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Transform.png){: .pad-top}
<em>Targets can be offset to create spacing between a Part and the Tool.</em>{: .pad-bottom}

##### Motion

**Motion Settings** are exactly the same as you will have seen in the [Move](#31-move) tutorial.

##### Jumps

It's possible that your **Path** is a single continuous sequence of [Targets](/HAL/Overview/Glossary#target), but if there are breaks in it **Jumps** allow you to specify how the [Robot](/HAL/Overview/Glossary#manipulator) should get from the end of one sequence to the start of the next. There are 5 phases to the **Jump** _Step_ that can all be controlled by the same settings or specified individually.
- **Path Entry** specifies where the [Robot](/HAL/Overview/Glossary#manipulator) should [Move](/HAL/Overview/Glossary#motion-action) to before the start of the first sequence.
- **Path Exit** specifies where the [Robot](/HAL/Overview/Glossary#manipulator) should [Move](/HAL/Overview/Glossary#motion-action) to after the end of the last sequence.
- **Jump Start** specifies where the [Robot](/HAL/Overview/Glossary#manipulator) should [Move](/HAL/Overview/Glossary#motion-action) to after the end of any other sequence.
- **Jump End** specifies where the [Robot](/HAL/Overview/Glossary#manipulator) should [Move](/HAL/Overview/Glossary#motion-action) to before the start of any other sequence.
- **Jump Travel** dictates how the [Robot](/HAL/Overview/Glossary#manipulator) [Moves](/HAL/Overview/Glossary#motion-action) between **Jump Start** and **Jump End**.

The settings within each of those phases should be familiar by now.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Jumps.png">](/HAL/assets/images/decode/03-Programming/Programming-FollowPattern-NonPlanar-Jumps.png){: .pad-top}
<em>Jumps allow you to control how the Robot gets between segments of your Toolpath.</em>{: .pad-bottom}

**Jump Events** allow you to specify if anything should happen during the **Path** or its **Jumps**. That could include activating or deactivating a Tool, triggering a Signal or a Wait. They are all [Procedure](/HAL/Overview/Glossary#procedure) **Calls** and therefore need to be created within sub-Procedures. See [Structuring Procedures](#36-structuring-procedures) for more details about how those are created.

- **Entry** **On Approach** is called at the **Path Entry** [Target](/HAL/Overview/Glossary#target).
- **Entry** **On Start** is called at the first [Target](/HAL/Overview/Glossary#target) of the first sequence only.
- **Jumps** **On Departure** is called at the last [Target](/HAL/Overview/Glossary#target) of each sequence.
- **Jumps** **On Retract** is called at the **Jump Start** point of each sequence.
- **Jumps** **On Travel** is called at the **Jump End** point of each sequence.
- **Jumps** **On Arrival** is called at the first [Target](/HAL/Overview/Glossary#target) of each sequence.
- **Exit** **On End** is called at the last [Target](/HAL/Overview/Glossary#target) of the last sequence only.
- **Exit** **On Retract** is called at the **Path Exit** [Target](/HAL/Overview/Glossary#target).

Once you are happy with the **Path**'s setup, ensure the name makes it easy to identify and click **ok** in the upper right corner to return to the **Programming** screen.

---
### 3.5. Custom Actions

#### Objective:

In this tutorial we'll use a [Custom Action](/HAL/Overview/Glossary#custom-action) to trigger an existing [Robot](/HAL/Overview/Glossary#manipulator) function using _decode_.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**

#### Background:

When working with a fully integrated [Cell](/HAL/Overview/Glossary#cell) or using a [Robot](/HAL/Overview/Glossary#manipulator) with pre-built functionality which isn't natively supported by the HAL Robotics Framework, you may want add code to your export which calls an existing function in the [Controller](/HAL/Overview/Glossary#controller). We do this using [Custom Actions](/HAL/Overview/Glossary#custom-action). Common for [Custom Actions](/HAL/Overview/Glossary#custom-action) are opening or closing a gripper, running tool change procedures, starting logging, activating collision boxes, popping up messages to the operator etc.

#### How to:

From the **Programming** screen, select the [Group](#36-structuring-procedures) into which you want to add your new [Custom Action](/HAL/Overview/Glossary#custom-action), or click anywhere in the white space to clear your current selection. You can always drag and drop [Actions](/HAL/Overview/Glossary#action) onto [Groups](#36-structuring-procedures) or in between other [Actions](/HAL/Overview/Glossary#action) to restructure your [Procedure](/HAL/Overview/Glossary#procedure) later. Either of those states will enable the _Item Type_ selector to list [Custom Action](/HAL/Overview/Glossary#custom-action) as an option. Click **+** and you'll start creating a [Custom Action](/HAL/Overview/Glossary#custom-action). 

The main thing required here is our _Code_. This should just be the textual representation of the code that you want to export. For example if you wanted to create a pop-up message on an ABB robot you could write _TPWrite "Hello Robot";_ and that exact line of code will be exported within your program.

Other than the _Name_, which we recommend always setting, the other setting is _Simulation_. This allows you to select a [Procedure](/HAL/Overview/Glossary#procedure) which will change how this [Action](/HAL/Overview/Glossary#action) is simulated but won't affect how it's [Exported](/HAL/Overview/Glossary#export). If you know it's going to take a second for your gripper to close, for example, you could put a [Wait](/HAL/Overview/Glossary#wait-action) [Action](/HAL/Overview/Glossary#action) in a [sub-procedure](#36-structuring-procedures), assign it to your _Simulation_ and the program will pause when simulated but the code won't contain any [Wait](/HAL/Overview/Glossary#wait-action) instructions.

Once you are happy with the [Custom Action](/HAL/Overview/Glossary#custom-action)'s setup, ensure the name makes it easy to identify and click **ok** in the upper right corner to return to the **Programming** screen.

---
### 3.6. Structuring Procedures

#### Objective:

In this tutorial we'll see how to simplify your programming by structuring your [Procedures](/HAL/Overview/Glossary#procedure) in _decode_.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**

#### Background:

Once your [Procedures](/HAL/Overview/Glossary#procedure) start to get more complex, you will likely find that certain sequences of [Actions](/HAL/Overview/Glossary#action) are repeated. That could include moving the [Robot](/HAL/Overview/Glossary#manipulator) to a home position, (de)activating a [Tool](/HAL/Overview/Glossary#end-effector) or setting some collection of Signals. Even if those sequences aren't repeated, it may help the legibility of your [Procedures](/HAL/Overview/Glossary#procedure) to create a hierarchy to collect [Actions](/HAL/Overview/Glossary#action) into logical groups. We have two ways of doing that in _decode_, **Groups** and [Procedure](/HAL/Overview/Glossary#procedure) Calls.

#### How to:

From the **Programming** screen, click in some white space to clear your selection. The _Item Type_ selector should now list **Group** and **Call**.

Starting with **Group**, click **+** and we'll enter the **Group** editor. There are no settings in here other than the name so set one that makes it easy to identify and click **ok** in the upper right corner to return to the **Programming** screen. If you then select your new **Group** you'll see that any [Action](/HAL/Overview/Glossary#action) can be created within it or existing [Actions](/HAL/Overview/Glossary#action) can be dragged in or out of it. That's all there is to **Groups**, they're there to help you keep [Procedures](/HAL/Overview/Glossary#procedure) organised.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-Groups.png">](/HAL/assets/images/decode/03-Programming/Programming-Groups.png){: .pad-top}
<em>Groups can help to structure longer Procedures.</em>{: .pad-bottom}

[Procedure](/HAL/Overview/Glossary#procedure) Calls, however, are a little more involved. Before we can use one we'll need a sub-[Procedure](/HAL/Overview/Glossary#procedure) to call. In the top right-hand corner you'll see another **+** button and a three bar menu (**☰**). Either of those can be used to add a new Procedure, and the menu can also be used to rename or delete your additional [Procedures](/HAL/Overview/Glossary#procedure). As usual give this [Procedure](/HAL/Overview/Glossary#procedure) an identifiable name, add some [Actions](/HAL/Overview/Glossary#action) and then use the [Procedure](/HAL/Overview/Glossary#procedure) selector to return to your main [Procedure](/HAL/Overview/Glossary#procedure). 

[<img src="/HAL/assets/images/decode/03-Programming/Programming-SubProcedures-Complete.png">](/HAL/assets/images/decode/03-Programming/Programming-SubProcedures-Complete.png){: .pad-top}
<em>Sub-Procedures allow you to create reusable blocks of code.</em>{: .pad-bottom}

Once back in your main [Procedure](/HAL/Overview/Glossary#procedure)'s editor, with a **Group** or nothing selected, select **Call** from the _Item Type_ selector and click **+** to add one. The default _Creator_ has a **Configure** _Step_ which will allow you to select which [Procedure](/HAL/Overview/Glossary#procedure) you want to call. This will automatically rename your **Call**. Once you are happy with the **Call**'s setup click **ok** in the upper right corner to return to the **Programming** screen.

[<img src="/HAL/assets/images/decode/03-Programming/Programming-CallProcedure.png">](/HAL/assets/images/decode/03-Programming/Programming-CallProcedure.png){: .pad-top}
<em>Procedure Calls allow you to reuse sub-Procedures e.g. to deactivate a Tool.</em>{: .pad-bottom}

---
### 3.7. Validation and Simulation

#### Objective:

In this tutorial we'll see how to Simulate our [Procedure](/HAL/Overview/Glossary#procedure) in _decode_ to ensure it does what we expect.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**
- Some [Actions](/HAL/Overview/Glossary#action) in your main Procedure

#### Background:

There are scenarios in which a single [Robot](/HAL/Overview/Glossary#manipulator) may have access to multiple [Tools](/HAL/Overview/Glossary#end-effector) and the ability to change which [Tool](/HAL/Overview/Glossary#end-effector) is in use at runtime. This could be because, either, the [Tool](/HAL/Overview/Glossary#end-effector) itself has multiple [Endpoints](/HAL/Overview/Glossary#endpoint) or because automatic [Tool](/HAL/Overview/Glossary#end-effector) changing equipment is available in the [Cell](/HAL/Overview/Glossary#cell).

#### How to:

In the **Programming** screen, between the [Procedure](/HAL/Overview/Glossary#procedure) selector and the _Item Type_ selector you should see a large blue **solve** button. Clicking that will run a very fast simulation behind the scenes during which _decode_ will work out how the [Robot](/HAL/Overview/Glossary#manipulator) is going to follow any Toolpaths you've created and check for potential issues. If your [Procedure](/HAL/Overview/Glossary#procedure) is solved that button will be replaced by a **simulation control bar** with **reset**, **play**/**pause**, **next**, **previous**, and **loop** buttons as well as a **time ratio** slider to change the playback speed of the simulation. This won't change the programmed or exported speeds, it's just like skipping faster or slower through time. On the far right-hand side of that bar is a button with some graphs. That will open the [Procedure](/HAL/Overview/Glossary#procedure) Timeline which will show you the details of your [Robot](/HAL/Overview/Glossary#manipulator)'s [Motion](/HAL/Overview/Glossary#motion-action) and highlight any issues during the [Procedure](/HAL/Overview/Glossary#procedure).

[<img src="/HAL/assets/images/decode/03-Programming/Programming-Solved-Timeline-Middle.png">](/HAL/assets/images/decode/03-Programming/Programming-Solved-Timeline-Middle.png){: .pad-top}
<em>Solving the Procedure triggers the validation of the Procedure and allows its simulation.</em>{: .pad-bottom}

Every time you make a change to anything in your [Procedure](/HAL/Overview/Glossary#procedure) you'll need to re-**solve** but we'll remember what happened last time so subsequent **solve**s will be faster.

---

[Continue to: 4. Operator Workflows](/HAL/decode/4-Workflows#4-operator-workflows)