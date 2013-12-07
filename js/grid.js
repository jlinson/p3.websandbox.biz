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

var undoStack = [];
// **************************************************************************************************
// Common functions:
/****************************************************************************************************
 * setSelected() - sets a div.cell.pickem number (from #Tracker) into the 'selected' grid div.cell
 * - coordinate with the .cell 'click' and on('focusin') listeners below
 * - example of jQuery result caching and child '>' selector.
 * @param pickId
 */
function setSelected( pickId ) {

    if (typeof pickId !== 'undefined' && pickId !== null) {
        var num = pickId.substr(1,1);
        var selected = $('.selected');
        if (selected.hasClass("noinput")) {
            undoPush( selected.attr("id"), selected.text() );
            selected.text(num);
        } else {
            var inputSelected = $('.selected > input');
            undoPush( selected.attr("id"), inputSelected.val());
            inputSelected.val(num);
            inputSelected.focus();
        }
   }
}

function undoPush( cellId, value) {

    if (!value) {
        value = '';
    }
    undoStack.push(cellId + ':' + value);

}

function undoPop() {

    var i = undoStack.pop();
    console.log( i );
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
var old_value = "";
var new_value = "";
$( "input" ).keyup( function(e) {


    var new_value = $(this).val();
	if (old_value != new_value) {
		console.log( $(this).parent().attr("id") + ": " + "old:" + old_value + " new:" + new_value);
		undoPush($(this).parent().attr("id"), old_value);
//	old_value = new_value;
	}
});
// - change only fires when the input loses focus (by tab or click)
// - but, this does only fire on changes
$( "input" ).change( function() {

    var value = $( this ).val();
    console.log(value);
});

// NOTE: blur fires after on.focusout!!!
$("input").on('focusout', function () {

    old_value = "";
    new_value = "";
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
        $(".selected").removeClass( "selected");
        $(this).addClass('selected');
    }
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
        var id = $(this).attr("id");
        setSelected(id);
    }
    console.log( "Cell clicked: " + $(this).attr("id"));
});

// **************************************************************************************************
// Button click listeners -

$("button[name=undo]").click( function() {

    undoPop();
});

$("button[name=note]").click( function() {

    $("#no-input").toggle();
});

$("button[name=erase]").click( function()
{
    // just pass an empty tracker id to setSelected -
    setSelected('t');
});

