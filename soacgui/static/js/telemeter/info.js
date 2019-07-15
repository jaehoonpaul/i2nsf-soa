var detailChart;
var data;
var memory = [];
var networkData = [];
var statistics = new Statistics();
var progressCnt = 0;
$(function() {
    $("#topModal").loadPage({
        url: "/dashboard/telemeter/detail_pop",
        data: {"modal_title": ""},
        success: function() {
            $(".common_modal").width(800);
            $("#thresholdSubmit").on("click", function() {
                if ($("#commonModal").is(":visible")) {
                    $("#threshold").val($("#anno-threshold").val());
                }
            });
            initDatePicker();
        }
    });
    initTelemeterEvent();
    var server_id = $("#selectInstanceList").val();
    getNetworkData(server_id);
});

function initTelemeterEvent() {
    /* 새로고침 */
    $(".refresh_monitoring").on("click", function() {
        $("#selectInstanceList").trigger("change");
    });
    /* 가상서버 변경시 */
    $("#selectInstanceList").change(function() {
        var server_id = $("#selectInstanceList").val();
        getInstanceInfo(server_id);
        var meter_group = $("#resourceMonitoring .click").data("meter_group");
        if (meter_group != "network") {
            getStatisticsRefresh();
        }
    });
    /* 네트워크 변경시 */
	$("#networkList").on("change", function() {
        getStatisticsRefresh();
	});
    TabUtil({
        "selector": "#resourceMonitoring",
        "afterEveryAct": function() {
            var meter_group = $("#resourceMonitoring .click").data("meter_group");
            if (isEmpty(meter_group)) {
                initAlarmListDiv();
            } else {
                if (!initChartMeterName[meter_group]) {
                    getStatisticsRefresh();
                    if (meter_group != "network") {
                        initChartMeterName[meter_group] = true;
                    }
                }
            }
        }
    }).run();
	$(window).resize(function() {
		var maxWidth = window.innerWidth - 400 - 227;
		$(".right_d01").css('width', maxWidth - 50);
	});
	/* 차트 클릭시 */
	$(".simpleChart").on("click", function() {
		showChartModal(this.dataset.meter_name); // TODO: 점검
	});
}

function initAlarmListDiv() {
    if (isEmpty($("#alarmDiv").html().trim())) {
        $("#alarmDiv").html(progressHtml);
        var resource_id = $("#selectInstanceList option:selected").val();
        $("#alarmDiv").loadPage({
            url: "/dashboard/telemeter/alarms?vm_id=" + resource_id,
            data: {"service_id": location.pathname.split('/')[3]},
            success: function() {
                $("#createAlarm").on("click", function() {
                    PopupUtil({
                        title: "알람 상세정보",
                        url: "/dashboard/telemeter/alarms/create",
                        success: function(result) {

                        }
                    });
                });
            }
        });
    }
}

function initDatePicker() {
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

	$("#dateBtn").on("click", function() {
		//var resource_id = $(".ind_td01")[1].innerText;
		var resource_id = $("#detailResourceID").val();

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
			for (var key in alarmHistory) {
				selectBox = "<option value='" + key + "'>" + key + "</option>";
				$("#alarmList").append(selectBox);
			}
			createAlarmList(alarmHistory[keys[0]]);
		}
	});
}

