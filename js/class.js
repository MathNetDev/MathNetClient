"use strict";
$(function() {
    var $logout_button = $('#logout');

    $logout_button.bind('click', function() {
        socket.logout(sessionStorage.getItem('username'), 
                      sessionStorage.getItem('class_id'),
                      false
                     );
    });

    $('#buttons').bind('click', function(event) {
        socket.group_join(sessionStorage.getItem('username'), 
            sessionStorage.getItem('class_id'),
            $(event.target).index('#buttons :input') + 1
        );
    });
});
