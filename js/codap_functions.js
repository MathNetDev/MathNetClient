"use strict";

var currentMax = -1;

//escapes most strings to not break general forms
function escapeStr(str) 
{
    if (str)
        return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=><|\/@])/g,'\\$1');      

    return str;
}

/**
 * function ping response
 * checks time and update ping
 */
 function ping_response(time) {
    var d = new Date();
    //console.log(d.getTime() - time)
    $('.ping').html("Ping: " + (d.getTime() - time).toString());
 }

 

//displays server error on client side
function server_error(error) {
    var str = error;

    if (str.indexOf("Invalid username") !== -1) {
        $username.css("border-color", "red");
        $error_username.show();
    }
    else if (str.indexOf("invalid.") !== -1) {
        $class_id.css("border-color", "red");
        $error_class_id.show();
    }
    else {
        console.log(error);
        sessionStorage.setItem('error', error);
        location.reload();
    }
}


//shows class_view and sets sessionStorage for class_id and username, then calls groups_get
function login_response(username, class_id) {
    $login_view.hide();
    $class_view.show();
    $group_view.hide();

    username = username.replace(/&lt;/g,'<').replace(/&gt;/g, '>');

    sessionStorage.setItem('class_id', class_id);
    sessionStorage.setItem('username', username);
    socket.groups_get(username, class_id);
}

//shows login_view, and removes class_id and username from sessionStorage 
//if logout was not a disconnect
function logout_response(disconnect) {
    $login_view.show();
    $class_view.hide();
    $group_view.hide();


    $error_username.hide();
    $error_class_id.hide();

    $class_id.css("border-color", null);
    $username.css("border-color", null);

    $class_id.val("");
    $username.val("");
    
    if(!disconnect){
        sessionStorage.removeItem('class_id');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('group_id');
        sessionStorage.removeItem('toolbar');
        sessionStorage.removeItem('group_colors');

    }
}

//populates $groups with buttons with info from groups.
function groups_get_response(username, class_id, groups) {
    $groups.empty();
    for (var i in groups){
        var button = '<input type="button" class="btn btn-md btn-primary " style="margin: 0em 1em 1em 0em" id="grp' + groups[i].grp_name + '" value="Group ';
        button += groups[i].grp_name + ' - '+ groups[i].num;
        button += '" />';
        $groups.append(button);
    }
}

//increments group_size if status is true (user is joining group), else decrements
function group_numbers_response(username, class_id, group_id, status, group_size){
    var group_size = (status ? group_size++ : group_size--);
    $("#grp" + group_id).val('Group ' + group_id + ' - ' + group_size);
}

//resets $messages and $people, sets group_id in sessionStorage, then calls group_info
// and get_settings
function group_join_response(username, class_id, group_id, group_size) {
    $login_view.hide();
    $class_view.hide();
    $group_view.show();
    
    sessionStorage.setItem('group_id', group_id);

    socket.group_info(username, class_id, group_id, true);
    socket.get_settings(class_id, group_id);
}

// shows class_view, and removes group_id from sessionStorage if disconnect is not true
function group_leave_response(username, class_id, group_id, disconnect) {
    // This function must call socket.groups_get(username, class_id)

    $login_view.hide();
    $class_view.show();
    $group_view.hide();
    if(!disconnect){
        sessionStorage.removeItem('group_id');
    }    
}

// populates $people with members array values, and appends join/leave message
// based on status. removes #username if leave
function group_info_response(username, class_id, group_id, members, status) {
    var current_user = sessionStorage.getItem('username');
    var current_group = sessionStorage.getItem('group_id');
    
    if(status){
        for (var i in members) {
            members[i].member_info = JSON.parse(members[i].member_info);
            var member = members[i].member_name.replace(/&lt;/g,'<').replace(/&gt;/g, '>');
            if(member == current_user) {
                $group_name.html('Group: ' + current_group + ', ' + members[i].member_name); //only update this for the new member
            }
        }
    } 
}//members is undefined if group_info_response is triggered by group_leave, so short circuit it on status.

