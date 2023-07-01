import { Chess } from 'chess.js';
import { createMachine, assign } from 'xstate';

const URL = '/api/game'
function createGame(pgn: string) {
  return fetch(URL, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pgn })
  }).then(a => a.json())
}

const validateMachine = createMachine({
  predictableActionArguments: true,
  tsTypes: {} as import("./machine.typegen").Typegen0,
  schema: {
    context: {} as { pgn: string; gameId: string; },
    events: {} as
      { type: 'CHANGE'; pgn: string } |
      { type: 'SUBMIT_PGN' } |
      { type: "done.invoke.createGame"; data: { gameId: string } }
  },
  id: 'import',
  initial: 'ready',
  context: {
    pgn: '',
    gameId: ''
  },
  states: {
    ready: {
      on: {
        CHANGE: {
          actions: ['setPgn']
        },
        SUBMIT_PGN: [
          {
            target: 'submitting',
            cond: 'isPgnValid'
          },
          'error.isPgnInvalid'
        ]
      }
    },
    error: {
      initial: 'network',
      on: {
        CHANGE: {
          target: 'ready',
          actions: ['setPgn']
        }
      },
      states: {
        isPgnInvalid: {},
        network: {}
      }
    },
    submitting: {
      invoke: {
        id: 'createGame',
        src: 'createGame',
        onDone: [
          { cond: 'didCreateGame', target: 'submitted', actions: 'cacheGameId' },
          { target: 'error.network' }
        ],
        onError: 'error.network'
      }
    },
    submitted: {
      type: 'final',
      entry: ['redirectPage']
    }
  }
}, {
  actions: {
    setPgn: assign((_, event) => {
      return {
        pgn: event.pgn
      };
    }),
    cacheGameId: assign((_, event) => {
      return {
        gameId: event.data.gameId
      }
    })
  },
  guards: {
    didCreateGame: (_, event) => {
      return !!event.data.gameId;
    },
    isPgnValid: (context) => {
      const pgn = context.pgn || '';

      const isPgnEmpty = pgn.trim().length === 0;

      if (isPgnEmpty) return false;

      try {
        const chess = new Chess();
        chess.loadPgn(pgn);

        return true;
      } catch {
        return false;
      }
    }
  },
  services: {
    createGame: (context) => {
      return createGame(context.pgn);
    }
  }
});

export default validateMachine;