requirejs.config({
  baseUrl: './js/lib',
  shim: {
    jquery: {
      exports: '$'
    },
    socketio: {
      exports: 'io'
    },
  },
  paths: {
    app: '../app',
  },
});

requirejs(['app/hangman']);
