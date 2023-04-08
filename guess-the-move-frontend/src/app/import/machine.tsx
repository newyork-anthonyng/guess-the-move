import { Chess } from 'chess.js';
import { createMachine, assign } from 'xstate';

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
    pgn: ''
  },
  states: {
    ready: {
      on: {
        CHANGE: {
          actions: ['setPgn']
        },
        SUBMIT_PGN: [
          {
            target: 'submitted',
            cond: 'isPgnValid'
          },
          'error'
        ]
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
  },
  guards: {
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
  }
});

export default validateMachine;