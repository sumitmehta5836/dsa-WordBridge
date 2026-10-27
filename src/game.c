/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * File: src/game.c | Module 3 - Member 3: Sumit Mehta
 * Role: Manual Play Engine, Dual-Stack (Undo/Redo), State Machine & Hamming Metric
 * ============================================================================
 *
 * QUICK DSA SUMMARY (FOR VIVA):
 * 1. DUAL-STACK (LIFO): undo_stack + redo_stack handle reversible moves in O(1).
 *    - New Move : push(undo_stack), clear(redo_stack) in O(1).
 *    - Undo     : pop(undo_stack) -> push(redo_stack) in O(1).
 *    - Redo     : pop(redo_stack) -> push(undo_stack) in O(1).
 * 2. HAMMING DISTANCE: Enforces d_H == 1; rejects d_H = 0 (same) and d_H > 1 (multi-jump).
 * 3. CYCLE CHECK: stack_contains() scans stack in O(K) to alert on loops.
 * 4. EFFICIENCY: Compares player moves against BFS optimal baseline.
 * ============================================================================
 */

#include "game.h"
#include "solver.h"

/* ============================================================================
 * 1. STACK IMPLEMENTATION FROM SCRATCH (LIFO)
 * ============================================================================ */

/**
 * Initializes a new empty Stack on the heap.
 * Complexity: O(1) time | O(1) space
 */
Stack* stack_create(void) {
    Stack *s = (Stack *)malloc(sizeof(Stack));
    if (!s) {
        perror("Failed to allocate Stack");
        return NULL;
    }
    s->top = NULL;
    s->count = 0;
    return s;
}

/**
 * Pushes a word onto the top of the Stack (LIFO insert).
 * Prepends a new StackNode before s->top.
 * Complexity: O(1) time | O(1) auxiliary space per node
 */
bool stack_push(Stack *s, const char *word) {
    if (!s || !word) return false;

    StackNode *node = (StackNode *)malloc(sizeof(StackNode));
    if (!node) {
        perror("Failed to allocate StackNode");
        return false;
    }

    strncpy(node->word, word, MAX_WORD_LEN - 1);
    node->word[MAX_WORD_LEN - 1] = '\0';
    node->next = s->top;
    s->top = node;
    s->count++;
    return true;
}

/**
 * Pops and returns the top word from the Stack (LIFO remove).
 * Decouples the top node, updates s->top = s->top->next, and decrements count.
 * Returns a heap-allocated string copy that the caller must free().
 * Complexity: O(1) time | O(1) space
 */
char* stack_pop(Stack *s) {
    if (!s || s->top == NULL) return NULL;

    StackNode *temp = s->top;
    s->top = s->top->next;
    s->count--;

    char *popped_word = (char *)malloc(strlen(temp->word) + 1);
    if (popped_word) {
        strcpy(popped_word, temp->word);
    }
    free(temp);
    return popped_word;
}

/**
 * Inspects the top word without modifying the stack.
 * Complexity: O(1) time
 */
const char* stack_peek(const Stack *s) {
    if (!s || s->top == NULL) return NULL;
    return s->top->word;
}

/**
 * Returns true if the stack contains no elements.
 * Complexity: O(1) time
 */
bool stack_is_empty(const Stack *s) {
    return (s == NULL || s->top == NULL);
}

/**
 * Empties all elements from the stack while preserving the stack container.
 * Complexity: O(K) where K is number of stacked items | O(1) auxiliary space
 */
void stack_clear(Stack *s) {
    if (!s) return;
    StackNode *curr = s->top;
    while (curr != NULL) {
        StackNode *next = curr->next;
        free(curr);
        curr = next;
    }
    s->top = NULL;
    s->count = 0;
}

/**
 * Linear traversal of stack nodes to detect prior presence of a word (Cycle Check).
 * Complexity: O(K) where K is current stack depth | O(1) auxiliary space
 */
bool stack_contains(const Stack *s, const char *word) {
    if (!s || !word) return false;

    char target[MAX_WORD_LEN];
    str_to_lower(target, word);

    StackNode *curr = s->top;
    while (curr != NULL) {
        char curr_low[MAX_WORD_LEN];
        str_to_lower(curr_low, curr->word);
        if (strcmp(curr_low, target) == 0) {
            return true;
        }
        curr = curr->next;
    }
    return false;
}

