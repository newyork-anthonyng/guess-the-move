from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from stockfish import Stockfish
import io, chess.pgn

stockfish = Stockfish('C:/Users/vladi/Downloads/stockfish_15.1_win_x64_popcnt/stockfish-windows-2022-x86-64-modern')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SECRET_KEY'] = 'secret'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_TYPE'] = 'filesystem'
db = SQLAlchemy(app)

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pgn = db.Column(db.Text, nullable=False)
    color = db.Column(db.Boolean, nullable=False)
    fen = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"User '{self.id}'"

@app.route('/validate_pgn', methods=['POST'])
def validate_pgn():
    # Check if data is in JSON format
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400
    request_data = request.get_json()
    # Get values from the request
    text_pgn = request_data['pgn']
    text_color = request_data['color']
    if text_color == 'white':
        bool_color = 0
    else:
        bool_color = 1
    # Turn pgn to StringIO object (required by the library)
    pgn = io.StringIO(text_pgn)
    # Parse the game from a pgn string and create a root node.
    game = chess.pgn.read_game(pgn)
    # Check for errors in the pgn and return the name of the first error
    if game.errors:
        error1 = game.errors[0]
        return jsonify({"msg": str(error1)}), 400
    # Add pgn, color and starting fen to the DB 
    game_db = Game(pgn=text_pgn, color=bool_color, fen='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    db.session.add(game_db)
    db.session.commit()
    # Create a dict, add ID of the game to it and return as JSON.
    id_dict = {}
    id_dict['id'] = game_db.id
    return jsonify(id_dict)

@app.route('/evaluate_move', methods=['POST'])
def evaluate_move():
    # Get the values from the request
    request_data = request.get_json()
    game_id = request_data['game_id']
    user_move = request_data['user_move']
    # Query the DB to get a game with this ID
    game_db = Game.query.filter_by(id=game_id).first()
    # If that game doesn't exist, send an error message 
    if game_db == None:
        return jsonify({"msg": 'Game Not Found'}), 400
    # If that game has already finished, send an error response
    if game_db.fen == 'Game Finished':
        return jsonify({"msg": 'Game Finished'}), 400
    # Turn pgn to StringIO object (required by the library)
    pgn = io.StringIO(game_db.pgn)
    # Parse the game from a pgn string and create a root node.
    game = chess.pgn.read_game(pgn)
    # Create a board object
    board = game.board()
    # Set the board to the current fen position
    board.set_fen(game_db.fen)
    # Get the number of half-moves from the beginning of the game
    x = board.ply()
    # Reset the board to the start
    board.reset()
    i = 0
    # Move 1 step up the node tree (pgn) and make one move on the board 
    # (first move is done no matter what)
    node = game.next()
    board.push(node.move)
    if x == 0 and game_db.color == 1:
            # If the color is black, make one more step up the node tree and make one more move on the board.
            # (If playing for black this is done no matter what)
            node = node.next()
            board.push(node.move)
    # Go to the exact place on the node tree (determined by fen) if it's not the first move. 
    # Make moves accordingly.
    for i in range (x-1):
        node = node.next()
        board.push(node.move)
        i += 1
    # Set eval_user to None to check later on if the user evaluation was different.    
    eval_user = None
    # Set position for the Stockfish and get evaluation of the pro.
    stockfish.set_fen_position(board.fen())
    eval_pro = stockfish.get_evaluation()
    difference = 0
    # If player's move is different, evaluate it.
    if user_move != node.move.uci():
        # Move one node back and create a variation.
        node = node.parent
        node = node.add_variation(chess.Move.from_uci(user_move))
        # Create a pgn string with a variation.
        exporter = chess.pgn.StringExporter(headers=True, variations=True, comments=True)
        pgn_string = game.accept(exporter)
        # Update pgn in the database to include a new variation
        game_db.pgn = pgn_string
        db.session.commit()
        # Undo the last move on the board (pro) and make a move with the variation (user)
        board.pop()
        board.push(chess.Move.from_uci(user_move))
        # Set the postion for the Stockfish with the user move and evaluate it.
        stockfish.set_fen_position(board.fen())
        eval_user = stockfish.get_evaluation()
        # Calculate the difference between the pro move and the user move
        difference = eval_pro['value'] - eval_user['value']
        # If the color is black, change - to + and the other way around.
        # So that when the difference is positive it means the pro's move is better and vice versa. 
        if game_db.color == 1:
            difference = - difference
    # Move 1 node back on the pgn tree and undo 1 move on the board (in case there was a variation) 
    node = node.parent
    board.pop()
    # Move 3 steps forward and make 3 half-moves on the board
    i = 0
    game_end = False
    for i in range (3):
        node = node.next()
        # If that was the last move of this side, set game_end variable to True and stop the loop
        if node == None:
            game_end = True
            break
        board.push(node.move)
        i += 1
    # Check if the game has ended
    if game_end:
        # If the game has ended, store "Game Finished" instead of the fen
        game_db.fen = 'Game Finished'
    else:
        # Otherwise get the fen required for the next move and add it to the DB.   
        game_db.fen = board.fen()
    db.session.commit()
    # Create evaluation dictionary, turn it to JSON and send it back.
    eval_dict = {}
    eval_dict['pgn'] = game_db.pgn
    eval_dict['eval_user'] = eval_user
    eval_dict['eval_pro'] = eval_pro
    eval_dict['game_end'] = game_end
    eval_dict['difference'] = difference
    return jsonify(eval_dict)

@app.route('/report_card', methods=['POST'])
def report_card():
    # Remove all the new line charcters from the pgn string
    # pgn_string = pgn_string.replace("\n", "")
    report_dict = {}
    report_dict['ok'] = True
    report_dict['data'] = {}
    report_dict['data']['inaccuracies'] = 3
    report_dict['data']['mistakes'] = 4
    report_dict['data']['blunders'] = 1
    report_dict['data']['avgCentipawnLoss'] = 38
    return jsonify(report_dict)

if __name__ == '__main__':
    app.run(debug=True)