# MathNet 
## (Graphing in Groups with Geogebra)

This project is updated aproach to previous work done by Dr. Tobin White which used Geogebra ([https://www.geogebra.org](https://www.geogebra.org) ) and NetLogo to provide group controlled line graphing activities.  This implementation uses HTML, javascript and the Geogebra applet to create a web application for collaborative learning.  A Node.js server application acts as a communication hub for keeping clients updated.

## Setup

1. Make sure the Nodejs communication server is running. (Please see [https://bitbucket.org/simon_dvorak/server-nsf-physics-7-communication-project](https://bitbucket.org/simon_dvorak/server-nsf-physics-7-communication-project) for setup instructions.)
2. Change the host variable in the file js/host.js to the url for the Node js server.

## Usage

### admin.html
1. View admin.html to login or create and admin user
2. Login with an admin username to create classes and groups, design toolbars or contructions, and see class client views.

#### student.html 
1. View student.html to login as a student
2. Enter the class id (Available on the admin tab of admin.html) and student name 
3. The list of groups in the class will display.  Click a group to join.
4. The shared group Geogebra view will load.