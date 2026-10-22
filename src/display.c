/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: src/display.c
 * Module 4 - Member 4: Path Storage, Replay & Console UI
 * ============================================================================
 */

#include "display.h"

/* Doubly Linked List Implementation from Scratch */

PathList* path_list_create(void) {
    PathList *list = (PathList *)malloc(sizeof(PathList));
    if (!list) {
        perror("Failed to allocate PathList");
        return NULL;
    }
    list->head = NULL;
    list->tail = NULL;
    list->current = NULL;
    list->total_steps = 0;
    return list;
}

void path_list_append(PathList *list, const char *word) {
    if (!list || !word) return;

    PathNode *node = (PathNode *)malloc(sizeof(PathNode));
    if (!node) {
        perror("Failed to allocate PathNode");
        return;
    }

    strncpy(node->word, word, MAX_WORD_LEN - 1);
    node->word[MAX_WORD_LEN - 1] = '\0';
    node->step_number = list->total_steps + 1;
    node->next = NULL;
    node->prev = list->tail;

    if (list->tail == NULL) {
        list->head = node;
        list->tail = node;
        list->current = node;
    } else {
        list->tail->next = node;
        list->tail = node;
    }
    list->total_steps++;
}

PathList* path_list_from_array(char **path, int count) {
    if (!path || count <= 0) return NULL;

    PathList *list = path_list_create();
    if (!list) return NULL;

    for (int i = 0; i < count; i++) {
        if (path[i]) {
            path_list_append(list, path[i]);
        }
    }
    list->current = list->head;
    return list;
}

void path_list_free(PathList *list) {
    if (!list) return;
    PathNode *curr = list->head;
    while (curr != NULL) {
        PathNode *next = curr->next;
        free(curr);
        curr = next;
    }
    free(list);
}

/* UI & Terminal Rendering Functions */

void ui_clear_screen(void) {
    printf("\033[H\033[2J");
    fflush(stdout);
}

void ui_print_divider(void) {
    printf(COLOR_CYAN "────────────────────────────────────────────────────────────────────────\n" COLOR_RESET);
}

void ui_print_banner(void) {
    printf(COLOR_BCYAN);
    printf("  ╦ ╦ ╔═╗ ╦═╗ ╔╦╗   ╔╗  ╦═╗ ╦ ╔╦╗ ╔═╗ ╔═╗\n");
    printf("  ║║║ ║ ║ ╠╦╝ ║ ║   ╠╩╗ ╠╦╝ ║ ║ ║ ║ ╦ ║╣ \n");
    printf("  ╚╩╝ ╚═╝ ╩╚═ ╩═╝   ╚═╝ ╩╚═ ╩ ╩═╝ ╚═╝ ╚═╝\n");
    printf(COLOR_RESET);
    printf(COLOR_BOLD "  Word Ladder Puzzle & Auto-Solver" COLOR_RESET);
    printf(COLOR_DIM " | DSA Project-Based Learning\n" COLOR_RESET);
    ui_print_divider();
}

void ui_print_menu(void) {
    ui_clear_screen();
    ui_print_banner();
    printf("\n");
    printf(COLOR_BOLD "  SELECT AN OPTION:\n" COLOR_RESET);
    printf("  " COLOR_BGREEN "[1]" COLOR_RESET " Play WordBridge (Interactive Manual Mode)\n");
    printf("  " COLOR_BYELLOW "[2]" COLOR_RESET " Auto-Solver & Path Replay (BFS Demo)\n");
    printf("  " COLOR_BMAGENTA "[3]" COLOR_RESET " Custom Word Ladder Benchmark & Telemetry\n");
    printf("  " COLOR_BBLUE "[4]" COLOR_RESET " DSA Architecture\n");
    printf("  " COLOR_BRED "[5]" COLOR_RESET " Exit Game\n");
    printf("\n");
    ui_print_divider();
    printf(COLOR_BOLD "  Enter choice (1-5): " COLOR_RESET);
}

