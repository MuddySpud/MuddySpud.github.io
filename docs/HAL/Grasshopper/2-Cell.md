---
title: null
mapFolderPath: tsmaps/HAL/Grasshopper/%CE%9E%202-Cell
fragsFolderPath: HAL/Grasshopper/2-Cell_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLC480dF","path":"HAL/Grasshopper","fragmentFolderPath":"HAL/Grasshopper/2-Cell_frags"},"fragment":{"id":"fdLC480dF","topLevelMapKey":"eGVQJ60uV","mapKeyChain":"eGVQJ60uV","guideID":"fdLC481xd","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/Grasshopper/2-Cell.tsmap","parentFragmentID":null,"chartKey":"eGVQJ60uV","options":[]}} -->

## 2. Cell

[2.1. Insert a Robot](#21-insert-a-robot)  
[2.2. Create a Reference](#22-create-a-reference)  
[2.3. Create a Part](#23-create-a-part)  
[2.4. Create a Tool](#24-create-a-tool)  
[2.5. Calibrate a Reference or Tool](#25-calibrate-a-reference-or-tool)  
[2.6. Create a Multi-Part Tool](#26-create-a-multi-part-tool)  
[2.7. Create a Positioner](#27-create-a-positioner)  
[2.8. Save a Mechanism as a Preset \[Coming Soon\]](#28-save-a-mechanism-as-a-preset)  

---
### 2.1. Insert a Robot

#### Objective:

In this quick tutorial we'll take a look how to insert a **Robot** preset in the HAL Robotics Framework for Grasshopper.

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### How to:

Within the **HAL Robotics** tab, under the **Cell** panel you will find a component called **Robot**. When you place this in the document you will notice that it has two interlocking squares **⧉** in its name. This is the symbol for a [pop-up window component](/HAL/Grasshopper/1-Getting-Started#13-components) meaning we can double click on the component to bring up an additional user interface. In this case that's a catalog listing all of the available [Robots](/HAL/Overview/Glossary#manipulator) we've pre-created for your immediate use. 

You can use the search bar or tags listed on the left-hand side of the window to filter the [Robots](/HAL/Overview/Glossary#manipulator) to find the one you want. Once you have identified the [Robot](/HAL/Overview/Glossary#manipulator) you want to add to the document simply double click or use the "Select" button to instantiate your [Robot](/HAL/Overview/Glossary#manipulator) in the scene. If you intend to [Export](/HAL/Overview/Glossary#export) code to your [Robot](/HAL/Overview/Glossary#manipulator) it is a good habit to name your virtual **Robot** to match the real one using the _Alias_ input. For example, the `IRB-1200` we have in the office is configured as `HAL_Jarvis`.

[<img src="/HAL/assets/images/Grasshopper/21Robot.gif">](/HAL/assets/images/Grasshopper/21Robot.gif){: .big-image}
<em>It is good practice to name HAL objects by using the _Alias_ input of the components.</em>{: .pad-bottom}

---
### 2.2. Create a Reference

#### Objective:

In this tutorial we'll see how to create [References](/HAL/Overview/Glossary#reference) in HAL Robotics Framework components in Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG">  Create a Reference.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/2.2%20-%20Create%20a%20Reference.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

[References](/HAL/Overview/Glossary#reference) are useful because they allow us to specify [Targets](/HAL/Overview/Glossary#target) relative to something other than the world or the base of the [Robot](/HAL/Overview/Glossary#manipulator). This means that they can be recalibrated in the real world without the need to regenerate a [Toolpath](/HAL/Overview/Glossary#toolpath) or [Procedure](/HAL/Overview/Glossary#procedure).

#### How to:

The simplest way to create a [Reference](/HAL/Overview/Glossary#reference) is under the **Cell** panel, **Create Reference**. Our [Reference](/HAL/Overview/Glossary#reference) defaults to the world origin but you can equally select any point from your Rhino or Grasshopper session. In this demo I'm going to use this point on the corner of my box which I've previously drawn in Rhino. I'm going to bring that into Grasshopper and assign it as the origin of an XY Plane and the _Frame_ of my **Reference**. We can see the location of our [Reference](/HAL/Overview/Glossary#reference) from these dashed axes with dots at the ends. You can also see that the [Reference](/HAL/Overview/Glossary#reference) is labelled. To simplify finding our [References](/HAL/Overview/Glossary#reference) later it's advisable to give them an identifiable name, in this case `BoxCorner`, using the _Alias_ input.

[<img src="/HAL/assets/images/Grasshopper/22Reference.gif">](/HAL/assets/images/Grasshopper/22Reference.gif){: .pad-top}
<em>It is good practice to name HAL objects by using the _Alias_ input of the components.</em>{: .pad-bottom}

There are two main ways to use [References](/HAL/Overview/Glossary#reference), both of which can be demonstrated using the **Target** component and selecting the **From Curve** template. 
*   The first, default, way of using the [Reference](/HAL/Overview/Glossary#reference) can be seen by simply selecting a curve already in position in the world. We can see that the [Targets](/HAL/Overview/Glossary#target) all follow the curve as it is drawn, but if we drill down into the **Targets'** properties using the **Target Properties** component, we can see that their [References](/HAL/Overview/Glossary#reference) are correctly set to `BoxCorner`. If, in this configuration, we move our [Reference](/HAL/Overview/Glossary#reference) you'll see that the [Targets](/HAL/Overview/Glossary#target) do not follow. That's because the parameter _InWorld_ is set to `true` meaning that both the [Targets](/HAL/Overview/Glossary#target) and [Reference](/HAL/Overview/Glossary#reference) are in their correct positions in the world and no modifications need to be made. 

[<img src="/HAL/assets/images/Grasshopper/22TargetsAbsolute.gif">](/HAL/assets/images/Grasshopper/22TargetsAbsolute.gif){: .pad-top}
<em>Targets created without reference will automatically have the world origin assigned as their reference. Their coordinates will be translated to robot code as they are.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Grasshopper/22TargetsAbsoluteReferenced.gif">](/HAL/assets/images/Grasshopper/22TargetsAbsoluteReferenced.gif){: .pad-top}
<em>Targets created with a reference but _InWorld_ will have the reference assigned but their location relative to the world origin won't change. Their coordinates relative to the reference will be translated to robot code.</em>{: .pad-bottom}

*   The other way of using the [References](/HAL/Overview/Glossary#reference) is with geometry modelled relative to the world origin like this curve. If we set this up in the same way and change _InWorld_ to `false` our [Targets](/HAL/Overview/Glossary#target) maintain the same relative transformation between the world origin and their new [Reference](/HAL/Overview/Glossary#reference). Now when we move the [Reference](/HAL/Overview/Glossary#reference) around, the relative [Targets](/HAL/Overview/Glossary#target) follow.

[<img src="/HAL/assets/images/Grasshopper/22ReferencedTargetsOnRoot.gif">](/HAL/assets/images/Grasshopper/22ReferencedTargetsOnRoot.gif){: .pad-top}
<em>Targets created at the document origin then assigned to a reference, not _InWorld_, will follow the reference around the scene treating the reference as their new origin. Their coordinates relative to the reference will be translated to robot code.</em>{: .pad-bottom}

[References](/HAL/Overview/Glossary#reference) can also be parented. If we create another [Reference](/HAL/Overview/Glossary#reference) and use Shift + Up to change overload we can see a _Parent_ input appear and the same _InWorld_ parameter that we saw in **Target from Curve**. If we use our old [Reference](/HAL/Overview/Glossary#reference) as the _Parent_ of this new [Reference](/HAL/Overview/Glossary#reference), add a bit of an offset by assigning the _Frame_ and set _InWorld_ to `false` we now have a [Reference](/HAL/Overview/Glossary#reference) referenced to a [Reference](/HAL/Overview/Glossary#reference). We can reassign the [Reference](/HAL/Overview/Glossary#reference) of our relative [Targets](/HAL/Overview/Glossary#target) and see both the new [Reference](/HAL/Overview/Glossary#reference) and our [Targets](/HAL/Overview/Glossary#target) follow when `BoxCorner` is moved. This is of particular use if you have a calibrated work surface but want to perform work in different areas of it.

[<img src="/HAL/assets/images/Grasshopper/22RelativeReferences.gif">](/HAL/assets/images/Grasshopper/22RelativeReferences.gif){: .pad-top}
<em>References can be declared relative to each other.</em>{: .pad-bottom}

#### Next:

Take a look at the next tutorial on creating [Parts](/HAL/Overview/Glossary#part) to learn how to add geometry to your [References](/HAL/Overview/Glossary#reference).

---
### 2.3. Create a Part

#### Objective:

In this tutorial we'll see how to create [Parts](/HAL/Overview/Glossary#part) using HAL Robotics Framework components in Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG">  Create a Part.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/2.3%20-%20Create%20a%20Part.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.
- Reading or watching the [Create a Reference](/HAL/Grasshopper/2-Cell#22-create-a-reference) tutorial is highly recommended.

#### Background:

[Parts](/HAL/Overview/Glossary#part) serve two roles in the HAL Robotics Framework. Firstly, they can be used to populate your [Cells](/HAL/Overview/Glossary#cell) with environmental elements such as pedestals, tables or tool holders which can in turn be used as [References](/HAL/Overview/Glossary#reference) for your [Toolpaths](/HAL/Overview/Glossary#toolpath). [Parts](/HAL/Overview/Glossary#part) can also be used as the basis for creating your own [Mechanisms](/HAL/Overview/Glossary#mechanism) such as [Robots](/HAL/Overview/Glossary#manipulator), [Positioners](/HAL/Overview/Glossary#positioner) or complex [Tools](/HAL/Overview/Glossary#end-effector).

#### How to:

We can create a [Part](/HAL/Overview/Glossary#part) by going to the **Cell** panel, **Create Part**. If you've seen the [Create a Reference](/HAL/Grasshopper/2-Cell#22-create-a-reference) tutorial many of the inputs here will look familiar, in its simplest form a [Part](/HAL/Overview/Glossary#part) is just a [Reference](/HAL/Overview/Glossary#reference) with associated geometry. The _Frame_ of our [Part](/HAL/Overview/Glossary#part) is its base frame, that is to say if you were to set the position of the [Part](/HAL/Overview/Glossary#part) that is the point that you would expect to be at the designated position. The _Body_ is the geometry we want to assign to our [Part](/HAL/Overview/Glossary#part), and we can assign a _Mass_. The _Mass_ is particularly necessary if this part is going to be used as part of a [Tool](/HAL/Overview/Glossary#end-effector) so that the total mass can be calculated and [Exported](/HAL/Overview/Glossary#export) in your code.

[<img src="/HAL/assets/images/Grasshopper/23Part.gif">](/HAL/assets/images/Grasshopper/23Part.gif){: .pad-top}
<em>A part is a shape (approximated by meshes) with an associated location an mass.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Grasshopper/23PartAdvanced.gif">](/HAL/assets/images/Grasshopper/23PartAdvanced.gif){: .pad-top}
<em>The second overload of the [Part](/HAL/Overview/Glossary#part) component allows us to specify a few more details including the _Color_ and _Centre of Mass_.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Grasshopper/23PartRelocate.gif">](/HAL/assets/images/Grasshopper/23PartRelocate.gif){: .pad-top}
<em>Once you've created your [Parts](/HAL/Overview/Glossary#part) they can be moved around your scene using the **Relocate** component.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Grasshopper/23PartAttach.gif">](/HAL/assets/images/Grasshopper/23PartAttach.gif){: .pad-top}
<em> Two parts can also be attached to each other using the **Attach** component.</em>{: .pad-bottom}

#### Next:

Take a look at the [tutorial](#26-create-a-multi-part-tool) on creating multi-[Part](/HAL/Overview/Glossary#part) [Tools](/HAL/Overview/Glossary#end-effector) and the creating your own [Positioner](/HAL/Overview/Glossary#positioner) [tutorial](#27-create-a-positioner) to learn how to use [Parts](/HAL/Overview/Glossary#part) in other ways.

---
### 2.4. Create a Tool

#### Objective:

In this tutorial we'll create a simple [Tool](/HAL/Overview/Glossary#end-effector) in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/RHFile16.PNG">  Create a Tool.3dm](/HAL/Grasshopper/ExampleFiles/Tutorials/2.4%20-%20Create%20a%20Tool.3dm){: .icon-link}      
> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG">  Create a Tool.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/2.4%20-%20Create%20a%20Tool.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.
- Reading or watching the [Getting Started](/HAL/Grasshopper/1-Getting-Started#1-getting-started) tutorial is highly recommended.

#### Background:

More often than not you will need a [Tool](/HAL/Overview/Glossary#end-effector) or [End Effector](/HAL/Overview/Glossary#end-effector) in your [Cell](/HAL/Overview/Glossary#cell) to undertake a process. The [Tool](/HAL/Overview/Glossary#end-effector) could be anything from a welding torch to a spindle or even something as simple as a pen. [Tools](/HAL/Overview/Glossary#end-effector) can be attached to the end of a manipulator like a [Robot](/HAL/Overview/Glossary#manipulator) or stationary with a [Robot](/HAL/Overview/Glossary#manipulator) bringing the [Part](/HAL/Overview/Glossary#part) to the [Tool](/HAL/Overview/Glossary#end-effector).

#### How to:

In the Getting Started tutorial we used a preset [Tool](/HAL/Overview/Glossary#end-effector) from the **Tool** catalog. With the enormous variety of [Tools](/HAL/Overview/Glossary#end-effector) in the world and even the ease with which one can create an entirely unique, custom [Tool](/HAL/Overview/Glossary#end-effector) for a process, chances are good that you will need to model your own [Tool](/HAL/Overview/Glossary#end-effector) within the HAL Robotics Framework. In this demo we're going to use this pencil holder as an example. The first thing we're going to do is go to the **HAL Robotics** tab, **Cell** panel and select the **Create Tool** component. If you're ever in doubt about where to start, it's often useful to get the component you know you'll need at the end of the chain and work your way backwards. We can see there is an input of _Frame_. As with a [Part](/HAL/Overview/Glossary#part) this is the base frame by which the [Tool](/HAL/Overview/Glossary#end-effector) will be connected to our [Robot](/HAL/Overview/Glossary#manipulator). In this particular scenario our [Tool](/HAL/Overview/Glossary#end-effector) is modelled at the origin and therefore the base frame is the world XY plane. We are then asked for a _Body_. We can import meshes from Rhino or use any generated meshes from within Grasshopper. We also need a _ToolFrame_ or [Tool Centre Point (TCP)](/HAL/Overview/Glossary#endpoint). In a [future tutorial](/HAL/Grasshopper/2-Cell#25-calibrate-a-reference-or-tool) we will see how to import that frame from calibration data in your [Controller](/HAL/Overview/Glossary#controller) but to keep things simple here I'm going to use the point at the tip of the pencil in my model. We need this to be a frame rather than a point but this is simplified because the _ToolFrame_ happens to be aligned with the world XY again. We recommend that the Z axis of [TCPs](/HAL/Overview/Glossary#endpoint) point out of the [Tool](/HAL/Overview/Glossary#end-effector), following the co-ordinate system flow of the [Robot](/HAL/Overview/Glossary#manipulator) itself. Once we connect this to the **Tool** component, we will see our [Tool](/HAL/Overview/Glossary#end-effector) appear with its [TCP](/HAL/Overview/Glossary#endpoint) labelled. It's a good habit to hide things as we go to avoid duplicating visualizations. Once the [Tool](/HAL/Overview/Glossary#end-effector) is completed, we can attach it to our [Robot](/HAL/Overview/Glossary#manipulator) using the **Attach** component as we did in the [Getting Started tutorial](/HAL/Grasshopper/1-Getting-Started#1-getting-started). With those assembled we can **Solve** and **Simulate** the [Robot](/HAL/Overview/Glossary#manipulator) with the [Tool](/HAL/Overview/Glossary#end-effector) attached.

#### Next:

Take a look at the [tutorial](#26-create-a-multi-part-tool) on creating multi-[Part](/HAL/Overview/Glossary#part) [Tools](/HAL/Overview/Glossary#end-effector) and the calibrating [Tools](/HAL/Overview/Glossary#end-effector) [tutorial](#25-calibrate-a-reference-or-tool) to get a more accurate representation of your cell.

---
### 2.5. Calibrate a Reference or Tool

#### Objective:

In this tutorial we'll bring in calibrated data to improve the accuracy of [Tools](/HAL/Overview/Glossary#end-effector) and [References](/HAL/Overview/Glossary#reference) in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG"> Calibrate a Tool or Reference.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/2.5%20-%20Calibrate%20a%20Tool%20or%20Reference.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.
- Reading or watching the [Create a Tool tutorial](/HAL/Grasshopper/2-Cell#24-create-a-tool) is highly recommended as this tutorial builds on its output.

#### Background:

[Tools](/HAL/Overview/Glossary#end-effector) and [References](/HAL/Overview/Glossary#reference) can be digitally modelled with some degree of accuracy but installation and manufacturing tolerances mean that the most accurate data will always come from a calibrated [Robot](/HAL/Overview/Glossary#manipulator) [Controller](/HAL/Overview/Glossary#controller).

#### How to:

In our previous tutorial we used a theoretical plane as our [Tool Centre Point (TCP)](/HAL/Overview/Glossary#endpoint). To ensure our simulation matches the real world as closely as possible we're going to swap this out for calibrated data. In this tutorial I am using a 3D printed [Tool](/HAL/Overview/Glossary#end-effector) which is mounted on an ABB arm. I have calibrated the [Tool](/HAL/Overview/Glossary#end-effector) using the real [Robot](/HAL/Overview/Glossary#manipulator) and simply copied and pasted that information into my Grasshopper document. As I'm using an ABB [Robot](/HAL/Overview/Glossary#manipulator) the code imported is in RAPID, ABB's [Robot](/HAL/Overview/Glossary#manipulator) programming language. Additionally, I have extracted the information I need, in particular the X, Y and Z co-ordinates of the [TCP](/HAL/Overview/Glossary#endpoint) and its orientation as a quaternion because that's the formalism used by ABB. Converting between different frame formalisms can be complicated but we've included the **Frame** component to make it a breeze. You'll find **Frame** under the **HAL Robotics** tab, **Utilities** panel. By default, the **Frame** component comes in as Euler frame. By right-clicking on the component we can see that there are a variety of formalisms on offer to suit importing data from any [Robot](/HAL/Overview/Glossary#manipulator) manufacturer. In this instance we want to select quaternion frame. This first overload of the component asks for the _Origin_ and 4 quaternion components. As we have the co-ordinates of the [TCP](/HAL/Overview/Glossary#endpoint) as individual values, we can switch to the alternative overload of quaternion frame to get _X_, _Y_ and _Z_ as individual inputs. We need to ensure that the units are correct. ABB RAPID positions are in millimeters so as long as that's what's on our inputs we're ok there. We can now hook all of the imported data into the **Frame**. Once that's done, we can replace the _ToolFrame_ we had previously, the simulation will re-[Solve](/HAL/Overview/Glossary#solving) and we can see that the [TCP](/HAL/Overview/Glossary#endpoint) is slightly offset from the CAD data, as we would expect from a 3D printed tool with moving parts. When we now **Simulate**, we can see that our calibrated [TCP](/HAL/Overview/Glossary#endpoint) is hitting all of our [Targets](/HAL/Overview/Glossary#target) not the CAD tool tip.

---
### 2.6. Create a Multi-Part Tool

#### Objective:

In this tutorial we'll look at how we can create more complex [Tools](/HAL/Overview/Glossary#end-effector), e.g. those with multiple [Parts](/HAL/Overview/Glossary#part) or [Endpoints](/HAL/Overview/Glossary#endpoint), in the HAL Robotics Framework for Grasshopper.

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/RHFile16.PNG">  Create a Multi-Part Tool.3dm](/HAL/Grasshopper/ExampleFiles/Tutorials/2.6%20-%20Create%20a%20Multi-Part%20Tool.3dm){: .icon-link}   
> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG">  Create a Multi-Part Tool.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/2.6%20-%20Create%20a%20Multi-Part%20Tool.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.
- Basic modelling skills in Rhinoceros 3D and Vector/Plane manipulation skills in Grasshopper will greatly help preparing your own [Tool](/HAL/Overview/Glossary#end-effector) model.
- Reading or watching the [Create a Part](/HAL/Grasshopper/2-Cell#23-create-a-part) tutorial is highly recommended.
- Reading or watching the [Create a Tool](/HAL/Grasshopper/2-Cell#24-create-a-tool) tutorial is highly recommended.

#### Background:

[Tools](/HAL/Overview/Glossary#end-effector) can often be approximated to be a single geometric body with a single [Endpoint](/HAL/Overview/Glossary#endpoint). This is the assumption that's made in the [Create a Tool](/HAL/Grasshopper/2-Cell#24-create-a-tool) tutorial to make it really easy to get started. There are also plenty of scenarios, however, where the [Tool](/HAL/Overview/Glossary#end-effector) you have will be composed of multiple [Parts](/HAL/Overview/Glossary#part) or even have multiple [Endpoints](/HAL/Overview/Glossary#endpoint).

#### How to:

The first step to creating our [Tool](/HAL/Overview/Glossary#end-effector) is to ensure that we have a 3D model of it at an appropriate level of detail. We need it to be accurate to ensure that our simulations are representative but not so detailed that we take a performance penalty from trying to render high-fidelity moving objects during simulation. Once we have that geometry in place, we need to setup some **Frames**. These include the base location of each of our [Parts](/HAL/Overview/Glossary#part), this is the connection point on the [Part](/HAL/Overview/Glossary#part) that you would use to connect it to something else, and the [Endpoints](/HAL/Overview/Glossary#endpoint). You can use any method of **Frame** creation here including Grasshopper-native components or the HAL Robotics Framework **Frame** component. With these in place we can prepare our [Parts](/HAL/Overview/Glossary#part), see the [Create a Part](/HAL/Grasshopper/2-Cell#23-create-a-part) tutorial if you are not familiar with this process. In the demo we have here this leaves us with three [Parts](/HAL/Overview/Glossary#part), each stacked one on top of the other. We are going to leverage that layering to create the logical [Connections](/HAL/Overview/Glossary#connection) between our [Parts](/HAL/Overview/Glossary#part). To create a [Connection](/HAL/Overview/Glossary#connection), we're going to use the **Create Joint / Connection** component from the **HAL Robotics** tab, **Cell** panel and switch to the **Connection** template. Here we can pass in our `InterfacePlate` [Part](/HAL/Overview/Glossary#part) as the _From_ and we'll connect _To_ the `Camera` [Part](/HAL/Overview/Glossary#part). The _Frame_ here is the point of connection between our [Parts](/HAL/Overview/Glossary#part). Given the way our demo is modelled, this equates to the `CameraBase` **Frame**. As the _Frame_ is not relative to the `InterfacePlate` [Part](/HAL/Overview/Glossary#part) we'll ensure that _InWorld_ is set to `false`. We can repeat this process to connect _From_ the `Camera` [Part](/HAL/Overview/Glossary#part) _To_ the `Gripper` [Part](/HAL/Overview/Glossary#part), again using the `GripperBase` **Frame** as the _Frame_.

That completes the preparation of the physical links but we still need to set our [Endpoints](/HAL/Overview/Glossary#endpoint). These are actually also [Connections](/HAL/Overview/Glossary#connection) so we can start by getting that component again. We can start to prepare the `GripperTCP` by assigning the `Gripper` [Part](/HAL/Overview/Glossary#part) as the _From_ and the `GripperTCP` **Frame** as the _Frame_. There are two differences between the [Connections](/HAL/Overview/Glossary#connection) we created between [Parts](/HAL/Overview/Glossary#part) and an [Endpoint](/HAL/Overview/Glossary#endpoint). The first is that an [Endpoint](/HAL/Overview/Glossary#endpoint) has no _To_, it simply indicates an offset from the _From_ [Part](/HAL/Overview/Glossary#part), and the second is that we must set _IsEndpoint_ to `true`. Our `GripperTCP` [Connection](/HAL/Overview/Glossary#connection) should now be ready so we can repeat the same process for the `CameraTCP`.

At this stage we have a large collection of components of our [Tool](/HAL/Overview/Glossary#end-effector) and we need to assemble them. This is done using the **Assemble** component, again from the **HAL Robotics** tab, **Cell** panel. The cleanest way to feed data into this component is using **Merge**. This allows us to constantly see which components are being assembled and change the order easily if need be. It's important that the first component in the _Component_ input is the [Part](/HAL/Overview/Glossary#part) that you want to use as the base of your [Tool](/HAL/Overview/Glossary#end-effector). For this demo that's going to be the `InterfacePlate` [Part](/HAL/Overview/Glossary#part). Ensure that you have a single list of elements coming out of your **Merge** and we can feed that into **Assemble**.

At this point you should see your [Endpoints](/HAL/Overview/Glossary#endpoint) labelled in the 3D view and you are free to use this [Tool](/HAL/Overview/Glossary#end-effector) exactly as you did the preset [Tool](/HAL/Overview/Glossary#end-effector) in the [Getting Started](/HAL/Grasshopper/1-Getting-Started#1-getting-started) tutorial or your first custom [Tool](/HAL/Overview/Glossary#end-effector) in the [Create a Tool](/HAL/Grasshopper/2-Cell#24-create-a-tool) tutorial.

See the [Change a Tool at Runtime](/HAL/Grasshopper/3-Motion#37-change-a-tool-at-runtime) tutorial to see how to switch between your [Endpoints](/HAL/Overview/Glossary#endpoint) during the execution of a [Procedure](/HAL/Overview/Glossary#procedure).

---
### 2.7. Create a Positioner

#### Objective:

In this tutorial we'll be modelling a [Positioner](/HAL/Overview/Glossary#positioner), in the form of a 2-axis rotary table, in the HAL Robotics Framework for Grasshopper. The principles used in this tutorial apply to all forms of [Mechanism](/HAL/Overview/Glossary#mechanism) including Linear [Positioners](/HAL/Overview/Glossary#positioner), like Tracks, and [Manipulators](/HAL/Overview/Glossary#manipulator).

#### Demo Files:

> [<img src="/HAL/assets/images/Grasshopper/RHFile16.PNG">  Create a Positioner.3dm](/HAL/Grasshopper/ExampleFiles/Tutorials/2.7%20-%20Create%20a%20Positioner.3dm){: .icon-link}   
> [<img src="/HAL/assets/images/Grasshopper/GHFile16.PNG">  Create a Positioner.gh](/HAL/Grasshopper/ExampleFiles/Tutorials/2.7%20-%20Create%20a%20Positioner.gh){: .icon-link}

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.
- Basic modelling skills in Rhinoceros 3D and Vector/Plane manipulation skills in Grasshopper will greatly help preparing your own [Positioner](/HAL/Overview/Glossary#positioner) model.
- Reading or watching the [Create a Multi-Part Tool](/HAL/Grasshopper/2-Cell#26-create-a-multi-part-tool) tutorial is highly recommended as this tutorial builds on some of its learnings.

#### Background:

[Positioners](/HAL/Overview/Glossary#positioner) can greatly extend the capabilities of your [Cell](/HAL/Overview/Glossary#cell) by moving your [Robot](/HAL/Overview/Glossary#manipulator) or [Part](/HAL/Overview/Glossary#part) to facilitate access for processing. We provide a number of preset [Positioners](/HAL/Overview/Glossary#positioner), however, [Positioners](/HAL/Overview/Glossary#positioner) are highly customizable and it's even possible build your own so it may be necessary to model your exact configuration for use in the HAL Robotics Framework.

#### How to:

The first step in the creation of a [Positioner](/HAL/Overview/Glossary#positioner) is to ensure we have an accurate but simple model. If you're preparing something entirely custom you are likely to already have a 3D model of the positioner, however, if you're recreating something provided by a manufacturer then you will need to try and find the model on their website. Most manufacturers provide very good models of their equipment so this shouldn't be too difficult. In this demo I'll be working on an ABB `IRBP A-250`, a two-axis, rotary positioner. I have downloaded a surface-based model from the ABB website as this is easier to manipulate than meshes at the start of the process. The model provided by ABB is highly detailed and, although a detailed model looks great, a lot of the detail included is surplus to requirement for kinematics and simulation. To ensure we get smooth performance from our model of the `IRBP A-250` I've removed certain details like bolts, holes, cable connectors and even a few fillets in unseen areas. I've then meshed this simplified geometry and simplified those meshes to find a balance between fidelity and visual quality. Reference those meshes into your Grasshopper file and group meshes that are physically, statically joined together.

With our geometric model in place we also need to ensure we have certain data like the positions and limits of each [Joint](/HAL/Overview/Glossary#joint). The limits should be present in the datasheet for your [Positioner](/HAL/Overview/Glossary#positioner) but the rotational centres for the [Joints](/HAL/Overview/Glossary#joint) may not be so easy to come by. If you have the exact locations, add them to your Grasshopper file as individual points. If you can't find or obtain that information then you can always make an educated guess based on the geometry you have. One way of doing that is by working with circles or other primitive curves. I have added a number of circles around geometric elements that rotate using the snaps of Rhino and add a point at the centre of each of those circles to estimate the centre of rotation for the [Joint](/HAL/Overview/Glossary#joint). Reference those points in to the Grasshopper document and we're ready to convert them into **Frames**. Using the in-built vector and plane tools of Grasshopper or the **Frame** component from **HAL Robotics** -\> **Utilities** we need to create a **Frame** at each [Joint](/HAL/Overview/Glossary#joint) with the Z-axis acting as the centre of rotation. That concludes the geometric modelling phase of this process.

With our meshes and **Frames** in place we can now create our [Parts](/HAL/Overview/Glossary#part). We have already covered this in the [Create a Part](/HAL/Grasshopper/2-Cell#23-create-a-part) tutorial so I won't cover it again here but remember to name your [Parts](/HAL/Overview/Glossary#part) appropriately to simplify debugging later.

From here we need to start connecting our [Parts](/HAL/Overview/Glossary#part) together using either fixed [Connections](/HAL/Overview/Glossary#connection) or [Joints](/HAL/Overview/Glossary#joint). Both of these are found in **Cell** panel in the **Create Joint / Connection** component. Within that component you will find templates for Revolute [Joints](/HAL/Overview/Glossary#joint), Prismatic [Joints](/HAL/Overview/Glossary#joint), and [Connections](/HAL/Overview/Glossary#connection). I'm going to start with a [Connection](/HAL/Overview/Glossary#connection) to join the headstock to the base structure. I could have made these into a single [Part](/HAL/Overview/Glossary#part) but, personally, I like to approximate the mechanical assembly and these are clearly different parts from that point of view. Next, we have the first [Joint](/HAL/Overview/Glossary#joint) which connects the headstock to the swing arm. I can connect the [Parts](/HAL/Overview/Glossary#part) into the component with _From_ being the [Part](/HAL/Overview/Glossary#part) that is stationary for the [Joint](/HAL/Overview/Glossary#joint) and _To_ being the [Part](/HAL/Overview/Glossary#part) moved by the [Joint](/HAL/Overview/Glossary#joint). I can also bring in my **Frame** that we prepared earlier and _Positions_ and _Speed_ from the datasheet. I find it easier to work in degrees rather than radians for this kind of model so I use the _Unit_ on those inputs to keep things legible. We follow exactly the same process for the second [Joint](/HAL/Overview/Glossary#joint). The final element we need to add to this before assembling everything we've done so far is add in the **Flange**. This is the [Endpoint](/HAL/Overview/Glossary#endpoint) that a [Mechanism](/HAL/Overview/Glossary#mechanism) uses when no [Tool](/HAL/Overview/Glossary#end-effector) is mounted. This can be created as a [Connection](/HAL/Overview/Glossary#connection) with no _To_ [Part](/HAL/Overview/Glossary#part) defined and _IsEndpoint_ toggled to `true`. Best practice dictates that the **Frame** of the **Flange** should always point out of the end of the [Mechanism](/HAL/Overview/Glossary#mechanism). If you want to have a [Part](/HAL/Overview/Glossary#part) or [Tool](/HAL/Overview/Glossary#end-effector) attached to the end of the [Positioner](/HAL/Overview/Glossary#positioner), this should be added after assembly of the [Mechanism](/HAL/Overview/Glossary#mechanism).

With all of the elements in place we can merge them all into a single list and pass that list to the **Assemble­** component which can be found in the **Cell** panel and takes all our [Parts](/HAL/Overview/Glossary#part), [Connections](/HAL/Overview/Glossary#connection) and [Joints](/HAL/Overview/Glossary#joint) in the _Component_ input. It's important to note that the first element in the list must be a [Part](/HAL/Overview/Glossary#part) as this will be used as the base of the [Mechanism](/HAL/Overview/Glossary#mechanism) and you must have at least one [Connection](/HAL/Overview/Glossary#connection) marked as an end point. We can now see our [Positioner](/HAL/Overview/Glossary#positioner) and use it exactly as we would any other [Mechanism](/HAL/Overview/Glossary#mechanism) by creating a [Procedure](/HAL/Overview/Glossary#procedure) and/or [Targets](/HAL/Overview/Glossary#target) for it. Please see future tutorials ([1](/HAL/Grasshopper/3-Motion#35-synchronize-motion),[2](/HAL/Grasshopper/3-Motion#36-coupled-motion-and-resolving-targets)) to see how this can be used in conjunction with another [Mechanism](/HAL/Overview/Glossary#mechanism) to create a multi-[Mechanism](/HAL/Overview/Glossary#mechanism) [Cell](/HAL/Overview/Glossary#cell) and how to save this [Mechanism](/HAL/Overview/Glossary#mechanism) as a [preset](/HAL/Grasshopper/2-Cell#28-save-a-mechanism-as-a-preset) that can be shared with your colleagues or peers.

If you have created a [Track](/HAL/Overview/Glossary#positioner), you can mount a [Robot](/HAL/Overview/Glossary#manipulator) onto it using the **Attach** component exactly as you have done [Tools](/HAL/Overview/Glossary#end-effector) in [previous tutorials](/HAL/Grasshopper/2-Cell#24-create-a-tool), ensuring to keep _IsEndEffector_ set to `true`. This is covered in more detail in the [Using a Track](/HAL/Grasshopper/3-Motion#310-using-a-track) tutorial.

If you have assembled an external [Positioner](/HAL/Overview/Glossary#positioner), like a rotary table, then this can be programmed in the same way as a second [Robot](/HAL/Overview/Glossary#manipulator). This is detailed in the [Synchronize Motion](/HAL/Grasshopper/3-Motion#35-synchronize-motion) and [Coupled Motion and Resolving Targets](/HAL/Grasshopper/3-Motion#36-coupled-motion-and-resolving-targets) tutorials.

---
### 2.8. Save a Mechanism as a Preset
#### Coming Soon

---

[Continue to: 3. Motion](/HAL/Grasshopper/3-Motion#3-motion)