// for getting the val of the spreadsheet element
function getVal(html) {
    var index = html.indexOf("val=") + 5;
    var val = html[index];
    index++;

    // for checking for all digits
    while(html[index] != '"'){
        val = val + html[index];
        index++;
    }

    return parseInt(val);
}

// for getting the index of the spreadsheet element
function getIndex(html) {
    var index = html.indexOf("label=") + 7;
    var x = html[index];
    index++;
    var y = html[index];
    index++;

    // for checking for all digits
    while(html[index] != '"'){
        y = y + html[index];
        index++;
    }

    return [parseInt(x.charCodeAt() - 64), parseInt(y)];
}

// for creating a new 3d array
function getArray(x,y)
{
  var iMax = y;
  var jMax = x;
  var f = new Array();

  for (var i=0;i<iMax;i++) 
  {
       f[i]=new Array();
       for (var j=0;j<jMax;j++) {
        f[i][j]="";
       }
  }
  return f;

}

// for creating a new 3d array
function get3DArray(x,y,z)
{
  var iMax = y;
  var jMax = x;
  var f = new Array();
  for(var k=0;k<z;k++)
  {
    f[k] = new Array();
    for (var i=0;i<iMax;i++) 
    {
         f[k][i]=new Array();
         for (var j=0;j<jMax;j++) {
          f[k][i][j]="";
         }
    }
  }
  return f;

}

// for getting the name of the student
function getStudent(html)
{
  var index = html.indexOf("caption val=") + 13;
  var name = html[index];
  index++;
  // for checking for the entire name
    while(html[index] != '"'){
        name = name + html[index];
        index++;
    }

  return name;
}

// the function that goes through the 3d array and gets rid of all the empty cells
function fill_spaces(spread, max_student)
{
  var max = max_student;
  
  for(var i = 0; i < max_student.length; i++)
  {
    var max_number = 0;
    for(var j = 0; j <= max_student[i]; j++)
    {
      for(var k = 0; k < 10; k++)
      {
        var tempj = j;
        while(spread[i][tempj][k] == "" && tempj <= max_student[i]) //  going down the list and filling up the spaces
          tempj++;

        if(tempj <= max_student[i] && tempj != j)
        {
          console.log(spread[i][j][k],i, tempj, spread[i][tempj][k]);
          spread[i][j][k] = spread[i][tempj][k];
          spread[i][tempj][k] = "";
          if(j>max_number)
            max_number = j;
          //max[i] = max[i] - (tempj - j);
        }
      }
    }
    if(max_number < max_student[i]) // finding the last line so empty lines dont show up on the table
      max[i] = max_number;
  }

  return spread, max;
}

