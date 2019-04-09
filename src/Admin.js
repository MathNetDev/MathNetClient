'use strict';
import 'jquery'
import 'jquery-ui/ui/widgets/draggable'
import 'jquery-ui/ui/widgets/droppable'
import 'bootstrap'
import io from "socket.io-client";

import Queue from './Queue'
import GeogebraInterface from "./Geogebra";

class Admin {

    constructor(socket, ggbInterface) {
        this.views = {
            $view_tab: $('#view_tab'),
            $lists: $('.lists'),
            $filtered_merged_view_tab: $('#filtered_merged_view_tab'),
            $individual_groups_view_jsapps: $('#individual_groups_view_jsapps'),
            $overlayed_image_view_tab: $('#overlayed_image_view_tab'),
            $overlayed_image_views_jsapps: $('#overlayed_image_views_jsapps'),
            $onoffswitch: $('.onoffswitch'),
            $g2Toggle: $('#g2Toggle'),
            $g2Box: $('#g2Box'),
            $g2axisToggle: $('#g2axisToggle'),
            $g2gridToggle: $('#g2gridToggle'),
            $g2perspective: $('#g2perspective'),
            $g2axis_step_x: $('#g2axis_step_x'),
            $g2axis_step_y: $('#g2axis_step_y'),
            $g2axis_step_z: $('#g2axis_step_z'),
            $g2coord_x_min: $('#g2coord_x_min'),
            $g2coord_x_max: $('#g2coord_x_max'),
            $g2coord_y_min: $('#g2coord_y_min'),
            $g2coord_y_max: $('#g2coord_y_max'),
            $container: $('.container'),
            $create_user_view: $('.create_user_view'), // Div holding user creation view
            $username_password_view: $('.username_password_view'), // Div holding user creation view
            $create_view: $('.create_view'), // Div holding class creation view
            $class_view: $('.class_view'), // Div holding the class view
            $Secret: $('.Secret'), // Div asking for secret
            $create_button: $('.create_button'), // Button for creation of class
            $create_admin_button: $('.create_admin_button'), //Create admin button
            $create_admin_back: $('.create_admin_back'), //Create admin back
            $class_input: $('.class_input'), // Input for class name
            $group_input: $('.group_input'), // Input for # of groups
            $class_id: $('.class_id'), // Input for class id
            $new_username: $('.new_username'), // Input for new username
            $new_password: $('.new_password'), // Input for new password
            $re_new_password: $('.re_new_password'), // Input for re password
            $username: $('.username'), // Input for username
            $password: $('.password'), // Input for password
            $join_button: $('.join_button'), // Button for joining a class
            $leave_button: $('.leave_button'), // Button for leaving a class
            $class_name: $('.class_name'), // Header line for class name
            $groups: $('.groups'), // List that will hold groups
            $add_button: $('.add_button'), // Button for adding a group
            $delete_button: $('.delete_button'), // Button for deleting a group
            $delete_class_button: $('#delete_class_button'), // Button for deleting a class
            $logout_class_button: $('.logout_class_button'), //Button for loggin out for the admin
            $clear_class_button: $('.clear_class_button'), //Button for clearing all the groups
            $save_button: $('.save_button'), // Button for saving class settings
            $settings: $('.setting'), // Button for settings
            $get_classes: $('#get-classes'),
            $get_classes_button: $('.get_classes_button'), // Getting all the classes
            $login_button: $('.login_button'), // Login button
            $new_user: $('.new_user'), // new username field
            $sendtoolbar_button: $('.btn-sendtoolbar'), // Sending the toolbar to everyone
            $sendconstruction_button: $('.btn-sendconstruction'), // Sending the toolbar to groups
            $sendconstruction_all_button: $(".btn-sendconstructionall"),
            $savetoolbar_button: $('.btn-savetoolbar'), // Saving the toolbar
            $deletetoolbar_button: $('.btn-deletetoolbar'), // Deleting toolbars
            $usetoolbar_button: $('.btn-usetoolbar'), // Using the saved toolbars to send to students
            $saveconstruction_button: $('.btn-saveconstruction'), // Saving the construction
            $deleteconstruction_button: $('.btn-deleteconstruction'), // Deleting construction
            $useconstruction_button: $('.btn-useconstruction'), // Using the saved construction to send to students
            $resetview_button: $('.btn-resetview'),
            $construction_select: $('#construction_select'),
            $boxToggle: $('#boxToggle'),
            $perspectiveBox: $('#perspectiveBox'),
            $perspectiveSelect: $('#perspectiveSelect'),
            $axisToggle: $('#axisToggle'),
            $gridToggle: $('#gridToggle'),
            $perspective: $('#perspective'),
            $axis_step_x: $('#axis_step_x'),
            $axis_step_y: $('#axis_step_y'),
            $axis_step_z: $('#axis_step_z'),
            $coord_x_min: $('#coord_x_min'),
            $coord_x_max: $('#coord_x_max'),
            $coord_y_min: $('#coord_y_min'),
            $coord_y_max: $('#coord_y_max'),
            $design_tab: $('#design_tab'), // When the design tab is pressed
            $design_toolbox: $('.toolbox'), //design view tool container
            $design_icons: $('.toolbar-target'),
            $trash_button: $('.btn-trash'),
            $clear_group_button: $('.clear_group_button'),
            $choices: $('.choices'),
            $toolbar_select: $('#toolbar_select'),
            $views_jsapp: $('#views_jsapp'),
            $applet_activity_designer: $('.applet-activity-designer'),
            $clear_buttons: $('#clear_buttons'),
            $error_frame: $('#error_frame'),
            $error_new_username: $('.error_new_username'),
            $error_re_new_password: $('.error_re_new_password'),
            $error_class_input: $('.error_class_input'),
            $empty_class_input: $('.empty_class_input'),
            $redirect_modal: $('#redirect_modal'),
            $redirect_login_button: $('#redirect_login'),
            $redirect_username: $('#redirect_username'),
            $settings_tab: $('#settings_tab'),
            $current_password: $('#current_password'),
            $changed_password: $('#changed_password'),
            $retyped_changed_password: $('#retyped_changed_password'),
            $change_password_button: $('#change_password_button')
        };
        this.$default_toolset = '0|1,501,67,5,19,72,75,76|2,15,45,18,65,7,37|4,3,8,9,13,44,58,47|16,51,64,70|10,34,53,11,24,20,22,21,23|55,56,57,12|36,46,38,49,50,71|30,29,54,32,31,33|17,26,62,73,14,68|25,52,60,61|40,41,42,27,28,35,6';
        this.$secret = 'ucd_247';
        this.is_admin_xml_update_queue_empty = false;
        this.admin_xml_update_queue = new Queue();
        this.gen_new_colors = true;
        this.filtered_merged_view_obj_colors = [];
        this.applets = [];
        this.overlayImageViewApplets = [];
        this.$default_toolset_name = 'Default toolset';
        this.socket = socket;
        this.initSocket(socket);
        this.initUi();

    }

