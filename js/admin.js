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
    
    var $save_button = $('.save_button'); // Button for saving class settings
    var $settings = $('.setting');
    var $get_classes_button = $('.get_classes_button');
    var $secret_button = $('.secret_button');

    var $design_tab = $('#design-tab');
    var $design_toolbox = $('.toolbox'); //design view tool container
    
    var toolbar_locs = [];
        while(toolbar_locs.push([]) < 12);
    
    // Connect to the server using the Admin.Socket object constructor
    
    var class_id;
    
    // Holds secret needed to allow socket calls
    var $secret = $('.secret');     
    
    // Start with secret view visible and create/manage/settings view hidden
    $create_view.hide();
    $class_view.hide();


    if(sessionStorage.getItem('admin_class_id')){
        console.log("made it");
        socket.join_class(sessionStorage.getItem('admin_class_id'), 'ucd-247');
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
                    var item = ui.draggable.attr("data-mode");
                    toolbar_locs[location].push(item);
                    target.append(ui.draggable);
                    console.log(toolbar_locs);
                }
            });
        }else{
            $design_toolbox.empty();
        }
    });
});

