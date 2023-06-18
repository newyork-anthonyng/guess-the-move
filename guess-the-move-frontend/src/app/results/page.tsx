'use client';

import machine from './machine';
import { useMachine } from '@xstate/react';
import WaitForMsw from '../../library/WaitForMsw';

function Results() {
  const [state, send] = useMachine(machine);

  if (state.matches('loading')) {
    return (
      <p>Loading...</p>
    )
  }

  if (state.matches('loaded')) {
  return (
    <div className="p-6 font-mono">
      <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-0 before:-left-60 before:-right-6">
        <h1 className="flex-none font-semibold mb-2 relative text-2xl text-white w-full">
          Results
        </h1>
      </div>

      <div className="max-w-sm flex my-6 flex-col">
        <div className="my-6">
          <ul>
            <li>
              <span className="inline-block w-6">{state.context.inaccuracies}</span>
              <span className="text-blue-500">Inaccuracies</span>
            </li>
            <li>
              <span className="inline-block w-6">{state.context.mistakes}</span>
              <span>Mistakes</span>
            </li>
            <li>
              <span className="inline-block w-6">{state.context.blunders}</span>
              <span className="text-red-500">Blunder</span>
            </li>
            <li>
              <span className="inline-block w-6">{state.context.averageCentipawnLoss}</span>
              <span>Average centipawn loss</span>
            </li>
          </ul>
        </div>

        <button className="block px-6 mb-6 h-12 uppercase font-semibold tracking-wider border-2 border-black bg-teal-400 text-black border-b-4 border-r-4 shadow-xl hover:shadow-sm hover:border-b-2 hover:border-r-2">
          View your variations in Lichess
        </button>

        <button className="block px-6 h-12 uppercase font-semibold tracking-wider border-2 border-black text-slate-900 border-b-4 border-r-4 shadow-xl hover:shadow-sm hover:border-b-2 hover:border-r-2">
          Export PGN with your variations
        </button>
      </div>
    </div>
  );
  }
}

const shouldUseMsw = process.env.NODE_ENV === 'development';
export default shouldUseMsw ? WaitForMsw(Results) : Results;