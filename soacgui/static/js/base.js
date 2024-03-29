var re = new RegExp("/dashboard/(\\w+)/.*");
var urlStr = $(location).attr('pathname');
var selMenu = urlStr.replace(re, "$1");
var menuList = ["service", "security", "identity", "admin", "monitoring",];
var menu = {
    "service":"left_menu_d03",
    "security":"left_menu_d09",
    "identity":"left_menu_d05",
    "admin":"left_menu_d06",
    "monitoring":"left_menu_d11",
};
var domainObj = {};
if (selMenu == "telemeter" || selMenu == "service_chaining") selMenu = "service";
menuList.splice(menuList.indexOf(selMenu), 1);

$(function(){
    $("#revoke_token").on("click", function() {
        U.ajax({
            url: "/revoke_token",
            data: {},
            success: function(result) {
                console.log(result);
                location.href = "/dashboard/domains";
            }
        });
    });
    $(document).on("click", ".lobibox-notify", function() {
        var notifyLength = Lobibox.notify.list.length;
        while (notifyLength != 0) {
            Lobibox.notify.list[--notifyLength].remove();
        }
    });
    initLeftMenu();
//    getDomainList();
//    getProjectList();
    $(window).resize(function() {
        $(".header").offset({"top":$(".left_menu_d01").offset().top});
    });
    $(".homeLogo").on("click", function() {
        location.href = "/dashboard/service";
    });
    $(".head_img01").on("click", function() {
        location.href = "/dashboard/service";
    });
    $(".head_sel01").on("click", function() {
        if ($(".domain_list_d01").is(':visible'))
            $(".domain_list_d01").slideUp("fast");
        else
            $(".domain_list_d01").slideDown("fast");
    });
    $(document).on("click", ".domain_list_d05", function() {
        // ===== 도메인 선택시 체크 바꾸기 =====
//        var checkImgHtml = '<img class="domain_list_img01" src="/static/img/common/domain_list_check_01.png" alt="#">';
//        var targetParent = $(this).parent();
//        $(".domain_list_d04 .domain_list_img01").remove();
//        $(".domain_list_d04").addClass("domain_list_d06");
//        $(".domain_list_d04").removeClass("domain_list_d04");
//        targetParent.removeClass("domain_list_d06");
//        targetParent.addClass("domain_list_d04");
//        $(".domain_list_d05").removeClass("click");
//        $(this).addClass("click");
//        targetParent.prepend(checkImgHtml);
        // ===== 도메인 선택시 프로젝트 바꾸기 =====

        getProjectListByDomainId($(this).data());
    });

    $(document).on("click", ".project_list_d05", function() {
        // ===== 프로젝트 선택시 체크 바꾸기 =====
        var checkImgHtml = '<img class="project_list_img01" src="/static/img/common/domain_list_check_01.png" alt="#">';
        var targetParent = $(this).parent();
        $(".project_list_d04 .project_list_img01").remove();
        $(".project_list_d04").addClass("project_list_d06");
        $(".project_list_d04").removeClass("project_list_d04");
        targetParent.removeClass("project_list_d06");
        targetParent.addClass("project_list_d04");
        $(".project_list_d05").removeClass("click");
        $(this).addClass("click");
        targetParent.prepend(checkImgHtml);
        // ===== 프로젝트 선택시 세션 정보 바꾸기 =====
//        var domain_name = $(".domain_list_d05.click").text();
        var project_name = $(this).text();
        var project_id = $(this).data("id");
//        var data = {"project_name":project_name};
        var data = {"project_id":project_id, "project_name":project_name};
        U.ajax({
            url : "/auth/switch/project",
            data : {"data":JSON.stringify(data)},
            success:function(jsonData) {
                if (typeof jsonData.success == "undefined"){
                    location.href = "/login";
                    return;
                }
//                location.href = urlStr;
                location.href = "/dashboard/service";
            }
        });

    });
    $(document).on("mousedown", function(e) {
        $('.domain_list_d01').each(function() {
            if ($(this).is(":visible")) {
                var targetPosition = $(this).offset();
                targetPosition.right = targetPosition.left + $(this).width();
                targetPosition.bottom = targetPosition.top + $(this).height();

                if (( targetPosition.left <= e.pageX && e.pageX <= targetPosition.right ) && ( targetPosition.top <= e.pageY && e.pageY <= targetPosition.bottom )) {
                    //alert( 'popup in click' );
                } else {
                    $(this).slideUp("fast");
                }
            }
        });
        $('.language-list-01').each(function() {
            if ($(this).is(":visible")) {
                var targetPosition = $(this).offset();
                targetPosition.right = targetPosition.left + $(this).width();
                targetPosition.bottom = targetPosition.top + $(this).height();

                if (( targetPosition.left <= e.pageX && e.pageX <= targetPosition.right ) && ( targetPosition.top <= e.pageY && e.pageY <= targetPosition.bottom )) {
                    //alert( 'popup in click' );
                } else {
                    $(this).slideUp("fast");
                }
            }
        });
    });
    // 언어변경
    $(".head_sel02").on("click", function() {
        if ($(".language-list-01").is(':visible'))
            $(".language-list-01").slideUp("fast");
        else
            $(".language-list-01").slideDown("fast");
    });
    $(document).on("click", ".language-list-05", function() {
        var data = $(this).data()
        // 언어 클릭시 언어 변경
//        if ($("#switch_language .click").data("language_code") === data.language_code) {
//            U.lobiboxMessage("현재 적용되있는 언어입니다.", "info");
//        } else {
            U.ajax({
                url: "/language/" + data.language_code,
                success: function(result) {
                    if (result.success) {
                        U.lobiboxMessage(result.success.message, "info", result.success.title);
                        location.reload();
                    } else {
                        U.lobiboxMessage(result.error.message, "info", result.error.title);
                    }
                }
            });
//        }
    });


//    var dd = new DropDown( $('#dd') );
//    $(document).click(function() {
//        $('.wrapper-dropdown-5').removeClass('active');
//    });
    var dd = new DropDown( $('#dd') );
    $(document).click(function() {
        // all dropdowns
        $('.wrapper-dropdown-3').removeClass('active');
    });
    $(".active").click(function() {
        $(".wrapper-dropdown-3").removeClass("active");
    });
    // actiongroup 스크롤이벤트
    $(".contents_d01").on("scroll", function() {
        var target = $(".actionGroup");
        target.each(function(i, value) {
            $(value).offset({"top":$(value).parent().offset().top + $(value).parent().height()});
        });
    });
});

