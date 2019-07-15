//var modifyFlag = false;
var progress_flag = false;
//var pre_progress_flag = false;
var progress_list = [];

//function sleep(msecs) {
//    var start = new Date().getTime();
//    var cur = start;
//    while(cur - start < msecs) {
//        cur = new Date().getTime();
//    }
//}
//var topologyList = [];

function refreshServiceTable() {
    U.ajax({
        url : '',
        success:function(jsonData) {
            if(typeof jsonData.error != 'undefined') {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            var service_list = jsonData.success.service_list;
            var service_id_list = [];
            var progress_id_list = [];
            var delete_id_list = [];
			$.each(service_list, function(index, service){
				service_id_list.push(service.service_id);
				if (service.status.indexOf("PROGRESS") != -1) {
				    progress_list.push(service);
				}
			});
            $('#service_list tr:not(:eq(0))').each(function(i, tr) {
                var tr_data_id = $(tr).data('id');
                if (typeof tr_data_id != "undefined" && service_id_list.indexOf(tr_data_id) == -1) {
                    delete_id_list.push(tr_data_id);
                }
            });
			if (progress_list.length > 0) {progress_flag = true;} else {progress_flag = false;}
            $.each(service_list, function(index, service) {
                refresh_tr = $('#service_list tr[data-id=' + service.service_id + ']');
                refresh_tr.children("td.stack_name").html($('<a>', {
                    class:"list_a01",
                    href:service.service_id + '/detail',
                    "data-id":service.service_id,
                    text:service.stack_name
                }));
                refresh_tr.children("td.tenant_name").text(service.tenant_name);
                refresh_tr.children("td.service_description").text(U.replaceEmptyText(service.service_description));
                var status = service.status.replace(/([\w]+)_(complete|progress|failed)/gi, "<img class='status_image' src='/static/img/STATUS_$2.png' alt='#'>$1_$2")
                refresh_tr.children("td.status").html(status);
                refresh_tr.children("td.sfc_cnt").text(U.replaceEmptyText(service.sfc_cnt));
                refresh_tr.children("td.create_at").text(U.replaceEmptyText(service.create_at).replace(/T/gi, " "));
                refresh_tr.children("td.updated_at").text(U.replaceEmptyText(service.updated_at).replace(/T/gi, " "));
				if (service.status.indexOf("PROGRESS") != -1) {
				    progress_flag = true;
				}
            });
            if (delete_id_list.length != 0) {
                location.reload();
            }

            if(progress_list.length > 0) { window.setTimeout(function(){refreshServiceTable()}, 3000); }
            if (progress_flag) { window.setTimeout(function(){refreshServiceTable()}, 3000); }
            progress_list = [];
        }
    });
}

$(function() {
    U.ajax({
        progress : true,
        url : '',
        success:function(jsonData) {
            var statusBuffer = "service_green_iocn";
            if(typeof jsonData.error != "undefined") {
//                U.msg("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            // fail
            }
            if(typeof jsonData.success != "undefined") {
                var serviceList = jsonData.success.service_list;
                var actionHtml = "";
                actionHtml += '<div class="button_group_d01 btnUpdate">서비스 수정</div>';
                actionHtml += '<div class="button_group_d02 action"><img src="/static/img/dashboard/common/arrow_img_01.png" alt="#"></div>';
                actionHtml += '<div class="clear_float"></div>';
                actionHtml += '<div class="actionGroup actionGroup01" hidden>';
                actionHtml += '<a href="#" class="goto_topology actionGroup_a01"><div>서비스 토폴로지</div></a>';
                actionHtml += '<a href="#" class="goto_chaining actionGroup_a01"><div>서비스 체이닝</div></a>';
                actionHtml += '<a href="#" class="goto_monitoring actionGroup_a01"><div>서비스 모니터링</div></a>';
                actionHtml += '<div class="actionGroup_d02 separation"></div>';
                actionHtml += '<a href="#" class="pauseService actionGroup_a01" hidden><div>서비스 일시정지</div></a>';
                actionHtml += '<a href="#" class="resumeService actionGroup_a01" hidden><div>서비스 재시작</div></a>';
                actionHtml += '<a href="#" class="deleteService actionGroup_a01"><div>서비스 삭제</div></a>';
                actionHtml += '</div></div>';
                actionHtml += '<div class="clear_float"></div>';

                $.each(serviceList, function(idx, service) {
                    service["id"] = service.service_id;
                    if (service.status.indexOf("PROGRESS") != -1) {
                        progress_flag = true;
                    }
                });
                var dataTable = new DataTable({
                    "selector" : "#service_list",
                    "colgroup" : [13, 9, 7, 13, 17, 7, 12, 12, 10],
                    "columns" : {
                        "stack_name" : "이름:link",
                        "tenant_name" : "프로젝트",
                        "user_name" : "사용자",
                        "service_description" : "설명",
                        "status" : "상태",
                        "sfc_cnt" : "체이닝 수" ,
                        "create_at" : "생성일",
                        "updated_at" : "수정일",
                        "customHtml": "액션"
                    },
                    "parseString":{
                        "service_description" : {
                            "type":"tooLong",
                            "replacement":{
                                "length" : 15
                            }
                        },
                        "status":{
                            "type":"parse",
                            "replacement":{
                                "reg":/([\w]+)_(complete|progress|failed)/gi,
                                "result":"<img class='status_image' src='/static/img/STATUS_$2.png' alt='#'><div class='status_text'>$1_$2</div>"
                            }
                        },
                        "create_at":{
                            "type":"parse",
                            "replacement":{
                                "reg":/T/gi,
                                "result":" "
                            }
                        },
                        "updated_at":{
                            "type":"parse",
                            "replacement":{
                                "reg":/T/gi,
                                "result":" "
                            }
                        },
                    },
                    "data" : serviceList,
                    "customHtml":[
                        {
                            "tagName":"div",
                            "class":"button_group_bt02",
                            "text":actionHtml
                        }
                    ],
                    "min_row":15
                });
                var tdClass = ["rs_td02", "rs_td03"];

                dataTable.showDataTable();
                dataTable.setLink("", false, "");
                var actionGroup = new ActionGroup({
                    "selector":"#service_list",
                    "clickEvent":function() {
                        var service_id = $(this).parents("tr").data("id");
                        if ($(this).hasClass("deleteService")) {
                            var service_name = $(this).parents("tr").children("td.stack_name").text();
                            var service_description = $(this).parents("tr").children("td.service_description").text();
                            U.confirm({
                                title:"삭제",
                                message:service_name + "를 삭제하시겠습니까?",
                                func:function() {
                                    var url = service_id + "/delete";
                                    U.ajax({
                                        url: url,
                                        success:function(jsonData) {
                                            if (jsonData.error) {
                                                U.lobibox(jsonData.error.message, "error", "삭제 실패: " + jsonData.error.title);
                                            }
                                            if (jsonData.success) {
                                                U.lobiboxMessage(service_name + "(" + service_id + ")", "info", "삭제 성공");
                                                location.reload();
//                                                refreshServiceTable();
                                            }
                                        }
                                    });
                                }
                            });
                        } else if ($(this).hasClass("pauseService")) {
                            location.href = service_id + '/suspend';
                        } else if ($(this).hasClass("resumeService")) {
                            location.href = service_id + '/resume';
                        } else if ($(this).hasClass("goto_topology")) {
                            location.href = '/dashboard/service/' + service_id + '/detail';
                        } else if ($(this).hasClass("goto_chaining")) {
                            location.href = '/dashboard/service/' + service_id + '/chaining';
                        } else if ($(this).hasClass("goto_monitoring")) {
                            location.href = '/dashboard/telemeter/' + service_id + '/detail';
                        }
                    },
                    "openGroupEvent":function(elem) {
                        var service_status = $(elem).parents("tr").children("td.status").text();
                        if (service_status == 'SUSPEND_COMPLETE') {
                            $(".pauseService").hide();
                            $(".resumeService").show();
                        } else if (service_status == 'CREATE_COMPLETE' || service_status == 'RESUME_COMPLETE' || service_status == 'UPDATE_COMPLETE') {
                            $(".pauseService").show();
                            $(".resumeService").hide();
                        } else if (service_status.indexOf("FAILED") != -1) {
                            $(".pauseService").hide();
                            $(".resumeService").hide();
                        }

                        if (service_status.indexOf("PROGRESS") != -1) {
                            $(".goto_topology").hide();
                            $(".goto_chaining").hide();
                            $(".goto_monitoring").hide();
                            $(".separation").hide();
                        } else if (service_status.indexOf("COMPLETE") != -1) {
                            $(".goto_topology").show();
                            $(".goto_chaining").show();
                            $(".goto_monitoring").show();
                            $(".separation").show();
                        }
                    }
                });
                actionGroup.setCloseEvent();
                actionGroup.run();
                $(".btnUpdate").on("click", function() {
                    var service_id = $(this).parents("tr").data("id");
                    location.href = '/dashboard/service/' + service_id + '/modify';
                });
                /*$("#deleteSubmit").on("click", function() {
                    var id = $("#modalDelete").data("id");
                    var url = $("#modalDelete").data("url");
                    U.ajax({
            //            progress:true,
                        url: url,
                        success:function(jsonData) {
                            if (jsonData.error) {
                                U.lobibox(jsonData.error.message, "error", "삭제 실패: " + jsonData.error.title);
                            }
                            if (jsonData.success) {
                                U.lobiboxMessage(id, "info", "삭제 성공");
                                refreshServiceTable();
//                                $("tr[data-id=" + id + "]").remove();
                            }
                            $("#modalDelete").modal("hide");
                        }
                    });
                });*/

                if(progress_flag){ // in progress 일 때
                    window.setTimeout(function(){refreshServiceTable();}, 1000);
                    // 카드 하나만 새로고침
                }
            } // success
        }
        // end success
    });
});