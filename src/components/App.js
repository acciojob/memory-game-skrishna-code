
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  RotateCcw,
  Trophy,
  Timer,
  MousePointerClick,
  Sparkles
} from "lucide-react";
import "./App.css";

const LEVELS = {
  easy: {
    label: "Easy",
    pairs: 4,
    tiles: 8,
    description: "A quick warm-up"
  },
  normal: {
    label: "Normal",
    pairs: 8,
    tiles: 16,
    description: "A little more challenge"
  },
  hard: {
    label: "Hard",
    pairs: 16,
    tiles: 32,
    description: "Test your memory"
  }
};

function shuffledNumbers(pairCount) {
  const numbers = Array.from(
    { length: pairCount },
    (_, index) => index + 1
  );

  const deck = [...numbers, ...numbers];

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck.map((value, index) => ({
    id: `${value}-${index}`,
    value,
    matched: false
  }));
}

function App() {
  const [level, setLevel] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [locked, setLocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [bestScores, setBestScores] = useState({});

  const mismatchTimer = useRef(null);
  const startTime = useRef(null);

  const config = level ? LEVELS[level] : null;
  const complete = Boolean(config && matches === config.pairs);

  const accuracy =
    attempts === 0
      ? 100
      : Math.round((matches / attempts) * 100);

  const clearMismatchTimer = useCallback(() => {
    if (mismatchTimer.current) {
      clearTimeout(mismatchTimer.current);
      mismatchTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearMismatchTimer();
  }, [clearMismatchTimer]);

  useEffect(() => {
    if (!started || complete) return undefined;

    const timer = setInterval(() => {
      if (startTime.current !== null) {
        setElapsed(
          Math.floor((Date.now() - startTime.current) / 1000)
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [started, complete]);

  useEffect(() => {
    if (!complete || !level) return;

    setBestScores((current) => {
      const previous = current[level];

      if (previous === undefined || attempts < previous) {
        return { ...current, [level]: attempts };
      }

      return current;
    });
  }, [complete, level, attempts]);

  const startGame = (nextLevel) => {
    clearMismatchTimer();

    setLevel(nextLevel);
    setTiles(shuffledNumbers(LEVELS[nextLevel].pairs));
    setFlipped([]);
    setAttempts(0);
    setMatches(0);
    setLocked(false);
    setElapsed(0);
    setStarted(false);

    startTime.current = null;
  };

  const resetGame = () => {
    if (level) startGame(level);
  };

  const chooseTile = (tile) => {
    if (
      !level ||
      locked ||
      tile.matched ||
      flipped.includes(tile.id) ||
      complete
    ) {
      return;
    }

    if (!started) {
      setStarted(true);
      startTime.current = Date.now();
    }

    const nextFlipped = [...flipped, tile.id];
    setFlipped(nextFlipped);

    if (nextFlipped.length !== 2) return;

    setAttempts((count) => count + 1);

    const first = tiles.find(
      (item) => item.id === nextFlipped[0]
    );

    const second = tiles.find(
      (item) => item.id === nextFlipped[1]
    );

    if (first.value === second.value) {
      setTiles((current) =>
        current.map((item) =>
          nextFlipped.includes(item.id)
            ? { ...item, matched: true }
            : item
        )
      );

      setMatches((count) => count + 1);
      setFlipped([]);
    } else {
      setLocked(true);

      mismatchTimer.current = setTimeout(() => {
        setFlipped([]);
        setLocked(false);
        mismatchTimer.current = null;
      }, 850);
    }
  };

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(elapsed / 60)
      .toString()
      .padStart(2, "0");

    const seconds = (elapsed % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${seconds}`;
  }, [elapsed]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => {
            clearMismatchTimer();
            setLevel(null);
          }}
        >
          <span className="brand-mark">
            <Brain size={21} />
          </span>
          <span>
            mind<span className="brand-accent">match</span>
          </span>
        </button>

        <div className="topbar-note">
          <span className="status-dot" />
          Train your brain, one pair at a time
        </div>
      </header>

      {!level ? (
        <section className="landing">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={14} /> FOCUS. FLIP. MATCH.
            </div>

            <h1>
              A little game.
              <br />
              <span>A sharper mind.</span>
            </h1>

            <p className="hero-description">
              Find matching number pairs, challenge your memory,
              and finish in as few attempts as you can.
            </p>

            <div className="hero-benefits">
              <div>
                <span className="benefit-icon">
                  <MousePointerClick size={17} />
                </span>
                <span>Simple to play</span>
              </div>

              <div>
                <span className="benefit-icon">
                  <Trophy size={17} />
                </span>
                <span>Beat your best</span>
              </div>
            </div>
          </div>

          <section className="level-panel">
            <div className="panel-top">
              <div>
                <span className="panel-kicker">
                  READY WHEN YOU ARE
                </span>
                <h2>Choose your level</h2>
              </div>

              <span className="panel-brain">
                <Brain size={23} />
              </span>
            </div>

            <div className="levels_container">
              {Object.entries(LEVELS).map(([key, item], index) => (
                <label
                  className={`level-option level-${key}`}
                  key={key}
                  htmlFor={key}
                >
                  <input
                    id={key}
                    type="radio"
                    name="difficulty"
                    value={key}
                    checked={false}
                    onChange={() => startGame(key)}
                  />

                  <span className="level-symbol">
                    {["◈", "▦", "▤"][index]}
                  </span>

                  <span className="level-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                    <span className="level-meta">
                      {item.tiles} tiles <i /> {item.pairs} pairs
                    </span>
                  </span>

                  <span className="level-arrow">→</span>
                </label>
              ))}
            </div>

            <p className="panel-footnote">
              You can switch difficulty at any time.
            </p>
          </section>

          <div className="landing-footer">
            <span>MEMORY MATCH</span>
            <span>Made for curious minds</span>
          </div>
        </section>
      ) : (
        <section className="game-page">
          <div className="game-heading">
            <button
              className="text-button"
              type="button"
              onClick={() => {
                clearMismatchTimer();
                setLevel(null);
              }}
            >
              ← All levels
            </button>

            <div className="game-title-row">
              <div>
                <span className="eyebrow">
                  MEMORY MATCH / {config.label.toUpperCase()}
                </span>
                <h1>{config.label} mode</h1>
                <p>Find every matching pair of numbers.</p>
              </div>

              <button
                className="reset-button"
                type="button"
                onClick={resetGame}
              >
                <RotateCcw size={16} /> Restart
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon purple">
                <MousePointerClick size={17} />
              </span>
              <div>
                <small>Attempts</small>
                <strong>{attempts}</strong>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon green">
                <Trophy size={17} />
              </span>
              <div>
                <small>Pairs found</small>
                <strong>
                  {matches}
                  <em> / {config.pairs}</em>
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon orange">
                <Timer size={17} />
              </span>
              <div>
                <small>Time</small>
                <strong>{formattedTime}</strong>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon blue">
                <Sparkles size={17} />
              </span>
              <div>
                <small>Accuracy</small>
                <strong>{accuracy}%</strong>
              </div>
            </div>
          </div>

          <section className="board-panel">
            <div className="board-heading">
              <div>
                <h2>Find the pairs</h2>
                <p>Choose two tiles to reveal their numbers.</p>
              </div>

              <span className="board-counter">
                {matches} of {config.pairs} matched
              </span>
            </div>

            <div
              className={`cells_container grid-${level}`}
              aria-label={`${config.label} memory game board`}
            >
              {tiles.map((tile) => {
                const isFaceUp =
                  flipped.includes(tile.id) || tile.matched;

                return (
                  <button
                    type="button"
                    key={tile.id}
                    className={`memory-cell ${
                      isFaceUp ? "is-flipped" : ""
                    } ${tile.matched ? "is-matched" : ""}`}
                    onClick={() => chooseTile(tile)}
                    disabled={
                      tile.matched ||
                      locked ||
                      flipped.includes(tile.id) ||
                      complete
                    }
                    aria-label={
                      isFaceUp
                        ? `Tile ${tile.value}${
                            tile.matched ? ", matched" : ""
                          }`
                        : "Hidden tile"
                    }
                    aria-pressed={isFaceUp}
                  >
                    <span className="tile-back">+</span>
                    {isFaceUp && (
                      <span className="tile-number">{tile.value}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {complete ? (
              <div className="win-banner" role="status">
                <span className="win-icon">
                  <Trophy size={22} />
                </span>

                <div>
                  <strong>Brilliant! All pairs matched.</strong>
                  <p>
                    You finished in {attempts} attempts and {formattedTime}.
                  </p>
                </div>

                <button
                  type="button"
                  className="button-primary"
                  onClick={resetGame}
                >
                  Play again
                </button>
              </div>
            ) : (
              <div className="board-tip">
                <span className="tip-sparkle">✦</span>
                Tip: Remember where each number appears to reduce your attempts.
              </div>
            )}
          </section>

          <div className="game-bottom">
            <span>
              <span className="legend-dot matched-dot" />
              Matched pair
            </span>

            <span>
              <span className="legend-dot hidden-dot" />
              Hidden tile
            </span>

            <span className="best-score">
              <Trophy size={14} />
              Best{" "}
              {bestScores[level] === undefined
                ? "—"
                : `${bestScores[level]} attempts`}
            </span>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
