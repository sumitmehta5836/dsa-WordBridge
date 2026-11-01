'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const browserGlobals = { window: {}, performance };
const engineSource = fs.readFileSync(
    path.join(__dirname, '..', 'gui', 'dsa-engine.js'),
    'utf8'
);
vm.runInNewContext(engineSource, browserGlobals, { filename: 'dsa-engine.js' });

const { WordBridgeDictionary, BFSSolver, GameEngine, DoublyLinkedListReplay } = browserGlobals.window;
const words = ['cat', 'cot', 'cog', 'dog', 'zzz'];

test('BFS finds a shortest reachable ladder and reports nondecreasing depths', () => {
    const dictionary = new WordBridgeDictionary(words);
    const result = new BFSSolver(dictionary).findShortestPath('CAT', 'dog');

    assert.equal(result.success, true);
    assert.deepEqual(Array.from(result.path), ['cat', 'cot', 'cog', 'dog']);
    assert.equal(result.metrics.moves, 3);
    assert.equal(result.exploration.at(-1).word, 'dog');
    assert.deepEqual(
        Array.from(result.discoveryOrder, entry => [entry.word, entry.distance]),
        [['cat', 0], ['cot', 1], ['cog', 2], ['dog', 3]]
    );
    assert.deepEqual(
        Array.from(result.exploration, entry => entry.discoveredCount),
        [2, 3, 4, 4]
    );
    assert.ok(result.exploration.every((entry, index, entries) =>
        index === 0 || entry.distance >= entries[index - 1].distance
    ));
});

test('BFS returns empty exploration for invalid inputs and reports an exhausted search', () => {
    const solver = new BFSSolver(new WordBridgeDictionary(words));

    for (const [start, target] of [['cat', 'cats'], ['missing', 'dog']]) {
        const result = solver.findShortestPath(start, target);
        assert.equal(result.success, false);
        assert.deepEqual(Array.from(result.exploration), []);
        assert.deepEqual(Array.from(result.discoveryOrder), []);
    }

    const unreachable = solver.findShortestPath('cat', 'zzz');
    assert.equal(unreachable.success, false);
    assert.deepEqual(
        Array.from(unreachable.exploration, entry => entry.word),
        ['cat', 'cot', 'cog', 'dog']
    );
});

test('game undo and redo restore the path and discard redo after a new move', () => {
    const game = new GameEngine(new WordBridgeDictionary(words), 'cat', 'dog');

    assert.equal(game.makeMove('cot').valid, true);
    assert.equal(game.makeMove('cog').valid, true);
    assert.equal(game.undo().currentWord, 'cot');
    assert.equal(game.redo().currentWord, 'cog');
    assert.equal(game.undo().currentWord, 'cot');
    assert.equal(game.makeMove('cat').valid, true);
    assert.equal(game.redo().success, false);
});

test('replay list navigates steps in both directions', () => {
    const replay = new DoublyLinkedListReplay(['cat', 'cot', 'cog']);

    assert.equal(replay.current.word, 'cat');
    assert.equal(replay.next().word, 'cot');
    assert.equal(replay.last().word, 'cog');
    assert.equal(replay.prev().word, 'cot');
    assert.equal(replay.first().word, 'cat');
});

test('dsa-engine loads cleanly via CommonJS require', () => {
    const cjs = require('../gui/dsa-engine.js');
    assert.ok(cjs.WordBridgeDictionary);
    assert.ok(cjs.BFSSolver);
    assert.ok(cjs.GameEngine);
    assert.ok(cjs.DoublyLinkedListReplay);

    const replay = new cjs.DoublyLinkedListReplay(['cold', 'cord', 'card', 'ward', 'warm']);
    assert.equal(replay.totalSteps, 5);
    replay.jumpTo(2);
    assert.equal(replay.current.word, 'card');
});
