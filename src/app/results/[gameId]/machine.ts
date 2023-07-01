import { assign, createMachine } from "xstate";

const RESULTS_URL = "/api/results";

function loadGameResults(gameId: string) {
  return fetch(`${RESULTS_URL}/${gameId}`).then((a) => a.json());
}

const machine = createMachine(
  {
    predictableActionArguments: true,
    id: "results",
    initial: "loading",
    context: {
      gameId: "",
      blunders: 0,
      mistakes: 0,
      inaccuracies: 0,
      centipawnLoss: 0
    },
    schema: {
      context: {} as {
        gameId: string;
        blunders: number;
        mistakes: number;
        inaccuracies: number;
        centipawnLoss: number;
      },
      events: {} as {
        type: "done.invoke.loadGameResults";
        data: { blunders: number; mistakes: number; inaccuracies: number; centipawnLoss: number; };
      },
    },
    tsTypes: {} as import("./machine.typegen").Typegen0,
    states: {
      loading: {
        invoke: {
          id: "loadGameResults",
          src: "loadGameResults",
          onDone: [
            {
              cond: "hasGameResults",
              actions: "cacheGameResults",
              target: "ready",
            },
            { target: "error" },
          ],
          onError: "error",
        },
      },
      ready: {},
      error: {},
    },
  },
  {
    actions: {
      cacheGameResults: assign((_, event) => {
        return {
          blunders: event.data.blunders,
          mistakes: event.data.mistakes,
          inaccuracies: event.data.inaccuracies,
          centipawnLoss: event.data.centipawnLoss
        };
      }),
    },
    guards: {
      hasGameResults: (_, event) => {
        return !!event.data;
      },
    },
    services: {
      loadGameResults: (context) => {
        return loadGameResults(context.gameId);
      },
    },
  }
);

export default machine;
