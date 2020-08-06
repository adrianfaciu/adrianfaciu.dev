---
title: 'Custom Angular directives'
date: '2019-07-19T23:46:37.121Z'
template: 'post'
draft: false
slug: '/posts/aggrid-angular-directives/'
category: 'Angular'
tags:
  - 'Angular'
  - 'Directives'
  - 'AgGrid'
description: 'In this post, we are going to talk about one of the most important building blocks of an Angular application. As we know, an application is like a tree of components. And these components are actually directives with a template. We’ll focus on Angular directives, both attribute and structural.'
canonical: 'https://blog.ag-grid.com/custom-angular-directives/'
---

This is a post written for [AgGrid](https://www.ag-grid.com/), you can see the [original here.](https://blog.ag-grid.com/custom-angular-directives/)

# Intro

In this post, we are going to talk about one of the most important building blocks of an [Angular](https://angular.io/) application. As we know, an application is like a tree of components. And these components are actually directives with a template.

We’ll focus on Angular directives, both attribute and structural. And we’ll talk a bit about components. What they are and how can we create custom ones. Some basic knowledge of [Angular](https://angular.io/) and [TypeScript](https://www.typescriptlang.org/) is required to follow along.

# Overview

Directives allow us to extend or manipulate the DOM. Angular components, which as we said, are directives with a template, allow us to extend the DOM by creating custom components along with the native ones like _button_ or _div_. We know they are similar to directives because internally they use the directive API.

Directives can be split into two categories: **attribute** and **structural**. As the name suggests, attribute directives will be able to change the characteristics of a single element. While the structural ones are able to add or remove blocks of elements.

Some examples of structural directives are [NgIf](https://angular.io/api/common/NgIf), used to add/remove an element from the DOM based on a condition:

    <p *ngIf="condition">This shows up only if the condition is true</p>

And [NgForOf](https://angular.io/api/common/NgForOf), used to iterate over a collection and render a template for each item:

    <li *ngFor="let item of items">
      <p> {{ item.text }} </p>
    </li>

As for attribute directives, [NgClass](https://angular.io/api/common/NgClass) is the first that comes to mind. It is used to dynamically add/remove CSS classes associated with an element:

    <div [ngClass]="['first', 'second']">...</div>

To declare a directive, we must use the [@Directive](https://angular.io/api/core/Directive) decorator. This will mark that specific class as an Angular directive.

# Selectors

The minimum thing we need to pass to the Directive decorator is the [selector](https://angular.io/api/core/Directive#selector) property:

    @Directive({ selector: '[foo]' })
    export class FooDirective {}

This is a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) that will identify the directive inside a template. It will allow Angular to create an instance of the directive whenever needed. These CSS selectors are _quite powerful_.

A most common scenario is to target attributes of an element `[foo]`. The brackets ([]) mark it as an attribute selector. Meaning it will look at all the elements in the template that have an attribute called foo. We could also limit this to specific elements by extending the selector: `div[foo]`. This will locate all the _div_ elements that have an attribute named foo.

Playing around with this we could select all elements of a specific type, an element with a specific class or even using pseudo-classes like [:not](https://developer.mozilla.org/en-US/docs/Web/CSS/:not). However, you should keep in mind that it does not support nesting selectors.

For most cases, a selector for a specific attribute is what we need, but we can also get pretty wild with them.

# Export

Another important property for a directive is [exportAs](https://angular.io/api/core/Directive#exportAs). This defines a name that can be used to fetch an instance of our directive in our template.
For example in our custom directive:

    @Directive({
      selector: '[foo]',
      exportAs: 'appFoo',
    })
    export class FooDirective {}

We’ve added a value for **exportAs** and now we could use it in a template:

    <div [foo] #dirInstance="appFoo"></div>

This comes in handy when we want to show certain values of the directive, call methods on it, or pass it as a reference to some other method. For a more practical example, suppose we have an input and we want to send the text to a function call from the template:

    <input type="text" #myInput>
    <button (click)=performAction(myInput.value)>Click me</button>

There are a few other properties that we can set for a directive, the above two being just some examples. You can see all of them in the very good [Angular documentation](https://angular.io/api/core/Directive).

# Custom attribute directive

Now to some more real-world examples. We’ll start with a simple attribute directive that will set the focus to an element whenever it’s displayed on the screen.

We start with the basics and create the directive class:

    @Directive({ selector: [appFocus] })
    export class AppFocus { }

Adding the attribute that matches the selector to an element will tell Angular to create an instance of the directive and attach it:

    <input type="text" appFocus>

To get an instance of the element that the directive is attached to, we can use Angular dependency injection mechanism. Adding a reference to [ElementRef](https://angular.io/api/core/ElementRef), in the constructor will get us access to what we need:

    constructor(private elementRef: ElementRef) {}

Now we have access to the element and bring focus to it when needed. We can implement the [OnInit](https://angular.io/api/core/OnInit) lifecycle hook and focus the element there:

    @Directive({ selector: [appFocus] })
    export class AppFocus implements OnInit {
      constructor(private elementRef: ElementRef) {}

      ngOnInit() {
          this.elementRef.nativeElement.focus();
      }
    }

This will work, but there are a few things we can improve.

We might want to disable this functionality dynamically sometimes. So we can add an input to our directive to control this:

    @Input() appFocus: boolean = false;

Notice how we used the same name for the input as the selector. This a common practice and will simplify usage:

    <input type="text" [appFocus]="shouldFocus">

Now we have to check when the appFocus input will get a new value, and if it’s true, focus the element. We can achieve this using the [OnChanges](https://angular.io/api/core/OnChanges) lifecycle hook:

    ngOnChanges(changes: SimpleChanges) {
      if (changes.appFocus) {
        this.elementRef.nativeElement.focus();
      }
    }

A better real world example would be to place the directive on an element without any property binding:

    <input type="text" appFocus>

This adds a subtle problem. The value for our input becomes an empty string and this will evaluate to false. So our directive will no longer work. We have to update the if condition to properly transform a string value to boolean. This is called coercion, and if we’re using [Component Dev Kit](https://material.angular.io/cdk/categories) from Angular Material, we have this utility (coerceBooleanProperty) [built in](https://github.com/angular/material2/blob/a800c2a68014c77d0f29b5229a1938bed050813a/src/cdk/coercion/boolean-property.ts).

Lastly, we can see that we’re using the **nativeElement** property to focus. This might be tricky and is not something usually recommended. This will fail in an environment where the DOM is not available and some other custom rendering is used. One way to fix this, is to disable our functionality for such environments.

One way to achieve this is by using the [isPlatformBrowser](http://isPlatformBrowser) function from angular common:

    import { isPlatformBrowser } from '@angular/common';

This function takes as argument a [platform ID](https://angular.io/api/core/PLATFORM_ID) that we can also fetch from Angular core:

    import { PLATFORM_ID } from '@angular/core';

Now we can construct an _isBrowser_ property and use it in our directive:

    readonly isBrowser: boolean;
    constructor(
      private elementRef: ElementRef,
      @Inject(PLATFORM_ID) platformId: string,
    ) {
      this.isBrowser = isPlatformBrowser(platformId);
    }

Applying this inside our ngOnChanges method will fix the problem:

    if (changes.appFocus && this.isBrowser) {
      this.elementRef.nativeElement.focus();
    }

We can use this, and our code will only work inside a browser, since we’re using a browser API. Or, as an alternative, we could extend [Renderer2](https://angular.io/api/core/Renderer2) and implement the focus method. Using this, we’ll be sure it works on any platform.

This is a sample on how the directive will work:

![](https://www.dropbox.com/s/jsnpuhd5dbmp6ne/Focus-Directive.gif?raw=1)

You can see all the [code on StackBitz](https://stackblitz.com/edit/angular-focus-directive).

# Custom structural directive

Now, to a more complex example, we can have a look at how we could implement a clone of the [NgIf](https://angular.io/api/common/NgIf) directive. This will demonstrate how to create a directive that changes the DOM by adding or removing an element.

We start as before with a class and the directive selector:

    @Directive({ selector: '[appIf]' })
    export class IfDirective {}

After we also add it to the app module, we can use it in our template:

    <p appIf>
      Start editing to see some magic happen :)
    </p>

We’ll see later on why we need to make a small change to this.

Since we want to control when to show and hide the element in a dynamic way we’ll add an Input for this. We use the same name as the directive for ease of use:

    @Directive({ selector: '[appIf]' })
    export class IfDirective {
      @Input() appIf: boolean;
    }

And the template becomes:

    <p [appIf]="show">
      Start editing to see some magic happen :)
    </p>

In our directive, we can implement the [OnChanges](https://angular.io/api/core/OnChanges) lifecycle hook so we can react whenever the input is changed. Now we need to think about how we could add or remove the element.

For this purpose, Angular provides us with a [View Container](https://angular.io/api/core/ViewContainerRef). This is a special container where one or several views can be attached to a component. If you want to know more about this, go on and read this [great article about working with DOM in Angular](https://blog.angularindepth.com/working-with-dom-in-angular-unexpected-consequences-and-optimization-techniques-682ac09f6866). The views can be created by getting a new instance of a component with _createComponent()_ or by using a template reference with the _createEmbeddedView()_ method.

We’ll use the last one, to create an embedded view from our existing HTML. We first need to import the View Container:

    import { ViewContainerRef } from '@angular/core';

And then inject it in the constructor:

    constructor(private container: ViewContainerRef) {}

Now we have an instance of this class in our directive. It represents a container linked to the Html paragraph element from our template. And it allows us to add or remove siblings of this element.

To be able to add or remove our content whenever we need, we have to make some changes to our directive. Right now it’s attached to the paragraph element, and this one will be rendered right away.

To tell angular that our directive is a structural one, we can use the **\*** notation. Whenever you see this in front of a directive it means it will manipulate the DOM. So we update our template as so:

    <p *appIf="show">
      Start editing to see some magic happen :)
    </p>

This is syntactic sugar, it allows us to write less code. This will actually be transformed to:

    <ng-template [appIf]="show">
      <p>
        Start editing to see some magic happen :)
      </p>
    <ng-template>

We can see that everything is wrapped inside an ng-template, and that our directive, which looks like a normal one now, was moved to this new element. Ng-template is an Angular element for displaying content. Similar to the [HTML template element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template), the content is not rendered right away. Angular will replace it with a debug comment and each directive can do something different with the HTML elements wrapped by this.

In order to get a reference to this template, we can use the [TemplateRef](https://angular.io/api/core/TemplateRef) class. If we import it from `@angular/core` we can add it to the constructor and an instance will be provided to us:

    constructor(private container: ViewContainerRef,
                private template: TemplateRef<any>,
    ) {}

Now we have an instance of the view container, which is bound to a host element where we can add or remove elements. An important point to note here is that the view container reference points to a template element (rendered as HTML comment), not the paragraph. We also have a reference to the template that we want to show or hide. Inside our ngOnChanges method we can update the view as needed:

    ngOnChanges() {
      if (this.appIf) {
        this.container.createEmbeddedView(this.template);
      }
      else {
        this.container.clear();
      }
    }

All the code is available on [StackBlitz](https://stackblitz.com/edit/angular-ngif-clone). Don’t hesitate to check it out and play with it to better understand the example.

A nice caveat here is that if you forget to use the \* notation to mark the directive as structural, things will not work. You can quickly sort this our from the error message. If you get one saying that it cannot inject a TemplateRef, this is what it’s trying to say. There is no ng-template, so no template to get a reference to.

# Combining both types

Now, we’ve seen these two types of directives, we can also use a directive to programmatically add components to our application. For example, we can have an icon component and we want to create a directive that will show or hide it when the element is hovered.

Let’s create a simple component that shows an icon based on some input string. A simple implementation would be something like this:

    @Component({
      selector: 'app-icon',
      template: `
        <i class="fa" [ngClass]="iconName"></i>
      `
    })
    export class AppIconComponent {
      iconType: 'home' | 'bars' | 'trash' | 'close' | 'folder' = 'folder';
      get iconName() {
        return 'fa-' + this.iconType;
      }
    }

We have all the basic things here. A simple selector, a template and an icon property to hold the type of icon that we want. We make use of the [NgClass](https://angular.io/api/common/NgClass) directive to add the desired icon class to the element.

This is how it would look when used:

    <span [appIcon]="'home'">My Home</span>

For this, to work, we also need to import font awesome. In the [StackBlitz example](https://stackblitz.com/edit/angular-app-icon) I’ve added an import inside the main styles.css file:

    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css')

As before, we add our component to the declarations array of the application module. But we need to do one more thing here. We also need to add it to the [entryComponents array](https://angular.io/guide/entry-components). This is used for any component that Angular loads dynamically. Which means this component is not used statically in any other static angular component’s template, as in our case. If we omit this, Angular will remove the component from the application bundle, believing that it’s not used. This will, of course, crash our app when we want to programmatically instantiate and add the component.

We can create our directive, that will look and behave like an attribute directive:

    @Directive({ selector: '[appIcon]' })
    export class AppIconDirective {
      @Input() appIcon: 'home' | 'bars' | 'trash' | 'close' | 'folder';
    }

Selector and input with the same name are present.

The same as for our structural directive, we leverage the View Container to be able to add elements. This is still available even though it’s not a structural directive.

One last thing we need is to create an instance of our icon component. In Angular, this is done by a so-called component factory, and in order to get an instance of it for our component, we need to make use of a [component factory resolver](https://angular.io/api/core/ComponentFactoryResolver). Our constructor will look like this:

    constructor(private container: ViewContainerRef,
                private resolver: ComponentFactoryResolver) {}

To create an instance of the component we:

- get an instance of our component factory
- create the component and attach it to the view
- set the icon type property on the component

It looks like this:

    const factory = this.resolver.resolveComponentFactory(AppIconComponent);
    const componentRef = this.container.createComponent(factory);
    componentRef.instance.iconType = this.appIcon;

Now, since we want to show this when the host element is hovered we add a [HostListener](https://angular.io/api/core/HostListener) for the [mouseenter](https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseenter_event) event:

    @HostListener('mouseenter')
    showIcon() {
      const factory = this.resolver.resolveComponentFactory(AppIconComponent);
      const componentRef = this.container.createComponent(factory);
      componentRef.instance.iconType = this.appIcon;
    }

This will show the icon, we also need to handle [mouseleave](https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseleave_event) event to hide it:

    @HostListener('mouseleave')
    hideIcon() {
      this.container.clear();
    }

One important thing to remember here, is that the icon element, will be a sibling of the element where the directive is used, and not a child.

As with the other examples, all the code is [available on StackBlitz](https://stackblitz.com/edit/angular-app-icon).

# Conclusion

Directives are the building blocks of Angular. Hopefully, now you have a better understanding of what they are and how they work. Let me know what you think and what other interesting ways of using directives you’ve found.
