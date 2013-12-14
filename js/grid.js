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
 * Note: All entries must be .valid or .invalid (or neither for blank cell == no entry).
 *       Cells may also be .selected, .current and .readonly.
 *       Game is won when all 81 cells are .valid!
 *
 * Ids required by this js:
 * #c00 - for all 'c'ells where first number indicates the 0-indexed 3x3 block
 *        and the second number indicates the 0-indexed cell within the block
 * #t1 - for the 't'racker numbers that are picked for input into the grid cells
 *
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
    return lastDo;
}

/*****************************************************************************************************************
 * setSelectedValue() - sets a number (from #Tracker [t], Undo [u] or Erase [e]) into the 'selected' grid div.cell
 * - coordinate with the .cell 'click' and on('focusin') listeners below
 * @param pickId
 */
function setSelectedValue( pickId ) {

    if (typeof pickId !== 'undefined' && pickId !== null) {
        var caller = pickId.substr(0,1);
        var newNum = pickId.substr(1,1);
        var readonly = false;

        // Get the existing '.selected' cell info (including oldValue) -
        var selected = getSelected();

        // Set the changes into the appropriate element -
        if (selected[1] == "noinput") {
            // check for .readonly - indicates original game grid cell that cannot change -
            if (selected[2].hasClass("readonly")) {
                alert("Starting game value - cannot be changed.");
                readonly = true;
            } else {
                selected[2].text(newNum);
            }
        } else {
            // input mode - no need to check for readonly - automatically enforced by element property -
            selected[2].val(newNum);
            selected[2].focus();
        }

        // If 'readonly' - we've cancelled the change, so skip the remaining steps - otherwise proceed -
        if (!readonly) {

            // Push non-undo requested changes onto the undo stack -
            if (caller != "u") {
                // ignore the undo calls - don't undo the undo; push all others
                undoPush( selected[3], selected[0] );
            }

            // If we have a non-empty value that is not 'readonly', then enable 'erase' button -
            if (newNum) {
                toggleErase( true );
            } else {
                toggleErase( false );
            }
            // Pass new number to tag 'current number' cells (or un-tag if no number) -
            // - call tagCurrent even if newNum == '' (handled by tagCurrent un-tag)
            tagCurrent( newNum, selected[1] );

            // Finally, check the new input for conflicts -
            evalInput( selected[0], newNum, selected[3] );
        }
    }
}

/***********************************************************************************************************
 * setSelected() - sets the 'selected' class into the referenced grid div.cell
 * - this consolidates code to handle the different methods of setting an "input" value vs. "noinput" value.
 * - this also sets the 'erase' button disabled state.
 * @param $jqObject  - jQuery reference object to currently selected cell to be tagged
 * @param inputClass  - "input" or "noinput"
 * @param goTag      - boolean flag to confirm to call tagCurrent()
 */
function setSelected( $jqObject, inputClass, goTag ) {

    var selectedValue = '';
    var readonly = false;

    var cellId = "#" + $jqObject.prop( "id" );

    if ($jqObject.hasClass("selected")) {

        if (inputClass == "noinput") {
            // toggle off the selection - only available in "noinput" mode
            $jqObject.removeClass("selected");
            selectedValue = '';
            readonly = true;  // nothing to erase - so force this

        } else {
            // input already selected - no toggle - no tag - (confirm current value)
            goTag = false;
            selectedValue = $("> input", cellId).val();
            readonly = $("> input", cellId).prop( "readonly" );
        }

    } else {
        // clear any other "selected" and add to passed-in object -
        $(".selected").removeClass("selected");
        $jqObject.addClass("selected");

        if (inputClass == "input") {
            // get the current value of the selected cell > input -
            selectedValue = $("> input", cellId).val();
            readonly = $("> input", cellId).prop( "readonly" );

        } else {
            // get the current value of the selected cell -
            selectedValue = $jqObject.text().trim();   // see getSelected() re: .trim()
            readonly = $jqObject.hasClass( "readonly" );
        }
    }

    // If we have a non-empty value that is not 'readonly', then enable 'erase' button -
    if (selectedValue && !(readonly)) {
        toggleErase( true );
    } else {
        toggleErase( false );
    }

    if (goTag) {
        // Now flag all the matching (current) values -
        tagCurrent( selectedValue, inputClass );
    }
    return selectedValue;
}

/*************************************************************************************************************
 * toggleErase() - common logic to toggle the 'erase' button (called from setSelected() and setSelectedValue()
 * - reverse the std logic here - 'true' enables 'erase' by setting 'disabled' to 'false
 * @param eraseState  - boolean
 */
function toggleErase( eraseState ) {

    $("button[name='erase']").prop("disabled", !(eraseState));

}

/*************************************************************************************************************
 * getSelected() - gets array of info from the 'selected' #grid div.cell
 * - this is only necessary to handle the different methods of getting an "input" value vs. "noinput" value.
 * - this also passes back the jQuery selector based on "input" vs "noinput".
 * - example of jQuery result caching and child '>' selector.
 *
 * @return selected [0] == value, [1] == input class, [2] == jQuery reference, [3] == attr("id")
 */
