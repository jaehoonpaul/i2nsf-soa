var data;
var memory =[];
var statistics = new Statistics();
var networkData=[];
var networkMeterName = ['network.incoming.bytes','network.outgoing.bytes','network.incoming.packets','network.outgoing.packets','network.incoming.bytes.rate','network.outgoing.bytes.rate','network.incoming.packets.rate','network.outgoing.packets.rate',]


$("#alarmList").loadPage({url: "/dashboard/telemeter/alarms"});

function showAlarmDetail(alarm_id) {
    $("#modal .modal-title").text("알람 상세정보");
    U.appendProgress("#modal .modal-body");
    $("#modal .modal-body").loadPage({url: "/dashboard/telemeter/alarms/" + alarm_id + "/detail"});

    $("#modal").modal();
}

function getInstanceIdList() {
    var instanceList = nodes.filter(function(node) {
        return node.resource_type == "VM";
    });
    return instanceList;
}

function nodesLoadComplete() {
	instanceList = getInstanceIdList();
	selectNode(instanceList[0].data.vm_id);
};

//var alarmHistory;
function getAlarmHistoryList(id){
	var selectBox = "";
	U.ajax({
		url : "/dashboard/telemeter/alarms/" + id + "/instance_history",
		success : function(data){
			alarmHistory = data.success.history;
			if (isEmpty(alarmHistory)) return;
			keys = Object.keys(alarmHistory);
//			for (var key in alarmHistory) {
//				selectBox = "<option value='" + key + "'>" + key + "</option>";
//				$("#alarmList").append(selectBox);
//			}
//			createAlarmList(alarmHistory[keys[0]]);
		}
	});
}

function getInstanceInfo(vm_id, elem) {
    var selectBox="";
//	$(".network").remove();
//    getAlarmList(vm_id);
    getNetworkData(vm_id);
}
function getNetworkData(vm_id) {
	U.ajax({
        url : '/dashboard/telemeter/network_list/' + vm_id,
        success : function(data) {
			var network_interfaces = data.success.network_interfaces;
			$("#networkList").html("");
			$.each(network_interfaces, function(idx, network_interface) {
			    var data = {}
			    data[network_interface] = network_interface.replace(/[\w\d-]+(tap[\w\d-]+)/, "$1");
			    U.addOption("#networkList", data);
			});
            var meter_group = $("#resourceMonitoring .click").data("meter_group");
            if (meter_group == "network") {
			    $("#networkList").trigger("change");
            }
//			for (var i = 0 ; i < network_interfaces.length; i++) {
//			    for (var j = 0; j < 8; j++) {
//                    html += "<div id='network"+cnt+"' class='network simpleChart' data-meter_name='"+networkMeterName[j]+"'></div>";
//                    cnt ++;
//				}
//                $("#monitoringDiv").append(html);
//                $.each(networkData[network_interfaces[i]], setChartData);
//			}
		}
	});
}

function setChartData(key, value) {
	var chartData = [];
	var dateUtil = new DateUtil();
	var period_Angle = "1";
	for (var i = 0; i < value.length; i++) {
		dateUtil.setCustomDate(value[i].period_end);
		dateUtil.setGmtToKor();
		var formatDate = dateUtil.getFormatDate("yyyy-MM-ddTHH:mm:ss");
		if (key == 'cpu') {
			value[i].avg = value[i].avg / 10000000000; // TODO : 단위환산
		}
		if (key == 'cpu.delta') {
		    value[i].avg = value[i].avg / 10000000000;
		}
		if (value[i].period == '3600') {
			formatDate = formatDate.substr(11, 5);
			period_Angle = "0";
		} else {
			formatDate = formatDate.substr(5, 11).replace("T", " ");
		}
		chartData.push({"avg" : value[i].avg, "period_end" : formatDate});
	}
	drawChart(key, chartData, key, period_Angle);//TODO: chartData.length가 0이면 데이터 없다는 예외처리 해줄것
}

function getNetwork(vm_id){
	$.each(networkData[vm_id], setChartData);
}

