/*!
 * JavaScript file: grid.js
 * - responsible for handling input to sudoku grid; associated with <div id="game">
 *
 * Date: 2013-11-18
 *
 * Class tag logic used throughout this script (coordinated with index.php view html and grid.css):
 * .input - div.cell with child <input> element that will hold .val() input
 * .noinput - div.cell with no child <input> element that will hold .text() input
 * .pickem - div.cell with numbers to be clicked/touched to input into grid div.cells
 * .selected - single cell that has grid focus (not necessarily same as browser / OS focus)
 * .current - all cells with numbers matching the .selected number get this tag
 * .valid - all cells with numbers that pass input evaluation  (all .readonly values start as .valid)
 * .invalid - all cells with numbers that fail input evaluation
 * .readonly - all cells with values set programmatically by the initial game grid load
 *           (.readonly added as class to div.cell and as html property to <input>s if present)
 *
 * Note: All entries must be .valid or .invalid (or blank cell / neither class == no entry).
 *       Cells may also be .selected, .current and .readonly.
 *       Game is won when all 81 cells are .valid!
 *
 * Ids required by this js:
 * #c00 - for all 'c'ells where first number indicates the 0 indexed 3x3 block
 *        and the second number indicates the 0 indexed cell within the block
 * #t1 - for the 't'racker numbers that are picked for input into the grid cells
 *
 * TODO: eliminate experimental js
 * TODO: eliminate console.log() [grep files]
 * TODO: try the js.ValidationEngine
 */

/**************************************************************************************************
 * This event required to ensure square #game #grid in the event of dynamic #page resizing
 */
$( document ).ready( function() {

    // square-up the grid based on the loaded width -
    var grid = $('#grid');
    var gw = grid.width();
    grid.css({'height': gw + 'px' });
    console.log( '#grid width: ' + gw );

});

// **************************************************************************************************
// Common functions:

var undoStack = [];
/********************************************************************************************
 * undoPush() concatenates the cellId and value and controls the Undo button
 * - jQuery note: use .prop(), NOT .attr() to set disabled - jbl
 * @param cellId
 * @param value
 */
function undoPush( cellId, value) {

    if (!cellId) {
        // trap invalid call
        return;
    }
    if (!value) {
        value = '';
    }
    var i = undoStack.push(cellId + ':' + value);
    $("button[name=undo]").prop("disabled", false);
    console.log("undoPush: i:" + i + " cellId:" + cellId + " value:" + value);
}

/********************************************************************************************
 * undoPop() returns the last cellId and value in array and controls the Undo button
 * - since undoPush 'strings' the input, undoPop 'unstrings' the output.
 * - jQuery note: use .prop(), NOT .attr() to set disabled - jbl
 */
function undoPop() {

    var lastDo = [];
    if (undoStack.length > 0) {
        // check if this is last item and return the pop();
        if (undoStack.length == 1) {
            $("button[name=undo]").prop("disabled", true);
        }
        var i = undoStack.pop();
        lastDo = i.split(":");
    }
    console.log("undoPop: cellId:" + lastDo[0] + " value:" + lastDo[1] );
    return lastDo;
}

/****************************************************************************************************
 * setSelected() - sets a number (from #Tracker [t], Undo [u] or Erase [e]) into the 'selected' grid div.cell
 * - coordinate with the .cell 'click' and on('focusin') listeners below
 * @param pickId
 */
function setSelected( pickId ) {

    if (typeof pickId !== 'undefined' && pickId !== null) {
        var caller = pickId.substr(0,1);
        var num = pickId.substr(1,1);

        var selected = getSelected();
        if (caller != "u") {
            // ignore the undo - don't undo the undo; push all others
            undoPush( selected[3], selected[0] );
        }
        if (selected[1] == "noinput") {
            selected[2].text(num);
        } else {
            selected[2].val(num);
            selected[2].focus();
        }
    // Add new number to end of array to pass prior [0] and new [4] values
    selected[selected.length] = num;
    tagCurrent( selected[0], selected[1], num );
    evalInput( selected[0], num, selected[3] );
   }
}

/****************************************************************************************************
 * getSelected() - gets the value from the 'selected' grid div.cell
 * - this is only necessary to handle the different methods of getting an "input" value vs. "noinput" value.
 * - this also passes back the jQuery selector based on "input" vs "noinput".
 * - example of jQuery result caching and child '>' selector.
 *  @return selected [0] == value, [1] == input class, [2] == jQuery reference, [3] == attr("id")
 */
