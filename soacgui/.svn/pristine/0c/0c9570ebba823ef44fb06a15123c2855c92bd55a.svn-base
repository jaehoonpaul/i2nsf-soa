var instanceList = [];
var imageList = [];
$(document).ready(function(){
	replaceAllDateTimeFormatFromTD();
	$("table tbody").show();
	getResourceList();
	initAlarmsActionGroup();
});

function initAlarmsActionGroup() {
    var actionGroup = new ActionGroup({
		"selector":"#alarmDiv",
		"clickEvent":function() {
		},
	});
	$(".update").on("click", function() {
        var alarm_id = $(this).parents("tr").data("id");
        PopupUtil({
            title: "알람 수정",
            url: "/dashboard/telemeter/alarms/" + alarm_id + "/update",
            success: function(result) {
                $("#meter_name").change();
            }
        });
	});
	actionGroup.setCloseEvent();
	actionGroup.run();
	$(".delete").on("click", function() {
		var alarm_name = $(this).parents("tr").data("id");
		U.confirm({
			title:"삭제",
			message:alarm_name + "를 삭제하시겠습니까?",
			func:function() {
				var url = "/dashboard/telemeter/alarms/" + alarm_name + "/delete";
				U.ajax({
		            progress:true,
					url: url,
					success:function(jsonData) {
						if (jsonData.error) {
							U.lobibox(jsonData.error.message, "error", "삭제 실패: " + jsonData.error.title);
						}
						if (jsonData.success) {
							U.lobiboxMessage(alarm_name + "를 삭제했습니다.", "info", "삭제 성공");
							location.reload();
						}
					}
				});
			}
		});
	});
}

function getResourceList() { // 모든 자원들을 미리 받아놓음
    U.ajax({
        url:"/dashboard/telemeter/alarms/resources",
        success: function(result) {
            if (result.success) {
                if (result.success.servers) {
                    $("#selectInstanceList").children().each(function(i, v) {
                        $.each(result.success.servers, function(s_i, s_v) {
                            if ($(v).val() == s_v.id) {
                                instanceList.push(s_v);
                            }
                        });
                    });
                }
                if (result.success.images) {
                    imageList = result.success.images;
                }
            }
        },
        error: function(result) {
            if (!isEmpty(result.error.err_msg_list)) {
                $.each(result.error.err_msg_list, function(i, v) {
                    U.lobibox(v.message, "error", v.title);
                });
            }
        }
    });
//    U.ajax({
//        url:"/dashboard/admin/instances/get_server",
//        success:function(result) {
//
//            $.each(result.success.instanceList, function(i, instance) {
//                instance.networkInterfaceList = [];
//
//                U.ajax({
//                    url:"/dashboard/telemeter/network_list/" + instance.id,
//                    success:function(result) {
//                        var networkInterfaceList = result.success.network_interfaces;
//
//                        $.each(networkInterfaceList, function(j, networkInterface) {
//                            var name = networkInterface.replace(/.*(tap[\w-]+)/g, "$1");
//                            instance.networkInterfaceList.push({'name':name, 'id':networkInterface});
//                        });
//
//                        instanceList.push(instance);
//
//                        if (i == instanceList.length - 1) $("#meter_name").trigger("change"); // 로딩 완료되었을때 resource select tag 셋팅
//                    }
//                });
//
//            });
//
//        }
//    });
//
//    U.ajax({
//        url:"/dashboard/admin/images/",
//        success:function(result) {
//            imageList = result.success.imageList;
//        }
//    });
}