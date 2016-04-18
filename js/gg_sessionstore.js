
var sessionStorage, $, debug, nl_alert, ggb_set_label, ggb_set_color;

var DEFAULT_NETLOGO_USER = "";
var DEFAULT_NETLOGO_IP_ADDRESS = "10.0.1.2";
var DEFAULT_NETLOGO_GROUP = "1";
var DEFAULT_NETLOGO_COLOR = "G";	// green
var DEFAULT_NETLOGO_XCOR = "0";
var DEFAULT_NETLOGO_YCOR = "0";


function initialize_session_data() {
	var nsession_vars = 7;		// update this to match the number of setItem calls below
	sessionStorage.clear();

	sessionStorage.setItem("username", DEFAULT_NETLOGO_USER);
	sessionStorage.setItem("serveraddr", DEFAULT_NETLOGO_IP_ADDRESS);
	sessionStorage.setItem("group", DEFAULT_NETLOGO_GROUP);
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
	serveraddr = sessionStorage.getItem("serveraddr");
	group = sessionStorage.getItem("group");
	color = sessionStorage.getItem("color");
	debug("Have username " + username + " serveraddr " + serveraddr + " group " + group + " color " + color);

	if (username && username !== "") {
		$('#username').val(username);
	}

	if (serveraddr && serveraddr !== "") {
		$('#serveraddr').val(serveraddr);
	}

	if (group && group !== "") {
		// clear everything
		$("[name=group]").removeAttr("checked").checkboxradio("refresh");
		// set the checked attribute on our group - must refresh to see in UI
		$("[name=group]").filter("[value=" + group + "]").attr("checked", true).checkboxradio("refresh");
	}

	if (color && color !== "") {
		// clear everything
		$("[name=color]").removeAttr("checked").checkboxradio("refresh");
		// set the checked attribute on our group - must refresh to see in UI
		$("[name=color]").filter("[value=" + color + "]").attr("checked", true).checkboxradio("refresh");
	}
}


function store_netlogo_setup() {
	var user_initials, username, serveraddr, color, group, setup_completep;
	username = $("#username").val();
	serveraddr = $("#serveraddr").val();

	color = $('input[name=color]:checked').val();		// for radio button
	group = $('input[name=group]:checked').val();		// for radio button

	// start off assuming setup_completep will be true.   Any of the tests below can reset to false
	setup_completep = true;

	debug('store_netlogo_setup: called with name = ' + username);

	if (username && (username !== "")) {
		//nl_alert('setting sessionStorage: username = ' + username);
		user_initials = username.substring(0, 3);
		username = username.trim();
		sessionStorage.setItem("username", user_initials);
		ggb_set_label("A", user_initials, true);		// true means label is visible

	} else {
		debug("store_netlogo_setup: failed to store valid username.");
		setup_completep = false;
	}

	if (serveraddr && (serveraddr !== "")) {
		//nl_alert('setting sessionStorage: serveraddr = ' + serveraddr);
		sessionStorage.setItem("serveraddr", serveraddr.trim());
	} else {
		debug("store_netlogo_setup: failed to store valid server address.");
		setup_completep = false;
	}

	if (group && (group !== "")) {
		//nl_alert('setting sessionStorage: serveraddr = ' + serveraddr);
		sessionStorage.setItem("group", group);
	} else {
		debug("store_netlogo_setup: failed to store valid group.");
		setup_completep = false;
	}

	if (color && (color !== "")) {
		// nl_alert('setting sessionStorage: serveraddr = ' + serveraddr);
		sessionStorage.setItem("color", color);
		if (color === "G") {
			debug('setting sessionStorage: Green (color = ' + color);
			ggb_set_color("b", 0, 255, 0);
			ggb_set_color("A", 0, 255, 0);
			ggb_set_color("B", 0, 255, 0);
			ggb_set_color("Am", 0, 255, 0);
			ggb_set_color("Bm", 0, 255, 0);
		} else if (color === "Y") {
			debug('setting sessionStorage: Yellow ( color = ' + color);
			ggb_set_color("b", 255, 255, 0);
			ggb_set_color("A", 255, 255, 0);
			ggb_set_color("B", 255, 255, 0);
			ggb_set_color("Am", 255, 255, 0);
			ggb_set_color("Bm", 255, 255, 0);
		} else {
			nl_alert("Unrecognized color " + color);
		}

	} else {
		debug("store_netlogo_setup: failed to store valid color.");
		setup_completep = false;
	}

	if (setup_completep) {
		debug("store_netlogo_setup: user name, server ip, group and color SUCCESSFULLY stored in session. setup_completep = TRUE");
	} else {
		debug("store_netlogo_setup: one of setup variables still unset. setup_completep = FALSE");
	}

	sessionStorage.setItem("setup_completep", setup_completep);
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