function getSelected() {

    var $jquerySelected = $('.selected');
    var selected = [];
    if ($jquerySelected.hasClass("noinput")) {
        selected = [$jquerySelected.text(), "noinput", $jquerySelected, $jquerySelected.attr("id")];
    } else {
        var $inputSelected = $('> input', $jquerySelected);
        selected = [$inputSelected.val(), "input", $inputSelected, $jquerySelected.attr("id")];
    }
    return selected;
}

/********************************************************************************************
 * tagCurrent() - tags all numbers matching the current number with class .current
 * - relies on css to style the numbers to hilite (or not, depending on user preference) all matching numbers.
 * - this does not flag errors; that is done by evalInput after all matching numbers are tagged.
 * @param oldValue    - selected[0]
 * @param inputClass  - selected[1]
 * @param newValue
 *
 *   [0] == oldValue  [1] == input class  [2] == jQuery reference  [3] == attr("id")  [4] == newValue
 *   - only [0] and [1] are required for this f(n); depends on caller.
 */
function tagCurrent( oldValue, inputClass, newValue ) {

    var num = oldValue;
    if (newValue) {
        // means we have a new value set by setSelected()
        num = newValue;
    }
    $(".current").removeClass("current");
    // Only re-tag 'current' for non-blank numbers (click can toggle-off selected in noinput mode).
    if (num) {
        $(".cell:contains('" + num + "')").addClass("current"); // works for .cell, but NOT for <input>
        if (inputClass == "input") {
            // input value (property, not attribute) needs to be selected this way -
            $("input").filter(function() {
                return this.value == num;
            }).addClass("current");
        }
    }
}

/********************************************************************************************
 * evalInput() - flags violations of the game rule and tags cells in violation as .invalid; otherwise .valid
 * - only looks at .current numbers to determine new conflicts because only new entry will create conflict.
 * - must re-evaluate .invalid numbers to see if changes or erasers have eliminated conflicts.
 * - relies on css to style the numbers in conflict.
 * @param oldValue     - selected[0]
 * @param newValue
 * @param cellId       - selected[3]
 */
function evalInput( oldValue, newValue, cellId ) {

    var invalidFlag = 0;
    var validCnt = 0;

    var itemClass = $("#" + cellId).attr("class");

    var inputMode = "";
    // warning: javascript sees -1 as true! (go figure); 0, null, undefined are all false (as expected).
    if (itemClass.indexOf('noinput') > -1) {
        inputMode = "noinput";
    } else {
        inputMode = "input";
    }

    /* newValue validation - is the new number valid  */
    // Validate the number within the .block (check within block ID) -
    var blockId = "#b" + cellId.substr(1,1);
    var blockMatchCnt = validateCell( inputMode, blockId, newValue, invalidFlag );
    if (blockMatchCnt > 1) {
        invalidFlag ++;
    }

    // Validate the number within the row -
    var rowSelector = "." + itemClass.substr( itemClass.indexOf("row"), 4 );
    var rowMatchCnt = validateCell( inputMode, rowSelector, newValue, invalidFlag );
    if (rowMatchCnt > 1) {
        invalidFlag ++;
    }

    // Validate the number within the column -
    var colSelector = "." + itemClass.substr( itemClass.indexOf("col"), 4 );
    var colMatchCnt = validateCell( inputMode, colSelector, newValue, invalidFlag );
    if (colMatchCnt > 1) {
        invalidFlag ++;
    }

    /* oldValues validation - check if replacing old with new made these associated cell entries now valid */
    // - only need to check if we had a non-blank, non-zero, not undefined old value -
    if (oldValue) {

        // find the cells that matched the old value by block, by row and by column -
        // - NOTE: this only works by setting the $matchResult.add() results back into the #matchResult (as written)
        // Block matches -
        var $matchResult = getMatchCells( inputMode, blockId, oldValue );
        // Row matches -
        $matchResult = $matchResult.add( getMatchCells( inputMode, rowSelector, oldValue) );
        // Col matches -
        $matchResult = $matchResult.add( getMatchCells( inputMode, colSelector, oldValue) );

        if ($matchResult.length > 0) {
            // iterate and recurse back to evalInput on each match - pass oldValue as newValue for recursive call;
            $matchResult.each( function() {
                if (inputMode = "input") {
                    evalInput( 0, oldValue, $(this).parent().attr("id"));
                } else {
                    evalInput( 0, oldValue, $(this).attr("id"));
                }
            });
        }
    }

    if (!invalidFlag) {
        validCnt = $(".valid").length;

        if (validCnt == 81) {
            alert("Congratulations - Sudoku Solved!");
        }
        console.log( "validCnt: " + validCnt );
    }
}

