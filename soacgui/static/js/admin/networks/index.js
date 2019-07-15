var modalUtil = new ModalUtil();
$(function() {
    getNetworksAjax();
    $(".contents_d01").css("overflow-y","scroll");
    $("html, body").animate({ scrollTop: 0 }, 0);
//    .headerList.on("click", function() {
//        $("html, body").animate({ scrollTop: $(this).offset().top -120 }, "fast");
//    });
//    $("#goto_top").on("click", function() {
//        $("html, body").animate({ scrollTop: 0 }, "fast");
//    });

    setFilter($("#network_list table"), $("#inputFilter"));
    createNetworkEvent();
    updateNetworkEvent();
    deleteNetworkEvent();
//    createSubnetEvent();
});

// create
function createNetworkEvent() {
    $("#createNetwork").on("click", function() {
        PopupUtil({
            title: "네트워크 생성",
            url:"modal",
            tab: {
                selector: "#commonModal",
                nextBtn: "#tab-next-btn",
                prevBtn: "#tab-prev-btn",
                beforeEveryAct: function(tabUtil, selIdx) {
                    if (selIdx == tabUtil.length - 1) {
                        var address = $("#inputNetworkAddress").val();
                        if (!address || address.length == 0) { // TODO: 조건문 고쳐야 함
                            U.lobiboxMessage("주소 입력", "info", "정보");
                            return 0;
                        }
                    }
                },
                afterEveryAct: function(tabUtil) {
                    if (tabUtil.tabIndex == tabUtil.length - 1) {
                        $("#createNetworkSubmit").show();
                    } else {
                        $("#createNetworkSubmit").hide();
                    }
                }
            },
            success: function(result) {
                $("#createNetworkSubmit").on("click", function() {
                    createNetwork();
                });
//                $("#commonModal").on("hidden.bs.modal", function() {
//                    tabUtil.tabIndex = 0;
//                });
                $("#inputNetworkUseSubnet").on("change", function() {
                    if ($(this).prop("checked")) {
                        $(".with-subnet").show();
                        $("#createNetworkSubmit").hide();
                        $("#createNetworkNext").show();
                    } else {
                        $(".with-subnet").hide();
                        $("#createNetworkNext").hide();
                        $("#createNetworkSubmit").show();
                    }
                });
                $("#inputNetworkNoGateway").on("change", function() {
                    if ($(this).prop("checked")) {
                        $("#areaNetworkGateway").hide();
                    } else {
                        $("#areaNetworkGateway").show();
                    }
                });
                $("#areaNetworkSubnetId").hide();
                $("#areaNetworkId").hide();
            }
        });
    });
}

