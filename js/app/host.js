define(['require', 'app/constants', 'app/hostGame'], function (
  require,
  c,
  Game
) {
  'use strict';

  let game = new Game();

  class Host {
    constructor(uhstApi) {
      this.host = uhstApi.host();
      this.host.on('ready', this.onReady.bind(this));
      this.host.on('connection', this.setupEventHandlers.bind(this));
    }

    emit(eventName, info, client) {
      if (client) {
        return client.send(JSON.stringify({ eventName, info }));
      } else {
        return this.host.broadcast(JSON.stringify({ eventName, info }));
      }
    }

    setupEventHandlers(socket) {
      socket.on(
        'close',
        function () {
          this.onDisconnect(socket.remoteId);
        }.bind(this)
      );

      socket.on(
        'message',
        function (message) {
          const event = JSON.parse(message);
          switch (event.eventName) {
            case 'reset_titlescreen':
              this.onResetTitlescreen(socket, event.info);
              break;
            case 'connection':
              this.onConnection(socket);
              break;
            case 'become_chooser':
              this.onBecomeChooser(socket, event.info);
              break;
            case 'become_guesser':
              this.onBecomeGuesser(socket, event.info);
              break;
            case 'submit_secret_phrase':
              this.onPhraseSubmit(event.info);
              break;
            case 'guess_letter':
              this.onGuessLetter(event.info);
              break;
            case 'prepare_next_round':
              this.onPrepareNextRound(event.info);
              break;
            case 'prepare_next_round':
              this.onReset(event.info);
              break;
            default:
              console.log('Unhandled event: ', event.eventName);
          }
        }.bind(this)
      );
    }

    //
    // Messages sent from server to client
    //

    // Change the users' screen
    change_game_state(game_state, client) {
      if (game_state) {
        game.game_state = game_state;
      }
      this.emit('change_gamestate', { gamestate: game.game_state }, client);
    }

    // Enable/disable buttons on the title screen
    update_title_screen(client) {
      this.emit(
        'update_titlescreen',
        {
          guess_disable: game.is_guesser_set(),
          choose_disable: game.is_chooser_set(),
        },
        client
      );
    }

    // Update the props of the games creen
    update_game_screen(client) {
      this.emit(
        'update_gamescreen',
        {
          guesser_name: game.get_name(game.guesser),
          chooser_name: game.get_name(game.chooser),
          guesser_score: game.get_score(game.guesser),
          chooser_score: game.get_score(game.chooser),
          round: game.round,
        },
        client
      );
    }

    // Update the hangman game's game state after a guess
    discovered_phrase(client) {
      this.emit(
        'discovered_phrase',
        {
          discovered_phrase: game.get_currently_discovered_phrase(),
          phrase_completed: game.is_completed(),
          letters_used: game.letters_guessed,
          misses: game.phrase_misses,
        },
        client
      );
    }

    // Reset the user's choice (guesser/chooser) from the title screen
    // type_enable is whether players are able to choose the
    reset_player(player_type, client) {
      this.emit('external_reset', { type_enable: player_type }, client);
    }

    // Tell clients whether or not the chooser was chosen
    chooser_feedback(chooser_confirmed, client) {
      this.emit(
        'chooser_feedback',
        { chooser_confirmed: game.is_chooser_set() },
        client
      );
    }

    // Tell clients whether or not the guesser was chosen
    guesser_feedback(guesser_confirmed, client) {
      this.emit(
        'guesser_feedback',
        { guesser_confirmed: game.is_guesser_set() },
        client
      );
    }

    //
    // Socket events
    //

    onReady() {
      window.location.hash = this.host.hostId;
    }

    onConnection(socket) {
      console.log('Received connection from client (' + socket.remoteId + ')');

      // Add the player to the players list
      console.assert(socket.remoteId);
      game.add_player(socket.remoteId);
      // Set the player as spectator by default
      game.set_spectator(socket.remoteId);

      // Send the state information required for a connecting client to first render the page
      this.change_game_state(null, socket);
      this.update_title_screen(socket);
      this.update_game_screen(socket);
      this.discovered_phrase(socket);
    }

    onDisconnect(remoteId) {
      console.log('Received disconnection from client (' + remoteId + ')');

      // Delete the player from the players list
      console.assert(remoteId);
      game.remove_player(remoteId);

      // Tell the other clients that the player left
      this.change_game_state();
      this.update_title_screen();
      this.update_game_screen();

      // TODO: We probably want to handle some case here if the chooser/guesser
      // leaves mid-game
    }

    onResetTitlescreen(socket, player_type) {
      console.log('Titlescreen has been reset');
      console.assert(socket.remoteId);

      this.reset_player(game.get_player_type(socket.remoteId));
      this.reset_player(game.get_opposite_player_type(socket.remoteId), socket);

      if (player_type['reset_type'] === 'chooser') {
        game.reset_chooser();
      } else if (player_type['reset_type'] === 'guesser') {
        game.reset_guesser();
      }
      game.reset_name(socket.remoteId);

      game.players[socket.remoteId].make_spectator();
    }

    onBecomeChooser(socket, name) {
      // Set the new chooser
      console.assert(socket.remoteId);
      console.assert(name);
      console.assert(name['username']);
      // game.reset_chooser()
      game.set_chooser(socket.remoteId, name['username']);
      this.chooser_feedback(game.is_chooser_set());

      console.log(
        'The new chooser is: ' +
          game.get_name(socket.remoteId) +
          ' (' +
          socket.remoteId +
          ')'
      );

      if (game.players_ready()) {
        this.change_game_state(c.GameStates.loading);
        console.log('The game is now in its loading phase');
      }
    }

    onBecomeGuesser(socket, name) {
      // Set the new guesser
      console.assert(socket.remoteId);
      console.assert(name);
      console.assert(name['username']);
      game.set_guesser(socket.remoteId, name['username']);
      this.guesser_feedback(game.is_guesser_set());

      console.log(
        'The new guesser is: ' +
          game.get_name(socket.remoteId) +
          ' (' +
          socket.remoteId +
          ')'
      );

      if (game.players_ready()) {
        this.change_game_state(c.GameStates.loading);
        console.log('The game is now in its loading phase');
      }
    }

    onPhraseSubmit(phrase) {
      // Update the new phrase
      console.assert(phrase);
      console.assert(Object.keys(phrase).indexOf('secret') !== -1);
      game.set_phrase(phrase['secret']);

      game.round += 1;

      this.change_game_state(c.GameStates.game);
      this.update_game_screen();
      this.discovered_phrase();

      console.log('Secret phrase has been chosen');
    }

    onGuessLetter(phrase) {
      console.assert(phrase);
      console.assert(Object.keys(phrase).indexOf('letter') !== -1);

      if (!game.hangman.inPhrase(phrase['letter'])) {
        game.phrase_misses += 1;
      }
      game.hit_constrain(game.phrase_misses);
      game.guess_letter(phrase['letter']);
      this.discovered_phrase();

      console.log('A letter has been guessed: ' + phrase['letter']);
    }

    onPrepareNextRound(json) {
      console.assert(game.is_completed());
      game.swap_players();
      game.prepare_next_round();
      this.change_game_state(c.GameStates.loading);
      this.update_game_screen();
    }

    onReset(json) {
      game.reset();
      this.emit('reset_game', {});
      // this.change_game_state(c.GameStates.title);
      this.update_title_screen();
    }
  }

  return Host;
});
