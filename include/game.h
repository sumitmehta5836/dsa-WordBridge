/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * File: include/game.h | Module 3 - Member 3: Sumit Mehta
 * Role: Manual Play Engine, Dual-Stack (Undo/Redo), State Machine & Hamming Metric
 * ============================================================================
 *
 * QUICK DSA SUMMARY (FOR VIVA):
 * 1. DUAL-STACK (LIFO): undo_stack + redo_stack for O(1) step back and restore.
 *    - Move: push(undo), clear(redo).
 *    - Undo: pop(undo) -> push(redo).
 *    - Redo: pop(redo) -> push(undo).
 * 2. HAMMING DISTANCE: Validates d_H(current, candidate) == 1 (exact 1-letter change).
 * 3. CYCLE DETECTION: O(K) stack walk to detect and warn if a word repeats.
 * 4. EFFICIENCY SCORING: (optimal_moves / player_moves) * 100% with tier badges.
 * ============================================================================
 */

#ifndef GAME_H
#define GAME_H

#include "common.h"
#include "dictionary.h"

/**
 * Stack Node:
 * Singly linked element storing a word string for LIFO history tracking.
 */
typedef struct StackNode {
    char word[MAX_WORD_LEN];    /* Word snapshot stored at this stack level */
    struct StackNode *next;     /* Pointer to node below in stack */
} StackNode;

/**
 * Stack Structure (Last-In, First-Out):
 * Implemented from scratch using linked nodes for unbounded O(1) push and pop.
 */
typedef struct {
    StackNode *top;             /* Top of the stack (most recently pushed element) */
    int count;                  /* Number of items currently stored */
} Stack;

/**
 * Complete Game State Machine:
 * Encapsulates game lifecycle, active puzzle targets, move counters,
 * dual-stack history tracking, and active dictionary references.
 */
typedef struct {
    char start_word[MAX_WORD_LEN];      /* Puzzle source word */
    char target_word[MAX_WORD_LEN];     /* Puzzle destination word */
    char current_word[MAX_WORD_LEN];    /* Active word currently on ladder top */
    int word_len;                       /* Expected character length for this puzzle */
    int moves_count;                    /* Net count of forward moves taken */
    int optimal_moves;                  /* Theoretical shortest moves computed via BFS */
    
    /* Dual-Stack Architecture for Undo & Redo (Member 3) */
    Stack *undo_stack;                  /* Primary LIFO stack tracking forward moves */
    Stack *redo_stack;                  /* Secondary LIFO stack tracking undone moves */
    Stack *history_stack;               /* Pointer alias to undo_stack for display compatibility */
    
    /* Telemetry & Lifetime Metrics */
    int total_pushes;                   /* Lifetime moves pushed to stack */
    int total_undos;                    /* Total undos executed in session */
    int total_redos;                    /* Total redos executed in session */
    
    Dictionary *dict;                   /* Active dictionary reference for validation */
} GameState;

/* ----------------------------------------------------------------------------
 * Stack Operations (Member 3: Custom LIFO Implementation)
 * ---------------------------------------------------------------------------- */

/**
 * Allocates and initializes an empty Stack on the heap.
 * Time Complexity:  O(1)
 * Space Complexity: O(1)
 */
Stack* stack_create(void);

/**
 * Pushes a word onto the top of the Stack.
 * Time Complexity:  O(1)
 * Space Complexity: O(1) auxiliary per node
 * Returns true on success, false on allocation failure.
 */
bool stack_push(Stack *s, const char *word);

/**
 * Pops and returns the top word from the Stack.
 * Caller owns the returned heap-allocated string and must free() it.
 * Time Complexity:  O(1)
 * Returns NULL if the stack is empty.
 */
char* stack_pop(Stack *s);

/**
 * Peeks at the top word without modifying the Stack.
 * Time Complexity:  O(1)
 * Returns pointer to internal buffer, or NULL if empty.
 */
const char* stack_peek(const Stack *s);

/**
 * Checks whether the Stack is empty.
 * Time Complexity:  O(1)
 */
bool stack_is_empty(const Stack *s);

/**
 * Empties all nodes in the Stack and resets count to 0.
 * Time Complexity:  O(K) where K is number of items
 */
void stack_clear(Stack *s);

/**
 * Linear search through stack nodes to detect cycles / prior visits.
 * Time Complexity:  O(K) where K is current stack depth
 * Space Complexity: O(1)
 */
bool stack_contains(const Stack *s, const char *word);

/**
 * Frees all nodes and releases the Stack container.
 * Time Complexity:  O(K)
 */
void stack_free(Stack *s);

/* ----------------------------------------------------------------------------
 * Game Engine & State Machine Operations
 * ---------------------------------------------------------------------------- */

/**
 * Initializes a new puzzle session.
 * Computes optimal moves upfront via BFS to establish the benchmark.
 * Pushes start_word as the root element on undo_stack.
 * Time Complexity:  O(BFS solver duration)
 * Space Complexity: O(1) beyond initial stack node
 */
GameState* game_create(Dictionary *dict, const char *start, const char *target);

/**
 * Tears down game state, releasing dual stacks and internal memory.
 */
void game_free(GameState *game);

/**
 * Processes a player's proposed word move.
 * Executes 5-stage validation:
 *   1. Length matching (strlen == game->word_len)
 *   2. Identity rejection (candidate != current)
 *   3. Hamming distance metric (d_H(current, candidate) == 1)
 *   4. Lexical existence check (Binary Search O(log N))
 *   5. Cycle detection in active move history stack
 *
 * State Changes on Success:
 *   - Pushes word to undo_stack (O(1))
 *   - Clears redo_stack (O(K))
 *   - Updates current_word and moves_count
 *
 * Returns true if move is accepted, false otherwise (with descriptive error).
 */
bool game_make_move(GameState *game, const char *new_word, char *err_msg, size_t err_size, bool *out_cycle_warning);

/**
 * Reverts the most recent move using the LIFO undo_stack.
 * Pops the current word from undo_stack and pushes it onto redo_stack in O(1).
 * Restores the previous word at undo_stack->top as active current_word.
 * Returns true on success, false if at starting word (cannot undo root).
 */
bool game_undo_move(GameState *game, char *reverted_word);

/**
 * Restores the most recently undone move from redo_stack.
 * Pops from redo_stack and pushes back onto undo_stack in O(1).
 * Returns true on success, false if redo_stack is empty.
 */
bool game_redo_move(GameState *game, char *restored_word);

/**
 * Calculates player's path efficiency ratio relative to BFS optimal ladder:
 *   Efficiency = (optimal_moves / actual_moves) * 100%
 * Capped at 100.0%.
 */
double game_get_efficiency(const GameState *game);

/**
 * Computes descriptive achievement rank badge based on move efficiency.
 * Tiers: Grandmaster (100%), Expert (>=80%), Skilled (>=60%), Explorer (<60%).
 */
const char* game_get_rank(const GameState *game);

/**
 * Checks winning terminal condition: strcmp(current_word, target_word) == 0.
 */
bool game_is_won(const GameState *game);

#endif /* GAME_H */
