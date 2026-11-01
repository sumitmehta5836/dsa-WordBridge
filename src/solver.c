/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * File: src/solver.c | Module 2 - Member 2: Priyanshu Bisht
 * Role: BFS Auto-Solver, Queue (FIFO) & Implicit Word Graph Engine
 * ============================================================================
 *
 * DSA CONCEPTS USED: 
 * 1. QUEUE (FIFO): Linked list with front/rear pointers; strictly O(1) push and pop.
 * 2. IMPLICIT GRAPH: Generates 26 * L neighbors on-the-fly; avoids 1.14 GB matrix.
 *    Validates candidates via Member 1's Binary Search in O(log N).
 * 3. BREADTH-FIRST SEARCH (BFS): Level-by-level search guarantees shortest path.
 * 4. BACKTRACKING: parent[] array reconstructs optimal ladder in reverse O(P).
 * ============================================================================
 */

#include "solver.h"

/* ============================================================================
 * 1. QUEUE DATA STRUCTURE IMPLEMENTATION (FIFO)
 * ============================================================================ */

/**
 * Initializes a new empty Queue on the heap.
 * Complexity: O(1) time | O(1) space
 */
Queue* queue_create(void) {
    Queue *q = (Queue *)malloc(sizeof(Queue));
    if (!q) {
        perror("Failed to allocate Queue");
        return NULL;
    }
    q->front = NULL;
    q->rear = NULL;
    q->size = 0;
    return q;
}

/**
 * Inserts a dictionary index at the tail (rear) of the queue.
 * Maintains FIFO ordering by appending to q->rear->next.
 * Complexity: O(1) time | O(1) auxiliary space per node
 */
void queue_push(Queue *q, int dict_index) {
    if (!q) return;

    QueueNode *node = (QueueNode *)malloc(sizeof(QueueNode));
    if (!node) {
        perror("Failed to allocate QueueNode");
        return;
    }
    node->dict_index = dict_index;
    node->next = NULL;

    /* If queue is currently empty, new node becomes both front and rear */
    if (q->rear == NULL) {
        q->front = q->rear = node;
    } else {
        q->rear->next = node;
        q->rear = node;
    }
    q->size++;
}

/**
 * Dequeues and returns the dictionary index from the head (front) of the queue.
 * Complies with FIFO property (oldest inserted element is served first).
 * Complexity: O(1) time | O(1) space
 */
int queue_pop(Queue *q) {
    if (!q || q->front == NULL) return -1;

    QueueNode *temp = q->front;
    int index = temp->dict_index;

    q->front = q->front->next;
    /* If queue is now empty, reset rear pointer to NULL */
    if (q->front == NULL) {
        q->rear = NULL;
    }
    free(temp);
    q->size--;
    return index;
}

/**
 * Returns true if the queue contains no elements.
 * Complexity: O(1) time
 */
bool queue_is_empty(const Queue *q) {
    return (q == NULL || q->front == NULL);
}

/**
 * Deallocates all remaining nodes in the queue to eliminate memory leaks.
 * Complexity: O(K) where K is number of nodes in queue | O(1) auxiliary space
 */
void queue_free(Queue *q) {
    if (!q) return;
    QueueNode *curr = q->front;
    while (curr != NULL) {
        QueueNode *next = curr->next;
        free(curr);
        curr = next;
    }
    free(q);
}

/* ============================================================================
 * 2. HAMMING DISTANCE & STRING VALIDATION
 * ============================================================================ */

/**
 * Computes the Hamming distance (number of mismatched characters).
 * In information theory, the Hamming distance d_H(s1, s2) between two strings
 * of equal length is the minimum number of single-character substitutions
 * needed to transform s1 into s2.
 * Complexity: O(L) time where L is word length | O(1) space
 */
int word_difference_count(const char *w1, const char *w2) {
    if (!w1 || !w2) return -1;
    size_t len1 = strlen(w1);
    size_t len2 = strlen(w2);
    if (len1 != len2) return -1;

    int diff = 0;
    for (size_t i = 0; i < len1; i++) {
        if (tolower((unsigned char)w1[i]) != tolower((unsigned char)w2[i])) {
            diff++;
        }
    }
    return diff;
}

/**
 * Returns true if two words differ by exactly 1 character (Hamming distance == 1).
 * Validates legal word ladder transitions.
 */
