/*!
 * JavaScript file: game.js
 * - responsible for game grid loading;  associated with <div id="game-btns">
 *
 * - will initially hold demo game arrays in gameStore
 * - will handle ajax calls to the MySQL db in future.
 *
 * Date: 2013-11-30
 *
 * TODO: eliminate experimental js
 * TODO: eliminate console.log() [grep files]
 * TODO: make <input> disabled a preference
 *
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

        console.log("keyboardEnabled: " + keyboardEnabled);

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
//        gameLoad( eval(gameIdCurrent + 1) );
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
    console.log("Drop-down-changed value:" + value);
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
    console.log( "gameLoad - gameId:" + gameId);

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
    gameIdCurrent = eval( gameLevel + lastIndex[gameNdx] );
    $("#game-caption").text(gameLevelNm + " Game: " + gameIdCurrent);

    // now save the current game in localStorage (if available) for reload next time -
    // - if no localStorage, don't mention it, just move on -
    if (hasLocalStorage()) {
        localStorage.SudoSudokuGameId = gameIdCurrent;
    }

    console.log( "levelLen:" + levelLen );
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

    console.log( "lastNdx - in:" + lastNdx);
    // check if we have any game referenced -
    if (!lastNdx || (lastNdx < 0)) {
        // no valid lastNdx passed - go with default based on lastIndex global -
        // - warning: do the next two lines separately - otherwise, assignment happens before increment!!!
        lastIndex[ gameNdx ]++;
        lastNdx = lastIndex[ gameNdx ];
        console.log("Dropped In - no lastNdx");
    }
    console.log( "GameNdx: " + gameNdx + " lastNdx-raw: " + lastNdx + ":" + lastIndex );

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
        // revert back to first index -
        lastIndex[ gameNdx ] = 0;

    }else {
        lastIndex[ gameNdx ] = lastNdx;
    }

    console.log( "GameNdx: " + gameNdx + " maxNdx:" + maxNdx + " lastNdx: " + lastNdx + " : " + lastIndex );

    return gameNdx;
}

/****************************************************************************************************
 * gameClear() - clears the grid for game reset or new game reload.
 * -
 */
function gameClear() {

    var inputMode = getInputMode();
    var $inputCells = $([]);

    if (inputMode == "input") {
        $inputCells = $(".cell.input");
        $inputCells.removeClass("selected");
        $("> input", $inputCells).val('').prop("readonly",false).prop("disabled",false).removeClass("valid invalid current");

    } else {
        $inputCells = $(".cell.noinput");
        $inputCells.text('').removeClass("valid invalid current selected readonly");
    }
    console.log( "noinput: " + inputMode);
}

/****************************************************************************************************
 * gamePause() - hides game cell entries and halts the timer.
 * - TODO: just not yet
 */
function gamePause() {

}

/****************************************************************************************************
 * gameSave() - saves a user game to localStorage.
 * - checks existence of localStorage on current browser
 * - serializes the game grid to local storage
 */
function gameSave() {

    if (!hasLocalStorage()) {
        alert("Game cannot be saved.  The game requires browser supported local storage that is not supported by your current browser.")
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
 * - this should coordinate ajax calls to the db, however due to time constraints -
 * - several demo games are pre-loaded into arrays.
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
var game0Store = [];
var game1Store = [];
var game2Store = [];
var game3Store = [];
var game4Store = [];

var g00 = ["c03:2","c04:4","c05:1","c06:8","c07:3","c10:4","c12:2","c16:5","c20:6","c23:5","c25:7","c27:4","c28:1","c32:4","c37:5","c41:8","c42:1","c43:9","c45:5","c46:3","c47:4","c51:2","c56:8","c60:6","c61:9","c63:4","c65:5","c68:3","c72:7","c76:2","c78:4","c81:3","c82:2","c83:7","c84:1","c85:6"];


var g30 = ["c01:9","c03:2","c05:6","c08:1","c10:6","c13:1","c18:3","c27:4","c30:4","c32:5","c38:9","c41:7","c43:3","c45:5","c47:6","c50:6","c56:7","c58:8","c61:3","c70:2","c75:9","c78:8","c80:1","c83:8","c85:3","c87:2"]

game0Store = [g00];

game3Store = [g30];

gameStore = [game0Store, game1Store, game2Store, game3Store, game4Store];
