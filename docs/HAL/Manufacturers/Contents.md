---
title: null
---


<!-- tsGuideRenderComment {"guide":{"id":"eb1Rfe1jg","path":"HAL/Manufacturers","fragmentFolderPath":"HAL/Manufacturers/Contents_frags"}} -->

## ABB

[0. Tips](#0-tips)

[1. Controller Options](#1-controller-options)

[2. Uploading Code](#2-uploading-code)

[3. Simulation](#3-simulation)

---

### 0. Tips

1. Your [Controller](/HAL/Overview/Glossary#controller) must be in _automatic_ mode to [Upload](/HAL/Overview/Glossary#upload) code.
2. Before [Uploading](/HAL/Overview/Glossary#upload) any new [Procedures](/HAL/Overview/Glossary#procedure), ensure that all other _Modules_ (which aren't required for system variables) are unloaded. Otherwise there is a risk of a clash between two loaded _Main_ procedures or automatically named variables.

---
### 1. Controller Options

#### Objective:

In this section we'll explain which **Subsystems** are available in the HAL Robotics Framework for Universal Robots and that their **Capabilities** are. These will be used when you [Configure a Virtual Controller](/HAL/Grasshopper/6-Control#61-configure-a-virtual-controller).

#### Background:

Industrial [Controllers](/HAL/Overview/Glossary#controller) are typically comprised of core functionality, such as the ability to run a program, extended through optional extras, like communication protocols or multi-[Robot](/HAL/Overview/Glossary#manipulator) support. To ensure that we only try and interact with your real [Controller](/HAL/Overview/Glossary#controller) in a way that is compatible, be it through a network or with exported code, we have added a means to configure your [Controller](/HAL/Overview/Glossary#controller). The constituent parts of this are:

a.  Controller - this is essentially a computer to which your [Robot](/HAL/Overview/Glossary#manipulator) and [Signals](/HAL/Overview/Glossary#signal) are connected.

b.  [Capabilities](/HAL/Overview/Glossary#capabilities) - these are how we organize what a [Controller](/HAL/Overview/Glossary#controller) can do and draw parallels between different manufacturers' [Controllers](/HAL/Overview/Glossary#controller). _Capabilities_ are things like the ability to [Upload](/HAL/Overview/Glossary#upload) code to the [Controller](/HAL/Overview/Glossary#controller) from a PC or the ability to read the values of [Signals](/HAL/Overview/Glossary#signal) remotely.

c.  [Subsystems](/HAL/Overview/Glossary#subsystems) - these are similar to the options you have in your [Controller](/HAL/Overview/Glossary#controller). They are the actual software modules that implement different _Capabilities_.

#### Details:

You'll find a number of different ABB controllers in our catalogs but between the multiple _OmniCore_ and _IRC5_ versions the only major difference is the geometry. The [Controller](/HAL/Overview/Glossary#controller) type (_OmniCore_ or _IRC5_) will also define which software versions are available and therefore which [Subsystems](/HAL/Overview/Glossary#subsystems) can be chosen.

| Subsystem Name | Description | Capabilities | Configuration |
| -------------- | ----------- | ------------ | ------------- |
| ABB RAPID X.X | Translates [Procedures](/HAL/Overview/Glossary#procedure) to ABB's RAPID programming language. | [Language](/HAL/Overview/Glossary#capabilities) | > Enabled - Whether to export the procedure.<br>> Library Mode - Whether to export code that will run directly or that can be called from another function.<br>> Max Actions - Maximum number of actions to have in a single _.mod_ file. Any more and the [Procedure](/HAL/Overview/Glossary#procedure) will be created in multiple files. The maximum allowed by ABB is around 35,000 lines.<br>> Task Alias - Name of the _Task_ into which the [Procedure](/HAL/Overview/Glossary#procedure) should be [uploaded](/HAL/Overview/Glossary#upload). |
| PCSDK | Remote [Controller](/HAL/Overview/Glossary#controller) interaction library (available in RobotWares before 7.x) which requires the installation of he SDK with either RobotStudio or with the HAL.ABB extension. | [Upload](/HAL/Overview/Glossary#capabilities)<br>[Execution](/HAL/Overview/Glossary#capabilities)<br>[Monitor](/HAL/Overview/Glossary#capabilities)<br>[File Manager](/HAL/Overview/Glossary#capabilities)<br>[Read Signals](/HAL/Overview/Glossary#capabilities)<br>[Write Signals](/HAL/Overview/Glossary#capabilities)<br>[Logger](/HAL/Overview/Glossary#capabilities)<br>[Backup](/HAL/Overview/Glossary#capabilities) | > IP - IP address of your remote robot or simulator.<br>> Credentials - Credentials needed to log in to the robot (or [simulator](#3-simulation)) remotely. Defaults will work unless they have been changed in your robot's settings. <br>> Detected Controllers - Selectable controllers which the PCSDK has discovered on your network. |
| Robot Web Services (RWS) | Successor to the PCSDK which allows HTTP-based communication with the [controller](/HAL/Overview/Glossary#controller) (available in RobotWares 6.x or later). | [Upload](/HAL/Overview/Glossary#capabilities)<br>[Execution](/HAL/Overview/Glossary#capabilities)<br>[Monitor](/HAL/Overview/Glossary#capabilities)<br>[File Manager](/HAL/Overview/Glossary#capabilities)<br>[Read Signals](/HAL/Overview/Glossary#capabilities)<br>[Write Signals](/HAL/Overview/Glossary#capabilities)<br>[Logger](/HAL/Overview/Glossary#capabilities)<br>[Execution Monitoring](/HAL/Overview/Glossary#capabilities) | > IP - IP address of your remote robot or simulator.<br>> Credentials - Credentials needed to log in to the robot (or [simulator](#3-simulation)) remotely. Defaults will work unless they have been changed in your robot's settings. |
| Externally Guided Motion (EGM) | Enables low-latency state streaming to/from the [controller](/HAL/Overview/Glossary#controller) via ABB's Externally Guided Motion (EGM) protocol. This requires a software option from ABB and configuration on the [controller](/HAL/Overview/Glossary#controller). | [Monitor](/HAL/Overview/Glossary#capabilities)<br>[Stream](/HAL/Overview/Glossary#capabilities)<br>[Receive State](/HAL/Overview/Glossary#capabilities) | > IP - IP address of your remote robot or simulator.<br>> Port - Port configured on the [controller](/HAL/Overview/Glossary#controller) to receive EGM commands. |

---
### 2. Uploading Code

#### Objective:

In this section we'll explain how to get the [Procedures](/HAL/Overview/Glossary#procedure) you've generated onto your robot. There are two different ways to do this, either [manually](#manual) or [remotely](#remote).

#### Remote:

1. Ensure your controller is configured to communicate with your controller. See [Controller Options](#1-controller-options) and [Configure a Virtual Controller](/HAL/Grasshopper/6-Control#61-configure-a-virtual-controller) for more details about what your options are.
2. Follow the instructions in [Upload a Procedure](/HAL/Grasshopper/6-Control#63-upload-a-procedure).
3. That's all!

#### Manual (via Teach Pendant):

1. [Export](/HAL/Grasshopper/6-Control#62-export-a-procedure) your [Procedure](/HAL/Overview/Glossary#procedure) to a known directory.
2. Copy the _{ProcedureName}.mod_ file onto a USB stick.
3. Insert the USB stick into the USB port on the teach pendant.
4. Navigate to the _Program Editor_ and select _Modules_ (in the top centre of the screen) -> _File_ -> _Load Module_.
[<center><img src="/HAL/assets/images/Manufacturers/ABB/ABBViewModules.PNG"></center>](/HAL/assets/images/Manufacturers/ABB/ABBViewModules.PNG)
<em>Edit the Program and Load a Module.</em>

5. Navigate to your Module file on the USB stick and click _OK_.
6. Return to the _Production Window_.
7. Select _PP to Main_.
8. You are now ready to run your [Procedure](/HAL/Overview/Glossary#procedure).

---
### 3. Simulation

#### Objective:

Whilst we expect most users to use our own [simulation](/HAL/Overview/Glossary#73-simulation) tools for the majority of their cases, there may be a reason (e.g. cycle time analysis, or validation of the robot's limits) that you want to run your [Procedures](/HAL/Overview/Glossary#procedure) on a manufacturer-provided simulator. This section details what you'll need and how to configure that simulator.

#### Requirements to follow along:

- Windows PC

#### How to:

ABB's robot simulation tool is [RobotStudio](https://new.abb.com/products/robotics/robotstudio). A license is required for advanced functionality but to test basic code functionality you can simply do the following:
1. Open RobotStudio
2. If this is the first time you're opening RobotStudio, it will direct you to install a RobotWare version. Install the same version as your real [controller](/HAL/Overview/Glossary#controller).
3. Create a new empty _Station_.
4. From the **Home** tab, select _Virtual Controller_ -> _New Controller_.
5. Pick your robot, RobotWare and Controller configuring it to match your exact version.
6. Check the _Customize options_ box and match the options on your real robot.
7. This will now start a virtual controller and instantiate a model of your robot. It may take a minute or two.
8. You can now use this robot exactly as you would the real robot using the loopback IP address _127.0.0.1_ from the HAL Robotics Framework.

A few extra tips, if things aren't quite working as expected:
- If RobotWebServices (RWS) isn't working in your simulated environment, you may need to enable it using the instructions from ABB [here](https://forums.robotstudio.com/discussion/comment/36060#Comment_36060?utm_source=community-search&utm_medium=organic-search&utm_term=robotwebservices). For those experienced with ABB robots and controllers the TL;DR is - activation can be found under _Configuration -> Communication -> Firewall Manager -> RobotWebServices -> Enable_
- If you want to access your virtual controller from another PC that can be done using the instructions from ABB [here](https://forums.robotstudio.com/discussion/12082/using-robotwebservices-to-access-a-remote-virtual-controller).