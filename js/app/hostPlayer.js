/**
 * Used to represent a player connected to the game
 */
define(['require', 'app/constants'], function (require, c) {
  const NO_NAME = 'Anonymous';

  class Player {
    constructor(sid) {
      // Keep record of the session id of the player
      this.sid = sid;
      this.player_type = c.PlayerType.SPECTATOR_TYPE;
      this.name = NO_NAME;
      this.missed_guesses = 0;
      this.score = 0;
    }

    // Checks if the player is a guesser
    is_guesser() {
      return this.player_type === c.PlayerType.GUESSER_TYPE;
    }

    // Checks if the player is a chooser
    is_chooser() {
      return this.player_type === c.PlayerType.CHOOSER_TYPE;
    }

    // Checks if the player is a spectator
    is_spectator() {
      return this.player_type === c.PlayerType.SPECTATOR_TYPE;
    }

    // Returns the type of the player
    get_player_type() {
      return this.player_type;
    }

    // Makes the player a guesser
    make_guesser() {
      this.player_type = c.PlayerType.GUESSER_TYPE;
    }

    // Makes the player a chooser
    make_chooser() {
      this.player_type = c.PlayerType.CHOOSER_TYPE;
    }

    // Makes the player a spectator
    make_spectator() {
      this.player_type = c.PlayerType.SPECTATOR_TYPE;
    }

    // Sets the name of the player
    set_name(name) {
      console.assert(name);
      this.name = name;
    }

    // Returns the name of the player
    get_name() {
      console.assert(this.name);
      return this.name;
    }

    // Resets the name of the player
    reset_name() {
      this.name = NO_NAME;
    }

    // Returns the score of the player
    get_score() {
      return this.score;
    }

    // Returns the number of phrase misses the player has
    get_misses() {
      return this.missed_guesses;
    }

    // Resets the round after a results_screen completes
    round_reset() {
      this.missed_guesses = 0;
    }

    // Fully resets the player
    full_reset() {
      this.make_spectator();
      this.reset_name();
    }
  }

  return Player;
});
