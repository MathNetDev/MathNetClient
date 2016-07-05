"use strict";

/**
 * @function escapeStr
 * @param {string} str the string to be escaped
 * @description to escape user inputted strings to prevent injection attacks
 */
function escapeStr(str) {
    if (str)
        return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=><|\/@])/g,'\\$1');      

    return str;
}

/**
 * @function server_error
 * @param {string} error the error to output on the page
 * @description to handle errors sent by the server
 */
function server_error(error) {
    $('#error_frame').html(JSON.stringify(error)); 
}

/**
 * @function add_class_response
 * @param {number} class_id the id of the new class
 * @param {string} class_name the name of the new class
 * @param {string} group_count the number of groups in the new class
 * @description creates the starting group svgs for the admin view
 */
function add_class_response(class_id, class_name, group_count) {
    var $secret_view = $('.secret_view');
    var $create_view = $('.create_view');
    var $manage_view = $('.manage_view');
    var $settings_view = $('.settings_view');
    var $class_name = $('.class_name');
    var $groups = $('.groups');

    sessionStorage.setItem('admin_class_id', class_id);
    $('#error_frame').html('');

    $secret_view.hide();
    $create_view.hide();
    $manage_view.show();
    $settings_view.show();

    $class_name.html(class_name + " ID: " + class_id);
    var groups_html = "";
    var group_number = parseInt(group_count);
    for (var group=1; group < group_number+1; group++) {
        groups_html += "<li>Group " + group;
        groups_html += "<div class='g" + group + "'></div></li>";
    }
    $groups.html(groups_html);
    
    for (var group=1; group < group_number+1; group++) {
        draw_mirror(".g"+group);
        users.push([]);
    }
}

/**
 * @function add_group_response
 * @description adds a group to the end of the list
 */
function add_group_response() {
    var $groups = $('.groups');
    
    $('#error_frame').html('');
    var new_group = "";
    var group_number = $('.groups > li:last').index() + 2;
    new_group += "<li>Group " + group_number;
    new_group += "<ul class='g" + group_number + "'></ul></li>";
    $groups.append(new_group);
    draw_mirror(".g"+group_number);
    users.push([]);
}

/**
 * @function delete_group_response
 * @description deletes the last group from the list
 */
function delete_group_response() {
    $('#error_frame').html('');
    $('.groups > li:last').remove(); 
}

/**
 * @function leave_class_response
 * @param {boolean} disconnect whether to delete the session storage
 * @description changes the admin view from a class to the login page
 */
function leave_class_response(disconnect) {
    var $secret_view = $('.secret_view');
    var $create_view = $('.create_view');
    var $manage_view = $('.manage_view');
    var $settings_view = $('.settings_view');
    var $secret = $('.secret');
    
    $('#error_frame').html('');
    
    $secret_view.hide();
    $create_view.show();
    $manage_view.hide();
    $settings_view.hide();

    if(!disconnect){
        sessionStorage.removeItem('admin_class_id');
    }
    socket.get_classes($secret.val().trim());
}

/**
 * @function group_info_response
 * @param {string} username username of person being removed from group
 * @param {number} class_id id of class being updated
 * @param {number} group_id id of group being updated
 * @param {object[]} group holds the information of each user in the group
 * @param {boolean} status whether to remove a user from the group
 * @description updates the group info for each user every time a change takes place
 */
function group_info_response(username, class_id, group_id, group, status) {
    var $people = $('.g' + group_id);
    //$people.html('');
    
    if (status) {
        for (var i in group) {
            var member = '<li id="' + group[i].member_name +'">';
            member += group[i].member_name;
            member += ' - (<span class="x">' + group[i].member_x + '</span>, ' 
            member += '<span class="y">' + group[i].member_y + '</span>)';
            member += '</li>';
            $people.append(member);
        }
        field_sync_users(group_id, group);
    }
    else {
        username = username.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        username = escapeStr(username);
        $('li[id="' + username + '"]').remove();
        console.log(group_id);
        field_remove_user(username, group_id);
        field_sync_users(group_id, group);
    }
}

/**
 * @function coordinate_change_response
 * @param {string} username username of person whose point has moved
 * @param {number} class_id id of class being updated
 * @param {number} group_id id of group being updated
 * @param {number} x the x coordinate of the point
 * @param {number} y the y coordinate of the point
 * @param {object} info JSON object holding any extra user info 
 * @description updates points on the view every time a user moves one
 */
function coordinate_change_response(username, class_id, group_id, x, y, info) {
    username = username.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    username = escapeStr(username);
    $('li[id="' + username + '"] .x').html(x);
    $('li[id="' + username + '"] .y').html(y);
    field_move_users(username, group_id, x, y, info);
}

/**
 * @function get_classes_response
 * @param {array[object]} classes array of objects holding classes and their hashed IDs
 * @description appends list objects of Classes and their IDs to an unordered list in admin.html
 */
function get_classes_response(classes){
    var $secret_view = $('.secret_view');
    var $create_view = $('.create_view');
    var $manage_view = $('.manage_view');
    var $settings_view = $('.settings_view');

    $secret_view.hide();
    $create_view.show();
    $manage_view.hide();
    $settings_view.hide();

    $('#get-classes').html('');
    for (var i = 0; i < classes.length; i++) {
        //console.log(classes[i]);
        $('#get-classes').append('<div class="list col-md-3 col-lg-3 col-xs-3 col-sm-3" style="padding-bottom: 3px;" onclick=\'join_class("'
            +classes[i].hashed_id+'")\'>Class: <b>' + classes[i].class_name + '</b> ID: <b>' + classes[i].hashed_id + '</b></div>');
    }
}

function join_class(class_id){
    var $secret = $('.secret'); 
    socket.join_class(class_id, $secret.val().trim());
}
