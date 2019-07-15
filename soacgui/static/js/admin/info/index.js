var service;
function getServiceAjax(){
        getNovaServiceList();
        getBlockStorageServiceList();
        getNetworkAgent();
}

function getNovaServiceList(){
    U.ajax({
        url : 'nova_service',
        success:function(data){
            data = data.success;
            var dataTable = new DataTable({
                "selector" : "#nova_service",
                "columns" : {
                    "binary" : "이름",
                    "host" : "호스트",
                    "zone" : "Zone",
                    "status" : "Status",
                    "state" : "State",
                    "updated_at" : "마지막 업데이트 됨",
                },
                "data" : data.novaServiceList
            });
            dataTable.showDataTable();
        }
    });
}

function getBlockStorageServiceList(){
    U.ajax({
        url : 'block_storage_service',
        success:function(data){
            data = data.success;
            var dataTable = new DataTable({
                "selector" : "#block_storage_service",
                "columns" : {
                    "binary" : "이름",
                    "host" : "호스트",
                    "zone" : "Zone",
                    "status" : "Status",
                    "state" : "State",
                    "updated_at" : "마지막 업데이트 됨",
                },
                "data" : data.blockStorageServiceList
            });
            dataTable.showDataTable();
        }
    });
}

function getNetworkAgent() {
    U.ajax({
        url : 'agent',
        success:function(data){
            data = data.success;
            var dataTable = new DataTable({
                "selector" : "#agent",
                "columns" : {
                    "agent_type" : "유형",
                    "binary" : "이름",
                    "host" : "호스트",
                    "alive" : "Status",
                    "admin_state_up" : "State",
                    "Type" : "마지막 업데이트 됨",
                },
                "data" : data.agentList
            });
            dataTable.showDataTable();
        }
    });
}


$(function(){
//탭 클릭시 이벤트들

    var tabList = ["service_info", "nova_service", "block_storage_service", "agent"];

    $("." + tabList[0]).on("click", function(){tabClick(0, tabList)});

    $("#" + tabList[1]).hide();
    $("." + tabList[1]).on("click", function(){tabClick(1, tabList)});

    $("#" + tabList[2]).hide();
    $("." + tabList[2]).on("click", function(){tabClick(2, tabList)});

    $("#" + tabList[3]).hide();
    $("." + tabList[3]).on("click", function(){tabClick(3, tabList)});
});