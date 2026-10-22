# WordBridge — Word Ladder Puzzle Game with Auto-Solver
**Subject:** Data Structures & Algorithms (DSA) — Project-Based Learning (PBL)  
**Language:** Pure C (C99 standard, zero external libraries)  
**Academic Level:** 2nd Year B.Tech  

---

## 📌 Project Overview
WordBridge transforms the classic shortest-path word ladder problem into an interactive, visual console game and algorithmic engine. Players transform a start word into a target word one letter at a time through valid dictionary words, backed by an auto-solver that computes and replays the optimal shortest path.

Everything is implemented **from scratch** using core data structures—no C++ STL, no third-party game frameworks, and zero external dependencies.

---

## 🧱 Module & Data Structure Architecture

```text
wordBridge/
├── Makefile                     # Compilation and build configuration
├── README.md                    # Project documentation & Viva guide
├── data/
│   ├── dictionary.txt           # Master dictionary (33,756 words, 3 to 6 letters)
│   └── sample_words.txt         # Quick-testing curated subset
├── include/
│   ├── common.h                 # ANSI styling, color codes, common utilities
│   ├── dictionary.h             # Module 1: Sorted Array & Binary Search
│   ├── solver.h                 # Module 2: BFS Auto-Solver & Queue
│   ├── game.h                   # Module 3: Manual Play State & Undo Stack
│   └── display.h                # Module 4: Doubly Linked List & Terminal UI
└── src/
    ├── main.c                   # Entry point, menu loop, and module integration
    ├── dictionary.c             # Dynamic array, QuickSort, and O(log N) Binary Search
    ├── solver.c                 # FIFO Queue, BFS traversal, and parent tracking
    ├── game.c                   # LIFO Stack for undo/redo and move validation
    └── display.c                # Doubly Linked List, Wordle-style boxes, and Replay
```

---

## 👥 Team Member Roles & DSA Ownership

| Member | Module | Data Structure / Algorithm | Key Functionality |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Dictionary & Search** | Sorted Dynamic Array + Binary Search | File I/O, QuickSort, $O(\log N)$ word validation via `dict_binary_search()`. |
| **Member 2** | **Auto-Solver Engine** | Queue (FIFO) + Implicit Graph BFS | Unweighted shortest path calculation, on-the-fly neighbor generation ($26 \times L$). |
| **Member 3** | **Manual Play & Undo** | Stack (LIFO) | Move validation (Hamming distance = 1), $O(1)$ push/pop undo mechanics. |
| **Member 4** | **Replay & UI Engine** | Doubly Linked List + ANSI TUI | $O(1)$ bidirectional step-by-step replay (Next/Prev/Auto-play), telemetry cards. |

---

## 📊 Asymptotic Complexity Table

| Operation | Component | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| **Word Validation** | Binary Search on Sorted Array | $O(\log N)$ | $O(N)$ for dictionary storage |
| **Undo Last Move** | Custom Stack | $O(1)$ | $O(M)$ moves stored |
| **BFS Shortest Path** | Queue over Implicit Graph | $O(V + 26 \cdot L \cdot \log N)$ | $O(V)$ visited lookup + queue |
| **Bidirectional Replay**| Doubly Linked List | $O(1)$ per step | $O(P)$ solution path nodes |

*(Where $N$ = dictionary size, $L$ = word length, $V$ = reachable words, $M$ = moves made, $P$ = path length).*

---

## 🚀 How to Build and Run

### On macOS / Linux:
```bash
# Clone or navigate to the directory
cd wordBridge

# Compile using Makefile (GCC / Clang)
make clean && make

# Run the application
./wordbridge
# or
make run
```

### On Windows (Code::Blocks or MinGW / CMD):
1. Open Code::Blocks $\rightarrow$ Create a new Console Application in C.
2. Add all files in `include/` and `src/` to the project.
3. In Project Build Options, add `-Iinclude` to compiler flags.
4. Build and Run (`F9`).
*(Note: Windows 10/11 Command Prompt and PowerShell natively render ANSI colors and Unicode box characters).*

---

## 🎮 Features Included

1. **Interactive Manual Game Mode**:
   - Wordle-style letter boxes (`[ C ] [ O ] [ L ] [ D ]`).
   - Dynamic letter highlight showing which character changed.
   - Live comparison against the optimal BFS shortest move count.
2. **Move Undo Mechanics**:
   - Revert bad moves at any time using `[U]` (powered by the LIFO Stack).
3. **Smart Hint System**:
   - Stuck? Press `[H]` to query BFS from the current word and reveal only the single next best move.
4. **Instant Auto-Solver with Algorithm Telemetry**:
   - Computes the shortest transformation sequence in milliseconds.
   - Reports exact metrics: Nodes expanded, Peak queue size, and Wall-clock search time.
5. **Interactive Step-by-Step Replayer**:
   - Uses the Doubly Linked List to navigate forward `[N]`, backward `[P]`, jump to start `[B]`, jump to end `[E]`, or watch animated `[A]`uto-play.
6. **DSA Architecture Screen**:
   - Menu Option `[4]` displays the full academic DSA mapping and Big-O tables directly in the terminal for reference.

---

## 🎓 Viva Questions & Winning Answers

1. **Q: Why use an Implicit Graph instead of an Adjacency Matrix or Adjacency List?**
   * **Answer:** With 33,000+ words in English, an Adjacency Matrix would require $33000^2 \approx 1.08 \text{ billion}$ entries ($> 1\text{ GB}$ of memory). An Adjacency List would take hundreds of megabytes. By using an **implicit graph**, we generate neighbors on-the-fly ($26 \times L$ candidates) and check validity via $O(\log N)$ Binary Search, keeping the memory footprint minimal.

2. **Q: Why is BFS used instead of DFS or Dijkstra's Algorithm?**
   * **Answer:** Each single-letter transformation represents an edge of **unit weight (weight = 1)**. In an unweighted graph, **BFS guarantees the shortest path** in $O(V + E)$ time. Dijkstra would add unnecessary priority queue overhead ($O(E \log V)$), while DFS could get trapped in infinite cycles or deep non-optimal paths.

3. **Q: How does the Undo feature work under the hood?**
   * **Answer:** It uses a **LIFO Stack**. When the player enters a valid word, it is pushed onto the stack. When undo is triggered, we pop the current word; the previous game state is immediately available at the new top of the stack in $O(1)$ time.

4. **Q: Why is a Doubly Linked List used for path replay instead of a Singly Linked List?**
   * **Answer:** A Singly Linked List only supports $O(1)$ forward traversal (`next`). Stepping backwards (`prev`) would require an $O(P)$ search from the head each time. A **Doubly Linked List** has both `prev` and `next` pointers, enabling instantaneous $O(1)$ bidirectional stepping for user playback.
