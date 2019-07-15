var modalUtil = new ModalUtil();
var service = {
    name: "",
    description: "",
    policy_list: [],
    vrouter_list: [],
    network_list: [],
    vm_template_list: [],
    volume: []
};

function deletePolicyHtml(elem) {$(elem).parent().remove();}

function dropdownEventModal(sel, key, value){
    $(sel).parents("ul").siblings("button").html('<span class="caret" style="float:right;margin-top:8px;"></span><span style="width:310px;float:right;text-align:center;">' + key + '</span>');
    $(sel).parents("ul").siblings("input").val(value);
}

function appendVMIntoPolicyList(elem, vm_name) {
    $(elem).parents("table").siblings("select").append("<option>" + vm_name + "</option>");
    $(elem).parents("tr").remove();
}

function showPolicyHtml(elem) {
    var appendedPolicyList = [];
    $.each($(elem).siblings("select").children(), function(index, element) {
        appendedPolicyList.push(element.text);
    });
    // 적용 대상 가상머신 - + 가상머신 추가
    var resource_VM = nodes.filter(function(d) {
        return d.resource_type == VM;
    });
    var tbodyHtml = "";
    var tdClass = ["rs_td02", "rs_td03"];
    for (var i = 0; i < resource_VM.length; i++) {
        if (appendedPolicyList.indexOf(resource_VM[i].name) == -1) {
//            tbodyHtml += "<tr><td class='td_nm'>" + resource_VM[i].name + "</td><td class='td_bt'><button type='button' class='btn btn-success' onclick=\"appendVMIntoPolicyList(this,\'" + resource_VM[i].name + "\')\"><i class='icon-trash'></i>추가</button></td></tr>";
            tbodyHtml += "<tr><td class='td_nm " + tdClass[i%2] + "'>" + resource_VM[i].name + "</td>";
            tbodyHtml += "<td class='td_bt " + tdClass[i%2] + "'>";
            tbodyHtml += "<button type='button' class='btn btn-success' onclick=\"appendVMIntoPolicyList(this,\'" + resource_VM[i].name + "\')\">추가</button>";
            tbodyHtml += "</td></tr>";
        }
    }
    $(elem).siblings("table").children("tbody").html(tbodyHtml);
}

function addVMIntoPolicy(elem) {
    if($(elem).siblings("table").attr("hidden") == "hidden"){
        showPolicyHtml(elem);
        $(elem).attr("src", "/static/img/dashboard/service/list_close_bt_01.png");
        $(elem).siblings("table").removeAttr("hidden");
    } else {
        $(elem).attr("src", "/static/img/dashboard/service/list_open_bt_01.png");
        $(elem).siblings("table").attr("hidden","");
    }
}

function removeVMinPolicy(elem) {
    var selected_vm = $(elem).siblings("select").children("option:selected");
    $.each(selected_vm, function(index, el){el.remove();});
    showPolicyHtml(elem);
}

/*var policyCnt = 0;
var policy_list = [];*/



$(function(){
    var urlStr = $(location).attr('pathname');
    var match = new RegExp("/dashboard/security/([\\w-]+)").exec(urlStr);
    var service_id = match[1];
//    getServiceAjax();
    getSecurityAjax();

    $("#saveBtn").on("click", function() {
        if ($(".right_pop").is(":visible")) {
            var confirmData = {
                title:"저장하기",
                message:"입력중인 정보창이 닫혀있지 않습니다.<br/><br/>저장하시겠습니까?",
                func:function() {
                    $("#resource_update").trigger("click");
                    submitSaveSecurity();
                },
                cancelFunc:function() {
                    selected_link = null;
                    selected_node = null;
                    showNodeInfo();
                    restart();
                    submitSaveSecurity();
                }
            };
            var rType = selected_node.resource_type;
            confirmInfoPop(rType, confirmData);
        } else {
            submitSaveSecurity();
        }
    });


    $(".modal-content.login_d01").css("width","420px");
});

function submitSaveSecurity() {
//        $("table").attr("hidden", "");
    modalUtil.setOption({
        "selector":"#modal",
        "width":"558px",
        "title":gettext("보안장비 생성"),
        "body":"#modalServiceBody",
        "footer":"#modalServiceFooter"
    });
    modalUtil.bindHtml();

    if (modifyFlag) {
        $("input[name=security_name]").val(service.name);
        $("textarea[name=description]").val(service.description);
        $("input[name=manufacturer_name]").val(service.manufacturer_name);
        $("input[name=software_version]").val(service.software_version);
    }
    $("#modal").modal();
    // $(".right_pop").show();
    $("#submit").off("click");
    $("#submit").on("click", function() {
        var name = $("input[name=security_name]").val();
        var check = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        if(check.test(name)) {
            U.lobiboxMessage("이름은 영어로 입력하세요.");
            return;
        } else if (isEmpty(name)) {
            U.lobiboxMessage("이름은 필수항목입니다.");
        }
        var description = $("textarea[name=description]").val();
        saveServiceAjax();
    });
}

$(function() {
    $(document).off("click", "#customCapability");
    $(document).on("click", "#customCapability", function() {
        PopupUtil({
            url: "/dashboard/security/create/capability",
            title: "제품 Capability 직접입력",
            width: 600,
            selector : "#topModal",
            success: function(result) {
            }
        });
    });
});