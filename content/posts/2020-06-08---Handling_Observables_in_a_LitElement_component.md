---
title: 'Handling Observables in a LitElement component'
date: '2020-08-06T20:46:37.121Z'
template: 'post'
draft: false
slug: '/posts/observables-litelement/'
category: 'Web Components'
tags:
  - 'LitElement'
  - 'RxJs'
  - 'TypeScript'
  - 'WebComponents'
description: "In this post, we are going to explore how to handle Observables inside a LitElement component. What options we have for this and how I've created a generic solution. It will handle subscribing to a stream, with some extra features and built in functionality."
---

## Intro

Since the first time I’ve used **[RxJs](https://rxjs.dev/)** for some Angular projects, I’ve fallen in love with this library. There are a lot of use cases where it’s applicable. And for me, it makes the whole experience of writing and reading code way better.

[LitElement](https://lit-element.polymer-project.org/) is a small and lightweight base class for creating web components. It’s easy to use and understand. You can start writing web components without a lot of setup and it’s a joy to use.

We’re going to have a look at how to use RxJs inside a LitElement web component. Some different approaches we can take to handle and render Observables. Basic knowledge of RxJs, LitElement, and TypeScript is required. If you’re comfortable with any of the big three (React/Angular/Vue) you should be able to follow along.

## Problem

Let’s define a basic LitElement component that we are going to use for our examples:

    import { LitElement, html, customElement } from 'lit-element';

    @customElement('my-element')
    class MyElement extends LitElement {
      render() {
        return html`
          <p>This is a sample LitElement</p>
        `;
      }
    }

A simple class that extends from LitElement and renders a text. We use the customElement decorator to register the class as a web component.

Our purpose is to have an Observable and render it inside our component. For a sample stream, we are going to use an interval and take the first ten items from it:

    import { interval } from 'rxjs';
    import { take } from 'rxjs/operators';

    values$ = interval(1000).pipe(take(10));

We generate a new value each second, starting from 0 and we take the first 10. We would like to render this inside our component:

    import { LitElement, html, customElement } from 'lit-element';

    import { interval } from 'rxjs';
    import { take } from 'rxjs/operators';

    @customElement('my-element')
    class MyElement extends LitElement {
      values$ = interval(1000).pipe(take(10));

      render() {
        return html`
          <ul>
            <li>Render all items here</li>
          </ul>
        `;
      }
    }

Working with Observables inside a LitElement is easy enough, but it involves a bit of code. We need at least to subscribe and schedule an update for anything to show up:

    @customElement('my-element')
    class MyElement extends LitElement {
      values$ = interval(1000).pipe(take(10));
      data = [];

      connectedCallback() {
        super.connectedCallback();
        this.values$.subscribe(value => {
            this.data = [value, ...this.data];
            this.requestUpdate();
          });
      }

      render() {
        return html`
          <ul>
            ${this.data.map(item => html`<li>${item}</li>`)}
          </ul>
        `;
      }
    }

The connected callback life cycle hook is called when the component is added to the document’s DOM. Here, we want to subscribe to our stream and update the property in our class. Since LitElement is not tracking our _data_ property, we need to manually request an update each time the value changes.

In this case, it’s good enough, because our observable will finish after ten items and clean everything up. But what happens if we remove the **take** method call? We would like to unsubscribe and clean up when our component is removed from the DOM. So we have to add a bit more code to handle that:

    @customElement('my-element')
    class MyElement extends LitElement {
      unsubscribe$ = new Subject();
      values$ = interval(1000);
      data = [];

      connectedCallback() {
        super.connectedCallback();
        this.values$.pipe(takeUntil(this.unsubscribe$))
         .subscribe(value => {
            this.data = [value, ...this.data];
            this.requestUpdate();
          });
      }

      disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
      }

      render() {
        return html`
          <ul>
            ${this.data.map(item => html`<li>${item}</li>`)}
          </ul>
        `;
      }
    }

To achieve this, we’ve created a [Subject](https://rxjs.dev/api/index/class/Subject), this is a special type of Observable that also allows us to emit values. We used this inside the disconnected callback to send a new value whenever the life cycle hook is called. Before we subscribe we use the [takeUntil](https://rxjs.dev/api/operators/takeUntil) operator to emit the values from the source observable, but only until something is emitted on the unsubscribe stream.

This is all good and it works, but if we have multiple streams to handle in our component, the amount of code grows a bit with each new one.

## Options

There are a few directions that you can go about if you want to extract this functionality and make it more generic:

- a simple function
- a directive
- a base class
- a decorator

This is also the order in which I’ve explored them. First, we are going to rule out the first two.

Using a simple function, you cannot monkey patch life cycle hooks of custom elements. This means we cannot extend the functionality of disconnected callback to know when the element was removed and unsubscribe. We cannot clean up after ourselves, so this is not OK.

While there are a few examples out there with async directives that handle Observables, they have one issue. The directive itself is not aware of the life cycle of the component, so there is no easy way to unsubscribe when needed. The same problem as with a simple function.

## Base class

The next option, a base class, is a good, working, option. One advantage is that a lot of projects using LitElement already have a base class, so it’s a matter of extending that one, and having the provided functionality in all the components throughout the app.

We want to provide a **subscribe** method, that could be used inside a component to subscribe to an Observable and request an update whenever new data comes in. Something like:

    connectedCallback() {
        super.connectedCallback();
        this.subscribe('data', this.values$);
      }

We start with something simple, the base class and a simple implementation for the subscribe method:

    export abstract class RxLitElement extends LitElement {
      subscribe(propertyName, stream) {
        stream.subscribe(value => {
          this[propertyName] = value;
          this.requestUpdate();
        });
      }
    }

We get the stream and the property name where we want to place the values. We subscribe to the stream, update the class property with new values, and request an update so that our UI will reflect the new data.

Then we can update our component and use our new base class:

    @customElement('my-element')
    class MyElement extends RxLitElement {
      values$ = interval(1000);
      data = [];

      connectedCallback() {
        super.connectedCallback();
        this.subscribe('data', this.values$);
      }

      render() {
        return html`
          <ul>
            ${this.data.map(item => html`<li>${item}</li>`)}
          </ul>
        `;
      }
    }

If you run this, you will see that nothing happens. This is because we expect that _data_ is an array and in this case, it’s only a value. We can slightly update our stream to transform it into an array with all the values so far. We’ll use [scan](https://rxjs.dev/api/operators/scan) operator to transform it:

    values$ = interval(1000).pipe(scan((acc, value) => [value,...acc], []));

The scan operator is similar to reduce, but it emits each intermediate result. We start with an empty array, for each value we append it to the array and emit the result. Now everything works as before, and all the code that handles the subscribe is abstracted in our base class.

As a possible future improvement, we could pass in a function to our subscribe method. This will handle the update of the property and will allow custom functionality, like adding items to an array, properties to an object, and so on.

## Type safety

The first thing that we want to improve is the typing, we want to make sure we send in an Observable and a property name that exists in our class:

    subscribe<Key extends keyof this>(
      propKey: Key,
      stream$: Observable<this[Key]>
    ) { }

Using `keyof this` we create a subtype of string that can have as values only the property names defined in our class. If we have an interface with some properties:

    interface Person {
      name: string;
      age: number;
      location: string;
    }

    type K1 = keyof Person; // "name" | "age" | "location"

We defined our method with a generic Key type parameter that extends from this sub type `Key` `extends` `keyof` `this`. In this way, we make sure we can pass in only properties that exist in our class.

Next, we can define the stream as an Observable, but we need a type for that. We have to use lookup types, to make sure that the type of the values emitted by the Observable is the same as the type of the property that will receive them:

    interface Person {
      name: string;
      age: number;
      location: string;
    }

    type P1 = Person["name"]; // string

Using lookup types, we can take the defined type of our property, and make an Observable of that specific type.

Now our method is type-safe and it prevents us from making mistakes when using it.
You can read more about keyof and lookup types [here](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html).

## Unsubscribe

The first improvement is to unsubscribe from the Observable when our component is removed from the DOM. For that, we can use the **[takeUntil](https://rxjs.dev/api/operators/takeUntil)** operator.

To use this we create a [Subject](https://rxjs.dev/api/index/class/Subject), that will emit a value when the component disconnected callback is called. Then we’ll use it before we subscribe to our stream:

    const unsubscribe = Symbol('unsubscribe');

    export abstract class RxLitElement extends LitElement {
      [unsubscribe] = new Subject();

     subscribe<Key extends keyof this>(
        propKey: Key,
        stream$: Observable<this[Key]>
      ) {
      stream.pipe(takeUntil(this[unsubscribe])).subscribe(value => {
          this[propertyName] = value;
          this.requestUpdate();
        }
      }

      disconnectedCallback() {
        this[unsubscribe].next();
        this[unsubscribe].complete();
        super.disconnectedCallback();
      }
    }

We used a [symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) to define the unsubscribe subject to make sure it’s unique, so it does not clash with other user-defined properties, and that by default it’s not accessible from outside our base class.

This is the basic working implementation, but we can add some more features that will help us when using this approach.

## Extra features for our base class

For safe programming practices, we can check that the stream we get inside our subscribe method is indeed an Observable. We get all the type checking at runtime. RxJs has a method called [isObservable](https://rxjs.dev/api/index/function/isObservable) that we can take advantage of:

    if (!isObservable(stream$)) throw new Error('Invalid Observable!');

If we want to be extra safe, we can even check the property:

    if (!this.hasOwnProperty(propKey)) throw new Error('Invalid property name');

Now to some more useful features, we might want to call the subscribe method several times in our component life cycle, for the same property, with different streams. We want to handle this, meaning unsubscribe from the old observable before subscribing to the new one. And ignoring subscribe calls for the same property and the same Observable.

For this, we need to remember the subscriptions and the stream that was used to create them. What we want to get a hold of:

    interface ExistingSubscription {
      stream$?: Observable<unknown>;
      subscription?: Subscription;
    }

We can create a map with all this information:

    const subscriptions = Symbol('subscriptions');

    [subscriptions] = new Map<keyof this, ExistingSubscription>();

And work with it inside our subscribe method:

    subscribe<Key extends keyof this>(
        propKey: Key,
        stream$: Observable<this[Key]>
      ) {
        const existingSubscription = this[subscriptions].get(propKey);
        if (existingSubscription) {
          if (existingSubscription?.stream$ === stream$) return;
          else existingSubscription?.subscription?.unsubscribe();
        }
        const subscription = stream$.pipe(...);

        this[subscriptions].set(propKey, { stream$, subscription });
      }

We check to see if we already have a subscription for that property name. If yes, in case it’s the same stream, we ignore the call, no need to do anything. If it’s a different stream, we unsubscribe from the old one before handling it. In the end, we store the new subscription and stream combination using the property name as a key.

This is a more complete implementation of our base class, which besides extracting all this functionality in a central place, provides us with a few advantages:

- type safety (we can use only existing property names and Observable objects)
- unsubscribes when the component is removed
- unsubscribes from old observable if called again on the same property with a different Observable
- ignores calls on the same property with the same Observable

## Decorator

Now, how about that subscribe call, could we improve it a bit more? Like avoid calling it inside our connected callback manually for each property? It turns out we can! In some specific cases, like when the Observable we want to subscribe to is not a member of our class, we could improve things a bit further.

That is, by creating a decorator that will do this for us. Decorators are an experimental feature, but they are useful in certain situations.

A decorator is a special kind of function that can be attached to classes, methods, properties, or arguments. They are used in the form of `@expression` where expression is the name of the function. In our case we use subscribe:

    export const subscribe = (stream: Observable<any>) => <K extends RxLitElement>(
      targetPrototype: K,
      propertyKey: keyof K
    ) => {
      if (!stream) throw new Error('Invalid stream!');

      const initial = targetPrototype.connectedCallback;
      targetPrototype.connectedCallback = function () {
        initial?.call(this);
        this.subscribe(propertyKey, stream);
      };
    };

Since we want to customize how the decorator is applied to our property we created a decorator factory. That is a function that returns another function. A decorator for a property is always a function that gets the prototype and the property key, but we also want to pass in a stream for each use.

Inside the function, we monkey patch the connected callback method of our class and call the subscribe method inside it. Pretty much what we manually did before.

And we can use it for our components to simplify code even further:

    class DemoElement extends RxLitElement {
      @subscribe(interval(1000).pipe(scan((acc, value) => [value,...acc], [])))
      streamValues: number[];
    }

The limitation on what streams we can use here comes from the way decorators work. We don’t have access to the class instance at the moment when the decorator is parsed, so there is no way to access the instance variables there. Hence the limitation.

You can find more information about how to [create decorators here](https://www.typescriptlang.org/docs/handbook/decorators.html).

## The end

To help with this, I’ve extracted the functionality into [a small lib](https://www.npmjs.com/package/rx-lit). Or even better, you can fetch the code from [GitHub](https://github.com/adrianfaciu/rx-lit) and use it in your project, if you find it useful.

If you know other solutions to this problem or have a different idea, feel free to let me know. Or why not, open a pull request 🙂.
