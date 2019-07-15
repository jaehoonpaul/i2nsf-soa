var usages;
function getDataAjax(){
//    U.ajax({
//        url : '',
//        success:function(data){
//            usages = data.success.usageList;
//            for (var i = 0; i < usages.length; i++) {
//                usages[i].total_memory_mb_usage = usages[i].total_memory_mb_usage.toFixed(2);
//                usages[i].total_vcpus_usage = usages[i].total_vcpus_usage.toFixed(2);
//                usages[i].total_local_gb_usage = usages[i].total_local_gb_usage.toFixed(2);
//                usages[i].vcpus = 0;
//                usages[i].disk = 0;
//                usages[i].ram = 0;
//                for (var j = 0; j < usages[i].server_usages.length; j++) {
//                    usages[i].vcpus += usages[i].server_usages[j].vcpus;
//                    usages[i].disk += usages[i].server_usages[j].local_gb;
//                    usages[i].ram += usages[i].server_usages[j].memory_mb;
//                }
//                usages[i].disk = usages[i].disk.toString() + "GB";
//                usages[i].ram = (usages[i].ram / 1024).toString() + "GB";
//            }
//            showUsages();
//        }
//    });
}

//function showUsages() {
//    var dataTable = new DataTable({
//        "selector" : "#usage",
//        "columns" : {
//            "tenant_id" : "프로젝트 이름",
//            "vcpus" : "VCPUs",
//            "disk" : "디스크",
//            "ram" : "RAM",
//            "total_vcpus_usage" : "VCPU 시간",
//            "total_local_gb_usage" : "디스크 GB 시간",
//            "total_memory_mb_usage" : "메모리 MB 시간",
//        },
//        "data" : usages,
//    });
//    dataTable.showDataTable();
//}

$(function(){

    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
    var checkout;
    var checkin = $('#id_start').datepicker(/*{
        onRender: function(date) {
          return date.valueOf() < now.valueOf() ? 'disabled' : '';
        }

    }*/).on('changeDate', function(ev) {
//        if (ev.date.valueOf() > checkout.date.valueOf()) {
            var newDate = new Date(ev.date)
            newDate.setDate(newDate.getDate() + 1);
            checkout.setValue(newDate);
//        }
        checkin.hide();
        $('#id_end')[0].focus();
    }).data('datepicker');

    var checkout = $('#id_end').datepicker({
        onRender: function(date) {
            return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
        }
    }).on('changeDate', function(ev) {
        checkout.hide();
    }).data('datepicker');
    getDataAjax();

    $("#btnDownloadCvs").on("click", function() {
    });
});