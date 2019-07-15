function showDataList(users) {
//    var dataTable = new DataTable({
//        "selector" : "#user_list",
//        "columns" : {
//            "name" : "이름: link",
//            "description" : "설명",
//            "email" : "Email",
//            "id" : "사용자 ID",
//            "enabled" : "활성화됨",
//            "domain_id" : "도메인 이름",
//        },
//        "data" : users,
//    });
//    dataTable.showDataTable();
//    dataTable.setLinkIdentity("users");
}
function getDataAjax() {
//    U.ajax({
//        url : '',
//        success: function(data) {
//            var users = data.success.userList;
//            showDataList(users);
//        }
//    });
}
$(function() {
//    getDataAjax();
    initProjectEvent();
    actionEvent();

});

function actionEvent() {
    var actionGroup = new ActionGroup({
        "selector": "#user_list",
        "clickEvent": function() {
            var user_id = $(this).parents("tr").data("id");
            var user_name = $(this).parents("tr").children("td.name").text().trim();

            if ($(this).hasClass("delete_user")) {
                $("#modalDelete .modal-body").text(user_name + "(" + user_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", user_id);
                $("#modalDelete").data("url", user_id + "/delete").modal();

            } else if ($(this).hasClass("edit_password")) {
                showEditModal({
                    title: "비밀번호 변경",
                    data: {pass_flag: true, user_id: user_id},
                    success: function(result) {
                        $("#submit_user").off("click");
                        $("#submit_user").on("click", {user_id: user_id}, changePassword);
                    }
                });
            } else if ($(this).hasClass("set_active")) {
                U.msg("준비중입니다.");
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();
}
function changePassword(event) {
    var data = $("#edit_user_frm").serializeObject();
    if (data.password === data.password_confirm) {
        delete data["password_confirm"]
        U.ajax({
            progress : true,
            url : event.data.user_id + '/update',
            data : {"user": JSON.stringify(data)},
            success: function(result) {
                location.reload(true);
            }
        });
    } else {
        U.lobiboxMessage("비밀번호가 일치해야 합니다.", "warning");
    }
}

function createUser() {
    var data = $("#edit_user_frm").serializeObject();
    if (data.password === data.password_confirm) {
        delete data["password_confirm"]
        data.enabled = data.enabled == "on";
        data.domain_name = $("#input_domain_name").val();
        data.domain_id = $("input[name=domain_id]").val();
        U.ajax({
            progress : true,
            url : 'create',
            data : {"user": JSON.stringify(data)},
            success: function(result) {
                location.reload(true);
            }
        });
    } else {
        U.lobiboxMessage("비밀번호가 일치해야 합니다.", "warning");
    }
}

//function editUser() {
//    data = $("#edit_user_frm").serializeObject();
//        data.enabled = data.enabled == "on";
//        data.domain_name = $("#input_domain_name").val();
//        data.domain_id = $("#domain_id").val();
//        U.ajax({
//            progress : true,
//            url : 'create',
//            data : {"user": JSON.stringify(data)},
//            success: function(result){
//                location.reload(true);
//            }
//        });
//}

function updateUser(event) {
    var data = $("#edit_user_frm").serializeObject();
    if (data.password === data.password_confirm) {
        U.ajax({
            progress : true,
            url : event.data.user_id + '/update',
            data : {"user": JSON.stringify(data)},
            success: function(result) {
                location.reload(true);
            }
        });
    } else {
        U.lobiboxMessage("비밀번호가 일치해야 합니다.", "warning");
    }
}

function showEditModal(opt) {
    opt.url = "modal";
    PopupUtil(opt);
//    $("#domain_id").val($(".domain_list_d05.click").attr("id"));
//    $("#input_domain_name").val($(".domain_list_d05.click").text());
}

function initProjectEvent() {
    $("#create_user").on("click", function() {
        showEditModal({
            title: "사용자 생성",
            success: function(result) {
                $("#submit_user").off("click");
                $("#submit_user").on("click", createUser);
            }
        });
    });
    $(".btnUpdate").on("click", function() {
        var user_id = $(this).parents("tr").data("id");
        var user_name = $(this).parents("tr").children("td.name").text().trim();
        showEditModal({
            title: "사용자 수정",
            data: {user_id: user_id},
            success: function(result) {
                $("#submit_user").off("click");
                $("#submit_user").on("click", {user_id: user_id}, updateUser);
            }
        });
    });
    $("#deleteSubmit").on("click", function() {
        var id = $("#modalDelete").data("id");
        var url = $("#modalDelete").data("url");
        U.ajax({
            url: url,
            success: function(jsonData) {
                if (jsonData.error) {
                    U.lobibox(jsonData.error.message, "error", "삭제 실패: " + jsonData.error.title);
                }
                if (jsonData.success) {
                    U.lobiboxMessage(id, "info", "삭제 성공");
                    $("tr[data-id=" + id + "]").remove();
                }
                $("#modalDelete").modal("hide");
            }
        });
     });
}