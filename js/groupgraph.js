var DEBUG = true;

var ggbApplet = document.ggbApplet;

var MY_XNAME = "x1";
var MY_YNAME = "y1";

var ERROR_VAL = -Infinity;


var N = 1;
var Nmax = 10;

// debugging control - for the 'debug' function below
	debug_activep = true;		// controls behavior of debug()
	debug_method = "console";	// = "alert" or "console"

/*************************************************************************
 * 
 *	Initialization Functions - called from $(document).ready in index.html
 *
 *************************************************************************/

function initialize_groupgraph() {

	// call init functions for three basic areas: 
	// session data, netlogo websocket library, & the display
	initialize_session_data();		// see gg_sessionstore.js
	
	// setup callback functions that will be called when NetLogo messages arrive
	//initialize_netlogo();
	
	initialize_display();
	
	initialize_form_validator();	// see gg_validation.js

}


// function initialize_netlogo() {
// 	var error_msg;
	
// 	/****************  User configurable settings *******************/

// 	NETLOGO.set_version("NetLogo 5.0.4");	// This client built for 'NetLogo 5.0.4' but this is how to override
// 	NETLOGO.set_port(9999);					// 9999 is current default - but this is how you would override			
// 	NETLOGO.set_timeout(2000);				// set connect timeout to 2 seconds instead of default 5 secs

// 	/****************  NETLOGO  message  tags  **********************/

// 	// establish "handlers" for all tags sent by NetLogo server
	
// 	error_msg = "init_event_handlers: failed to set_handler(";
// 	if (!NETLOGO.set_handler("show-equation", handle_show_equation)) {
// 		nl_alert(error_msg + "show-equation)");
// 	}
// 	if (!NETLOGO.set_handler("show-partner", handle_show_partner)) {
// 		nl_alert(error_msg + "show-partner)");
// 	}
// 	if (!NETLOGO.set_handler("mark-partner", handle_mark_partner)) {
// 		nl_alert(error_msg + "mark-partner)");
// 	}
// 	if (!NETLOGO.set_handler("set-graph-dim", handle_set_graph_dim)) {
// 		nl_alert(error_msg + "set-graph-dim)");
// 	}
	
// 	// here a more generic handler is established for anything other than above messages
// 	if (!NETLOGO.set_handler("default", handle_unrecognized_tags)) {
// 		nl_alert(error_msg + "default)");
// 	}
	
	
// 	// you can look at the installed handlers at any time:
// 	alert("Installed NetLogo Handlers: " + NETLOGO.show_handlers());

// 	/****************  ERROR  handlers  **********************/

// 	// establish handlers for errors - this is optional
// 	// if you establish no error handlers, alert(<message>) will be called.
// 	// set_errorhandler returns true on success, false otherwise
// 	// here we set a handler for just the "netlogo-exit" error/event
// 	if (!NETLOGO.set_errorhandler("netlogo-exit", handle_netlogo_exit)) {
// 		alert("Something went wrong with my NETLOGO.set_errorhandler call!");
// 	}

// 	// here we set a handler for just the "netlogo-version" error/event
// 	if (!NETLOGO.set_errorhandler("netlogo-version", handle_netlogo_version_mismatch)) {
// 		alert("Something went wrong with my NETLOGO.set_errorhandler call!");
// 	}

// 	// here we establish a more generic handler for anything else that happens
// 	NETLOGO.set_errorhandler("default", default_error_handler);

// 	//	you can get the list of all currently assigned error handlers by uncommenting:
// 	alert("Installed error handlers: " + NETLOGO.show_errorhandlers());

// 	debug("initialize_netlogo: completed");
// }