function showChartModal(meter_name) {
	//var resource_id = $(".ind_td01")[1].innerText;
	var resource_id = $("#selectInstanceList option:selected").val();

	if (meter_name.indexOf("network") != -1) {
		resource_id = $("#networkList option:selected").val();
	}

	$("#chartDate").val(0); // select 초기화
	$("#datePicker").hide();
	drawChart("detailChart", "", meter_name, "");
	statistics.getStatisticsDetailById(resource_id, meter_name, $("#chartDate").val());
	$("#topModal .modal-title").text(meter_name); // modal title set
   	$('#topModal').modal('toggle'); // modal show
}

function getService(jsonData) {
    jsonData = jsonData.success;
    $("#service_name").text(jsonData.service_id);
    var server_list = jsonData.vm_list;
    var serverListHtml = '';

    $.each(server_list, function(idx, server) {
        serverListHtml += "<option value='"+server.vm_id+"'>"+server.vm_name+"</option>";
    });
    $("#selectInstanceList").append(serverListHtml);
    $("#selectInstanceList option:last").attr("selected","selected");
//    getInstanceInfo($("#selectInstanceList").val(),null);
}

function getServiceAjax() { // token, tenant_name, user_name, service_id
    var urlStr = $(location).attr('pathname');
    var match = new RegExp("/dashboard/telemeter/([\\w-]+)/.+").exec(urlStr);
    var service_id = match[1];
    U.ajax({
        progress:true,
        url : "/dashboard/service/" +service_id + "/get_servers",
        success:function(jsonData) {
            getService(jsonData);
            $("#selectInstanceList").trigger("change");
        }
        // end success
    });
}

function getStatisticsRefresh() {
    var meter_group = $("#resourceMonitoring .click").data("meter_group");
    var resource_id;
    if (meter_group == "network") {
        resource_id = $("#networkList").val();
    } else {
        resource_id = $("#selectInstanceList").val();
    }
    if (isEmpty(meter_group) || isEmpty(resource_id)) {return;}
    var dateUtil = new DateUtil();
    dateUtil.getYesterdayDate();
    dateUtil.setKorToGmt();
    var meter_names = {
        "memory":[
            "memory",
            "memory.resident",
        ],
        "cpu":[
            "cpu",
            "cpu.delta",
            "cpu_util",
            "vcpus",
        ],
        "disk":[
            "disk.read.requests",
            "disk.write.requests",
            "disk.read.bytes",
            "disk.write.bytes",
            "disk.read.requests.rate",
            "disk.write.requests.rate",
            "disk.read.bytes.rate",
            "disk.write.bytes.rate",
            "disk.root.size",
            "disk.ephemeral.size",
            "disk.capacity",
            "disk.allocation",
            "disk.usage",
        ],
        "network":[
            "network.incoming.bytes",
            "network.outgoing.bytes",
            "network.incoming.packets",
            "network.outgoing.packets",
            "network.incoming.bytes.rate",
            "network.outgoing.bytes.rate",
            "network.incoming.packets.rate",
            "network.outgoing.packets.rate"
        ],
    };
    var query = [ {
        "field" : "resource",
        "op" 	: "eq",
        "value" : resource_id
    }, {
        "field" : "timestamp",
        "op" 	: "gt",
        "value" : dateUtil.getFormatDate("yyyy-MM-ddTHH:mm:ss")
    } ];
    var data = statistics.createData(query, 3600);
    $.each(meter_name[meter_group], function(key, meter_name) {
        var divName = ".simpleChart[data-meter_name=" + meter_name.replace(/\./gi, "\\.") + "]";
        var progressHtml = '';
        progressHtml += '<div class="sk-fading-circle">';
        progressHtml += '    <div class="sk-circle1 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle2 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle3 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle4 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle5 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle6 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle7 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle8 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle9 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle10 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle11 sk-circle"></div>';
        progressHtml += '    <div class="sk-circle12 sk-circle"></div>';
        progressHtml += '</div>';
        $(divName).html(progressHtml);
        statistics.getStatistics(meter_name, data, divName);
    });
}

