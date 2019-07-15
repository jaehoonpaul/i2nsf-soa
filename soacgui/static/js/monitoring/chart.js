var resultType = {
    "num_float": 0,
    "character": 1,
    "log": 2,
    "num_unsigned": 3, // default
    "text": 4,
}
var itemGroup = {
    "ping": {"agent.ping":[]},
    "memory": {
        "vm.memory.size": ["available", "total"],
        "system.swap.size": [",free", ",pfree", ",total"]
    },
    "cpu": {
        "system.cpu.load": ["percpu,avg1", "percpu,avg5", "percpu,avg15", ],
        "system.cpu.util": [",idle", ",interrupt", ",iowait", ",nice", ",softirq", ",steal", ",system", ",user"],
        "system.cpu.switches": [],
        "system.cpu.intr": []
    },
    "filesystems": {
        "vfs.fs.inode": ["/,pfree"],
        "vfs.fs.size": ["/,free", "/,pfree", "/,total", "/,used"]
    },
    "network": {
        "net.if.in": [],
        "net.if.out": []
    }
}

var progressHtml = "";
    progressHtml += '<div class="sk-fading-circle">';
    progressHtml += '<div class="sk-circle1 sk-circle"></div>';
    progressHtml += '<div class="sk-circle2 sk-circle"></div>';
    progressHtml += '<div class="sk-circle3 sk-circle"></div>';
    progressHtml += '<div class="sk-circle4 sk-circle"></div>';
    progressHtml += '<div class="sk-circle5 sk-circle"></div>';
    progressHtml += '<div class="sk-circle6 sk-circle"></div>';
    progressHtml += '<div class="sk-circle7 sk-circle"></div>';
    progressHtml += '<div class="sk-circle8 sk-circle"></div>';
    progressHtml += '<div class="sk-circle9 sk-circle"></div>';
    progressHtml += '<div class="sk-circle10 sk-circle"></div>';
    progressHtml += '<div class="sk-circle11 sk-circle"></div>';
    progressHtml += '<div class="sk-circle12 sk-circle"></div>';
    progressHtml += '</div>';

var timeFormat = "yyyy-MM-ddTHH:mm:ss";
var refreshInterval = 30000;
var tabUtil;
$(function () {
    U.hideProgress();

    // tab 메뉴 생성
    tabUtil = TabUtil({
        "selector": "#tabGroup",
        "afterEveryAct": function(_, tabIndex) {
            if (tabIndex > 0) {
                refreshChart(Object.keys(itemGroup)[tabIndex - 1]);
            }
        }
    }).run();
    tabUtil.selectTab(1);
    // 새로고침 버튼 클릭
    $(".refresh_monitoring").on("click", function() {
        $(".largeChart").html(progressHtml);
        $(".simpleChart").html(progressHtml);
        $(".networkChart .simpleChart").remove();
        refreshChart(Object.keys(itemGroup)[tabUtil.tabIndex - 1]);
    });

    /* 차트 클릭시 */
	$(document).on("click", ".simpleChart", chartClick);
	$(document).on("click", ".largeChart", chartClick);
    // 차트 초기화
    // 주기적 차트 Refresh
//    setInterval(function(){
//        $(".simpleChart").html(progressHtml);
//        refreshChart();
//    }, refreshInterval);
});

