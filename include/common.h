/**
 * ============================================================================
 * WORDBRIDGE: A Word Ladder Puzzle Game with Auto-Solver
 * Subject: Data Structures and Algorithms (DSA)
 * File: include/common.h
 * Description: Common definitions, ANSI styling, and configuration macros.
 * ============================================================================
 */

#ifndef COMMON_H
#define COMMON_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <ctype.h>
#include <time.h>

#ifdef _WIN32
    #include <windows.h>
    #define SLEEP_MS(ms) Sleep(ms)
#else
    #include <unistd.h>
    #define SLEEP_MS(ms) usleep((ms) * 1000)
#endif

/* Constants */
#define MAX_WORD_LEN 16
#define DEFAULT_DICT_PATH "data/dictionary.txt"
#define SAMPLE_DICT_PATH  "data/sample_words.txt"
#define DEFAULT_WORD_LEN 4

/* ANSI Escape Sequences for Terminal Styling */
#define COLOR_RESET   "\033[0m"
#define COLOR_BOLD    "\033[1m"
#define COLOR_DIM     "\033[2m"
#define COLOR_ITALIC  "\033[3m"
#define COLOR_UNDER   "\033[4m"

/* Text Colors */
#define COLOR_RED     "\033[31m"
#define COLOR_GREEN   "\033[32m"
#define COLOR_YELLOW  "\033[33m"
#define COLOR_BLUE    "\033[34m"
#define COLOR_MAGENTA "\033[35m"
#define COLOR_CYAN    "\033[36m"
#define COLOR_WHITE   "\033[37m"

/* Bright Text Colors */
#define COLOR_BRED    "\033[91m"
#define COLOR_BGREEN  "\033[92m"
#define COLOR_BYELLOW "\033[93m"
#define COLOR_BBLUE   "\033[94m"
#define COLOR_BMAGENTA "\033[95m"
#define COLOR_BCYAN   "\033[96m"
#define COLOR_BWHITE  "\033[97m"

/* Background Colors */
#define BG_BLUE       "\033[44m"
#define BG_CYAN       "\033[46m"
#define BG_GREEN      "\033[42m"
#define BG_YELLOW     "\033[43m"
#define BG_MAGENTA    "\033[45m"
#define BG_DARKGRAY   "\033[100m"

/* Helper Functions */
static inline void str_to_lower(char *dest, const char *src) {
    size_t i = 0;
    while (src[i] != '\0') {
        dest[i] = (char)tolower((unsigned char)src[i]);
        i++;
    }
    dest[i] = '\0';
}

static inline void str_to_upper(char *dest, const char *src) {
    size_t i = 0;
    while (src[i] != '\0') {
        dest[i] = (char)toupper((unsigned char)src[i]);
        i++;
    }
    dest[i] = '\0';
}

static inline void str_trim(char *str) {
    if (!str) return;
    int len = (int)strlen(str);
    while (len > 0 && (str[len - 1] == '\n' || str[len - 1] == '\r' || isspace((unsigned char)str[len - 1]))) {
        str[len - 1] = '\0';
        len--;
    }
}

#endif /* COMMON_H */
