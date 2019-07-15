function showChartModal(meter_name) {
    $("#detailChart").html(progressHtml);
	//var resource_id = $(".ind_td01")[1].innerText;
	var resource_id = $("#selectInstanceList option:selected").val();

	if (meter_name.indexOf("network") != -1) {
		resource_id = $("#networkList option:selected").val();
	}

	$("#chartDate").val(0); // select 초기화
	$("#datePicker").hide();
	drawChart("#detailChart", "", meter_name, "");
	statistics.getStatisticsDetailById(resource_id, meter_name, $("#chartDate").val());
	$("#topModal .modal-title").text(meter_name); // modal title set
   	$('#topModal').modal('toggle'); // modal show
   	$(".threshold-control").hide();
   	$("#thresholdSubmit").hide();
   	$('#topModal input[name=detailResourceID]').val(resource_id);
   	$('#topModal input[name=detailMeterName]').val(meter_name);
}

function showChartModalForAlarm(resource_id, meter_name) {
    $("#detailChart").html(progressHtml);
	$("#chartDate").val(0); // select 초기화
	$("#datePicker").hide();
	drawChart("#detailChart", "", meter_name, "");
	statistics.getStatisticsDetailById(resource_id, meter_name, $("#chartDate").val());
	$("#topModal .modal-title").text(meter_name); // modal title set
   	$('#topModal').modal('toggle'); // modal show
   	$(".threshold-control").show();
   	$("#thresholdSubmit").show();
   	$('#topModal input[name=detailResourceID]').val(resource_id);
   	$('#topModal input[name=detailMeterName]').val(meter_name);
}

