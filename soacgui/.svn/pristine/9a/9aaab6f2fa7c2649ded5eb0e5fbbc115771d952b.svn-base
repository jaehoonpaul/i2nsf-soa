var aggregates;
var availabilityZones;

function showAggregates() {
    var actionGroup = new ActionGroup({
        "selector":"#hosts_aggregates",
        "clickEvent":function() {
            var aggregate_id = $(this).parents("tr").data("id");
            if ($(this).hasClass("deleteHostAggregates")) {
                var aggregate_name = $(this).parents("tr").children("td.name").text();
                $("#modalDelete .modal-body").text(aggregate_name + "(" + aggregate_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", aggregate_id);
                $("#modalDelete").data("url", aggregate_id + "/delete").modal();
            } else if ($(this).hasClass("manageHost")) {
                var id = $(this).parents("tr").data("id");
                showEditModal({
                    title: "호스트 관리",
                    data: {id: id, action: "host_manage"},
                    tab: {selector: "#commonModal"},
                    success: function(result) {
                        setAllocatedAvailableTable({name: "host"});
                        existHostList = JSON.parse($("input[name=exist_hosts]").val().replace(/'/g, '"'));
                        $.each(existHostList, function(i, existHost) {
                            $("tr[data-name=" + existHost + "] .btnAdd").click();
                        });
                        $("#submit_aggregate").off("click");
                        $("#submit_aggregate").on("click", actionAggregate);
                    }
                });
            } else {
                U.lobiboxMessage("준비중입니다.", "warning");
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
var addHostList = [];
var removeHostList = [];
var existHostList = [];
// create / update
$(function() {
    $("#btnCreate").on("click", function() {
        showEditModal({
            title: "호스트 집합 생성",
            tab: {selector: "#commonModal"},
            success: function() {
                setAllocatedAvailableTable({name: "host"});
                $("#submit_aggregate").off("click");
                $("#submit_aggregate").on("click", createAggregate);
            }
        });
    });
    $("#hosts_aggregates").on("click", ".updateHostAggregates", function() {
        var id = $(this).parents("tr").data("id");
        showEditModal({
            title: "호스트 집합 편집",
            data: {id: id},
            tab: {selector: "#commonModal"},
            success: function(result) {
                $("#modalEdit .rs_d04").hide();
                $("#submit_aggregate").off("click");
                $("#submit_aggregate").on("click", updateAggregate);
            }
        });
    });
    $("#areaSourceImage").hide();
    $("#btnEditSave").on("click", function() {
        var data = {};
        data.id    = $("#inputId"   ).val();
        data.name  = $("#inputName" ).val();
        data.availability = $("#inputAvailability" ).val();
        var ids = []; $("#host_allocated tbody tr").each(function() { ids.push($(this).data("id")); });
        data.sources = ids;
        if (data.id && data.id.length) {
            alert(data + " 편집 넣기");
        } else {
            alert(data + " 저장 넣기");
        }
//        $("#modalEdit").modal("hide");
    });
    showAggregates();
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
                    location.reload();
                }
                $("#modalDelete").modal("hide");
            }
        });
     });
});

function createAggregate() {
    submitAggregate("create");
}

function updateAggregate() {
    submitAggregate("update");
}

function actionAggregate() {
    submitAggregate("action");
}

function submitAggregate(url) {
    var data = {
        aggregate: {
            name: $("input[name=name]").val(),
            availability_zone: $("input[name=availability]").val()
        }
    }
    if (url == "create") {
        addHostList = [];
        $("#host_allocated tbody tr").each(function(i, tr) {
            addHostList.push($(tr).children("td:eq(0)").text());
        });
    } else if (url == "update") {
        url = $("input[name=id]").val() + "/update";
    } else if (url == "action") {
        url = $("input[name=id]").val() + "/action";
        addHostList = [];
        tempAddHostList = [];
        removeHostList = [];
        $("#host_allocated tbody tr").each(function(j, tr) {
            var addHost = $(tr).children("td:eq(0)").text();
            if (existHostList.indexOf(addHost) == -1) {
                addHostList.push(addHost);
            }
            tempAddHostList.push(addHost);
        });
        $.each(existHostList, function(i, existHost) {
            if (tempAddHostList.indexOf(existHost) == -1) {
                removeHostList.push(existHost);
            }
        });
    }

    U.ajax({
        url: url,
        data: {data:JSON.stringify(data), add_hosts: JSON.stringify(addHostList), remove_hosts: JSON.stringify(removeHostList)},
        success: function(result) {
            if (!result.error) {
                U.lobiboxMessage("완료");
                location.reload();
            } else {
                $("#close_aggregate").click();
            }
        }
    });
}

// delete
$(function() {
    $("table").on("click", ".deleteHostAggregates", function() {
        var id = $(this).parents("tr").data("id");
        $("#modalDelete").data("id", id).modal();
    });
    $("#btnDeleteSave").on("click", function() {
        var id = $("#modalDelete").data("id");
        alert(id + " 삭제 넣기");
//        $("#modalDelete").modal("hide");
    });
});

$(function() {
    setAllocatedAvailableTable({name: "host"});
});