function createNetwork() { createOrUpdateNetwork(); }
function updateNetwork(id) { $("#inputNetworkUseSubnet").prop("checked", false); createOrUpdateNetwork(id); }
function createOrUpdateNetwork(id) {
    U.showProgress();
    var networkData = {
        "admin_state_up": $("#inputNetworkAdmin").val(),     // body    boolean   (Optional)
        "dns_domain": "",                                   // body    string    (Optional)
        "mtu": "",                                          // body    integer   (Optional)
        "name": $("#inputNetworkName").val(),                // body    string    (Optional)
        "port_security_enabled": "",                        // body    boolean   (Optional)
        "project_id": "",                                   // body    string    (Optional)
        "provider:network_type": "",                        // body    string    (Optional)
        "provider:physical_network": "",                    // body    string    (Optional)
        "provider:segmentation_id": "",                     // body    integer   (Optional)
        "qos_policy_id": "",                                // body    string    (Optional)
        "router:external": $("input[name=external_network]").prop("checked"),  // body    boolean   (Optional)
        "segments": "",                                     // body    array     (Optional)
        "shared": $("#inputNetworkShare").prop("checked"),   // body    boolean   (Optional)
        "tenant_id": "",                                    // body    string    (Optional)
        "vlan_transparent": "",                             // body    boolean   (Optional)
        "description": "",                                  // body    string    (Optional)
    };
    var data = {};
    $.each(networkData, function(key, value) {
        if (isEmpty(value)) return 1;
        else if (key == "admin_state_up") data[key] = (value == "1");
        else data[key] = value;
    });
    var url = "create";
    var message = "생성 성공";
    if (id) {
        url = id + "/update";
        message = "수정 성공";
    }

    U.ajax({
//        progress:true,
        url:url,
        data:{"data":JSON.stringify({"network":data})},
        success:function(jsonData) {
            if (jsonData.error) {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            if (jsonData.success) {
                var result = jsonData.success;
                var network_name = jsonData.success.network.name;
                var network_id = jsonData.success.network.id;
                U.lobiboxMessage("네트워크 " + message, "info", (network_name) ? network_name:network_id);
                var useSubnet = $("#inputNetworkUseSubnet").prop("checked");
                if (useSubnet) {
                    createSubnet(network_id);
                } else {
                    location.reload();
                }
            }
            $("#commonModal").modal("hide");
        }
    });
}

// update
function updateNetworkEvent() {
    $("#network_list").on("click", ".btnUpdate", function() {
        var network_id = $(this).parents("tr").data("id");
        showUpdateNetworkModal(network_id);
    });
//    $("#inputProvider").on("change", function() {
//        var v = $(this).val();
//        if (v == "flat" || v == "vlan") {
//            $("#areaPhysical").show();
//        } else {
//            $("#areaPhysical").hide();
//        }
//        if (v == "vlan" || v == "gre" || v == "vxlan") {
//            $("#areaSegmentation").show();
//        } else {
//            $("#areaSegmentation").hide();
//        }
//    });
//    $("#areaSourceImage").hide();
//    $("#updateNetworkSubmit").on("click", function() {
//        var network_id           = $("#inputNetworkId").val();
//        if (network_id) {
//            updateNetwork(network_id);
//            U.lobibox(JSON.stringify(data) + " 편집 넣기", "info", "정보");
//        } else {
//            U.lobibox(JSON.stringify(data) + " 저장 넣기???", "info", "정보");
//        }
//    });
}

function showUpdateNetworkModal(network_id) {
    PopupUtil({
        url: "modal",
        title: "네트워크 수정",
        data: {network_id: network_id},
        success: function() {
            $("#createNetworkSubmit").on("click", function() {
                updateNetwork(network_id);
            });
        }
    });
}

// delete
function deleteNetworkEvent() {
    $("#deleteSubmit").on("click", function() {
        var id = $("#modalDelete").data("id");
        var url = $("#modalDelete").data("url");

        U.ajax({
            url: url,
            success:function(jsonData) {
                if (jsonData.error) {
                    U.lobibox(jsonData.error.message, "error", "삭제 실패: " + jsonData.error.title);
                }
                if (jsonData.success) {
                    U.lobiboxMessage(id, "info", "삭제 성공");
                    $("tr[data-id=" + id + "]").remove();
                }
                location.reload();
            }
        });
    });
}

function confirmDeleteNetwork(network_id, network_name) {
    $("#modalDelete .modal-body").text(network_name + "(" + network_id + ")를 삭제하시겠습니까?");
    $("#modalDelete").data("id", network_id);
    $("#modalDelete").data("url", network_id + "/delete").modal();
}

function showNetworkList() {
    $("#network_list").on("click", ".link a", function() {
        var network_id = $(this).data("id");
        $("#info_tab").loadPage({
            url: network_id + "/detail",
            success: function() {
//                getSubnets(evalPythonToJS($("#subnets_data").data("subnets")));
//                getPorts(evalPythonToJS($("#ports_data").data("ports")));
//                getDHCPagents(evalPythonToJS($("#dhcp_agents_data").data("dhcp_agents")));
                TabUtil({"selector":"#info_tab"}).run();
            }
        });
    });
    $("#network_list .link a:eq(0)").click();
    var actionGroup = new ActionGroup({
        "selector":"#network_list",
        "clickEvent":function() {
            var network_id = $(this).parents("tr").data("id");
            if ($(this).hasClass("addSubnet")) {
                showCreateSubnetModal(network_id);
            } else if ($(this).hasClass("deleteNetwork")) {
                var network_name = $(this).parents("tr").children("td.name").text();
                confirmDeleteNetwork(network_id, network_name);
            } else if ($(this).hasClass("sync")) { // TODO: soam sync delete
                PopupUtil({
                    url: network_id + "/sync_modal",
                    title: "soam sync",
                    tab: {selector: "#commonModal"},
                    width: 1000,
                    success: function(result) {
                        $("#submit_sync").on("click", function() {
                            U.ajax({
                                url : network_id + "/sync",
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
}
function getNetworksAjax(){
    U.showProgress();
    showNetworkList();
    U.hideProgress();
}

function getDHCPagents(dhcpAgents){
    var dataTable = new DataTable({
        "selector" : "#DHCPagent_list",
        "columns" : {
            "host" : "호스트",
            "alive" : "상태",
            "admin_state_up" : "관리자 상태",
            "started_at" : "시작한 시간",
        },
        "data" : dhcpAgents,
        "min_row":5
    });
    dataTable.showDataTable();
}
