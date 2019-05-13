import "jquery";
import 'jquery-ui/ui/widgets/draggable'

class GeogebraInterface {
    constructor(appletId) {
        this.xml_update_ver = 0;
        this.ignoreUpdates = false;
        this.appletId = appletId;
        this.isInitialized = false;
    }


    static initRegistry() {
        if (!GeogebraInterface.appletRegistry) {
            GeogebraInterface.appletRegistry = {};
        }
    }

    static registerApplet(appletId, initCallback) {
        GeogebraInterface.initRegistry();
        GeogebraInterface.appletRegistry[appletId] = initCallback;
    }

    static globalInitHandler(applet) {
        console.log(`Initializing ${applet}`);
        GeogebraInterface.initRegistry();
        if (GeogebraInterface.appletRegistry[applet]) {
            console.log(`${applet} has callbacks`);
            GeogebraInterface.appletRegistry[applet](applet);
        } else {
            console.log(`Could not find applet for ID ${applet}`);
        }
    }

    set_captions_unassigned() {
        const applet = this.applet;
        const objs = applet.getAllObjectNames();
        for (let i = 0; i < objs.length; i++) {
            if (applet.getCaption(objs[i]) === '') {
                applet.setCaption(objs[i], 'unassigned');
            }
        }
    }

    getXML(object_label) {
        return this.applet.getXML(object_label);
    }

    setListener(listener) {
        this.listener = listener;
    }

//all document.applet (geogebra) calls are documented at http://www.geogebra.org/manual/en/Reference:JavaScript

    registerObjectClickListener(obj_label, listener){
        this.applet.registerObjectClickListener(obj_label, listener);
    }

    onAddElement(obj_label) {
        console.log(`add listener called ${JSON.stringify(arguments)}`);
        if (this.ignoreUpdates){
            return;
        }
        if (this.listener.onAddElement){
            this.listener.onAddElement(obj_label, this);
        }
    }

    renameElement(obj_label, username) {
        setTimeout(() => {
            this.ignoreUpdates = true;
            try{
                const new_obj_label = username + "_{" + this.applet.getObjectNumber() + "}";
                this.applet.renameObject(obj_label, new_obj_label);
                console.log(`setting caption of ${obj_label} to ${username}`);
                this.setCaption(new_obj_label, username);
                this.applet.evalCommand("UpdateConstruction()");
                if (this.listener.onRenameElement){
                    this.listener.onRenameElement(new_obj_label);
                }
            }catch(err){
                console.error(err);
            }
            this.ignoreUpdates = false;

        }, 0);
    }

    getCaption(obj_label){
        return this.applet.getCaption(obj_label);
    }

    isMovable(obj_label){
        return this.applet.isMoveable(obj_label);
    }

    setFixed(object_label, fixed, selectable){
        this.ignoreUpdates = true;
        this.applet.setFixed(object_label, fixed, selectable);
        this.ignoreUpdates = false
    }

    setCaption(object_label, caption){
        this.ignoreUpdates = true;
        const type = this.applet.getObjectType(object_label);
        if (type === 'point') {
            this.applet.setLabelStyle(object_label, 3);
        }
        this.applet.setCaption(object_label, caption);
        this.ignoreUpdates = false
    }

    onUpdateElement(obj_label) {
        console.log(`update listener called ${JSON.stringify(arguments)}`);
        if (this.ignoreUpdates)
            return;

        if (this.listener.onUpdateElement){
            this.listener.onUpdateElement(obj_label, this);
        }
    }

    getCommandString(object_label){
        return this.applet.getCommandString(object_label);
    }

    onRemoveElement(obj_label) {
        if (this.ignoreUpdates)
            return;
        if (this.listener.onRemoveElement){
            this.listener.onRemoveElement(obj_label, this);
        }
    }

    appletUpdate(xml, toolbar, properties, id, username, obj_xml, obj_label, obj_cmd_str, type_of_req) {
        let appletName = this.applet;

        if (properties != null && properties.hasOwnProperty('perspective')) {
            // need to set the perspective before setting the XML
            appletName.setPerspective(properties['perspective']);
        }

        let rgb_color = null;
        if (sessionStorage.getItem('admin_secret') != null) {
            rgb_color = this.hexToRgb(appletName.getColor(obj_label));
        }

        this.ignoreUpdates = true;
        if (type_of_req === 'add') {
            if (obj_cmd_str != null && obj_cmd_str !== '') {
                console.log(`Evaling command ${obj_label}:${obj_cmd_str}`);
                appletName.evalCommand(obj_label + ":" + obj_cmd_str);
            }
            console.log(`Setting XML: add`);
            appletName.evalXML(JSON.parse(obj_xml));
            appletName.evalCommand("UpdateConstruction()");
        } else if (type_of_req === 'update') {
            console.log(`Setting XML: update`);
            appletName.evalXML(JSON.parse(obj_xml));
            appletName.evalCommand("UpdateConstruction()");
        } else if (type_of_req === 'remove') {
            console.log(`Removing object`);
            appletName.deleteObject(obj_label);
        }

        //Sets object color back to what it was earlier prior to evalXML.
        //Needed for maintaining the color on the admin view tabs.
        if (rgb_color) {
            appletName.setColor(obj_label, rgb_color.red, rgb_color.green, rgb_color.blue);
        }
        this.checkLocks();
        this.ignoreUpdates = false;
    }

//Function from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            red: parseInt(result[1], 16),
            green: parseInt(result[2], 16),
            blue: parseInt(result[3], 16)
        } : null;
    }

//Used to set the entire XML for student's applets.
//Usually called when the student logs in for the first time and wants the most updated XML.
    p2pAppletSetXML(xml, toolbar, properties, id, username, obj_xml, obj_label, obj_cmd_str) {
        this.ignoreUpdates = true;
        this.applet.setXML(xml);
        this.checkLocks();
        this.registerGlobalListeners();
        this.ignoreUpdates = false;
    }

