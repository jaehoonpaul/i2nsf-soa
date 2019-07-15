$(function() {
    var actionGroup = new ActionGroup({
        "selector":"#port_list",
        "clickEvent":function() {
            var port_id = $(this).parents("tr").data("id");
            var port_name = $(this).parents("tr").children("td.name").text().trim();

            if ($(this).hasClass("delete_port")) {
                $("#modalDelete .modal-body").text(port_name + "(" + port_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", port_id);
                $("#modalDelete").data("url", "ports/" + port_id + "/delete").modal();
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();

    $("#createPort").on("click", function() {
        showCreatePortModal();
    });
    $("#port_list .btnUpdate").on("click", showUpdatePortModal);
/*
    U.ajax({
        url : '',
        data : { id:"{{ net_id }}"},
        success:function(data){
        //수정해야됨 해당 네트워크의 포트 리스트 불러오기
            var tempList = data.subnet["allocation_pools"].split("\n");
            var allocation_pools = [];
            for( i in tempList ){
                var allocation_pool = JSON.parse(tempList[i]);
                allocation_pools.push(allocation_pool);
            }
            for( key in data.subnet ){
                var resultHtml = "";
                if( key == "allocation_pools" ){
                    for( var i = 0; i < allocation_pools.length; i++ ){
                        if( resultHtml != "" ){
                            resultHtml += "<br/>";
                        }
                        resultHtml += "시작 " + allocation_pools[i]["start"] + " - 끝 " + allocation_pools[i]["end"];
                    }
                }
                else{
                    resultHtml = data.subnet[key];
                }
                if( resultHtml == "" ){
                    resultHtml = "None"
                }
                $("#"+key).html(resultHtml);
            }
        }
    });
    */
    // 여기까지
//    var dataTable = {
//        "columns" : {
//            "name" : "이름",
//            "fixed_ips" : "Fixed IP",
//            "network" : "장치 연결됨",
//            "status" : "Status",
//            "admin_state_up" : "관리자 상태"
//        },
//        "data" : //데이터 넣기
//        [
//            {
//                "name" : "",
//                "fixed_ips" : "",
//                "status" : "",
//                "admin_state_up" : ""
//            },
//            {
//                "name" : "",
//                "fixed_ips" : "",
//                "status" : "",
//                "admin_state_up" : ""
//            }
//        ]
//    };
//
//    var columnHtml = "<tr>";
//    for( key in dataTable["columns"] ){
//        columnHtml += "<th class='ind_th01 " + key + "'>" + dataTable["columns"][key] + "</th>\n";
//    }
//    columnHtml += "</tr>";
//    var dataHtml = "";
//    for( i in dataTable["data"] ){
//        dataHtml += "<tr>\n";
//        for( key in dataTable["columns"] ){
//            dataHtml += "<td class='" + key + "'>" + dataTable["data"][i][key] + "</td>\n";
//        }
//        dataHtml += "</tr>\n";
//    }
//    var resultHtml = columnHtml + dataHtml;
//    $("#port table").html(resultHtml);
});


function showCreatePortModal() {
    PopupUtil({
        title: "포트 생성",
        url:"/dashboard/admin/networks/ports/modal",
        tab: {
            selector: "#commonModal",
        },
        success: function(result) {
            var network_id = $("#network_info").data("network_id");
            var network_name = $("#network_info").data("network_name");
            $("#inputPortNetworkId").val(network_id);
            $("#inputPortNetworkName").val(network_name);
            $("#areaPortId").hide();
            $("#createPortSubmit").on("click", function() {
                var network_id = $("#inputPortNetworkId").val();
                createPort(network_id);
            });
        }
    });
}

function showUpdatePortModal() {
    var port_id = $(this).parents("tr").data("id");
    PopupUtil({
        title: "포트 수정",
        url:"/dashboard/admin/networks/ports/modal",
        data: {port_id: port_id},
        tab: {
            selector: "#commonModal",
        },
        success: function(result) {
            var network_id = $("#network_info").data("network_id");
            var network_name = $("#network_info").data("network_name");
            $("#inputPortNetworkId").val(network_id);
            $("#inputPortNetworkName").val(network_name);
            $("#areaPortId").hide();
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
                createPort(network_id);
            });
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