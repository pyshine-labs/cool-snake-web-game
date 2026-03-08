# Snake Game - Flask Backend

A classic Snake game with a modern web stack: Flask backend, JavaScript frontend, and responsive design.

## Features

- **Full game engine** with snake movement, food generation, collision detection
- **Sound effects** using Howler.js (eat, crash, background music)
- **Responsive UI** built with Bootstrap 5
- **RESTful API** for game state management
- **Cross‑platform** – runs in any modern browser with enhanced compatibility for Windows, macOS, Linux, and mobile devices.
- **Deployment ready** with Docker, Heroku, and traditional hosting options

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd snake-game
```

### 2. Set up Python environment

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure environment

Copy the example environment file and adjust if needed:

```bash
cp .env.example .env
```

### 4. Run the Flask development server

```bash
python app.py
```

Open your browser at [http://localhost:5000](http://localhost:5000) and start playing!

## Cross‑Platform Compatibility

This game is designed to run seamlessly on **Windows**, **macOS**, and **Linux** (Ubuntu/Debian) and supports all modern browsers (Chrome, Firefox, Safari, Edge).

### Key improvements for cross‑platform support:

- **Path handling**: All Python file paths use `pathlib` for OS‑agnostic concatenation.
- **Audio compatibility**: Sound effects are provided in both MP3 and OGG formats with Howler.js fallback to Web Audio API.
- **Touch‑friendly UI**: Responsive buttons, swipe‑gesture detection, and prevention of accidental zoom.
- **Browser polyfills**: Automatic fallbacks for missing Web APIs (`requestAnimationFrame`, `performance.now`, `localStorage`).
- **Keyboard layouts**: Arrow keys plus WASD keys for international keyboard support.
- **Docker multi‑architecture**: The `python:3.9‑slim` base image works on AMD64 and ARM64.
- **CSS vendor prefixes**: Added `-webkit‑`, `-moz‑` prefixes for animations and transforms.

### Mobile & Touch Support
- Direction buttons are enlarged on small screens.
- Swipe gestures on the game canvas change snake direction.
- `touch‑action: manipulation` prevents double‑tap zoom.

### Browser Requirements
- Chrome 58+, Firefox 54+, Safari 12+, Edge 16+
- JavaScript ES2017 support
- Web Audio API (or fallback to silent mode)

## Project Structure

```
snake‑game/
├── app.py                    # Main Flask application
├── config.py                 # Configuration (environment variables)
├── requirements.txt          # Python dependencies
├── .env.example              # Template for environment variables
├── .gitignore
├── README.md
├── Dockerfile                # Container definition
├── docker‑compose.yml        # Multi‑service setup (optional)
├── Procfile                  # Heroku deployment
├── runtime.txt               # Python version for PaaS
├── static/                   # Front‑end assets
│   ├── css/style.css
│   ├── js/                   # Modular JavaScript (game, sound, UI, utils, main)
│   ├── assets/               # Images, sounds, fonts
│   └── lib/                  # Third‑party libraries (optional)
├── templates/                # Flask HTML templates
│   └── index.html
├── api/                      # API Blueprint
│   ├── __init__.py
│   └── routes.py
├── models/                   # Data models
│   ├── __init__.py
│   ├── game.py               # In‑memory game state
│   └── score.py              # High‑score model (optional)
├── utils/                    # Python utilities
│   ├── __init__.py
│   └── game_utils.py
└── tests/                    # Test suites
    ├── test_app.py
    ├── test_game.py
    └── frontend/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Serve the main game page |
| GET    | `/health` | Health check |
| GET    | `/api/game/state` | Retrieve current game state |
| POST   | `/api/game/start` | Start a new game |
| POST   | `/api/game/move` | Change snake direction |
| POST   | `/api/game/pause` | Pause/resume the game |
| POST   | `/api/game/reset` | Reset game |
| GET    | `/api/score` | Get high scores (placeholder) |

## Development

- **Frontend changes**: Edit files in `static/js/` and `static/css/`. The browser will auto‑refresh on file changes if you use Flask's debug mode.
- **Backend changes**: Modify `app.py`, `api/routes.py`, or `models/game.py`. Restart the Flask server to apply.

## Deployment

### Docker

```bash
docker build -t snake-game .
docker run -p 5000:5000 snake-game
```

The Dockerfile uses the multi‑architecture `python:3.9‑slim` base image, ensuring compatibility with both AMD64 and ARM64 systems (including Apple Silicon Macs).

### Docker Compose

```bash
docker-compose up
```

### Heroku

```bash
heroku create
git push heroku main
```

### Traditional hosting

Use Waitress (Windows) or Gunicorn (Linux) behind a reverse proxy (Nginx/Apache).

## License

MIT

## Acknowledgments

- Inspired by the classic Nokia Snake game.
- Built with [Flask](https://flask.palletsprojects.com/), [Bootstrap](https://getbootstrap.com/), and [Howler.js](https://howlerjs.com/).