import { Config } from 'chessground/config';
import { uciToMove } from 'chessground/util';
import { makeUci } from 'chessops';
import { makeFen } from 'chessops/fen';
import { parsePgn, startingPosition, transform } from 'chessops/pgn';
import { parseSan, makeSanAndPlay } from 'chessops/san';
import { scalachessCharPair } from 'chessops/compat';

const initialSquares = [
  "a8",
  "b8",
  "c8",
  "d8",
  "e8",
  "f8",
  "g8",
  "h8",
  "a7",
  "b7",
  "c7",
  "d7",
  "e7",
  "f7",
  "g7",
  "h7",
  "a6",
  "b6",
  "c6",
  "d6",
  "e6",
  "f6",
  "g6",
  "h6",
  "a5",
  "b5",
  "c5",
  "d5",
  "e5",
  "f5",
  "g5",
  "h5",
  "a4",
  "b4",
  "c4",
  "d4",
  "e4",
  "f4",
  "g4",
  "h4",
  "a3",
  "b3",
  "c3",
  "d3",
  "e3",
  "f3",
  "g3",
  "h3",
  "a2",
  "b2",
  "c2",
  "d2",
  "e2",
  "f2",
  "g2",
  "h2",
  "a1",
  "b1",
  "c1",
  "d1",
  "e1",
  "f1",
  "g1",
  "h1"
]

interface CustomChessConfig extends Config {
  san: string
}

function getMovesFromPgn(pgn: string): CustomChessConfig[]  {
  const game = parsePgn(pgn)[0];
  const pos = startingPosition(game.headers).unwrap();

  const initialFen = makeFen(pos.toSetup());
  const initialPosition = {
    fen: initialFen,
    turnColor: 'white',
    lastMove: [],
    san: ''
  };

  game.moves = transform(game.moves, pos, (pos, node) => {
    const move = parseSan(pos, node.san);

    if (!move) {
      return;
    }

    const moveId = scalachessCharPair(move);
    const san = makeSanAndPlay(pos, move);
    const fen = makeFen(pos.toSetup());
    const turnColor = pos.turn;
    const uci = makeUci(move);
    const lastMove = uciToMove(uci);

    return {
      ...node,
      comments: node.comments || ['This is a test'],
      fen,
      turnColor,
      moveId,
      san,
      uci,
      lastMove
    };
  });

  const movesArray = Array.from(game.moves.mainline());
  movesArray.unshift(initialPosition);
  return movesArray as CustomChessConfig[];
}

export {
  initialSquares,
  getMovesFromPgn,
};

export type { CustomChessConfig };