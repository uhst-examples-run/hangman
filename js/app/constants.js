define(['require'], function () {
  'use strict';

  return {
    // Dimensions of the screen
    screenWidth: 1080, // px
    screenHeight: 700, // px

    // Game logic
    maxLife: 7,

    GameStates: {
      title: 'titlescreen',
      loading: 'loadingscreen',
      game: 'gamescreen',
      results: 'resultsscreen',
    },

    // Different roles that the players can have
    PlayerType: {
      GUESSER_TYPE: 'guesser',
      CHOOSER_TYPE: 'chooser',
      SPECTATOR_TYPE: 'spectator',
      NO_TYPE: 'none',
    },
  };
});
