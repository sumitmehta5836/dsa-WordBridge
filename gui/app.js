/**
 * ============================================================================
 * WORDBRIDGE: Main Application Controller & UI Coordinator (Puzzle Edition)
 * Subject: Data Structures and Algorithms (DSA) — PBL
 * ============================================================================
 */

(function () {
    'use strict';

    // State References
    let dict = null;
    let solver = null;
    let game = null;
    let replayer = null;
    let replayInterval = null;

    // Interactive Tile Editing State
    let selectedTileIndex = 0;
    let draftLetters = [];
    let isReplaying = false;
    let animatedTileIndex = -1;
    const triedLetters = new Set();

    // Curated 53 Reachable Preset Word Ladder Challenges
    const PRESETS = [
        // 🟢 3-Letter Ladders (Easy / Warmup)
        { start: 'cat',   target: 'dog',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'box',   target: 'bag',   len: 3, moves: 2, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'hot',   target: 'tea',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'sun',   target: 'sky',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'boy',   target: 'man',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'bad',   target: 'run',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'sea',   target: 'air',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'day',   target: 'zen',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'fox',   target: 'hen',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'pig',   target: 'cow',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'car',   target: 'bus',   len: 3, moves: 3, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'pen',   target: 'ink',   len: 3, moves: 4, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'gem',   target: 'ore',   len: 3, moves: 4, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },
        { start: 'bat',   target: 'ice',   len: 3, moves: 5, diff: 'Easy (3 Letters)',   diffClass: 'diff-easy' },

        // 🟡 4-Letter Ladders (Medium / Classic Puzzles)
        { start: 'lead',  target: 'gold',  len: 4, moves: 3, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'love',  target: 'hate',  len: 4, moves: 3, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'cold',  target: 'warm',  len: 4, moves: 4, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'head',  target: 'tail',  len: 4, moves: 4, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'fire',  target: 'cold',  len: 4, moves: 4, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'hard',  target: 'easy',  len: 4, moves: 4, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'fall',  target: 'rise',  len: 4, moves: 4, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'lion',  target: 'bear',  len: 4, moves: 4, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'wind',  target: 'rain',  len: 4, moves: 4, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'seed',  target: 'tree',  len: 4, moves: 4, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'code',  target: 'data',  len: 4, moves: 4, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'slow',  target: 'fast',  len: 4, moves: 5, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'rich',  target: 'poor',  len: 4, moves: 5, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'star',  target: 'moon',  len: 4, moves: 5, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'bird',  target: 'fish',  len: 4, moves: 5, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'fool',  target: 'sage',  len: 4, moves: 6, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'dark',  target: 'glow',  len: 4, moves: 6, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'door',  target: 'open',  len: 4, moves: 6, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'walk',  target: 'stop',  len: 4, moves: 6, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },
        { start: 'iron',  target: 'rust',  len: 4, moves: 7, diff: 'Medium (4 Letters)', diffClass: 'diff-medium' },

        // 🟠 5-Letter Ladders (Hard / Brain Benders)
        { start: 'wheat', target: 'bread', len: 5, moves: 4, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'brain', target: 'think', len: 5, moves: 5, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'flour', target: 'bread', len: 5, moves: 6, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'stone', target: 'money', len: 5, moves: 7, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'black', target: 'white', len: 5, moves: 7, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'earth', target: 'space', len: 5, moves: 7, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'sleep', target: 'awake', len: 5, moves: 7, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'storm', target: 'clear', len: 5, moves: 8, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'heart', target: 'pulse', len: 5, moves: 8, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'sugar', target: 'sweet', len: 5, moves: 9, diff: 'Hard (5 Letters)',   diffClass: 'diff-hard' },
        { start: 'clean', target: 'dirty', len: 5, moves: 10, diff: 'Hard (5 Letters)',  diffClass: 'diff-hard' },
        { start: 'river', target: 'ocean', len: 5, moves: 11, diff: 'Hard (5 Letters)',  diffClass: 'diff-hard' },
        { start: 'apple', target: 'peach', len: 5, moves: 11, diff: 'Hard (5 Letters)',  diffClass: 'diff-hard' },
        { start: 'peace', target: 'order', len: 5, moves: 12, diff: 'Hard (5 Letters)',  diffClass: 'diff-hard' },

        // 🔴 6-Letter Ladders (Expert / Master Ladders)
        { start: 'mother',target: 'father',len: 6, moves: 2, diff: 'Expert (6 Letters)', diffClass: 'diff-expert' },
        { start: 'winter',target: 'summer',len: 6, moves: 6, diff: 'Expert (6 Letters)', diffClass: 'diff-expert' },
        { start: 'planet',target: 'rocket',len: 6, moves: 8, diff: 'Expert (6 Letters)', diffClass: 'diff-expert' },
        { start: 'stream',target: 'forest',len: 6, moves: 21, diff: 'Expert (6 Letters)',diffClass: 'diff-expert' },
        { start: 'bridge',target: 'island',len: 6, moves: 24, diff: 'Expert (6 Letters)',diffClass: 'diff-expert' }
    ];
    const CAMPAIGN_PROGRESS_KEY = 'wordbridge_campaign_progress';
    const DAILY_PROGRESS_KEY = 'wordbridge_daily_progress';
    const PERSONAL_STATS_KEY = 'wordbridge_personal_stats';
    const ACHIEVEMENTS_KEY = 'wordbridge_achievements';
    const ACCESSIBILITY_PREFERENCES_KEY = 'wordbridge_accessibility_preferences';
    const GAME_MODE_KEY = 'wordbridge_game_mode';
    const QUICK_GUIDE_DISMISSED_KEY = 'wordbridge_quick_guide_dismissed';
    const EXPLORATION_BATCH_SIZE = 200;
    const ACHIEVEMENTS = [
        { id: 'first-win', icon: '🌟', title: 'First Bridge', description: 'Solve your first puzzle.' },
        { id: 'perfect-bridge', icon: '🎯', title: 'Perfect Bridge', description: 'Solve a puzzle in exactly the optimal number of moves.' },
        { id: 'daily-streak-five', icon: '🔥', title: 'Daily Dedication', description: 'Build a five-day Daily Challenge streak.' },
        { id: 'campaign-five', icon: '🗺️', title: 'Campaign Climber', description: 'Complete five campaign levels.' },
        { id: 'campaign-complete', icon: '👑', title: 'WordBridge Master', description: 'Complete all 53 campaign levels.' }
    ];
    const DEFAULT_ACCESSIBILITY_PREFERENCES = {
        sound: true,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: false
    };
    const EMPTY_PERSONAL_STATS = {
        attempts: 0,
        completed: 0,
        totalMoves: 0,
        bestTimeSeconds: null
    };

    // DOM Elements Cache
    const el = {
        targetWordPill: document.getElementById('target-word-pill'),
        startGoalBlock: document.getElementById('start-goal-block'),
        startWordTiles: document.getElementById('start-word-tiles'),
        goalWordTiles: document.getElementById('goal-word-tiles'),
        railLevelNumber: document.getElementById('rail-level-number'),
        railLevelLabel: document.getElementById('rail-level-label'),
        railWordPair: document.getElementById('rail-word-pair'),
        railProgressFill: document.getElementById('rail-progress-fill'),
        railProgressLabel: document.getElementById('rail-progress-label'),
        railProgressTrack: document.querySelector('.rail-progress-track'),
        railStreakValue: document.getElementById('rail-streak-value'),
        dashboardLevelProgress: document.getElementById('dashboard-level-progress'),
        dashboardProgressFill: document.getElementById('dashboard-progress-fill'),
        dashboardProgressTrack: document.querySelector('.sidebar-progress-track'),
        dashboardRecentGoals: document.getElementById('dashboard-recent-goals'),
        dashboardAchievementCount: document.getElementById('dashboard-achievement-count'),
        dashboardAchievementList: document.getElementById('dashboard-achievement-list'),
        dashboardCompletedStat: document.getElementById('dashboard-completed-stat'),
        dashboardWinRateStat: document.getElementById('dashboard-win-rate-stat'),
        dashboardBestTimeStat: document.getElementById('dashboard-best-time-stat'),
        dashboardStorageNote: document.getElementById('dashboard-storage-note'),
        ladderViewport: document.getElementById('ladder-viewport'),
        tilesInteractiveRow: document.getElementById('tiles-interactive-row'),
        statusMsg: document.getElementById('status-msg'),
        moveCountVal: document.getElementById('move-count-val'),
        optimalVal: document.getElementById('optimal-val'),
        timerVal: document.getElementById('timer-val'),
        effBadge: document.getElementById('eff-badge'),
        undoBtn: document.getElementById('undo-btn'),
        redoBtn: document.getElementById('redo-btn'),
        undoCountBadge: document.getElementById('undo-count-badge'),
        redoCountBadge: document.getElementById('redo-count-badge'),
        hintBtn: document.getElementById('hint-btn'),
        solveBtn: document.getElementById('solve-btn'),
        giveUpBtn: document.getElementById('give-up-btn'),
        solverToggleBtn: document.getElementById('solver-toggle-btn'),
        solverDrawerClose: document.getElementById('solver-drawer-close'),
        solverDrawerBackdrop: document.getElementById('solver-drawer-backdrop'),
        virtualKeyboard: document.getElementById('virtual-keyboard'),
        
        // Stack elements
        undoStackContainer: document.getElementById('undo-stack-container'),
        redoStackContainer: document.getElementById('redo-stack-container'),
        undoStackCount: document.getElementById('undo-stack-count'),
        redoStackCount: document.getElementById('redo-stack-count'),
        
        // Modals & Action Elements
        challengeModal: document.getElementById('challenge-modal'),
        levelsModal: document.getElementById('levels-modal'),
        levelList: document.getElementById('level-list'),
        levelsProgressLabel: document.getElementById('levels-progress-label'),
        levelsCompletedLabel: document.getElementById('levels-completed-label'),
        levelsProgressFill: document.getElementById('levels-progress-fill'),
        levelsStorageNote: document.getElementById('levels-storage-note'),
        continueLevelBtn: document.getElementById('continue-level-btn'),
        statsModal: document.getElementById('stats-modal'),
        statsCompleted: document.getElementById('stats-completed'),
        statsBestTime: document.getElementById('stats-best-time'),
        statsAverageMoves: document.getElementById('stats-average-moves'),
        statsWinRate: document.getElementById('stats-win-rate'),
        statsStorageNote: document.getElementById('stats-storage-note'),
        resetStatsBtn: document.getElementById('reset-stats-btn'),
        achievementsGrid: document.getElementById('achievements-grid'),
        achievementsProgress: document.getElementById('achievements-progress'),
        achievementsStorageNote: document.getElementById('achievements-storage-note'),
        accessibilityModal: document.getElementById('accessibility-modal'),
        accessibilityBtn: document.getElementById('accessibility-btn'),
        accessibilityCloseBtn: document.getElementById('accessibility-close-btn'),
        accessibilityDoneBtn: document.getElementById('accessibility-done-btn'),
        accessibilityStorageNote: document.getElementById('accessibility-storage-note'),
        soundPreferenceToggle: document.getElementById('sound-preference-toggle'),
        motionPreferenceToggle: document.getElementById('motion-preference-toggle'),
        contrastPreferenceToggle: document.getElementById('contrast-preference-toggle'),
        challengeGrid: document.getElementById('challenge-grid'),
        helpModal: document.getElementById('help-modal'),
        helpBtn: document.getElementById('help-btn'),
        restartBtn: document.getElementById('restart-btn'),
        distanceBadge: document.getElementById('distance-badge'),
        customStartInput: document.getElementById('custom-start-input'),
        customTargetInput: document.getElementById('custom-target-input'),
        customErrorMsg: document.getElementById('custom-error-msg'),
        startCustomBtn: document.getElementById('start-custom-btn'),
        customNavBtn: document.getElementById('custom-nav-btn'),
        winModal: document.getElementById('win-modal'),
        winTitle: document.getElementById('win-title'),
        giveUpModal: document.getElementById('give-up-modal'),
        cancelGiveUpBtn: document.getElementById('cancel-give-up-btn'),
        confirmGiveUpBtn: document.getElementById('confirm-give-up-btn'),
        solverNextLevelBtn: document.getElementById('solver-next-level-btn'),
        
        // Win Stats
        winMoves: document.getElementById('win-moves'),
        winOptimal: document.getElementById('win-optimal'),
        winEfficiency: document.getElementById('win-efficiency'),
        winRankBadge: document.getElementById('win-rank-badge'),
        winTime: document.getElementById('win-time'),
        winPath: document.getElementById('win-path'),
        winDailyStreak: document.getElementById('win-daily-streak'),
        winResultSummary: document.getElementById('win-result-summary'),
        winShareBtn: document.getElementById('win-share-btn'),
        winShareStatus: document.getElementById('win-share-status'),
        
        // Replayer & Auto-Solver
        panelSolveBtn: document.getElementById('panel-solve-btn'),
        applyToBoardBtn: document.getElementById('apply-to-board-btn'),
        replayStepIndicator: document.getElementById('replay-step-indicator'),
        nodeChainView: document.getElementById('node-chain-view'),
        replayFirstBtn: document.getElementById('replay-first-btn'),
        replayPrevBtn: document.getElementById('replay-prev-btn'),
        replayPlayBtn: document.getElementById('replay-play-btn'),
        playbackSpeedSelect: document.getElementById('playback-speed-select'),
        replayNextBtn: document.getElementById('replay-next-btn'),
        replayLastBtn: document.getElementById('replay-last-btn'),
        replayProgressFill: document.getElementById('replay-progress-fill'),
        stepDiffText: document.getElementById('step-diff-text'),
        solverStatusPill: document.getElementById('solver-status-pill'),
        solverTelemetryCard: document.getElementById('solver-telemetry-card'),
        autoSolverSection: document.getElementById('auto-solver-section'),
        bfsExplorationPanel: document.getElementById('bfs-exploration-panel'),
        bfsExplorationCount: document.getElementById('bfs-exploration-count'),
        bfsExplorationList: document.getElementById('bfs-exploration-list'),
        bfsExplorationProgress: document.getElementById('bfs-exploration-progress'),
        bfsExplorationProgressFill: document.getElementById('bfs-exploration-progress-fill'),
        bfsExplorationMore: document.getElementById('bfs-exploration-more'),
        bfsExplorationPrev: document.getElementById('bfs-exploration-prev'),
        bfsExplorationPlay: document.getElementById('bfs-exploration-play'),
        bfsExplorationNext: document.getElementById('bfs-exploration-next'),
        bfsPlaybackStatus: document.getElementById('bfs-playback-status'),
        winAchievementsNote: document.getElementById('win-achievements-note'),

        
        // Binary Search Demo
        searchProbeInput: document.getElementById('search-probe-input'),
        searchProbeBtn: document.getElementById('search-probe-btn'),
        searchTraceLog: document.getElementById('search-trace-log'),
        
        // Sound toggle
        soundToggleBtn: document.getElementById('sound-toggle-btn'),
        quickPlayGuide: document.querySelector('.game-flow-guide'),
        quickGuideDismissBtn: document.getElementById('game-flow-dismiss-btn'),

        // Stats import/export
        saveStatsBtn: document.getElementById('save-stats-btn'),
        loadStatsBtn: document.getElementById('load-stats-btn'),
        importStatsFile: document.getElementById('import-stats-file')
    };

    let gameTimerInterval = null;
    let dailyProgress = { lastCompletedDate: '', currentStreak: 0, bestStreak: 0 };
    let dailyProgressAvailable = true;
    let activeDailyDate = null;
    let personalStats = { ...EMPTY_PERSONAL_STATS };
    let personalStatsAvailable = true;
    let unlockedAchievements = [];
    let achievementsAvailable = true;
    let accessibilityPreferences = { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
    let accessibilityPreferencesAvailable = true;
    let campaignProgress = { unlockedLevel: 1, completedLevels: [] };
    let campaignProgressAvailable = true;
    let activeCampaignIndex = null;
    let hasRecordedVictory = false;
    let hasGivenUp = false;
    let isAssistedRun = false;
    let attemptRecordedForRun = false;
    let gameMode = 'play';
    let solverDrawerOpen = false;
    let activeGameNavButtonId = 'play-nav-btn';
    let lastModalTrigger = null;
    let bfsExploration = [];
    let bfsExplorationRendered = 0;
    let bfsDiscoveryOrder = [];
    let bfsDisplayEntries = [];
    let bfsDepthCounts = new Map();
    let bfsSolutionWords = new Set();
    let bfsPlaybackIndex = -1;
    let bfsPlaybackInterval = null;
    let hintWord = '';
    let hintLevel = 0;
    let bfsDistanceCache = new Map();
    let previousBfsDistance = null;
    let previousDistanceWord = null;

    /* ========================================================================
     * INITIALIZATION
     * ======================================================================== */
    function init() {
        if (!window.WORDBRIDGE_DICT || !window.WORDBRIDGE_DICT.length) {
            console.error('WordBridge dictionary data is missing.');
            showStatus('Error: Dictionary could not be loaded.', 'error');
            return;
        }

        dict = new window.WordBridgeDictionary(window.WORDBRIDGE_DICT);
        solver = new window.BFSSolver(dict);

        loadGameMode();
        loadQuickGuidePreference();
        loadAccessibilityPreferences();
        applyAccessibilityPreferences();
        setupVirtualKeyboard();
        setupEventListeners();
        renderPresetChallenges();
        loadCampaignProgress();
        loadDailyProgress();
        loadPersonalStats();
        loadAchievements();
        updateDailyButton();
        renderPersonalStats();
        renderAchievements();
        renderLevels();

        startCampaignLevel(campaignProgress.unlockedLevel, false);

        console.log(`WordBridge loaded successfully with ${dict.count} dictionary words.`);
    }

    /* ========================================================================
     * GAME CONTROLLER
     * ======================================================================== */
    function startNewGame(startWord, targetWord, dailyDate = null, countAttempt = true, campaignIndex = null) {
        // Stop any running replay
        if (replayInterval) {
            clearInterval(replayInterval);
            replayInterval = null;
        }
        if (el.replayPlayBtn) {
            el.replayPlayBtn.innerHTML = '▶ Auto-Play';
            el.replayPlayBtn.title = 'Auto-Play sequence';
            el.replayPlayBtn.setAttribute('aria-pressed', 'false');
        }
        stopBfsPlayback();
        isReplaying = false;

        const s = startWord.trim().toLowerCase();
        const t = targetWord.trim().toLowerCase();

        if (!dict.contains(s)) {
            showStatus(`Start word '${s.toUpperCase()}' not found in dictionary!`, 'error');
            return false;
        }
        if (!dict.contains(t)) {
            showStatus(`Target word '${t.toUpperCase()}' not found in dictionary!`, 'error');
            return false;
        }
        if (s.length !== t.length) {
            showStatus('Words must have the exact same length!', 'error');
            return false;
        }

        closeSolverDrawer(false);
        resetSolverDisplay();
        game = new window.GameEngine(dict, s, t);
        bfsDistanceCache = new Map();
        if (s === t || game.optimalMoves > 0) bfsDistanceCache.set(s, game.optimalMoves);
        previousBfsDistance = null;
        previousDistanceWord = null;
        hintWord = '';
        hintLevel = 0;
        activeDailyDate = dailyDate;
        activeCampaignIndex = campaignIndex;
        hasRecordedVictory = false;
        hasGivenUp = false;
        isAssistedRun = false;
        el.startGoalBlock.classList.remove('bridge-complete', 'bridge-advance');
        triedLetters.clear();
        applyGameMode();
        attemptRecordedForRun = countAttempt ? recordPuzzleAttempt() : false;
        draftLetters = game.currentWord.toUpperCase().split('');
        selectedTileIndex = 0;

        // Reset timer
        if (gameTimerInterval) clearInterval(gameTimerInterval);
        gameTimerInterval = setInterval(updateTimerDisplay, 1000);

        // Update UI components
        el.targetWordPill.textContent = game.targetWord.toUpperCase();
        renderInteractiveTiles();
        renderTriedKeyboardKeys();
        renderLadderHistory();
        updateGameStats();
        updateStackVisualizers();
        showStatus(`Transform [${game.startWord.toUpperCase()}] into [${game.targetWord.toUpperCase()}]! Click any tile to change a letter.`, 'info');

        closeAllModals();
        if (gameMode === 'learn') {
            markRunAssisted();
            openSolverDrawer();
        }
        return true;
    }

    function renderInteractiveTiles() {
        const restoreTileFocus = document.activeElement &&
            document.activeElement.classList.contains('interactive-tile');
        el.tilesInteractiveRow.innerHTML = '';
        const currentReal = game.currentWord.toUpperCase();

        draftLetters.forEach((char, idx) => {
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'interactive-tile';
            tile.disabled = hasRecordedVictory || hasGivenUp;
            if (idx === selectedTileIndex) tile.classList.add('selected');
            if (char !== currentReal[idx]) tile.classList.add('changed-draft');
            if (idx === animatedTileIndex) tile.classList.add('letter-changed');

            tile.textContent = char;
            tile.id = `interactive-tile-${idx}`;
            tile.setAttribute('title', `Click to select position ${idx + 1}`);
            tile.setAttribute('tabindex', idx === selectedTileIndex ? '0' : '-1');
            tile.setAttribute('aria-label', `Letter ${char}, position ${idx + 1}${idx === selectedTileIndex ? ', selected' : ''}`);
            tile.setAttribute('aria-pressed', idx === selectedTileIndex ? 'true' : 'false');

            // Position marker underneath letter
            const posMarker = document.createElement('span');
            posMarker.className = 'tile-pos-marker';
            posMarker.textContent = idx + 1;
            tile.appendChild(posMarker);
            
            tile.addEventListener('click', () => {
                selectedTileIndex = idx;
                window.sound.keyPress();
                renderInteractiveTiles();
            });
            tile.addEventListener('focus', () => {
                selectedTileIndex = idx;
                document.querySelectorAll('.interactive-tile').forEach((candidate, candidateIndex) => {
                    const selected = candidateIndex === idx;
                    candidate.classList.toggle('selected', selected);
                    candidate.setAttribute('tabindex', selected ? '0' : '-1');
                    candidate.setAttribute('aria-pressed', selected ? 'true' : 'false');
                    candidate.setAttribute('aria-label',
                        `Letter ${draftLetters[candidateIndex]}, position ${candidateIndex + 1}${selected ? ', selected' : ''}`);
                });
            });
            tile.addEventListener('keydown', event => {
                if (event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    tile.click();
                }
            });

            el.tilesInteractiveRow.appendChild(tile);
        });
        animatedTileIndex = -1;
        if (restoreTileFocus) {
            const selectedTile = document.getElementById(`interactive-tile-${selectedTileIndex}`);
            if (selectedTile) selectedTile.focus({ preventScroll: true });
        }
    }

    function renderLadderHistory() {
        el.ladderViewport.replaceChildren();
        el.ladderViewport.hidden = game.historyLadder.length <= 1;
        renderStartGoalTiles(el.startWordTiles, game.startWord, 'start-tile');
        renderStartGoalTiles(el.goalWordTiles, game.targetWord, 'goal-tile');
        
        game.historyLadder.forEach((word, stepIdx) => {
            const row = document.createElement('div');
            row.className = 'ladder-step-row';
            row.setAttribute('role', 'listitem');
            if (stepIdx === game.historyLadder.length - 1) {
                row.classList.add('is-latest');
                row.setAttribute('aria-current', 'step');
            }

            const badge = document.createElement('div');
            badge.className = 'step-num-badge';
            badge.textContent = stepIdx === 0 ? 'START' : `#${stepIdx}`;

            const capsule = document.createElement('div');
            capsule.className = 'ladder-word-capsule';

            const prevWord = stepIdx > 0 ? game.historyLadder[stepIdx - 1] : null;

            word.split('').forEach((letter, letterIdx) => {
                const tile = document.createElement('div');
                tile.className = 'ladder-tile';
                if (stepIdx === 0) tile.classList.add('start-tile');
                else if (word === game.targetWord) tile.classList.add('target-tile');
                else if (prevWord && prevWord[letterIdx] !== letter) tile.classList.add('changed');

                tile.textContent = letter.toUpperCase();
                capsule.appendChild(tile);
            });

            row.appendChild(badge);
            row.appendChild(capsule);
            el.ladderViewport.appendChild(row);
        });

        // If goal has not been reached yet, show a dashed preview of target destination!
        if (game.currentWord !== game.targetWord) {
            const goalRow = document.createElement('div');
            goalRow.className = 'ladder-step-row ladder-goal-preview';
            goalRow.setAttribute('role', 'listitem');
            goalRow.setAttribute('aria-label', `Goal word ${game.targetWord.toUpperCase()}`);

            const goalBadge = document.createElement('div');
            goalBadge.className = 'step-num-badge goal-badge';
            goalBadge.textContent = 'GOAL';

            const goalCapsule = document.createElement('div');
            goalCapsule.className = 'ladder-word-capsule goal-capsule';

            game.targetWord.split('').forEach(letter => {
                const tile = document.createElement('div');
                tile.className = 'ladder-tile goal-tile';
                tile.textContent = letter.toUpperCase();
                goalCapsule.appendChild(tile);
            });

            goalRow.appendChild(goalBadge);
            goalRow.appendChild(goalCapsule);
            el.ladderViewport.appendChild(goalRow);
        }

        if (!el.ladderViewport.hidden) {
            requestAnimationFrame(() => {
                el.ladderViewport.scrollTop = el.ladderViewport.scrollHeight;
            });
        }
    }

    function renderStartGoalTiles(container, word, tileClass) {
        container.replaceChildren();
        for (const letter of word.toUpperCase()) {
            const tile = document.createElement('span');
            tile.className = `ladder-tile ${tileClass}`;
            tile.textContent = letter;
            container.appendChild(tile);
        }
    }

    function renderTriedKeyboardKeys() {
        el.virtualKeyboard.querySelectorAll('.key-btn').forEach(button => {
            const letter = button.textContent.trim();
            button.classList.toggle('tried-key', triedLetters.has(letter));
        });
    }

    function updateGameStats() {
        el.moveCountVal.textContent = game.movesCount;
        el.optimalVal.textContent = game.optimalMoves;
        renderBridgeProgress();
        const undoCount = Math.max(0, game.undoStack.size() - 1);
        const redoCount = game.redoStack.size();
        el.undoCountBadge.textContent = undoCount;
        el.redoCountBadge.textContent = redoCount;
        el.undoCountBadge.hidden = undoCount === 0;
        el.redoCountBadge.hidden = redoCount === 0;

        el.undoBtn.disabled = hasRecordedVictory || hasGivenUp || game.undoStack.size() <= 1;
        el.redoBtn.disabled = hasRecordedVictory || hasGivenUp || game.redoStack.isEmpty();
        el.hintBtn.disabled = hasRecordedVictory || hasGivenUp;
        el.solveBtn.disabled = false;
        if (el.giveUpBtn) el.giveUpBtn.disabled = hasRecordedVictory || hasGivenUp;
        for (const tile of el.tilesInteractiveRow.querySelectorAll('.interactive-tile')) {
            tile.disabled = hasRecordedVictory || hasGivenUp;
        }
        for (const key of el.virtualKeyboard.querySelectorAll('.key-btn')) {
            key.disabled = hasRecordedVictory || hasGivenUp;
        }

        const eff = game.getEfficiency();
        el.effBadge.textContent = isAssistedRun ? 'Assisted' : `${eff}%`;
        if (eff >= 90) el.effBadge.style.color = 'var(--puzzle-green)';
        else if (eff >= 70) el.effBadge.style.color = 'var(--puzzle-cyan)';
        else el.effBadge.style.color = 'var(--puzzle-amber)';

        if (el.distanceBadge && game) {
            const distance = getBfsDistance(game.currentWord);
            const changedWord = previousDistanceWord !== game.currentWord;
            let direction = '';
            if (distance === 0) {
                el.distanceBadge.textContent = 'Goal reached';
                el.distanceBadge.classList.add('goal-reached');
            } else if (distance === null) {
                el.distanceBadge.textContent = 'No route found';
                el.distanceBadge.classList.remove('goal-reached');
            } else {
                if (changedWord && previousBfsDistance !== null) {
                    direction = distance < previousBfsDistance ? 'closer' :
                        distance > previousBfsDistance ? 'farther' : 'same distance';
                }
                el.distanceBadge.textContent = `${distance} BFS ${distance === 1 ? 'move' : 'moves'}${direction ? ` · ${direction}` : ''}`;
                el.distanceBadge.classList.remove('goal-reached');
            }
            el.distanceBadge.dataset.trend = direction || 'current';
            el.distanceBadge.setAttribute('aria-label', `Shortest path distance: ${el.distanceBadge.textContent}`);
            previousBfsDistance = distance;
            previousDistanceWord = game.currentWord;
        }
        renderProgressDashboard();
    }

    function renderBridgeProgress() {
        if (!game || !el.startGoalBlock) return;
        const progress = game.currentWord === game.targetWord
            ? 100
            : Math.min(82, game.movesCount * 16);
        el.startGoalBlock.style.setProperty('--bridge-progress', `${progress}%`);
    }

    function animateBridgeAdvance() {
        el.startGoalBlock.classList.remove('bridge-advance');
        void el.startGoalBlock.offsetWidth;
        el.startGoalBlock.classList.add('bridge-advance');
        setTimeout(() => el.startGoalBlock.classList.remove('bridge-advance'), 650);
    }

    function getBfsDistance(word) {
        if (bfsDistanceCache.has(word)) return bfsDistanceCache.get(word);
        const result = solver.findShortestPath(word, game.targetWord);
        const distance = result.success ? result.metrics.moves : null;
        bfsDistanceCache.set(word, distance);
        return distance;
    }

    function updateTimerDisplay() {
        if (!game) return;
        const totalSecs = game.getElapsedTimeSeconds();
        const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        const secs = (totalSecs % 60).toString().padStart(2, '0');
        el.timerVal.textContent = `${mins}:${secs}`;
    }

    function showStatus(message, type = 'info') {
        el.statusMsg.textContent = message;
        el.statusMsg.className = `current-status-message ${type}`;
    }

    /* ========================================================================
     * USER INPUT & MOVE SUBMISSION
     * ======================================================================== */
    function handleLetterInput(letter) {
        if (isReplaying || hasRecordedVictory || hasGivenUp) return;
        window.sound.keyPress();

        draftLetters[selectedTileIndex] = letter.toUpperCase();
        triedLetters.add(letter.toUpperCase());
        renderTriedKeyboardKeys();

        animatedTileIndex = selectedTileIndex;
        renderInteractiveTiles();

        // Check if full word constitutes a valid candidate
        const proposedWord = draftLetters.join('').toLowerCase();
        if (proposedWord !== game.currentWord) {
            showStatus(`Draft: ${proposedWord.toUpperCase()}, press ENTER to submit.`, 'warning');
        }
    }

    function handleBackspace() {
        if (isReplaying || hasRecordedVictory || hasGivenUp) return;
        window.sound.deleteKey();
        const currentRealWord = game.currentWord.toUpperCase();
        // Reset the active tile letter back to original current word
        draftLetters[selectedTileIndex] = currentRealWord[selectedTileIndex];
        
        if (selectedTileIndex > 0) {
            selectedTileIndex--;
        }
        renderInteractiveTiles();
        showStatus('Reverted letter back to current word.', 'info');
    }

    function submitMove() {
        if (isReplaying || hasRecordedVictory || hasGivenUp) return;
        const previousWord = game.currentWord;
        const proposedWord = draftLetters.join('').toLowerCase();
        
        const result = game.makeMove(proposedWord);
        if (result.valid) {
            window.sound.validMove();
            window.sound.wordChange();
            if (!attemptRecordedForRun) {
                attemptRecordedForRun = recordPuzzleAttempt();
            }
            const changedIndex = [...proposedWord].findIndex((letter, index) => letter !== previousWord[index]);
            animatedTileIndex = changedIndex;
            hintWord = '';
            hintLevel = 0;

            draftLetters = game.currentWord.toUpperCase().split('');
            selectedTileIndex = 0;
            renderInteractiveTiles();
            renderLadderHistory();
            updateGameStats();
            updateStackVisualizers();

            const changedTile = document.getElementById(`interactive-tile-${changedIndex}`);
            if (changedTile) changedTile.classList.add('letter-changed');
            el.tilesInteractiveRow.classList.remove('valid-move-pop');
            void el.tilesInteractiveRow.offsetWidth;
            el.tilesInteractiveRow.classList.add('valid-move-pop');
            setTimeout(() => el.tilesInteractiveRow.classList.remove('valid-move-pop'), 300);

            if (result.cycleWarning) {
                showStatus(`Valid step, but cycle detected: '${proposedWord.toUpperCase()}' was already in ladder!`, 'warning');
            } else {
                showStatus(`Valid step! One letter changed.`, 'success');
            }

            animateBridgeAdvance();
            if (result.won) {
                handleVictory();
            }
        } else {
            window.sound.invalidMove();
            showStatus(result.error, 'error');

            el.tilesInteractiveRow.classList.add('shake');
            setTimeout(() => el.tilesInteractiveRow.classList.remove('shake'), 450);
        }
    }

    function handleUndo() {
        if (isReplaying || hasRecordedVictory || hasGivenUp) return;
        const res = game.undo();
        if (res.success) {
            window.sound.undo();
            window.sound.wordChange();
            draftLetters = game.currentWord.toUpperCase().split('');
            selectedTileIndex = 0;
            hintWord = '';
            hintLevel = 0;
            renderInteractiveTiles();
            renderLadderHistory();
            updateGameStats();
            updateStackVisualizers();
            showStatus(`Undid move: [${res.revertedWord.toUpperCase()}].`, 'info');
        } else {
            showStatus(res.message, 'warning');
        }
    }

    function handleRedo() {
        if (isReplaying || hasRecordedVictory || hasGivenUp) return;
        const res = game.redo();
        if (res.success) {
            window.sound.redo();
            window.sound.wordChange();
            draftLetters = game.currentWord.toUpperCase().split('');
            selectedTileIndex = 0;
            hintWord = '';
            hintLevel = 0;
            renderInteractiveTiles();
            renderLadderHistory();
            updateGameStats();
            updateStackVisualizers();
            showStatus(`Redid move: [${res.restoredWord.toUpperCase()}].`, 'info');
        } else {
            showStatus(res.message, 'warning');
        }
    }

    function handleHint() {
        if (isReplaying || hasRecordedVictory || hasGivenUp) return;
        const nextOptimalWord = solver.getHint(game.currentWord, game.targetWord);
        if (nextOptimalWord) {
            window.sound.hint();
            if (hintWord !== game.currentWord) {
                hintWord = game.currentWord;
                hintLevel = 0;
            }
            hintLevel = Math.min(hintLevel + 1, 3);
            let changedIndex = -1;
            for (let i = 0; i < game.currentWord.length; i++) {
                if (game.currentWord[i] !== nextOptimalWord[i]) {
                    changedIndex = i;
                    break;
                }
            }
            selectedTileIndex = changedIndex;
            renderInteractiveTiles();
            if (hintLevel === 1) {
                showStatus(`Hint 1 of 3: Change position ${changedIndex + 1} to move closer to the goal.`, 'info');
            } else if (hintLevel === 2) {
                showStatus(`Hint 2 of 3: Position ${changedIndex + 1} should become '${nextOptimalWord[changedIndex].toUpperCase()}'.`, 'info');
            } else {
                showStatus(`Hint 3 of 3: The optimal next word is [${nextOptimalWord.toUpperCase()}].`, 'info');
            }
        } else {
            showStatus('No reachable path found between current word and target.', 'error');
        }
    }

    function handleVictory() {
        if (hasRecordedVictory) return;
        hasRecordedVictory = true;
        updateGameStats();
        const gameBoard = document.querySelector('.game-board-section');
        if (gameBoard) {
            gameBoard.classList.add('success-pulse');
            setTimeout(() => gameBoard.classList.remove('success-pulse'), 900);
        }
        if (gameTimerInterval) clearInterval(gameTimerInterval);
        el.startGoalBlock.classList.add('bridge-complete');
        window.sound.victory();
        launchConfetti();
        if (!isAssistedRun) {
            recordPuzzleCompletion(game.movesCount, game.getElapsedTimeSeconds());
        }

        const eff = game.getEfficiency();
        const rank = game.getRank();
        el.winMoves.textContent = game.movesCount;
        el.winOptimal.textContent = game.optimalMoves;
        el.winEfficiency.textContent = `${eff}%`;
        el.winTime.textContent = `${game.getElapsedTimeSeconds()}s`;
        if (el.winPath) {
            el.winPath.replaceChildren();
            game.historyLadder.forEach((word, index) => {
                const item = document.createElement('li');
                item.textContent = word.toUpperCase();
                item.style.animationDelay = accessibilityPreferences.reducedMotion ? '0ms' : `${index * 100}ms`;
                el.winPath.appendChild(item);
            });
        }

        el.winTitle.textContent = isAssistedRun ? 'YOU WON!' : 'PUZZLE SOLVED!';
        const modalSub = document.querySelector('#win-modal .modal-subtitle');
        if (modalSub) {
            modalSub.textContent = isAssistedRun
                ? 'You won! Try manual next time.'
                : 'You transformed the ladder with algorithmic precision!';
        }
        el.winEfficiency.textContent = isAssistedRun ? 'Assisted (Try manual next time)' : `${eff}%`;
        el.winResultSummary.textContent = isAssistedRun
            ? 'You won, try manual next time!'
            : `Solved in ${game.movesCount} moves, Optimal ${game.optimalMoves}, ${eff}% efficiency.`;
        el.winShareStatus.textContent = '';
        
        el.winRankBadge.textContent = isAssistedRun ? '🤖 BFS Auto-Solved (Try manual next time)' : rank.title;
        el.winRankBadge.style.color = isAssistedRun ? 'var(--text-primary)' : rank.color;
        el.winRankBadge.style.borderColor = isAssistedRun ? 'var(--puzzle-cyan)' : rank.color;

        el.winDailyStreak.hidden = !activeDailyDate;
        let dailyStreak = null;
        if (activeDailyDate) {
            if (isAssistedRun) {
                el.winDailyStreak.textContent = 'Assisted run · Daily streak preserved, try manual next time.';
            } else {
                dailyStreak = completeDailyChallenge(activeDailyDate);
                el.winDailyStreak.textContent = dailyStreak === null
                    ? 'Daily complete · streak could not be saved in this browser.'
                    : `Daily challenge complete · ${dailyStreak}-day streak`;
            }
        }
        if (activeCampaignIndex !== null) {
            completeCampaignLevel(activeCampaignIndex);
        }
        const newlyUnlocked = isAssistedRun ? [] : updateAchievements(dailyStreak);
        el.winAchievementsNote.hidden = newlyUnlocked.length === 0;
        el.winAchievementsNote.textContent = newlyUnlocked.length > 0
            ? `🏅 Achievement${newlyUnlocked.length === 1 ? '' : 's'} unlocked: ${newlyUnlocked.map(achievement => achievement.title).join(', ')}`
            : '';

        const nextButton = document.getElementById('win-next-btn');
        nextButton.textContent = activeCampaignIndex !== null
            ? (activeCampaignIndex + 1 < PRESETS.length ? 'Next Level ▶' : 'View Levels')
            : 'Next Puzzle ▶';
        openModal(el.winModal);
    }

    async function shareVictory() {
        const path = game.historyLadder;
        const rows = path.slice(1).map((word, index) => {
            const previousWord = path[index];
            return [...word].map((letter, letterIndex) =>
                letter === previousWord[letterIndex] ? '⬜' : '🟩'
            ).join('');
        });
        const shareText = [
            `Word Bridge: ${game.startWord.toUpperCase()} → ${game.targetWord.toUpperCase()}`,
            `Solved in ${game.movesCount} moves`,
            ...rows
        ].join('\n');

        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            el.winShareStatus.textContent = 'Clipboard access is unavailable in this browser.';
            return;
        }

        try {
            await navigator.clipboard.writeText(shareText);
            el.winShareStatus.textContent = 'Emoji path copied to clipboard.';
        } catch (error) {
            console.error('Could not copy the Word Bridge result:', error);
            el.winShareStatus.textContent = 'Could not copy the emoji path. Check clipboard permissions and try again.';
        }
    }

    /* ========================================================================
     * MODULE 3: DUAL-STACK VISUALIZER (Sumit Mehta)
     * ======================================================================== */
    function updateStackVisualizers() {
        if (!game || !el.undoStackContainer) return;

        // Undo Stack Visualizer
        const undoWords = game.undoStack.toArray();
        if (el.undoStackCount) el.undoStackCount.textContent = `${undoWords.length} items`;
        el.undoStackContainer.innerHTML = '';
        if (undoWords.length === 0) {
            el.undoStackContainer.innerHTML = '<span class="stack-empty-msg">(Empty Stack)</span>';
        } else {
            [...undoWords].reverse().forEach((word, idx) => {
                const item = document.createElement('div');
                item.className = 'stack-element' + (idx === undoWords.length - 1 ? ' top-elem' : '');
                item.textContent = (idx === undoWords.length - 1 ? 'TOP ➔ ' : '') + word.toUpperCase();
                el.undoStackContainer.appendChild(item);
            });
        }

        // Redo Stack Visualizer
        if (!el.redoStackContainer) return;
        const redoWords = game.redoStack.toArray();
        if (el.redoStackCount) el.redoStackCount.textContent = `${redoWords.length} items`;
        el.redoStackContainer.innerHTML = '';
        if (redoWords.length === 0) {
            el.redoStackContainer.innerHTML = '<span class="stack-empty-msg">(Empty Stack)</span>';
        } else {
            [...redoWords].reverse().forEach((word, idx) => {
                const item = document.createElement('div');
                item.className = 'stack-element' + (idx === redoWords.length - 1 ? ' top-elem' : '');
                item.textContent = (idx === redoWords.length - 1 ? 'TOP ➔ ' : '') + word.toUpperCase();
                el.redoStackContainer.appendChild(item);
            });
        }
    }

    /* ========================================================================
     * MODULE 4: DOUBLY LINKED LIST AUTO-SOLVER & REPLAYER (Suraj Bisht)
     * ======================================================================== */
    function loadGameMode() {
        try {
            const savedMode = localStorage.getItem(GAME_MODE_KEY);
            if (savedMode === 'play' || savedMode === 'learn') {
                gameMode = savedMode;
            } else if (savedMode !== null) {
                throw new Error('Saved game mode has an invalid value.');
            }
        } catch (error) {
            console.error('Could not load WordBridge game mode:', error);
            gameMode = 'play';
        }
        applyGameMode();
    }

    function saveGameMode() {
        try {
            localStorage.setItem(GAME_MODE_KEY, gameMode);
        } catch (error) {
            console.error('Could not save WordBridge game mode:', error);
        }
    }

    function loadQuickGuidePreference() {
        try {
            if (localStorage.getItem(QUICK_GUIDE_DISMISSED_KEY) === 'true' && el.quickPlayGuide) {
                el.quickPlayGuide.hidden = true;
            }
        } catch (error) {
            console.error('Could not load WordBridge quick guide preference:', error);
        }
    }

    function dismissQuickGuide() {
        if (el.quickPlayGuide) el.quickPlayGuide.hidden = true;
        try {
            localStorage.setItem(QUICK_GUIDE_DISMISSED_KEY, 'true');
        } catch (error) {
            console.error('Could not save WordBridge quick guide preference:', error);
        }
    }

    function applyGameMode() {
        document.body.dataset.gameMode = gameMode;
        if (el.solverToggleBtn) {
            const active = gameMode === 'learn' && solverDrawerOpen;
            const canReviewSolution = hasRecordedVictory || hasGivenUp;
            el.solverToggleBtn.textContent = active
                ? 'Close Solver'
                : canReviewSolution
                    ? 'See how BFS solved it'
                    : 'Solver';
            el.solverToggleBtn.setAttribute('aria-pressed', String(active));
            el.solverToggleBtn.setAttribute('aria-expanded', String(solverDrawerOpen));
            el.solverToggleBtn.title = active
                ? 'Close the solver and return to Play mode'
                : canReviewSolution
                    ? 'See how BFS solved the puzzle'
                    : 'Open the solver (Learn mode)';
            el.solverToggleBtn.setAttribute('aria-label', el.solverToggleBtn.title);
        }
    }

    function setGameMode(mode) {
        gameMode = mode;
        saveGameMode();
        applyGameMode();
    }

    function resetSolverDisplay() {
        stopBfsPlayback();
        if (replayInterval) clearInterval(replayInterval);
        replayInterval = null;
        isReplaying = false;
        replayer = null;
        bfsExploration = [];
        bfsDiscoveryOrder = [];
        bfsDisplayEntries = [];
        bfsDepthCounts = new Map();
        bfsSolutionWords = new Set();
        bfsPlaybackIndex = -1;
        bfsExplorationRendered = 0;
        if (el.bfsExplorationList) el.bfsExplorationList.replaceChildren();
        if (el.bfsExplorationCount) el.bfsExplorationCount.textContent = 'Open Learn mode to explore the word graph';
        if (el.bfsExplorationMore) el.bfsExplorationMore.hidden = true;
        if (el.bfsExplorationProgress) el.bfsExplorationProgress.setAttribute('aria-valuenow', '0');
        if (el.bfsExplorationProgressFill) el.bfsExplorationProgressFill.style.width = '0%';
        if (el.bfsPlaybackStatus) el.bfsPlaybackStatus.textContent = 'Open Learn mode to inspect the search.';
        if (el.nodeChainView) el.nodeChainView.replaceChildren();
        if (el.solverTelemetryCard) {
            el.solverTelemetryCard.innerHTML = `
                <div class="metrics-grid-live">
                    <div class="telemetry-stat-card"><span class="t-stat-label">Path Words</span><span class="t-stat-val">--</span></div>
                    <div class="telemetry-stat-card"><span class="t-stat-label">Optimal Moves</span><span class="t-stat-val">--</span></div>
                    <div class="telemetry-stat-card"><span class="t-stat-label">Nodes Explored</span><span class="t-stat-val">--</span></div>
                    <div class="telemetry-stat-card"><span class="t-stat-label">Compute Time</span><span class="t-stat-val">--</span></div>
                </div>
            `;
        }
        if (el.solverStatusPill) {
            el.solverStatusPill.textContent = '● Solver ready';
            el.solverStatusPill.classList.remove('ready');
        }
        if (el.replayStepIndicator) el.replayStepIndicator.textContent = 'Step 1 of 1';
        if (el.stepDiffText) el.stepDiffText.textContent = 'Open Learn mode to view the solution sequence.';
        if (el.replayProgressFill) el.replayProgressFill.style.width = '0%';
        if (el.replayPlayBtn) el.replayPlayBtn.disabled = true;
        if (el.replayFirstBtn) el.replayFirstBtn.disabled = true;
        if (el.replayPrevBtn) el.replayPrevBtn.disabled = true;
        if (el.replayNextBtn) el.replayNextBtn.disabled = true;
        if (el.replayLastBtn) el.replayLastBtn.disabled = true;
        if (el.bfsExplorationPrev) el.bfsExplorationPrev.disabled = true;
        if (el.bfsExplorationPlay) el.bfsExplorationPlay.disabled = true;
        if (el.bfsExplorationNext) el.bfsExplorationNext.disabled = true;
        if (el.bfsExplorationPanel) el.bfsExplorationPanel.open = false;
    }

    function markRunAssisted() {
        if (isAssistedRun) return;
        isAssistedRun = true;
        if (attemptRecordedForRun) {
            personalStats.attempts = Math.max(personalStats.completed, personalStats.attempts - 1);
            attemptRecordedForRun = false;
            savePersonalStats();
            renderPersonalStats();
        }
        if (el.effBadge) el.effBadge.textContent = 'Assisted';
    }

    function openSolverDrawer({ announce = true, startWord = game?.startWord } = {}) {
        if (!game || !el.autoSolverSection || !el.solverDrawerBackdrop) return;
        setGameMode('learn');
        solverDrawerOpen = true;
        document.body.classList.add('solver-drawer-open');
        el.solverDrawerBackdrop.hidden = false;
        el.solverDrawerBackdrop.setAttribute('aria-hidden', 'false');
        el.autoSolverSection.setAttribute('role', 'dialog');
        el.autoSolverSection.setAttribute('aria-modal', 'true');
        el.autoSolverSection.setAttribute('aria-label', 'BFS Path Explorer, Learn mode');
        applyGameMode();
        const wordToSolve = (typeof startWord === 'string' && startWord.trim())
            ? startWord.trim()
            : (game ? game.startWord : '');
        launchAutoSolver(announce, wordToSolve);
        el.solverDrawerClose?.focus({ preventScroll: true });
    }

    function closeSolverDrawer(returnToPlay = true) {
        const wasOpen = solverDrawerOpen;
        solverDrawerOpen = false;
        document.body.classList.remove('solver-drawer-open');
        if (el.solverDrawerBackdrop) {
            el.solverDrawerBackdrop.hidden = true;
            el.solverDrawerBackdrop.setAttribute('aria-hidden', 'true');
        }
        if (el.autoSolverSection) {
            el.autoSolverSection.removeAttribute('role');
            el.autoSolverSection.removeAttribute('aria-modal');
            el.autoSolverSection.setAttribute('aria-label', 'BFS Path Explorer');
        }
        if (returnToPlay) setGameMode('play');
        else applyGameMode();
        if (wasOpen && returnToPlay) el.solverToggleBtn?.focus({ preventScroll: true });
    }

    function toggleSolverDrawer() {
        if (solverDrawerOpen) {
            closeSolverDrawer();
            return;
        }
        if (!hasRecordedVictory && !hasGivenUp && !isAssistedRun) {
            const confirmed = window.confirm('This reveals the solution. Efficiency score will not count.');
            if (!confirmed) return;
            markRunAssisted();
            hasGivenUp = true;
            if (gameTimerInterval) clearInterval(gameTimerInterval);
            updateGameStats();
        }
        openSolverDrawer({ announce: true, startWord: game?.startWord });
    }

    function handleSolveClick() {
        if (!hasRecordedVictory && !hasGivenUp && !isAssistedRun) {
            const confirmed = window.confirm('This reveals the optimal BFS solution. Efficiency score will not count.');
            if (!confirmed) return;
            markRunAssisted();
            hasGivenUp = true;
            if (gameTimerInterval) clearInterval(gameTimerInterval);
            updateGameStats();
            showStatus('BFS Auto-Solver revealed the optimal path.', 'warning');
        }
        openSolverDrawer({ announce: true, startWord: game?.startWord });
    }

    function handleGiveUp() {
        if (hasRecordedVictory || hasGivenUp) return;
        if (el.giveUpModal) {
            openModal(el.giveUpModal);
        } else {
            confirmGiveUp();
        }
    }

    function confirmGiveUp() {
        if (el.giveUpModal) closeModal(el.giveUpModal);
        markRunAssisted();
        hasGivenUp = true;
        if (gameTimerInterval) clearInterval(gameTimerInterval);
        updateGameStats();

        if (activeCampaignIndex !== null) {
            completeCampaignLevel(activeCampaignIndex);
        }

        showStatus('You won! Try manual next time.', 'success');
        openSolverDrawer({ announce: false, startWord: game?.startWord });
        launchAutoSolver(false, game?.startWord);

        if (el.solverNextLevelBtn) {
            el.solverNextLevelBtn.style.display = 'inline-flex';
            el.solverNextLevelBtn.textContent = (activeCampaignIndex !== null && activeCampaignIndex + 1 < PRESETS.length)
                ? 'Next Level ▶'
                : 'Next Puzzle ▶';
        }

        setTimeout(() => {
            showAssistedWinModal();
        }, 1200);
    }

    function showAssistedWinModal() {
        if (!game) return;
        hasRecordedVictory = true;
        if (gameTimerInterval) clearInterval(gameTimerInterval);
        el.startGoalBlock.classList.add('bridge-complete');
        window.sound.victory();
        launchConfetti();

        if (activeCampaignIndex !== null) {
            completeCampaignLevel(activeCampaignIndex);
        }

        el.winTitle.textContent = 'YOU WON!';
        el.winTitle.style.color = 'var(--accent-emerald, #15803d)';
        const subtitle = document.querySelector('#win-modal .modal-subtitle');
        if (subtitle) {
            subtitle.textContent = 'You won! Try manual next time.';
        }
        const totalSteps = replayer ? replayer.totalSteps : (game.optimalMoves + 1);
        el.winMoves.textContent = totalSteps ? totalSteps - 1 : game.optimalMoves;
        el.winOptimal.textContent = game.optimalMoves;
        el.winEfficiency.textContent = 'Try manual next time';
        el.winTime.textContent = `${game.getElapsedTimeSeconds()}s`;

        if (el.winPath) {
            el.winPath.replaceChildren();
            const pathWords = replayer ? replayer.toArray().map(n => n.word) : [game.startWord, game.targetWord];
            pathWords.forEach((word, index) => {
                const item = document.createElement('li');
                item.textContent = word.toUpperCase();
                item.style.animationDelay = accessibilityPreferences.reducedMotion ? '0ms' : `${index * 80}ms`;
                el.winPath.appendChild(item);
            });
        }

        el.winRankBadge.textContent = '🤖 BFS Auto-Solved (Try manual next time)';
        el.winRankBadge.style.color = 'var(--text-primary)';
        el.winRankBadge.style.borderColor = 'var(--puzzle-cyan)';
        el.winResultSummary.textContent = 'You won, try manual next time!';

        if (el.winDailyStreak) {
            el.winDailyStreak.hidden = !activeDailyDate;
            if (activeDailyDate) {
                el.winDailyStreak.textContent = 'Assisted run · Daily streak preserved, try manual next time.';
            }
        }

        const nextButton = document.getElementById('win-next-btn');
        if (nextButton) {
            nextButton.textContent = activeCampaignIndex !== null
                ? (activeCampaignIndex + 1 < PRESETS.length ? 'Next Level ▶' : 'View Levels')
                : 'Next Puzzle ▶';
        }

        openModal(el.winModal);
    }

    function launchAutoSolver(announce = true, startWord = game?.startWord) {
        if (!solver || !game) return;
        const shouldAnnounce = typeof announce === 'boolean' ? announce : true;
        const wordToSolve = (typeof startWord === 'string' && startWord.trim())
            ? startWord.trim()
            : (game ? game.startWord : '');
        if (replayInterval) {
            clearInterval(replayInterval);
            replayInterval = null;
        }
        if (el.replayPlayBtn) {
            el.replayPlayBtn.innerHTML = '▶ Auto-Play';
            el.replayPlayBtn.title = 'Auto-Play sequence';
            el.replayPlayBtn.setAttribute('aria-pressed', 'false');
        }
        isReplaying = false;
        stopBfsPlayback();
        const solution = solver.findShortestPath(wordToSolve, game.targetWord);
        if (!solution.success) {
            bfsExploration = solution.exploration || [];
            bfsDiscoveryOrder = solution.discoveryOrder || [];
            bfsSolutionWords = new Set();
            bfsPlaybackIndex = -1;
            renderBfsExploration();
            showStatus(solution.error, 'error');
            return;
        }

        bfsExploration = solution.exploration || [];
        bfsDiscoveryOrder = solution.discoveryOrder || [];
        bfsSolutionWords = new Set(solution.path);
        bfsPlaybackIndex = -1;
        bfsExplorationRendered = 0;
        renderBfsExploration();
        replayer = new window.DoublyLinkedListReplay(solution.path);
        renderReplayNodeChain();
        updateReplayStep();

        // Render Telemetry in Plain, Clean Style
        if (el.solverTelemetryCard) {
            el.solverTelemetryCard.innerHTML = `
                <div class="metrics-grid-live">
                    <div class="telemetry-stat-card">
                        <span class="t-stat-label">Path Words</span>
                        <span class="t-stat-val">${solution.metrics.pathLength} <small>words</small></span>
                    </div>
                    <div class="telemetry-stat-card">
                        <span class="t-stat-label">Optimal Moves</span>
                        <span class="t-stat-val text-optimal">${solution.metrics.moves} <small>steps</small></span>
                    </div>
                    <div class="telemetry-stat-card">
                        <span class="t-stat-label">Nodes Explored</span>
                        <span class="t-stat-val">${(solution.metrics.nodesVisited || 0).toLocaleString()} <small>visited</small></span>
                    </div>
                    <div class="telemetry-stat-card">
                        <span class="t-stat-label">Compute Latency</span>
                        <span class="t-stat-val">${solution.metrics.executionTimeMs != null ? solution.metrics.executionTimeMs.toFixed(1) : '<1'} <small>ms</small></span>
                    </div>
                </div>
            `;
        }

        if (el.solverStatusPill) {
            el.solverStatusPill.textContent = `● Solved: ${solution.metrics.moves} Moves Optimal`;
            el.solverStatusPill.classList.add('ready');
        }

        if (el.replayPlayBtn) el.replayPlayBtn.disabled = false;
        if (el.replayFirstBtn) el.replayFirstBtn.disabled = false;
        if (el.replayLastBtn) el.replayLastBtn.disabled = false;
        if (announce) showStatus('BFS solution is ready in the Learn drawer.', 'success');
    }

    function renderBfsExploration(append = false) {
        if (!el.bfsExplorationList || !el.bfsExplorationCount || !el.bfsExplorationMore) return;
        if (!append) {
            el.bfsExplorationList.innerHTML = '';
            bfsExplorationRendered = 0;
            const discoveryIndexes = new Map(bfsDiscoveryOrder.map((entry, index) => [entry.word, index]));
            const explorationIndexes = new Map(bfsExploration.map((entry, index) => [entry.word, index]));
            bfsDisplayEntries = bfsDiscoveryOrder.map((entry, discoveryIndex) => ({
                ...entry,
                discoveryIndex,
                explorationIndex: explorationIndexes.get(entry.word) ?? -1
            }));
            bfsDepthCounts = new Map();
            for (const entry of bfsDisplayEntries) {
                bfsDepthCounts.set(entry.distance, (bfsDepthCounts.get(entry.distance) || 0) + 1);
            }
        }

        const nextEnd = Math.min(bfsExplorationRendered + EXPLORATION_BATCH_SIZE, bfsDisplayEntries.length);
        for (let index = bfsExplorationRendered; index < nextEnd; index++) {
            const entry = bfsDisplayEntries[index];
            let depthGroup = el.bfsExplorationList.querySelector(`.bfs-depth-group[data-depth-group="${entry.distance}"]`);
            if (!depthGroup) {
                depthGroup = document.createElement('li');
                depthGroup.className = 'bfs-depth-group';
                depthGroup.dataset.depthGroup = String(entry.distance);

                const details = document.createElement('details');
                details.open = true;
                const heading = document.createElement('summary');
                const title = document.createElement('span');
                title.className = 'bfs-depth-title';
                title.textContent = `D${entry.distance} · Depth ${entry.distance}`;
                const count = document.createElement('span');
                count.className = 'bfs-depth-count';
                const depthWordCount = bfsDepthCounts.get(entry.distance) || 0;
                count.textContent = `${depthWordCount} ${depthWordCount === 1 ? 'word' : 'words'}`;
                heading.append(title, count);

                const words = document.createElement('ol');
                words.className = 'bfs-depth-words';
                words.setAttribute('aria-label', `Words at depth ${entry.distance}`);
                details.append(heading, words);
                depthGroup.appendChild(details);
                el.bfsExplorationList.appendChild(depthGroup);
            }
            const depthWords = depthGroup.querySelector('.bfs-depth-words');
            const item = document.createElement('li');
            item.dataset.depth = String(entry.distance);
            item.dataset.target = String(entry.word === game?.targetWord);
            item.dataset.word = entry.word;
            item.dataset.explorationIndex = String(entry.explorationIndex);
            item.dataset.discoveryIndex = String(entry.discoveryIndex);
            item.setAttribute('aria-label', `${entry.word.toUpperCase()}, depth ${entry.distance}`);
            if (entry.explorationIndex >= 0) {
                item.setAttribute('role', 'button');
                item.setAttribute('tabindex', '0');
                item.setAttribute('title', `Jump to ${entry.word.toUpperCase()} in BFS exploration`);
            }
            if (bfsSolutionWords.has(entry.word)) item.classList.add('solution-path');

            const order = document.createElement('span');
            order.className = 'bfs-exploration-index';
            order.textContent = entry.explorationIndex >= 0
                ? `#${entry.explorationIndex + 1}`
                : `Q${entry.discoveryIndex + 1}`;

            const word = document.createElement('strong');
            word.textContent = entry.word.toUpperCase();

            const depth = document.createElement('span');
            depth.className = 'bfs-exploration-depth';
            depth.textContent = `D${entry.distance}`;
            depth.setAttribute('aria-label', `depth ${entry.distance}`);

            const state = document.createElement('span');
            state.className = 'bfs-exploration-state';
            item.append(order, word, depth, state);
            depthWords.appendChild(item);
        }
        bfsExplorationRendered = nextEnd;
        el.bfsExplorationCount.textContent = `${bfsExploration.length.toLocaleString()} explored · ${bfsDiscoveryOrder.length.toLocaleString()} discovered`;
        el.bfsExplorationMore.hidden = bfsExplorationRendered >= bfsDisplayEntries.length;
        el.bfsExplorationMore.textContent = `Show next ${Math.min(EXPLORATION_BATCH_SIZE, bfsDisplayEntries.length - bfsExplorationRendered).toLocaleString()} words`;
        if (el.bfsExplorationPrev) el.bfsExplorationPrev.disabled = bfsPlaybackIndex < 0;
        if (el.bfsExplorationNext) el.bfsExplorationNext.disabled = bfsPlaybackIndex >= bfsExploration.length - 1;
        if (el.bfsExplorationPlay) el.bfsExplorationPlay.disabled = bfsExploration.length === 0;
        if (el.bfsExplorationPanel) el.bfsExplorationPanel.open = bfsDisplayEntries.length > 0;
        updateBfsPlaybackState();
    }

    function updateBfsPlaybackState() {
        if (!el.bfsExplorationList) return;
        const currentEntry = bfsPlaybackIndex >= 0 ? bfsExploration[bfsPlaybackIndex] : null;
        const discoveredCount = currentEntry
            ? currentEntry.discoveredCount
            : Math.min(1, bfsDiscoveryOrder.length);
        const exploredWords = new Set(
            bfsExploration.slice(0, bfsPlaybackIndex + 1).map(entry => entry.word)
        );
        const queueCount = Math.max(0, discoveredCount - exploredWords.size);

        for (const item of el.bfsExplorationList.querySelectorAll('li[data-word]')) {
            const discoveryIndex = Number(item.dataset.discoveryIndex);
            const explorationIndex = Number(item.dataset.explorationIndex);
            const discovered = discoveryIndex < discoveredCount;
            const explored = discovered && explorationIndex >= 0 && explorationIndex <= bfsPlaybackIndex;
            const active = explored && explorationIndex === bfsPlaybackIndex;
            const state = active ? 'current' : explored ? 'explored' : discovered ? 'queued' : 'pending';
            item.dataset.state = state;
            item.classList.toggle('bfs-current', active);
            const stateLabel = item.querySelector('.bfs-exploration-state');
            if (stateLabel) {
                const pathLabel = item.classList.contains('solution-path') ? ' · path' : '';
                stateLabel.textContent = `${state === 'current' ? 'Now' : state}${pathLabel}`;
            }
            item.setAttribute('aria-label', `${item.dataset.word.toUpperCase()}, depth ${item.dataset.depth}, ${state}${item.classList.contains('solution-path') ? ', shortest path' : ''}`);
        }

        if (el.bfsPlaybackStatus) {
            const exploredCount = bfsPlaybackIndex + 1;
            const currentWord = currentEntry ? ` · ${currentEntry.word.toUpperCase()}` : '';
            el.bfsPlaybackStatus.textContent = `${exploredCount} / ${bfsExploration.length} explored · ${queueCount} queued${currentWord}`;
        }
        const progress = bfsExploration.length
            ? Math.max(0, Math.min(100, ((bfsPlaybackIndex + 1) / bfsExploration.length) * 100))
            : 0;
        if (el.bfsExplorationProgress) {
            el.bfsExplorationProgress.setAttribute('aria-valuenow', String(Math.round(progress)));
        }
        if (el.bfsExplorationProgressFill) {
            el.bfsExplorationProgressFill.style.width = `${progress}%`;
        }
        if (el.bfsExplorationPrev) el.bfsExplorationPrev.disabled = bfsPlaybackIndex < 0;
        if (el.bfsExplorationNext) el.bfsExplorationNext.disabled = bfsPlaybackIndex >= bfsExploration.length - 1;
    }

    function handleBfsExplorationItem(event) {
        const item = event.target.closest('li[data-word][role="button"]');
        if (!item || !el.bfsExplorationList.contains(item)) return;
        if (event.type === 'keydown') {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
        }
        const explorationIndex = Number(item.dataset.explorationIndex);
        if (Number.isInteger(explorationIndex) && explorationIndex >= 0) {
            stepBfsExploration(explorationIndex);
        }
    }

    function stepBfsExploration(index) {
        if (bfsExploration.length === 0) return;
        bfsPlaybackIndex = Math.max(-1, Math.min(index, bfsExploration.length - 1));
        while (bfsExplorationRendered <= bfsPlaybackIndex && bfsExplorationRendered < bfsDisplayEntries.length) {
            renderBfsExploration(true);
        }
        updateBfsPlaybackState();
    }

    function toggleBfsExplorationPlayback() {
        if (bfsPlaybackInterval) {
            stopBfsPlayback();
            return;
        }
        if (bfsExploration.length === 0) return;
        if (bfsPlaybackIndex >= bfsExploration.length - 1) stepBfsExploration(-1);
        if (el.bfsExplorationPlay) {
            el.bfsExplorationPlay.textContent = '⏸ Pause';
            el.bfsExplorationPlay.title = 'Pause BFS exploration';
            el.bfsExplorationPlay.setAttribute('aria-pressed', 'true');
        }
        bfsPlaybackInterval = setInterval(() => {
            if (bfsPlaybackIndex >= bfsExploration.length - 1) {
                stopBfsPlayback();
                return;
            }
            stepBfsExploration(bfsPlaybackIndex + 1);
        }, getPlaybackDelay());
    }

    function stopBfsPlayback() {
        if (bfsPlaybackInterval) {
            clearInterval(bfsPlaybackInterval);
            bfsPlaybackInterval = null;
        }
        if (el.bfsExplorationPlay) {
            el.bfsExplorationPlay.textContent = '▶ Explore';
            el.bfsExplorationPlay.title = 'Play BFS exploration';
            el.bfsExplorationPlay.setAttribute('aria-pressed', 'false');
        }
    }

    function getPlaybackDelay() {
        return Number(el.playbackSpeedSelect?.value) || 850;
    }

    function renderReplayNodeChain() {
        if (!replayer || !el.nodeChainView) return;
        const activeStep = document.activeElement?.classList.contains('chain-step-card')
            ? Number(document.activeElement.dataset.stepIndex)
            : null;
        el.nodeChainView.innerHTML = '';
        const nodes = replayer.toArray();

        nodes.forEach((n, idx) => {
            const nodeDiv = document.createElement('button');
            nodeDiv.type = 'button';
            nodeDiv.className = 'chain-step-card' + (n.isCurrent ? ' active-card' : '');
            nodeDiv.dataset.stepIndex = String(idx);
            nodeDiv.setAttribute('aria-label', `Jump to step ${n.stepNumber}: ${n.word.toUpperCase()}${n.isCurrent ? ', current step' : ''}`);
            if (n.isCurrent) nodeDiv.setAttribute('aria-current', 'step');
            
            // Step header row (Badge & Index)
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-step-header';

            const numBadge = document.createElement('span');
            numBadge.className = 'card-step-num';
            numBadge.textContent = `STEP ${n.stepNumber}`;

            const roleTag = document.createElement('span');
            roleTag.className = 'card-role-tag';
            if (idx === 0) {
                roleTag.textContent = 'START';
                roleTag.classList.add('tag-start');
            } else if (idx === nodes.length - 1) {
                roleTag.textContent = 'GOAL';
                roleTag.classList.add('tag-goal');
            } else {
                roleTag.textContent = `MOVE ${idx}`;
            }

            cardHeader.appendChild(numBadge);
            cardHeader.appendChild(roleTag);
            nodeDiv.appendChild(cardHeader);

            // Letter Tiles Row with changed letter highlighted
            const lettersRow = document.createElement('div');
            lettersRow.className = 'card-letters-row';

            const wordLetters = n.word.toUpperCase().split('');
            const prevWordLetters = idx > 0 ? nodes[idx - 1].word.toUpperCase().split('') : null;

            wordLetters.forEach((char, charIdx) => {
                const charBox = document.createElement('span');
                charBox.className = 'card-char-box';
                charBox.textContent = char;

                if (prevWordLetters && prevWordLetters[charIdx] !== char) {
                    charBox.classList.add('char-changed');
                    charBox.title = `Changed from '${prevWordLetters[charIdx]}' to '${char}'`;
                }
                lettersRow.appendChild(charBox);
            });

            nodeDiv.appendChild(lettersRow);

            // Click to jump
            nodeDiv.addEventListener('click', () => {
                replayer.jumpTo(idx);
                window.sound.keyPress();
                updateReplayStep();
            });

            el.nodeChainView.appendChild(nodeDiv);
            if (activeStep === idx) nodeDiv.focus({ preventScroll: true });

            if (idx < nodes.length - 1) {
                const pointer = document.createElement('div');
                pointer.className = 'chain-step-arrow';
                pointer.textContent = '➔';
                el.nodeChainView.appendChild(pointer);
            }

            if (n.isCurrent) {
                setTimeout(() => {
                    nodeDiv.scrollIntoView({
                        behavior: accessibilityPreferences.reducedMotion ? 'auto' : 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }, 50);
            }
        });
    }

    function updateReplayStep() {
        if (!replayer || !replayer.current) return;
        const curr = replayer.current;
        const total = replayer.totalSteps;
        const currIdx = replayer.currentIndex != null ? replayer.currentIndex : (curr.stepNumber - 1);

        window.sound.wordChange();

        if (el.replayStepIndicator) {
            el.replayStepIndicator.textContent = `Step ${curr.stepNumber} of ${total}`;
        }

        if (el.replayProgressFill) {
            const pct = Math.min(100, Math.round(((currIdx + 1) / total) * 100));
            el.replayProgressFill.style.width = `${pct}%`;
        }

        // Detailed move diff explanation in inspector
        if (el.stepDiffText) {
            const target = game ? game.targetWord.toUpperCase() : '';
            if (currIdx === 0) {
                el.stepDiffText.innerHTML = `Starting at <strong>${curr.word.toUpperCase()}</strong>. Target is <strong>${target}</strong> (${total - 1} optimal moves away).`;
            } else if (currIdx === total - 1) {
                el.stepDiffText.innerHTML = `🎉 Reached goal word <strong>${curr.word.toUpperCase()}</strong>! Shortest path verified in ${total - 1} moves.`;
                if (activeCampaignIndex !== null) {
                    completeCampaignLevel(activeCampaignIndex);
                }
                if (el.solverNextLevelBtn) {
                    el.solverNextLevelBtn.style.display = 'inline-flex';
                    el.solverNextLevelBtn.textContent = (activeCampaignIndex !== null && activeCampaignIndex + 1 < PRESETS.length)
                        ? 'Next Level ▶'
                        : 'Next Puzzle ▶';
                }
            } else {
                const nodes = replayer.toArray();
                const prev = nodes[currIdx - 1].word.toUpperCase();
                const now = curr.word.toUpperCase();
                let diffPos = -1;
                for (let i = 0; i < now.length; i++) {
                    if (prev[i] !== now[i]) { diffPos = i; break; }
                }
                const distToTarget = window.BFSSolver ? window.BFSSolver.hammingDistance(curr.word, game.targetWord) : -1;
                el.stepDiffText.innerHTML = `Step ${curr.stepNumber}: Changed '<strong>${prev[diffPos]}</strong>' ➔ '<strong>${now[diffPos]}</strong>' at letter ${diffPos + 1}. Distance to goal: <strong>${distToTarget}</strong>.`;
            }
        }

        draftLetters = curr.word.toUpperCase().split('');
        renderInteractiveTiles();
        renderReplayNodeChain();

        const hasPrev = replayer.hasPrev();
        const hasNext = replayer.hasNext();

        if (el.replayFirstBtn) el.replayFirstBtn.disabled = !hasPrev;
        if (el.replayPrevBtn) el.replayPrevBtn.disabled = !hasPrev;
        if (el.replayNextBtn) el.replayNextBtn.disabled = !hasNext;
        if (el.replayLastBtn) el.replayLastBtn.disabled = !hasNext;
    }

    function toggleReplayAutoPlay() {
        if (replayInterval) {
            clearInterval(replayInterval);
            replayInterval = null;
            el.replayPlayBtn.innerHTML = '▶ Auto-Play';
            el.replayPlayBtn.title = 'Auto-Play sequence';
            el.replayPlayBtn.setAttribute('aria-pressed', 'false');
            isReplaying = false;
        } else {
            isReplaying = true;
            el.replayPlayBtn.innerHTML = '⏸ Pause';
            el.replayPlayBtn.title = 'Pause sequence';
            el.replayPlayBtn.setAttribute('aria-pressed', 'true');
            replayInterval = setInterval(() => {
                if (replayer.hasNext()) {
                    replayer.next();
                    updateReplayStep();
                } else {
                    clearInterval(replayInterval);
                    replayInterval = null;
                    el.replayPlayBtn.innerHTML = '▶ Auto-Play';
                    el.replayPlayBtn.title = 'Auto-Play sequence';
                    el.replayPlayBtn.setAttribute('aria-pressed', 'false');
                    isReplaying = false;
                    window.sound.victory();
                    launchConfetti();
                    if (activeCampaignIndex !== null) {
                        completeCampaignLevel(activeCampaignIndex);
                    }
                    if (el.solverNextLevelBtn) {
                        el.solverNextLevelBtn.style.display = 'inline-flex';
                    }
                    showStatus('You won! Try manual next time.', 'success');
                    setTimeout(() => {
                        showAssistedWinModal();
                    }, 800);
                }
            }, getPlaybackDelay());
        }
    }

    /* ========================================================================
     * MODULE 1: BINARY SEARCH TRACER (Prachi Tiwari)
     * ======================================================================== */
    function runBinarySearchTrace() {
        const query = (el.searchProbeInput.value || '').trim().toLowerCase();
        if (!query) return;

        const trace = dict.traceBinarySearch(query);
        el.searchTraceLog.innerHTML = '';

        const header = document.createElement('div');
        header.style.marginBottom = '6px';
        header.innerHTML = `<strong>Binary Search Probe for: "${query.toUpperCase()}"</strong> (Dictionary Size: ${dict.count.toLocaleString()} words)`;
        el.searchTraceLog.appendChild(header);

        trace.probes.forEach((p, idx) => {
            const step = document.createElement('div');
            step.className = 'trace-step' + (p.comparison === 'MATCH' ? ' match' : '');
            step.innerHTML = `Step ${idx + 1}: low=${p.low}, high=${p.high} ➔ mid=${p.mid} ("${p.word.toUpperCase()}") [${p.comparison}]`;
            el.searchTraceLog.appendChild(step);
        });

        const summary = document.createElement('div');
        summary.style.marginTop = '8px';
        summary.style.fontWeight = 'bold';
        if (trace.found) {
            summary.style.color = 'var(--puzzle-green)';
            summary.textContent = `✔ Word FOUND in ${trace.probes.length} probes! (${Math.ceil(Math.log2(dict.count))} probes max for 45k words)`;
            window.sound.validMove();
        } else {
            summary.style.color = 'var(--puzzle-coral)';
            summary.textContent = `✖ Word NOT FOUND after ${trace.probes.length} probes.`;
            window.sound.invalidMove();
        }
        el.searchTraceLog.appendChild(summary);
    }

    /* ========================================================================
     * VIRTUAL KEYBOARD & LISTENERS
     * ======================================================================== */
    function setupVirtualKeyboard() {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
        ];

        el.virtualKeyboard.innerHTML = '';
        rows.forEach(rowKeys => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';

            rowKeys.forEach(k => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'key-btn';
                btn.textContent = k;
                btn.setAttribute('aria-label', k === 'ENTER'
                    ? 'Submit word'
                    : k === 'DEL'
                        ? 'Delete selected letter'
                        : `Enter letter ${k}`);

                if (k === 'ENTER') {
                    btn.classList.add('wide', 'enter-key');
                    btn.addEventListener('click', submitMove);
                } else if (k === 'DEL') {
                    btn.classList.add('wide');
                    btn.addEventListener('click', handleBackspace);
                } else {
                    btn.addEventListener('click', () => handleLetterInput(k));
                }

                rowDiv.appendChild(btn);
            });

            el.virtualKeyboard.appendChild(rowDiv);
        });
        renderTriedKeyboardKeys();
    }

    function setupEventListeners() {
        // Physical Keyboard Support
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (solverDrawerOpen) closeSolverDrawer();
                closeAllModals();
                return;
            }

            if (e.target instanceof HTMLElement &&
                (e.target.matches('input, textarea, select, [contenteditable="true"]') ||
                    (e.target.tagName === 'BUTTON' && !e.target.classList.contains('interactive-tile')))) {
                return;
            }

            if (document.querySelector('.modal-backdrop.open')) return;

            if (e.key === 'Enter') {
                e.preventDefault();
                submitMove();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                handleBackspace();
            } else if (e.key === 'ArrowLeft') {
                if (selectedTileIndex > 0) {
                    selectedTileIndex--;
                    renderInteractiveTiles();
                }
            } else if (e.key === 'ArrowRight') {
                if (selectedTileIndex < draftLetters.length - 1) {
                    selectedTileIndex++;
                    renderInteractiveTiles();
                }
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                if (e.shiftKey) handleRedo();
                else handleUndo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
                e.preventDefault();
                handleRedo();
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                handleLetterInput(e.key);
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key !== 'Tab') return;
            const openBackdrop = document.querySelector('.modal-backdrop.open');
            const focusScope = openBackdrop || (solverDrawerOpen ? el.autoSolverSection : null);
            if (!focusScope) return;
            const focusable = [...focusScope.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )].filter(element => element.getClientRects().length > 0);
            if (focusable.length === 0) {
                event.preventDefault();
                focusScope.querySelector('.modal-card')?.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || !openBackdrop.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !openBackdrop.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        });

        // Quick Action Buttons
        el.undoBtn.addEventListener('click', handleUndo);
        el.redoBtn.addEventListener('click', handleRedo);
        el.hintBtn.addEventListener('click', handleHint);
        el.solveBtn.addEventListener('click', handleSolveClick);
        if (el.quickGuideDismissBtn) el.quickGuideDismissBtn.addEventListener('click', dismissQuickGuide);
        if (el.giveUpBtn) el.giveUpBtn.addEventListener('click', handleGiveUp);
        if (el.solverToggleBtn) el.solverToggleBtn.addEventListener('click', toggleSolverDrawer);
        if (el.solverDrawerClose) el.solverDrawerClose.addEventListener('click', () => closeSolverDrawer());
        if (el.solverDrawerBackdrop) el.solverDrawerBackdrop.addEventListener('click', () => closeSolverDrawer());
        if (el.restartBtn) {
            el.restartBtn.addEventListener('click', () => {
                if (game) {
                    window.sound.validMove();
                    startNewGame(game.startWord, game.targetWord, activeDailyDate, false, activeCampaignIndex);
                    showStatus(`Puzzle reset: [${game.startWord.toUpperCase()}] ➔ [${game.targetWord.toUpperCase()}].`, 'info');
                }
            });
        }
        if (el.helpBtn) {
            el.helpBtn.addEventListener('click', () => {
                if (el.helpModal) openModal(el.helpModal);
            });
        }

        // Sound Toggle
        el.soundToggleBtn.addEventListener('click', () => {
            updateAccessibilityPreference('sound', !accessibilityPreferences.sound);
        });

        el.accessibilityBtn.addEventListener('click', () => openModal(el.accessibilityModal));
        el.accessibilityCloseBtn.addEventListener('click', closeAllModals);
        el.accessibilityDoneBtn.addEventListener('click', closeAllModals);
        el.soundPreferenceToggle.addEventListener('change', event =>
            updateAccessibilityPreference('sound', event.target.checked));
        el.motionPreferenceToggle.addEventListener('change', event =>
            updateAccessibilityPreference('reducedMotion', event.target.checked));
        el.contrastPreferenceToggle.addEventListener('change', event =>
            updateAccessibilityPreference('highContrast', event.target.checked));
        el.bfsExplorationList.addEventListener('click', handleBfsExplorationItem);
        el.bfsExplorationList.addEventListener('keydown', handleBfsExplorationItem);
        el.bfsExplorationMore.addEventListener('click', () => renderBfsExploration(true));
        if (el.bfsExplorationPrev) {
            el.bfsExplorationPrev.addEventListener('click', () => stepBfsExploration(bfsPlaybackIndex - 1));
        }
        if (el.bfsExplorationNext) {
            el.bfsExplorationNext.addEventListener('click', () => stepBfsExploration(bfsPlaybackIndex + 1));
        }
        if (el.bfsExplorationPlay) {
            el.bfsExplorationPlay.addEventListener('click', toggleBfsExplorationPlayback);
        }
        if (el.playbackSpeedSelect) {
            el.playbackSpeedSelect.addEventListener('change', () => {
                const replayWasPlaying = Boolean(replayInterval);
                const bfsWasPlaying = Boolean(bfsPlaybackInterval);
                if (replayWasPlaying) {
                    clearInterval(replayInterval);
                    replayInterval = null;
                    isReplaying = false;
                    toggleReplayAutoPlay();
                }
                if (bfsWasPlaying) {
                    stopBfsPlayback();
                    toggleBfsExplorationPlayback();
                }
            });
        }

        // Light Mode Only - Dark mode completely removed
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-theme', 'light');
        try { localStorage.removeItem('wordbridge_theme'); } catch (e) {}

        // Give Up Confirmation Modal listeners
        if (el.cancelGiveUpBtn) {
            el.cancelGiveUpBtn.addEventListener('click', () => {
                if (el.giveUpModal) closeModal(el.giveUpModal);
            });
        }
        if (el.confirmGiveUpBtn) {
            el.confirmGiveUpBtn.addEventListener('click', confirmGiveUp);
        }

        // Solver Next Level button
        if (el.solverNextLevelBtn) {
            el.solverNextLevelBtn.addEventListener('click', () => {
                window.sound.validMove();
                closeSolverDrawer();
                if (el.winModal) closeModal(el.winModal);
                if (activeCampaignIndex !== null) {
                    const nextLevel = activeCampaignIndex + 2;
                    if (nextLevel <= PRESETS.length) {
                        startCampaignLevel(nextLevel);
                    } else {
                        openLevels();
                    }
                } else {
                    rollRandomChallenge();
                }
            });
        }

        // Custom Nav button & Preset chips
        if (el.customNavBtn) {
            el.customNavBtn.addEventListener('click', () => {
                setActiveNavButton('custom-nav-btn');
                openCustomPuzzleModal();
            });
        }

        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const start = chip.getAttribute('data-start');
                const target = chip.getAttribute('data-target');
                if (start && target) {
                    window.sound.keyPress();
                    if (el.customStartInput) el.customStartInput.value = start;
                    if (el.customTargetInput) el.customTargetInput.value = target;
                    if (el.customErrorMsg) el.customErrorMsg.textContent = '';
                    if (el.startCustomBtn) el.startCustomBtn.focus();
                }
            });
        });

        // Auto-Solver & Replayer Controls
        if (el.panelSolveBtn) {
            el.panelSolveBtn.addEventListener('click', () => {
                launchAutoSolver(true, game?.startWord);
            });
        }

        if (el.applyToBoardBtn) {
            el.applyToBoardBtn.addEventListener('click', () => {
                if (!replayer) launchAutoSolver();
                toggleReplayAutoPlay();
            });
        }


        if (el.replayFirstBtn) {
            el.replayFirstBtn.addEventListener('click', () => {
                if (replayer && replayer.hasPrev()) {
                    window.sound.keyPress();
                    replayer.first();
                    updateReplayStep();
                }
            });
        }

        if (el.replayPrevBtn) {
            el.replayPrevBtn.addEventListener('click', () => {
                if (replayer && replayer.hasPrev()) {
                    window.sound.keyPress();
                    replayer.prev();
                    updateReplayStep();
                }
            });
        }

        if (el.replayNextBtn) {
            el.replayNextBtn.addEventListener('click', () => {
                if (replayer && replayer.hasNext()) {
                    window.sound.keyPress();
                    replayer.next();
                    updateReplayStep();
                }
            });
        }

        if (el.replayLastBtn) {
            el.replayLastBtn.addEventListener('click', () => {
                if (replayer) {
                    window.sound.keyPress();
                    replayer.last();
                    updateReplayStep();
                }
            });
        }

        if (el.replayPlayBtn) {
            el.replayPlayBtn.addEventListener('click', toggleReplayAutoPlay);
        }

        // Binary Search Demo (if elements present)
        if (el.searchProbeBtn) {
            el.searchProbeBtn.addEventListener('click', runBinarySearchTrace);
        }
        if (el.searchProbeInput) {
            el.searchProbeInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') runBinarySearchTrace();
            });
        }

        // Challenge Nav Button
        const challengesNavBtn = document.getElementById('challenges-nav-btn');
        if (challengesNavBtn) {
            challengesNavBtn.addEventListener('click', () => {
                setActiveNavButton('challenges-nav-btn');
                openModal(el.challengeModal);
            });
        }

        const dailyNavBtn = document.getElementById('daily-nav-btn');
        if (dailyNavBtn) {
            dailyNavBtn.addEventListener('click', startDailyChallenge);
        }

        document.getElementById('levels-nav-btn').addEventListener('click', openLevels);
        document.getElementById('levels-close-btn').addEventListener('click', closeAllModals);
        el.continueLevelBtn.addEventListener('click', () => startCampaignLevel(campaignProgress.unlockedLevel));

        const statsNavBtn = document.getElementById('stats-nav-btn');
        if (statsNavBtn) {
            statsNavBtn.addEventListener('click', () => {
                setActiveNavButton('stats-nav-btn');
                renderPersonalStats();
                renderAchievements();
                openModal(el.statsModal);
            });
        }
        document.getElementById('stats-close-btn').addEventListener('click', closeAllModals);
        document.getElementById('stats-done-btn').addEventListener('click', closeAllModals);
        el.resetStatsBtn.addEventListener('click', resetPersonalStats);
        if (el.saveStatsBtn) {
            el.saveStatsBtn.addEventListener('click', exportStats);
        }
        if (el.loadStatsBtn) {
            el.loadStatsBtn.addEventListener('click', () => {
                if (el.importStatsFile) el.importStatsFile.click();
            });
        }
        if (el.importStatsFile) {
            el.importStatsFile.addEventListener('change', event => {
                const file = event.target.files && event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = e => {
                    importStatsData(e.target.result);
                    event.target.value = '';
                };
                reader.readAsText(file);
            });
        }

        // Play Nav Button
        document.getElementById('play-nav-btn').addEventListener('click', () => {
            closeAllModals();
        });

        // Custom Puzzle Form
        el.startCustomBtn.addEventListener('click', handleCustomStart);

        // Modal Close Buttons
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });

        // Click outside modal backdrop to dismiss
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeAllModals();
            });
        });

        // Next Level Button on Win Modal
        el.winShareBtn.addEventListener('click', shareVictory);
        document.getElementById('win-next-btn').addEventListener('click', () => {
            closeModal(el.winModal);
            closeSolverDrawer();
            if (activeCampaignIndex !== null) {
                const nextLevel = activeCampaignIndex + 2;
                if (nextLevel <= PRESETS.length) {
                    startCampaignLevel(nextLevel);
                } else {
                    openLevels();
                }
                return;
            }
            rollRandomChallenge();
        });

        // Random Puzzle Buttons
        const randomNavBtn = document.getElementById('random-nav-btn');
        if (randomNavBtn) randomNavBtn.addEventListener('click', rollRandomChallenge);

        const modalRandomBtn = document.getElementById('modal-random-btn');
        if (modalRandomBtn) modalRandomBtn.addEventListener('click', rollRandomChallenge);

        // Challenge Filter Tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                window.sound.keyPress();
                renderPresetChallenges(tab.getAttribute('data-len'));
            });
        });

        // DSA Inspector Tab Switching
        document.querySelectorAll('.dsa-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPane = btn.getAttribute('data-target');
                switchDSAPane(targetPane);
            });
        });
    }

    function rollRandomChallenge() {
        const p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
        window.sound.validMove();
        activeGameNavButtonId = 'random-nav-btn';
        startNewGame(p.start, p.target);
        showStatus(`Random Challenge: [${p.start.toUpperCase()}] ➔ [${p.target.toUpperCase()}] (${p.diff})`, 'success');
    }

    function loadCampaignProgress() {
        try {
            const saved = localStorage.getItem(CAMPAIGN_PROGRESS_KEY);
            if (!saved) return;

            const parsed = JSON.parse(saved);
            if (
                !parsed ||
                !Number.isInteger(parsed.unlockedLevel) ||
                parsed.unlockedLevel < 1 ||
                parsed.unlockedLevel > PRESETS.length ||
                !Array.isArray(parsed.completedLevels) ||
                parsed.completedLevels.some(level =>
                    !Number.isInteger(level) ||
                    level < 1 ||
                    level > parsed.unlockedLevel
                )
            ) {
                throw new Error('Saved campaign progress has an invalid format.');
            }

            const completedLevels = [...new Set(parsed.completedLevels)].sort((a, b) => a - b);
            if (
                completedLevels.some((level, index) => level !== index + 1) ||
                parsed.unlockedLevel !== Math.min(completedLevels.length + 1, PRESETS.length)
            ) {
                throw new Error('Saved campaign levels are not a continuous progression.');
            }
            campaignProgress = { unlockedLevel: parsed.unlockedLevel, completedLevels };
        } catch (error) {
            campaignProgressAvailable = false;
            console.error('Could not load WordBridge campaign progress:', error);
        }
    }

    function saveCampaignProgress() {
        try {
            localStorage.setItem(CAMPAIGN_PROGRESS_KEY, JSON.stringify(campaignProgress));
            campaignProgressAvailable = true;
            return true;
        } catch (error) {
            campaignProgressAvailable = false;
            console.error('Could not save WordBridge campaign progress:', error);
            showStatus('Campaign level unlocked, but progress could not be saved in this browser.', 'error');
            return false;
        }
    }

    function renderLevels() {
        if (!el.levelList) return;
        el.levelList.innerHTML = '';

        const completed = new Set(campaignProgress.completedLevels);
        const groups = [
            { length: 3, label: 'Easy · 3 letters', className: 'diff-easy' },
            { length: 4, label: 'Medium · 4 letters', className: 'diff-medium' },
            { length: 5, label: 'Hard · 5 letters', className: 'diff-hard' },
            { length: 6, label: 'Expert · 6 letters', className: 'diff-expert' }
        ];

        groups.forEach(group => {
            const levels = PRESETS.map((puzzle, index) => ({ puzzle, level: index + 1 }))
                .filter(item => item.puzzle.len === group.length);
            const heading = document.createElement('h3');
            heading.className = `level-group-heading ${group.className}`;
            heading.textContent = group.label;
            el.levelList.appendChild(heading);

            const grid = document.createElement('div');
            grid.className = 'level-card-grid';
            levels.forEach(({ puzzle, level }) => {
                const isLocked = level > campaignProgress.unlockedLevel;
                const isCompleted = completed.has(level);
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'level-card';
                if (isLocked) button.classList.add('locked');
                if (isCompleted) button.classList.add('completed');
                if (level === campaignProgress.unlockedLevel) button.classList.add('current');
                button.disabled = isLocked;
                button.setAttribute('aria-label',
                    `Level ${level}: ${puzzle.start} to ${puzzle.target}, ${isLocked ? 'locked' : isCompleted ? 'completed' : 'unlocked'}`);

                const status = isLocked ? '🔒 Locked' : isCompleted ? '✓ Complete' : '▶ Play';
                button.innerHTML = `
                    <span class="level-card-top">
                        <span class="level-number">LEVEL ${level}</span>
                        <span class="level-status">${status}</span>
                    </span>
                    <span class="level-word-pair">${puzzle.start.toUpperCase()} <span>→</span> ${puzzle.target.toUpperCase()}</span>
                    <span class="level-meta">${puzzle.moves} optimal moves</span>
                `;
                if (!isLocked) {
                    button.addEventListener('click', () => startCampaignLevel(level));
                }
                grid.appendChild(button);
            });
            el.levelList.appendChild(grid);
        });

        const completedCount = campaignProgress.completedLevels.length;
        el.levelsProgressLabel.textContent = `Level ${campaignProgress.unlockedLevel} of ${PRESETS.length} unlocked`;
        el.levelsCompletedLabel.textContent = `${completedCount} completed`;
        el.levelsProgressFill.style.width = `${(completedCount / PRESETS.length) * 100}%`;
        el.levelsStorageNote.textContent = campaignProgressAvailable
            ? 'Campaign progress is saved in this browser.'
            : 'Browser storage is unavailable. Progress will last for this session only.';
        el.continueLevelBtn.textContent = `Continue Level ${campaignProgress.unlockedLevel} ▶`;
        renderProgressDashboard();
    }

    function openLevels() {
        renderLevels();
        setActiveNavButton('levels-nav-btn');
        openModal(el.levelsModal);
    }

    function startCampaignLevel(level, countAttempt = true) {
        if (!Number.isInteger(level) || level < 1 || level > campaignProgress.unlockedLevel) {
            showStatus('That level is locked. Complete the current level to unlock it.', 'warning');
            return;
        }
        const index = level - 1;
        const puzzle = PRESETS[index];
        activeGameNavButtonId = 'play-nav-btn';
        if (startNewGame(puzzle.start, puzzle.target, null, countAttempt, index)) {
            showStatus(`Campaign · Level ${level} of ${PRESETS.length}: ${puzzle.start.toUpperCase()} → ${puzzle.target.toUpperCase()}.`, 'success');
        }
    }

    function completeCampaignLevel(index) {
        const level = index + 1;
        if (campaignProgress.completedLevels.includes(level)) return;

        campaignProgress.completedLevels.push(level);
        campaignProgress.completedLevels.sort((a, b) => a - b);
        campaignProgress.unlockedLevel = Math.max(
            campaignProgress.unlockedLevel,
            Math.min(level + 1, PRESETS.length)
        );
        saveCampaignProgress();
        renderLevels();
    }

    function loadPersonalStats() {
        try {
            const saved = localStorage.getItem(PERSONAL_STATS_KEY);
            if (!saved) {
                personalStatsAvailable = true;
                return;
            }

            const parsed = JSON.parse(saved);
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Saved personal stats have an invalid format.');
            }
            const attempts = Math.max(0, parseInt(parsed.attempts, 10) || 0);
            const completed = Math.max(0, parseInt(parsed.completed, 10) || 0);
            personalStats = {
                attempts: Math.max(attempts, completed),
                completed: completed,
                totalMoves: Math.max(0, parseInt(parsed.totalMoves, 10) || 0),
                bestTimeSeconds: (parsed.bestTimeSeconds !== null && Number.isFinite(Number(parsed.bestTimeSeconds)) && Number(parsed.bestTimeSeconds) >= 0)
                    ? Number(parsed.bestTimeSeconds)
                    : null
            };
            personalStatsAvailable = true;
        } catch (error) {
            console.warn('Recovering personal stats after parse error:', error);
            personalStats = { ...EMPTY_PERSONAL_STATS };
            personalStatsAvailable = true;
            savePersonalStats();
        }
    }

    function savePersonalStats() {
        try {
            localStorage.setItem(PERSONAL_STATS_KEY, JSON.stringify(personalStats));
            personalStatsAvailable = true;
            return true;
        } catch (error) {
            personalStatsAvailable = true;
            console.error('Could not save WordBridge personal stats to localStorage:', error);
            return false;
        }
    }

    function exportStats() {
        const exportData = {
            version: 1,
            appName: 'WordBridge',
            exportedAt: new Date().toISOString(),
            personalStats,
            campaignProgress,
            dailyProgress,
            unlockedAchievements
        };
        const jsonStr = JSON.stringify(exportData, null, 2);

        // 1. Download as JSON file
        try {
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wordbridge-stats-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.warn('File download fallback:', e);
        }

        // 2. Also copy to clipboard if supported
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonStr).catch(() => {});
        }

        showStatus('Stats backup downloaded and copied to clipboard!', 'success');
    }

    function importStatsData(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            if (!data || typeof data !== 'object') throw new Error('Invalid JSON format');

            const p = data.personalStats || data;
            const attempts = Math.max(0, parseInt(p.attempts, 10) || 0);
            const completed = Math.max(0, parseInt(p.completed, 10) || 0);
            personalStats = {
                attempts: Math.max(attempts, completed),
                completed: completed,
                totalMoves: Math.max(0, parseInt(p.totalMoves, 10) || 0),
                bestTimeSeconds: (p.bestTimeSeconds !== null && Number.isFinite(Number(p.bestTimeSeconds)) && Number(p.bestTimeSeconds) >= 0)
                    ? Number(p.bestTimeSeconds)
                    : null
            };
            savePersonalStats();
            renderPersonalStats();

            if (data.campaignProgress && Number.isInteger(data.campaignProgress.unlockedLevel)) {
                campaignProgress.unlockedLevel = Math.max(1, Math.min(PRESETS.length, data.campaignProgress.unlockedLevel));
                campaignProgress.completedLevels = Array.isArray(data.campaignProgress.completedLevels)
                    ? data.campaignProgress.completedLevels
                    : [];
                saveCampaignProgress();
                renderLevels();
            }

            if (Array.isArray(data.unlockedAchievements)) {
                unlockedAchievements = data.unlockedAchievements.filter(id => ACHIEVEMENTS.some(a => a.id === id));
                saveAchievements();
                renderAchievements();
            }

            showStatus('Stats & progress successfully restored!', 'success');
            return true;
        } catch (err) {
            console.error('Import stats error:', err);
            showStatus('Could not import stats: invalid format.', 'error');
            return false;
        }
    }

    function recordPuzzleAttempt() {
        personalStats.attempts++;
        savePersonalStats();
        renderPersonalStats();
        return true;
    }

    function recordPuzzleCompletion(moves, timeSeconds) {
        if (isAssistedRun) return;
        if (personalStats.attempts < personalStats.completed + 1) {
            personalStats.attempts = personalStats.completed + 1;
        }
        personalStats.completed++;
        personalStats.totalMoves += moves;
        personalStats.bestTimeSeconds = personalStats.bestTimeSeconds === null
            ? timeSeconds
            : Math.min(personalStats.bestTimeSeconds, timeSeconds);
        savePersonalStats();
        renderPersonalStats();
    }

    function renderPersonalStats() {
        if (!el.statsCompleted) return;
        el.statsCompleted.textContent = personalStats.completed.toLocaleString();
        el.statsBestTime.textContent = personalStats.bestTimeSeconds === null
            ? '—'
            : `${personalStats.bestTimeSeconds}s`;
        el.statsAverageMoves.textContent = personalStats.completed === 0
            ? '—'
            : (personalStats.totalMoves / personalStats.completed).toFixed(1);
        el.statsWinRate.textContent = personalStats.attempts === 0
            ? '—'
            : `${Math.round((personalStats.completed / personalStats.attempts) * 100)}%`;
        el.statsStorageNote.textContent = personalStatsAvailable
            ? 'Stats are saved only in this browser.'
            : 'Stats are unavailable because this browser could not read or save the saved data.';
        el.resetStatsBtn.disabled = personalStatsAvailable &&
            personalStats.attempts === 0 &&
            personalStats.completed === 0;
        renderProgressDashboard();
    }

    function resetPersonalStats() {
        if (!window.confirm('Reset all personal puzzle stats? This cannot be undone.')) return;
        try {
            localStorage.removeItem(PERSONAL_STATS_KEY);
            personalStats = { ...EMPTY_PERSONAL_STATS };
            personalStatsAvailable = true;
            renderPersonalStats();
        } catch (error) {
            personalStatsAvailable = false;
            console.error('Could not reset WordBridge personal stats:', error);
            renderPersonalStats();
        }
    }

    function loadAchievements() {
        try {
            const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
            if (!saved) return;

            const parsed = JSON.parse(saved);
            const knownIds = new Set(ACHIEVEMENTS.map(achievement => achievement.id));
            if (!Array.isArray(parsed) || parsed.some(id => typeof id !== 'string' || !knownIds.has(id))) {
                throw new Error('Saved achievements have an invalid format.');
            }
            unlockedAchievements = [...new Set(parsed)];
        } catch (error) {
            achievementsAvailable = false;
            console.error('Could not load WordBridge achievements:', error);
        }
    }

    function saveAchievements() {
        try {
            localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
            achievementsAvailable = true;
            return true;
        } catch (error) {
            achievementsAvailable = false;
            console.error('Could not save WordBridge achievements:', error);
            renderAchievements();
            return false;
        }
    }

    function updateAchievements(dailyStreak) {
        const conditions = {
            'first-win': true,
            'perfect-bridge': game.optimalMoves > 0 && game.movesCount === game.optimalMoves,
            'daily-streak-five': Math.max(dailyStreak || 0, dailyProgress.bestStreak) >= 5,
            'campaign-five': campaignProgress.completedLevels.length >= 5,
            'campaign-complete': campaignProgress.completedLevels.length === PRESETS.length
        };
        const unlocked = new Set(unlockedAchievements);
        const newlyUnlocked = ACHIEVEMENTS.filter(achievement =>
            conditions[achievement.id] && !unlocked.has(achievement.id)
        );

        if (newlyUnlocked.length > 0) {
            unlockedAchievements.push(...newlyUnlocked.map(achievement => achievement.id));
            if (achievementsAvailable) saveAchievements();
        }
        renderAchievements();
        return newlyUnlocked;
    }

    function renderAchievements() {
        if (!el.achievementsGrid) return;
        const unlocked = new Set(unlockedAchievements);
        el.achievementsGrid.innerHTML = '';
        ACHIEVEMENTS.forEach(achievement => {
            const isUnlocked = unlocked.has(achievement.id);
            const card = document.createElement('article');
            card.className = `achievement-card${isUnlocked ? ' unlocked' : ''}`;
            const icon = document.createElement('span');
            icon.className = 'achievement-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = isUnlocked ? achievement.icon : '🔒';
            const copy = document.createElement('span');
            copy.className = 'achievement-copy';
            const title = document.createElement('strong');
            title.textContent = achievement.title;
            const description = document.createElement('small');
            description.textContent = achievement.description;
            copy.append(title, description);
            card.append(icon, copy);
            card.setAttribute('aria-label', `${achievement.title}, ${isUnlocked ? 'unlocked' : 'locked'}. ${achievement.description}`);
            el.achievementsGrid.appendChild(card);
        });
        el.achievementsProgress.textContent = `${unlockedAchievements.length} of ${ACHIEVEMENTS.length} unlocked`;
        el.achievementsStorageNote.textContent = achievementsAvailable
            ? 'Achievement progress is saved independently from Stats in this browser.'
            : 'Achievement storage is unavailable; new unlocks may not persist.';
        renderProgressDashboard();
    }

    function renderProgressDashboard() {
        if (!el.dashboardLevelProgress) return;
        const completedLevels = campaignProgress.completedLevels.length;
        const completionPercent = Math.round((completedLevels / PRESETS.length) * 100);
        const currentLevel = activeCampaignIndex === null
            ? campaignProgress.unlockedLevel
            : activeCampaignIndex + 1;
        const currentPuzzle = activeCampaignIndex === null
            ? null
            : PRESETS[activeCampaignIndex];

        el.railLevelNumber.textContent = String(currentLevel).padStart(2, '0');
        el.railLevelLabel.textContent = `LEVEL ${currentLevel}`;
        el.railWordPair.replaceChildren();
        if (currentPuzzle) {
            el.railWordPair.append(
                document.createTextNode(currentPuzzle.start.toUpperCase()),
                Object.assign(document.createElement('span'), { textContent: '→' }),
                document.createTextNode(currentPuzzle.target.toUpperCase())
            );
        } else {
            el.railWordPair.textContent = game
                ? `${game.startWord.toUpperCase()} → ${game.targetWord.toUpperCase()}`
                : 'Choose a puzzle';
            el.railLevelLabel.textContent = 'FREE PLAY';
        }
        el.railProgressFill.style.width = `${completionPercent}%`;
        el.railProgressTrack.setAttribute('aria-valuenow', String(completionPercent));
        el.railProgressLabel.textContent = `${completedLevels} of ${PRESETS.length} levels complete`;
        el.dashboardLevelProgress.textContent = `${completedLevels} / ${PRESETS.length}`;
        el.dashboardProgressFill.style.width = `${completionPercent}%`;
        el.dashboardProgressTrack.setAttribute('aria-valuenow', String(completionPercent));

        el.railStreakValue.textContent = dailyProgressAvailable
            ? `${dailyProgress.currentStreak} ${dailyProgress.currentStreak === 1 ? 'day' : 'days'}`
            : '—';

        const recentLevels = campaignProgress.completedLevels.slice(-3).reverse();
        el.dashboardRecentGoals.replaceChildren();
        if (recentLevels.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'sidebar-empty-state';
            empty.textContent = 'Complete a campaign level to see it here.';
            el.dashboardRecentGoals.appendChild(empty);
        } else {
            recentLevels.forEach(level => {
                const puzzle = PRESETS[level - 1];
                const item = document.createElement('li');
                const levelTag = document.createElement('span');
                levelTag.className = 'recent-goal-level';
                levelTag.textContent = `L${String(level).padStart(2, '0')}`;
                const pair = document.createElement('span');
                pair.className = 'recent-goal-pair';
                pair.textContent = `${puzzle.start.toUpperCase()} → ${puzzle.target.toUpperCase()}`;
                item.append(levelTag, pair);
                el.dashboardRecentGoals.appendChild(item);
            });
        }

        el.dashboardAchievementCount.textContent = `${unlockedAchievements.length} / ${ACHIEVEMENTS.length}`;
        el.dashboardAchievementList.replaceChildren();
        ACHIEVEMENTS.filter(achievement => unlockedAchievements.includes(achievement.id))
            .slice(-3)
            .reverse()
            .forEach(achievement => {
                const item = document.createElement('span');
                item.className = 'achievement-mini-badge';
                item.title = achievement.title;
                item.setAttribute('aria-label', achievement.title);
                item.textContent = achievement.icon;
                el.dashboardAchievementList.appendChild(item);
            });
        if (unlockedAchievements.length === 0) {
            const empty = document.createElement('span');
            empty.className = 'sidebar-empty-state';
            empty.textContent = 'Your first bridge unlocks an achievement.';
            el.dashboardAchievementList.appendChild(empty);
        }

        el.dashboardCompletedStat.textContent = personalStatsAvailable
            ? personalStats.completed.toLocaleString()
            : '—';
        el.dashboardWinRateStat.textContent = !personalStatsAvailable || personalStats.attempts === 0
            ? '—'
            : `${Math.round((personalStats.completed / personalStats.attempts) * 100)}%`;
        el.dashboardBestTimeStat.textContent = !personalStatsAvailable || personalStats.bestTimeSeconds === null
            ? '—'
            : `${personalStats.bestTimeSeconds}s`;
        el.dashboardStorageNote.textContent = personalStatsAvailable
            ? 'Stats are saved in this browser.'
            : 'Stats could not be read from this browser.';
    }

    function loadAccessibilityPreferences() {
        try {
            const saved = localStorage.getItem(ACCESSIBILITY_PREFERENCES_KEY);
            if (!saved) return;
            const parsed = JSON.parse(saved);
            if (
                !parsed ||
                typeof parsed.sound !== 'boolean' ||
                typeof parsed.reducedMotion !== 'boolean' ||
                typeof parsed.highContrast !== 'boolean'
            ) {
                throw new Error('Saved accessibility preferences have an invalid format.');
            }
            accessibilityPreferences = parsed;
        } catch (error) {
            accessibilityPreferencesAvailable = false;
            console.error('Could not load WordBridge accessibility preferences:', error);
        }
    }

    function applyAccessibilityPreferences() {
        window.sound.enabled = accessibilityPreferences.sound;
        document.body.dataset.reducedMotion = String(accessibilityPreferences.reducedMotion);
        document.body.dataset.highContrast = String(accessibilityPreferences.highContrast);
        el.soundPreferenceToggle.checked = accessibilityPreferences.sound;
        el.motionPreferenceToggle.checked = accessibilityPreferences.reducedMotion;
        el.contrastPreferenceToggle.checked = accessibilityPreferences.highContrast;
        el.soundToggleBtn.textContent = accessibilityPreferences.sound ? '🔊' : '🔇';
        el.soundToggleBtn.title = accessibilityPreferences.sound ? 'Mute Sounds' : 'Unmute Sounds';
        el.soundToggleBtn.setAttribute('aria-label', el.soundToggleBtn.title);
        el.accessibilityStorageNote.textContent = accessibilityPreferencesAvailable
            ? 'Preferences are saved in this browser.'
            : 'Preferences could not be loaded or saved; changes apply only for this session.';
    }

    function saveAccessibilityPreferences() {
        try {
            localStorage.setItem(ACCESSIBILITY_PREFERENCES_KEY, JSON.stringify(accessibilityPreferences));
            accessibilityPreferencesAvailable = true;
        } catch (error) {
            accessibilityPreferencesAvailable = false;
            console.error('Could not save WordBridge accessibility preferences:', error);
        }
        applyAccessibilityPreferences();
    }

    function updateAccessibilityPreference(preference, value) {
        accessibilityPreferences[preference] = value;
        saveAccessibilityPreferences();
    }

    function getLocalDateKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getDailyChallenge(dateKey) {
        let hash = 0;
        for (let i = 0; i < dateKey.length; i++) {
            hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
        }
        return PRESETS[hash % PRESETS.length];
    }

    function loadDailyProgress() {
        try {
            const saved = localStorage.getItem(DAILY_PROGRESS_KEY);
            if (!saved) return;

            const parsed = JSON.parse(saved);
            if (
                !parsed ||
                typeof parsed.lastCompletedDate !== 'string' ||
                !Number.isInteger(parsed.currentStreak) ||
                parsed.currentStreak < 0 ||
                !Number.isInteger(parsed.bestStreak) ||
                parsed.bestStreak < 0
            ) {
                throw new Error('Saved daily challenge progress has an invalid format.');
            }
            dailyProgress = parsed;
        } catch (error) {
            dailyProgressAvailable = false;
            console.error('Could not load WordBridge daily challenge progress:', error);
            showStatus('Daily streak could not be loaded. Daily puzzles still work, but progress may not be saved.', 'warning');
        }
    }

    function saveDailyProgress() {
        try {
            localStorage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(dailyProgress));
            dailyProgressAvailable = true;
            return true;
        } catch (error) {
            dailyProgressAvailable = false;
            console.error('Could not save WordBridge daily challenge progress:', error);
            showStatus('Daily puzzle completed, but your streak could not be saved in this browser.', 'error');
            return false;
        }
    }

    function updateDailyButton() {
        const button = document.getElementById('daily-nav-btn');
        if (!button) return;

        const today = getLocalDateKey();
        const completedToday = dailyProgress.lastCompletedDate === today;
        const activeStreak = getActiveDailyStreak(today);
        button.textContent = completedToday ? 'Daily ✓' : 'Daily';
        button.title = `${completedToday ? 'Today completed' : "Today's puzzle"} · ${activeStreak}-day streak · Best ${dailyProgress.bestStreak}`;
    }

    function getActiveDailyStreak(dateKey) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return dailyProgress.lastCompletedDate === dateKey ||
            dailyProgress.lastCompletedDate === getLocalDateKey(yesterday)
            ? dailyProgress.currentStreak
            : 0;
    }

    function startDailyChallenge() {
        const dateKey = getLocalDateKey();
        const puzzle = getDailyChallenge(dateKey);
        activeGameNavButtonId = 'daily-nav-btn';
        if (startNewGame(puzzle.start, puzzle.target, dateKey)) {
            window.sound.validMove();
            const completedToday = dailyProgress.lastCompletedDate === dateKey;
            const activeStreak = getActiveDailyStreak(dateKey);
            const streakMessage = dailyProgressAvailable
                ? ` Current streak: ${activeStreak} day${activeStreak === 1 ? '' : 's'}.`
                : ' Streak progress is unavailable in this browser.';
            showStatus(
                `Daily challenge (${dateKey}): ${puzzle.start.toUpperCase()} → ${puzzle.target.toUpperCase()}.${completedToday ? ' You have already completed today’s puzzle.' : streakMessage}`,
                completedToday ? 'info' : 'success'
            );
        }
    }

    function completeDailyChallenge(dateKey) {
        if (isAssistedRun) return null;
        if (!dailyProgressAvailable || dailyProgress.lastCompletedDate === dateKey) {
            updateDailyButton();
            return dailyProgressAvailable ? dailyProgress.currentStreak : null;
        }

        const previousProgress = { ...dailyProgress };
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = getLocalDateKey(yesterday);
        dailyProgress.currentStreak = dailyProgress.lastCompletedDate === yesterdayKey
            ? dailyProgress.currentStreak + 1
            : 1;
        dailyProgress.lastCompletedDate = dateKey;
        dailyProgress.bestStreak = Math.max(dailyProgress.bestStreak, dailyProgress.currentStreak);
        if (!saveDailyProgress()) {
            dailyProgress = previousProgress;
            updateDailyButton();
            return null;
        }

        updateDailyButton();
        return dailyProgress.currentStreak;
    }

    function switchDSAPane(paneId) {
        document.querySelectorAll('.dsa-tab-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-target') === paneId);
        });
        document.querySelectorAll('.dsa-view-pane').forEach(p => {
            p.classList.toggle('active', p.id === paneId);
        });
    }

    let currentFilterLen = 'all';

    function renderPresetChallenges(filterLen = 'all') {
        currentFilterLen = filterLen;
        el.challengeGrid.innerHTML = '';
        const filtered = filterLen === 'all' 
            ? PRESETS 
            : PRESETS.filter(p => p.len === parseInt(filterLen, 10));

        filtered.forEach(p => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'challenge-card';
            card.setAttribute('aria-label', `${p.diff}, ${p.start.toUpperCase()} to ${p.target.toUpperCase()}, ${p.moves} moves`);
            card.innerHTML = `
                <div class="challenge-card-header">
                    <span class="challenge-diff ${p.diffClass}">${p.diff}</span>
                    <span class="challenge-moves-badge">${p.moves} moves</span>
                </div>
                <div class="challenge-pair">${p.start.toUpperCase()} ──▶ ${p.target.toUpperCase()}</div>
            `;
            card.addEventListener('click', () => {
                window.sound.validMove();
                activeGameNavButtonId = 'challenges-nav-btn';
                startNewGame(p.start, p.target);
            });
            el.challengeGrid.appendChild(card);
        });
    }

    function openCustomPuzzleModal() {
        openModal(el.challengeModal);
        const customBox = document.querySelector('.custom-puzzle-box');
        if (customBox) {
            customBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            customBox.classList.add('custom-highlight');
            setTimeout(() => customBox.classList.remove('custom-highlight'), 1600);
        }
        if (el.customStartInput) {
            setTimeout(() => el.customStartInput.focus(), 150);
        }
    }

    function handleCustomStart() {
        const start = (el.customStartInput.value || '').trim().toLowerCase();
        const target = (el.customTargetInput.value || '').trim().toLowerCase();

        if (!start || !target) {
            el.customErrorMsg.textContent = 'Please enter both words.';
            return;
        }

        if (start.length !== target.length) {
            el.customErrorMsg.textContent = 'Word lengths must be identical.';
            return;
        }

        if (!dict.contains(start)) {
            el.customErrorMsg.textContent = `'${start.toUpperCase()}' is not in the dictionary.`;
            return;
        }

        if (!dict.contains(target)) {
            el.customErrorMsg.textContent = `'${target.toUpperCase()}' is not in the dictionary.`;
            return;
        }

        activeGameNavButtonId = 'play-nav-btn';
        const res = startNewGame(start, target);
        if (res) {
            el.customErrorMsg.textContent = '';
            el.customStartInput.value = '';
            el.customTargetInput.value = '';
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
        setActiveNavButton(activeGameNavButtonId);
        if (lastModalTrigger && lastModalTrigger.isConnected &&
            !lastModalTrigger.closest('.modal-backdrop.open')) {
            lastModalTrigger.focus();
        }
        lastModalTrigger = null;
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('open');
        setActiveNavButton(activeGameNavButtonId);
        if (lastModalTrigger && lastModalTrigger.isConnected &&
            !lastModalTrigger.closest('.modal-backdrop.open')) {
            lastModalTrigger.focus();
        }
        lastModalTrigger = null;
    }

    function openModal(modal) {
        if (!modal) return;
        const hasOpenModal = document.querySelector('.modal-backdrop.open');
        if (!hasOpenModal) {
            lastModalTrigger = document.activeElement;
            if (lastModalTrigger?.closest('.modal-backdrop')) lastModalTrigger = null;
        }
        modal.classList.add('open');
        const firstFocusable = modal.querySelector(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
            firstFocusable.focus();
        } else {
            const card = modal.querySelector('.modal-card');
            if (card) {
                card.setAttribute('tabindex', '-1');
                card.focus();
            }
        }
    }

    function setActiveNavButton(buttonId) {
        document.querySelectorAll('.nav-tab-btn').forEach(button => {
            button.classList.toggle('active', button.id === buttonId);
        });
    }

    /* ========================================================================
     * CONFETTI CELEBRATION EFFECT
     * ======================================================================== */
    function launchConfetti() {
        if (accessibilityPreferences.reducedMotion ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const colors = ['#D9B66F', '#F0D8A2', '#79D6A3', '#F5F0E5'];

        for (let i = 0; i < 88; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 5 + 3,
                speedX: (Math.random() - 0.5) * 4,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8
            });
        }

        let animationFrame;
        const startTime = Date.now();

        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });

            if (Date.now() - startTime < 4000) {
                animationFrame = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                cancelAnimationFrame(animationFrame);
            }
        }
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
