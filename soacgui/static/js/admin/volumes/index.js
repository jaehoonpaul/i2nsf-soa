// create
$(function() {

    U.ajax({
        url : '/dashboard/admin/volumes/create',
        type: "get",
        dataType: "json",
        success: function(result) {
            var error_key_list = [];
            if (result.error) {
                error_key_list = Object.keys(result.error);
                $.each(result.error, function(k, v) {
                    U.lobibox(v, "error", k);
                });
            }
            var images;
            if (error_key_list.indexOf("images") == -1) {
                images = result.success.images;
            }
            var select_image = $("#inputImage").empty();
            select_image.append("<option value=''>이미지 선택</option>");
            $.each(images, function(i, image) {
                select_image.append("<option value='"+image.id+"'>"+image.name+"</option>");
            });
            console.log(images)

            var volume_types;
            var select_volume_type = $("#inputType").empty();
            select_volume_type.append("<option value=''>볼륨 타잆 없음</option>");
            if (error_key_list.indexOf("volume_types") == -1) {
                volume_types = result.success.volume_types;
            }
            $.each(volume_types, function(i, volume_type) {
                select_volume_type.append("<option value='" + volume_type.id + "'>" + volume_type.name + "</option>");
            });
        }
    });
    $("#create").on("click", function() {
        $("#modalCreate").modal();
    });
    $("#inputSource").on("change", function() {
        if ($(this).val() == "") {
            $("#areaSourceImage").hide();
        } else {
            $("#areaSourceImage").show();
        }
    });
    $("#areaSourceImage").hide();
    $("#btnCreateSave").on("click", function() {
        var data = {
            "size": $("#inputSize").val(),
            "description": $("#inputDesc").val(),
            "name": $("#inputName").val(),
        };
        if (!isEmpty($("#inputAvailable").val())) {
            data.available = $("#inputAvailable").val();
        }
        if (!isEmpty($("#volume_type").val())) {
            data.volume_type = $("#inputType").val();
        }
        if (!isEmpty($("#inputImage").val())) {
            data.imageRef = $("#inputImage").val();
        }
        U.ajax({
            url : '/dashboard/admin/volumes/create',
            dataType: "json",
            data: {"data": JSON.stringify({"volume": data})},
            success: function(result) {
                if (result.error) {
                    U.lobibox(result.error.message, "error", result.error.title);
                } else {
                    U.lobiboxMessage("볼륨이 생성되었습니다.", "info");
                    $("#modalCreate").modal("hide");
                    location.reload();
                }
            }
        });
    });
});
// delete
$(function() {
    $("table").on("click", ".btnDelete", function() {
        var id = $(this).parents("tr").data("id");
        $("#modalDelete").data("id", id).modal();
    });
    $("table").on("click", ".sync", function() { // TODO: soam sync delete
        var id = $(this).parents("tr").data("id");
        PopupUtil({
            url: id + "/sync_modal",
            title: "soam sync",
            tab: {selector: "#commonModal"},
            width: 1000,
            success: function(result) {
                $("#submit_sync").on("click", function() {
                    U.ajax({
                        url : id + "/sync",
                        data: {"service_id": $("input[name=service_id]").val()},
                        success:function(jsonData){
                            U.lobiboxMessage(jsonData.result, "info");
                        }
                    });
                });
            }
        });
    });
    $("#deleteSubmit").on("click", function() {
        var id = $("#modalDelete").data("id");
        U.ajax({
            url : '/dashboard/admin/volumes/' + id + '/delete',
            dataType: "json",
            success: function(result) {
                if (result.error) {
                    U.lobibox(result.error.message, "error", result.error.title);
                } else {
                    U.lobiboxMessage("볼륨이 삭제되었습니다.", "info");
                    $("#modalDelete").modal("hide");
                    location.reload();
                }
            }
        });
    });
});
