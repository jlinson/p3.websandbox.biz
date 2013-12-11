/*!
 * JavaScript file: game.js
 * - responsible for game grid loading
 * - will initially hold demo game arrays
 * - will handle ajax calls to the MySQL db in future.
 *
 * Date: 2013-11-30
 *
 * TODO: eliminate experimental js
 * TODO: eliminate console.log() [grep files]
 *
 */




// **************************************************************************************************
// Button click listeners -

$("button[name=load]").click( function() {
    gameLoad();

});

$("button[name=reset]").click( function() {

    $("#no-input").toggle();
});

$("button[name=play]").click( function()
{

});

$("button[name=print]").click( function()
{

});

// ***************************************************************************************************
// Game level drop-down change listener -
// - 0 == beginner (default)
// - 1 == easy
// - 2 == medium
// - 3 == hard
// - 4 == expert

$( "select[name=level]" ).change( function() {

    var value = $( this ).val();
    console.log("Drop-down-changed value:" + value);
});

/****************************************************************************************************
 * gameLoad() - loads a stored game (just accesses the hard-coded "Game Store" for demo
 *
 */
function gameLoad() {
    var gameLevel = $("select[name='level']").val();
    var inputMode = "";
    if ($("#c00").hasClass("input")) {
        // if #c00 has "input" they all should have "input" -
        inputMode = "input";
    } else {
        inputMode = "noinput";
    }

    var levelLen = gameStore[gameLevel][lastIndex[gameLevel]].length;

    for (var i= 0; i < levelLen; i++) {

        var cellValue = gameStore[gameLevel][lastIndex[gameLevel]][i];
        var cvArray = [];
        cvArray = cellValue.split(":");

        if (inputMode == "input") {
            $("> input","#" + cvArray[0]).val( cvArray[1]).attr("readonly",true).attr("disabled",true);

        } else {
            $("#" + cvArray[0]).text( cvArray[1]).addClass("readonly");
        }

    }

    
    console.log( "levelLen:" + levelLen );


}
/***************************************************************************************************
 * Game Store
 * - this should coordinate ajax calls to the db, however due to time constraints -
 * - several demo games are pre-loaded into arrays.
 * - since javascript doesn't have associative arrays, the cellId => value is concatenated (similar to undoStack[])
 */
var lastIndex = [];
var last0Index = 0;  // beginner games accessed
var last1Index = 0;  // easy games accessed
var last2Index = 0;  // medium games accessed
var last3Index = 0;  // hard games accessed
var last4Index = 0;  // expert games accessed

lastIndex = [last0Index, last1Index, last2Index, last3Index, last4Index];

var gameStore = [];
var game0Store = [];
var game1Store = [];
var game2Store = [];
var game3Store = [];
var game4Store = [];

var g00 = ["c03:2","c04:4","c05:1","c06:8","c07:3","c10:4","c12:2","c16:5","c21:6","c23:5","c25:7","c27:4","c28:1","c32:4","c37:5","c41:8","c42:1","c43:9","c45:5","c46:3","c47:4","c51:2","c56:8","c60:6","c61:9","c63:4","c65:5","c68:3","c72:7","c76:2","c78:4","c81:3","c82:2","c83:7","c84:1","c85:6"];


var g30 = ["c01:9","c03:2","c05:6","c08:1","c10:6","c13:1","c18:3","c27:4","c30:4","c32:5","c38:9","c41:7","c43:3","c45:5","c47:6","c50:6","c56:7","c58:8","c61:3","c70:2","c75:9","c78:8","c80:1","c83:8","c85:3","c87:2"]

game0Store = [g00];

game3Store = [g30];

gameStore = [game0Store, game1Store, game2Store, game3Store, game4Store];
