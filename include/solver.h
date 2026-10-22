/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: include/solver.h
 * Module 2 - Member 2: BFS Auto-Solver & Queue
 * ============================================================================
 */

#ifndef SOLVER_H
#define SOLVER_H

#include "common.h"
#include "dictionary.h"

/**
 * Queue Node for FIFO queue in Breadth-First Search.
 * Stores dictionary index of the word.
 */
typedef struct QueueNode {
    int dict_index;
    struct QueueNode *next;
} QueueNode;

/**
 * Queue structure implemented from scratch using linked nodes.
 */
typedef struct {
    QueueNode *front;
    QueueNode *rear;
    int size;
} Queue;

/**
 * Telemetry and benchmarking metrics for the BFS solver.
 */
typedef struct {
    int path_length;        /* Number of words in optimal ladder */
    int nodes_expanded;     /* Total words visited during BFS traversal */
    int max_queue_size;     /* Peak memory footprint of BFS queue */
    double time_taken_ms;   /* Wall-clock search duration in milliseconds */
    bool found;             /* True if a path exists between start and target */
} SolverMetrics;

/* Queue Operations */
Queue* queue_create(void);
void queue_push(Queue *q, int dict_index);
int queue_pop(Queue *q);
bool queue_is_empty(const Queue *q);
void queue_free(Queue *q);

/**
 * Computes the Hamming distance (number of differing characters)
 * between two words of equal length.
 * Returns the count of differences, or -1 if lengths differ.
 */
int word_difference_count(const char *w1, const char *w2);

/**
 * Checks if two words differ by exactly one single letter.
 */
bool diff_by_one(const char *w1, const char *w2);

/**
 * Breadth-First Search (BFS) Auto-Solver.
 * Computes the optimal (shortest) transformation path from start to target.
 * Returns an array of dynamically allocated string words ending with NULL.
 * Returns NULL if no path exists.
 * Fills metrics with search statistics.
 */
char** solver_find_shortest_path(const Dictionary *dict, 
                                 const char *start, 
                                 const char *target, 
                                 SolverMetrics *metrics);

/**
 * Frees the path array returned by solver_find_shortest_path.
 */
void solver_free_path(char **path, int path_length);

/**
 * Computes the single next optimal move (hint) from current to target.
 * Returns a dynamically allocated string, or NULL if no path.
 */
char* solver_get_hint(const Dictionary *dict, const char *current, const char *target);

#endif /* SOLVER_H */
