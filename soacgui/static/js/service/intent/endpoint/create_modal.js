$(function() {
    $("select[name=endpoint_type]").on("change", function() {
        if ($(this).val() == "url") {
            $(".endpoint-ip").hide();
            $(".endpoint-url").show();
        } else {
            $(".endpoint-ip").show();
            $(".endpoint-url").hide();
        }
    });
    $("select[name=endpoint_type]").change();
    $("#submit").on("click", function() {
        var endpointType = $("select[name=endpoint_type]").val();
        var name = $("input[name=name]").val();
        var metadata = {"ietf-i2nsf-cfi-policy:policy": {}};

        if (endpointType == "url") {
            metadata["ietf-i2nsf-cfi-policy:policy"]["threat-prevention"] = {
                "payload-content": [{
                    "name": name,
                    "content": [$("input[name=content]").val()]
                }]
            };
        } else {
            metadata["ietf-i2nsf-cfi-policy:policy"]["endpoint-group"] = {}
            metadata["ietf-i2nsf-cfi-policy:policy"]["endpoint-group"][endpointType + "-group"] = [{
                "name": name,
                "range-ip-address": [{
                    "start-ip-address": $("input[name=start-ip-address]").val(),
                    "end-ip-address": $("input[name=end-ip-address]").val()
                }]
            }];
        }
        var data = {
            name: name,
            metadata: JSON.stringify(metadata),
            endpoint_type: endpointType
        };

        var url = "/dashboard/service/intent/endpoint/create";
        var endpointKey = $("input[name=endpoint_key]").val();
        if (endpointKey) {
            url = "/dashboard/service/intent/endpoint/" + endpointKey + "/update";
        }
        U.ajax({
            url: url,
            data: data,
            success:function(jsonData) {
                if (typeof jsonData.error == "undefined") {
                    U.lobiboxMessage("Success", 'info', '등록 성공');
                    location.reload();
                } else {
                    U.lobibox(jsonData.message, 'error', '등록 실패');
                }
            }
        });
    });
});