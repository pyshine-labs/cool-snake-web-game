"""
API routes for Snake game.
"""
from flask import Blueprint, request, jsonify
from models.game import game_manager, Direction, GameStatus

api_bp = Blueprint('api', __name__)

@api_bp.route('/game/state', methods=['GET'])
def get_game_state():
    """Return the current game state."""
    state = game_manager.get_state()
    return jsonify({
        'success': True,
        'state': state.to_dict()
    })

@api_bp.route('/game/start', methods=['POST'])
def start_game():
    """Start a new game."""
    game_manager.start()
    return jsonify({
        'success': True,
        'message': 'Game started',
        'state': game_manager.get_state().to_dict()
    })

@api_bp.route('/game/move', methods=['POST'])
def move():
    """Change snake direction."""
    data = request.get_json()
    direction = data.get('direction') if data else None
    if not direction:
        return jsonify({
            'success': False,
            'error': 'Missing direction'
        }), 400
    success = game_manager.move(direction)
    if not success:
        return jsonify({
            'success': False,
            'error': 'Invalid direction or game not running'
        }), 400
    return jsonify({
        'success': True,
        'message': 'Direction updated'
    })

@api_bp.route('/game/pause', methods=['POST'])
def pause_game():
    """Pause or resume the game."""
    game_manager.pause()
    status = game_manager.get_state().status
    action = 'paused' if status == GameStatus.PAUSED else 'resumed'
    return jsonify({
        'success': True,
        'message': f'Game {action}',
        'state': game_manager.get_state().to_dict()
    })

@api_bp.route('/game/reset', methods=['POST'])
def reset_game():
    """Reset the game."""
    game_manager.reset()
    return jsonify({
        'success': True,
        'message': 'Game reset',
        'state': game_manager.get_state().to_dict()
    })

@api_bp.route('/score', methods=['GET'])
def get_scores():
    """Retrieve high scores (placeholder)."""
    # TODO: implement persistent high scores
    return jsonify({
        'success': True,
        'scores': [
            {'player': 'Player1', 'score': 150, 'date': '2026-01-01'},
            {'player': 'Player2', 'score': 120, 'date': '2026-01-02'},
            {'player': 'Player3', 'score': 100, 'date': '2026-01-03'},
        ]
    })