/**
 * Deallocates all nodes and frees the Stack container.
 * Complexity: O(K) time
 */
void stack_free(Stack *s) {
    if (!s) return;
    stack_clear(s);
    free(s);
}

/* ============================================================================
 * 2. GAME ENGINE & STATE MACHINE IMPLEMENTATION
 * ============================================================================ */

/**
 * Creates and initializes a complete GameState structure.
 * - Sanitizes start and target words to lowercase.
 * - Allocates both undo_stack and redo_stack (Dual-Stack architecture).
 * - Pushes start_word as baseline level 0 into undo_stack.
 * - Computes BFS optimal moves in advance to establish benchmark for telemetry.
 */
GameState* game_create(Dictionary *dict, const char *start, const char *target) {
    if (!dict || !start || !target) return NULL;

    GameState *game = (GameState *)malloc(sizeof(GameState));
    if (!game) {
        perror("Failed to allocate GameState");
        return NULL;
    }

    str_to_lower(game->start_word, start);
    str_to_lower(game->target_word, target);
    strcpy(game->current_word, game->start_word);

    game->word_len = (int)strlen(game->start_word);
    game->moves_count = 0;
    game->total_pushes = 0;
    game->total_undos = 0;
    game->total_redos = 0;
    game->dict = dict;

    /* Initialize Dual-Stack History Architecture (Undo Stack + Redo Stack) */
    game->undo_stack = stack_create();
    game->redo_stack = stack_create();
    if (!game->undo_stack || !game->redo_stack) {
        if (game->undo_stack) stack_free(game->undo_stack);
        if (game->redo_stack) stack_free(game->redo_stack);
        free(game);
        return NULL;
    }
    game->history_stack = game->undo_stack; /* Pointer alias for display rendering */

    /* Push start word as ground state of the undo stack */
    stack_push(game->undo_stack, game->start_word);
    game->total_pushes = 1;

    /* Compute theoretical shortest path length upfront via Member 2's BFS */
    SolverMetrics metrics;
    char **path = solver_find_shortest_path(dict, game->start_word, game->target_word, &metrics);
    if (path) {
        game->optimal_moves = metrics.path_length - 1; /* Number of moves = words - 1 */
        solver_free_path(path, metrics.path_length);
    } else {
        game->optimal_moves = -1; /* Unsolvable puzzle */
    }

    return game;
}

/**
 * Destroys the game instance, freeing both stacks and state structure.
 */
void game_free(GameState *game) {
    if (!game) return;
    if (game->undo_stack) {
        stack_free(game->undo_stack);
    }
    if (game->redo_stack) {
        stack_free(game->redo_stack);
    }
    free(game);
}

/**
 * Executes a player's proposed word move.
 * Performs rigorous 5-step validation:
 *   1. Length matching
 *   2. Identity check
 *   3. Hamming distance metric (d_H == 1)
 *   4. Lexical existence check (Binary Search O(log N))
 *   5. Stack-based cycle detection
 *
 * State Changes:
 *   - Pushes clean_word to undo_stack in O(1)
 *   - Clears redo_stack (standard branching behavior)
 *   - Updates current_word and moves_count
 */
