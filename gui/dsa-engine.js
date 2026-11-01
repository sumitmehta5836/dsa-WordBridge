/**
 * ============================================================================
 * WORDBRIDGE: DSA Engine (Pure Data Structures & Algorithms)
 * Subject: Data Structures and Algorithms (DSA) — PBL
 * Modules:
 *   - Module 1 (Prachi Tiwari)    : Sorted Array & O(log N) Binary Search
 *   - Module 2 (Priyanshu Bisht)  : FIFO Queue & Implicit Graph BFS Auto-Solver
 *   - Module 3 (Sumit Mehta)      : Dual-Stack (Undo/Redo), Hamming Metric & State Machine
 *   - Module 4 (Suraj Singh Bisht): Doubly Linked List Replay Engine
 * ============================================================================
 */

/* ============================================================================
 * MODULE 1: Sorted Array & Binary Search (Member 1: Prachi Tiwari)
 * ============================================================================ */
class WordBridgeDictionary {
    constructor(wordsArray = []) {
        // A sorted dynamic array supports binary-search membership checks;
        // length buckets restrict BFS neighbor lookup to compatible words.
        this.words = [...wordsArray].map(w => w.toLowerCase());
        this.words.sort();
        // Fast index by word length for instant neighbor generation
        this.byLength = {};
        for (let i = 0; i < this.words.length; i++) {
            const w = this.words[i];
            const len = w.length;
            if (!this.byLength[len]) this.byLength[len] = [];
            this.byLength[len].push(w);
        }
    }

    get count() {
        return this.words.length;
    }

