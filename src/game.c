/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: src/game.c
 * Module 3 - Member 3: Manual Play & Undo (Stack)
 * ============================================================================
 */

#include "game.h"
#include "solver.h"

/* Stack Implementation from Scratch (LIFO) */

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
    s->top = s->top->next;
    s->count--;

    char *popped_word = (char *)malloc(strlen(temp->word) + 1);
    if (popped_word) {
        strcpy(popped_word, temp->word);
    }
    free(temp);
    return popped_word;
}

const char* stack_peek(const Stack *s) {
    if (!s || s->top == NULL) return NULL;
    return s->top->word;
}

bool stack_is_empty(const Stack *s) {
    return (s == NULL || s->top == NULL);
}

void stack_free(Stack *s) {
    if (!s) return;
    StackNode *curr = s->top;
    while (curr != NULL) {
        StackNode *next = curr->next;
        free(curr);
        curr = next;
    }
    free(s);
}

/* Game Engine Implementation */

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
    game->dict = dict;

    /* Initialize LIFO undo stack and push starting word */
    game->history_stack = stack_create();
    if (!game->history_stack) {
        free(game);
        return NULL;
    }
    stack_push(game->history_stack, game->start_word);

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
    if (game->history_stack) {
        stack_free(game->history_stack);
    }
    free(game);
}

bool game_make_move(GameState *game, const char *new_word, char *err_msg, size_t err_size) {
    if (!game || !new_word) return false;

    char clean_word[MAX_WORD_LEN + 1];
    str_to_lower(clean_word, new_word);

    /* Check 1: Length matching */
    if ((int)strlen(clean_word) != game->word_len) {
        if (err_msg) {
            snprintf(err_msg, err_size, "Word must be exactly %d letters long!", game->word_len);
        }
        return false;
    }

    /* Check 2: Same word repeated */
    if (strcmp(clean_word, game->current_word) == 0) {
        if (err_msg) {
            snprintf(err_msg, err_size, "Word is already '%s'!", clean_word);
        }
        return false;
    }

    /* Check 3: Must change exactly one letter */
    int diff = word_difference_count(game->current_word, clean_word);
    if (diff != 1) {
        if (err_msg) {
            snprintf(err_msg, err_size, "You changed %d letters! You must change EXACTLY 1 letter.", diff);
        }
        return false;
    }

    /* Check 4: Must exist in dictionary (Binary Search) */
    if (!dict_contains(game->dict, clean_word)) {
        if (err_msg) {
            snprintf(err_msg, err_size, "'%s' is not in the dictionary!", clean_word);
        }
        return false;
    }

    /* Valid move: Push to history stack and advance game state */
    stack_push(game->history_stack, clean_word);
    strcpy(game->current_word, clean_word);
    game->moves_count++;

    if (err_msg) {
        err_msg[0] = '\0';
    }
    return true;
}

bool game_undo_move(GameState *game, char *reverted_word) {
    if (!game || !game->history_stack) return false;

    /* Stack must contain at least 2 items to undo (start word + at least 1 move) */
    if (game->history_stack->count <= 1) {
        return false;
    }

    /* Pop the current word */
    char *popped = stack_pop(game->history_stack);
    if (reverted_word && popped) {
        strcpy(reverted_word, popped);
    }
    if (popped) free(popped);

    /* Restore current word to the new top of stack */
    const char *previous = stack_peek(game->history_stack);
    if (previous) {
        strcpy(game->current_word, previous);
    }
    game->moves_count--;

    return true;
}

bool game_is_won(const GameState *game) {
    if (!game) return false;
    return (strcmp(game->current_word, game->target_word) == 0);
}
