$(function () {
    $("#selectHostList").on("change", function() {
        // refresh
        location.replace("/dashboard/monitoring/" + $("#selectHostList").val() + "/detail");
        $(".tab-btn.click").removeClass("click");
        var menu = "#" +  $(".tab-btn.click").attr("id");
        refreshData(menu);
    });

    refreshData();

    $("#topModal").loadPage({
        url: "/dashboard/monitoring/detail_pop",
        data: {"modal_title": ""},
        success: function() {
            $(".common_modal").width(800);
            initDatePicker();
        }
    });
});

// 컨텐츠 loadpage
function refreshData(progress, menu) {
    var hostid = $("#selectHostList").val();
    $("#monitoring").loadPage({
        url:"/dashboard/monitoring/" + hostid + "/chart",
        progress: true,
        success: function() {
            if (menu) {
                $(menu).click();
            }
        }
    });
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

	checkOut = $("#end_date").datepicker({
        onRender : function(date) {
            return date.valueOf() <= checkIn.date.valueOf() ? 'disabled' : '', date.valueOf() > now.valueOf() ? 'disabled' : '';
        }
    }).on('changeDate', function(ev) {
        checkOut.hide();
    }).data('datepicker');
    // 상세차트 기간 변경
    $("#chartDate").on("change", function() {
        $("#start_date").val("");
		$("#end_date").val("");
		var meter_name = $("#chartTitle").text();

        if ($(this).val() == '6') {
			$("#datePicker").attr('style', 'visibility:visible');
			$("#detailChart").empty();
		} else {
		    $("#datePicker").attr('style', 'visibility:hidden');
            var chartData;
            var chartData2;
            if (meter_name.indexOf("net.if") > -1) {
                chartData = getNetworkData("in", meter_name, createSearchData($(this).val()));
                chartData2 = getNetworkData("out", meter_name, createSearchData($(this).val()));

            } else {
                chartData = getDetailChartData(meter_name, createSearchData($(this).val()));
            }

            drawDetailChart($("#chartTitle").text(), chartData, meter_name, true, chartData2);
		}
    });

    // 상세차트 기간 검색
    $("#dateBtn").on("click", function() {
        var meter_name = $("#chartTitle").text();
        var chartData;
        var chartData2;

		if ($("#end_date").val() == "") {
		    if (meter_name.indexOf("net.if") > -1) {
                chartData = getNetworkData("in", meter_name, $("#start_date").val());
                chartData2 = getNetworkData("out", meter_name, $("#start_date").val());

            } else {
			    chartData = getDetailChartData(meter_name, $("#start_date").val());
			}
		} else {
		    var dateUtil = new DateUtil();
            dateUtil.setCustomDate($("#start_date").val()+"T00:00:00");
            var time_from = dateUtil.getFormatDate(timeFormat);

            dateUtil.setCustomDate($("#end_date").val()+"T23:59:59");
            var time_till = dateUtil.getFormatDate(timeFormat);

            if ($("#chartTitle").text().indexOf("net.if") > -1) {
                chartData = getNetworkData("in", meter_name, time_from, time_till);
                chartData2 = getNetworkData("out", meter_name, time_from, time_till);

            } else {
			    chartData = getDetailChartData(meter_name, time_from, time_till);
			}
		}
        drawDetailChart(meter_name, chartData, "", true, chartData2);
	});
}