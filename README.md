# Backendless Multiplayer Hangman

![](https://github.com/uhst-examples-run/hangman/raw/master/Resources/screenshot.png)

Port of [Side Project Club](https://www.facebook.com/sideprojectclub/)'s multiplayer hangman game to UHST using purely Javascript. See the original (Python+Javascript) game here: https://github.com/MultiplayerHangman/MultiplayerHangman

Video demo: [https://www.youtube.com/watch?v=hay36VJ2_Xw](https://www.youtube.com/watch?v=hay36VJ2_Xw)

## Running

**Step 1**: Install the [GitHub desktop app](https://desktop.github.com)

**Step 2**: Press the green "Clone or download" button at the top of this page and then "Open in Desktop" to open the repository inside the app. Then you can clone (download) the repository to your computer.

**Step 3**: After you clone the repository, double-click on index.html and the game will open in your browser

**Step 4**: Wait for the room id to appear in the URL then copy the URL and paste in Incognito mode or another browser

When the game first starts it creates a room and sets the room id in the URL. If the room id is in the URL the browser will join the existing room instead of creating a new room.

## Project files

These are the files you need to change when you want to make changes.

```
hangman/      (project folder)
|
├── server.py            (Python server)
├── static/
|   └── js/
|       └── hangman.js   (Javascript loaded on website)
|   └── css/
|       └── hangman.css  (CSS loaded on website)
└── index.html       (HTML loaded on website)
```


## Game flow

![](https://github.com/MultiplayerHangman/MultiplayerHangman/raw/master/Resources/gameflow.png)
