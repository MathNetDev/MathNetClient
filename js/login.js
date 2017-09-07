"use strict";
$(function() {
    var query = window.location.search;
    
    $class_view.hide();
    $group_view.hide();

    if (query.substring(0,1) == '?' && !sessionStorage.getItem("error") && !sessionStorage.getItem("group_id")) { // login through url and no error has occurred
        sessionStorage.clear();
        query = unescape(query.substring(1));
        var data = query.split('&');

        var url_class_id, url_group_id, url_username;
        var i;
        for (i = 0; i < data.length; i++)
            data[i] = unescape(data[i]);
        for (i = 0; i < data.length; i++) {
            if (data[i].startsWith("class_id="))
                url_class_id = data[i].substring(9);
            else if (data[i].startsWith("group_id="))
                url_group_id = data[i].substring(9);
            else if (data[i].startsWith("username="))
                url_username = data[i].substring(9).trim();
        }
        if (url_class_id && url_username) {
            socket.login(url_username, url_class_id);
            if (url_class_id) {
                wait_for_login(url_group_id);
            }
        }else{
            $login_view.show();
        }
    }
    else if (sessionStorage.getItem('class_id') && sessionStorage.getItem('username')){
        socket.login(sessionStorage.getItem('username'), sessionStorage.getItem('class_id'));
        if (sessionStorage.getItem('group_id')){
            socket.group_join(sessionStorage.getItem('username'), sessionStorage.getItem('class_id'), 
                              sessionStorage.getItem('group_id'));          
        }//emit group_join if there is an group_id
    }//emit login if there is a class_id
    else {
        $login_view.show(); 
    }

    
    //
    //  Pinging
    //
    window.setInterval(function(){
        var d = new Date();
        socket.ping(d.getTime());
    }, 500);


    $login_button.bind('click', function() {
        if (valid_username($username.val().trim())) {
            socket.login($username.val().trim(), $class_id.val().trim());
            $username.val(""); $class_id.val(""); $error_header.hide();
        }
        else {
            
        }
    });

    $error_header.html(sessionStorage.getItem('error'))
                 .promise()
                 .done(function() {
                     sessionStorage.removeItem('error');
                     sessionStorage.removeItem('class_id');
                     sessionStorage.removeItem('group_id');
                     sessionStorage.removeItem('username');
                 });

    $('body').show();

    function valid_username(username) { 
        var alphanum = /^[A-Za-z][A-Za-z0-9]*$/;
        if (username.match(alphanum) && username.length < 9) {  
            if (username == "admin") {
                alert("Username 'admin' is restricted.");
                return false;
            }
            return true;  
        }
        else {   
            alert("Username must be alphanumeric and less than or equal to 8 characters.");
            return false;
        }  
    }

    function wait_for_login(group_id) {
        var id = setInterval(attempt_join_group, 50);
        var maxAttempts = 10;
        var numAttempts = 0;
        function attempt_join_group() {
            if (numAttempts < maxAttempts) {
                if (sessionStorage.getItem("username")) {
                    socket.group_join(sessionStorage.getItem("username"), sessionStorage.getItem("class_id"), 
                                        group_id);
                    clearInterval(id);
                }
                else if (sessionStorage.getItem("error")) {
                    var error = sessionStorage.getItem("error");
                    if (error && error.indexOf("Username ") !== -1 && error.indexOf(" is already taken") !== -1) {
                        clearInterval(id);
                    }
                }
                else if (!$('.login_view').is(":visible")) {
                    $('.login_view').show();
                }
            }
            else {
                clearInterval(id);
            }
        }
    }
});

