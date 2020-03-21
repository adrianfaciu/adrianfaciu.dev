---
title: "Barrel files: to use or not to use ?"
date: "2018-03-04T23:46:37.121Z"
template: "post"
draft: false
slug: "/posts/barrel-files/"
category: "TypeScript"
tags:
  - "TypeScript"
  - "Angular"
  - "Structure"
description: "How to use barrel files inside Angular projects. Should you use them ? If yes, how to organize code around them and where to place these files. Read on to find out more."
---

First of all, what are these **barrel files** ? Using ES2015 modules, we have files from which we export one or more things. Barrel files are a way to **re-export** all or some of these from one, single, convenient place.

You can understand better what they are and how they are used by looking at [this short example](https://basarat.gitbooks.io/typescript/content/docs/tips/barrel.html) from the aswesome _TypeScript deep dive_ book.

Barrel files are named _index,_ as convention*, *because most module loaders will look for this by default when [resolving absolute paths](https://webpack.github.io/docs/resolving.html) and this will allow us to omit the filename from the path and just point to a folder. Assuming we have a barrel file in a services folder we’ll import things like:

    import { LoggerService, UserService } from 'app/core/services'

We can use this anywhere in our app if we’re using an absolute path when importing, if you want to know more about this you can check my [short post](https://medium.com/@adrianfaciu/use-absolute-paths-for-module-imports-6e5ee9e94161) 😉

There are people arguing that one does not need to use barrel files, at least inside Angular applications since we have [NgModule](https://angular.io/api/core/NgModule). Even the [official documentation](https://angular.io/guide/glossary#barrel) hints towards this.

While we can organize a lot of things with the help of Angular modules, I still prefer to also **use a few barrel files** throughout the application. They greatly simplify the imports and make them look clearer. We just don’t want to have too many barrel files since that is counter productive and usually leads to *circular dependency *issues which sometimes can be quite tricky to resolve.

So a bad practice would be to create a barrel file inside each folder we have, this is something I would really **not** **recommend**. Tried it once to see how it goes, and let’s just say it did not end well 😃

What I found to work is to have **one level of barrel files** throughout the application structure. In some rare cases maybe a few more in some subfolders but that is a matter of preference.

A good way to structure the application is to place files into folders based on features, and inside these folders create subfolders based on the type.

![](https://cdn-images-1.medium.com/max/2000/1*TFfjq0du6EWQeQb6BnVKxg.png)

In the example above we have a core module, usually found inside [Angular applications](https://angular.io/guide/ngmodule#the-core-module). Inside we have folders for each Angular specific types along with an Angular module.

Similar structure for a feature module:

![](https://cdn-images-1.medium.com/max/2000/1*QpFuMzMmtNq5NiA6TqCIRQ.png)

Pretty much the same, with some more folders based on types.

If we have this kind of structure we would want our barrel files inside these type folders. So each of them will have an index file where we re-export what is inside those folders. Then when we import we’ll have:

    import { DocumentModel, CommentModel } from 'app/+documents/models'

This is short, we can import all the similar things from one place and we see pretty clear what they are. So if we need models from a specific feature we go feature folder name and models folder. If we need services to the same feature folder name and services and so on.

> Everything should be clear and easy to find. If it’s **not**,\*\* \*\*the structure and/or barrel files are wrong and should be changed.

If you look at an import and you don’t immediately understand what you are importing and from where it’s usually a smell that the structure is not that ok. Similar, if you want to import something and don’t know where to get it from.

You should experiment with the structure and using barrel files until you find something that works, usually this is constantly needed as the application grows and evolves. **Never be afraid to change things** in order to make them better 😃
