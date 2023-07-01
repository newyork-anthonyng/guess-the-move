import { rest } from 'msw'

const DELAY = process.env.NODE_ENV === 'test' ? 0 : 1500;

const game = {
  '42': {
    pgn: `1.e4 e5 2.Qh5 Nc6 3.Bc4 g6 4.Qf3 Nd4 5.Qxf7# 1-0`
  }
};

export const handlers = [
  rest.get('/api/game/:gameId', (req, res, ctx) => {
    const { gameId } = req.params;
    const requestedGame = game[gameId];

    if (!requestedGame) {
      return res(
        ctx.delay(DELAY),
        ctx.status(200),
        ctx.json({
          ok: false
        })
      );
    }

    return res(
      ctx.delay(DELAY),
      ctx.status(200),
      ctx.json({
        ok: true,
        pgn: requestedGame.pgn
      })
    )
  }),
  rest.post('/api/game', async (req, res, ctx) => {
    const body = await req.json();
    if (body.pgn === '1. e4') {
      return res(
        ctx.delay(DELAY),
        ctx.status(200),
        ctx.json({
          ok: false
        })
      )
    }

    const GAME_ID = '42';
    game[GAME_ID] = {
      pgn: body.pgn
    };
    return res(
      ctx.delay(DELAY),
      ctx.status(200),
      ctx.json({
        ok: true,
        gameId: GAME_ID
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
  }),
  rest.get('/api/results/:gameId', (req, res, ctx) => {
    const { gameId } = req.params;

    return res(
      ctx.delay(DELAY),
      ctx.status(200),
      ctx.json({
        blunders: +gameId,
        mistakes: +gameId,
        inaccuracies: +gameId,
        centipawnLoss: +gameId
      })
    )
  })
]