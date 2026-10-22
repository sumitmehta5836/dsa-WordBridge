/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: include/dictionary.h
 * Module 1 - Member 1: Dictionary & Binary Search
 * ============================================================================
 */

#ifndef DICTIONARY_H
#define DICTIONARY_H

#include "common.h"

/**
 * Dictionary structure:
 * Dynamic array of strings sorted alphabetically for O(log N) binary search.
 */
typedef struct {
    char **words;       /* Array of string pointers */
    int count;          /* Current number of words */
    int capacity;       /* Allocated capacity */
    int word_len;       /* Length of words filtered, or 0 if unfiltered */
} Dictionary;

/**
 * Loads words from a file into a sorted Dictionary structure.
 * If filter_len > 0, only words with that exact length are loaded.
 * Returns NULL on failure.
 */
Dictionary* dict_load(const char *filename, int filter_len);

/**
 * Performs iterative Binary Search on the sorted dictionary array.
 * Time Complexity: O(log N)
 * Returns the index of the word if found, or -1 if not found.
 */
int dict_binary_search(const Dictionary *dict, const char *word);

/**
 * Checks if a word exists in the dictionary (case-insensitive).
 * Returns true if valid, false otherwise.
 */
bool dict_contains(const Dictionary *dict, const char *word);

/**
 * Retrieves a word by its index.
 * Returns pointer to word, or NULL if out of bounds.
 */
const char* dict_get(const Dictionary *dict, int index);

/**
 * Quicksort implementation for sorting the dictionary array.
 * Used to guarantee sorted order for binary search.
 */
void dict_quicksort(char **words, int low, int high);

/**
 * Frees all dynamically allocated memory for the dictionary.
 */
void dict_free(Dictionary *dict);

#endif /* DICTIONARY_H */