/********************************************************************************************
 * validateCell() - called by evalInput() to check for cell matches and flag conflicts
 * - only looks at a block, a row or a column per call (based on jQuery selector passed.
 * @param inputClass  - either "input" or "noinput"
 * @param selector  - jQuery selector for block, row or column
 * @param value  - number to check for conflicts
 * @param alreadyInvalid - indicates whether 'selected' cell has already failed a block, row or column test
 *                  - otherwise, cell may fail a block test, but pass a row or column test; one invalid = 'invalid'
 *
 * @return matchCnt  - number of matching numbers; 1 == .valid and >1 == .invalid (i.e. conflict)
 */
function validateCell( inputClass, selector, value, alreadyInvalid ) {

    var matchCnt = 0;

    var $matchResult = getMatchCells( inputClass, selector, value );

    if (value) {
        // only check matches if non-zero, non-blank, not undefined value
        matchCnt = $matchResult.length;
    }

    if (matchCnt > 1) {
        // have multiple numbers in block, row or column (depending on selector) -
        $matchResult.removeClass("valid").addClass("invalid");

    } else if (matchCnt == 0) {
        // indicates blank cell - blank cells are neither valid or invalid -
        $matchResult.removeClass("valid invalid");

    } else if (!alreadyInvalid) {
        // new entry has no block, row or column conflicts => valid entry
        $matchResult.removeClass("invalid").addClass("valid");
    }

    return matchCnt;
}

/********************************************************************************************
 * getMatchCells() - called by evalInput() and validateCell() to get jQuery cell matches
 * - only looks at a block, a row or a column per call (based on jQuery selector passed.)
 * @param inputClass  - either "input" or "noinput"
 * @param selector  - jQuery selector for block, row or column
 * @param value  - number to check for conflicts
 *
 * @return $matchResult  - returns jQuery result object
 */
function getMatchCells( inputClass, selector, value ) {

    // declare empty jQuery object -
    var $matchResult = $([]);

    if (inputClass == "input") {
        // default keyboard input mode -
        $matchResult = $(":input", selector).filter(function() {
                                return this.value == value;
                            })
    } else {
        // user-selected (or device-limitation-selected) "noinput" mode -
        $matchResult = $(selector + ":contains('" + value + "')");
    }

    return $matchResult;
}

// **************************************************************************************************
// Event listeners:
/****************************************************************************************************
 * "input" class listener - used to limit inputs to integers 1 through 9
 *  - this does NOT prevent pasting of invalid values; capturing .click() doesn't solve this (paste is not a click).
 *  - chrome does NOT fire this with tab, shift, ctrl, etc., BUT FIREFOX DOES (must ignore to allow those keys in Firefox).
 *  - eliminating <input type="text"> and using "noinput" class eliminates need for "input" listener
 *
 *  Note this: http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
 */

// using keyup - this fires and logs value even when value doesn't change
// - $(this).val() - only get PRIOR value, and only if highlighted and changed (blanked and re-type yields blank)
// - NEED old and new values to keep event from logging new value just pressing keys with no change!!!
// - also keyup fires even when toggling away from window (i.e. any keyup will fire this while input has focus).
var oldValue = "";
var newValue = "";
var selectInfo = [];
$("input[type='text']").on({
    "keypress": function (e) {

        // using both keyCode and which due to browser variations - jbl
        var key_code = e.keyCode || e.which;
        console.log(" key_code:" + key_code);
        if (key_code == 9) {
            // allow tab key
            return true;
        } else {
            return !(String.fromCharCode(key_code).match(/[^1-9]/g));
        }
    },
    "keyup": function(e) {

        newValue = $(this).val();
        if (oldValue != newValue) {

            //Push the 'undo' info onto the undo stack -
            undoPush($(this).parent().attr("id"), oldValue);

            //Tag the new number entry (similar to setSelected called by .pickem click) -
            tagCurrent( oldValue, "input", newValue );
            evalInput( oldValue, newValue, $(this).parent().attr("id") );

            //Finally, recognize that newValue is the new oldValue -
            oldValue = newValue;
        }
    },
    "focusout": function() {
        //oldValue = "";
        //newValue = "";
        console.log( "on.focusout: " + $(this).parent().attr("id") + $(this).attr("name") + ": " + "old:" + oldValue + " new:" + newValue );
    },
    "change": function() {

        var value = $( this ).val();
        console.log( "on.change: " + value);
    }
});
// - change only fires when the input loses focus (by tab or click)
// - but, this does only fire on changes

