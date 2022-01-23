---
title: 'Having fun with TypeScript literal types'
date: '2022-01-25T13:00:37.121Z'
template: 'post'
draft: false
slug: '/posts/template-literal-types/'
category: 'Programming'
tags:
  - 'TypeScript'
  - 'Types'
  - 'API'
description: 'Exploring two new features of TypeScript 4.1, template literal types and recursive conditional types to create a typed version of an fetch method for an existing codebase.'
---

This post will explore my train of though following a question about how would I type and existing API layer. The example code was not used in any production ready app, but it was a nice exercise in working with TypeScript while trying to solve this particular problem.

Some knowledge of [TypeScript](https://www.typescriptlang.org/) will be required in order to be able to follow along, but I’ll try to provide enough links and examples so that one can read and learn what’s necessary.

We'll go from simple types, to template literal types, and we're even going to use [recursion](https://en.wikipedia.org/wiki/Recursion).

# The Problem

Let’s assume we have an existing code base, with a general method that reads data from an API. We can pass it the URL we want, and the fields that we want to read for that specific object type. Might look something like this:

    fetchData(fields, url) {...}

And assuming we have a `Car` object, that looks like this:

    type Car = {
        id: number;
        name: string;
        price: number;
    }

We can use our method to fetch a list of available cars, and what data we need for each:

    fetchData('id, name', '/api/cars');

We’re specifying that we want the list of cars, but only the `id` and `name` properties on them. In our simple example, this is somehow irrelevant. But if you are working with big objects or large volume of data, this can save a lot of bandwidth and improve the speed of your app. Imagine you fetch a huge list of items, but only the ids, because that’s the only thing you need.

Another possible use case is if you have different clients (web, mobile) that use the same APIs, but they display different data. So this might be useful to fetch what's needed in each case. There are different ways to implement this on the backend, depending on what technology you are using.

Back to our method, this is all existing code, maybe minus the Car type. Imagine we're working to migrate a codebase to TypeScript. And our task on hand would be to type this method, so that developers have an easier time using it, and generally make our code better.

# Return type

This should be straight forward. We want to get a specific type back, so we make the function generic, and specify ourselves what the return type is:

    function fetchData<T>(fields: string, url: string): T {...}

Then we can use it as:

    const cars = fetchData<Car>('id', '/api/cars')

Now TypeScript will make sure our `cars` variable has the proper type. It’s a bit tricky that we have to manually specify this, but there is no easy way out of it. We cannot easily map the type to a string, so this is what we have to settle with. All the popular libraries used to fetch data will do something similar to this.

If we want to make sure developers working in this codebase use the correct type, we could encapsulate this at the API layer in one way or another. For example creating a `fetchCars` function:

    function fetchCars(fields: string) {
      return fetchData<Car>(fields, '/api/cars');
    }

This takes care of the basics, now let's see about that fields type.

# One property

It would be nice to be able to specify only existing properties of a `Car` when we call this! In that way, we’re sure our method is typed.

First thing I would think of is `keyof`, this will allow us to get all the keys of a specified type. So if we have something like:

    type CarKeys = keyof Car;

It will look like:

    'id' | 'name' | 'price'

Because these are the properties that we defined on our `Car` type above, any time we add or remove properties inside the Car type, the `keyof` derived type will be updated. You can see the [official docs](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) for more.

So we update our function to fetch data with this knowledge:

    function fetchData<T>(fields: keyof T, url: string): T

This seems to work, we can make calls and load data but… we can specify only one property at a time, which is not exactly what we want 😅.

    // ✅
    fetchData('id', '/api/cars/');

    // ❌ Argument of type '"name, id"' is not assignable to parameter of type 'keyof Car'.
    fetchData('id, name', '/api/cars/');

# Template literal and recursive conditional types

A possible solution to this our problem, is the use of [template literal types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types) and [recursive conditional types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#recursive-conditional-types), introduced in TypeScript 4.1. You can see the release notes for full details, but I'll try to show some examples below.

Using similar concepts from [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), we create a type using substitutions:

    type Programming = "programming";
    type Statement = `love ${Programming}`; // 'love programming'

This is pretty straight forward, but we can explore one additional trick:

    type Programming = "programming";
    type Reading = "reading";
    type Statement = `love ${Programming | Reading}`;

What happens if we use a union operator with a template literal type? _It will create all the possible combinations!_ So this will get expanded to:

    type Statement = "love programming" | "love reading"

We can use something a bit more complex as an example to better grasp it. Lets compose some CSS properties:

    type CssProperty = "margin" | "padding";
    type PropertySide = "top" | "right" | "bottom" | "left";

    type Property = `${CssProperty}-${PropertySide}`

Which will get expanded to all possible combinations:

    type Property = "margin-top" | "margin-right" | "margin-bottom" | "margin-left" | "padding-top" | "padding-right" | "padding-bottom" | "padding-left";

Our second nice thing, are the recursive conditional types. So far, we had [conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html). And we were able to create complex enough types with them. However, up until TypeScript 4.1, we could not recursively reference the type itself. Let's try to extract the primitive types from an array, also handling the case when we have deeply nested arrays:

    type ExtractType<T> = T extends Array<infer U> ? ExtractType<U> : T;

We have a generic type, in which we check if the argument extends an array, if not we return it. But if yes, we call the generic type again, but with the [new type inferred](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types) from the array. And we can test it out:

    // 'string'
    let one: ExtractType<[string]>;

    // 'string' | 'number'
    let two: ExtractType<[string, [number]]>;

    // 'string' | 'number' | 'boolean'
    let three: ExtractType<[string, [number, [boolean]]]>;

These examples are pretty similar to those from the release notes. Added them here for more context or in case you did not opened the links :)

And now we know everything we need to continue.

# Multiple fields

So, back to our problem. We have the Car type, we used the keyof on it, which works, but only with one property at a time, and we would like to expand this to work for all/any combination of them.

Let's start the other way around. One solution would be something like this:

    type KeysOf<T, Key extends keyof T = keyof T> = Key extends string ? `${Key},${KeysOf<Omit<T, Key>>}` | Key : never;

Lets go through it step by step. We created a generic type with two arguments, the type of the object we want to use, and an union with property names of that type. By default, this will be a union of all the property names, like we've seen before.

Then, we use a conditional type to see if the second generic argument, the `Key`, extends a `string`. This will happen most of the time, minus the case when we return `never`. This is our way to make sure we don't get into infinite recursive calls.

Now, if we still have properties to process, we construct our template literal type `${Key},${KeysOf<Omit<T, Key>>}`. We want the properties to be separated by a comma, so we add it there. Then we use the same type, to create a recursive call.

The trick here is to use the [Omit](https://mariusschulz.com/blog/the-omit-helper-type-in-typescript) helper type. Each time we process a property name, we call the same type recursively, but without the processed property. In this way we handle all of the properties one by one, until we call the type with an empty argument. In that case, the Key will no longer be a string, so we'll return never and stop the recursive call.

The last thing to add here is a union with the Key itself. This will generate a union with all the possible combinations.

Then we can update our function with our new type:

    function fetchData<T>(fields: KeysOf<T>, url: string): T

And this will work pretty well. We can specify any combination of properties that we might want to read:

    fetchData('name, price')
    fetchData('price, name')
    fetchData('price')
    fetchData('id, name, price')
    // and so on

If you want to check this, you can use this yourself (or see the TypeScript playground link at the end):

    type CarProps = KeysOf<Car>;

Will get transformed into:

    type CarPropsSimple = "id" | "name" | "price" | "name,price" | "price,name" | "id,name" | "id,price" | "id,name,price" | "id,price,name" | "price,id" | "name,id" | "name,id,price" | "name,price,id" | "price,id,name" | "price,name,id";

There are some ways to solve this without using the second generic argument, but I found this way of doing it more straight forwards and we get some extra benefits. If we want, we can generate key combinations based only on some of the fields from an object:

    KeysOf<Car, "engine">
    KeysOf<Car, "engine" | "name">

Or just maybe, this way of solving it might have been the easiest for me 😅.

# Complex (nested) objects

We can improve further on our type. So far we had a simple car type, with properties that have primitive values. But in real life, we might have some more complex types. Maybe the car also has an engine:

    type Engine = {
      power: number;
      id: string;
    };

    type Car = {
      id: number;
      name: string;
      price: number;
      engine: Engine;
    };

And, in case of the engine field, we might to do the same thing, specify only what properties we want to read from it. Something like this:

    fetchData('name,engine(power)', '/api/cars');

This will mean that we want a list of all the cars, with only the name and engine fields, and on the engine, we only need the power property.

In this part, we'll make use of the [Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) utility type. This helps us to check if a type is an Object like value, or a primitive type. As an alternative, we could have used our own `Primitive` type.

We can build on our previous version, to include an additional check:

    type KeysOf<T, Key extends keyof T = keyof T> = Key extends string
        ? T[Key] extends Record<string, any>
            ? `${Key}(${KeysOf<T[Key]>})`
            : `${Key},${KeysOf<Omit<T, Key>>}` | Key
        : never;

First we check to see if the property extends a string, then, we check to see if the type of that property is a `Record`, if it is, we add the brackets and recursively call the type for the nested type. If the type of the property is a primitive, we do the same thing as before.

And this solves the problem of a bit more complex types, as we can see if we check it out:

    type CarProps = KeysOf<Car>;

Will get transformed into an even more complex thing:

    type CarProps = "id" | "name" | "price" | "engine(id)" | "engine(power)" | "engine(id,power)" | "engine(power,id)" | "price,engine(id)" | "price,engine(power)" | "price,engine(id,power)" | ... 68 more ... | "price,name,id,engine(power,id)";

Yes, 68 more options, it indeed has all the possible combinations :).

# Fetch everything

The last improvement we want to make to our type, is the option to specify "all the fields" for any nested types, by writing an asterisk instead of any property names.

This can be achieved by updating the handler for the 'when is Record' branch, to return either a recursive call, or '\*' which would mean all of them.

    type KeysOfStar<T, Key extends keyof T = keyof T> = Key extends string
        ? T[Key] extends Record<string, any>
            ? `${Key}(${KeysOfStar<T[Key]> | "*"})`
            : `${Key},${KeysOfStar<Omit<T, Key>>}` | Key
        : never;

# Conclusion

This was an interesting experiment, and it allowed me to play around with template literals and recursive conditional types. They are quite powerful and can provide useful types for our code. This post is a first in a series of "learning in public" style of articles. More will follow :)

If you want to experiment live with this type, you can use [this TypeScript playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAogdgcwJZ2gXigbwLACgpRgD2A7hAE4BcUcArgLYBGFA3HgUgCbUDOw5KBG1wBfYXlCQoAYQCG5KBhz4oXanSat2NWfQi9+g4QTACAxvpoNm5Y1AiIUl+MlTCxeCeGgBpCCB4AeQAzAGUkejAAGwgAHgAVABooPxB7AA9gB04eKABrfyJgqHjFfMLi+IA+MtSMrLgcqD4BRG0AfigAAwASTFSRRL7UoLCI6LjA+iRgBOTUqqqRLqgAHxT-bXUIADctXEloOXIABXIiMB5wyJja-1HridjjqvED7w2AkLnP+uzcgogIolMqA4HVO5pCCZf7NQxtFSdeIAbVSAF0-o1cgAlCBmIjkTixFqCZKyOAgKraAidXr9fwiAAUw3u3xR6KWAEoutSoNQ6QMhvSvsFYlMZj8FksVutUlsaLt9ocZPIzhdchgRt8Xm9lVqwsB5JL-JimmDKqCKiUapqTdCGk0SQiaSVUf4MfbYbj8YTifCEGSKVSVC6BQzmcKHobyAk3SA0TV1gAiABUSZE3N5-JZIEGOajRvFsySn0WyzWn3lqD2ti8UmOasuoWjkILMZ1eCAA).

Let me know if you would use something like this in production, or what other interesting ways of solving this problem you have.
