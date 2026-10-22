/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: src/main.c
 * Description: Program entry point, menu coordinator, and module integration.
 * ============================================================================
 */

#include "common.h"
#include "dictionary.h"
#include "solver.h"
#include "game.h"
#include "display.h"

/* Preset classic word ladder puzzles */
typedef struct {
    const char *start;
    const char *target;
    int word_len;
    const char *difficulty;
} PuzzlePreset;

static const PuzzlePreset PRESETS[] = {
    {"cat",   "dog",   3, "Easy   (3 Letters)"},
    {"cold",  "warm",  4, "Medium (4 Letters)"},
    {"lead",  "gold",  4, "Medium (4 Letters)"},
    {"fool",  "sage",  4, "Medium (4 Letters)"},
    {"head",  "tail",  4, "Medium (4 Letters)"},
    {"stone", "money", 5, "Hard   (5 Letters)"}
};
static const int PRESET_COUNT = sizeof(PRESETS) / sizeof(PRESETS[0]);

/* Helper to safely read a line from stdin */
static bool get_user_input(char *buffer, size_t size, const char *prompt) {
    if (prompt) {
        printf("%s", prompt);
        fflush(stdout);
    }
    if (fgets(buffer, (int)size, stdin)) {
        str_trim(buffer);
        return true;
    } else {
        buffer[0] = '\0';
        return false;
    }
}

