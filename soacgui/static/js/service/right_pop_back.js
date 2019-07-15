
//function getInputHtmlForResource(htmlType, htmlOption={}) {
//    var option = {
//        "class" : "",   // div class
//        "subClass":"",
//        "attr" : "",    // div option
//        "text" : "",    // div text
//        "it" : "",      // input type
//        "ic" : "",      // input class
//        "io" : "",      // input option
//        "fs" : "",      // front span html
//        "bs" : "",      // back span html
//        "item" : "",    // combo box, select item
//    };
//    $.each(htmlOption, function(key, value) {
//        option[key] = value;
//    });
//    var result = "";
//    var divFormat = "<div class='%C' %O>%T</div>";
//    if ( htmlType == "hTitle" ) {
//        if (isEmpty(option["subClass"])) {
//            option.subClass = "pop03_d04";
//        }
//        result = divFormat.replace("%C", "pop03_d05 " + option.class).replace("%O", "").replace("%T", option.text);
//        result = divFormat.replace("%C", option.subClass + " " + option.class).replace("%O", option.attr).replace("%T", result + '<img class="pop03_img01" src="/static/img/dashboard/common/arrow_02.png" alt="#">');
//    } else if ( htmlType == "title" ) {
//        result = divFormat.replace("%C", "pop03_d03 " + option.class).replace("%O", option.attr).replace("%T", option.text);
//    } else if ( htmlType == "input") {
//        result = option.fs + "<input type='" + option.it + "' class='" + option.ic + "' name='" + option.key + "' " + option.io + ">";
//    } else if ( htmlType == "searchInput") {
//        var inputHtml = "";
//        var methodName = "searchResource";
//        inputHtml += '<img class="pop03_img02" src="/static/img/dashboard/common/search_bt_01.png" ' + "onclick=\"" + methodName + "(\'" + option.key + "\')\" " + 'alt="#">';
//        inputHtml += "<input type='text' name='" + option.key + "' class='pop03_text02 ' " + option.io + ">" + option.bs;
//        result = inputHtml;
//    } else if ( htmlType == "firstTitle") {
//        result = divFormat.replace("%C", "right_d02 " + option.class).replace("%O", option.attr).replace("%T", option.text);
//    } else if ( htmlType == "combo") {
//        result += '<select class="pop03_sel01" ' + option.io + " name='" + option.key + "'>";
//        $.each(option.item, function(index, value) {
//            result += "<option value='" + Object.keys(value)[0] + "'>" + Object.values(value)[0] + "</option>";
//        });
//        result += '</select>';
//        result += divFormat.replace("%C", "clear_float").replace("%O", "").replace("%T","");
//    } else if ( htmlType == "select") {
//        var item = "";
//        $.each(option.item, function(index, value) {
//            item += "<option value='" + value + "'>" + value + "</option>";
//        });
//        var selectHtml = "";
//        selectHtml += "<select multiple class='select_list_01 service' name='" + option.key + "'>";
//        selectHtml += item;
//        selectHtml += "</select>";
//        result = divFormat.replace("%C", "right_input " + option.class).replace("%O", option.attr).replace("%T", selectHtml);
//    } else if ( htmlType == "area") {
//        var textAreaHtml = "<textarea class='form-control service' " + option.io + " name='" + option.key + "'></textarea>";
//        result = divFormat.replace("%C", "right_input " + option.class).replace("%O", option.attr).replace("%T", textAreaHtml);
//    } else if ( htmlType == "custom") {
//        result = divFormat.replace("%C", option.class).replace("%O", "").replace("%T","");
//    }
//
//    return result;
//}

function updateName(selected_node, value) {
    var sameNameResource = nodes.filter(function(d) {
        return (d.name == value && d.resource_type == selected_node.resource_type)
    });
    sameNameFlag = (sameNameResource.length > 0 && sameNameResource[0].id != selected_node.id);
    if (!sameNameFlag) { // 같은 이름, 같은 타입인 자원이 없으면
        var linkListForUpdate = links.filter(function(l) { // 연결된것이 있나 확인
            return l.source === selected_node || l.target === selected_node;
        });
        $.each(linkListForUpdate, function(index, link) { // 연결된것이 있으면 연결된곳의 정보도 바꿈
            var name = "";
            var resource = [];
            if (link.source.resource_type == NETWORK && link.target.resource_type == VM && selected_node === link.source) {  // target = VM
                name = link.source.name;
                resource = nodes.filter(function(d) {
                    return d.id === link.target.id;
                });
                if (resource.length > 0) {
                    var tenant_net_for_update = resource[0].data.tenant_net_list.filter(function(data) {
                        return data.tenant_net == name;
                    })[0];
                    var updateIndex = resource[0].data.tenant_net_list.indexOf(tenant_net_for_update);
                    resource[0].data.tenant_net_list[updateIndex].tenant_net = value;
                    resource[0].data.tenant_net_list.reduce(function(a,b) {if (a.indexOf(b) < 0 ) a.push(b);return a;},[]);
                }
            } else if (link.source.resource_type == VM && link.target.resource_type == VOLUME && selected_node === link.source) {
                resource = nodes.filter(function(d) {
                    return d.id === link.target.id;
                });
                if (resource.length > 0) {
                    resource[0].data.vm_template = value;
                }
            } else if (link.source.resource_type == ROUTER && link.target.resource_type == NETWORK && selected_node == link.target) { // source = ROUTER
                name = link.target.name;
                resource = nodes.filter(function(d) {
                    return d.id === link.source.id;
                });
                if (resource.length > 0) {
                    var updateIndex = resource[0].data.tenant_net_list.indexOf(name);
                    resource[0].data.tenant_net_list[updateIndex] = value;
                    resource[0].data.tenant_net_list.reduce(function(a,b) {if (a.indexOf(b) < 0 ) a.push(b);return a;},[]);
                }
            }
        });
        selected_node["name"] = value; // 이름바꾸기
        selected_node["data"]["name"] = value;
    }
}

function updateResource(key) {
    var selected_resource = nodes.filter(function(d) {
        return d.id == selected_node.id;
    })[0];
    var inputTag = $("input[name=" + key + "]");
    if (inputTag.length == 0) {
        inputTag = $("select[name=" + key + "]");
    }
    if (key=="name") { // 이름 바꿀때
        updateName(selected_node, inputTag.val());
    } else if (inputTag.attr("type") == "checkbox") { // key가 이름이 아니고 체크박스일때
        selected_resource.data[key] = inputTag.is(":checked");
    } else { // key가 이름이 아니고 text 나 hidden일때
        var value = inputTag.val();
        if ($.isNumeric(value)) {
            value = parseInt(value);
        }
        if (selected_resource.resource_type == NETWORK && key == "cidr") {
            sameCIDRFlag = false;
            invalidCIDRFlag = false;
            var re = /^([\d]{1,3})\.([\d]{1,3})\.([\d]{1,3})\.([\d]{1,3})/;
            if (re.test(inputTag.val())) {
                var classA = RegExp.$1;
                var classB = RegExp.$2;
                var classC = RegExp.$3;
                var classEtc = RegExp.$4;
                if (classA >= 0 && classA < 256 && classB >= 0 && classB < 256 && classC >= 0 && classC < 256 && classEtc >= 0 && classEtc < 256) {
                    var re = /\/(\d+)$/;
                    if (re.test(inputTag.val())) {
                        var ip_cidr = RegExp.$1;
                        if (ip_cidr < 0 | ip_cidr > 32) {
                            U.lobiboxMessage("CIDR 범위는 0~32입니다.", "info", "정보");
                            invalidCIDRFlag = true;
                        }
                    } else {
                        U.lobiboxMessage("CIDR 표기법이 올바르지 않습니다.", "info", "정보");
                        invalidCIDRFlag = true;
                    }
                } else {
                    U.lobiboxMessage("IP 주소의 범위는 0.0.0.0 ~ 255.255.255.255 입니다.", "info", "정보");
                    invalidCIDRFlag = true;
                }
//                console.log(classA);
//                console.log(classB);
//                console.log(classC);
//                console.log(classEtc);
//                console.log(ip_cidr);
            } else {
                invalidCIDRFlag = true;
                U.lobiboxMessage("CIDR 표기법이 올바르지 않습니다.", "info", "정보");
            }

            var sameCIDR = nodes.filter(function(d) {
                return (d.resource_type == NETWORK && d.data[key] == value && d != selected_node);
            });
            sameCIDRFlag = (sameCIDR.length > 0);
        }
        if (!sameCIDRFlag && !invalidCIDRFlag) {
            selected_resource.data[key] = value;
        }
    }
    restart();
    return selected_resource;
}

