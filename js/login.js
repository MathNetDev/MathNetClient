"use strict";
$(function() {
    var $login_button = $('#login');
    var $class_id = $('#class_id');
    var $username = $('#nickname');
    var $error_header = $('#error_frame');

    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');

    $class_view.hide();
    $group_view.hide();

    if(sessionStorage.getItem('class_id')){
        socket.login(sessionStorage.getItem('username'), sessionStorage.getItem('class_id'));
        if(sessionStorage.getItem('group_id')){
            socket.group_join(sessionStorage.getItem('username'), sessionStorage.getItem('class_id'), 
                              sessionStorage.getItem('group_id'));          
        }//emit group_join if there is an group_id
    }//emit login if there is a class_id
    else
        $login_view.show(); 

    $login_button.bind('click', function() {
        socket.login($username.val().trim(), $class_id.val().trim());
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

});

