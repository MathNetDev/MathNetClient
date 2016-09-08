"use strict";
$(function() {

    // Initialize variables
    var $secret_view = $('.secret_view');
    var $create_view = $('.create_view'); // Div holding class creation view
    var $class_view = $('.class_view');
    var $manage_view = $('.manage_view'); // Div holding class management view
    var $settings_view = $('.settings_view'); // Div holding class settings view

    var $create_button = $('.create_button'); // Button for creation of class
    var $class_input = $('.class_input'); // Input for class name
    var $group_input = $('.group_input'); // Input for # of groups
    var $class_id = $('.class_id'); // Input for class id

    var $join_button = $('.join_button'); // Button for joining a class
    var $leave_button = $('.leave_button'); // Button for leaving a class
    var $class_name = $('.class_name'); // Header line for class name
    var $groups = $('.groups'); // List that will hold groups
    var $add_button = $('.add_button'); // Button for adding a group
    var $delete_button = $('.delete_button'); // Button for deleting a group
    var $delete_class_button = $('#delete_class_button'); // Button for deleting a class
    
    var $save_button = $('.save_button'); // Button for saving class settings
    var $settings = $('.setting');
    var $get_classes_button = $('.get_classes_button');
    var $secret_button = $('.secret_button');
    var $sendtoolbar_button = $('.btn-sendtoolbar');
    var $savetoolbar_button = $('.btn-savetoolbar');
    var $deletetoolbar_button = $('.btn-deletetoolbar');
    var $usetoolbar_button = $('.btn-usetoolbar');

    var $design_tab = $('#design-tab');
    var $design_toolbox = $('.toolbox'); //design view tool container
    var $trash_button = $('.btn-trash');
    
    var toolbar_locs = [];
        while(toolbar_locs.push([]) < 12);
    
    // Connect to the server using the Admin.Socket object constructor
    
    var class_id;
    
    // Holds secret needed to allow socket calls
    var $secret = $('.secret');     
    
    // Start with secret view visible and create/manage/settings view hidden
    $create_view.hide();
    $class_view.hide();

    //secret rejoin cookie
    var admin_secret = sessionStorage.getItem('admin_secret');
    if(admin_secret && admin_secret == 'ucd_247'){
        socket.get_classes(admin_secret);
        $secret.val('ucd_247');
    }
    //
    // SECRET INPUT
    //
    $secret_button.bind('click', function() {
        socket.get_classes($secret.val().trim());
    });

    //
    // CREATE CLASS
    //
    $create_button.bind('click', function() {
        // Tell the server to create a class in the database
        socket.add_class($class_input.val().trim(), parseInt($group_input.val().trim()), $secret.val().trim());
    });

    //
    // JOIN CLASS
    //
    $join_button.bind('click', function() {
        socket.join_class($class_id.val().trim(), $secret.val().trim());
    });

    //
    // ADD GROUP
    //
    //
    $add_button.bind('click', function() {
        // Tell the server to create a new group for the class in the database
        socket.add_group(sessionStorage.getItem('admin_class_id'), $secret.val().trim());
    });

    //
    // DELETE GROUP
    //
    $delete_button.bind('click', function() {
        // Only remove if there are groups
        if ($('.groups > li').length > 0) {
            socket.delete_group(sessionStorage.getItem('admin_class_id'), $('.groups > li:last').index() + 1, $secret.val().trim());
        }
    });

    //
    // LEAVE CLASS
    //
    $leave_button.bind('click', function() {
        socket.leave_class(sessionStorage.getItem('admin_class_id'), $secret.val().trim(), false);

    });

    //
    // SAVE SETTTINGS
    //
    $save_button.bind('click', function() {
        var data = {};
        for(var i=0; i<$settings.length; i++) {
            data[$settings[i].name] = $settings[i].checked;
        }
        socket.save_settings(sessionStorage.getItem('admin_class_id'), data, $secret.val().trim());
    });

    //
    // SEND TOOLBAR
    //
    $sendtoolbar_button.bind('click', function(){
        var numgroups = ($('ul.groups div').length)+1;
        var toolbar_str = toolbar_locs.join('|');
        console.log(toolbar_str);
        for(var i = 1; i < numgroups; i++){
            socket.xml_change('admin', sessionStorage.getItem('admin_class_id'), i, document.applet.getXML(), toolbar_str);
        }
    });


    $savetoolbar_button.bind('click', function(){

        var tools = toolbar_locs.join('|');
        var toolbar_name = prompt("Enter toolbar name");
        var len = document.getElementById("mySelect").options.length;

        for(var i = 0; i < len; i++)
        {
            if(document.getElementById("mySelect")[i].text == toolbar_name)
                break;
        }
        
        if (i == len)
            socket.save_toolbar(sessionStorage.getItem('admin_class_id'), toolbar_name, tools);
        else
            alert("You already have a toolbox with that name");

    });

    $usetoolbar_button.bind('click', function(){

        var select = document.getElementById("mySelect");
        var id = select.selectedIndex;
        var array = select[id].tool.split('|');
        var i,j;

        for(i = 0; i < 12; i++ )
        {
            $('#toolbar-target-' + i).empty();
            toolbar_locs[i] = [];
            console.log(toolbar_locs);
        }

        console.log(array);
        for( i = 0; i < array.length; i++)
        {
            var temp = array[i].split(',');
            for ( j = 0; j < temp.length; j++ )
            {
                if(temp[j] != ""){
                    var this_tool = $("div[data-mode='" + temp[j] + "']");
                    var target = $('#toolbar-target-'+i);
                    var location = $(".toolbar-target").index(target);
                    var mode = this_tool.attr("data-mode");
                    var button = $('<button>');
                    var tb_index = toolbar_locs[location].push(mode) - 1;
                    var toolbar_tool = this_tool.clone();
                    button.html('-');
                    button.bind('click', function(){
                        //alert('toolbar_locs[' + location + '][' + tb_index + ']');
                        var tool = $(this).parent();
                        toolbar_locs[tool.parent().index(0)].splice(tool.index(0),1);

                        console.log(toolbar_locs);
                        $('.toolbox').append(tool);
                        tool.remove();
                    });
                    toolbar_tool.append(button);
                    
                    target.append(toolbar_tool);
                }
            }
        }

    });

    $deletetoolbar_button.bind('click', function(){

    var result = confirm("Are you sure you want to delete this toolbar?");
    if (result) {
    
        var select = document.getElementById("mySelect");
        var id = select.selectedIndex;
        socket.delete_toolbar(sessionStorage.getItem('admin_class_id'), select[id].text);


    }
     });

    $trash_button.bind('click', function(){

        for(var i = 0; i < 12; i++ )
        {
            $('#toolbar-target-' + i).empty();
            toolbar_locs[i] = [];
            console.log(toolbar_locs);
        }
    });

    $delete_class_button.bind('click', function(e)
    {
        var password = prompt('If you really want to delete class, then enter secret password')    

        if (password == $secret.val().trim())
        {
           alert('Correct!. The class has been deleted. Press Ok to continue');
           socket.delete_class(sessionStorage.getItem('admin_class_id'), $secret.val().trim(), true);
        }
    });


    //
    // TAB CHANGES
    // 
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        //e.target  newly activated tab
        //e.relatedTarget  previous active tab
        var tab = String(e.target).split('#')[1];
        //alert(tab);
        if(tab == 'design'){

            var params = {
                "container":"appletContainer",
                "id":"applet",
                "width":1000,
                "height":600,
                "perspective":"",
                "showAlgebraInput":false,
                "showToolBarHelp":false,
                "showMenubar":false,
                "enableLabelDrags":false,
                "showResetIcon":false,
                "showToolbar":true,
                "allowStyleBar":false,
                "useBrowserForJS":true,
                "enableShiftDragZoom":true,
                "errorDialogsActive":true,
                "enableRightClick":false,
                "enableCAS":false,
                "enable3d":false,
                "isPreloader":false,
                "screenshotGenerator":false,
                "preventFocus":false
            };
            
            getToolbarIcons();
            appletInit(params);

            $(".toolbar-target").droppable({
                drop: function( event, ui ) {
                    var target = $(this);
                    var location = $(".toolbar-target").index(target);
                    var mode = ui.draggable.attr("data-mode");
                    var button = $('<button>');
                    var tb_index = toolbar_locs[location].push(mode) - 1;
                    var toolbar_tool = ui.draggable.clone();
                    button.html('-');
                    button.bind('click', function(){
                        //alert('toolbar_locs[' + location + '][' + tb_index + ']');
                        toolbar_locs[location].splice(tb_index,1);
                        console.log(tb_index);
                        //console.log(toolbar_locs);
                        var tool = $(this).parent();
                        $('.toolbox').append(tool);
                        tool.remove();
                    });
                    toolbar_tool.append(button);
                    
                    target.append(toolbar_tool);
                }
            });

            // listen for menu bar checkbox toggle and re-inject applet
            $('#toggle-menu-bar').bind('change',function(){
                if($(this).is(':checked')){
                    params.showMenubar = true;
                    params.allowStyleBar = false;
                }else{
                    params.showMenubar = false;
                };
                appletInit(params);
            });

            socket.get_toolbars(sessionStorage.getItem('admin_class_id'));

        }else if (tab == 'view'){
            $design_toolbox.empty();
            $('#views_jsapp').empty();
            $('#views_checkboxes').html('<div class="panel-heading"><h3 class="panel-title">Show Groups</h3></div><div class="panel-body"></div>');
            var numgroups = ($('ul.groups div').length)+1;
            
            for(var i = 1; i < numgroups; i++){
                var params = {
                    "container":"appletContainer"+i,
                    "id":"applet"+i,
                    "width":300,
                    "height":200,
                    "perspective":"",
                    "showAlgebraInput":false,
                    "showToolBarHelp":false,
                    "showMenubar":false,
                    "enableLabelDrags":false,
                    "showResetIcon":false,
                    "showToolbar":false,
                    "data-param-id": "loadXML" + i,
                    "allowStyleBar":false,
                    "useBrowserForJS":true,
                    "enableShiftDragZoom":true,
                    "errorDialogsActive":true,
                    "enableRightClick":false,
                    "enableCAS":false,
                    "enable3d":false,
                    "isPreloader":false,
                    "screenshotGenerator":false,
                    "preventFocus":true
                };
                var newgroup = '<div class="views_group_'+i+' col-md-4 col-sm-5 col-lg-4" ><h4> Group ' + i + 
                    '</h4><div class="geogebrawebapplet" id="appletContainer'+ i + 
                    '"style="width:100%;height:650px;display:block;"></div></div>';

                var checkbox = '<label><input checked type="checkbox" onchange="views_change(this)" value="applet'+i+'" name="views_group_'+ i
                + '">Group '+ i + '</label>';

                $('#views_jsapp').append(newgroup);
                $('#views_checkboxes .panel-body').append(checkbox);
                appletInit(params);                
            }
            var params = {
                    "container":"appletContainer"+numgroups,
                    "id":"applet"+numgroups,
                    "width":800,
                    "height":600,
                    "perspective":"",
                    "showAlgebraInput":false,
                    "showToolBarHelp":false,
                    "showMenubar":false,
                    "enableLabelDrags":false,
                    "showResetIcon":false,
                    "showToolbar":false,
                    "data-param-id": "loadXML" + numgroups,
                    "allowStyleBar":false,
                    "useBrowserForJS":true,
                    "enableShiftDragZoom":true,
                    "errorDialogsActive":true,
                    "enableRightClick":false,
                    "enableCAS":false,
                    "enable3d":false,
                    "isPreloader":false,
                    "screenshotGenerator":false,
                    "preventFocus":true
                };
            var mergegroup = '<div class="merge_group" style="display:none;"><h4> Merge Group</h4><div class="geogebrawebapplet"' +
                'id="appletContainer' + numgroups + '"style="width:100%;height:650px;display:block;"></div></div><br/>';

            var mergebutton = '&emsp;&emsp;<input class="btn btn-default mergeview_button" onclick="view_merge(this)"'+
                ' type="button" value="Merge Checked Views"><input class="btn btn-default unmergeview_button" onclick="unmerge_views(this)"'+
                ' type="button" value="Unmerge Views" style="display:none;">';
            $('#views_checkboxes .panel-body').append(mergebutton);
            $('#views_jsapp').append(mergegroup);
            appletInit(params); 

        } else {
             $design_toolbox.empty();
        }
    });
});