$(function() {
    $(".refresh_monitoring").on("click", function() {
        $("#selectInstanceList").trigger("change");
    });
    TabUtil({
        "selector":"#resourceMonitoring",
        "afterEveryAct":function() {
            getStatisticsRefresh();
        }
    }).run();

    getServiceAjax();
    var a = $("#selectInstanceList option:last").val();

    $("#selectInstanceList").val(a);
    $("#selectInstanceList").change(function(){
        U.showProgress();
        var server_id = $(this).val();
        getInstanceInfo(server_id, null);
        var meter_group = $("#resourceMonitoring .click").data("meter_group");
        if (meter_group != "network") {
            getStatisticsRefresh();
        }
////        $("#monitoringDiv .simpleChart").html(progressHtml);
//        U.appendProgress("#monitoringDiv .simpleChart");
////        $.each(statistics.meter_names, function(idx, metername) {
////            statistics.getStatistics
////        });
//        statistics.getOneDayStatisticsListById(server_id, ".simpleChart", function(jsonData) {
//            networkData = jsonData.success.network;
//            delete jsonData.success.network;
//            $.each(jsonData.success, setChartData);
//        });
    });

	$(window).resize(function() {
		var maxWidth = window.innerWidth - 400 - 227;
		$(".right_d01").css('width', maxWidth - 50);
	});
	var checkOut;
	var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
	var checkIn = $("#start_date").datepicker({
			onRender : function(date) {
				return date.valueOf() > now.valueOf() ? 'disabled' : '';
			}
		}).on('changeDate', function(ev) {
			var newDate = new Date(ev.date);
			newDate.setDate(newDate.getDate() + 1);
			checkOut.setValue(newDate);
			checkIn.hide();
			$("#end_date")[0].focus();
		}).data('datepicker');

	var checkOut = $("#end_date").datepicker({
			onRender : function(date) {
				return date.valueOf() <= checkIn.date.valueOf() ? 'disabled' : '', date.valueOf() > now.valueOf() ? 'disabled' : '';
			}
		}).on('changeDate', function(ev) {
			checkOut.hide();
		}).data('datepicker');

	$("#monitoringDiv").show();

	$(".tab_title").click(function() {
		var divText = $(this)[0].id.split('Tab');
		var divName = divText[0] + "Div";
		var tabName = divText[0] + "Tab";
		$("#"+divName).show();
		$(".tab_title_click").attr('class', 'tab_title');
		$("#"+tabName).attr('class', 'tab_title_click');

	/*	if($(this)[0].id == 'networkTab'){
			getNetwork($("#networkList option:selected").val());
		}*/
	});

	$(".simpleChart").on("click", function() {
		showChartModal(this.dataset.meter_name);
	});

	$("#dateBtn").on("click", function() {
		//var resource_id = $(".ind_td01")[1].innerText;
		var resource_id = $("#selectInstanceList option:selected").val();

		if($("#topModal .modal-title").text().indexOf("network") != -1) {
			resource_id = $("#networkList option:selected").val();
		}
		if ($("#end_date").val() == "") {
			statistics.getStatisticsEtcById(resource_id, $("#topModal .modal-title").text(), $("#start_date").val());
		} else {
			statistics.getStatisticsEtcById(resource_id, $("#topModal .modal-title").text(), $("#start_date").val(), $("#end_date").val());
		}
	});

	$("#chartDate").on("change", function() {
		// var resource_id = $(".ind_td01")[1].innerText;
		var resource_id = $("#selectInstanceList option:selected").val();
		$("#start_date").val("");
		$("#end_date").val("");

		if ($(this).val() == '6') {
			$("#datePicker").attr('style', 'visibility:visible');
			$("#detailChart").empty();
		} else {
			if($("#topModal .modal-title").text().indexOf("network") != -1) {
				resource_id = $("#networkList option:selected").val();
			}
			$("#datePicker").attr('style', 'visibility:hidden');

			statistics.getStatisticsDetailById(resource_id, $("#topModal .modal-title").text(), $(this).val());
		}
	});
	$("#networkList").on("change", function() {
//		getNetwork($("#networkList option:selected").val());
        getStatisticsRefresh();
	});
//	$("#alarmList").on("change", function() {
//		data = alarmHistory[$(this).val()];
////		createAlarmList(data);
//
//	});
});

//function createAlarmList(data) {
//	var html = "<tr><th class='ind_th01'>알람ID</th><th class='ind_th01'>타입1</th><th class='ind_th01'>타입2</th>"
//				+ "<th class='ind_th01'>기록시간</th><th class='ind_th01'>상세</th></tr>";
//	for (var i = 0; i < data.length; i++) {
//		html += "<tr><td class='ind_td01'>"+data[i].data.alarm_id+"</td><td class='ind_td01'>"+data[i].title+"</td>"
//			+ "<td class='ind_td01'>"+data[i].data.type+"</td><td class='ind_td01'>"+data[i].data.timestamp+"</td>"
//			+ "<td class='ind_td01'>"+data[i].data.detail+"</td></tr>";
//	}
//	$("#alarmTbl").html(html);
//}

