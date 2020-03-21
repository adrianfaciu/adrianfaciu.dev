---
title: "Creating structural directives in Angular"
date: "2017-10-01T23:46:37.121Z"
template: "post"
draft: false
slug: "/posts/angular-structural-directives/"
category: "Angular"
tags:
  - "Angular"
  - "Directives"
description: "Angular has two types of directives: **structural** and **attribute**. As the name suggest, the attribute directives are altering the properties of an element to which they are attached and the structural ones are changing the layout, basically adding or removing elements in the *DOM*."
---

Angular has two types of directives: **structural** and **attribute**. As the name suggest, the attribute directives are altering the properties of an element to which they are attached and the structural ones are changing the layout, basically adding or removing elements in the _DOM_.

Usually there are a lot of attribute directives created inside applications but not that many structural ones. For most use cases, the build in ones like [ngForOf](https://angular.io/api/common/NgForOf) and [ngSwitch ](https://angular.io/api/common/NgSwitch)do the job.

We’re going to create a simpler version of **ngForOf **directive, in order to see how one would implement something like this, we can call it **ngLoop**.

### Creating a basic directive

We can create the boilerplate code using Angular CLI: _ng generate directive ngLoop_, or we can write the it by hand:

<iframe src="https://medium.com/media/ea247423ba4027648355bcbb903fff35" frameborder=0></iframe>

We have a class with a constructor, the _@Directive_ decorator and the selector that we want to use throughout our application.

Right now we can add the directive to an element in our app component, but nothing will happen since we’re not doing anything interesting yet.

![](https://cdn-images-1.medium.com/max/2000/1*1TM6psDwpjx9vfB-5pXmCQ.png)

We need to get some helper classes from Angular on order to easily alter the DOM.

### Injecting ViewContainerRef and TemplateRef

In Angular a view container is a [special type of container](https://angular.io/api/core/ViewContainerRef) where one or more Views can be attached. It’s mainly used when we create programmatically these views by [instantiating a component](https://angular.io/api/core/ViewContainerRef#createComponent) or [creating an embedded view](https://angular.io/api/core/ViewContainerRef#createEmbeddedView), like we’re going to do.

The second thing we’re going to need is [a reference to a template](https://angular.io/api/core/TemplateRef). We want our directive to repeat the element that we’re attaching it to so we want to get a reference to this element in order to create multiple embedded views with it.

If it’s a structural directive, an instance of the TemplateRef will be provided to us by dependency injection, or if the element to which we attached the directive is an _<ng-template>._

![](https://cdn-images-1.medium.com/max/2000/1*c4LTLc3QLGZ2nHMUZhSvHQ.png)

If we start our application and use the directive we’ll notice an error that there is no provider for TemplateRef. While we know that we want to create a structural directive, Angular has no idea about this so we need to explicitly state this by adding \* as a prefix to the directive, just like it’s done for the built in ones. We’ll see a bit later on what this actually does.

After this change our application starts again without any errors. An important thing to notice here is that we need to add the \* only when we use the directive and not inside the directive selector.

If we have a look at our application the div where we used the directive is not displayed at all. This is normal and the expected behaviour, we just told Angular that the div is a template and that we’ll take care of creating whatever elements we want.

### **Adding content**

We can implement the **OnInit lifecycle** hook, for now, in order to create the view for our directive. Inside the handler we use the view container and create an embedded view with our referenced template:

<iframe src="https://medium.com/media/d8b226ee1a0aef9ea486b7592e78b969" frameborder=0></iframe>

If we look at our application now, we can see that the div element with foo as content is showing up. We’ve just created a directive that renders the element that we gave it as a template. Yaay! So far, added value is zero :)

Next step wold be to add some input that we want to iterate over:

![](https://cdn-images-1.medium.com/max/2000/1*KLZYdIQIDV9KA7FSM80Q7Q.png)

We use the same name as our directive so the usage is as simple as possible, and specify that the type is [Array](https://developer.mozilla.org/en-US/docs/Glossary/array).

![](https://cdn-images-1.medium.com/max/2000/1*vGMxQFc2YpQimlMZtvQzTQ.png)

*Numbers *is an array of numbers that we defined inside the app component.

In our directive we now can implement the [OnChanges ](https://angular.io/api/core/OnChanges)lifecycle hook and render the view each time our input changes. We loop through the items in the array and create an embedded view for each of them:

<iframe src="https://medium.com/media/1a06159b7096f3dbad90573817744b94" frameborder=0></iframe>

Since we might change the input during our directive life, we might also want to clear the container if we don’t want to append more views to it. This can be done using the [\*clear](https://angular.io/api/core/ViewContainerRef#clear)\* method. If we don’t do this, each time the input changes we’ll add more embedded views to the container, which could also be useful in some scenarios.

Our app now renders a div with the *Foo *text inside for each item in the numbers array.

### Using input values inside the template

We now show the template as many times as we want, but we also want to use the items in the array inside our template.

In order to do this we create a [template input variable](https://angular.io/guide/template-syntax#template-input-variable) using the _let syntax_ inside our element. This will iterate over the numbers array and set the variable to the current number in each iteration:

![](https://cdn-images-1.medium.com/max/2000/1*rLMjr8xhxsEzJlbZdvZDAA.png)

If we try to start the application now, we get a weird error that it cannot bind to *appNgLoopOf. *It looks like Angular is adding _Of_ to the end of our directive name. We can fix this by changing the Input property name to **appNgLoopOf**.

This happens because Angular has some built in syntactic sugar to help us. When we attach a structural directive using the star notation, behind the scenes Angular will create a template component for us, pull out the variable declaration as a template context variable and set the directive input to the collection itself, so it would look somehow similar to this:

<iframe src="https://medium.com/media/b0f0249e57f49569cd8162ef8c585d1e" frameborder=0></iframe>

Our application still works but we don’t see any number before the text.

This happens because when we are creating the embedded view we also need to pass the **context** that is available to that view. The createEmbeddedView method accepts a second argument that is an object specifying this context.

![](https://cdn-images-1.medium.com/max/2000/1*-fpbVwKeTdcIr3XsA5qL1g.png)

The **\$implicit **property name is an Angular convention stating that this is the *implicit *object available in the context. In our example it’s the *nr *variable that we defined and then used in the template.

Now our application looks and works as it should.

### Exported values

The built in [ngForOf directive](https://angular.io/api/common/NgForOf) exports a range of useful values that can be aliased as local variables like index, first, last and so on.

We can achieve the same kind of functionality by adding these as properties to the context object that we pass to createEmbeddedView method:

<iframe src="https://medium.com/media/14a8ff86f139b751dc3f1b3aed7bc932" frameborder=0></iframe>

And then use the new index variable in our template:

<iframe src="https://medium.com/media/8df6890e9eac9993283da4e722914dc9" frameborder=0></iframe>

### Source code

Now you should have a better understanding on how to create and use structural directives in Angular.

A live running sample can be found on [StackBiltz](https://stackblitz.com/edit/af-angular-structuraldirective) and the whole code is inside [this GitHub repository](https://github.com/adrianfaciu/ngLoopDirective).
