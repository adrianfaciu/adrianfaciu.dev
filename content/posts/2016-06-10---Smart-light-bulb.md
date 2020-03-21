---
title: "Creating a Mobile App for a Smart Light Bulb with NativeScript & Angular"
date: "2016-10-06T23:46:37.121Z"
template: "post"
draft: false
slug: "/posts/smart-light-bulb/"
category: "NativeScript"
tags:
  - "NativeScript"
  - "Mobile"
  - "Angular"
description: "Since one of the awesome things I got from AngularConnect was a Magic Blue smart light bulb and NativeScript looks like an interesting framework, I’ve decided to create a small mobile app to interact with it."
---

Since one of the awesome things I got from AngularConnect was a Magic Blue smart light bulb and NativeScript looks like an interesting framework, I’ve decided to create a small mobile app to interact with it.

[NativeScript ](http://www.nativescript.org)is an open source framework for building native mobile applications, using web technologies, and it works with the latest version of [Angular](https://angular.io/).

![](https://cdn-images-1.medium.com/max/2000/1*K0hYDiKQC3A-MxjL_LfhuA.jpeg)

I’ll go through setting up the environment, creating a new template application, a basic component and interacting with the light bulb.

### Environment

First you need to setup everything, before we actually get to write any code. You start with Node.js, which if you don’t have already you can go to [nodejs.org](https://nodejs.org/) and grab it.

Second you need to install the NativeScript CLI:

    npm install -g nativescript

Since it will build native Android or iOS apps you also need to setup the platform for each of them, things like Android SDK, Xcode, etc. I suggest you manually set them up, or you can go to the [quick setup part in the NativeScript docs](http://docs.nativescript.org/start/quick-setup) which have some ready made scripts that should do everything.

Finally you can check that everything works using the NativeScript CLI doctor:

    tns doctor

If you run into trouble or want more information about the setup, the [official docs](http://docs.nativescript.org/start/quick-setup) are quite helpful.

### New application

Creating a new application is easy enough, with the help of NativeScript CLI. Create a new application template with:

    tns create NativeScriptLightBulb --ng

The first parameter is the application name, and with the second one you’re specifying that we want to use Angular. You can also create applications without Angular, and they will use JavaScript/TypeScript only with the provided SDK.

Second you need to add a new platform to the application, iOS or Android:

    tns platform add ios

    tns platform add android

At this point you can build and start the application in the emulator or on a real connected device:

    tns run android --emulator

Or, if you want to have a live sync kind of flow:

    tns livesync android --emulator --watch

This will watch all the files in the solution, build and redeploy the application on each change. Similar to modern web development workflows.

### Creating the first component

You can start by creating a simple Angular component, with the accompanying template and style files. For a better project structure add all of them into a _components/bulb-control_ folder.

The project structure should look similar to this:

![](https://cdn-images-1.medium.com/max/2000/1*z-PEkmQugtidJhgm2Qqs_w.png)

Then create a class and add the component decorator:

<iframe src="https://medium.com/media/001c60b5ccbb820d04cc541c7fc1f5df" frameborder=0></iframe>

Beside the boilerplate code, there is one method that will eventually update the light bulb color, a method to connect to the light bulb, a set of properties that will be used to bind the color model (red, green, blue, warm white) and some minimum and maximum values for a color. I’ll create the template for this model shortly.

NativeScript uses Angular, but it doesn’t work with a browser, so you won’t be able to use elements like *div *or *h1. *Instead NativeScript provides us a [custom made collection of elements](http://docs.nativescript.org/ui/components) that one can use, and each of these elements will be translated into a native Android or iOS UI component.

Adding some basic controls for a simple UI, that can be used to control the color of the light bulb, is all that’s needed.

<iframe src="https://medium.com/media/514f5b82064cd587a097dc8445bb3ab8" frameborder=0></iframe>

First you specify the stack layout, and then added two buttons, one for each of our actions, four sliders for the color model and a title so you know what the application does :)

The Angular binding syntax work here also, so you can add event handlers with *(tap)=”updateLightBulb()”, *bind to element properties with *[minValue]=”minValue” *and use two way binding with *[(ngModel)]=”blueValue”. [*Angular documentation](https://angular.io/docs/ts/latest/guide/template-syntax.html) offers more insights about this if needed.

With some basic styling (can be grabbed [from GitHub](https://github.com/adrianfaciu/NativeScriptLightBulb/tree/master/app/components/bulb-control)) the application should look like this:

![screenshot from a real device](https://cdn-images-1.medium.com/max/2000/1*kxBAdc3dxPbcU61qJPGbsg.png)_screenshot from a real device_

### Interacting with the light bulb

Even though NativeScript offers the option to [access all native APIs directly](http://docs.nativescript.org/angular/tutorial/ng-chapter-6) from TypeScript, which is pretty neat, I’ll use a ready made plugin that will interact with bluetooth connectivity.

NativeScript-Bluetooth can be found on [GitHub](https://github.com/EddyVerbruggen/nativescript-bluetooth) and you can add it to the project using the CLI:

    tns plugin add nativescript-bluetooth

Next, you can move on, to create some services to help interact with the bluetooth plugin. You can create one as a wrapper for the bluetooth plugin and one to hold the logic related to the light bulb.

![](https://cdn-images-1.medium.com/max/2000/1*h7ihRHgBMsU9OazM2powPw.png)

A class to hold a bluetooth device properties might come in handy also.

<iframe src="https://medium.com/media/3d5b57496a96361de7fa8b712d39645a" frameborder=0></iframe>

First thing that you need to do is handle the application permissions. For Android this means that inside the AndroidManifest.xml file you’ll add these extra three permissions:

    <uses-permission android:name=”android.permission.BLUETOOTH”/>
    <uses-permission android:name=”android.permission.BLUETOOTH_ADMIN”/><uses-permission android:name=”android.permission.ACCESS_COARSE_LOCATION”/>

The first two will allow to discover and connect to bluetooth devices, and the last one is needed to access the device location. This is needed for devices running Android 6, where you need the location permission in order to scan for nearby BLE enabled devices.

Moreover, even if they are added, you need an extra step to request for permission at run time in order to be able to scan for devices. You can do this with *requestCoarseLocationPermission *method from the bluetooth plugin:

<iframe src="https://medium.com/media/d55a71f9e893ee9396b693666c9b583c" frameborder=0></iframe>

You can call this method when the application initialises, to be sure we have the permission from that point on. For example in the OnInit hook of our light bulb component.

Other methods like _write_, *connect *or *disconnect *from the bluetooth service are just wrappers around the ones from the bluetooth plugin so I could add callbacks with some log messages. You could have, just as easily, used directly methods from the plugin. As a bonus you get an abstraction, the application does not know directly of this plugin, and you could switch it with something else, or with my own implementation by changing only this service.

The last interesting method here is *scan, *where you try to fetch all the devices available and store them:

<iframe src="https://medium.com/media/93c7ed48182ae1d954410c3b18671540" frameborder=0></iframe>

You’ll use the devices list further on when you’ll try to figure out which one is a smart light bulb.

### Hooking up the UI and the light bulb

Use the light bulb command service to interact with the device from the UI components. There will be two essential methods in here, one to figure out which of the devices is magic blue and one to write a message to the light bulb in order to change its color.

A naive approach for detecting the device and just fetch the fist one that has ‘_LEDBLE_’ in its name works great. After that you need to connect to it, so it will be ready for receiving messages:

<iframe src="https://medium.com/media/5a878bf14456f7afb26fe086d81bdacc" frameborder=0></iframe>

The second important part here is actually sending a message to the device. Nothing to complicated here, you need to create a message with the correct structure and add data with the correct encoding. Had quite a lot of fun trying to figure out what the light bulb expects but managed to figure it out in the end:

<iframe src="https://medium.com/media/3824082c8346f55e42c809ddbc09ded9" frameborder=0></iframe>

The message structure is composed from the device identifier and value to be written along with the service and characteristic ids of the device. This is device specific and is retrieved in the *connect *method*. *Each device can have multiple services with multiple characteristics. Each of them has a set of properties, and if _write_ is specified as true, it means you can write values to it.

The data that you need to write to the light bulb is formed from the RGB colors, along with some (in this case) hard coded values that control other properties of the light bulb. The bluetooth plugin expects data in hexadecimal so we map all elements of the array to that and join them.

Having this done, you can go back to the component and wire up the connect and update methods in there:

<iframe src="https://medium.com/media/fd743749c1cbd3d7b099e671443634ea" frameborder=0></iframe>

And voilà, you’re controlling the light color :)

![](https://cdn-images-1.medium.com/max/2000/1*ADeu7XZHPPsdw3HrKKRtVg.png)

### Source code

The [complete source code](https://github.com/adrianfaciu/NativeScriptLightBulb) can be found in [this GitHub repository](https://github.com/adrianfaciu/NativeScriptLightBulb). It contains a full working solution and some small updates beside what was described above. Have fun coding!
