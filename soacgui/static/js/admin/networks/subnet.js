$(function() {
    updateSubnetsEvent();
    createSubnetEvent();
    subnetActionGroupEvent();
});

function updateSubnetsEvent() {
    $("#subnet_list").on("click", ".btnUpdate", function() {
        var subnet_id = $(this).parents("tr").data("id");
        PopupUtil({
            url: "subnets/" + subnet_id + "/modal",
            title: "서브넷 수정",
            tab: {
                selector: "#commonModal",
                nextBtn: "#tab-next-btn",
                prevBtn: "#tab-prev-btn",
                beforeEveryAct: function(tabUtil, selIdx) {
                    if (selIdx == tabUtil.length - 1) {
                        var address = $("#input_cidr").val();
                        if (!address || address.length == 0) { // 조건문 고쳐야 함
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
            success: function() {
                $("#createNetworkSubmit").on("click", function() {
                    updateSubnet(network_id, subnet_id);
                });
                $("#inputNetworkNoGateway").on("change", function() {
                    if ($(this).prop("checked")) {
                        $("#areaNetworkGateway").hide();
                    } else {
                        $("#areaNetworkGateway").show();
                    }
                });
            }
        });
    });
}

function subnetActionGroupEvent() {
    var actionGroup = new ActionGroup({
        "selector":"#subnet_list",
        "clickEvent":function() {
            var subnet_id = $(this).parents("tr").data("id");
            if ($(this).hasClass("deleteSubnet")) {
                var subnet_name = $(this).parents("tr").children("td.name").text();
                $("#modalDelete .modal-body").text(subnet_name + "(" + subnet_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", subnet_id);
                $("#modalDelete").data("url", "subnets/" + subnet_id + "/delete").modal();
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();
}

function createSubnetEvent() {
    $("#createSubnet").on("click", function() {
        var network_id = $("#network_info").data("network_id");
        PopupUtil({
            url: "subnets/modal",
            title: "서브넷 생성",
            tab: {
                selector: "#commonModal",
                nextBtn: "#tab-next-btn",
                prevBtn: "#tab-prev-btn",
                beforeEveryAct: function(tabUtil, selIdx) {
                    if (selIdx == tabUtil.length - 1) {
                        var address = $("#input_cidr").val();
                        if (!address || address.length == 0) { // 조건문 고쳐야 함
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
            success: function() {
                $("#createNetworkSubmit").on("click", function() {
                    createSubnet(network_id);
                });
                $("#inputNetworkNoGateway").on("change", function() {
                    if ($(this).prop("checked")) {
                        $("#areaNetworkGateway").hide();
                    } else {
                        $("#areaNetworkGateway").show();
                    }
                });
            }
        });
    });
}

function createSubnet(network_id) { createOrUpdateSubnet(network_id); }
function updateSubnet(network_id, subnet_id) { createOrUpdateSubnet(network_id, subnet_id); }
function createOrUpdateSubnet(network_id, subnet_id) {
    var pool = $("#inputNetworkPool").val().split("\n");
    var dns = $("#inputNetworkDns").val().split("\n");
    var host = $("#inputNetworkHost").val().split("\n");
    // var useGateway = $("#inputNetworkNoGateway").prop("checked");
    var subnetData = $("#subnetFrm").serializeObject();
//    var subnetData = {
//        "tenant_id" : "",                                           // body        string       (Optional)
//        "project_id" : "",                                          // body        string       (Optional)
//        "name" : $("#inputNetworkSubnetName").val(),                 // body        string       (Optional)
//        "network_id" : network_id,                                  // body        string
//        "enable_dhcp" : $("#inputNetworkUseDhcp").prop("checked"),   // body        boolean      (Optional)
//        "allocation_pools" : pool,                                  // body        array        (Optional)
//        "dns_nameservers" : dns,                                    // body        array        (Optional)
//        "host_routes" : host,                                       // body        array        (Optional)
//        "ip_version" : $("#inputNetworkIpv").val(),                  // body        integer
//        "gateway_ip" : $("#inputNetworkGateway").val(),              // body        string       (Optional)
//        "cidr" : $("#input_cidr").val(),                    // body        string
//        "description" : "",                                         // body        string       (Optional)
//        "ipv6_address_mode" : "",                                   // body        string       (Optional)
//        "ipv6_ra_mode" : "",                                        // body        string       (Optional)
//        "segment_id" : "",                                          // body        string       (Optional)
//        "subnetpool_id" : "",                                       // body        string       (Optional)
//        "use_default_subnetpool" : ""                               // body        boolean      (Optional)
//    };
    var allocation_pools = [];
    console.log(subnetData["allocation_pools"]);
    $.each(subnetData["allocation_pools"].replace(/[\s]/g, "").split("\n"), function(i, v) {
        allocation_pools.push({start: v.split(",")[0].trim(), end: v.split(",")[1].trim()});
    });
    subnetData["allocation_pools"] = allocation_pools;
    subnetData["dns_nameservers"] = subnetData.allocation_pools.replace(/[\s]/g, "").split("\n");
    var host_routes = [];
    $.each(subnetData["host_routes"].replace(/[\s]/g, "").split("\n"), function(i, v) {
        host_routes.push({destination: v.split(",")[0].trim(), nexthop: v.split(",")[1].trim()});
    });
    subnetData["host_routes"] = host_routes;

    delete subnetData.enable_gateway;
    console.log(subnetData);
    var data = {};
    $.each(subnetData, function(key, value) {
//        if (value == "" && typeof value === "string" || value instanceof Array && value[0] == "") return 1;
//        else if (typeof value === "boolean" || value) data[key] = value;
        if (isEmpty(value)) return 1;
        else data[key] = value;
    });
    var url = "subnets/create";
    var message = "서브넷 생성 성공";
    if (subnet_id) {
        url = "subnets/" + subnet_id + "/update";
        message = "서브넷 수정 성공";
    }
//    U.ajax({
//        // progress:true,
//        url:url,
//        data:{"data":JSON.stringify({"subnet":data})},
//        success:function(jsonData) {
//            if (jsonData.error) {
//                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
//            }
//            if (jsonData.success) {
//                var result = jsonData.success;
//                var subnet_name = jsonData.success.subnet.name;
//                var subnet_id = jsonData.success.subnet.id;
//                U.lobiboxMessage(message, "info", (subnet_name) ? subnet_name:subnet_id);
//            }
//            U.hideProgress();
//        }
//    });
//    $("#modal").modal("hide");
}
