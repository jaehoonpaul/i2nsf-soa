
$(function() {
    var capaGroup = $(".capability-group").clone();

    $("#addCapability").on("click", function() {
        var capaGroupClone = capaGroup.clone();
        $("#capaField").append(capaGroupClone);
        capaGroupClone.children("input[name=capability_name]").focus();
    });
    $(document).off("keypress", ".input-field");
    $(document).on("keypress", ".input-field", function(event) {
        if(event.keyCode == 13) {
            var fieldData = $(this).val();
            if (isEmpty(fieldData)) {
                Alert("값을 입력해 주세요");
            } else {
                var tempField = $("<li>");
                var btnDelField = $("<span>", {text: "x", class: "btn-delete-field"});
                tempField.append($("<div>", {text: fieldData, class: "field-value"}))
                    .append(btnDelField)
                    .append($("<div>", {class: "clear_float"}));
                $(this).parent().find("ul").append(tempField);
                $(this).val("");
            }
        }
    });

    $(document).off("click", ".btn-delete-capability");
    $(document).on("click", ".btn-delete-capability", function() {
        if ($(".btn-delete-capability").size() > 1) {
            $(this).parent().remove();
        } else {
            Alert("Capability는 하나 이상 존재해야 합니다.");
        }
    });
    $(document).off("click", ".btn-delete-field");
    $(document).on("click", ".btn-delete-field", function() { $(this).parent().remove(); });

    $("#createCapabilityAdd").on("click", function() {
        var name = $("input[name=nsf_name]").val();
        var check = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        if(check.test(name)) {
            U.lobiboxMessage("이름은 영어로 입력하세요.");
            return;
        } else if (isEmpty(name)) {
            U.lobiboxMessage("이름은 필수항목입니다.");
        }
        var processing = $("input[name=processing]").val();
        var inbound = $("input[name=inbound]").val();
        var outbound = $("input[name=outbound]").val();
        var initiated = $("input[name=initiated]:checked").val();

        var nsf = {
            name: name,
            processing: processing,
            inbound: inbound,
            outbound: outbound,
            initiated: initiated,
            capability_list: []
        };

        $(".capability-group").each(function(c_i, capa) {
            capability = {
                name: $(capa).find("input[name=capability_name]").val(),
                field_list: []
            };
            $(capa).find(".field-value").each(function(f_i, field) {
                capability.field_list.push({name: $(field).text()});
            });
            nsf.capability_list.push(capability);
        });
        $("#customCapabilityData").val(JSON.stringify(nsf));
    });
});