function chartClick() {
    $("#detailChart").html(progressHtml);
//	    console.log("meter_name: ", $(this).data("meter_name"));
    var meter_name = $(this).data("meter_name");
    var chartData; // default period
    var chartData2;

    if($(this).hasClass("network")) {
        chartData = getNetworkData("in", meter_name, createSearchData(0));
        chartData2 = getNetworkData("out", meter_name, createSearchData(0)); // default period
    } else {
        if ($("#tabVmPing").length > 0) {
            meter_name = "icmpping";
        }
        chartData = getDetailChartData(meter_name, createSearchData(0));
    }
    showChartModal(meter_name, chartData, chartData2);
}
// 차트 새로 그리기
function refreshChart(chartType) {
    if ($("#tabVmPing").length > 0) {
        console.log($("#tabVmPing"));
        chartType = "icmpping";
    }
    var host_id = $("#selectHostList").val();
    if (isEmpty(host_id)) {return;}
    var chartData = {};
    var dateUtil = new DateUtil();

    // 전체 차트 데이터 가져오기
    U.ajax({
        url: "chart_data",
        data: {"type": chartType},
        dataType: "json",
        success: function(result) {
            // console.log(result.network);
            dateUtil.getYesterdayDate();
            dateUtil.setKorToGmt();
            var data = result;

            if (chartType == "icmpping") {
                var chartData = data["ping"][chartType];
                var target;
                $(".largeChart").each(function() {
                    if ($(this).data("meter_name") == "agent.ping") {
                        target = $(this);
                    }
                });
                drawDetailChart(chartType, chartData, target, false);
            } else {
                var item = itemGroup[chartType];
                $.each(item, function(itemKey, itemSubKeyList) {
                    if (itemSubKeyList instanceof Array) {
                        var meter_name = "";
                        if (itemSubKeyList.length != 0) {
                            // draw chart
                            itemSubKeyList.forEach(function(itemSubKey) {
                                meter_name = itemKey + "[" + itemSubKey + "]";
                                var chartData = data[chartType][meter_name];
                                var target;
                                $(".simpleChart").each(function() {
    //                                 console.log($(this).data("meter_name"), meter_name, $(this).data("meter_name") == meter_name);
                                    if ($(this).data("meter_name") == meter_name) {
                                        target = $(this);
                                    }
                                });
                                drawDetailChart(meter_name, chartData, target, false);
                            });
                        } else if (itemSubKeyList.length == 0) {
                            if (chartType != "network") {
                                meter_name = itemKey;
                                var chartData = data[chartType][meter_name];
                                var target;
                                $(".largeChart").each(function() {
                                    if ($(this).data("meter_name") == meter_name) {
                                        target = $(this);
                                    }
                                });
                                $(".simpleChart").each(function() {
                                    // console.log($(this).data("meter_name"), meter_name, $(this).data("meter_name") == meter_name);
                                    if ($(this).data("meter_name") == meter_name ) {
                                        target = $(this);
                                    }
                                });
                                drawDetailChart(meter_name, chartData, target, false);
                            }
                        }
                    }
                });
            }
            if (chartType == "network") {
                var area = "";
                $.each(data[chartType], function(interfaceKey) {
                    if (interfaceKey.indexOf(".in[") > -1) {
                        area += '<div class="network simpleChart" data-meter_name="'+ interfaceKey.replace(".in", "") +'">' + progressHtml + '</div>';
                    }
                });
                $("#networkChartArea").html(area);
                $.each(data[chartType], function(interfaceKey) {
                    if (interfaceKey.indexOf(".in[") > -1) {
                        var chartData = data[chartType][interfaceKey];
                        var chartData2 = data[chartType][interfaceKey.replace(".in", ".out")];
                        chartData["label"] = "in";
                        chartData2["label"] = "out";

                        var target;
                        $(".simpleChart").each(function() {
                            if ($(this).data("meter_name") == interfaceKey.replace(".in", "") ) {
                                target = $(this);
                            }
                        });
                        drawDetailChart(interfaceKey.replace(".in", ""), chartData, target, false, chartData2);
                    }
                });
                $(".networkChart").append('<div class="clear_float"></div>');
            }
        }
    });
}
//function refreshChart(chartType) {
//    var host_id = $("#selectHostList").val();
//    if (isEmpty(host_id)) {return;}
//    var chartData = {};
//    var dateUtil = new DateUtil();
//
//    // 전체 차트 데이터 가져오기
//    U.ajax({
//        url: "chart_data",
//        data: {"type": chartType},
//        dataType: "json",
//        success: function(result) {
//            // console.log(result.network);
//            chartData = result;
//            dateUtil.getYesterdayDate();
//            dateUtil.setKorToGmt();
//            var data = chartData;
//
//            $.each(itemGroup, function(groupName, item) {
//                // not network
//                $.each(item, function(itemKey, itemSubKeyList) {
//                    if (itemSubKeyList instanceof Array) {
//                        var meter_name = "";
//                        if (itemSubKeyList.length != 0) {
//                            // draw chart
//                            itemSubKeyList.forEach(function(itemSubKey) {
//                                meter_name = itemKey + "[" + itemSubKey + "]";
//                                var chartData = data[groupName][meter_name];
//                                var target;
//                                $(".simpleChart").each(function() {
//                                    // console.log($(this).data("meter_name"), meter_name, $(this).data("meter_name") == meter_name);
//                                    if ($(this).data("meter_name") == meter_name) {
//                                        target = $(this);
//                                    }
//                                });
//                                drawDetailChart(meter_name, chartData, target, false);
//                            });
//                        } else if (itemSubKeyList.length == 0) {
//                            if (groupName != "network") {
//                                meter_name = itemKey;
//                                var chartData = data[groupName][meter_name];
//                                var target;
//                                $(".simpleChart").each(function() {
//                                    // console.log($(this).data("meter_name"), meter_name, $(this).data("meter_name") == meter_name);
//                                    if ($(this).data("meter_name") == meter_name ) {
//                                        target = $(this);
//                                    }
//                                });
//                                drawDetailChart(meter_name, chartData, target, false);
//
//                            } else {
//                                $.each(data[groupName], function(InterfaceKey) {
//                                    if (InterfaceKey.indexOf(".in[") > -1) {
//                                        var chartData = data[groupName][InterfaceKey];
//                                        var chartData2 = data[groupName][InterfaceKey.replace(".in", ".out")];
//                                        chartData["label"] = "in";
//                                        chartData2["label"] = "out";
//
//                                        var area = '<div class="network simpleChart" data-meter_name="'+ InterfaceKey.replace(".in", "") +'">' + progressHtml + '</div>';
//                                        $(".networkChart").append(area);
//
//                                        var target;
//                                        $(".simpleChart").each(function() {
//                                            if ($(this).data("meter_name") == InterfaceKey.replace(".in", "") ) {
//                                                target = $(this);
//                                            }
//                                        });
//                                        drawDetailChart(InterfaceKey.replace(".in", ""), chartData, target, false, chartData2);
//                                    }
//                                });
//                                $(".networkChart").append('<div class="clear_float"></div>');
//                            }
//                        }
//                    }
//                });
//            });
//        }
//    });
//}

