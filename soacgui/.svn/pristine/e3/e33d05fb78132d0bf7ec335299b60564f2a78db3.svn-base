var router;

function getInterfaceList(id){
    var interface;
    U.ajax({
        url : '/dashboard/admin/routers/interface/',
        data : { id : id },
        success:function(data){
            data = data.success;
            var dataTable = new DataTable({
                "selector" : "#interface",
                "columns" : {
                    "id" : "이름:link",
                    "fixed_ips.ip_address" : "Fixed IP",
                    "status" : "Status",
                    "device_owner" : "유형",
                    "admin_state_up" : "관리자 상태",
                },
                "data" : data.interface
            });
            dataTable.showDataTable();
            dataTable.setLink("networks/ports");
        }
    });
}

function getRouterAjax(id){
    U.ajax({
        url : '',
        data : { id : id },
        success:function(data){
            data = data.success;
            router = data.router

            $(".header_title_d01").html(data.router.name); // header 셋팅
            for( key in data.router ){    // 데이터 넣기
                var resultHtml = "";
                if (key == "external_gateway_info") {
                    continue;
                } else {
                    resultHtml = data.router[key];
                }
                if( resultHtml == "" ){
                    resultHtml = "None"
                }
                $("#"+key).html(resultHtml);
            }
//            var external_gateway_info = JSON.parse(data.router.external_gateway_info);
            var external_gateway_info = data.router.external_gateway_info;
            for ( subKey in external_gateway_info ) {
                var resultHtml = "";
                if ( subKey == "enable_snat" ) {
                    resultHtml = "<ul><li>" + external_gateway_info[subKey] + "</li></ul>";
                } else if ( subKey == "external_fixed_ips" ) {
                    var external_fixed_ips = external_gateway_info.external_fixed_ips;
                    resultHtml += "<ul>";
                    for( var i = 0; i < external_fixed_ips.length; i++ ){
                        resultHtml += "<li><strong>서브넷 ID</strong> <a href='/dashboard/admin/networks/subnets/" + external_fixed_ips[i]["subnet_id"] + "'>" + external_fixed_ips[i]["subnet_id"] + "</a></li><li><strong>IP 주소</strong> " + external_fixed_ips[i]["ip_address"] + "</li>";
                    }
                    resultHtml += "</ul>";
                } else if ( subKey == "network_id" ) {
                    resultHtml = "<a href='/dashboard/admin/networks/" + external_gateway_info[subKey] + "'>" + external_gateway_info[subKey] + "</a>";
                } else {
                    resultHtml = external_gateway_info[subKey];
                }
                $("#"+subKey).html(resultHtml);
            }

            getInterfaceList(id);
        }
    });
}


function getStaticPath(){
    var dataTable = new DataTable({
        "selector" : " #static_path",
        "columns" : {
            "routes" : "대상 CIDR",
            "routes.next_hop" : "다음 Hop",
        },
        "data" : router.data
    });
    dataTable.showDataTable();
}

$(function(){
//탭 클릭시 이벤트들
    $("#interface").hide();
    $("#static_path").hide();

    var tabList = ["summary", "interface", "static_path"];

    $(".summary").on("click", function(){tabClick(0, tabList)});
    $(".interface").on("click", function(){tabClick(1, tabList)});
    $(".static_path").on("click", function(){tabClick(2, tabList)});
});