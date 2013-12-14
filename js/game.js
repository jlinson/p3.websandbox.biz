/*!
 * JavaScript file: game.js
 * - responsible for game grid loading;  associated with <div id="game-btns">
 *
 * - will initially hold demo game arrays in gameStore
 * - will handle ajax calls to the MySQL db in future.
 *
 * Date: 2013-11-30

 * references: undoStack[]   (declared in grid.js; see gameClear() below.)
 */

/**************************************************************************************************
 * This event captures any URL parameters for game load direction -
 */
$( document ).ready( function() {

    // pre-load a game - check the $_GET value -
    var searchString = window.location.search.substring(1);
    var searchArray = searchString.split('&');

    var loadValue = getGetValue( searchArray, "load" );
    if (loadValue == 'blank') {
        // don't auto-load any game, just enable 'grid-save' button - used for game grid entry
        $("#grid-save").css("visibility", "visible").prop("disabled", false);

    } else if ($.isNumeric( loadValue )) {
        // try to load the requested game
        gameLoad( loadValue );

    } else if (hasLocalStorage()) {
        // check local storage for preferences settings -
        var keyboardEnabled = localStorage.SudoSudokuKeyboardEnabled;
        if (keyboardEnabled == "false") {
            // remove the text inputs (only in #grid), change .cell.input class -
            $("input[type='text']").remove();
            $(".cell.input").removeClass( "input" ).addClass( "noinput" );
        }

        // check local storage for a prior game
        var savedGameId = localStorage.SudoSudokuGameId;
        if (savedGameId !== "undefined" && savedGameId > 0) {
            // load the game grid -
            gameLoad( savedGameId );
            // then see if any entries were saved -
            // TODO: next version

        } else {
            // no game found - load default game -
            gameLoad(0);
        }

    } else {
        // just load the default game
        gameLoad(0);
    }

});


/****************************************************************************************************
 *  getGetValue() - function to parse a key=value array and return value based on key requested
 *  @param searchArray - array of key=value strings (already .split('&') - or whatever delimiter)
 *  @param keyString - key to find value for
 */
function getGetValue( searchArray, keyString ) {

    for(var i = 0; i < searchArray.length; i++){
        var keyValuePair = searchArray[i].split('=');
        if(keyValuePair[0] == keyString){
            return keyValuePair[1];
        }
    }
    // nothing found, return empty
    return '';
}

/****************************************************************************************************
 *  getInputMode() - function to return the input mode of the game grid.
 *  - computer default is "input"; may be set to "noinput" for small screen / mobile devices
 *  - selected on longer "noinput" just to ensure no substring match of "input" in "noinput".
 *  @return inputMode
 */
function getInputMode() {

    var inputMode = "";

    if ($("#c00").hasClass( "noinput" )) {
        // if #c00 has "noinput" they all should have "noinput" -
        inputMode = "noinput";
    } else {
        // default mode
        inputMode = "input";
    }
    return inputMode;
}

/***************************************************************************************************
 * hasLocalStorage() - simple check for existence of localStorage for current browser -
 * @return boolean
 */
function hasLocalStorage() {

    return (typeof(localStorage) !== "undefined");
}

// **************************************************************************************************
// Button click listeners -

$("button[name=load]").click( function() {
    var confirmYes = confirm( "Are you sure you want to clear the game and load the next one?  Have you selected a difficulty level?" );
    if (confirmYes) {
        gameClear();
        gameLoad(0);  // default behavior = next game at level selected
    }
});

$("button[name=reset]").click( function() {
    var confirmYes = confirm( "Are you sure you want to clear the game and start over?" );
    if (confirmYes) {
        gameClear();
        gameLoad( gameIdCurrent );
    }
});

$("button[name=pause]").click( function(){
    gamePause();
});

$("button[name=save]").click( function(){
    gameSave();
});

$("button[name=grid-save]").click( function(){
    gameGridSave();
});

// ***************************************************************************************************
// Game level drop-down change listener -
// - 1 == beginner (default)
// - 2 == easy
// - 3 == medium
// - 4 == hard
// - 5 == expert

$( "select[name=level]" ).change( function() {
    var value = $( this ).val();
});

var gameIdCurrent = 0;
/****************************************************************************************************
 * gameLoad() - loads a stored game (just accesses the hard-coded "Game Store" for demo
 * - jQuery note: use .prop(), NOT .attr() to set disabled & readonly to <input> - jbl
 * @param gameId  - number/id of game to load
 *
 */