//handler for xml_change response, appends message to chatbox, and calls appletSetExtXML()
function xml_change_response(username, class_id, group_id, xml, toolbar, properties) {
    socket.group_color(sessionStorage.getItem('class_id'),sessionStorage.getItem('group_id'));
    //console.log(xml);
     xml = xml.replace(/&lt;/g,'<').replace(/&gt;/g, '>').replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\t/g, '');
    xml = xml.substr(xml.indexOf("<"), xml.lastIndexOf(">")) ;
    var cur_xml_doc = $.parseXML(xml);
    var spreadsheet_elements = $(cur_xml_doc).find('[type="numeric"]');
    console.log(spreadsheet_elements);
    var spreadsheet_student_names = getArray(10,100);
    var student_names = [];
    var max_student = [];

    var i = 0;
    var ymax  = 0;
    while(i < spreadsheet_elements.length) // getting the student names
    {
      var student_name = getStudent(spreadsheet_elements[i].innerHTML);
      spreadsheet_student_names[getIndex(spreadsheet_elements[i].outerHTML)[1] - 1][getIndex(spreadsheet_elements[i].outerHTML)[0] - 1] = student_name;

      if (student_names.indexOf(student_name) == -1)
        student_names.push(student_name);
        
      i++;
    }

    var spreadsheet = get3DArray(10,100,student_names.length);

    for(var j = 0; j < student_names.length;j++) // getting all the data and storing based on the students
    {
      var max = 0;
      var i = 0;
      while(i < spreadsheet_elements.length)
      {
        if(student_names[j] == spreadsheet_student_names[getIndex(spreadsheet_elements[i].outerHTML)[1] - 1][getIndex(spreadsheet_elements[i].outerHTML)[0] - 1]) // the student
        {
          spreadsheet[j][getIndex(spreadsheet_elements[i].outerHTML)[1] - 1][getIndex(spreadsheet_elements[i].outerHTML)[0] - 1] = getVal(spreadsheet_elements[i].innerHTML);

          console.log("here");
          // to update the till what the table needs to be created
          if(getIndex(spreadsheet_elements[i].outerHTML)[1] - 1 > max)
            max = getIndex(spreadsheet_elements[i].outerHTML)[1] - 1;
        }

        i++;
      }

      max_student.push(max);

    }

    spreadsheet, max_student = fill_spaces(spreadsheet, max_student);
    //console.log(max_student);
    generateNumbers(spreadsheet,student_names, max_student);
    
    //appletSetExtXML(xml, toolbar, properties);
    //ggbOnInit('socket_call');
}

//calls appletSetExtXML() to update the local geogebra applet.
function get_xml_response(username, class_id, group_id, xml,toolbar, properties){
    if(xml == undefined){
        xml = '{}';
    }
    if(!toolbar){
        toolbar = sessionStorage.getItem('toolbar');
    }
    
    //appletSetExtXML(xml, toolbar, properties);
    //ggbOnInit('socket_call')
}