function initialize_display() {
	
	var group, color, x1, y1, connectedp, validator;
					
	$("#setup_netlogo_form").bind("submit", function (event, ui) {
		store_netlogo_setup();
		return true;		// must return true to close dialog box.
	});
	
	$( "#setup" ).on( "pagebeforeshow", function(event) {
		init_setup_from_session();
	});
	
	
	$( "#ging" ).on( "pagebeforeshow", function(event) {

		ggbOnInit();
		
		// if (!setup_completep()) {
		// 	nl_alert("Warning: You have not run Setup yet.  You will be able to move your point, but you cannot connect to NetLogo.");
		// 	$("#gnetlogo").hide();
		// } else {
		// 	$("#gnetlogo").show();
		// }
	
		group = sessionStorage.getItem("group");
		color = sessionStorage.getItem("color");
		x1 = sessionStorage.getItem("x1");
		y1 = sessionStorage.getItem("y1");

		// watch out - there is an id called group in the popup menu.
		if (group && color) {
			$("#groupid").text(group+color);
			if (color == "G") {
				$("#groupid").css({"background-color": "#0F0", "border-color": "#0F0"});
			} else {
				$("#groupid").css({"background-color": "#FF0", "border-color": "#FF0"});
			}
		}

		$("#location").text("(" + x1 + "," + y1 + ")");
		
		if (netlogo_connectedp()) {
			// show mark and 
			$("#gshow").show();
			$("#gmark").show();
		} else {
			$("#gshow").hide();
			$("#gmark").hide();
		}
	
	});
	
	// disable whatever events we don't want
	$( document ).bind( "taphold", function( event, data ) {
		event.preventDefault();
	});

	
}



// function toggle_netlogo() {
// 	if (netlogo_connectedp()) {
// 		var r = confirm("Are you sure you want to leave the group?");
// 		if (r === true) {
// 			NETLOGO.disconnect();
// 			ui_close();
// 		}

// 	} else {
// 		if (!setup_completep()) {
// 			nl_alert("You can't join until you have completed Setup. Use the Back arrow to get to Setup.");
// 		} else {
// 			serveraddr = sessionStorage.getItem("serveraddr");
// 			username = sessionStorage.getItem("username");
			
// 			// specify a logincomplete_handler that sends the groupid information
// 			NETLOGO.connect(serveraddr, username, sendGroup);
// 			ui_open();
// 		}
// 	}
// 	return true;
// }


function setup_completep() {
	var rval, x;
	rval = false;
	x = sessionStorage.getItem("setup_completep");
	if (x && (x.toLowerCase() === "true")) {
		rval = true;
	}
	return rval;
}


// function netlogo_connectedp() {
// 	return (NETLOGO.connection_state() === "OPEN");
// }


/*****************************************************************************
 * 
 *	User Actions - functions called when user clicks a button - usually 
 *		These functions generate outgoing messages (to NetLogo).
 *
 *****************************************************************************/

 /* this function is obsolete - removed at Tobin's request cjt 8-1-13 
     see button commented out in index.html */

function show_equation() {
    nl_alert("You should not be able to call this!");
    sendString("A");
}

function mark_point() {
	var x1, y1, color;

	x1 = sessionStorage.getItem("x1");
	y1 = sessionStorage.getItem("y1");
	color = sessionStorage.getItem("y1");

	if (color === "G") {
		ggb_set_color("Am", 0, 255, 0);
	} else if (color === "Y") {
		ggb_set_color("Am", 255, 255, 0);
	}

	ggb_set_visible("Am", true);

//	ggb_set_visible("x1m");
//	ggb_set_visible("y1m");
	ggb_set_value("x1m", Number(x1));
	ggb_set_value("y1m", Number(y1));

	//sendString to send request to mark the point
	sendString("B");
}



/*****************************************************************************
 * 
 *	Send Functions - functions that format user data for sending to NetLogo
 *		These functions generate outgoing messages (to NetLogo).
 *
 *****************************************************************************/


// sendString: used to send Show (A) and Mark (B) messages

function sendString(str) {
	var message, rval = false;

	if(str == "A"){ //show
		rval = true;
	} else if (str == "B"){ //mark
		rval = true;
	}

	// if (!setup_completep()) {
	// 	debug("sendString called before setup_completep is true!");
	// 	return false;
	// }

	// // send_command(<tag>, <type>, <value>)
	// rval = NETLOGO.send_command("string", "String", str);
	
	// debug("string [" + str + "] sent");

	return rval;
}


//
// sendPoint: send current client coordinates to NetLogo
//		this function is used in various places throughout client - at startup, after arrow touch
//