/* Play Mode Handler */
static void handle_play_mode(Dictionary *dict) {
    char input_buf[64];
    char start_word[MAX_WORD_LEN + 1];
    char target_word[MAX_WORD_LEN + 1];

    ui_clear_screen();
    ui_print_banner();
    printf(COLOR_BOLD "  SELECT PUZZLE OR ENTER CUSTOM:\n" COLOR_RESET);
    for (int i = 0; i < PRESET_COUNT; i++) {
        char s_u[MAX_WORD_LEN], t_u[MAX_WORD_LEN];
        str_to_upper(s_u, PRESETS[i].start);
        str_to_upper(t_u, PRESETS[i].target);
        printf("  " COLOR_BCYAN "[%d]" COLOR_RESET " %-6s ──▶ %-6s  " COLOR_DIM "(%s)\n" COLOR_RESET,
               i + 1, s_u, t_u, PRESETS[i].difficulty);
    }
    printf("  " COLOR_BYELLOW "[C]" COLOR_RESET " Custom Start & Target Word\n");
    printf("  " COLOR_BRED "[B]" COLOR_RESET " Back to Main Menu\n");
    ui_print_divider();

    get_user_input(input_buf, sizeof(input_buf), "  Select choice > ");
    if (strlen(input_buf) == 0) return;

    if (toupper((unsigned char)input_buf[0]) == 'B') {
        return;
    } else if (toupper((unsigned char)input_buf[0]) == 'C') {
        get_user_input(start_word, sizeof(start_word), "  Enter START word: ");
        get_user_input(target_word, sizeof(target_word), "  Enter TARGET word: ");
    } else {
        int idx = atoi(input_buf) - 1;
        if (idx >= 0 && idx < PRESET_COUNT) {
            strcpy(start_word, PRESETS[idx].start);
            strcpy(target_word, PRESETS[idx].target);
        } else {
            printf(COLOR_RED "  Invalid selection.\n" COLOR_RESET);
            SLEEP_MS(1000);
            return;
        }
    }

    str_trim(start_word);
    str_trim(target_word);

    if (strlen(start_word) != strlen(target_word)) {
        ui_clear_screen();
        ui_print_banner();
        printf(COLOR_BRED "  Error: Start and Target words must have the exact same length!\n" COLOR_RESET);
        printf("\n  Press [ENTER] to return...");
        fgets(input_buf, sizeof(input_buf), stdin);
        return;
    }

    if (!dict_contains(dict, start_word)) {
        ui_clear_screen();
        ui_print_banner();
        printf(COLOR_BRED "  Error: Start word '%s' was not found in dictionary!\n" COLOR_RESET, start_word);
        printf("\n  Press [ENTER] to return...");
        fgets(input_buf, sizeof(input_buf), stdin);
        return;
    }

    if (!dict_contains(dict, target_word)) {
        ui_clear_screen();
        ui_print_banner();
        printf(COLOR_BRED "  Error: Target word '%s' was not found in dictionary!\n" COLOR_RESET, target_word);
        printf("\n  Press [ENTER] to return...");
        fgets(input_buf, sizeof(input_buf), stdin);
        return;
    }

    /* Initialize game */
    GameState *game = game_create(dict, start_word, target_word);
    if (!game) {
        fprintf(stderr, "Failed to initialize game.\n");
        return;
    }

    char status_msg[128] = "";
    int status_type = 1; /* 1 = normal/success, 2 = hint, 3 = error */

    /* Game Play Loop */
    while (1) {
        ui_render_game_board(game, status_msg, status_type);
        status_msg[0] = '\0'; /* Clear message for next turn */

        if (!get_user_input(input_buf, sizeof(input_buf), NULL)) break;
        if (strlen(input_buf) == 0) continue;

        /* Check for commands */
        if (strlen(input_buf) == 1) {
            char cmd = (char)toupper((unsigned char)input_buf[0]);

            if (cmd == 'Q') {
                break;
            } else if (cmd == 'U') {
                char reverted[MAX_WORD_LEN] = "";
                if (game_undo_move(game, reverted)) {
                    char rev_u[MAX_WORD_LEN];
                    str_to_upper(rev_u, reverted);
                    snprintf(status_msg, sizeof(status_msg), "Undid move: '%s' reverted. (Press 'R' to Redo)", rev_u);
                    status_type = 1;
                } else {
                    snprintf(status_msg, sizeof(status_msg), "Already at the starting word! Cannot undo further.");
                    status_type = 3;
                }
                continue;
            } else if (cmd == 'R') {
                char restored[MAX_WORD_LEN] = "";
                if (game_redo_move(game, restored)) {
                    char res_u[MAX_WORD_LEN];
                    str_to_upper(res_u, restored);
                    snprintf(status_msg, sizeof(status_msg), "Redid move: '%s' restored from redo_stack.", res_u);
                    status_type = 1;
                } else {
                    snprintf(status_msg, sizeof(status_msg), "No moves available in redo_stack to restore!");
                    status_type = 3;
                }
                continue;
            } else if (cmd == 'H') {
                char *hint = solver_get_hint(dict, game->current_word, game->target_word);
                if (hint) {
                    char hint_u[MAX_WORD_LEN];
                    str_to_upper(hint_u, hint);
                    snprintf(status_msg, sizeof(status_msg), "Optimal next word is: [%s]", hint_u);
                    status_type = 2;
                    free(hint);
                } else {
                    snprintf(status_msg, sizeof(status_msg), "No valid transformation path to target word exists!");
                    status_type = 3;
                }
                continue;
            } else if (cmd == 'S') {
                /* Surrender & Auto-Solve */
                SolverMetrics metrics;
                char **path = solver_find_shortest_path(dict, game->current_word, game->target_word, &metrics);
                if (path) {
                    PathList *list = path_list_from_array(path, metrics.path_length);
                    ui_interactive_replay(list, game->current_word, game->target_word);
                    path_list_free(list);
                    solver_free_path(path, metrics.path_length);
                } else {
                    snprintf(status_msg, sizeof(status_msg), "No BFS solution exists between current word and target.");
                    status_type = 3;
                }
                continue;
            }
        }

        /* Player entered a word guess */
        char err[128];
        bool cycle_warning = false;
        if (game_make_move(game, input_buf, err, sizeof(err), &cycle_warning)) {
            if (cycle_warning) {
                char clean_u[MAX_WORD_LEN];
                str_to_upper(clean_u, input_buf);
                snprintf(status_msg, sizeof(status_msg), "Valid move, BUT cycle detected: '%s' was already in ladder!", clean_u);
                status_type = 2; /* Warning */
            } else {
                snprintf(status_msg, sizeof(status_msg), "Valid move! (d_H = 1)");
                status_type = 1;
            }

            if (game_is_won(game)) {
                ui_clear_screen();
                ui_print_banner();
                printf("\n");
                printf(COLOR_BGREEN COLOR_BOLD "  🎉 CONGRATULATIONS! YOU SOLVED THE PUZZLE! 🎉\n" COLOR_RESET);
                printf("  You reached " COLOR_BYELLOW "[%s]" COLOR_RESET " in " COLOR_BOLD "%d moves!\n" COLOR_RESET, 
                       game->target_word, game->moves_count);

                double eff = game_get_efficiency(game);
                const char *rank = game_get_rank(game);
                printf("\n  " COLOR_BOLD "PLAYER PERFORMANCE & EFFICIENCY (STATE MACHINE METRICS):\n" COLOR_RESET);
                printf("  • Optimal BFS Path : " COLOR_BOLD "%d moves\n" COLOR_RESET, game->optimal_moves);
                printf("  • Actual Moves     : " COLOR_BOLD "%d moves\n" COLOR_RESET, game->moves_count);
                printf("  • Path Efficiency  : " COLOR_BGREEN "%.1f%%\n" COLOR_RESET, eff);
                printf("  • Player Tier Rank : " COLOR_BYELLOW "%s\n" COLOR_RESET, rank);
                printf("  • Dual-Stack Stats : %d pushes | %d undos | %d redos executed\n", 
                       game->total_pushes, game->total_undos, game->total_redos);

                printf("\n");
                ui_print_divider();
                printf("  Press [ENTER] to return to Main Menu... ");
                fflush(stdout);
                fgets(input_buf, sizeof(input_buf), stdin);
                break;
            }
        } else {
            snprintf(status_msg, sizeof(status_msg), "%s", err);
            status_type = 3;
        }
    }

    game_free(game);
}