function gameLoad( gameId ) {

    if (!isNaN(gameId)) {
        // ensure gameId is sanitized (in case of eval()) and an integer (force the integer) -
        gameId = Math.round(gameId);
    } else {
        // just go with the default game -
        gameId = 0;
    }

    var gameLevel = 1; // "Beginner" default

    // Set valid gameLevel based on gameId (default, passed by $_GET, or retrieved from localStorage) -
    if (gameId == 0) {
        // just load the default game based on level selected -
        gameLevel = $("select[name='level']").val();
    } else {
        gameLevel = String(gameId).substr(0,1);
        if (gameLevel > 0 && gameLevel < 6) {
                $("select[name='level']").val(gameLevel);
        } else {
            alert("Invalid 'difficulty level' requested. Reverting to default level.");
            gameLevel = 1;
        }
    }

    // Get the gameNdx into gameStore[][] based on valid gameLevel and gameId -
    var gameNdx = setLastIndex( gameLevel, gameId );

    if (gameNdx != (gameLevel - 1)) {
        // must have been forced down a level - re-retrieve the game level -
        gameLevel = $("select[name='level']").val();
        alert("Did not find requested game. Will load next easier game. Select another level or submit a 'Contact' request. Thank you.");
    }
    var gameLevelNm = $("select[name='level'] option:selected").text();

    var levelLen = gameStore[gameNdx][lastIndex[gameNdx]].length;
    var inputMode = getInputMode();

    for (var i= 0; i < levelLen; i++) {

        var cellValue = gameStore[gameNdx][lastIndex[gameNdx]][i];
        var cvArray = [];
        cvArray = cellValue.split(":");

        if (inputMode == "input") {
            $("> input","#" + cvArray[0]).val( cvArray[1] ).prop("readonly",true).prop("disabled",true).addClass("valid");
            $("#" + cvArray[0]).addClass("readonly");  // add here for .css; the .js relies on prop("readonly") - jbl

        } else {
            // no keyboard "noinput" mode
            $("#" + cvArray[0]).text( cvArray[1] ).addClass("readonly valid");
        }

    }
    gameIdCurrent = gameLevel + lastIndex[gameNdx];
    $("#game-caption").text(gameLevelNm + " Game: " + gameIdCurrent);

    // now save the current game in localStorage (if available) for reload next time -
    // - if no localStorage, don't mention it, just move on -
    if (hasLocalStorage()) {
        localStorage.SudoSudokuGameId = gameIdCurrent;
    }
}

/****************************************************************************************************
 * setLastIndex() - determines the valid game to load and sets the lastIndex[] accordingly.
 * - note that gameLevel is not zero-based, whereas the "Ndx" vars are zero-base to access gameStore array.
 *
 * requires: global Game Store arrays  (see below)
 *
 * @param gameLevel - 1 to 5 number representing the game level (per select drop-down) [Validate before passing!]
 * @param gameId    - the passed-in game selector - indicates "default" or requested game number for validation here.
 * @return gameNdx  - array index to reference the multi-dimensional gameStore[][] via lastIndex[].
 */
function setLastIndex( gameLevel, gameId ) {

    var gameNdx = (gameLevel - 1);
    var lastNdx = String(gameId).substr(1);

    // check if we have any game referenced -
    if (!lastNdx || (lastNdx < 0)) {
        // no valid lastNdx passed - go with default 'next game' based on lastIndex global -
        // - warning: increment operator must precede lastIndex[] - otherwise, assignment happens before increment!!!
        lastNdx = ++lastIndex[ gameNdx ];
    }

    // set the lastIndex for the requested level, but make sure we don't blow-out our array -
    var maxNdx = (gameStore[ gameNdx ].length - 1);
    if (maxNdx < 0) {
        // no games at that level - drop down a level and recurse -
        if (gameNdx > 0) {
            $("select[name='level']").val(gameNdx);
            gameNdx = setLastIndex( gameNdx, gameId );

        } else {
            alert("Wow! We seem to have run out of games. Please submit a 'Contact' request. Thank you.");
            return 0;
        }

    } else if (lastNdx > maxNdx) {
        // went past last game at that level - revert back to first index -
        lastIndex[ gameNdx ] = 0;

    }else {
        lastIndex[ gameNdx ] = lastNdx;
    }
    return gameNdx;
}