function updateClick(rType) {
    if (rType == ROUTER) {
        var keyList = ["name", "admin_state"];
        updateResource(keyList[0]);
        updateResource(keyList[1]);
    } else if (rType == NETWORK) {
        var keyList = ["name", "cidr", "admin_state", "share", "ip_version", "gateway_ip", "enable_dhcp"];
        var selected_resource;
        $.each(keyList, function(index, value) {
            selected_resource = updateResource(value);
        });
        // alloc_pools parse시작
        var alloc_pools_text = $("textarea[name=alloc_pools]").val();
        var alloc_pools_list = [];
        var alloc_pools_split = alloc_pools_text.split(/\r\n|\r|\n/g);
        $.each(alloc_pools_split, function(index, value) {
            if (value.indexOf(",")>=0) {
                var valueSplit = value.split(",");
                var alloc_pool = {start: valueSplit[0].replace(/ /gi,""), end: valueSplit[1].replace(/ /gi,"")};
                alloc_pools_list.push(alloc_pool);
            }
        });
        selected_resource.data.alloc_pools = alloc_pools_list;
        // alloc_pools parse 끝
        // host_route parse시작
        var host_route_text = $("textarea[name=host_route]").val();
        var host_route_list = [];
        var host_route_split = host_route_text.split(/\r\n|\r|\n/g);
        $.each(host_route_split, function(index, value) {
            if (value.indexOf(",")>=0) {
                var valueSplit = value.split(",");
                var alloc_pool = {destination_cidr: valueSplit[0].replace(/ /gi,""), nexthop: valueSplit[1].replace(/ /gi,"")};
                host_route_list.push(alloc_pool);
            }
        });
        selected_resource.data.host_route = host_route_list;
        // host_route parse 끝
        selected_resource.data.dns = $("textarea[name=dns]").val();
    } else if (rType == VM) {
        var keyList = ["name", "availability", "booting_source_type", "image", "flavor", "security_group", "key_name", "custom_script"];
        $.each(keyList, function(index, value) {
            updateResource(value);
        });

//        showNodeInfo();
        var tenant_net_list = $(".vnet_list .vnet");
        if (!(typeof tenant_net_list == "undefined")) {
            $.each(tenant_net_list, function(index, tenant_net) {
//                console.log(tenant_net);//수정수정수정~!~!
                if (typeof selected_node.data.tenant_net_list == "undefined") {
                    return;
                }
                var tenant_net_for_update = selected_node.data.tenant_net_list.filter(function(vm_tenant_net) {
                    return vm_tenant_net['tenant_net'] == $(tenant_net).find(".vnet_name").text();
                })[0];
                if (!(typeof tenant_net_for_update == "undefined")) {
                    tenant_net_for_update['public_ip'] = $(tenant_net).find("input[name=public_ip]").is(":checked");
                    tenant_net_for_update['ip_address'] = $(tenant_net).find("input[name=ip_address]").val();
                    tenant_net_for_update['mac_address'] = $(tenant_net).find("input[name=mac_address]").val();
                }
            });
        }
    } else if (rType == VOLUME) {
        var keyList = ["name", "type", "image_type", "size", "volume_image"];
        $.each(keyList, function(index, value) {
            updateResource(value);
        });
    }
    var saveFlag = false;
    if (sameNameFlag) {
        var typeText = $(".right_d01.type").text();
        U.lobiboxMessage("같은 이름을 가진 " + typeText + "(이)가 존재합니다.", "info", "정보");
    } else if (sameCIDRFlag) {
        U.lobiboxMessage("같은 주소를 가진 네트워크가 존재합니다.", "info", "정보");
    } else if (!invalidCIDRFlag) {
        saveFlag = true;
        U.lobiboxMessage("저장되었습니다.", "info", "성공");
    }
    setCookie("nodes", JSON.stringify(nodes));
    var link_list = [];
    for ( var link_i = 0; link_i < links.length; link_i++ ) {
        link_list.push({
            "source":{"id":links[link_i].source.id},
            "target":{"id":links[link_i].target.id}
        });
    }
    setCookie("links", JSON.stringify(link_list));
    return saveFlag;
}

function confirmResource(key) {
    var selected_resource = nodes.filter(function(d) {
        return d.id == selected_node.id;
    })[0];
    var inputTag = $("input[name=" + key + "]");
    if (inputTag.length == 0) {
        inputTag = $("select[name=" + key + "]");
    }
    if (inputTag.attr("type") == "checkbox") { // key가 이름이 아니고 체크박스일때
        if (selected_resource.data[key] != inputTag.is(":checked") && typeof selected_resource.data[key] != "undefined") {
            editedInfoFlag = true;
        }
    } else { // text 나 hidden일때
        var value = inputTag.val();
        var targetValue = selected_resource.data[key];
        if (key == "name") {
            targetValue = selected_resource.name;
        }
        if (targetValue != value && typeof targetValue != "undefined") {
            editedInfoFlag = true;
        }
    }
    restart();
    return selected_resource;
}

