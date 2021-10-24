---
title: "Use absolute paths for module imports"
date: "2017-11-04T23:46:37.121Z"
template: "post"
draft: false
slug: "/posts/module-imports/"
category: "TypeScript"
tags:
  - "TypeScript"
  - "Best practices"
description: "Handling imports is a bit more trickier to manage due to paths and constant refactoring that one will do inside a more complex application."
---

Handling imports is a bit more trickier to manage due to paths and constant refactoring that one will do inside a more complex application.

When importing modules they are usually separated in two:

- importing libraries modules, which is quite nice, since we use only the name and they are resolved from *node_modules* folder

- importing modules from our own application

When doing the second the web is, unfortunately, full of examples that use relative paths to get the needed file:

    import { foo } from ‘../bar’;

Which is quite ok, but it goes quickly wrong when the file we need is several levels up or down. Then we get something like:

    import { foo } from ‘../../../../bar’;

Which is hard to write/read and will break as soon as we move the file somewere else.

Since **TypeScript 2.0**, we have an awesome compiler setting called [**baseUrl**](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#base-url), and we can configure it in the tsconfig.json file like:

    {
      "compilerOptions": {
        "baseUrl": "./src"
      }
    }

If you are using [_Angular CLI_](https://cli.angular.io) this will be already setup for you. In the tsconfig file for the app it’s set as above.

Once this is done we can use a path starting from that base url, so most of our imports will be transformed to something like:

    import { foo } from ‘app/bar’

I would use this for almost all of the imports throughout an application. Those that import from the same folder might be left as they are though.

All our imports will be shorter to write, easy to understand and most important: **will not break as we refactor and move files around**.

With a few barrel files strategically placed we will have a very nice structure with imports that look like:

    import { UserService } from ‘app/core/services’;
    import { SearchComponent } from ‘app/shared/components’;

If you want to go a bit further there is also a setting for creating path mappings, but as of now, most editors and IDEs have some issues with correctly resolving this and in my opinion it is a bit harder to understand what is happening.

It should be clear enough why this way of importing modules is a bit better and more error proof. We should all use this more when working on large application codebases.
