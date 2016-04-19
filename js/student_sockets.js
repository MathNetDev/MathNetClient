"use strict";
(function (Student, $) {
    var listeners = [];

    // Using the namespace Student, this is a custom Socket object that takes 
    // a socket.io socket object, and initializes the socket functions
    Student.Socket = function (socket) {
        return init(socket);
    }
    // The initialization function for the Student.Socket object
    var init = function (socket) {
        
        //This function takes a username and class_id from the user
        //It then emits a socket call to login the username to the class_id.
        var login = function (username, class_id) {
            socket.emit('login', username, class_id);
        }

        //This function takes a username and class_id
        //It then emits a socket event to log the username out of the class_id.
        var logout = function(username, class_id) {
            socket.emit('logout', username, class_id);
        }

        //This function takes a username and class_id 
        //It then emits a socket event to retrieve the groups in the class_id
        var groups_get = function(username, class_id) {
            socket.emit('groups_get', username, class_id);
        }

        //This function takes a username, class_id, and group_id
        //It then emits a socket event to enter the username into the given group_id
        //in the given class_id.
        var group_join = function(username, class_id, group_id) {
            socket.emit('group_join', username, class_id, group_id);
        }
        
        //This function takes a username, class_id, group_id, and disconnect
        //It then emits a socket event to take the username out of the group_id in class_id.
        var group_leave = function(username, class_id, group_id, disconnect) {
            socket.emit('group_leave', username, class_id, group_id, disconnect);
        }

        //This function takes a username, class_id, group_id, and status\
        //It then emits a socket event to retrieve a list of all other group members
        //in group_id in class class_id.
        var group_info = function(username, class_id, group_id, status) {
            socket.emit('group_info', username, class_id, group_id, status);
        }

        //This function takes a username, class_id, group_id, x, y, and info
        //It then emits a socket event to change the username's coordinates and info in group_id
        //given x, y, and info.
        var coordinate_change = function(username, class_id, group_id, x, y, info) {
            socket.emit('coordinate_change', username, class_id, group_id, x, y, info);
        }

        //This function takes a class_id and group_id
        //It then emits a socket event to retrieve the settings of given group_id
        //in class_id.
        var get_settings = function(class_id, group_id) {
            socket.emit('get-settings', class_id, group_id);
        }

        //This function takes no parameters
        //and disconnects the given socket (this object) from the server.
        var disconnect = function() {
            socket.disconnect();
        }

        //
        // Socket event handlers
        //

        socket.on('server_error', function(data) {
            server_error(data.message);      
        });
       
        socket.on('login_response', function(data) {
            login_response(data.username, data.class_id);
        });

        socket.on('logout_response', function(data) {
            logout_response(data.disconnect);
        });

        socket.on('groups_get_response', function(data) {
            groups_get_response(data.username, data.class_id, data.groups);
        });

        socket.on('group_join_response', function(data) {
            group_join_response(data.username, data.class_id, data.group_id);
        });

        socket.on('group_leave_response', function(data) {
            group_leave_response(data.username, data.class_id, data.group_id, data.disconnect);
        });

        socket.on('group_info_response', function(data) {
            group_info_response(data.username, data.class_id, data.group_id, 
                                data.other_members, data.status);
        });

        socket.on('coordinate_change_response', function(data) {
            coordinate_change_response(data.username, data.class_id, 
                                       data.group_id, data.x, data.y, data.info);
        });
        socket.on('group_numbers_response', function(data) {
            group_numbers_response(data.username, data.class_id, data.group_id, 
                                data.status, data.group_size);
        });

        socket.on('get-settings-response', function(data) {
            get_settings_response(data.class_id, data.settings);
        });

        socket.on('add-group-response', function(data) {
            add_group_response();
        });

        socket.on('delete-group-response', function(data) {
            delete_group_response();
        });


        return {
            login: login,
            logout: logout,
            groups_get: groups_get,
            group_join: group_join,
            group_leave: group_leave,
            group_info: group_info,
            coordinate_change: coordinate_change,
            get_settings: get_settings,
            disconnect: disconnect
        };
    }
    
})(window.Student = window.Student || {}, window.jQuery);