/****************************************************************************************************
 * gameClear() - clears the grid for game reset or new game reload.
 * - references the undoStack[] declared in grid.js
 */
function gameClear() {

    var inputMode = getInputMode();
    var $inputCells = $([]);

    if (inputMode == "input") {
        $inputCells = $(".cell.input");
        $inputCells.removeClass("selected");
        $("> input", $inputCells).val('').prop("readonly",false).prop("disabled",false).removeClass("valid invalid current");
        $inputCells.removeClass("readonly"); // also remove "readonly" in parent div.cell - applied for styling in gameLoad() - jbl

    } else {
        $inputCells = $(".cell.noinput");
        $inputCells.text('').removeClass("valid invalid current selected readonly");
    }

    // truncate the undoStack - we're clearing the deck
    undoStack.length = 0;
    $("button[name=undo]").prop("disabled", true);
}

/****************************************************************************************************
 * gameSave() - saves a user game to localStorage.
 * - checks existence of localStorage on current browser
 * - serializes the game grid to local storage
 */
function gameSave() {

    if (!hasLocalStorage()) {
        alert("Game cannot be saved.  The game requires browser supported local storage that is not supported by your current browser.");
        return;
    }

    // if we're here - go ahead and save the game -
    localStorage.SudoSudokuGameId = gameIdCurrent;
}

/****************************************************************************************************
 * gameGridSave() - saves a starting game grid
 * - for demo, just places string in console.log to manually add to gameStore
 */
function gameGridSave() {

    var gameString = '';
    var inputMode = getInputMode();

    $(".valid").each( function() {
        // if not first pass, add comma value separator -
        if (gameString != '') {
            gameString += ',';
        }

        if (inputMode == "input") {
            gameString += '"' + $(this).attr("name") + ":" + $(this).val() + '"';
        } else {
            gameString += '"' + $(this).attr("id") + ":" + $(this).text() + '"';
        }

    });
    console.log( gameString );
    alert("Game string in console.");
}

/***************************************************************************************************
 * Game Store
 * - this should coordinate ajax calls to the db, however due to time constraints ...
 * - ... several demo games are pre-loaded into arrays.
 * - since javascript doesn't have associative arrays, the cellId => value is concatenated (similar to undoStack[])
 */
// Global array of last used index into each level's gameStore array -
var lastIndex = [];
var last0Index = -1;  // beginner games accessed
var last1Index = -1;  // easy games accessed
var last2Index = -1;  // medium games accessed
var last3Index = -1;  // hard games accessed
var last4Index = -1;  // expert games accessed

lastIndex = [last0Index, last1Index, last2Index, last3Index, last4Index];

// Array of game grid values organized by difficulty level -
var gameStore = [];
var game0Store = [];  // beginner games
var game1Store = [];  // easy games
var game2Store = [];  // medium games
var game3Store = [];  // hard games
var game4Store = [];  // expert games

