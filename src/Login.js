import $ from 'jquery'

class Login {
    constructor(controller){
        this.controller = controller; //TODO Student and Admin should be generalized with a common interface
        let query = window.location.search;

        this.controller.views.$class_view.hide();
        this.controller.views.$group_view.hide();

        // login through url and no error has occurred
        if (query.substring(0,1) === '?' && !sessionStorage.getItem("error") && !sessionStorage.getItem("group_id")) {
            sessionStorage.clear();
            query = unescape(query.substring(1));
            const data = query.split('&');

            let url_class_id, url_group_id, url_username;

            for (let i = 0; i < data.length; i++){
                data[i] = unescape(data[i]);
            }

            for (let i = 0; i < data.length; i++) {
                if (data[i].startsWith("class_id="))
                    url_class_id = data[i].substring(9);
                else if (data[i].startsWith("group_id="))
                    url_group_id = data[i].substring(9);
                else if (data[i].startsWith("username="))
                    url_username = data[i].substring(9).trim();
            }
            if (url_class_id && url_username) {
                this.controller.login(url_username, url_class_id);
                if (url_class_id) {
                    this.wait_for_login(url_group_id);
                }
            }else{
                this.controller.views.$login_view.show();
            }
        }
        else if (sessionStorage.getItem('class_id') && sessionStorage.getItem('username')){
            this.controller.login(sessionStorage.getItem('username'), sessionStorage.getItem('class_id'));
            if (sessionStorage.getItem('group_id')){
                this.controller.group_join(sessionStorage.getItem('username'), sessionStorage.getItem('class_id'),
                    sessionStorage.getItem('group_id'));
            }//emit group_join if there is an group_id
        }//emit login if there is a class_id
        else {
            this.controller.views.$login_view.show();
        }

        //
        //  Pinging
        //
        window.setInterval(() => {
            const d = new Date();
            this.controller.ping(d.getTime());
        }, 500);

        const{
            $class_id,
            $username,
            $error_header
        } = this.controller.views;
        this.controller.views.$login_button.bind('click', () => {

            if (this.valid_username($username.val().trim())) {
                this.controller.login($username.val().trim(), $class_id.val().trim());
                $username.val(""); $class_id.val(""); $error_header.hide();
            }
        });

        $error_header.html(sessionStorage.getItem('error'))
            .promise()
            .done(() => {
                sessionStorage.removeItem('error');
                sessionStorage.removeItem('class_id');
                sessionStorage.removeItem('group_id');
                sessionStorage.removeItem('username');
            });

        $('body').show();
    }

    valid_username(username) {
        const alphanum = /^[A-Za-z][A-Za-z0-9]*$/;
        if (username.match(alphanum) && username.length < 9) {
            if (username === "admin") {
                alert("Username 'admin' is restricted.");
                return false;
            }
            return true;
        }
        else {
            alert("Username must be alphanumeric and less than or equal to 8 characters.");
            return false;
        }
    }

    wait_for_login(group_id) {
        const maxAttempts = 10;
        let numAttempts = 0;
        const id = setInterval(() => {
                if (numAttempts < maxAttempts) {
                    if (sessionStorage.getItem("username")) {
                        this.controller.group_join(sessionStorage.getItem("username"), sessionStorage.getItem("class_id"),
                            group_id);
                        clearInterval(id);
                    }
                    else if (sessionStorage.getItem("error")) {
                        const error = sessionStorage.getItem("error");
                        if (error && error.indexOf("Username ") !== -1 && error.indexOf(" is already taken") !== -1) {
                            clearInterval(id);
                        }
                    }
                    else if (!this.controller.views.$login_view.is(":visible")) {
                        this.controller.views.$login_view.show();
                    }
                }
                else {
                    clearInterval(id);
                }
            }, 50);
    }
}

export default Login;