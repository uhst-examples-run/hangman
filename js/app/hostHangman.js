/**
 * A hangman game in progress
 * Keeps track of the phrase to guess and what has been guessed
 */
define(['require', 'app/constants'], function (require, c) {
  class Hangman {
    constructor(phrase) {
      // Set the phrase to guess
      this.phrase = phrase;
      this.numChars = this.phrase.length;
      this.underlinePhrase = '';
      this.usedLetters = [];
      this.numLives = 9;

      for (var x = 0; x < this.numChars-1; x++) {
        if (this.phrase.charAt(x) === ' ') {
          this.underlinePhrase = this.underlinePhrase + '  ';
        } else {
          this.underlinePhrase = this.underlinePhrase + '_ ';
        }
      }
      if (this.phrase[this.numChars - 1] === ' ') {
        this.underlinePhrase = this.underlinePhrase + ' ';
      } else {
        this.underlinePhrase = this.underlinePhrase + '_';
      }
    }

    // Guess the letter
    guess(letter) {
      console.log('Guessing the letter ' + letter + ' in ' + this.phrase);
      this.userGuess = letter.toUpperCase();
      this.usedLetters.push(this.userGuess);

      if (!this.inPhrase(this.userGuess)) {
        this.numLives = this.numLives - 1;
      }

      for (var x = 0; x < this.numChars; x++) {
        if (this.phrase.charAt(x).toUpperCase() === this.userGuess) {
          this.underlinePhrase =
            this.underlinePhrase.substring(0, 2 * x) +
            this.phrase.charAt(x) +
            this.underlinePhrase.substring(2 * x + 1);
        }
      }
    }

    inPhrase(letter) {
      for (var x = 0; x < this.numChars; x++) {
        if (this.phrase.charAt(x).toUpperCase() === letter) {
          return true;
        }
      }
      return false;
    }

    // Get the phrase back with underlines for what has not yet been guessed
    // Ex. for "hello world", and guesses "e", return ["_e___ _____"]
    getCurrentlyDiscoveredPhrase() {
      return this.underlinePhrase;
    }

    // Checks if the phrase has been successfully completed
    isCompleted() {
      for (var x = 0; x < this.underlinePhrase.length; x++) {
        if (this.underlinePhrase.charAt(x) === '_') {
          return false;
        }
      }
      return true;
    }

    // Return letters used
    getUsedLetters() {
      return this.usedLetters;
    }

    getNumLives() {
      return this.numLives;
    }
  }

  return Hangman;
});
