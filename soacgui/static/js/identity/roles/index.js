function showDataList(roles){
//    var dataTable = new DataTable({
//        "selector" : "#role_list",
//        "columns" : {
//            "name" : "역할 이름",
//            "id" : "역할 ID",
//        },
//        "data" : roles,
//    });
//    dataTable.showDataTable();
//    dataTable.setLinkIdentity("roles");
}
function getDataAjax(){
//    U.ajax({
//        url : '',
//        success:function(data){
//            var roles = data.success.roleList;
//            showDataList(roles);
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
        "selector":"#role_list",
        "clickEvent":function() {
            var role_id = $(this).parents("tr").data("id");
            var role_name = $(this).parents("tr").children("td.name").text().trim();

            if ($(this).hasClass("delete_role")) {
                $("#modalDelete .modal-body").text(role_name + "(" + role_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", role_id);
                $("#modalDelete").data("url", role_id + "/delete").modal();
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();
}

function createRole() {
    data = $("#edit_role_frm").serializeObject();
    U.ajax({
        progress : true,
        url : 'create',
        data : {"role":JSON.stringify(data)},
        success:function(result){
            location.reload(true);
        }
    });
}

function updateRole(event) {
    data = $("#edit_role_frm").serializeObject();
    U.ajax({
        progress : true,
        url : event.data.role_id + '/update',
        data : {"role":JSON.stringify(data)},
        success:function(result){
            location.reload(true);
        }
    });
}

function showEditModal(opt) {
    opt.url = "modal";
    PopupUtil(opt);
}

function initProjectEvent() {
    $("#create_role").on("click", function() {
        showEditModal({
            title: "역할 생성",
            success: function(result) {
                $("#submit_role").off("click");
                $("#submit_role").on("click", createRole);
            }
        });
    });
    $(".btnUpdate").on("click", function() {
        var role_id = $(this).parents("tr").data("id");
        var role_name = $(this).parents("tr").children("td.name").text().trim();
        showEditModal({
            title: "역할 수정",
            data: {role_id:role_id},
            success: function(result) {
                $("#submit_role").off("click");
                $("#submit_role").on("click", {role_id: role_id}, updateRole);
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