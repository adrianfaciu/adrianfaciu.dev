---
title: "Using the Angular Router to navigate to external links"
date: "2018-02-14T23:46:37.121Z"
template: "post"
draft: false
slug: "/posts/angular-router-external-links/"
category: "Angular"
tags:
  - "Angular"
  - "Router"
description: "How to use the Angular router to navigate to external pages. This is helpful to trigger guards and warn the user or save data."
---

Navigating to an external url from an Angular application is something quite easy. Using window.location or an anchor tag is straight forward, but it has a big disadvantage, it bypasses the Angular Router.

This means that if we have something like **route guards**, they will not be called. For example we might have a guard that notifies the user of any unsaved changes and can stop the navigation if the user wishes. If you want to know more about route guards, Thoughtram blog has a [nice article about this](https://blog.thoughtram.io/angular/2016/07/18/guards-in-angular-2.html).

So we need a nice and generic way of navigating to an external url but using the Router so that our guards will get called.

We’re going to do this using a route resolver and a custom route. Resolve is used to fetch any required data before activating the route but we’ll hijack it a bit to navigate where we want.

First, we need to define a new custom route in our routes config:

```
{
    path: 'externalRedirect',
    resolve: {
        url: externalUrlProvider,
    },
    // We need a component here because we cannot define the route otherwise
    component: NotFoundComponent,
},
```

We have a new route with the *externalRedirect* path, you can use here whatever string you want, as long as it’s not used by another route within the application.

As an alternative to resolve we can also use the route guards for the same purpose. For example we hookup to the can activate route guard:

    canActivate: [externalUrlProvider]

We have a fictional *url* property that we’re supposed to provide before activating this route with a value set to *externalUrlProvider, *we’ll have a look at this in a second. And last a component, in this case one for a not found page, but it can really be anything, it’s there only because we cannot declare a route without it.

The value of url, external url provider, is an injection token, we’ll use it in the Providers array to define our functionality:

    const externalUrlProvider = new InjectionToken('externalUrlRedirectResolver');

And this is how our routing module might look:

```
@NgModule({
    providers: [
        {
            provide: externalUrlProvider,
            useValue: (route: ActivatedRouteSnapshot) => {
                const externalUrl = route.paramMap.get('externalUrl');
                window.open(externalUrl, '_self');
            },
        },
    ],
    imports: [
        RouterModule.forRoot(routes),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
```

We create a function that gets as parameter the activated route, read a route parameter called externalUrl and then use [window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) to navigate to the provided link.

Now we also have to use our new route when we want to navigate to an external url. While we can do this using directly the router:

    this.router.navigate(['/externalRedirect', { externalUrl: url }]);

We might also want a more generic way. Maybe attach to all the anchor elements that have a href pointing to an external resource.

We can create a directive with a selector ‘*a[appExternalUrl]’* which means that it will work on all the anchor elements where we add the directive name as attribute.

Then we’ll read the value of href and use the router to navigate to it. The complete version looks something like this:

```
import { Directive, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { isNil } from 'ramda';

@Directive({
    selector: 'a[appExternalUrl]',
})
export class ExternalUrlDirective {
    constructor(private el: ElementRef, private router: Router) {}

    @HostListener('click', ['$event'])
    clicked(event: Event) {
        const url = this.el.nativeElement.href;
        if (isNil(url)) {
            return;
        }

        this.router.navigate(['/externalRedirect', { externalUrl: url }], {
            skipLocationChange: true,
        });

        event.preventDefault();
    }
}
```

We have a constructor where we get an instance of the element and one for the router.

Then we listen for the click event and read the href property of the element passing it along to the navigate method of the router to actually perform the navigation. We also specify ‘***skipLocationChange***’ as *true *when navigating since we don’t want the user to actually see our intermediary route, we use it just to trigger any router specific logic we might have in our app like the deactivation guards.

Lastly, since we handled the click ourselves we call the *preventDefault* method on the event.

We can use our new directive wherever it’s needed:

    <a [href]="[https://www.google.com/](https://www.google.com/)"
        appExternalUrl
    >Click Me</a>

While this might feel a bit like a hack, it does provide a good and generic way of navigating to external resources while also involving the Angular Router.

You can find a sample implementation [on StackBlitz](https://stackblitz.com/edit/angular-external-links).