function sendPoint(x, y) {
	var message, rval;

	// if (!setup_completep()) {
	// 	// debug("sendPoint called before setup_completep is true!");
	// 	return false;
	// }

	// message = "[" + x + " " + y + "]";
	
	// // send_command(<tag>, <type>, <value>)
	// rval = NETLOGO.send_command("point", "String", message);
	
	// debug("point " + message + " sent.");

	return rval;
}




// sendGroup:  sends the Group and Color information to NetLogo.  
// 		This function must be called immediately after successful login.  
// 		It is this call that triggers display of icon on NetLogo graphs
//

function sendGroup() {
	var group, color, grpstr, rval;

	// if (!setup_completep()) {
	// 	debug("sendGroup called before setup_completep is true!");
	// 	return false;
	// }

	// rval = false;
	// group = sessionStorage.getItem("group");
	// color = sessionStorage.getItem("color");

	// if (group && color) {
	// 	grpstr = group + color;
		
	// 	rval = NETLOGO.send_command("string", "String", grpstr);
	// 	debug("sendGroup: Group/Color info sent - " + grpstr);
	// }
	
	return rval;
}


/*****************************************************************************
 * 
 *	Event Handlers - for processing messages coming from NetLogo server
 *
 *****************************************************************************/
 
 /*
  * handle_show_equation: generated by the NetLogo model whenever a user does a mark.
  * this used to be generated manually by user but it is now done every time the user marks.
  * so the show_equation button was removed, but the need to handle_show_equation messages
  * still exists.  cjt 8-1-13
  */

function handle_show_equation(fields) {
	var content_type, content_value, eq_string;
	content_type = fields.content.type;
	content_value = fields.content.value;

	debug("show-equation: " + fields);

	if (content_type === "String") {
		eq_string = "Y = " + content_value;
		// nl_alert(eq_string);
		$("#equation").text(eq_string);
	} else {
		nl_alert("handle_show_equation: unexpected content_type: " + content_type);
	}
}


function handle_show_partner(fields) {
	var content_type, content_value, vec, x2, y2;

	content_type = fields.content.type;
	content_value = fields.content.value;

	if (content_type === "LogoList") {
		//debug("show-partner: value = " + content_value);
		vec = JSON.parse(content_value);
		x2 = vec[0];
		y2 = vec[1];
		debug("show-partner: x2 = " + x2 + " y2 = " + y2);
		ggb_set_value("x2", Number(x2));
		ggb_set_value("y2", Number(y2));
	} else {
		nl_alert("handle_show_partner: unexpected content_type: " + content_type);
	}
}


function handle_mark_partner(fields) {
	var content_type, content_value, vec, x2, y2;

	content_type = fields.content.type;
	content_value = fields.content.value;

	debug("mark-partner: " + fields);

	if (content_type === "LogoList") {
		//debug("show-partner: value = " + content_value);
		vec = JSON.parse(content_value);
		x2 = vec[0];
		y2 = vec[1];
		debug("mark-partner: x2 = " + x2 + " y2 = " + y2);
		ggb_set_value("x2m", x2);
		ggb_set_value("y2m", y2);
		ggb_set_visible("b", true);
		ggb_set_visible("Bm", true);
	} else {
		nl_alert("handle_mark_partner: unexpected content_type: " + content_type);
	}

}



function handle_set_graph_dim(fields) {
	var content_type, content_value, val;

	content_type = fields.content.type;
	content_value = fields.content.value;

	debug("set-graph-dim: " + fields);

	if (content_type === "Double") {
		val = Number(content_value);
		if (val === 10.0) {
			debug("set_graph_dim to " + val);
		} else if (val === 0.0) {
			nl_alert("Sorry, but this group is full.\nGo back to Setup and pick a different color or group number.");
			sessionStorage.setItem("setup_completep", false);
			NETLOGO.disconnect();
			ui_close();
			
		} else {
			nl_alert("Hmmm, this val looks wrong: " + val);
		}
	} else {
		nl_alert("handle_set_graph_dim: unexpected content_type: " + content_type);
	}

}



