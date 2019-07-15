$(document).ready(function(){
//	var tabList = ["alarm_info", "alarm_history"];
//	$("." + tabList[0]).on("click", function(){tabClick(0, tabList)});
//	$("#" + tabList[1]).hide();
//	$("." + tabList[1]).on("click", function(){
//		tabClick(1, tabList);
//		detailAlarmView($("#alarmId").text());
//	});
//	var selectBox = "";
//	for (var i = 0; i < meter_names.length; i++) {
//		selectBox += "<option value='" + meter_names[i] + "'>" + meter_names[i] + "</option>";
//	}
//	$("#meter_name").append(selectBox);
//	$("#update_meter_name").append(selectBox);
	$("#updateAlarm").click(function() {
        PopupUtil({
            title: "알람 수정",
            url: "/dashboard/telemeter/alarms/" + $("#alarmId").html() + "/update",
            success: function(result) {
                $("#meter_name").change();
            }
        });
	});
	replaceAllDateTimeFormatFromTD();
//	$(".modal-container").css("margin-top", "50px");
});

function detailAlarmView(alarmId) {
	U.ajax({
		url : "/dashboard/telemeter/alarms/" + alarmId + "/history",
		success:function(result) {
			data = result.success;
			var html = "<tr><th class='ind_th01'>알람ID</th><th class='ind_th01'>타입1</th><th class='ind_th01'>타입2</th>"
					+ "<th class='ind_th01'>기록시간</th><th class='ind_th01'>상세</th></tr>";
			for (var i = 0; i < data.length; i++) {
				html += "<tr><td class='ind_td01'>"+data[i].data.alarm_id+"</td><td class='ind_td01'>"+data[i].title+"</td>"
					+ "<td class='ind_td01'>"+data[i].data.type+"</td><td class='ind_td01'>"+data[i].data.timestamp+"</td>"
					+ "<td class='ind_td01'>"+data[i].data.detail+"</td></tr>";
			}
			$("#historyAlarm").html(html);
//			alarmHistory(data1);
		}
	});
}

function alarmHistory(data) {
	data = data.data;
	var dataTable = new DataTable({
		"selector" : "#historyAlarm",
		"columns"  : {
			"" : "알람ID",
			"" : "타입1",
			"" : "타입2",
			"" : "기록시간",
			"" : "상세",
		},
		"data" : data,
	});
	dataTable.showDataTable();
}

function updateAlarm() {
    var resource_value;
    if (meter_names.indexOf($("#meter_name").val()) < 19) {
        resource_value = $("#resource_id").val();
    } else if (meter_names.indexOf($("#meter_name").val()) < 27) {
        resource_value = $("#network_interface_id").val();
    } else {
        resource_value = $("#resource_id").val();
    }
	var data = {
        'name' : $("#alarm_name").val(), // 알람 이름
        'alarm_actions': $("#alarm_actions").val().replaceAll(" ", "").split(","),
	    'ok_actions': $("#ok_actions").val().replaceAll(" ", "").split(","),
        'threshold_rule': {
            'meter_name' : $("#meter_name").data("selected"), // 관찰대상
            'query': [{
                'field': 'resource_id',
                'type': 'string',
                'value': resource_value,
                'op': 'eq'
            }],
            'evaluation_periods' : parseInt($("#evaluation_periods").val()), // 관찰간격
            'period' : parseInt($("#period").val()), // 관찰간격
            'statistic' : $("#statistic").val(), // 관찰대상: 평균, 최소, 최대
            'threshold' : parseInt($("#threshold").val()), // 임계값
            'exclude_outliers': false,
            'comparison_operator' : $("#comparison_operator").val() // 임계값: 초과, 미만, 이상, 이하, 같음, 같지않음
        },
        'description':$("#description").val(),
        'repeat_actions': true,
        'enabled': true,
        'type': 'threshold',
        'severity': 'low'
	};
	var a = {
        'threshold_rule': {
        },
    }
	if($("#alarm_name").val() == "") {
		U.msg("알람 이름을 입력하세요.");
	} else if ($("#threshold").val() == "") {
		U.msg("임계값을 입력하세요.");
	} else if ($("#evaluation_periods").val() == "") {
		U.msg("관촬간격을 입력하세요.");
	} else {
	    console.log(data);
		U.ajax({
			url : "/dashboard/telemeter/alarms/" + $("#alarm_id").val() + "/update",
			data: {"data":JSON.stringify(data)},
			success:function(result) {
				location.reload();
			}
		});
	}
}

function deleteAlarm() {
	U.alert({
		title : "삭제",
		message : "삭제하시겠습니까?",
		result : function(result) {
			if(result) {
				U.ajax({
					url : "/dashboard/telemeter/alarms/"+$("#alarmId").html()+"/delete",
					success:function(result) {
					    U.lobiboxMessage(result);
					}
				});
			}
		}
	});
}