"use client";

import { useEffect, useRef } from "react";
import { useActor, useInterpret, useMachine } from "@xstate/react";

import { Chess, Square } from "chess.js";

import { Chessground } from "chessground";
import { Api } from "chessground/api";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import WaitForMsw from '../../library/WaitForMsw';

import { initialSquares } from "./utils";

const INITIAL_FEN = `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`;

interface ChessMove {
  to: string;
}

function toDests(chess: Chess) {
  const destinations = new Map();

  initialSquares.forEach((s) => {
    const square = s as Square;
    const ms = chess.moves({ square, verbose: true });
    if (ms.length)
      destinations.set(
        s,
        ms.map((m: ChessMove) => m.to)
      );
  });

  const color = chess.turn() === "w" ? "white" : "black";

  return {
    color,
    dests: destinations,
    free: false,
  };
}

function Guess({ service, childRef }) {
  const chessboardDivRef = useRef<HTMLDivElement>(null);
  const chessgroundRef = useRef<Api>();

  const [state, send] = useActor(service);

  useEffect(() => {
    if (childRef?.current) {
      childRef.current.updateChessboard = (currentMoveIndex) => {
        const context = state.context;
        if (chessgroundRef.current) {
          const currentMove = context.moves[currentMoveIndex];

          if (!currentMove) return;

          const result = toDests(new Chess(currentMove.fen));
          const newConfig = {
            ...currentMove,
            movable: {
              free: false,
              dests: result.dests,
              showDests: true,
            },
          };
          chessgroundRef.current.set(newConfig);
        }
      }
    }

    const $div = chessboardDivRef.current;
    const chess = new Chess(INITIAL_FEN);

    if ($div) {
      const result = toDests(chess);
      chessgroundRef.current = Chessground($div, {
        movable: {
          free: false,
          dests: result.dests,
          showDests: true,
        },
        events: {
          move: () => {
            const playerFen =
              (chessgroundRef.current && chessgroundRef.current.getFen()) || "";
            const nextMoveIndex = state.context.currentMoveIndex + 1;
            const masterGameState = state.context.moves[nextMoveIndex];
            const masterFen = masterGameState.fen || "";
            send("MOVE", {
              masterFen,
              userFen: playerFen,
            });
          },
        },
      });
    }
  }, []);

  function handleBackToGameClick() {
    send("BACK");
  }

  function handleFinishClick() {
    send("FINISH");
  }

  console.log(state.context);

  return (
    <div className="p-6 font-mono">
      <pre className="block">Guess the move: {JSON.stringify(state.value, null, 2)}</pre>
      <pre className="block">{JSON.stringify(state.context.currentMoveIndex, null, 2)}</pre>

      {state.matches('loadingGame.error.none') && <p>Loading game</p>}

      {state.matches('loadingGame.error.gameDoesNotExist') && 
        <p>Game does not exist</p>
      }

      <div className="max-w-5xl flex my-6 flex-col sm:flex-row">
        <div
          className="flex-none w-full sm:w-1/2 mb-10 min-f-full"
          style={{
            width: 500,
            height: 500,
          }}
          ref={chessboardDivRef}
        ></div>

        {state.matches("results") && (
          <div className="sm:px-6">
            <div className="mb-6">
              <p className="text-xl flex items-center">
                Your move&apos;s evaluation is:
              </p>
              <span className="text-teal-400 text-sm">
                {state.context.userEval}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xl flex items-center">
                In the game, they played{" "}
                {state.context.moves[state.context.currentMoveIndex + 1]?.san}.
              </p>
              <span className="text-teal-400 text-sm">
                {state.context.masterEval}
              </span>
            </div>

            <button
              className="px-6 h-12 uppercase font-semibold tracking-wider border-2 border-black border-b-4 border-r-4 bg-teal-400 text-black shadow-xl enabled:hover:shadow-sm enabled:hover:border-b-2 enabled:hover:border-r-2 disabled:opacity-50"
              onClick={handleBackToGameClick}
            >
              Back to game
            </button>
          </div>
        )}

        {state.matches("ready") && (
          <div className="flex-auto sm:px-6">
            <p className="text-xl">Play the best move.</p>
          </div>
        )}

        {state.matches("loading") && (
          <div className="flex-auto sm:px-6">
            <p className="text-xl">Play the best move.</p>

            <div className="animate-pulse my-6 w-full sm:w-1/2">
              <p>⏳ Loading...</p>
            </div>
          </div>
        )}

        {state.matches("opponentIsPlaying") && (
          <div className="animate-pulse my-6 w-full sm:w-1/2 sm:px-6">
            <p>⏳ Playing opponent&apos;s move...</p>
          </div>
        )}

        {state.matches("completed") && (
          <div className="sm:px-6">
          <button
            className="px-6 h-12 uppercase font-semibold tracking-wider border-2 border-black border-b-4 border-r-4 bg-teal-400 text-black shadow-xl enabled:hover:shadow-sm enabled:hover:border-b-2 enabled:hover:border-r-2 disabled:opacity-50"
            onClick={handleFinishClick}
          >
            Finish
          </button>
          </div>
        )}
      </div>
    </div>
  );
}

const shouldUseMsw = process.env.NODE_ENV === 'development';
export default shouldUseMsw ? WaitForMsw(Guess) : Guess;