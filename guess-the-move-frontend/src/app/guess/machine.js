import { assign, createMachine } from 'xstate';
import Stockfish from './stockfish';

function getEvaluation(context) {
  const userFen = context.userFen;
  const masterFen = context.masterFen;

  return new Promise(resolve => {
    const stockfish = new Stockfish({
      onEvaluation: stockfishEvaluation => {
        console.log('********* stockfish eval:', stockfishEvaluation);
        resolve({
          ok: true,
          masterEval: stockfishEvaluation,
          userEval: stockfishEvaluation
        });
      }
    });

    console.log(masterFen);
    stockfish.evaluate(masterFen);
  });
}

const evaluateMachine = createMachine({
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
    opponentPlaying: {

    },
    ready: {
      on: {
        MOVE: {
          target: 'loading',
          actions: assign((_context, event) => {
            console.group('%cready.onMove', 'background-color: blue; color: white;');
            console.log(event);
            console.groupEnd();
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