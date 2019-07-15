var operator = ["=", "<>", "like", "not like", "in", ">=", "<=", "not in"];
$(function() {
    initActionEvent();
});

// 액션 수정/생성 팝업 이벤트
function initActionEvent() {
    $(".action_detail").on("click", function() {
        var action_id = $(this).parent().data("action_id");
        PopupUtil({
            url: "action/modal",
            title: "액션 편집",
            tab: {selector: "#commonModal"},
            width: 1000,
            data: {"action_id": action_id},
            success: function(result) {
                initModalPopupEvent(result);
            }
        });
    });
    $("#create_action").click(function() {
        PopupUtil({
            url: "action/modal",
            title: "액션 생성",
            tab: {selector: "#commonModal"},
            width: 1000,
            success: function(result) {
                initModalPopupEvent(result);
            }
        });
    });
}

// 팝업 열린후 이벤트()
function initModalPopupEvent(result) {
    $("#submit_action").off("click");
    $("#submit_action").on("click", submitAction);
    $("#evaltype").change(function () {
        // evaltype 변경시 eval_formula 변경
        if ($(this).val() == 3) {
            $("#eval_formula").removeAttr("readonly");
        } else {
            $("#eval_formula").attr("readonly", "");
            var operator = " or ";
            if ($(this).val() == 1) {
                operator = " and ";
            }
            var eval_formula = "";
            $("#condition_list tbody tr").each(function(i, v) {
                if (i != 0) {
                    eval_formula += operator;
                }
                eval_formula += $(v).children("td:eq(0)").text();
            });
            $("#eval_formula").val(eval_formula);
        }
    });
    $("#find_condition").click(function() {
        // trigger리스트 새창
        var triggerListWindow = window.open("trigger_list", "trigger_list", 'width=800, height=700, toolbar=no, menubar=no, scrollbars=no, resizable=yes');
        triggerListWindow.focus();
    });
    $(".btn-add").click(function() {
        // 추가버튼클릭시
        var maxLabel = "";
        $("#condition_list tbody tr").each(function(i, v) {
            var label = $(this).children("td:eq(0)").text();
            if (!maxLabel.charCodeAt() || maxLabel.charCodeAt() < label.charCodeAt()) {
                maxLabel = label;
            }
        });
        $(".multiselect-list li").each(function(i, v) {
            maxLabel = createLabel(maxLabel);
            var newTr = $("<tr>", {
                data: {
                    condition: {
                        operator: $("#operator").val(),
                        conditiontype: $("#conditiontype").val(),
                        formulaid: maxLabel,
                        value: $(this).data("id"),
                        value2: ''
                    }
                }
            });
            var labelTd = $("<td>", {text: maxLabel});
            var nameTd = $("<td>", {text: /*$("#conditiontype option:selected").text()*/"trigger " + operator[$("#operator").val()] + " " + $(this).data("name")});
            var actionTd = $("<td>");
            actionTd.append($("<button>", {type: "button", class: "btn-del", text: "삭제"}));
            newTr.append(labelTd);
            newTr.append(nameTd);
            newTr.append(actionTd);
            $("#condition_list tbody").append(newTr);
        });
        setConditionText();
        $(".multiselect-list").html("");
    });
    $("#condition_list").on("click", ".btn-del", function() {
        var removeTr = $(this).parent().parent();
        removeTr.remove();
        setConditionText();
    });
    // 오퍼레이션-오퍼레이션-수정
    $("#def_operation").on("click", ".operation_update", function() {
        var selectedTr = $(this).parent().parent();
        var operation;
        if (typeof selectedTr.data("operation") == "string") {
            var operation_str = selectedTr.data("operation").replace(/'/g, "\"");
            operation = JSON.parse(operation_str);
        } else {
            operation = selectedTr.data("operation");
        }
        console.log(operation["operationid"]);
        $("#operation_detail").loadPage({
            url: "/dashboard/monitoring/action/modal/operation",
            data: {operation: JSON.stringify(operation)},
            success: function() {
                initOperationDetailEvent(selectedTr);
            }
        });
    });
    // 오퍼레이션-오퍼레이션-삭제
    $("#def_operation").on("click", ".operation_delete", function() {
        $(this).parent().parent().remove();
    });
    // 오퍼레이션-오퍼레이션- + 추가
    $("#operation_add").click(function() {
        $("#operation_detail").loadPage({
            url: "/dashboard/monitoring/action/modal/operation",
            success: function() {
                initOperationDetailEvent();
            }
        });
    });
}

// 다음문자 (예1 parameter 'A', return 'B' | 예2 parameter 'AZ', return 'BZ')
function createLabel(str) {
    var char = str.charAt(str.length - 1);
    if (isEmpty(char)) {
        result = "A";
    } else if (char.charCodeAt() == 90) { // notEmpty char && char == Z
        result = createLabel(str.substr(0, str.length - 1)) + "A"; // 재귀호출
    } else { // notEmpty char && char != Z
        result = str.substr(0, str.length - 1) + String.fromCharCode(char.charCodeAt() + 1);
    }
    return result;
}

function submitAction() {
    var data = {
        // 액션 설정
        "name": $("#action_name").val(),
        "status": ($("#available").is(":checked") ? 0 : 1),
        "esc_period": $("#period").val(),
        "def_shortdata": $("#def_shortdata").val(),
        "def_longdata": $("#def_longdata").val(),
        "filter": {
            "evaltype": $("#evaltype").val(),
            "conditions": []
        },
        // 오퍼레이션 설정
        "operations": [], // TODO: for문 돌려서 추가하기(push)
        // 복구시 오퍼레이션 설정
        "recovery_operations": [], // TODO: for문 돌려서 추가하기(push)
        // 인지시 오퍼레이션 설정
        "acknowledge_operations": [] // TODO: for문 돌려서 추가하기(push)
    };
    url = "/dashboard/monitoring/action/submit";
    var action_id = $("#action_id").val();
    if (action_id) {
        data["actionid"] = action_id;
    } else {
        data["eventsource"] = 0; // TODO: 현재 event created by a trigger만, 추후 eventsource가 추가될 수 있음
    }

    $("#condition_list>tbody tr").each(function(i, v) {
        var conditionData = $(v).data("condition");
        if (typeof conditionData == "string") {
            conditionData = JSON.parse(conditionData.replace(/'/g, '"'));
        }
        data["filter"]["conditions"].push({
            conditiontype: conditionData["conditiontype"],
            operator: conditionData["operator"],
            value: conditionData["value"]
        });
    });
    /*
        operationtype 현재 0 만 씀
        0 - send message;
        1 - remote command;
        2 - add host;
        3 - remove host;
        4 - add to host group;
        5 - remove from host group;
        6 - link to template;
        7 - unlink from template;
        8 - enable host;
        9 - disable host;
        10 - set host inventory mode.
    */

    data["operations"] = getDefOperationsData();
    var recovery_operations = [{
        "operationtype": "11",
        "opmessage": {
            "default_msg": 1
        }
    }];
    data["recovery_operations"] = recovery_operations;
    var acknowledge_operations = [{
        "operationtype": "12",
        "opmessage": {
            "default_msg": 1
        }
    }];
    data["acknowledge_operations"] = acknowledge_operations;
    P.json({
        url: url,
        data: {data: JSON.stringify(data)},
        success: function(result) {
            if (result.result) {
                location.reload();
            }
            if (result.error) {
                U.lobiboxMessage(result.error.data, "error", result.error.message);
            }
        }
    });
}

// 액션 생성/수정시 오퍼레이션 데이터 얻기
function getDefOperationsData() {
    var def_operations = [];
    $("#def_operation>tbody tr").each(function(i, v) {
        var def_opData = $(v).data("operation");
        if (typeof def_opData == "string") {
            def_opData = JSON.parse(def_opData.replace(/'/g, '"'));
        }
        var def_operation = {
            'operationtype': def_opData["operationtype"],
            'esc_period': def_opData["esc_period"],
            'esc_step_from': def_opData["esc_step_from"],
            'esc_step_to': def_opData["esc_step_to"],
            'evaltype': def_opData["evaltype"],
            'opmessage_usr': [],
            'opmessage_grp': [],
            'opmessage': {},
            'recovery': def_opData["recovery"],
            'opconditions': def_opData["opconditions"]
        }
//            'actionid': def_opData["actionid"],
//            'operationid': def_opData["operationid"]
        $.each(def_opData["opmessage_usr"], function(usri, usrv) {
            def_operation["opmessage_usr"].push({userid: usrv["userid"]});
        });
        $.each(def_opData["opmessage_grp"], function(usri, usrv) {
            def_operation["opmessage_grp"].push({usrgrpid: usrv["usrgrpid"]});
        });
        def_operation["opmessage"]["mediatypeid"] = def_opData["opmessage"]["mediatypeid"];
        if (def_opData["opmessage"]["default_msg"]) {
            def_operation["opmessage"]["default_msg"] = def_opData["opmessage"]["default_msg"];
        } else {
            def_operation["opmessage"]["default_msg"] = 1;
        }
        def_operations.push(def_operation);
    });
    return def_operations;
}

// 새창(trigger_list)에서 condition 선택시 추가
function addNewCondition(triggers, hostname) {
    var newTriggerList = triggers;
//    console.log(triggers);
    var multiselect_list = $(".multiselect-list");
//    var new_condition_list = $("#new_condition_value");
    $.each(triggers, function(i, trigger) {
        var new_condition = $("<li>", {data: {id: trigger.triggerid, name: hostname + " : " + trigger.name}});
        var subfilter_enabled = $("<span>", {class: "subfilter-enabled"});
        var condition_name = $("<span>", {text: trigger.name});
        var subfilter_disable_btn = $("<span>", {class: "subfilter-disable-btn", text: "x"}).on("click", function() {
            $(this).parents("li").remove();
        });
        condition_name.appendTo(subfilter_enabled);
        subfilter_disable_btn.appendTo(subfilter_enabled);
        subfilter_enabled.appendTo(new_condition);
        new_condition.appendTo(multiselect_list);
//
//        $("<input>", {
//            name: "new_condition[value][]",
//            value: trigger.trigger_id,
//            data: {name: trigger.name},
//            type:"hidden"
//        }).appendTo(multiselect_list);
    });
}

// operator type 수정시 condition 셋팅
function setConditionText() {
    var conditionText = "";
    $("#condition_list tbody tr").each(function(i, v) {
        var label = $(this).children("td:eq(0)").text();
        var operation;
        if ($("#evaltype").val() == 1) {
            operation = " and ";
        } else {
            operation = " or ";
        }
        if (i != 0 ) {
            conditionText += operation;
        }
        conditionText += label;
    });
    $("#eval_formula").val(conditionText);
}

// 오퍼레이션-오퍼레이션 수정/삭제 이벤트 정의
function initOperationDetailEvent(elem) {
    $("#operation_add_submit").click(function() {
        var newTr = $("<tr>", {
            data: {
                operation: {
                    'opmessage_usr': [{userid: $("#opmessage_usr").children("td").data("user_id")}],
                    'operationtype': 0,
                    'esc_step_from': $("#esc_step_from").val(),
                    'esc_step_to': $("#esc_step_to").val(),
                    'esc_period': $("#esc_period").val(),
                    'evaltype': 0,
                    'opmessage': {
                        'mediatypeid': $("#mediatype").val(),
                        'default_msg': $("#default_msg").is(":checked"),
                    }
                }
            }
        });
        var esc_step_from = Number.parseInt($("#esc_step_from").val());
        var esc_step_to = Number.parseInt($("#esc_step_to").val());
        var stepText = esc_step_from;
        var startTimeText = "즉시";
        if (esc_step_from != 1) {
            startTimeText = Number.parseInt((esc_step_from - 1) / 24) + "days, " + ((esc_step_from - 1) % 24) + ":00:00"
        }
        console.log(typeof $("#esc_step_from").val());
        if (esc_step_from < esc_step_to) {
            stepText += " - " + esc_step_to;
        }
        var stepTd = $("<td>", {text: stepText});
        var detailTd = $("<td>");

        var startTimeTd = $("<td>", {text: startTimeText});
        var periodText = "default";
        if ($("#esc_period").val() >= 60) {
            periodText = $("#esc_period").val();
        }
        var periodTd = $("<td>", {text: periodText});
        var actionTd = $("<td>");
        $("<button>", {type:"button", class:"operation_update", text: "수정"}).appendTo(actionTd);
        $("<button>", {type:"button", class:"operation_delete", text: "삭제"}).appendTo(actionTd);
        var detailUl = $("<ul>");
        var detailUser = $("<li>");
        detailUser.html("<span class=\"bold\">사용자:</span> " + $("#opmessage_usr").children("td").text());
        detailUl.append(detailUser);
        detailTd.append(detailUl);
        newTr.append(stepTd);
        newTr.append(detailTd);
        newTr.append(startTimeTd);
        newTr.append(periodTd);
        newTr.append(actionTd);
        $("#def_operation>tbody").append(newTr);
        $("#operation_detail").html("");
        if (elem) {
            elem.remove();
        }
    });
    $("#operation_add_cancel").click(function() {
        $("#operation_detail").html("");
    });
}