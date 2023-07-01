import { rest } from 'msw'

const DELAY = process.env.NODE_ENV === 'test' ? 0 : 1500;

export const handlers = [
  rest.post('/api/game', async (req, res, ctx) => {
    const body = await req.json();
    if (body.pgn === '1. e4') {
      return res(
        ctx.status(200),
        ctx.json({
          ok: false
        })
      )
    }

    return res(
      ctx.delay(DELAY),
      ctx.status(200),
      ctx.json({
        ok: true,
        gameId: '42'
      })
    )
  }),
  rest.post('/api/evaluate', (req, res, ctx) => {
    const masterEval = parseInt((Math.random() * 100)) / 10;
    const userEval = parseInt((Math.random() * 100)) / 10;

    return res(
      ctx.delay(DELAY),
      ctx.status(200),
      ctx.json({
        ok: true,
        masterEval,
        userEval
      })
    )
  })
]