// Beginner game grids -
var g00 = ["c03:2","c04:4","c05:1","c06:8","c07:3","c10:4","c12:2","c16:5","c20:6","c23:5","c25:7","c27:4","c28:1","c32:4","c37:5","c41:8","c42:1","c43:9","c45:5","c46:3","c47:4","c51:2","c56:8","c60:6","c61:9","c63:4","c65:5","c68:3","c72:7","c76:2","c78:4","c81:3","c82:2","c83:7","c84:1","c85:6"];
var g01 = ["c01:9","c02:3","c04:6","c06:4","c13:3","c14:8","c15:9","c17:6","c21:5","c24:1","c28:2","c32:6","c33:5","c34:4","c36:8","c38:9","c42:7","c44:3","c46:5","c50:5","c52:1","c54:6","c55:8","c56:2","c60:1","c64:7","c67:3","c71:7","c73:9","c74:2","c75:1","c82:9","c84:3","c86:1","c87:2"];
var g02 = ["c00:6","c01:5","c07:7","c11:8","c13:6","c15:4","c17:9","c18:1","c22:1","c24:2","c27:4","c31:9","c32:5","c33:4","c35:8","c38:1","c41:6","c44:3","c47:7","c50:3","c53:7","c55:2","c56:5","c57:6","c61:4","c64:3","c66:1","c70:8","c71:1","c73:7","c75:5","c77:2","c81:7","c87:5","c88:6"];
var g03 = ["c01:3","c03:6","c08:8","c10:8","c12:2","c13:4","c14:9","c15:7","c21:6","c23:8","c26:7","c28:1","c32:5","c35:9","c36:7","c37:8","c40:6","c42:9","c46:2","c48:1","c51:8","c52:7","c53:5","c56:6","c60:2","c62:3","c65:1","c67:7","c73:5","c74:2","c75:4","c76:1","c78:8","c80:4","c85:6","c87:9"];
var g04 = ["c03:2","c04:4","c05:1","c06:8","c07:3","c10:4","c12:2","c16:5","c20:6","c23:5","c25:7","c27:4","c28:1","c32:4","c37:5","c41:8","c42:1","c43:9","c45:5","c46:3","c47:4","c51:2","c56:8","c60:6","c61:9","c63:4","c65:5","c68:3","c72:7","c76:2","c78:4","c81:3","c82:2","c83:7","c84:1","c85:6"];
var g05 = ["c00:4","c03:9","c05:3","c06:1","c12:8","c13:5","c17:3","c18:2","c20:3","c21:1","c22:6","c27:7","c30:8","c32:4","c35:1","c37:6","c41:5","c43:9","c45:7","c47:4","c51:2","c53:6","c56:9","c58:3","c61:3","c66:7","c67:4","c68:2","c70:1","c71:6","c75:5","c76:3","c82:7","c83:8","c85:4","c88:5"];
var g06 = ["c02:5","c03:2","c05:9","c11:7","c12:2","c16:9","c18:3","c20:1","c23:6","c25:7","c26:8","c28:5","c31:1","c34:9","c36:7","c38:6","c40:4","c43:3","c45:7","c48:5","c50:7","c52:2","c54:8","c57:1","c60:3","c62:4","c63:6","c65:1","c68:8","c70:1","c72:6","c76:2","c77:3","c83:9","c85:4","c86:5"];
var g07 = ["c02:7","c04:2","c06:5","c07:6","c11:5","c13:9","c14:1","c18:3","c20:8","c23:4","c24:5","c28:7","c32:6","c33:7","c34:8","c37:3","c41:3","c43:1","c45:9","c47:4","c51:9","c54:3","c55:4","c56:6","c60:3","c64:1","c65:9","c68:8","c70:6","c74:7","c75:5","c77:2","c81:7","c82:8","c84:4","c86:5"];
var g08 = ["c04:8","c05:3","c06:5","c07:4","c12:8","c13:5","c14:9","c18:2","c20:5","c23:4","c24:2","c27:9","c30:9","c32:2","c34:3","c37:7","c40:8","c42:5","c46:9","c48:1","c51:1","c54:5","c56:3","c58:6","c61:1","c64:2","c65:4","c68:6","c70:2","c74:7","c75:3","c76:4","c81:4","c82:7","c83:9","c84:6"];
var g09 = ["c01:2","c04:8","c05:3","c13:9","c14:4","c15:5","c16:8","c18:6","c21:4","c23:6","c27:1","c30:9","c34:6","c35:4","c36:8","c38:7","c41:3","c44:5","c47:9","c50:2","c52:8","c53:1","c54:3","c58:6","c61:9","c65:2","c67:4","c70:4","c72:7","c73:3","c74:6","c75:9","c83:7","c84:8","c87:9"];
var g010 = ["c00:8","c01:6","c02:9","c03:4","c05:5","c07:2","c10:1","c12:4","c16:8","c18:5","c21:3","c32:8","c34:1","c35:7","c38:3","c41:2","c42:1","c44:3","c46:6","c47:8","c50:6","c53:2","c54:8","c56:9","c67:9","c70:2","c72:6","c76:7","c78:3","c81:9","c83:4","c85:5","c86:8","c87:1","c88:6"];
var g011 = ["c00:3","c01:4","c03:2","c04:5","c11:5","c14:7","c16:1","c18:9","c21:7","c22:2","c24:8","c26:5","c27:3","c32:8","c35:3","c36:5","c38:4","c40:9","c48:2","c50:4","c52:7","c53:2","c56:8","c61:1","c62:5","c64:3","c66:8","c67:9","c70:2","c72:3","c74:9","c77:4","c84:2","c85:5","c87:6","c88:1"];
var g012 = ["c01:3","c02:4","c04:6","c06:7","c07:8","c10:1","c12:6","c13:2","c15:8","c20:7","c27:6","c28:9","c30:6","c31:9","c32:8","c34:7","c36:2","c43:9","c45:4","c52:2","c54:8","c56:3","c57:9","c58:1","c60:4","c61:1","c68:7","c73:8","c75:9","c76:5","c78:3","c81:5","c82:3","c84:1","c86:9","c87:4"];