bool diff_by_one(const char *w1, const char *w2) {
    return word_difference_count(w1, w2) == 1;
}

/* ============================================================================
 * 3. BREADTH-FIRST SEARCH (BFS) AUTO-SOLVER & IMPLICIT GRAPH EXPLORATION
 * ============================================================================ */

/**
 * Computes the shortest transformation path between start and target word.
 *
 * Algorithmic Strategy:
 * 1. Checks start & target word existence in dictionary via Binary Search O(log N).
 * 2. Allocates `visited` array (O(|V|)) and `parent` array (O(|V|)).
 * 3. Enqueues start index.
 * 4. Dequeues nodes level-by-level. For each word:
 *      Generates 26 * L candidate strings on-the-fly (Implicit Graph).
 *      Checks each candidate with Binary Search O(log N).
 *      If valid and unvisited, records parent and enqueues.
 * 5. Stops immediately when target is dequeued or enqueued (first discovery is optimal).
 * 6. Backtracks from target to start via parent pointers to build solution array.
 *
 * Complexity:
 *   Time:  O(V + 26 * L * log N)
 *   Space: O(V) for visited[] + parent[] + Queue
 */
char** solver_find_shortest_path(const Dictionary *dict, 
                                 const char *start, 
                                 const char *target, 
                                 SolverMetrics *metrics) {
    /* Initialize telemetry metrics */
    if (metrics) {
        metrics->found = false;
        metrics->path_length = 0;
        metrics->nodes_expanded = 0;
        metrics->max_queue_size = 0;
        metrics->time_taken_ms = 0.0;
    }

    if (!dict || !start || !target || dict->count == 0) return NULL;

    /* Normalize inputs to lowercase */
    char start_clean[MAX_WORD_LEN + 1];
    char target_clean[MAX_WORD_LEN + 1];
    str_to_lower(start_clean, start);
    str_to_lower(target_clean, target);

    /* Words must have identical length */
    if (strlen(start_clean) != strlen(target_clean)) {
        return NULL;
    }

    /* Locate starting and target word indices using Member 1's Binary Search O(log N) */
    int start_idx = dict_binary_search(dict, start_clean);
    int target_idx = dict_binary_search(dict, target_clean);

    if (start_idx == -1 || target_idx == -1) {
        return NULL;
    }

    clock_t clock_start = clock();

    /* Edge Case: Start and target are identical word */
    if (start_idx == target_idx) {
        char **path = (char **)malloc(sizeof(char *) * 2);
        path[0] = (char *)malloc(strlen(start_clean) + 1);
        strcpy(path[0], start_clean);
        path[1] = NULL;
        if (metrics) {
            metrics->found = true;
            metrics->path_length = 1;
            metrics->nodes_expanded = 1;
            metrics->time_taken_ms = (double)(clock() - clock_start) * 1000.0 / CLOCKS_PER_SEC;
        }
        return path;
    }

    /* State Tracking Arrays:
     * - `visited[i]`: Boolean flag preventing cycles and redundant re-expansions (O(1) test).
     * - `parent[i]`: Predecessor map storing the index of the word that discovered word `i`.
     */
    bool *visited = (bool *)calloc(dict->count, sizeof(bool));
    int *parent = (int *)malloc(sizeof(int) * dict->count);
    if (!visited || !parent) {
        perror("Failed to allocate BFS lookup arrays");
        free(visited);
        free(parent);
        return NULL;
    }

    /* Initialize all parent pointers to -1 (indicating unvisited / root) */
    for (int i = 0; i < dict->count; i++) {
        parent[i] = -1;
    }

    /* Create FIFO Queue for level-order BFS traversal */
    Queue *q = queue_create();
    if (!q) {
        free(visited);
        free(parent);
        return NULL;
    }

    /* Enqueue root node */
    visited[start_idx] = true;
    queue_push(q, start_idx);

    int nodes_expanded = 0;
    int peak_queue = 1;
    bool found_target = false;
    size_t word_len = strlen(start_clean);
    char neighbor_candidate[MAX_WORD_LEN + 1];

    /* ------------------------------------------------------------------------
     * BFS Core Traversal Loop:
     * Dequeues words in FIFO order, exploring shortest paths in increasing levels.
     * ------------------------------------------------------------------------ */
    while (!queue_is_empty(q)) {
        int curr_idx = queue_pop(q);
        nodes_expanded++;

        const char *curr_word = dict_get(dict, curr_idx);
        strcpy(neighbor_candidate, curr_word);

        /* Implicit Graph Neighborhood Generation:
         * Generates all 26 * L single-character variants of curr_word.
         * For a 4-letter word: 4 * 26 = 104 candidates checked via Binary Search.
         */
        for (size_t pos = 0; pos < word_len; pos++) {
            char original_char = neighbor_candidate[pos];

            for (char ch = 'a'; ch <= 'z'; ch++) {
                if (ch == original_char) continue;

                neighbor_candidate[pos] = ch;
                /* Validate existence in dictionary in O(log N) */
                int nbr_idx = dict_binary_search(dict, neighbor_candidate);

                /* If word exists and hasn't been visited yet, relax the edge */
                if (nbr_idx != -1 && !visited[nbr_idx]) {
                    visited[nbr_idx] = true;
                    parent[nbr_idx] = curr_idx;
                    queue_push(q, nbr_idx);

                    /* Track peak queue memory footprint */
                    if (q->size > peak_queue) {
                        peak_queue = q->size;
                    }

                    /* Short-circuit early exit: BFS guarantees first discovery is optimal */
                    if (nbr_idx == target_idx) {
                        found_target = true;
                        goto bfs_finish;
                    }
                }
            }
            neighbor_candidate[pos] = original_char; /* Restore character for next position */
        }
    }

bfs_finish:
    queue_free(q);

    clock_t clock_end = clock();
    double elapsed_ms = (double)(clock_end - clock_start) * 1000.0 / CLOCKS_PER_SEC;

    char **result_path = NULL;

    /* ------------------------------------------------------------------------
     * Path Reconstruction via Predecessor Array Backtracking:
     * Starting at target_idx, walk backwards: parent[target] -> parent[parent[target]]...
     * until root (parent == -1) is reached.
     * ------------------------------------------------------------------------ */
    if (found_target) {
        /* Pass 1: Count ladder depth */
        int step_count = 0;
        int curr = target_idx;
        while (curr != -1) {
            step_count++;
            curr = parent[curr];
        }

        /* Pass 2: Allocate array and populate in forward chronological order */
        result_path = (char **)malloc(sizeof(char *) * (step_count + 1));
        if (result_path) {
            curr = target_idx;
            for (int i = step_count - 1; i >= 0; i--) {
                const char *w = dict_get(dict, curr);
                result_path[i] = (char *)malloc(strlen(w) + 1);
                if (result_path[i]) {
                    strcpy(result_path[i], w);
                }
                curr = parent[curr];
            }
            result_path[step_count] = NULL; /* NULL terminator */
        }

        /* Record telemetry metrics */
        if (metrics) {
            metrics->found = true;
            metrics->path_length = step_count;
            metrics->nodes_expanded = nodes_expanded;
            metrics->max_queue_size = peak_queue;
            metrics->time_taken_ms = elapsed_ms;
        }
    } else {
        if (metrics) {
            metrics->found = false;
            metrics->path_length = 0;
            metrics->nodes_expanded = nodes_expanded;
            metrics->max_queue_size = peak_queue;
            metrics->time_taken_ms = elapsed_ms;
        }
    }

    /* Release temporary tracking arrays */
    free(visited);
    free(parent);
    return result_path;
}

/**
 * Deallocates a dynamically created path string array.
 * Complexity: O(P) where P is path length
 */
void solver_free_path(char **path, int path_length) {
    if (!path) return;
    for (int i = 0; i < path_length; i++) {
        if (path[i]) {
            free(path[i]);
        }
    }
    free(path);
}

/**
 * Intelligent Hint Generation:
 * Runs BFS from the player's `current` word to `target`.
 * Extracts path[1] (the immediate next step along the mathematically optimal ladder).
 * Complexity: O(BFS search time)
 */
char* solver_get_hint(const Dictionary *dict, const char *current, const char *target) {
    SolverMetrics metrics;
    char **path = solver_find_shortest_path(dict, current, target, &metrics);
    if (!path) return NULL;

    char *hint = NULL;
    if (metrics.path_length >= 2) {
        hint = (char *)malloc(strlen(path[1]) + 1);
        if (hint) {
            strcpy(hint, path[1]);
        }
    }

    solver_free_path(path, metrics.path_length);
    return hint;
}
