---
title: null
mapFolderPath: tsmaps/HAL/Grasshopper/%CE%9E%206-Control
fragsFolderPath: HAL/Grasshopper/6-Control_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLC061xn","path":"HAL/Grasshopper","fragmentFolderPath":"HAL/Grasshopper/6-Control_frags"},"fragment":{"id":"fdLC061xn","topLevelMapKey":"eGVQIJ0LJ","mapKeyChain":"eGVQIJ0LJ","guideID":"fdLC061ZB","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/Grasshopper/6-Control.tsmap","parentFragmentID":null,"chartKey":"eGVQIJ0LJ","options":[]}} -->

## 6. Control

[6.1. Configure a Virtual Controller](#61-configure-a-virtual-controller)  
[6.2. Export a Procedure](#62-export-a-procedure)  
[6.3. Upload a Procedure](#63-upload-a-procedure)  
[6.4. Reuse Controller Data](#64-reuse-controller-data)  

---
### 6.1. Configure a Virtual Controller

#### Objective:

In this tutorial we'll look at how you can configure a virtual [Controller](/HAL/Overview/Glossary#controller) to match your real [Controller](/HAL/Overview/Glossary#controller) using the HAL Robotics Framework for Grasshopper.

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

Industrial [Controllers](/HAL/Overview/Glossary#controller) are typically comprised of core functionality, such as the ability to run a program, extended through optional extras, like communication protocols or multi-[Robot](/HAL/Overview/Glossary#manipulator) support. To ensure that we only try and interact with your real [Controller](/HAL/Overview/Glossary#controller) in a way that is compatible, be it through a network or with exported code, we have added a means to configure your [Controller](/HAL/Overview/Glossary#controller). The constituent parts of this are:

a.  Controller - this is essentially a computer to which your [Robot](/HAL/Overview/Glossary#manipulator) and [Signals](/HAL/Overview/Glossary#signal) are connected.

b.  Capabilities - these are how we organize what a [Controller](/HAL/Overview/Glossary#controller) can do and draw parallels between different manufacturers' [Controllers](/HAL/Overview/Glossary#controller). _Capabilities_ are things like the ability to [Upload](/HAL/Overview/Glossary#upload) code to the [Controller](/HAL/Overview/Glossary#controller) from a PC or the ability to read the values of [Signals](/HAL/Overview/Glossary#signal) remotely.

c.  Subsystems - these are similar to the options you have in your [Controller](/HAL/Overview/Glossary#controller). They are the actual software modules that implement different _Capabilities_.

#### How to:

All of these different parts are best explored with concrete examples so let's create a [Controller](/HAL/Overview/Glossary#controller) and look at how we can configure it. We can start by navigating to the **HAL Robotics** tab, **Cell** panel and placing a **Controller**. As this is a windowed component, we can double-click to open the catalog and choose our [Controller](/HAL/Overview/Glossary#controller) preset. For this example, I'm going to use the `IRC5 Compact V2` but you will find details for any other manufacturer's [Controllers](/HAL/Overview/Glossary#controller) in the [manufacturer-specific documentation](/HAL/Manufacturers). When we select a [Controller](/HAL/Overview/Glossary#controller) a configuration page will pop-up.

The first thing we'll see at the top is the system version. In the case of ABB this is the Robotware version but for KUKA this would be KUKA System Software or in Universal Robots it will be the Polyscope version. It's important to note that these are version ranges so don't expect to see every point release listed. By changing the version we'll change which **Subsystems** are available. If I switch down to `5.14`, `EGM` will disappear from the options below because it was only introduced in Robotware 6.

The rest of the window is split in two; on the left is **Subsystem** and **Capability** selection and on the right is parametrization. In the left-hand column we can see the **Capabilities** listed with **Subsystems** that implement that **Capability** in a drop-down alongside. Let's look specifically at `Upload`. By hovering over the name, we can see that the `Upload` **Capability** enables [Procedure](/HAL/Overview/Glossary#procedure) [Uploading](/HAL/Overview/Glossary#upload) to a remote [Controller](/HAL/Overview/Glossary#controller). We can also see that there are two subsystems that offer this **Capability**, `PCSDK` and `Robot Web Services (RWS)`. `RWS` is built in to the latest Robotware versions but to use the `PCSDK` we need the option "PC Interface" on our [Controller](/HAL/Overview/Glossary#controller). If you don't have that option you can change **Subsystem** to ensure we use a compatible method to [Upload](/HAL/Overview/Glossary#upload) [Procedures](/HAL/Overview/Glossary#procedure) to your [Controller](/HAL/Overview/Glossary#controller). There may also be circumstances where we don't have any of the options installed or don't want access to a **Capability** for security purposes. In that case we can deactivate the **Capability** using its toggle. On the right-hand side of the window, we have the inputs to configure our **Subsystems**. Only active **Subsystems** are listed so if we deactivate both `EGM` **Capabilities** the `EGM` parameters will disappear. Once we have changed the relevant properties we can select "Configure" to apply our changes. Closing the window without configuring will leave the [Controller](/HAL/Overview/Glossary#controller) in an invalid, unconfigured state.

In future tutorials we'll look at some specific uses of our **Capabilities** and **Subsystems** for [exporting](/HAL/Grasshopper/6-Control#62-export-a-procedure) and [uploading](/HAL/Grasshopper/6-Control#63-upload-a-procedure) code for a real [Controller](/HAL/Overview/Glossary#controller).

---
### 6.2. Export a Procedure

#### Objective:

In this tutorial we'll [Export](/HAL/Overview/Glossary#export) some robot code ready to be run on a real [Controller](/HAL/Overview/Glossary#controller) using the HAL Robotics Framework for Grasshopper.

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

For the most part, the **Programming** we are doing in the HAL Robotics Framework for Grasshopper doesn't require our PCs to be in the loop whilst running our [Controllers](/HAL/Overview/Glossary#controller). The major advantage of that is that we delegate all of the **Motion Control** to the **Industrial Controller** which has been built specifically to execute code and run our [Robots](/HAL/Overview/Glossary#manipulator), resulting in excellent predictability, reliability and accuracy. The actual code that a [Controller](/HAL/Overview/Glossary#controller) requires will depend on its manufacturer and configuration. For example, ABB IRC5 [Controllers](/HAL/Overview/Glossary#controller) require code in the programming language RAPID, KUKA KRC4s require code in KUKA Robot Language (KRL) and Staubli [Robots](/HAL/Overview/Glossary#manipulator) will require VAL+ or VAL3 depending on their generation. Fortunately, the HAL Robotics Framework handles all of this for you as long as you select the right [Controller](/HAL/Overview/Glossary#controller) configuration.

#### How to:

To prepare to export we must have a [Procedure](/HAL/Overview/Glossary#procedure) ready and a [Controller](/HAL/Overview/Glossary#controller) in our document. To properly configure our [Controller](/HAL/Overview/Glossary#controller), we need to return to its configuration screen. This is the page you will see immediately after selecting your [Controller](/HAL/Overview/Glossary#controller) or you can get back to it by simply double-clicking on your [Controller](/HAL/Overview/Glossary#controller) component. We will use an ABB IRC5 as an example but the same principles hold true for any [Controller](/HAL/Overview/Glossary#controller) preset. When we open the configuration window there are two pieces of information that we need to check. The first, and simplest, is the _Language_. If the [Controller](/HAL/Overview/Glossary#controller) _Version_ is correctly set then this should be compatible with your real [Controller](/HAL/Overview/Glossary#controller) but you can always export a slightly different _Language_ if you want.

The other element to verify is the **Export Settings**. These are listed on the right-hand side under the _Language_ version. You should have a list of all of your [Procedures](/HAL/Overview/Glossary#procedure). If you haven't given them identifiable _Aliases_ now would be a good time to do so. There are three scenarios that we need to discuss with these **Export Settings**:

a.  Single Robot - For a single [Robot](/HAL/Overview/Glossary#manipulator) setup you will just need to make sure that your path is correctly set. For ABB [Controllers](/HAL/Overview/Glossary#controller) the path is the Task name in your real [Controller](/HAL/Overview/Glossary#controller) but for KUKA this is an index which can remain "1". You also have the option of completely deactivating the export of a [Procedure](/HAL/Overview/Glossary#procedure) using its toggle, or exporting a [Procedure](/HAL/Overview/Glossary#procedure) as a library, which means it won't have a code entry point. This could be useful if you have pre-configured initialization or termination sequences in your [Controller](/HAL/Overview/Glossary#controller).

b.  Multi-Robot - The only additional check you need to make when using a multi-[Robot](/HAL/Overview/Glossary#manipulator) configuration is that your paths are all correct. Again, that's Tasks for ABB or the equivalent for other manufacturers.

c.  External Axes - The final unique configuration is for [External Axes](/HAL/Overview/Glossary#positioner). In the HAL Robotics Framework, we require each [Mechanism](/HAL/Overview/Glossary#mechanism) to have its own [Procedure](/HAL/Overview/Glossary#procedure). With [External Axes](/HAL/Overview/Glossary#positioner) we actually want to merge a number of [Procedures](/HAL/Overview/Glossary#procedure) into one to [Export](/HAL/Overview/Glossary#export) correctly. We can do this by simply dragging the [External Axes'](/HAL/Overview/Glossary#positioner) [Procedure(s)](/HAL/Overview/Glossary#procedure) onto the main [Robot's](/HAL/Overview/Glossary#manipulator) [Procedure](/HAL/Overview/Glossary#procedure). This marks it as a child [Procedure](/HAL/Overview/Glossary#procedure) of the [Robot](/HAL/Overview/Glossary#manipulator) and they will be [Exported](/HAL/Overview/Glossary#export) together. When using this kind of configuration please make sure that you have also setup your **Joint Mappings** correctly for your [External Axes](/HAL/Overview/Glossary#positioner). This can be done during the [Joint](/HAL/Overview/Glossary#joint) creation when assembling a [Mechanism](/HAL/Overview/Glossary#mechanism) from scratch or using the _Mapping_ input on the [Positioner](/HAL/Overview/Glossary#positioner) component. **Mappings** are zero-based in the HAL Robotics Framework and will automatically be converted at [Export](/HAL/Overview/Glossary#export) to match the format of the real [Controller](/HAL/Overview/Glossary#controller).

Now that our [Controller](/HAL/Overview/Glossary#controller) is configured, we can place [Export](/HAL/Overview/Glossary#export) component from the **HAL Robotics** tab, **Control** panel. We can hook up our [Controller](/HAL/Overview/Glossary#controller), **Solution** and assign a path to the _Destination_. When we run the component by toggling _Export_ to `true` this will generate our code and give us the paths to all exported files as an output. In the second overload of this component there's one additional input worth discussing, _Mode_. `Inline` mode will create a dense code file with as little declarative code as possible. `Predeclaration` mode will do just the opposite, it will create variables wherever possible to make it easier to change things by hand should you want to. For most scenarios we recommend `Inline` as it produces shorter code and is faster.

As a final note in this tutorial, we know that there are circumstances where you may need to add very specific lines of code to your [Exports](/HAL/Overview/Glossary#export). This could be to trigger a particular [Tool](/HAL/Overview/Glossary#end-effector), send a message or call another piece of code. You can do this using **Custom Actions**. These are found in the **HAL Robotics** tab, **Procedure** panel. You can add any text to the _Code_ input and it will be [Exported](/HAL/Overview/Glossary#export) verbatim. If your **Custom Action** causes the [Robot](/HAL/Overview/Glossary#manipulator) to [Wait](/HAL/Overview/Glossary#wait-action) or some other **Simulatable** [Action](/HAL/Overview/Glossary#action) to occur you can add a [Procedure](/HAL/Overview/Glossary#procedure) to the _Simulation_ input. Just remember that regardless of what you add to the _Simulation_, only what you put in the _Expression_ will be [Exported](/HAL/Overview/Glossary#export). Learn more about **Custom Actions** in [this tutorial](/HAL/Grasshopper/5-Advanced-Programming#55-custom-actions).

---
### 6.3. Upload a Procedure

#### Objective:

In this tutorial we'll [Upload](/HAL/Overview/Glossary#upload) some robot code to a real [Controller](/HAL/Overview/Glossary#controller) using the HAL Robotics Framework for Grasshopper.

#### Requirements to follow along:

- [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), and the HAL Robotics Framework installed on a PC.

#### Background:

[Uploading](/HAL/Overview/Glossary#upload) is the logical successor to [Exporting](/HAL/Overview/Glossary#export) which we looked at [above](#62-export-a-procedure) which essentially copies any generated code to the remote [Controller](/HAL/Overview/Glossary#controller) and can even run it for you. This is not available on all supported robots so please check the [manufacturer-specific documentation](/HAL/Manufacturers) to see if it's available on your [Robot](/HAL/Overview/Glossary#manipulator).

#### How to:

To prepare to [upload](/HAL/Overview/Glossary#upload) we must do through the same process as [exporting](/HAL/Overview/Glossary#export), so if you haven't been through [that tutorial above](#62-export-a-procedure) yet please do that before returning here.

The configuration of your [Controller](/HAL/Overview/Glossary#controller) will be different depending on the manufacturer so please check the [manufacturer-specific documentation](/HAL/Manufacturers) to see how to configure your _Upload_ and _File Manager_ [subsystems](/HAL/Overview/Glossary#subsystems).

Now that our [Controller](/HAL/Overview/Glossary#controller) is configured and we are happy with the way our code is [Exporting](/HAL/Overview/Glossary#export), we can place the [Upload](/HAL/Overview/Glossary#upload) component from the **HAL Robotics** tab, **Control** panel. We can hook up our [Controller](/HAL/Overview/Glossary#controller) and **Solution**, exactly as we did with [Export](/HAL/Overview/Glossary#export). You will also find _Mode_ which was discussed in [Export](/HAL/Overview/Glossary#export). `Inline` mode will create a dense code file with as little declarative code as possible. `Predeclaration` mode will do just the opposite, it will create variables wherever possible to make it easier to change things by hand should you want to. For most scenarios we recommend `Inline` as it produces shorter code and is faster. When we run the component by toggling _Upload_ to `true` this will generate our code and copy it to the robot.

The _AutoRun_ property will attempt to run the [Procedure](/HAL/Overview/Glossary#procedure) as soon sa it's been [Uploaded](/HAL/Overview/Glossary#upload) so use it with **extreme caution**. This is not available on all supported robots so please check the [manufacturer-specific documentation](/HAL/Manufacturers) to see if it's available on your [Robot](/HAL/Overview/Glossary#manipulator) and whether there are any restrictions on when it can be used.

---
### 6.4. Reuse Controller Data

#### Objective:

In this tutorial we'll explore some advanced syntax which allows you to reference data and variables which are already declared on your [Controller](/HAL/Overview/Glossary#controller) or rename variables you [Export](/HAL/Overview/Glossary#export) using the HAL Robotics Framework.

#### Background:

When your [Robot](/HAL/Overview/Glossary#manipulator) and, more importantly, its [Controller](/HAL/Overview/Glossary#controller) were installed, it's possible that certain [Tools](/HAL/Overview/Glossary#end-effector) were calibrated and stored in the [Controller's](/HAL/Overview/Glossary#controller) system variables or that it would be helpful to name [Signals](/HAL/Overview/Glossary#signal) so they're immediately identifiable (e.g. _ToolOn_) but that they're named differently in your [Controller](/HAL/Overview/Glossary#controller) or even that your [Robot's](/HAL/Overview/Glossary#manipulator) language doesn't allow you to name [Signals](/HAL/Overview/Glossary#signal) at all. We have therefore given you the option of overriding the way elements are [Exported](/HAL/Overview/Glossary#export). These are generally useful for [Tools](/HAL/Overview/Glossary#end-effector), [References](/HAL/Overview/Glossary#reference) and [Signals](/HAL/Overview/Glossary#signal) but can be used for [Targets](/HAL/Overview/Glossary#target), [Motion Settings](/HAL/Overview/Glossary#motion-action) or any other declarable type.

#### How to:

These overrides are all done through the naming of objects, by using special syntax in their _Aliases_. There are 3 scenarios we permit:
1. Forcing the declaration of the element, even in `Inline` mode, e.g. so you can make manual changes to the code later. 
2. Skipping the declaration of the element, e.g. because it's already in the [Controller's](/HAL/Overview/Glossary#controller) system variables and you want to use that data directly.
3. Renaming the element, e.g. the [Signal](/HAL/Overview/Glossary#signal) which you have called _ToolOn_ for legibility is actually called _DO-04_ or is index _3_ on the real [Controller](/HAL/Overview/Glossary#controller).
4. [Bonus] A combination of the above.

The syntax you can use is as follows:
1. Declare an override - Append `@` to the _Alias_
2. Skip declaration - Append `!` to the _Alias_
3. Renaming - Append the new name to the _Alias_

Examples:

| Code | Description |
| ---- | ----------- |
| `MyTool` | Regular tool declaration. |
| `MyTool@` | Forces the declaration of the tool. | 
| `MyTool@toolData32` | Forces the declaration of the tool, as a tool variable called toolData32. |
| `MyTool@!` | No declaration – considers that a "MyTool" tool declaration already exists in the controller. |
| `MyTool@!toolData32` | No declaration – use the toolData32 tool variable from the controller. |

---