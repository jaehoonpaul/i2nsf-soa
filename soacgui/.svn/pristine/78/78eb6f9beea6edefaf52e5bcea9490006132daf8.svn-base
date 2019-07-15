// create / update
$(function() {
    $("#createModal").on("click", function() {
        showEditModal({
            title: "이미지 생성",
            success: function(result) {
                console.log(result);
                $("#source_type").on("change", function() {
                    if ($(this).val() == "file") {
                        $(".group_image_url").hide();
                        $(".group_image_file").show();
                    } else {
                        $(".group_image_file").hide();
                        $(".group_image_url").show();
                    }
                });
                $("#edit_submit").off("click");
                $("#edit_submit").on("click", createImage);
            }
        });
    });
    $(".btnUpdate").on("click", function() { // 데이터 가져와서 채우기
        var id = $(this).parents("tr").data("id");
        showEditModal({
            url: id + "/modal",
            title: "이미지 편집",
            success: function(result) {
                $("#source_type").on("change", function() {
                    if ($(this).val() == "file") {
                        $(".group_image_url").hide();
                        $(".group_image_file").show();
                    } else {
                        $(".group_image_file").hide();
                        $(".group_image_url").show();
                    }
                });
                $("select[name=disk_format]").val($("select[name=disk_format]").data("selected"));
                $("#edit_submit").off("click");
                $("#edit_submit").on("click", updateImage);
            }
        });
    });
    actionGroupEvent();
});

function actionGroupEvent() {
    var actionGroup = new ActionGroup({
        "selector":"#images",
        "clickEvent":function() {
            var image_id = $(this).parents("tr").data("id");
            if ($(this).hasClass("btnDelete")) {
                var image_name = $(this).parents("tr").children("td.name").text();
                $("#modalDelete .modal-body").text(image_name + "(" + image_id + ")를 삭제하시겠습니까?");
                $("#modalDelete").data("id", image_id);
                $("#modalDelete").data("name", image_name);
                $("#modalDelete").data("url", image_id + "/delete").modal();
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();

    $("#deleteSubmit").on("click", function() {
        var id = $("#modalDelete").data("id");
        var name = $("#modalDelete").data("name");
        var url = $("#modalDelete").data("url");
        U.ajax({
            url: url,
            success:function(jsonData) {
                if (typeof jsonData.success != "undefined") {
                    U.lobiboxMessage('Image(' + name + ')가 삭제되었습니다.', 'info', '삭제');
                    location.reload();
                }
            }
        });
    });
}

function showEditModal(opt) {
    if (!opt.url) {
        opt.url = "modal";
    }
    PopupUtil(opt);
}

function createImage() {

    if (!$("#editFrm").checkform()) {
        return;
    }
    var data = $("#editFrm").serializeObject();
    data["is_copying"] = (data["is_copying"] === "on") ? true : false;
    data["visibility"] = (data["visibility"] === "on") ? "public" : "private"; // "shared"
    data["protected"] = (data["protected"] === "on") ? true : false;
    U.ajax({
        url: "create",
        data: {data: JSON.stringify(data)},
        success:function(result) {
            if (result.success) {
                U.lobiboxMessage('Image가 생성되었습니다.', 'info', '생성');
                location.reload();
            }
        }
    });
}

function updateImage() {
    U.lobiboxMessage("정의가 필요함", "info")
    return;
    var data = $("#editFrm").serializeObject();
    data["is_copying"] = (data["is_copying"] === "on") ? true : false;
    data["visibility"] = (data["visibility"] === "on") ? "public" : "private"; // "shared"
    data["protected"] = (data["protected"] === "on") ? true : false;
    U.ajax({
        url: "create",
        data: {data: JSON.stringify(data)},
        success:function(result) {
            if (result.success) {
                U.lobiboxMessage('Image가 생성되었습니다.', 'info', '생성');
                location.reload();
            }
        }
    });
}