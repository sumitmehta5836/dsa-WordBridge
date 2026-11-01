# ==============================================================================
# Makefile for WordBridge (DSA Project-Based Learning)
# ==============================================================================

CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -O2 -I../include
ifeq ($(OS),Windows_NT)
TARGET = wordbridge.exe
TEST_TARGET = tests/test_core.exe
else
TARGET = wordbridge
TEST_TARGET = tests/test_core
endif

SRCDIR = src
OBJDIR = obj
INCDIR = ../include

SRCS = $(wildcard $(SRCDIR)/*.c)
OBJS = $(patsubst $(SRCDIR)/%.c, $(OBJDIR)/%.o, $(SRCS))

.PHONY: all clean run test

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^
	@echo "Build successful! Run with ./$(TARGET)"

$(OBJDIR)/%.o: $(SRCDIR)/%.c | $(OBJDIR)
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJDIR):
	mkdir -p $(OBJDIR)

run: $(TARGET)
	./$(TARGET)

$(TEST_TARGET): tests/test_core.c src/dictionary.c src/solver.c src/game.c
	$(CC) $(CFLAGS) -o $@ $^

test: $(TEST_TARGET)
	./$(TEST_TARGET)

clean:
	rm -rf $(OBJDIR) $(TARGET) tests/test_core tests/test_core.exe
	@echo "Cleaned build artifacts."
