//all document.applet (geogebra) calls are documented at http://www.geogebra.org/manual/en/Reference:JavaScript
var cur_xml = '<xml/>';
appletName = document.applet;
var timeoutHandle;
var keypressHandler;
var $default_toolset = '0|1,501,67,5,19,72,75,76|2,15,45,18,65,7,37|4,3,8,9,13,44,58,47|16,51,64,70|10,34,53,11,24,20,22,21,23|55,56,57,12|36,46,38,49,50,71|30,29,54,32,31,33|17,26,62,73,14,68|25,52,60,61|40,41,42,27,28,35,6';

var currentLabel;
var finalApplet;
var stepSize = 1.0;
var objectCount = 1;

function addListener(obj_label){
    applet.unregisterUpdateListener("updateListener");
    var username;
    if (sessionStorage.getItem('username') != null && sessionStorage.getItem('username') != "admin")
        username = sessionStorage.getItem('username');
    else
    {
        username = "unassigned";
    }

    var new_obj_label = username + "_{" + document.applet.getObjectNumber() + "}";
    objectCount++;

    setTimeout(function(){
        document.applet.renameObject(obj_label, new_obj_label);
        document.applet.setCaption(new_obj_label, username);
        var type = document.applet.getObjectType(new_obj_label);
        if (type === 'point'){
            document.applet.setLabelStyle(new_obj_label, 3);
        }
        document.applet.evalCommand("UpdateConstruction()");
        send_xml(document.applet.getXML(), document.applet.getXML(new_obj_label), new_obj_label, document.applet.getCommandString(new_obj_label), socket, 'add');
        applet.registerUpdateListener("updateListener");
    }, 0, obj_label, new_obj_label);
}

function updateListener(obj_label){
    var ggb_user = document.applet.getCaption(obj_label);
    var username = sessionStorage.getItem('username');
    var move = document.applet.isMoveable(obj_label);
    var type = document.applet.getObjectType(obj_label);
    var isPoint = (type == "point");

    applet.unregisterUpdateListener("updateListener");
    
    if(username !== ggb_user && isPoint && ggb_user != "unassigned"){
        if (username != "admin" && move){
            if(objType == 'numeric' || objType == 'textfield'){
                appletName.setFixed(name, true, false);
            } else {
                appletName.setFixed(name, true);
            }
        } else if (username == "admin" && !move){
            if(objType == 'numeric' || objType == 'textfield'){
                appletName.setFixed(name, false, true);
            } else {
                appletName.setFixed(name, false);
            }
        }
    }else if(username == ggb_user || ggb_user == "unassigned"){
        document.applet.setFixed(obj_label, false, true);
    }

    if(ggb_user == "unassigned" && username != "admin" ){
        document.applet.setCaption(obj_label, username);
    } else if (ggb_user != "unassigned" && username == "admin"){
        document.applet.setCaption(obj_label, "unassigned");
    }
    document.applet.registerUpdateListener("updateListener");
    send_xml(document.applet.getXML(), document.applet.getXML(obj_label), obj_label, document.applet.getCommandString(obj_label), socket, 'update');   
}

function removeListener(obj_label){
    setInterval(function(){
        document.applet.evalCommand("N : (2,2)");
        document.applet.evalCommand("D : (1,1)");
    }, 5);
    send_xml(document.applet.getXML(), null, obj_label, null, socket, 'remove');  
}

//Makes a socket call to the server 
function send_xml(xml, obj_xml, obj_label, obj_cmd_str, socket, type_of_req){
        cur_xml = xml;
        var $messages = $("#messages");
        var username = sessionStorage.getItem('username');
        var class_id = sessionStorage.getItem('class_id');
        var group_id = sessionStorage.getItem('group_id');
        var data = {
                username: username,
                class_id: class_id,
                group_id: group_id,
                xml: cur_xml,
                toolbar: '',
                toolbar_user: '',
                obj_xml: obj_xml,
                obj_label: obj_label,
                obj_cmd_str: obj_cmd_str,
                type_of_req: type_of_req,
                xml_update_ver: xml_update_ver,
                new_update: true
            };
        socket.xml_update(data);
        xml_update_ver = xml_update_ver + 1;
}

