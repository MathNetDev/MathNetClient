"use strict";

var d3app = $("#field-container");
var geogebra = $("#ging");
function escapeStr(str) 
{
    if (str)
        return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=><|\/@])/g,'\\$1');      

    return str;
}

//displays server error on client side
function server_error(error) {
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');

    console.log(error);
    sessionStorage.setItem('error', error);
    location.reload();
}
//shows class_view and sets sessionStorage for class_id and username, then calls groups_get
function login_response(username, class_id) {
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');

    $login_view.hide();
    $class_view.show();
    $group_view.hide();

    username = username.replace(/&lt;/g,'<').replace(/&gt;/g, '>');

    sessionStorage.setItem('class_id', class_id);
    sessionStorage.setItem('username', username);
    socket.groups_get(username, class_id);
}
//shows login_view, and removes class_id and username from sessionStorage 
//if logout was not a disconnect
function logout_response(disconnect) {
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');

    $login_view.show();
    $class_view.hide();
    $group_view.hide();
    if(!disconnect){
        sessionStorage.removeItem('class_id');
        sessionStorage.removeItem('username');
    }
}
//populates $groups with buttons with info from groups.
function groups_get_response(username, class_id, groups) {
    var $groups = $('#buttons');
    var current_user = sessionStorage.getItem('username');
    var current_class = sessionStorage.getItem('class_id');
    $groups.empty();
    for (var i in groups){
        var button = '<li><input type="button" id="grp' + groups[i].grp_name + '" value="Group ';
        button += groups[i].grp_name + ' - '+ groups[i].num;
        button += '" /></li>';
        $groups.append(button);
    }
}
//increments group_size if status is true (user is joining group), else decrements
function group_numbers_response(username, class_id, group_id, status, group_size){
    var group_size = (status ? group_size++ : group_size--);
    $("#grp" + group_id).val('Group ' + group_id + ' - ' + group_size);

}
//resets $messages and $people, sets group_id in sessionStorage, then calls group_info
// and get_settings
function group_join_response(username, class_id, group_id, group_size) {
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');
    var $messages = $('#messages');

    $messages.html('');
    $("#people").html('');

    $login_view.hide();
    $class_view.hide();
    $group_view.show();

    // Clear points and redraw
    if (d3app.length != 0){
        users = []; 
        remove_drawn_vectors();
    } else if (geogebra.length != 0){
        if (group_size > 2){ //shouldn't be in here get out!
            //socket.group_leave(username, class_id, group_id, 0);
            //return;
        }
    }
    
    sessionStorage.setItem('group_id', group_id);

    socket.group_info(username, class_id, group_id, true);
    socket.get_settings(class_id, group_id);
}

// shows class_view, and removes group_id from sessionStorage if disconnect is not true
function group_leave_response(username, class_id, group_id, disconnect) {
    // This function must call socket.groups_get(username, class_id)
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');

    $login_view.hide();
    $class_view.show();
    $group_view.hide();
    if(!disconnect){
        sessionStorage.removeItem('group_id');
    }
    if (d3app.length != 0){
        field_remove_user(username);
    }
    //socket.group_info(username, class_id, group_id, false);
}

// populates $people with members array values, and appends join/leave message
// based on status. removes #username if leave
function group_info_response(username, class_id, group_id, members, status) {
    var current_user = sessionStorage.getItem('username');
    var current_group = sessionStorage.getItem('group_id');
    var $group_name = $('#number');
    var $people = $('#people');
    //$people.html('');
    if(status){
        for (var i in members) {
            
            if(members[i].member_name.replace(/&lt;/g,'<').replace(/&gt;/g, '>') != current_user) {
                var member = '<li id="' + members[i].member_name + '">';
                member += members[i].member_name;
                member += ' - (<span class="x">' + members[i].member_x + '</span>, ';
                member += '<span class="y">' + members[i].member_y + '</span>) </li>';
            }
            else {
                $group_name.html('Group: ' + current_group); //only update this for the new member
                var member = '<li id="' + members[i].member_name + '">';
                member += members[i].member_name + ' (You)';
                member += ' - (<span class="x">' + members[i].member_x + '</span>, ';
                member += '<span class="y">' + members[i].member_y + '</span>) </li>';
            }
            $people.append(member);
            
        }
    
        $('#messages').append(username + ' has joined the group<br/>');
    } else {
        var escUsername = username.replace(/&lt;/g,'<').replace(/&gt;/g, '>');
        escUsername = escapeStr(escUsername);
        $("#" + escUsername).remove();
        $('#messages').append(username + ' has left the group<br/>');
        if(d3app.length != 0){
            field_remove_user(username);
        } else if (geogebra.length != 0){
            var fields = {x: 0,
                          y: 0, 
                          username: "B"};
            handle_partner_leave(fields);
        }
    }

    if (d3app.length != 0){
        field_sync_users(members);
    } else if (geogebra.length != 0){
        if(username == sessionStorage.getItem("username") ){
            sessionStorage.setItem("x1", 0);
            sessionStorage.setItem("y1", 0);
            ggbOnInit();
        } else {
            
        }
        if(status && (members.length != 0) ){
            var fields = {username: members[0].member_name, x: members[0].member_x, y: members[0].member_y};
            handle_show_partner(fields);
        }
    }
}//members is undefined if group_info_response is triggered by group_leave, so short circuit it on status.

// set #username.(x/y) with the respective coordinates, and adds relavent message
function coordinate_change_response(username, class_id, group_id, x, y, info) {
    var $messages = $('#messages');
    var escUsername = username.replace(/&lt;/g,'<').replace(/&gt;/g, '>');
    escUsername = escapeStr(escUsername);
    $('#' + escUsername + ' .x').html(x);
    $('#' + escUsername + ' .y').html(y);

    $messages.append(username + ' has moved their point to (' 
                          + x + ', ' + y +')<br/>');
    if (d3app.length != 0){
        field_move_users(username, x, y, info);
    } else if (geogebra.length != 0) {
        if(username != sessionStorage.getItem("username")){
            var fields = {username: username, x: x, y: y}; //this doesn't work as well as group_join, why things undefined?
            handle_show_partner(fields);
            if(info != undefined && info != "" && info == "\"mark\""){
                handle_mark_partner(fields);
            }
        }//if there is a partner in the group mark them
        //look call handler to look through info a la netlogo
    }
}

// updates $class_settings based on settings array
function get_settings_response(class_id, settings) {
    var $class_settings = $('#settings');
    $class_settings.html('');

    for (var setting in settings) {
        var setting_item = "<li>" + setting + ": " + settings[setting] + "</li>";
        $class_settings.append(setting_item);
        if (setting == "Hide Options" ){
            settings[setting] ? (
                $("#display-settings").hide(), 
                $('#messages').append('Admin has turned off options.<br/>'),
                $("#display-settings input:checkbox").prop('checked', ''),
                $("#display-settings #show_points").prop('checked', true)
            ) : (
                $("#display-settings").show(),
                $('#messages').append('Admin has turned on options.<br/>')
            );//hide display options if certain global is turned on.
            
            if (d3app.length != 0){
                update_display_settings();
            }
        }
        //if setting == "whateveroption"
        //  enableOptionInApp(settings[setting]);
    }
}
//adds a new group button
function add_group_response() {
    var $groups = $('#buttons');
    var group_number = $('#buttons > li:last').index() + 2;
    var button = '<li><input type="button" id="grp' + group_number + '" value="Group ';
    button += group_number + ' - '+ 0;
    button += '" /></li>';
    $groups.append(button);
}
//removes last group button
function delete_group_response() {
    $('#buttons > li:last').remove();
}
