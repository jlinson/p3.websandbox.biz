/*!
 * JavaScript file: preferences.js
 * - responsible for preferences processing and loading;  associated with <div id="sidebar">
 *
 * Date: 2013-11-30
 *
 * requires: game.js -->  hasLocalStorage()
 */

var useKeyboard = true;  // html default
/**************************************************************************************************
 * This event captures any URL parameters for game load direction -
 */
$( document ).ready( function() {

    if (hasLocalStorage()) {
        // check local storage for preferences settings -
        var keyboardEnabled = localStorage.SudoSudokuKeyboardEnabled;
        if (keyboardEnabled == "false") {
            // uncheck the keyboard entry checkbox -
            $("input[name='keyboard']").prop( "checked", false );
            useKeyboard = false;

        } else {
            // leave default 'checked' setting -
            localStorage.SudoSudokuKeyboardEnabled = "true";
            useKeyboard = true;
        }
    }
});

/***************************************************************************************************
 * hasLocalStorage() - simple check for existence of localStorage for current browser -
 * @return boolean
 */
//function hasLocalStorage() {
//
//    return (typeof(localStorage) !== "undefined");
//}

// **************************************************************************************************
// Button click listeners -

$("button[name='pref-apply']").click( function() {

    checkStatus = $("input[name='keyboard']").prop( "checked" );

    if (checkStatus != useKeyboard) {
        var confirmYes = confirm( "Changing keyboard support requires reloading the game?  Are you sure you want to reset the game?" );

        var storageYes = true;
        var hasStorage = hasLocalStorage();

        if (!hasStorage) {
            storageYes = confirm( "Your browser does not support local storage.  Preference changes will only apply until next page refresh.")
        }

        if (confirmYes && storageYes) {
            if (checkStatus) {
                // just reload the page - "checked" is default - useKeyboard = true is default -
                if (hasStorage) {
                    localStorage.SudoSudokuKeyboardEnabled = "true";
                }
                location.reload();

            } else {
                // remove the text inputs (only in #grid), change .cell.input classes and reset -
                $( "input[type='text']").remove();
                $( ".cell.input").removeClass( "input" ).addClass( "noinput" );

                if (hasStorage) {
                    localStorage.SudoSudokuKeyboardEnabled = "false";
                }
                useKeyboard = false;
                $("button[name='reset']").click();
                $("input[type='checkbox']").change();
            }
        }

    } else {
        alert("No preference changes to be applied.")
    }
});

$("input[type='checkbox']").change( function() {

        // toggle the apply based on checked status -
        checkStatus = $("input[name='keyboard']").prop( "checked" );

        if (checkStatus != useKeyboard) {
            // change registered - enable Apply -
            $("button[name='pref-apply']").prop( "disabled", false );

        } else {
            // change unregistered - disable Apply -
            $("button[name='pref-apply']").prop( "disabled", true );
        }
});
