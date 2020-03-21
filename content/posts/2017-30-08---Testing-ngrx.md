---
title: "Testing NgRx effects"
date: "2017-08-30T23:46:37.121Z"
template: "post"
draft: false
slug: "/posts/testing-ngrx/"
category: "NgRx"
tags:
  - "TypeScript"
  - "Angular"
  - "NgRx"
description: "My approach in testing NgRx effects. Some of the things that worked and some that did not."
---

**Update:** Since I’ve wrote this, both NgRx and RxJs released some new versions that require some small changes in how we can write the tests. You can see all those in [this follow up](https://medium.com/@adrianfaciu/update-on-testing-ngrx-effects-cf32a80d3601).

If you decide to use a _state management_ library in your [Angular](https://angular.io/) application (and for most of them you should :) ) a good choice is one of the [Redux](http://redux.js.org/) inspired libraries. You’ll most likely have actions, reducers and pretty soon something to handle all the side effects. In case of [ngrx](https://github.com/ngrx/platform), these side effects are handled with the help of the ngrx/effects module.

This post will show an approach on how to test [ngrx effects](https://github.com/ngrx/platform) and show some samples. It will not go into state management and why to use this library for managing side effects.

**An Effect** is a stream that filters the actions object (all the actions going through the application) and filters them based on the action type we want to react to. **An action** is handled by a reducer function which updates the application state. In cases where we want to have some side effects (eg. xhr call) as a result of that action, we do it in an _Effect_.

Testing reducers is pretty straight forward since they are pure functions and should not be that complex. The interesting part comes when we want to test the effects that we’ve built.

There is some [documentation ](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md)and [some samples](https://github.com/ngrx/platform/tree/master/example-app/app/books/effects) on how to test them, but the samples don’t have that much information provided and they are using the [TestBed](https://angular.io/api/core/testing/TestBed) provided by Angular. I liked better the approach that [Victor Savkin](undefined) took in his [repo on how to test effects](https://github.com/vsavkin/testing_ngrx_effects). We instantiate everything ourselves, there is no TestBed, no subscribe calls and generally the tests look and feel more clean.

As a bonus this approach works with both old (2.x) and new (4.x) version of ngrx so you can easily have the tests up and running and then migrate with confidence, and without having to rewrite the tests afterwards.

I’ve added some samples, including a bit more complex scenarios that I’ve encountered while writing tests for effects, and tried to explain each of them.

We use [jasmine-marbles](https://github.com/synapse-wireless-labs/jasmine-marbles) for easier testing and a better visualisation of Observables. While it’s not wildly popular, it’s being used trough several open source projects (including ngrx itself) and quite a few presentations. The code base is quite small so you could look at it and implement it yourself if needed.

Assuming we have the most simple effect possible that just listens for an action, might do some processing, and triggers another action as a result. The most basic approach would look something like:

<iframe src="https://medium.com/media/e9f16c1a8345268ada3581fa256dd10b" frameborder=0></iframe>

We listen to the increment action, perform any processing we might want to and generate a new action.

Inside a test we would want to trigger the increment action and make sure we always get back the update text resulting action:

<iframe src="https://medium.com/media/7b3ab9a1ea06eed1933ebf26528f3649" frameborder=0></iframe>

Using jasmine-marbles library we can create observables using marble diagrams which generally helps a lot when reading the tests. So if we have an observable that emits two values we can describe it as: ‘ -a-b-|’.

When using marble diagrams we represent them as a string using:

- - to represent passing of time (10 frames)

- | to mark the completion event

- # to emit an error

- most other characters to represent an emitted value

The library has two useful methods hot/cold that allow us to create an observable from a string representation. If you want to read about the difference between a cold and a hot observable, [Ben Lesh](undefined) has a [great article about this](https://medium.com/@benlesh/hot-vs-cold-observables-f8094ed53339).

When we create an observable using hot/cold method, the second parameter that we can pass to the method is an object that maps values for each emitted item. In our case we only pass the action object that we want to handle:

![](https://cdn-images-1.medium.com/max/2000/1*yTcOQhEC9oAWASV4q1LPng.png)

Another nice thing that jasmine-marbles adds is the **toBeObservable** matcher so we can directly compare our input with the expected result:

![](https://cdn-images-1.medium.com/max/2000/1*fPgLaYIlFP6M1iu8IXSDJA.png)

This is the basic setup for testing a simple effect that we might use.

We can move on to our second testing scenario where we use a service in the effect and we want to mock it:

<iframe src="https://medium.com/media/3b92fe1f1eed50343dce16103290ee61" frameborder=0></iframe>

Similar to our first example just that in this case we’re using a service to fetch some data. We get this service through dependency injection so we’ll need to mock it in our test to make sure we don’t hit an API or some other costly operation.

An important thing we should notice is that we don’t want to throw an exception directly on an effect stream, remember this is the main actions stream and an Observable is done after an error occured, so if we do that, no more actions will flow through the application. This is why we use the switchMap/catch combination and we make sure we create a test that checks this case.

We create a mock for our service using *createSpyObject *method from jasmine and we handle both cases where we want to return a value or an error:

<iframe src="https://medium.com/media/5a50df233241c308e57771932de8ca0d" frameborder=0></iframe>

If we pass in a value, we return an observable that will emit that value and if we pass in an error object, we return an observable that will throw that error.

Having this in place we can create our first test to check that we can retrieve data:

<iframe src="https://medium.com/media/74e0b5ef218c83d8b4b403bcaaf6e1e3" frameborder=0></iframe>

This looks pretty much as our first simple test, we instantiate a new service instance with our mock method and pass it in the effect constructor. Checking the expected value is pretty much as before. For simplicity we’re checking just the action type, but in a more real world application we would also check that the payload from the action contains the data that we want.

As mentioned above, we need to make sure we handle an exception on the stream, so we also test that our catch method works as it should:

<iframe src="https://medium.com/media/fbb17b594153be5ca03a7cd81874108a" frameborder=0></iframe>

In this case we create our service and pass an error so when we call *getDummyData *it will emit the error and it should be caught and transformed in a data fetch failed action.

Another type of effect that we can have is where we might need some other data from our application state in order to process the action or to generate a new one. This would be simple if the data would be in the same part, handled by the same reducer, but imagine that we have a more complex state object and we need to fetch something from different places. An option is to inject the store in the effect class and select what we need:

<iframe src="https://medium.com/media/5010322f7e6490bf288d5947bb6e210b" frameborder=0></iframe>

Notice that we’re creating two streams *numberStream *and *textStream *that read some data from the state and then use these values in the effect, in the *withLatestFrom *operator.

In order to test this effect we need to mock the store and make sure we select whatever data we want from it. If we would have only one stream we could have easily mocked the store and return whatever we want:

![](https://cdn-images-1.medium.com/max/2000/1*cXyWqtGOn7UgEVOMxy2wpQ.png)

But if we have multiple streams for which we use different selector it will be more tricky. One nice way to handle this is to actually initialize the state with the default value by calling the root reducer with an unknown ‘INIT’ action. Then we can call the selector on the state object and return the result in a stream:

![](https://cdn-images-1.medium.com/max/2000/1*Dv6i_qweIkX8Tkoh4w1BlA.png)

The whole test looks like this:

<iframe src="https://medium.com/media/96743b8a53b29c4fcb25c840a211db39" frameborder=0></iframe>

The last type of test that I’ve encountered is that where we need to control time :) If we use different kind of operators like _timer_, *interval *or _debounceTime_ on our effects we need some special handling in our tests.

Suppose we have an effect that looks like this:

<iframe src="https://medium.com/media/faf2203b2e0c612e7e5d28db920ff9d8" frameborder=0></iframe>

We can see that we use _debounceTime_ operator to emit only the last value from a period of time and ignore the rest. Since we do this our normal way to test this will not work, since when we check the expected value the initial one will not have emitted anything.

One dirty way to hack around this is to spy on the operator and make it do nothing:

![](https://cdn-images-1.medium.com/max/2000/1*IW_oRloVJMwWd6G3WMtrsQ.png)

Basically we just return the stream itself without anything applied to it, and then we can write the test as we would normally do, just make sure to spy on the observable operator before we create the effect:

<iframe src="https://medium.com/media/8b53f601410065117f359628cf9a53dc" frameborder=0></iframe>

A second approach is to use the Scheduler that is provided by the jasmine marbles library. If you look in the ngrx repository at [the sample app](https://github.com/ngrx/platform/blob/master/example-app/app/books/effects/book.ts) you can see that an optional injected scheduler is used inside the effects class. If it’s provided it’s used, if not, the default one from rxjs is used.

While this approach works just fine, it makes you add some code in all the effect classes that is not used for anything else beside testing. Another thing is that you’ll have to instantiate the effect using the TestBed provided by Angular to make sure that everything is in place.

A different approach, using the same scheduler that you can fetch using *getTestScheduler *method, is to override all the required Observable operators to use it:

![](https://cdn-images-1.medium.com/max/2000/1*xfCSAYrsuqnHP12P2mic5g.png)

A similar approach to what we used in the first try, here we just save the original operator and call it with our scheduler.

This will make sure our test passes again, as long as we spy on the operator before we instantiate the effect class:

<iframe src="https://medium.com/media/12ab1c1467c20b510c3b7d1d8dc851ed" frameborder=0></iframe>

So far these have been the most common scenarios that I’ve encountered while writing tests for ngrx effects.

You can find the complete [working code on GitHub](https://github.com/adrianfaciu/testingNgRx). Have fun writing tests ;)
