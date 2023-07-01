
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.loadGameResults": { type: "done.invoke.loadGameResults"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.loadGameResults": { type: "error.platform.loadGameResults"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "loadGameResults": "done.invoke.loadGameResults";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "cacheGameResults": "done.invoke.loadGameResults";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "hasGameResults": "done.invoke.loadGameResults";
        };
        eventsCausingServices: {
          "loadGameResults": "xstate.init";
        };
        matchesStates: "error" | "loading" | "ready";
        tags: never;
      }
  