/*!
 * JavaScript file: grid.js
 * - responsible for handling input to sudoku grid
 *
 * Date: 2013-11-18
 *
 * TODO: Try the js.ValidationEngine
 */

// Common functions:
/***********************************************************
 * setSelected() - sets selected cell class
 * - requires .css to style td.selected
 * @param pickId
 */
function setSelected( pickId )
{
    if (typeof pickId !== 'undefined' && pickId !== null) {
        var num = pickId.substr(1,1);
        if ($("td[class$='selected']").hasClass("noinput")) {
            $("td[class$='selected']").text(num);
        } else {
            $("td[class$='selected'] > input").val(num);
        }
    }
}


// Event listeners:
/****************************************************************************************************
 * "input" class listener - used to limit inputs to integers 1 through 9
 *  - this does NOT prevent pasting of invalid values; capturing .click() doesn't solve this (paste is not a click).
 *  - eliminating <input type="text"> and using "noinput" class eliminates need for "input" listener
 */
$("input").keypress(function (e)
{
    if (String.fromCharCode(e.keyCode).match(/[^1-9]/g)) return false;
	//return true;
});

// using keyup - this fires and logs value even when value doesn't change
// - $(this).val() - only get PRIOR value, and only if highlighted and changed (blanked and re-type yields blank)
// - NEED old and new values to keep event from logging new value just pressing keys with no change!!!
var old_value = "";
var new_value = "";
$( "input" ).keyup(function()
{
    var new_value = $( this ).val();
	if (old_value != new_value) {
		console.log( $(this).parent().attr("id") + ": " + "old:" + old_value + " new:" + new_value);
//		console.log( "default: " + this.defaultValue + " new: " + this.value );
//	old_value = new_value;
	}
});
// - change only fires when the input loses focus (by tab or click)
// - but, this does only fire on changes
$( "input" ).change(function()
{
    var value = $( this ).val();
    console.log(value);
});

/*************************************************************************************
 * TODO: Eliminate experimental js
 * - eliminate console.log() [grep files]
 */

// NOTE: blur fires after on.focusout!!!

$("input").on('focusout',function ()
{
    old_value = "";
    new_value = "";
	console.log( "on.focusout: " + $(this).parent().attr("id") + $(this).attr("name") + ": " + "old:" + old_value + " new:" + new_value );
});
// Tabbing automatically "selects" - this code enforces same for click-to-cell -
$("input[type=text], input[type=password], textarea").on('focusin',function ()
{
    this.select();
    old_value = $(this).val();
	console.log( "on.focusin: " + $(this).parent().attr("id") + $(this).attr("name") + ": " + "old:" + old_value + " new:" + new_value );
});

// Note this: http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser

$("button[name=form-input]").click( function()
{
    $("#form-input").toggle();
});
$("button[name=no-input]").click( function()
{
    $("#no-input").toggle();
});
/****************************************************************************************************
 * "selected" and "pickem" class click listener -
 *  - used to provide mouse-click or touch-screen play by selecting a cell, then selecting a number on bottom.
 *  - eliminate <input type="text"> and use "noinput" class to toggle into this mode exclusively.
 */
$("td[class^='cell']").click( function()
{
    if ($(this).hasClass("selected")) {
        $(this).removeClass( "selected" );
    } else if ($(this).hasClass("input") || $(this).hasClass("noinput")) {
        $("td[class$='selected']").removeClass( "selected");
        $(this).addClass('selected');
    } else if ($(this).hasClass("pickem")) {
        var id = $(this).attr("id");
        setSelected(id);
    }
    console.log( "Cell clicked: " + $(this).attr("id"));
});

