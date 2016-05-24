var cur_xml;
function appletGetXML(target){
    cur_xml = document.applet.getXML();
    $('#'+target).val(cur_xml);
}

function appletSetXML(source){
    cur_xml = $('#'+source).val();
    document.applet.setXML(cur_xml);
}

function appletEvalXML(source){
    cur_xml = $('#'+source).val();
    document.applet.evalXML(cur_xml);
}
function appletSetExtXML(xml){
    console.log("got to appletSetExtXML");
    xml = xml.replace(/&lt;/g,'<').replace(/&gt;/g, '>');
    xml = JSON.parse(xml);
    $("#xmlView").val(xml);
    //console.log(xml);
    
    document.applet.setXML(xml);
}
function clearApplet(){
    document.applet.reset();
}
function ggbOnInit(arg) {
    var applet = document.ggbApplet;
    applet.registerAddListener(listener);
    applet.registerRemoveListener(listener);
    applet.registerUpdateListener(listener);
    console.log(arg);
}
function check_xml(xml, socket){
    var old_xml = cur_xml;
    cur_xml = xml;
    if(old_xml /*!= cur_xml*/){
        var $messages = $("#messages");
        $messages.append(sessionStorage.getItem("username") + ' has changed the xml.<br/>');
        console.log("diff xml, socket call!");
        var username = sessionStorage.getItem('username');
        var class_id = sessionStorage.getItem('class_id');
        var group_id = sessionStorage.getItem('group_id');
        socket.xml_change(username, class_id, group_id, cur_xml);
    }
}
function listener(obj){
    console.log("i am listening");
    check_xml(document.applet.getXML(), socket);
}
