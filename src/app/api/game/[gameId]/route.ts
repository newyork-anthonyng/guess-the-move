import { NextResponse } from 'next/server'

const API_URL = `${process.env.CHESS_EVAL_BACKEND_BASE_URL}/page_refresh`;
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

  // TODO: figure what color the player chose
  if (data.fen) {
    return NextResponse.json({ ok: true, pgn: data.pgn })
  }

  return NextResponse.json({ ok: false })
}