//Used to set the entire XML for the applets on the admin's view tabs.
//Usually called when the admin logs in for the first time and wants the most updated XML.
    adminP2PAppletSetXML(xml, toolbar, properties, id, username, obj_xml, obj_label, obj_cmd_str) {
        const cur_xml = this.applet.getXML();
        const cur_xml_doc = $.parseXML(cur_xml);
        const cur_construction = $(cur_xml_doc).find('construction')[0];

        xml = xml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\t/g, '');
        //xml = xml.substr(xml.indexOf("<"), xml.lastIndexOf(">"));
        const new_xml_doc = $.parseXML(xml);

        if (new_xml_doc !== null) {
            const new_construction = $(new_xml_doc).find('construction')[0];
            cur_construction.innerHTML = new_construction.innerHTML;
        }

        const final_xml = $(cur_xml_doc).find('geogebra')[0].outerHTML;
        this.applet.setXML(final_xml);
        this.checkLocks();
        this.registerGlobalListeners();
    }


//This function takes the new XML, changes it and the old XML to a JSON format, and then
// parses it, and changes it back to XML to be set in the geogebra applet.
    appletSetExtXML(xml, toolbar, properties, id, username, obj_xml, obj_label, obj_cmd_str) {
        console.log(`XML is ${xml}`);
        let appletName = this.applet;
        if (properties != null && properties.hasOwnProperty('perspective')) {
            // need to set the perspective before setting the XML
            appletName.setPerspective(properties['perspective']);
        }

        let cur_xml = appletName.getXML();
        const cur_xml_doc = $.parseXML(cur_xml);
        const cur_construction = $(cur_xml_doc).find('construction')[0];

        xml = xml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\t/g, '');
        if (xml.startsWith("\"")){
            //sometimes xml is a string, othertimes it's xml....this removes the leading and trailing quotes
            xml = xml.substr(xml.indexOf("<"), xml.lastIndexOf(">"));
        }

        const new_xml_doc = $.parseXML(xml);

        if (new_xml_doc !== null) {
            const new_construction = $(new_xml_doc).find('construction')[0];
            cur_construction.innerHTML = new_construction.innerHTML;
        }

        if (properties != null) {
            if (properties.hasOwnProperty('axes')) {
                const axis_info = properties['axes'];
                Object.keys(axis_info).forEach(function (key) {
                    axis_info[key].forEach(function (axis_tag) {
                        if (key === '3D') {
                            const euclidianView = $(cur_xml_doc).find('euclidianView3D');
                            if (euclidianView.length > 0) {
                                euclidianView[0].appendChild($.parseXML(axis_tag).children[0]);
                            }
                        } else {
                            const view = $(cur_xml_doc).find('viewNumber[viewNo=' + key + ']').parent();
                            if (view.length > 0) {
                                view[0].appendChild($.parseXML(axis_tag).children[0]);
                            }

                        }
                    });
                });
            }
            if (properties.hasOwnProperty('evSettings')) {
                const evSettings = properties['evSettings'];
                Object.keys(evSettings).forEach(function (key) {
                    if (key === '3D') {
                        $(cur_xml_doc).find('euclidianView3D')[0].appendChild($.parseXML(evSettings[key]).children[0]);
                    } else {
                        $(cur_xml_doc).find('viewNumber[viewNo=' + key + ']').parent()[0].appendChild($.parseXML(evSettings[key]).children[0]);
                    }
                });
            }
            if (properties.hasOwnProperty('coordSystem')) {
                const coordSystem = properties['coordSystem'];
                Object.keys(coordSystem).forEach(function (key) {
                    if (key === '3D') {
                        $(cur_xml_doc).find('euclidianView3D > coordSystem').remove();
                        $(cur_xml_doc).find('euclidianView3D')[0].appendChild($.parseXML(coordSystem[key]).children[0]);
                    } else {
                        $(cur_xml_doc).find('viewNumber[viewNo=' + key + '] > coordSystem').remove();
                        $(cur_xml_doc).find('viewNumber[viewNo=' + key + ']').parent()[0].appendChild($.parseXML(coordSystem[key]).children[0]);
                    }
                });
            }
            if (properties.hasOwnProperty('plate') && properties['plate'] != undefined) {
                $(cur_xml_doc).find('plate').attr('show', properties['plate']);
            }
        }

        const final_xml = $(cur_xml_doc).find('geogebra')[0].outerHTML;
        console.log(`Final xml is`, final_xml);
        this.ignoreUpdates = true;
        appletName.setXML(final_xml);
        this.ignoreUpdates = false;
        if (window.location.href.includes("student")) {
            this.rename_admin_labels();
        }
        this.checkLocks();

        if (toolbar && toolbar !== "undefined" && toolbar !== "null" && toolbar.match(/\d+/g) && properties && properties['perspective']) {
            //console.log('setting ' + appletName.id + ' custom toolbar to: ' + toolbar);
            sessionStorage.setItem('toolbar', toolbar);
            if (properties.hasOwnProperty('resetToolbar')) {
                if (properties['resetToolbar']) {
                    sessionStorage.setItem('toolbar-record', toolbar);
                }
                if (sessionStorage.getItem('toolbar-record')) {
                    appletName.setCustomToolBar(sessionStorage.getItem('toolbar-record'));
                }
            } else {
                appletName.setCustomToolBar(toolbar);
            }
        }
        if (properties != null) {
            // need to set the grid and axes visibility after setXML
            if (properties.hasOwnProperty('axis_display')) {
                appletName.setAxesVisible(1, properties['axis_display'], properties['axis_display']);
            }
            if (properties.hasOwnProperty('grid_display')) {
                appletName.setGridVisible(properties['grid_display']);
            }
            if (properties.hasOwnProperty('axis_steps')) {
                appletName.setAxisSteps(1, properties['axis_steps']['x'], properties['axis_steps']['y'], properties['axis_steps']['z']);
            }
            if (properties.hasOwnProperty('coord_system')) {
                appletName.setCoordSystem(properties['coord_system']['x_min'], properties['coord_system']['x_max'], properties['coord_system']['y_min'], properties['coord_system']['y_max']);
            }

            /* Set Applet's Graphics 2 Window Parameters if Present */
            if (properties.hasOwnProperty('g2axis_display')) {
                appletName.setAxesVisible(2, properties['g2axis_display'], properties['g2axis_display']);
            }
            if (properties.hasOwnProperty('g2grid_display')) {
                appletName.setGridVisible(2, properties['g2grid_display']);
            }
            if (properties.hasOwnProperty('g2axis_steps')) {
                appletName.setAxisSteps(2, properties['g2axis_steps']['x'], properties['g2axis_steps']['y'], properties['g2axis_steps']['z']);
            }
            if (properties.hasOwnProperty('g2coord_system')) {
                appletName.evalCommand('SetActiveView(2)');
                appletName.evalCommand('ZoomIn(' + properties['g2coord_system']['x_min'] + ',' + properties['g2coord_system']['y_min'] + ',' + properties['g2coord_system']['x_max'] + ',' + properties['g2coord_system']['y_max'] + ')');
            }
        }
        // this.registerGlobalListeners();
        /*
        This may not be needed
         */
        // If this is the students' website, then we register and add the listeners
        // if(window.location.href.includes("student")){
        //     this.registerListeners(cur_xml_doc);
        // }

        this.registerGlobalListeners();

    }

    rename_admin_labels() {

        const objs = this.applet.getAllObjectNames();
        this.ignoreUpdates = true;
        for (let i = 0; i < objs.length; i++) {
            this.applet.renameObject(objs[i], objs[i] + "_{" + sessionStorage.group_id + "}");
        }
        this.ignoreUpdates = false;
    }


    registerGlobalListeners() {
        console.log('registering listeners');

        this.applet.unregisterAddListener(`addListener${this.appletId}`);
        window[`addListener${this.appletId}`] = (label) => this.onAddElement(label);
        this.applet.registerAddListener(`addListener${this.appletId}`);

        this.applet.unregisterUpdateListener(`updateListener${this.appletId}`);
        window[`updateListener${this.appletId}`] = (label) => this.onUpdateElement(label);
        this.applet.registerUpdateListener(`updateListener${this.appletId}`);

        this.applet.unregisterRemoveListener(`removeListener${this.appletId}`);
        window[`removeListener${this.appletId}`] = (label) => this.onRemoveElement(label);
        this.applet.registerRemoveListener(`removeListener${this.appletId}`);

    }

    getXcoord(label) {
        return this.applet.getXcoord(label);
    }

    getYcoord(label) {
        return this.applet.getYcoord(label);
    }

    getObjectType(label) {
        return this.applet.getObjectType(label);
    }

    setCoords(label, x, y) {
        this.applet.setCoords(label, x, y);
    }