void ui_render_word_box(const char *word, const char *prev_word, bool is_current) {
    if (!word) return;
    size_t len = strlen(word);

    /* Upper border */
    printf("  ");
    for (size_t i = 0; i < len; i++) {
        printf(i == 0 ? "┌───" : "┬───");
    }
    printf("┐\n");

    /* Word characters */
    printf("  ");
    for (size_t i = 0; i < len; i++) {
        char ch = (char)toupper((unsigned char)word[i]);
        bool changed = (prev_word && i < strlen(prev_word) && 
                        tolower((unsigned char)word[i]) != tolower((unsigned char)prev_word[i]));

        printf("│ ");
        if (changed) {
            printf(COLOR_BGREEN COLOR_BOLD "%c " COLOR_RESET, ch);
        } else if (is_current) {
            printf(COLOR_BYELLOW COLOR_BOLD "%c " COLOR_RESET, ch);
        } else {
            printf(COLOR_BOLD "%c " COLOR_RESET, ch);
        }
    }
    printf("│\n");

    /* Lower border */
    printf("  ");
    for (size_t i = 0; i < len; i++) {
        printf(i == 0 ? "└───" : "┴───");
    }
    printf("┘\n");
}

void ui_render_game_board(const GameState *game, const char *status_msg, int status_type) {
    if (!game) return;

    ui_clear_screen();
    ui_print_banner();

    /* Header Info Card */
    char start_upper[MAX_WORD_LEN], target_upper[MAX_WORD_LEN];
    str_to_upper(start_upper, game->start_word);
    str_to_upper(target_upper, game->target_word);

    printf(COLOR_BOLD "  PUZZLE: " COLOR_RESET COLOR_BCYAN "%s" COLOR_RESET " ──▶ " COLOR_BGREEN "%s" COLOR_RESET,
           start_upper, target_upper);
    printf("  |  " COLOR_BOLD "Moves:" COLOR_RESET " %d", game->moves_count);
    if (game->optimal_moves > 0) {
        printf("  |  " COLOR_BOLD "Optimal BFS Moves:" COLOR_RESET " %d", game->optimal_moves);
    }
    if (game->redo_stack && game->redo_stack->count > 0) {
        printf("  |  " COLOR_BYELLOW COLOR_BOLD "Redo Ready:" COLOR_RESET " %d", game->redo_stack->count);
    }
    printf("\n");
    ui_print_divider();

    /* History Path Display */
    printf(COLOR_BOLD "  TRANSFORMATION LADDER:\n" COLOR_RESET);
    if (game->history_stack && game->history_stack->count > 0) {
        /* Read history words from bottom to top for forward display */
        int count = game->history_stack->count;
        char words_copy[64][MAX_WORD_LEN];
        int idx = count - 1;

        StackNode *curr = game->history_stack->top;
        while (curr != NULL && idx >= 0 && idx < 64) {
            strcpy(words_copy[idx], curr->word);
            curr = curr->next;
            idx--;
        }

        for (int i = 0; i < count; i++) {
            char upper[MAX_WORD_LEN];
            str_to_upper(upper, words_copy[i]);
            const char *prev = (i > 0) ? words_copy[i - 1] : NULL;

            if (i == count - 1) {
                printf(COLOR_BYELLOW "  Step %d (CURRENT):\n" COLOR_RESET, i);
                ui_render_word_box(upper, prev, true);
            } else {
                printf(COLOR_DIM "  Step %d: %s\n" COLOR_RESET, i, upper);
                printf(COLOR_DIM "     ↓\n" COLOR_RESET);
            }
        }
    }

    /* Target Reminder */
    printf("\n  " COLOR_BOLD "GOAL:" COLOR_RESET " Transform into " COLOR_BGREEN "[ %s ]" COLOR_RESET " (1 letter at a time)\n", target_upper);
    ui_print_divider();

    /* Status / Feedback message */
    if (status_msg && strlen(status_msg) > 0) {
        if (status_type == 1) { /* Success */
            printf("  " COLOR_BGREEN COLOR_BOLD "✔ %s" COLOR_RESET "\n", status_msg);
        } else if (status_type == 2) { /* Warning / Hint */
            printf("  " COLOR_BYELLOW COLOR_BOLD "💡 HINT: %s" COLOR_RESET "\n", status_msg);
        } else { /* Error */
            printf("  " COLOR_BRED COLOR_BOLD "✘ %s" COLOR_RESET "\n", status_msg);
        }
        ui_print_divider();
    }

    /* Command Bar */
    printf(COLOR_BOLD "  COMMANDS: " COLOR_RESET);
    printf("[Type Word]  |  " COLOR_BYELLOW "[U]" COLOR_RESET "ndo  |  " 
           COLOR_BYELLOW "[R]" COLOR_RESET "edo  |  " 
           COLOR_BCYAN "[H]" COLOR_RESET "int  |  " 
           COLOR_BMAGENTA "[S]" COLOR_RESET "olve  |  " 
           COLOR_BRED "[Q]" COLOR_RESET "uit\n");
    ui_print_divider();
    printf(COLOR_BOLD "  Enter your move > " COLOR_RESET);
    fflush(stdout);
}

