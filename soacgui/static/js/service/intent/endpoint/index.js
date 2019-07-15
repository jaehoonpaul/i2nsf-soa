$(document).ready(function() {
    var aTab = new TabUtil({selector:"#info_tab"}).run();

    // 레지스트레이션 팝업창
    $("#createReg").on("click", function() {
        PopupUtil({
            url: "/dashboard/service/intent/endpoint/create",
            title: gettext("Endpoint 생성"),
            width: 800,
            success: function(result) {
            }
        });
    });

    // 레지스트레이션 팝업창
    $(".btn-resend").on("click", function() {
        var metadata = $(this).parents("tr").data("metadata");
        resendEndpoint(metadata);
    });

    var actionGroup = new ActionGroup({
        "selector":"#endpointList",
        "clickEvent":function() {
            var endpointKey = $(this).parents("tr").data("key");
            var endpointName = $(this).parents("tr").data("end");
            if ($(this).hasClass("btn-delete")) {
                deleteEndpoint(endpointKey, endpointName);
            } else if ($(this).hasClass("btn-update")) {
                PopupUtil({
                    url: "/dashboard/service/intent/endpoint/" + endpointKey + "/update",
                    title: gettext("Endpoint 수정"),
                    width: 800,
                    success: function(result) {
                    }
                });
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();

    $("#deleteSubmit").off("click");

    $("#deleteSubmit").on("click", function() {
        var url = $("#modalDelete").data("url");
        var data = {};
        data["name"] = $("#modalDelete").data("name");
        $("#modalDelete").modal("hide");
        U.showProgress();
        U.ajax({
            url: url,
            data: data,
            success:function(jsonData) {
                var deleteStr = data["name"] + gettext("가 삭제되었습니다.");
                if (typeof jsonData.success != "undefined") {
                    U.lobiboxMessage(deleteStr, 'info', gettext('삭제'));
                } else {
                    U.lobibox(jsonData.message, 'error', gettext('삭제 실패'));
                }
                location.reload();
            }
        });
    });
    $(".intent-new-service").on("click", function() {
        Alert(gettext("Rule에서 intent 기반 서비스 생성을 누르세요."));
    });

});

function deleteEndpoint(endpoint_key, name) {
    $("#modalDelete").data("endpoint_key", endpoint_key);
    $("#modalDelete").data("name", name);
    $("#modalDelete .modal-body").text("Endpoint(" + name + gettext(")을 삭제하시겠습니까?"));
    $("#modalDelete").data("url", "/dashboard/service/intent/endpoint/" + endpoint_key + "/delete").modal();
}
function resendEndpoint(metadata) {
    U.ajax({
        url: "/dashboard/service/intent/endpoint/resend",
        data: {"metadata": JSON.stringify(metadata)},
        success:function(jsonData) {
            if (typeof jsonData.success != "undefined") {
                U.lobiboxMessage(gettext("성공"), 'info', gettext('전송'));
            } else {
                U.lobibox(jsonData.message, 'error', gettext('전송 실패'));
            }
            location.reload();
        }
    });
}