function handle_unrecognized_tags(fields) {
	nl_alert("handle_unrecognized_tags: " + fields);
}


/*************************************************************************
 * 
 *	Error Handlers
 *
 *************************************************************************/

function handle_netlogo_exit(msg) {
	alert("handle_netlogo_exit: " + msg);

	ui_close();
}

// This is a classic problem when people upgrade to a new version of NetLogo
function handle_netlogo_version_mismatch(msg) {
	alert("handle_netlogo_version_mismatch: " + msg);
	ui_close();
}

function default_error_handler(msg) {
	alert("default_error_handler: " + msg);

	ui_close();
}


/************************************************************
 * 
 *	UI-oriented functions - using JQuery mostly
 *
 ************************************************************/

function ui_open() {
	$("#gnetlogo .ui-btn-text").text("Exit");
	$("#gshow").show();
	$("#gmark").show();
	$("#connection_status").text("group");
	$("#connection_box").css({"background-color": "#FFF", "border-color": "#00F"});
}

function ui_close() {
	$("#gnetlogo .ui-btn-text").text("Join");
	$("#gshow").hide();
	$("#gmark").hide();
	$("#connection_status").text("individual");
	$("#connection_box").css({"background-color": "#F2B6CC", "border-color": "#F00"});
}


/****************  Geogebra graphing functions *******************/


function ggbOnInit() {
	var my_xcor, my_ycor, xtmp, ytmp, rval, username;

	debug("ggbOnInit called");
	
	// set my partner's points to (0,0) in both working and Mark lines
	ggb_set_value("x2", 0);
	ggb_set_value("y2", 0);
	ggb_set_value("x2m", 0);
	ggb_set_value("y2m", 0);

	// A and B are points at end of working (red) line - turn them on but with no labels
	ggb_set_label("A", "A", false);
	ggb_set_visible("A", true);
	
	// point B is the other member of my group
	ggb_set_label("B", "B", false);			// false means label is off; turn back on when NetLogo tells us
	ggb_set_visible("B", true);
	
	// "a" is the name of the line between A and B
	ggb_set_label("a", "a", false);			// false means label is off; turn back on when NetLogo tells us
	ggb_set_visible("a", true);				// turn it on
	
	
	// Am and Bm are points at end of Mark line (green or yellow) - turn them off to star
	ggb_set_label("Am", "Am", false);			// false means label is off; turn back on when NetLogo tells us
	ggb_set_visible("Am", false);
	ggb_set_label("Bm", "Bm", false);			// false means label is off; turn back on when NetLogo tells us
	ggb_set_visible("Bm", false);
	
	// "b" is the name of the Mark line - turn it off
	ggb_set_label("b", "b", false);
	ggb_set_visible("b", false);


	// do some sanity checking first - make sure javascript x, y = ggb x, y
	xtmp = ggb_get_value(MY_XNAME);
	ytmp = ggb_get_value(MY_YNAME);

	my_xcor = getItemTyped(MY_XNAME, "number");
	my_ycor = getItemTyped(MY_YNAME, "number");

	// if the js xcor and the ggb xcor differ, update ggb to match js
	if (xtmp !== my_xcor) {
		rval = ggb_set_value(MY_XNAME, my_xcor);
		if (rval !== my_xcor) {
			nl_alert("Failed to update ggb xcord");
		} else {
			debug("ggbOnInit: updated '" + MY_XNAME + "' to " + rval);
		}
	}

	// if the js ycor and the ggb ycor differ, update ggb to match js
	if (ytmp !== my_ycor) {
		rval = ggb_set_value(MY_YNAME, my_ycor);
		if (rval !== my_ycor) {
			nl_alert("Failed to update ggb ycord");
		} else {
			debug("ggbOnInit: updated '" + MY_YNAME + "' to " + rval);
		}
	}

	// update my point 'A' to be my user name
	username = sessionStorage.getItem("username");
	if (username && (username !== "")) {
		debug("ggbOnInit: updating ggb's user name to " + username);
		ggb_set_label("A", username, true);		// true means label is visible
	}

}