/* Helper to render a single row inside a bordered box with exact column alignment */
static void render_box_row(const char *label, const char *value, const char *val_color) {
    const int inner_width = 64;
    int label_len = (int)strlen(label);
    int val_len = (int)strlen(value);
    int pad = inner_width - (label_len + val_len);
    if (pad < 0) pad = 0;

    printf(COLOR_BCYAN "  ║ " COLOR_RESET);
    printf(COLOR_BOLD "%s" COLOR_RESET, label);
    if (val_color) {
        printf("%s%s" COLOR_RESET, val_color, value);
    } else {
        printf("%s", value);
    }
    for (int i = 0; i < pad; i++) {
        putchar(' ');
    }
    printf(COLOR_BCYAN " ║\n" COLOR_RESET);
}

void ui_render_metrics(const SolverMetrics *metrics, const char *start, const char *target) {
    if (!metrics) return;

    char start_upper[MAX_WORD_LEN], target_upper[MAX_WORD_LEN];
    str_to_upper(start_upper, start);
    str_to_upper(target_upper, target);

    printf("\n");
    printf(COLOR_BCYAN "  ╔══════════════════════════════════════════════════════════════════╗\n");
    printf("  ║                 ALGORITHM TELEMETRY & METRICS                    ║\n");
    printf("  ╠══════════════════════════════════════════════════════════════════╣\n" COLOR_RESET);

    /* Row 1: Word Pair */
    char pair_str[64];
    snprintf(pair_str, sizeof(pair_str), "%s -> %s", start_upper, target_upper);
    render_box_row("Word Pair          : ", pair_str, COLOR_BYELLOW);

    /* Row 2: Solution Found */
    const char *status_text = metrics->found ? "YES (Optimal Path)" : "NO (Disconnected Graph)";
    const char *status_color = metrics->found ? COLOR_BGREEN : COLOR_BRED;
    render_box_row("Solution Found     : ", status_text, status_color);

    /* Row 3: Shortest Path */
    char path_str[64];
    if (metrics->found && metrics->path_length > 0) {
        snprintf(path_str, sizeof(path_str), "%d steps (%d transformations)", metrics->path_length, metrics->path_length - 1);
    } else {
        snprintf(path_str, sizeof(path_str), "None");
    }
    render_box_row("Shortest Path      : ", path_str, COLOR_BOLD);

    /* Row 4: Nodes Expanded */
    char nodes_str[64];
    snprintf(nodes_str, sizeof(nodes_str), "%d words visited in BFS", metrics->nodes_expanded);
    render_box_row("Nodes Expanded     : ", nodes_str, NULL);

    /* Row 5: Peak Queue Size */
    char queue_str[64];
    snprintf(queue_str, sizeof(queue_str), "%d items at peak", metrics->max_queue_size);
    render_box_row("Peak Queue Size    : ", queue_str, NULL);

    /* Row 6: Execution Time */
    char time_str[64];
    snprintf(time_str, sizeof(time_str), "%.3f ms (%.1f us)", metrics->time_taken_ms, metrics->time_taken_ms * 1000.0);
    render_box_row("Execution Time     : ", time_str, COLOR_BGREEN);

    /* Row 7: Algorithm */
    render_box_row("Algorithm          : ", "Breadth-First Search (Implicit Word Graph)", NULL);

    /* Row 8: Time Complexity */
    render_box_row("Time Complexity    : ", "O(V + E) = O(V + 26 * L * log N)", NULL);

    /* Row 9: Space Complexity */
    render_box_row("Space Complexity   : ", "O(V) for Queue + Visited Lookup", NULL);

    printf(COLOR_BCYAN "  ╚══════════════════════════════════════════════════════════════════╝\n" COLOR_RESET);
}

