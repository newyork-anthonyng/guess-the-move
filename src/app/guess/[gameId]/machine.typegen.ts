
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"done.invoke.getEvaluation": { type: "done.invoke.getEvaluation"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.loadingGame": { type: "done.invoke.loadingGame"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.getEvaluation": { type: "error.platform.getEvaluation"; data: unknown };
"error.platform.loadingGame": { type: "error.platform.loadingGame"; data: unknown };
"xstate.after(200)#evaluate.opponentIsPlaying": { type: "xstate.after(200)#evaluate.opponentIsPlaying" };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "getEvaluation": "done.invoke.getEvaluation";
"loadGame": "done.invoke.loadingGame";
        };
        missingImplementations: {
          actions: "goToResults" | "updateChessboard";
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "cacheEvaluation": "done.invoke.getEvaluation";
"cacheGame": "done.invoke.loadingGame";
"cacheMove": "MOVE";
"goToNextMove": "BACK" | "xstate.after(200)#evaluate.opponentIsPlaying";
"goToResults": "";
"updateChessboard": "BACK" | "xstate.after(200)#evaluate.opponentIsPlaying";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "didFindGame": "done.invoke.loadingGame";
"isEndOfGame": "";
"isPlayingAsBlack": "";
        };
        eventsCausingServices: {
          "getEvaluation": "MOVE";
"loadGame": "xstate.init";
        };
        matchesStates: "error" | "error.gameDoesNotExist" | "error.network" | "gameCompleted" | "initializingGame" | "loading" | "loadingGame" | "opponentIsPlaying" | "ready" | "results" | "settingUpBoard" | { "error"?: "gameDoesNotExist" | "network"; };
        tags: never;
      }
  