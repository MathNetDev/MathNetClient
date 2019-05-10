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
    if(error != "Duplicate Entry")
        $error_frame.html(JSON.stringify(error)); 
    else {


        //$class_input.css("border-color", "red");
        //$error_class_input.show();
    }
}

/**
 * function ping response
 * checks time and update ping
 */
 function ping_response(time) {
    var d = new Date();
    //console.log(d.getTime() - time)
    $('.ping').html("Ping: " + (d.getTime() - time).toString());
 }


/**
 * @function add_class_response
 * @param {number} class_id the id of the new class
 * @param {string} class_name the name of the new class
 * @param {string} group_count the number of groups in the new class
 * @description creates the starting group svgs for the admin view
 */
function add_class_response(class_id, class_name, group_count) {
    var construction_groups = $(".construction_groups");

    sessionStorage.setItem('admin_class_id', class_id);
    $error_frame.html('');

    $create_view.hide();
    $settings_tab.hide();
    $class_view.show();
    $design_tab.show();
    $view_tab.show();
    $filtered_merged_view_tab.show();
    $overlayed_image_view_tab.show();

    $class_name.html(class_name);
    $class_id.html("ID : " + class_id);
    var groups_html = "";
    var lists_html = "";
    var group_number = parseInt(group_count);
    for (var group=1; group < group_number+1; group++) {
        if(group%3 == 0)
            lists_html += "<div class='col-md-2 info_box1 gr"+ group+"'><h3 style = 'text-align: center; color: white;'>Group "+ group + "</h3></div>";
        else if(group%3 == 1 )
            lists_html += "<div class='col-md-2 info_box  gr"+ group+"'><h3 style = 'text-align: center; color: white;'>Group "+ group + "</h3></div>";
        else
            lists_html += "<div class='col-md-2 info_box2 gr"+ group +"'><h3 style = 'text-align: center; color: white;'>Group "+ group + "</h3></div>";
        // $lists.append($("<div class = '"+group+" g'>"+ group +"</div>").attr('id', 'well')); //create new div
        groups_html += "<li>Group " + group;
        groups_html += "<div class='g" + group + "'></div></li>";
        var const_group = $("<option></option>")
        const_group.text("Group " + group);
        const_group.val(group);
        construction_groups.append(const_group);
    }                                                                                                                                                                                                                                                   
    $groups.html(groups_html);
    $lists.html(lists_html);
    
}


/**
 * @function create_admin response
 * @description adds an admin
 */
 function create_admin_response( check ){

    if (check == 0) {
        $new_username.css("border-color", "red");
        $error_new_username.show();
        $error_re_new_password.hide();
        $re_new_password.css("border-color", null);
    }

    else {
        $new_username.val("");
        $new_password.val("");
        $re_new_password.val("");
        $Secret.val("");
        alert("user created");

        $create_user_view.hide();
        $username_password_view.show();

        $error_new_username.hide();
        $new_username.css("border-color", null);
        $error_re_new_password.hide();
        $re_new_password.css("border-color", null);
    }
 }

/**
 * @function change_password response
 * @description tells the user if password was changed
 */
 function change_password_response(success) {
    if (success) {
        $current_password.val("");
        $changed_password.val("");
        $retyped_changed_password.val("");
        alert("Your password has been updated.")
    }
    else {
        $('.error_password_mismatch').hide();
        $changed_password.css('border-color',  '#CCCCCC'); 
        $retyped_changed_password.css('border-color', '#CCCCCC');
        $('.error_password_incorrect').show();
        $current_password.css('border-color',  'red'); 
    }
 }


/**
 * @function add_group_response
 * @description adds a group to the end of the list
 */
function add_group_response() {    
    $error_frame.html('');
    var new_group = "";
    var lists_html = "";
    var group_number = $('.groups > li:last').index() + 2;

    new_group += "<li>Group " + group_number;
    new_group += "<div class='g" + group_number + "'></div></li>";

    if(group_number%3 == 0)
        lists_html += "<div class='col-md-2 info_box1 gr"+ group_number +"'><h3 style = 'text-align: center; color: white;'>Group "+ group_number + "</h3></div>";
    else if(group_number%3 == 1 )
        lists_html += "<div class='col-md-2 info_box  gr"+ group_number +"'><h3 style = 'text-align: center; color: white;'>Group "+ group_number + "</h3></div>";
    else
        lists_html += "<div class='col-md-2 info_box2 gr"+ group_number +"'><h3 style = 'text-align: center; color: white;'>Group "+ group_number + "</h3></div>";
    $groups.append(new_group);
    $lists.append(lists_html);
}