function ggb_set_label(ptname, newlabel, visiblep) {
	var rval;
	if (typeof ggbApplet === 'undefined') {
		nl_alert("Sorry, but ggbApplet is not defined!");
	} else {
		debug("trying to ggb_set_label of " + ptname + " to " + newlabel);
		if (ggbApplet.exists(ptname) && ggbApplet.isDefined(ptname)) {

			rval = ggbApplet.setLabelVisible(ptname, visiblep);
			debug("setLabelVisible " + ptname + " to " + visiblep + " returned " + rval);
			rval = ggbApplet.renameObject(ptname, newlabel);
			debug("RenameObject " + ptname + " to " + newlabel + " returned " + rval);
		} else {
			debug("ggb_set_label: That didn't work! Apparently " + ptname + " is undefined");
		}
	}
}


function ggb_set_color(name, red, green, blue) {
	if (typeof ggbApplet === 'undefined') {
		nl_alert("Sorry, but ggbApplet is not defined!");
	} else {
		if (ggbApplet.exists(name) && ggbApplet.isDefined(name)) {
			ggbApplet.setColor(name, red, green, blue);
		} else {
			debug("ggb_set_color: That didn't work!");
		}
	}
}

function ggb_set_visible(name, onoff) {
	if (typeof ggbApplet === 'undefined') {
		nl_alert("Sorry, but ggbApplet is not defined!");
	} else {
		if (ggbApplet.exists(name) && ggbApplet.isDefined(name)) {
			ggbApplet.setVisible(name, onoff);
		} else {
			debug("ggb_set_visible: That didn't work! Apparently " + name + " is undefined");
		}
	}
}


// movePoint("dir"): called from ging.html with one of the four directions 
//    depending on which mouse button was pressed:  up, down, left, right
// 
// It is okay to call movePoint before connecting to Netlogo
//

function movePoint(direction) {
	var my_xcor, my_ycor, xtmp, ytmp;

	// do some sanity checking first - make sure javascript x, y = ggb x, y
	xtmp = ggb_get_value(MY_XNAME);
	ytmp = ggb_get_value(MY_YNAME);

	if ((xtmp !== my_xcor) || (ytmp !== my_ycor)) {
		nl_alert("javascript and GGB disagree on current position JS: (" + my_xcor + ", " + my_ycor + ")  GGB: (" + xtmp + ", " + ytmp + ")");
	}

	switch (direction) {
	case 'up':
		if (ggb_inc_var(MY_YNAME)) {
			my_ycor = 1;
			my_xcor = 0;
			sessionStorage.setItem(MY_YNAME, my_ycor);
		}
		break;
	case 'down':
		if (ggb_dec_var(MY_YNAME)) {
			my_ycor = -1;
			my_xcor = 0;
			sessionStorage.setItem(MY_YNAME, my_ycor);
		}
		break;
	case 'left':
		if (ggb_dec_var(MY_XNAME)) {
			my_xcor = -1;
			my_ycor = 0;
			sessionStorage.setItem(MY_XNAME, my_xcor);
		}
		break;
	case 'right':
		if (ggb_inc_var(MY_XNAME)) {
			my_xcor = 1;
			my_ycor = 0;
			sessionStorage.setItem(MY_XNAME, my_xcor);
		}
		break;
	default:
		nl_alert("Unrecognized direction in movePoint: " + direction);
	}

	$('#location').text("(" + my_xcor + "," + my_ycor + ")");

	// attempt to send point to NetLogo - this may not happen if we are not yet logged in.
	// this case is checked in sendPoint()

	//this becomes a coord_change call. socket.coordinate_change(username, class, group, dx, dy);
	sendPoint(my_xcor, my_ycor);
}



// ggb_inc_var: update <varname> inside Geogebra applet.  
//    there is a lot of checking below, only one place where true is returned.
//    if ERROR_VAL (-Infinity) is returned, caller shouldn't update any related vars.
//

