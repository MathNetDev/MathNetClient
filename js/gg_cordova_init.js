var my_ipaddress = null;

function onBodyLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
}

/* When this function is called, PhoneGap has been initialized and is ready to roll */

function onDeviceReady() {
	//navigator.notification.alert("deviceReady");

	callObjC();
}


// change out the alert function to get rid of html filenames in alert messages.
function nl_alert(message) {
	if (typeof device === "undefined") {
		alert(message);
	} else {
		navigator.notification.alert(message, null, "Group Graph", "OK");
	}
}


function debug(str) {
	if (DEBUG) {
		if (typeof console === "object") {
			console.log(str);
		}
	}
}



// Functions specific to IPAddress plugin

var IPAddrPlugin = {
    
    nativeFunction: function(types, success, fail) {
        return Cordova.exec(success, fail, "IPAddrPluginClass", "print", types);
    }
    
};


function success(result) {
	//nl_alert("Success: " + result);
	if (result && result !== "") {
		my_ipaddress = result;
		$("#myipaddress").text(result);
	}
}

function error(result) {
	//nl_alert("Failure: " + result);
	if (result && result === "error") {
		my_ipaddress = "simulator";
		$("#myipaddress").text("simulator");
	}

}

function callObjC() {
	IPAddrPlugin.nativeFunction(["HelloWorld"], success, error);
}