/**
 * @function get_toolbar_response
 * @description refreshes the selection list of all the default toolbars
 */
function get_toolbar_response(response) {
    var $toolbar_select_opt = $('#toolbar_select option');
    $toolbar_select.html('');
    $toolbar_select_opt.length = 0;
    var selection_list = $toolbar_select[0];
    var default_tools = {};
    default_tools.name = $default_toolset_name;
    default_tools.tools = $default_toolset;
    var default_option = document.createElement('option');
    default_option.text = default_tools.name;
    default_option.tool = default_tools.tools;
    selection_list.add(default_option);
    for (var i = 0; i < response.toolbars.length; i++){
        var option = document.createElement('option');
        option.text = response.toolbars[i].toolbar_name;
        option.tool = response.toolbars[i].tools;
        selection_list.add(option);
    }

}

/**
 * @function delete_toolbar_response
 * @description deletes the selected toolbar
 */
function delete_toolbar_response(response) {
    var select = $toolbar_select[0];
    var id = select.selectedIndex;
    if($toolbar_select[0].options[id].text != $default_toolset_name){
        $toolbar_select[0][id].remove();    
    }else{
        alert('The default toolset cannot be deleted.');
    }
}

function get_xmls_response(response) {
    var $construction_select_opt = $('#construction_select option');
    $construction_select.html('');
    $construction_select_opt.length = 0;
    var selection_list = $construction_select[0];
    
    for (var i = 0; i < response.xmls.length; i++){
        var option = document.createElement('option');
        option.text = response.xmls[i].xml_name;
        option.xml = response.xmls[i].xml;
        option.toolbar = response.xmls[i].toolbar;
        selection_list.add(option);
    }

}

/**
 * @function delete_toolbar_response
 * @description deletes the selected toolbar
 */
function delete_xml_response(response) {
    var select = $construction_select[0];
    var id = select.selectedIndex;
    $construction_select[0][id].remove();    
}

/**
 * @function get_class_users_response
 * @description refreshes the selection list of all the default toolbars
 */
function get_class_users_response(response) {
    var toolbar_users_select = $(".toolbar_users");
    toolbar_users_select.html("");
    var class_users = response.class_users;
    for (var i = 0; i < class_users.length; i++){
        if(class_users[i].users.length > 0){
            var ogrp = $("<option></option>");
            var group = class_users[i].group;
            ogrp.text("Group " + group);
            ogrp.attr("class", "parent_group");
            ogrp.on("click",  function(){ $(this).prop('selected', false);
                $('.toolbar_users option[value^="'+ group + '|"').prop('selected', true);});
            toolbar_users_select.append(ogrp);

            for(var j = 0; j<class_users[i].users.length; j++){
                var opt = $("<option></option>");
                opt.text(class_users[i].users[j]);
                opt.attr("class", "child_group");
                opt.val(group + "|" + opt.text());
                toolbar_users_select.append(opt);
            }
        }
    }

}

/**
 * @function delete_group_response
 * @description deletes the last group from the list
 */
function delete_group_response() {
    $error_frame.html('');
    var group_number = $('.groups > li:last').index() + 1;
    $('.groups > li:last').remove(); 
    $('.g'+group_number).remove();
    $('.gr'+group_number).remove();
}

/**
 * @function delete_group_response
 * @description deletes the last group from the list
 */
function delete_class_response(class_id) {
    delete sessionStorage.admin_class_id;
}

/**
 * @function leave_class_response
 * @param {boolean} disconnect whether to delete the session storage
 * @description changes the admin view from a class to the login page
 */
