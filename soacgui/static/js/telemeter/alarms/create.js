function initCreateAlarm() {
    var selectBox = "";
	for (var i = 0; i < meter_names.length; i++) {
		selectBox += "<option value='"+meter_names[i]+"'>"+meter_names[i]+"</option>";
	}
	$("#meter_name").append(selectBox);
    initCreateAlarmEvent();
}

function initCreateAlarmEvent() {
	$("#meter_name").on("change", function() {
	    if (meter_names.indexOf($(this).val()) < 27) {
            refreshSelectTag("#resource_id", instanceList);

	        if (meter_names.indexOf($(this).val()) < 19) {
                $("#network_interface_id").hide();
	        } else {
                $("#resource_id").trigger("change");
                $("#network_interface_id").show();
	        }

	    } else {
	        $("#network_interface_id").hide();
	        refreshSelectTag("#resource_id", imageList);
	    }
	});
	$("#resource_id").on("change", function() {
	    $.each(instanceList, function(i, instance) {
	        if (instance.id == $("#resource_id").val()) {
	            refreshSelectTag("#network_interface_id", instance.networkInterfaceList);
	            return false; // break
	        }
	    });
	});
	$("#selectThreshold").on("click", function() {
	    var resource_id = $("#resource_id").val();
	    var meter_name = $("#meter_name").val();
	    if (meter_names.indexOf(meter_name) > 19 && meter_names.indexOf(meter_name) < 27) {
            resource_id = $("#network_interface_id").val();
	    }
	    showChartModalForAlarm(resource_id, meter_name);
	});
    $("#meter_name").trigger("change");
}

function refreshSelectTag(tagId, resourceList) { // selectTag option setting
    $(tagId).html("");
    $.each(resourceList, function(i, resource) {
        var resource_obj = {
            value:resource.id,
            text:resource.name
        };
        if (isEmpty(resource.name)) {
            resource_obj["text"] = resource.id;
        }
        $(tagId).append($("<option>", resource_obj));
    });
}

function createAlarm() {
    var resource_value;
    if (meter_names.indexOf($("#meter_name").val()) < 19) {
        resource_value = $("#resource_id").val();
    } else if (meter_names.indexOf($("#meter_name").val()) < 27) {
        resource_value = $("#network_interface_id").val();
    } else {
        resource_value = $("#resource_id").val();
    }

//http://192.168.10.83:8080/resource/alarmOccur, http://192.168.10.6:8080/dashboard/telemeter/alarms/accept
	var data = {
        'name' : $("#alarm_name").val(), // 알람 이름
        'alarm_actions': $("#alarm_actions").val().replaceAll(" ", "").split(","),
	    'insufficient_data_actions': [$("#insufficient_data_actions").val()],
	    'ok_actions': $("#ok_actions").val().replaceAll(" ", "").split(","),
        'threshold_rule': {
            'meter_name' : $("#meter_name").val(), // 관찰대상
            'query' : [
                {
                    'field': 'resource_id',
                    'op'   : 'eq',
                    'type' : "string",
                    'value': resource_value
                 }
            ],
            'evaluation_periods' : parseInt($("#evaluation_periods").val()), // 관찰간격
            'period' : parseInt($("#period").val()), // 관찰간격
            'statistic' : $("#statistic").val(), // 관찰대상: 평균, 최소, 최대
            'threshold' : parseInt($("#threshold").val()), // 임계값
            'comparison_operator' : $("#comparison_operator").val() // 임계값: 초과, 미만, 이상, 이하, 같음, 같지않음
        },
//        'exclude_outliers': false,
//		'user_id' : "", // Template 에서 {{ request.session. }}
//		'project_id' : "",
//      'state_timestamp': u'2013-05-09T13:41:23.085000',
      'repeat_actions': true,
//        'severity': 'low',
//        'time_constraints': [
//            {
//                'name': 'cons1',
//                'description': 'desc1',
//                'start': '0 11 * * *',
//                'duration': 300,
//                'timezone': ''},
//        ],
//        'timestamp': '2013-05-09T13:41:23.085000',
//        'enabled': True,
//        'state': 'ok',
        'type' : 'threshold',
        'description':$("#description").val(),
	};
	for(var key in data) {
	    if (data[key] == "") delete data[key];
	}

//	for(var i = 0; i < $(".selectValue").length; i++) {
//		if($(".selectValue")[i].value != "" && $(".selectValue")[i].value != null) {
//			data[$(".selectValue")[i].id] = $(".selectValue")[i].value;
//		}
//	}

	if($("#alarm_name").val() == "") {
		U.msg("알람 이름을 입력하세요.");
	} else if ($("#threshold").val() == "") {
		U.msg("임계값을 입력하세요.");
	} else if ($("#evaluation_periods").val() == "") {
		U.msg("관찰간격을 입력하세요.");
	} else {
	    console.log(data);
		U.ajax({
			url : "/dashboard/telemeter/alarms/create",
			data: {"data":JSON.stringify(data)},
			success:function(result) {
				location.reload();
			},
			error: function(request, status, error) {
			    if (error) {
			        U.lobibox(error.error_message.faultstring, "error", "알람 생성 실패");
			    } else {
			        U.lobibox(request.error.error_message.faultstring, "error", "알람 생성 실패");
			    }
			}
		});
	}
}