---
title: "Update on testing NgRx Effects"
date: "2017-12-04T23:46:37.121Z"
template: "post"
draft: false
slug: "/posts/update-testing-ngrx/"
category: "NgRx"
tags:
  - "Angular"
  - "NgRx"
  - "Best practices"
description: "A while ago I’ve written a post on how to test NgRx effects. If you did not read that one I encourage you to go and have a look. Since then, both NgRx and RxJs have released some new versions and there are some things we need to update in our tests."
---

A while ago I’ve written a post on how to test NgRx effects. If you did not read that one I encourage you to go and have a look.

Since then, both [NgRx](https://github.com/ngrx/platform) and [RxJs](https://github.com/reactivex/rxjs) have released some new versions and there are some things we need to update in our tests.

## Store mock

Up to now we were creating the data for the store mock with one simple line of code:

    const initialAppState = reducer(undefined, { type: 'INIT_ACTION' });

We were fetching the root reducer, the result of calling combineReducers on all our reducers, and calling it with an unknown action so we would get the initial state in all the cases.

The **4.x** release of **NgRx** added, among others, the awesome option of placing reducers, effects and actions inside the modules where they were used and lazy load them when needed. So, as with other libraries, we use _forRoot_ method in the app module and _forFeature_ in all the rest.

You can have a look at the [migration guide here](https://github.com/ngrx/platform/blob/master/MIGRATION.md).

This means that now we have to compose the reducers object from all our feature modules. We have to create a reducers map that looks something like this:

    const reducersMap = {

        ...coreReducers,

        items: fromItems.Reducer,

        itemDetails: fromItemDetails.Reducer,

    };

Another change is that the forRoot method now takes this map of reducers as an argument, it will call internally combineReducers method. So we need to create the root reducer by calling this ourselves:

    const rootReducer = combineReducers(reducersMap, initialState);

The second argument, *initialState, *is an object that we can create in our tests, when a state different than the default is needed.

After we have all this, we can create the state as we did before:

    const appState = rootReducer(undefined, { type: 'INIT_ACTION' });

## RxJs and lettable operators

From RxJs 5.5 we have lettable operators, which means we import them as standalone functions and need the pipe method in order to use. You can read more about this in the [official documentation](https://github.com/ReactiveX/rxjs/blob/master/doc/lettable-operators.md).

Since they are functions, and no longer patch the Observable prototype when imported, it means we also cannot do this anymore in order to specify a scheduler, so we need to find an alternative.

And this alternative it’s not that easy to find at the moment, there is no easy and clean way to do this without changing the code of the effect class.

### Rebinding schedule

By default, RxJs operators use the async scheduler internally, if no other is specified. So a workaround to the problem is to change the behaviour of this scheduler. We can import it in our tests and overwrite the schedule method to that of our test scheduler:

    import { async } from 'rxjs/scheduler/async';
    import { getTestScheduler } from 'jasmine-marbles';

    const testScheduler = getTestScheduler();

    async.schedule = (*work*, *delay*, *state*) =>
              testScheduler.schedule(work, delay, state);

By running this in a _before_ block, we’ll make sure that our tests will still pass, and we can get rid of the code where we were patching individual operators.

### Passing scheduler in constructor

A similar approach to how the tests are done inside the [sample app](https://github.com/ngrx/platform/tree/master/example-app) from NgRx repository is to add a scheduler to the effect constructor. Either mark it with the [optional](https://angular.io/api/core/Optional) decorator and if we don’t get anything we initialize it to the async scheduler or we can use a default value for it:

    export class AppTimeEffect {
         constructor(private *actions$*: Actions,
                     private *scheduler* = async,
          ) { }
    }

After we have it here we also need to pass it as argument to all the operators where it’s required, so our effect will become something like:

    @Effect()
    fetchDataWithDebounce$ = this.actions$
       .ofType(actions.DATA_WITH_DEBOUNCE_FETCH)
       .debounceTime(100, this.scheduler)
       *// Call API service or some other processing
       *.map(() => ({ type: actions.DATA_WITH_DEBOUNCE_FETCH_SUCCESS }));

Once that is done, we can pass the test scheduler when we create an instance of the effect inside the tests:

    const scheduler = getTestScheduler();
    const effect = new AppTimeEffect(new Actions(source), scheduler);

In this case we edited the effect code so we can test it, but our intent is more clear. On the good side, we still avoided using Angular specific constructs like the TestBed.

If you want to know more about the future of schedulers in RxJs have a look at [this thread](https://github.com/ReactiveX/rxjs/issues/2935#issuecomment-336681001).
