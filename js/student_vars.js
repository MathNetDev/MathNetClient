//student_vars.js

var xml_update_ver = 0;
var alternate_update = 0;
var is_xml_update_queue_empty = false;

var $login_view = $('.login_view');
var $class_view = $('.class_view');
var $group_view = $('.group_view');

var $groups = $('#buttons');
var $group_name = $('#number');

var $class_settings = $('#settings');

var $login_button = $('#login');
var $logout_button = $('#logout');

var $class_id = $('#class_id');
var $username = $('#nickname');

var $error_header = $('#error_frame');
var $error_username = $('.error_nickname');
var $error_class_id = $('.error_class_id');

var $leave_group_button = $('#leave_group');
var $applet = $('.applet-student');

var $arrow_up_button = $('#arrow_up_button');
var $arrow_down_button = $('#arrow_down_button');
var $arrow_right_button = $('#arrow_right_button');
var $arrow_left_button = $('#arrow_left_button');
var $current_label = $('label[for="cur_label"]');
var $step_size_slider = $('#step_size_slider');
var $step_size_label = $('label[for="step_size_label"]');

var setNewXML = true;

var $update_frequency_testing_button = $('#update_frequency_testing_button');
var $stop_update_testing_button = $('#stop_update_testing_button');
var $clear_update_testing_button = $('#clear_update_testing_button');
var $update_frequency_label = $('label[for="update_frequency_label"]');
var $update_frequency_slider = $('#update_frequency_slider');
var interval_testing_function;

var $selective_updates_checkbox = $('#selective_updates_checkbox');
var selective_updates_to_admin = false;