function createData(query, period, groupby, aggregates) {
    var data = {};
    data.query = query;
    if (arguments.length >= 2) {
        data.period = period;
    }
    if (arguments.length >= 3) {
        data.groupby = groupby;
    }
    if (arguments.length >= 4) {
        data.aggregates = aggregates;
    }
    return data;
}

addGuides = function( e ) {
    // Add click event on the plot area
    e.chart.chartDiv.addEventListener( "click", function() {
        // we track cursor's last known position by "changed" event
        if ( e.chart.lastCursorPosition !== undefined ) {
            var value = parseFloat($(".amcharts-balloon-div-v1").text().replace(/\,/g,""));
            var valueAxes = e.chart.valueAxes[0];
            var guides = valueAxes.guides;
            var alarmType = "critical"; // TODO: 라디오로받아서
            var alarmGuide = guides.filter(function(guide) { return guide.type == alarmType; });

            if ( alarmGuide.length === 0 ) {
                var guide = new AmCharts.Guide();
//                guide.value = guide.label = value;
                guide.value = value;
                guide.label = alarmType + ":" + value;
                guide.lineAlpha = 0.2;
                guide.lineThickness = 2;
                e.chart.valueAxes[0].addGuide( guide );
                guide.type = alarmType;
                var color = "#00cc00"; // infoColor

                if ( alarmType == "warnning" ) {
                    color = "#cc9900";
                } else if ( alarmType == "danger" ) {
                    color = "#cc5500";
                } else if ( alarmType == "critical" ) {
                    color = "#cc0000";
                }
                guide.lineColor = guide.color = color;
            } else {
                e.chart.valueAxes[0].guides[0].value = value;
                e.chart.valueAxes[0].guides[0].label = alarmType + ":" + value;
            }
            e.chart.validateData();
        }
    });
};

function drawChart(divName, chartData, meter_name, period_Angle) {
	var xRange = chartData.length / 4;
	var xAngle = 0;
	var chart = {
	    "fontFamily":"Noto Sans KR",
        "type"			   : "serial",
        "theme" 		   : "light",
        "autoMarginOffset" : 20,
        "marginLeft"	   : 50,
        "dataDateFormat"   : "YYYY-MM-DD",
        "valueAxes" : [{
            "id" : "v1",
            "axisAlpha" : 0,
            "position" : "left",
            "ignoreAxisWidth" :true,
            "fontSize" : 8
        }],
        "balloon" : {
            "borderThickness" : 1,
            "shadowAlpha" : 0
        },
        "graphs": [{
            "id" : "g1",
            "balloon" : {
              "drop" : false,
              "adjustBorderColor" : false,
              "color" : "#ffffff"
            },
//            "bullet" : "round",
//            "bulletBorderAlpha" : 1,
//            "bulletColor" : "#FFFFFF",
//            "bulletSize" : 5,
            "hideBulletsCount" : 50,
            "lineThickness" : 2,
            "title" : "red line",
            "useLineColorForBulletBorder" : true,
            "valueField" : "avg"
        }],
        "chartCursor" : {
        },
        "categoryField" : "period_end",
        "categoryAxis" : {
            "gridCount" : xRange,
            "autoGridCount" : false,
            "parseDates" : false,
            "dashLength" : 1,
            "minorGridEnabled" : true,
            "labelRotation" : xAngle,
            "fontSize" : 5
        },
        "dataProvider" : chartData
    };

    if (divName == 'detailChart') {
        chart.categoryAxis.gridCount = chartData.length;
        chart.chartCursor.valueLineBalloonEnabled =true;
        chart.chartCursor.valueLineEnabled = true;
        chart.listeners = [{
            "event": "init",
            "method": addGuides // function 너무 길어서 위에 함수로 정의함
        }, {
            "event": "changed",
            "method": function( e ) {
                // Log cursor's last known position
                e.chart.lastCursorPosition = e.index;
            }
        }];
        if (period_Angle == "1") {
            chart.categoryAxis.labelRotation = 45;
        }
    } else {
        chart.titles = [{
            "text" : meter_name,
            "size" : 10
        }];
//        divName = $("[data-meter_name=" + divName.replace(/\./gi, "\\.") + "]")[0];
        divName = $(divName)[0];
    }

	AmCharts.makeChart(divName, chart);
//	$(".amcharts-title-main").css("font-family", "Noto Sans KR");
}

