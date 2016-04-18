/*
 * netlogo-client-5.0.4.js
 *		Javascript library for connecting to HubNetWeb in NetLogo 5.0.4
 *			(lower case letter after NetLogo version is this library's version)
 *
 *		vars "version" and "hubnet_port" MUST match values in NetLogo server - if they don't this client won't work!
 *		
 *		There are extensive comments in the code, these should be removed with a minimizer before using the library.
 *		Using Google's closure compiler, command is:
 *			java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js netlogo-client-5.0.4.js --js_output_file netlogo-client-5.0.4.min.js
 *			You cannot use ADVANCED_OPTIMIZATIONS at this time - symbol renaming will break method access!!! (SIMPLE still removes > 66%)
 *			See on-line docs: https://developers.google.com/closure/compiler/docs/gettingstarted_app
 *
 *		Note: This library is used primarily with iOS clients running mobile Safari. 
 *			There may be a few non-portables (e.g. IE) features used (e.g. console.log, const)
 * 
 * Updates:
 *     9-6-12: updated Netlogo version from 5.0.1 to 5.0.2
 *	   2-4-13: updated Netlogo version from 5.0.2 to 5.0.3
 *     5-4-13: updated Netlogo version from 5.0.3 to 5.0.4
 *			   added enhanced version mismatch handling - see notes in login_handler
 *             renamed client to netlogo-client-x.x.x.js
 *
 *	Charlie Turner
 *	cjturner@ucdavis.edu
 *	UC Davis, 5-4-2013
 *
 */

