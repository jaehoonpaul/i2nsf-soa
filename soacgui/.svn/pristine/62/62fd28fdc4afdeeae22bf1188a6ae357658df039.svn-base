$(function() {
    var tabList = ["tabInfo", "tabPerm"];

    $(".tabInfo").on("click", function(){tabClick(0, tabList)});
    $(".tabPerm").on("click", function(){tabClick(1, tabList)});
    actionGroupEvent();
});

function actionGroupEvent() {
    var actionGroup = new ActionGroup({
        "selector":"#flavors",
        "clickEvent":function() {
            var flavor_id = $(this).parents("tr").data("id");
            if ($(this).hasClass("btnDelete")) {
                var flavor_name = $(this).parents("tr").children("td.name").text();
                $("#modalDelete .modal-body").text(flavor_name + "(" + flavor_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", flavor_id);
                $("#modalDelete").data("url", flavor_id + "/delete").modal();
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();
}

function showEditModal(opt) {
    opt.url = "modal";
    PopupUtil(opt);
}

// create / update
var removeProject = [];
var addProject = [];

$(function() {
    $("#btnCreate").on("click", function() {
        showEditModal({
            title: "Flavor 생성",
            tab: {selector: "#commonModal"},
            success: function(result) {
                setAllocatedAvailableTable({name:"project"});
                $("#edit_submit").off("click");
                $("#edit_submit").on("click", createFlavor);
            }
        });
    });
    $(".btnUpdate").on("click", function() {
        U.lobibox("Flavor 수정은 불가능합니다. Openstack에 있는 flavor 수정 기능은 삭제 후 생성합니다. 이때 아이디가 달라지게 되어 가상서버와 관계가 끊기게 됩니다.", "warning", "수정")
        return 0;
        var id = $(this).parents("tr").data("id");
        showEditModal({
            title: "Flavor 편집",
            tab: {selector: "#commonModal"},
            data: {"flavor_id": id},
            success: function(result) {
                removeProject = [];
                addProject = [];
                setAllocatedAvailableTable({name:"project"});
                var tbodyAllocated = $("#project_allocated tbody");
                var tbodyAvailable = $("#project_available tbody");
                tbodyAvailable.on("click", ".btnAdd", function() {
                    var project_id = $(this).parents("tr").data("id");
                    var idx = removeProject.indexOf(project_id);
                    if (idx == -1) {
                        addProject.push(project_id);
                    } else {
                        removeProject.splice(idx, 1);
                    }
                });
                tbodyAllocated.on("click", ".btnRemove", function() {
                    var project_id = $(this).parents("tr").data("id");
                    var idx = addProject.indexOf(project_id);
                    if (idx == -1) {
                        removeProject.push(project_id);
                    } else {
                        addProject.splice(idx, 1);
                    }
                });
                $("#edit_submit").off("click");
                $("#edit_submit").on("click", {"flavor_id": id}, updateFlavor);
            }
        });
    });
    function openEditModal(complete) {
        $("#project_allocated tbody").empty();
        // ajax 호출 후
        U.ajax({
            url:"/dashboard/identity/",
            data:{"data":JSON.stringify(null)},
            success:function(jsonData) {
                if (typeof jsonData.success != "undefined") {
                    var list = jsonData.success.projects;
                    var tbody = $("#project_available tbody").empty();
                    for (var i=0, proj; proj = list[i]; i++) {
                        tbody.append(
                            $("<tr data-id='"+proj.id+"' data-filter='"+proj.name+"'>")
                            .append($("<td>").text(proj.name))
                            .append($("<td>").append("<button class='btnAdd'>+</button>"))
                        );
                    }
                    if (complete) complete();
                    $("#modalEdit").modal();
                }
            }
        });
    }
    $("#inputSource").on("change", function() {
        if ($(this).val() == "") {
            $("#areaSourceImage").hide();
        } else {
            $("#areaSourceImage").show();
        }
    });
    $("#areaSourceImage").hide();
    $("#btnEditSave").on("click", function() {
        var data = {};
        data.name  = $("#inputName" ).val();
        if ($("#inputId").val() != "") {
            data.id    = $("#inputId"   ).val();
        }
        data.ram   = $("#inputRam"  ).val();
        data.disk  = $("#inputRoot" ).val();
        data.vcpus = $("#inputVcpus").val();
        if ($("#inputEphem").val() != "") {
            data["OS-FLV-EXT-DATA:ephemeral"] = $("#inputEphem").val();
        }
        if ($("#inputSwap" ).val() != "") {
            data.swap  = $("#inputSwap" ).val();
        }
        if ($("#inputRxTx" ).val()) {
            data.rxtx_factor  = $("#inputRxTx" ).val();
        }
        var ids = []; $("#project_allocated tbody tr").each(function() { ids.push($(this).data("id")); });
        if (ids.length != 0) {
            data["os-flavor-access:is_public"] = false;
        } else {
            data["os-flavor-access:is_public"] = true;
        }
        if (data.id && data.id.length) {
            alert(data + " 편집 넣기");
        }
//        $("#modalEdit").modal("hide");
    });
});

// delete
$(function() {
    $("table").on("click", ".btnDelete", function() {
        var id = $(this).parents("tr").data("id");
        var name = $(this).parents("tr").children("td:eq(0)").text();
        $("#modalDelete .modal-body").text(name + "(" + id + ")를 삭제하시겠습니까?");
        $("#modalDelete").data("id", id).data("name", name).data("url", id + "/delete").modal();
    });
    $("#deleteSubmit").on("click", function() {
        var id = $("#modalDelete").data("id");
        var name = $("#modalDelete").data("name");
        var url = $("#modalDelete").data("url");
        U.ajax({
            url: url,
            success:function(jsonData) {
                if (typeof jsonData.success != "undefined") {
                    U.lobiboxMessage('Flavor(' + name + ')가 삭제되었습니다.', 'info', '삭제');
                    location.reload();
                }
            }
        });
    });
});


function uuid() {
    function s4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function createFlavor() {
    var data = {flavor: $("#editFrm").serializeObject()};
    if (data.flavor.id === "auto") {
        data.flavor.id = uuid();
    }
    $("#project_allocated tbody tr").each(function(i, v) {
        if (i == 0) {
            data["flavor_access"] = [];
        }
        data["flavor_access"].push($(v).data("id"));
    });
    U.ajax({
        url: "create",
        data: {data: JSON.stringify(data)},
        success:function(result) {
            if (result.success) {
                U.lobiboxMessage('Flavor가 생성되었습니다.', 'info', '생성');
                location.reload();
            }
        }
    });
}

function updateFlavor(event) {
    var data = {flavor: $("#editFrm").serializeObject()};
    data["flavor_access"] = {
        add_project: addProject,
        remove_project: removeProject
    }
    U.ajax({
        url: event.data.flavor_id + "/update",
        data: {data: JSON.stringify(data)},
        success:function(result) {
            if (result.success) {
                U.lobiboxMessage('Flavor가 생성되었습니다.', 'info', '생성');
                location.reload();
            }
        }
    });
}