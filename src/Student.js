import 'jquery'
import 'bootstrap'

import io from 'socket.io-client'

import Queue from './Queue'
import Login from './Login'
import Geogebra from './Geogebra'

class StudentController {
    constructor(socket) {
        this.ggbInterface = new Geogebra("applet");
        this.ggbInterface.setListener(this);
        this.xmlQueue = new Queue();
        this.xml_update_ver = 0;
        this.alternate_update = 0;
        this.setNewXML = true;
        this.socket = socket;
        this.init(this.socket);
        this.stepSize = 1.0;
        this.views = {
            $login_view: $('.login_view'),
            $class_view: $('.class_view'),
            $group_view: $('.group_view'),
            $groups: $('#buttons'),
            $group_name: $('#number'),
            $class_settings: $('#settings'),
            $login_button: $('#login'),
            $logout_button: $('#logout'),
            $class_id: $('#class_id'),
            $username: $('#nickname'),
            $error_header: $('#error_frame'),
            $error_username: $('.error_nickname'),
            $error_class_id: $('.error_class_id'),
            $leave_group_button: $('#leave_group'),
            $applet: $('.applet-student'),
            $arrow_up_button: $('#arrow_up_button'),
            $arrow_down_button: $('#arrow_down_button'),
            $arrow_right_button: $('#arrow_right_button'),
            $arrow_left_button: $('#arrow_left_button'),
            $current_label: $('label[for="cur_label"]'),
            $step_size_slider: $('#step_size_slider'),
            $step_size_label: $('label[for="step_size_label"]')
        };

        this.views.$step_size_slider.bind('mousemove', () => {
            this.stepSize = this.views.$step_size_slider.val() / 10;
            this.views.$step_size_label.text(this.views.$step_size_slider.val() / 10);
        });

        this.views.$logout_button.bind('click', () => {
            this.logout(sessionStorage.getItem('username'),
                sessionStorage.getItem('class_id'),
                false
            );
        });

        this.views.$groups.bind('click', (event) => {
            this.group_join(sessionStorage.getItem('username'),
                sessionStorage.getItem('class_id'),
                $(event.target).index('#buttons :input') + 1
            );
        });

        this.views.$leave_group_button.bind('click', function () {
            this.listener.group_leave(sessionStorage.getItem('username'),
                sessionStorage.getItem('class_id'),
                sessionStorage.getItem('group_id'),
                false
            );
        });

        this.addKeyboardEventListeners();
        this.addArrowButtonsEventListeners();
    }

    init(socket) {

        //Initialize callbacks
        socket.on('server_error', data => {
            this.server_error(data.message);
        });

        socket.on('ping-response', time => {
            this.ping_response(time);
        });

        socket.on('login_response', data => {
            this.on_login_response(data.username, data.class_id);
        });

        socket.on('logout_response', data => {
            this.on_logout_response(data.disconnect);
        });

        socket.on('groups_get_response', data => {
            this.groups_get_response(data.username, data.class_id, data.groups);
        });

        socket.on('group_join_response', data => {
            this.on_group_join_response(data.username, data.class_id, data.group_id, data.group_size);
        });

        socket.on('group_leave_response', data => {
            this.on_group_leave_response(data.username, data.class_id, data.group_id, data.disconnect);
        });

        socket.on('group_info_response', data => {
            this.on_group_info_response(data.username, data.class_id, data.group_id,
                data.other_members, data.status);
        });

        socket.on('group-color-response', data => {
            this.on_group_color_response(data[0].group_color);
        });

        socket.on('xml_change_response', data => {
            this.xml_change_response(data.username, data.class_id, data.group_id, data.xml, data.toolbar, data.properties, data.obj_xml, data.obj_label, data.obj_cmd_str);
        });

        socket.on('xml_update_response', data => {
            this.xml_update_response(data.username, data.class_id, data.group_id, data.xml, data.toolbar, data.properties, data.obj_xml, data.obj_label, data.obj_cmd_str, data.type_of_req, data.xml_update_ver, data.new_update, data);
        });


        socket.on('get_xml_response', data => {
            this.on_get_xml_response(data.username, data.class_id, data.group_id, data.xml, data.toolbar, data.properties);
        });

        socket.on('p2p_get_xml_response', data => {
            this.p2p_get_xml_response(data.username, data.class_id, data.group_id);
        });

        socket.on('applet_xml_response', data => {
            this.applet_xml_response(data.username, data.class_id, data.group_id, data.xml, data.properties, data.xml_update_ver);
        });

        socket.on('group_numbers_response', data => {
            this.on_group_numbers_response(data.username, data.class_id, data.group_id,
                data.status, data.group_size);
        });

        socket.on('add-group-response', () => this.on_add_group_response());

        socket.on('delete-group-response', () => this.on_delete_group_response());


        socket.on('delete-student-class-response', () => this.on_delete_student_class_response());
        socket.on('get-settings-response', data => this.on_get_settings_response(data.class_id, data.settings));
    }//init

