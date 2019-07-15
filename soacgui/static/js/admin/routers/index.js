$(function(){
    $(".contents_d01").css("overflow-y","scroll");
    getRouterListAjax();

    TabUtil({"selector":"#info_tab"}).run();
    $("#createRouter").on("click", function() {
        getExternalNetwork();
    });
});
var modalUtil = new ModalUtil();

function getRouterListAjax(){
    U.ajax({
        url : '',
        success:function(jsonData){
            if (jsonData.error) {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            var routers = jsonData.success.routers;
            getRouterList(routers);
        }
    });
}
function getRouterList(routers) {
    if (routers[0]) {
        getRouterAjax(routers[0].id);
    }
    var actionGroupHtml = "";
    actionGroupHtml += '    <div class="button_group_d01 btnUpdate">라우터 편집</div>';
    actionGroupHtml += '    <div class="button_group_d02 action">';
    actionGroupHtml += '        <img src="/static/img/dashboard/common/arrow_img_01.png" alt="#">';
    actionGroupHtml += '    </div>';
    actionGroupHtml += '    <div class="clear_float"></div>';
    actionGroupHtml += '    <div class="actionGroup actionGroup01" hidden>';
    actionGroupHtml += '        <a href="#" class="deleteRouter actionGroup_a01"><div>라우터 삭제</div></a>';
    actionGroupHtml += '        <a href="#" class="deleteGateway actionGroup_a01"><div>게이트웨이 삭제</div></a>';
//    actionGroupHtml += '        <a href="#" class="sync actionGroup_a01"><div>soam 연동</div></a>';// TODO: soam sync delete
    actionGroupHtml += '    </div>';
    var dataTable = new DataTable({
        "selector" : "#router_list",
        "columns" : {
            "project_name" : "프로젝트",
            "name" : "이름:link",
            "status" : "Status",
            "external_gateway_info.network_id" : "외부 네트워크",
            "admin_state_up" : "관리자 상태",
            "customHtml" : "액션"
        },
        "parseString":{
            "admin_state_up":{
                "type":"bool",
                "replacement":["UP", "DOWN"]
            },
        },
        "data" : routers,
        "customHtml":[
            {
                "tagName":"div",
                "class":"button_group_bt02",
                "text":actionGroupHtml
            },
        ],
        "min_row":5
    });

    var actionGroup = new ActionGroup({
        "selector":"#router_list",
        "clickEvent":function() {
            var router_id = $(this).parents("tr").data("id");
            if ($(this).hasClass("deleteRouter")) {
                var router_name = $(this).parents("tr").children("td.name").text();
                $("#modalDelete .modal-body").text(router_name + "(" + router_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", router_id);
                $("#modalDelete").data("url", router_id + "/delete").modal();
            } else if ($(this).hasClass("deleteGateway")) {
//                var gateway_name = $(this).parents("tr").children("td.name").text();
//                $("#modalDelete .modal-body").text(gateway_name + "(" + gateway_id + ")를 삭제하시겠습니까?");
//                $("#modalDelete").data("id", gateway_id);
//                $("#modalDelete").data("url", "routers/gateway/" + gateway_id + "/delete").modal();
                U.msg("준비중입니다.");
            } else if ($(this).hasClass("sync")) { // TODO: soam sync delete
                PopupUtil({
                    url: router_id + "/sync_modal",
                    title: "soam sync",
                    tab: {selector: "#commonModal"},
                    width: 1000,
                    success: function(result) {
                        $("#submit_sync").on("click", function() {
                            U.ajax({
                                url : '/dashboard/admin/routers/' + router_id + "/sync",
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
    dataTable.showDataTable();
    dataTable.setLink("routers", true);
    $("#router_list").on("click", ".name a", function() {
        getRouterAjax($(this).data("id"));
    });
    actionGroup.setCloseEvent();
    actionGroup.run();
}

function getRouterAjax(id){
    U.ajax({
        url : '/dashboard/admin/routers/' + id + "/detail",
        success:function(jsonData){
            if (jsonData.error) {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            var router = jsonData.success.router;
            $("#selectRouterId").val(router.id);
            $("#selectRouterName").val((isEmpty(router.name)?"":router.name));
            var dataTable = new DataTable({
                "selector" : "#router_info_detail",
                "columns" : {
                    "name" : "이름",
                    "id" : "ID",
                    "tenant_id" : "프로젝트 ID",
                    "status" : "상태",
                    "admin_state_up" : "관리자 상태",
                },
                "parseString":{
                    "admin_state_up":{
                        "type":"bool",
                        "replacement":["UP", "DOWN"]
                    },
                },
                "vertical" : true,
                "data" : router
            });
            dataTable.showDataTable();

            var externalGatewayDataTable = new DataTable({ // TODO: parseString, '.'있을때 해결해야함
                "selector" : "#external_gateway",
                "columns" : {
                    "network_name" : "네트워크 이름",
                    "network_id" : "ID",
                    "external_fixed_ips" : {
                        "name" : "외부 고정 IP",
                        "dataName" : { // TODO: 여기도 고쳐야함(dataTable)
                            "subnet_id" : "서브넷 ID",
                            "ip_address" : "IP 주소"
                        }
                    },
                    "external_fixed_ips.enable_snat": "SNAT"
                },
                "parseString":{
                    "external_fixed_ips.enable_snet":{
                        "type":"bool",
                        "replacement":["활성", "비활성"]
                    }
                },
                "vertical" : true,
                "data" : router.external_gateway_info
            });
            externalGatewayDataTable.showDataTable();
            initInterface(router);


// TODO: 라우터 모든기능 완성하면 삭제할것
//                for( key in data.router ){    // 데이터 넣기
//                    var resultHtml = "";
//                    if (key == "external_gateway_info") {
//                        continue;
//                    } else {
//                        resultHtml = data.router[key];
//                    }
//                    if( resultHtml == "" ){
//                        resultHtml = "None"
//                    }
//                    $("#"+key).html(resultHtml);
//                }
//    //            var external_gateway_info = JSON.parse(data.router.external_gateway_info);
//                var external_gateway_info = data.router.external_gateway_info;
//                for ( subKey in external_gateway_info ) {
//                    var resultHtml = "";
//                    if ( subKey == "enable_snat" ) {
//                        resultHtml = "<ul><li>" + external_gateway_info[subKey] + "</li></ul>";
//                    } else if ( subKey == "external_fixed_ips" ) {
//                        var external_fixed_ips = external_gateway_info.external_fixed_ips;
//                        resultHtml += "<ul>";
//                        for( var i = 0; i < external_fixed_ips.length; i++ ){
//                            resultHtml += "<li><strong>서브넷 ID</strong> <a href='/dashboard/admin/networks/subnets/" + external_fixed_ips[i]["subnet_id"] + "'>" + external_fixed_ips[i]["subnet_id"] + "</a></li><li><strong>IP 주소</strong> " + external_fixed_ips[i]["ip_address"] + "</li>";
//                        }
//                        resultHtml += "</ul>";
//                    } else if ( subKey == "network_id" ) {
//                        resultHtml = "<a href='/dashboard/admin/networks/" + external_gateway_info[subKey] + "'>" + external_gateway_info[subKey] + "</a>";
//                    } else {
//                        resultHtml = external_gateway_info[subKey];
//                    }
//                    $("#"+subKey).html(resultHtml);
//                }
//
//                getInterfaceList(id);
        }
    });
}

function getExternalNetwork() {
    U.ajax({
        progress:true,
        url:"metadata_create_router",
        success:function(jsonData) {
            if (jsonData.error) {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            if (jsonData.success) {
                var networks = jsonData.success.networks;
                var external_networks = {};
                if (isEmpty(networks)) {
                    external_networks[""] = "선택가능한 네트워크가 없습니다.";
                } else {
                    external_networks[""] = "네트워크 선택";
                    $.each(networks, function(idx, network) {
                        external_networks[network.id] = network.name;
                    });
                }
                U.addOption("#network_id", external_networks);
                modalUtil.setOption({
                    "selector":"#modal",
                    "title":"라우터 생성",
                    "body":"#modalRouterBody",
                    "footer":"#modalRouterFooter"
                });
                modalUtil.bindHtml();
                $("#areaExternal").show();
                $("#areaId").hide();
                $("#modal").modal();
                $("#routerSubmit").on("click", function() {
                    createRouter();
                });
            }
        }
    });
}

function createRouter() { createOrUpdateRouter(); }
function updateRouter(id) { createOrUpdateRouter(id); }
function createOrUpdateRouter(id) {
    var routerData = {
//        "tenant_id": $("#tenant_id").val(),                                         // body    string  (Optional)
//        "project_id": $("#project_id").val(),                                       // body    string  (Optional)
//        "description": $("#description").val(),                                     // body    string  (Optional)
//        "ha": $("#ha").val(),                                                       // body    boolean (Optional)
//        "availability_zone_hints": $("#availability_zone_hints").val(),             // body    array   (Optional)
        "name": $("#router_name").val(),                                            // body    string  (Optional) 수정에선 필수
        "admin_state_up": $("#admin_state_up").val(),                               // body    boolean (Optional) 수정에선 필수
//        "distributed": $("#distributed").val(),                                     // body    boolean (Optional)
//        "routes": ,                                     // body    array (Optional)
    };
    var network_id = $("#network_id").val();
    if (!isEmpty(network_id)) {
        routerData.external_gateway_info = {
            "network_id":network_id,
//        "enable_snat": $("#enable_snat").val(),                                     // body    boolean (Optional) 수정에선 필수
//        "external_fixed_ips": $("#external_fixed_ips").val(),                       // body    array   (Optional) 수정에선 필수
        }
        /*
        "external_fixed_ips": [
            {
                "ip_address": "172.24.4.6",
                "subnet_id": "b930d7f6-ceb7-40a0-8b81-a425dd994ccf"
            }
        ]
        */
    }
    var data = {};
    $.each(routerData, function(key, value) {
        if (isEmpty(value)) return 1;
        else if (key == "admin_state_up") data[key] = (value == "1");
        else data[key] = value;
    });
    var url = "create";
    var message = "라우터 생성 성공";
    if (id) {
        url = id + "/update";
        message = "라우터 수정 성공";
    }

    U.ajax({
        progress:true,
        url:url,
        data:{"data":JSON.stringify({"router":data})},
        success:function(jsonData) {
            if (jsonData.error) {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            if (jsonData.success) {
                var result = jsonData.success;
                var router_name = jsonData.success.router.name;
                var router_id = jsonData.success.router.id;
                U.lobiboxMessage(message, "info", (router_name) ? router_name:router_id);
            }
            $("#modal").modal("hide");
        }
    });
}

$(function() {
    $("#router_list").on("click", ".btnUpdate", function() { // 데이터 가져와서 채우기
        var id = $(this).parents("tr").data("id");
        U.ajax({
            "url" : id + "/detail",
            "success": function(result) {
                var router = result.success.router;
                modalUtil.setOption({
                    "selector":"#modal",
                    "title":"라우터 편집",
                    "body":"#modalRouterBody",
                    "footer":"#modalRouterFooter"
                });
                modalUtil.bindHtml();
                $("#areaExternal").hide();
                $("#areaId").show();
                $("#router_name").val(router.name);
                $("#admin_state_up").val(router.admin_state_up ? 1 : 0);
                $("#network_id").val("");
                $("#router_id").val(router.id);
                $("#modal").modal();
                $("#routerSubmit").on("click", function() {
                    updateRouter(router.id);
                });
            }
        });
    });
});

// delete
$(function() {
    $("#deleteSubmit").on("click", function() {
        var id = $("#modalDelete").data("id");
        var url = $("#modalDelete").data("url");
        U.ajax({
//            progress:true,
            url: url,
            success:function(jsonData) {
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
});

function initInterface(router) {
    var interfacesDataTable = new DataTable({
        "selector" : "#interface",
        "columns" : {
            "name" : "이름:link",
            "fixed_ips.ip_address" : "Fixed IP",
            "status" : "상태",
            "device_owner" : "유형",
            "admin_state_up" : "관리자 상태",
            "customHtml":"액션"
        },
        "parseString":{
            "device_owner":{
                "type":"string",
                "replacement":{
                    "network:router_gateway":"외부 게이트웨이",
                    "network:router_interface":"내부 인터페이스"
                }
            },
            "admin_state_up":{
                "type":"bool",
                "replacement":["UP", "DOWN"]
            },
        },
        "data" : router.interfaces,
        "customHtml":[
            {
                "tagName":"button",
                "class":"delete_interface btn-ok small",
                "text":"인터페이스 삭제"
            }
        ]
    });
    interfacesDataTable.showDataTable();
    interfacesDataTable.setLink("networks/ports");
    $("#createPort").off("click");
    $("#createPort").on("click", function() {
        modalUtil.setOption({
            "selector":"#modal",
            "title":"인터페이스 생성",
            "body":"#modalInterfaceBody",
            "footer":"#modalInterfaceFooter"
        });
        modalUtil.bindHtml();
        $("#device_name").val(router.id);
        $("#device_id").val(router.name);
        U.ajax({
            progress:true,
            url:"/dashboard/admin/networks/subnets/",
            success:function(jsonData) {
                if(jsonData.error) {
                    U.lobibox(jsonData.error.message, "error", jsonData.error.title);
                }
                var subnets = jsonData.success.subnets;
                var interface_subnets = {};
                if (isEmpty(subnets)) {
                    interface_subnets[""] = "선택가능한 서브넷이 없습니다.";
                } else {
                    interface_subnets[""] = "서브넷 선택";
                    $.each(subnets, function(idx, subnet) {
                        interface_subnets[subnet.id] = subnet.name;
                    });
                }
                U.addOption("#subnet_id", interface_subnets);
                $("#modal").modal();
                $("#interfaceSubmit").on("click", function() {
                    createInterface();
                });
            }
        });
    });

    $(".delete_interface").on("click", function() {
        var interface_name = $(this).parents("tr").children("td.name").text();
        var interface_id = $(this).parents("tr").data("id");
        $("#modalDelete .modal-body").text(interface_name + "(" + interface_id + ")를 삭제하시겠습니까?");
        $("#modalDelete").data("id", interface_id);
        $("#modalDelete").data("url", "/dashboard/admin/networks/ports/" + interface_id + "/delete").modal();
    });
}

function createInterface() {
    var subnet_id = $("#subnet_id").val();
    if (isEmpty(subnet_id)) {
        U.lobiboxMessage("서브넷은 반드시 선택해야합니다.", "info", "정보");
        return;
    }
    var portData = {
        "device_id": $("#selectRouterId").val(),
        "fixed_ips": [{"subnet_id":$("#subnet_id").val()}],
        "device_owner":"network:router_interface"
    };
    var ip_address = $("#ip_address").val();
    if (!isEmpty(ip_address)) {
        portData.fixed_ips[0]["ip_address"] = ip_address;
    }
    var data = {};
    $.each(portData, function(key, value) {
        if (isEmpty(value)) return 1;
        else if (key == "admin_state_up") data[key] = (value == "1");
        else data[key] = value;
    });
    var url = "/dashboard/admin/networks/ports/create";
    var message = "인터페이스 생성 성공";

    U.ajax({
        progress:true,
        url:url,
        data:{"data":JSON.stringify({"port":data})},
        success:function(jsonData) {
            if (jsonData.error) {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            if (jsonData.success) {
                var result = jsonData.success;
                var port_name = jsonData.success.port.name;
                var port_id = jsonData.success.port.id;
                U.lobiboxMessage(message, "info", (port_name) ? port_name:port_id);
            }
            $("#modal").modal("hide");
        }
    });
}

//
//function getInterfaceList(id){
//    U.ajax({
//        url : '/dashboard/admin/routers/interface/',
//        data : { id : id },
//        success:function(data){
//            data = data.success;
//            var dataTable = new DataTable({
//                "selector" : "#interface",
//                "columns" : {
//                    "id" : "이름:link",
//                    "fixed_ips.ip_address" : "Fixed IP",
//                    "status" : "Status",
//                    "device_owner" : "유형",
//                    "admin_state_up" : "관리자 상태",
//                },
//                "parseString":{
//                    "admin_state_up":{
//                        "type":"bool",
//                        "replacement":["UP", "DOWN"]
//                    },
//                },
//                "data" : data.interface
//            });
//            dataTable.showDataTable();
//            dataTable.setLink("networks/ports");
//        }
//    });
//}


//function getStaticPath(){
//    var dataTable = new DataTable({
//        "selector" : " #static_path",
//        "columns" : {
//            "routes" : "대상 CIDR",
//            "routes.next_hop" : "다음 Hop",
//        },
//        "data" : router.data
//    });
//    dataTable.showDataTable();
//}