function initLeftMenu() {
    // 왼쪽메뉴 선택 표시
    $("." + selMenu + "_sub").show();//.slideDown("fast");
    $("." + selMenu).addClass(menu[selMenu] + "_click");
    $("." + selMenu).removeClass(menu[selMenu]);
    $(".menu").on("click", menuDropDown);

    var selSubMenu = ""
    if (selMenu == "service" || selMenu == "service_chaining"){
        var match = new RegExp("/dashboard/(\\w+)").exec(urlStr);
        var match1 = new RegExp("/dashboard/service/[\\w-]+/(\\w+)").exec(urlStr);
        var match2 = new RegExp("/dashboard/service/(\\w+)").exec(urlStr);
        var match3 = new RegExp("/dashboard/telemeter/[\\w-]+/(\\w+)").exec(urlStr);
        if (match) {
            if (match[1] == "service") {
                selSubMenu = "topology";
//                if (match1) {
//                    if (match1[1] == "chaining") selSubMenu = "chaining";
//                }
                if (match2) {
                    if (match2[1] == "new_service") {
                        $('#service_name').text(gettext("서비스 생성"));
                        $(".service_title").hide();
                        selSubMenu = "service_create";
                    } else if (match2[1] == "all_service") {
                        selSubMenu = "all_service";
                    } else if (match2[1] == "intent") {
                        $('#service_name').text(gettext("Intent 기반 서비스 생성"));
                        $(".service_title").hide();
                        selSubMenu = "intent_service_create";
                    }
                } else {
                    $('#path_name').text(gettext("서비스 조회"));
                }
            } else if (match[1] == "service_chaining") {
                selSubMenu = "topology";
                $('#path_name').text(gettext("서비스 체이닝"));
            } else if (match[1] == "telemeter") {
                selSubMenu = "topology";
                $('.all_service_bt01').hide();
                $('#path_name').text(gettext("서비스 모니터링"));
            }
        } else if (match2) {
            if (match2[1] == "new_service") selSubMenu = "topology";
        } else if (match3) {
            if (match3[1] == "detail") selSubMenu = "telemeter";
        } else {
            selSubMenu = "projects";
        }
    } else if (selMenu == "identity") {
        var match = new RegExp("/dashboard/identity/(\\w+)/.*").exec(urlStr);
        if (match) {
            selSubMenu = match[1];
        } else {
            selSubMenu = "projects";
        }
    } else if (selMenu == "admin") {
        var match = new RegExp("/dashboard/admin/(\\w+)/.*").exec(urlStr);
        if (match) {
            selSubMenu = match[1];
        } else {
            selSubMenu = "usages";
        }
    } else if (selMenu == "security") {
        var match = new RegExp("/dashboard/security/(\\w+)").exec(urlStr);
        if (match && match[1] == "create") {
            selSubMenu = "security_create";
        } else {
            selSubMenu = "security_list";
        }
    } else if (selMenu == "monitoring") {
        var match = new RegExp("/dashboard/monitoring/(\\w+)").exec(urlStr);
        if (match && match[1] == "action") {
            selSubMenu = "action_list";
        } else if (match && match[1] == "history") {
            selSubMenu = "history_list";
        } else {
            selSubMenu = "monitoring_list";
        }
    }
    $("." + selSubMenu).addClass("click");
}

