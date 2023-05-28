import { Chess } from 'chess.js';
import { createMachine, assign } from 'xstate';

const IMPORT_URL = '/api/import';
function apiImportGame(pgn: string) {
  return fetch(IMPORT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pgn })
  }).then(a => a.json())
}

const validateMachine = createMachine({
  predictableActionArguments: true,
  tsTypes: {} as import("./machine.typegen").Typegen0,
  schema: {
    context: {} as { pgn: string },
    events: {} as
      { type: 'CHANGE'; pgn: string } |
      { type: 'SUBMIT_PGN' }
  },

  id: 'import',
  initial: 'ready',
  context: {
    pgn: '',
    gameId: null
  },
  states: {
    ready: {
      on: {
        CHANGE: {
          actions: ['setPgn']
        },
        SUBMIT_PGN: {
          target: 'submitting'
        }
      }
    },
    submitting: {
      invoke: {
        id: 'importGame',
        src: 'importGame',
        onDone: [
          { cond: 'didImportFail', target: 'error' },
          { target: 'success', actions: 'cacheImportGameResult' }
        ],
        onError: {
          target: 'error'
        }
      }
    },
    error: {
      on: {
        CHANGE: {
          target: 'ready',
          actions: ['setPgn']
        }
      }
    },
    success: {
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
    cacheImportGameResult: assign((_, event) => {
      return {
        gameId: event?.data?.gameId
      }
    })
  },
  services: {
    importGame: (context) => {
      const pgn = context.pgn || '';

      return apiImportGame(pgn);
    }
  },
  guards: {
    didImportFail: (_, event) => {
      return event?.data?.ok === false;
    }
  }
});

export default validateMachine;