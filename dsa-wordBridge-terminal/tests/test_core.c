#include <assert.h>
#include <stdio.h>
#include <string.h>

#include "game.h"
#include "solver.h"

static void test_queue_fifo(void) {
    Queue *queue = queue_create();
    assert(queue != NULL);
    assert(queue_push(queue, 3));
    assert(queue_push(queue, 7));
    assert(queue_pop(queue) == 3);
    assert(queue_pop(queue) == 7);
    assert(queue_is_empty(queue));
    queue_free(queue);
}

static void test_solver_paths(void) {
    char *words[] = { "cat", "cog", "cot", "dog", "zzz" };
    Dictionary dictionary = { words, 5, 5, 3 };
    SolverMetrics metrics;

    char **path = solver_find_shortest_path(&dictionary, "CAT", "dog", &metrics);
    assert(path != NULL);
    assert(metrics.found);
    assert(!metrics.allocation_failed);
    assert(metrics.path_length == 4);
    assert(strcmp(path[0], "cat") == 0);
    assert(strcmp(path[metrics.path_length - 1], "dog") == 0);
    solver_free_path(path, metrics.path_length);

    path = solver_find_shortest_path(&dictionary, "cat", "cat", &metrics);
    assert(path != NULL);
    assert(metrics.found);
    assert(metrics.path_length == 1);
    assert(strcmp(path[0], "cat") == 0);
    solver_free_path(path, metrics.path_length);

    path = solver_find_shortest_path(&dictionary, "cat", "zzz", &metrics);
    assert(path == NULL);
    assert(!metrics.found);
    assert(!metrics.allocation_failed);

    path = solver_find_shortest_path(&dictionary, "cat", "cats", &metrics);
    assert(path == NULL);
    assert(!metrics.found);
    assert(!metrics.allocation_failed);
}

static void test_game_undo_redo_and_branching(void) {
    char *words[] = { "cat", "cog", "cot", "dog", "zzz" };
    Dictionary dictionary = { words, 5, 5, 3 };
    GameState *game = game_create(&dictionary, "cat", "dog");
    char word[MAX_WORD_LEN];
    char error[128];
    bool cycle_warning;

    assert(game != NULL);
    assert(game_make_move(game, "cot", error, sizeof(error), &cycle_warning));
    assert(game_make_move(game, "cog", error, sizeof(error), &cycle_warning));
    assert(game_undo_move(game, word));
    assert(strcmp(word, "cog") == 0);
    assert(strcmp(game->current_word, "cot") == 0);
    assert(game_redo_move(game, word));
    assert(strcmp(word, "cog") == 0);
    assert(strcmp(game->current_word, "cog") == 0);

    assert(game_undo_move(game, word));
    assert(game_make_move(game, "cat", error, sizeof(error), &cycle_warning));
    assert(!game_redo_move(game, word));
    game_free(game);
}

int main(void) {
    test_queue_fifo();
    test_solver_paths();
    test_game_undo_redo_and_branching();
    puts("C core tests passed.");
    return 0;
}
