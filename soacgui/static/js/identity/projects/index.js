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
        "selector":"#project_list",
        "clickEvent":function() {
            var project_id = $(this).parents("tr").data("id");
            var project_name = $(this).parents("tr").children("td.name").text().trim();

            if ($(this).hasClass("delete_project")) {
                $("#modalDelete .modal-body").text(project_name + "(" + project_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", project_id);
                $("#modalDelete").data("url", project_id + "/delete").modal();

            } else if ($(this).hasClass("edit_project")) {
                showEditModalAndTab(0, project_id);
            } else if ($(this).hasClass("set_active")) {
                U.msg("준비중입니다.");
            } else if ($(this).hasClass("modify_groups")) {
                showEditModalAndTab(2, project_id);
            } else if ($(this).hasClass("view_usage")) {
                U.msg("준비중입니다.");
            } else if ($(this).hasClass("edit_quotas")) {
                showEditModalAndTab(3, project_id);
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();
}
function showEditModalAndTab(idx, project_id) {
    showEditModal({
        title: "프로젝트 수정",
        tab: {selector: "#commonModal"},
        data: {project_id:project_id},
        success: function(result) {
            if (result && result.error) {
                if (result.error.code == 401) {
                    $('#loginModal').modal('show');
                } else {
                    U.lobibox(result.error.message, "error", result.error.title);
                }
            }
            $(".tab-btn:eq(" + idx + ")").trigger("click");
            $("#submit_project").off("click");
            $("#submit_project").on("click", {project_id: project_id}, updateProject);
        }
    });
}

/* 프로젝트 생성/수정시 form 데이터 얻기 */
function getProjectInfo() {
    var project = $("#edit_project_frm").serializeObject();
    project.enabled = project.enabled == "on" ? true : false;
    project.domain_name = $("#input_domain_name").val();
    project.domain_id = $("#domain_id").val();
    return project;
}

function getQuotas() {
    var quota = {
        "nova": {},
        "neutron": {},
        "cinder": {}
    };
    var nova_quota = {};
    var neutron_quota = {};
    var cinder_quota = {};
    var metadata_items = $("input[name=metadata_items]").val();
    var vcpus = $("input[name=vcpus]").val();
    var instances = $("input[name=instances]").val();
    var injected_files = $("input[name=injected_files]").val();
    var injected_file_content = $("input[name=injected_file_content]").val();
    var ram = $("input[name=ram]").val();
    var security_groups = $("input[name=security_groups]").val();
    var security_group_rules = $("input[name=security_group_rules]").val();

    var floating_ips = $("input[name=floating_ips]").val();
    var networks = $("input[name=networks]").val();
    var ports = $("input[name=ports]").val();
    var routers = $("input[name=routers]").val();
    var subnets = $("input[name=subnets]").val();

    var volumes = $("input[name=volumes]").val();
    var volume_snapshots = $("input[name=volume_snapshots]").val();
    var total_size_of_volumes_and_snapshots = $("input[name=total_size_of_volumes_and_snapshots]").val();
    if ($("input[name=metadata_items]").parents("tr").data("val") != metadata_items) {nova_quota["metadata_items"] = metadata_items;}
    if ($("input[name=vcpus]").parents("tr").data("val") != vcpus) {nova_quota["cores"] = vcpus;}
    if ($("input[name=instances]").parents("tr").data("val") != instances) {nova_quota["instances"] = instances;}
    if ($("input[name=injected_files]").parents("tr").data("val") != injected_files) {nova_quota["injected_files"] = injected_files;}
    if ($("input[name=injected_file_content]").parents("tr").data("val") != injected_file_content) {nova_quota["injected_file_content_bytes"] = injected_file_content;}
    if ($("input[name=ram]").parents("tr").data("val") != ram) {nova_quota["ram"] = ram;}
    if ($("input[name=security_groups]").parents("tr").data("val") != security_groups) {nova_quota["security_groups"] = security_groups;}
    if ($("input[name=security_group_rules]").parents("tr").data("val") != security_group_rules) {nova_quota["security_group_rules"] = security_group_rules;}
    if (!isEmpty(nova_quota)) {quota["nova"]["quota_set"] = nova_quota;}

    if ($("input[name=floating_ips]").parents("tr").data("val") != floating_ips) {neutron_quota["floatingip"] = floating_ips;}
    if ($("input[name=networks]").parents("tr").data("val") != networks) {neutron_quota["network"] = networks;}
    if ($("input[name=ports]").parents("tr").data("val") != ports) {neutron_quota["port"] = ports;}
    if ($("input[name=routers]").parents("tr").data("val") != routers) {neutron_quota["router"] = routers;}
    if ($("input[name=subnets]").parents("tr").data("val") != subnets) {neutron_quota["subnet"] = subnets;}
    if (!isEmpty(neutron_quota)) {quota["neutron"]["quota"] = neutron_quota;}

    if ($("input[name=volumes]").parents("tr").data("val") != volumes) {cinder_quota["volumes"] = volumes;}
    if ($("input[name=volume_snapshots]").parents("tr").data("val") != volume_snapshots) {cinder_quota["snapshots"] = volume_snapshots;}
    if ($("input[name=total_size_of_volumes_and_snapshots]").parents("tr").data("val") != total_size_of_volumes_and_snapshots) {cinder_quota["gigabytes"] = total_size_of_volumes_and_snapshots;}
    if ($("input[name=total_size_of_volumes_and_snapshots]").parents("tr").data("val") != total_size_of_volumes_and_snapshots) {cinder_quota["backup_gigabytes"] = total_size_of_volumes_and_snapshots;}
    if (!isEmpty(cinder_quota)) {quota["cinder"]["quota_set"] = cinder_quota;}

    return quota;
}

function createProject() {
    U.ajax({
        progress : true,
        url : 'create',
        data : {
            project: JSON.stringify(getProjectInfo()),
            assignList: JSON.stringify(getAssignList())
        },
        success:function(result){
            location.reload(true);
        }
    });
}

function updateProject(event) {
    U.ajax({
        progress : true,
        url : event.data.project_id + '/update',
        data : {
            project: JSON.stringify(getProjectInfo()),
            assignList: JSON.stringify(getAssignList()),
            unassignList: JSON.stringify(getUnassignList()),
            quotas: JSON.stringify(getQuotas())
        },
        success:function(result) {
            location.reload(true);
        }
    });
}

function showEditModal(opt) {
    opt.url = "modal";
    PopupUtil(opt);
//    $("#domain_id").val($(".domain_list_d05.click").attr("id"));
//    $("#input_domain_name").val($(".domain_list_d05.click").text());

}

function initProjectEvent() {
    $("#create_project").on("click", function() {
        showEditModal({
            title: "프로젝트 생성",
            tab: {selector: "#commonModal"},
            success: function(result) {
                $("#submit_project").off("click");
                $("#submit_project").on("click", createProject);
            }
        });
    });
    $(".btnUpdate").on("click", function() {
        var project_id = $(this).parents("tr").data("id");
        console.log(project_id);
        showEditModalAndTab(1, project_id);
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