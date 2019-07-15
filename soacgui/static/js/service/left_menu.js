var offset_top = $("#item_left_menu").offset().top;
var position_top = $("#item_left_menu").position().top;
/*$(window).scroll(function() { //left scroll
    var scrollPos = $(document).scrollTop();
//    console.log(scrollPos);
    if($(this).scrollTop() >= offset_top) {
        $("#item_left_menu").css("top", $(this).scrollTop() - position_top);
    }
});*/

$(function(){
//    $(".left_menu").css({position:"absolute",left:"-117px"});

    var re = new RegExp("/dashboard/service/(\\w+)/");
    var re1 = new RegExp("/dashboard/service/[\\w-]+/(\\w+)");
    var urlStr = $(location).attr('pathname');
    var new_service_url = urlStr.replace(re, "$1").replace("/","");
    var modify_service_url = urlStr.replace(re1, "$1").replace("/","");
//    주소가 new_service, modify 이면 왼쪽매뉴 보여줌
    if ((new_service_url == "new_service" || modify_service_url == "modify") && modify_service_url != "chain") {
        $("#item_left_menu").show();
        $("#saveBtn").show();
        $("#cancelBtn").show();
    }
    var topology_left_menu_handle = $("#resource_tab");
    var security_left_menu_handle = $("#security_tab");
    var sub_left_menu = $("#item_left_menu");
    $("#left_close").on("click", function() {
        var leftMenu = sub_left_menu.offset();
        var moveLeft = 125;
        if (security_resources.length > 8 && security_left_menu_handle.hasClass("click")) {
            moveLeft = 250
        }
        topology_left_menu_handle.removeClass("click");
        security_left_menu_handle.removeClass("click");
        sub_left_menu.animate({left: - moveLeft});
        setTimeout(function() {
            sub_left_menu.addClass("closed");
        }, 300);
    });
    topology_left_menu_handle.click(function(){
        if (security_resources.length > 8) {
            if (!sub_left_menu.hasClass("closed")) {
                topology_left_menu_handle.offset({"left":335});
                security_left_menu_handle.offset({"left":335});
            } else {
                if ($("#item_left_menu").width() == 248) {
                    topology_left_menu_handle.offset({"left":85});
                    security_left_menu_handle.offset({"left":85});
                }
            }
            sub_left_menu.css("width", "125px");
        }
        $("#resource_item").show();
        $("#security_item").hide();
        topology_left_menu_handle.addClass("click");
        security_left_menu_handle.removeClass("click");
        var leftMenu = sub_left_menu.offset();
        if (sub_left_menu.hasClass("closed")) {
            sub_left_menu.animate({left: 0});
            setTimeout(function() {
                sub_left_menu.removeClass("closed");
            }, 300);
        }
    });
    security_left_menu_handle.click(function(){
        if (security_resources.length > 8) {
            if (!sub_left_menu.hasClass("closed")) {
                topology_left_menu_handle.offset({"left":335 + 125});
                security_left_menu_handle.offset({"left":335 + 125});
            } else {
                if ($("#item_left_menu").width() == 123) {
                    topology_left_menu_handle.offset({"left":335});
                    security_left_menu_handle.offset({"left":335});
                }
            }
            sub_left_menu.css("width", "250px");
        }
        $("#resource_item").hide();
        $("#security_item").show();
        topology_left_menu_handle.removeClass("click");
        security_left_menu_handle.addClass("click");
        var leftMenu = sub_left_menu.offset();
        if (sub_left_menu.hasClass("closed")) {
            sub_left_menu.animate({left: 0});
            setTimeout(function() {
                sub_left_menu.removeClass("closed");
            }, 300);
        }
    });
});