function appletUpdate(xml, toolbar, properties, id, username, obj_xml, obj_label, obj_cmd_str, type_of_req){
    var final_xml;
    var appletName = document.applet;

    if (typeof document['applet' + id] !== 'undefined'){
        appletName = document['applet' + id];
    }

    //Get Appropriate appletName depending on the Currently Active View/Tab
    if ($('a[data-toggle="tab"][aria-expanded=true]').html() == "View" && typeof document['applet' + id] !== 'undefined')
    {
        appletName = document['applet' + id];
    }
    else if ($('a[data-toggle="tab"][aria-expanded=true]').html() == "Filtered Merged View" && typeof document['merged_view_applet' + id] !== 'undefined')
    {
        appletName = document['merged_view_applet' + id];
    }
    else if($('a[data-toggle="tab"][aria-expanded=true]').html() == "Overlayed Image View" && typeof document['overlayed_image_view_applet' + id] !== 'undefined')
    {
        appletName = document['overlayed_image_view_applet' + id];
    }

    if(properties != null && properties.hasOwnProperty('perspective')){
        // need to set the perspective before setting the XML
        appletName.setPerspective(properties['perspective']);
    }

    var rgb_color = null;
    if(sessionStorage.getItem('admin_secret') != null){
        rgb_color = hexToRgb(appletName.getColor(obj_label));
    }

    appletName.unregisterAddListener("addListener");
    appletName.unregisterUpdateListener("updateListener");
    appletName.unregisterRemoveListener("removeListener");

    if(type_of_req == 'add'){
        if(obj_cmd_str != null && obj_cmd_str != ''){
            appletName.evalCommand(obj_label + ":" + obj_cmd_str);
        }
        appletName.evalXML(JSON.parse(obj_xml));
        appletName.evalCommand("UpdateConstruction()");
    }
    else if(type_of_req == 'update'){
        appletName.evalXML(JSON.parse(obj_xml));
        appletName.evalCommand("UpdateConstruction()");
    }
    else if(type_of_req == 'remove'){
        appletName.deleteObject(obj_label);
    }

    //Sets object color back to what it was earlier prior to evalXML. 
    //Needed for maintaining the color on the admin view tabs.
    if(rgb_color != null){
        appletName.setColor(obj_label, rgb_color.red, rgb_color.green, rgb_color.blue);
    }
    checkLocks(appletName);
    //appletName.registerAddListener("addListener");
    //appletName.registerUpdateListener("updateListener");
    //appletName.registerRemoveListener("removeListener");
}

//Function from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
    } : null;
}

//Used to set the entire XML for student's applets.
//Usually called when the student logs in for the first time and wants the most updated XML.
function p2pAppletSetXML(xml, toolbar, properties, id, username, obj_xml, obj_label, obj_cmd_str){

    var final_xml;
    var appletName = document.applet;

    if (typeof document['applet' + id] !== 'undefined'){
        appletName = document['applet' + id];
    }

    //Get Appropriate appletName depending on the Currently Active View/Tab
    if ($('a[data-toggle="tab"][aria-expanded=true]').html() == "View" && typeof document['applet' + id] !== 'undefined')
    {
        appletName = document['applet' + id];
    }
    else if ($('a[data-toggle="tab"][aria-expanded=true]').html() == "Filtered Merged View" && typeof document['merged_view_applet' + id] !== 'undefined')
    {
        appletName = document['merged_view_applet' + id];
    }
    else if($('a[data-toggle="tab"][aria-expanded=true]').html() == "Overlayed Image View" && typeof document['overlayed_image_view_applet' + id] !== 'undefined')
    {
        appletName = document['overlayed_image_view_applet' + id];
    }

    //appletName.unregisterAddListener("addListener");
    //appletName.unregisterUpdateListener("updateListener");
    //appletName.unregisterRemoveListener("removeListener");

    cur_xml = appletName.getXML();
    var cur_xml_doc = $.parseXML(cur_xml);

    appletName.setXML(xml);
    checkLocks(appletName);

    // If this is the students' website, then we register and add the listeners
    if(window.location.href.includes("student")){
        finalApplet = appletName;
        registerListeners(cur_xml_doc);
        addArrowButtonsEventlisteners();
        addKeyboardEventListeners();
    }
}