// Easy game grids -
var g10 = ["c01:5","c04:2","c06:7","c07:6","c13:1","c14:6","c16:9","c18:4","c22:7","c27:2","c28:1","c32:1","c34:3","c35:9","c36:4","c38:5","c44:8","c50:8","c52:9","c53:6","c54:7","c56:2","c60:3","c61:4","c66:5","c70:7","c72:8","c74:1","c75:2","c81:5","c82:2","c84:3","c87:9"];
var g11 = ["c04:8","c07:2","c10:3","c12:6","c14:4","c15:9","c21:8","c25:1","c26:9","c27:3","c28:4","c30:1","c33:5","c36:8","c37:4","c40:2","c43:9","c45:8","c48:3","c51:7","c52:8","c55:2","c58:6","c60:4","c61:7","c62:1","c63:3","c67:9","c73:8","c74:9","c76:4","c78:7","c81:2","c84:1"];
var g12 = ["c03:8","c14:3","c15:4","c23:2","c26:8","c27:1","c28:5","c31:1","c33:9","c34:7","c36:3","c41:4","c44:8","c45:5","c48:9","c50:7","c51:8","c52:9","c53:3","c54:4","c55:6","c56:1","c57:5","c58:2","c67:4","c71:5","c74:1","c78:2","c81:2","c82:8","c86:6","c87:9"];
var g13 = ["c01:5","c03:8","c05:3","c07:9","c10:8","c11:2","c12:9","c13:5","c14:1","c15:6","c16:3","c18:4","c20:4","c22:3","c23:7","c25:9","c26:5","c32:2","c38:7","c40:4","c41:5","c45:1","c46:6","c48:2","c50:6","c55:7","c58:5","c62:5","c70:7","c74:4","c75:5","c82:8"];
var g14 = ["c00:5","c10:2","c11:4","c16:5","c17:8","c18:9","c21:7","c22:9","c30:3","c34:6","c36:7","c37:8","c40:7","c42:8","c43:3","c44:5","c45:4","c46:9","c47:1","c48:2","c51:4","c54:9","c55:8","c58:6","c61:1","c72:5","c73:8","c75:1","c77:7","c81:6","c83:2","c85:5"];
var g15 = ["c01:9","c03:2","c11:4","c14:9","c15:1","c16:5","c20:5","c21:6","c22:7","c25:8","c28:2","c37:8","c43:7","c44:6","c45:9","c48:4","c58:6","c60:1","c63:6","c64:5","c66:8","c67:3","c70:4","c71:7","c72:6","c74:2","c75:3","c77:1","c78:5","c80:8","c82:5","c83:1"];
var g16 = ["c03:5","c13:7","c14:6","c18:9","c23:8","c26:7","c27:1","c28:2","c36:9","c47:7","c48:2","c50:6","c51:2","c52:8","c58:5","c60:3","c62:8","c63:6","c68:1","c70:2","c71:9","c74:5","c77:3","c78:6","c80:5","c81:6","c82:7","c83:3","c85:1","c86:2","c87:4","c88:9"];
var g17 = ["c03:3","c13:5","c14:1","c15:9","c16:8","c18:6","c24:8","c30:5","c34:8","c36:7","c38:2","c43:9","c44:4","c46:1","c47:5","c54:7","c56:6","c60:8","c61:7","c64:5","c66:2","c67:1","c70:2","c71:9","c72:5","c73:6","c76:4","c77:8","c78:3","c81:6","c83:4","c86:5"];
var g18 = ["c01:7","c04:4","c05:8","c07:9","c10:9","c11:2","c12:1","c13:5","c14:6","c15:7","c16:3","c17:4","c20:3","c22:8","c25:2","c28:7","c35:5","c38:9","c43:2","c44:7","c45:3","c46:6","c47:1","c53:6","c55:9","c56:2","c62:2","c70:7","c77:9","c78:6","c80:1","c82:5"];
var g19 = ["c00:8","c01:9","c02:5","c05:2","c14:3","c20:1","c25:9","c30:9","c31:1","c32:8","c33:4","c34:5","c35:6","c37:2","c38:3","c40:7","c41:4","c43:3","c44:1","c46:8","c50:3","c52:6","c53:7","c58:1","c60:5","c61:7","c62:1","c67:3","c68:4","c77:6","c80:4","c82:2"];
var g110 = ["c00:7","c11:8","c12:2","c13:4","c20:3","c22:6","c23:7","c24:1","c25:2","c30:3","c40:5","c41:1","c50:8","c53:1","c54:2","c55:4","c60:4","c63:5","c65:7","c68:9","c71:6","c74:9","c76:1","c77:2","c80:9","c82:3","c83:2","c84:6","c85:1","c86:4","c87:5","c88:8"];

