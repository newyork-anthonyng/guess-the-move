
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.importGame": { type: "done.invoke.importGame"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.importGame": { type: "error.platform.importGame"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "importGame": "done.invoke.importGame";
        };
        missingImplementations: {
          actions: "redirectPage";
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "cacheImportGameResult": "done.invoke.importGame";
"redirectPage": "done.invoke.importGame";
"setPgn": "CHANGE";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "didImportFail": "done.invoke.importGame";
        };
        eventsCausingServices: {
          "importGame": "SUBMIT_PGN";
        };
        matchesStates: "error" | "ready" | "submitting" | "success";
        tags: never;
      }
  