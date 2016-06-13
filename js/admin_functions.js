"use strict";

function escapeStr(str) 
{
    if (str)
        return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=><|\/@])/g,'\\$1');      

    return str;
}

// Handles errors on the client side
function server_error(error) {
    $('#error_frame').html(JSON.stringify(error)); 
}

// Changes admin page view from creation to management
// Creates starting groups 
function add_class_response(class_id, class_name, group_count) {
    var $create_view = $('.create_view');
    var $manage_view = $('.manage_view');
    var $settings_view = $('.settings_view');
    var $class_name = $('.class_name');
    var $groups = $('.groups');

    sessionStorage.setItem('admin_class_id', class_id);
    $('#error_frame').html('');

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

// Adds a group to the end of the list
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

// Deletes the last group from the list
function delete_group_response() {
    $('#error_frame').html('');
    $('.groups > li:last').remove(); 
}

// Changes view from management to creation of classes
function leave_class_response(disconnect) {
    var $create_view = $('.create_view');
    var $manage_view = $('.manage_view');
    var $settings_view = $('.settings_view');
    
    $('#error_frame').html('');
    
    $create_view.show();
    $manage_view.hide();
    $settings_view.hide();

    if(!disconnect){
        sessionStorage.removeItem('admin_class_id');
    }
}

// Adds user information to the proper group
// Updates the data every time there is a change takes place
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

function coordinate_change_response(username, class_id, group_id, x, y, info) {
    username = username.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    username = escapeStr(username);
    $('li[id="' + username + '"] .x').html(x);
    $('li[id="' + username + '"] .y').html(y);
    field_move_users(username, group_id, x, y, info);
}
