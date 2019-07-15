function setInitRouting() {
    // 열기/닫기
    $(".toggle_src_rule").on("click", function() {
        var nextTr = $(this).closest('tr').next();
        if (nextTr.is(":visible")) {
            $(this).text("열기");
            nextTr.slideUp("fast");
        } else {
            $(".toggle_src_rule").text("열기");
            $(this).text("닫기");
            $(".src_list").slideUp("fast");
            nextTr.slideDown("fast");
        }
    });
    // src 생성 클릭시 생성
    $("#create_pbr_table").off("click");
    $("#create_pbr_table").on("click", function() {
        PopupUtil({
            url: "/dashboard/service/routing/src_rule/create",
            data: {router_id: $("input[name=router_id]").val(), netnodeip: $("input[name=netnodeip]").val(), type: "type1"},
            selector: "#topModal",
            title: "송신지 기반 정책 테이블 추가",
            width: 900,
            success: function(result) {
                var pbr = selected_routing.split("-")[0];
                var index;
                $("#src_route_list tr").each(function(i, tr) {
                    var pbr_table_name = $(tr).data("pbr_table");
                    if (typeof pbr_table_name != "undefined" && pbr_table_name.indexOf(pbr) != -1) {
                        var idx = Number.parseInt(pbr_table_name.replace(/\w+/, "").replace("_", ""));
                        if (typeof index == "undefined") {
                            if (Number.isNaN(idx)) {
                                index = 0;
                            } else if (0 <= idx) {
                                index = idx + 1;
                            }
                        } else {
                            if (index < (idx + 1)) {
                                index = idx + 1;
                            }
                        }
                    }
                });
                if (typeof index != "undefined") {
                    pbr += "_" + index;
                    $("#create_pbr_table_name").text(pbr);
                }
                initCreateSrcPop(result);
                $("#submit_src_rule").on("click", createPbrTable);
            }
        });
    });
    var actionGroup = new ActionGroup({
        "selector":"#src_route_list",
        "clickEvent":function() {
            var network_id = $(this).parents("tr").data("id");
            var pbr = $(this).parents("tr").data("pbr_table");
            if ($(this).hasClass("create_src_rule")) {
                PopupUtil({
                    url: "/dashboard/service/routing/src_rule/create",
                    data: {router_id: $("input[name=router_id]").val(), netnodeip: $("input[name=netnodeip]").val(), type: "type2"},
                    selector: "#topModal",
                    title: "송신지 기반 정책 규칙 추가",
                    width: 900,
                    success: function(result) {
                        $("#create_pbr_table_name").text(pbr);
                        initCreateSrcPop(result);
                        $("#submit_src_rule").on("click", createSrcRule);
                    }
                });
            // src 삭제 클릭시 확인 팝업
            } else if ($(this).hasClass("delete_pbr_table")) {
                var type = $(this).parents("tr").data("type");
                var delete_pbr_table = $(this).parents("tr").data("pbr_table");
                $("#modalDelete").data("pbr_table", delete_pbr_table);
                $("#modalDelete").data("type", type);
                $("#modalDelete .modal-body").text("PBR TABLE(" + delete_pbr_table + ")을 삭제하시겠습니까?");
                $("#modalDelete").data("url", "/dashboard/service/routing/qrouter-" + selected_routing + "/src_rule/delete").modal();
            }
        }
    });
    actionGroup.setCloseEvent();
    actionGroup.run();
    // dst 삭제 클릭시 확인 팝업
    $(".delete_dst_rule").off("click");
    $(".delete_dst_rule").on("click", function() {
        var dest = $(this).parents("tr").data("dest");
        var via = $(this).parents("tr").data("via");
        var dev = $(this).parents("tr").data("dev");
        $("#modalDelete .modal-body").text(dev + "(dest=" + dest + ", gateway=" + via + ")를 삭제하시겠습니까?");
        $("#modalDelete").data("dest", dest + "/24");
        $("#modalDelete").data("via", via);
        $("#modalDelete").data("dev", dev);
        $("#modalDelete").data("url", "/dashboard/service/routing/qrouter-" + selected_routing + "/dst_rule/delete").modal();
    });
    // src 삭제 클릭시 확인 팝업
    $(".delete_src_rule").off("click");
    $(".delete_src_rule").on("click", function() {
        var type = $(this).parents("tr").data("type");
        var dest = $(this).parents("tr").data("dest");
        var via = $(this).parents("tr").data("via");
        var dev = $(this).parents("tr").data("dev");
        var pbr = $(this).parents("tr").data("pbr");
        $("#modalDelete").data("dest", dest);
        $("#modalDelete").data("via", via);
        $("#modalDelete").data("dev", dev);
        $("#modalDelete").data("type", type);
        $("#modalDelete").data("pbr", pbr);
        $("#modalDelete .modal-body").text(dev + "(dest=" + dest + ", via=" + via + ", " + pbr + ")를 삭제하시겠습니까?");
        $("#modalDelete").data("url", "/dashboard/service/routing/qrouter-" + selected_routing + "/src_rule/delete").modal();
    });
    // src/dst 삭제
    $("#deleteSubmit").off("click");
    $("#deleteSubmit").on("click", function() {
        var url = $("#modalDelete").data("url");
        var type = $("#modalDelete").data("type");
        var data = {};
        if (type == 'pbrtable') { // src pbr_table
            data["pbrtable"] = $("#modalDelete").data("pbr_table");
        } else if (!isEmpty($("#modalDelete").data("dest"))) { // dst, src type2
            data["dest"] = $("#modalDelete").data("dest");
            data["via"] = $("#modalDelete").data("via");
            data["dev"] = $("#modalDelete").data("dev");
            data["pbr"] = $("#modalDelete").data("pbr");
        }
        if (!isEmpty(type)) { // src type1, type2, pbrtable
            data["type"] = type;
        }
        $("#modalDelete").modal("hide");
        U.showProgress();
        U.ajax({
            url: url,
            data: {data: JSON.stringify(data), netnodeip: $("input[name=netnodeip]").val()},
            success:function(jsonData) {
                var deleteStr = data["dev"] + "(dest=" + data["dest"] + ", gateway=" + data["via"] + ")가 삭제되었습니다.";
                if (typeof jsonData.success != "undefined") {
                    if (type == 'pbrtable') {
                        deleteStr = data["pbrtable"] + "이 삭제되었습니다."
                    } else if (type == 'type2') {
                        deleteStr = data["dev"] + "(dest=" + data["dest"] + ", gateway=" + data["via"] + ", " + data["pbrtable"] + ")가 삭제되었습니다."
                    }
                    U.lobiboxMessage(deleteStr, 'info', '삭제');
                    reloadRouting();
                } else {
                    U.lobibox(jsonData.message, 'error', '삭제 실패');
                }
                $("#modalDelete").modal("hide");
            }
        });
    });
    // dst 생성 클릭시 생성
    $("#create_dst_rule").off("click");
    $("#create_dst_rule").on("click", function() {
        PopupUtil({
            url: "/dashboard/service/routing/dst_rule/create",
            data: {router_id: $("input[name=router_id]").val(), netnodeip: $("input[name=netnodeip]").val()},
            selector: "#topModal",
            title: "목적지 기반 정책 추가",
            success: function(result) {
                $("select[name=dst_dev]").change(function() {
                    console.log($("select[name=dst_dev] option:selected").data("info"));
                    var dest = JSON.parse($("select[name=dst_dev] option:selected").data("info").replace(/'/g, '"')).Destination;
                    if (!isEmpty(dest)) {
                        $(".dst-info").text("dest: " + dest);
                    }
                });
                $("select[name=dst_dev]").change();
                initCreateDstPop(result);
                $("#submit_dst_rule").on("click", createDstRule);
            }
        });
    });
    // src type 변경시 입력란 변경
//    $("select[name=src_type]").on("change", function() {
//        if ($(this).val() == "type1") {
//            $(".src-type1").show();
//            $(".src-type2").hide();
//        } else {
//            $(".src-type1").hide();
//            $(".src-type2").show();
//        }
//    });
}

function reloadRouting() {
    PopupUtil({
        url: "/dashboard/service/routing/" + selected_routing,
        title: "라우팅 정책 설정",
        tab: {selector: "#commonModal"},
        width: 1000,
        success: function(result) {
            setInitRouting();
        }
    });
}

function createDstRule() {
    var data = {};
    data["dest"] = $("input[name=dst_dest]").val()
    data["via"] = $("input[name=dst_via]").val()
    data["dev"] = $("select[name=dst_dev]").val()
    U.ajax({
        url: "/dashboard/service/routing/" + selected_routing + "/dst_rule/create",
        data: {data: JSON.stringify(data), netnodeip: $("input[name=netnodeip]").val()},
        show: false,
        success:function(jsonData) {
            if (jsonData.success) {
                $("#topModal").modal("hide");
                reloadRouting();
            } else {
                U.lobibox(jsonData.message, "error", "Create Error");
            }
        }
    });
}
function createPbrTable() {
    var data = {};
    data["src"] = $("input[name=src_src]").val();
    data["pbr"] = $("#create_pbr_table_name").text();
    U.ajax({
        url: "/dashboard/service/routing/" + selected_routing + "/src_rule/create",
        data: {data: JSON.stringify(data), netnodeip: $("input[name=netnodeip]").val(), type: "type1"},
        show: false,
        success:function(jsonData) {
            if (jsonData.success) {
                $("#topModal").modal("hide");
                reloadRouting();
            } else {
                U.lobibox(jsonData.message, "error", "Create Error");
            }
        }
    });
}
function createSrcRule() {
    var data = {};
    data["via"] = $("input[name=src_via]").val();
    data["dest"] = $("input[name=dest_net]").val();
    data["dev"] = $("select[name=src_dev]").val();
    data["pbr"] = $("#create_pbr_table_name").text();
    U.ajax({
        url: "/dashboard/service/routing/" + selected_routing + "/src_rule/create",
        data: {data: JSON.stringify(data), netnodeip: $("input[name=netnodeip]").val(), type: "type2"},
        show: false,
        success:function(jsonData) {
            if (jsonData.success) {
                $("#topModal").modal("hide");
                reloadRouting();
            } else {
                U.lobibox(jsonData.message, "error", "Create Error");
            }
        }
    });
}

function initCreateSrcPop(result) {
    $("select[name=src_dev]").change(function() {
        var dev = JSON.parse($("select[name=src_dev] option:selected").data("info").replace(/'/g, '"'));
        if (!isEmpty(dev)) {
            var dev_str = "";
//            dev_str += '<table class="common-tab-02" cellpadding="0" border="0" cellspacing="0">';
//            dev_str += '    <colgroup>';
//            dev_str += '        <col style="width:105px;">';
//            dev_str += '        <col style="">';
//            dev_str += '        <col style="width:80px;">';
//            dev_str += '        <col style="">';
//            dev_str += '        <col style="width:80px;">';
//            dev_str += '        <col style="">';
//            dev_str += '    </colgroup>';
//            dev_str += '    <tr>';
//            dev_str += '        <th class="link-encap">Link encap</th>';
//            dev_str += '        <td>' + dev.link_encap + '</td>';
//            dev_str += '        <th class="hwaddr">HWaddr</th>';
//            dev_str += '        <td colspan="3">' + dev.hw_addr + '</td>';
//            dev_str += '    </tr>';
//            dev_str += '    <tr>';
//            dev_str += '        <th class="inet-addr">inet addr</th>';
//            dev_str += '        <td>' + dev.inet_addr + '</td>';
//            dev_str += '        <th class="bcast">Bcast</th>';
//            dev_str += '        <td>' + dev.b_cast + '</td>';
//            dev_str += '        <th class="mask">Mask</th>';
//            dev_str += '        <td>' + dev.mask + '</td>';
//            dev_str += '    </tr>';
//            dev_str += '    <tr>';
//            dev_str += '        <th class="inet6-addr">inet6 addr</th>';
//            dev_str += '        <td>' + dev.inet6_addr + '</td>';
//            dev_str += '        <th class="scope">scope</th>';
//            dev_str += '        <td colspan="3">' + dev.scope + '</td>';
//            dev_str += '    </tr>';
//            dev_str += '</table>';
            dev_str += "&nbsp;&nbsp;&nbsp;Link encap: ";
            dev_str += dev.link_encap;
            dev_str += "&nbsp;&nbsp;&nbsp;HWaddr: ";
            dev_str += dev.hw_addr;
            dev_str += "<br/>";
            dev_str += "&nbsp;&nbsp;&nbsp;inet addr: ";
            dev_str += dev.inet_addr;
            if (dev.link_encap != 'Local') {
                dev_str += "&nbsp;&nbsp;&nbsp;Bcast: ";
                dev_str += dev.b_cast;
            }
            dev_str += "&nbsp;&nbsp;&nbsp;Mask: ";
            dev_str += dev.mask;
            dev_str += "<br/>";
            dev_str += "&nbsp;&nbsp;&nbsp;inet6 addr: ";
            dev_str += dev.inet6_addr;
            dev_str += "&nbsp;&nbsp;&nbsp;scope: ";
            dev_str += dev.scope;
            $(".dst-info").html(dev_str);
        }
    });
    $("select[name=src_dev]").change();
}

function initCreateDstPop(result) {
    $("select[name=dst_dev]").change(function() {
        var dev = JSON.parse($("select[name=dst_dev] option:selected").data("info").replace(/'/g, '"'));
        if (!isEmpty(dev)) {
            var dev_str = "";
//            dev_str += '<table class="common-tab-02" cellpadding="0" border="0" cellspacing="0">';
//            dev_str += '    <colgroup>';
//            dev_str += '        <col style="width:105px;">';
//            dev_str += '        <col style="">';
//            dev_str += '        <col style="width:80px;">';
//            dev_str += '        <col style="">';
//            dev_str += '        <col style="width:80px;">';
//            dev_str += '        <col style="">';
//            dev_str += '    </colgroup>';
//            dev_str += '    <tr>';
//            dev_str += '        <th class="link-encap">Link encap</th>';
//            dev_str += '        <td>' + dev.link_encap + '</td>';
//            dev_str += '        <th class="hwaddr">HWaddr</th>';
//            dev_str += '        <td colspan="3">' + dev.hw_addr + '</td>';
//            dev_str += '    </tr>';
//            dev_str += '    <tr>';
//            dev_str += '        <th class="inet-addr">inet addr</th>';
//            dev_str += '        <td>' + dev.inet_addr + '</td>';
//            dev_str += '        <th class="bcast">Bcast</th>';
//            dev_str += '        <td>' + dev.b_cast + '</td>';
//            dev_str += '        <th class="mask">Mask</th>';
//            dev_str += '        <td>' + dev.mask + '</td>';
//            dev_str += '    </tr>';
//            dev_str += '    <tr>';
//            dev_str += '        <th class="inet6-addr">inet6 addr</th>';
//            dev_str += '        <td>' + dev.inet6_addr + '</td>';
//            dev_str += '        <th class="scope">scope</th>';
//            dev_str += '        <td colspan="3">' + dev.scope + '</td>';
//            dev_str += '    </tr>';
//            dev_str += '</table>';
            dev_str += "&nbsp;&nbsp;&nbsp;Link encap: ";
            dev_str += dev.link_encap;
            dev_str += "&nbsp;&nbsp;&nbsp;HWaddr: ";
            dev_str += dev.hw_addr;
            dev_str += "<br/>";
            dev_str += "&nbsp;&nbsp;&nbsp;inet addr: ";
            dev_str += dev.inet_addr;
            if (dev.link_encap != 'Local') {
                dev_str += "&nbsp;&nbsp;&nbsp;Bcast: ";
                dev_str += dev.b_cast;
            }
            dev_str += "&nbsp;&nbsp;&nbsp;Mask: ";
            dev_str += dev.mask;
            dev_str += "<br/>";
            dev_str += "&nbsp;&nbsp;&nbsp;inet6 addr: ";
            dev_str += dev.inet6_addr;
            dev_str += "&nbsp;&nbsp;&nbsp;scope: ";
            dev_str += dev.scope;
            $(".dst-info").html(dev_str);
        }
    });
    $("select[name=dst_dev]").change();
}