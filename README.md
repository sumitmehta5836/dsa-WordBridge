# WordBridge — Word Ladder Puzzle Game with Auto-Solver
**Subject:** Data Structures & Algorithms (DSA) — Project-Based Learning (PBL)  
**Language:** Pure C (C99 standard, zero external libraries)  

---

### 👥 Team Members
* **Prachi Tiwari** (Member 1) — Dictionary Storage, QuickSort & Binary Search    
* **Priyanshu Bisht** (Member 2) — BFS Auto-Solver, Queue & Implicit Graph
* **Sumit Mehta** (Member 3) — Dual-Stack (Undo/Redo), Hamming Metric & State Engine
* **Suraj Singh Bisht** (Member 4) — Doubly Linked List Replay Engine & Terminal TUI
      
---

## 📌 Project Overview

WordBridge transforms the classic shortest-path word ladder problem into an interactive, visual console game and algorithmic engine. Players transform a start word into a target word one letter at a time through valid dictionary words, backed by an auto-solver that computes and replays the optimal shortest path.

Everything is implemented **from scratch** using core data structures—no C++ STL, no third-party game frameworks, and zero external dependencies.

---

## 🧱 Module & Data Structure Architecture

```text
wordBridge/
├── Makefile                     # Compilation and build configuration
├── README.md                    # Project documentation
├── data/
│   ├── dictionary.txt           # Master dictionary (33,756 words, 3 to 6 letters)
│   └── sample_words.txt         # Quick-testing curated subset
├── include/
│   ├── common.h                 # ANSI styling, color codes, common utilities
│   ├── dictionary.h             # Module 1: Sorted Array & Binary Search
│   ├── solver.h                 # Module 2: BFS Auto-Solver & Queue
│   ├── game.h                   # Module 3: State Engine, Dual-Stack & Hamming Metric
│   └── display.h                # Module 4: Doubly Linked List & Terminal UI
└── src/
    ├── main.c                   # Entry point, menu loop, and module integration
    ├── dictionary.c             # Dynamic array, QuickSort, and O(log N) Binary Search
    ├── solver.c                 # FIFO Queue, BFS traversal, and parent tracking
    ├── game.c                   # Dual-Stack for Undo/Redo, Hamming metric & state machine
    └── display.c                # Doubly Linked List, Wordle-style boxes, and Replay
```

---

## 👥 Team Member Roles & DSA Ownership

| Member | Name | Module | Data Structure / Algorithm | Key Functionality |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1** | **Prachi Tiwari** | **Dictionary & Search** | Sorted Dynamic Array + Binary Search | File I/O, QuickSort, $O(\log N)$ word validation via `dict_binary_search()`. |
| **Member 2** | **Priyanshu Bisht** | **Auto-Solver Engine** | Queue (FIFO) + Implicit Graph BFS | Unweighted shortest path calculation, on-the-fly neighbor generation ($26 \times L$). |
| **Member 3** | **Sumit Mehta** | **State Machine & History** | Dual-Stack (Undo/Redo) + Hamming Metric | Dual-stack history machine ($O(1)$ Undo & Redo), formal Hamming Distance metric validation, cycle detection, and real-time efficiency scoring. |
| **Member 4** | **Suraj Singh Bisht** | **Replay & UI Engine** | Doubly Linked List + ANSI TUI | $O(1)$ bidirectional step-by-step replay (Next/Prev/Auto-play), telemetry cards. |

---

## 📊 Asymptotic Complexity Table

| Operation | Component | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| **Word Validation** | Binary Search on Sorted Array | $O(\log N)$ | $O(N)$ for dictionary storage |
| **Undo / Redo Move**| Dual-Stack (LIFO) | $O(1)$ push/pop | $O(M)$ moves in stacks |
| **Cycle Detection** | Stack Traversal | $O(K)$ depth | $O(1)$ auxiliary |
| **BFS Shortest Path**| Queue over Implicit Graph | $O(V + 26 \cdot L \cdot \log N)$ | $O(V)$ visited lookup + queue |
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
2. **Dual-Stack Move History (Undo & Redo)**:
   - Revert moves with `[U]` and restore moves with `[R]` in $O(1)$ time.
3. **Smart Hint System**:
   - Stuck? Press `[H]` to query BFS from the current word and reveal only the single next best move.
4. **Instant Auto-Solver with Algorithm Telemetry**:
   - Computes the shortest transformation sequence in milliseconds.
   - Reports exact metrics: Nodes expanded, Peak queue size, and Wall-clock search time.
5. **Interactive Step-by-Step Replayer**:
   - Uses the Doubly Linked List to navigate forward `[N]`, backward `[P]`, jump to start `[B]`, jump to end `[E]`, or watch animated `[A]`uto-play.
6. **DSA Architecture Screen**:
   - Menu Option `[4]` displays the full academic DSA mapping and Big-O tables directly in the terminal for reference.
