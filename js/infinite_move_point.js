

var startLooping = false; // set to true to start moving point

var xPositions = [1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2, 2.05, 2.1, 2.15, 2.2, 2.25, 2.3, 2.35, 2.4, 2.45, 2.5, 2.55, 2.6, 2.65, 2.7, 2.75, 2.8, 2.85, 2.9, 2.95, 3, 3.05, 3.1, 3.15, 3.2, 3.25, 3.3, 3.35, 3.4, 3.45, 3.5, 3.55, 3.6, 3.65, 3.7, 3.75, 3.8, 3.85, 3.9, 3.95, 4, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3, 4.35, 4.4, 4.45, 4.5, 4.55, 4.6, 4.65, 4.7, 4.75, 4.8, 4.85, 4.9, 4.95, 5];
var xLength = xPositions.length;
var xIndex = 0;
var re = /x=\"\-?\+?[0-9]*\.?[0-9]*\"/
function infiniteLoop() {
    if (startLooping) {
        var applet = document.applet;
        var cur_xml = applet.getXML();
        var cur_xml_doc = $.parseXML(cur_xml);
        var oldVersion = $(cur_xml_doc).find("construction")[0].innerHTML;

        var element_to_move = $(cur_xml_doc).find("construction").find("element[label='A']")[0];
        var updated_element = element_to_move.innerHTML;

        if (xIndex >= xLength) {
            xIndex = 0;
        }
        var newPos = "x=\"" + xPositions[xIndex] + "\""; 
        updated_element = updated_element.replace(re, newPos);
        element_to_move.innerHTML = updated_element;

        var final_xml = $(cur_xml_doc).find("construction")[0].outerHTML;
        applet.evalXML(final_xml);


        cur_xml = applet.getXML();
        cur_xml_doc = $.parseXML(cur_xml);
        var newVersion = $(cur_xml_doc).find("construction")[0].innerHTML;
        patch = dmp.patch_make(oldVersion, newVersion);
        var data = {
            username: sessionStorage.getItem('username'),
            class_id: sessionStorage.getItem('class_id'),
            group_id: sessionStorage.getItem('group_id'),
            patch: patch
        };

        socket.patch(data);

        ++xIndex;
    }
}

window.setInterval(infiniteLoop, 100);