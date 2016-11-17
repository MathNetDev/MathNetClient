"use strict";
$(function() {
    $leave_group_button.bind('click', function() {
        socket.group_leave(sessionStorage.getItem('username'),
                           sessionStorage.getItem('class_id'),
                           sessionStorage.getItem('group_id'),
                           false
                          );
    });

    $update_xml_button.bind('click', function(e){
        e.preventDefault();
        check_xml(document.applet.getXML(), socket);
    });

    $randomizeColors_button.bind('click', function(e){
        e.preventDefault();
        randomizeColors(document.applet);
    });

});