// 데이터 차트 그리기
function drawDetailChart(meter_name, data, divName, isModal, data2) {
    var chartData = [];
    var chartData2 = [];
    // modal
    if (isModal) {
        divName = "#detailChart";
    }

    var dateUtil = new DateUtil();
    var period_Angle = "1";
    if (data) {
        for (var i = 0; i < data.length; i++) {
            dateUtil.setSecond(data[i].clock);
            var formatDate = dateUtil.getFormatDate(timeFormat);

            if (data[i].value_avg) data[i].value = data[i].value_avg; // 1주 이전 데이터는 trend에서 가져와서 key가 다름
            chartData.push({"x": dateUtil.date, "y": data[i].value });
            chartData["label"] = data.label;
            chartData["legend"] = data.legend;

            // for network
            if (!isEmpty(data2)) {
                if (data2.length > i && !isEmpty(data2[i])) {
                    dateUtil.setSecond(data2[i].clock);
                    var formatDate = dateUtil.getFormatDate(timeFormat);

                    if (data2[i].value_avg) data2[i].value = data2[i].value_avg;
                    chartData2.push({"x": dateUtil.date, "y": data2[i].value });
                    chartData2["label"] = data2.label;
                }
            }
        }
        drawChart(divName, chartData, meter_name, period_Angle, chartData2);
    }

}

// 실제 차트 그리는 메서드
function drawChart(divName, chartData, meter_name, period_Angle, chartData2) {
    U.hideProgress();
    var chartMaker = new ChartMaker({selector: divName});
    var chartConfig = {
        title: {display: true, text: meter_name },
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
            },
        },
    };
    if ($(divName).hasClass("largeChart")) {
        chartConfig["width"] = "1500vw";
        chartConfig["height"] = "555vh";
        console.log(meter_name);
    }
    chartMaker.setConfig(chartConfig);
    var data = {
        datasets: [{
            borderWidth: 1,
            data: chartData,
            pointRadius: 0,
            label: chartData.label
        }]
    };

    // network chart
    if (chartData2) {
        data.datasets.push({
            borderWidth: 1,
            data: chartData2,
            pointRadius: 0,
            label: chartData2.label
        });
    }

    chartMaker.setData(data);
    chartMaker.drawChart();
}

// 팝업 생성 function 호출
function showChartModal(meter_name, chartData, chartData2) {
    $("#chartDate").val(0); // select 초기화
    $("#datePicker").hide();
    drawDetailChart(meter_name, chartData, $("#chartDate").val(), true, chartData2);
    $("#topModal .modal-title").text(meter_name); // modal title set
    $('#topModal').modal('toggle'); // modal show

	//var resource_id = $(".ind_td01")[1].innerText;
	var resource_id = $("#selectInstanceList option:selected").val();

	if (meter_name.indexOf("network") != -1) {
		resource_id = $("#networkList option:selected").val();
	}
}

// 네트워크 데이터 가져오기
function getNetworkData(label, meter_name, time_from, time_till) {
    var chartData = getDetailChartData(meter_name.replace("[", "." +label+ "["), time_from, time_till);
    chartData["label"] = label;
    chartData["legend"] = true;

    return chartData;
}

// 상세 차트 데이터를 가져오는 함수
function getDetailChartData(meter_name, time_from, time_till) {

    // meter_name에서 처음 타이틀 제외하여 넘긴다.
    var chartData = {};
    var data = {
        "key": meter_name,
        "time_from": time_from,
    };
    if (!isEmpty(time_till)) {
        data["time_till"] = time_till;
    }

    P.json({
        url: "chart_data_detail",
        data: {data: JSON.stringify(data)},
        success: function(result) {
            if (result["history"]) {
                chartData = result["history"]["result"];
            } else {
                chartData = result;
            }
        }
    });
    return chartData;
}

// 상세 차트 기간 검색 시 데이터 생성 ( time_from)
function createSearchData(idx) {
    var dateUtil = new DateUtil();
    var period = null;
    var dateList = [];

    dateUtil.getYesterdayDate();// 하루
    dateList.push(dateUtil.getFormatDate(timeFormat));
    dateUtil.getOneWeekBeforeDate();// 일주일
    dateList.push(dateUtil.getFormatDate(timeFormat));
    dateUtil.getFirstDayOfThisMonthDate();// 이번달 오늘까지
    dateList.push(dateUtil.getFormatDate(timeFormat));
    dateUtil.getFifteenDaysBeforeDate();// 15일
    dateList.push(dateUtil.getFormatDate(timeFormat));
    dateUtil.getThirtyDaysBeforeDate();// 30일
    dateList.push(dateUtil.getFormatDate(timeFormat));
    dateUtil.getOneYearBeforeDate();// 1년
    dateList.push(dateUtil.getFormatDate(timeFormat));

    var date = dateList[idx];

    return date;
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