function confirmInfoPop(rType, confirmData) {
    if (rType == ROUTER) {
        var keyList = ["name", "admin_state"];
        confirmResource(keyList[0]);
        confirmResource(keyList[1]);
    } else if (rType == NETWORK) {
        var keyList = ["name", "cidr", "admin_state", "share", "ip_version", "gateway_ip", "enable_dhcp"];
        var selected_resource;
        $.each(keyList, function(index, value) {
            selected_resource = confirmResource(value);
        });
        // alloc_pools parse시작
        var alloc_pools_text = $("textarea[name=alloc_pools]").val();
        var alloc_pools_list = [];
        var alloc_pools_split = alloc_pools_text.split(/\r\n|\r|\n/g);
        $.each(alloc_pools_split, function(index, value) {
            if (value.indexOf(",")>=0) {
                var valueSplit = value.split(",");
                var alloc_pool = {start: valueSplit[0].replace(/ /gi,""), end: valueSplit[1].replace(/ /gi,"")};
                alloc_pools_list.push(alloc_pool);
            }
        });
        if (!(selected_resource.data.alloc_pools === alloc_pools_list)) {
            var mainList = selected_resource.data.alloc_pools;
            if (!isEmpty(mainList)) {
                var subList = alloc_pools_list;
                if (mainList.length > subList.length) {
                    var tempList = mainList;
                    mainList = subList;
                    subList = tempList;
                }
                for (var i = 0; i < mainList.length; i++) {
                    if (mainList[i] == subList[i]) editedInfoFlag = true;
                }
            }
        }
        // alloc_pools parse 끝
        // host_route parse시작
        var host_route_text = $("textarea[name=host_route]").val();
        var host_route_list = [];
        var host_route_split = host_route_text.split(/\r\n|\r|\n/g);
        $.each(host_route_split, function(index, value) {
            if (value.indexOf(",")>=0) {
                var valueSplit = value.split(",");
                var alloc_pool = {destination_cidr: valueSplit[0].replace(/ /gi,""), nexthop: valueSplit[1].replace(/ /gi,"")};
                host_route_list.push(alloc_pool);
            }
        });
        if (!(selected_resource.data.host_route === host_route_list)) {
            var mainList = selected_resource.data.host_route;
            if (!isEmpty(mainList)) {
                var subList = host_route_list;
                if (mainList.length > subList.length) {
                    var tempList = mainList;
                    mainList = subList;
                    subList = tempList;
                }
                for (var i = 0; i < mainList.length; i++) {
                    if (mainList[i] == subList[i]) editedInfoFlag = true;
                }
            }
        }
        // host_route parse 끝
        if (!(selected_resource.data.dns === $("textarea[name=dns]").val())) {
            var mainList = selected_resource.data.dns;
            if (!isEmpty(mainList)) {
                var subList = $("textarea[name=dns]").val();
                if (mainList.length > subList.length) {
                    var tempList = mainList;
                    mainList = subList;
                    subList = tempList;
                }
                for (var i = 0; i < mainList.length; i++) {
                    if (mainList[i] == subList[i]) editedInfoFlag = true;
                }
            }
        }
    } else if (rType == VM) {
        var keyList = ["name", "availability", "booting_source_type", "image", "flavor", "security_group", "key_name", "custom_script"];
        $.each(keyList, function(index, value) {
            confirmResource(value);
        });

//        showNodeInfo();
        var tenant_net_list = $(".vnet_list .vnet");
        if (!(typeof tenant_net_list == "undefined")) {
            $.each(tenant_net_list, function(index, tenant_net) {
//                console.log(tenant_net);//수정수정수정~!~!
                if (typeof selected_node.data.tenant_net_list == "undefined") {
                    return;
                }
                var tenant_net_for_update = selected_node.data.tenant_net_list.filter(function(vm_tenant_net) {
                    return vm_tenant_net['tenant_net'] == $(tenant_net).find(".vnet_name").text();
                })[0];
                if (typeof tenant_net_for_update != "undefined") {
                    if (tenant_net_for_update['public_ip'] != $(tenant_net).find("input[name=public_ip]").is(":checked") && typeof tenant_net_for_update['public_ip'] != "undefined") {
                        editedInfoFlag = true;
                    }
                    if (tenant_net_for_update['ip_address'] != $(tenant_net).find("input[name=ip_address]").val() && typeof tenant_net_for_update['ip_address'] != "undefined") {
                        editedInfoFlag = true;
                    }
                    if (tenant_net_for_update['mac_address'] != $(tenant_net).find("input[name=mac_address]").val() && typeof tenant_net_for_update['mac_address'] != "undefined") {
                        editedInfoFlag = true;
                    }
                }
            });
        }
    } else if (rType == VOLUME) {
        var keyList = ["name", "type", "image_type", "size", "volume_image"];
        $.each(keyList, function(index, value) {
            confirmResource(value);
        });
    }
    if (editedInfoFlag) {
        editedInfoFlag = false;
        U.confirm(confirmData);
    } else {
        confirmData.cancelFunc();
    }
}

function setInfoHtml() {
    var infoDiv = $(".resource_info");
    var rType = selected_node.resource_type;
    if ( editFlag ) { // 수정모드
        var resourceInputHtml = "";
        var data = {
            type: rType,
            data: JSON.stringify(selected_node.data)
        };
        $(".right_pop").loadPage({
            url:"/dashboard/service/right_pop",
            data:data,
            success:function() {
                $("#resource_update").unbind("click");
                $("#resource_update").on("click", function() {
                    var saveFlag = updateClick(rType);
                    if (saveFlag) {
                        selected_node = null;
                        showNodeInfo();
                    }
                    restart();
                });
                showNodeInfo();
            }
        });

//        if ( rType == ROUTER) {
//        } else if ( rType == NETWORK ) { // 각 resource 선택시
//        } else if ( rType == VM) {
//
//        } else if ( rType == VOLUME) {
//
//        } else {
//            infoDiv.html("");
//        }
        /*if ( rType == ROUTER) {
            $(".right_pop").loadPage({
                url:"/dashboard/service/right_pop",
                data:data
            });
            resourceInputHtml += getInputHtmlForResource("firstTitle");
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"이름 *"});
            resourceInputHtml += getInputHtmlForResource("input", {it:"text", key:"name", io:"placeholder='이름'", ic:"pop03_text01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"관리자 상태"});
            var comboItem = [{UP:"UP"}, {DOWN:"DOWN"}];
            resourceInputHtml += getInputHtmlForResource("combo",{item:comboItem, key:"admin_state"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"외부 네트워크 *"});
            resourceInputHtml += getInputHtmlForResource("input",{it:"text", key:"external_net", io:"placeholder='외부 네트워크를 연결하세요.' disabled", ic:"pop03_text01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"인터페이스 추가"});
            resourceInputHtml += getInputHtmlForResource("select",{key:"tenant_net_list", io:"placeholder='가상 네트워크를 연결하세요.'"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            infoDiv.html(resourceInputHtml);

//            $("input[name=tenant_net_list]").val(data.tenant_net_list);
        } else if ( rType == NETWORK ) { // 각 resource 선택시
            search = "<span class='glyphicon glyphicon-search' aria-hidden='true'></span>";
            resourceInputHtml += getInputHtmlForResource("firstTitle");
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"이름 *"});
            resourceInputHtml += getInputHtmlForResource("input", {it:"text", key:"name", io:"placeholder='이름'", ic:"pop03_text01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"네트워크 주소 *"});
            resourceInputHtml += getInputHtmlForResource("input", {it:"text", key:"cidr", io:"placeholder='CIDR (예, 192.168.0.0/24)'", ic:"pop03_text01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += getInputHtmlForResource("hTitle", {text:"세부정보", attr:'onclick="networkDetailToggle(this)"'});
//            resourceInputHtml += '<button onclick="networkDetailToggle(this)" class="btn detail_info network_detail"><i class="icon-arrow-down"></i></button>';
            resourceInputHtml += '<div class="network_detail_info" hidden>';
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"관리자 상태", });
            var comboItem = [{UP:"UP"}, {DOWN:"DOWN"}];
            resourceInputHtml += getInputHtmlForResource("combo",{item:comboItem, key:"admin_state"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"공유", });
            resourceInputHtml += getInputHtmlForResource("input",{class:"checkbox", it:"checkbox", key:"share", ic:"pop03_check01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"IP 버전", });
            var comboItem = [{4:"IPv4"}, {6:"IPv6"}];
            resourceInputHtml += getInputHtmlForResource("combo",{item:comboItem,key:"ip_version"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"게이트웨이 IP"});
            resourceInputHtml += getInputHtmlForResource("input",{it:"text", key:"gateway_ip", io:"placeholder='게이트웨이 IP'", ic:"pop03_text01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"DHCP 사용", });
            resourceInputHtml += getInputHtmlForResource("input",{class:"checkbox", it:"checkbox", key:"enable_dhcp", io:"checked", ic:"pop03_check01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            var tempText = "풀에 할당된 IP 주소 : \n한 줄에 하나씩 시작 주소, 끝 주소를 입력합니다.\n(예, 192.168.1.100, 192.168.1.120)";
            resourceInputHtml += getInputHtmlForResource("title", {text:"IP 풀 할당"});
            resourceInputHtml += getInputHtmlForResource("area",{key:"alloc_pools", io:"rows='4' placeholder='" + tempText + "'"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            tempText = "이 서브넷에 대한 DNS 서버의 \nIP주소 : \n한 줄에 하나씩 입력합니다.";
            resourceInputHtml += getInputHtmlForResource("title", {text:"DNS 서버"});
            resourceInputHtml += getInputHtmlForResource("area",{key:"dns", io:"rows='3' placeholder='" + tempText + "'"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            tempText = "추가 라우트 설정 : \n한 줄에 하나씩 destination_cidr과 nexthop을 입력합니다. \n(예, 192.168.200.0/24,10.56.1.254)";
            resourceInputHtml += getInputHtmlForResource("title", {text:"호스트 라우트"});
            resourceInputHtml += getInputHtmlForResource("area",{key:"host_route", io:"rows='5' placeholder='" + tempText + "'"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "</div>";

            // 네트워크에서 사용될것
//            var alloc_pools_text = $("textarea[name=alloc_pools]").val();
//            U.lobiboxMessage(alloc_pools_text);
//            alloc_pools_text.split(/\r\n|\r|\n/g);
            infoDiv.html(resourceInputHtml);

        } else if ( rType == VM) {
            resourceInputHtml += getInputHtmlForResource("firstTitle");
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"이름 *"});
            resourceInputHtml += getInputHtmlForResource("input", {it:"text", key:"name", io:"placeholder='이름'", ic:"pop03_text01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"가용 구역 *", });
//            var comboItem = [{nova:"nova"}, {neutron:"neutron"}];
            var comboItem = [{nova:"nova"}];
            resourceInputHtml += getInputHtmlForResource("combo",{item:comboItem, key:"availability"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"부팅 소스 *", });
            var comboItem = [{"image":"이미지"}, {"image_snapshot":"이미지 스냅샷"}, {"volume":"볼륨"}, {"volume_snapshot":"볼륨 스냅샷"}];
            resourceInputHtml += getInputHtmlForResource("combo",{item:comboItem, key:"booting_source_type"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("searchInput",{key:"image", io:"placeholder='목록에서 선택하세요.' disabled"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"가상머신 사양 *"});
            resourceInputHtml += getInputHtmlForResource("searchInput",{key:"flavor", io:"placeholder='목록에서 선택하세요.' disabled"});
            resourceInputHtml += getInputHtmlForResource("br");
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += getInputHtmlForResource("hTitle", {text:"네트워크 인터페이스", attr:"onclick='networkInterfaceListToggle(this)'"});
//            resourceInputHtml += '<button onclick="networkInterfaceListToggle(this)" class="btn detail_info network_interface"><i class="icon-arrow-down"></i></button>';
//            resourceInputHtml += getInputHtmlForResource("title", {text:"가상 네트워크"});
            resourceInputHtml += "<div class='vnet_list' hidden></div>";
//            resourceInputHtml += getInputHtmlForResource("select",{key:"tenant_net_list1", io:"placeholder='가상 네트워크를 연결하세요.'"});
            resourceInputHtml += getInputHtmlForResource("br");
            resourceInputHtml += getInputHtmlForResource("hTitle", {text:"세부정보", attr:'onclick="securityToggle(this)"', subClass:"pop03_d06"});
//            resourceInputHtml += '<button onclick="securityToggle(this)" class="btn detail_info security"><i class="icon-arrow-down"></i></button>';
            resourceInputHtml += '<div class="security_group" hidden>';
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"시큐리티 그룹"});
            resourceInputHtml += getInputHtmlForResource("searchInput",{key:"security_group", io:"placeholder='목록에서 선택하세요.' disabled"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"키 페어"});
            resourceInputHtml += getInputHtmlForResource("searchInput",{key:"key_name", io:"placeholder='목록에서 선택하세요.' disabled"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {text:"사용자 스크립트<br>(16KB 이내)"});
            resourceInputHtml += getInputHtmlForResource("input",{it:"text", key:"custom_script", io:"", ic:"pop03_text03"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += '</div>';

            infoDiv.html(resourceInputHtml);
            getAvailabilityZone();
    //                $("input[name=tenant_net_list]").val(data.tenant_net_list);

        } else if ( rType == VOLUME) {
            resourceInputHtml += getInputHtmlForResource("firstTitle");
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {"text":"이름 *"});
            resourceInputHtml += getInputHtmlForResource("input", {it:"text", "key":"name", "io":"placeholder='이름'", ic:"pop03_text01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {"text":"볼륨 유형", });
            var comboItem = [
                {"None":"None"},
//                {"볼륨 스냅샷":"volume_snapshot"}
            ];
            resourceInputHtml += getInputHtmlForResource("combo",{"item":comboItem, "key":"type"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {"text":"볼륨 종류", });
            var comboItem = [{"image":"이미지"}, {"snapshot":"스냅샷 (미개발)"}];
            resourceInputHtml += getInputHtmlForResource("combo",{"item":comboItem, "key":"image_type"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("searchInput",{"key":"volume_image", io:"placeholder='목록에서 선택하세요.' disabled"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {"text":"볼륨 크기 (GB) *"});
            resourceInputHtml += getInputHtmlForResource("input",{it:"text", "key":"size", io:"", ic:"pop03_text01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";
            resourceInputHtml += "<div class='pop03_d02'>";
            resourceInputHtml += getInputHtmlForResource("title", {"text":"볼륨 마운트 위치"});
            resourceInputHtml += getInputHtmlForResource("input",{it:"text","key":"vm_template", io:"placeholder='가상 머신을 연결하세요.' disabled", ic:"pop03_text01"});
            resourceInputHtml += getInputHtmlForResource("custom", {class:"clear_float"});
            resourceInputHtml += "</div>";

            infoDiv.html(resourceInputHtml);

        } else {
            infoDiv.html("");
        }*/
    } else { // 조회모드
        return;
    }
}