bool game_make_move(GameState *game, const char *new_word, char *err_msg, size_t err_size, bool *out_cycle_warning) {
    if (!game || !new_word) return false;

    if (out_cycle_warning) {
        *out_cycle_warning = false;
    }

    /* Check 1: Length matching before buffer copy */
    if ((int)strlen(new_word) != game->word_len) {
        if (err_msg) {
            snprintf(err_msg, err_size, "Word length mismatch: expected %d letters, got %lu.", 
                     game->word_len, strlen(new_word));
        }
        return false;
    }

    char clean_word[MAX_WORD_LEN + 1];
    str_to_lower(clean_word, new_word);

    /* Check 2: Same word repeated */
    if (strcmp(clean_word, game->current_word) == 0) {
        if (err_msg) {
            snprintf(err_msg, err_size, "Repeated move: current word is already '%s'.", clean_word);
        }
        return false;
    }

    /* Check 3: Hamming Distance Metric (d_H must equal 1) */
    int h_dist = word_difference_count(game->current_word, clean_word);
    if (h_dist != 1) {
        if (err_msg) {
            snprintf(err_msg, err_size, "Hamming distance error: d_H(%s, %s) = %d. Distance must be exactly 1.", 
                     game->current_word, clean_word, h_dist);
        }
        return false;
    }

    /* Check 4: Dictionary validation via Member 1's Binary Search O(log N) */
    if (!dict_contains(game->dict, clean_word)) {
        if (err_msg) {
            snprintf(err_msg, err_size, "'%s' is not in the dictionary!", clean_word);
        }
        return false;
    }

    /* Check 5: Cycle / Loop Detection in active history stack */
    if (stack_contains(game->undo_stack, clean_word)) {
        if (out_cycle_warning) {
            *out_cycle_warning = true;
        }
    }

    /* Valid Move Commit:
     * 1. Push new word to primary undo_stack (O(1))
     * 2. Clear secondary redo_stack (O(K))
     * 3. Update current game state
     */
    stack_push(game->undo_stack, clean_word);
    stack_clear(game->redo_stack);

    strcpy(game->current_word, clean_word);
    game->moves_count++;
    game->total_pushes++;

    if (err_msg) {
        err_msg[0] = '\0';
    }
    return true;
}

/**
 * Reverts the most recent move using the LIFO undo_stack.
 * Pops the current word from undo_stack and pushes it onto redo_stack in O(1).
 * Complexity: O(1) time | O(1) space
 */
bool game_undo_move(GameState *game, char *reverted_word) {
    if (!game || !game->undo_stack) return false;

    /* Stack must contain at least 2 items to undo (start word + at least 1 move) */
    if (game->undo_stack->count <= 1) {
        return false;
    }

    /* Pop current word from undo stack */
    char *popped = stack_pop(game->undo_stack);
    if (!popped) return false;

    /* Push popped word onto redo stack for O(1) restoration */
    stack_push(game->redo_stack, popped);

    if (reverted_word) {
        strcpy(reverted_word, popped);
    }
    free(popped);

    /* Restore current word to the new top of undo stack */
    const char *previous = stack_peek(game->undo_stack);
    if (previous) {
        strcpy(game->current_word, previous);
    }
    game->moves_count--;
    game->total_undos++;

    return true;
}

/**
 * Restores the most recently undone move from redo_stack.
 * Pops from redo_stack and pushes back onto undo_stack in O(1).
 * Complexity: O(1) time | O(1) space
 */
bool game_redo_move(GameState *game, char *restored_word) {
    if (!game || !game->redo_stack || stack_is_empty(game->redo_stack)) {
        return false;
    }

    /* Pop from redo stack */
    char *popped = stack_pop(game->redo_stack);
    if (!popped) return false;

    /* Push back onto undo stack */
    stack_push(game->undo_stack, popped);

    if (restored_word) {
        strcpy(restored_word, popped);
    }
    strcpy(game->current_word, popped);
    free(popped);

    game->moves_count++;
    game->total_redos++;

    return true;
}

/**
 * Evaluates the player's move efficiency against the BFS optimal baseline:
 *   Efficiency = (optimal_moves / actual_moves) * 100%
 */
double game_get_efficiency(const GameState *game) {
    if (!game || game->optimal_moves <= 0 || game->moves_count <= 0) return 100.0;

    double eff = ((double)game->optimal_moves / (double)game->moves_count) * 100.0;
    if (eff > 100.0) eff = 100.0;
    return eff;
}

/**
 * Classifies player performance into achievement rank badges.
 */
const char* game_get_rank(const GameState *game) {
    if (!game) return "Unknown";

    if (game->moves_count <= game->optimal_moves) {
        return "Grandmaster (Optimal Solution)";
    }

    double eff = game_get_efficiency(game);
    if (eff >= 80.0) {
        return "Expert Ladder Climber";
    } else if (eff >= 60.0) {
        return "Skilled Word-Weaver";
    } else {
        return "Explorer (Scenic Route)";
    }
}

/**
 * Checks if current word matches target word.
 */
bool game_is_won(const GameState *game) {
    if (!game) return false;
    return (strcmp(game->current_word, game->target_word) == 0);
}
