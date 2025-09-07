// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * Simple single-player Wordle backend
 *
 * What this does:
 * - Single player games (one address per game)
 * - Player submits guesses; if hash matches → win
 */

contract SimpleWordle {
    // --- Roles ---
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    // --- Game constants ---
    uint8 public constant WORD_LEN = 5;
    uint8 public constant MAX_GUESSES = 6;

    // --- Storage ---
    uint256 public nextGameId = 1;
    uint256 public nextMatchId = 1;

    struct Game {
        address player;
        bytes32 wordHash; // keccak256(bytes(lowercaseWord))
        uint8 guesses;
        uint40 startTime;
        uint32 duration; // seconds
        bool resolved;
        bool won;
        uint256 stake; // stake amount for singleplayer
    }

    struct Match {
        address player1;
        address player2;
        bytes32 wordHash; // Same word for both players
        uint8 player1Guesses;
        uint8 player2Guesses;
        uint40 startTime;
        uint32 duration; // seconds
        bool resolved;
        address winner; // address(0) if no winner yet
        uint256 stake; // Total stake amount
        bool player1Joined;
        bool player2Joined;
    }

    mapping(uint256 => Game) public games;
    mapping(uint256 => Match) public matches;

    // --- Events ---
    event GameCreated(
        uint256 indexed id,
        address indexed player,
        uint32 duration,
        uint256 stake
    );
    event WordSeeded(uint256 indexed id, bytes32 wordHash);
    event GuessSubmitted(
        uint256 indexed id,
        address indexed player,
        string guess,
        bool correct,
        uint8 guessCount
    );
    event GameResolved(uint256 indexed id, bool won, uint8 usedGuesses);

    // Match events
    event MatchCreated(
        uint256 indexed id,
        address indexed creator,
        uint256 stake,
        uint32 duration
    );
    event MatchJoined(
        uint256 indexed id,
        address indexed joiner,
        uint256 stake
    );
    event MatchGuessSubmitted(
        uint256 indexed id,
        address indexed player,
        string guess,
        bool correct,
        uint8 guessCount
    );
    event MatchResolved(
        uint256 indexed id,
        address indexed winner,
        uint256 prize,
        uint8 winnerGuesses
    );

    constructor() {
        owner = msg.sender;
    }

    // --- Game flow (single player) ---

    /**
     * Player creates a game; starts immediately with a duration.
     * The backend/oracle should seed the word hash shortly after with seedWordHash().
     */
    function createGame(
        uint32 durationSeconds
    ) external payable returns (uint256 id) {
        require(msg.value > 0, "stake required");
        require(msg.value >= 0.001 ether, "minimum stake 0.001 ETH");

        id = nextGameId++;
        Game storage g = games[id];
        g.player = msg.sender;
        g.startTime = uint40(block.timestamp);
        g.duration = durationSeconds == 0 ? 60 : durationSeconds; // default 5 mins
        g.stake = msg.value;

        emit GameCreated(id, msg.sender, g.duration, g.stake);
    }

    /**
     * Oracle seeds the target word for a given game.
     * Usually computed as keccak256(bytes(wordLowercase)).
     */
    function seedWordHash(uint256 id, bytes32 wordHash) external {
        Game storage g = games[id];
        require(!g.resolved, "resolved");
        require(g.player != address(0), "no such game");
        g.wordHash = wordHash;
        emit WordSeeded(id, wordHash);
    }

    /**
     * Player submits a guess (lowercase 5 letters). If matches hash → win & resolve.
     * No color feedback on-chain; UI computes hints locally.
     */
    function submitGuess(uint256 id, string calldata guess) external {
        Game storage g = games[id];
        require(!g.resolved, "resolved");
        require(g.player == msg.sender, "not your game");
        require(g.wordHash != bytes32(0), "word not seeded");
        require(block.timestamp <= g.startTime + g.duration, "time over");

        bytes memory b = bytes(guess);
        require(b.length == WORD_LEN, "invalid length");

        require(g.guesses < MAX_GUESSES, "guess limit");
        unchecked {
            g.guesses += 1;
        }

        bool correct = (keccak256(b) == g.wordHash);
        emit GuessSubmitted(id, msg.sender, guess, correct, g.guesses);

        if (correct) {
            g.resolved = true;
            g.won = true;

            // Winner gets stake back + 50% bonus
            uint256 bonus = g.stake / 2; // 50% bonus
            uint256 totalPrize = g.stake + bonus;
            payable(msg.sender).transfer(totalPrize);

            emit GameResolved(id, true, g.guesses);
            return;
        }

        // Auto-resolve on fail if limit/time exhausted
        if (
            g.guesses >= MAX_GUESSES ||
            block.timestamp > g.startTime + g.duration
        ) {
            g.resolved = true;
            g.won = false;
            // Loser loses their stake (no transfer needed, stake stays in contract)
            emit GameResolved(id, false, g.guesses);
        }
    }

    // --- 1vs1 Match functions ---

    /**
     * Create a 1vs1 match with stake
     * Player stakes ETH and waits for opponent
     */
    function createMatch(
        uint32 durationSeconds
    ) external payable returns (uint256 id) {
        require(msg.value > 0, "stake required");
        require(msg.value >= 0.001 ether, "minimum stake 0.001 ETH");

        id = nextMatchId++;
        Match storage m = matches[id];
        m.player1 = msg.sender;
        m.stake = msg.value;
        m.duration = durationSeconds == 0 ? 300 : durationSeconds; // default 5 mins
        m.startTime = uint40(block.timestamp);
        m.player1Joined = true;

        emit MatchCreated(id, msg.sender, msg.value, m.duration);
    }

    /**
     * Join an existing match
     * Must stake the same amount as creator
     */
    function joinMatch(uint256 id) external payable {
        Match storage m = matches[id];
        require(m.player1 != address(0), "match not found");
        require(m.player2 == address(0), "match full");
        require(m.player1 != msg.sender, "cannot join own match");
        require(msg.value == m.stake, "stake mismatch");
        require(!m.resolved, "match resolved");

        m.player2 = msg.sender;
        m.stake += msg.value; // Total stake is now 2x
        m.player2Joined = true;

        emit MatchJoined(id, msg.sender, msg.value);
    }

    /**
     * Oracle seeds the word for a match
     * Both players will guess the same word
     */
    function seedMatchWord(uint256 id, bytes32 wordHash) external {
        Match storage m = matches[id];
        require(m.player1 != address(0), "match not found");
        require(m.player2 != address(0), "match not full");
        require(!m.resolved, "match resolved");
        require(m.wordHash == bytes32(0), "word already seeded");

        m.wordHash = wordHash;
        // Match starts when word is seeded
        m.startTime = uint40(block.timestamp);
    }

    /**
     * Submit guess in a match
     * First player to guess correctly wins all stakes
     */
    function submitMatchGuess(uint256 id, string calldata guess) external {
        Match storage m = matches[id];
        require(!m.resolved, "match resolved");
        require(m.wordHash != bytes32(0), "word not seeded");
        require(
            m.player1 == msg.sender || m.player2 == msg.sender,
            "not your match"
        );
        require(block.timestamp <= m.startTime + m.duration, "time over");

        bytes memory b = bytes(guess);
        require(b.length == WORD_LEN, "invalid length");

        bool isPlayer1 = (msg.sender == m.player1);
        uint8 currentGuesses = isPlayer1 ? m.player1Guesses : m.player2Guesses;

        require(currentGuesses < MAX_GUESSES, "guess limit");

        bool correct = (keccak256(b) == m.wordHash);

        if (isPlayer1) {
            m.player1Guesses += 1;
        } else {
            m.player2Guesses += 1;
        }

        emit MatchGuessSubmitted(
            id,
            msg.sender,
            guess,
            correct,
            isPlayer1 ? m.player1Guesses : m.player2Guesses
        );

        if (correct) {
            // Winner found!
            m.resolved = true;
            m.winner = msg.sender;

            // Winner gets total stake (player1 + player2 stakes)
            payable(msg.sender).transfer(m.stake);

            emit MatchResolved(
                id,
                msg.sender,
                m.stake, // total stake amount
                isPlayer1 ? m.player1Guesses : m.player2Guesses
            );
            return;
        }

        // Check if both players exhausted their guesses or time is up
        if (
            (m.player1Guesses >= MAX_GUESSES &&
                m.player2Guesses >= MAX_GUESSES) ||
            block.timestamp > m.startTime + m.duration
        ) {
            m.resolved = true;
            // No winner - refund stakes equally
            uint256 refund = m.stake / 2;
            payable(m.player1).transfer(refund);
            payable(m.player2).transfer(refund);

            emit MatchResolved(id, address(0), 0, 0);
        }
    }

    // --- View helpers ---
    function getGame(uint256 id) external view returns (Game memory) {
        return games[id];
    }

    function getMatch(uint256 id) external view returns (Match memory) {
        return matches[id];
    }

    function getMatchTimeLeft(uint256 id) external view returns (uint256) {
        Match storage m = matches[id];
        if (m.resolved || m.player1 == address(0)) return 0;
        uint256 end = uint256(m.startTime) + m.duration;
        return block.timestamp >= end ? 0 : (end - block.timestamp);
    }

    function createGameForPlayer(
        address player,
        uint32 durationSeconds
    ) external payable returns (uint256 id) {
        require(msg.value > 0, "stake required");
        require(msg.value >= 0.001 ether, "minimum stake 0.001 ETH");

        id = nextGameId++;
        Game storage g = games[id];
        g.player = player;
        g.startTime = uint40(block.timestamp);
        g.duration = durationSeconds == 0 ? 60 : durationSeconds;
        g.stake = msg.value;

        emit GameCreated(id, player, g.duration, g.stake);
    }

    function createGameWithWord(
        address player,
        uint32 durationSeconds,
        bytes32 wordHash
    ) external payable returns (uint256 id) {
        require(msg.value > 0, "stake required");
        require(msg.value >= 0.001 ether, "minimum stake 0.001 ETH");

        id = nextGameId++;
        Game storage g = games[id];
        g.player = player;
        g.startTime = uint40(block.timestamp);
        g.duration = durationSeconds == 0 ? 60 : durationSeconds;
        g.wordHash = wordHash;
        g.stake = msg.value;

        emit GameCreated(id, player, g.duration, g.stake);
        emit WordSeeded(id, wordHash);
    }

    /**
     * Batch create multiple games (useful for testing)
     * Each game gets equal stake from msg.value
     */
    function batchCreateGames(
        address[] calldata players,
        uint32 durationSeconds,
        bytes32[] calldata wordHashes
    ) external payable returns (uint256[] memory gameIds) {
        require(players.length == wordHashes.length, "array length mismatch");
        require(msg.value > 0, "stake required");
        require(
            msg.value >= 0.001 ether * players.length,
            "minimum stake per game"
        );

        uint256 stakePerGame = msg.value / players.length;
        require(
            stakePerGame >= 0.001 ether,
            "minimum stake 0.001 ETH per game"
        );

        gameIds = new uint256[](players.length);

        for (uint256 i = 0; i < players.length; i++) {
            uint256 id = nextGameId++;
            Game storage g = games[id];
            g.player = players[i];
            g.startTime = uint40(block.timestamp);
            g.duration = durationSeconds == 0 ? 60 : durationSeconds;
            g.wordHash = wordHashes[i];
            g.stake = stakePerGame;

            gameIds[i] = id;

            emit GameCreated(id, players[i], g.duration, g.stake);
            emit WordSeeded(id, wordHashes[i]);
        }
    }
}