// Medium game grids -
var g20 = ["c00:4","c04:6","c08:9","c12:5","c14:7","c16:8","c20:1","c24:2","c28:3","c32:5","c34:3","c36:2","c40:6","c41:1","c44:2","c47:8","c48:3","c52:4","c54:5","c56:7","c60:6","c64:9","c68:1","c72:4","c74:5","c76:7","c80:9","c84:6","c88:8"];
var g21 = ["c02:8","c03:6","c08:4","c10:1","c11:5","c12:9","c15:4","c25:9","c27:2","c31:8","c32:3","c33:2","c35:1","c42:2","c44:8","c46:9","c53:7","c54:5","c56:2","c63:7","c72:3","c73:6","c77:2","c78:1","c80:5","c81:8","c82:6","c84:9","c88:3"];
var g22 = ["c00:4","c02:2","c04:3","c06:1","c10:9","c12:8","c18:2","c22:6","c25:9","c27:4","c31:6","c32:4","c36:7","c43:8","c45:4","c52:2","c56:4","c57:1","c61:1","c63:5","c66:2","c70:6","c76:5","c78:7","c82:4","c84:8","c86:6","c88:3"];
var g23 = ["c00:6","c01:7","c15:6","c17:2","c18:4","c20:1","c23:8","c24:5","c25:9","c28:6","c30:7","c32:9","c33:8","c36:1","c38:4","c40:1","c45:2","c47:8","c56:5","c57:7","c62:8","c64:9","c68:3","c70:4","c71:5","c75:3","c85:1","c86:2","c87:6"];
var g24 = ["c03:2","c14:6","c20:6","c21:8","c22:9","c23:3","c30:6","c31:8","c34:2","c37:5","c41:3","c42:7","c44:5","c45:6","c47:1","c51:9","c54:7","c55:1","c60:7","c66:3","c74:4","c75:3","c76:9","c83:1","c84:6","c86:4","c87:5","c88:8"];
var g25 = ["c00:8","c02:4","c04:3","c08:1","c12:9","c17:6","c20:1","c23:9","c26:4","c28:7","c31:1","c33:6","c34:5","c41:7","c42:3","c44:9","c47:2","c50:6","c52:2","c55:1","c58:4","c64:7","c65:9","c66:3","c67:8","c75:1","c85:5","c86:7"];
var g26 = ["c00:2","c01:3","c03:5","c06:6","c10:5","c14:8","c16:4","c21:9","c23:2","c25:4","c28:7","c30:7","c32:1","c37:4","c41:2","c46:7","c58:3","c60:4","c62:2","c65:8","c66:1","c67:7","c68:3","c71:6","c81:3","c82:8","c84:7","c88:2"];
var g27 = ["c03:4","c11:1","c14:8","c15:3","c16:7","c17:9","c22:8","c23:5","c24:9","c26:3","c32:5","c33:7","c35:4","c38:9","c40:8","c41:3","c44:2","c45:6","c51:1","c54:3","c56:4","c60:3","c70:1","c71:4","c78:7","c80:7","c86:1","c87:2"];
var g28 = ["c00:4","c04:9","c06:5","c07:7","c11:5","c12:2","c14:6","c18:8","c20:6","c22:7","c23:5","c25:1","c26:2","c33:8","c41:9","c42:1","c43:2","c45:5","c51:4","c52:2","c53:7","c58:8","c60:2","c76:3","c77:1","c78:6","c80:4","c82:5"];
var g29 = ["c01:3","c07:1","c12:4","c13:5","c15:2","c16:6","c18:3","c21:1","c22:5","c24:6","c27:4","c28:7","c30:8","c31:2","c32:9","c36:6","c37:7","c42:5","c46:2","c52:6","c55:3","c60:7","c61:5","c62:1","c67:8","c70:8","c77:7","c88:1"];
var g210 = ["c00:8","c05:9","c07:4","c13:4","c14:2","c16:6","c18:3","c23:5","c30:9","c33:6","c34:1","c35:8","c38:2","c42:8","c45:4","c46:1","c47:5","c51:4","c54:3","c56:9","c57:8","c61:6","c66:5","c68:4","c70:3","c72:5","c78:9","c86:1"];

