var modalUtil = new ModalUtil();
function showDataList(projects){
//    var dataTable = new DataTable({
//        "selector" : "#project_list",
//        "columns" : {
//            "name" : "이름:link",
//            "description" : "설명",
//            "id" : "프로젝트 ID",
//            "domain_id" : "도메인 이름",
//            "enabled" : "활성화됨",
//        },
//        "data" : projects,
//    });
//    dataTable.showDataTable();
//    dataTable.setLinkIdentity("projects");
}
function getDataAjax(){
//    U.ajax({
//        url : '',
//        success:function(data){
//            var projects = data.success.projects;
//            showDataList(projects);
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
        "selector":"#group_list",
        "clickEvent":function() {
            var group_id = $(this).parents("tr").data("id");
            var group_name = $(this).parents("tr").children("td.name").text().trim();

            if ($(this).hasClass("delete_group")) {
                $("#modalDelete .modal-body").text(group_name + "(" + group_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", group_id);
                $("#modalDelete").data("url", group_id + "/delete").modal();

            } else if ($(this).hasClass("edit_group")) {
                showEditModal({
                    title: "그룹 편집",
                    data: {group_id:group_id},
                    success: function(result) {
                        $("#submit_group").off("click");
                        $("#submit_group").on("click", {group_id: group_id}, updateGroup);
                    }
                });
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();
}

function createGroup() {
    data = $("#edit_group_frm").serializeObject();
    data.enabled = data.enabled == "on" ? true : false;
    U.ajax({
        progress : true,
        url : 'create',
        data : {"group":JSON.stringify(data)},
        success:function(result){
            location.reload(true);
        }
    });
}

function updateGroup(event) {
    data = $("#edit_group_frm").serializeObject();
    U.ajax({
        progress : true,
        url : event.data.group_id + '/update',
        data : {"group":JSON.stringify(data)},
        success:function(result){
            location.reload(true);
        }
    });
}

function showEditModal(opt) {
    opt.url = "modal";
    opt.tab = true;
    PopupUtil(opt);
//    $("#domain_id").val($(".domain_list_d05.click").attr("id"));
//    $("#input_domain_name").val($(".domain_list_d05.click").text());
}

function initProjectEvent() {
    $("#create_group").on("click", function() {
        showEditModal({
            title: "그룹 생성",
            success: function(result) {
                $("#submit_project").off("click");
                $("#submit_project").on("click", createGroup);
            }
        });
    });
    $(".btnUpdate").on("click", function() {
        var group_id = $(this).parents("tr").data("id");
        showEditModal({
            title: "멤버 수정",
            data: {group_id:group_id},
            success: function(result) {
//                $("#submit_project").off("click");
//                $("#submit_project").on("click", {group_id: group_id}, updateGroup);
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