
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: "redirectPage";
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "redirectPage": "SUBMIT_PGN";
"setPgn": "CHANGE";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isPgnValid": "SUBMIT_PGN";
        };
        eventsCausingServices: {
          
        };
        matchesStates: "error" | "ready" | "submitted";
        tags: never;
      }
  