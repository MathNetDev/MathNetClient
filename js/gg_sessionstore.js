
var sessionStorage, $, debug, nl_alert, ggb_set_label, ggb_set_color;

var DEFAULT_NETLOGO_USER = "";
var DEFAULT_NETLOGO_COLOR = "G";	// green
var DEFAULT_NETLOGO_XCOR = "0";
var DEFAULT_NETLOGO_YCOR = "0";


function initialize_session_data() {
	var nsession_vars = 5;		// update this to match the number of setItem calls below
	debug("in initialize_session_data()");
	//sessionStorage.clear();

	sessionStorage.setItem("username", DEFAULT_NETLOGO_USER);
	sessionStorage.setItem("color", DEFAULT_NETLOGO_COLOR);
	sessionStorage.setItem("x1", DEFAULT_NETLOGO_XCOR);
	sessionStorage.setItem("y1", DEFAULT_NETLOGO_YCOR);

	sessionStorage.setItem("setup_completep", "false");

	if (sessionStorage.length !== nsession_vars) {
		alert("initialize_session_data - error wrong number of items in session: got " + sessionStorage.length + " but expected " + nsession_vars);
	}

}



function init_setup_from_session() {
	var username, serveraddr, group, color;

	username = sessionStorage.getItem("username");
	color = sessionStorage.getItem("color");
	debug("Have username " + username  + " color " + color);

	if (username && username !== "") {
		$('#username').val(username);
	}

	if (color && color !== "") {
		// clear everything
		$("[name=color]").removeAttr("checked").checkboxradio("refresh");
		// set the checked attribute on our group - must refresh to see in UI
		$("[name=color]").filter("[value=" + color + "]").attr("checked", true).checkboxradio("refresh");
	}
}

function getItemTyped(name, type) {
	var tval, rval;
	tval = sessionStorage.getItem(name);

	rval = null;
	if (tval && tval !== "") {
		if (type === "number") {
			rval = Number(tval);
		} else if (type === "boolean") {
			rval = Boolean(tval);
		} else if (type === "string") {
			rval = String(tval);
		} else {
			alert("getItemTyped - unrecognized type - " + type);
			rval = null;
		}
	} else {
		alert("getItemTyped: variable is not defined - " + name);
		rval =  null;
	}
	return rval;
}
