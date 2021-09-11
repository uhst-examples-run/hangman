define(['require', 'app/constants'], function (require, c) {
  /*
    Unique User Game Info
    ABOUT:
      playerName: Name of user
      userConfirmed: Whether the user has confirmed their play type
      userType: The play type the user has chosen or been assigned
      secretPhrase: As the chooser, a secret phrase is chosen and stored
      letterChosen: Letter chosen by user on game screen when permitted to do so
  */
  class Player {
    constructor() {
      this.reset();
    }

    getName() {
      return this.playerName.toUpperCase().trim();
    }

    getSecretPhrase() {
      return this.secretPhrase.toUpperCase().trim();
    }

    reset() {
      this.playerName = ''; // Do not access directly - use getName()
      this.userConfirmed = false; // whether the user has confirmed their user type
      this.userType = c.PlayerType.SPECTATOR_TYPE;
      this.secretPhrase = '';
      this.letterChosen = '';
    }

    becomeChooser() {
      this.playerName = this.playerName.trim();
      this.userConfirmed = true;
      this.userType = c.PlayerType.CHOOSER_TYPE;
    }

    becomeGuesser() {
      this.playerName = this.playerName.trim();
      this.userType = c.PlayerType.GUESSER_TYPE;
    }

    isGuesser() {
      return this.userType === c.PlayerType.GUESSER_TYPE;
    }

    isChooser() {
      return this.userType === c.PlayerType.CHOOSER_TYPE;
    }

    isSpectator() {
      return this.userType === c.PlayerType.SPECTATOR_TYPE;
    }
  }

  return Player;
});
