"use strict";
(function (Admin, $) {
    var sock,
        listeners = [];

    // Using the namespace Admin, this is a custom Socket object that takes 
    // a socket.io socket object, and initializes the socket functions
    Admin.Socket = function (socket) {
        return init(socket);
    };


    // The initialization function for the Admin.Socket object
    var init = function (socket) {
       // sock = socket;

        // This function takes a class name and group count provided by the 
        // user. The socket then emits this data to the server to create 
        // the class and groups. 
        var add_class = function (class_name, group_count, secret) {
            socket.emit('add-class', class_name, group_count, secret);
        };

        // This function takes a class id provided by the user. The socket then
        // emits this data to the server to join a class.
        var join_class = function (class_id, secret) {
            socket.emit('join-class', class_id, secret);
        };

        // This function takes a class name provided by the user.
        // The socket then emits this data to the server to create a 
        // group for the class.
        var add_group = function (class_id, secret) {
            socket.emit('add-group', class_id, secret);
        }

        // This function takes a class id and group id provided by the user.
        // The socket then emits this data to the server to delete a group
        // from the class.
        var delete_group = function (class_id, group_id, secret) {
            socket.emit('delete-group', class_id, group_id, secret);
        }

        // This function takes a class id provided by the user.
        // The socket then emits this data to the server to leave a class.
        var leave_class = function (class_id, secret) {
            socket.emit('leave-class', class_id, secret);
        }

        // This function takes a class id and settings data provided by the
        // user.
        // The socket then emits this data to the server to save the global
        // settings for the class.
        var save_settings = function (class_id, settings, secret) {
            socket.emit('save-settings', class_id, settings, secret);
        }

        // This function takes a secret password provided by the user
        // The socket then emits this to the server to send the list of
        // current created classes and their login IDs to the user.
        var get_classes = function (secret){
            socket.emit('get-classes', secret);
        }

        //This function takes a username, class_id, group_id, and XML
        //It then emits a socket event to change the class's XML in the datastructure
        //based on the given XML, group_id, and class_id
        var xml_change = function(username, class_id, group_id, xml, toolbar) {
            socket.emit('xml_change', username, class_id, group_id, xml, toolbar);
        }

        //This function takes a username, class_id, and group_id
        //It then emits a socket event to retrieve the group's XML
        //using the given class_id and group_id
        var get_xml = function(username, class_id, group_id){
            socket.emit('get_xml', username, class_id, group_id);
        }
        // This function disconnects the socket
        var disconnect = function() {
            socket.disconnect();
        };

        //
        // Socket event handlers
        //

        socket.on('server_error', function(data) {
            server_error(data.message);
        });

        socket.on('add-class-response', function(data) {
            add_class_response(data.class_id, data.class_name, data.group_count);
        });

        socket.on('add-group-response', function(data) {
            add_group_response();
        });

        socket.on('delete-group-response', function(data) {
            delete_group_response();
        });

        socket.on('leave-class-response', function(data) {
            leave_class_response(data.disconnect);
        });

        socket.on('group_info_response', function(data) {
            group_info_response(data.username, data.class_id, data.group_id, 
                                data.other_members, data.status);
        });

        socket.on('coordinate_change_response', function(data) {
            coordinate_change_response(data.username, data.class_id, 
                                       data.group_id, data.x, data.y, data.info);
        });
        socket.on('get-classes-response', function(data){
            get_classes_response(data.classes, data.secret);
        });

        socket.on('xml_change_response', function(data) {
            xml_change_response(data.username, data.class_id, data.group_id, data.xml, data.toolbar);
        });

        socket.on('get_xml_response', function(data) {
            get_xml_response(data.username, data.class_id, data.group_id, data.xml, data.toolbar);
        });

        return {
            add_class: add_class,
            join_class: join_class,
            add_group: add_group,
            delete_group: delete_group,
            leave_class: leave_class,
            save_settings: save_settings,
            get_classes: get_classes,
            xml_change: xml_change,
            get_xml: get_xml,
            disconnect: disconnect
        };
    };

    //var socket = io(location.host + '/admins');
})(window.Admin = window.Admin || {}, window.jQuery);