function showNodeInfo() {
    var resourceType = "";
    if (editFlag) {
        $("#delBtn").show();
        $("#resource_update").show();
        $("#closeBtn").hide();
    } else {
        $("#delBtn").hide();
        $("#resource_update").hide();
        $("#closeBtn").show();
    }
    if (selected_node != null) { // 자원 선택시
        var data = selected_node.data;
        var rType = selected_node.resource_type;

        if ( editFlag ) { // 수정,생성모드
            switch(rType) {
                case ROUTER:
                    if (typeof data.admin_state == "undefined") {
                        data.admin_state = "UP";
                    }
                    $("input[name=admin_state]").val(data.admin_state);
//                    $("input[name=admin_state]").siblings("button").html("<p>" + data.admin_state + "</p><span class='caret'></span>");

                    $("input[name=external_net]").val(data.external_net);
                    var optionHtml = "";
                    var trHtml = "";
                    $.each(data.tenant_net_list, function(index, value) {
                        optionHtml +="<option value='" + value + "'>" + value + "</option>";
                    });
                    $("select[name=tenant_net_list]").html(optionHtml);
                    break;

                case NETWORK:
                    $("input[name=cidr]").val(data.cidr);

                    if (typeof data.admin_state == "undefined") {
                        data.admin_state = "UP";
                    }
                    $("input[name=admin_state]").val(data.admin_state);
//                    $("input[name=admin_state]").siblings("button").html("<p>" + data.admin_state + "</p><span class='caret'></span>");

                    $("input[name=share]").prop("checked", data.share);

                    if (typeof data.ip_version == "undefined") {
                        data.ip_version = "4";
                    }
                    $("input[name=ip_version]").val(data.ip_version);
                    var ip_version = "";
                    if (data.ip_version == "4") {
                        ip_version = "<p>IPv4</p><span class='caret'></span>";
                    } else if (data.ip_version == "6") {
                        ip_version = "<p>IPv6</p><span class='caret'></span>";
                    } else {
                        ip_version = "<p>invalid</p><span class='caret'></span>";
                    }
                    $("input[name=ip_version]").siblings("button").html(ip_version);

                    $("input[name=gateway_ip]").val(data.gateway_ip);
                    $("input[name=enable_dhcp]").prop("checked", data.enable_dhcp);
                    // alloc_pools parse시작
                    var alloc_pools_text = "";
                    if (data.alloc_pools instanceof Array) {
                        $.each(data.alloc_pools, function(index, value) {
                            alloc_pools_text += value.start + ", " + value.end;
                            if (index < data.alloc_pools.length - 1) {
                                alloc_pools_text += "\n";
                            }
                        });
                    }

                    $("textarea[name=dns]").val(data.dns);

                    $("textarea[name=alloc_pools]").val(alloc_pools_text);
                    // alloc_pools parse 끝
                    // host_route parse시작
                    var host_route_text = "";
                    if (data.host_route instanceof Array) {
                        $.each(data.host_route, function(index, value) {
                            host_route_text += value.destination_cidr + ", " + value.nexthop;
                            if (index < data.host_route.length - 1) {
                                host_route_text += "\n";
                            }
                        });
                    }
                    $("textarea[name=host_route]").val(host_route_text);
                    // host_route parse 끝
                    break;

                case VM:
                    if (typeof data.availability == "undefined") {
                        if (availabilityZoneList == null) {
                            data.availability = "Compute-1";
                        } else {
                            data.availability = availabilityZoneList[0].zoneName;
                        }
                    }
                    var availability = "";
                    if (data.availability == "nova") {
                        availability = "<p>nova</p><span class='caret'></span>";
                    } else if (data.availability == "neutron") {
                        availability = "<p>neutron</p><span class='caret'></span>";
                    } else {
                        availability = "<p>" + data.availability + "</p><span class='caret'></span>";
                    }
                    $("input[name=availability]").val(data.availability);
                    $("input[name=availability]").siblings("button").html(availability);

                    if (typeof data.booting_source_type == "undefined") {
                        data.booting_source_type = "image";
                    }
                    $("input[name=booting_source_type]").val(data.booting_source_type);
                    var booting_source_type = "";
                    if (data.booting_source_type == "image") {
                        booting_source_type = "<p>이미지</p><span class='caret'></span>";
                    } else if (data.booting_source_type == "image_snapshot") {
                        booting_source_type = "<p>이미지 스냅샷</p><span class='caret'></span>";
                    } else if (data.booting_source_type == "volume") {
                        booting_source_type = "<p>볼륨</p><span class='caret'></span>";
                    } else if (data.booting_source_type == "volume_snapshot") {
                        booting_source_type = "<p>볼륨 스냅샷</p><span class='caret'></span>";
                    } else {
                        booting_source_type = "이미지 <span class='caret'></span>";
                    }
                    $("input[name=booting_source_type]").siblings("button").html(booting_source_type);

                    $("input[name=image]").val(data.image);
                    $("input[name=flavor]").val(data.flavor);

                    var optionHtml = "";
                    var tableHtml = "";
                    $.each(data.tenant_net_list, function(index, value) {
//                        optionHtml +="<option value='" + value + "'>" + value + "</option>";//<input type='checkbox' name='public_ip'>
                        var ip_address = "";
                        if (typeof value.ip_address != "undefined") {
                            ip_address = value.ip_address
                        }
                        var mac_address = "";
                        if (typeof value.mac_address != "undefined") {
                            mac_address = value.mac_address
                        }
//                        tableHtml = "<div class='vnet_group tenant_net" + index + "'><div style='text-align:right;width:100%;'></div>";
//                        tableHtml += "<table class='vnet' name='tenant_net_list' style='width:100%;'><tr><td>가상 네트워크를 연결하세요.</td></tr></table></div>";
//                        tableHtml += "<div class='vnet_group tenant_net" + index + "'><div style='text-align:right;width:100%;'></div>";
//                        tableHtml += "<table class='vnet' name='tenant_net_list' style='width:100%;'>";
//                        tableHtml += "<tr><td>네트워크(eth" + index + ") 이름: </td><td nowrap>" + value.tenant_net + "</td></tr>";
//                        tableHtml += '<tr><td colspan="2"><input type="text" class="pop03_text01" name="ip_address" placeholder="IP 주소" value="' + ip_address + '"></td></tr>';
//                        tableHtml += '<tr><td colspan="2"><input type="text" class="pop03_text01" name="mac_address" placeholder="MAC 주소" value="' + mac_address + '"></td></tr>';
////                        tableHtml += '<tr><td> 공용 IP 허용: </td><td style="width:1px;text-align:right;"><input type="checkbox" name="public_ip" ' + (value.public_ip ? "checked":"") + '></td></tr>';
//                        tableHtml += "</table></div>";
                        tableHtml += "<div class='vnet_group tenant_net" + index + "'><div class='vnet' name='tenant_net_list'>";
                        tableHtml += '<div class="pop03_d02">';
                        tableHtml += '    <div class="pop03_d03 ">네트워크(eth' + index + ') 이름: </div><span class="vnet_name">' + value.tenant_net + '</span>';
                        tableHtml += '    <div class="clear_float"></div>';
                        tableHtml += '</div>';
                        tableHtml += '<div class="pop03_d02">';
                        tableHtml += '    <input type="text" class="pop03_text01" name="ip_address" placeholder="IP 주소" value="' + ip_address + '">';
                        tableHtml += '    <div class="clear_float"></div>';
                        tableHtml += '</div>';
                        tableHtml += '<div class="pop03_d02">';
                        tableHtml += '    <input type="text" class="pop03_text01" name="mac_address" placeholder="MAC 주소" value="' + mac_address + '">';
                        tableHtml += '    <div class="clear_float"></div>';
                        tableHtml += '</div>';
                        tableHtml += '<div class="clear_float"></div>';
                        tableHtml += '<div class="pop03_d02">';
                        tableHtml += '    <div class="pop03_d03 ">공용 IP 허용: </div>';
                        tableHtml += '    <input class="pop03_check01" name="public_ip" ' + (value.public_ip ? "checked ":"") + 'type="checkbox">';
                        tableHtml += '    <div class="clear_float"></div>';
                        tableHtml += '</div>';
                        tableHtml += "</div></div>";
                    });
//                    $("select[name=tenant_net_list1]").html(optionHtml);
                    $("div.vnet_list").html(tableHtml);

                    $("input[name=security_group]").val(data.security_group);
                    $("input[name=key_name]").val(data.key_name);
                    $("input[name=custom_script]").val(data.custom_script);
                    break;

                case VOLUME:
                    if (typeof data.type == "undefined") {
                        data.type = "None";
                    }
                    $("input[name=type]").val(data.type);
                    var type = "";
                    if (data.type == "None") {
                        type = "<p>None</p><span class='caret'></span>";
                    } else if (data.type == "volume_snapshot") {
                        type = "<p>볼륨 스냅샷</p><span class='caret'></span>";
                    } else {
                        type = "<p>Invalid</p><span class='caret'></span>";
                    }
                    $("input[name=type]").siblings("button").html(type);


                    if (typeof data.image_type == "undefined") {
                        data.image_type = "image";
                    }
                    $("input[name=image_type]").val(data.image_type);
                    var image_type = "";
                    if (data.image_type == "None" || data.image_type == "image") {
                        image_type = "<p>이미지</p><span class='caret'></span>";
                    } else if (data.image_type == "snapshot") {
                        image_type = "<p>스냅샷</p><span class='caret'></span>";
                    } else {
                        image_type = "<p>invalid</p><span class='caret'></span>";
                    }
                    $("input[name=image_type]").siblings("button").html(image_type);


                    $("input[name=volume_image]").val(data.volume_image);
                    $("input[name=size]").val(data.size);
                    $("input[name=vm_template]").val(data.vm_template);
                    break;

                case FIREWALL:
                    break;

                case LOADBALANCER:
                    break;

                case INTERNET:
                    break;
            }
//            $("input[name=name]").val(selected_node.name);
            if (modifyFlag && !selected_node.newNode) {
                $("input[name=name]").attr("disabled", true);
            }
//            d3.selectAll(".right_pop #name").text(selected_node.name);
//            d3.select(".right_pop #status").text(data.status);
//            force.stop();
//                            if (resource_type == "SERVER") {
//                                getFlavorDetailList();
//                                getImageDetailList();
//                            }
//                            $("#resource_update").show();
//                            $("#delBtn").show();
//                            $("#closeBtn").hide();
        } else { // 조회모드
            var resource_type = "";
            switch(rType) {
                case ROUTER:
                    resource_type = "ROUTER";
                    break;
                case NETWORK:
                    resource_type = "NETWORK";
                    break;
                case VM:
                    resource_type = "SERVER";
                    break;
                case VOLUME:
                    resource_type = "VOLUME";
                    break;
            }
            var result;
            if (selected_node) {
                $(".right_pop").loadPage({
                    url:'/dashboard/service/resource_data',
                    data:{ resource_type:resource_type, resource_id:selected_node.id },
                    success:function(result) {
                        $("#resource_update").hide();
                        $("#delBtn").hide();
                        $("#closeBtn").show();
                    }
                });
//                getResourceDataAjax(resource_type, selected_node.id);
            }
    //        d3.select(".right_pop .").text(selected_node.);

    //        var selected_nodeKeyArray = Object.keys(selected_node);
    //        for (var i in selected_nodeKeyArray) {
    //            if (selected_nodeKeyArray[i] == "data") {
    //                var dataHtml = "<ul>";
    //                var data = eval("selected_node." + selected_nodeKeyArray[i]);
    //                for (key in data) {
    //                    dataHtml += "<li><strong>" + key + ":</strong> " + data[key] + "</li>";
    //                }
    //                dataHtml += "</ul>";
    //                node_info_html += "<tr><td class='ind_td01'>" + selected_nodeKeyArray[i] + "</td><td class='ind_td01'> " + dataHtml + "</td></tr>";
    //            }
    //            else if (selected_nodeKeyArray[i] != "px" && selected_nodeKeyArray[i] != "py" && selected_nodeKeyArray[i] != "px" && selected_nodeKeyArray[i] != "py" ) {
    //                node_info_html += "<tr><td class='ind_td01'>" + selected_nodeKeyArray[i] + "</td><td class='ind_td01'> " + eval("selected_node." + selected_nodeKeyArray[i]) + "</td></tr>";
    //            }
    //        }
    //        tempCnt += 1;
    //        if (tempCnt / 50 == 1) {
    //            console.log("selected_nod[key] : " + Object.keys(selected_node));
    //            tempCnt = 0;
    //        }
        }
        switch(rType) {
            case ROUTER:
                resourceType = "라우터";
                break;
            case NETWORK:
                resourceType = "네트워크";
                break;
            case VM:
                resourceType = "가상머신";
                break;
            case VOLUME:
                resourceType = "볼륨";
                break;
            case FIREWALL:
                resourceType = "방화벽";
                break;
            case LOADBALANCER:
                resourceType = "로드밸런서";
                break;
            case INTERNET:
                resourceType = "인터넷";
                break;
        }
        d3.select(".right_pop_title_img").attr("src", "/static/img/right_" + rType + ".png")
        d3.select(".right_pop .type").text(resourceType);
        $(".right_pop").show();
    } else { // 자원선택 없을 시
        $(".right_pop").hide();
//        node_info_html += "<tr><td class='ind_td01'>resource를 선택하세요.</td></tr>";
    }
//    d3.select("#infoTable").html(node_info_html);
}

