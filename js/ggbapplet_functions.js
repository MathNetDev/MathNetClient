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
    $("#xmlView").val(xml);

    document.applet.setXML(xml);
}
function ggbOnInit(arg) {
    console.log(arg);
}
function check_xml(xml, socket){
    var old_xml = cur_xml;
    cur_xml = xml;
    if(old_xml != cur_xml){
        socket.xml_change(cur_xml);
    }
}