function leave_class_response(disconnect) {
    $error_frame.html('');
    
    $create_view.show();
    $settings_tab.show();
    $class_view.hide();
    $design_icons.empty();
    $design_tab.hide();
    $view_tab.hide();
    $filtered_merged_view_tab.hide();
    $overlayed_image_view_tab.hide();

    $error_class_input.hide();
    $empty_class_input.hide();

    $class_input.css("border-color", null);
    $class_input.val("");
    $group_input.val("");

    if(!disconnect){
        sessionStorage.removeItem('admin_class_id');
    }
    socket.get_classes($secret, localStorage.getItem('admin_id'));
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
    var $real_people = $('.gr' + group_id);
    if (status) {
        for (var i in group) {
            var member = '<li id="' + group[i].member_name +'"><ul><li>';
            member += group[i].member_name;
            member += '</li></ul></li>';

            var real_member = '<p id="l' + group[i].member_name +'"style = "text-align : center; color: white;">'+group[i].member_name;+'</p>';
            
            $people.append(member);
            $real_people.append(real_member);
        }
    }
    else {
        username = username.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        username = escapeStr(username);
        $('li[id="' + username + '"]').remove();
        $('p[id="l' + username + '"]').remove();
    }
    // Update the user toolbar select
    socket.get_class_users(sessionStorage.getItem('admin_class_id'),'get-class-users-response');
}

/**
 * @function get_classes_response
 * @param {array[object]} classes array of objects holding classes and their hashed IDs
 * @description appends list objects of Classes and their IDs to an unordered list in admin.html
 */
function get_classes_response(classes, secret){
    $username_password_view.hide();
    $create_view.show();
    $settings_tab.show();
    $class_view.hide();

    sessionStorage.setItem('admin_secret', secret);

    $get_classes.html('');
    for (var i = 0; i < classes.length; i++) {
        $get_classes.append('<button class="btn btn-primary" onclick=\'join_class("'
            + classes[i].hashed_id + '")\'><span>' + classes[i].class_name + '</span></button>');
    }
}

/**
 * @function check_username response
 * @param admin id and password
 * @description logs the user in and creates a session
 */
function check_username_response(admin_id, check){
    if(check == 0){
        $username.css("border-color", "red");
        $('.error_username').show();
        $('.error_password').hide();
        $password.css("border-color", null);
    } else if (check == -1){
        $password.css("border-color", "red");
        $('.error_password').show();
        $('.error_username').hide();
        $username.css("border-color", null);
    } else{
        $username.val("");
        $password.val("");

        var string = Math.random().toString(36).substr(2, 8).toLowerCase(); 
        socket.create_session(admin_id, string);
        localStorage.setItem("check", string);
        localStorage.setItem("admin_id", admin_id);
        socket.get_classes("ucd_247", admin_id);
    }

}

/**
 * @function check_session response
 * @param admin id and password
 * @description checks a session
 */
function check_session_response(admin_id, check){
    if(check == 1){
        socket.get_classes("ucd_247", admin_id);
    } else if(check == -1){
        socket.delete_session(admin_id);
        localStorage.setItem('admin_id', '');
        localStorage.setItem('check', '');
        sessionStorage.setItem('admin_secret', '');
    } else if(check == 0 ){
        localStorage.setItem('admin_id', '');
        localStorage.setItem('check', '');
        sessionStorage.setItem('admin_secret', '');
    }
}

/**
 * @function join_class
 * @param class_id
 * @description for letting student join class
 */
function join_class(class_id){
	//Adds a Link to a Pre-filled Class ID Student Page
    var current_path = window.location.pathname;
    document.getElementById('student_class_id_link').href = current_path.substring(0,window.location.pathname.lastIndexOf('/')) + "/student.html?class_id="+class_id; 
    
    socket.join_class(class_id, $secret);
}

//This function registers listeners on geogebra initialization 
function ggbOnInit(arg) {
    var name, num, index = arg.search('[0-9]');
    var applet = document[arg];
    applet.setCoordSystem(-10,10,-10,10);
    applet.evalCommand("SetAxesRatio(1,1)");
    applet.setAxisSteps(1,2,2,2);
    applet.evalCommand("CenterView[(0,0)]");
    //applet.evalCommand("ZoomOut[4,(0,0)]");       
    process_msgs_in_queue();
    // fix for view tab applets not loading current group xml
    applet.registerAddListener("addLock");
}

