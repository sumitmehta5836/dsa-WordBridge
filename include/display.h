/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: include/display.h
 * Module 4 - Member 4: Path Storage, Replay & Console UI
 * ============================================================================
 */

#ifndef DISPLAY_H
#define DISPLAY_H

#include "common.h"
#include "solver.h"
#include "game.h"

/**
 * Doubly Linked List Node for solution path storage.
 * Enables O(1) bidirectional step-by-step playback (Next / Previous).
 */
typedef struct PathNode {
    char word[MAX_WORD_LEN];
    int step_number;
    struct PathNode *prev;
    struct PathNode *next;
} PathNode;

/**
 * Doubly Linked List representing the entire word ladder transformation.
 */
typedef struct {
    PathNode *head;
    PathNode *tail;
    PathNode *current;
    int total_steps;
} PathList;

/* Doubly Linked List Operations */
PathList* path_list_create(void);
void path_list_append(PathList *list, const char *word);
PathList* path_list_from_array(char **path, int count);
void path_list_free(PathList *list);

/* Screen & UI Helpers */
void ui_clear_screen(void);
void ui_print_banner(void);
void ui_print_divider(void);
void ui_print_menu(void);

/**
 * Renders a stylized Wordle-like box for a word.
 * Highlights characters that differ from prev_word.
 */
void ui_render_word_box(const char *word, const char *prev_word, bool is_current);

/**
 * Renders the full interactive manual game screen.
 */
void ui_render_game_board(const GameState *game, const char *status_msg, int status_type);

/**
 * Renders the algorithm telemetry and benchmark analytics card.
 */
void ui_render_metrics(const SolverMetrics *metrics, const char *start, const char *target);

/**
 * Interactive step-by-step replay mode using the Doubly Linked List.
 * Allows user to navigate with Next, Prev, Auto-play, and Jump commands.
 */
void ui_interactive_replay(PathList *list, const char *start, const char *target);

/**
 * Academic DSA specification screen showing data structures mapping and Big-O table.
 */
void ui_print_viva_defense(void);

#endif /* DISPLAY_H */