function getSelected() {

    var $jqSelected = $('.selected');
    var selected = [];

    if ($jqSelected.hasClass("noinput")) {
        // note: .text() does not trim; was found to require trim() to avoid extraneous "empty" chars -
        selected = [$jqSelected.text().trim(), "noinput", $jqSelected, $jqSelected.attr("id")];

    } else {
        var $inputSelected = $('> input', $jqSelected);
        // note: .val() trims leading & trailing spaces & reduces multiple spaces between chars to a single space -
        selected = [$inputSelected.val(), "input", $inputSelected, $jqSelected.attr("id")];
    }
    return selected;
}

/************************************************************************************************************
 * tagCurrent() - tags all numbers matching the current .selected number with class .current
 * - relies on css to style the numbers to hilite (or not, depending on user preference) all matching numbers.
 * - this does not flag errors; that is done by evalInput after all matching numbers are tagged.
 * @param currentValue
 * @param inputClass  - selected[1]
 */
function tagCurrent( currentValue, inputClass ) {

    // Just start with a clean reset to keep things simple -
    $(".current").removeClass("current");

    // Only re-tag 'current' for non-blank numbers (click can toggle-off selected in noinput mode).
    // - issue: empty num passes several if test; >= && <= is best filter found - jbl
    if (currentValue >= 1 && currentValue <= 9) {

        // This works for .cell, but NOT for <input>
        // - need this even on "input" mode to properly tag #tracker .cells -
        $(".cell:contains('" + currentValue + "')").addClass("current");

        if (inputClass == "input") {
            // input value (property, not attribute) needs to be selected this way -
            $("input").filter(function() {
                return this.value == currentValue;
            }).addClass("current");
        }
    }
}

/************************************************************************************************************
 * evalInput() - flags violations of the game rules and calls validateCell() to tag cells in violation as .invalid or .valid
 * - only looks at .current numbers to determine new conflicts because only new entry will create conflict.
 * - must re-evaluate .invalid numbers (recursive call) to see if changes or erasers have eliminated conflicts.
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
    var blockMatchCnt = validateCell( inputMode, cellId, blockId, newValue, invalidFlag );
    if (blockMatchCnt > 1) {
        invalidFlag ++;
    }

    // Validate the number within the row -
    var rowSelector = "." + itemClass.substr( itemClass.indexOf("row"), 4 );
    var rowMatchCnt = validateCell( inputMode, cellId, rowSelector, newValue, invalidFlag );
    if (rowMatchCnt > 1) {
        invalidFlag ++;
    }

    // Validate the number within the column -
    var colSelector = "." + itemClass.substr( itemClass.indexOf("col"), 4 );
    var colMatchCnt = validateCell( inputMode, cellId, colSelector, newValue, invalidFlag );
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
                if (inputMode == "input") {
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
    }
}

/********************************************************************************************
 * validateCell() - called by evalInput() to check for cell matches and flag conflicts
 * - only looks at a block, a row or a column per call (based on jQuery selector passed.
 * @param inputClass  - either "input" or "noinput"
 * @param cellId - base cellId originating the evalInput()
 * @param selector  - jQuery selector for block, row or column
 * @param value  - number to check for conflicts
 * @param alreadyInvalid - indicates whether 'selected' cell has already failed a block, row or column test
 *                  - otherwise, cell may fail a block test, but pass a row or column test; one invalid = 'invalid'
 *
 * @return matchCnt  - number of matching numbers; 1 == .valid and >1 == .invalid (i.e. conflict)
 */
function validateCell( inputClass, cellId, selector, value, alreadyInvalid ) {

    var matchCnt = 0;
    var $matchResult = $([]);

    if (value) {
        // only check matches if non-zero, non-blank, not undefined value
        $matchResult = getMatchCells( inputClass, selector, value );
        matchCnt = $matchResult.length;

    } else {
        // on blank cell, just remove the valid / invalid class from that original cell -
        $matchResult = $("#" + cellId);
        matchCnt = 0;
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
        // default keyboard input mode - use "input" element selector, not more generic ":input" -
        $matchResult = $("input", selector).filter( function() {
                        return this.value == value;
                       })

    } else {
        // user-selected (or device-limitation-selected) "noinput" mode -
        // - because #blockID is parent of div.cell - need different selector than div.cell level .row / .col selector -
        if (selector.indexOf("#b") == 0) {
            // use #blockId level selector -
            $matchResult = $(".cell", selector).filter( function() {
                // using jQuery method to avoid innerText() and textContent() cross-browser issues -
                return $(this).text() == value;
            })

        } else {
            // use div.cell level selector -
            $matchResult = $(selector + ":contains('" + value + "')");
        }
    }
    return $matchResult;
}