function searchResource( key) {
    if (key == "image") {
        var resourceType = $("select[name=booting_source_type]").val();
        writeModal("", "");
        switch(resourceType) {
            case "image":
                getImagesAjax();
                break;
            case "image_snapshot":
                break;
            case "volume":
                getVolumesAjax();
                break;
            case "volume_snapshot":
                break;
            default:
                break;
        }
    } else if (key == "flavor") {
        getFlavorsAjax();
    } else if (key == "volume_image") {
        var resourceType = $("select[name=image_type]").val();
        writeModal("", "");
        switch(resourceType) {
            case "image":
                getImagesAjax();
                break;
            case "image_snapshot":
                break;
            case "volume":
                getVolumesAjax();
                break;
            case "volume_snapshot":
                break;
            default:
                break;
        }
    }
}

function bytesToSize(bytes) {
    if (bytes instanceof String) bytes = parseInt(bytes);
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0 || isEmpty(bytes)) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
var loadingModal = null;

function getAvailabilityZone() {
    U.ajax({
        url : "/dashboard/service/new_service/get_availability_zone",
        data : {  },
        success:function(jsonData) {
            availabilityZoneList = jsonData.success.availabilityZoneInfo;
            var item = "";
            for ( var i = 0; i < availabilityZoneList.length; i++ ) {
                item += "<li><a href='#' onclick='dropdownEvent(this, \"" + availabilityZoneList[i].zoneName + "\", \"" + availabilityZoneList[i].zoneName + "\")'>" + availabilityZoneList[i].zoneName + "</a></li>";
            }
            $("input[name=availability]").siblings("ul").html(item);
        }
    });
}

