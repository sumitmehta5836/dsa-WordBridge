/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * File: include/display.h | Module 4 - Member 4: Suraj Singh Bisht
 * Role: Doubly Linked List Replay Engine, Telemetry Analytics & Terminal TUI
 * ============================================================================
 *
 * QUICK DSA SUMMARY (FOR VIVA):
 * 1. DOUBLY LINKED LIST: Bidirectional prev/next pointers for O(1) step forward/back.
 * 2. REPLAY CONTROLS: Next (N), Prev (P), First (B), Last (E), and Auto-Play (A).
 * 3. DELTA RENDERING: Highlights the 1 changed character in bright green.
 * 4. COLLAPSED VIEW: Prevents screen overflow by summarizing long move histories.
 * ============================================================================
 */

#ifndef DISPLAY_H
#define DISPLAY_H

#include "common.h"
#include "solver.h"
#include "game.h"

/**
 * Doubly Linked List Node:
 * Represents one discrete state in the word ladder solution path.
 */
typedef struct PathNode {
    char word[MAX_WORD_LEN];    /* Word string at this step */
    int step_number;            /* 1-based chronological step sequence */
    struct PathNode *prev;      /* Pointer to preceding step (enables O(1) step back) */
    struct PathNode *next;      /* Pointer to subsequent step (enables O(1) step forward) */
} PathNode;

/**
 * Doubly Linked List Container:
 * Tracks head, tail, and active cursor node for interactive replay.
 */
typedef struct {
    PathNode *head;             /* Starting word node (Step 1) */
    PathNode *tail;             /* Target word node (Final step) */
    PathNode *current;          /* Active cursor node during replay */
    int total_steps;            /* Total steps in ladder */
} PathList;

/* ----------------------------------------------------------------------------
 * Doubly Linked List Operations (Member 4: Custom Replay Structure)
 * ---------------------------------------------------------------------------- */

/**
 * Allocates and initializes an empty Doubly Linked List on the heap.
 * Time Complexity:  O(1)
 * Space Complexity: O(1)
 */
PathList* path_list_create(void);

/**
 * Appends a word node to the tail of the Doubly Linked List.
 * Links `list->tail->next = node` and `node->prev = list->tail`.
 * Time Complexity:  O(1)
 * Space Complexity: O(1) per node
 */
void path_list_append(PathList *list, const char *word);

/**
 * Factory helper: Converts a NULL-terminated string array into a Doubly Linked List.
 * Time Complexity:  O(P) where P is path length
 * Space Complexity: O(P) heap memory
 */
PathList* path_list_from_array(char **path, int count);

/**
 * Traverses and frees all nodes in the Doubly Linked List.
 * Time Complexity:  O(P)
 * Space Complexity: O(1) auxiliary
 */
void path_list_free(PathList *list);

/* ----------------------------------------------------------------------------
 * Terminal Rendering & Screen UI Helpers
 * ---------------------------------------------------------------------------- */

/** Clears terminal screen using standard VT100 ANSI escape codes (\033[H\033[2J). */
void ui_clear_screen(void);

/** Prints the formatted ASCII banner and project title. */
void ui_print_banner(void);

/** Prints a horizontal dividing line with cyan styling. */
void ui_print_divider(void);

/** Displays the primary interactive application menu options. */
void ui_print_menu(void);

/**
 * Renders a stylized Wordle-like letter box.
 * Compares current word against prev_word to highlight the single substituted letter.
 * Time Complexity: O(L) where L is word length
 */
void ui_render_word_box(const char *word, const char *prev_word, bool is_current);

/**
 * Renders the full game screen for manual play mode.
 * Displays header telemetry, collapsed transformation history, and command prompt.
 */
void ui_render_game_board(const GameState *game, const char *status_msg, int status_type);

/**
 * Renders algorithm telemetry and performance analytics card.
 * Displays execution time (ms/us), nodes expanded, peak queue, and complexity.
 */
void ui_render_metrics(const SolverMetrics *metrics, const char *start, const char *target);

/**
 * Interactive step-by-step replay mode using the Doubly Linked List.
 * Allows user to navigate with Next, Prev, Auto-play, and Jump controls.
 */
void ui_interactive_replay(PathList *list, const char *start, const char *target);

/**
 * Academic DSA specification screen presenting data structure mappings,
 * asymptotic Big-O complexity tables, and project architecture defense.
 */
void ui_print_viva_defense(void);

#endif /* DISPLAY_H */