/* Auto-Solver Handler */
static void handle_auto_solver(Dictionary *dict) {
    char input_buf[64];
    char start_word[MAX_WORD_LEN + 1];
    char target_word[MAX_WORD_LEN + 1];

    ui_clear_screen();
    ui_print_banner();
    printf(COLOR_BOLD "  AUTO-SOLVER (BFS SHORTEST PATH & REPLAY)\n" COLOR_RESET);
    printf("  Select a preset or enter custom words to solve instantly:\n\n");

    for (int i = 0; i < PRESET_COUNT; i++) {
        char s_u[MAX_WORD_LEN], t_u[MAX_WORD_LEN];
        str_to_upper(s_u, PRESETS[i].start);
        str_to_upper(t_u, PRESETS[i].target);
        printf("  " COLOR_BCYAN "[%d]" COLOR_RESET " %-6s ──▶ %-6s  " COLOR_DIM "(%s)\n" COLOR_RESET,
               i + 1, s_u, t_u, PRESETS[i].difficulty);
    }
    printf("  " COLOR_BYELLOW "[C]" COLOR_RESET " Custom Words\n");
    printf("  " COLOR_BRED "[B]" COLOR_RESET " Back to Main Menu\n");
    ui_print_divider();

    get_user_input(input_buf, sizeof(input_buf), "  Select choice > ");
    if (strlen(input_buf) == 0) return;

    if (toupper((unsigned char)input_buf[0]) == 'B') {
        return;
    } else if (toupper((unsigned char)input_buf[0]) == 'C') {
        get_user_input(start_word, sizeof(start_word), "  Enter START word: ");
        get_user_input(target_word, sizeof(target_word), "  Enter TARGET word: ");
    } else {
        int idx = atoi(input_buf) - 1;
        if (idx >= 0 && idx < PRESET_COUNT) {
            strcpy(start_word, PRESETS[idx].start);
            strcpy(target_word, PRESETS[idx].target);
        } else {
            return;
        }
    }

    str_trim(start_word);
    str_trim(target_word);

    if (strlen(start_word) != strlen(target_word)) {
        printf(COLOR_BRED "  Error: Word lengths differ (%lu vs %lu letters).\n" COLOR_RESET, 
               strlen(start_word), strlen(target_word));
        SLEEP_MS(1500);
        return;
    }

    if (!dict_contains(dict, start_word) || !dict_contains(dict, target_word)) {
        printf(COLOR_BRED "  Error: One or both words do not exist in the dictionary.\n" COLOR_RESET);
        SLEEP_MS(1500);
        return;
    }

    SolverMetrics metrics;
    char **path = solver_find_shortest_path(dict, start_word, target_word, &metrics);

    ui_clear_screen();
    ui_print_banner();
    ui_render_metrics(&metrics, start_word, target_word);

    if (path) {
        printf("\n  " COLOR_BOLD "Shortest Word Ladder:" COLOR_RESET "\n  ");
        for (int i = 0; i < metrics.path_length; i++) {
            char u[MAX_WORD_LEN];
            str_to_upper(u, path[i]);
            printf(COLOR_BGREEN COLOR_BOLD "[%s]" COLOR_RESET, u);
            if (i < metrics.path_length - 1) printf(" ──▶ ");
        }
        printf("\n\n");
        ui_print_divider();
        printf("  " COLOR_BOLD "Launch Interactive Step-by-Step Replayer? [Y/n]: " COLOR_RESET);
        fflush(stdout);

        get_user_input(input_buf, sizeof(input_buf), NULL);
        if (strlen(input_buf) == 0 || toupper((unsigned char)input_buf[0]) == 'Y') {
            PathList *list = path_list_from_array(path, metrics.path_length);
            ui_interactive_replay(list, start_word, target_word);
            path_list_free(list);
        }

        solver_free_path(path, metrics.path_length);
    } else {
        printf(COLOR_BRED "\n  No transformation path exists in the word graph between '%s' and '%s'.\n" COLOR_RESET,
               start_word, target_word);
        printf("\n  Press [ENTER] to return...");
        fgets(input_buf, sizeof(input_buf), stdin);
    }
}