function getImagesAjax() {
    writeModal("이미지", '<div class="loader loader-6"></div>');
    $('#modalService').modal();
    U.ajax({
        url : '/dashboard/service/new_service/get_images',
        data : {  },
        success:function(jsonData) {
            if (typeof jsonData.error != "undefined") {
//                U.lobiboxMessage("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                jsonData = jsonData.success;
                loadingModal = null;
                var imageList = jsonData.images;
                var modalTitle = "이미지";
                var contentHtml = "";
                contentHtml += "<table class='ind_tab01 search_tb' cellpadding='0' border='0' cellspacing='0'>";
                contentHtml += "<tr>";
    //            contentHtml += "<th class='ind_th01'>이름</th>    <th class='ind_th01'>업데이트 일시</th> <th class='ind_th01'>크기</th>     <th class='ind_th01'>유형</th>    <th class='ind_th01'>가시성</th>  <th class='ind_th01'></th>";
                contentHtml += "<th class='ind_th01'>이름</th>    <th class='ind_th01'>업데이트 일시</th> <th class='ind_th01'>크기</th>     <th class='ind_th01'></th>";
                contentHtml += "</tr>";
                $.each(imageList, function(index, value) {
                    contentHtml += "<tr class='" + value.name + "'>";
    //                contentHtml += "<td class='ind_td01'>" + value.name + "</td><td class='ind_td01'>" + value.updated_at + "</td><td class='ind_td01'>" + value.size + "</td><td class='ind_td01'>" + value.disk_format + "</td><td class='ind_td01'>" + value.visibility + "</td><td class='ind_td01'><button class='btn btn-success'>" + "선택(수정)" + "</button></td>";
                    contentHtml += "<td class='ind_td01'>" + value.name + "</td><td class='ind_td01'>" + parseDateForm(value.updated_at) + "</td><td class='ind_td01'>" + bytesToSize(value["size"]) + "</td><td class='ind_td01'><button class='btn btn-success'>" + "선택" + "</button></td>";
                    contentHtml += "</tr>";
                });
                contentHtml += "</table>";

                writeModal(modalTitle, contentHtml);
                $(".search_tb tr button").click(function() {
                    var image_name = $(this).parents("tr").attr("class");
                    $("input[name=image]").val(image_name);
                    $("input[name=volume_image]").val(image_name);
                    $('#modalService').modal("hide");
                });
                $('#modalService').modal();
            }
        }// end success
    });
}

function getVolumesAjax() {
    writeModal("볼륨", '<div class="loader loader-6"></div>');
    $('#modalService').modal();
    U.ajax({
        url : '/dashboard/service/new_service/get_volumes',
        data : {  },
        success:function(jsonData) {
            if (typeof jsonData.error != "undefined") {
//                U.lobiboxMessage("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                jsonData = jsonData.success;
                var volumeList = jsonData.volumeList;
                var modalTitle = "볼륨";
                var contentHtml = "";
                contentHtml += "<table class='ind_tab01 search_tb' cellpadding='0' border='0' cellspacing='0'>";
                contentHtml += "<tr>";
                contentHtml += "<th class='ind_th01'>이름</th>    <th class='ind_th01'>업데이트 일시</th> <th class='ind_th01'>크기</th>     <th class='ind_th01'>유형</th>    <th class='ind_th01'>가용구역</th>  <th class='ind_th01'></th>";
                contentHtml += "</tr>";
                $.each(volumeList, function(index, value) {
                    contentHtml += "<tr class='" + value.name + "'>";
                    contentHtml += "<td class='ind_td01'>" + value.name + "</td><td class='ind_td01'>" + parseDateForm(value.updated_at) + "</td><td class='ind_td01'>" + value.size + "</td><td class='ind_td01'>" + value.volume_type + "</td><td class='ind_td01'>" + value.availability_zone + "</td><td class='ind_td01'><button class='btn btn-success'>" + "선택(수정)" + "</button></td>";
                    contentHtml += "</tr>";
                });
                contentHtml += "</table>";

                writeModal(modalTitle, contentHtml);
                $(".search_tb tr button").click(function() {
                    var volume_name = $(this).parents("tr").attr("class");
                    $("input[name=image]").val(volume_name);
                    $('#modalService').modal("hide");
                });
                $('#modalService').modal();
            }
        }// end success
    });
}