function getNowDate() {
	var d = new Date();

	var s = leadingZeros(d.getFullYear(), 4) + '-' +
			leadingZeros(d.getMonth() + 1, 2) + '-' +
			leadingZeros(d.getDate() - 1, 2) + 'T' +
			leadingZeros(d.getHours(), 2) + ':' +
			leadingZeros(d.getMinutes(), 2) + ':' +
			leadingZeros(d.getSeconds(), 2);

	return s;
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

function Statistics() {
	var fieldList = ["timestamp", "user_id", "resource"];
    var timeFormat = "yyyy-MM-ddTHH:mm:ss"; // 2017-06-02T21:04:01

	var optionList = [
	//   키     |설명|인덱스
		"ne", // != 0
		"ge", // >= 1
		"le", // <= 2
		"gt", // >  3
		"lt", // <  4
		"eq"  // =  5
	];

	var meter_names = [						// 인덱스
		"memory",                           //  0
		"memory.resident",                  //  1

		"cpu",                              //  2
		"cpu.delta",                        //  3
		"cpu_util",                         //  4
		"vcpus",                            //  5

		"disk.read.requests",               //  6
		"disk.write.requests",              //  7
		"disk.read.bytes",                  //  8
		"disk.write.bytes",                 //  9
		"disk.read.requests.rate",          // 10
		"disk.write.requests.rate",         // 11
		"disk.read.bytes.rate",             // 12
		"disk.write.bytes.rate",            // 13
		"disk.root.size",                   // 14
		"disk.ephemeral.size",              // 15
		"disk.capacity",                    // 16
		"disk.allocation",                  // 17
		"disk.usage",                       // 18

		"network.incoming.bytes",           // 19
		"network.outgoing.bytes",           // 20
		"network.incoming.packets",         // 21
		"network.outgoing.packets",         // 22
		"network.incoming.bytes.rate",      // 23
		"network.outgoing.bytes.rate",      // 24
		"network.incoming.packets.rate",    // 25
		"network.outgoing.packets.rate"     // 26
	];

	function createData(query, period, groupby, aggregates) {
		var data = {};
		data.query = query;
		if (arguments.length >= 2) {
			data.period = period;
		}
		if (arguments.length >= 3) {
			data.groupby = groupby;
		}
		if (arguments.length >= 4) {
			data.aggregates = aggregates;
		}
		return data;
	}
	this.createData = createData;

	this.getStatistics = function(meter_name, data, divName) {
		var chartData = [];
		if (arguments.length < 3) {
			divName = "detailChart";
		}

		U.ajax({
			progress : true,
			url : "/dashboard/telemeter/statistics/" + meter_name,
			data : {"data":JSON.stringify(data)},
			success : function(jsonData) {
				var dateUtil = new DateUtil();
				var period_Angle = "1";
				data = jsonData.success;
				for (var i = 0; i < data.length; i++) {
					dateUtil.setCustomDate(data[i].period_end);
					dateUtil.setGmtToKor();
					var formatDate = dateUtil.getFormatDate(timeFormat);
					if (meter_name == 'cpu') {
						data[i].avg = data[i].avg / 10000000000; // TODO : 단위환산
					}
					if (meter_name == 'cpu.delta') {
					    data[i].avg = data[i].avg / 10000000000;
					}
					if (data[i].period == '3600') {
						formatDate = formatDate.substr(11,5);
						period_Angle = "0";
					} else {
						formatDate = formatDate.substr(5,11).replace("T"," ");
					}
					chartData.push({"avg" : data[i].avg, "period_end" : formatDate});
				}
				drawChart(divName, chartData, meter_name, period_Angle);
			}
		});
	}
	
	this.getOneDayStatisticsById = function(resource_id) {
		var divName = $(".simpleChart");
		var dateUtil = new DateUtil();
		
		dateUtil.getYesterdayDate();
		dateUtil.setKorToGmt();
		
		var query = [
			{
				"field" : "resource",
				"op" 	: "eq",
				"value" : resource_id
			},
			{
				"field" : "timestamp",
				"op" 	: "gt",
				"value" : dateUtil.getFormatDate(timeFormat)
			},
		];
		
		for (var i = 0; i < divName.length; i++) {
			
			var data = createData(query, 3600);
			this.getStatistics(divName[i].dataset.meter_name, data, divName[i].id);
		}
	}
	
	this.getOneDayStatisticsListById = function(resource_id, selector, success) {
		var divName = $(selector);
		var dateUtil = new DateUtil();
		
		dateUtil.getYesterdayDate();
		dateUtil.setKorToGmt();
		
		var query = [
			{
				"field" : "resource",
				"op" 	: "eq",
				"value" : resource_id
			},
			{
				"field" : "timestamp",
				"op" 	: "gt",
				"value" : dateUtil.getFormatDate(timeFormat)
			},
		];
		
		var data = createData(query, 3600);
		U.ajax({
			url : "/dashboard/telemeter/statisticsList",
			data : {"data":JSON.stringify(data)},
			success : function(jsonData) {
				success(jsonData);
			}
		});
	}
	
	this.getStatisticsDetailById = function(resource_id, meter_name, idx) {
		var dateUtil = new DateUtil();
		var period = null;
		var dateList = [];
		
		dateUtil.getYesterdayDate(); 						// 하루
		dateUtil.setKorToGmt();
		dateList.push(dateUtil.getFormatDate(timeFormat));
		dateUtil.getOneWeekBeforeDate(); 					// 일주일
		dateUtil.setKorToGmt();
		dateList.push(dateUtil.getFormatDate(timeFormat));
		dateUtil.getFirstDayOfThisMonthDate(); 				// 이번달 오늘까지
		dateUtil.setKorToGmt();
		dateList.push(dateUtil.getFormatDate(timeFormat));
		dateUtil.getFifteenDaysBeforeDate(); 				// 15일
		dateUtil.setKorToGmt();
		dateList.push(dateUtil.getFormatDate(timeFormat));
		dateUtil.getThirtyDaysBeforeDate(); 				// 30일
		dateUtil.setKorToGmt();
		dateList.push(dateUtil.getFormatDate(timeFormat));
		dateUtil.getOneYearBeforeDate(); 					// 1년
		dateUtil.setKorToGmt();
		dateList.push(dateUtil.getFormatDate(timeFormat));
		
		
		var query = [
			{
				"field" : "resource",
				"op" 	: "eq",
				"value" : resource_id
			},
			{
				"field" : "timestamp",
				"op" 	: "gt",
				"value" : dateList[idx]
			},
		];
		
	
		switch (idx) {
			case '0': period = 3600;
				break;
			case '1': period = 43200;
				break;
			case '2': period = parseInt(dateUtil.getTodayDate().getDate() * 24 * 3600 / 20);
				break;
			case '3': period = 86400;
				break;
			case '4': period = 86400;
				break;
			case '5': period = 2592000;
				break;
		}
		
		var data = createData(query, period);
		this.getStatistics(meter_name, data);
	}
	
	this.getStatisticsEtcById = function(resource_id, meter_name, d1, d2) {
		var dateUtil = new DateUtil();
		var period = null;
		dateUtil.setCustomDate(d1);
		dateUtil.setKorToGmt();
		var date1 = dateUtil.getFormatDate(timeFormat);
		
		var query = [
			{
				"field" : "resource",
				"op"	: "eq",
				"value" : resource_id
			},
			{
				"field" : "timestamp",
				"op"	: "gt",
				"value" : date1
			},
		];
		
		if (arguments.length >= 4) {			
			dateUtil.setCustomDate(d2);
			dateUtil.setKorToGmt();
			
			var date2 = dateUtil.getFormatDate(timeFormat);
			period = parseInt((new Date(date2) - new Date(date1)) / 1000 / 20); // TODO : 계산다시할것
			query.push({
				"field" : "timestamp",
				"op"	: "le",
				"value" : date2
			});
		} else {
			dateUtil.setNow();
			period = parseInt((dateUtil.setKorToGmt() - new Date(date1) * 24 * 3600 / 15));
		}
		var data = createData(query, period);
		this.getStatistics(meter_name, data);
	}
	return this;
}