"use strict";
$(function() {
    $leave_group_button.bind('click', function() {
        socket.group_leave(sessionStorage.getItem('username'),
                           sessionStorage.getItem('class_id'),
                           sessionStorage.getItem('group_id'),
                           false
                          );
    });

});