function applet_xml_response(username, class_id, group_id, xml, properties, received_xml_update_ver){
    if(xml == undefined){
        xml = '{}';
    }
    adminP2PAppletSetXML(xml, toolbar, properties, group_id, username, null, null);
    process_msgs_in_queue();
}

function get_admin_applet_xml_response(username, class_id, group_id){
    if (admin_data_per_group[group_id] != null){
        var admin_xml_sent = admin_data_per_group[group_id].xml;
        socket.send_admin_applet_xml(admin_xml_sent, username, class_id, group_id);
    }
}

//Called when the Live/Not Live Toggle is Set/Unset for the Merged View
function liveUpdatesCheckboxChangeMerge(checkbox)
{
    if(checkbox.checked == true)
    {
        view_merge(this); 
    }
}

//Called when the Live/Not Live Toggle is Set/Unset for the Filtered Merged View
function liveUpdatesCheckboxChangeFilteredMerge(checkbox)
{
    if(checkbox.checked == true)
    {
        filtered_view_merge(this); 
    }
}

//handler for xml_change response, appends message to chatbox, and calls appletSetExtXML()
//TODO: Get rid of other params and keep only data
function xml_update_response(username, class_id, group_id, xml, toolbar, properties, obj_xml, obj_label, obj_cmd_str, type_of_req, xml_update_ver, new_update, data) {
    if(!is_admin_xml_update_queue_empty && new_update){
        admin_xml_update_queue.enqueue(data);
        return;
    }
    console.log("Begin xml_update_response - " + obj_label);
    var tab = $('a[data-toggle="tab"][aria-expanded=true]').html();
    var numgroups = ($('ul.groups div').length)+1;

    // The folowing nippet of code updates the admin applets on the view tab even while hidden
    var changes_to_view_tab = true;
    randomizeColors(gen_new_colors,filtered_merged_view_obj_colors[group_id-1],document['applet' + group_id]);
    appletUpdate(xml, toolbar, null, group_id, username, obj_xml, obj_label, obj_cmd_str, type_of_req, changes_to_view_tab);
    if($('#myonoffswitchmerge').is(':checked')){
        var group_members_array = $('.g' + group_id)[0].childNodes
        randomizeColorsMergedView(filtered_merged_view_obj_colors[group_id-1],document['applet' + numgroups], group_members_array);
        appletUpdate(xml, toolbar, null, numgroups, username, obj_xml, obj_label, obj_cmd_str, type_of_req, changes_to_view_tab);
    }
    
    if(tab == "Filtered Merged View")
    {
        appletUpdate(xml, toolbar, null, group_id, username, obj_xml, obj_label, obj_cmd_str, type_of_req);
        if($('.filtered_unmergeview_button').is(":visible") && $('#myonoffswitchfilteredmerge').is(':checked'))
        {
            // filtered_view_merge(this);
            appletUpdate(xml, toolbar, null, numgroups, username, obj_xml, obj_label, obj_cmd_str, type_of_req);
        }
    }
    else if(tab == "Overlayed Image View")
    {
        var id = 'img_' + group_id;
        $('#img_'+group_id+'').remove();
        
        appletUpdate(xml, toolbar, null, group_id, username, obj_xml, obj_label, obj_cmd_str, type_of_req);

        var img = '<img src="data:image/png;base64,'+document['overlayed_image_view_applet'+group_id].getPNGBase64(1.5, true, undefined)+'" id="img_'+group_id+'" style="position:absolute;">';
        $('#overlayed_image_div .panel-body').append(img);
    }
    console.log("END xml_update_response - " + obj_label);
}

//handler for xml_change response, appends message to chatbox, and calls appletSetExtXML()
function xml_change_response(username, class_id, group_id, xml, toolbar) {
    var tab = $('a[data-toggle="tab"][aria-expanded=true]').html();
    if(tab == "View")
    {
        appletSetExtXML(xml, toolbar, null, group_id);
        if($('.unmergeview_button').is(":visible") && $('#myonoffswitchmerge').is(':checked'))
        {
            view_merge(this);
        }

    }
    else if(tab == "Filtered Merged View")
    {
        appletSetExtXML(xml, toolbar, null, group_id);
        if($('.filtered_unmergeview_button').is(":visible") && $('#myonoffswitchfilteredmerge').is(':checked'))
        {
            filtered_view_merge(this);
        }
    }
    else if(tab == "Overlayed Image View")
    {
        var id = 'img_' + group_id;
        $('#img_'+group_id+'').remove();
        
        appletSetExtXML(xml, toolbar, null, group_id);

        var img = '<img src="data:image/png;base64,'+document['overlayed_image_view_applet'+group_id].getPNGBase64(1.5, true, undefined)+'" id="img_'+group_id+'" style="position:absolute;">';
        $('#overlayed_image_div .panel-body').append(img);
    }
    
    //ggbOnInit();
}