    initUi(){
        // Initialize variables
        const new_applet_xml = "&lt;?xml version=\"1.0\" encoding=\"utf-8\"?&gt;\n&lt;geogebra format=\"5.0\" version=\"5.0.357.0\" id=\"c8a7f44a-9eb8-44d7-8795-b74e70cedb80\"  xsi:noNamespaceSchemaLocation=\"http://www.geogebra.org/ggb.xsd\" xmlns=\"\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" &gt;\n&lt;gui&gt;\n\t&lt;window width=\"800\" height=\"600\" /&gt;\n\t&lt;perspectives&gt;\n&lt;perspective id=\"tmp\"&gt;\n\t&lt;panes&gt;\n\t\t&lt;pane location=\"\" divider=\"0.3325\" orientation=\"1\" /&gt;\n\t&lt;/panes&gt;\n\t&lt;views&gt;\n\t\t&lt;view id=\"1\" visible=\"true\" inframe=\"false\" stylebar=\"false\" location=\"1\" size=\"524\" window=\"100,100,600,400\" /&gt;\n\t\t&lt;view id=\"4\" toolbar=\"0 || 2020 , 2021 , 2022 || 2001 , 2003 , 2002 , 2004 , 2005 || 2040 , 2041 , 2042 , 2044 , 2043\" visible=\"false\" inframe=\"false\" stylebar=\"false\" location=\"1\" size=\"150\" window=\"50,50,500,500\" /&gt;\n\t\t&lt;view id=\"2\" visible=\"true\" inframe=\"false\" stylebar=\"false\" location=\"3\" size=\"266\" window=\"100,100,250,400\" /&gt;\n\t\t&lt;view id=\"8\" toolbar=\"1001 | 1002 | 1003  || 1005 | 1004 || 1006 | 1007 | 1010 || 1008 | 1009 || 6\" visible=\"false\" inframe=\"false\" stylebar=\"false\" location=\"1\" size=\"150\" window=\"50,50,500,500\" /&gt;\n\t\t&lt;view id=\"16\" visible=\"false\" inframe=\"false\" stylebar=\"false\" location=\"1\" size=\"300\" window=\"50,50,500,500\" /&gt;\n\t\t&lt;view id=\"32\" visible=\"false\" inframe=\"false\" stylebar=\"true\" location=\"1\" size=\"300\" window=\"50,50,500,500\" /&gt;\n\t\t&lt;view id=\"64\" toolbar=\"0\" visible=\"false\" inframe=\"false\" stylebar=\"false\" location=\"1\" size=\"480\" window=\"50,50,500,500\" /&gt;\n\t\t&lt;view id=\"128\" visible=\"false\" inframe=\"true\" stylebar=\"false\" location=\"1\" size=\"480\" window=\"50,50,500,500\" /&gt;\n\t\t&lt;view id=\"4097\" visible=\"false\" inframe=\"true\" stylebar=\"true\" location=\"1\" size=\"150\" window=\"50,50,500,500\" /&gt;\n\t\t&lt;view id=\"70\" toolbar=\"0 || 2020 || 2021 || 2022\" visible=\"false\" inframe=\"false\" stylebar=\"true\" location=\"1\" size=\"900\" window=\"50,50,500,500\" /&gt;\n\t\t&lt;view id=\"43\" visible=\"false\" inframe=\"false\" stylebar=\"false\" location=\"1\" size=\"450\" window=\"50,50,500,500\" /&gt;\n\t\t&lt;view id=\"512\" toolbar=\"0 | 1 501 5 19 , 67 | 2 15 45 18 , 7 37 | 514 3 9 , 13 44 , 47 | 16 | 551 550 11 ,  20 22 21 23 , 55 56 57 , 12 | 69 | 510 511 , 512 513 | 533 531 , 534 532 , 522 523 , 537 536 , 535 | 521 520 | 36 , 38 49 560 | 571 30 29 570 31 33 | 17 | 540 40 41 42 , 27 28 35 , 6 , 502\" visible=\"false\" inframe=\"true\" stylebar=\"false\" location=\"1\" size=\"480\" window=\"50,50,500,500\" /&gt;\n\t&lt;/views&gt;\n\t&lt;toolbar show=\"true\" items=\"0 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71 | 30 29 54 32 31 33 | 17 26 62 73 , 14 68 | 25 52 60 61 | 40 41 42 , 27 28 35 , 6\" position=\"1\" help=\"false\" /&gt;\n\t&lt;input show=\"true\" cmd=\"true\" top=\"algebra\" /&gt;\n\t&lt;dockBar show=\"false\" east=\"false\" /&gt;\n&lt;/perspective&gt;\n\t&lt;/perspectives&gt;\n\t&lt;labelingStyle  val=\"0\"/&gt;\n\t&lt;font  size=\"12\"/&gt;\n&lt;/gui&gt;\n&lt;euclidianView&gt;\n\t&lt;viewNumber viewNo=\"1\"/&gt;\n\t&lt;size  width=\"524\" height=\"545\"/&gt;\n\t&lt;coordSystem xZero=\"262\" yZero=\"272.5\" scale=\"11.674199380165296\" yscale=\"11.674199380165286\"/&gt;\n\t&lt;evSettings axes=\"true\" grid=\"false\" gridIsBold=\"false\" pointCapturing=\"3\" rightAngleStyle=\"1\" checkboxSize=\"26\" gridType=\"0\"/&gt;\n\t&lt;bgColor r=\"255\" g=\"255\" b=\"255\"/&gt;\n\t&lt;axesColor r=\"0\" g=\"0\" b=\"0\"/&gt;\n\t&lt;gridColor r=\"192\" g=\"192\" b=\"192\"/&gt;\n\t&lt;lineStyle axes=\"1\" grid=\"0\"/&gt;\n\t&lt;axis id=\"0\" show=\"true\" label=\"\" unitLabel=\"\" tickStyle=\"1\" showNumbers=\"true\"/&gt;\n\t&lt;axis id=\"1\" show=\"true\" label=\"\" unitLabel=\"\" tickStyle=\"1\" showNumbers=\"true\"/&gt;\n&lt;/euclidianView&gt;\n&lt;algebraView&gt;\n\t&lt;collapsed val=\"0\"/&gt;\n&lt;/algebraView&gt;\n&lt;kernel&gt;\n\t&lt;continuous val=\"false\"/&gt;\n\t&lt;usePathAndRegionParameters val=\"true\"/&gt;\n\t&lt;decimals val=\"2\"/&gt;\n\t&lt;angleUnit val=\"degree\"/&gt;\n\t&lt;algebraStyle val=\"0\" spreadsheet=\"0\"/&gt;\n\t&lt;coordStyle val=\"0\"/&gt;\n\t&lt;angleFromInvTrig val=\"false\"/&gt;\n&lt;/kernel&gt;\n&lt;scripting blocked=\"false\" disabled=\"false\"/&gt;\n&lt;construction title=\"\" author=\"\" date=\"\"&gt;\n&lt;/construction&gt;\n&lt;/geogebra&gt;";

        const toolbar_locs = []; // The array that stores all the toolbars
        while(toolbar_locs.push([]) < 12);

        $('[data-toggle="tooltip"]').tooltip(); //enable tooltips

        // Connect to the server using the Admin.Socket object constructor

        let class_id; // Declaring class id globally in this file
        // Start with secret view visible and create/manage/settings view hidden
        this.views.$create_view.hide();
        this.views.$class_view.hide();
        this.views.$create_user_view.hide();

        //
        // Called to check if user is logged in
        //
        if(localStorage.getItem('admin_id')){
            if(localStorage.getItem('check')){
                this.check_session(localStorage.getItem('admin_id'), localStorage.getItem('check'));
            }
        }

        this.views.$username_password_view.show();
        this.views.$container.show();

        //
        // CHECKING THE USERNAME AND PASSWORD COMBINATION
        //
        this.views.$login_button.bind('click', () => {
            this.check_username(this.views.$username.val(), this.views.$password.val(), this.$secret);
        });


        //
        //  Pinging
        //
        window.setInterval(() => {
            const d = new Date();
            this.ping(d.getTime());
        }, 500);


        //
        // SUBMIT PASSWORD HITTING ENTER KEY
        //
        this.views.$password.keypress((e) => {
            if (e.which === 13) {
                this.check_username(this.views.$username.val(), this.views.$password.val(), this.$secret);
            }
        });

        //
        // SUBMIT USERNAME HITTING ENTER KEY
        //
        this.views.$username.keypress((e) => {
            if (e.which === 13) {
                this.check_username(this.views.$username.val(), this.views.$password.val(), this.$secret);
            }
        });


        //
        // TO CREATE NEW USER
        //
        this.views.$new_user.bind('click', () => {
            this.views.$username_password_view.hide();
            this.views.$create_user_view.show();
        });

        //
        // CREATE CLASS
        //
        this.views.$create_button.bind('click', () => {
            // Tell the server to create a class in the database
            if (this.views.$class_input.val().trim() === "") {
                this.views.$class_input.css("border-color", "red");
                this.views.$empty_class_input.show();
            }
            else{
                const group_colors = [];

                for(let i = 0; i < parseInt(this.views.$group_input.val().trim()); i++) {
                    let colors = [], minimum = 0, maximum = 255;
                    colors.push(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
                    colors.push(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
                    colors.push(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
                    let color = colors.join('-');
                    group_colors[i] = color;

                }
                this.add_class(this.views.$class_input.val().trim(), parseInt(this.views.$group_input.val().trim()), this.$secret, localStorage.getItem('admin_id'), group_colors);
            }
        });

        //
        // GETTING BACK TO LOGIN SCREEN
        //
        this.views.$create_admin_back.bind('click', () => {
            this.views.$create_user_view.hide();
            this.views.$username_password_view.show();
            this.views.$new_username.val("");
            this.views.$new_password.val("");
            this.views.$re_new_password.val("");
            this.views.$secret.val("");

            this.views.$error_new_username.hide();
            this.views.$new_username.css("border-color", null);
            this.views.$error_re_new_password.hide();
            this.views.$re_new_password.css("border-color", null);

        });

        //
        // JOIN CLASS
        //
        this.views.$join_button.bind('click', () => {
            this.join_class_socket($class_id.val().trim(), this.$secret);
        });

        //
        // ADD GROUP
        //
        this.views.$add_button.bind('click', () => {
            // Tell the server to create a new group for the class in the database
            let colors = [], minimum = 0, maximum = 255;
            this.gen_new_colors = true;
            this.filtered_merged_view_obj_colors = [];
            colors.push(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
            colors.push(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
            colors.push(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
            this.add_group(sessionStorage.getItem('admin_class_id'), this.$secret, colors);
        });

        //
        // CREATING A NEW ADMIN
        //
        this.views.$create_admin_button.bind('click', () => {

            if(this.views.$new_password.val() === this.views.$re_new_password.val())
                this.create_admin(this.views.$new_username.val(), this.views.$new_password.val(),  this.views.$secret.val());
            else{
                this.views.$re_new_password.css("border-color", "red");
                this.views.$error_re_new_password.show();
            }

        });

        //
        // DELETE GROUP
        //
        this.views.$delete_button.bind('click', () => {
            // Only remove if there are groups
            if ($('.groups > li').length > 0) {
                this.gen_new_colors = true;
                this.filtered_merged_view_obj_colors = [];
                this.delete_group(sessionStorage.getItem('admin_class_id'), $('.groups > li:last').index() + 1, this.$secret);
            }
        });

        //
        // LEAVE CLASS
        //
        this.views.$leave_button.bind('click', () => {
            const numgroups = ($('ul.groups div').length)+1;
            const xml = new_applet_xml;
            for(let i = 1; i < numgroups; i++){
                let data = {
                    username: 'admin',
                    class_id: sessionStorage.getItem('admin_class_id'),
                    group_id: i,
                    xml: xml,
                    toolbar: '',
                    toolbar_user: ''
                };
                this.xml_change(data);
            }
            this.leave_class(sessionStorage.getItem('admin_class_id'), this.views.$secret, false);

        });

        //
        // SAVE SETTINGS
        //
        this.views.$save_button.bind('click', () => {
            const data = {};
            for(let i=0; i < this.views.$settings.length; i++) {
                data[$settings[i].name] = $settings[i].checked;
            }
            this.save_settings(sessionStorage.getItem('admin_class_id'), data, this.$secret);
        });

        //
        // SEND TOOLBAR
        //
        this.views.$sendtoolbar_button.bind('click', () => {
            const numgroups = ($('ul.groups div').length)+1;
            const toolbar_str = toolbar_locs.join('|');
            let toolbar_users = $('.toolbar_users').val();
            if(!toolbar_users){
                $('.toolbar_users option').prop('selected', true);
                toolbar_users = $('.toolbar_users').val();
            }
            const index = $perspectiveSelect[0].selectedIndex;
            const class_id = sessionStorage.getItem('admin_class_id');
            const perspective = (this.views.$perspective.val() !== '' && this.views.$perspective.is(':visible'))
                ? this.views.$perspective.val() : this.views.$perspectiveSelect[0].options[index].value;
            let coord_system, axis_steps;

            const {
                $axis_step_x,
                $axis_step_y,
                $axis_step_z
            } = this.views;
            if ($axis_step_x.val() !== ""
                || $axis_step_y.val() !== ""
                || $axis_step_z.val() !== ""){
                axis_steps = {
                    'x' : (($.isNumeric($axis_step_x.val())) ? $axis_step_x.val() : 0),
                    'y' : (($.isNumeric($axis_step_y.val())) ? $axis_step_y.val() : 0),
                    'z' : (($.isNumeric($axis_step_z.val())) ? $axis_step_z.val() : 0)
                };
            }

            if (this.views.$coord_x_min.val() !== ""
                || this.views.$coord_x_max.val() !== ""
                || this.views.$coord_y_min.val() !== ""
                || this.views.$coord_y_max.val() !== ""){
                coord_system = {
                    'x_min' : (($.isNumeric(this.views.$coord_x_min.val())) ? this.views.$coord_x_min.val() : 0),
                    'x_max' : (($.isNumeric(this.views.$coord_x_max.val())) ? this.views.$coord_x_max.val() : 0),
                    'y_min' : (($.isNumeric(this.views.$coord_y_min.val())) ? this.views.$coord_y_min.val() : 0),
                    'y_max' : (($.isNumeric(this.views.$coord_y_max.val())) ? this.views.$coord_y_max.val() : 0)
                };
            }

            /* Setting Property Values for Graphics Window 2 */
            let g2axis_display, g2grid_display, g2axis_steps, g2coord_system;

            if (this.views.$g2axis_step_x.val() !== ""
                || this.views.$g2axis_step_y.val() !== ""
                || this.views.$g2axis_step_z.val() !== ""){
                g2axis_steps = {
                    'x' : (($.isNumeric(this.views.$g2axis_step_x.val())) ? this.views.$g2axis_step_x.val() : 0),
                    'y' : (($.isNumeric(this.views.$g2axis_step_y.val())) ? this.views.$g2axis_step_y.val() : 0),
                    'z' : (($.isNumeric(this.views.$g2axis_step_z.val())) ? this.views.$g2axis_step_z.val() : 0)
                };
            }

            if (this.views.$g2coord_x_min.val() !== ""
                || this.views.$g2coord_x_max.val() !== ""
                || this.views.$g2coord_y_min.val() !== ""
                || this.views.$g2coord_y_max.val() !== ""){
                g2coord_system = {
                    'x_min' : (($.isNumeric(this.views.$g2coord_x_min.val())) ? this.views.$g2coord_x_min.val() : 0),
                    'x_max' : (($.isNumeric(this.views.$g2coord_x_max.val())) ? this.views.$g2coord_x_max.val() : 0),
                    'y_min' : (($.isNumeric(this.views.$g2coord_y_min.val())) ? this.views.$g2coord_y_min.val() : 0),
                    'y_max' : (($.isNumeric(this.views.$g2coord_y_max.val())) ? this.views.$g2coord_y_max.val() : 0)
                };
            }

            g2axis_display = this.views.$g2axisToggle.prop('checked');
            g2grid_display = this.views.$g2gridToggle.prop('checked');

            if (this.views.$g2Toggle.is(':checked'))
            {
                g2axis_steps = axis_steps;
                g2coord_system = coord_system;
            }

            /* End of Setting Property Values for Graphics Window 2 */

            const properties = {
                axis_display: this.views.$axisToggle.prop('checked'),
                grid_display: this.views.$gridToggle.prop('checked'),
                perspective: perspective,
                axis_steps: axis_steps,
                coord_system: coord_system,
                g2axis_display : g2axis_display,
                g2grid_display : g2grid_display,
                g2axis_steps : g2axis_steps,
                g2coord_system : g2coord_system
            };

            for(let i = 0; i < toolbar_users.length; i++){
                let user_data = toolbar_users[i].split('|');
                if (user_data.length < 2){
                    continue;
                }
                const group_id = user_data[0];
                const toolbar_user  = user_data[1];
                const data = {
                    username: 'admin',
                    class_id: class_id,
                    group_id: group_id,
                    xml: '',
                    toolbar: toolbar_str,
                    toolbar_user: toolbar_user,
                    properties: properties
                };
                this.socket.xml_change(data);
            }
            //$("option:selected").prop("selected", false);
        });

        this.views.$perspectiveBox.toggle();
        this.views.$boxToggle.bind('click', () => {
            this.views.$perspectiveBox.toggle();
        });

        /* Use Graphics 1 Config or Different Config for Graphics 2 Window */
        this.views.$g2Toggle.prop('checked', true);
        this.views.$g2Box.toggle();
        this.views.$g2Toggle.bind('click', () => {
            this.views.$g2Box.toggle();
        });
        /* End of Graphics 2 Window Config Toggle */


        this.views.$sendconstruction_button.bind('click', () => {
            const xml = $.parseXML(this.activityCreateApplet.getXML());

            //Gets axis tags for each of the views: Graphics 1, Graphics 2 and 3D Graphics
            //which are finally added to the properties
            const axis_info = {};
            $(xml).find('axis').each((index) => {
                let viewNo = $(this).parent().find('viewNumber').attr('viewNo');
                if(!viewNo){
                    viewNo = '3D';
                }
                if(viewNo in axis_info){
                    axis_info[viewNo].push($(this)['0'].outerHTML);
                }
                else{
                    axis_info[viewNo] = [$(this)['0'].outerHTML];
                }
            });

            //Gets evSettings for each of the views: Graphics 1, Graphics 2 and 3D Graphics
            //which are finally added to the properties
            const evSettings = {};
            $(xml).find('evSettings').each((index) => {
                let viewNo = $(this).parent().find('viewNumber').attr('viewNo');
                if(!viewNo){
                    viewNo = '3D';
                }
                evSettings[viewNo] = $(this)['0'].outerHTML;
            });

            //Gets coordSystem for each of the views: Graphics 1, Graphics 2 and 3D Graphics
            //which are finally added to the properties
            const coordSystem = {};
            $(xml).find('coordSystem').each((index) => {
                let viewNo = $(this).parent().find('viewNumber').attr('viewNo');
                if(!viewNo){
                    viewNo = '3D';
                }
                coordSystem[viewNo] = $(this)['0'].outerHTML;
            });

            //Get plate xml tag for 3D Graphics View
            const plate = $(xml).find('plate').attr('show');

            let toolbar = $(xml).find('toolbar').attr('items').replace(/  /g, " ").replace(/ \| /g, "|").replace(/ /g, ",");

            // var $(xml).find('view').toArray()[0].outerHTML);

            let construction_groups = $('.construction_groups').val();
            if(!construction_groups){
                $('.construction_groups option').prop('selected', true);
                construction_groups = $('.construction_groups').val();
            }
            const visible_views = $(xml).find('view').filter((index) => {
                return $( this ).attr( "visible" ) === "true";
            });

            // We sort the views so that we can later send the ordered arrangement of the different view tabs present
            // in the activity designer to the students' views
            const visible_views_sorted = visible_views.sort((a,b) => {
                let a_order = a.getAttribute('location').replace(/,/g, ''),
                    b_order = b.getAttribute('location').replace(/,/g, '');
                if (a_order > b_order) {
                    return -1;
                }
                else if (b_order > a_order) {
                    return 1;
                }
                else {
                    return 0;
                }
            });

            // The following loop creates a string of the (encoded) values of the different views present in the
            // activity designer (to be sent to the students)
            let perspectives_mapped = '';
            for (let i=0; i < visible_views_sorted.length; ++i)
            {
                let id = visible_views_sorted[i].getAttribute('id');
                if (id === '1') {
                    perspectives_mapped += 'G';
                }
                else if (id === '2') {
                    perspectives_mapped += 'A';
                }
                else if (id === '4') {
                    perspectives_mapped += 'S';
                }
                else if (id === '8') {
                    perspectives_mapped += 'C';
                }
                else if (id === '16') {
                    perspectives_mapped += 'D';
                }
                else if (id === '32') {
                    perspectives_mapped += 'L';
                }
                else if (id === '64') {
                    perspectives_mapped += 'B';
                }
                else if (id === '512') {
                    perspectives_mapped += 'T';
                }
                /*
                else if (id == '128') {
                }
                else if (id == '512') {
                }
                else if (id == '4097') {
                }
                else if (id == '43') {
                }
                else if (id == '70') {
                }
                */
            }

            toolbar = (perspectives_mapped.includes("S") || perspectives_mapped.includes("C") ||
                perspectives_mapped.includes("L") || perspectives_mapped.includes("B") ||
                perspectives_mapped.includes("T"))? null: toolbar;

            this.activityCreateApplet.set_captions_unassigned();
            for(let i = 0; i < construction_groups.length; i++){
                const data = {
                    username: 'admin',
                    class_id: sessionStorage.getItem('admin_class_id'),
                    group_id: construction_groups[i],
                    xml: xml,
                    toolbar: toolbar,
                    toolbar_user: 'admin',
                    properties: {'perspective': perspectives_mapped === ''? 'AG': perspectives_mapped,
                        'setNewXML': 'true',
                        'resetToolbar': $('#send-toolbar-checkbox').prop('checked'),
                        'axes' : axis_info,
                        'evSettings' : evSettings,
                        'plate' : plate,
                        'coordSystem' : coordSystem
                    }
                };
                this.xml_change(data);
            }
        });



        this.views.$sendconstruction_all_button.bind('click', () => {
            let construction_groups_opt = $('.construction_groups option');
            construction_groups_opt.prop('selected', true);
            this.views.$sendconstruction_button.click();
            construction_groups_opt.prop('selected', false);
        });

        //
        // Clearing the Class
        //
        this.views.$clear_class_button.bind('click', () => {
            let numgroups = ($('ul.groups div').length)+1;
            let xml = this.createActivityApplet.getXML();
            for(let i = 1; i < numgroups; i++){
                const data = {
                    username: 'admin',
                    class_id: sessionStorage.getItem('admin_class_id'),
                    group_id: i,
                    xml: xml,
                    toolbar: '',
                    toolbar_user: ''
                };
                this.xml_change(data);
            }
        });


        //
        // Clearing the group
        //
        this.views.$clear_group_button.bind('click', () => {
            if(this.views.$choices.is(":visible")){
                this.views.$choices.hide();
            } else {
                this.views.$choices.show();
                let numgroups = ($('ul.groups div').length)+1;
                let list = "<div class='panel panel-default'><div class='panel-body'>";
                for(let i = 1; i < numgroups; i++){
                    list += '<input type="checkbox" value = "' + i + '"> Group ' + i +' <br>';
                }
                list += '<br/><input type="submit" value = "Clear Selected Groups"></div></div>'
                this.views.$choices.html(list);
            }
        });


        this.views.$choices.submit((e) => {
            e.preventDefault();
            // array that will store all the values for checked ones
            const allVals = [];

            $('.choices input[type="checkbox"]:checked').each(function() {

                // looping through each checkbox and storing values in array for checked ones.
                allVals.push($(this).val());

            });

            const xml = this.createActivityApplet.getXML();
            for(let i = 0; i<allVals.length; i++)
            {
                const data = {
                    username: 'admin',
                    class_id: sessionStorage.getItem('admin_class_id'),
                    group_id: allVals[i],
                    xml: xml,
                    toolbar: '',
                    toolbar_user: ''
                };
                this.xml_change(data);
            }
            this.views.$choices.hide();

        });

        //
        // SAVING A TOOLBAR
        //
        this.views.$savetoolbar_button.bind('click', () => {
            const $toolbar_select_opt = $('#toolbar_select option');
            const index = this.views.$toolbar_select[0].selectedIndex;
            const tools = toolbar_locs.join('|');
            const toolbar_name = index > -1 ? (confirm("This will save over the old toolbar."), this.views.$toolbar_select[0][index].text) : prompt("Enter toolbar name");
            const len = $toolbar_select_opt.length;

            for(let i = 0; i < len; i++)
            {
                if($toolbar_select_opt[i].text === toolbar_name)
                    break;
            }

            if (i === len && index === -1)
                this.save_toolbar(localStorage.getItem('admin_id'), toolbar_name, tools, "insert");
            else if (i !== len && index !== -1){
                this.save_toolbar(localStorage.getItem('admin_id'), toolbar_name, tools, "update");
            }
            else if (i !== len && index === -1)
                alert("You already have a toolbox with that name");

        });

        //
        // USING A TOOLBAR
        //
        this.views.$usetoolbar_button.bind('click', () => {
            const select = this.views.$toolbar_select[0];
            const id = select.selectedIndex;
            const array = select[id].tool.split('|');

            for(let i = 0; i < 12; i++ ){
                $('#toolbar-target-' + i).empty();
                toolbar_locs[i] = [];
            }

            for(let i = 0; i < array.length; i++){
                let temp = array[i].split(',');
                for ( j = 0; j < temp.length; j++ ){
                    if(temp[j] !== ""){
                        let this_tool = $(".toolbox div[data-mode='" + temp[j] + "']");
                        let target = $('#toolbar-target-'+i);
                        let location = this.views.$design_icons.index(target);
                        let mode = this_tool.attr("data-mode");
                        let button = $('<button>');
                        let tb_index = toolbar_locs[location].push(mode) - 1;
                        let toolbar_tool = this_tool.clone();
                        button.html('-');

                        const $design_toolbox = this.views.$design_toolbox;

                        //dont use an arrow here so "this" is preserved
                        button.bind('click', function(){
                            const tool = $(this).parent();
                            toolbar_locs[tool.parent().index(0)].splice(tool.index(0),1);
                            $design_toolbox.append(tool);
                            tool.remove();
                        });
                        toolbar_tool.append(button);
                        target.append(toolbar_tool);

                    }
                }
            }
            $(select[id]).prop("selected", false);
        });

        //
        // DELETING A TOOLBAR
        //
        this.views.$deletetoolbar_button.bind('click', () => {
            const result = confirm("Are you sure you want to delete this toolbar?");
            if (result) {
                const select = this.views.$toolbar_select[0];
                const id = select.selectedIndex;

                this.socket.delete_toolbar(localStorage.getItem('admin_id'), select[id].text);
            }
        });

        //
        // SAVING A CONSTRUCTION
        //
        this.views.$saveconstruction_button.bind('click', () => {
            const $construction_select_opt = $('#construction_select option');
            const index = $construction_select[0].selectedIndex;
            const construction_name = index > -1 ? (confirm("This will save over the old construction."), $construction_select[0][index].text) : prompt("Enter construction name");
            const len = $construction_select_opt.length;
            const xml = this.activityCreateApplet.getXML();
            const parsedXML = $.parseXML(xml);
            const toolbar = $(parsedXML).find('toolbar').attr('items').replace(/,/g, "").replace(/  /g, " ").replace(/ \| /g, "|").replace(/ /g, ",");
            let i;
            for(i = 0; i < len; i++)
            {
                if($construction_select_opt[i].text === construction_name)
                    break;
            }


            if (i === len && index === -1)
                this.socket.save_xml(localStorage.getItem('admin_id'), construction_name, xml, toolbar, "insert");
            else if (i !== len && index !== -1)
                this.socket.save_xml(localStorage.getItem('admin_id'), construction_name, xml, toolbar, "update");
            else if (i !== len && index === -1)
                alert("You already have a construction with that name");

        });

        //
        // USING A CONSTRUCTION
        //
        this.views.$useconstruction_button.bind('click', () => {
            const select = $construction_select[0];
            const id = select.selectedIndex;
            const xml = $construction_select[0][id].xml;
            const toolbar = $construction_select[0][id].toolbar;
            const properties = {perspective: "AG"};
            this.activityCreateApplet.appletSetExtXML(xml, toolbar, properties);
            this.activityCreateApplet.applet.registerAddListener((object) => {
                let username;
                if(sessionStorage.getItem('username') != null && sessionStorage.getItem('username') !== "admin"){
                    username = sessionStorage.getItem('username');
                }
                else{
                    username = "unassigned";
                }
                applet.setCaption(object, username);
                const type = applet.getObjectType(object);
                if (type === 'point'){
                    applet.setLabelStyle(object, 3);
                }
            });
            $(select[id]).prop("selected", false);
        });

        //
        // DELETING A CONSTRUCTION
        //
        this.views.$deleteconstruction_button.bind('click', () => {
            const result = confirm("Are you sure you want to delete this toolbar?");
            if (result) {
                const select = $construction_select[0];
                const id = select.selectedIndex;

                this.socket.delete_xml(localStorage.getItem('admin_id'), select[id].text);
            }
        });

        //
        //  RESET GEOGEBRA APPLET ON ADMIN CREATE PAGE
        //
        this.views.$resetview_button.bind('click', () => {
            const params = {
                "container":"appletContainer",
                "id":"applet",
                "width":this.views.$applet_activity_designer.innerWidth(),
                "height":600,
                "perspective":"AG",
                "showAlgebraInput":true,
                "showToolBarHelp":false,
                "showMenubar":true,
                "enableLabelDrags":false,
                "showResetIcon":true,
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
                "preventFocus":false,
                "scaleContainerClass": "appletContainer"
            };
            this.activityCreateApplet.appletInit(params);
        });

        //
        // LOGGING OUT
        //
        this.views.$logout_class_button.bind('click', () => {

            this.views.$create_view.hide();
            this.views.$settings_tab.hide();
            this.views.$username_password_view.show();

            this.delete_session(localStorage.getItem('admin_id'));

            localStorage.setItem('admin_id', '');
            localStorage.setItem('check', '');
            sessionStorage.setItem('admin_secret', '');
            $('.error_password').hide();
            $('.error_username').hide();
            $('.error_class_input').hide();
            this.views.$password.css("border-color", null);
            this.views.$username.css("border-color", null);
            this.views.$class_input.css("border-color", null);
            this.views.$class_input.val("");
            this.views.$group_input.val("");



        });

        //
        // CLEARING THE TOOLBAR
        //
        this.views.$trash_button.bind('click', () => {

            for(let i = 0; i < 12; i++ )
            {
                $('#toolbar-target-' + i).empty();
                toolbar_locs[i] = [];
            }
        });

        //
        // DELETING CLASS
        //
        this.views.$delete_class_button.bind('click', (e) =>
        {
            const password = prompt('If you really want to delete class, then enter secret password');

            if (password === this.$secret)
            {
                this.delete_class(sessionStorage.getItem('admin_class_id'), this.$secret, true);
                alert('Correct! The class has been deleted. Press OK to continue.');

            }
        });

        //
        // SETTINGS CHANGE PASSWORD BUTTON
        //
        this.views.$change_password_button.bind('click', () => {
            if (this.views.$changed_password.val() !== this.views.$retyped_changed_password.val()) {
                $('.error_password_incorrect').hide();
                this.views.$current_password.css('border-color',  '#CCCCCC');
                $('.error_password_mismatch').show();
                this.views.$changed_password.css('border-color', 'red');
                this.views.$retyped_changed_password.css('border-color', 'red');
            }
            else {
                $('.error_password_mismatch').hide();
                this.views.$changed_password.css('border-color',  '#CCCCCC');
                this.views.$retyped_changed_password.css('border-color', '#CCCCCC');
                this.change_password(localStorage.getItem('admin_id'), this.views.$current_password.val(), this.views.$changed_password.val(), this.$secret);
            }
        });

        //
        // MODAL LOGIN BUTTON
        //
        this.views.$redirect_login_button.bind('click', () => {
            this.redirect_modal_submit(this.views.$redirect_modal.attr("group_id"), this.views.$redirect_username.val());
        });

        //
        // SUBMIT USERNAME HITTING ENTER KEY FOR MODAL
        //
        this.views.$redirect_username.keypress((e) => {
            if (e.which === 13) {
                this.redirect_modal_submit(this.views.$redirect_modal.attr("group_id"), this.views.$redirect_username.val());
            }
        });

        //
        // TAB CHANGES
        //
        $('a[data-toggle="tab"]').on('shown.bs.tab',  (e) => {
            //e.target  newly activated tab
            //e.relatedTarget  previous active tab
            const tab = String(e.target).split('#')[1];
            //alert(tab);
            if(tab === 'design'){
                if(!this.activityCreateApplet){
                    this.activityCreateApplet = new GeogebraInterface("applet");
                    this.activityCreateApplet.setListener(this);
                    const params = {
                        "container":"appletContainer",
                        "id":"applet",
                        "width":this.views.$applet_activity_designer.innerWidth(),
                        "height":600,
                        "perspective":"AG",
                        "showAlgebraInput":true,
                        "showToolBarHelp":false,
                        "showMenubar":true,
                        "enableLabelDrags":false,
                        "showResetIcon":true,
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
                        "preventFocus":false,
                        "scaleContainerClass": "appletContainer"
                    };
                    this.activityCreateApplet.appletInit(params);
                }
                this.activityCreateApplet.getToolbarIcons();


                const $design_icons = this.views.$design_icons;

                $design_icons.droppable({
                    drop: function( event, ui ) {
                        const target = $(this);
                        const location = $design_icons.index(target);
                        const mode = ui.draggable.attr("data-mode");
                        const button = $('<button>');
                        const tb_index = toolbar_locs[location].push(mode) - 1;
                        const toolbar_tool = ui.draggable.clone();
                        button.html('-');
                        button.bind('click', function(){
                            const tool = $(this).parent();
                            toolbar_locs[tool.parent().index(0)].splice(tool.index(0),1);
                            $('.toolbox').append(tool);
                            tool.remove();
                        });
                        toolbar_tool.append(button);

                        target.append(toolbar_tool);
                    }
                });

                // // listen for menu bar checkbox toggle and re-inject applet
                // $('#toggle-menu-bar').bind('change',function(){
                //     if($(this).is(':checked')){
                //         params.showMenubar = true;
                //         params.allowStyleBar = false;
                //     }else{
                //         params.showMenubar = false;
                //     };
                //     appletInit(params);
                // });
                this.get_toolbars(localStorage.getItem('admin_id'));
                this.get_xmls(localStorage.getItem('admin_id'));

            }else if (tab ==='view'){
                this.views.$design_toolbox.empty();
                this.views.$views_jsapp.empty();

                let merge_view_update_toggle = '<div class="onoffswitch" style="display:none;"> <input type="checkbox" name="onoffswitch" '
                    +'class="onoffswitch-checkbox" id="myonoffswitchmerge" onchange="liveUpdatesCheckboxChangeMerge(this);"> </input> <label class="onoffswitch-label" for="myonoffswitchmerge">'
                    +'<span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span> </label></div>';
                this.views.$views_jsapp.append(merge_view_update_toggle);

                $('#views_checkboxes').html('<div class="panel-heading"><h3 class="panel-title">Show Groups</h3></div><div class="panel-body"></div>');
                let numgroups = ($('ul.groups div').length)+1;
                this.applets = [];
                for(let i = 1; i < numgroups; i++){
                    const appletId = `applet${i}`;
                    const applet = new GeogebraInterface(appletId);
                    applet.setListener(this);
                    const params = {
                        "container":"appletContainer"+i,
                        "id":appletId,
                        "width":300,
                        "height":300,
                        "perspective":"G",
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
                    let newgroup = '<div class="views_group_'+i+' col-md-4 col-sm-5 col-lg-4" ><h4><a href="javascript:redirect('+i+')"> Group ' + i +
                        '</h4><div class="geogebrawebapplet" id="appletContainer'+ i +
                        '"style="width:100%;height:650px;display:block;visibility:hidden;"></div></div>';

                    let checkbox = '<label><input checked type="checkbox" onchange="views_change(this)" value="applet'+i+'" name="views_group_'+ i
                        + '">Group '+ i + '</label>';

                    this.views.$views_jsapp.append(newgroup);
                    $('#views_checkboxes .panel-body').append(checkbox);
                    applet.appletInit(params);
                    this.applets.push(applet);
                }

                //Wait for Applets to be Loaded and Then Randomize Colors
                let applets_loaded = 0;
                let interval_id = setInterval(() => {
                    //Once all Applets are Loaded Stop Trying
                    if(applets_loaded === 1)
                    {
                        for(let i = 1; i < numgroups; i++)
                        {
                            if(this.gen_new_colors)
                            {
                                this.filtered_merged_view_obj_colors.push(GeogebraInterface.randomizeColors(this.gen_new_colors,[], this.applets[i-1].applet));
                            }
                            else
                            {
                                GeogebraInterface.randomizeColors(this.gen_new_colors,this.filtered_merged_view_obj_colors[i-1], this.applets[i-1].applet);
                            }
                            document.getElementById('appletContainer'+i).style.visibility = "visible";
                        }
                        this.gen_new_colors = false;
                        clearInterval(interval_id);
                    }
                    if(!this.applets.find(a => !a.isInitialized)|| numgroups === 0 )
                    {
                        applets_loaded = 1;
                    }
                }, 1000);

                const params = {
                    "container":"appletContainer"+numgroups,
                    "id":"applet"+numgroups,
                    "width":800,
                    "height":800,
                    "perspective":"G",
                    "showAlgebraInput":false,
                    "showToolBarHelp":false,
                    "showMenubar":true,
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
                let mergegroup = '<div class="merge_group" style="visibility:hidden"><h4> Merge Group</h4><div class="geogebrawebapplet"' +
                    'id="appletContainer' + numgroups + '"style="width:100%;height:650px;display:block;"></div></div><br/>';

                let mergebutton = '&emsp;&emsp;<input class="btn btn-default mergeview_button" onclick="view_merge(this)"'+
                    ' type="button" value="Merge Checked Views"><input class="btn btn-default unmergeview_button" onclick="unmerge_views(this)"'+
                    ' type="button" value="Unmerge Views" style="display:none;">';
                $('#views_checkboxes .panel-body').append(mergebutton);
                this.views.$views_jsapp.append(mergegroup);
                const applet = new GeogebraInterface(`applet${numgroups}`);
                applet.setListener(this);
                applet.appletInit(params);
                this.mergedApplet = applet;
            }
            /* Filtered Merged View Tab */
            else if (tab === 'filtered_merged_view'){
                this.views.$design_toolbox.empty();
                this.views.$individual_groups_view_jsapps.empty();

                let merge_view_update_toggle = '<div class="onoffswitch" style="display:none;"> <input type="checkbox" name="onoffswitch" '
                    +'class="onoffswitch-checkbox" id="myonoffswitchfilteredmerge" onchange="liveUpdatesCheckboxChangeFilteredMerge(this);"> </input> <label class="onoffswitch-label" for="myonoffswitchfilteredmerge">'
                    +'<span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span> </label></div>';
                this.views.$individual_groups_view_jsapps.append(merge_view_update_toggle);

                $('#group_select_checkboxes').html('<div class="panel-heading"><h3 class="panel-title">Show Groups</h3></div><div class="panel-body"></div>');
                $('#filter_merge_items').html('<div class="panel-heading"><h3 class="panel-title">Select Object Types to Be Merged</h3></div><div class="panel-body"></div>');
                let numgroups = ($('ul.groups div').length)+1;
                this.applets = [];
                for(let i = 1; i < numgroups; i++){
                    const params = {
                        "container":"merged_view_appletContainer"+i,
                        "id":"merged_view_applet"+i,
                        "width":300,
                        "height":300,
                        "perspective":"G",
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
                    let newgroup = '<div class="views_group_'+i+' col-md-4 col-sm-5 col-lg-4" ><h4><a href="javascript:redirect('+i+')"> Group ' + i +
                        '</h4><div class="geogebrawebapplet" id="merged_view_appletContainer'+ i +
                        '"style="width:100%;height:650px;display:block;visibility:hidden;"></div></div>';

                    let checkbox = '<label><input checked type="checkbox" onchange="views_change(this)" value="merged_view_applet'+i+'" name="views_group_'+ i
                        + '">Group '+ i + '</label>';

                    this.views.$individual_groups_view_jsapps.append(newgroup);
                    $('#group_select_checkboxes .panel-body').append(checkbox);
                    const applet = new GeogebraInterface(`merged_view_applet${i}`);
                    applet.setListener(this);
                    applet.appletInit(params);
                    this.applets.push(applet);
                }

                //Wait for Applets to be Loaded and Then Randomize Colors
                let applets_loaded = 0;
                let interval_id = setInterval(() => {
                    //Once all Applets are Loaded Stop Trying
                    if(applets_loaded === 1)
                    {
                        for(let i = 1; i < numgroups; i++)
                        {
                            if(this.gen_new_colors)
                            {
                                this.filtered_merged_view_obj_colors.push(GeogebraInterface.randomizeColors(this.gen_new_colors,[],this.applets[i-1].applet));
                            }
                            else
                            {
                                GeogebraInterface.randomizeColors(this.gen_new_colors,this.filtered_merged_view_obj_colors[i-1],this.applets[i-1].applet);
                            }
                            document.getElementById('merged_view_appletContainer'+i).style.visibility = "visible";
                        }
                        this.gen_new_colors = false;
                        clearInterval(interval_id);
                    }
                    if(!this.applets.find(a => !a.isInitialized) || numgroups === 0 )
                    {
                        applets_loaded = 1;
                    }
                }, 1000);

                const params = {
                    "container":"merged_view_appletContainer"+numgroups,
                    "id":"merged_view_applet"+numgroups,
                    "width":800,
                    "height":800,
                    "perspective":"G",
                    "showAlgebraInput":false,
                    "showToolBarHelp":false,
                    "showMenubar":true,
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
                let mergegroup = '<div class="filtered_merge_group" style="visibility:hidden"><h4> Merge Group</h4><div class="geogebrawebapplet"' +
                    'id="merged_view_appletContainer' + numgroups + '"style="width:100%;height:650px;display:block;"></div></div><br/>';

                let mergebutton = $('<input class="btn btn-default filtered_mergeview_button"'+
                    ' type="button" value="Merge Checked Views"><input class="btn btn-default filtered_unmergeview_button" onclick="filtered_unmerge_views(this)"'+
                    ' type="button" value="Unmerge Views" style="display:none;">');

                $(mergebutton).click(() => {
                    this.filtered_view_merge()
                });

                let obj_merge_selection = '&emsp;&emsp;<input type="checkbox" name="merge_objs" style="display:inline;" value="point"> Points'+
                    '&emsp;<input type="checkbox" name="merge_objs" style="display:inline;" value="line"> Lines'+
                    '&emsp;<input type="checkbox" name="merge_objs" style="display:inline;" value="conic"> Conics';

                $('#group_select_checkboxes .panel-body').append(mergebutton);
                $('#filter_merge_items .panel-body').append(obj_merge_selection);
                this.views.$individual_groups_view_jsapps.append(mergegroup);
                const mergedApplet = new GeogebraInterface(`merged_view_applet${numgroups}`);
                mergedApplet.setListener(this);
                mergedApplet.appletInit(params);
                this.applets.push(mergedApplet);

            }
            /* Overlayed Image View Tab */
            else if (tab === 'overlayed_image_view'){
                this.views.$design_toolbox.empty();
                this.views.$overlayed_image_views_jsapps.empty();
                $('#overlayed_image_views_checkboxes').html('<div class="panel-heading"><h3 class="panel-title">Show Groups</h3></div><div class="panel-body"></div>');
                $('#overlayed_image_div').html('<div class="panel-heading"><h3 class="panel-title">Overlayed Image</h3></div><div class="panel-body" style="width:60%;height:350px;display:block;"></div>');
                let numgroups = ($('ul.groups div').length)+1;
                this.applets = [];
                for(let i = 1; i < numgroups; i++){
                    const appletId = "overlayed_image_view_applet"+i;
                    const params = {
                        "container":"overlayed_image_view_appletContainer"+i,
                        "id":appletId,
                        "width":300,
                        "height":300,
                        "perspective":"G",
                        "showAlgebraInput":false,
                        "showToolBarHelp":false,
                        "showMenubar":false,
                        "enableLabelDrags":false,
                        "showResetIcon":false,
                        "showToolbar":false,
                        "data-param-id": "loadXML" + i,
                        "allowStyleBar":false,
                        "useBrowserForJS":true,
                        "enableShiftDragZoom":false,
                        "errorDialogsActive":true,
                        "enableRightClick":false,
                        "enableCAS":false,
                        "enable3d":false,
                        "isPreloader":false,
                        "screenshotGenerator":false,
                        "preventFocus":true
                    };
                    const newgroup = '<div class="views_group_'+i+' col-md-4 col-sm-5 col-lg-4" ><h4><a href="javascript:redirect('+i+')"> Group ' + i +
                        '</h4><div class="geogebrawebapplet" id="overlayed_image_view_appletContainer'+ i +
                        '"style="width:100%;height:650px;display:block;"></div></div>';

                    const checkbox = '<label><input checked type="checkbox" onchange="views_change(this)" value="overlayed_image_view_applet'+i+'" name="views_group_'+ i
                        + '">Group '+ i + '</label>';

                    this.views. $overlayed_image_views_jsapps.append(newgroup);
                    $('#overlayed_image_views_checkboxes .panel-body').append(checkbox);
                    const applet = new GeogebraInterface(appletId);
                    applet.setListener(this);
                    applet.appletInit(params);
                    this.applets.push(applet);
                }

                //Wait for Applets to be Loaded and Then Retrieve their Base64 String/Screenshot
                //This is necessary because the applets take time to load on the admin side. Hence need
                //to keep trying to get the screenshot of the applets till all applets have loaded successfully
                let applets_loaded = 0;
                let interval_id = setInterval(() => {
                    $('#overlayed_image_div .panel-body').empty();
                    for(let i = 1; i < numgroups; i++)
                    {
                        if(this.applets[i-1].isInitialized)
                        {
                            const a = this.applets[i-1].applet.getPNGBase64(1.5, true, undefined);
                            const img = '<img src="data:image/png;base64,'+a+'" id="img_'+i+'" style="position:absolute;">';
                            $('#overlayed_image_div .panel-body').append(img);
                        }
                    }
                    //Once all Applets are Loaded Stop Trying
                    if(applets_loaded === 1)
                    {
                        clearInterval(interval_id);
                    }
                    if(!this.applets.find(a => !a.isInitialized) || numgroups === 0 )
                    {
                        applets_loaded = 1;
                    }
                }, 4000);
            } else {
                this.views.$design_toolbox.empty();
            }
            this.get_class_users(sessionStorage.getItem('admin_class_id'),'get-class-users-response');
        });
    }



    // The initialization function for the Admin.Socket object
    initSocket(socket) {
        // sock = socket;

        // Socket event handlers
        //

        socket.on('server_error', (data) => {
            this.server_error(data.message);
        });

        socket.on('ping-response', (time) => {
            this.ping_response(time);
        });

        socket.on('add-class-response', (data) => {
            this.add_class_response(data.class_id, data.class_name, data.group_count);
        });

        socket.on('add-group-response', (data) => {
            this.add_group_response();
        });

        socket.on('create-admin-response', (data) => {
            this.create_admin_response(data.check);
        });

        socket.on('change-password-response', (data) => {
            this.change_password_response(data.success);
        });

        socket.on('get-toolbar-response', (data) => {
            this.get_toolbar_response(data);
        });

        socket.on('delete-toolbar-response', () => {
            this.delete_toolbar_response();
        });

        socket.on('get-xmls-response', (data) => {
            this.get_xmls_response(data);
        });

        socket.on('delete-xml-response', () => {
            this.delete_xml_response();
        });

        socket.on('get-class-users-response', (data) => {
            this.get_class_users_response(data);
        });

        socket.on('delete-class-response', (data) => {
            this.delete_class_response(data.class_id);
        });

        socket.on('delete-group-response', (data) => {
            this.delete_group_response();
        });

        socket.on('leave-class-response', (data) => {
            this.leave_class_response(data.disconnect);
        });

        socket.on('group_info_response', (data) => {
            this.group_info_response(data.username, data.class_id, data.group_id,
                data.other_members, data.status);
        });

        socket.on('get-classes-response', (data) => {
            this.get_classes_response(data.classes, data.secret);
        });

        socket.on('check-username-response', (admin_id, check) => {
            this.check_username_response(admin_id, check)
        });

        socket.on('check-session-response', (admin_id, check) => {
            this.check_session_response(admin_id, check);
        });

        socket.on('xml_update_response', (data) => {
            this.xml_update_response(data.username, data.class_id, data.group_id, data.xml, data.toolbar, data.properties, data.obj_xml, data.obj_label, data.obj_cmd_str, data.type_of_req, data.xml_update_ver, data.new_update, data);
        });

        socket.on('xml_change_response', (data) => {
            this.xml_change_response(data.username, data.class_id, data.group_id, data.xml, data.toolbar);
        });

        socket.on('get_xml_response', (data) => {
            this.get_xml_response(data.username, data.class_id, data.group_id, data.xml, data.toolbar);
        });

        socket.on('applet_xml_response', (data) => {
            this.applet_xml_response(data.username, data.class_id, data.group_id, data.xml, data.properties, data.xml_update_ver);
        });
    }

    // This function takes a username and password provided by the user
    // The socket then emits this data to the server to create the admin
    create_admin(username, password, secret) {
        this.socket.emit('create-admin', username, password, secret);
    }

    // This function takes a time and pings it
    ping(time) {
        this.socket.emit('ping', time);
    }


    // This function takes the admin_id, their current password, and a
    // new password to change it to. The socket emits this data to
    // the server to change the user's password
    change_password(admin_id, password, new_password, secret) {
        this.socket.emit('change-password', admin_id, password, new_password, secret);
    }

    // Takes admin id and a normal string
    // Socket then emits data to create a new session
    create_session(admin_id, string) {
        this.socket.emit('create-session', admin_id, string);
    }

    // This function takes a class name and group count provided by the
    // user. The socket then emits this data to the server to create
    // the class and groups.
    add_class(class_name, group_count, secret, admin_id, group_colors) {
        this.socket.emit('add-class', class_name, group_count, secret, admin_id, group_colors);
    };

    // This function takes a class id provided by the user. The socket then
    // emits this data to the server to join a class.
    join_class_socket(class_id, secret) {
        this.socket.emit('join-class', class_id, secret);
    };

    // This function takes an admin id provided by the user.
    // The socket then emits this data to the server to create a
    // group for the class.
    add_group(class_id, secret, colors) {
        this.socket.emit('add-group', class_id, secret, colors);
    }

    // This function takes an admin id provided by the user.
    // The socket then emits this data to the server to create a
    // toolbar for the class.
    save_toolbar(admin_id, toolbar_name, tools, action) {
        this.socket.emit('save-toolbar', admin_id, toolbar_name, tools, action);
    }

    // This function takes a class name provided by the user.
    // The socket then emits this data to the server to get all
    // the toolbars for the class.
    get_toolbars(admin_id) {
        this.socket.emit('get-toolbars', admin_id);
    }

    // This function takes an admin id and the tools provided by the user.
    // The socket then emits this data to the server to delete a toolbar
    // from the class.
    delete_toolbar(admin_id, toolbar_name) {
        this.socket.emit('delete-toolbar', admin_id, toolbar_name);
    }

    // This function takes a admin id provided by the user.
    // The socket then emits this data to the server to create a
    // xml for the class.
    save_xml(admin_id, xml_name, xml, toolbar, action) {
        this.socket.emit('save-xml', admin_id, xml_name, xml, toolbar, action);
    }

    // This function takes a admin id provided by the user.
    // The socket then emits this data to the server to get all
    // the xmls for the class.
    get_xmls(admin_id) {
        this.socket.emit('get-xmls', admin_id);
    }

    // This function takes a admin id and xml name provided by the user.
    // The socket then emits this data to the server to delete an xml
    // from the class.
    delete_xml(admin_id, xml_name) {
        this.socket.emit('delete-xml', admin_id, xml_name);
    }

    // This function takes a username and a password
    // The socket then emits this data to the server to check the combination
    check_username(username, password, secret) {
        this.socket.emit('check-username', username, password, secret);
    }

    // This function takes a class name provided by the user.
    // The socket then emits this data to the server to get all
    // the users for the class.
    get_class_users(class_id, callback) {
        this.socket.emit('get-class-users', class_id, callback);
    }

    // This function takes a class id and group id provided by the user.
    // The socket then emits this data to the server to delete a group
    // from the class.
    delete_group(class_id, group_id, secret) {
        this.socket.emit('delete-group', class_id, group_id, secret);
    }

    // This function takes a class id and group id provided by the user.
    // The socket then emits this data to the server to delete a session
    // from the class.
    delete_session(admin_id) {
        this.socket.emit('delete-session', admin_id);
    }

    // This function takes a admin id and check to see if the
    // admin is already logged in
    check_session(admin_id, check) {
        this.socket.emit('check-session', admin_id, check);
    }

    // This function takes a class id provided by the user.
    // The socket then emits this data to the server to leave a class.
    leave_class(class_id, secret) {
        this.socket.emit('leave-class', class_id, secret);
    }

    // This function takes a class id and settings data provided by the
    // user.
    // The socket then emits this data to the server to save the global
    // settings for the class.
    save_settings(class_id, settings, secret) {
        this.socket.emit('save-settings', class_id, settings, secret);
    }

    // This function takes a secret password provided by the user
    // The socket then emits this to the server to send the list of
    // current created classes and their login IDs to the user.
    get_classes(secret, admin_id) {
        this.socket.emit('get-classes', secret, admin_id);
    }


    xml_update(data) {
        this.socket.emit('xml_update', data);
    }

    //This function takes a username, class_id, group_id, and XML
    //It then emits a socket event to change the class's XML in the datastructure
    //based on the given XML, group_id, and class_id
    xml_change(data) {
        this.socket.emit('xml_change', data);
    }

    //This function takes a username, class_id, and group_id
    //It then emits a socket event to retrieve the group's XML
    //using the given class_id and group_id
    get_xml(username, class_id, group_id) {
        this.socket.emit('get_xml', username, class_id, group_id);
    }

    // This function disconnects the socket
    disconnect() {
        this.socket.disconnect();
    };

    delete_class(class_id, secret, disconnect) {
        this.socket.emit('delete-class', class_id, secret, disconnect);
    };

    //This function is used to get an updated copy of the current XML of the group from any one of the
    //(randomly selected) students present in a specific class and group.
    p2p_get_xml(username, class_id, group_id) {
        this.socket.emit('p2p_get_xml', username, class_id, group_id);
    }

    /**
     * @function escapeStr
     * @param {string} str the string to be escaped
     * @description to escape user inputted strings to prevent injection attacks
     */
    escapeStr(str) {
        if (str)
            return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=><|\/@])/g, '\\$1');
        return str;
    }

    /**
     * @function server_error
     * @param {string} error the error to output on the page
     * @description to handle errors sent by the server
     */
    server_error(error) {
        if (error !== "Duplicate Entry")
            this.views.$error_frame.html(JSON.stringify(error));
        else {
            //$class_input.css("border-color", "red");
            //$error_class_input.show();
        }
    }

    /**
     * function ping response
     * checks time and update ping
     */
    ping_response(time) {
        const d = new Date();
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
    add_class_response(class_id, class_name, group_count) {
        const construction_groups = $(".construction_groups");

        sessionStorage.setItem('admin_class_id', class_id);
        this.views.$error_frame.html('');

        this.views.$create_view.hide();
        this.views.$settings_tab.hide();
        this.views.$class_view.show();
        this.views.$design_tab.show();
        this.views.$view_tab.show();
        this.views.$filtered_merged_view_tab.show();
        this.views.$overlayed_image_view_tab.show();

        this.views.$class_name.html(class_name);
        this.views.$class_id.html("ID : " + class_id);
        let groups_html = "";
        let lists_html = "";
        let group_number = parseInt(group_count);
        for (let group = 1; group < group_number + 1; group++) {
            if (group % 3 === 0)
                lists_html += "<div class='col-md-2 info_box1 gr" + group + "'><h3 style = 'text-align: center; color: white;'>Group " + group + "</h3></div>";
            else if (group % 3 === 1)
                lists_html += "<div class='col-md-2 info_box  gr" + group + "'><h3 style = 'text-align: center; color: white;'>Group " + group + "</h3></div>";
            else
                lists_html += "<div class='col-md-2 info_box2 gr" + group + "'><h3 style = 'text-align: center; color: white;'>Group " + group + "</h3></div>";
            // $lists.append($("<div class = '"+group+" g'>"+ group +"</div>").attr('id', 'well')); //create new div
            groups_html += "<li>Group " + group;
            groups_html += "<div class='g" + group + "'></div></li>";
            const const_group = $("<option></option>");
            const_group.text("Group " + group);
            const_group.val(group);
            construction_groups.append(const_group);
        }
        this.views.$groups.html(groups_html);
        this.views.$lists.html(lists_html);

    }

    /**
     * @function create_admin response
     * @description adds an admin
     */
    create_admin_response(check) {

        if (check === 0) {
            this.views.$new_username.css("border-color", "red");
            this.views.$error_new_username.show();
            this.views.$error_re_new_password.hide();
            this.views.$re_new_password.css("border-color", null);
        } else {
            this.views.$new_username.val("");
            this.views.$new_password.val("");
            this.views.$re_new_password.val("");
            this.views.$Secret.val("");
            alert("user created");

            this.views.$create_user_view.hide();
            this.views.$username_password_view.show();

            this.views.$error_new_username.hide();
            this.views.$new_username.css("border-color", null);
            this.views.$error_re_new_password.hide();
            this.views.$re_new_password.css("border-color", null);
        }
    }

    /**
     * @function change_password response
     * @description tells the user if password was changed
     */
    change_password_response(success) {
        if (success) {
            this.views.$current_password.val("");
            this.views.$changed_password.val("");
            this.views.$retyped_changed_password.val("");
            alert("Your password has been updated.")
        } else {
            $('.error_password_mismatch').hide();
            this.views.$changed_password.css('border-color', '#CCCCCC');
            this.views.$retyped_changed_password.css('border-color', '#CCCCCC');
            this.views.$('.error_password_incorrect').show();
            this.views.$current_password.css('border-color', 'red');
        }
    }

    /**
     * @function add_group_response
     * @description adds a group to the end of the list
     */
    add_group_response() {
        this.views.$error_frame.html('');
        let new_group = "";
        let lists_html = "";
        let group_number = $('.groups > li:last').index() + 2;

        new_group += "<li>Group " + group_number;
        new_group += "<div class='g" + group_number + "'></div></li>";

        if (group_number % 3 === 0)
            lists_html += "<div class='col-md-2 info_box1 gr" + group_number + "'><h3 style = 'text-align: center; color: white;'>Group " + group_number + "</h3></div>";
        else if (group_number % 3 === 1)
            lists_html += "<div class='col-md-2 info_box  gr" + group_number + "'><h3 style = 'text-align: center; color: white;'>Group " + group_number + "</h3></div>";
        else
            lists_html += "<div class='col-md-2 info_box2 gr" + group_number + "'><h3 style = 'text-align: center; color: white;'>Group " + group_number + "</h3></div>";
        this.views.$groups.append(new_group);
        this.views.$lists.append(lists_html);
    }

    /**
     * @function get_toolbar_response
     * @description refreshes the selection list of all the default toolbars
     */
    get_toolbar_response(response) {
        const $toolbar_select_opt = $('#toolbar_select option');
        this.views.$toolbar_select.html('');
        $toolbar_select_opt.length = 0;
        const selection_list = this.views.$toolbar_select[0];
        const default_tools = {};
        default_tools.name = this.$default_toolset_name;
        default_tools.tools = this.$default_toolset;
        const default_option = document.createElement('option');
        default_option.text = default_tools.name;
        default_option.tool = default_tools.tools;
        selection_list.add(default_option);
        for (let i = 0; i < response.toolbars.length; i++) {
            const option = document.createElement('option');
            option.text = response.toolbars[i].toolbar_name;
            option.tool = response.toolbars[i].tools;
            selection_list.add(option);
        }
    }

    /**
     * @function delete_toolbar_response
     * @description deletes the selected toolbar
     */
    delete_toolbar_response(response) {
        const select = this.views.$toolbar_select[0];
        const id = select.selectedIndex;
        if (select.options[id].text !== this.$default_toolset_name) {
            select[id].remove();
        } else {
            alert('The default toolset cannot be deleted.');
        }
    }

    get_xmls_response(response) {
        const $construction_select_opt = $('#construction_select option');
        this.views.$construction_select.html('');
        $construction_select_opt.length = 0;
        const selection_list = this.views.$construction_select[0];

        for (let i = 0; i < response.xmls.length; i++) {
            const option = document.createElement('option');
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
    delete_xml_response(response) {
        const select = this.views.$construction_select[0];
        const id = select.selectedIndex;
        $construction_select[0][id].remove();
    }

    /**
     * @function get_class_users_response
     * @description refreshes the selection list of all the default toolbars
     */
    get_class_users_response(response) {
        const toolbar_users_select = $(".toolbar_users");
        toolbar_users_select.html("");
        const class_users = response.class_users;
        for (let i = 0; i < class_users.length; i++) {
            if (class_users[i].users.length > 0) {
                const ogrp = $("<option></option>");
                const group = class_users[i].group;
                ogrp.text("Group " + group);
                ogrp.attr("class", "parent_group");
                ogrp.on("click", function () {
                    $(this).prop('selected', false);
                    $('.toolbar_users option[value^="' + group + '|"').prop('selected', true);
                });
                toolbar_users_select.append(ogrp);

                for (let j = 0; j < class_users[i].users.length; j++) {
                    let opt = $("<option></option>");
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
    delete_group_response() {
        this.views.error_frame.html('');
        const group_number = $('.groups > li:last').index() + 1;
        $('.groups > li:last').remove();
        $('.g' + group_number).remove();
        $('.gr' + group_number).remove();
    }

    /**
     * @function delete_group_response
     * @description deletes the last group from the list
     */
    delete_class_response(class_id) {
        delete sessionStorage.admin_class_id;
    }

    /**
     * @function leave_class_response
     * @param {boolean} disconnect whether to delete the session storage
     * @description changes the admin view from a class to the login page
     */
    leave_class_response(disconnect) {
        this.views.$error_frame.html('');

        this.views.$create_view.show();
        this.views.$settings_tab.show();
        this.views.$class_view.hide();
        this.views.$design_icons.empty();
        this.views.$design_tab.hide();
        this.views.$view_tab.hide();
        this.views.$filtered_merged_view_tab.hide();
        this.views.$overlayed_image_view_tab.hide();

        this.views.$error_class_input.hide();
        this.views.$empty_class_input.hide();

        this.views.$class_input.css("border-color", null);
        this.views.$class_input.val("");
        this.views.$group_input.val("");

        if (!disconnect) {
            sessionStorage.removeItem('admin_class_id');
        }
        this.get_classes(this.$secret, localStorage.getItem('admin_id'));
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
    group_info_response(username, class_id, group_id, group, status) {
        const $people = $('.g' + group_id);
        const $real_people = $('.gr' + group_id);
        if (status) {
            for (const i in group) {
                let member = '<li id="' + group[i].member_name + '"><ul><li>';
                member += group[i].member_name;
                member += '</li></ul></li>';

                const real_member = '<p id="l' + group[i].member_name + '"style = "text-align : center; color: white;">' + group[i].member_name;
                +'</p>';

                $people.append(member);
                $real_people.append(real_member);
            }
        } else {
            username = username.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            username = escapeStr(username);
            $('li[id="' + username + '"]').remove();
            $('p[id="l' + username + '"]').remove();
        }
        // Update the user toolbar select
        this.get_class_users(sessionStorage.getItem('admin_class_id'), 'get-class-users-response');
    }

    /**
     * @function get_classes_response
     * @param {array[object]} classes array of objects holding classes and their hashed IDs
     * @description appends list objects of Classes and their IDs to an unordered list in admin.html
     */
    get_classes_response(classes, secret) {
        this.views.$username_password_view.hide();
        this.views.$create_view.show();
        this.views.$settings_tab.show();
        this.views.$class_view.hide();

        sessionStorage.setItem('admin_secret', secret);

        this.views.$get_classes.html('');
        for (let i = 0; i < classes.length; i++) {
            const joinClassButton = $('<button class="btn btn-primary"><span>' + classes[i].class_name + '</span></button>');
            $(joinClassButton).click(() => {
                this.join_class(classes[i].hashed_id);
            });
            this.views.$get_classes.append(joinClassButton);
        }
    }

    /**
     * @function check_username response
     * @param admin id and password
     * @description logs the user in and creates a session
     */
    check_username_response(admin_id, check) {
        if (check === 0) {
            this.views.$username.css("border-color", "red");
            $('.error_username').show();
            $('.error_password').hide();
            this.views.$password.css("border-color", null);
        } else if (check === -1) {
            this.views.$password.css("border-color", "red");
            $('.error_password').show();
            $('.error_username').hide();
            this.views.$username.css("border-color", null);
        } else {
            this.views.$username.val("");
            this.views.$password.val("");

            const string = Math.random().toString(36).substr(2, 8).toLowerCase();
            this.create_session(admin_id, string);
            localStorage.setItem("check", string);
            localStorage.setItem("admin_id", admin_id);
            this.get_classes("ucd_247", admin_id);
        }

    }

    /**
     * @function check_session response
     * @param admin id and password
     * @description checks a session
     */
    check_session_response(admin_id, check) {
        if (check === 1) {
            this.get_classes("ucd_247", admin_id);
        } else if (check === -1) {
            this.delete_session(admin_id);
            localStorage.setItem('admin_id', '');
            localStorage.setItem('check', '');
            sessionStorage.setItem('admin_secret', '');
        } else if (check === 0) {
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
    join_class(class_id) {
        //Adds a Link to a Pre-filled Class ID Student Page
        const current_path = window.location.pathname;
        document.getElementById('student_class_id_link').href = current_path.substring(0, window.location.pathname.lastIndexOf('/')) + "/student.html?class_id=" + class_id;

        this.join_class_socket(class_id, this.$secret);
    }

    //This function registers listeners on geogebra initialization
    ggbOnInit(arg) {
        let name, num, index = arg.search('[0-9]');
        const appletInterface = this.applets.find(ap => ap.appletId === arg);
        if (appletInterface){
            const applet = appletInterface.applet;
            applet.setCoordSystem(-10, 10, -10, 10);
            applet.evalCommand("SetAxesRatio(1,1)");
            applet.setAxisSteps(1, 2, 2, 2);
            applet.evalCommand("CenterView[(0,0)]");
            //applet.evalCommand("ZoomOut[4,(0,0)]");
            if (index !== -1) {
                num = arg.slice(index);
                name = arg.slice(0, index);
                if ((name === "applet" || name === "merged_view_applet" || name === "overlayed_image_view_applet") && num <= $('ul.groups div').length) {
                    const class_id = sessionStorage.getItem('admin_class_id');
                    this.p2p_get_xml('admin', class_id, num);
                }
            }
            // fix for view tab applets not loading current group xml
            applet.registerAddListener((object) => {
                let username;
                if(sessionStorage.getItem('username') != null && sessionStorage.getItem('username') !== "admin"){
                    username = sessionStorage.getItem('username');
                }
                else{
                    username = "unassigned";
                }
                applet.setCaption(object, username);
                const type = applet.getObjectType(object);
                if (type === 'point'){
                    applet.setLabelStyle(object, 3);
                }
            });
        }

    }

    applet_xml_response(username, class_id, group_id, xml, properties, received_xml_update_ver) {
        if (xml === undefined) {
            xml = '{}';
        }
        const applet = this.applets.find(a => a.appletId === `applet${group_id}`);
        applet.adminP2PAppletSetXML(xml, toolbar, properties, group_id, username, null, null);
        this.process_msgs_in_queue();
    }

    //Called when the Live/Not Live Toggle is Set/Unset for the Merged View
    liveUpdatesCheckboxChangeMerge(checkbox) {
        if (checkbox.checked) {
            view_merge(this);
        }
    }

    //Called when the Live/Not Live Toggle is Set/Unset for the Filtered Merged View
    liveUpdatesCheckboxChangeFilteredMerge(checkbox) {
        if (checkbox.checked) {
            filtered_view_merge(this);
        }
    }

    //handler for xml_change response, appends message to chatbox, and calls appletSetExtXML()
//TODO: Get rid of other params and keep only data
    xml_update_response(username, class_id, group_id, xml, toolbar, properties, obj_xml, obj_label, obj_cmd_str, type_of_req, xml_update_ver, new_update, data) {
        if (!this.is_admin_xml_update_queue_empty && new_update) {
            this.admin_xml_update_queue.enqueue(data);
            return;
        }
        const tab = $('a[data-toggle="tab"][aria-expanded=true]').html();
        if (tab === "View") {
            this.appletUpdate(xml, toolbar, null, group_id, username, obj_xml, obj_label, obj_cmd_str, type_of_req);
            if ($('.unmergeview_button').is(":visible") && $('#myonoffswitchmerge').is(':checked')) {
                this.view_merge(this);
            }
        } else if (tab === "Filtered Merged View") {
            this.appletUpdate(xml, toolbar, null, group_id, username, obj_xml, obj_label, obj_cmd_str, type_of_req);
            if ($('.filtered_unmergeview_button').is(":visible") && $('#myonoffswitchfilteredmerge').is(':checked')) {
                this.filtered_view_merge(this);
            }
        } else if (tab === "Overlayed Image View") {
            $('#img_' + group_id + '').remove();

            this.appletUpdate(xml, toolbar, null, group_id, username, obj_xml, obj_label, obj_cmd_str, type_of_req);

            const img = '<img src="data:image/png;base64,' + document['overlayed_image_view_applet' + group_id].getPNGBase64(1.5, true, undefined) + '" id="img_' + group_id + '" style="position:absolute;">';
            $('#overlayed_image_div .panel-body').append(img);
        }
    }

    //handler for xml_change response, appends message to chatbox, and calls appletSetExtXML()
    xml_change_response(username, class_id, group_id, xml, toolbar) {
        const tab = $('a[data-toggle="tab"][aria-expanded=true]').html();
        if (tab === "View") {
            this.appletSetExtXML(xml, toolbar, null, group_id);
            if ($('.unmergeview_button').is(":visible") && $('#myonoffswitchmerge').is(':checked')) {
                this.view_merge(this);
            }

        } else if (tab === "Filtered Merged View") {
            this.appletSetExtXML(xml, toolbar, null, group_id);
            if ($('.filtered_unmergeview_button').is(":visible") && $('#myonoffswitchfilteredmerge').is(':checked')) {
                this.filtered_view_merge(this);
            }
        } else if (tab === "Overlayed Image View") {
            $('#img_' + group_id + '').remove();

            this.appletSetExtXML(xml, toolbar, null, group_id);

            const img = '<img src="data:image/png;base64,' + document['overlayed_image_view_applet' + group_id].getPNGBase64(1.5, true, undefined) + '" id="img_' + group_id + '" style="position:absolute;">';
            $('#overlayed_image_div .panel-body').append(img);
        }

        //ggbOnInit();
    }

    process_msgs_in_queue() {
        while (!this.admin_xml_update_queue.isEmpty()) {
            const update = this.admin_xml_update_queue.dequeue();
            this.xml_update_response(update.username, update.class_id, update.group_id, update.xml, update.toolbar, update.properties, update.obj_xml, update.obj_label, update.obj_cmd_str, update.type_of_req, update.recv_xml_update_ver, false, update.data);
        }
        this.is_admin_xml_update_queue_empty = true;
    }

    //calls appletSetExtXML() to update the local geogebra applet.
    get_xml_response(username, class_id, group_id, xml, toolbar) {
        if (!xml) {
            xml = '{}';
        }
        this.appletSetExtXML(xml, toolbar, null, group_id);
    }

    //called on checkbox change, shows/hides box based on if checked or not
    views_change(event) {
        const box = $(event)[0];
        const $view = $("." + box.name);
        const group_id = box.name.split('_')[2];

        if (box.checked) {
            $('#img_' + group_id).show();
            $view.show();
        } else {
            $('#img_' + group_id).hide();
            $view.hide();
        }
    }

//called on merge view button press in the views tab
//this parses the xml of all shown groups and condenses
//them into one XML for appletSetExtXML to evaluate
    view_merge(event) {
        $('.mergeview_button').hide();
        $('.unmergeview_button').show();
        $('.onoffswitch').show();
        this.views.$clear_buttons.hide();

        let XMLs = "";
        const array = $('#views_checkboxes :checked');
        let counter = 0, count = 0; // for checking and not deleteing the first admin objects
        const numgroups = ($('ul.groups div').length) + 1;
        const applet = this.applets[this.applets.length - 1];
        const cur_xml = applet.getXML();
        const cur_xml_doc = $.parseXML(cur_xml);
        const cur_construction = $(cur_xml_doc).find('construction')[0];

        for (let i = 0; i < array.length; i++) {
            const value = array[i]["value"];
            const num = array[i]["value"].substr(value.lastIndexOf('t') + 1, value.length - value.lastIndexOf('t'));
            GeogebraInterface.randomizeColors(this.gen_new_colors, this.filtered_merged_view_obj_colors[parseInt(num) - 1], this.applets.find(a => a.appletId === value).applet);
            const parsing = this.applets.find(a => a.appletId === value).getXML();


            applet.setXML(parsing);
            let xml = this.rename_labels_on_merge(applet, num);

            const new_construction = $($.parseXML(xml)).find('construction')[0];

            XMLs += new_construction.innerHTML;


            $("." + array[i]["name"]).hide()

        }
        cur_construction.innerHTML = XMLs;
        let final_xml = '"' + $(cur_xml_doc).find('geogebra')[0].outerHTML + '"';

        applet.appletSetExtXML(final_xml, '', null, numgroups);
        const numelems = applet.applet.getObjectNumber();
        for (let i = 0; i < numelems; i++) {
            const name = applet.applet.getObjectName(i);
            applet.applet.setFixed(name, false, true);
        }

        applet.applet.setPerspective('G');
        applet.applet.setCoordSystem(-10, 10, -10, 10);
        applet.applet.evalCommand("SetAxesRatio(1,1)");
        applet.applet.setAxisSteps(1, 2, 2, 2);
        applet.applet.evalCommand("CenterView[(0,0)]");
        $('#views_checkboxes :checkbox').hide();
        $('.merge_group').css('visibility', 'visible');
    }

    rename_labels_on_merge(applet, num) {
        const objs = applet.getAllObjectNames();
        for (let i = 0; i < objs.length; i++) {
            applet.renameObject(objs[i], objs[i] + "grp" + num); //Could try grp1,grp2,etc instead of __g1
        }
        const xobj = $.parseXML(applet.getXML());
        const new_xml = $(xobj).find('geogebra')[0].outerHTML;
        return new_xml;
    }

    //this is used to remove admin objects past those in the first group
//so we don't have duplicate points in the construction
    remove_admin_objects(xml, counter) {
        const xobj = $.parseXML(xml);
        const commands = $(xobj).find('construction').find('command');
        const elements = $(xobj).find('construction').find('element');
        const deleted_array = [];

        if (elements) {
            for (let i = elements.length - 1; i >= 0; i--) {
                let caption = $(elements[i]).find('caption')[0];
                if (caption) {
                    caption = caption.attributes[0];
                    if (caption.value.includes("unassigned")) {
                        const label = $(elements[i])[0].attributes[1];
                        deleted_array.push(label.value);
                        $(elements[i]).remove();
                    }
                }
            }
        }

        if (commands) {
            for (let i = commands.length - 1; i >= 0; i--) {
                const inputs = $(commands[i]).find('input')[0].attributes;
                for (let j = 0; j < inputs.length; j++) {
                    if (deleted_array.includes(inputs[j].value)) {
                        $(commands[i]).remove();
                        break;
                    }
                }
            }
        }

        const new_xml = $(xobj).find('geogebra')[0].outerHTML;
        return new_xml;
    }

    //this is used to rename all object labels within the given XML to
//have their group number added onto the end, preventing conflicts
//when merging multiple XMLs together
    rename_labels(xml, num, counter) {
        const xobj = $.parseXML(xml);
        const commands = $(xobj).find('construction').find('command');
        const elements = $(xobj).find('construction').find('element');
        const regex = /[A-Z]+(?![a-z])|^[A-Z]*[a-z]+[0-9]*(?![a-zA-Z])/g;

        if (commands) {
            for (let i = 0; i < commands.length; i++) {
                let inputs = $(commands[i]).find('input')[0].attributes;
                for (let j = 0; j < inputs.length; j++) {
                    let result, index, indices = [];
                    while (result = regex.exec(inputs[j].value)) {
                        indices.push(result.index + result[0].length);
                    }
                    while (index = indices.pop()) {
                        inputs[j].value = inputs[j].value.slice(0, index) + "g" + num + inputs[j].value.slice(index);
                    }
                    console.log(inputs[j].value);
                    //inputs[j].value = inputs[j].value + "g" + num;
                }
                const outputs = $(commands[i]).find('output')[0].attributes;
                for (let j = 0; j < outputs.length; j++) {
                    outputs[j].value = outputs[j].value + "g" + num;
                }
            }
        }

        if (elements) {
            for (let i = 0; i < elements.length; i++) {
                let label = $(elements[i])[0].attributes[1];
                label.value = label.value + "g" + num;
                let caption = $(elements[i]).find('caption')[0];
                if (caption !== undefined) {
                    caption = caption.attributes[0];
                    if (caption.value.includes("unassigned")) {
                        counter = 1;
                    }
                    caption.value = caption.value + "g" + num;
                }
            }
        }

        const new_xml = $(xobj).find('geogebra')[0].outerHTML;
        return [new_xml, counter];
    }

    //this is called when the unmerge views button is pressed.
//it shows all hidden divs from the merge view
    unmerge_views(event) {
        $('.onoffswitch').hide();
        $('#views_checkboxes :checkbox').show();
        $('.mergeview_button').show();
        $('.unmergeview_button').hide();
        $('.merge_group').css('visibility', 'hidden');
        this.views.$clear_buttons.show();

        let array = $('#views_checkboxes :checked');
        for (let i = 0; i < array.length; i++) {
            $("." + array[i]["name"]).show();
            let value = array[i]["value"];
            //randomizeColors(true,[],document[value], 'default');
        }
    }

    //called on merge view button press in the Filtered Mergeview tab
//this parses the xml of all shown groups and condenses
//them into one XML for appletSetExtXML to evaluate
    filtered_view_merge(event) {
        $('.filtered_mergeview_button').hide();
        $('.filtered_unmergeview_button').show();
        $('.onoffswitch').show();
        this.views.$clear_buttons.hide();

        let XMLs = "";
        let array = $('#group_select_checkboxes :checked');
        let counter = 0, count = 0; // for checking and not deleting the first admin objects
        let numgroups = ($('ul.groups div').length) + 1;
        const applet = this.applets.find(a => a.appletId === ('merged_view_applet' + numgroups));

        const cur_xml = applet.getXML();
        const cur_xml_doc = $.parseXML(cur_xml);
        const cur_construction = $(cur_xml_doc).find('construction')[0];

        const selected_objs_for_merging = [];
        $('[name="merge_objs"]:checked').each(function () {
            selected_objs_for_merging.push($(this).attr('value'));
        });

        for (let i = 0; i < array.length; i++) {
            let value = array[i]["value"];
            let num = array[i]["value"].substr(value.lastIndexOf('t') + 1, value.length - value.lastIndexOf('t'));
            GeogebraInterface.randomizeColors(this.gen_new_colors, this.filtered_merged_view_obj_colors[parseInt(num) - 1], this.applets.find(a => a.appletId === value).applet);
            let parsing = document[value].getXML();


            applet.applet.setXML(parsing);
            let xml = this.rename_labels_on_merge(applet.applet, num);

            const new_construction = $($.parseXML(xml)).find('construction')[0];

            XMLs += new_construction.innerHTML;

            $("." + array[i]["name"]).hide()

        }
        cur_construction.innerHTML = XMLs;
        const final_xml = '"' + $(cur_xml_doc).find('geogebra')[0].outerHTML + '"';

        applet.appletSetExtXML(final_xml, '', null, numgroups);
        const numelems = applet.applet.getObjectNumber();
        for (let i = 0; i < numelems; i++) {
            const name = applet.applet.getObjectName(i);
            applet.applet.setFixed(name, false, true);
        }

        applet.applet.setPerspective('G');
        applet.applet.setCoordSystem(-10, 10, -10, 10);
        applet.applet.evalCommand("SetAxesRatio(1,1)");
        applet.applet.setAxisSteps(1, 2, 2, 2);
        applet.applet.evalCommand("CenterView[(0,0)]");
        $('#group_select_checkboxes :checkbox').hide();
        $('#filter_merge_items .panel-body :checkbox').hide();
        $('.filtered_merge_group').css('visibility', 'visible');
    }

    //Called when the unmerge views button on the Filtered Mergeview Tab is pressed.
//it shows all hidden divs from the merge view
    filtered_unmerge_views(event) {
        $('#group_select_checkboxes :checkbox').show();
        $('.filtered_mergeview_button').show();
        $('.filtered_unmergeview_button').hide();
        $('.onoffswitch').hide();
        $('#myonoffswitch').prop('checked', true);
        $('#filter_merge_items .panel-body :checkbox').show();
        $('.filtered_merge_group').css('visibility', 'hidden');
        this.views.$clear_buttons.show();

        const array = $('#group_select_checkboxes :checked');
        for (let i = 0; i < array.length; i++) {
            $("." + array[i]["name"]).show();
            let value = array[i]["value"];
            //randomizeColors(document[value], 'default');
        }
    }

    //Filter Objects based on the User's Selection of types to Merge on the Filtered Merge View Tab
    filter_objects(xml, objs_to_be_merged) {
        const xobj = $.parseXML(xml);
        const commands = $(xobj).find('construction').find('command');
        const elements = $(xobj).find('construction').find('element');
        const deleted_array = [];

        let is_obj_to_be_kept = 0;

        if (elements) {
            for (i = elements.length - 1; i >= 0; i--) {
                const obj_type = $(elements[i]).attr('type');
                if (obj_type) {
                    is_obj_to_be_kept = 0;
                    for (let j = 0; j < objs_to_be_merged.length; j++) {
                        if (obj_type.trim() === objs_to_be_merged[j].trim()) {
                            is_obj_to_be_kept = 1;
                            break;
                        }
                    }
                    if (is_obj_to_be_kept === 0) {
                        const label = $(elements[i])[0].attributes[1];
                        deleted_array.push(label.value);
                        $(elements[i]).remove();
                    }
                }
            }
        }
        if (commands) {
            for (let i = commands.length - 1; i >= 0; i--) {
                const inputs = $(commands[i]).find('input')[0].attributes;
                const outputs = $(commands[i]).find('output')[0].attributes;
                for (let j = 0; j < inputs.length; j++) {
                    const inputs_array = inputs[j].value.split(",");
                    for (let k = 0; k < inputs_array.length; k++) {
                        console.log(inputs_array[k].replace(/[^0-9a-zA-Z_]/gi, ''));
                        if (deleted_array.includes(inputs_array[k].replace(/[^0-9a-zA-Z_]/gi, ''))) {
                            $(commands[i]).remove();
                            break;
                        }
                    }
                }
                for (let j = 0; j < outputs.length; j++) {
                    if (deleted_array.includes(outputs[j].value)) {
                        $(commands[i]).remove();
                        break;
                    }
                }
            }
        }

        const new_xml = $(xobj).find('geogebra')[0].outerHTML;
        return new_xml;
    }

    //this is called when a user presses the hyperlink for group i
//in the View tab
    redirect(i) {
        $('#redirect_modal').attr("group_id", i);
        $('#redirect_modal').modal('show');
    }

    //this is called when the user submits a username after the
//redirect modal is opened
    redirect_modal_submit(group, username) {
        username = username.trim();
        if (username === "") return;
        if (!this.valid_username(username)) {
            if (username === "admin") {
                $('#redirect_username_error_admin').show();
                $('#redirect_username_error').hide();
            } else {
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

        const class_id = "class_id=" + sessionStorage.getItem('admin_class_id');
        const group_id = "group_id=" + group;
        const user_id = "username=" + username;
        const data = [class_id, group_id, user_id];
        let packed = escape(data[0]);
        for (let i = 1; i < data.length; i++)
            packed += "&" + escape(data[i]);
        window.open("student.html?" + packed, "_blank", "toolbar=yes,menubar=yes,scrollbars=yes,resizable=yes,width=" + window.outerWidth + ",height=" + window.outerHeight);
    }

    //this function validates the username submitted to the redirect modal
    valid_username(username) {
        const alphanum = /^[A-Za-z][A-Za-z0-9]*$/;
        if (username.match(alphanum) && username.length < 9) {
            // if (username == "admin") {
            //     return false;
            // }
            return true;
        } else {
            return false;
        }
    }
}

$(document).ready(() => {
    const server = `http://${window.location.hostname === "" ? "localhost" : window.location.hostname}:8889`;
    console.log(`server is ${server}`);
    $(document).ready(function() {
        $('#body').show();
    });
    const admin = new Admin(io(server));
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].onclick = function() {
            this.classList.toggle("active");
            this.nextElementSibling.classList.toggle("show");
        }
    }
})