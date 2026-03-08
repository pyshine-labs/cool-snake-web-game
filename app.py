"""
Flask backend for Snake Game.
Serves the frontend and provides API for game state.
"""
import os
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from config import config

def create_app(config_name='default'):
    """Application factory."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Enable CORS
    CORS(app)

    # Register blueprints
    from api.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def index():
        """Serve the main game page."""
        return render_template('index.html')

    @app.route('/health')
    def health():
        """Health check endpoint."""
        return jsonify({'status': 'ok', 'message': 'Snake game backend is running'})

    return app

if __name__ == '__main__':
    app = create_app(os.environ.get('FLASK_ENV', 'default'))
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])