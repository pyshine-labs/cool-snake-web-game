"""
In-memory game state model for Snake.
"""
import random
from enum import Enum
from dataclasses import dataclass, asdict
from typing import List, Tuple, Optional

class Direction(Enum):
    UP = 'up'
    DOWN = 'down'
    LEFT = 'left'
    RIGHT = 'right'

class GameStatus(Enum):
    READY = 'ready'
    RUNNING = 'running'
    PAUSED = 'paused'
    GAME_OVER = 'game_over'

@dataclass
class Position:
    x: int
    y: int

@dataclass
class GameState:
    """Represents the current state of a Snake game."""
    width: int = 20
    height: int = 20
    snake: List[Position] = None
    food: Position = None
    direction: Direction = Direction.RIGHT
    next_direction: Direction = Direction.RIGHT
    score: int = 0
    high_score: int = 0
    level: int = 1
    status: GameStatus = GameStatus.READY
    speed: int = 200  # ms per move
    wall_wrap: bool = False

    def __post_init__(self):
        if self.snake is None:
            self.snake = [Position(self.width // 2, self.height // 2)]
        if self.food is None:
            self.spawn_food()

    def spawn_food(self):
        """Place food at a random cell not occupied by the snake."""
        occupied = {(p.x, p.y) for p in self.snake}
        while True:
            x = random.randint(0, self.width - 1)
            y = random.randint(0, self.height - 1)
            if (x, y) not in occupied:
                self.food = Position(x, y)
                break

    def to_dict(self):
        data = asdict(self)
        data['direction'] = self.direction.value
        data['next_direction'] = self.next_direction.value
        data['status'] = self.status.value
        data['snake'] = [{'x': p.x, 'y': p.y} for p in self.snake]
        data['food'] = {'x': self.food.x, 'y': self.food.y}
        return data

class GameManager:
    """Singleton managing the current game state."""
    _instance = None
    _state: Optional[GameState] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def new_game(self, width=20, height=20):
        """Start a new game."""
        self._state = GameState(width=width, height=height)
        self._state.status = GameStatus.READY
        return self._state

    def start(self):
        """Start the game (transition from READY to RUNNING)."""
        if self._state is None:
            self.new_game()
        self._state.status = GameStatus.RUNNING
        return self._state

    def move(self, direction: str):
        """Update the snake's direction (if valid)."""
        if self._state is None or self._state.status != GameStatus.RUNNING:
            return False
        try:
            new_dir = Direction(direction.lower())
        except ValueError:
            return False
        # Prevent 180-degree turns
        opposite = {
            Direction.UP: Direction.DOWN,
            Direction.DOWN: Direction.UP,
            Direction.LEFT: Direction.RIGHT,
            Direction.RIGHT: Direction.LEFT,
        }
        if new_dir != opposite.get(self._state.direction):
            self._state.next_direction = new_dir
        return True

    def pause(self):
        """Toggle pause."""
        if self._state is None:
            return
        if self._state.status == GameStatus.RUNNING:
            self._state.status = GameStatus.PAUSED
        elif self._state.status == GameStatus.PAUSED:
            self._state.status = GameStatus.RUNNING

    def reset(self):
        """Reset game to initial state."""
        if self._state:
            self._state.score = 0
            self._state.level = 1
            self._state.speed = 200
            self._state.wall_wrap = False
            self._state.snake = [Position(self._state.width // 2, self._state.height // 2)]
            self._state.direction = Direction.RIGHT
            self._state.next_direction = Direction.RIGHT
            self._state.status = GameStatus.READY
            self._state.spawn_food()

    def get_state(self):
        """Return current game state."""
        if self._state is None:
            self.new_game()
        return self._state

    def update(self):
        """Advance game by one tick (to be called by game loop). Not used in API directly."""
        # Placeholder for actual game logic
        pass

# Global instance
game_manager = GameManager()