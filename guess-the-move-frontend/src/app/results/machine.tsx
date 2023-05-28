import { assign, createMachine } from "xstate";

const RESULTS_URL = '/api/results';

const machine = createMachine({
  predictableActionArguments: true,
  id: 'results',
  context: {
    blunders: null,
    mistakes: null,
    inaccuracies: null,
    averageCentipawnLoss: null
  },
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        id: 'getResults',
        src: 'getResults',
        onDone: [
          { target: 'loaded', actions: 'cacheResults' }
        ]
      }
    },
    loaded: {}
  }
}, {
  services: {
    getResults: () => {
      return fetch(RESULTS_URL).then(a => a.json());
    }
  },
  actions: {
    cacheResults: assign((_, event) => {
      return {
        ...event.data
      };
    })
  }
})

export default machine;