void ui_interactive_replay(PathList *list, const char *start, const char *target) {
    if (!list || list->total_steps == 0) return;

    list->current = list->head;
    char cmd_buf[32];

    while (1) {
        ui_clear_screen();
        ui_print_banner();

        char start_upper[MAX_WORD_LEN], target_upper[MAX_WORD_LEN];
        str_to_upper(start_upper, start);
        str_to_upper(target_upper, target);

        printf(COLOR_BOLD "  STEP-BY-STEP SOLUTION REPLAYER (DOUBLY LINKED LIST)\n" COLOR_RESET);
        printf("  Path: " COLOR_BCYAN "%s" COLOR_RESET " ──▶ " COLOR_BGREEN "%s" COLOR_RESET " | Total Steps: " COLOR_BOLD "%d\n" COLOR_RESET,
               start_upper, target_upper, list->total_steps);
        ui_print_divider();

        /* Current step indicator */
        printf(COLOR_BOLD "  Current Step: " COLOR_BYELLOW "[%d / %d]\n\n" COLOR_RESET, 
               list->current->step_number, list->total_steps);

        /* Render word box with changed letter highlight */
        char current_upper[MAX_WORD_LEN];
        str_to_upper(current_upper, list->current->word);
        const char *prev_word = list->current->prev ? list->current->prev->word : NULL;

        ui_render_word_box(current_upper, prev_word, true);

        if (prev_word) {
            char prev_upper[MAX_WORD_LEN];
            str_to_upper(prev_upper, prev_word);
            printf("\n  " COLOR_DIM "Transformed from: " COLOR_RESET COLOR_BOLD "%s" COLOR_RESET "\n", prev_upper);
        } else {
            printf("\n  " COLOR_BGREEN COLOR_BOLD "▶ STARTING WORD\n" COLOR_RESET);
        }

        if (list->current->next == NULL) {
            printf("  " COLOR_BGREEN COLOR_BOLD "★ TARGET WORD REACHED!\n" COLOR_RESET);
        }

        printf("\n");
        ui_print_divider();

        /* Compact Ladder Visualizer */
        printf(COLOR_BOLD "  Ladder Sequence: " COLOR_RESET);
        PathNode *p = list->head;
        while (p != NULL) {
            char u[MAX_WORD_LEN];
            str_to_upper(u, p->word);
            if (p == list->current) {
                printf(COLOR_BGREEN COLOR_BOLD "[%s]" COLOR_RESET, u);
            } else if (p->step_number < list->current->step_number) {
                printf(COLOR_DIM "%s" COLOR_RESET, u);
            } else {
                printf("%s", u);
            }
            if (p->next != NULL) printf(" ─▶ ");
            p = p->next;
        }
        printf("\n");
        ui_print_divider();

        /* Replay Controls */
        printf(COLOR_BOLD "  CONTROLS: " COLOR_RESET);
        printf(COLOR_BCYAN "[N]" COLOR_RESET "ext  |  " 
               COLOR_BCYAN "[P]" COLOR_RESET "revious  |  " 
               COLOR_BYELLOW "[A]" COLOR_RESET "uto-Play  |  " 
               COLOR_BMAGENTA "[B]" COLOR_RESET "eginning  |  " 
               COLOR_BMAGENTA "[E]" COLOR_RESET "nd  |  " 
               COLOR_BRED "[Q]" COLOR_RESET "uit Replay\n");
        ui_print_divider();
        printf("  Enter action > ");
        fflush(stdout);

        if (!fgets(cmd_buf, sizeof(cmd_buf), stdin)) break;
        str_trim(cmd_buf);

        if (strlen(cmd_buf) == 0) continue;
        char act = (char)toupper((unsigned char)cmd_buf[0]);

        if (act == 'N') {
            if (list->current->next) {
                list->current = list->current->next;
            }
        } else if (act == 'P') {
            if (list->current->prev) {
                list->current = list->current->prev;
            }
        } else if (act == 'B') {
            list->current = list->head;
        } else if (act == 'E') {
            list->current = list->tail;
        } else if (act == 'A') {
            /* Animated Auto-play */
            while (list->current != NULL) {
                ui_clear_screen();
                ui_print_banner();
                printf(COLOR_BOLD "  AUTO-PLAYING SOLUTION... (Step %d of %d)\n\n" COLOR_RESET,
                       list->current->step_number, list->total_steps);
                
                char u[MAX_WORD_LEN];
                str_to_upper(u, list->current->word);
                const char *prev = list->current->prev ? list->current->prev->word : NULL;
                ui_render_word_box(u, prev, true);
                
                if (list->current->next == NULL) {
                    printf("\n  " COLOR_BGREEN COLOR_BOLD "★ TARGET REACHED!\n" COLOR_RESET);
                    fflush(stdout);
                    SLEEP_MS(1200);
                    break;
                }
                fflush(stdout);
                SLEEP_MS(600);
                list->current = list->current->next;
            }
        } else if (act == 'Q') {
            break;
        }
    }
}

