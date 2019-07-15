function DropDown(el) {
    this.dd = el;
    this.initEvents();
}
DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
            $(this).toggleClass('active');
            event.stopPropagation();
        });
    }
}

function setCookie(cookie_name, cookie_value, exhours=0) {
    var d = new Date();
    if(exhours == 0) {
        exhours = 1;
    } else {
        exhours = exhours * 24;
    }
    d.setTime(d.getTime() + (exhours*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cookie_name + "=" + cookie_value + ";" + expires + ";path=/";
}
function getCookie(cookie_name) {
    var name = cookie_name + "=";
    var cookie_list = document.cookie.split(';');
    for (var i = 0; i < cookie_list.length; i++) {
        var cookie = cookie_list[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}
function deleteCookie(cookie_name) {
    document.cookie = cookie_name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
}

$(function() {
    $("#id").focus();
//    if(getCookie != "") {
//        $("#loginModal input[name=domain_name]").val(getCookie("domain_name"));
//        $("#loginModal input[name=project_name]").val(getCookie("project_name"));
//        $("#loginModal input[name=user_name]").val(getCookie("user_name"));
//        $("#loginModal input[name=pass]").val(getCookie("pass"));
//        $("#loginModal input.login_checkbox01").attr("checked",(getCookie("save") == "checked"));
//    }

    $("#login_user_name").on("keyup", function(e) {
        if( e.keyCode==13 ){
            $("#btn_login").trigger("click");
        }
    });

    $("#login_password").on("keyup", function(e) {
        if( e.keyCode==13 ){
            $("#btn_login").trigger("click");
        }
    });

    $("#logoutBtn").on("click", function() {
        $("#revoke_token").trigger("click");
//        location.href = "/dashboard/domains";
    });

    $(".nav_user").on('click', function() {
        if($('.dropdown_div').css("display")=="none"){
            $('.dropdown_div').slideDown("fast");
        }
    });
    $(document).mouseup(function(e) {
        var container = $('.dropdown_div');
        if(!container.is(e.target) && container.has(e.target).length === 0) {
            container.slideUp("fast");
        }
    });

    $("#selectDomain").on("click", function() {
        location.href = "/dashboard/domains";
    });

});
function loginSubmit(reload) {
    var domain_key = $("#loginModal input[name=domain_key]").val();
    var domain_name = $("#loginModal input[name=domain_name]").val();
    var project_name = $("#loginModal input[name=project_name]").val();
    var user_name = $("#loginModal input[name=user_name]").val();
    var pass = $("#loginModal input[name=pass]").val();
    var auth_url = $("#loginModal input[name=auth_url]").val();
    var description = $("#domain_discription").text();
//    var save = $("#loginModal input.login_checkbox01").is(":checked");
//    if(save) {
//        setCookie("domain_name", domain_name, 365);
//        setCookie("project_name", project_name, 365);
//        setCookie("user_name", user_name, 365);
//        setCookie("pass", pass, 365);
//        setCookie("save", "checked", 365);
//    } else {
//        deleteCookie("domain_name");
//        deleteCookie("project_name");
//        deleteCookie("user_name");
//        deleteCookie("pass");
//        deleteCookie("save");
//    }
    if(user_name == "") {
       U.msg("사용자 이름을 입력하세요.");
    } else if(pass == "") {
        U.msg("비밀번호를 입력하세요.");
    } else {
        U.ajax({
            url : '/dashboard/login',
            data : {
                auth_url:auth_url,
                domain_key: domain_key,
                domain_name: domain_name,
                project_name: project_name,
                user_name: user_name,
                pass: pass,
                description: description
//                save:save,
            },
            success:function(result){
                $("#loginModal").modal("hide");
                if (reload) {
                    location.reload();
                }

//                if(result.success){
//                    if(result.public_network){
//                        getService(result);
//                    }
//                }
            }
            // end success
        });
    }
}