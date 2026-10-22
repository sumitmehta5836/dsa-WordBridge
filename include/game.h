/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: include/game.h
 * Module 3 - Member 3: Manual Play, Dual-Stack (Undo/Redo) & State Engine
 * ============================================================================
 */

#ifndef GAME_H
#define GAME_H

#include "common.h"
#include "dictionary.h"

/**
 * Stack Node for LIFO history tracking.
 */
typedef struct StackNode {
    char word[MAX_WORD_LEN];
    struct StackNode *next;
} StackNode;

/**
 * Stack structure implemented from scratch for dual-stack (Undo/Redo) history.
 */
typedef struct {
    StackNode *top;
    int count;
} Stack;

/**
 * Complete Game State Machine for interactive manual play.
 */
typedef struct {
    char start_word[MAX_WORD_LEN];
    char target_word[MAX_WORD_LEN];
    char current_word[MAX_WORD_LEN];
    int word_len;
    int moves_count;
    int optimal_moves;      /* Shortest solution steps computed via BFS */
    
    /* Dual-Stack Architecture for Undo & Redo (Member 3) */
    Stack *undo_stack;      /* Primary LIFO stack tracking forward moves */
    Stack *redo_stack;      /* Secondary LIFO stack tracking undone moves */
    Stack *history_stack;   /* Pointer alias to undo_stack */
    
    /* Telemetry & State Metrics */
    int total_pushes;       /* Total moves pushed to stack */
    int total_undos;        /* Total undos executed */
    int total_redos;        /* Total redos executed */
    
    Dictionary *dict;       /* Active dictionary reference */
} GameState;

/* Stack Operations (Implemented from scratch) */
Stack* stack_create(void);
bool stack_push(Stack *s, const char *word);
char* stack_pop(Stack *s);
const char* stack_peek(const Stack *s);
bool stack_is_empty(const Stack *s);
void stack_clear(Stack *s);
bool stack_contains(const Stack *s, const char *word);
void stack_free(Stack *s);

/* Game Engine & State Machine Operations */
GameState* game_create(Dictionary *dict, const char *start, const char *target);
void game_free(GameState *game);

/**
 * Processes a player's proposed word move.
 * Performs rigorous checks:
 *   1. Length matching
 *   2. Hamming distance metric check (d_H(current, new) == 1)
 *   3. Dictionary existence validation via Binary Search
 *   4. Cycle detection in active move history
 * Returns true if the move was accepted, false otherwise (with error message).
 */
bool game_make_move(GameState *game, const char *new_word, char *err_msg, size_t err_size, bool *out_cycle_warning);

/**
 * Reverts the most recent move using the LIFO undo_stack.
 * Pushes the undone word onto redo_stack in O(1).
 * Returns true if undo was successful, false if already at the start word.
 */
bool game_undo_move(GameState *game, char *reverted_word);

/**
 * Restores the most recently undone move from the redo_stack.
 * Pushes the restored word back onto undo_stack in O(1).
 * Returns true if redo was successful, false if redo_stack is empty.
 */
bool game_redo_move(GameState *game, char *restored_word);

/**
 * Computes the player's real-time efficiency ratio relative to the BFS optimal path.
 */
double game_get_efficiency(const GameState *game);

/**
 * Computes the player's performance tier badge (Grandmaster, Expert, Explorer).
 */
const char* game_get_rank(const GameState *game);

/**
 * Checks if the player has successfully transformed the start word into target word.
 */
bool game_is_won(const GameState *game);

#endif /* GAME_H */