void ui_print_viva_defense(void) {
    ui_clear_screen();
    ui_print_banner();
    printf(COLOR_BOLD "  DATA STRUCTURES & ALGORITHMS (DSA) ARCHITECTURE\n" COLOR_RESET);
    ui_print_divider();
    printf("\n");
    printf(COLOR_BGREEN "  1. MODULE MAPPING TO CORE DATA STRUCTURES:\n" COLOR_RESET);
    printf("     • " COLOR_BOLD "Dictionary Storage" COLOR_RESET "      : Dynamic Array of strings (char**)\n");
    printf("     • " COLOR_BOLD "Word Validation" COLOR_RESET "         : Binary Search (O(log N) lookup time)\n");
    printf("     • " COLOR_BOLD "Auto-Solver" COLOR_RESET "             : Breadth-First Search (BFS) using a Queue (FIFO)\n");
    printf("     • " COLOR_BOLD "Implicit Graph" COLOR_RESET "          : Neighbors generated on-the-fly (26 * L candidates)\n");
    printf("     • " COLOR_BOLD "Move Engine & Dual-Stack" COLOR_RESET " : Dual-Stack (Undo & Redo in O(1)) + Cycle Check\n");
    printf("     • " COLOR_BOLD "Path Replay" COLOR_RESET "             : Doubly Linked List (Bidirectional O(1) next/prev)\n");
    printf("\n");
    printf(COLOR_BGREEN "  2. ASYMPTOTIC COMPLEXITY ANALYSIS:\n" COLOR_RESET);
    printf("     ┌──────────────────────┬──────────────────────┬──────────────────────┐\n");
    printf("     │ Operation            │ Time Complexity      │ Space Complexity     │\n");
    printf("     ├──────────────────────┼──────────────────────┼──────────────────────┤\n");
    printf("     │ Dictionary Lookup    │ O(log N)             │ O(N) storage         │\n");
    printf("     │ Undo / Redo Move     │ O(1)                 │ O(M) moves in stacks │\n");
    printf("     │ BFS Shortest Path    │ O(V + 26*L*log N)    │ O(V) visited + queue │\n");
    printf("     │ Linked List Step     │ O(1)                 │ O(P) path nodes      │\n");
    printf("     └──────────────────────┴──────────────────────┴──────────────────────┘\n");
    printf("     " COLOR_DIM "(N = Dict size, L = Word length, V = Reachable words, M = Moves, P = Path length)\n" COLOR_RESET);
    printf("\n");
    printf(COLOR_BGREEN "  3. WHY IMPLICIT GRAPH INSTEAD OF ADJACENCY MATRIX?\n" COLOR_RESET);
    printf("     • With 33,000+ words, an adjacency matrix would require 33,000² = ~1.1 Billion\n");
    printf("       entries (~1.1 GB RAM). An explicit graph is completely infeasible in C.\n");
    printf("     • Implicit graph generation tests 26 × L candidate words and uses Binary Search,\n");
    printf("       reducing memory footprint to near zero!\n");
    printf("\n");
    printf(COLOR_BGREEN "  4. TEAM MEMBER RESPONSIBILITIES:\n" COLOR_RESET);
    printf("     • " COLOR_BOLD "Member 1 (Prachi Tiwari):" COLOR_RESET "      Dictionary loading, QuickSort, and iterative Binary Search.\n");
    printf("     • " COLOR_BOLD "Member 2 (Priyanshu Bisht):" COLOR_RESET "    BFS queue, implicit graph exploration, and shortest path.\n");
    printf("     • " COLOR_BOLD "Member 3 (Sumit Mehta):" COLOR_RESET "        Dual-Stack (Undo/Redo), Hamming metric & state engine.\n");
    printf("     • " COLOR_BOLD "Member 4 (Suraj Singh Bisht):" COLOR_RESET "  Doubly Linked List replay engine, telemetry, and terminal TUI.\n");
    printf("\n");
    ui_print_divider();
    printf("  Press [ENTER] to return to Main Menu... ");
    fflush(stdout);

    char temp[32];
    fgets(temp, sizeof(temp), stdin);
}
