/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * File: include/dictionary.h | Module 1 - Member 1: Prachi Tiwari
 * Role: Dictionary Storage, QuickSort & Binary Search Engine
 * ============================================================================
 *
 * QUICK DSA SUMMARY (FOR VIVA):
 * 1. DYNAMIC ARRAY: Heap array with 2x doubling; amortized O(1) word insertion.
 * 2. MEDIAN-OF-3 QUICKSORT: Picks median of {low, mid, high} to prevent O(N^2)
 *    and stack overflow on sorted files. Uses tail recursion: stack <= O(log N).
 * 3. BINARY SEARCH: Iterative O(log N) lookup (<= 16 comparisons for 33k words).
 * 4. DEDUPLICATION: In-place two-pointer removal of consecutive duplicates in O(N).
 * ============================================================================
 */

#ifndef DICTIONARY_H
#define DICTIONARY_H

#include "common.h"

/**
 * Dictionary Structure:
 * Represents the lexical search space. Stores words in an alphabetically
 * sorted dynamic array of pointers to facilitate O(log N) binary search.
 */
typedef struct {
    char **words;       /* Dynamic array of string pointers (heap allocated) */
    int count;          /* Current number of active unique words */
    int capacity;       /* Total allocated memory capacity */
    int word_len;       /* Length filter applied (e.g. 4 for 4-letter words, or 0 for all) */
} Dictionary;

/**
 * Loads words from disk into memory.
 * - Reads word entries using fgets and sanitizes lowercase alphabetic characters
 * - Dynamically expands capacity using realloc (amortized O(1) growth)
 * - Invokes dict_quicksort() to alphabetically sort words in O(N log N)
 * - Performs a single-pass O(N) duplicate removal
 * Time Complexity:  O(N log N) due to sorting step
 * Space Complexity: O(N) heap memory for string storage
 */
Dictionary* dict_load(const char *filename, int filter_len);

/**
 * Performs iterative Binary Search on the sorted words array.
 * Algorithm:
 *   Repeatedly divides the search interval [low, high] in half.
 *   Compares middle word with target using strcmp().
 * Time Complexity:  O(log N) comparisons (at most ceil(log2(33756)) = 16 comparisons)
 * Space Complexity: O(1) auxiliary space (iterative, no recursion stack overhead)
 * Returns the 0-based index if found, or -1 if the word does not exist.
 */
int dict_binary_search(const Dictionary *dict, const char *word);

/**
 * High-level lookup wrapper.
 * Returns true if word is present in the dictionary, false otherwise.
 */
bool dict_contains(const Dictionary *dict, const char *word);

/**
 * Array index lookup accessor with bounds checking.
 * Time Complexity: O(1)
 */
const char* dict_get(const Dictionary *dict, int index);

/**
 * In-place QuickSort sorting algorithm.
 * Employs Median-of-Three partitioning and tail-call recursion optimization.
 * Parameters:
 *   words: The dynamic array of string pointers
 *   low:   Starting index of the sub-array
 *   high:  Ending index of the sub-array
 * Time Complexity:  O(N log N)
 * Space Complexity: O(log N) recursion call stack depth guaranteed
 */
void dict_quicksort(char **words, int low, int high);

/**
 * Complete deallocation routine.
 * Iterates through every dynamically allocated word and frees both
 * individual strings and the container pointer table to ensure zero memory leaks.
 * Space Released: Entire heap footprint of the dictionary
 */
void dict_free(Dictionary *dict);

#endif /* DICTIONARY_H */
