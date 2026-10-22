/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: src/dictionary.c
 * Module 1 - Member 1: Dictionary & Binary Search
 * ============================================================================
 */

#include "dictionary.h"

#ifdef __APPLE__
    #include <mach-o/dyld.h>
#elif defined(_WIN32)
    #include <windows.h>
#endif

#define INITIAL_CAPACITY 1024

/* Helper to resolve dictionary path relative to executable or current directory */
static FILE* open_dictionary_file(const char *filename) {
    /* 1. Try opening path directly (works if executed from project root) */
    FILE *file = fopen(filename, "r");
    if (file) return file;

    /* 2. Try looking relative to the executable binary directory */
    char resolved_path[1024];
#ifdef __APPLE__
    char exe_path[1024];
    uint32_t size = sizeof(exe_path);
    if (_NSGetExecutablePath(exe_path, &size) == 0) {
        char *last_slash = strrchr(exe_path, '/');
        if (last_slash) {
            *last_slash = '\0';
            snprintf(resolved_path, sizeof(resolved_path), "%s/%s", exe_path, filename);
            file = fopen(resolved_path, "r");
            if (file) return file;
        }
    }
#elif defined(_WIN32)
    char exe_path[MAX_PATH];
    if (GetModuleFileNameA(NULL, exe_path, MAX_PATH) > 0) {
        char *last_slash = strrchr(exe_path, '\\');
        if (last_slash) {
            *last_slash = '\0';
            snprintf(resolved_path, sizeof(resolved_path), "%s\\%s", exe_path, filename);
            file = fopen(resolved_path, "r");
            if (file) return file;
        }
    }
#else
    /* Linux: read /proc/self/exe */
    char exe_path[1024];
    ssize_t len = readlink("/proc/self/exe", exe_path, sizeof(exe_path) - 1);
    if (len != -1) {
        exe_path[len] = '\0';
        char *last_slash = strrchr(exe_path, '/');
        if (last_slash) {
            *last_slash = '\0';
            snprintf(resolved_path, sizeof(resolved_path), "%s/%s", exe_path, filename);
            file = fopen(resolved_path, "r");
            if (file) return file;
        }
    }
#endif

    return NULL;
}

/* Helper: Swap two string pointers */
static void swap_strings(char **a, char **b) {
    char *temp = *a;
    *a = *b;
    *b = temp;
}

/* Custom Partition for QuickSort */
static int partition(char **words, int low, int high) {
    char *pivot = words[high];
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (strcmp(words[j], pivot) <= 0) {
            i++;
            swap_strings(&words[i], &words[j]);
        }
    }
    swap_strings(&words[i + 1], &words[high]);
    return i + 1;
}

/* Quicksort Implementation */
void dict_quicksort(char **words, int low, int high) {
    if (low < high) {
        int pi = partition(words, low, high);
        dict_quicksort(words, low, pi - 1);
        dict_quicksort(words, pi + 1, high);
    }
}

/* Create an empty dictionary */
static Dictionary* dict_create(int initial_cap, int filter_len) {
    Dictionary *dict = (Dictionary *)malloc(sizeof(Dictionary));
    if (!dict) {
        perror("Failed to allocate dictionary struct");
        return NULL;
    }
    dict->words = (char **)malloc(sizeof(char *) * initial_cap);
    if (!dict->words) {
        perror("Failed to allocate dictionary words buffer");
        free(dict);
        return NULL;
    }
    dict->count = 0;
    dict->capacity = initial_cap;
    dict->word_len = filter_len;
    return dict;
}

/* Append a word to the dictionary (with dynamic resizing) */
static bool dict_append(Dictionary *dict, const char *word) {
    if (dict->count >= dict->capacity) {
        int new_cap = dict->capacity * 2;
        char **new_words = (char **)realloc(dict->words, sizeof(char *) * new_cap);
        if (!new_words) {
            perror("Failed to resize dictionary array");
            return false;
        }
        dict->words = new_words;
        dict->capacity = new_cap;
    }

    size_t len = strlen(word);
    dict->words[dict->count] = (char *)malloc(len + 1);
    if (!dict->words[dict->count]) {
        perror("Failed to allocate word string");
        return false;
    }
    strcpy(dict->words[dict->count], word);
    dict->count++;
    return true;
}

Dictionary* dict_load(const char *filename, int filter_len) {
    FILE *file = open_dictionary_file(filename);
    if (!file) {
        fprintf(stderr, COLOR_RED "Error: Could not open dictionary file: %s\n" COLOR_RESET, filename);
        return NULL;
    }

    Dictionary *dict = dict_create(INITIAL_CAPACITY, filter_len);
    if (!dict) {
        fclose(file);
        return NULL;
    }

    char line_buf[256];
    char clean_word[MAX_WORD_LEN + 1];

    while (fgets(line_buf, sizeof(line_buf), file)) {
        str_trim(line_buf);
        if (strlen(line_buf) == 0) continue;

        /* Convert to lowercase and sanitize */
        int idx = 0;
        bool is_valid = true;
        for (int i = 0; line_buf[i] != '\0' && idx < MAX_WORD_LEN; i++) {
            if (isalpha((unsigned char)line_buf[i])) {
                clean_word[idx++] = (char)tolower((unsigned char)line_buf[i]);
            } else {
                is_valid = false;
                break;
            }
        }
        clean_word[idx] = '\0';

        if (!is_valid || idx == 0) continue;

        /* Filter by length if filter_len is specified */
        if (filter_len > 0 && idx != filter_len) {
            continue;
        }

        dict_append(dict, clean_word);
    }

    fclose(file);

    /* Sort the dictionary using QuickSort to enable Binary Search */
    if (dict->count > 1) {
        dict_quicksort(dict->words, 0, dict->count - 1);
    }

    /* Deduplicate identical consecutive entries after sorting */
    if (dict->count > 1) {
        int write_idx = 1;
        for (int read_idx = 1; read_idx < dict->count; read_idx++) {
            if (strcmp(dict->words[read_idx], dict->words[write_idx - 1]) != 0) {
                if (write_idx != read_idx) {
                    dict->words[write_idx] = dict->words[read_idx];
                }
                write_idx++;
            } else {
                free(dict->words[read_idx]);
            }
        }
        dict->count = write_idx;
    }

    return dict;
}

int dict_binary_search(const Dictionary *dict, const char *word) {
    if (!dict || dict->count == 0 || !word) return -1;

    char target[MAX_WORD_LEN + 1];
    str_to_lower(target, word);

    int low = 0;
    int high = dict->count - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        int cmp = strcmp(dict->words[mid], target);

        if (cmp == 0) {
            return mid; /* Found at index mid */
        } else if (cmp < 0) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return -1; /* Not found */
}

bool dict_contains(const Dictionary *dict, const char *word) {
    return dict_binary_search(dict, word) != -1;
}

const char* dict_get(const Dictionary *dict, int index) {
    if (!dict || index < 0 || index >= dict->count) return NULL;
    return dict->words[index];
}

void dict_free(Dictionary *dict) {
    if (!dict) return;
    if (dict->words) {
        for (int i = 0; i < dict->count; i++) {
            if (dict->words[i]) {
                free(dict->words[i]);
            }
        }
        free(dict->words);
    }
    free(dict);
}
