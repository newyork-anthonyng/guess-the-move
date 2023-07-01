"use client";

import { useMachine } from "@xstate/react";
import machine from "./machine";

if (typeof process.env.NEXT_PUBLIC_USE_MSW !== "undefined") {
  require("../../../mocks/index");
}

export default function Results({ params }: { params: { gameId: string }}) {
  const [state] = useMachine(machine, {
    context: {
      gameId: params.gameId
    }
  });

  const inaccuracyText = `Inaccurac${state.context.inaccuracies === 1 ? "y" : "ies"}`;
  const mistakeText = `Mistake${state.context.mistakes === 1 ? "" : "s"}`;
  const blunderText = `Blunder${state.context.blunders === 1 ? "" : "s"}`;

  return (
    <div className="p-6 font-mono">
      <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-0 before:-left-60 before:-right-6">
        <h1 className="flex-none font-semibold mb-2 relative text-2xl text-white w-full">
          Results
        </h1>
      </div>

      {state.matches("loading") && (
        <div>
          <p className="text-xl">Loading...</p>
        </div>
      )}

      {state.matches("ready") && (
        <>
          <div className="my-6">
            <ul>
              <li aria-label={`${state.context.inaccuracies} ${inaccuracyText}`}>
                <span className="inline-block w-6">{state.context.inaccuracies}</span>
                <span className="text-blue-500">{inaccuracyText}</span>
              </li>
              <li aria-label={`${state.context.mistakes} ${mistakeText}`}>
                <span className="inline-block w-6">{state.context.mistakes}</span>
                <span>{mistakeText}</span>
              </li>
              <li aria-label={`${state.context.blunders} ${blunderText}`}>
                <span className="inline-block w-6">{state.context.blunders}</span>
                <span className="text-red-500">{blunderText}</span>
              </li>
              <li aria-label={`${state.context.centipawnLoss} average centipawn loss`}>
                <span className="inline-block w-6">{state.context.centipawnLoss}</span>
                <span>Average centipawn loss</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
