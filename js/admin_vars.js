//admin_vars.js
var $secret = 'ucd_247';

var $view_tab = $('#view_tab');
var $lists = $('.lists');

var $filtered_merged_view_tab = $('#filtered_merged_view_tab');
var $individual_groups_view_jsapps = $('#individual_groups_view_jsapps');
var $overlayed_image_view_tab = $('#overlayed_image_view_tab');
var $overlayed_image_views_jsapps = $('#overlayed_image_views_jsapps');
var $onoffswitch = $('.onoffswitch');
var gen_new_colors = true;
var filtered_merged_gen_new_colors = true;
var view_obj_colors = [];
var filtered_merged_view_obj_colors = [];

var $g2Toggle = $('#g2Toggle');
var $g2Box = $('#g2Box');
var $g2axisToggle = $('#g2axisToggle');
var $g2gridToggle = $('#g2gridToggle');
var $g2perspective = $('#g2perspective');
var $g2axis_step_x = $('#g2axis_step_x');
var $g2axis_step_y = $('#g2axis_step_y');
var $g2axis_step_z = $('#g2axis_step_z');
var $g2coord_x_min = $('#g2coord_x_min');
var $g2coord_x_max = $('#g2coord_x_max');
var $g2coord_y_min = $('#g2coord_y_min');
var $g2coord_y_max = $('#g2coord_y_max');

var $container = $('.container');
var $create_user_view = $('.create_user_view'); // Div holding user creation view
var $username_password_view = $('.username_password_view'); // Div holding user creation view
var $create_view = $('.create_view'); // Div holding class creation view
var $class_view = $('.class_view'); // Div holding the class view
var $Secret = $('.Secret'); // Div asking for secret

var $create_button = $('.create_button'); // Button for creation of class
var $create_admin_button = $('.create_admin_button'); //Create admin button
var $create_admin_back = $('.create_admin_back'); //Create admin back
var $class_input = $('.class_input'); // Input for class name
var $group_input = $('.group_input'); // Input for # of groups
var $class_id = $('.class_id'); // Input for class id
var $new_username = $('.new_username'); // Input for new username
var $new_password = $('.new_password'); // Input for new password
var $re_new_password = $('.re_new_password'); // Input for re password
var $username = $('.username'); // Input for username
var $password = $('.password'); // Input for password

var $join_button = $('.join_button'); // Button for joining a class
var $leave_button = $('.leave_button'); // Button for leaving a class
var $class_name = $('.class_name'); // Header line for class name
var $groups = $('.groups'); // List that will hold groups
var $add_button = $('.add_button'); // Button for adding a group
var $delete_button = $('.delete_button'); // Button for deleting a group
var $delete_class_button = $('#delete_class_button'); // Button for deleting a class
var $logout_class_button = $('.logout_class_button'); //Button for loggin out for the admin
var $clear_class_button = $('.clear_class_button'); //Button for clearing all the groups

var $save_button = $('.save_button'); // Button for saving class settings
var $settings = $('.setting'); // Button for settings
var $get_classes = $('#get-classes');
var $get_classes_button = $('.get_classes_button'); // Getting all the classes
var $login_button = $('.login_button'); // Login button
var $new_user = $('.new_user'); // new username field
var $sendtoolbar_button = $('.btn-sendtoolbar'); // Sending the toolbar to everyone
var $sendconstruction_button = $('.btn-sendconstruction'); // Sending the toolbar to groups
var $sendconstruction_all_button = $(".btn-sendconstructionall");
var $savetoolbar_button = $('.btn-savetoolbar'); // Saving the toolbar
var $deletetoolbar_button = $('.btn-deletetoolbar'); // Deleting toolbars
var $usetoolbar_button = $('.btn-usetoolbar'); // Using the saved toolbars to send to students
var $default_toolset_name = 'Default toolset';

var $saveconstruction_button = $('.btn-saveconstruction'); // Saving the construction
var $deleteconstruction_button = $('.btn-deleteconstruction'); // Deleting construction
var $useconstruction_button = $('.btn-useconstruction'); // Using the saved construction to send to students
var $construction_select = $('#construction_select');

var $boxToggle = $('#boxToggle');
var $perspectiveBox = $('#perspectiveBox');
var $perspectiveSelect = $('#perspectiveSelect');
var $axisToggle = $('#axisToggle');
var $gridToggle = $('#gridToggle');
var $perspective = $('#perspective');
var $axis_step_x = $('#axis_step_x');
var $axis_step_y = $('#axis_step_y');
var $axis_step_z = $('#axis_step_z');
var $coord_x_min = $('#coord_x_min');
var $coord_x_max = $('#coord_x_max');
var $coord_y_min = $('#coord_y_min');
var $coord_y_max = $('#coord_y_max');

var $design_tab = $('#design_tab'); // When the design tab is pressed
var $design_toolbox = $('.toolbox'); //design view tool container
var $design_icons = $('.toolbar-target');
var $trash_button = $('.btn-trash');
var $clear_group_button = $('.clear_group_button');
var $choices = $('.choices');
var $toolbar_select = $('#toolbar_select');
var $views_jsapp = $('#views_jsapp');
var $applet_activity_designer = $('.applet-activity-designer');

var $clear_buttons = $('#clear_buttons');

var $error_frame = $('#error_frame');
var $error_new_username = $('.error_new_username');
var $error_re_new_password = $('.error_re_new_password');
var $error_class_input = $('.error_class_input');

var $empty_class_input = $('.empty_class_input');

var $redirect_modal = $('#redirect_modal');
var $redirect_login_button = $('#redirect_login');
var $redirect_username = $('#redirect_username');

var $settings_tab = $('#settings_tab');
var $current_password = $('#current_password');
var $changed_password = $('#changed_password');
var $retyped_changed_password = $('#retyped_changed_password');
var $change_password_button = $('#change_password_button');
