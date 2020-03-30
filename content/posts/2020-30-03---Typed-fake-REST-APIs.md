---
title: 'Typed fake REST APIs'
date: '2020-03-30T13:00:37.121Z'
template: 'post'
draft: false
slug: '/posts/Typed-fake-REST-APIs/'
category: 'Programming'
tags:
  - 'Testing'
  - 'TypeScript'
  - 'API'
  - 'REST'
description: 'See how to create a fake REST API using JSON Server. TypeScript will protect us against any model changes and faker.js will help with generating random data. Use it for local development, testing or any other related activities.'
---

Whenever you start working on a new project, you might need to consume an API. But that API might not be written yet, or you don’t want to hit the real thing while developing the app.

In this post we’re gonna have a look at using [JSON Server](https://github.com/typicode/json-server) and [faker.js](https://github.com/Marak/Faker.js#readme) to create a fake REST API. You can use it for local development, testing or any other related tasks.

Basic knowledge of [TypeScript](https://www.typescriptlang.org/) and [npm](https://www.npmjs.com/) is required to follow along.
Out of habit and personal preference, I’ll use [yarn](https://yarnpkg.com/) instead of npm for all the examples.

# Setup

We’re gonna assume you already have a TypeScript project where you want to add and use the fake API. If you do, skip to the next section. If not, and you want to follow along with the code, let’s create a simple project:

    mkdir fake-rest-api && cd fake-rest-api
    yarn init

Hit enter at any of the inputs to use the defaults, as long as you don’t want to fill in something more useful 🙂.

Install the latest version of TypeScript and generate a new config file:

    yarn add typescript -D
    yarn tsc --init

The only thing we want to change in the config file is the _outDir_ property, we can set it to _dist._ By default, TypeScript will place the output in the same place as the input files. We want things to be a bit cleaner, hence using an output folder.

# JSON Server

Let’s get started and create our fake API. First, install JSON Server:

    yarn add json-server -D

Usually, the server will use JSON files with our data. In our case, we’re gonna use TypeScript, because we want to add a bit of type safety to our fake API. Whenever our types change we want to know and make the appropriate changes in the fake data.

Create a new file _server.ts_, inside a _src_ folder, and add this code to get it up and running:

    export = () => ({
      test: { value: "Hello from our fake API" }
    });

The convention is to export a function that returns an object which is the structure of the fake API. The properties of the object are the routes and the values are the data.

Now we want to run the server with this file, but before we can do that we also have to compile it to plain JavaScript. Let’s create a script to do that. Add the following to _package.json_:

    scripts: {
      "fake-api": "tsc && json-server dist/server.js"
    }

It would be great if we could run both these commands with the _watch_ flag, which they do support. This would restart the server each time we make a change. Unfortunately, last time I’ve checked, the watch mode for JSON Server was working only with JSON files. So don’t forget to manually restart the server after you make some changes to the data.

If you add this to an existing project, you can have a TypeScript configuration file only for this fake API, and you could compile it with a command like:

    tsc --project ./mock-server/tsconfig.mock-server.json

This will allow you to set some project-specific settings, like a different output folder.

# Built-in features

JSON Server has some great built-in features that you should be aware of. Among them, two are quite important in our case.

If you make any POST, PUT, PATCH or DELETE requests your data will be affected. You need to be aware of this when testing.

There are some built-in routes. For example, if you have a collection of items and each item has an id, you get individual access to each item without any other configuration. If the base path is `*/items*`, you can go to `*/items/123*`, and get the item that has an id equal to 123. This will greatly simplify your routing config. You also have built-in filter, pagination, and sort.

# Custom routes

Sometimes we might want to use some custom routes. Maybe we want to simplify what a route looks like or redirect to the same data without changing the file we use to generate out API from.

To do that we can add a file named _routes.json_ to our project:

    {
      "/foo/bar/baz": "/test"
    }

In this example we have a resource located at `*/foo/bar/baz*`, which should return the same data as `*/test*`. But we don’t want to create a deeply nested structure within our config object, so we use the routes file to redirect to test.

Also need to update the command used to start the server for this to work:

    "fake-api": "tsc && json-server dist/server.js --routes src/routes.json"

Go to `*foo/bar/baz*` and notice we get the same result as for `*/test*`, but the URL will remain the same.

JSON Server is packed with features and offers way more. We’ve just scratched the surface a bit here. See the [official documentation](https://github.com/typicode/json-server) for more information about what you can do with it.

# Typed data

All good and nice, but so far we did not take advantage of TypeScript almost at all. Let’s assume we have an _Item_ interface that looks like this:

    export interface Item {
      id: number;
      name: string;
    }

Go ahead and add this as _item.ts_ to the project, if you did not do it already. This is an example of a type of data that we can get from a real API. Inside a data folder we can create an items file with some test data:

    import { Item } from "../types/item";

    export const items: { count: number; values: Item[] } = {
      count: 3,
      values: [
        {
          id: 1,
          name: "foo"
        },
        {
          id: 2,
          name: "bar"
        },
        {
          id: 3,
          name: "baz"
        }
      ]
    };

Each time a property is added, renamed or any other relevant change is made to the type, we’ll know right away, when compiling our server, and we’ll be able to easily update the data.

I’ve used a similar approach, but without TypeScript and believe me, it was no fun 🙂.

After we add the items object to our server file, we’ll have the new endpoint available:

    import { items } from "./data/items";

    export = () => ({
      test: { value: "Hello from our fake API" },
      items
    });

Since we have all the fake data inside a folder within TypeScript files, we can use this for more purposes. Like unit or integration tests and reference the same files from all our projects where this test data is required.

# Fake data

When creating fake test data, we can write it manually or do a request to a real API and get some data back. But we might want to use some random fake data to test our application. For this, we’re gonna use faker.js.

Faker.js is a library for generating random data and has a lot of helpful methods for generating addresses, finance information, names, and many other things. Check the [documentation](https://github.com/Marak/Faker.js) to find out more.

We start by installing faker.js along with types:

    yarn add faker.js -D
    yarn add @types/faker -D

Then we can use the faker API to generate any kind of data we want. Let’s replace the hardcoded item names with some random ones:

    import { Item } from "../types/item";
    import * as faker from "faker";

    export const items: { count: number; values: Item[] } = {
      count: 3,
      values: [
        {
          id: 1,
          name: faker.commerce.productName()
        },
        {
          id: 2,
          name: faker.commerce.productName()
        },
        {
          id: 3,
          name: faker.commerce.productName()
        }
      ]
    };

Or better yet, let’s generate a completely random number of items:

    import { Item } from "../types/item";
    import * as faker from "faker";

    const randomItems: Item[] = [];
    for (let idx = 0; idx < faker.random.number(50); idx++) {
      randomItems.push({
        id: faker.random.number(),
        name: faker.commerce.productName()
      });
    }
    export const items: { count: number; values: Item[] } = {
      count: randomItems.length,
      values: randomItems
    };

Without much hassle, we managed to generate fake data for our API.

# Paths issue

I’m a big fan of using absolute paths in a TypeScript project. This allows us to replace imports like:

    import { Item } from '../../../../../types/item';

with something much nicer:

    import { Item } from 'types/item';

If you want to read more about this you can google ‘TypeScript paths’ or read my [short article](https://adrianfaciu.dev/posts/module-imports/).

So if you use this, kudos to you, but you’ll have a small problem. You are required to replace all absolute paths with the relative versions after compiling to JavsScript, for this to work in all environments.

One of the most used solutions is the [tsconfig-paths](https://github.com/dividab/tsconfig-paths) package. As usual, we add it using:

    yarn add tsconfig-paths -D

If you have multiple projects in the same workspace and use a different TypeScript config for the fake server you can take that into account. Add this to the server file:

    import * as tsConfig from '../tsconfig.json';
    import * as tsConfigPaths from 'tsconfig-paths';

    tsConfigPaths.register({
        baseUrl: 'dist',
        paths: tsConfig.compilerOptions.paths,
    });

Here we load the main config file for the workspace and register the tsconfig-paths package using the paths configured from that one. In our sample project we don’t have this setup, so we don’t add this now.

# Read-only data

As discussed above, one of the features of JSON server is that it saves any operations we make on our API. So if we make a POST/PUT request the values will be updated.

In some cases, we might not want this and we could use middleware to handle only GET requests. We can create a new file called _readonly-middleware.ts_ in our project and using an express like syntax, handle only these requests:

    function handleOnlyGet(req, res, next) {
        if (req.method !== 'GET') {
            res.status(200);
            res.send();
        } else {
            next();
        }
    }
    export = handleOnlyGet;

For any request that is not a GET return a 200 OK status and don’t do anything. We need to add this to the script used to start the server:

    "fake-api": "tsc && json-server dist/server.js --routes src/routes.json --middlewares dist/readonly-middleware.js"

# End

Hopefully, you’ve found this useful, and you’ll be able to use it in your projects. The code can be found on [GitHub](https://github.com/adrianfaciu/typed-fake-api). In a future post we’ll experiment with using [JSON Schema Faker](https://github.com/json-schema-faker/json-schema-faker) to achieve a similar result. Keep hacking!