// NETLOGO Module
//		uses Module pattern to get proper scoping and public interface
//		See this Yahoo blog for details: http://yuiblog.com/blog/2007/06/12/module-pattern/
//
var NETLOGO = (function (window, undefined) {

	// make jslint happy by declaring all variables at top of this anonymous function
	// these variables are all assigned immediately below
	var METHODS, version, hubnet_port, connect_timeout, debug_activep, debug_method, state, websocket, username,
		SUPPORTED_ERROR_TAGS, error_handlers, WEBSOCKET_STATES, event_handlers, logincomplete_handler;

	// NETLOGO publc Methods
	// called using NETLOGO.<method-name>(<args>)  
	//		method name is left of : and implementation function is to the right
	//		methods must be added in pairs <method-name>: <name-of-function-that-implements-method>
	//		methods: literal object that gets returned from this anonymous function -> defining the interface
	METHODS = {
		connect: connect,
		disconnect: disconnect,
		connection_state: connection_state,
		send_command: send_command,
		set_handler: set_handler,
		show_handlers: show_handlers,
		set_errorhandler: set_errorhandler,
		show_errorhandlers: show_errorhandlers,
		set_version: set_version,
		set_port: set_port,
		set_timeout: set_timeout
	};

	// comfigurable variables
	// version and hubnet_port MUST match values in NetLogo server - if they don't this client won't work!
	// clients can override version, port and timeout with NETLOGO.set_version, set_port, and set_timeout
	version = "NetLogo 5.0.4";	// Must be kept up to date with NetLogo Server App or client won't be able to login.
	hubnet_port = 9999;			// Must match setting in NetLogo model, see: hubnet-web:start port
	connect_timeout = 5000;		// try to connect to NetLogo for 5 seconds

	// debugging control - for the 'debug' function below
	debug_activep = true;		// controls behavior of debug()
	debug_method = "console";	// = "alert" or "console"

	/******************************************************************************
	 *  You should not need to modify anything below this line
	 ******************************************************************************/

	// internal state variables - do not alter these manually
	state = "uninitialized";	// used to tell different between connect errors and NetLogo crashing
								// see on_close function for more details
	websocket = null;			// used by all sending routines.  Established in connect()
	username = null;			// set by connect() call

	// SUPPORTED_ERROR_TAGS: user can get this list with NETLOGO.show_errorhandlers
	//		user can attach an error handler to any of them.
	//		if nothing specific is attached, default handler is used, followed by internal error handler
	SUPPORTED_ERROR_TAGS = ["netlogo-version", "netlogo-login", "netlogo-exit", "netlogo-protocol",
		"network-close", "network-error", "network-timeout", "disconnect", "invalid-ipaddr", "default"];

	// error_handlers: user supplied handlers: user can handle the above errors in one of three ways:
	//		1. assign a specific handler to an error tag
	//		2. assign a default handler to cover all tags not specifically covered by #1
	//		3. do nothing, in which case the library's default handler will be called.
	error_handlers = {};

	// WEBSOCKET_STATES: array of states in the order defined by the WebSocket spec
	// DO NOT change the order of these strings or they will return invalid information from websocket.readyState
	WEBSOCKET_STATES = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];

	// event_handlers: user-defined map of netlogo message tags -> user functions, handled in one of 3 ways:
	//		1. assign a specific handler to a message tag
	//		2. assign a default handler to cover all tags not specifically covered by #1
	//		3. do nothing, in which case the library's default message handler will be called.

	event_handlers = {};
	
	// logincomplete_handler: optional handler that can be supplied by user in connect call.
	//		if it is non-null, then call it after initial login sequence completes
	
	logincomplete_handler = null;

	/*********************** METHOD definitions *******************************/

	// connect: attempts to connect to server, returns true or false depending on initial WebSocket creation
	// this function must be called first in the connection process to NetLogo

	function connect(serveraddr, user_id, opt_logincomplete_fn) {
		var ws_fulladdr;

		if (!valid_ipaddrp(serveraddr)) {
			raise_exception("invalid-ipaddr", "connect: server ip address [" + serveraddr + "] is invalid");
			return false;
		}

		ws_fulladdr = "ws://" + serveraddr + ':' + hubnet_port;
		debug("connect: logging in to " + ws_fulladdr);

		state = "connecting";		// internal state tracking - see on_close function for more details
		websocket = null;
		username = user_id;

		setTimeout(open_timeout, connect_timeout);
		try {
			websocket = new WebSocket(ws_fulladdr);
		} catch (e) {
			raise_exception("network-error", "Error thrown from new WebSocket(" + ws_fulladdr + ")");
			return false;
		}

		if (!websocket) {
			raise_exception("network-error", "new WebSocket() returned null!");
			return false;
		}

		// set up callback functions on the socket
	    websocket.onclose = on_close;			// close function will actually be called if the socket can't connect
		websocket.onerror = on_error;			// websocket errors
	    websocket.onmessage = login_handler;	// performs initial NetLogo login protocol

		// optional handler that can be supplied by user, call at end of initial login sequence
		if (opt_logincomplete_fn !== undefined) {
			logincomplete_handler = opt_logincomplete_fn;
		}

	    websocket.onopen = function () {
			state = "open";	// update state to "open" because we were called - see on_close for details about state

			// send back the version message - this is step 1 in NetLogo initialization protocol
	        websocket_send({"type": "VersionMessage", "fields": {"version": version}});
	    };

		return true;
	}


	// disconnect: user-initiated disconnect (as opposed to NetLogo exit, or errors)
	//		send ExitMessage to NetLogo, pause, then use force_close() to shut down the socket

	function disconnect() {
		var rval = false;
		// check to make sure the socket exists and is open before doing anything
		if (websocket_activep()) {
			debug("Disconnecting from NetLogo!");

			// tell NetLogo we are disconnecting
			websocket_send({"type": "ExitMessage", "fields": {"reason": "iOS user exiting model"}});
            
            // set our NETLOGO state to "disconnecting" to prevent any additional messages being sent - cjt 8-6-13
            state = 'disconnecting';
            
			// give the socket a little time to transmit message - this may not really be necessary!
			setTimeout(force_close, 500);
			rval = true;
		} else {
			raise_exception("network-error", "disconnect: you are trying to disconnect from an inactive websocket!");
		}
		return rval;
	}


	// connection_state: returns the current state of the network connection (websocket.readyState) as a string
	//		see WEBSOCKET_STATES above for list of possible states

	function connection_state() {
		return websocket_state(websocket);
	}

	// force_close: do actual close() on socket, then clear out vars
	//		disconnect() calls this after sending an ExitMessage to NetLogo

	function force_close() {
		// if the socket exists, is connecting or open, close it
		if (websocket_activep()) {
			debug("in force_close: websocket.readyState = " + websocket_state(websocket));
			websocket.onclose = null;
			websocket.close();
		}

		// clear out the socket information - just being cautious
		if (websocket) {
			websocket.onclose = null;
			websocket.onerror = null;
		    websocket.onmessage = null;
		    websocket.onopen = null;
			websocket = null;
		}

		state = "closed";	// internal state tracking - see on_close function for more details
	}


	// send_command: this is the default send for "ActivityCommands", which are the 
	// most common messages sent from client to server.  If you want to send another type of 
	// message, you will need to implement a variant of this function, and then expose it in the interface.

	function send_command(tag, value_type, value_body) {
		if (websocket_activep()) {
		    var message = {
		        "type": "ActivityCommand",
		        "fields": {
		            "tag": tag,
		            "content": {
		                "type": value_type,
		                "value": value_body
		            }
		        }
		    };

			websocket_send(message);
		}
	}


	// set_handler: assign a function to a NETLOGO message tag (type) (e.g. "location")
	// incoming message tags handled in one of three was:
	//	1. assign a specific handler to a message tag
	//	2. assign a default handler to cover all tags not specifically covered by #1
	//	3. do nothing, in which case the library's default message handler will be called.

	function set_handler(tag, handler) {
		var rval = false;
		if ((typeof tag === "string") && (typeof handler === 'function')) {
			event_handlers[tag] = handler;
			rval = true;
		}
		return rval;
	}


	// login_handler: function to do back and forth login protocol with NetLogo.
	//		this is the 'onmessage' handler assigned to the websocket when it is 
	//		first created.  It is called with everything after the open.
	//		Once it is done with the initial handshaking, it switches the 'onmessage'
	//		handler over to the function 'action_handler' (see below)
	//
	// One of the most common problems using the netlogo-client is mismatched versions
	// This is where this will be detected.   We just sent NetLogo our version.  
	// It sends back its version.  If they do not match, then we stop trying to connect.
	// Version mismatch handling upgraded in version 5.0.4 of the client.  cjt - 5-4-2013

	function login_handler(event) {
		var msg_type, msg_content, handshake, expected_version, version_msg;

		debug('login_handler: raw event.data = ' + event.data);
		msg_type = JSON.parse(event.data).type;

		if (msg_type === undefined) {
			nl_alert("login_handler: failed to parse 'type' from NetLogo message: " + event.data);
		} else {
			if (msg_type === "VersionMessage") {
				debug("login_handler: received 'VersionMessage'");
				// refining support for version mismatch - cjt 5-4-2013
				expected_version = JSON.parse(event.data).fields.version;
				debug("expected_version = " + expected_version);
				
				if (version !== expected_version) {
					force_close();		// since we didn't get logged in, bypass disconnect() & just nuke socket
					version_msg = "Version mismatch - NetLogo App expecting version '" + expected_version + "'.\nYou can try overriding with javascript NETLOGO.set_version('" + expected_version + "');\nor update your netlogo-client-5.0.x.js client.";
					raise_exception("netlogo-version", version_msg);	
				} else {
					if (username && username !== "") {
						debug("login_handler: sending 'HandshakeFromClient' " + username);
						handshake = {"type": "HandshakeFromClient", "fields": {"userId": username, "clientType": "COMPUTER"}};
						websocket_send(handshake);
					} else {
						nl_alert("Trying to send Handshake but username is not set - how did you get here?");
					}
				}
			} else if (msg_type === "HandshakeFromServer") {
				debug("login_handler: received 'HandshakeFromServer', sending 'EnterMessage'");
			    websocket_send({"type": "EnterMessage"});
			} else if (msg_type === "DisableView") {
				// when you get a 'DisableView' message it means the handshaking is complete and successful.
				// at this point we switch websocket.onmessage to the function action_handler, which
				// will handle all further message processing - mostly at the user level.
				debug("login_handler: received 'DisableView' => login ok! => switching to action_handler");
				websocket.onmessage = action_handler;
				
				// if it is set, activate the logincomplete_handler
				if (logincomplete_handler && (typeof logincomplete_handler === "function")) {
					debug("login_handler: activating user's logincomplete function");
					logincomplete_handler();
				}

			} else if (msg_type === "LoginFailure") {
				msg_content = JSON.parse(event.data).fields.content;
				debug("login_failure: " + msg_content);
				nl_alert("Login failure: " + msg_content);

				force_close();		// since we didn't get logged in, bypass disconnect() & just nuke socket

			} else {
				// validly formated message, but unrecognized type.
				nl_alert("login_handler: received unsupported message type: " + msg_type + ". This needs to be fixed in netlogo-client-x.x.x.js");
			}
		}
	}


	// action_handler: message handler for all incoming messages after initial login 
	//		protocol has finished executing (see login_handler).  The two main NETLOGO message
	//		types that have been implemented are:
	//			WidgetControl
	//			ExitMessage
	//		Anything else will generate a "netlogo-protocol" error to the user.
	//

	function action_handler(event) {
		var msg_type, msg_tag, msg_content, fields, evnt_hdlr;

		msg_type = JSON.parse(event.data).type;
		if (msg_type === undefined) {
			nl_alert("action_handler: failed to parse 'type' from NetLogo message: " + event.data);
		} else {

			if (msg_type === "WidgetControl") {
				debug("action_handler: received 'WidgetControl' message");

				fields = JSON.parse(event.data).fields;
				msg_tag = fields.tag;
				msg_content = fields.content;

				evnt_hdlr = find_best_handler(event_handlers, msg_tag);
				if (evnt_hdlr && typeof evnt_hdlr === "function") {
					debug("action_handler: " + msg_tag + " => function " + name_pp(evnt_hdlr));
					// call the event handler passing in the full fields object
					evnt_hdlr(fields);
				} else {
					nl_alert("action_handler: found nothing for tag " + msg_tag + " - not even a default handler!");
				}

			} else if (msg_type === "ExitMessage") {
				debug("action_handler: ExitMessage received -> NetLogo has exited!");
				force_close();		// NetLogo initiated Exit, so bypass disconnect, just nuke socket

				// There is a special transition taking place here:
				// A message of type "ExitMessage" gets mapped to an Error with tag "netlogo-exit"
				// The user could have setup of a specific, default or no error handler for this 
				// and it should all go smoothly.
				msg_content = JSON.parse(event.data).fields.reason;
				raise_exception("netlogo-exit", msg_content);

			} else {
				// protocol error
				nl_alert("action_handler: unsupported message type: " + msg_type);
				raise_exception("netlogo-protocol", "unsupported message type: " + msg_type);
			}
		}
	}


	// find_best_handler: lookup tag in handler_map, returning a function
	//		handler_map can be either a regular message hander map, or an error handler map.
	//

	function find_best_handler(handler_map, tag) {
		var evnt_hdlr = handler_map[tag];
		if (evnt_hdlr === undefined) {
			evnt_hdlr = handler_map["default"];
			if (evnt_hdlr === undefined) {
				debug("find_best_handler: no user-defined handlers match - this is default handler!");
				evnt_hdlr = default_message_handler;
			}
		}

		return evnt_hdlr;
	}

	// show_handlers: return array strings that have message tag name and currently installed 
	//		handler function 

	function show_handlers() {
		var keys = Object.keys(event_handlers),
			htype_str = keys.map(function (tag) {
				return "\nNetLogo Tag: " + tag + " => " + name_pp(event_handlers[tag]);
			});
		return htype_str;
	}


	// default_message_handler: gets called if user has nothing specific or default assigned 
	//		for a particular NETLOGO message tag

	function default_message_handler(fields) {
		nl_alert(" default_message_handler: received message = [" + JSON.stringify(fields) + "]");
	}

	/****************************************************
	 * ERROR Handling functions
	 ****************************************************/

	// set_errorhandler: assign an error function to an error type in one of three ways: 
	//	1. assign a specific handler to an error tag
	//	2. assign a default handler to cover all tags not specifically covered by #1
	//	3. do nothing, in which case the library's default handler will be called.

	function set_errorhandler(tag, error_fn) {
		var rval = false;
		if (SUPPORTED_ERROR_TAGS.indexOf(tag) >= 0) {
			error_handlers[tag] = error_fn;
			debug("set_errorhandler: tag [" + tag + "] = " + error_fn.toString());
			rval = true;
		} else {
			debug("set_errorhandler: invalid error type [" + tag + "]");
		}
		return rval;
	}


	// raise_exception: find the appropriate error function to call 
	//		see notes in set_errorhandler for search order

	function raise_exception(tag, value) {
		// see if the tag has a specifically assigned handler
		var exception_fn = error_handlers[tag];

		if (exception_fn !== undefined) {
			exception_fn(value);		// yes, call it
		} else {
			// no, get the default error handler
			exception_fn = error_handlers["default"];
			if (exception_fn !== undefined) {
				exception_fn(value);
			} else {
				debug("raise_exception: calling default_error_handler(" + tag + ", " + value + ")");
				default_error_handler(tag, value);
			}
		}
	}


	// show_errorhandlers: loop over array of supported error tags, printing out 
	//		the name of the currently assigned handler function (can be anonymous or undefined)

	function show_errorhandlers() {
		var etype_str = SUPPORTED_ERROR_TAGS.map(function (err_tag) {
				return "\nTag: " + err_tag + " => " + name_pp(error_handlers[err_tag]);
			});
		return etype_str;
	}


	// default_error_handler: called for all errors when all else fails - 
	//		i.e. the user has not specified either specific or default handlers of 
	//		their own for a particular error tag.	

	function default_error_handler(tag, msg) {
		nl_alert("default_error_handler called!\nError type: [" + tag + "]\nMessage: " + msg);
	}


	/***********************************************************
	 * User-accessible configuration functions
	 *		set_version <string>
	 *		set_port <int>
	 *		set_timeout <int>  
	 ***********************************************************/

	function set_version(verstr) {
		var rval = false;
		if (typeof verstr === "string") {
			version = verstr;
			debug("set_version: updating version to [" + version + "]");
			rval = true;
		}
		return rval;
	}

	function set_port(portnum) {
		var rval = false,
			port = parseInt(portnum, 10);	// base 10
		if (!isNaN(port)) {
			hubnet_port = port;
			debug("set_port: updating port to [" + hubnet_port + "]");
			rval = true;
		}
		return rval;
	}

	function set_timeout(nmilsecs) {
		var rval = false,
			num_millisecs = parseInt(nmilsecs, 10);		// base 10
		if (!isNaN(num_millisecs)) {
			connect_timeout = num_millisecs;
			debug("set_timeout: updating connect_timeout to [" + connect_timeout + "]");
			rval = true;
		}
		return rval;
	}


	/*****************  Lower Level WebSocket functions *******************************/

	// websocket_send: use JSON to stringify msg, then do the actual websocket SEND
	//		this is the last function in library before message goes out on wire (or into browser lib)

	function websocket_send(msg) {
		var rval = false;
		if (websocket_activep()) {
			websocket.send(JSON.stringify(msg));
			rval = true;
		} else {
			debug("Attempting send on an inactive websocket!");
			rval = false;
		}
		return rval;
	}


	// websocket_activep: check the state of websocket, returning true if it is valid, active, and (OPEN or CONNECTING) 

	function websocket_activep() {
		var rval = false;
		
		if (WEBSOCKET_STATES === undefined) {
			nl_alert("we have problems - WEBSOCKET_STATES is undefined");
		}

        /* adding internal state as well as socket state tracking - this is the original - cjt 8-6-13
		if (websocket && (websocket.readyState === WEBSOCKET_STATES.indexOf("OPEN") ||
						 websocket.readyState === WEBSOCKET_STATES.indexOf("CONNECTING"))) {
			rval = true;
		} */
		
		if (websocket && (websocket.readyState === WEBSOCKET_STATES.indexOf("OPEN") ||
						 websocket.readyState === WEBSOCKET_STATES.indexOf("CONNECTING")) &&
						 (state === 'open' || state === 'connecting' )) {
			rval = true;
		}
        
		debug("websocket_activep: rval = " + rval + " state = " + state);
		return rval;
	}


	// websocket_state: returns the string representation of the current websocket state
	//		looks up websocket.readyState in WEBSOCKET_STATES (defined above).
	//		Note: the order of strings in WEBSOCKET_STATES is critical - it was set by spec to match !

	function websocket_state(websock) {
		var rs, rval;

		if (websock) {
			rval = "Not Found";
			rs = websock.readyState;
			if (rs >= 0 && rs <= WEBSOCKET_STATES.length) {
				rval = WEBSOCKET_STATES[rs];
			}
		} else {
			rval = "NULL Websocket";
		}

		return rval;
	}


	// open_timeout: there are certain situations where initial call to Websocket can hang for a long time.
	//		this timer function is used to let user know there is a problem.  In other cases we just note state and carry on.

	function open_timeout() {

		switch (websocket_state(websocket)) {
		case 'CONNECTING':
			debug("open_timeout: timed out trying to connect to NetLogo server.  Check IP address in Setup.");
			force_close();
			raise_exception("netlogo-timeout", "Timeout trying to connect to NetLogo server.  Check your IP address in Setup.");
			break;
		case 'OPEN':
			debug("open_timeout: socket open, login timeout expired - everything is okay!");
			break;
		case 'CLOSED':
		case 'CLOSING':
			// not sure this option can ever be triggered.  I was originally tracking my own states not using readyState
			// and in my version I had a state for "closed" but I think we just go to "NULL Websocket" now.
			debug("open_timeout: Unable to connect to NetLogo - ws closed before connection timeout expired - everything is relatively okay.");
			break;
		case 'NULL Websocket':
			debug("open_timeout: looks like user opened and closed quickly, or NetLogo isn't running - if so, everything is okay, if not, then there could be some other problem!");
			break;
		default:
			nl_alert("netlogo_open_timeout: unrecognized websocket.ReadyState = " + websocket_state(websocket));
		}
	}


	// on_close: function attached to onclose condition when websocket is created.
	//		this function can be called in a variety of situations (can't connect, NetLogo exit, etc.)
	//		consequently need to check the state of the socket to see what is happening.
	//
	// *** the only reason we use 'state' instead of websocket.readyState is to track difference
	//		between state == 'connecting' and 'open'.  websocket.readyState is always 'CLOSING' when on_close called.
	//
	// *** one other reason is to track 'disconnecting' after an ExitMessage is sent - cjt added 8-6-13
	//
	//		The main place this comes into play is a NetLogo crash.  NetLogo exits are handled by 
	//

	function on_close() {
		debug("on_close called - ws_state = " + websocket_state(websocket));
		if (websocket) {
			switch (state) {
			case 'connecting':
				raise_exception("network-close", "NetLogo is not running or not listening on port [" + hubnet_port + "]");
				debug("NetLogo is not running! (state = " + state + " websocket.readyState = " + websocket_state(websocket) + ")");
				break;
			case 'open':
				raise_exception("disconnect", "Disconnected from NetLogo!");
				debug("Disconnected from NetLogo! (websocket Status = " + websocket_state(websocket) + ")");
				break;
			// add disconnecting state to handle case of sending ExitMessage to NetLogo but not yet having lost the channel.
			// cjt 8-6-13
			case 'disconnecting':
				nl_alert("on_close state == disconnecting --- websocket.readyState == " + websocket_state(websocket));
				debug("on_close called after a Exit message sent - everything is okay!");
				break;
			case 'closed':
				nl_alert("on_close state == closed --- websocket.readyState == " + websocket_state(websocket));
				debug("on_close called after a force-close - everything is okay!");
				break;
			default:
				nl_alert("on_close unrecognized state == " + state + " --- websocket.readyState == " + websocket_state(websocket));
				debug("on_close unrecognized state == " + state + " --- websocket.readyState == " + websocket_state(websocket));
			}

			force_close();

		} else {
			nl_alert("Websocket.onclose: called when socket is already closed. This shouldn't happen!");
		}

	}


	// on_error: function attached to onerror condition when websocket is created.
	//		to date, I have never seen this trigger, so I don't know what it covers that close does not.

	function on_error() {
		nl_alert("Websocket.onerror function called! \nBecause this never happened during development, it is hard to say exactly what is going wrong now.");
		debug("Websocket.onerror function called! \nBecause this never happened during development, it is hard to say exactly what is going wrong now.");
		raise_exception("network-error", "Websocket.onerror function called - unspecified networking error!");
	}


	/*******************  HELPER Functions **************************/

	// valid_ipaddrp: return true if str is a valid IP address, else false

	function valid_ipaddrp(str) {
		// The regular expression pattern for IP address 
		var pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/g;
		/* use  javascript's test() function to execute the regular expression and then store the result - which is either true or false */
		return pattern.test(str);
	}


	// nl_alert: use Javascript popup alert button
	//		note that str is not escaped - scripting attacks could be a problem if this code is used in a normal website

	function nl_alert(str) {
		alert(version + " client: " + str);
	}


	// debug: output to either alert or console depending on flags/values at top of this file.
	function debug(str) {
		if (debug_activep) {
			switch (debug_method) {
			case "alert":
				alert(version + ": " + str);
				break;
			case "console":
				console.log(version + ": " + str);
				break;
			default:
				alert("NETLOGO.debug: illegal option in debug_method - [" + debug_method + "]");
			}
		}
	}


	// name_pp: for console logging - named functions have .name attribute; this is empty string for anon functions

	function name_pp(fn) {
		var fnname;

		if (fn === undefined) {
			fnname = "undefined";
		} else {
			fnname = (fn.name === "") ? "anonymous" : fn.name;
		}
		return fnname;
	}

	// the very last thing this function does is return the literal object 
	// that exposes the public interface.  All the other vars and functions are private
	return METHODS;

})(window);
