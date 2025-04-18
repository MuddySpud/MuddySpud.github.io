---
title: null
mapFolderPath: tsmaps/HAL/Manufacturers/%CE%9E%20UniversalRobots
fragsFolderPath: HAL/Manufacturers/UniversalRobots_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLBua0D5","path":"HAL/Manufacturers","fragmentFolderPath":"HAL/Manufacturers/UniversalRobots_frags"},"fragment":{"id":"fdLBua0D5","topLevelMapKey":"eGVQHe1nl","mapKeyChain":"eGVQHe1nl","guideID":"fdLBua2AX","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/Manufacturers/UniversalRobots.tsmap","parentFragmentID":null,"chartKey":"eGVQHe1nl","options":[]}} -->

## Universal Robots

[0. Tips](#0-tips)  
[1. Controller Options](#1-controller-options)  
[2. Uploading Code](#2-uploading-code)  
[3. Simulation](#3-simulation)  

---

### 0. Tips

1. We do not currently have a means to reference _TCPs_ and _Payloads_ from your current Installation so make sure these are accurately defined in your simulation.
2. You can switch between Process Move (_movep_) and normal (_movel_) for linear motion in the [Controller](/HAL/Overview/Glossary#controller) configurator.
3. [Signals](/HAL/Overview/Glossary#signal) are identified by their indices so either name your [signals](/HAL/Overview/Glossary#signal) with an index, e.g. _2_, or use the [export overrides](/HAL/Grasshopper/6-Control#64-reuse-controller-data) to ensure the correct index is exported.

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

You'll find two different Universal Robots controllers in our catalogs, _CB3_ (for UR3, UR5 and UR10 robots) and _e-Series CB5_ (for UR3e, UR5e, UR10e, UR16e and UR20 robots). There are minor compatibility differences between them but your interactions with them through the HAL Robotics Framework will be identical.

| Subsystem Name | Description | Capabilities | Configuration |
| -------------- | ----------- | ------------ | ------------- |
| URScript X.X | Translates [Procedures](/HAL/Overview/Glossary#procedure) to URScript. | [Language](/HAL/Overview/Glossary#capabilities) | > Enabled - Whether to export the procedure.<br>> Library Mode - Whether to export code that will run directly or that can be called from another function.<br>> Use Process Move - Whether to use Process Move (_movep_) for linear motion. Otherwise normal (_movel_) is used. |
| Dashboard X.X | [Controller](/HAL/Overview/Glossary#controller) administration interface. | [Upload](/HAL/Overview/Glossary#capabilities)<br>[Execution](/HAL/Overview/Glossary#capabilities)<br>[Backup](/HAL/Overview/Glossary#capabilities) | > IP - IP address of your remote robot or simulator.<br>> Credentials - Credentials needed to log in to the robot (or [simulator](#3-simulation)) remotely. Defaults will work unless they have been changed in your robot's Settings -> Password -> Admin window. <br>> Root Directory - Directory in which your programs, URCaps etc. are stored. Defaults to '/root' but could be blank if your [simulator is set up as below](#3-simulation) or '/ursim' if using the [default Docker image](#docker). |
| RTDE | Real-Time Data Exchange protocol which allows low latency communication and state streaming from the [controller](/HAL/Overview/Glossary#controller). | [Monitor](/HAL/Overview/Glossary#capabilities)<br>[Receive State](/HAL/Overview/Glossary#capabilities)<br>[Read Signals](/HAL/Overview/Glossary#capabilities)<br>[Write Signals](/HAL/Overview/Glossary#capabilities) | > IP - IP address of your remote robot or simulator. |
| Remote Files | Copies files to and from a remote [controller](/HAL/Overview/Glossary#controller). | [File Manager](/HAL/Overview/Glossary#capabilities) | > IP - IP address of your remote robot or simulator.<br>> Credentials - Credentials needed to log in to the robot (or [simulator](#3-simulation)) remotely. Defaults will work unless they have been changed in your robot's Settings -> Password -> Admin window. For a simulator, these should be the user on the host machine. |
| Local Files | Copies files to and from a Docker simulated [controller](/HAL/Overview/Glossary#controller). See [Simulation](#3-simulation) below for more details. | [File Manager](/HAL/Overview/Glossary#capabilities) | > Root Directory - Path to which the Docker programs path is set. See [Simulation](#3-simulation) below and the [Docker Hub page for the image](https://hub.docker.com/r/universalrobots/ursim_e-series) for more details. |

---
### 2. Uploading Code

#### Objective:

In this section we'll explain how to get the [Procedures](/HAL/Overview/Glossary#procedure) you've generated onto your robot. There are two different ways to do this, either [manually](#manual) or [remotely](#remote).

#### Remote:

If this is the first time you're setting up this particular robot controller for [remote upload](#remote), skip down to the [remote upload prerequisites](#remote-upload-prerequisites) and then come back here.

1. Ensure your controller is configured to communicate with your controller. See [Controller Options](#1-controller-options) and [Configure a Virtual Controller](/HAL/Grasshopper/6-Control#61-configure-a-virtual-controller) for more details about what your options are.
2. Follow the instructions in [Upload a Procedure](/HAL/Grasshopper/6-Control#63-upload-a-procedure).
3. That's all!

#### Remote Upload Prerequisites:

There are a few settings that need to be checked on your controller before we can connect to it from your PC. Some of these might already be correctly set on your system, but even if they aren't these will only ever need to be done once on your controller. It is also good practice to restart the controller once everything below is configured to ensure it's taken into account, the only exception is the activation of _Remote Control_ which is likely to be toggled frequently and does not require a restart.

1. Ensure you have access to the admin password for you controller. You will need this to make many of the changes below, and it will be needed when you configure your [Controller Options](#1-controller-options).
[<center><img src="/HAL/assets/images/Manufacturers/UR/URAdminPassword.PNG"></center>](/HAL/assets/images/Manufacturers/UR/URAdminPassword.PNG){: .pad-top}
<em>The Admin Password can be changed in the settings.</em>{: .pad-bottom}

2. Enable the _Network_. DHCP or Static will work as long as your PC can be on the same subnet as the controller. Make a note of the IP address as it will be needed when you configure your [Controller Options](#1-controller-options).
[<center><img src="/HAL/assets/images/Manufacturers/UR/UREnableNetwork.PNG"></center>](/HAL/assets/images/Manufacturers/UR/UREnableNetwork.PNG){: .pad-top}
<em>The controller network needs to be enabled to give us remote access.</em>{: .pad-bottom}

3. Enable the _Secure Shell (SSH)_. This will allow us to transfer code files from a PC to your controller remotely.
[<center><img src="/HAL/assets/images/Manufacturers/UR/UREnableSSH.PNG"></center>](/HAL/assets/images/Manufacturers/UR/UREnableSSH.PNG){: .pad-top}
<em>SSH allows us to transfer code files to your controller.</em>{: .pad-bottom}

4. Enable the _Services_ chosen in your [Controller Options](#1-controller-options). Typically this will include _Dashboard Server_, _RTDE_ and the _Primary Client Interface_.
[<center><img src="/HAL/assets/images/Manufacturers/UR/UREnableServices.PNG"></center>](/HAL/assets/images/Manufacturers/UR/UREnableServices.PNG){: .pad-top}
<em>Services you have chosen to remotely command your controller need to be Enabled.</em>{: .pad-bottom}

5. Ensure _inbound access_ for the following ports isn't disabled - 22 (for _SSH_), 29999 (for _Dashboard Server_), 30004 (for _RTDE_) and 30001 (for _Primary Client Interface_). If there are other services you have enabled, the full list of used ports can be found [here](https://forum.universal-robots.com/t/overview-of-used-ports-on-local-host/8889).
[<center><img src="/HAL/assets/images/Manufacturers/UR/UREnablePorts.PNG"></center>](/HAL/assets/images/Manufacturers/UR/UREnablePorts.PNG){: .pad-top}
<em>Ports can be blocked for security but access needs to be allowed for certain services.</em>{: .pad-bottom}

6. Enable _Remote Control_. This will add a nwe option in the top right corner of the screen which will allow us to command the controller from a PC using the various _Services_ we just set up.
[<center><img src="/HAL/assets/images/Manufacturers/UR/UREnableRemoteControl.PNG"></center>](/HAL/assets/images/Manufacturers/UR/UREnableRemoteControl.PNG){: .pad-top}
<em>Remote Control must be enabled before it can be activated for us to command the controller remotely.</em>{: .pad-bottom}

7. Activate _Remote Control_. This will allow us to command the controller from a PC using the various _Services_ we just set up. It can be toggled in the top right corner of you teach pendant screen. In _Remote Control_ you won't be able to jog the robot or make manual changes so you are likely to toggle this on and off a few times whilst setting up your application but remember to activate it before attempting to upload code remotely.
[<center><img src="/HAL/assets/images/Manufacturers/UR/URActivateRemoteControl.PNG"></center>](/HAL/assets/images/Manufacturers/UR/URActivateRemoteControl.PNG){: .pad-top}
<em>Remote Control must be activated for us to command the controller remotely.</em>{: .pad-bottom}

#### Manual:

1. [Export](/HAL/Grasshopper/6-Control#62-export-a-procedure) your [Procedure](/HAL/Overview/Glossary#procedure) to a known directory.
2. Copy the _{ProcedureName}.script_ file onto a USB stick.
3. Insert the USB stick into the USB port on the teach pendant.
4. Create a new **Program** on the controller with a **Script** node (you'll find this under the **Advanced** category) and set the mode to _File_.

[<center><img src="/HAL/assets/images/Manufacturers/UR/URCreateScript.PNG"></center>](/HAL/assets/images/Manufacturers/UR/URCreateScript.PNG){: .pad-top}
<em>Create a Script node into which you can load your URScript file.</em>{: .pad-bottom}

5. Click _Edit_ then _Open_ to browse to your _{ProcedureName}.script_ file on the USB stick. You can then _Exit_ the script editor.

[<center><img src="/HAL/assets/images/Manufacturers/UR/URLoadScript.PNG"></center>](/HAL/assets/images/Manufacturers/UR/URLoadScript.PNG){: .pad-top}
<em>Browse the directories and open your URScript file.</em>{: .pad-bottom}

6. Your _{ProcedureName}.script_ is now loaded and ready to run.

[<center><img src="/HAL/assets/images/Manufacturers/UR/URManualProgram.PNG"></center>](/HAL/assets/images/Manufacturers/UR/URManualProgram.PNG){: .pad-top}
<em>Browse the directories and open your URScript file.</em>{: .pad-bottom}

---
### 3. Simulation

#### Objective:

Whilst we expect most users to use our own [simulation](/HAL/Overview/Glossary#73-simulation) tools for the majority of their cases, there may be a reason (e.g. cycle time analysis, or validation of the robot's limits) that you want to run your [Procedures](/HAL/Overview/Glossary#procedure) on a manufacturer-provided simulator. This section details what you'll need and how to configure that simulator.

#### Requirements to follow along:

- Linux Mint 17.1 computer or virtual machine, or Docker (in Linux container mode if on a Windows PC).

#### How to:

##### Docker

The easiest way to run URSim on a Windows PC or Linux is via Docker for which there is a Docker image [here](https://hub.docker.com/r/universalrobots/ursim_e-series) although this is (at the time of writing) still listed as experimental. To enable [remote upload](#remote) you will need to ensure that the Dashboard port (_29999_) is exposed in your container. This is mentioned on the [Docker Hub page for the image](https://hub.docker.com/r/universalrobots/ursim_e-series). You will also need to ensure that your [File Manager](/HAL/Overview/Glossary#capabilities) is set to Local, its path is set correctly and the _Remote Root Directory_ in your Dashboard matches your Docker bind mounts e.g. _/root_ if you bind mount points to _/root/programs_ or _/ursim_ if following the Docker examples. 

E.g. `docker run --rm -it -p 5900:5900 -p 6080:6080 -p 29999:29999 -v "/c/UniversalRobots/staging/root/programs:/root/programs" -e ROBOT_MODEL=UR5 universalrobots/ursim_e-series`

In the example below, `-p 29999:29999` is used to enable the Dashboard from your PC and the `-v ...` contains the full path `/root/programs` on the left hand side.

##### Linux

**For CB Series Robots UR3-UR10** - Download the latest version of URSim **3**.x from [here](https://www.universal-robots.com/download/?filters[]=98759&filters[]=98916&query=). Installation instructions are included on the page.

**For eSeries Robots UR3e-UR16e and UR20** - Download the latest version of URSim **5**.x from [here](https://www.universal-robots.com/download/?filters[]=98759&filters[]=98916&query=). Installation instructions are included on the page.

To enable uploading from the HAL Robotics Framework to URSim you will need to modify the `start-ursim.sh` file in the URSim installation directory. This will need to be done for each installation of URSim you have on the machine.
1. Identify the code block starting with `#program directory`
2. Within this block there should be a line similar to `ln -s $URSIM_ROOT/programs.$ROBOT_TYPE $URSIM_ROOT/programs`
3. Comment this line by prefixing a `#`
4. Add a new line just below containing `ln -s /programs $URSIM_ROOT/programs`

Should end up with something like:
```
...

#program directory
rm -f $URSIM_ROOT/programs
#ln -s $URSIM_ROOT/programs.$ROBOT_TYPE $URSIM_ROOT/programs
ln -s /programs $URSIM_ROOT/programs

...
```