//Used to set the entire XML for the applets on the admin's view tabs.
//Usually called when the admin logs in for the first time and wants the most updated XML.
function adminP2PAppletSetXML(xml, toolbar, properties, id, username, obj_xml, obj_label, obj_cmd_str){

    var final_xml;
    var appletName = document.applet;

    if (typeof document['applet' + id] !== 'undefined'){
        appletName = document['applet' + id];
    }

    //Get Appropriate appletName depending on the Currently Active View/Tab
    if ($('a[data-toggle="tab"][aria-expanded=true]').html() == "View" && typeof document['applet' + id] !== 'undefined')
    {
        appletName = document['applet' + id];
    }
    else if ($('a[data-toggle="tab"][aria-expanded=true]').html() == "Filtered Merged View" && typeof document['merged_view_applet' + id] !== 'undefined')
    {
        appletName = document['merged_view_applet' + id];
    }
    else if($('a[data-toggle="tab"][aria-expanded=true]').html() == "Overlayed Image View" && typeof document['overlayed_image_view_applet' + id] !== 'undefined')
    {
        appletName = document['overlayed_image_view_applet' + id];
    }

    //appletName.unregisterAddListener("addListener");
    //appletName.unregisterUpdateListener("updateListener");
    //appletName.unregisterRemoveListener("removeListener");

    cur_xml = appletName.getXML();
    var cur_xml_doc = $.parseXML(cur_xml);
    var cur_construction = $(cur_xml_doc).find('construction')[0];

    xml = xml.replace(/&lt;/g,'<').replace(/&gt;/g, '>').replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\t/g, '');
    //xml = xml.substr(xml.indexOf("<"), xml.lastIndexOf(">"));
    var new_xml_doc = $.parseXML(xml);

    if(new_xml_doc !== null){
        var new_construction = $(new_xml_doc).find('construction')[0];
        cur_construction.innerHTML = new_construction.innerHTML;
    }

    var final_xml = $(cur_xml_doc).find('geogebra')[0].outerHTML;
    appletName.setXML(final_xml);
    checkLocks(appletName);
}


