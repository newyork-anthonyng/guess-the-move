import { assign, createMachine } from 'xstate';
import { CustomChessConfig, getMovesFromPgn } from './utils';

const EVALUATE_GAME_URL = '/api/evaluate';
function getEvaluation(userFen: string, masterFen: string) {
  return fetch(EVALUATE_GAME_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userFen,
        masterFen
      })
    }).then(a => a.json())
}

const LOAD_GAME_URL = '/api/game';
function loadGame(gameId: string) {
  return fetch(`${LOAD_GAME_URL}/${gameId}`)
    .then(a => a.json())
}

const evaluateMachine = createMachine({
  predictableActionArguments: true,
  schema: {
    context: {} as {
      currentMoveIndex: number;
      masterEval: number;
      userEval: number;
      masterFen: string;
      userFen: string;
      userPlayedMove: string;
      gameId: string;
      moves: CustomChessConfig[];
    },
    events: {} as
      { type: 'MOVE'; masterFen: string; userFen: string; userPlayedMove: string; } |
      { type: 'BACK' } |
      { type: 'done.invoke.loadingGame'; data: { pgn: string } } |
      { type: 'done.invoke.getEvaluation'; data: { masterEval: number; userEval: number; } }
  },
  tsTypes: {} as import("./machine.typegen").Typegen0,
  context: {
    currentMoveIndex: 0,
    masterEval: 0,
    userEval: 0,
    masterFen: '',
    userFen: '',
    userPlayedMove: '',
    gameId: '',
    moves: [] as CustomChessConfig[]
  },
  id: 'evaluate',
  initial: 'loadingGame',
  states: {
    loadingGame: {
      invoke: {
        id: 'loadingGame',
        src: 'loadGame',
        onDone: [
          { cond: 'didFindGame', target: 'ready', actions: 'cacheGame' },
          { target: 'error.gameDoesNotExist' }
        ],
        onError: {
          target: 'error.network'
        }
      }
    },
    ready: {
      on: {
        MOVE: {
          target: 'loading',
          actions: 'cacheMove'
        }
      }
    },
    loading: {
      invoke: {
        id: 'getEvaluation',
        src: 'getEvaluation',
        onDone: {
          target: 'results',
          actions: 'cacheEvaluation'
        },
        onError: 'error'
      }
    },
    results: {
      on: {
        BACK: {
          target: 'opponentIsPlaying',
          actions: [
            'goToNextMove',
            'updateChessboard'
          ]
        }
      }
    },
    opponentIsPlaying: {
      after: {
        200: {
          target: 'ready',
          actions: [
            'goToNextMove',
            'updateChessboard'
          ]

        }
      }
    },
    error: {
      states: {
        gameDoesNotExist: {},
        network: {}
      }
    }
  }
}, {
  actions: {
    cacheGame: assign((_, event) => {
      const pgn = event.data.pgn;
      const moves = getMovesFromPgn(pgn);

      return {
        pgn,
        moves
      }
    }),
    cacheMove: assign((_, event) => {
      return {
        masterFen: event.masterFen,
        userFen: event.userFen,
        userPlayedMove: event.userPlayedMove
      };
    }),
    cacheEvaluation: assign((_, event) => {
      return {
        masterEval: event.data.masterEval,
        userEval: event.data.userEval
      }
    }),
    goToNextMove: assign((context) => {
      return {
        currentMoveIndex: context.currentMoveIndex + 1
      };
    }),
  },
  guards: {
    didFindGame: (_, event) => {
      return !!event.data.pgn;
    }
  },
  services: {
    loadGame: (context) => {
      return loadGame(context.gameId);
    },
    getEvaluation: (context) => {
      return getEvaluation(context.userFen, context.masterFen);
    }
  }
});

export default evaluateMachine;