/*!
 * JavaScript file: grid.js
 * - responsible for handling input to sudoku grid
 *
 * Date: 2013-11-18
 *
 * TODO: eliminate experimental js
 * TODO: eliminate console.log() [grep files]
 * TODO: try the js.ValidationEngine
 */

// **************************************************************************************************
// Common functions:
/****************************************************************************************************
 * setSelected() - sets a number (from #Tracker [t], Undo [u] or Erase [e]) into the 'selected' grid div.cell
 * - coordinate with the .cell 'click' and on('focusin') listeners below
 * - example of jQuery result caching and child '>' selector.
 * @param pickId
 */
function setSelected( pickId ) {

    if (typeof pickId !== 'undefined' && pickId !== null) {
        var caller = pickId.substr(0,1)
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
   }
}

/****************************************************************************************************
 * getSelected() - gets the value from the 'selected' grid div.cell
 * - this is only necessary to handle the different methods of getting an "input" value vs. "noinput" value.
 * - this also passes back the jQuery selector based on "input" vs "noinput".
 */
function getSelected() {

    var jquerySelected =$('.selected');
    var selected = [];
    if (jquerySelected.hasClass("noinput")) {
        selected = [jquerySelected.text(), "noinput", jquerySelected, jquerySelected.attr("id")];
    } else {
        var inputSelected = $('> input', jquerySelected);
        selected = [inputSelected.val(), "input", inputSelected, jquerySelected.attr("id")];
    }
    return selected;
}

var undoStack = [];
/********************************************************************************************
 * undoPush() concatenates the cellId and value and controls the Undo button
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
    $("button[name=undo]").removeAttr("disabled");
    console.log("undoPush: i:" + i + " cellId:" + cellId + " value:" + value);
}

/********************************************************************************************
 * undoPop() returns the last cellId and value in array and controls the Undo button
 * - since undoPush 'strings' the input, undoPop 'unstrings' the output.
 */
function undoPop() {

    var lastDo = [];
    if (undoStack.length > 0) {
        // check if this is last item and return the pop();
        if (undoStack.length == 1) {
            $("button[name=undo]").attr("disabled", "disabled");
        }
        var i = undoStack.pop();
        lastDo = i.split(":");
    }
    console.log("undoPop: cellId:" + lastDo[0] + " value:" + lastDo[1] );
    return lastDo;
}

function evalInput() {

}

function flagMatches() {

}

/**************************************************************************************************
 * This event required to ensure square #game #grid in the event of dynamic #page resizing
 */
$( document ).ready( function() {

    var grid = $('#grid');
    var gw = grid.width();
    grid.css({'height': gw + 'px' });
    console.log( '#grid width: ' + gw );
});

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
$("input").keypress(function (e) {

    // using both keyCode and which due to browser variations - jbl
    var key_code = e.keyCode || e.which;
    console.log(" key_code:" + key_code);
    if (key_code == 9) {
        // allow tab key
        return true;
    } else if (String.fromCharCode(key_code).match(/[^1-9]/g)) {
        // dis-allow other inputs
        return false;
    } else {
        return true;
    }
});

// using keyup - this fires and logs value even when value doesn't change
// - $(this).val() - only get PRIOR value, and only if highlighted and changed (blanked and re-type yields blank)
// - NEED old and new values to keep event from logging new value just pressing keys with no change!!!
// - also keyup fires even when toggling away from window (i.e. any keyup will fire this while input has focus).
var old_value = "";
var new_value = "";
$( "input" ).keyup( function(e) {

    new_value = $(this).val();
	if (old_value != new_value) {
		console.log( "on.keyup: " + $(this).parent().attr("id") + ": " + "old:" + old_value + " new:" + new_value);
		undoPush($(this).parent().attr("id"), old_value);
	    old_value = new_value;
	}
});
// - change only fires when the input loses focus (by tab or click)
// - but, this does only fire on changes
$( "input" ).change( function() {

    var value = $( this ).val();
    console.log( "on.change: " + value);
});

// NOTE: blur fires after on.focusout!!!
// - warning: on.focusout fires event when a button is clicked, even though "selected" cell unchanged.
// - just toggling window will cause focusout (and keyup) to fire - tie old_value / new_value resets to on.focusin
$("input").on('focusout', function () {

    //old_value = "";
    //new_value = "";
	console.log( "on.focusout: " + $(this).parent().attr("id") + $(this).attr("name") + ": " + "old:" + old_value + " new:" + new_value );
});

/****************************************************************************************************
 * div.cell.input class 'focusin' listener -
 *  - used to provide tab key 'select' capability.
 *  - coordinate with the div.cell 'click' listener 'select'er below.
 *  - required with <input type="text">; unnecessary if using "noinput" class.
 */
$('.cell').on('focusin', function() {

    if ($(this).hasClass("selected")) {
        // do nothing
    } else {
        // clear any other "selected" and add to tabbed-in
        if ($(this).hasClass("input")) {
            old_value = $("> input", this).val();
        } else {
            old_value = $(this).text();
        }
        new_value = "";
        $(".selected").removeClass( "selected");
        $(this).addClass('selected');
    }
    console.log( "on.focusin: " + $(this).parent().attr("id") + $(this).attr("name") + ": " + "old:" + old_value + " new:" + new_value );
});

/****************************************************************************************************
 * div.cell.noinput and div.cell.pickem class click listener -
 *  - used to allow mouse-click or touch-screen to 'select' a div.cell.input/.noinput,
 *  - then a clicked number in div.cell.pickem can be placed in the 'selected' cell.
 *  - requires .css to style div.selected (to actually show highlight, etc.)
 *  - eliminate <input type="text"> and use "noinput" class to toggle into this mode exclusively.
 */
$(".cell").click( function() {

    if ($(this).hasClass("input")) {
        // select cell contents (like tab), then let 'focusin' handle the rest
        // - don't toggle "selected" if keyboard focus is there.
        // - REMEMBER THIS: syntax below provides click-in select, same as tabbing into input.
        $("> input", this).select();
    } else if ($(this).hasClass("noinput")) {
        if ($(this).hasClass("selected")) {
            // toggle off the selection
            $(this).removeClass( "selected" );
        } else {
            // clear any other "selected" and add to clicked
            $(".selected").removeClass( "selected");
            $(this).addClass('selected');
        }
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
            $(".selected").removeClass( "selected");
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

