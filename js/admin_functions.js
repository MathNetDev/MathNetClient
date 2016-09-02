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
    var $class_view = $('.class_view');
    var $settings_view = $('.settings_view');
    var $class_name = $('.class_name');
    var $groups = $('.groups');
    var $design_tab = $('#design_tab');
    var $view_tab = $('#view_tab');

    sessionStorage.setItem('admin_class_id', class_id);
    $('#error_frame').html('');

    $secret_view.hide();
    $create_view.hide();
    $class_view.show();
    $design_tab.show();
    $view_tab.show();

    $class_name.html(class_name + " ID: " + class_id);
    var groups_html = "";
    var group_number = parseInt(group_count);
    for (var group=1; group < group_number+1; group++) {
        groups_html += "<li>Group " + group;
        groups_html += "<div class='g" + group + "'></div></li>";
    }
    $groups.html(groups_html);
    
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
    new_group += "<div class='g" + group_number + "'></div></li>";
    $groups.append(new_group);
}

/**
 * @function get_toolbar_response
 * @description refreshes the selection list of all the default toolbars
 */
function get_toolbar_response(response) {

    document.getElementById("mySelect").options.length = 0;
    var selection_list = document.getElementById("mySelect");

    //console.log(response.toolbars.length);

    for (var i = 0; i < response.toolbars.length; i++){
        
        var option = document.createElement("option");
        option.text = response.toolbars[i].toolbar_name;
        option.tool = response.toolbars[i].tools;
        selection_list.add(option);
    }

}

/**
 * @function get_toolbar_response
 * @description refreshes the selection list of all the default toolbars
 */
function delete_toolbar_response(response) {


    var select = document.getElementById("mySelect");
    var id = select.selectedIndex;
    //console.log(id);
    document.getElementById("mySelect").remove(id);

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
 * @function delete_group_response
 * @description deletes the last group from the list
 */
function delete_class_response(class_id) {
    //console.log("hellos");
    delete sessionStorage.admin_class_id;
     //console.out(classes.available_classes[0]);
}


/**
 * @function leave_class_response
 * @param {boolean} disconnect whether to delete the session storage
 * @description changes the admin view from a class to the login page
 */
function leave_class_response(disconnect) {
    var $secret_view = $('.secret_view');
    var $create_view = $('.create_view');
    var $class_view = $('.class_view');
    var $secret = $('.secret');
    var $design_tab = $('#design_tab');
    var $design_icons = $('.toolbar-target');
    var $view_tab = $('#view_tab');
    $('#error_frame').html('');
    
    $secret_view.hide();
    $create_view.show();
    $class_view.hide();
    $design_icons.empty();
    $design_tab.hide();
    $view_tab.hide();

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
            var member = '<li id="' + group[i].member_name +'"><ul><li>';
            member += group[i].member_name;
            member += '</li></ul></li>';
            $people.append(member);
        }
    }
    else {
        username = username.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        username = escapeStr(username);
        $('li[id="' + username + '"]').remove();
        console.log(group_id);
    }
}

/**
 * @function get_classes_response
 * @param {array[object]} classes array of objects holding classes and their hashed IDs
 * @description appends list objects of Classes and their IDs to an unordered list in admin.html
 */
function get_classes_response(classes, secret){
    var $secret_view = $('.secret_view');
    var $create_view = $('.create_view');
    var $class_view = $('.class_view');
    
    $secret_view.hide();
    $create_view.show();
    $class_view.hide();

    $secret_view.hide();
    $create_view.show();
    $class_view.hide();

    sessionStorage.setItem('admin_secret', secret);

    $('#get-classes').html('');
    for (var i = 0; i < classes.length; i++) {
        //console.log(classes[i]);
        $('#get-classes').append('<button class="btn btn-primary" onclick=\'join_class("'
            + classes[i].hashed_id + '")\'>Class: <span>' + classes[i].class_name + '</span> ID: <span>'
            + classes[i].hashed_id + '</span></button>');
    }
}

function join_class(class_id){
    var $secret = $('.secret'); 
    socket.join_class(class_id, $secret.val().trim());
}

