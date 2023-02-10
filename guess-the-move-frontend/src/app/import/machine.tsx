import { createMachine } from 'xstate';

const validateMachine = createMachine({
  id: 'validate',
  initial: 'ready',
  states: {
    ready: {
      on: {
        SUBMIT: 'loading'
      }
    },
    loading: {
      entry: ['load'],
      on: {
        RESOLVE: {
          target: 'ready'
        },
        ERROR: {
          target: 'error'
        }
      }
    },
    error: {
      on: {
        SUBMIT: 'loading'
      }
    }
  }
});

export default validateMachine;