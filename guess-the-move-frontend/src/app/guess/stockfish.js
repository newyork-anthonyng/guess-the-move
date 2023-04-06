class Stockfish {
  constructor(config) {
    this.stockfish = new Worker('/stockfish.js');
    this.depth = config.depth || 15;

    this.stockfish.addEventListener('message', (e) => {
      // console.log(e.data);
      // config.onEvaluation(15);
      if (e.data.startsWith(`info depth ${this.depth}`)) {
        
        // get eval
        const match = e.data.match(/^info .*\bscore (\w+) (-?\d+)/)
        const gameTurnMatch = this.fen.match(/[\S+] (b|w)/);
        const gameTurn = gameTurnMatch && gameTurnMatch[1];
        const score = parseInt(match[2]) * (gameTurn == 'w' ? 1 : -1);
        if(match[1] == 'cp') {
          config.onEvaluation((score / 100.0).toFixed(2));
            // engineStatus.score = (score / 100.0).toFixed(2);
        /// Did it find a mate?
        } else if(match[1] == 'mate') {
            // engineStatus.score = 'Mate in ' + Math.abs(score);
            config.onEvaluation(`Mate in ${Math.abs(score)}`);
        }
      } else {
        console.log(e.data);
      }
    });

    this.stockfish.postMessage('uci');
  }

  evaluate(fen) {
    this.stockfish.postMessage('ucinewgame');
    this.stockfish.postMessage(`position fen ${fen}`);
    this.stockfish.postMessage(`go depth ${this.depth}`);
    this.fen = fen;
  }
}

export default Stockfish;