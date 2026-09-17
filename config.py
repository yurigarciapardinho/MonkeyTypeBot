from dataclasses import dataclass, field

@dataclass
class BotConfig:
    time_limit: int = 6000
    time_interval: float = 0.05
    time_err: float = 0.02
    typos_rate: float = 0.05
    time_control: int = 30
    
    error_words: list[str] = field(default_factory=lambda: [
        'during', 'point', 'place', 'from', 'problem', 
        'which', 'world', 'begin', 'face', 'go'
    ])