function process_msgs_in_queue(){
    while(!admin_xml_update_queue.isEmpty()){
        var update = admin_xml_update_queue.dequeue();
        xml_update_response(update.username, update.class_id, update.group_id, update.xml, update.toolbar, update.properties, update.obj_xml, update.obj_label, update.obj_cmd_str, update.type_of_req, update.recv_xml_update_ver, false, update.data);
    }
    is_admin_xml_update_queue_empty = true;
}

//calls appletSetExtXML() to update the local geogebra applet.
function get_xml_response(username, class_id, group_id, xml, toolbar){
    if(xml == undefined){
        xml = '{}';
    }
    appletSetExtXML(xml, toolbar, null, group_id);
}

//called on checkbox change, shows/hides box based on if checked or not
function views_change(event){
    var box = $(event)[0];
    var $view = $("."+box.name);
    var group_id = box.name.split('_')[2];

    if(box.checked){
    	$('#img_'+group_id).show();
        $view.show();
    } else {
    	$('#img_'+group_id).hide();
        $view.hide();
    }
}

//called on merge view button press in the views tab
//this parses the xml of all shown groups and condenses
//them into one XML for appletSetExtXML to evaluate
function view_merge(event){
    $('.mergeview_button').hide();
    $('.unmergeview_button').show();
    $('.onoffswitch').show();
    $clear_buttons.hide();

    var XMLs = "";
    var array = $('#views_checkboxes :checked');
    var counter = 0, count = 0; // for checking and not deleteing the first admin objects
    var numgroups = ($('ul.groups div').length)+1;
    var applet = document['applet' + numgroups];
    var cur_xml = applet.getXML();
    var cur_xml_doc = $.parseXML(cur_xml);
    var cur_construction = $(cur_xml_doc).find('construction')[0];

    for (var i = 0; i < array.length ; i++){
        var value = array[i]["value"];
        var num = array[i]["value"].substr(value.lastIndexOf('t') + 1 , value.length - value.lastIndexOf('t'));
        randomizeColors(gen_new_colors,filtered_merged_view_obj_colors[parseInt(num)-1],document[value]);
        var parsing = document[value].getXML();
        var xml;
        
        var new_construction = $($.parseXML(parsing)).find('construction')[0];

        XMLs += new_construction.innerHTML;

       
        $("." + array[i]["name"]).hide()

    }
    cur_construction.innerHTML = XMLs;
    var final_xml = '"' + $(cur_xml_doc).find('geogebra')[0].outerHTML + '"';
    
    appletSetExtXML(final_xml, '', null, numgroups);
    var numelems = applet.getObjectNumber();
    for (i = 0; i < numelems; i++){
        var name = applet.getObjectName(i);
        applet.setFixed(name, false, true);
    }
    
    applet.setPerspective('G');
    applet.setCoordSystem(-10,10,-10,10);
    applet.evalCommand("SetAxesRatio(1,1)");
    applet.setAxisSteps(1,2,2,2);
    applet.evalCommand("CenterView[(0,0)]");
    $('#views_checkboxes :checkbox').hide();
    $('.merge_group').css('visibility','visible');
}

