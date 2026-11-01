# WordBridge

WordBridge is a word-ladder puzzle game and DSA learning project. Transform a
start word into a goal word by changing exactly one letter at a time. Every
intermediate word must be in the dictionary.

The project contains two implementations:

- **Browser game** — the interactive version with campaign levels, Daily
  Challenge, personal stats, achievements, themes, accessibility settings,
  keyboard input, hints, and a visual BFS solver/replayer.
- **C console game** — a standalone terminal implementation demonstrating the
  core data structures and algorithms. It has its own menus and progress; it
  does not share browser saves.





### Requirements

- Node.js
- A modern web browser

The browser game has no npm dependencies. From the project folder, run:

```powershell
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The server
serves the files in `gui/`. Stop it with **Ctrl+C**.

On Windows, you can also double-click `run.bat` from this folder. It starts
the local server and opens the game in your browser.

Alternatively, open `gui/index.html` directly. Running through the local
server is recommended for a consistent browser experience.

## How to play

1. Select a letter tile (or use the left/right arrow keys).
2. Change that letter using your keyboard or the on-screen keyboard.
3. Press **Enter** to submit the word.
4. Keep making valid one-letter changes until you reach the goal.

Invalid words, words with multiple changed letters, and words not in the
dictionary are rejected. Use **Hint** for the next optimal move, **Undo** and
**Redo** to explore alternatives, or **Auto-Solve & Replay** to inspect the
shortest solution. Reusing a word already in your current ladder is allowed,
but the game warns you about the cycle.

### How the solver works

The dictionary is loaded by the browser from `gui/dictionary-data.js`. The
solver treats each word as a graph vertex and connects words that differ by
one letter. It generates candidate neighbors as needed and runs
breadth-first search (BFS) to find a shortest path. The game validates each
player move against the same dictionary and one-letter rule; the solution
path is displayed in a step-by-step replay. The BFS exploration panel also
shows visit order and distance from the starting word, loading up to 200
entries at a time.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `A`–`Z` | Change the selected letter |
| `Enter` | Submit the current word |
| `Backspace` | Revert the selected draft letter |
| `←` / `→` | Select a letter tile |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` or `Ctrl+Shift+Z` | Redo |
| `Esc` | Close the open dialog |

Letter tiles can also be focused and navigated with the arrow keys. Dialogs
keep keyboard focus inside them while open and return focus to the control that
opened them when closed.

## Game modes and saved progress

- **Campaign / Levels:** 53 curated puzzles. Level 1 is available first; solve
  a level to unlock the next. Completed levels can be replayed.
- **Daily:** The daily puzzle is selected from the curated set using the
  current local date, so it remains the same for that date. Completing it
  updates the Daily completion indicator and streak.
- **Stats:** Attempts and wins are shared across the browser game modes.
  Completed puzzles contribute to the completed count, average moves, best
  time, and win rate. An attempt begins when a new puzzle is started, not when
  the page initially loads.
- **Achievements:** Unlock badges for your first win, an optimal solve, a
  five-day Daily streak, and campaign milestones. Achievement progress is
  saved separately from Stats, so resetting Stats does not remove badges.
- **Challenges, Random, and Custom:** Additional ways to play; successful
  completions also count toward Stats, but do not unlock campaign levels or
  advance the Daily streak.

Use **Accessibility settings** to turn game sounds off, reduce motion, or enable
high contrast. These preferences, campaign progress, Daily streaks, Stats, and
Achievements are stored separately in this browser's `localStorage`. They are
not synced between browsers or devices. Clearing site data removes these saves.

## DSA concepts

| Concept | Use in the game |
| --- | --- |
| Sorted dynamic array and binary search | Store and validate dictionary words |
| Quicksort | Sort dictionary words in the C implementation |
| FIFO queue and breadth-first search (BFS) | Find a shortest word ladder |
| Hamming distance | Check that a move changes exactly one letter |
| Two stacks | Track undo and redo history |
| Doubly linked list | Navigate the solver's path forward and backward |

The browser implementation is in `gui/dsa-engine.js`; its interface and
gameplay controller are in `gui/index.html`, `gui/style.css`, and `gui/app.js`.
The standalone C implementation and its own documentation are in
[`dsa-WordBridge/`](dsa-WordBridge/). Its terminal game has separate saves
(none are shared with the browser game) and provides its own play, solver,
benchmark, and DSA overview menu options.

## Run the C console version

### Requirements

- A C99 compiler such as GCC or Clang
- GNU Make (optional if compiling with the command below)

From the main project folder:

```powershell
cd dsa-WordBridge
mingw32-make
.\wordbridge.exe
```

If Make is unavailable, compile with GCC directly from the main project folder:

```powershell
gcc -std=c99 -Wall -Wextra -O2 -Iinclude dsa-WordBridge/src/main.c dsa-WordBridge/src/dictionary.c dsa-WordBridge/src/solver.c dsa-WordBridge/src/game.c dsa-WordBridge/src/display.c -o dsa-WordBridge/wordbridge.exe
cd dsa-WordBridge
.\wordbridge.exe
```

The C program loads its dictionary from `data/dictionary.txt`, with
`data/sample_words.txt` as a fallback. Both files are included in the C project
folder.

## Run tests

The browser DSA engine tests use Node.js built-ins and need no npm packages:

```powershell
node --test tests/dsa-engine.test.cjs
```

The C core tests cover BFS paths, queue order, and game undo/redo. From the
project folder, run:

```powershell
cd dsa-WordBridge
mingw32-make test
```

On systems where GNU Make is available as `make`, use `make test`.

## Project structure

```text
dsa-WordBridge/
├── README.md
├── run.bat                 # Start the browser game on Windows
├── server.js               # Zero-dependency local web server
├── gui/                    # Browser game and JavaScript DSA engine
├── tests/                  # Node.js DSA engine tests
├── screenshots/            # README screenshots
├── include/                # C headers
└── dsa-WordBridge/          # C sources, dictionary data, and Makefile
    ├── data/
    └── src/
```
