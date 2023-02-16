import { assign, createMachine } from 'xstate';

function getEvaluation(context): Promise<object> {
  const userFen = context.userFen;
  const masterFen = context.masterFen;

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        ok: true,
        masterEval: '+8.5',
        userEval: '-3'
      });
    }, 1500);
  });
}

const evaluateMachine = createMachine({
  context: {
    masterEval: null,
    userEval: null,
    masterFen: '',
    userFen: ''
  },
  id: 'evaluate',
  initial: 'ready',
  states: {
    ready: {
      on: {
        MOVE: {
          target: 'loading',
          actions: assign((_context, event) => {
            return {
              masterFen: event.masterFen,
              userFen: event.userFen
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
          // actions: assign({
          //   eval: (context, event) => {
          //     return event.data;
          //   }
          // })
          actions: assign((_context, event) => {
            console.group('%cinvoke', 'background-color: red; color: white;')
            console.log(event.data);
            console.groupEnd();
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
          target: 'ready'
        }
      }
    },
    error: {}
  }
});

export default evaluateMachine;