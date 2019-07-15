$(function() {
    $("#all_triggers").attr("checked", false);
    $("#groupid").change(function() {
        // group 변경시 host(or template) 목록 가져오기
        var groupids = $(this).val();
        var groupname = $(this).children("option:selected").text();
        P.json({
            url: "/dashboard/monitoring/",
            data: {groupids: groupids, groupname: groupname},
            success: function(result) {
                if (result.result) {
                    $("#hostid").html("");
                    $.each(result.result, function(i, v) {
                        var value = v.hostid;
                        if (v.templateid) {
                            value = v.templateid;
                        }
                        $("<option>", {value: value, text: v.host}).appendTo($("#hostid"));
                    });
                    $("#hostid").change();
                }
            }
        });
    });
    $("#hostid").change(function() { // host(or template) 변경시 trigger 목록 가져오기
        var data = {};
        var groupname = $("#groupid").children("option:selected").text();
        var hostname = $(this).children("option:selected").text();
        if (groupname.includes("Template")) {
            data["templateids"] = $(this).val();
        } else {
            data["hostids"] = $(this).val();
        }
//        var hostname = $(this).children("option:selected").text();
        P.json({
            url: "/dashboard/monitoring/get_triggers",
            data: data,
            success: function(result) {
                if (result.result) { // trigger 목록 테이블에 셋팅
                    $(".common-tab-01 tbody").html("");
                    $.each(result.result, function(i, v) {
                        var newTr = $("<tr>");
                        // checkbox
                        var checkTd = $("<td>");
                        var newCheckBox = $("<input>", {class: "trigger-check", id: "triggers_'" + v.triggerid + "'", name: "triggers['" + v.triggerid + "']", value: v.triggerid, type: "checkbox"});
                        // 이름(트리거 명)
                        var nameTd = $("<td>", {class: "name"});
                        var trigger_name = v.description.replace(/\{HOST.NAME\}/g, hostname);
                        v["name"] = trigger_name;
                        var newAName = $("<a>", {
                            data: {object: v}, href: "javascript:void(0);", text: trigger_name
                        });
                        newAName.click(function() {
                            // console.log($(".multiselect-list", opener.document));
                            var hostname = $("#hostid option:selected").text();
                            opener.parent.addNewCondition([$(newAName).data("object")], hostname); // 부모창의 function호출
                            opener.focus(); // 부모창 focus 일딴 안되는듯
                            window.close(); // 현재창(새창) 닫기
                        });
                        // 심각도
                        var severity = ["not classified", "infomation", "warning", "average", "high", "disaster"];
                        var priority = severity[v.priority];
                        var severityTd = $("<td>", {class: priority + "-bg", text: priority});
                        // 상태
                        var statusTd = $("<td>", {class: (v.status == 1) ? "red" : "green", text: v.status ? "Enabled" : "Disabled"});
                        checkTd.append(newCheckBox);
                        nameTd.append(newAName);
                        newTr.append(checkTd);
                        newTr.append(nameTd);
                        newTr.append(severityTd);
                        newTr.append(statusTd);
                        $(".common-tab-01 tbody").append(newTr);
                    });
                }
            }
        });
    });
    $("#all_triggers").click(function() {
        var check = this.checked;
        console.log(check);
        $(".trigger-check").each(function() {
            this.checked = check;
        });
    });
    $("#select").click(function() {
        var selectTriggerList = [];
        $(".trigger-check").each(function() {
            if (this.checked) {
                selectTriggerList.push($(this).parent().siblings(".name").children("a").data("object"));
            }
        });
        var hostname = $("#hostid option:selected").text();
        opener.parent.addNewCondition(selectTriggerList, hostname); // 부모창의 function호출
        opener.focus(); // 부모창 focus 일딴 안되는듯
        window.close(); // 현재창(새창) 닫기
    });
    $("#groupid").change();
    $("#hostid").change();
});

