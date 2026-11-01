/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: src/solver.c
 * Module 2 - Member 2: BFS Auto-Solver & Queue
 * ============================================================================
 */

#include "solver.h"

/* Linked FIFO queue: append at rear and remove at front in O(1) time. */

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

bool queue_push(Queue *q, int dict_index) {
    if (!q) return false;

    QueueNode *node = (QueueNode *)malloc(sizeof(QueueNode));
    if (!node) {
        perror("Failed to allocate QueueNode");
        return false;
    }
    node->dict_index = dict_index;
    node->next = NULL;

    if (q->rear == NULL) {
        q->front = q->rear = node;
    } else {
        q->rear->next = node;
        q->rear = node;
    }
    q->size++;
    return true;
}

int queue_pop(Queue *q) {
    if (!q || q->front == NULL) return -1;

    QueueNode *temp = q->front;
    int index = temp->dict_index;

    q->front = q->front->next;
    if (q->front == NULL) {
        q->rear = NULL;
    }
    free(temp);
    q->size--;
    return index;
}

bool queue_is_empty(const Queue *q) {
    return (q == NULL || q->front == NULL);
}

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

/* Hamming distance counts mismatched character positions in equal-length words. */

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

bool diff_by_one(const char *w1, const char *w2) {
    return word_difference_count(w1, w2) == 1;
}

/* BFS explores an implicit graph whose vertices are dictionary words and
 * whose edges connect words at Hamming distance one. */

char** solver_find_shortest_path(const Dictionary *dict, 
                                 const char *start, 
                                 const char *target, 
                                 SolverMetrics *metrics) {
    if (metrics) {
        metrics->found = false;
        metrics->path_length = 0;
        metrics->nodes_expanded = 0;
        metrics->max_queue_size = 0;
        metrics->time_taken_ms = 0.0;
        metrics->allocation_failed = false;
    }

    if (!dict || !start || !target || dict->count == 0) return NULL;

    char start_clean[MAX_WORD_LEN + 1];
    char target_clean[MAX_WORD_LEN + 1];
    str_to_lower(start_clean, start);
    str_to_lower(target_clean, target);

    if (strlen(start_clean) != strlen(target_clean)) {
        return NULL;
    }

    int start_idx = dict_binary_search(dict, start_clean);
    int target_idx = dict_binary_search(dict, target_clean);

    if (start_idx == -1 || target_idx == -1) {
        return NULL;
    }

    clock_t clock_start = clock();

    /* Same word edge case */
    if (start_idx == target_idx) {
        char **path = (char **)calloc(2, sizeof(char *));
        if (path) {
            path[0] = (char *)malloc(strlen(start_clean) + 1);
        }
        if (!path || !path[0]) {
            perror("Failed to allocate shortest path");
            free(path);
            if (metrics) metrics->allocation_failed = true;
            return NULL;
        }
        strcpy(path[0], start_clean);
        if (metrics) {
            metrics->found = true;
            metrics->path_length = 1;
            metrics->nodes_expanded = 1;
            metrics->time_taken_ms = (double)(clock() - clock_start) * 1000.0 / CLOCKS_PER_SEC;
        }
        return path;
    }

    /* visited prevents re-enqueueing vertices; parent records the BFS tree
     * used later to rebuild the shortest path. */
    bool *visited = (bool *)calloc(dict->count, sizeof(bool));
    int *parent = (int *)malloc(sizeof(int) * dict->count);
    if (!visited || !parent) {
        perror("Failed to allocate BFS lookup arrays");
        free(visited);
        free(parent);
        if (metrics) metrics->allocation_failed = true;
        return NULL;
    }

    for (int i = 0; i < dict->count; i++) {
        parent[i] = -1;
    }

    Queue *q = queue_create();
    if (!q) {
        free(visited);
        free(parent);
        if (metrics) metrics->allocation_failed = true;
        return NULL;
    }

    /* FIFO order explores paths by increasing number of moves. */
    visited[start_idx] = true;
    bool allocation_failed = !queue_push(q, start_idx);

    int nodes_expanded = 0;
    int peak_queue = 1;
    bool found_target = false;
    size_t word_len = strlen(start_clean);
    char neighbor_candidate[MAX_WORD_LEN + 1];

    /* BFS Main Traversal Loop */
    while (!allocation_failed && !queue_is_empty(q)) {
        if (q->size > peak_queue) {
            peak_queue = q->size;
        }

        int curr_idx = queue_pop(q);
        nodes_expanded++;

        if (curr_idx == target_idx) {
            found_target = true;
            break;
        }

        const char *curr_word = dict_get(dict, curr_idx);
        strcpy(neighbor_candidate, curr_word);

        /* Generate graph neighbors on demand instead of storing an adjacency list.
         * Binary search checks each of the 25 * word_len substitutions. */
        for (size_t pos = 0; pos < word_len; pos++) {
            char original_char = neighbor_candidate[pos];

            for (char ch = 'a'; ch <= 'z'; ch++) {
                if (ch == original_char) continue;

                neighbor_candidate[pos] = ch;
                int nbr_idx = dict_binary_search(dict, neighbor_candidate);

                if (nbr_idx != -1 && !visited[nbr_idx]) {
                    /* Mark on enqueue so each vertex enters the queue only once;
                     * its first parent is on a shortest BFS path. */
                    visited[nbr_idx] = true;
                    parent[nbr_idx] = curr_idx;
                    if (!queue_push(q, nbr_idx)) {
                        allocation_failed = true;
                        break;
                    }

                    if (nbr_idx == target_idx) {
                        found_target = true;
                        goto bfs_finish;
                    }
                }
            }
            neighbor_candidate[pos] = original_char; /* Restore char */
            if (allocation_failed) break;
        }
    }

bfs_finish:
    queue_free(q);

    clock_t clock_end = clock();
    double elapsed_ms = (double)(clock_end - clock_start) * 1000.0 / CLOCKS_PER_SEC;

    char **result_path = NULL;

    if (allocation_failed) {
        if (metrics) {
            metrics->allocation_failed = true;
            metrics->nodes_expanded = nodes_expanded;
            metrics->max_queue_size = peak_queue;
            metrics->time_taken_ms = elapsed_ms;
        }
    } else if (found_target) {
        /* Follow BFS parent links from target to start, then fill the result
         * array backwards so callers receive start-to-target order. */
        int step_count = 0;
        int curr = target_idx;
        while (curr != -1) {
            step_count++;
            curr = parent[curr];
        }

        result_path = (char **)calloc((size_t)step_count + 1, sizeof(char *));
        if (result_path) {
            curr = target_idx;
            for (int i = step_count - 1; i >= 0; i--) {
                const char *w = dict_get(dict, curr);
                result_path[i] = (char *)malloc(strlen(w) + 1);
                if (!result_path[i]) {
                    perror("Failed to allocate shortest path word");
                    solver_free_path(result_path, step_count);
                    result_path = NULL;
                    allocation_failed = true;
                    break;
                }
                strcpy(result_path[i], w);
                curr = parent[curr];
            }
        } else {
            perror("Failed to allocate shortest path");
            allocation_failed = true;
        }

        if (metrics) {
            metrics->found = !allocation_failed;
            metrics->allocation_failed = allocation_failed;
            metrics->path_length = allocation_failed ? 0 : step_count;
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

    free(visited);
    free(parent);
    return result_path;
}

void solver_free_path(char **path, int path_length) {
    if (!path) return;
    for (int i = 0; i < path_length; i++) {
        if (path[i]) {
            free(path[i]);
        }
    }
    free(path);
}

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