//This function takes the new XML, changes it and the old XML to a JSON format, and then 
// parses it, and changes it back to XML to be set in the geogebra applet.
function appletSetExtXML(xml, toolbar, properties, id, username, obj_xml, obj_label, obj_cmd_str){

    //console.log("setXml");
    var final_xml;
    var appletName = document.applet;
    //console.log('appletSetExtXML id param: ' + id);
    //console.log("Command appletSet: ", obj_cmd_str);

    if (typeof document['applet' + id] !== 'undefined'){
        appletName = document['applet' + id];
    }
    
    //Get Appropriate appletName depending on the Currently Active View/Tab
    if ($('a[data-toggle="tab"][aria-expanded=true]').html() == "View" && typeof document['applet' + id] !== 'undefined')
    {
        appletName = document['applet' + id];
    }
    else if ($('a[data-toggle="tab"][aria-expanded=true]').html() == "Filtered Merged View" && typeof document['merged_view_applet' + id] !== 'undefined')
    {
        appletName = document['merged_view_applet' + id];
    }
    else if($('a[data-toggle="tab"][aria-expanded=true]').html() == "Overlayed Image View" && typeof document['overlayed_image_view_applet' + id] !== 'undefined')
    {
        appletName = document['overlayed_image_view_applet' + id];
    }

    if(properties != null && properties.hasOwnProperty('perspective')){
        // need to set the perspective before setting the XML
        appletName.setPerspective(properties['perspective']);
    }

    cur_xml = appletName.getXML();
    var cur_xml_doc = $.parseXML(cur_xml);
    var cur_construction = $(cur_xml_doc).find('construction')[0];

    xml = xml.replace(/&lt;/g,'<').replace(/&gt;/g, '>').replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\t/g, '');
    xml = xml.substr(xml.indexOf("<"), xml.lastIndexOf(">"));
    var new_xml_doc = $.parseXML(xml);

    if(new_xml_doc !== null){
        var new_construction = $(new_xml_doc).find('construction')[0];
        cur_construction.innerHTML = new_construction.innerHTML;
    }

    if(properties != null){
        if(properties.hasOwnProperty('axes')){
            var axis_info = properties['axes'];
            Object.keys(axis_info).forEach(function(key) {
                axis_info[key].forEach(function(axis_tag) {
                    if(key == '3D'){
                        $(cur_xml_doc).find('euclidianView3D')[0].appendChild($.parseXML(axis_tag).children[0]);       
                    }
                    else{
                        $(cur_xml_doc).find('viewNumber[viewNo=' + key + ']').parent()[0].appendChild($.parseXML(axis_tag).children[0]);
                    }
                });
            });
        }
        if(properties.hasOwnProperty('evSettings')){
            var evSettings = properties['evSettings'];
            Object.keys(evSettings).forEach(function(key) {
                if(key == '3D'){
                    $(cur_xml_doc).find('euclidianView3D')[0].appendChild($.parseXML(evSettings[key]).children[0]);       
                }
                else{
                    $(cur_xml_doc).find('viewNumber[viewNo=' + key + ']').parent()[0].appendChild($.parseXML(evSettings[key]).children[0]);
                }
            });
        }
        if(properties.hasOwnProperty('coordSystem')){
            var coordSystem = properties['coordSystem'];
            Object.keys(coordSystem).forEach(function(key) {
                if(key == '3D'){
                    $(cur_xml_doc).find('euclidianView3D > coordSystem').remove();
                    $(cur_xml_doc).find('euclidianView3D')[0].appendChild($.parseXML(coordSystem[key]).children[0]);
                }
                else{
                    $(cur_xml_doc).find('viewNumber[viewNo=' + key + '] > coordSystem').remove();
                    $(cur_xml_doc).find('viewNumber[viewNo=' + key + ']').parent()[0].appendChild($.parseXML(coordSystem[key]).children[0]);
                }
            });
        }
        if(properties.hasOwnProperty('plate') && properties['plate'] != undefined){
             $(cur_xml_doc).find('plate').attr('show', properties['plate']);
        }
    }

    // console.log($(new_xml_doc).find('geogebra')[0].innerHTML);
    // console.log($(cur_xml_doc).find('geogebra')[0].innerHTML);
    // $(cur_xml_doc).find('geogebra')[0].innerHTML = $(new_xml_doc).find('geogebra')[0].innerHTML;
    // console.log($(cur_xml_doc).find('geogebra')[0].innerHTML);
    // delete the current autosave object
    var final_xml = $(cur_xml_doc).find('geogebra')[0].outerHTML;
    appletName.setXML(final_xml);
    if(window.location.href.includes("student")){
        rename_admin_labels(appletName);
    }
    checkLocks(appletName);

    if (toolbar && toolbar !== "undefined" && toolbar !== "null" && toolbar.match(/\d+/g) && properties && properties['perspective']){
        //console.log('setting ' + appletName.id + ' custom toolbar to: ' + toolbar);
        sessionStorage.setItem('toolbar', toolbar);
        if (properties.hasOwnProperty('resetToolbar')){
            if(properties['resetToolbar']){
                sessionStorage.setItem('toolbar-record', toolbar);
            }
            if(sessionStorage.getItem('toolbar-record')){
                appletName.setCustomToolBar(sessionStorage.getItem('toolbar-record'));
            }
        } else {
            appletName.setCustomToolBar(toolbar);
        }
    }
    if (properties != null){
        // need to set the grid and axes visibility after setXML
        if(properties.hasOwnProperty('axis_display')){
            appletName.setAxesVisible(1, properties['axis_display'], properties['axis_display']);    
        }
        if(properties.hasOwnProperty('grid_display')){
            appletName.setGridVisible(properties['grid_display']);    
        }
        if(properties.hasOwnProperty('axis_steps')){
            appletName.setAxisSteps(1, properties['axis_steps']['x'], properties['axis_steps']['y'], properties['axis_steps']['z']);            
        }
        if(properties.hasOwnProperty('coord_system')){
            appletName.setCoordSystem(properties['coord_system']['x_min'] ,properties['coord_system']['x_max'], properties['coord_system']['y_min'], properties['coord_system']['y_max']);
        }
        
        /* Set Applet's Graphics 2 Window Parameters if Present */
        if(properties.hasOwnProperty('g2axis_display')){
            appletName.setAxesVisible(2, properties['g2axis_display'], properties['g2axis_display']);
        }
        if(properties.hasOwnProperty('g2grid_display')){
            appletName.setGridVisible(2,properties['g2grid_display']);  
        }
        if(properties.hasOwnProperty('g2axis_steps')){
            appletName.setAxisSteps(2, properties['g2axis_steps']['x'], properties['g2axis_steps']['y'], properties['g2axis_steps']['z']);            
        }
        if(properties.hasOwnProperty('g2coord_system')){
            appletName.evalCommand('SetActiveView(2)');
            appletName.evalCommand('ZoomIn('+properties['g2coord_system']['x_min']+','+properties['g2coord_system']['y_min']+','+properties['g2coord_system']['x_max']+','+properties['g2coord_system']['y_max']+')');
        }
    }

    // If this is the students' website, then we register and add the listeners
    if(window.location.href.includes("student")){
        finalApplet = appletName;
        registerListeners(cur_xml_doc);
        addArrowButtonsEventlisteners();
        addKeyboardEventListeners();
    }
}

