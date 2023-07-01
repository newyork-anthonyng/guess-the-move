import { assign, createMachine } from 'xstate';

const URL = '/api/evaluate';
function getEvaluation(context) {
  const userFen = context.userFen;
  const masterFen = context.masterFen;

  return fetch(URL, {
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

const evaluateMachine = createMachine({
  predictableActionArguments: true,
  context: {
    currentMoveIndex: 0,
    masterEval: null,
    userEval: null,
    masterFen: '',
    userFen: '',
    userPlayedMove: ''
  },
  id: 'evaluate',
  initial: 'ready',
  states: {
    opponentPlaying: {},
    ready: {
      on: {
        MOVE: {
          target: 'loading',
          actions: assign((_context, event) => {
            return {
              masterFen: event.masterFen,
              userFen: event.userFen,
              userPlayedMove: event.userPlayedMove
            };
          })
        }
      }
    },
    loading: {
      invoke: {
        id: 'fetch-eval',
        src: getEvaluation,
        onDone: {
          target: 'results',
          actions: assign((_context, event) => {
            return {
              masterEval: event.data.masterEval,
              userEval: event.data.userEval
            }
          })
        },
        onError: 'error'
      }
    },
    results: {
      on: {
        BACK: {
          target: 'opponentIsPlaying',
          actions: [
            assign((context) => {
              return {
                currentMoveIndex: context.currentMoveIndex + 1
              };
            }),
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
            assign((context) => {
              return {
                currentMoveIndex: context.currentMoveIndex + 1
              };
            }),
            'updateChessboard'
          ]

        }
      }
    },
    error: {}
  }
});

export default evaluateMachine;