function getFlavorsAjax() {
    writeModal("Flavor", '<div class="loader loader-6"></div>');
    $('#modalService').modal();
    U.ajax({
        url : '/dashboard/service/new_service/get_flavors',
        data : {  },
        success:function(jsonData) {
            if (typeof jsonData.error != "undefined") {
//                U.lobiboxMessage("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                jsonData = jsonData.success;
                var flavorList = jsonData.flavors;
                var modalTitle = "Flavor";
                var contentHtml = "";
                contentHtml += "<table class='ind_tab01 search_tb' cellpadding='0' border='0' cellspacing='0'>";
                contentHtml += "<tr>";
    //            contentHtml += "<th class='ind_th01'>이름</th>    <th class='ind_th01'>VCPUS</th> <th class='ind_th01'>RAM</th>     <th class='ind_th01'>디스크 총계</th>    <th class='ind_th01'>Root 디스크</th>  <th class='ind_th01'>임시 디스크</th>   <th class='ind_th01'>공용</th><th class='ind_th01'></th>";
                contentHtml += "<th class='ind_th01'>이름</th>    <th class='ind_th01'>VCPUS</th> <th class='ind_th01'>RAM</th>    <th class='ind_th01'>Root 디스크</th>  <th class='ind_th01'>임시 디스크</th>   <th class='ind_th01'></th>";
                contentHtml += "</tr>";
                $.each(flavorList, function(index, value) {
                    contentHtml += "<tr class='" + value.name + "'>";
    //                contentHtml += "<td class='ind_td01'>" + value.name + "</td><td class='ind_td01'>" + value.vcpus + "</td><td class='ind_td01'>" + value.ram + "</td><td class='ind_td01'>" + (parseInt(value.disk) + parseInt(value["OS-FLV-EXT-DATA:ephemeral"])).toString() + "</td><td class='ind_td01'>" + value.disk + "</td><td class='ind_td01'>" + value["OS-FLV-EXT-DATA:ephemeral"] + "</td><td class='ind_td01'>" + value["os-flavor-access:is_public"] + "</td><td class='ind_td01'><button class='btn btn-success'>" + "선택" + "</button></td>";
                    contentHtml += "<td class='ind_td01'>" + value.name + "</td><td class='ind_td01'>" + value.vcpus + "</td><td class='ind_td01'>" + value.ram + "</td><td class='ind_td01'>" + value.disk + "</td><td class='ind_td01'>" + value["OS-FLV-EXT-DATA:ephemeral"] + "</td><td class='ind_td01'><button class='btn btn-success'>" + "선택" + "</button></td>";
                    contentHtml += "</tr>";
                });
                contentHtml += "</table>";

                writeModal(modalTitle, contentHtml);
                $(".search_tb tr button").click(function() {
                    var flavor_name = $(this).parents("tr").attr("class");
                    $("input[name=flavor]").val(flavor_name);
                    $('#modalService').modal("hide");
                });
                $('#modalService').modal();
            }
        }// end success
    });
}

var completeCnt = 0;
var resourceDataBuffer = {};

function detailResourceDataHtml() {
    var rType = Object.keys(resourceDataBuffer).filter(function(d) {
        return d == "server" || d == "router" || d == "network" || d == "volume";
    })[0];
    if (typeof rType == "undefined") return;
    if ((completeCnt < 1 && rType == "router")||(completeCnt < 1 && rType == "network")||(completeCnt < 3 && rType == "server")||(completeCnt < 1 && rType == "volume")) {
        return;
    }
    var data = resourceDataBuffer[rType];
    var resultHtml = "";
    if (rType == "router"||rType == "network"||rType == "server"||rType == "volume") {
        resultHtml += '<div class="right_d02">이름</div>';
        if (rType == "volume") {
            data.name = data.displayName;
        }
        resultHtml += '<div class="right_d03 name">' + data.name + '</div>';
        resultHtml += '<div class="right_d04">ID</div>';
        resultHtml += '<div class="right_d03 id">' + data.id + '</div>';
        resultHtml += '<div class="right_d04">상태</div>';
        resultHtml += '<div class="right_d03 status">' + data.status + '</div>';
    }
    switch(rType) {
        case "router":
            resultHtml += '<div class="right_d04">프로젝트 ID</div>';
            resultHtml += '<div class="right_d03 project_id">' + data.tenant_id + '</div>';
            resultHtml += '<div class="right_d04">관리자 상태</div>';
            resultHtml += '<div class="right_d03 admin_state_up">' + (data.admin_state_up ? "UP":"DOWN") + '</div>';
            resultHtml += '<div class="right_d04">외부 게이트웨이</div>';
            resultHtml += '<div class="right_d03 external_gateway_info">';
            $.each(data.external_gateway_info.external_fixed_ips, function(idx, value) {
                if (idx != 0) resultHtml += "<br/>";
                resultHtml += value.ip_address;
            });
            resultHtml += '</div>';
            resultHtml += '<div class="right_d04">' + '네트워크 이름' + '</div>';
            resultHtml += '<div class="right_d03 subnet">' + '서브넷-id,ip address' + '</div>';
            resultHtml += '<div class="right_d04">인터페이스</div>';
            resultHtml += '<div class="right_d03 port">' + '인터페이스' + '</div>';
            break;
        case "network":
            resultHtml += '<div class="right_d04">프로젝트 ID</div>';
            resultHtml += '<div class="right_d03 project_id">' + data.tenant_id + '</div>';
            resultHtml += '<div class="right_d04">관리자 상태</div>';
            resultHtml += '<div class="right_d03 admin_state_up">' + (data.admin_state_up ? "UP":"DOWN") + '</div>';
            resultHtml += '<div class="right_d04">공유</div>';
            resultHtml += '<div class="right_d03 shared">' + (data.shared ? "예":"아니오")+ '</div>';
            resultHtml += '<div class="right_d04">외부 네트워크</div>';
            resultHtml += '<div class="right_d03 external">' + (data["router:external"] ? "예":"아니오") + '</div>';
            resultHtml += '<div class="right_d04">MTU</div>';
            resultHtml += '<div class="right_d03 mtu">' + data.mtu + '</div>';

            resultHtml += '<div class="right_d02">타입</div>';
            resultHtml += '<div class="right_d03 network_type">' + data["provider:network_type"] + '</div>';
            resultHtml += '<div class="right_d04">구분 ID</div>';
            resultHtml += '<div class="right_d03 segmentation">' + data["provider:segmentation_id"] + '</div>';
            resultHtml += '<div class="right_d04">물리적인 네트워크</div>';
            resultHtml += '<div class="right_d03 physical_network">' + data["provider:physical_network"] + '</div>';
//
//
            break;
        case "server":
            resultHtml += '<div class="right_d04">가용 구역</div>';
            resultHtml += '<div class="right_d03 availability_zone">' + data["OS-EXT-AZ:availability_zone"] + '</div>';
            resultHtml += '<div class="right_d04">생성 일시</div>';
            resultHtml += '<div class="right_d03 created">' + parseDateForm(data.created) + '</div>';
            resultHtml += '<div class="right_d04">갱신 일시</div>';
            resultHtml += '<div class="right_d03 updated">' + parseDateForm(data.updated) + '</div>';
            resultHtml += '<div class="right_d04">생성된 이후 시간</div>';
            resultHtml += '<div class="right_d03"></div>';
            resultHtml += '<div class="right_d04 host">호스트</div>';
            resultHtml += '<div class="right_d03">' + data["OS-EXT-SRV-ATTR:host"] + '</div>';


            var flavor = resourceDataBuffer.flavors.filter(function (d) {
                return d.id == data.flavor.id;
            })[0];
            var image = resourceDataBuffer.images.filter(function (d) {
                return d.id == data.image.id;
            })[0];
            if (typeof flavor != "undefined") {
                resultHtml += '<div class="right_d02">Flavor 이름</div>';
                resultHtml += '<div class="right_d03 flavor_name">' + flavor.name + '</div>';
                resultHtml += '<div class="right_d04">Flavor ID</div>';
                resultHtml += '<div class="right_d03 flavor_id">' + flavor.id + '</div>';
                resultHtml += '<div class="right_d04">VCPUs</div>';
                resultHtml += '<div class="right_d03 flavor_vcpus">' + flavor.vcpus + '</div>';
                resultHtml += '<div class="right_d04">RAM</div>';
                resultHtml += '<div class="right_d03 flavor_ram">' + flavor.ram + '(MB)</div>';
                resultHtml += '<div class="right_d04">디스크</div>';
                resultHtml += '<div class="right_d03 flavor_disk">' + flavor.disk + '</div>';

            } else {
                resultHtml += '<div class="right_d02">Flavor</div>';
                resultHtml += '<div class="right_d03 flavor_name">없음</div>';

            }

            $.each(data.addresses, function(key, value) {
                resultHtml += '<div class="right_d02 network_name">' + key + '</div>';
                resultHtml += '<div class="right_d03 network_address">';
                $.each(value, function(index, subnet) {
                    if (index > 0) {
                        resultHtml += '<br/>';
                    }
                    resultHtml += subnet.addr + " / " + subnet["OS-EXT-IPS-MAC:mac_addr"];
                });
                resultHtml += '</div>';
            });
            /*resultHtml += '<div class="right_d04">Private</div>';
            resultHtml += '<div class="right_d03"></div>';

            resultHtml += '<div class="right_d02">default</div>';
            resultHtml += '<div class="right_d03"></div>';*/

            resultHtml += '<div class="right_d02">키 이름</div>';
            resultHtml += '<div class="right_d03">' + ((data.key_name === null) ? "-":data.key_name ) + '</div>';

            resultHtml += '<div class="right_d04">이미지</div>';
            if (typeof image != "undefined") {
                resultHtml += '<div class="right_d03">이름 : ' + image.name + '<br/>ID : ' + image.id + '</div>';
            } else {
                resultHtml += '<div class="right_d03">없음</div>';
            }

            /*
            resultHtml += '<div class="right_d02">연결된 곳</div>';
            resultHtml += '<div class="right_d03"></div>';*/
            break;
        case "volume":
            resultHtml += '<div class="right_d04">크기(GB)</div>';
            resultHtml += '<div class="right_d03 size">' + data.size + '</div>';
            resultHtml += '<div class="right_d04">생성 일시</div>';
            resultHtml += '<div class="right_d03 createdAt">' + parseDateForm(data.createdAt) + '</div>';
            resultHtml += '<div class="right_d04">마운트 정보</div>';
            resultHtml += '<div class="right_d03 attachments">';

            if (data.attachments) {
                for (var i = 0; i < data.attachments.length; i++) {
                    var serverName = nodes.filter(function(d) {return d.id == data.attachments[i].serverId})[0].name;
                    resultHtml += serverName + '의 ' + data.attachments[i].device + '에 연결됨';
                }
            }
            resultHtml += '</div>';
            resultHtml += '<div class="right_d04">metadata</div>';
            resultHtml += '<div class="right_d03 disabled">' + data.metadata.readonly + '</div>';
            resultHtml += '<div class="right_d04">연결모드</div>';
            resultHtml += '<div class="right_d03 attached_mode">' + data.metadata.attached_mode + '</div>';
            break;
    }
    $(".resource_info").html(resultHtml);
    completeCnt = 0;
    resourceDataBuffer = {};
}