// This function registers several event listeners only for the students' applet
function registerListeners(cur_xml_doc){

    finalApplet.registerAddListener(function(label){
        currentLabel = label;
        $current_label.text(currentLabel);
        finalApplet.registerObjectClickListener(label, function (label){
            currentLabel = label;
            $current_label.text(currentLabel);
        });
    });

    var elements = $(cur_xml_doc).find('construction').find('element');

     if(elements != undefined){
        for(var i = 0; i < elements.length; i++){
            // var obj_type = $(elements[i]).attr('type');
            // if(obj_type == "point"){
            var label = $(elements[i]).attr('label');

            finalApplet.registerObjectClickListener(label, function (label){
                currentLabel = label;
                $current_label.text(currentLabel);
            });
        }
    }
}

function rename_admin_labels(applet){
    var objs = applet.getAllObjectNames();
    for(i = 0; i < objs.length; i++)
        applet.renameObject(objs[i], objs[i] + "_{" + sessionStorage.group_id + "}");
}

function addArrowButtonsEventlisteners(){
    $arrow_up_button.unbind('click');
    $arrow_up_button.bind('click', function(){
        if (finalApplet.getObjectType(currentLabel) == "point"){
            finalApplet.setCoords(currentLabel, finalApplet.getXcoord(currentLabel), finalApplet.getYcoord(currentLabel)+stepSize);
        }
    });
    $arrow_down_button.unbind('click');
    $arrow_down_button.bind('click', function(){
        if (finalApplet.getObjectType(currentLabel) == "point"){
            finalApplet.setCoords(currentLabel, finalApplet.getXcoord(currentLabel), finalApplet.getYcoord(currentLabel)-stepSize);
        }
    });
    $arrow_right_button.unbind('click');
    $arrow_right_button.bind('click', function(){
        if (finalApplet.getObjectType(currentLabel) == "point"){
            finalApplet.setCoords(currentLabel, finalApplet.getXcoord(currentLabel)+stepSize, finalApplet.getYcoord(currentLabel));
        }
    });
    $arrow_left_button.unbind('click');
    $arrow_left_button.bind('click', function(){
        if (finalApplet.getObjectType(currentLabel) == "point"){
            finalApplet.setCoords(currentLabel, finalApplet.getXcoord(currentLabel)-stepSize, finalApplet.getYcoord(currentLabel));
        }
    });
}

function addKeyboardEventListeners(){
    
    if (keypressHandler != undefined){
        document.removeEventListener("keypress", keypressHandler);
    }
    keypressHandler = function(key){
        if (key.which == 105) { // 105 is the ASCII code of 'i'
            if (finalApplet.getObjectType(currentLabel) == "point"){
                finalApplet.setCoords(currentLabel, finalApplet.getXcoord(currentLabel), finalApplet.getYcoord(currentLabel)+stepSize);
            }
        }
        else if (key.which == 106) { // 106 is the ASCII code of 'j'
            if (finalApplet.getObjectType(currentLabel) == "point"){
                finalApplet.setCoords(currentLabel, finalApplet.getXcoord(currentLabel)-stepSize, finalApplet.getYcoord(currentLabel));
            }
        }
        else if (key.which == 107) { // 107 is the ASCII code of 'k'
            if (finalApplet.getObjectType(currentLabel) == "point"){
                finalApplet.setCoords(currentLabel, finalApplet.getXcoord(currentLabel), finalApplet.getYcoord(currentLabel)-stepSize);
            }
        }
        else if (key.which == 108) { // 108 is the ASCII code of 'l'
            if (finalApplet.getObjectType(currentLabel) == "point"){
                finalApplet.setCoords(currentLabel, finalApplet.getXcoord(currentLabel)+stepSize, finalApplet.getYcoord(currentLabel));
            }
        }
    }
    document.addEventListener("keypress", keypressHandler);
}