    //adds a new group button
    on_add_group_response() {
        const group_number = $groups.children().length + 1;
        let button = '<input type="button" class="btn btn-md btn-primary " style="margin: 0em 1em 1em 0em" id="grp' + group_number + '" value="Group ';
        button += group_number + ' - ' + 0;
        button += '" />';
        this.views.$groups.append(button);
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

    //populates $groups with buttons with info from groups.
    groups_get_response(username, class_id, groups) {
        this.views.$groups.empty();
        for (let i in groups) {
            let button = '<input type="button" class="btn btn-md btn-primary " style="margin: 0em 1em 1em 0em" id="grp' + groups[i].grp_name + '" value="Group ';
            button += groups[i].grp_name + ' - ' + groups[i].num;
            button += '" />';
            this.views.$groups.append(button);
        }
    }

    //increments group_size if status is true (user is joining group), else decrements
    on_group_numbers_response(username, class_id, group_id, status, group_size) {
        group_size = (status ? group_size++ : group_size--);
        $("#grp" + group_id).val('Group ' + group_id + ' - ' + group_size);
    }

    on_delete_group_response() {
        $('#buttons input').last().remove();
        $('#buttons > li:last').remove();
    }

    on_delete_student_class_response() {
        delete sessionStorage.class_id;
        delete sessionStorage.group_id;
        delete sessionStorage.username;
    }

    // populates $people with members array values, and appends join/leave message
// based on status. removes #username if leave
    on_group_info_response(username, class_id, group_id, members, status) {
        console.log(`group info response received ${JSON.stringify(arguments)}`);
        const current_user = sessionStorage.getItem('username');
        const current_group = sessionStorage.getItem('group_id');

        if (status) {
            for (let i in members) {
                members[i].member_info = JSON.parse(members[i].member_info);
                const member = members[i].member_name.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                if (member === current_user) {
                    this.views.$group_name.html('Group: ' + current_group + ', ' + members[i].member_name); //only update this for the new member
                }
            }
        }
    }//members is undefined if group_info_response is triggered by group_leave, so short circuit it on status.

    //handler for xml_change response, appends message to chatbox, and calls appletSetExtXML()
    xml_change_response(username, class_id, group_id, xml, toolbar, properties, obj_xml, obj_label, obj_cmd_str) {
        if (properties !== null) {
            sessionStorage.setItem('properties', JSON.stringify(properties));
        } else if (properties === null && sessionStorage.getItem('properties') !== null) {
            properties = JSON.parse(sessionStorage.getItem('properties'));
        }
        this.ggbInterface.appletSetExtXML(xml, toolbar, properties, null, username, obj_xml, obj_label, obj_cmd_str);
        //TODO this doesn't do anything atm
        // this.updateGroupColor();
    }

    //handler for xml_update response, appends message to chatbox, and calls appletSetExtXML() (mathnet)
//TODO: Get rid of other params and keep only data
    xml_update_response(username, class_id, group_id, xml, toolbar, properties, obj_xml, obj_label, obj_cmd_str, type_of_req, recv_xml_update_ver, new_update, data) {
        if (!this.xmlQueue.isEmpty() && new_update) {
            this.xmlQueue.enqueue(data);
            return;
        }
        this.xml_update_ver = this.xml_update_ver + 1;
        this.group_color(sessionStorage.getItem('class_id'), sessionStorage.getItem('group_id'));
        if (properties !== null) {
            sessionStorage.setItem('properties', JSON.stringify(properties));
        } else if (properties === null && sessionStorage.getItem('properties') !== null) {
            properties = JSON.parse(sessionStorage.getItem('properties'));
        }
        this.ggbInterface.appletUpdate(xml, toolbar, properties, null, username, obj_xml, obj_label, obj_cmd_str, type_of_req);
    }

    p2p_get_xml_response(username, class_id, group_id) {
        if (!this.ggbInterface || !this.ggbInterface.applet){
            return;
        }
        this.applet_xml(this.ggbInterface.applet.getXML(), username, class_id, group_id, this.xml_update_ver);
    }

    applet_xml_response(username, class_id, group_id, xml, properties, received_xml_update_ver) {
        this.xml_update_ver = received_xml_update_ver === undefined ? 0 : received_xml_update_ver;
        if (xml === undefined) {
            xml = '{}';
        }
        /*
        if(properties !== null){
            sessionStorage.setItem('properties', JSON.stringify(properties));
        } else if (properties === null && sessionStorage.getItem('properties') !== null){
            properties = JSON.parse(sessionStorage.getItem('properties'));
        }
        if(!toolbar){
            toolbar = sessionStorage.getItem('toolbar');
        }*/
        this.ggbInterface.p2pAppletSetXML(xml, toolbar, properties, null, username, null, null);
        this.process_msgs_in_queue();
    }

    process_msgs_in_queue() {
        while (!this.xmlQueue.isEmpty()) {
            const update = this.xmlQueue.dequeue();
            //if((update.username == curr_user && update.xml_update_ver > xml_update_ver) || (update.username != curr_user && update.xml_update_ver >= xml_update_ver)){
            this.xml_update_response(update.username, update.class_id, update.group_id, update.xml, update.toolbar, update.properties, update.obj_xml, update.obj_label, update.obj_cmd_str, update.type_of_req, update.recv_xml_update_ver, false, update.data);
            //}
        }

    }


    // updates $class_settings based on settings array
    on_get_settings_response(class_id, settings) {
        this.views.$class_settings.html('');

        for (let setting in settings) {
            const setting_item = "<li>" + setting + ": " + settings[setting] + "</li>";
            this.views.$class_settings.append(setting_item);
            if (setting === "Hide Options") {
                settings[setting] ? (
                    $("#display-settings").hide(),
                        $("#display-settings input:checkbox").prop('checked', ''),
                        $("#display-settings #show_points").prop('checked', true)
                ) : (
                    $("#display-settings").show()
                );//hide display options if certain global is turned on.
            }
        }
    }

    on_group_join_response(username, class_id, group_id, group_size) {
        this.views.$login_view.hide();
        this.views.$class_view.hide();
        this.views.$group_view.show();

        const params = {
            "container": "appletContainer",
            "id": "applet",
            "width": this.views.$applet.innerWidth(),
            "height": this.views.$applet.innerWidth() * 0.53,
            "perspective": "AG",
            "showAlgebraInput": true,
            "showToolBarHelp": false,
            "showMenubar": true,
            "enableLabelDrags": false,
            "showResetIcon": true,
            "showToolbar": true,
            "allowStyleBar": false,
            "useBrowserForJS": true,
            "enableShiftDragZoom": true,
            "errorDialogsActive": true,
            "enableRightClick": false,
            "enableCAS": false,
            "enable3d": false,
            "isPreloader": false,
            "screenshotGenerator": false,
            "preventFocus": false
        };

        this.ggbInterface.appletInit(params);

        sessionStorage.setItem('group_id', group_id);

        this.group_info(username, class_id, group_id, true);
        this.get_settings(class_id, group_id);
    }

    // shows class_view, and removes group_id from sessionStorage if disconnect is not true
    on_group_leave_response(username, class_id, group_id, disconnect) {
        // This function must call socket.groups_get(username, class_id)

        this.views.$login_view.hide();
        this.views.$class_view.show();
        this.views.$group_view.hide();
        if (!disconnect) {
            sessionStorage.removeItem('group_id');
        }
    }

    on_group_color_response(colors) {
        //sessionStorage.setItem('group_colors', colors);
    }

    on_login_response(username, class_id) {
        this.views.$login_view.hide();
        this.views.$class_view.show();
        this.views.$group_view.hide();

        username = username.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

        sessionStorage.setItem('class_id', class_id);
        sessionStorage.setItem('username', username);
        this.groups_get(username, class_id);
    }

    //shows login_view, and removes class_id and username from sessionStorage
//if logout was not a disconnect
    on_logout_response(disconnect) {
        this.views.$login_view.show();
        this.views.$class_view.hide();
        this.views.$group_view.hide();


        this.views.$error_username.hide();
        this.views.$error_class_id.hide();

        this.views.$class_id.css("border-color", null);
        this.views.$username.css("border-color", null);

        this.views.$class_id.val("");
        this.views.$username.val("");

        if (!disconnect) {
            sessionStorage.removeItem('class_id');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('group_id');
            sessionStorage.removeItem('toolbar');
            //sessionStorage.removeItem('group_colors');
            sessionStorage.removeItem('properties');

        }
    }

    //calls appletSetExtXML() to update the local geogebra applet.
    on_get_xml_response(username, class_id, group_id, xml, toolbar, properties) {
        if (!xml) {
            xml = '{}';
        }
        if (properties !== null) {
            sessionStorage.setItem('properties', JSON.stringify(properties));
        } else if (properties === null && sessionStorage.getItem('properties') !== null) {
            properties = JSON.parse(sessionStorage.getItem('properties'));
        }
        if (!toolbar) {
            toolbar = sessionStorage.getItem('toolbar');
        }

        this.ggbInterface.appletSetExtXML(xml, toolbar, properties, null, username, null, null); //mathnet
        this.updateGroupColor();
    }

    updateGroupColor() {
        this.group_color(sessionStorage.getItem('class_id'), sessionStorage.getItem('group_id'));
    }

    ggbOnInit() {
        this.updateGroupColor();
        //app is initialized, load the xml
        this.p2p_get_xml(sessionStorage.getItem('username'), sessionStorage.getItem('class_id'), sessionStorage.getItem('group_id'));
    }

    server_error(error) {
        let str = error;

        if (str.indexOf("Invalid username") !== -1) {
            this.views.$username.css("border-color", "red");
            this.views.$error_username.show();
        } else if (str.indexOf("invalid.") !== -1) {
            this.views.$class_id.css("border-color", "red");
            this.views.$error_class_id.show();
        } else {
            console.log(error);
            sessionStorage.setItem('error', error);
            location.reload();
        }
    }

    /*
    API Functions
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
     */

    // This function takes a time and pings it
    ping(time) {
        this.socket.emit('ping', time);
    };

    //This function takes a username and class_id from the user
    //It then emits a socket call to login the username to the class_id.
    login(username, class_id) {
        this.socket.emit('login', username, class_id);
    }

    //This function takes a username and class_id
    //It then emits a socket event to log the username out of the class_id.
    logout(username, class_id) {
        this.socket.emit('logout', username, class_id);
    }

    //This function takes a username and class_id
    //It then emits a socket event to retrieve the groups in the class_id
    groups_get(username, class_id) {
        this.socket.emit('groups_get', username, class_id);
    }

    //This function takes a username, class_id, and group_id
    //It then emits a socket event to enter the username into the given group_id
    //in the given class_id.
    group_join(username, class_id, group_id) {
        this.socket.emit('group_join', username, class_id, group_id);
    }

    //This function takes a username, class_id, group_id, and disconnect
    //It then emits a socket event to take the username out of the group_id in class_id.
    group_leave(username, class_id, group_id, disconnect) {
        this.socket.emit('group_leave', username, class_id, group_id, disconnect);
    }

    //This function takes a username, class_id, group_id, and status\
    //It then emits a socket event to retrieve a list of all other group members
    //in group_id in class class_id.
    group_info(username, class_id, group_id, status) {
        this.socket.emit('group_info', username, class_id, group_id, status);
    }

    //This function takes class_id and group_id,
    // It then emits the socket event to get the color of the group
    group_color(class_id, group_id) {
        this.socket.emit('group-color', class_id, group_id);
    }

    //This function takes a username, class_id, group_id, and XML
    //It then emits a socket event to change the class's XML in the datastructure
    //based on the given XML, group_id, and class_id
    xml_update(username, class_id, group_id, xml, toolbar, toolbar_user, obj_xml, obj_label, obj_cmd_str, type_of_req, xml_update_ver, new_update) {
        this.socket.emit('xml_update', username, class_id, group_id, xml, toolbar, obj_xml, obj_label, obj_cmd_str, type_of_req, xml_update_ver, new_update);
    }

    //This function takes a username, class_id, group_id, and XML
    //It then emits a socket event to change the class's XML in the datastructure
    //based on the given XML, group_id, and class_id
    xml_change(username, class_id, group_id, xml, toolbar, toolbar_user, obj_xml, obj_label, obj_cmd_str) {
        this.socket.emit('xml_change', username, class_id, group_id, xml, toolbar, obj_xml, obj_label, obj_cmd_str);
    }

    //This function takes a username, class_id, and group_id
    //It then emits a socket event to retrieve the group's XML
    //using the given class_id and group_id
    get_xml(username, class_id, group_id) {
        this.socket.emit('get_xml', username, class_id, group_id);
    }

    //This function takes a class_id and group_id
    //It then emits a socket event to retrieve the settings of given group_id
    //in class_id.
    get_settings(class_id, group_id) {
        this.socket.emit('get-settings', class_id, group_id);
    }

    //This function is used to send the applet's current state(XML) to the server.
    //Used when a new client/student joins.
    applet_xml(xml, username, class_id, group_id, xml_update_ver) {
        this.socket.emit('applet_xml', xml, username, class_id, group_id, xml_update_ver);
    }

    //This function takes no parameters
    //and disconnects the given socket (this object) from the server.
    disconnect() {
        this.socket.disconnect();
    }

    //This function is used when a new student logs in. The new student asks another randomly selected
    //student in the class for the current XML.
    p2p_get_xml(username, class_id, group_id) {
        console.log('loading xml from peer');
        this.socket.emit('p2p_get_xml', username, class_id, group_id);
    }

    addArrowButtonsEventListeners() {
        const {
            $arrow_up_button,
            $arrow_down_button,
            $arrow_right_button,
            $arrow_left_button
        } = this.views;
        const currentLabel = this.currentLabel;
        $arrow_up_button.unbind('click');
        $arrow_up_button.bind('click', () => {
            if (this.ggbInterface.getObjectType(currentLabel) === "point") {
                this.ggbInterface.setCoords(currentLabel, this.ggbInterface.getXcoord(currentLabel), this.ggbInterface.getYcoord(currentLabel) + this.stepSize);
            }
        });
        $arrow_down_button.unbind('click');
        $arrow_down_button.bind('click', () => {
            if (this.ggbInterface.getObjectType(currentLabel) === "point") {
                this.ggbInterface.setCoords(currentLabel, this.ggbInterface.getXcoord(currentLabel), this.ggbInterface.getYcoord(currentLabel) - this.stepSize);
            }
        });
        $arrow_right_button.unbind('click');
        $arrow_right_button.bind('click', () => {
            if (this.ggbInterface.getObjectType(currentLabel) === "point") {
                this.ggbInterface.setCoords(currentLabel, this.ggbInterface.getXcoord(currentLabel) + this.stepSize, this.ggbInterface.getYcoord(currentLabel));
            }
        });
        $arrow_left_button.unbind('click');
        $arrow_left_button.bind('click', () => {
            if (this.ggbInterface.getObjectType(currentLabel) === "point") {
                this.ggbInterface.setCoords(currentLabel, this.ggbInterface.getXcoord(currentLabel) - this.stepSize, this.ggbInterface.getYcoord(currentLabel));
            }
        });
    }

    onElementChange(label) {
        this.currentLabel = label;
        this.views.$current_label.text(this.currentLabel);
    }

    onKeyPress(key) {
        const currentLabel = this.currentLabel;
        if (!currentLabel){
            return;
        }
        if (key.which === 105) { // 105 is the ASCII code of 'i'
            if (this.ggbInterface.getObjectType(currentLabel) === "point") {
                this.ggbInterface.setCoords(currentLabel, this.ggbInterface.getXcoord(currentLabel), this.ggbInterface.getYcoord(currentLabel) + this.stepSize);
            }
        } else if (key.which === 106) { // 106 is the ASCII code of 'j'
            if (this.ggbInterface.getObjectType(currentLabel) === "point") {
                this.ggbInterface.setCoords(currentLabel, this.ggbInterface.getXcoord(currentLabel) - this.stepSize, this.ggbInterface.getYcoord(currentLabel));
            }
        } else if (key.which === 107) { // 107 is the ASCII code of 'k'
            if (this.ggbInterface.getObjectType(currentLabel) === "point") {
                this.ggbInterface.setCoords(currentLabel, this.ggbInterface.getXcoord(currentLabel), this.ggbInterface.getYcoord(currentLabel) - this.stepSize);
            }
        } else if (key.which === 108) { // 108 is the ASCII code of 'l'
            if (this.ggbInterface.getObjectType(currentLabel) === "point") {
                this.ggbInterface.setCoords(currentLabel, this.ggbInterface.getXcoord(currentLabel) + this.stepSize, this.ggbInterface.getYcoord(currentLabel));
            }
        }
    }

    addKeyboardEventListeners() {
        document.addEventListener("keypress", (key) => this.onKeyPress(key));
    }
}

$(document).ready(() => {
    const server = `http://${window.location.hostname === "" ? "localhost" : window.location.hostname}:8889`;
    console.log(`server is ${server}`);
    const studentController = new StudentController(io(server));
    const login = new Login(studentController);
    if (studentController.views.$login_view.is(":visible")) {
        const url = new URL(window.location.href);
        const class_id = url.searchParams.get("class_id");
        if (class_id) {
            studentController.views.$class_id.val(class_id);
        }
    }

});