// Hard game grids -
var g30 = ["c01:9","c03:2","c05:6","c08:1","c10:6","c13:1","c18:3","c27:4","c30:4","c32:5","c38:9","c41:7","c43:3","c45:5","c47:6","c50:6","c56:7","c58:8","c61:3","c70:2","c75:9","c78:8","c80:1","c83:8","c85:3","c87:2"];
var g31 = ["c02:6","c05:9","c06:8","c10:8","c14:7","c16:2","c17:3","c18:4","c20:4","c30:5","c35:7","c36:2","c37:1","c44:2","c51:2","c52:7","c53:6","c58:5","c68:8","c70:9","c71:4","c72:2","c74:6","c78:1","c82:6","c83:3","c86:7"];
var g32 = ["c01:1","c02:4","c07:5","c08:9","c10:3","c12:7","c14:1","c23:4","c26:8","c27:1","c30:5","c31:8","c36:7","c52:2","c57:5","c58:3","c61:3","c62:2","c65:7","c74:6","c76:1","c78:4","c80:6","c81:4","c86:3","c87:7"];
var g33 = ["c04:2","c07:5","c13:8","c15:7","c17:3","c18:9","c20:3","c25:6","c30:3","c33:6","c34:8","c36:1","c42:4","c46:7","c52:8","c54:7","c55:9","c58:3","c63:7","c68:4","c70:3","c71:7","c73:5","c75:1","c81:9","c84:6"];
var g34 = ["c00:3","c01:6","c06:9","c10:7","c14:3","c18:4","c20:9","c24:5","c28:1","c30:6","c34:8","c38:5","c40:5","c48:9","c50:3","c55:2","c57:6","c58:8","c62:8","c65:2","c70:2","c71:1","c72:7","c73:4","c77:9","c82:3"];
var g35 = ["c00:3","c02:6","c06:8","c10:4","c12:1","c13:9","c18:6","c20:8","c28:3","c34:4","c35:3","c36:1","c37:9","c51:9","c52:5","c53:2","c54:7","c60:2","c68:7","c70:5","c75:4","c76:6","c78:9","c82:4","c86:5","c88:1"];
var g36 = ["c01:9","c03:2","c05:6","c08:1","c10:6","c13:1","c18:3","c27:4","c30:4","c32:5","c38:9","c41:7","c43:3","c45:5","c47:6","c50:6","c56:7","c58:8","c61:3","c70:2","c75:9","c78:8","c80:1","c83:8","c85:3","c87:2"];
var g37 = ["c00:6","c02:9","c03:8","c07:4","c12:4","c15:3","c20:5","c27:8","c28:7","c37:7","c41:4","c42:6","c43:5","c45:1","c46:9","c47:8","c51:3","c60:4","c61:5","c68:6","c73:6","c76:4","c81:1","c85:5","c86:9","c88:3"];
var g38 = ["c05:8","c06:4","c11:1","c13:2","c16:8","c21:8","c24:7","c26:6","c30:2","c33:8","c37:6","c40:7","c43:1","c45:4","c48:5","c51:6","c55:5","c58:7","c62:3","c64:5","c67:9","c72:2","c75:7","c77:3","c82:6","c83:4"];
var g39 = ["c01:3","c02:4","c04:9","c15:6","c16:9","c21:6","c22:7","c23:1","c30:6","c32:1","c33:3","c37:2","c40:2","c44:7","c48:3","c51:8","c55:6","c56:4","c58:1","c65:6","c66:2","c67:5","c72:2","c73:4","c84:7","c86:8","c87:3"];
var g310 = ["c03:2","c04:9","c11:1","c13:4","c17:8","c20:5","c21:2","c22:4","c23:8","c30:8","c32:4","c34:5","c36:6","c52:6","c54:9","c56:3","c58:5","c65:3","c66:1","c67:6","c68:8","c71:2","c75:1","c77:3","c84:7","c85:9"];
var g311 = ["c01:7","c02:5","c03:1","c06:9","c11:8","c12:9","c14:7","c15:4","c23:3","c30:3","c34:9","c38:4","c40:7","c48:8","c50:5","c54:6","c58:1","c65:7","c73:6","c74:4","c76:9","c77:1","c82:5","c85:8","c86:6","c87:4"];