//This clears the local applet view
function clearApplet(appletName){
    appletName.reset();
}

//This function changes the colors of all elements on the local view to a random color
function randomizeColors(gen_new_colors, received_colors, applet, r, g, b) {
    //cur_xml = appletName.getXML(); 
    var minimum = 0, maximum = 255, colors = [], i;
    var default_point = [0,0,255];
    var default_line = [153,51,0];
    var regex = /[a-z]+/

    //If Colors Already Generated then Use the Colors sent in the Parameter
    if(gen_new_colors == true)
    {
        if (r != undefined && g != undefined && b != undefined){
            colors.push(r, g, b);
        } else {
            for(i = 0; i < 3; i++){
                colors.push(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
            } //this is your color
        }
    }
    else
    {
        colors = received_colors;
    }

    applet.unregisterUpdateListener("checkUser");
    var numelems = applet.getObjectNumber();
    for (i = 0; i < numelems; i++){
        var name = applet.getObjectName(i);
        if(r == "default"){
            if (regex.exec(name)){
                if(applet.getColor(name) != "#" + rgbToHex(default_line[0], default_line[1], default_line[2])){
                    //console.log("Updating color for obj " + name);
                    applet.setColor(name, default_line[0], default_line[1], default_line[2]);     
                }
            } else {
                if(applet.getColor(name) != "#" + rgbToHex(default_point[0], default_point[1], default_point[2])){
                    //console.log("Updating color for obj " + name);
                    applet.setColor(name, default_point[0], default_point[1], default_point[2]);     
                }
            }
        } else if(applet.getColor(name) != "#" + rgbToHex(colors[0], colors[1], colors[2])){
            //console.log("Updating color for obj " + name);
            applet.setColor(name, colors[0], colors[1], colors[2]);     
        }
    }
    applet.registerUpdateListener("checkUser");
    return colors;
}

// Converts RGB color to HEX
function rgbToHex(R,G,B) {
    return toHex(R) + toHex(G) + toHex(B);
}

function toHex(n) {
 n = parseInt(n,10);
 if (isNaN(n)) return "00";
 n = Math.max(0,Math.min(n,255));
 return "0123456789ABCDEF".charAt((n-n%16)/16)
      + "0123456789ABCDEF".charAt(n%16);
}

//This function grabs all objects in the construction, and sets a lock on them
//if the username in the caption is not the current user.
function checkLocks(appletName){
    var numelems = appletName.getObjectNumber();
    for (i = 0; i < numelems; i++){
        var name = appletName.getObjectName(i);
        var ggb_user = appletName.getCaption(name);
        var username = sessionStorage.getItem('username');
        var objType = appletName.getObjectType(name);

        if ((username !== ggb_user && username != "admin") && ggb_user != "unassigned"){
            if(objType == 'numeric' || objType == 'textfield'){
                appletName.setFixed(name, true, false);
            } else {
                appletName.setFixed(name, true);
            }
        } else if (username === ggb_user || username == "admin"){
            if(objType == 'numeric' || objType == 'textfield'){
                appletName.setFixed(name, false, true);
            } else {
                appletName.setFixed(name, false);
            }
        }
    }
}

function updateColors()
{
    var colors = sessionStorage.getItem('group_colors');
    colors = colors.split("-");
    randomizeColors(true, [], document.applet, colors[0], colors[1] , colors[2]);
}

//This function is an add listener added in gbbOnInit()
//It adds a caption to the new object with the local user's class username,
// and can add a lock onto it.
function addLock(object){
    var username;
    if(sessionStorage.getItem('username') != null && sessionStorage.getItem('username') != "admin"){
        username = sessionStorage.getItem('username');
    }
    else{
        username = "unassigned";
    }
    document.applet.setCaption(object, username);
    var type = document.applet.getObjectType(object);
    if (type === 'point'){
        document.applet.setLabelStyle(object, 3);
    }
    //updateColors();
    //document.applet.setFixed(object, true);
}

//This function is an update listener added in ggbOnInit()
//It checks if the caption of the point is the username of the current user,
//to figure out if the user is allowed to move the point or not.
/*function checkUser(object){
    //updateColors();
    localStorage.setItem('setNewXML', 'false');
    applet.unregisterUpdateListener("checkUser");
    var ggb_user = document.applet.getCaption(object);
    var username = sessionStorage.getItem('username');
    var move = document.applet.isMoveable(object);
    var type = document.applet.getObjectType(object);
    var isPoint = (type == "point");
    if(username !== ggb_user && isPoint && ggb_user != "unassigned"){
        if (username != "admin" && move){
            if(objType == 'numeric' || objType == 'textfield'){
                appletName.setFixed(name, true, false);
            } else {
                appletName.setFixed(name, true);
            }
        } else if (username == "admin" && !move){
            if(objType == 'numeric' || objType == 'textfield'){
                appletName.setFixed(name, false, true);
            } else {
                appletName.setFixed(name, false);
            }
        }
    }else if(username == ggb_user || ggb_user == "unassigned"){
        document.applet.setFixed(object, false, true);
    }

    if(ggb_user == "unassigned" && username != "admin" ){
        document.applet.setCaption(object, username);
    } else if (ggb_user != "unassigned" && username == "admin"){
        document.applet.setCaption(object, "unassigned");
    }
    
    applet.registerUpdateListener("checkUser");
    // on update of Geogebra view, send clients updated XML
    check_xml(document.applet.getXML(), socket);
}*/

//This function appends a set of button toolbar items to a container
function getToolbarIcons(container){
    container = typeof container !== 'undefined' ? container : '.toolbox';
    var icons = [
            {"name":"Move", "mode":0, "src":"./images/Mode_move.svg"},
            {"name":"Point", "mode":1, "src":"./images/Mode_point.svg"},
            {"name":"Join", "mode":2, "src":"./images/Mode_join.svg"},
            {"name":"Parallel", "mode":3, "src":"./images/Mode_parallel.svg"},
            {"name":"Orthogonal", "mode":4, "src":"./images/Mode_orthogonal.svg"},
            {"name":"Intersect", "mode":5, "src":"./images/Mode_intersect.svg"},
            {"name":"Delete", "mode":6, "src":"./images/Mode_delete.svg"},
            {"name":"Vector", "mode":7, "src":"./images/Mode_vector.svg"},
            {"name":"Line_Bisector", "mode":8, "src":"./images/Mode_linebisector.svg"},
            {"name":"Angular_Bisector", "mode":9, "src":"./images/Mode_angularbisector.svg"},
            {"name":"Circle_Two_Points", "mode":10, "src":"./images/Mode_circle2.svg"},
            {"name":"Circle_Three_Points", "mode":11, "src":"./images/Mode_circle3.svg"},
            {"name":"Conic_Five_Points", "mode":12, "src":"./images/Mode_conic5.svg"},
            {"name":"Tangents", "mode":13, "src":"./images/Mode_tangent.svg"},
            {"name":"Relation", "mode":14, "src":"./images/Mode_relation.svg"},
            {"name":"Segment", "mode":15, "src":"./images/Mode_segment.svg"},
            {"name":"Polygon", "mode":16, "src":"./images/Mode_polygon.svg"},
            {"name":"Text", "mode":17, "src":"./images/Mode_text.svg"},
            {"name":"Ray", "mode":18, "src":"./images/Mode_ray.svg"},
            {"name":"Midpoint", "mode":19, "src":"./images/Mode_midpoint.svg"},
            {"name":"Circle_Arc_Three_Points", "mode":20, "src":"./images/Mode_circlearc3.svg"},
            {"name":"Circle_Sector_Three_Points", "mode":21, "src":"./images/Mode_circlesector3.svg"},
            {"name":"Circumcircle_Arc_Three_Points", "mode":22, "src":"./images/Mode_circumcirclearc3.svg"},
            {"name":"Circumcircle_Sector_Three_Points", "mode":23, "src":"./images/Mode_circumcirclesector3.svg"},
            {"name":"Semicircle", "mode":24, "src":"./images/Mode_semicircle.svg"},
            {"name":"Slider", "mode":25, "src":"./images/Mode_slider.svg"},
            {"name":"Image", "mode":26, "src":"./images/Mode_image.svg"},
            {"name":"Show_Hide_Object", "mode":27, "src":"./images/Mode_showhideobject.svg"},
            {"name":"Show_Hide_Label", "mode":28, "src":"./images/Mode_showhidelabel.svg"},
            {"name":"Mirror_At_Point", "mode":29, "src":"./images/Mode_mirroratpoint.svg"},
            {"name":"Mirror_At_Line", "mode":30, "src":"./images/Mode_mirroratline.svg"},
            {"name":"Translate_By_Vector", "mode":31, "src":"./images/Mode_translatebyvector.svg"},
            {"name":"Rotate_By_Angle", "mode":32, "src":"./images/Mode_rotatebyangle.svg"},
            {"name":"Dilate_From_Point", "mode":33, "src":"./images/Mode_dilatefrompoint.svg"},
            {"name":"Circle_Point_Radius", "mode":34, "src":"./images/Mode_circlepointradius.svg"},
            {"name":"Copy_Visual_Style", "mode":35, "src":"./images/Mode_copyvisualstyle.svg"},
            {"name":"Angle", "mode":36, "src":"./images/Mode_angle.svg"},
            {"name":"Vector_From_Point", "mode":37, "src":"./images/Mode_vectorfrompoint.svg"},
            {"name":"Distance", "mode":38, "src":"./images/Mode_distance.svg"},
            {"name":"Move_Rotate", "mode":39, "src":"./images/Mode_moverotate.svg"},
            {"name":"Translateview", "mode":40, "src":"./images/Mode_translateview.svg"},
            {"name":"Zoom_In", "mode":41, "src":"./images/Mode_zoomin.svg"},
            {"name":"Zoom_Out", "mode":42, "src":"./images/Mode_zoomout.svg"},
            {"name":"Polar_Diameter", "mode":44, "src":"./images/Mode_polardiameter.svg"},
            {"name":"Segment_Fixed", "mode":45, "src":"./images/Mode_segmentfixed.svg"},
            {"name":"Angle_Fixed", "mode":46, "src":"./images/Mode_anglefixed.svg"},
            {"name":"Locus", "mode":47, "src":"./images/Mode_locus.svg"},
            {"name":"Macro", "mode":48, "src":"./images/Mode_tool.svg"},
            {"name":"Area", "mode":49, "src":"./images/Mode_area.svg"},
            {"name":"Slope", "mode":50, "src":"./images/Mode_slope.svg"},
            {"name":"Regular_Polygon", "mode":51, "src":"./images/Mode_regularpolygon.svg"},
            {"name":"Show_Hide_Checkbox", "mode":52, "src":"./images/Mode_showcheckbox.svg"},
            {"name":"Compasses", "mode":53, "src":"./images/Mode_compasses.svg"},
            {"name":"Mirror_At_Circle", "mode":54, "src":"./images/Mode_mirroratcircle.svg"},
            {"name":"Ellipse_Three_Points", "mode":55, "src":"./images/Mode_ellipse3.svg"},
            {"name":"Hyperbola_Three_Points", "mode":56, "src":"./images/Mode_hyperbola3.svg"},
            {"name":"Parabola", "mode":57, "src":"./images/Mode_parabola.svg"},
            {"name":"Fitline", "mode":58, "src":"./images/Mode_fitline.svg"},
            {"name":"Record_To_Spreadsheet", "mode":59, "src":"./images/Mode_recordtospreadsheet.svg"},
            {"name":"Attach_Detach_Point","mode":67,"src":"./images/Mode_attachdetachpoint.svg"}
    ];

    for(var i = 0; i < icons.length; i++){
        var data = icons[i];
        var b = $('<div>');
        var img = $('<img>');

        img.attr('src',data.src);
        img.attr('alt',data.name);

        b.append(img);
        b.addClass('btn-toolbox');
        b.attr('data-mode', data.mode);
        b.draggable({ revert: true });

        $(container).append(b); 
    }
}

//This function is called in group_join_response(), initializing the geogebra applet
function appletInit(params){
    var ggbBase64 = "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";
    params.container = typeof params.container !== 'undefined' ? params.container : 'appletContainer';
    params.width = typeof params.width !== 'undefined' ? params.width : 800;
    params.height = typeof params.height !== 'undefined' ? params.height : 600;
    params.enable3D = true;
    params.enableCAS = true;
    params.ggbBase64 = ggbBase64;
    var applet = new GGBApplet(params, true);

    var current_path = window.location.pathname;
    current_path = current_path.substring(0,window.location.pathname.lastIndexOf('/'));
    applet.setHTML5Codebase(current_path + '/5.0/web3d/');

    applet.inject(params.container, 'auto');
}
