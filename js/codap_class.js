"use strict";
$(function() {
    $logout_button.bind('click', function() {
        socket.logout(sessionStorage.getItem('username'), 
                      sessionStorage.getItem('class_id'),
                      false
                     );
    });

    $groups.bind('click', function(event) {
      // console.log("here");
      //   socket.group_join(sessionStorage.getItem('username'), 
      //       sessionStorage.getItem('class_id'),
      //       $(event.target).index('#buttons :input') + 1
      //   );
    if(event.target.style.backgroundColor == '') // turning it on
    {
        // routine to make the buttons blue again and make the new button green
        var selected_group = $(event.target).index('#buttons :input') + 1;

     event.target.style.backgroundColor = '#3D72BD';

      socket.group_join(sessionStorage.getItem('username'), 
            sessionStorage.getItem('class_id'),
            $(event.target).index('#buttons :input') + 1
        );

      socket.toggle_codap(sessionStorage.getItem('class_id'),
            selected_group);
    }
    else // turning it off
    {
      event.target.style.backgroundColor = '';    
      socket.group_leave(sessionStorage.getItem('username'),
                           sessionStorage.getItem('class_id'),
                           sessionStorage.getItem('group_id'),
                           false
                          );
    }
        console.log("here");
    });
});