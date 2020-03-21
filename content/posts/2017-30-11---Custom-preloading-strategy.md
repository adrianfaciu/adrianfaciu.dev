---
title: "Custom preloading strategy for Angular modules"
date: "2017-11-30T23:46:37.121Z"
template: "post"
draft: false
slug: "/posts/preloading-strategy/"
category: "Angular"
tags:
  - "Angular"
  - "Loading"
  - "Best practices"
description: "Lets say we have a medium sized Angular application and each large feature split into a lazy loaded module. When the application starts, we load only the main modules and all the routes are lazy loaded, including the first one that we navigate to."
---

Lets say we have a medium sized Angular application and each large feature split into a lazy loaded module.

When the application starts, we load only the main modules and all the routes are lazy loaded, including the first one that we navigate to.

<iframe src="https://medium.com/media/345fd58763100129336eaa7b573dcf74" frameborder=0></iframe>

So what happens is that the app, core and shared modules are loaded, right away we navigate to a feature page and the coresponding module is loaded. When we go to item details page, since the module is lazy loaded, before we do something we have to wait for it to get loaded.

This is already an awesome setup and thumbs up if you use it 👍

We can improve things a bit by using a [preloading strategy](https://angular.io/api/router/PreloadingStrategy) that Angular provides for us. When we provide the routes to the [router module](https://angular.io/api/router/RouterModule) we have a second argument where we can specify a strategy.

    RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })

Out of the box Angular provides two strategies already implemented for us, pretty explanatory from the name:

- **NoPreloading** — no modules are preloaded, this is the _default_ _behaviour_

- **PreloadAllModules** — all modules are preloaded as fast as possible

While this will work in some scenarios, we might want to create something a bit more complex here. All we have to do is create a class that implements [PreloadingStrategy](https://angular.io/api/router/PreloadingStrategy) class.

A good strategy here would be to load quickly just what is required and load some of the other modules with a small delay. We might know that after the initial load most of the users will go to a specific feature module, then after everything is loaded we can preload that feature module where we think users might go, or maybe preload all the other modules if we don’t have that many.

We start by adding a data object to the routes config, so we can leverage this in our custom preloading strategy:

<iframe src="https://medium.com/media/17a21a47426b50fc170211e26dd37ddd" frameborder=0></iframe>

Inside the data object I’ve added two properties, both boolean:

- preload — if we want to preload that module or not

- delay — if we want to load it right away or with a delay

Then we implement the preload method and decide which modules we preload right away and which we load with a small delay:

<iframe src="https://medium.com/media/fcb4a70e98487353e867cf786d545e0a" frameborder=0></iframe>

Normally we would just check to see if the route has the preload property set to true and then we would call the load function, if not we would return an observable with null value (this will indicate that we don’t want any preloading):

    return route.data && route.data.preload ? load() : of(null);

This can be improved by creating a _loadRoute_ function that takes an argument, the delay property. If _delay is false_ we call the load function right away. If *delay is true *an observable that emits a value after an interval is created, with the timer method, and the result is flat mapped to calling the load method.

The only thing left is to use this new strategy:

    RouterModule.forRoot(routes, {
       preloadingStrategy: AppPreloadingStrategy
    })

Using this our module is already loaded when we need it and the user has an improved experience.
