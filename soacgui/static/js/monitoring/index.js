var interval_id;
var hostIDList = [];
$(function () {
    // 호스트 선택 시 장비 모니터링 이동
    $(".host-item").on("click", function() {
        var host_id = $(this).data("host_id");
        location.href = "/dashboard/monitoring/" + host_id + "/detail";
    });
    $(".vm-item").on("click", function() {
        var host_id = $(this).data("host_id");
        location.href = "/dashboard/monitoring/" + host_id + "/detail";
    });
    $("#synchronize_server").on("click", function() {
        if (!isEmpty(interval_id)) {
            clearInterval(interval_id);
        }
        U.ajax({
            url: "/dashboard/monitoring/synchronize_server",
            progress: true,
            dataType: "json",
            success: function(result) {
                console.log(result);
                location.reload();
            }
        });
    });
    $(".vm-item").each(function(i, vm) {
        hostIDList.push($(vm).data("host_id"));
    });
//    interval_id = setInterval(function() {
//        U.ajax({
//            url: "",
//            data: {"hosts": JSON.stringify(hostIDList)},
//            progress: true,
//            dataType: "json",
//            success: function(result) {
//                $.each(result.host_ping_list, function(i, v) {
//                    var vm_status_div = $("div.vm-item[data-host_id=" + v.hostid + "]").children(".ping-status");
//                    vm_status_div.removeClass("status-circle-ok").removeClass("status-circle-error");
//                    if (v.ping == 1) {
//                        vm_status_div.addClass("status-circle-ok");
//                    } else {
//                        vm_status_div.addClass("status-circle-error");
//                    }
//                });
//            }
//        });
//    }, 5000);
});