"use strict";
$(function() {
    var geogebra = $("#ging");
    var max_people = 2;
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
        if(geogebra.length == 0){
          max_people = Number.MAX_VALUE;
        }
        if (num_people < max_people){
          socket.group_join(sessionStorage.getItem('username'), 
                            sessionStorage.getItem('class_id'),
                            $(event.target).index('#buttons :input') + 1
                           );
        }
    });
});