function ggb_get_value(varname) {
	var val, vartype;

	val = ERROR_VAL;

	if (typeof ggbApplet === 'undefined') {
		nl_alert("Sorry, but ggbApplet is not defined!");
	} else {
		if (ggbApplet.exists(varname) && ggbApplet.isDefined(varname)) {
			vartype = ggbApplet.getObjectType(varname);
			if (vartype === 'numeric') {
				val = ggbApplet.getValue(varname);
				//debug("ggb_get_value: '" + varname + "' (" + vartype + ") = " + val);
			} else {
				nl_alert("'" + varname + "' is of type " + vartype + " - it can't be incremented!");
			}
		} else {
			nl_alert("This variable does not exist: " + varname);
		}
	}

	return val;
}

function ggb_set_value(varname, val) {
	var rval, ggbval;
	ggbval = ERROR_VAL;

	if (typeof ggbApplet === 'undefined') {
		nl_alert("Sorry, but ggbApplet is not defined!");
	} else {
		if (ggbApplet.exists(varname) && ggbApplet.isDefined(varname)) {
			rval = ggbApplet.evalCommand(varname + "=" + val);
			// rval == true only tells us the evalCommand worked
			if (!rval) {
				nl_alert("Unable to update variable " + varname + " in GeoGebra!");
			} else {
				// now test to see whether the variable update took place in ggb
				ggbval = ggbApplet.getValue(varname);
				if (ggbval !== val) {
					debug("Geogebra wouldn't update: " + varname);
					debug("***** Should improve this condition response ****");
					ggbval = ERROR_VAL;
				}
			}
		} else {
			nl_alert("This variable does not exist: " + varname);
		}
	}
	return ggbval;
}


function ggb_poke_var(varname) {
	var tmp, rval, ggbval;
	if (typeof ggbApplet === 'undefined') {
		nl_alert("Sorry, but ggbApplet is not defined!");
	} else {
		if (ggbApplet.exists(varname) && ggbApplet.isDefined(varname)) {
			tmp = ggbApplet.getValue(varname);
			rval = ggbApplet.evalCommand(varname + "=" + tmp);
			// rval == true only tells us the evalCommand worked
			if (!rval) {
				nl_alert("Unable to update variable " + varname + " in GeoGebra!");
			} else {
				// now test to see whether the variable update took place in ggb
				ggbval = ggbApplet.getValue(varname);
				if (ggbval !== tmp) {
					debug("Geogebra wouldn't update: " + varname);
					debug("***** Should improve this condition response ****");
					ggbval = ERROR_VAL;
				}
			}
		}
	}
	
}

// ggb_inc_var: update <varname> inside Geogebra applet.  
//    there is a lot of checking below, only one place where true is returned.
//    if false is returned, caller shouldn't update any related vars.
//
function ggb_inc_var(varname) {
	var val, rval, ggbval;
	rval = false;
	val = ggb_get_value(varname);
	if (val !== ERROR_VAL) {
		val += 1;
		ggbval = ggb_set_value(varname, val);
		if (ggbval === val) {
			rval = true;
		} else {
			debug("ggb_inc_var: could not increment this variable correctly: " + varname);
			debug("***** should improve the error handling in this case ****");
		}
	} else {
		nl_alert("This variable does not exist: " + varname);
	}
	return rval;
}


// ggb_dec_var: update <varname> inside Geogebra applet.  
//    there is a lot of checking below, only one place where true is returned.
//    if false is returned, caller shouldn't update any related vars.
//

function ggb_dec_var(varname) {
	var val, rval, ggbval;
	rval = false;
	val = ggb_get_value(varname);
	if (val !== ERROR_VAL) {
		val -= 1;
		ggbval = ggb_set_value(varname, val);
		if (ggbval === val) {
			rval = true;
		} else {
			debug("Could not decrement this variable correctly: " + varname);
			debug("**** should improve the error handling in this case");
		}
	} else {
		nl_alert("This variable does not exist: " + varname);
	}
	return rval;
}
function nl_alert(str) {
		alert("socket error: " + str);
}
function debug(str) {
	if (debug_activep) {
		switch (debug_method) {
		case "alert":
			alert("socket debug: " + str);
			break;
		case "console":
			console.log("socket debug: " + str);
			break;
		default:
			alert("debug: illegal option in debug_method - [" + debug_method + "]");
		}
	}
}

