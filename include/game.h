/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: include/game.h
 * Module 3 - Member 3: Manual Play & Undo (Stack)
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
 * Stack structure implemented from scratch for move history and undo.
 */
typedef struct {
    StackNode *top;
    int count;
} Stack;

/**
 * Complete Game State for interactive manual play.
 */
typedef struct {
    char start_word[MAX_WORD_LEN];
    char target_word[MAX_WORD_LEN];
    char current_word[MAX_WORD_LEN];
    int word_len;
    int moves_count;
    int optimal_moves;      /* Shortest solution steps computed via BFS */
    Stack *history_stack;   /* Move history for undo (LIFO) */
    Dictionary *dict;       /* Active dictionary reference */
} GameState;

/* Stack Operations */
Stack* stack_create(void);
bool stack_push(Stack *s, const char *word);
char* stack_pop(Stack *s);
const char* stack_peek(const Stack *s);
bool stack_is_empty(const Stack *s);
void stack_free(Stack *s);

/* Game Logic Operations */
GameState* game_create(Dictionary *dict, const char *start, const char *target);
void game_free(GameState *game);

/**
 * Processes a player's proposed word move.
 * Performs rigorous checks:
 *   1. Length matching
 *   2. Single letter difference check (Hamming distance == 1)
 *   3. Dictionary existence validation via Binary Search
 * Returns true if the move was accepted, false otherwise (with error message).
 */
bool game_make_move(GameState *game, const char *new_word, char *err_msg, size_t err_size);

/**
 * Reverts the most recent move using the LIFO Stack.
 * Copies the undone word into reverted_word (if not NULL).
 * Returns true if undo was successful, false if already at the start word.
 */
bool game_undo_move(GameState *game, char *reverted_word);

/**
 * Checks if the player has successfully transformed the start word into target word.
 */
bool game_is_won(const GameState *game);

#endif /* GAME_H */