//TODO: Remove this once we know the above approach is good enough.
function view_merge_old(event){
    $('.mergeview_button').hide();
    $('.unmergeview_button').show();
    $clear_buttons.hide();

    var XMLs = "";
    var array = $('#views_checkboxes :checked');
    var counter = 0, count = 0; // for checking and not deleteing the first admin objects
    var numgroups = ($('ul.groups div').length)+1;
    var applet = document['applet' + numgroups];
    var cur_xml = applet.getXML();
    var cur_xml_doc = $.parseXML(cur_xml);
    var cur_construction = $(cur_xml_doc).find('construction')[0];

    for (var i = 0; i < array.length ; i++){
        var value = array[i]["value"];
        var num = array[i]["value"].substr(value.lastIndexOf('t') + 1 , value.length - value.lastIndexOf('t'));
        randomizeColors(gen_new_colors,filtered_merged_view_obj_colors[parseInt(num)-1],document[value]);
        var parsing = document[value].getXML();
        var xml;

        [xml, counter] = rename_labels(parsing, num, counter);
        
        if (counter == 1 && count == 0) // if these are the first admin objects dont delete them
            count++;
        else if(counter == 1)  // if these are not the first admin objects delete them 
            xml = remove_admin_objects(xml);

        var new_construction = $($.parseXML(xml)).find('construction')[0];

        XMLs += new_construction.innerHTML;

       
        $("." + array[i]["name"]).hide()

    }
    cur_construction.innerHTML = XMLs;
    var final_xml = '"' + $(cur_xml_doc).find('geogebra')[0].outerHTML + '"';
    
    appletSetExtXML(final_xml, '', null, numgroups);
    var numelems = applet.getObjectNumber();
    for (i = 0; i < numelems; i++){
        var name = applet.getObjectName(i);
        applet.setFixed(name, false, true);
    }
    
    applet.setPerspective('G');
    applet.setCoordSystem(-10,10,-10,10);
    applet.evalCommand("SetAxesRatio(1,1)");
    applet.setAxisSteps(1, 2,2,2);
    applet.evalCommand("CenterView[(0,0)]");
    $('#views_checkboxes :checkbox').hide();
    $('.merge_group').css('visibility','visible');
}

/*
function rename_labels_on_merge(applet, num){
    var objs = applet.getAllObjectNames();
    for(i = 0; i < objs.length; i++){
        applet.renameObject(objs[i], objs[i] + "grp" + num); //Could try grp1,grp2,etc instead of __g1
    }
    var xobj = $.parseXML(applet.getXML());
    var new_xml = $(xobj).find('geogebra')[0].outerHTML;
    return new_xml;
}
*/

//this is used to remove admin objects past those in the first group
//so we don't have duplicate points in the construction
function remove_admin_objects(xml, counter){
    var xobj = $.parseXML(xml);
    var commands = $(xobj).find('construction').find('command');
    var elements = $(xobj).find('construction').find('element');
    var deleted_array = [];

    if(elements != undefined){
        for(i = elements.length-1; i >= 0; i--){
            var caption = $(elements[i]).find('caption')[0];
            if(caption !== undefined){
                caption = caption.attributes[0];
                if (caption.value.includes("unassigned")){
                    var label = $(elements[i])[0].attributes[1]
                    deleted_array.push(label.value);
                    $(elements[i]).remove();
                }
            }
        }
    }

    if(commands !== undefined){
        for(var i = commands.length-1; i >= 0; i--){
            var inputs = $(commands[i]).find('input')[0].attributes;
            for(var j = 0; j < inputs.length; j++){
                if (deleted_array.includes(inputs[j].value)) {
                    $(commands[i]).remove();
                    break;
                }
            }
        } 
    }

    var new_xml = $(xobj).find('geogebra')[0].outerHTML;
    return new_xml;
}

//this is used to rename all object labels within the given XML to 
//have their group number added onto the end, preventing conflicts
//when merging multiple XMLs together
/*
function rename_labels(xml, num, counter){
    var xobj = $.parseXML(xml);
    var commands = $(xobj).find('construction').find('command');
    var elements = $(xobj).find('construction').find('element');
    var regex = /[A-Z]+(?![a-z])|^[A-Z]*[a-z]+[0-9]*(?![a-zA-Z])/g;

    if(commands !== undefined){
        for(var i = 0; i < commands.length; i++){
            var inputs = $(commands[i]).find('input')[0].attributes;
            for(var j = 0; j < inputs.length; j++){
                var result, index, indices = [];
                while(result = regex.exec(inputs[j].value)){
                    indices.push(result.index + result[0].length);
                }
                while (index = indices.pop()){
                    inputs[j].value = inputs[j].value.slice(0, index) + "g" + num + inputs[j].value.slice(index);
                }
                console.log(inputs[j].value);
                //inputs[j].value = inputs[j].value + "g" + num;
            }
            var outputs = $(commands[i]).find('output')[0].attributes;
            for(var j = 0; j < outputs.length; j++){
                outputs[j].value = outputs[j].value + "g" + num;
            }
        } 
    }

    if(elements != undefined){
        for(i = 0; i < elements.length; i++){
            var label = $(elements[i])[0].attributes[1];
            label.value = label.value + "g" + num;
            var caption = $(elements[i]).find('caption')[0];
            if(caption !== undefined){
                caption = caption.attributes[0];
                if(caption.value.includes("unassigned")){
                    counter = 1;
                }
                caption.value = caption.value + "g" + num;
            }
        }
    }

    var new_xml = $(xobj).find('geogebra')[0].outerHTML;
    return [new_xml, counter];
}
*/