// updates $class_settings based on settings array
function get_settings_response(class_id, settings) {
    $class_settings.html('');

    for (var setting in settings) {
        var setting_item = "<li>" + setting + ": " + settings[setting] + "</li>";
        $class_settings.append(setting_item);
        if (setting == "Hide Options" ){
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

//adds a new group button
function add_group_response() {
    var group_number = $groups.children().length + 1;
    var button = '<input type="button" class="btn btn-md btn-primary " style="margin: 0em 1em 1em 0em" id="grp' + group_number + '" value="Group ';
    button += group_number + ' - '+ 0;
    button += '" />';
    $groups.append(button);
}

//removes last group button
function delete_group_response() {
    $('#buttons input').last().remove();
    $('#buttons > li:last').remove();
}

function delete_student_class_response() {
    delete sessionStorage.class_id;
    delete sessionStorage.group_id;
    delete sessionStorage.username;
}

function group_color_response(colors) {
    sessionStorage.setItem('group_colors', colors);
}

// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================

//
// This is a very simple Data Interactive Plugin to CODAP.
// It is intended to demonstrate the basics of writing a plugin.
// On button press it creates or a set of random numbers and sends it to CODAP.
// It saves an index of the sample set in its state, so that, if the document
// is saved and restored, it will assign a new value, not one that has already
// been used.
//
var kDataSetName = 'MathNet_Spreadsheet';
var kAppName = "MathNet Spreadsheet";
// The following is the initial structure of the data set that the plugin will
// refer to. It will look for it at startup and create it if not found.
var kDataSetTemplate = {
    name: "{name}",
    collections: [  // There are three collections: a parent and a child and a child's child
      {
        name: sessionStorage.getItem('class_id'),
        // The parent collection has just one attribute
        attrs: [ {name: "Group_Number", type: 'categorical'}],
      },
      {
        name: 'Student_Names',
        parent: sessionStorage.getItem('class_id'),
        attrs:[ {name: "student_name", type: 'categorical'}],
      },
      {
        name: 'Spreadsheet',
        parent: 'Student_Names',
        labels: {
          pluralCase: "Spreadsheet",
          setOfCasesWithArticle: "a sample"
        },
        // The child collection also has just one attribute
        attrs: [{name: "A", type: 'nominal', precision: 1}, {name: "B", type: 'nominal', precision: 1}, {name: "C", type: 'nominal', precision: 1}, {name: "D", type: 'nominal', precision: 1}, {name: "E", type: 'nominal', precision: 1}, {name: "F", type: 'nominal', precision: 1}, {name: "G", type: 'nominal', precision: 1}, {name: "H", type: 'nominal', precision: 1}, {name: "I", type: 'nominal', precision: 1}, {name: "J", type: 'nominal', precision: 1}]
      }
    ]
  };

/**
 * myState is a local copy of interactive state.
 *
 *  It is sent to CODAP on demand and restored from CODAP at initialization time.
 *
 *  @type {Object}
 */
var myState;

function warnUser(message) {
  var messageArea = document.getElementById('message-area');
  messageArea.innerHTML = '<span style="color:red">' + message + '</span>';
}

function warnNotEmbeddedInCODAP() {
  warnUser( 'This page is meant to run inside of <a href="http://codap.concord.org">CODAP</a>.' +
      ' E.g., like <a target="_blank" href="http://codap.concord.org/releases/latest?di='
      + window.location.href + '">this</a>.');
}

// *
//  * Reads the form and returns the number of samples requested for a set.
//  * @returns {number} Expects a positive integer.
 
// function getRequestedSampleCount() {
//   var tHowMany = document.forms.form1.howMany.value.trim();
//   return Number(tHowMany);
// }

/**
 * Sends a request to CODAP for a named data context (data set)
 * @param name {string}
 * @return {Promise} of a DataContext definition.
 */
function requestDataContext(name) {
  return codapInterface.sendRequest({
    action:'get',
    resource: 'dataContext[' + name + ']'
  });
}

/**
 * Sends a request to CODAP to create a Data set.
 * @param name {String}
 * @param template {Object}
 * @return {Promise} Result indicating success or failure.
 */
function requestCreateDataSet(name, template){
  var dataSetDef = Object.assign({}, template);
  dataSetDef.name = name;
  return codapInterface.sendRequest({
    action: 'create',
    resource: 'dataContext',
    values: dataSetDef
  })
}

/**
 * Make a case table if there is not one already. We assume there is only one
 * case table in the CODAP document.
 *
 * @return {Promise}
 */
function guaranteeCaseTable() {
  return new Promise(function (resolve, reject) {
    codapInterface.sendRequest({
      action: 'get',
      resource: 'componentList'
    })
    .then (function (iResult) {
      if (iResult.success) {
        // look for a case table in the list of components.
        if (iResult.values && iResult.values.some(function (component) {
              return component.type === 'caseTable'
            })) {
          resolve(iResult);
        } else {
          codapInterface.sendRequest({action: 'create', resource: 'component', values: {
            type: 'caseTable',
            dataContext: kDataSetName
            
          }}).then(function (result) {
            resolve(result);
          });
        }
      } else {
        reject('api error');
      }
    })
  });
}

/**
 * Sends an array of 'items' to CODAP.
 * @param dataSetName
 * @param items
 * @return {Promise} of status of request.
 */
function sendItems(dataSetName, items) {
  return codapInterface.sendRequest({
    action: 'create',
    resource: 'dataContext[' + dataSetName + '].item',
    values: items
  });
}

// stuff= {
//   "action": "create",
//   "resource": "dataContext[MathNet_Spreadsheet]" ,
//   "values": [{
//         "name": 'Spreadsheet2',
//         "parent": 'Student_Names',
//         "labels": {
//           "pluralCase": "Spreadsheet",
//           "setOfCasesWithArticle": "a sample"
//         },
//         // The child collection also has just one attribute
//         "attrs": [{"name": "A", "type": 'nominal', "precision": 1}, {"name": "B", "type": 'nominal', "precision": 1}, {"name": "C", "type": 'nominal', "precision": 1}, {"name": "D", "type": 'nominal', "precision": 1}, {"name": "E", "type": 'nominal', "precision": 1}, {"name": "F", "type": 'nominal', "precision": 1}, {"name": "G", "type": 'nominal', "precision": 1}, {"name": "H", "type": 'nominal', "precision": 1}, {"name": "I", "type": 'nominal', "precision": 1}, {"name": "J", "type": 'nominal', "precision": 1}]
//       }]
// }

function updateItems(dataSetName, items) {
  return codapInterface.sendRequest({
    action: 'update',
    resource: 'dataContext[' + dataSetName + '].item',
    values: items
  });
}

/**
 * Generate a set of random numbers and send them to CODAP.
 * This is the function invoked from a button press.
 *
 */
function generateNumbers (spreadsheet, student_names, max_student) {
  // verify we are in CODAP
  if(codapInterface.getConnectionState() !== 'active') {
    // we assume the connection should have been made by the time a button is
    // pressed.
    warnNotEmbeddedInCODAP();
    return;
  }

  // if a sample number has not yet been initialized, do so now.
  if (myState.sampleNumber === undefined || myState.sampleNumber === null) {
    myState.sampleNumber = 0;
  }

  var samples = [];
 // var howMany = getRequestedSampleCount();
  var sampleIndex = ++myState.sampleNumber;
  var ix,yx;

  // // if we do not have a valid sample count, complain
  // if (isNaN(howMany) || howMany <= 0) {
  //   warnUser("Please enter a positive integer.");
  //   return;
  // }

  // generate the samples and format as items.
  for(yx = 0; yx < student_names.length; yx += 1)
  {
    for (ix = 0; ix < max_student[yx] + 1; ix += 1) {
      samples.push({ Group_Number: sessionStorage.getItem('group_id'), student_name: student_names[yx], 
        A: spreadsheet[yx][ix][0], B: spreadsheet[yx][ix][1], C: spreadsheet[yx][ix][2], D: spreadsheet[yx][ix][3], E: spreadsheet[yx][ix][4], F: spreadsheet[yx][ix][5], G: spreadsheet[yx][ix][6], H: spreadsheet[yx][ix][7], I: spreadsheet[yx][ix][8], J: spreadsheet[yx][ix][9]});
    }
  }
    console.log(samples);
    codapInterface.sendRequest({action:'get',resource: 'dataContext[MathNet_Spreadsheet].collection[Spreadsheet].caseCount'}).then(function(result){
      console.log("Do we have a pre-existing context: " + result.success);
      console.log(result);
      if(result.values > 0){
        codapInterface.sendRequest({action:'delete',resource: 'dataContext[MathNet_Spreadsheet].collection[Spreadsheet].allCases'}).then(function(){
          sendItems(kDataSetName, samples);  
        });
      }else{
        sendItems(kDataSetName, samples);
      }
    });

    //sendItems(kDataSetName, samples);


  // open a case table if one is not already open
  guaranteeCaseTable();
}

//
// Here we set up our relationship with CODAP
//
// Initialize the codapInterface: we tell it our name, dimensions, version...
codapInterface.init({
  name: kDataSetName,
  title: kAppName,
  dimensions: {width: 300, height: 150},
  version: '0.1'
}).then(function (iResult) {
  // get interactive state so we can save the sample set index.
  myState = codapInterface.getInteractiveState();
  // Determine if CODAP already has the Data Context we need.
  return requestDataContext(kDataSetName);
}).then(function (iResult) {
  // if we did not find a data set, make one
  if (iResult && !iResult.suc) {
    // If not not found, create it.
    return requestCreateDataSet(kDataSetName, kDataSetTemplate);
  } else {
    // else we are fine as we are, so return a resolved promise.
    return Promise.resolve(iResult);
  }
}).catch(function (msg) {
  // handle errors
  console.log(msg);
});



