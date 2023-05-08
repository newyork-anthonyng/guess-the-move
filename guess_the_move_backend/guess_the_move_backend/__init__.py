from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from stockfish import Stockfish

stockfish = Stockfish('C:/Users/vladi/Downloads/stockfish_15.1_win_x64_popcnt/stockfish-windows-2022-x86-64-modern')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SECRET_KEY'] = 'secret'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_TYPE'] = 'filesystem'
db = SQLAlchemy(app)

from guess_the_move_backend import routes