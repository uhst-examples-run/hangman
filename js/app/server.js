define(['require', 'uhst', 'jquery', 'app/host'], function (
  require,
  uhst,
  $,
  Host
) {
  'use strict';

  class Server {
    constructor() {
      this.eventHandlers = {};
      this.uhstApi = new uhst.UHST();
    }

    emit(eventName, info) {
      return this.client.send(JSON.stringify({ eventName, info }));
    }

    on(eventName, callback) {
      this.eventHandlers[eventName] = callback;
      if (eventName === 'connect') {
        this.initGame();
      }
    }

    initGame() {
      if (window.location.hash) {
        // join as client
        this.client = this.uhstApi.join(window.location.hash.replace('#', ''));
        this.client.on('error', console.error);
        this.client.on(
          'open',
          function () {
            if (this.eventHandlers['connect']) {
              this.eventHandlers['connect']();
            }
          }.bind(this)
        );
        this.client.on(
          'message',
          function (message) {
            const event = JSON.parse(message);
            if (this.eventHandlers[event.eventName]) {
              this.eventHandlers[event.eventName](event.info);
            }
          }.bind(this)
        );
      } else {
        $(window).bind('hashchange', this.initGame.bind(this));
        // start hosting
        this.host = new Host(this.uhstApi);
      }
    }

    //
    // Make requests to the server
    //

    joinGame() {
      this.emit('connection', {
        data: "I'm connected!",
      });
    }

    // Ask the server to become the chooser
    becomeChooser(playerName) {
      this.emit('become_chooser', {
        username: playerName,
      });
    }

    // Ask the server to become the guesser
    becomeGuesser(playerName) {
      this.emit('become_guesser', {
        username: playerName,
      });
    }

    // Reset the player type from the title screen
    resetFromTitleScreen(userType) {
      this.emit('reset_titlescreen', {
        reset_type: userType,
      });
    }

    // Send the secret phrase to the server as the chooser
    submitSecretPhrase(secretPhrase) {
      this.emit('submit_secret_phrase', {
        secret: secretPhrase,
      });
    }

    // Send the guess to the server as the guesser
    guessLetter(letter) {
      this.emit('guess_letter', {
        letter: letter,
      });
    }

    // Request the server to reset the game (for everyone)
    resetGame() {
      this.emit('reset_game');
    }

    //
    // Get data from the server
    //

    // Connected to the server
    onConnect(callback) {
      this.on('connect', callback);
    }

    // The screen of the game changed (ex. from TitleScreen to GameScreen)
    onGameStateChanged(callback) {
      this.on('change_gamestate', callback);
    }

    // Updates to toggle button statuses
    onTitleScreenUpdates(callback) {
      this.on('update_titlescreen', callback);
    }

    // Updates to whether the chooser has been set
    onChooserStatusUpdates(callback) {
      this.on('chooser_feedback', callback);
    }

    // Updates to whether the guesser has been set
    onGuesserStatusUpdates(callback) {
      this.on('guesser_feedback', callback);
    }

    // Updates to names, scores, and round on the game screen
    onGameScreenUpdates(callback) {
      this.on('update_gamescreen', callback);
    }

    // Another user pressed the reset button
    onPlayersReset(callback) {
      this.on('external_reset', callback);
    }

    // Updates to the phrase currently discovered
    onDiscoveredPhraseUpdates(callback) {
      this.on('discovered_phrase', callback);
    }

    // Server asked the client to reset the game
    onResetGameRequest(callback) {
      this.on('reset_game', callback);
    }
  }

  return Server;
});