/* Benchmark Handler */
static void handle_benchmark(Dictionary *dict) {
    ui_clear_screen();
    ui_print_banner();
    printf(COLOR_BOLD "  BATCH ALGORITHM BENCHMARK & TELEMETRY TEST\n" COLOR_RESET);
    printf("  Running BFS traversal over implicit graph across test pairs:\n");
    ui_print_divider();

    const char *test_pairs[][2] = {
        {"cat",   "dog"},
        {"cold",  "warm"},
        {"lead",  "gold"},
        {"fool",  "sage"},
        {"head",  "tail"},
        {"stone", "money"}
    };
    int num_tests = sizeof(test_pairs) / sizeof(test_pairs[0]);

    for (int i = 0; i < num_tests; i++) {
        SolverMetrics m;
        char **path = solver_find_shortest_path(dict, test_pairs[i][0], test_pairs[i][1], &m);
        ui_render_metrics(&m, test_pairs[i][0], test_pairs[i][1]);
        if (path) {
            solver_free_path(path, m.path_length);
        }
    }

    printf("\n  Press [ENTER] to return to Main Menu... ");
    fflush(stdout);
    char buf[32];
    fgets(buf, sizeof(buf), stdin);
}

int main(void) {
    /* Step 1: Load Dictionary */
    printf(COLOR_BCYAN "Loading WordBridge dictionary..." COLOR_RESET "\n");
    Dictionary *dict = dict_load(DEFAULT_DICT_PATH, 0);

    /* Fallback to sample dictionary if main dictionary not found */
    if (!dict) {
        printf(COLOR_BYELLOW "Trying fallback dictionary: %s" COLOR_RESET "\n", SAMPLE_DICT_PATH);
        dict = dict_load(SAMPLE_DICT_PATH, 0);
    }

    if (!dict || dict->count == 0) {
        fprintf(stderr, COLOR_RED "Fatal Error: Unable to load dictionary. Exiting.\n" COLOR_RESET);
        return 1;
    }

    char choice_buf[32];
    bool running = true;

    while (running) {
        ui_print_menu();
        if (!get_user_input(choice_buf, sizeof(choice_buf), NULL)) break;

        if (strlen(choice_buf) == 0) continue;

        switch (choice_buf[0]) {
            case '1':
                handle_play_mode(dict);
                break;
            case '2':
                handle_auto_solver(dict);
                break;
            case '3':
                handle_benchmark(dict);
                break;
            case '4':
                ui_print_viva_defense();
                break;
            case '5':
            case 'q':
            case 'Q':
                running = false;
                break;
            default:
                printf(COLOR_BRED "  Invalid choice! Please select 1-5.\n" COLOR_RESET);
                SLEEP_MS(1000);
                break;
        }
    }

    /* Cleanup memory */
    dict_free(dict);

    ui_clear_screen();
    printf(COLOR_BGREEN "Thank you for playing WordBridge! Goodbye.\n" COLOR_RESET);
    return 0;
}