// **************************************************************************************************
// Event listeners:
/****************************************************************************************************
 * "input" class listener - used to limit inputs to integers 1 through 9
 *  - "keypress" does NOT prevent pasting of invalid values; capturing .click() doesn't solve this (paste is not a click).
 *  - chrome does NOT fire this with tab, shift, ctrl, etc., BUT FIREFOX DOES (must ignore to allow those keys in Firefox).
 *  - eliminating <input type="text"> and using "noinput" class eliminates need for "input" listener
 *
 *  - "keyup" is required to grab the keyboard input that passes "keypress" validation
 *  - oldValue <=> newValue comparison is required because "keyup" fires on ANY keyup; need to limit eval to changes.
 *  - "keyup" fires even when toggling away from window (i.e. any keyup will fire this while input has focus).
 *
 *  - "change" only fires when the input loses focus (by tab, click, window toggle, etc.)
 *  - needed to trap 'paste' entries for evaluation - "keypress" and "keyup" don't fire on 'paste'.
 *
 *  Note: "change" fires before on.focusout
 *        "blur" fires after on.focusout
 *        warning: on.focusout fires event when a button is clicked, even though "selected" cell unchanged.
 *
 *  - just toggling window will cause focusout (and keyup) to fire - tie oldValue / newValue resets to on.focusin
 *
 *  Note this: http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
 */
var oldValue = "";
var newValue = "";

$("input[type='text']").on({
    "keypress": function (e) {

        // using both keyCode and which due to browser variations - jbl
        var key_code = e.keyCode || e.which;

        if (key_code == 9) {
            // allow tab key
            return true;
        } else {
            return !(String.fromCharCode(key_code).match(/[^1-9]/g));
        }
    },
    "keyup": function(e) {

        //Note: val() automatically trims() the input -
        newValue = $(this).val();
        if (oldValue != newValue) {

            //Push the 'undo' info onto the undo stack -
            undoPush($(this).parent().attr("id"), oldValue);

            // If we have a non-empty value that is not 'readonly', then enable 'erase' button -
            // - if we were able to change the value, we must have a non-readonly "input" -
            if (newValue) {
                toggleErase( true );
            } else {
                toggleErase( false );
            }

            //Tag the new (now current) number entry (similar to setSelectedValue() -
            tagCurrent( newValue, "input" );

            //Next, check the new input for conflicts -
            evalInput( oldValue, newValue, $(this).parent().attr("id") );

            //Finally, recognize that newValue is the new oldValue -
            oldValue = newValue;
        }
    },
    "change": function(e) {

        var value = $(this).val();

        if ((value != '')) {
            if (value.match(/[^1-9]/g)) {
                e.preventDefault(); // opted for this instead of "return false;" - jbl
                alert("Only numbers between 1 and 9 are valid entries.");
                $(this).val('');
            } else {
                $(this).keyup();
            }
        }
    }
});

/****************************************************************************************************
 * div.cell.input class 'focusin' listener -
 *  - used to provide tab key 'select' capability.
 *  - coordinate with the div.cell 'click' listener bound to same selector (below).
 *  - required with <input type="text">; 'focusin' should be unnecessary when using "noinput" mode.
 ****************************************************************************************************
 * div.cell.noinput and div.cell.pickem class 'click' listener -
 *  - used to allow mouse-click or touch-screen to 'select' a div.cell.input/.noinput,
 *  - then a clicked number in div.cell.pickem can be placed in the 'selected' cell.
 *  - requires .css to style div.selected (to actually show highlight, etc.)
 *  - eliminate <input type="text"> and use "noinput" class to toggle into this mode exclusively.
 */
$(".cell").on({
    "focusin": function() {

    //'focusin' should only occur on "input' - test to ensure -
    if ($(this).hasClass("input")) {
        oldValue = setSelected( $(this), "input", true );

    } else {
        // somehow got 'focusin' on "noinput"
        oldValue = setSelected( $(this), "noinput", true );
    }

    // just got focus - no new value -
    newValue = "";

    },
    "click": function() {

        if ($(this).hasClass("input")) {
            // select cell contents (like tab), then let 'focusin' handle the rest
            // - don't toggle "selected" if keyboard focus is there.
            // - REMEMBER THIS: syntax below provides click-in select, same as tabbing into input.
            $("> input", this).select();

        } else if ($(this).hasClass("noinput")) {
            // set the selected class and request tagCurrent (true) -
            oldValue = setSelected( $(this), "noinput", true );
            newValue = "";

        } else if ($(this).hasClass("pickem")) {
            // pickem id's all start with "t" == "tracker"
            var id = $(this).attr("id");
            setSelectedValue(id);
        }
    }
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
        var $lastChangeObj = $("#" + lastChange[0]);

        if (!($lastChangeObj.hasClass("selected"))) {
            // clear any other "selected" and change "selected" to cell to undo -
            // (otherwise, the cell to undo must already be "selected" - no need to toggle)
            $(".selected").removeClass("selected");
            $lastChangeObj.addClass("selected");
        }
        // flag the undo caller with prefix "u" -
        setSelectedValue('u' + lastChange[1]);
    }
});

$("button[name=note]").click( function() {

    $("#no-input").toggle();
});

$("button[name=erase]").click( function() {

    // just pass a single char to setSelectedValue - "e" indicates "erase" called it -
    // - don't bother erasing an empty cell -
    var selected = getSelected();
    if (selected[0]) {
        setSelectedValue('e');
    }
});

