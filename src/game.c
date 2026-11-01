/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: src/game.c
 * Module 3 - Member 3: Manual Play, Dual-Stack (Undo/Redo) & State Engine
 * ============================================================================
 */

#include "game.h"
#include "solver.h"

/* Linked LIFO stack: push/pop change only the head pointer, so each is O(1). */

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

char* stack_pop(Stack *s) {
    if (!s || s->top == NULL) return NULL;

    StackNode *temp = s->top;
    char *popped_word = (char *)malloc(strlen(temp->word) + 1);
    if (!popped_word) {
        perror("Failed to allocate popped stack word");
        return NULL;
    }

    strcpy(popped_word, temp->word);
    s->top = temp->next;
    s->count--;
    free(temp);
    return popped_word;
}

static bool stack_move_top(Stack *source, Stack *destination, char *word_out) {
    if (!source || !destination || !source->top) return false;

    StackNode *node = source->top;
    source->top = node->next;
    source->count--;
    node->next = destination->top;
    destination->top = node;
    destination->count++;
    if (word_out) strcpy(word_out, node->word);
    return true;
}

const char* stack_peek(const Stack *s) {
    if (!s || s->top == NULL) return NULL;
    return s->top->word;
}

bool stack_is_empty(const Stack *s) {
    return (s == NULL || s->top == NULL);
}

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

bool stack_contains(const Stack *s, const char *word) {
    if (!s || !word) return false;

    /* Cycle detection is a linear scan of the current undo/history stack. */
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

void stack_free(Stack *s) {
    if (!s) return;
    stack_clear(s);
    free(s);
}

/* Game Engine & State Machine Implementation */

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

    /* Dual-stack history: undo stores the active path; redo stores moves popped
     * by undo until a new move starts a different history branch. */
    game->undo_stack = stack_create();
    game->redo_stack = stack_create();
    if (!game->undo_stack || !game->redo_stack) {
        if (game->undo_stack) stack_free(game->undo_stack);
        if (game->redo_stack) stack_free(game->redo_stack);
        free(game);
        return NULL;
    }
    game->history_stack = game->undo_stack; /* Pointer alias */

    /* Push start word to primary undo stack */
    if (!stack_push(game->undo_stack, game->start_word)) {
        stack_free(game->undo_stack);
        stack_free(game->redo_stack);
        free(game);
        return NULL;
    }
    game->total_pushes = 1;

    /* Compute optimal shortest path length in advance via BFS */
    SolverMetrics metrics;
    char **path = solver_find_shortest_path(dict, game->start_word, game->target_word, &metrics);
    if (path) {
        game->optimal_moves = metrics.path_length - 1; /* Moves = words - 1 */
        solver_free_path(path, metrics.path_length);
    } else {
        game->optimal_moves = -1; /* Unsolvable */
    }

    return game;
}

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

bool game_make_move(GameState *game, const char *new_word, char *err_msg, size_t err_size, bool *out_cycle_warning) {
    if (!game || !new_word) return false;

    if (out_cycle_warning) {
        *out_cycle_warning = false;
    }

    char clean_word[MAX_WORD_LEN + 1];
    str_to_lower(clean_word, new_word);

    /* Check 1: Length matching */
    if ((int)strlen(clean_word) != game->word_len) {
        if (err_msg) {
            snprintf(err_msg, err_size, "Word length mismatch: expected %d letters, got %lu.", 
                     game->word_len, (unsigned long)strlen(clean_word));
        }
        return false;
    }

    /* Check 2: Same word repeated */
    if (strcmp(clean_word, game->current_word) == 0) {
        if (err_msg) {
            snprintf(err_msg, err_size, "Repeated move: current word is already '%s'.", clean_word);
        }
        return false;
    }

    /* Check 3: Hamming Distance Metric (d_H == 1) */
    int h_dist = word_difference_count(game->current_word, clean_word);
    if (h_dist != 1) {
        if (err_msg) {
            snprintf(err_msg, err_size, "Hamming distance error: d_H(%s, %s) = %d. Distance must be exactly 1.", 
                     game->current_word, clean_word, h_dist);
        }
        return false;
    }

    /* Check 4: Dictionary validation via Binary Search */
    if (!dict_contains(game->dict, clean_word)) {
        if (err_msg) {
            snprintf(err_msg, err_size, "'%s' is not in the dictionary!", clean_word);
        }
        return false;
    }

    /* Check 5: Detect revisiting a word by searching the active path stack. */
    if (stack_contains(game->undo_stack, clean_word)) {
        if (out_cycle_warning) {
            *out_cycle_warning = true;
        }
    }

    /* Valid move:
     * 1. Push to primary undo stack
     * 2. Clear secondary redo stack (standard text-editor/browser history semantics)
     * 3. Update current game state
     */
    if (!stack_push(game->undo_stack, clean_word)) {
        if (err_msg) {
            snprintf(err_msg, err_size, "Could not record move because memory allocation failed.");
        }
        return false;
    }
    stack_clear(game->redo_stack);

    strcpy(game->current_word, clean_word);
    game->moves_count++;
    game->total_pushes++;

    if (err_msg) {
        err_msg[0] = '\0';
    }
    return true;
}

bool game_undo_move(GameState *game, char *reverted_word) {
    if (!game || !game->undo_stack) return false;

    /* Preserve the initial word; move the current top to redo in O(1). */
    if (game->undo_stack->count <= 1) {
        return false;
    }

    if (!stack_move_top(game->undo_stack, game->redo_stack, reverted_word)) return false;

    /* Restore current word to the new top of undo stack */
    const char *previous = stack_peek(game->undo_stack);
    if (previous) {
        strcpy(game->current_word, previous);
    }
    game->moves_count--;
    game->total_undos++;

    return true;
}

bool game_redo_move(GameState *game, char *restored_word) {
    if (!game || !game->redo_stack || stack_is_empty(game->redo_stack)) {
        return false;
    }

    /* Move the same node between stacks to keep undo/redo atomic without allocation. */
    char restored[MAX_WORD_LEN];
    if (!stack_move_top(game->redo_stack, game->undo_stack, restored_word ? restored_word : restored)) {
        return false;
    }
    strcpy(game->current_word, restored_word ? restored_word : restored);

    game->moves_count++;
    game->total_redos++;

    return true;
}

double game_get_efficiency(const GameState *game) {
    if (!game || game->optimal_moves <= 0 || game->moves_count <= 0) return 100.0;

    double eff = ((double)game->optimal_moves / (double)game->moves_count) * 100.0;
    if (eff > 100.0) eff = 100.0;
    return eff;
}

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

bool game_is_won(const GameState *game) {
    if (!game) return false;
    return (strcmp(game->current_word, game->target_word) == 0);
}
