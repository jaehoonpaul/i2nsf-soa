$(function() {
    actionEvent();
    $("#create_domain").on("click", function() {
        PopupUtil({
            title: "도메인 추가",
            url:"/domain/modal",
            success: function(result) {
                $("#edit_domain_submit").off("click");
                $("#edit_domain_submit").on("click", createDomain);
            }
        });
    });
    $(".update_domain").on("click", function() {
        var domain_key = $(this).parents("tr").data("domain_key");
        var origin_domain_name = $(this).parents("tr").children("td.name").text().trim();
        PopupUtil({
            title: "도메인 수정",
            url: "/domain/" + domain_key + "/modal",
            success: function(result) {
                $("#edit_domain_submit").off("click");
                $("#edit_domain_submit").on("click", {domain_key: domain_key, origin_domain_name: origin_domain_name}, updateDomain);
            }
        });
    });
});

function createDomain() {
    var data = {
        domain_name : $("input[name=domain_name]").val(),
        auth_url : $("input[name=domain_auth_url]").val(),
        description : $("input[name=domain_description]").val(),
        db_ip: $("input[name=db_ip]").val(),
        db_port: $("input[name=db_port]").val(),
        db_user: $("input[name=db_user]").val(),
        db_pass: $("input[name=db_password]").val()
    };
    U.ajax({
        url:"/domain/create",
        data:data,
        success:function(jsonData) {
            if (jsonData.error) {
                U.lobiboxMessage(jsonData.error.message, "error", jsonData.error.title);
            }
            U.lobiboxMessage(jsonData.success.message, "info", jsonData.success.title);
            $("#modal").modal("hide");
            location.reload();
        }
    });
}

function updateDomain(event) {
    var data = {
        domain_name : $("input[name=domain_name]").val(),
        auth_url : $("input[name=domain_auth_url]").val(),
        description : $("input[name=domain_description]").val(),
        db_ip: $("input[name=db_ip]").val(),
        db_port: $("input[name=db_port]").val(),
        db_user: $("input[name=db_user]").val(),
        db_pass: $("input[name=db_password]").val(),
        origin_domain_name: event.data.origin_domain_name
    };
    U.ajax({
        url:"/domain/" + event.data.domain_key + "/update",
        data:data,
        success:function(jsonData) {
            if (jsonData.error) {
                U.lobiboxMessage(jsonData.error.message, "error", jsonData.error.title);
            }
            U.lobiboxMessage(jsonData.success.message, "info", jsonData.success.title);
            $("#modal").modal("hide");
            location.reload();
        }
    });
}

function actionEvent() {
    var actionGroup = new ActionGroup({
        "selector":".contents",
        "clickEvent":function() {
            var domain_key = $(this).parents("tr").data("domain_key");
            var seq = $(this).parents("tr").data("seq");
            var domain_name = $(this).parents("tr").children("td.name").text().trim();
            var domainTRList = $(".domain_row");
            var maxSeq = 0;
            var minSeq = 10;
            $(".domain_row").each(function(i, elem) {
                var tmpSeq = $(elem).data("seq");
                if (minSeq >= tmpSeq) {
                    minSeq = tmpSeq;
                }
                if (maxSeq <= tmpSeq) {
                    maxSeq = tmpSeq;
                }
            });

            if ($(this).hasClass("delete_domain")) {
                U.confirm({
                    title:"삭제",
                    message:domain_name + "(" + domain_key + ")" + "를 삭제하시겠습니까?",
                    func:function() {
                        U.ajax({
                            url:"/domain/" + domain_key + "/delete",
                            data: {domain_name: domain_name},
                            success:function(jsonData) {
                                if (jsonData.error) {
                                    U.lobiboxMessage(jsonData.error.message, "error", jsonData.error.title);
                                }
                                U.lobiboxMessage(jsonData.success.message, "info", jsonData.success.title);
                                location.reload();
                            }
                        });
                    }
                });
            } else if ($(this).hasClass("down_domain")) {
                var nextDomainKey = $("tr[data-seq=" + (seq + 1) + "]").data("domain_key");
                if (seq < maxSeq) {
                    U.ajax({
                        url:"/domain/" + domain_key + "/up",
                        data: {domain_name: domain_name, next_domain_key: nextDomainKey, seq: seq},
                        success:function(jsonData) {
                            if (jsonData.error) {
                                U.lobiboxMessage(jsonData.error.message, "error", jsonData.error.title);
                            }
                            if (jsonData.success) {
                                U.lobiboxMessage(jsonData.success.message, "info", jsonData.success.title);
                                location.reload();
                            }
                        }
                    });
                }
            } else if ($(this).hasClass("up_domain")) {
                if (seq > minSeq) {
                    var preDomainKey = $("tr[data-seq=" + (seq - 1) + "]").data("domain_key");
                    U.ajax({
                        url:"/domain/" + domain_key + "/down",
                        data: {domain_name: domain_name, pre_domain_key: preDomainKey, seq: seq},
                        success:function(jsonData) {
                            if (jsonData.error) {
                                U.lobiboxMessage(jsonData.error.message, "error", jsonData.error.title);
                            }
                            if (jsonData.success) {
                                U.lobiboxMessage(jsonData.success.message, "info", jsonData.success.title);
                                location.reload();
                            }
                        }
                    });
                }
            } else if ($(this).hasClass("db_set")) {
                U.ajax({
                    url:"/domain/db_set",
                    data: {domain_key: domain_key},
                    success:function(jsonData) {
                        if (jsonData.error) {
                            U.lobiboxMessage(jsonData.error.title, "error", jsonData.error.message);
                        }
                        if (jsonData.success) {
                            U.lobiboxMessage(jsonData.success.title, "info", jsonData.success.message);
                            location.reload();
                        }
                    }
                });
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();
}