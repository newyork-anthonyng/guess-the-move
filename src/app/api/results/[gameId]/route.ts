import { NextResponse } from 'next/server'

const API_URL = `${process.env.CHESS_EVAL_BACKEND_BASE_URL}/report_card`;
export async function GET(_: any, context: { params: { gameId: string } }) {
  const gameId = context.params.gameId;
  
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ game_id: gameId })
  });

  const data = await res.json();

  if (data.pgn) {
    return NextResponse.json({
      ok: true,
      blunders: data.blunders,
      mistakes: data.mistakes,
      inaccuracies: data.inaccuracies,
      centipawnLoss: data.avg_difference
    })
  }

  return NextResponse.json({ ok: false })
}