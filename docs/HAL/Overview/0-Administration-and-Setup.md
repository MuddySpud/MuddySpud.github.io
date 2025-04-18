---
title: null
mapFolderPath: tsmaps/HAL/Overview/%CE%9E%200-AdministrationAndSetup
fragsFolderPath: HAL/Overview/0-Administration-and-Setup_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLCQD1tX","path":"HAL/Overview","fragmentFolderPath":"HAL/Overview/0-Administration-and-Setup_frags"},"fragment":{"id":"fdLCQD1tX","topLevelMapKey":"eGXo6I1ag","mapKeyChain":"eGXo6I1ag","guideID":"fdLCQD08V","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/HAL/Overview/0-AdministrationAndSetup.tsmap","parentFragmentID":null,"chartKey":"eGXo6I1ag","options":[]}} -->

## 0. Administration and Setup

[0.1. Install](#01-install)  
[0.2. Create and Administer an Organization](#02-create-and-administer-an-organization)  
[0.3. Join an Organization](#03-join-an-organization)  
[0.4. Purchase Licenses](#04-purchase-licenses)  
[0.5. Complete Uninstallation](#05-complete-uninstallation)  

---
### 0.1. Install

#### Objective:

In this tutorial you will learn how to install the HAL Robotics Framework from the [user portal](https://user.hal-robotics.com/).

#### Requirements to follow along:

- Host software e.g. [McNeel's Rhinoceros 3D and Grasshopper](https://www.rhino3d.com/download), installed on a PC. _N.B. We are working with McNeel to automate this process for you._
- Internet access.

#### How to:

In order to install and use the HAL Robotics Framework, you will first need to [create your account on the HAL user portal](https://user.hal-robotics.com/Account/Register).
If you already have an account, you can simply [login to the user portal](https://user.hal-robotics.com/Account/Login). 

[<img src="/HAL/assets/images/Overview/01UserPortalRegister.PNG">](/HAL/assets/images/Overview/01UserPortalRegister.PNG){: .pad-top}
<em>Register using a valid email address, as it will be used for support and licensing.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Overview/01UserPortalRegistration.PNG">](/HAL/assets/images/Overview/01UserPortalRegistration.PNG){: .pad-top}
<em>Upon validation of your registration details, please verify that our confirmation email is not blocked by your spam filter.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Overview/01UserPortalRegistrationConfirmation.PNG">](/HAL/assets/images/Overview/01UserPortalRegistrationConfirmation.PNG){: .pad-top}
<em>A final registration confirmation will be displayed once you click on the link you received via email.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Overview/01UserPortalLogin.PNG">](/HAL/assets/images/Overview/01UserPortalLogin.PNG){: .pad-top}
<em>The login page simply requires your email and password.</em>{: .pad-bottom}

On the home page you should see a _Downloads_ tab which will give you a link to [download the HAL Robotics Framework](https://halinstaller.blob.core.windows.net/windows/HALRoboticsFramework.exe). By clicking on that link, you will download the HAL Robotics Framework Installer. 

[<img src="/HAL/assets/images/Overview/01UserPortal.PNG">](/HAL/assets/images/Overview/01UserPortal.PNG){: .pad-top}
<em>The [user portal](https://user.hal-robotics.com/) Downloads page.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Overview/01SetupExe.PNG" style="display:block">](/HAL/assets/images/Overview/01SetupExe.PNG){: .pad-top}
<em>The downloaded "Setup.exe" application will install the HAL Robotics Framework Installer.</em>{: .pad-bottom}
v
Once the download is complete, run the installer and you should see a list of all available packages and extensions. 
Select the ones you want to install according to the robots that you will want to program using the HAL Robotics Framework and the host software you want to add the Framework to. For example, if you want **_decode_** simply select **HAL._decode_** or for the **Grasshopper SDK**, select **HAL.McNeel.V5**. Once you have selected your configuration simply click apply and the installation will start.

Every time there are updates available for the packages you have installed simply clicking apply will download and install the latest version.

Once the installation is complete you have successfully installed the HAL Robotics Framework.

[<img src="/HAL/assets/images/Overview/01InstallerDisclaimer.PNG">](/HAL/assets/images/Overview/01InstallerDisclaimer.PNG){: .pad-top}
<em>Important information is displayed during the installation phases, please take notice of these elements before using the software.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Overview/01InstallerPackages.PNG">](/HAL/assets/images/Overview/01InstallerPackages.PNG){: .pad-top}
<em>The HAL Robotics Framework is composed of functionality modules. The installer lets you select the ones you wish to install.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Overview/01InstallerPackageLicenses.PNG">](/HAL/assets/images/Overview/01InstallerPackageLicenses.PNG){: .pad-top}
<em>Each module is distributed with a corresponding End-User License Agreement (EULA), please take notice of these elements before using the software.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Overview/01InstallerProgress.PNG">](/HAL/assets/images/Overview/01InstallerProgress.PNG){: .pad-top}
<em>Upon validation of the module selection, the installer will download and install each module and the corresponding dependencies.</em>{: .pad-bottom}

[<img src="/HAL/assets/images/Overview/01InstallerComplete.PNG">](/HAL/assets/images/Overview/01InstallerComplete.PNG){: .pad-top}
<em>You can exit the installer once the setup is complete.</em>{: .pad-bottom}

---
### 0.2. Create and Administer an Organization

#### Objective:

This tutorial is aimed at organization administrators who would like to manage licenses and users for their institution from the [user portal](https://user.hal-robotics.com/). If you are a user trying to access their organization's licenses please skip forward to the [Join an Organization](#03-join-an-organization) tutorial. Please note that all new organizations need approval from a HAL Robotics team member so please **do not** follow this tutorial unless you represent an organization.

#### Requirements to follow along:

- Internet access.

#### Background:

Creating an organization will allow members to share floating licenses. This maximizes the usage of your licenses and avoids employees or students leaving with access to a license you've paid for.

#### How to:

Start by browsing to the [user portal](https://user.hal-robotics.com/) and [logging in](https://user.hal-robotics.com/Account/Login). You can then navigate to the [Organizations tab](https://user.hal-robotics.com?PageName=Organizations). Here you should see a list of any organizations you are already a member of. It's likely that this list is empty at this stage so let's create an organization for you company or institution.

Click on the "Create" button at the top of the tab. There are a few details that need to be entered here:
* The name of the organization.

* Your _Company number_ and _VAT number_ are optional but they will need to be set (unless exempt) before you can purchase licenses for this organization online.

* If your organization is an academic institution then you can tick the "Academic" box.

* _Checkout Rights_ define who can temporarily check-out your licenses for offline use. "All" allows any member of your organization to do this. "None" allows nobody to do this. "AdminOnly" allows only the admins of the organization to do this.

* The _Billing Address_ is required and will be used for online license purchases.

* The _Joining Phrase_ is a semi-private phrase which can be used in conjunction with the organization's name to allow members to join your organization without your intervention. This can either be a word, phrase or string that you choose, or by clicking the _refresh_ button, we can generate a 3-word phrase for you. Have a look at the [Join an Organization](#03-join-an-organization) tutorial to see the _Joining Phrase_ in action. 

* All other information is optional but will help to automatically populate information when requesting quotes or purchasing information.

[<img align="left" src="/HAL/assets/images/Overview/02CreateOrganization.PNG">](/HAL/assets/images/Overview/02CreateOrganization.PNG){: .pad-top}
<em>Fill the organization creation form then validate using the Create button.</em>{: .pad-bottom}

Click "Request Creation" and you will be redirected to your "Organizations" tab. Once the organization has been confirmed by the HAL Robotics team, you can view the members and licenses of the organization, and purchase licenses on the organization's behalf. You can use the "Members" tab to toggle the admin status of members or remove them. The "Licenses" tab can be used to check which licenses are in use and when they expire.

[<img align="left" src="/HAL/assets/images/Overview/02Organizations.PNG">](/HAL/assets/images/Overview/02Organizations.PNG){: .pad-top}
<em>The "Organizations" tab displays your memberships.</em>{: .pad-bottom}

[<img align="left" src="/HAL/assets/images/Overview/02OrganizationMembers.PNG">](/HAL/assets/images/Overview/02OrganizationMembers.PNG){: .pad-top}
<em>The "Members" tab of an organization displays members and their roles.</em>{: .pad-bottom}

[<img align="left" src="/HAL/assets/images/Overview/02OrganizationLicenses.PNG">](/HAL/assets/images/Overview/02OrganizationLicenses.PNG){: .pad-top}
<em>The "Licenses" tab of an organization displays licenses and their status.</em>{: .pad-bottom}

---
### 0.3. Join an Organization

#### Objective:

This tutorial is aimed at users who want to join their organization on the [user portal](https://user.hal-robotics.com/) and access the organization's licenses. If you are unsure of whether your company or institution has an organization please talk to your I.T. department or HAL Robotics Framework admin.

#### Requirements to follow along:

- Internet access.
- Organization name (including capitalization) on the portal.
- Organization joining phrase.

#### Background:

Joining an organization will allow you to access your organization's licenses.

#### How to:

Start by browsing to the [user portal](https://user.hal-robotics.com/) and [logging in](https://user.hal-robotics.com/Account/Login). You can then navigate to the [Organizations tab](https://user.hal-robotics.com?PageName=Organizations). Here you should see a list of any organizations you are already a member of. It's likely that this list is empty at this stage so let's join the organization for you company or institution.

Click on "Join" at the top of the page. Here you will be asked for the organization's name and passphrase. If you don't know these details for your organization please ask to your I.T. department or HAL Robotics Framework admin as they will have access to these details. If your organization isn't found please check the spacing, punctuation and casing of both entries.

[<img align="left" src="/HAL/assets/images/Overview/03JoinOrganization.PNG">](/HAL/assets/images/Overview/03JoinOrganization.PNG){: .pad-top}
<em>The "Join" tab will allow you to join your organization and access its licenses.</em>{: .pad-bottom}

---
### 0.4. Purchase Licenses

#### Objective:

This tutorial will guide you through how to purchase licenses for the HAL Robotics Framework on the [user portal](https://user.hal-robotics.com/). The process is the same whether you're purchasing for yourself or for an organization.

#### Requirements to follow along:

- Internet access.

#### Background:

Purchasing licenses will allow you to use the HAL Robotics Framework and are sold on a subscription basis, starting from 1 year. They do not automatically renew.

#### How to:

Start by browsing to the [user portal](https://user.hal-robotics.com/) and [logging in](https://user.hal-robotics.com/Account/Login). You should then see navigate the [Purchase Licenses tab](https://user.hal-robotics.com?PageName=LicenseRequest).

* You must have a name set to purchase licenses. If your name is not listed after _For attention of_, click on _Hello youremailaddress@example.com!_ and set your first and last names.

* If you wish to purchase licenses for an organization, use the _Organization_ drop down to select the correct one. You must be an admin for the organization to purchase licenses on its behalf. Otherwise, if you wish to purchase licenses for yourself then leave this set to "None".

* Set _Reference_ if you want to add a Purchase Order number or similar to any invoices.

* **For personal licenses** - if your _Billing Address_ is not valid, the _Billing Address_ field will be editable. Set your address and click "Save".
**For organization licenses** - your _Billing Address_ and _VAT number_ are set by your organization. If these need changing, please navigate to the [Organizations tab](https://user.hal-robotics.com?PageName=Organizations), "View" your organization and under "Details" click "Edit".

* Choose your license types, quantities and durations. "Professional" licenses are the default. All others are discounts from this and you will see conditions of sale under the license line.

* If you have chosen a license type for which you have not been pre-approved, you will need to upload supporting information e.g. a scan of your student card, or evidence of your company's age, so that we can approve the purchase.

Once you have entered all of your information you can "Buy Now" or "Request" your licenses, depending on whether we can automatically validate your purchase. If you do have to make a request, we will review this within 1 business day and either send you an invoice directly or be in touch to clarify any details.

If you do have "Buy Now" as an option, and most people should, then your invoice should open in a new tab. If it doesn't, don't worry, there will be a link to it in the summary text on the web page and you will receive it by email too. This invoice will give you links to our secure payment providers through which you can pay online. As soon as your payment clears, your licenses will be issued and we will confirm this by email.

[<img align="left" src="/HAL/assets/images/Overview/04PurchaseLicense.PNG">](/HAL/assets/images/Overview/04PurchaseLicense.PNG){: .pad-top}
<em>The "Purchase Licenses" tab will allow you to purchase or renew you HAL Robotics Framework licenses.</em>{: .pad-bottom}

[<img align="left" src="/HAL/assets/images/Overview/04RequestLicense.PNG">](/HAL/assets/images/Overview/04RequestLicense.PNG){: .pad-top}
<em>If we need to manually validate the license type you have requested, you may be asked to "Request" your licenses, rather than to "Buy Now".</em>{: .pad-bottom}

---
### 0.5. Complete Uninstallation

#### Objective:

In this tutorial you'll learn how to completely uninstall the HAL Robotics Framework.

#### Requirements to follow along:

- A PC with the HAL Robotics Framework installed.

#### Background:

Whilst we make every effort to ensure that our software is stable it may occasionally be necessary to completely remove a version of the HAL Robotics Framework.

#### How to:

Start by opening the HAL Robotics Installer and clicking uninstall. This will uninstall all packages and extensions you added through the installer.

You can then uninstall the Installer itself through the usual Windows uninstall methods. 

Once this is done you can clean up any remnants that the uninstallation process may have missed by deleting the following folders:
* %ProgramData%\\HAL
* %LocalAppData%\\HAL

---

Continue to: 1. Getting Started for [_decode_](/HAL/decode/1-Getting-Started#1-getting-started) or the [Grasshopper SDK](/HAL/Grasshopper/1-Getting-Started#1-getting-started)