function getInstanceInfo(vm_id) {
    var selectBox="";
//	$(".network").remove();
//    getAlarmList(vm_id);
    if (vm_id) {
        getNetworkData(vm_id);
    }
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
            var cnt = 0;
			for (var i = 0 ; i < network_interfaces.length; i++) {
			    var html = "";
			    for (var j = 0; j < 8; j++) {
                    html += "<div id='network"+cnt+"' class='network simpleChart' data-meter_name='"+networkMeterName[j]+"'></div>";
                    cnt ++;
				}
                $("#monitoringDiv").append(html);
                $.each(networkData[network_interfaces[i]], setChartData);
			}
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
//		if (key == 'cpu') {
//			value[i].avg = value[i].avg / 10000000000; // TODO : 단위환산
//		}
//		if (key == 'cpu.delta') {
//		    value[i].avg = value[i].avg / 10000000000;
//		}
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

function getNetwork(vm_id) {
	$.each(networkData[vm_id], setChartData);
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
    progressCnt = Object.keys(meter_name_map[meter_group]).length;
    $.each(meter_name_map[meter_group], function(key, meter_name) {
        var divName = ".simpleChart[data-meter_name=" + meter_name.replace(/\./gi, "\\.") + "]";
        $(divName).html(progressHtml);
        statistics.getStatistics(meter_name, data, divName);
    });
}

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

function drawChart(divName, chartData, meter_name, period_Angle, chartData2) {
//	var xRange = chartData.length / 4;
//	var xAngle = 0;
    var chartMaker = new ChartMaker({selector: divName});
    var config = {
        title: {display: true, text: meter_name},
        options: {
            legend: {display: chartData.legend, position:'bottom' },
            tooltips: {
                mode: 'index', intersect: false,
                callbacks: {
                    // tooltip 단위 붙임
                    label: function(item, data) {
                        var label = data.datasets[item.datasetIndex].label || '';
                        if (label) {
                            label += ' :  ' + getCustomLabelString(item.yLabel);
                        } else {
                            label = getCustomLabelString(item.yLabel);
                        }
                        return label;
                     }
                },
            },
            scales: {
                xAxes: [{
                    display: true, type: "time",
                    time: {displayFormats: {day: 'YYYY-MM-DD'}},
                    scaleLabel: {display: false, labelString: 'time'}
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {display: false, labelString: "value" },
                    ticks: {
                        // 차트 단위 붙임
                        callback: function(value) { return getCustomLabelString(value); }
                    }
                }],
            }
        },
    }
    var data = {
        datasets: [{
            borderWidth: 1,
            data: chartData,
            pointRadius: 0,
            label: chartData.label
        }]
    }

    // network chart
    if (chartData2) {
        data.datasets.push({
            borderWidth: 1,
            data: chartData2,
            pointRadius: 0,
            label: chartData2.label
        });
    }

		
    if ($("#commonModal").is(":visible")) {
        $("#suggestedAccept").on("click", function() {
            var suggestedMin = $("input[name=suggestedMin]").val();
            var suggestedMax = $("input[name=suggestedMax]").val();
            if (!isEmpty(suggestedMin)) {
                detailChart.options.scales.yAxes[0].ticks["suggestedMin"] = suggestedMin;
            }
            if (!isEmpty(suggestedMax)) {
                detailChart.options.scales.yAxes[0].ticks["suggestedMax"] = suggestedMax;
            }
//            var thresholdID = "threshold";
//            if (detailChart.annotation.elements[thresholdID].options.value < suggestedMin || detailChart.annotation.elements[thresholdID].options.value > suggestedMax) {
//                var value = (suggestedMin + suggestedMax) / 2
//                detailChart.annotation.elements[thresholdID].options.value = value;
//                detailChart.options.annotation.annotations.filter(anno => anno.id == thresholdID)[0].value = value;
//            }
            detailChart.update(0);
        });
        config.options["annotation"] = {
            events: ['click'],
            annotations: []
        };
        config.options.scales.yAxes[0].ticks["suggestedMin"] = 0;
    } else {
//        chart.titles = [{
//            "text" : meter_name,
//            "size" : 10
//        }];
//        divName = $("[data-meter_name=" + divName.replace(/\./gi, "\\.") + "]")[0];
//        divName = $(divName)[0];
    }
    chartMaker.setConfig(config);
    chartMaker.setData(data);
    var chart = chartMaker.drawChart();

    if (divName == '#detailChart') {
        detailChart = chart;
    }
    if ($("#commonModal").is(":visible")) {
        addAnnotation("threshold");
    }
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
        U.showProgress();
		var chartData = [];
		if (arguments.length < 3) {
			divName = "#detailChart";
		}
        U.showProgress();
		U.ajax({
			url : "/dashboard/telemeter/statistics/" + meter_name,
			data : {"data":JSON.stringify(data)},
			success : function(jsonData) {
				var dateUtil = new DateUtil();
				var period_Angle = "1";
				data = jsonData.success;
				/* 테스트용 가데이터 */
				// dateUtil.setNow();
				// var now = dateUtil.date;
				// data = [];
				// for (var i = 0; i < 100; i++) {
				//     data.push({
				//         "period_end":now.setHours(now.getHours() - 1),
				//         "avg": i * 1000
                //     });
				// }
				/**/
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
					chartData.push({"x": dateUtil.date, "y": data[i].avg});
				}
				drawChart(divName, chartData, meter_name, period_Angle);
                progressCnt -= 1;
                if (progressCnt < 1) {
                    U.hideProgress();
                    progressCnt = 0;
                }
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

function showAlarmDetail(alarm_id) {
    PopupUtil({
        title: "알람 상세정보",
        tab: {selector: "#commonModal"},
        url: "/dashboard/telemeter/alarms/" + alarm_id + "/detail",
        success: function(result) {
        }
    });
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


// 차트데이터 Scale Label
function getCustomLabelString(value) {
    if (value >= 1000000000) {
        return Math.ceil(value / 1000000000 * 100) / 100 + " G";
    } else if (value >= 1000000) {
        return Math.ceil(value / 1000000 * 100) / 100 + " M";
    } else if (value >= 1000) {
        return Math.ceil(value / 1000 * 100) / 100 + " k";
    } else {
        return value;
    }
}


function addAnnotation(thresholdID) {
    var value = $("#threshold").val();
    if (isEmpty(value)) {
        value = (detailChart.scales["y-axis-0"].min + detailChart.scales["y-axis-0"].max) / 2;
    }
    var annotation = {
        id: thresholdID,
        drawTime: 'afterDatasetsDraw',
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: value,
        borderColor: 'black',
        borderWidth: 2,
        label: {
            // backgroundColor: "red",
            enabled: true,
            content: "threshold"
        },
        draggable: true,
        onDrag: function(event) {
            detailChart.annotation.elements[thresholdID].options.value = event.subject.config.value;
            detailChart.options.annotation.annotations.filter(anno => anno.id == thresholdID)[0].value = event.subject.config.value;
            $("input[name=anno-threshold]").val(event.subject.config.value);
            detailChart.update(0);
        }
    };
    detailChart.options.annotation.annotations.push(annotation);
    detailChart.update(0);
}