import { assign, createMachine } from 'xstate';
import { CustomChessConfig, getMovesFromPgn } from './utils';
import { Color, COLORS } from './utils';

const EVALUATE_GAME_URL = '/api/evaluate';
function getEvaluation(uci: string, gameId: string) {
  return fetch(`${EVALUATE_GAME_URL}/${gameId}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uci })
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
      uci: string;
      gameId: string;
      moves: CustomChessConfig[];
      color: Color;
    },
    events: {} as
      { type: 'MOVE'; data: { uci: string; } } |
      { type: 'BACK' } |
      { type: 'SETTING_UP_BOARD.DONE' } |
      { type: 'done.invoke.loadingGame'; data: { pgn: string; color: Color } } |
      { type: 'done.invoke.getEvaluation'; data: { masterEval: number; userEval: number; } }
  },
  tsTypes: {} as import("./machine.typegen").Typegen0,
  context: {
    currentMoveIndex: 0,
    masterEval: 0,
    userEval: 0,
    uci: '',
    gameId: '',
    moves: [] as CustomChessConfig[],
    color: COLORS[0]
  },
  id: 'evaluate',
  initial: 'loadingGame',
  states: {
    loadingGame: {
      invoke: {
        id: 'loadingGame',
        src: 'loadGame',
        onDone: [
          { cond: 'didFindGame', target: 'settingUpBoard', actions: 'cacheGame' },
          { target: 'error.gameDoesNotExist' }
        ],
        onError: {
          target: 'error.network'
        }
      }
    },
    settingUpBoard: {
      on: {
        'SETTING_UP_BOARD.DONE': {
          target: 'initializingGame'
        }
      }
    },
    initializingGame: {
      always: [
        { cond: 'isPlayingAsBlack', target: 'opponentIsPlaying' },
        { target: 'ready' }
      ]
    },
    ready: {
      always: [
        { cond: 'isEndOfGame', target: 'gameCompleted' }
      ],
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
    },
    gameCompleted: {
      type: 'final',
      entry: 'goToResults'
    }
  }
}, {
  actions: {
    cacheGame: assign((_, event) => {
      const pgn = event.data.pgn;
      const color = event.data.color;
      const moves = getMovesFromPgn(pgn);

      return {
        pgn,
        moves,
        color
      }
    }),
    cacheMove: assign((_, event) => {
      return {
        uci: event.data.uci
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
    isPlayingAsBlack: (context) => {
      return context.color === COLORS[1];
    },
    didFindGame: (_, event) => {
      return !!event.data.pgn;
    },
    isEndOfGame: (context) => {
      const totalMoves = context.moves.length;
      const currentMoveIndex = context.currentMoveIndex;
      return currentMoveIndex >= totalMoves;
    }
  },
  services: {
    loadGame: (context) => {
      return loadGame(context.gameId);
    },
    getEvaluation: (context) => {
      return getEvaluation(context.uci, context.gameId);
    }
  }
});

export default evaluateMachine;