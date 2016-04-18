// initialize_form_validator: configure JQuery to validate the Setup form.

function initialize_form_validator () {	

	jQuery.validator.addMethod("ipv4", function(value, element, param) {
	    return this.optional(element) || /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i.test(value);
	}, "Ask teacher for NetLogo's IP address (e.g. 10.0.1.3)");

	jQuery.validator.addMethod("startswithletter", function(value, element) {
			if (value.length != 3)
				return false;
	        return this.optional(element) || /^[a-z]\w+$/i.test(value);
	}, "Names must start with a letter and contain only letters or numbers.");
	
	// validate signup form on keyup and submit
	validator = $("#setup_netlogo_form").validate({
		rules: {
			username: {
				required: true,
				minlength: 3,
				maxlength: 3,
				startswithletter: true
			},
			serveraddr: {
				required: true,
				ipv4: true
			},
			color: {
				required: true
			},
			group: {
				required: true
			}
		},
		messages: {
			username: {
				required: "Enter your initials (3 characters)",
				minlength: jQuery.format("Enter at least {0} characters"),
				maxlength: jQuery.format("Enter no more than {0} characters")
			},
			serveraddr: {
				required: "Ask teacher for NetLogo's IP address (e.g. 10.0.1.3)"
			},
			color: {
				required: "Select a color"
			},
			group: {
				required: "Select a group"
			}					

		},
		// the errorPlacement has to take the table layout into account
		errorPlacement: function(error, element) {
			if ( element.is(":radio") )
				error.appendTo( element.parent().next().next() );
			else if ( element.is(":checkbox") )
				error.appendTo ( element.next() );
			else
				error.appendTo( element.parent() ); //error.appendTo( element.parent().next() );
		},
		// specifying a submitHandler prevents the default submit, good for the demo
		//submitHandler: function() {
		//	store_netlogo_setup();
		//	return false;		// must return true to close dialog box.
		//}
	});
}

