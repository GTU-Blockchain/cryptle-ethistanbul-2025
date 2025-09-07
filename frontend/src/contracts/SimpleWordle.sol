// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Simple single-player Wordle backend without VRF
 *
 * What this does:
 * - Single player games (one address per game)
 * - Oracle seeds the target word as keccak256(bytes(lowercaseWord))
 * - Player submits guesses; if hash matches → win
 * - Oracle provides randomness for word selection
 *
 * Notes on randomness:
 * - Uses oracle-provided randomness (simpler than VRF)
 * - Oracle can use off-chain secure randomness
 * - Suitable for demonstration and testing
 */

contract SimpleWordle {
    // --- Roles ---
    address public owner;
    address public oracle; // your backend signer that calls seedWordHash()

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }
    modifier onlyOracle() {
        require(msg.sender == oracle, "not oracle");
        _;
    }

    // --- Game constants ---
    uint8 public constant WORD_LEN = 5;
    uint8 public constant MAX_GUESSES = 6;

    // --- Storage ---
    uint256 public nextGameId = 1;

    struct Game {
        address player;
        bytes32 wordHash; // keccak256(bytes(lowercaseWord))
        uint8 guesses;
        uint40 startTime;
        uint32 duration; // seconds
        bool resolved;
        bool won;
    }

    mapping(uint256 => Game) public games;

    // --- Events ---
    event GameCreated(
        uint256 indexed id,
        address indexed player,
        uint32 duration
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
    event OracleUpdated(address oracle);

    constructor(address _oracle) {
        owner = msg.sender;
        oracle = _oracle;
    }

    // --- Admin ---
    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    // --- Game flow (single player) ---

    /**
     * Player creates a game; starts immediately with a duration.
     * The backend/oracle should seed the word hash shortly after with seedWordHash().
     */
    function createGame(uint32 durationSeconds) external returns (uint256 id) {
        id = nextGameId++;
        Game storage g = games[id];
        g.player = msg.sender;
        g.startTime = uint40(block.timestamp);
        g.duration = durationSeconds == 0 ? 300 : durationSeconds; // default 5 mins

        emit GameCreated(id, msg.sender, g.duration);
    }

    /**
     * Oracle seeds the target word for a given game.
     * Usually computed as keccak256(bytes(wordLowercase)).
     */
    function seedWordHash(uint256 id, bytes32 wordHash) external onlyOracle {
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
            emit GameResolved(id, false, g.guesses);
        }
    }

    // --- View helpers ---
    function getGame(uint256 id) external view returns (Game memory) {
        return games[id];
    }

    function timeLeft(uint256 id) external view returns (uint256) {
        Game storage g = games[id];
        if (g.resolved || g.player == address(0)) return 0;
        uint256 end = uint256(g.startTime) + g.duration;
        return block.timestamp >= end ? 0 : (end - block.timestamp);
    }

    // --- Oracle utilities ---

    /**
     * Oracle can request a new game for automated testing or demo purposes
     */
    function createGameForPlayer(
        address player,
        uint32 durationSeconds
    ) external onlyOracle returns (uint256 id) {
        id = nextGameId++;
        Game storage g = games[id];
        g.player = player;
        g.startTime = uint40(block.timestamp);
        g.duration = durationSeconds == 0 ? 300 : durationSeconds;

        emit GameCreated(id, player, g.duration);
    }

    /**
     * Oracle can immediately seed a word when creating a game
     */
    function createGameWithWord(
        address player,
        uint32 durationSeconds,
        bytes32 wordHash
    ) external onlyOracle returns (uint256 id) {
        id = nextGameId++;
        Game storage g = games[id];
        g.player = player;
        g.startTime = uint40(block.timestamp);
        g.duration = durationSeconds == 0 ? 300 : durationSeconds;
        g.wordHash = wordHash;

        emit GameCreated(id, player, g.duration);
        emit WordSeeded(id, wordHash);
    }

    /**
     * Batch create multiple games (useful for testing)
     */
    function batchCreateGames(
        address[] calldata players,
        uint32 durationSeconds,
        bytes32[] calldata wordHashes
    ) external onlyOracle returns (uint256[] memory gameIds) {
        require(players.length == wordHashes.length, "array length mismatch");

        gameIds = new uint256[](players.length);

        for (uint256 i = 0; i < players.length; i++) {
            uint256 id = nextGameId++;
            Game storage g = games[id];
            g.player = players[i];
            g.startTime = uint40(block.timestamp);
            g.duration = durationSeconds == 0 ? 300 : durationSeconds;
            g.wordHash = wordHashes[i];

            gameIds[i] = id;

            emit GameCreated(id, players[i], g.duration);
            emit WordSeeded(id, wordHashes[i]);
        }
    }
}