//This clears the local applet view
    clearApplet() {
        this.applet.reset();
    }

//This function changes the colors of all elements on the local view to a random color
    static randomizeColors(gen_new_colors, received_colors, applet, r, g, b) {
        //cur_xml = appletName.getXML();
        const minimum = 0, maximum = 255;
        let colors = [];
        const default_point = [0, 0, 255];
        const default_line = [153, 51, 0];
        const regex = /[a-z]+/;

        //If Colors Already Generated then Use the Colors sent in the Parameter
        if (gen_new_colors) {
            if (r !== undefined && g !== undefined && b !== undefined) {
                colors.push(r, g, b);
            } else {
                for (let i = 0; i < 3; i++) {
                    colors.push(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
                } //this is your color
            }
        } else {
            colors = received_colors;
        }

        //applet.unregisterUpdateListener("checkUser");
        const numelems = applet.getObjectNumber();
        for (let i = 0; i < numelems; i++) {
            const name = applet.getObjectName(i);
            if (r === "default") {
                if (regex.exec(name)) {
                    if (applet.getColor(name) !== "#" + GeogebraInterface.rgbToHex(default_line[0], default_line[1], default_line[2])) {
                        //console.log("Updating color for obj " + name);
                        applet.setColor(name, default_line[0], default_line[1], default_line[2]);
                    }
                } else {
                    if (applet.getColor(name) !== "#" + GeogebraInterface.rgbToHex(default_point[0], default_point[1], default_point[2])) {
                        //console.log("Updating color for obj " + name);
                        applet.setColor(name, default_point[0], default_point[1], default_point[2]);
                    }
                }
            } else if (applet.getColor(name) !== "#" + GeogebraInterface.rgbToHex(colors[0], colors[1], colors[2])) {
                //console.log("Updating color for obj " + name);
                applet.setColor(name, colors[0], colors[1], colors[2]);
            }
        }
        applet.registerUpdateListener("checkUser");
        return colors;
    }

// Converts RGB color to HEX
    static rgbToHex(R, G, B) {
        return GeogebraInterface.toHex(R) + GeogebraInterface.toHex(G) + GeogebraInterface.toHex(B);
    }

    static toHex(n) {
        n = parseInt(n, 10);
        if (isNaN(n)) return "00";
        n = Math.max(0, Math.min(n, 255));
        return "0123456789ABCDEF".charAt((n - n % 16) / 16)
            + "0123456789ABCDEF".charAt(n % 16);
    }

//This function grabs all objects in the construction, and sets a lock on them
//if the username in the caption is not the current user.
    checkLocks() {
        const appletName = this.applet;
        const numelems = appletName.getObjectNumber();
        for (let i = 0; i < numelems; i++) {
            const name = appletName.getObjectName(i);
            const ggb_user = appletName.getCaption(name);
            const username = sessionStorage.getItem('username');
            const objType = appletName.getObjectType(name);

            if ((username !== ggb_user && username !== "admin") && ggb_user !== "unassigned") {
                if (objType === 'numeric' || objType === 'textfield') {
                    appletName.setFixed(name, /*fixed*/true, /*selection allowed*/false);
                } else {
                    appletName.setFixed(name, /*fixed*/true);
                }
            } else if (username === ggb_user || username === "admin") {
                if (objType === 'numeric' || objType === 'textfield') {
                    appletName.setFixed(name, /*fixed*/false, /*selection allowed*/true);
                } else {
                    appletName.setFixed(name, /*fixed*/false);
                }
            }
        }
    }

    updateColors() {
        const colors = sessionStorage.getItem('group_colors').split("-");
        GeogebraInterface.randomizeColors(true, [], document.applet, colors[0], colors[1], colors[2]);
    }

//This function is an add listener added in gbbOnInit()
//It adds a caption to the new object with the local user's class username,
// and can add a lock onto it.
    addLock(object) {
        let username;
        if (sessionStorage.getItem('username') != null && sessionStorage.getItem('username') !== "admin") {
            username = sessionStorage.getItem('username');
        } else {
            username = "unassigned";
        }
        this.applet.setCaption(object, username);
        const type = this.applet.getObjectType(object);
        if (type === 'point') {
            this.applet.setLabelStyle(object, 3);
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
    getToolbarIcons(container) {
        container = typeof container !== 'undefined' ? container : '.toolbox';
        const icons = [
            {"name": "Move", "mode": 0, "src": "./images/Mode_move.svg"},
            {"name": "Point", "mode": 1, "src": "./images/Mode_point.svg"},
            {"name": "Join", "mode": 2, "src": "./images/Mode_join.svg"},
            {"name": "Parallel", "mode": 3, "src": "./images/Mode_parallel.svg"},
            {"name": "Orthogonal", "mode": 4, "src": "./images/Mode_orthogonal.svg"},
            {"name": "Intersect", "mode": 5, "src": "./images/Mode_intersect.svg"},
            {"name": "Delete", "mode": 6, "src": "./images/Mode_delete.svg"},
            {"name": "Vector", "mode": 7, "src": "./images/Mode_vector.svg"},
            {"name": "Line_Bisector", "mode": 8, "src": "./images/Mode_linebisector.svg"},
            {"name": "Angular_Bisector", "mode": 9, "src": "./images/Mode_angularbisector.svg"},
            {"name": "Circle_Two_Points", "mode": 10, "src": "./images/Mode_circle2.svg"},
            {"name": "Circle_Three_Points", "mode": 11, "src": "./images/Mode_circle3.svg"},
            {"name": "Conic_Five_Points", "mode": 12, "src": "./images/Mode_conic5.svg"},
            {"name": "Tangents", "mode": 13, "src": "./images/Mode_tangent.svg"},
            {"name": "Relation", "mode": 14, "src": "./images/Mode_relation.svg"},
            {"name": "Segment", "mode": 15, "src": "./images/Mode_segment.svg"},
            {"name": "Polygon", "mode": 16, "src": "./images/Mode_polygon.svg"},
            {"name": "Text", "mode": 17, "src": "./images/Mode_text.svg"},
            {"name": "Ray", "mode": 18, "src": "./images/Mode_ray.svg"},
            {"name": "Midpoint", "mode": 19, "src": "./images/Mode_midpoint.svg"},
            {"name": "Circle_Arc_Three_Points", "mode": 20, "src": "./images/Mode_circlearc3.svg"},
            {"name": "Circle_Sector_Three_Points", "mode": 21, "src": "./images/Mode_circlesector3.svg"},
            {"name": "Circumcircle_Arc_Three_Points", "mode": 22, "src": "./images/Mode_circumcirclearc3.svg"},
            {"name": "Circumcircle_Sector_Three_Points", "mode": 23, "src": "./images/Mode_circumcirclesector3.svg"},
            {"name": "Semicircle", "mode": 24, "src": "./images/Mode_semicircle.svg"},
            {"name": "Slider", "mode": 25, "src": "./images/Mode_slider.svg"},
            {"name": "Image", "mode": 26, "src": "./images/Mode_image.svg"},
            {"name": "Show_Hide_Object", "mode": 27, "src": "./images/Mode_showhideobject.svg"},
            {"name": "Show_Hide_Label", "mode": 28, "src": "./images/Mode_showhidelabel.svg"},
            {"name": "Mirror_At_Point", "mode": 29, "src": "./images/Mode_mirroratpoint.svg"},
            {"name": "Mirror_At_Line", "mode": 30, "src": "./images/Mode_mirroratline.svg"},
            {"name": "Translate_By_Vector", "mode": 31, "src": "./images/Mode_translatebyvector.svg"},
            {"name": "Rotate_By_Angle", "mode": 32, "src": "./images/Mode_rotatebyangle.svg"},
            {"name": "Dilate_From_Point", "mode": 33, "src": "./images/Mode_dilatefrompoint.svg"},
            {"name": "Circle_Point_Radius", "mode": 34, "src": "./images/Mode_circlepointradius.svg"},
            {"name": "Copy_Visual_Style", "mode": 35, "src": "./images/Mode_copyvisualstyle.svg"},
            {"name": "Angle", "mode": 36, "src": "./images/Mode_angle.svg"},
            {"name": "Vector_From_Point", "mode": 37, "src": "./images/Mode_vectorfrompoint.svg"},
            {"name": "Distance", "mode": 38, "src": "./images/Mode_distance.svg"},
            {"name": "Move_Rotate", "mode": 39, "src": "./images/Mode_moverotate.svg"},
            {"name": "Translateview", "mode": 40, "src": "./images/Mode_translateview.svg"},
            {"name": "Zoom_In", "mode": 41, "src": "./images/Mode_zoomin.svg"},
            {"name": "Zoom_Out", "mode": 42, "src": "./images/Mode_zoomout.svg"},
            {"name": "Polar_Diameter", "mode": 44, "src": "./images/Mode_polardiameter.svg"},
            {"name": "Segment_Fixed", "mode": 45, "src": "./images/Mode_segmentfixed.svg"},
            {"name": "Angle_Fixed", "mode": 46, "src": "./images/Mode_anglefixed.svg"},
            {"name": "Locus", "mode": 47, "src": "./images/Mode_locus.svg"},
            {"name": "Macro", "mode": 48, "src": "./images/Mode_tool.svg"},
            {"name": "Area", "mode": 49, "src": "./images/Mode_area.svg"},
            {"name": "Slope", "mode": 50, "src": "./images/Mode_slope.svg"},
            {"name": "Regular_Polygon", "mode": 51, "src": "./images/Mode_regularpolygon.svg"},
            {"name": "Show_Hide_Checkbox", "mode": 52, "src": "./images/Mode_showcheckbox.svg"},
            {"name": "Compasses", "mode": 53, "src": "./images/Mode_compasses.svg"},
            {"name": "Mirror_At_Circle", "mode": 54, "src": "./images/Mode_mirroratcircle.svg"},
            {"name": "Ellipse_Three_Points", "mode": 55, "src": "./images/Mode_ellipse3.svg"},
            {"name": "Hyperbola_Three_Points", "mode": 56, "src": "./images/Mode_hyperbola3.svg"},
            {"name": "Parabola", "mode": 57, "src": "./images/Mode_parabola.svg"},
            {"name": "Fitline", "mode": 58, "src": "./images/Mode_fitline.svg"},
            {"name": "Record_To_Spreadsheet", "mode": 59, "src": "./images/Mode_recordtospreadsheet.svg"},
            {"name": "Attach_Detach_Point", "mode": 67, "src": "./images/Mode_attachdetachpoint.svg"}
        ];

        for (let i = 0; i < icons.length; i++) {
            const data = icons[i];
            const b = $('<div>');
            const img = $('<img>');

            img.attr('src', data.src);
            img.attr('alt', data.name);

            b.append(img);
            b.addClass('btn-toolbox');
            b.attr('data-mode', data.mode);
            b.draggable({revert: true});

            $(container).append(b);
        }
    }


    ggbOnInit(applet) {
        this.applet = this.appletContainer.getAppletObject();
        this.registerGlobalListeners();
        this.isInitialized = true;
        $(window).resize(() => {
            this.applet.setHeight($(window).height() / 1.3);
        });

        if (this.listener) this.listener.ggbOnInit(applet);
    }

//This function is called in group_join_response(), initializing the geogebra applet
    appletInit(params) {
        const ggbBase64 = "UEsDBBQACAgIAJhspkgAAAAAAAAAAAAAAAAWAAAAZ2VvZ2VicmFfdGh1bWJuYWlsLnBuZ92W6Tfb2xrHfyEqjUPC" +
            "EVSRkJprOM1t1VUSoijXFKXGNr1majgNikiE1jGUamNoe80zoaG0Yix6zmqoGnrMpRE1K6VHCa1yf/fN/Q/uXeucN3vv9Xz3Wvv7PG" +
            "s/n71THewsxeHycAAAxC9ZmZMAAAIugR7YMXDEPA39FZwgFJKlGcAeVFgFAHjKJXPTy9GQjffxAWPOctzP/hS7E8TTwuLSp3AOieTs" +
            "+DF0gqu+6bFYX9/aFKsApHBkrkdxYL8kFA5POj2wHqVTjvb5RUqq2i1QM1eNOYWIPOdfEXxup9nrZmzEdOs1Y8H6QfRmUdSusdFyzF" +
            "UEvaUdytGY/q4aF6Pt4OGhrX2FnV1aqhJGLd7q+VFDqaO2dd9PJGqTp/PkyROmXVXYrgYdT0pgWn2TKN3QdKpc+FrNZkuUov+lkU4Y" +
            "unuA0nbpTf1RvbypyekXBFrX1ta2tR/GePmIoiU0CBudmLChUCjswp2PE/0PsJYLv1fYkDw9T0MZOO9SJPSNWL4JzZ3FYsUiCnH+dp" +
            "sC49ktJcbLHqGEBujr/v6K0tIPbZVra2s38ViAXTYnCruDdXB316qyK2B2UgXWVCqV/ZTNZvMc+PaMcD9bddgXzfAtvulUy89lo6Oj" +
            "CzzYDCes6PTVjvMcTsoRotgeF0Z/ZF1xKqsv2kkv6Z1sQHBwlmOZRd9Uk7/vynDJmRuTDTyVaJFhmx4D2B3N4e3MruXa5e+M4K5oBN" +
            "9dEjFedU8xe3YwX1BMso7wYgDhNDPaqMEc73HjP0d0V1dWejvrPnqL4c0wehAhjJ4a55xtfV2uJFdg4+bmVqT3cYaVG+QpwzcGHlaN" +
            "2IecdJfZ2b6Dxt7/B+MK0NcxmUFwEIISHObLT0CZx5F/+QgjeX7mcShTvP0e1dVQtV2NALSckwwxli0v8a3taPV7HqV+Ejl8fGu1++" +
            "/Ky4UPe5t1pvNr0xIPpPkoRhGlLAiaDkMCFnKGUAheBAbgly3GYHKSGCBd/yZMiA5HAvTBDJakvgoBkLu+gIQeSGOAg/yTzliyOQPQ" +
            "f9mrDNvTJAB7hgYsi+4UAEK+84CI3HJiAFuU0MsZDEmIUDcMm4zhVwEQ/vJMtTwEC/qVtJAw7bYHpaFWx7NCFlAYgE1XSGQUgdL/xV" +
            "DZe2LzOl5HT9fdX0AKFSOBYnjdbNcExiZ3LPq/JXxwYa3Go0Mr0+uGKUGPAKxkTCYQGsD6N5RV/AT9AnrlpSjCoNoEAGrkLk/8E29h" +
            "JJfRYndcYgKnPJRc7PrY4NVi257KjH1l32KTNlTQ763ugZRzLfbhcy9EOpLnbpf59j5r1c21sFU6XufV7hItQg4ge79K/ymCefhImZ" +
            "i8aoCK5u5uTIvFEY+4RRdiGo+SReJ+n5x07R75hm/r7Ow8Sjb47DPGciZlbxy2peL2xkxlrCpIzD6fY61wtsC5uLgekKmbOq+hO/ui" +
            "iyTBueXWRXUa8Yxpbnz9tdNYNkrhO8E9164pSjDOeWi1MaIZLPCivf3t6eIVvSe0o8l5+14E97AxanbxrlqO/QMj/66fYwK/dC0J88" +
            "3yykcC9z8JJALpQZUKe9yAzu/oqBrcrc1xxXbfjUzs4vDb8UOBPP2P1bZIJl1dB7fUqYZVciXvfTm4923x7q3Fvv36Jc5UN7tmbIcU" +
            "x/1BWF3V6ENV5rXcV5Zq6t9Uie1cY0919HPpJfQHguq9F/4dM1ddig1o1EOoxuiEmNiy7FrAQKtsU0iB7FnqG/xhnC2xuWQOtS2KCP" +
            "9Q59Z0GB9r0r61f1F4/W/fVvLs3duoIfrUgMKq5/TnykMFfhxay/XI3eHPOD/EwPyzkHq916G87WAlo6ywOWNGQunEbf8OUX7PfQXd" +
            "twdFgISBTSAMUwy2CktUG1oqhQFK5Q0GVP5kgWTZ2pqRwqwB0Xcd1Tkq72X4t01nCody1hqPrGm0snQFI7egT2hlrBbLh5urc4b2NW" +
            "IVlAxTrsDnjYpErON0TVjv7lr7xmz/8SlXr/e31CyfXZxvYwSPSHI+ex5tIZ9D6x6QAnjiHHMJtMm615j0eiWwCWkxlGWZdaeB3Eh6" +
            "bIMMB7kRTtG9nMRAgdyA4x5i+JUgyJY8q+EQbbBxUH66pt22oDTQ6oAScgFBpv3GM5GRB0p5lBItaB0IMpdHrVCIAQgyg2UzZ5grCL" +
            "I6fcpxoVAwxdDBJBayAQSZ6/UlKegMCLKZfDFnZfJFBtDw8o0qrAUE2f/U0Bmyc/xRh9OLCzxDvpKSyv1MoEgiP5MpRm3DK7aw2VdD" +
            "T9zi5LfsmMQ8u9l4sL/jT3Jz05y6MZ4Er+khgof8WpLqmW0c75mdNm2tmmN9SS3rc6NYmlIcxEQxess/XBj1w+ohF79wjJ55zZSAAl" +
            "/rsdsoIUcQL44ZeX6SDqCFv3DgUPhTvbB3QZDl+n++q5cu2pmzzciJ/wZQSwcIWVhLyxgHAADOCgAAUEsDBBQACAgIAJhspkgAAAAA" +
            "AAAAAAAAAAAXAAAAZ2VvZ2VicmFfZGVmYXVsdHMyZC54bWztmktzozgQgM87v0Kl0+7BNg9jO6k4U56p2tpUZTKpTWpqrjK0sTYgsU" +
            "jEOL9+hYQBJ7HHIc5zc7Fo0XrwdavVCB99zuMIXUMqKGdjbHctjID5PKAsHONMzjoj/Pn401EIPIRpStCMpzGRY+wVmlU7JXUd1y3q" +
            "UC7oIeNnJAaREB8u/DnE5JT7RGrVuZTJYa+3WCy6q067PA17YSi7uQgwUhNiYozLi0PV3VqjhavVHcuyez+/nZruO5QJSZgPGKnJBj" +
            "AjWSSFuoQIYmASyWUCY5xwyiRGEZlCNMbnhYR+n6UAf2BUNlIMLHz86bcjMecLxKf/gK/qZJpB1U4LvUJH3f7KI56idIzVo4f6dzrG" +
            "judhRKJkTooarRqRJaTomkRVDckk93VrXTsjkYCVrhrnGw/A3OmX+ozGmiESEhLVTdfGSCQAgZozLp9QXSRqKG29Ro8+52kgUD7GZ+" +
            "QMo2VZ3phSq2g2F/SmHNRr1splBI25H/VKrLsBDiABFiilNcp2K8qDkcZcFFNTPDXmp4Ts7gvyd9ZE67RCazueZqvL53LiN+HCJ+xv" +
            "CNWcm4zdD8Z7Zbzuwf23EYL3SlarGIai+B1jn8dJBPkewUeU1RBPtVBBdx6/71kvgtxqjbzAYeDJOfWvGAiVeDiNfouLv2igNq9iPN" +
            "0G/mVrRqLKRtSncjt4AWEhVSwvVnKNv92G+H/DzzMZFWOdMKmST0VJzU3ceZgrgORSNf7OLlPCRJG0Gp0VxM2WmmVMd3r2g6QV+0zl" +
            "LzM126BpsHZbwMYg1XW8l7bar6lsJ/L4sP2qXPjh/rkZYEqW2xa/977IvdXFf6365PWy/1GKlZ3cjz1yFzvdk8qQVIKghG3n73NG/Q" +
            "rmVyNV9PvvjH6r9IOGwIybCoRyS4+ytLT6jVWe4OS2lpe2vntjm2rdXk01pTmamBYTozhxTOGaom8Kr0LSLufRxkyU4RuB79Z66rdL" +
            "emzP1Tb17NtG7dofZt2LWZ8h2LIshrSx3M9WcuUenlnwqr8M1oy5w/JeecJmu4uIBspJYqrM0FGJWEzy4r0KkangUSbhwk8BWH1yaR" +
            "xzQQM5L96W1FgzmhcOYW7MeUpvOJPVw6PCrSeRPuJsenIb/9jp8O+BOR1hYVSvtImRavbmFEkr3X7BvM8kTZpWCXPQdUauPfJca2gP" +
            "D7zRYEe49qg13LVQYiDssjvY1kYHenwoeZDBnXKM1G+cE1qbvMAaDZ3BoD9wvIODoT3oD/ef6f9ZVVS+MXiJjbixgJ4jYLvt8vydXx" +
            "8H7VJ+x+pviHfDV/z6mPBoGTZ86nwlVziGxqXaxMb3lD1sR7h2fHdeVdQQ7WeD+EqT6i1Hn9zPRH32aaSK3OidvVqQLKcRJeny7kh7" +
            "PNSQkNfJ/aUWGp9RXyHSzY+iQIf11E6M1PhaaR5mRhU3RmLVwAxC2RfiX4UpVyH+boK5l0d/xTFpynkEpA7rX1Zy41vknRR+E6Ddk7" +
            "UnW2/+HPyrKc/Xcs/tUYWKegWcaqHxjfCeFfCYlLRTusI0rNMBz3xQ1OWtE+Xi+sUDUZu9aLdPXZ07wanX+ONHb/XnkuP/AFBLBwgE" +
            "astsoAQAAOMiAABQSwMEFAAICAgAmGymSAAAAAAAAAAAAAAAABcAAABnZW9nZWJyYV9kZWZhdWx0czNkLnhtbO2WyW7bMBCGz81TEL" +
            "xHq5XEhpXASA8tkAQtcumVlsYyW4lUSCqW82p9hz5TuciK7DgBYqRoi/bC4TLD5fvJkaYXbVWiexCScpbi0AswApbxnLIixY1aHJ/h" +
            "i/OjaQG8gLkgaMFFRVSKE+PZx+mWF8Wx6UOtpBPGb0gFsiYZ3GZLqMgVz4iyrkul6onvr1YrbzOpx0XhF4XyWpljpDfEZIq7ykRPtx" +
            "W0iq17FASh/+X6yk1/TJlUhGWAkd5sDgvSlErqKpRQAVNIrWtIMWmpjPUSJZlDmeKZab7HqPNPcRwGMT4/ejeVS75CfP4VMt2rRAN9" +
            "jG34xkcPX/KSCyRSrM9d2HJuS1LWS2Jq1rEkaxDonpR9D2kUz2ys7V2QUsLGV69yzXNwI6POn9HK4kNSQa1lwkjWALmtuaPpVWu9kJ" +
            "VtOB9lcKvWJSC1pNk3BlKjjQZBpvKB5jkY9V0M3DEXIk2Z4poILaYSNNNruDroM//4btynfof4CeysEfeQEaFAUsIG2C/NwC73k3+d" +
            "+wsgOaPZgN9HpvlLjchszFLeQpkEB6GMksTCDKPTXZxe+DcC1ReZFsD0HVRcSJ2XArvKOrDuD0GX7drQttehHX0IXbeN11sVtEUzFz" +
            "FzjrPImdiZkTNJj2T39dCqLmlG1csa6yMzGGj8yba33ojOeAcJOx5bXaNwbHW1tlc2eStlM85FLlHrYDrEtlz1Uy6I+ap0q/R3ap+u" +
            "wWEPpeblegm54OyR46DrEWXcoTzkUr0Wf5jEln8SPnlWo9/9rJ5HedeQ3Cb87myfN+0hxPCwRBOM9mdt7/TNbuOvyBZ7c4XpdAlh7c" +
            "xD1E/42vSBZifOnDpz5sy4o/C8WLIRC/2nte9b2w1t6zb6Y3V74+9DeFgeYaB6FjemPoSX/M8cO/D8wf+2v/mnP/8JUEsHCKjDK0K0" +
            "AgAAWgwAAFBLAwQUAAgICACYbKZIAAAAAAAAAAAAAAAAFgAAAGdlb2dlYnJhX2phdmFzY3JpcHQuanNLK81LLsnMz1NIT0/yz/PMyy" +
            "zR0FSorgUAUEsHCNY3vbkZAAAAFwAAAFBLAwQUAAgICACYbKZIAAAAAAAAAAAAAAAADAAAAGdlb2dlYnJhLnhtbLVXbW/bOAz+vP0K" +
            "wp/TRJIlvwxJh23AAQN6w3DdHQ73zS9qItSxA0tJ2sN+/EjJzku77q7rHRpXJkWRfEhKlOdv79YN7HRvTdcuIj5lEei26mrTLhfR1t" +
            "1cZNHby9fzpe6WuuwLuOn6deEWkSLJwzqkpiKOiWfqRVRlRXojZXGR6zK7kLJOL7I0VxdlKnXKKl2XGUrCnTVv2u5TsdZ2U1T6ulrp" +
            "dXHVVYXzSlfObd7MZvv9fjqan3b9crZcltM7W0eArrd2EQ0vb1Dd2aJ97MUFY3z2569XQf2Faa0r2kpHQLC25vL1q/netHW3h72p3W" +
            "oRZQydW2mzXCHOhIgZCW0Q7EZXzuy0xaUnpMfs1pvIixUtzb8Kb9Ac4ERQm52pdb+IUGXXG926YYoPJmbj4vnO6H3QQm/egGR5iiE3" +
            "1pSNXkQ3RWMRhGlvegwg2u+3SFp33+iy6Ef6aJ5P/B+KmL81aUMnAm4klJzEeTpJGZsoNQA+Ma24iMB1XeM1M/gKHBTDB3gOE0hS5A" +
            "jgCiRyMuSkEBNPcQkxkAiPQUocJbF5QnMK1ysGnCMbBAMhQHAQMZJKgUpApbRQoGySe2UMH5JGd/CJiRfH+HheLPER9IaKVFCDTqg4" +
            "8W+KpFG/EuS+Z8YZyBwNEUOlHGL0AemUAWqMST33ICQD+nGQpF6kIDJAfYibNDPxg6QM9DErA+NBWsakqNOkcEwGPViBE8keJ0Wepw" +
            "QzwBDbhAYeBnI3ScIUCzwWh0GEQYZBBRkZlssgGtAyGWRk/FKYI8j4OSCzE5CcQGBSyHs/xEB+c+8/DXIgk0D6UmOcDdyM/uVEYEyS" +
            "zL+8EFP8U5j4idWwS59jdDSZ5s8wKV5i8oDyOwaFegLjC0M7muTqxCja8j//PDIZP2sjPjoef8JicrYFX3I2/4RxLrJnWHw6wjL71y" +
            "ZT9t0jJ4x8GH+Uhf8jDi89mA5x+AeT89nYk+dDDMCuSHa06fTaUlji/NAfE+pgQ5NMBaQK0uSkVU6oWSbq2C+pW2Zn/VJlJ00TO2ZC" +
            "zNR3YLRELS80UCHHHjoZuujXR10Um5489j10kFTRiTo0PrQuTlufwGMSnaaOgX2cTkwQqFIAdsyE1j3RFSPYdNYcwrvSzeYQJR9J02" +
            "627jx61boey8F1KF40/r43LKi76vb9w4DrwrpTvXh7Ol7Jwm3q7Mb2at4UpW7wYntN5QCwKxratt7CTdc6GItPRF6dvxzO9bZqTG2K" +
            "9g9M/3g1+7Rdl7oH/9oRSq+ElsN4i/Tn83iLVHkWRKqu6+vre4vFAnd/6R4XxzKdylSKNMlUrrD7YkHfD1M8mWa5zLM8SXIpeIyxtV" +
            "VBlS6TaZInaZ7ihSZJOM8UrnpiTgXbenetnUP8Foo7bcd4L3vaRkMcifho33fNkbXpTOs+FBu37f1HAbrXE6p37bLRPpQ+zXi7rm7L" +
            "7u7ax1AkQdeX+40+BLlcfuiargfch0Khv8thLMPoZcizgxTzMsxLDDpI6WGe58JL+LEMo5fCLAfXBqR8hMlGK8ZCoIeiGo4iqhC6qm" +
            "9b465Gwpnq9giU5EP+xxCeq+T/kcr57EHpzW913+omlFGLidx2WxuqOKTK+7G1+nPhVu/a+je9xD34uaCj0KHqIHr0uNaVWePCwB8i" +
            "V1BWf0dXA7fWy16PCMOeDHEdNg/YTa+L2q60dofohiI/FTuq/qXv1h/b3RcsoQeuz2cjvrmterOhSoUST+pbfSzG2tgCT/r6dB0Gwy" +
            "Kqik4cDKyjoEZQbN2q6/1nV+GIQxZORf0WH74rL78BUEsHCEFJnoY/BQAACA8AAFBLAQIUABQACAgIAJhspkhZWEvLGAcAAM4KAAAW" +
            "AAAAAAAAAAAAAAAAAAAAAABnZW9nZWJyYV90aHVtYm5haWwucG5nUEsBAhQAFAAICAgAmGymSARqy2ygBAAA4yIAABcAAAAAAAAAAA" +
            "AAAAAAXAcAAGdlb2dlYnJhX2RlZmF1bHRzMmQueG1sUEsBAhQAFAAICAgAmGymSKjDK0K0AgAAWgwAABcAAAAAAAAAAAAAAAAAQQwA" +
            "AGdlb2dlYnJhX2RlZmF1bHRzM2QueG1sUEsBAhQAFAAICAgAmGymSNY3vbkZAAAAFwAAABYAAAAAAAAAAAAAAAAAOg8AAGdlb2dlYn" +
            "JhX2phdmFzY3JpcHQuanNQSwECFAAUAAgICACYbKZIQUmehj8FAAAIDwAADAAAAAAAAAAAAAAAAACXDwAAZ2VvZ2VicmEueG1sUEsF" +
            "BgAAAAAFAAUATAEAABAVAAAAAA==";
        params.container = typeof params.container !== 'undefined' ? params.container : 'appletContainer';
        params.width = typeof params.width !== 'undefined' ? params.width : 800;
        params.height = typeof params.height !== 'undefined' ? params.height : 600;
        params.enable3D = true;
        params.enableCAS = true;
        params.ggbBase64 = ggbBase64;
        params.id = this.appletId;
        GeogebraInterface.registerApplet(this.appletId, this.ggbOnInit.bind(this));
        this.appletContainer = new GGBApplet(params, true);
        let current_path = window.location.pathname;
        current_path = current_path.substring(0, window.location.pathname.lastIndexOf('/'));
        this.appletContainer.setHTML5Codebase(current_path + '/5.0/web3d/');

        this.appletContainer.inject(params.container, 'auto');
    }
}

//Currently (until Chris does a PR to fix this), GGB only looks for the global callback
window.ggbOnInit = GeogebraInterface.globalInitHandler;

export default GeogebraInterface;