function getResourceDataAjax(resource_type, resource_id) {
    return;
//    $(".resource_info").html('');

//    U.ajax({
//        url : '/dashboard/service/resource_data',
//        data : { resource_type:resource_type, resource_id:resource_id },
//        success:function(jsonData) {
//            if (typeof jsonData.error != "undefined") {
//                completeCnt = 0;
//                resourceDataBuffer = {};
////                U.lobiboxMessage("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
//                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
//            } else {
//                ++completeCnt;
//                if (resource_type == "ROUTER") {
//                    resourceDataBuffer.router = jsonData.success.router;
//                } else if (resource_type == "NETWORK") {
//                    resourceDataBuffer.network = jsonData.success.network;
//                } else if (resource_type == "SERVER") {
//                    resourceDataBuffer.server = jsonData.success.server;
//                } else if (resource_type == "VOLUME") {
//                    resourceDataBuffer.volume = jsonData.success.volume;
//                } else {
//                    U.lobiboxMessage(resource_type + "는 준비중입니다.", "info", "정보");
//                }
//                detailResourceDataHtml();
//            }
//        }// end success
//    });
}

function getFlavorDetailList() {
    U.ajax({
        url : '/dashboard/service/new_service/get_flavors',
        success:function(jsonData) {
            if (typeof jsonData.error != "undefined") {
                completeCnt = 0;
                resourceDataBuffer = {};
//                U.lobiboxMessage("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                ++completeCnt;
                resourceDataBuffer.flavors = jsonData.success.flavors;
                detailResourceDataHtml();
            }
        }// end success
    });
}

function getImageDetailList() {

    U.ajax({
        url : '/dashboard/service/new_service/get_images',
        success:function(jsonData) {
            if (typeof jsonData.error != "undefined") {
                completeCnt = 0;
                resourceDataBuffer = {};
//                U.lobiboxMessage("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                ++completeCnt;
                resourceDataBuffer.images = jsonData.success.images;
                detailResourceDataHtml();
            }
        }
    });
}

function networkInterfaceListToggle(btn) {
    if ($(".vnet_list .vnet_group").length == 0) {
        U.lobiboxMessage("가상 네트워크를 연결하세요.", "info", "정보");
        return;
    }
    if ($(".vnet_list").is(':visible')) $(".vnet_list").slideUp(500);
    else $(".vnet_list").slideDown(500);

    if ($(".vnet_list").attr("hidden") == "hidden") {
        $(".vnet_list").removeAttr("hidden");
        $(btn).children("img.pop03_img01").css("filter","flipv()").css("transform","rotate(180deg)");
    } else {
        $(".vnet_list").attr("hidden","");
        $(btn).children("img.pop03_img01").css("filter","").css("transform","");
    }
}
function securityToggle(btn) {
//    $(".security_group").toggle(500);
    if ($(".security_group").is(':visible')) $(".security_group").slideUp(500);
    else $(".security_group").slideDown(500);
//    $(".security_group").toggle(500);

    if ($(".security_group").attr("hidden") == "hidden") {
        $(".security_group").removeAttr("hidden");
        $(btn).children("img.pop03_img01").css("filter","flipv()").css("transform","rotate(180deg)");
    } else {
        $(".security_group").attr("hidden","");
        $(btn).children("img.pop03_img01").css("filter","").css("transform","");
    }
}

function networkDetailToggle(btn) {
    if ($(".network_detail_info").is(':visible')) $(".network_detail_info").slideUp(500);
    else $(".network_detail_info").slideDown(500);

    if ($(".network_detail_info").attr("hidden") == "hidden") {
        $(".network_detail_info").removeAttr("hidden");
        $(btn).children("img.pop03_img01").css("filter","flipv()").css("transform","rotate(180deg)");
    } else {
        $(".network_detail_info").attr("hidden","");
        $(btn).children("img.pop03_img01").css("filter","").css("transform","");
    }
}