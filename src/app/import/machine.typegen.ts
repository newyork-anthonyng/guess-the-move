
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.createGame": { type: "done.invoke.createGame"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.createGame": { type: "error.platform.createGame"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "createGame": "done.invoke.createGame";
        };
        missingImplementations: {
          actions: "redirectPage";
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "cacheGameId": "done.invoke.createGame";
"redirectPage": "done.invoke.createGame";
"setPgn": "CHANGE";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "didCreateGame": "done.invoke.createGame";
"isPgnValid": "SUBMIT_PGN";
        };
        eventsCausingServices: {
          "createGame": "SUBMIT_PGN";
        };
        matchesStates: "error" | "error.isPgnInvalid" | "error.network" | "ready" | "submitted" | "submitting" | { "error"?: "isPgnInvalid" | "network"; };
        tags: never;
      }
  