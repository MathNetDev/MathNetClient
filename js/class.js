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
        var group_num = $(event.target).index('#buttons :input') + 1;
        var btn_str = $("#grp" + group_num).val()
        var num_people = btn_str.substring(btn_str.lastIndexOf(" ") + 1); 
        if (num_people < 2){
          socket.group_join(sessionStorage.getItem('username'), 
                            sessionStorage.getItem('class_id'),
                            $(event.target).index('#buttons :input') + 1
                           );
        }
    });
});
