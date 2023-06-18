import { assign, createMachine, sendParent } from "xstate";

const EVALUATE_URL = "/api/evaluate";
function apiGetEvaluation(context) {
  const userFen = context.userFen;
  const masterFen = context.masterFen;

  return fetch(EVALUATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userFen,
      masterFen,
    }),
  }).then((a) => a.json());
}
const chessboardMachine = createMachine(
  {
    predictableActionArguments: true,
    context: {
      currentMoveIndex: 0,
      masterEval: null,
      userEval: null,
      masterFen: "",
      userFen: "",
      userPlayedMove: "",
    },
    id: "evaluate",
    initial: "ready",
    states: {
      ready: {
        on: {
          MOVE: {
            target: "loading",
            actions: assign((_context, event) => {
              return {
                masterFen: event.masterFen,
                userFen: event.userFen,
                userPlayedMove: event.userPlayedMove,
              };
            }),
          },
        },
      },
      loading: {
        invoke: {
          id: "fetch-eval",
          src: apiGetEvaluation,
          onDone: {
            target: "results",
            actions: assign((_context, event) => {
              return {
                masterEval: event.data.masterEval,
                userEval: event.data.userEval,
              };
            }),
          },
          onError: "error",
        },
      },
      results: {
        on: {
          BACK: [
            {
              cond: "isEndOfGame",
              target: "completed",
            },
            {
              target: "opponentIsPlaying",
              actions: [
                assign((context) => {
                  return {
                    currentMoveIndex: context.currentMoveIndex + 1,
                  };
                }),
                sendParent((context) => ({
                  type: "UPDATE_CHESSBOARD",
                  data: { currentMoveIndex: context.currentMoveIndex },
                })),
              ],
            },
          ],
        },
      },
      opponentIsPlaying: {
        after: {
          200: {
            target: "ready",
            actions: [
              assign((context) => {
                return {
                  currentMoveIndex: context.currentMoveIndex + 1,
                };
              }),
              sendParent((context) => ({
                type: "UPDATE_CHESSBOARD",
                data: { currentMoveIndex: context.currentMoveIndex },
              })),
            ],
          },
        },
      },
      completed: {
        on: {
          FINISH: {
            target: "done",
          },
        },
      },
      done: {
        type: "final",
      },
      error: {},
    },
  },
  {
    guards: {
      isEndOfGame: (context) => {
        if (context.moves.length - 2 === context.currentMoveIndex) {
          return true;
        }
        return false;
      },
    },
  }
);
export default chessboardMachine;