//this is called when the unmerge views button is pressed.
//it shows all hidden divs from the merge view
function unmerge_views(event){
    $('.onoffswitch').hide();
    $('#views_checkboxes :checkbox').show();
    $('.mergeview_button').show();
    $('.unmergeview_button').hide();
    $('.merge_group').css('visibility','hidden');
    $clear_buttons.show();

    var array = $('#views_checkboxes :checked');
    for (var i = 0; i < array.length; i++){
        $("." + array[i]["name"]).show();
        var value = array[i]["value"];
        //randomizeColors(true,[],document[value], 'default');
    }
}

//called on merge view button press in the Filtered Mergeview tab
//this parses the xml of all shown groups and condenses
//them into one XML for appletSetExtXML to evaluate
function filtered_view_merge(event){
    $('.filtered_mergeview_button').hide();
    $('.filtered_unmergeview_button').show();
    $('.onoffswitch').show();
    $clear_buttons.hide();

    var XMLs = "";
    var array = $('#group_select_checkboxes :checked');
    var counter = 0, count = 0; // for checking and not deleting the first admin objects
    var numgroups = ($('ul.groups div').length)+1;
    var applet = document['merged_view_applet' + numgroups];

    var cur_xml = applet.getXML();
    var cur_xml_doc = $.parseXML(cur_xml);
    var cur_construction = $(cur_xml_doc).find('construction')[0];

    var selected_objs_for_merging = [];
    $('[name="merge_objs"]:checked').each(function() {
        selected_objs_for_merging.push($(this).attr('value'));
    });

    for (var i = 0; i < array.length ; i++){
        var value = array[i]["value"];
        var num = array[i]["value"].substr(value.lastIndexOf('t') + 1 , value.length - value.lastIndexOf('t'));
        randomizeColors(gen_new_colors,filtered_merged_view_obj_colors[parseInt(num)-1],document[value]);      
        var parsing = document[value].getXML();
        var xml;

        var new_construction = $($.parseXML(parsing)).find('construction')[0];

        XMLs += new_construction.innerHTML;
       
        $("." + array[i]["name"]).hide()

    }
    cur_construction.innerHTML = XMLs;
    var final_xml = '"' + $(cur_xml_doc).find('geogebra')[0].outerHTML + '"';

    appletSetExtXML(final_xml, '', null, numgroups);
    var numelems = applet.getObjectNumber();
    for (i = 0; i < numelems; i++){
        var name = applet.getObjectName(i);
        applet.setFixed(name, false, true);
    }
    
    applet.setPerspective('G');
    applet.setCoordSystem(-10,10,-10,10);
    applet.evalCommand("SetAxesRatio(1,1)");
    applet.setAxisSteps(1, 2,2,2);
    applet.evalCommand("CenterView[(0,0)]");
    $('#group_select_checkboxes :checkbox').hide();
    $('#filter_merge_items .panel-body :checkbox').hide();
    $('.filtered_merge_group').css('visibility','visible');
}

