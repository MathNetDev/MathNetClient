"use strict";

import $ from 'jquery'

//escapes most strings to not break general forms
function escapeStr(str) 
{
    if (str)
        return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=><|\/@])/g,'\\$1');      

    return str;
}



 
//displays server error on client side



//shows class_view and sets sessionStorage for class_id and username, then calls groups_get








//resets $messages and $people, sets group_id in sessionStorage, then calls group_info
// and get_settings



















//removes last group button





//This function registers listeners on geogebra initialization 
function ggbOnInit_old(arg) {
    if(arg != 'socket_call'){
        //localStorage.setItem('setNewXML', 'true');
    }
    //document.applet.registerAddListener("object_added_listener");
    document.applet.registerAddListener("addLock");
    document.applet.registerUpdateListener("Update");
    document.applet.registerRemoveListener("Update");

    //document.applet.registerAddListener("updateColors");
    socket.group_color(sessionStorage.getItem('class_id'),sessionStorage.getItem('group_id'));
    if(arg != 'socket_call'){
        socket.get_xml(sessionStorage.getItem('username'),sessionStorage.getItem('class_id'),sessionStorage.getItem('group_id'));
    }
    $(window).resize(function() {
        document.applet.setHeight($(window).height()/1.3);
    });
}





