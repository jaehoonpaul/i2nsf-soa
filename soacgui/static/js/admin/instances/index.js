$(function() {
    forEachTr();
    createModalEvent();
    actionEvent();
    $("#deleteSubmit").on("click", function() {
        var id = $("#modalDelete").data("id");
        var url = $("#modalDelete").data("url");
        var action = {"forceDelete":null};
        actionServer(id, action);
    });
});

function actionEvent() {
    var actionGroup = new ActionGroup({
        "selector":"#instance_list",
        "clickEvent":function() {
            var server_id = $(this).parents("tr").data("id");
            var server_name = $(this).parents("tr").children("td.name").text().trim();

            if ($(this).hasClass("console")) {
                var action = {"os-getVNCConsole":{"type":"novnc"}};
                actionServer(server_id, action);
            } else if ($(this).hasClass("start")) {
                var action = {"os-start":null};
                actionServer(server_id, action);
            } else if ($(this).hasClass("stop")) {
                var action = {"os-stop":null};
                actionServer(server_id, action);
            } else if ($(this).hasClass("unpause")) {
                var action = {"unpause":null};
                actionServer(server_id, action);
            } else if ($(this).hasClass("pause")) {
                var action = {"pause":null};
                actionServer(server_id, action);
            } else if ($(this).hasClass("soft_reboot")) {
                var action = {"reboot":{"type":"SOFT"}};
                actionServer(server_id, action);
            } else if ($(this).hasClass("hard_reboot")) {
                var action = {"reboot": {"type": "HARD"}};
                actionServer(server_id, action);
            } else if ($(this).hasClass("delete")) {
                $("#modalDelete .modal-body").text(server_name + "(" + server_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", server_id);
                $("#modalDelete").data("url", server_id + "/delete").modal();
            } else if ($(this).hasClass("sync")) { // TODO: soam sync delete
                PopupUtil({
                    url: server_id + "/sync_modal",
                    title: "soam sync",
                    tab: {selector: "#commonModal"},
                    width: 1000,
                    success: function(result) {
                        $("#submit_sync").on("click", function() {
                            U.ajax({
                                url : server_id + "/sync",
                                data: {"service_id": $("input[name=service_id]").val()},
                                success:function(jsonData){
                                    U.lobiboxMessage(jsonData.result, "info");
                                }
                            });
                        });
                    }
                });
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();

//        if ($(this).hasClass("log")) {
//            U.msg("준비중 입니다.");
//            console.log("log");
//        } else if ($(this).hasClass("snapshot")) {
//            U.msg("준비중 입니다.");
//            console.log("snapshot");
//        } else if ($(this).hasClass("migration")) {
//            var action = {"migrate":null};
//            actionServer(server_id, action);
//        } else if ($(this).hasClass("real_time_migration")) {
//            U.msg("준비중 입니다.");
//            console.log("migrateLive");
//            var action = {
//                "os-migrateLive":{
//                    "host":host,
//                    "block_migration": block_migration,
//                    "disk_over_commit":disk_over_commit, // ???
//                    "force": force // option
//                }
//            };
//            actionServer(server_id, action);
//        } else if ($(this).hasClass("shelve")) {
//            var action = {"shelve":null};
//            actionServer(server_id, action);
//        }
//    });
    $(".update").on("click", function() {
        var server_id = $(this).parents("tr").data("id");
        var server_name = $(this).parents("tr").children("td.name").text().trim();
        showEditModal({
            title: "가상서버 수정",
            url: server_id + "/modal",
            data: {server_name: server_name},
            success: function(result) {
                $("#edit_server").off("click");
                $("#edit_server").on("click", {server_id: server_id}, editInstance);
            }
        });
    });

    initActionSelect($("#tableInstance .actions_sel01"), function(contentKey, action) {
        switch (action) {
            case "update": {
                U.ajax({"url" : contentKey + "/update"
                    ,   "data":{}
                    ,   "success": function(result) {
                            console.log(result);
                            $("#modalUpdate").modal();
                        }
                    ,   "error": function() {
                            $("#modalUpdate").modal();
                        }
                });
                break;
            }
        }
    });
}

function showEditModal(opt) {
    if (!opt.url) {
        opt.url = "modal";
    }
    PopupUtil(opt);
}

function actionServer(server_id, action) {
    U.ajax({
        url : server_id + "/action",
        data : { "data": JSON.stringify(action) },
        success:function(jsonData) {
            if (typeof jsonData.success == "undefined") {
//                U.msg("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                if ("forceDelete" in action) {
                    U.lobiboxMessage("서버가 삭제되었습니다.", "info", "삭제");
                    $("tr[data-id=" + server_id + "]").remove();
                    $("#modalDelete").modal("hide");
                } else if (jsonData.success == "reload") {
                    var trTag = $("tr[data-content=" + server_id + "]")[0];
                    refreshServerState(server_id, trTag);
                } else if ("console" in jsonData.success) {
                    if (typeof jsonData.success.console != "undefined") {
                        window.open(jsonData.success.console.url, server_id, "width=1024, height=800, toolbar=no, menubar=no, location=no, top=300, left= 300");
                    }
                } else {
                }
            }
        }
    });
}
var reload;
var revoked_token = false;
function forEachTr() {
    var reload_flag = false;
    $.each($("table.index tr"), function(idx, trTag) {
        var server_id = $(trTag).data("id");
        if (idx != 0 && server_id) {
            var status1 = $(trTag).children("td:eq(6)").text();
            var status2 = $(trTag).children("td:eq(7)").text();
            // status == "ACTIVE"|| status == "SHUTOFF" || status == "SHELVED_OFFLOADED" || status == "PAUSED"
            if (status2 == "None" && status1 != "DELETED" && status1 != "BUILD") {
                $(trTag).children("td").removeAttr("style");
                return;
            } else { // ACTIVE가 아니면 상태 갱신
                refreshServerState(server_id, trTag);
                $(trTag).children("td").css("background-color", "rgb(255, 200, 145)");
                reload_flag = true;
            }
        }
    });

    clearInterval(reload);
    if (reload_flag) {
        reload = setInterval(function() {
            forEachTr();
        }, 5000);
        if (revoked_token) {
            clearInterval(reload);
        }
    }
}

function refreshServerState(server_id, trTag) {
    console.log("Call::refreshServerState()");
    U.ajax({
        url : server_id + "/detail",
        success:function(jsonData) {
            if (typeof jsonData.success == "undefined") {
//                U.msg("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
                revoked_token = true;
            } else {
                $(trTag).children("td:eq(6)").text(jsonData.success.instance.status);
                $(trTag).children("td:eq(7)").text(jsonData.success.instance.task_state == null ? "None":jsonData.success.instance.task_state);
                $(trTag).children("td:eq(8)").text(jsonData.success.instance.power_state);
            }
        }
    });
}

function createModalEvent() {
    $(document).on("click", ".tabBtn", function() {
        $(".tabBtn").removeClass("click");
        var clickTab = $(this).attr("class").replace("pop01_d03 tabBtn ", "").replace(" click", "");
        $(".tabBody").hide();
        $(this).addClass("click");
        $("." + clickTab).show();
    });
//    $("#info").
//    $("#source").
//    $("#flavor").
//    $("#network").
//    $("#port").
//    $("#security").
//    $("#keyPair").
//    $("#configuration").
//    $("#metadata").
}

$(function() {
    $("#create").on("click", function() {
        showEditModal({
            title: "가상서버 생성",
            class: "full",
            success: function(result) {
                setAllocatedAvailableTable({name: "source", isOne:true});
                setAllocatedAvailableTable({name: "flavor", isOne: true});
                setAllocatedAvailableTable({name: "network"});
                setAllocatedAvailableTable({name: "networkport", isOne: true});
                setAllocatedAvailableTable({name: "security"});
                $("#submit_server").off("click");
                $("#submit_server").on("click", createServer);
                setRadio("newVolume", function(value) {
                    if (value == 1) {
                        $("#newVolumeArea").show();
                    } else {
                        $("#newVolumeArea").hide();
                    }
                });
                setRadio("syncVolume");
                $("#newVolumeRadioArea [data-value='0']").click();
                $("#syncVolumeRadioArea [data-value='0']").click();
            }
        });
    });
});


function setRadio(name, complete) {
    var area = $("#" + name + "RadioArea");
    area.on("click", "button.btn-radio", function() {
        area.find("button.btn-radio").removeClass("selected");
        var btn = $(this);
        btn.addClass("selected");
        var value = btn.data("value");
        area.find("input[name=" + name + "]").val(value);
        if (complete) complete(value);
    });
}

function createServer() {
    var data = $("#createFrm").serializeObject();
    data["imageRef"] = $("#source_allocated tbody tr").data("id");
    data["flavorRef"] = $("#flavor_allocated tbody tr").data("id");
    data["networks"] = [];
    $("#network_allocated tbody tr").each(function(i, v) {
        var network = {"uuid": $(v).data("id")};
        data["networks"].push(network);
    });
    U.ajax({
        url: "create",
        data: {data: JSON.stringify({server: data})},
        success: function(result) {
            if (result.success) {
                U.lobiboxMessage("서버가 생성되었습니다.", "info", "서버 생성 성공");
                location.reload();
            } else if (result.error) {
                U.lobibox(result.error.message, "error", result.error.title);
            }
        }
    });
}

function editInstance(event) {
    var data = {
        "server": {
            "name": $("input[name=name]").val(),
//            "description": $("input[name=description]").val()
        }
    }
    U.ajax({
        url: event.data.server_id + "/update",
        data: {data: JSON.stringify(data)},
        success: function(result) {
            if (result.success) {
                U.lobiboxMessage("서버가 수정되었습니다.", "info", "수정");
                location.reload();
            } else if (result.error) {
                U.lobibox(result.error.message, "error", result.error.title);
            }
        }
    });
}