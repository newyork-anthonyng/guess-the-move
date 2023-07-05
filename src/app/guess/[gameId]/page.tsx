'use client';

import { useEffect, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { useRouter } from "next/navigation";
import evaluateMachine from './machine';
import { Chess, Square } from 'chess.js';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

import { Color, initialSquares } from './utils';

if (typeof process.env.NEXT_PUBLIC_USE_MSW !== 'undefined') {
  require('../../../mocks/index')
}

const INITIAL_FEN = `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`;

interface ChessMove {
  to: string
};

function toDests(chess: Chess) {
  const destinations = new Map();
  
  initialSquares.forEach(s => {
    const square = s as Square;
    const ms = chess.moves({ square, verbose: true });
    if (ms.length) destinations.set(s, ms.map((m: ChessMove) => m.to));
  });

  const color = chess.turn() === 'w' ? 'white' : 'black';

  return {
    color,
    dests: destinations,
    free: false
  }
}

export default function Guess({ params }: { params: { gameId: string }}) {
  const router = useRouter();
  const chessboardDivRef = useRef<HTMLDivElement>(null);
  const chessgroundRef = useRef<Api>();
  const [state, send] = useMachine(evaluateMachine, {
    context: {
      gameId: params.gameId,
    },
    actions: {
      updateChessboard: (context) => {
        if (chessgroundRef.current) {
          const currentMove = context.moves[context.currentMoveIndex];

          if (!currentMove) return;

          const result = toDests(new Chess(currentMove.fen));
          const newConfig = {
            ...currentMove,
            movable: {
              free: false,
              dests: result.dests,
              showDests: true
            }
          };
          chessgroundRef.current.set(newConfig);
        }
      },
      goToResults: (context) => {
        router.push(`/results/${context.gameId}`);
      }
    }
  });

  useEffect(() => {
    const $div = chessboardDivRef.current;
    const chess = new Chess(INITIAL_FEN);
    const isSettingUpBoard = ['settingUpBoard'].some(state.matches);

    if ($div && isSettingUpBoard) {
      const result = toDests(chess);
      chessgroundRef.current = Chessground($div, {
        orientation: (state.context.color as Config["orientation"]),
        movable: {
          free: false,
          dests: result.dests,
          showDests: true
        },
        events: {
          move: (orig, dest) => {
            send("MOVE", {
              data: {
                uci: `${orig}${dest}`
              }
            });
          }
        }
      });
      send({ type: 'SETTING_UP_BOARD.DONE' });
    }
  }, [state.context.moves, state.value]);

  function handleBackToGameClick() {
    send('BACK');
  }

  return (
    <div className="p-6 font-mono">
      <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-0 before:-left-60 before:-right-6">
        <h1 className="flex-none font-semibold mb-2 relative text-2xl text-white w-full">Guess the move</h1>
      </div>
      {/* <pre>{JSON.stringify(state.value, null, 2)}</pre> */}

      <div className="max-w-5xl flex my-6 flex-col sm:flex-row">
        <div
          className="flex-none w-full sm:w-1/2 mb-10 min-f-full"
          style={{
            width: 500,
            height: 500
          }}
          ref={chessboardDivRef}
        >
        </div>

        {
          state.matches('loadingGame') && (
            <div className='sm:px-6'>
              <div className="mb-6">
                <p className="text-xl flex items-center">
                  Loading game...
                </p>
              </div>
            </div>
          )
        }

        {
          state.matches('error.gameDoesNotExist') && (
            <div className='sm:px-6'>
              <div className="mb-6">
                <p className="text-xl flex items-center">
                  Error: could not find game
                </p>
              </div>
            </div>
          )
        }

        {
          state.matches('results') && (
            <div className="sm:px-6">
              <div className="mb-6">
                <p className="text-xl flex items-center">
                  Your move&apos;s evaluation is:
                </p>
                <span className="text-teal-400 text-sm">{state.context.userEval}</span>
              </div>

              <div className="mb-6">
                <p className="text-xl flex items-center">
                  In the game, they played {state.context.moves[state.context.currentMoveIndex + 1]?.san}.
                </p>
                <span className="text-teal-400 text-sm">{state.context.masterEval}</span>
              </div>

              <button
                className="px-6 h-12 uppercase font-semibold tracking-wider border-2 border-black border-b-4 border-r-4 bg-teal-400 text-black shadow-xl enabled:hover:shadow-sm enabled:hover:border-b-2 enabled:hover:border-r-2 disabled:opacity-50"
                onClick={handleBackToGameClick}
              >Back to game</button>
            </div>
          )
        }

        {state.matches('ready') && (
          <div className="flex-auto sm:px-6">
            <p className="text-xl">Play the best move.</p>
          </div>
        )}

        {state.matches('loading') && (
          <div className="flex-auto sm:px-6">
            <p className="text-xl">Play the best move.</p>
            <div className="animate-pulse my-6 w-full sm:w-1/2">
              <p>⏳ Loading...</p>
            </div>
          </div>
        )}

        {state.matches('opponentIsPlaying') && (
          <div className="flex-auto sm:px-6">
            <div className="animate-pulse my-6 w-full sm:w-1/2">
              <p>⏳ Playing opponent&apos;s move...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}