    /**
     * Standard O(log N) Binary Search over sorted dynamic array
     * Returns index if found, or -1 if not found.
     */
    binarySearch(targetWord) {
        if (!targetWord) return -1;
        const target = targetWord.toLowerCase();
        let low = 0;
        let high = this.words.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midVal = this.words[mid];

            if (midVal === target) {
                return mid;
            } else if (midVal < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1;
    }

    /**
     * Detailed Binary Search with Probe Telemetry for live visualization
     */
    traceBinarySearch(targetWord) {
        if (!targetWord) return { found: false, index: -1, probes: [] };
        const target = targetWord.toLowerCase();
        let low = 0;
        let high = this.words.length - 1;
        const probes = [];

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midVal = this.words[mid];
            probes.push({
                low,
                mid,
                high,
                word: midVal,
                target,
                comparison: midVal === target ? 'MATCH' : midVal < target ? 'LESS' : 'GREATER'
            });

            if (midVal === target) {
                return { found: true, index: mid, probes };
            } else if (midVal < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return { found: false, index: -1, probes };
    }

    contains(word) {
        return this.binarySearch(word) !== -1;
    }
}

/* ============================================================================
 * MODULE 2: FIFO Queue & BFS Auto-Solver (Member 2: Priyanshu Bisht)
 * ============================================================================ */

class QueueNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class Queue {
    constructor() {
        this.front = null;
        this.rear = null;
        this.length = 0;
    }

    push(data) {
        // Keep front/rear pointers so FIFO enqueue is O(1), without shifting an array.
        const node = new QueueNode(data);
        if (this.rear === null) {
            this.front = this.rear = node;
        } else {
            this.rear.next = node;
            this.rear = node;
        }
        this.length++;
    }

    pop() {
        // Dequeue from the front to preserve breadth-first traversal order.
        if (this.front === null) return null;
        const data = this.front.data;
        this.front = this.front.next;
        if (this.front === null) {
            this.rear = null;
        }
        this.length--;
        return data;
    }

    isEmpty() {
        return this.front === null;
    }

    size() {
        return this.length;
    }
}

class BFSSolver {
    constructor(dictionary) {
        this.dict = dictionary;
    }

    static hammingDistance(w1, w2) {
        // Hamming distance is the number of positions with different letters;
        // a legal ladder edge has distance exactly one.
        if (!w1 || !w2 || w1.length !== w2.length) return -1;
        let diff = 0;
        for (let i = 0; i < w1.length; i++) {
            if (w1[i].toLowerCase() !== w2[i].toLowerCase()) diff++;
        }
        return diff;
    }

    /**
     * Finds the shortest path with BFS over an implicit word graph: words are
     * vertices and one-letter substitutions are edges, generated when needed.
     */
    findShortestPath(startWord, targetWord) {
        const startTime = performance.now();
        const start = startWord.toLowerCase();
        const target = targetWord.toLowerCase();

        if (start.length !== target.length) {
            return { success: false, error: 'Word lengths must be identical.', path: [], metrics: null, exploration: [], discoveryOrder: [] };
        }
        if (!this.dict.contains(start)) {
            return { success: false, error: `Start word '${start}' is not in dictionary.`, path: [], metrics: null, exploration: [], discoveryOrder: [] };
        }
        if (!this.dict.contains(target)) {
            return { success: false, error: `Target word '${target}' is not in dictionary.`, path: [], metrics: null, exploration: [], discoveryOrder: [] };
        }

        if (start === target) {
            return {
                success: true,
                path: [start],
                metrics: {
                    nodesVisited: 1,
                    queuePeak: 1,
                    executionTimeMs: 0.01,
                    pathLength: 1,
                    moves: 0
                },
                exploration: [{ word: start, distance: 0, discoveredCount: 1 }],
                discoveryOrder: [{ word: start, distance: 0 }]
            };
        }

        const wordLen = start.length;
        const candidates = this.dict.byLength[wordLen] || [];
        const wordToIndex = new Map();
        for (let i = 0; i < candidates.length; i++) {
            wordToIndex.set(candidates[i], i);
        }

        const startIndex = wordToIndex.get(start);
        const targetIndex = wordToIndex.get(target);

        const visited = new Uint8Array(candidates.length);
        const parent = new Int32Array(candidates.length);
        const distances = new Int32Array(candidates.length);
        parent.fill(-1);
        distances.fill(-1);

        // BFS explores words in increasing distance from start; marking a word
        // when enqueued prevents duplicate work and fixes its shortest parent.
        const queue = new Queue();
        queue.push(startIndex);
        const discoveryOrder = [{ word: start, distance: 0 }];
        visited[startIndex] = 1;
        distances[startIndex] = 0;

        let nodesVisited = 0;
        let queuePeak = 1;
        let targetFound = false;
        const exploration = [];

        while (!queue.isEmpty()) {
            const currSize = queue.size();
            if (currSize > queuePeak) queuePeak = currSize;

            const currIdx = queue.pop();
            nodesVisited++;
            exploration.push({
                word: candidates[currIdx],
                distance: distances[currIdx],
                discoveredCount: 0
            });

            if (currIdx === targetIndex) {
                exploration[exploration.length - 1].discoveredCount = discoveryOrder.length;
                targetFound = true;
                break;
            }

            const currWord = candidates[currIdx];

            // Generate neighbors on the fly by varying each character from 'a' to 'z' (26 * L)
            const chars = currWord.split('');
            for (let i = 0; i < wordLen; i++) {
                const originalChar = chars[i];
                for (let c = 97; c <= 122; c++) {
                    const nextChar = String.fromCharCode(c);
                    if (nextChar === originalChar) continue;

                    chars[i] = nextChar;
                    const neighbor = chars.join('');

                    const neighborIdx = wordToIndex.get(neighbor);
                    if (neighborIdx !== undefined && !visited[neighborIdx]) {
                        visited[neighborIdx] = 1;
                        parent[neighborIdx] = currIdx;
                        distances[neighborIdx] = distances[currIdx] + 1;
                        queue.push(neighborIdx);
                        discoveryOrder.push({ word: neighbor, distance: distances[neighborIdx] });
                    }
                }
                chars[i] = originalChar;
            }
            exploration[exploration.length - 1].discoveredCount = discoveryOrder.length;
        }

        const endTime = performance.now();
        const executionTimeMs = parseFloat((endTime - startTime).toFixed(2));

        if (!targetFound) {
            return {
                success: false,
                error: `No path exists between '${start.toUpperCase()}' and '${target.toUpperCase()}'.`,
                path: [],
                metrics: {
                    nodesVisited,
                    queuePeak,
                    executionTimeMs,
                    pathLength: 0,
                    moves: 0
                },
                exploration,
                discoveryOrder
            };
        }

        // Parent links point toward the start, so backtrack from the goal and reverse.
        const path = [];
        let curr = targetIndex;
        while (curr !== -1) {
            path.push(candidates[curr]);
            curr = parent[curr];
        }
        path.reverse();

        return {
            success: true,
            path,
            metrics: {
                nodesVisited,
                queuePeak,
                executionTimeMs,
                pathLength: path.length,
                moves: path.length - 1
            },
            exploration,
            discoveryOrder
        };
    }

    /**
     * Returns the optimal next word from current to target
     */
    getHint(currentWord, targetWord) {
        const res = this.findShortestPath(currentWord, targetWord);
        if (res.success && res.path.length >= 2) {
            return res.path[1];
        }
        return null;
    }
}

/* ============================================================================
 * MODULE 3: Dual-Stack Undo/Redo & Game Engine (Member 3: Sumit Mehta)
 * ============================================================================ */

class StackNode {
    constructor(word) {
        this.word = word;
        this.next = null;
    }
}

class Stack {
    constructor() {
        this.top = null;
        this.count = 0;
    }

    push(word) {
        // Insert at the head: linked-stack push and pop both take O(1) time.
        const node = new StackNode(word);
        node.next = this.top;
        this.top = node;
        this.count++;
    }

    pop() {
        if (!this.top) return null;
        const word = this.top.word;
        this.top = this.top.next;
        this.count--;
        return word;
    }

    peek() {
        return this.top ? this.top.word : null;
    }

    isEmpty() {
        return this.top === null;
    }

    size() {
        return this.count;
    }

    clear() {
        this.top = null;
        this.count = 0;
    }

    contains(word) {
        // Cycle detection scans the active history, taking O(k) for k moves.
        const target = word.toLowerCase();
        let curr = this.top;
        while (curr) {
            if (curr.word.toLowerCase() === target) return true;
            curr = curr.next;
        }
        return false;
    }

    toArray() {
        const arr = [];
        let curr = this.top;
        while (curr) {
            arr.push(curr.word);
            curr = curr.next;
        }
        return arr;
    }
}

class GameEngine {
    constructor(dictionary, startWord, targetWord) {
        this.dict = dictionary;
        this.solver = new BFSSolver(dictionary);
        this.startWord = startWord.toLowerCase();
        this.targetWord = targetWord.toLowerCase();
        this.currentWord = this.startWord;

        // Dual stacks separate applied moves from undone moves, enabling O(1)
        // undo/redo; a new branch clears redo history.
        this.undoStack = new Stack();
        this.redoStack = new Stack();

        // Push start word as baseline
        this.undoStack.push(this.startWord);

        // Precompute optimal path benchmark
        const opt = this.solver.findShortestPath(this.startWord, this.targetWord);
        this.optimalMoves = opt.success ? opt.metrics.moves : 0;
        this.optimalPath = opt.success ? opt.path : [];

        // Game telemetry
        this.movesCount = 0;
        this.totalPushes = 1;
        this.totalUndos = 0;
        this.totalRedos = 0;
        this.historyLadder = [this.startWord];
        this.cycleCount = 0;
        this.startTime = Date.now();
        this.endTime = null;
    }

    /**
     * Executes a new move entered by the player.
     * Validates: length match, dictionary presence, Hamming distance == 1, cycle detection.
     */
    makeMove(newWord) {
        const word = newWord.trim().toLowerCase();
        const wordLen = this.startWord.length;

        if (word.length !== wordLen) {
            return {
                valid: false,
                error: `Word must be exactly ${wordLen} letters!`,
                cycleWarning: false
            };
        }

        if (word === this.currentWord) {
            return {
                valid: false,
                error: 'Word is identical to your current word!',
                cycleWarning: false
            };
        }

        // Hamming distance enforces that each graph edge changes one letter.
        const diff = BFSSolver.hammingDistance(this.currentWord, word);
        if (diff !== 1) {
            return {
                valid: false,
                error: `Invalid move! Hamming distance d_H = ${diff}. You must change exactly ONE letter.`,
                cycleWarning: false
            };
        }

        if (!this.dict.contains(word)) {
            return {
                valid: false,
                error: `'${word.toUpperCase()}' is not a valid dictionary word!`,
                cycleWarning: false
            };
        }

        // Cycle detection: check if word is already in undoStack
        const cycleWarning = this.undoStack.contains(word);
        if (cycleWarning) {
            this.cycleCount++;
        }

        // Execute Move
        this.undoStack.push(word);
        this.currentWord = word;
        this.historyLadder.push(word);
        this.movesCount++;
        this.totalPushes++;

        // Clear redo stack on new branch (Standard Dual-Stack semantics)
        this.redoStack.clear();

        const won = this.isWon();
        if (won && !this.endTime) {
            this.endTime = Date.now();
        }

        return {
            valid: true,
            error: null,
            cycleWarning,
            won,
            currentWord: this.currentWord
        };
    }

    undo() {
        if (this.undoStack.size() <= 1) {
            return { success: false, message: 'Already at the starting word!' };
        }

        const popped = this.undoStack.pop();
        this.redoStack.push(popped);
        this.currentWord = this.undoStack.peek();
        this.historyLadder.pop();
        this.totalUndos++;

        return {
            success: true,
            revertedWord: popped,
            currentWord: this.currentWord
        };
    }

    redo() {
        if (this.redoStack.isEmpty()) {
            return { success: false, message: 'No moves available in Redo stack!' };
        }

        const restored = this.redoStack.pop();
        this.undoStack.push(restored);
        this.currentWord = restored;
        this.historyLadder.push(restored);
        this.totalRedos++;

        return {
            success: true,
            restoredWord: restored,
            currentWord: this.currentWord
        };
    }

    isWon() {
        return this.currentWord === this.targetWord;
    }

    getEfficiency() {
        if (this.movesCount === 0 || this.optimalMoves === 0) return 100.0;
        const eff = (this.optimalMoves / this.movesCount) * 100.0;
        return parseFloat(Math.min(100.0, eff).toFixed(1));
    }

    getRank() {
        const eff = this.getEfficiency();
        if (eff >= 100.0 && this.cycleCount === 0) return { title: 'Grandmaster of Ladders', color: '#00f2fe', icon: '👑' };
        if (eff >= 85.0) return { title: 'Master Strategist', color: '#43e97b', icon: '⭐' };
        if (eff >= 65.0) return { title: 'Graph Scholar', color: '#fbc2eb', icon: '💠' };
        if (eff >= 45.0) return { title: 'Path Explorer', color: '#ffbb33', icon: '🧭' };
        return { title: 'Wandering Nomad', color: '#ff4444', icon: '🚶' };
    }

    getElapsedTimeSeconds() {
        const end = this.endTime || Date.now();
        return Math.floor((end - this.startTime) / 1000);
    }
}

/* ============================================================================
 * MODULE 4: Doubly Linked List Replay Engine (Member 4: Suraj Singh Bisht)
 * ============================================================================ */

class PathNode {
    constructor(word, stepNumber) {
        this.word = word;
        this.stepNumber = stepNumber;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedListReplay {
    constructor(pathArray = []) {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.currentIndex = 0;
        this.totalSteps = 0;

        for (let i = 0; i < pathArray.length; i++) {
            this.append(pathArray[i]);
        }
        this.current = this.head;
        this.currentIndex = 0;
    }

    append(word) {
        // Link at the tail in O(1); prev/next links support bidirectional replay.
        const node = new PathNode(word, this.totalSteps + 1);
        if (!this.tail) {
            this.head = this.tail = node;
            this.current = node;
        } else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
        this.totalSteps++;
    }

    hasNext() {
        return this.current !== null && this.current.next !== null;
    }

    hasPrev() {
        return this.current !== null && this.current.prev !== null;
    }

    next() {
        if (this.hasNext()) {
            this.current = this.current.next;
            this.currentIndex++;
            return this.current;
        }
        return null;
    }

    prev() {
        if (this.hasPrev()) {
            this.current = this.current.prev;
            this.currentIndex--;
            return this.current;
        }
        return null;
    }

    first() {
        this.current = this.head;
        this.currentIndex = 0;
        return this.current;
    }

    last() {
        this.current = this.tail;
        this.currentIndex = this.totalSteps - 1;
        return this.current;
    }

    jumpTo(index) {
        let curr = this.head;
        let count = 0;
        while (curr && count < index) {
            curr = curr.next;
            count++;
        }
        if (curr) {
            this.current = curr;
            this.currentIndex = index;
            return this.current;
        }
        return null;
    }

    getCurrentNode() {
        return this.current;
    }

    toArray() {
        const arr = [];
        let curr = this.head;
        while (curr) {
            arr.push({
                word: curr.word,
                stepNumber: curr.stepNumber,
                isCurrent: curr === this.current
            });
            curr = curr.next;
        }
        return arr;
    }
}

// Export as global for browser environment & CommonJS for tests
if (typeof window !== 'undefined') {
    window.WordBridgeDictionary = WordBridgeDictionary;
    window.BFSSolver = BFSSolver;
    window.GameEngine = GameEngine;
    window.DoublyLinkedListReplay = DoublyLinkedListReplay;
    window.Queue = Queue;
    window.Stack = Stack;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WordBridgeDictionary,
        BFSSolver,
        GameEngine,
        DoublyLinkedListReplay,
        Queue,
        Stack
    };
}
