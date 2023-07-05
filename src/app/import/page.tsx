'use client';

import { useRouter } from "next/navigation";
import { useMachine } from '@xstate/react';
import validateMachine from './machine';
import { COLORS } from "../guess/[gameId]/utils";

if (typeof process.env.NEXT_PUBLIC_USE_MSW !== 'undefined') {
  require('../../mocks/index')
}

const samplePgn = `1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0`;

export default function Page() {
  const router = useRouter();

  const [state, send] = useMachine(validateMachine, {
    actions: {
      redirectPage: (context) => {
        router.push(`/guess/${context.gameId}`);
      }
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    send({
      type: 'SUBMIT_PGN'
    });
  }

  function handlePgnChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    send({
      type: 'CHANGE',
      pgn: event.target.value
    });
  }

  function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    const didChooseWhite = !event.target.checked;
    const color = didChooseWhite ? COLORS[0] : COLORS[1];
    send({
      type: 'CHANGE_COLOR',
      data: { color }
    })
  }

  function handleAddSampleClick(e: React.FormEvent) {
    e.preventDefault();
    send({
      type: 'CHANGE',
      pgn: samplePgn
    })
  }

  return (
    <div>
      <div className="p-6 font-mono">
        <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-0 before:-left-60 before:-right-6">
          <h1 className="flex-none font-semibold mb-2 relative text-2xl text-white w-full">Add Chess PGN</h1>
        </div>

        <form className="my-6 w-full sm:w-1/2" onSubmit={handleSubmit}>
          <label htmlFor="chess-pgn" className="sr-only">Chess pgn</label>
          <textarea
            className="h-24 mb-6 placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-2 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
            placeholder="Add a chess pgn"
            id="chess-pgn"
            onChange={handlePgnChange}
            value={state.context.pgn}
          />

          <div className="mb-6">
            <label className="relative inline-flex items-center cursor-pointer block">
              <input type="checkbox" value="" className="sr-only peer" onChange={handleColorChange} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Play as {state.context.color}</span>
            </label>
          </div>
          
          <button
            className="px-6 h-12 uppercase font-semibold tracking-wider border-2 border-black border-b-4 border-r-4 bg-teal-400 text-black shadow-xl enabled:hover:shadow-sm enabled:hover:border-b-2 enabled:hover:border-r-2 disabled:opacity-50"
            disabled={state.matches('submitting')}
          >Submit</button>
        </form>

        {state.matches('submitting') && <div className="my-6 w-full sm:w-1/2">
          <p className="text-green-500">Submitting...</p>
        </div>}

        {state.matches('error.isPgnInvalid') && <div className="my-6 w-full sm:w-1/2">
          <p className="text-red-500">The PGN is not valid. Please add a valid PGN.</p>
        </div>}
        {state.matches('error.network') && <div className="my-6 w-full sm:w-1/2">
          <p className="text-red-500">An error occured when trying to create the game. Try again later.</p>
        </div>}

        <button
          className="px-6 h-12 uppercase font-semibold tracking-wider border-2 border-black border-b-4 border-r-4 text-slate-900 shadow-xl enabled:hover:shadow-sm enabled:hover:border-b-2 enabled:hover:border-r-2 disabled:opacity-50"
          onClick={handleAddSampleClick}
        >
          Add sample chess PGN
        </button>
      </div>
    </div>
  );
}