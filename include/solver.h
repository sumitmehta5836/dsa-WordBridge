/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * File: include/solver.h | Module 2 - Member 2: Priyanshu Bisht
 * Role: BFS Auto-Solver, Queue (FIFO) & Implicit Word Graph Engine
 * ============================================================================
 *
 * DSA CONCEPTS USED
 * 1. QUEUE (FIFO): Linked list with front/rear pointers; strictly O(1) push and pop.
 * 2. IMPLICIT GRAPH: Generates 26 * L neighbors on-the-fly; eliminates 1.14 GB
 *    adjacency matrix (33,756^2 cells). Checked in O(log N) via Binary Search.
 * 3. BREADTH-FIRST SEARCH (BFS): Explores level-by-level; mathematically guaranteed
 *    to find the shortest unweighted path (minimum word transformations).
 * 4. TRACKING: visited[] prevents loops in O(1); parent[] backtracks shortest path in O(P).
 * ============================================================================
 */

#ifndef SOLVER_H
#define SOLVER_H

#include "common.h"
#include "dictionary.h"

/**
 * Queue Node:
 * Singly linked element storing the dictionary integer index of an enqueued word.
 * Storing index (int) instead of raw strings saves memory and enables O(1) array lookups.
 */
typedef struct QueueNode {
    int dict_index;             /* 0-based index of word in Dictionary->words */
    struct QueueNode *next;     /* Pointer to next node in FIFO sequence */
} QueueNode;

/**
 * Queue Structure (First-In, First-Out):
 * Maintains head (front) and tail (rear) pointers to achieve O(1) operations.
 */
typedef struct {
    QueueNode *front;           /* Dequeue pointer (head of queue) */
    QueueNode *rear;            /* Enqueue pointer (tail of queue) */
    int size;                   /* Active number of elements currently queued */
} Queue;

/**
 * Telemetry and benchmarking metrics for the BFS solver.
 * Captured in real-time to analyze algorithm efficiency for viva presentation.
 */
typedef struct {
    int path_length;        /* Total words in optimal ladder (including start & target) */
    int nodes_expanded;     /* Total words dequeued and explored during search */
    int max_queue_size;     /* Peak memory footprint (maximum simultaneous queued nodes) */
    double time_taken_ms;   /* Search execution duration measured with clock() */
    bool found;             /* True if a valid word ladder connects start and target */
} SolverMetrics;

/* ----------------------------------------------------------------------------
 * Queue Operations (Member 2: Custom FIFO Implementation)
 * ---------------------------------------------------------------------------- */

/**
 * Allocates and initializes an empty FIFO Queue on the heap.
 * Time Complexity:  O(1)
 * Space Complexity: O(1)
 */
Queue* queue_create(void);

/**
 * Inserts a dictionary word index at the rear of the Queue.
 * Time Complexity:  O(1)
 * Space Complexity: O(1)
 */
void queue_push(Queue *q, int dict_index);

/**
 * Removes and returns the dictionary word index from the front of the Queue.
 * Time Complexity:  O(1)
 * Space Complexity: O(1)
 * Returns -1 if the queue is empty.
 */
int queue_pop(Queue *q);

/**
 * Checks whether the Queue contains zero elements.
 * Time Complexity:  O(1)
 */
bool queue_is_empty(const Queue *q);

/**
 * Frees all linked nodes in the queue and releases the Queue container.
 * Time Complexity:  O(K) where K is number of queued elements
 * Space Complexity: O(1) auxiliary
 */
void queue_free(Queue *q);

/* ----------------------------------------------------------------------------
 * Information Theory & Distance Metrics
 * ---------------------------------------------------------------------------- */

/**
 * Computes the Hamming distance (number of differing character positions)
 * between two strings of identical length.
 * Time Complexity:  O(L) where L is the word length
 * Space Complexity: O(1)
 * Returns difference count, or -1 if string lengths do not match.
 */
int word_difference_count(const char *w1, const char *w2);

/**
 * Predicate to check if two words differ by exactly 1 single letter.
 * Validates the core rule of Word Ladder puzzle transitions.
 * Time Complexity:  O(L)
 */
bool diff_by_one(const char *w1, const char *w2);

/* ----------------------------------------------------------------------------
 * Graph Search & Path Reconstruction Engine
 * ---------------------------------------------------------------------------- */

/**
 * Breadth-First Search (BFS) Auto-Solver.
 *
 * Algorithm Outline:
 * 1. Validates start and target word presence via Binary Search O(log N).
 * 2. Initializes `visited[N]` boolean table (O(N)) and `parent[N]` tracking array.
 * 3. Enqueues start word index into FIFO queue.
 * 4. While queue is not empty:
 *    a. Dequeue front word index `curr_idx`.
 *    b. Generate all 26 * L single-character substitutions (Implicit Graph Edges).
 *    c. Check each candidate in dictionary via Binary Search O(log N).
 *    d. If valid and not visited: mark visited, set parent[nbr] = curr_idx, enqueue.
 *    e. If target is reached: terminate search immediately (guaranteed shortest).
 * 5. Reconstructs optimal path array by backtracking `parent` pointers.
 *
 * Complexity:
 *   Time Complexity:  O(V + E) = O(V + 26 * L * log N)
 *   Space Complexity: O(V) for visited[], parent[] and Queue
 *
 * Returns NULL-terminated array of dynamically allocated string words.
 * Caller is responsible for freeing with solver_free_path().
 */
char** solver_find_shortest_path(const Dictionary *dict, 
                                 const char *start, 
                                 const char *target, 
                                 SolverMetrics *metrics);

/**
 * Frees dynamically allocated path string array returned by solver_find_shortest_path().
 * Time Complexity: O(P) where P is path length.
 */
void solver_free_path(char **path, int path_length);

/**
 * Computes the single next optimal move (hint) from current to target.
 * Leverages BFS shortest path to extract index 1 (the next recommended step).
 * Returns heap-allocated string, or NULL if unreachable.
 */
char* solver_get_hint(const Dictionary *dict, const char *current, const char *target);

#endif /* SOLVER_H */
