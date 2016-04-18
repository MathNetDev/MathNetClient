/**
 * jquery-mobile customiizations - must be loaded before jquery-mobile.js
 */

$(document).bind("mobileinit", function () {
  //apply overrides here

	// general form of overridding options:
	// $.mobile.foo = bar;
	
	// buttonMarkup.hoverDelay - integer, default: 200
	// Set the delay for touch devices to add the hover and down classes on touch interactions 
	// for buttons throughout the framework. Reducing the delay here results in a more responsive
	// feeling ui, but will often result in the downstate being applied during page scrolling.
	$.mobile.buttonMarkup.hoverDelay = 100;
});
