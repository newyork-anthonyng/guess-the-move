import { assign, createMachine } from "xstate";
import { getMovesFromPgn } from "./utils";
import chessboardMachine from "./chessboardMachine";

const GAME_INFO_URL = "/api/games";
function apiGetGameInfo(gameId: string) {
  return fetch(`${GAME_INFO_URL}/${gameId}`).then((a) => a.json());
}

const gameMachine = createMachine(
  {
    predictableActionArguments: true,
    context: {
      gameId: null,
      pgn: null,
      moves: null,
      currentMoveIndex: 0,
      masterEval: null,
      userEval: null,
      masterFen: "",
      userFen: "",
      userPlayedMove: "",
    },
    id: "game",
    initial: "loadingGame",
    states: {
      loadingGame: {
        invoke: {
          id: "loadingGame",
          src: "loadGameInfo",
          onDone: [
            { cond: "isGameInvalid", target: ".error.gameDoesNotExist" },
            { target: "ready", actions: "cacheGameInfo" },
          ],
          onError: ".error.network",
        },

        states: {
          error: {
            initial: "none",
            states: {
              none: {},
              gameDoesNotExist: {},
              network: {},
            },
          },
        },
      },
      ready: {
        invoke: {
          id: "guessTheMove",
          src: chessboardMachine,
          data: {
            pgn: (context) => context.pgn,
            moves: (context) => context.moves,
            currentMoveIndex: 0,
            masterEval: null,
            userEval: null,
            masterFen: "",
            userFen: "",
            userPlayedMove: "",
          },
          onDone: {
            target: 'completed'
          }
        },
        on: {
          UPDATE_CHESSBOARD: {
            actions: [
              () => console.log("update_chessboard action"),
              "applesauce",
            ],
          },
        },
      },
      completed: {
        entry: 'goToResults'
      },
      error: {},
    },
  },
  {
    actions: {
      cacheGameInfo: assign((_, event) => {
        const pgn = event?.data?.pgn;

        return {
          pgn,
          moves: getMovesFromPgn(pgn),
        };
      }),
    },
    guards: {
      isGameInvalid: (_, event) => {
        return event?.data?.ok === false;
      },
    },
    services: {
      loadGameInfo: (context) => {
        return apiGetGameInfo(context.gameId);
      },
    },
  }
);

export default gameMachine;