//This function registers listeners on geogebra initialization 
function ggbOnInit(arg) {
    console.log(arg);
    document[arg].evalCommand("CenterView[(0,0)]");
    document[arg].evalCommand("ZoomOut[4,(0,0)]");
    document[arg].setCustomToolBar('');
    var name, num, index = arg.search('[0-9]');
    if (index != -1){
        num = arg.slice(index);
        name = arg.slice(0, index);
        if (name == "applet" && num <= $('ul.groups div').length){
            var classname = $('.class_name').html().split(' ').pop();
            socket.get_xml('admin', classname, num);
        }
    }
}

//handler for xml_change response, appends message to chatbox, and calls appletSetExtXML()
function xml_change_response(username, class_id, group_id, xml, toolbar) {
    appletSetExtXML(xml, toolbar, group_id);
    //ggbOnInit();
}

//calls appletSetExtXML() to update the local geogebra applet.
function get_xml_response(username, class_id, group_id, xml, toolbar){
    if(xml == undefined){
        xml = '{}';
    }
    appletSetExtXML(xml, toolbar, group_id);
}

//called on checkbox change, shows/hides box based on if checked or not
function views_change(event){
    var box = $(event)[0];
    var $view = $("."+box.name);

    if(box.checked){
        $view.show();
    } else {
        $view.hide();
    }
}

//called on merge view button press in the views tab
//this parses the xml of all shown groups and condenses
//them into one XML for appletSetExtXML to evaluate
function view_merge(event){
    $('.mergeview_button').hide();
    $('.unmergeview_button').show();

    var XMLs = {};
    var array = $('#views_checkboxes :checked');

    for (var i = 0; i < array.length; i++){
        var value = array[i]["value"];
        var parsing = document[value].getXML();
        var obj = x2js.xml_str2json(parsing);
        var num = array[i]["value"].substr(-1, 1);

        obj = rename_labels(obj, num);
        _.mergeWith(XMLs, obj, function (a, b) {
          if (_.isArray(a)) {
            return a.concat(b);
          }
        });
        //$.extend(true, XMLs, obj);
        $("." + array[i]["name"]).hide()
    }
    var final_xml = x2js.json2xml_str(XMLs);
    final_xml = JSON.stringify(final_xml);
    var numgroups = ($('ul.groups div').length)+1;

    appletSetExtXML(final_xml, '', numgroups);

    $('#views_checkboxes :checkbox').hide();
    $('.merge_group').show();
}

//this is used to rename all object labels within the given XML to 
//have their group number added onto the end, preventing conflicts
//when merging multiple XMLs together
function rename_labels(xml, num){
    console.log(xml);
    var elem_to_index = {};
    if((xml.geogebra).hasOwnProperty('construction')){
        if((xml.geogebra.construction).hasOwnProperty('element')){
            var array = xml.geogebra.construction.element;

            if(array !== null && typeof array === 'object' && !(array instanceof Array)){
                var temp = array;
                array = [];
                array.push(temp);
            }
            for (var i = 0; i < array.length; i++){
                if ("caption" in array[i]){
                    console.log(array[i]["caption"]);
                    var elem = array[i]["caption"]["_val"];
                    array[i]["caption"]["_val"] = elem + "g" + num;
                    if (!(elem in elem_to_index)){
                        elem_to_index[elem] = array[i]["caption"]["_val"];
                    }
                }
            }
            xml.geogebra.construction.element = array;
        }

        if((xml.geogebra.construction).hasOwnProperty('command')){
            var array = xml.geogebra.construction.command;

            if(array !== null && typeof array === 'object' && !(array instanceof Array)){
                var temp = array;
                array = [];
                array.push(temp);
            }

            for (var i = 0; i < array.length; i++){
                for (var point in array[i].input){
                    var elem = array[i]["input"][point]
                    if(elem in elem_to_index){
                        array[i]["input"][point] = elem_to_index[elem];
                    }
                }

            }
            xml.geogebra.construction.command = array;
        }
    }
    return xml;

}

//this is called when the unmerge views button is pressed.
//it shows all hidden divs from the merge view
function unmerge_views(event){
    $('#views_checkboxes :checkbox').show();
    $('.mergeview_button').show();
    $('.unmergeview_button').hide();
    $('.merge_group').hide();

    var array = $('#views_checkboxes :checked');
    for (var i = 0; i < array.length; i++){
        $("." + array[i]["name"]).show();
    }

    // for(i = 0; i < numelems; i++){
    //     var name = document.
    // }
}