function menuDropDown(e) {
    // 왼쪽메뉴 펼치기/접기
    var targetClass = $(e.target).attr("class").split(" ");
    var targetParentClass = $(e.target).parent().attr("class").split(" ");
//    $("." + selMenu).addClass(menu[selMenu] + "_click");
//    $("." + selMenu).removeClass(menu[selMenu]);
    $.each(menuList, function(idx, val) {
        var dropTarget = $("." + val + "_sub");
        if (targetClass.indexOf(val) != -1 || targetParentClass.indexOf(val) != -1) {
            if (dropTarget.is(':visible')) dropTarget.slideUp("fast");
            else dropTarget.slideDown("fast");
        } else {
            dropTarget.slideUp("fast");
        }
    });
}

function getDomainList() {
    // 도메인 리스트 가져오기
    U.ajax({
		url : "/auth/domains",
        success:function(jsonData) {
            if (typeof jsonData.success == "undefined"){
                location.href = "/login";
                return;
            }
            var domains = jsonData.success.domains;
            var domainHtml = '<div class="domain_list_d03">도메인 :</div>';
            $.each(domains, function(idx, domain) {
                domainObj[domain.id] = domain;
                if (domain.click) {
                    domainHtml += '<div class="domain_list_d04">';
                    domainHtml += '<img class="domain_list_img01" src="/static/img/common/domain_list_check_01.png" alt="#">';
                    domainHtml += '<div class="domain_list_d05 click" id="' + domain.id + '">' + domain.name + '</div>';
                } else {
                    domainHtml += '<div class="domain_list_d06">';
                    domainHtml += '<div class="domain_list_d05" id="' + domain.id + '">' + domain.name + '</div>';
                }
                domainHtml += '<div class="clear_float"></div>';
                domainHtml += '</div>';
            });
            $(".domain_list_d02").html(domainHtml);
        }
    });
}

function getProjectList() {
    var data = {enabled:true};
    U.ajax({
        url : "/auth/projects",
        data : {"data":JSON.stringify(data)},
        success:function(jsonData) {
            /*if (typeof jsonData.success == "undefined"){
                location.href = "/dashboard/login";
                return;
            }*/
            var projects = jsonData.success.projects;
//            domainObj[domain_id]["projects"] = projects;
//            setProjectList(projects);
        }
    });
}

function getProjectListByDomainId(data) {
    // 도메인 클릭시 도메인 변경
    if ($("#switch_domain .click").data("domain_name") === data.domain_name) {
        U.lobiboxMessage(gettext("현재 접속중인 도메인입니다."), "info");
    } else {
//        $("#domain_ip").text(data.auth_url.replace(/https?:\/\/([\d]+\.[\d]+\.[\d]+\.[\d]+)(:[\d]+\/v3)?/gi, "$1"));
        $("#domain_name").text(data.domain_name);
        $("#domain_description").text(data.description);
        $("#login_domain_key").val(data.domain_key);
        $("#login_auth_url").val(data.auth_url);
        $("#login_domain_name").val(data.domain_name);
        $("#login_project_name").val("");
        $("#btn_login").attr("onclick", "loginSubmit(true)");
        $('#loginModal').modal('show');
    }
}

function setProjectList(projects) {
    // 프로젝트 리스트 셋팅
    var projectHtml = '<div class="project_list_d03">' + gettext('프로젝트') + ' :</div>';
    $.each(projects, function(idx, project) {
        if (project.click) {
            projectHtml += '<div class="project_list_d04">';
            projectHtml += '<img class="project_list_img01" src="/static/img/common/domain_list_check_01.png" alt="#">';
            projectHtml += '<div class="project_list_d05 click" id="' + project.id + '">' + project.name + '</div>';
        } else {
            projectHtml += '<div class="project_list_d06">';
            projectHtml += '<div class="project_list_d05" id="' + project.id + '">' + project.name + '</div>';
        }
        projectHtml += '<div class="clear_float"></div>';
        projectHtml += '</div>';
    });
    $(".project_list_d07").html(projectHtml);
}

function replaceAllDateTimeFormatFromTD(selector) {
    if (isEmpty(selector)) {
        selector = ".date_type";
    }
    var allTD = $(selector);
    $.each(allTD, function(idx, td) {
        $(td).text($(td).text().replace(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})[.]?\d*/gi, "$1 $2"));
    });
}


function DropDown(el) {
    this.dd = el;
    this.placeholder = this.dd.children('span');
    this.opts = this.dd.find('ul.dropdown>li');
    this.val = '';
    this.index = -1;
    this.initEvents();
}
DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
            $(this).addClass('active');
            return false;
        });

        obj.opts.on('click',function(){
            var opt = $(this);
            obj.val = opt.text();
            obj.index = opt.index();
            obj.placeholder.text(obj.val);
        });
    },
    getValue : function() {
        return this.val;
    },
    getIndex : function() {
        return this.index;
    }
}