// NOTE: blur fires after on.focusout!!!
// - warning: on.focusout fires event when a button is clicked, even though "selected" cell unchanged.
// - just toggling window will cause focusout (and keyup) to fire - tie oldValue / newValue resets to on.focusin

/****************************************************************************************************
 * div.cell.input class 'focusin' listener -
 *  - used to provide tab key 'select' capability.
 *  - coordinate with the div.cell 'click' listener 'select'er below.
 *  - required with <input type="text">; unnecessary if using "noinput" class.
 */
$('.cell').on('focusin', function() {

    var htmlClass = '';
    if ($(this).hasClass("selected")) {
        // do nothing
    } else {
        // clear any other "selected" and add to tabbed-in
        if ($(this).hasClass("input")) {
            htmlClass = "input";
            oldValue = $("> input", this).val();

        } else {
            htmlClass = "noinput";
            oldValue = $(this).text();
        }
        newValue = "";
        $(".selected").removeClass("selected");
        $(this).addClass('selected');
        // Now flag all the matching (currrent) values -
        tagCurrent( oldValue, htmlClass, newValue );
    }
    console.log( "on.focusin: " + $(this).parent().attr("id") + $(this).attr("name") + ": " + "old:" + oldValue + " new:" + newValue );
});

/****************************************************************************************************
 * div.cell.noinput and div.cell.pickem class click listener -
 *  - used to allow mouse-click or touch-screen to 'select' a div.cell.input/.noinput,
 *  - then a clicked number in div.cell.pickem can be placed in the 'selected' cell.
 *  - requires .css to style div.selected (to actually show highlight, etc.)
 *  - eliminate <input type="text"> and use "noinput" class to toggle into this mode exclusively.
 */
$(".cell").click( function() {

    var htmlClass = '';
    if ($(this).hasClass("input")) {
        // select cell contents (like tab), then let 'focusin' handle the rest
        // - don't toggle "selected" if keyboard focus is there.
        // - REMEMBER THIS: syntax below provides click-in select, same as tabbing into input.
        $("> input", this).select();

    } else if ($(this).hasClass("noinput")) {
        htmlClass = "noinput";
        if ($(this).hasClass("selected")) {
            // toggle off the selection
            $(this).removeClass("selected");
            oldValue = '';
        } else {
            // clear any other "selected" and add to clicked
            $(".selected").removeClass("selected");
            $(this).addClass('selected');
            oldValue = $(this).text();
        }
        // Now flag all the matching (currrent) values -
        tagCurrent( oldValue, htmlClass, 0 );

    } else if ($(this).hasClass("pickem")) {
        // pickem id's all start with "t" == "tracker"
        var id = $(this).attr("id");
        setSelected(id);
    }
    console.log( "Cell clicked: " + $(this).attr("id"));
});

// **************************************************************************************************
// Button click listeners -

$("button[name=undo]").click( function() {

    var lastChange = undoPop();
    if (lastChange.length == 0) {
        // message the user - but Undo button should have been disabled by undoPop()
        alert("Nothing to Undo");
    } else {
        // undo last number entry - note: not necessarily the last keystroke (e.g. doesn't undo 'tab', et.)
        var lastChangeId = $("#" + lastChange[0]);
        if (lastChangeId.hasClass("selected")) {
            // just call the setSelected()
        } else {
            // clear any other "selected" and add to cell to undo
            $(".selected").removeClass("selected");
            lastChangeId.addClass('selected');
        }
        // flag the undo caller with prefix "u" -
        setSelected('u' + lastChange[1]);
    }
});

$("button[name=note]").click( function() {

    $("#no-input").toggle();
});

$("button[name=erase]").click( function()
{
    // just pass a single char to setSelected - "e" indicates "erase" called it -
    // - don't bother erasing an empty cell (TODO: Erase is not 'disabled')
    var selected = getSelected();
    if (selected[0]) {
        setSelected('e');
    }
});

