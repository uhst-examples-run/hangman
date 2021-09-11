define([
  'require',
  'app/constants',
  'app/hostPlayer',
  'app/hostHangman',
], function (require, c, Player, Hangman) {
  'use strict';

  // Contains all of the game logic regarding guesser and chooser
  // and ways to guess
  // This is the interface that the sockets can call to manipulate the
  // control flow

  // Session ID of a guesser/choose when none have been selected
  const PLAYER_NOT_CHOSEN = 'PLAYER_NOT_CHOSEN';

  class Game {
    constructor() {
      this.guesser = PLAYER_NOT_CHOSEN; // The session ID of the player who guesses the phrase
      this.chooser = PLAYER_NOT_CHOSEN; // The session ID of the player who provides the phrase
      this.hangman = null; // Hangman game instance
      this.players = {}; // Map of [session_id:Player] currently connected
      this.game_state = c.GameStates.title; // Screen that the users are on
      this.round = 0;
      this.letters_guessed = [];
      this.phrase_misses = 0;
    }

    // Reset the whole state
    reset() {
      this.reset_guesser();
      this.reset_chooser();
      this.hangman = null;
      // Don't reset players since people are still connected as spectators
      this.game_state = c.GameStates.title;
      this.round = 0;
      this.letters_guessed = [];
      this.phrase_misses = 0;
    }

    // Keep track of a new player in the game
    add_player(sid) {
      console.assert(sid);
      console.assert(Object.keys(this.players).indexOf(sid) == -1);
      this.players[sid] = new Player(sid);
    }

    // Remove a player from the game when they disconnect
    remove_player(sid) {
      console.assert(sid);
      console.assert(Object.keys(this.players).indexOf(sid) != -1);
      delete this.players[sid];
    }

    // Get the number of players currently connected
    count_players() {
      return Object.keys(this.players).length;
    }

    // Return true if the current player is a guesser, false if not
    is_guesser(sid) {
      console.assert(sid);
      return this.guesser === sid;
    }

    // Return true if the current player is a chooser, false if not
    is_chooser(sid) {
      console.assert(sid);
      return this.chooser === sid;
    }

    // Return true if someone was chosen as a guesser, false if not
    is_guesser_set() {
      return this.guesser !== PLAYER_NOT_CHOSEN;
    }

    // Return true if someone was chosen as a chooser, false if not
    is_chooser_set() {
      return this.chooser !== PLAYER_NOT_CHOSEN;
    }

    // Set the guesser back to PLAYER_NOT_CHOSEN, returns true if there was a
    // guesser previously, false if not
    reset_guesser() {
      // Reset roles in players map
      if (this.guesser !== PLAYER_NOT_CHOSEN) {
        console.assert(
          Object.keys(this.players).indexOf(this.guesser) !== -1
        );
        this.players[this.guesser].make_spectator();
        this.guesser = PLAYER_NOT_CHOSEN;
        return true;
      }
      return false;
    }

    // Set the chooser back to PLAYER_NOT_CHOSEN, returns true if there was a
    // chooser previously, false if not
    reset_chooser() {
      // Reset roles in players dictionary
      if (this.chooser !== PLAYER_NOT_CHOSEN) {
        console.assert(
          Object.keys(this.players).indexOf(this.chooser) !== -1
        );

        this.players[this.chooser].make_spectator();
        this.chooser = PLAYER_NOT_CHOSEN;
        return true;
      }
      return false;
    }

    // Become the new guesser - assumes guesser was already reset
    set_guesser(sid, name) {
      this.guesser = sid;
      if (sid === PLAYER_NOT_CHOSEN) {
        return;
      }
      this.players[sid].make_guesser();
      this.players[sid].set_name(name);
    }

    // Become the new chooser - assumes chooser was already reset
    set_chooser(sid, name) {
      this.chooser = sid;
      if (sid === PLAYER_NOT_CHOSEN) {
        return;
      }
      this.players[sid].make_chooser();
      this.players[sid].set_name(name);
    }

    // Become a spectator on the server
    set_spectator(sid) {
      this.players[sid].make_spectator();
    }

    // Get the name of the player
    get_name(sid) {
      if (sid === PLAYER_NOT_CHOSEN) {
        return PLAYER_NOT_CHOSEN;
      }
      console.assert(sid);
      console.assert(Object.keys(this.players).indexOf(sid) !== -1);
      return this.players[sid].get_name();
    }

    // Set a new name for the player
    set_name(sid, name) {
      console.assert(sid);
      console.assert(Object.keys(this.players).indexOf(sid) !== -1);
      return this.players[sid].set_name(name);
    }

    // Reset the name of the player
    reset_name(sid) {
      console.assert(sid);
      console.assert(Object.keys(this.players).indexOf(sid) !== -1);
      return this.players[sid].reset_name();
    }

    // Reset the hangman game
    set_phrase(phrase) {
      this.hangman = new Hangman(phrase);
    }

    // Get the current type of the player as a string
    get_player_type(sid) {
      return this.players[sid].get_player_type();
    }

    // Get the "opposite" (ex. chooser/guesser) type of the player
    get_opposite_player_type(sid) {
      if (this.is_guesser(sid)) {
        return c.PlayerType.CHOOSER_TYPE;
      } else if (this.is_chooser(sid)) {
        return c.PlayerType.GUESSER_TYPE;
      } else {
        return c.PlayerType.NO_TYPE;
      }
    }

    // Determines if both chooser and guesser have been confirmed
    players_ready() {
      return this.is_guesser_set() && this.is_chooser_set();
    }

    // Returns the phrase in its currently discovered position
    guess_letter(letter) {
      console.assert(this.hangman);
      this.hangman.guess(letter);
      this.letters_guessed.push(letter);
      return this.get_currently_discovered_phrase();
    }

    // Returns the phrase with underlines for what hasn't been guessed yet
    get_currently_discovered_phrase() {
      if (!this.hangman) {
        return null;
      }
      return this.hangman.getCurrentlyDiscoveredPhrase();
    }

    // Checks if phrase has been successfully completed
    is_completed() {
      if (!this.hangman) {
        return false;
      }
      return this.hangman.isCompleted();
    }

    hit_constrain(val) {
      this.phrase_misses = Math.min(7, Math.max(0, val));
    }

    get_score(sid) {
      if (Object.keys(this.players).indexOf(sid) === -1) {
        return 0;
      }
      return this.players[sid].get_score();
    }

    swap_players() {
      this.players[this.guesser].player_type = c.PlayerType.CHOOSER_TYPE;
      this.players[this.chooser].player_type = c.PlayerType.GUESSER_TYPE;
      let temp_player_sid = this.guesser;
      this.guesser = this.chooser;
      this.chooser = temp_player_sid;
    }

    prepare_next_round() {
      this.Hangman = null;
      this.letters_guessed = [];
      this.misses = 0;
    }
  }

  return Game;
});
