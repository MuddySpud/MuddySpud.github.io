---
title: null
mapFolderPath: tsmaps/HAL/decode/%CE%9E%204-Workflows
fragsFolderPath: HAL/decode/4-Workflows_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLBn12Cn","path":"HAL/decode","fragmentFolderPath":"HAL/decode/4-Workflows_frags"},"fragment":{"id":"fdLBn12Cn","topLevelMapKey":"cQbYbd02OI","mapKeyChain":"cQbYbd02OI","guideID":"fdLBn1184","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/decode/4-Workflows.tsmap","parentFragmentID":null,"chartKey":"cQbYbd02OI","options":[]}} -->

## 4. Operator Workflows

[4.1. Create a Workflow](#41-create-a-workflow)  
[4.2. Steps](#42-steps)   
[4.3. Run a Workflow](#43-run-a-workflow)  

---
### 4.1. Create a Workflow

#### Objective:

In this tutorial we'll create an **Operator Workflow** in _decode_.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**

#### Background:

**Operator Workflows** are a set of collaborative work instructions for the operator of a [Cell](/HAL/Overview/Glossary#cell), [Robots](/HAL/Overview/Glossary#motion-action) and any other peripheral devices, like sensors, that need to be controlled or feed into the process.

#### How to:

From the **Workflow Editor** screen, click on the three bar menu icon (**☰**) in the top right-hand corner and **Add a New Workflow**. You can use the same menu to rename the **Workflow**, add other **Workflows** or delete the currently selected **Workflow**.

[<img src="/HAL/assets/images/decode/04-WorkflowEditor/WorkflowEditor-Create.gif">](/HAL/assets/images/decode/04-WorkflowEditor/WorkflowEditor-Create.gif){: .pad-top}
<em>An empty Workflow isn't very useful but offers a lot of potential.</em>{: .pad-bottom}

---
### 4.2. Steps

#### Objective:

In this tutorial we'll look at the different **Steps** that can be added to an **Operator Workflow** in _decode_.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**
- An [Operator Workflow](#41-create-a-workflow)

#### Background:

An **Operator Workflow** is comprised of a sequence of multiple **Steps** which create the collaborative work instructions for the [Cell](/HAL/Overview/Glossary#cell) and operator. Some **Steps** are informational, others request information from the operator, run computational tasks, or communicate with devices.

#### How to:

[<img src="/HAL/assets/images/decode/04-WorkflowEditor/WorkflowEditor-Complete.png">](/HAL/assets/images/decode/04-WorkflowEditor/WorkflowEditor-Complete.png){: .pad-top}
<em>Workflows acts a collaborative work instructions for operators and connected devices.</em>{: .pad-bottom}

Use the _Item Type_ selector to choose the **Step** type you want to add and click the **+** button to add it. As usual, it is highly recommended to assign a useful _Name_ to any **Step**. The standard **Steps** and their settings are listed below.

##### Operator Interactions
- **Operator Notification** shows a message to the operator which requires no interaction from them. The only setting is the _Message_ they are to be shown. e.g. _The robot has finished its process._
- **Operator Confirmation** shows a message to the operator with a button to confirm before the **Workflow** proceeds. The settings are a _Message_ to the operator and the _Confirm Button Content_ which is the text on the button they will see. e.g. _Load the part into the fixturing and click "Done" once complete._ - _Done_
- **Operator Input** builds on **Operator Confirmation** and also asks the operator to set the value of a [Variable](/HAL/decode/1-Getting-Started#14-variables). A selector is shown from which the [Variable](/HAL/decode/1-Getting-Started#14-variables) can be chosen, and if _Validate on Change_ is active, then _decode_ will re-**solve** the [Procedure](/HAL/Overview/Glossary#procedure) every time the value is changed by the operator. e.g. _How fast should the robot go?_ - _MySpeed Variable_ - _OK_
- **Operator Choice** allows the operator to choose from one or more **Options**, each of which can branch the **Workflow**. The new settings here are _Minimum_ and _Maximum_ which specify the minimum and maximum number of **Options** the operator can select before proceeding. Setting either to `0` will allow any number of **Options** to be a valid selection. Once your **Operator Choice** has been created, two **Options** will automatically be generated within it, more can be added by selecting the **Operator Choice** and clicking the **+** with **Option** in the _Item Type_ selector.

[<img src="/HAL/assets/images/decode/04-WorkflowEditor/WorkflowEditor-OperatorInput.png">](/HAL/assets/images/decode/04-WorkflowEditor/WorkflowEditor-OperatorInput.png){: .pad-top}
<em>Workflow Steps can ask the operator for input about how the process should work.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/decode/05-WorkflowExecutor/WorkflowExecutor-OperatorInput.png">](/HAL/assets/images/decode/05-WorkflowExecutor/WorkflowExecutor-OperatorInput.png){: .pad-top}
<em>An editor will be shown to the operator when asking for their input.</em>{: .pad-bottom}

##### Non-Interactive
- **Set Variable** works like an **Operator Input** but does not prompt the operator. These are envisaged to be most useful within **Options** but are not limited to that case. If **Visible To Operator** is activate, the operator will be notified that the value of the [Variable](/HAL/decode/1-Getting-Started#14-variables) has been changed, and told what the new value is. The _Value_ to be set can be changed via the _Value_ **edit** button.
- **Validate** will **solve** the [Procedure](/HAL/Overview/Glossary#procedure) and has two different **Options** which allow specifying different **Workflow** branches depending on whether the **solve** succeeds or fails. The minimum alert level which counts as a failure can be set in _Failure Level_.

##### Structural
- **Group** allows the logical structuring of **Workflows** but has no inherent behaviour, exactly like **Programming** **Groups**.
- **Option** can only be added to an **Operator Choice** and defines a sub-**Workflow** which can have its own set of **Steps** which will be executed when the operator chooses that **Option**. Each **Option** can be renamed and have a **Description** added to help the operator.
- **On Success** and **On Failure** are essentially **Options** that are hardcoded into the **Validate** **Step**.
- **Go To** allows the **Workflow** to return to a previous point. These should only be used in **Options** to avoid unescapable loops.

##### Ouputs
_N.B. For any of these to run the [Procedure](/HAL/Overview/Glossary#procedure) must be validated by **Validate** or _Validate on Change_ in **Operator Input**.
- **Export Code** allows you to [Export](/HAL/Overview/Glossary#export) code to a folder. The Controller, _Destination_ and _Mode_ can be set. `Inline` **Mode** will create a dense code file with as little declarative code as possible. `Predeclaration` mode will do just the opposite, it will create variables wherever possible to make it easier to change things by hand should you want to. For most scenarios we recommend `Inline` as it produces shorter code and is faster. You can also set what happens once the code is [Exported](/HAL/Overview/Glossary#export) in _On Export_.
- **Upload Code** allows you to [Upload](/HAL/Overview/Glossary#upload) code directly to a Controller. The same settings as **Export Code** apply but the **Destination** is on the Controller. _Run Automatically_ will, if possible, start executing the [Robot](/HAL/Overview/Glossary#manipulator)'s [Procedure](/HAL/Overview/Glossary#procedure) once the [Upload](/HAL/Overview/Glossary#upload) completes.
- **Set Procedure Execution** works just like _Run Automatically_ in **Upload Code** in _Production Mode_ when set to but will run a [simulation](/HAL/Overview/Glossary#73-simulation) in the 3D viewport in _Simulation Mode_. It will not, however, [Upload](/HAL/Overview/Glossary#upload) any code.

---
### 4.3. Run a Workflow

#### Objective:

In this tutorial we'll see how to run an **Operator Workflow** in _decode_.

#### Requirements to follow along:

- HAL Robotics _decode_ installed on a PC. See [Installation](/HAL/Overview/0-Administration-and-Setup#01-install) if you need to install the software.
- An open [project](/HAL/decode/1-Getting-Started#11-projects)
- A [Robot](/HAL/Overview/Glossary#manipulator) in the **Scene**
- A [Controller](/HAL/Overview/Glossary#controller) in the **Scene**
- An [Operator Workflow](#41-create-a-workflow)

#### Background:

**Operator Workflows** are a set of collaborative work instructions for the operator of a Cell, [Robots](/HAL/Overview/Glossary#motion-action) and any other peripheral devices, like sensors, that need to be controlled or feed into the process. The **Operator Workflow Executor** is the only screen that an operator should need to interact with.

#### How to:

The **Operator Workflow Executor** screen has a few buttons at the top and nothing else, yet. The _simulation/production_ mode toggle changes between running the virtual [Robot](/HAL/Overview/Glossary#manipulator) or the real one. The **Workflow** selector allows the operator to choose which **Workflow** they want to run. The **X** resets the execution of a **Workflow** if for any reason the operator needs to start again or abort the current run. The **play**/**pause** button plays or pauses the execution and the circular arrows activates or deactivates the looping of the **Workflow**.

Once the **Workflow** is started **Notifications**, **Confirmations**, **Inputs** etc. will start appearing for the operator, as programmed in the **Workflow**.

[<img src="/HAL/assets/images/decode/05-WorkflowExecutor/WorkflowExecutor-Simulation-FastExecution.gif">](/HAL/assets/images/decode/05-WorkflowExecutor/WorkflowExecutor-Simulation-FastExecution.gif){: .pad-top}
<em>The operator will continue to get instructions and be able to adjust the process until their Workflow is complete.</em>{: .pad-bottom}

---

[Continue to: 5. Advanced Programming](/HAL/decode/5-Advanced-Programming#5-advanced-programming)