//Called when the unmerge views button on the Filtered Mergeview Tab is pressed.
//it shows all hidden divs from the merge view
function filtered_unmerge_views(event){
    $('#group_select_checkboxes :checkbox').show();
    $('.filtered_mergeview_button').show();
    $('.filtered_unmergeview_button').hide();
    $('.onoffswitch').hide();
    $('#myonoffswitch').prop('checked', true);
    $('#filter_merge_items .panel-body :checkbox').show();
    $('.filtered_merge_group').css('visibility','hidden');
    $clear_buttons.show();

    var array = $('#group_select_checkboxes :checked');
    for (var i = 0; i < array.length; i++){
        $("." + array[i]["name"]).show();
        var value = array[i]["value"];
        //randomizeColors(document[value], 'default');
    }
}

//Filter Objects based on the User's Selection of types to Merge on the Filtered Merge View Tab
function filter_objects(xml,objs_to_be_merged){
    var xobj = $.parseXML(xml);
    var commands = $(xobj).find('construction').find('command');
    var elements = $(xobj).find('construction').find('element');
    var deleted_array = [];

    var is_obj_to_be_kept = 0;

    if(elements != undefined){
        for(i = elements.length-1; i >= 0; i--){
            var obj_type = $(elements[i]).attr('type');
            if(obj_type !== undefined){
                is_obj_to_be_kept = 0;
                for(var j = 0; j < objs_to_be_merged.length; j++)
                {
                    if (obj_type.trim() === objs_to_be_merged[j].trim()){
                        is_obj_to_be_kept = 1;
                        break;
                    }
                }
                if(is_obj_to_be_kept == 0)
                {
                    var label = $(elements[i])[0].attributes[1];
                    deleted_array.push(label.value);
                    $(elements[i]).remove();
                }
            }
        }
    }
    if(commands !== undefined){
        for(var i = commands.length-1; i >= 0; i--){
            var inputs = $(commands[i]).find('input')[0].attributes;
            var outputs = $(commands[i]).find('output')[0].attributes;
            for(var j = 0; j < inputs.length; j++){
                var inputs_array = inputs[j].value.split(",");
                for (var k = 0; k < inputs_array.length; k++){
                    console.log(inputs_array[k].replace(/[^0-9a-zA-Z_]/gi, ''));
                    if (deleted_array.includes(inputs_array[k].replace(/[^0-9a-zA-Z_]/gi, ''))) {
                        $(commands[i]).remove();
                        break;
                    }
                }
            }
            for(var j = 0; j < outputs.length; j++){
                if (deleted_array.includes(outputs[j].value)) {
                    $(commands[i]).remove();
                    break;
                }
            }
        } 
    }

    var new_xml = $(xobj).find('geogebra')[0].outerHTML;
    return new_xml;
}

//this is called when a user presses the hyperlink for group i
//in the View tab
function redirect(i){
    $('#redirect_modal').attr("group_id", i);
    $('#redirect_modal').modal('show');
}

//this is called when the user submits a username after the
//redirect modal is opened
function redirect_modal_submit(group, username) {
    username = username.trim();
    if (username == "") return;
    if (!valid_username(username)) {
        if (username == "admin") {
            $('#redirect_username_error_admin').show();
            $('#redirect_username_error').hide();
        }
        else {
            $('#redirect_username_error_admin').hide();
            $('#redirect_username_error').show();
        }
        $('#redirect_username').css("border-color", "red");
        $('#redirect_modal').modal('show');
        return;
    }
    $('#redirect_username_error_admin').hide();
    $('#redirect_username_error').hide();
    $('#redirect_username').css("border-color", "rgb(204,204,204)");
    $('#redirect_modal').modal('hide');
    $('#redirect_username').val("");

    var class_id = "class_id=" + sessionStorage.getItem('admin_class_id');
    var group_id = "group_id=" + group;
    var user_id = "username=" + username;
    var data = [class_id, group_id, user_id];
    var packed = escape(data[0]);
    for (var i = 1; i < data.length; i++) 
        packed += "&" + escape(data[i]);
    window.open("student.html?" + packed, "_blank","toolbar=yes,menubar=yes,scrollbars=yes,resizable=yes,width=" + window.outerWidth + ",height=" + window.outerHeight);
}

//this function validates the username submitted to the redirect modal
function valid_username(username) { 
    var alphanum = /^[A-Za-z][A-Za-z0-9]*$/;
    if (username.match(alphanum) && username.length < 9) {  
        // if (username == "admin") {
        //     return false;
        // }
        return true;  
    }
    else {   
        return false;
    }  
}