// Expert game grids -
var g40 = ["c00:1","c01:5","c04:8","c11:4","c15:9","c27:8","c28:1","c31:3","c35:2","c43:7","c44:5","c45:8","c53:6","c57:5","c60:7","c61:6","c64:9","c71:1","c73:5","c77:3","c84:7","c87:2","c88:8"];
var g41 = ["c03:1","c08:4","c12:4","c14:3","c18:6","c20:7","c21:5","c25:8","c37:8","c38:9","c42:5","c50:2","c51:6","c57:4","c63:7","c67:5","c68:2","c70:5","c74:4","c76:9","c80:1","c85:9"];
var g42 = ["c03:5","c05:3","c08:9","c10:8","c14:4","c16:5","c18:1","c28:4","c30:9","c33:2","c34:5","c40:1","c48:6","c54:7","c55:3","c58:8","c60:1","c70:9","c72:8","c74:1","c78:3","c80:7","c83:9","c85:6"];
var g43 = ["c01:5","c04:6","c06:9","c10:7","c14:5","c17:6","c22:6","c24:1","c27:7","c30:6","c36:3","c43:9","c44:4","c45:8","c52:5","c58:1","c61:9","c64:1","c66:5","c71:2","c74:3","c78:6","c82:4","c84:9","c87:8"];
var g44 = ["c02:7","c08:4","c11:3","c13:5","c17:2","c26:1","c28:7","c31:8","c37:9","c43:2","c44:1","c45:8","c51:4","c56:2","c57:1","c60:1","c62:5","c73:8","c75:3","c77:9","c80:7","c86:4"];
var g45 = ["c00:2","c02:1","c04:7","c14:5","c15:9","c16:4","c22:3","c25:1","c34:3","c37:5","c41:9","c43:7","c45:6","c47:8","c51:6","c54:4","c63:7","c66:6","c72:8","c73:9","c74:2","c84:3","c86:2","c88:9"];
var g46 = ["c00:5","c13:7","c14:6","c15:9","c21:7","c22:4","c24:5","c25:1","c30:2","c32:9","c33:4","c42:7","c44:8","c46:1","c55:9","c56:3","c58:6","c64:2","c66:8","c67:1","c73:8","c74:7","c75:1","c88:3"];
var g47 = ["c04:7","c05:6","c06:3","c08:8","c18:9","c25:5","c27:4","c28:2","c31:8","c33:5","c38:9","c40:7","c45:3","c46:2","c48:4","c51:1","c56:5","c63:2","c64:6","c68:4","c78:5","c83:8","c87:6","c88:3"];
var g48 = ["c01:7","c07:1","c12:3","c13:4","c17:7","c18:2","c27:6","c35:9","c38:4","c45:7","c46:9","c48:1","c51:2","c53:3","c54:5","c58:8","c64:2","c70:2","c75:9","c77:5","c81:8","c85:7","c87:4"];
var g49 = ["c01:4","c02:7","c03:2","c07:9","c10:9","c13:1","c17:6","c20:3","c27:8","c32:8","c33:5","c37:6","c38:2","c47:5","c50:9","c57:1","c61:3","c62:4","c63:6","c77:7","c80:2","c84:4","c86:8","c87:9"];
var g410 = ["c00:5","c08:9","c10:4","c17:5","c18:8","c22:3","c28:2","c32:3","c35:6","c37:1","c41:7","c42:9","c43:5","c47:3","c50:8","c58:5","c65:8","c66:4","c67:7","c72:2","c73:1","c74:6","c88:9"];

// Load of game grids into their respective gameStore level -
game0Store = [g00,g01,g02,g03,g04,g05,g06,g07,g08,g09,g010,g011,g012];
game1Store = [g10,g11,g12,g13,g14,g15,g16,g17,g18,g19,g110];
game2Store = [g20,g21,g22,g23,g24,g25,g26,g27,g28,g29,g210];
game3Store = [g30,g31,g32,g33,g34,g35,g36,g37,g38,g39,g310,g311];
game4Store = [g40,g41,g42,g43,g44,g45,g46,g47,g48,g49,g410];

// Finally, the source of all games for this demo -
gameStore = [game0Store, game1Store, game2Store, game3Store, game4Store];
