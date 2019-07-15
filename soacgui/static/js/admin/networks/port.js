function getPorts(/*ports*/){
//    var actionGroupHtml = "";
//    actionGroupHtml += '<a href="#" class="deletePort"><div>포트 삭제</div></a>';
//    var dataTable = new DataTable({
//        "selector" : "#port_list",
//        "columns" : {
//            "name" : "이름:link",
//            "fixed_ips" : "Fixed IP",
//            "device_id" : "장치 연결됨",
//            "status" : "Status",
//            "admin_state_up" : "관리자 상태",
//            "customHtml" : "액션"
//        },
//        "data" : ports,
//        "subData" : {
//            "fixed_ips":["ip_address"],
//            "dhcpAgents" : "count"
//        },
//        "customHtml":[
//            {
//                "tagName":"button",
//                "class":"btnUpdate",
//                "text":"포트 편집"
//            },
//            {
//                "tagName":"div",
//                "class":"action",
//                "text":"액션"
//            },
//            {
//                "tagName":"div",
//                "class":"actionGroup",
//                "option":"hidden",
//                "text":actionGroupHtml
//            },
//        ],
//        "min_row":5
//    });
//    dataTable.showDataTable();
//    dataTable.setLink("networks/ports");

//    var actionGroup = new ActionGroup({
//        "selector":"#port_list",
//        "clickEvent":function() {
//            var port_id = $(this).parents("tr").data("id");
//            if ($(this).hasClass("deletePort")) {
//                var port_name = $(this).parents("tr").children("td.name").text();
//                $("#modalDelete .modal-body").text(port_name + "(" + port_id + ")를 삭제하시겠습니까?");
//                $("#modalDelete").data("id", port_id);
//                $("#modalDelete").data("url", "ports/" + port_id + "/delete").modal();
//            }
//        }
//    });
//    actionGroup.run();

    $("#createPort").on("click", function() {
        showCreatePortModal();
    });
    $("#port_list .btnUpdate").on("click", showUpdatePortModal);
}

function showCreatePortModal() {
    modalUtil.setOption({
        "selector":"#modal",
        "title":"포트 생성",
        "body":"#modalPortBody",
        "footer":"#modalPortFooter"
    });
    modalUtil.bindHtml();

    var network_id = $("#network_info").data("network_id");
    var network_name = $("#network_info").data("network_name");
    $("#inputPortNetworkId").val(network_id);
    $("#inputPortNetworkName").val(network_name);
    $("#areaPortId").hide();

    $("#createPortSubmit").on("click", function() {
        var network_id = $("#inputPortNetworkId").val();
        createPort(network_id);
    });

    $("#modal").modal();
}

function showUpdatePortModal() {
    var port_id = $(this).parents("tr").data("id");
    modalUtil.setOption({
        "selector":"#modal",
        "title":"포트 수정",
        "body":"#modalPortBody",
        "footer":"#modalPortFooter"
    });
    modalUtil.bindHtml();

    var network_id = $("#network_info").data("network_id");
    var network_name = $("#network_info").data("network_name");
    $("#inputPortNetworkId").val(network_id);
    $("#inputPortNetworkName").val(network_name);
    $("#areaPortNetworkId").hide();
    $("#areaPortNetworkName").hide();

    U.ajax({
        url: "ports/" + port_id + "/detail",
        success:function(jsonData) {
            if (!isEmpty(jsonData.error)) {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            if (!isEmpty(jsonData.success)) {
                var port = jsonData.success.port;
                $("#inputPortId").val(port.id);
                $("#areaPortId").show();
                $("#inputPortName").val(port.name);
                $("#inputPortAdmin").val((port["admin_state_up"]) ? "1" : "0");
                $("#inputPortDeviceId").val(port["device_id"]);
                $("#inputPortDeiceOwner").val(port["device_owner"]);
                $("#inputPortBindingHostId").val(port["binding:host_id"]);
                $("#inputPortBindingVnicType").val(port["binding:vnic_type"]);

                $("#createPortSubmit").on("click", function() {
                    var network_id = $("#inputPortNetworkId").val();
                    updatePort(network_id, port_id);
                });

                $("#modal").modal();
            }
        }
    });
}

function createPort(network_id) { createOrUpdatePort(network_id); }
function updatePort(network_id, port_id) { createOrUpdatePort(network_id, port_id); }
function createOrUpdatePort(network_id, port_id) {
    var portData = {
        "network_id":$("#inputPortNetworkId").val(),                // body string
        "name":$("#inputPortName").val(),                           // body string  (Optional)
        "admin_state_up":$("#inputPortAdmin").val(),                // body boolean (Optional)
        "device_id":$("#inputPortDeviceId").val(),                  // body string  (Optional)
        "device_owner":$("#inputPortDeiceOwner").val(),             // body string  (Optional)
        "binding:host_id":$("#inputPortBindingHostId").val(),       // body string  (Optional)
        "binding:vnic_type":$("#inputPortBindingVnicType").val(),   // body string  (Optional)
        "allowed_address_pairs":"",   // body array   (Optional)
        "binding:profile":"",         // body string  (Optional)
        "description":"",             // body string  (Optional)
        "dns_domain":"",              // body string  (Optional)
        "dns_name":"",                // body string  (Optional)
        "extra_dhcp_opts":"",         // body array   (Optional)
        "fixed_ips":"",               // body array   (Optional)
        "mac_address":"",             // body string  (Optional)
        "port_security_enabled":"",   // body boolean (Optional)
        "project_id":"",              // body string  (Optional)
        "security_groups":"",         // body array   (Optional)
        "tenant_id":""                // body string  (Optional)
    };
    var data = {};
    $.each(portData, function(key, value) {
        if (isEmpty(value)) return 1;
        else if (key == "admin_state_up") data[key] = (value == "1");
        else data[key] = value;
    });
    // console.log(data);
    var url = "ports/create";
    var message = "포트 생성 성공";
    if (!isEmpty(port_id)) {
        url = "ports/" + port_id + "/update";
        message = "포트 수정 성공";
        delete data.network_id;
    }
    U.ajax({
        // progress:true,
        url:url,
        data:{"data":JSON.stringify({"port":data})},
        success:function(jsonData) {
            if (jsonData.error) {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            if (jsonData.success) {
                var result = jsonData.success;
                console.log(result);
                var port_name = jsonData.success.port.name;
                var port_id = jsonData.success.port.id;
                U.lobiboxMessage(message, "info", (port_name) ? port_name:port_id);
            }
        }
    });
    $("#modal").modal("hide");
}