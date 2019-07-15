$(function() {
    $(".right_pop").on("click", ".right_pop_close", function() {
//    confirmInfoPop
        if (editFlag) {
            // flag = confirm("저장하지 않고 닫으시겠습니까?");
            U.confirm({
                title: gettext("닫기"),
                message: gettext("저장하지 않고 닫으시겠습니까?"),
                func:function() {
                    selected_link = null;
                    selected_node = null;
                    showNodeInfo();
                    restart();
                }
            });
        } else {
            selected_link = null;
            selected_node = null;
            showNodeInfo();
            restart();
        }
    });
    $(".right_pop").on("click", "#delBtn", function() {
        // var flag = confirm("삭제하시겠습니까?");
        // if (flag){
        //     deleteNode();
        // }
        U.confirm({
            title: gettext("삭제"),
            message: gettext("삭제하시겠습니까?"),
            func:function() {
                deleteNode();
            }
        });
    });

    $(".right_pop").on("change", "select[name=monitor_type]", function() {
        var httpGroup = $(".group-monitor-http");
        if($(this).val() == "TCP" || $(this).val() == "PING") {
            httpGroup.hide();
        } else if ($(this).val() == "HTTP" || $(this).val() == "HTTPS") {
            httpGroup.show();
        }
    });

    $(".right_pop").on("click", ".group-scaling-policy .btnAdd", function() {
        var clone = $(".scaling_policy_detail_info:eq(0)").clone();
        clone.find("input").val("");
        clone.find("input[name=scaling_policy_cooldown]").val(60);
        clone.find("input[name=scaling_policy_threshold]").val(50);
        clone.find("input[name=scaling_policy_period]").val(60);
        clone.find("input[name=scaling_policy_evaluation_periods]").val(1);
        clone.find("select[name=scaling_policy_adjustment_type] option:eq(0)").prop("selected", true);
        clone.find("input[name=scaling_policy_scaling_adjustment]").val(1);
        clone.find("select[name=scaling_policy_meter_name] option:eq(0)").prop("selected", true);
        clone.find("select[name=scaling_policy_statistic] option:eq(0)").prop("selected", true);
        clone.find("select[name=scaling_policy_comparison_operator] option:eq(1)").prop("selected", true);
        $(".append-scaling-policy").append(clone);
    });
    $(".right_pop").on("click", ".scaling_policy_detail_info .btnRemove", function() {
        if ($(".scaling_policy_detail_info").length > 1) {
            $(this).parents(".scaling_policy_detail_info").remove();
        } else {
            U.lobiboxMessage(gettext("scaling in/out 정책은 하나 이상 존재해야 합니다."));
        }
    });
});

function updateName(selected_node, value) {
    if (isEmpty(selected_node)) {
        return;
    }
    var sameNameResource = nodes.filter(function(d) {
        // 이름을 변경할 자원의 타입이 같다 && 변경할 이름이 같다 && 동일한 노드가 아니다.
        if (d.resource_type == AUTOSCALING && d != selected_node) {
            var asNode = getResourceInAutoScaling(d, selected_node.resource_type);
            if (asNode) {
                return (asNode.resource_type.indexOf(selected_node.resource_type) > -1 && asNode.name == value && asNode.id != selected_node.id);
            }
        }
        return (d.resource_type == selected_node.resource_type && d.name == value && d.id != selected_node.id);
    });
    if (sameNameResource.length <= 0) { // 같은 이름, 같은 타입인 자원이 없으면
        var linkListForUpdate = links.filter(function(l) { // 변경된 노드가 속한 link List
            return l.source === selected_node || l.target === selected_node;
        });
        linkListForUpdate = linkListForUpdate.concat(asLinks.filter(function(l) {
            return l.source === selected_node || l.target === selected_node;
        }));
        $.each(linkListForUpdate, function(index, link) { // 연결된 노드들의 정보 update
            var name = "";
            var resource = null;
            var sType = link.source.resource_type;
            var tType = link.target.resource_type;

            if (selected_node == link.source) { // 이름을 변경한 노드가 link의 source일 때
                resource = findNodeById(link.target.id);
                name = link.source.name;

                if (sType == NETWORK || sType == "as_" + NETWORK ) { // Network 이름 변경시
                    if (tType == LOADBALANCER) {
                        if (sType == NETWORK) {
                            resource.data.tenant_net = value;
                            resource.data.pool_member.subnet = value + "_subnet";
                        }
                    } else {
                        var tenant_net_list = null;
                        if (tType == VM) { // VM - tenant_net_list update
                            tenant_net_list = resource.data.tenant_net_list;
                        } else if (tType == "as_" + VM) { // AS - vnic_list update
                            tenant_net_list = resource.data.vnic_list;
                        } // if target = as
                        if (tenant_net_list) {
                            var tenantNetForUpdate = tenant_net_list.filter(function(data) {return data.tenant_net == name;})[0];
                            var updateIndex = tenant_net_list.indexOf(tenantNetForUpdate);
                            if (tenant_net_list[updateIndex]) {
                                tenant_net_list[updateIndex].tenant_net = value;
                                tenant_net_list.reduce(function(a,b) {if (a.indexOf(b) < 0 ) {a.push(b);return a;}},[]);
                            }
                        }
                    }
                } // if source = network

                if (sType == VM) { // VM 이름 변경시
                    if (tType == VOLUME) { // volume - vm_template update
                        resource.data.vm_template = value;
                    } // if target = volume
                } // if source = vm
            } else if (selected_node == link.target) { // 이름을 변경한 노드가 link의 target일 때
                if (tType == NETWORK) { // Network 이름 변경시
                    if (sType == ROUTER) {
                        resource = findNodeById(link.source.id);
                        name = link.target.name;
                        var updateIndex = resource.data.tenant_net_list.indexOf(name);
                        resource.data.tenant_net_list[updateIndex] = value;
                        resource.data.tenant_net_list.reduce(function(a,b) {if (a.indexOf(b) < 0 ) a.push(b);return a;},[]);
                    } // if source = router
                } // if target = network
            } // if selected = target
        });
        selected_node["name"] = value; // 이름바꾸기
        selected_node["data"]["name"] = value;
    } else {
        U.lobiboxMessage(gettext("같은 이름을 가진 ") + selected_node.resource_type + gettext("가 존재합니다."), "info", gettext("정보"));
    }
}

function updateResource(key) {
    if (isEmpty(selected_node)) {
        return;
    }
//    var selected_resource = nodes.filter(function(d) {
//        return d.id == selected_node.id;
//    })[0];
//    if (isEmpty(selected_resource)) {
//        $.each(nodes, function(i, node) {
//            if (node.resource_type == AUTOSCALING) {
//                selected_resource = node.data.as_nodes.filter(function(asd) {return asd.id == selected_node.id;})[0];
//                if (!isEmpty(selected_resource)) {
//                    return;
//                }
//            }
//        });
//    }
    var inputTag = $("input[name=" + key + "]");
    if (inputTag.length == 0) {
        inputTag = $("select[name=" + key + "]");
    }
    if (key=="name") { // 이름 바꿀때
        updateName(selected_node, inputTag.val());
    } else if (inputTag.attr("type") == "checkbox") { // key가 이름이 아니고 체크박스일때
        selected_node.data[key] = inputTag.is(":checked");
    } else { // key가 이름이 아니고 text 나 hidden일때
        var value = inputTag.val();
        if ($.isNumeric(value)) {
            value = parseInt(value);
        }
        if ((selected_node.resource_type == NETWORK || selected_node.resource_type == "as_" + NETWORK) && key == "cidr") {
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
                            U.lobiboxMessage(gettext("CIDR 범위는 0~32입니다."), "info", gettext("정보"));
                            invalidCIDRFlag = true;
                        }
                    } else {
                        U.lobiboxMessage(gettext("CIDR 표기법이 올바르지 않습니다."), "info", gettext("정보"));
                        invalidCIDRFlag = true;
                    }
                } else {
                    U.lobiboxMessage(gettext("IP 주소의 범위는 0.0.0.0 ~ 255.255.255.255 입니다."), "info", gettext("정보"));
                    invalidCIDRFlag = true;
                }
//                console.log(classA);
//                console.log(classB);
//                console.log(classC);
//                console.log(classEtc);
//                console.log(ip_cidr);
            } else {
                invalidCIDRFlag = true;
                U.lobiboxMessage(gettext("CIDR 표기법이 올바르지 않습니다."), "info", gettext("정보"));
            }

            var sameCIDR = nodes.filter(function(d) {
                var asNetwork;
                var result = false;
                if (d.resource_type == AUTOSCALING) {
                    asNetwork = getResourceInAutoScaling(d, "as_" + NETWORK);
                    result = (asNetwork.data[key] == value && d != selected_node && asNetwork != selected_node);
                } else {
                    result = (d.resource_type == NETWORK && d.data[key] == value && d != selected_node);
                }
                return result;
            });
            sameCIDRFlag = (sameCIDR.length > 0);
        }
        if (!sameCIDRFlag && !invalidCIDRFlag) {
            selected_node.data[key] = value;
        }
    }
    restart();
    return selected_node;
}

function checkCIDR(targetCidr) {
    var targetIp = targetCidr.split("/")[0];
    var targetCidrMask = Number.parseInt(targetCidr.split("/")[1]);
    var targetIpBinary = "";
    var result = {
        "result": true,
        "existCidr": ""
    };
    $.each(targetIp.split("."), function(tip_i, tip) {
        targetIpBinary += ("00000000" + Number.parseInt(tip).toString(2)).substr(-8);
    });
    $.each(existCIDRList, function(i, existCIDR) {
        var sourceIp = existCIDR.split("/")[0];
        var sourceCidrMask = Number.parseInt(existCIDR.split("/")[1]);
        var sourceIpBinary = "";
        $.each(sourceIp.split("."), function(sip_i, sip) {
            sourceIpBinary += ("00000000" + Number.parseInt(sip).toString(2)).substr(-8);
        });
        console.log(targetCidrMask, sourceCidrMask);
        if (targetCidrMask >= sourceCidrMask && targetIpBinary.substr(0, sourceCidrMask) == sourceIpBinary.substr(0, sourceCidrMask)) {
            console.log(targetIpBinary.substr(0, sourceCidrMask), sourceIpBinary.substr(0, sourceCidrMask));
            result["result"] = false;
            result["existCidr"] = existCIDR;
            return false; // $.each 를 break
        } else if (sourceCidrMask > targetCidrMask && targetIpBinary.substr(0, targetCidrMask) == sourceIpBinary.substr(0, targetCidrMask)) {
            console.log(targetIpBinary.substr(0, targetCidrMask), sourceIpBinary.substr(0, targetCidrMask));
            result["result"] = false;
            result["existCidr"] = existCIDR;
            return false; // $.each 를 break
        }
    });
    return result;
}

function updateClick(rType) {
    if (isEmpty(selected_node)) {
        return;
    }
    var samePolicyNameFlag = false;
    if (rType == ROUTER) {
        var keyList = ["name", "admin_state"];
        updateResource(keyList[0]);
        updateResource(keyList[1]);
    } else if (rType == NETWORK || rType == "as_" + NETWORK) {
        var keyList = ["name", "admin_state", "share", "ip_version", "gateway_ip", "enable_dhcp"];
        var check = checkCIDR($("input[name=cidr]").val());
        if (check.result) {
            keyList.push("cidr");
        } else {
            U.lobiboxMessage(gettext("이미 존재하는 CIDR입니다.") + "(" + check.existCidr + ") " +  gettext("확인 후 다시 시도해주세요."), "warning");
            invalidCIDRFlag = true;
        }
        $.each(keyList, function(index, value) {
            updateResource(value);
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
        selected_node.data.alloc_pools = alloc_pools_list;
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
        selected_node.data.host_route = host_route_list;
        // host_route parse 끝
        selected_node.data.dns = $("textarea[name=dns]").val();
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
                var tenantNetForUpdate = selected_node.data.tenant_net_list.filter(function(vm_tenant_net) {
                    return vm_tenant_net['tenant_net'] == $(tenant_net).find(".vnet_name").text();
                })[0];
                if (!(typeof tenantNetForUpdate == "undefined")) {
                    tenantNetForUpdate['public_ip'] = $(tenant_net).find("input[name=public_ip]").is(":checked");
                    tenantNetForUpdate['ip_address'] = $(tenant_net).find("input[name=ip_address]").val();
                    tenantNetForUpdate['mac_address'] = $(tenant_net).find("input[name=mac_address]").val();
                }
            });
        }
    } else if (rType == VOLUME || rType == "as_" + VOLUME) {
        var keyList = ["name", "type", "image_type", "size", "volume_image"];
        $.each(keyList, function(index, value) {
            updateResource(value);
        });
    } else if (rType == AUTOSCALING) {
        var keyList = ["name", "cooldown", "desired_capacity", "flavor", "min_size", "max_size"];
        $.each(keyList, function(index, value) {
            updateResource(value);
        });
        var selector = ".scaling_policy_detail_info";
        selected_node.data["scaling_policy_list"] = []
        var existScalingPolicyName = [];
        $(selector).each(function(i, spdi) {
            var scalingPolicy = {
                adjustment_type: $(spdi).find("select[name=scaling_policy_adjustment_type]").val(),
                scaling_adjustment: $(spdi).find("input[name=scaling_policy_scaling_adjustment]").val(),
                cooldown: $(spdi).find("input[name=scaling_policy_cooldown]").val(),
                meter_name: $(spdi).find("select[name=scaling_policy_meter_name] option:selected").val(),
                threshold: $(spdi).find("input[name=scaling_policy_threshold]").val(),
                statistic: $(spdi).find("select[name=scaling_policy_statistic] option:selected").val(),
                period: $(spdi).find("input[name=scaling_policy_period]").val(),
                evaluation_periods: $(spdi).find("input[name=scaling_policy_evaluation_periods]").val(),
                comparison_operator: $(spdi).find("select[name=scaling_policy_comparison_operator] option:selected").val()
            };
            if (existScalingPolicyName.includes(scalingPolicy.name)) {
                samePolicyNameFlag = true;
            } else {
                scalingPolicy["name"] = $(spdi).find("input[name=scaling_policy_name]").val();
            }
            if (selected_node.data["scaling_policy_list"].length > i) {
                selected_node.data["scaling_policy_list"][i] = scalingPolicy;
            } else {
                selected_node.data["scaling_policy_list"].push(scalingPolicy);
            }
            existScalingPolicyName.push(scalingPolicy.name);
        });
        var optionalList = ["cooldown", "statistic", "period", "evaluation_periods", "comparison_operator"];
        $.each(selected_node.data.scaling_policy_list, function(as_i, scaling_policy) {
            $.each(optionalList, function(i, v) {
                if (isEmpty(scaling_policy[v])) {
                    delete scaling_policy[v];
                }
            });
        });
    } else if (rType == LOADBALANCER) {
        var keyList = ["name", "description", "tenant_net", "public_vip", "external_network", "lb_algorithm", "protocol", "protocol_port", "connection_limit", "persistence", "cookie_name"];
        $.each(keyList, function(index, value) {
            updateResource(value);
        });
        var optionalList = ["description", "public_vip", "external_network", "connection_limit", "persistence"];
        $.each(optionalList, function(i, v) {
            if (isEmpty(selected_node.data[v])) {
                delete selected_node.data[v];
            }
        });
        var selector = ".monitor_detail_info";
        selected_node.data["monitor"] = {
            name: $(selector).find("input[name=monitor_name]").val(),
            type: $(selector).find("select[name=monitor_type] option:selected").val(),
            delay: $(selector).find("input[name=monitor_delay]").val(),
            timeout: $(selector).find("input[name=monitor_timeout]").val(),
            max_retries: $(selector).find("input[name=monitor_max_retries]").val(),
            http_method: $(selector).find("input[name=monitor_http_method]").val(),
            url_path: $(selector).find("input[name=monitor_url_path]").val()
        }
        var monitorOptionalList = ["url_path"];
        $.each(monitorOptionalList, function(i, v) {
            if (isEmpty(selected_node.data.monitor[v])) {
                delete selected_node.data.monitor[v];
            }
        });
        var selector = ".pool_member_detail_info";
        var lb_name = $("input[name=name]").val();
        if (isEmpty(lb_name)) {
            lb_name = "";
        }
        selected_node.data["pool_member"] = {
            name: lb_name + "_pool",
            protocol_port: $(selector).find("input[name=pool_member_protocol_port]").val(),
            weight: $(selector).find("input[name=pool_member_weight]").val(),
            subnet: $(selector).find("input[name=pool_member_subnet]").val()
        }
    } else if (rType == "as_" + VM) {
        var keyList = ["name", "flavor", "key_name", "image", "user_data_format", "user_data"];
        $.each(keyList, function(index, value) {
            updateResource(value);
        });
        var optionalList = ["key_name", "user_data_format", "user_data"];
        $.each(optionalList, function(i, v) {
            if (isEmpty(selected_node.data[v])) {
                delete selected_node.data[v];
            }
        });
        var tenant_net_list = $(".vnet_list .vnet");
        if (!(typeof tenant_net_list == "undefined")) {
            $.each(tenant_net_list, function(index, tenant_net) {
                if (typeof selected_node.data.vnic_list == "undefined") {
                    return;
                }
                var tenantNetForUpdate = selected_node.data.vnic_list.filter(function(vm_tenant_net) {
                    return vm_tenant_net['tenant_net'] == $(tenant_net).find(".vnet_name").text();
                })[0];
                if (!(typeof tenantNetForUpdate == "undefined")) {
                    tenantNetForUpdate['public_ip'] = $(tenant_net).find("input[name=public_ip]").is(":checked");
                    tenantNetForUpdate['name'] = $(tenant_net).find("input[name=vnic_name]").val();
                }
            });
        }
    }
    var saveFlag = false;
    if (sameNameFlag) {
        var typeText = $(".right_d01.type").text();
        U.lobiboxMessage(gettext("같은 이름을 가진 ") + typeText + gettext("(이)가 존재합니다."), "info", gettext("정보"));
    } else if (sameCIDRFlag) {
        U.lobiboxMessage(gettext("같은 주소를 가진 네트워크가 존재합니다."), "info", gettext("정보"));
    } else if (samePolicyNameFlag) {
        U.lobiboxMessage(gettext("이름이 중복되는 정책이 존재합니다."), "info", gettext("정보"));
    } else if (!invalidCIDRFlag) {
        saveFlag = true;
        U.lobiboxMessage(gettext("저장되었습니다."), "info", gettext("성공"));
    }
    saveTopologyCookies();
    return saveFlag;
}

function saveTopologyCookies() {
    setCookie("nodes", JSON.stringify([]));
    setCookie("links", JSON.stringify([]));
    setCookie("as_links", JSON.stringify([]));
    setCookie("nodes", JSON.stringify(nodes));
    var link_list = [];
    for ( var link_i = 0; link_i < links.length; link_i++ ) {
        link_list.push({
            "source":{"id":links[link_i].source.id},
            "target":{"id":links[link_i].target.id}
        });
    }
    setCookie("links", JSON.stringify(link_list));
    var as_link_list = [];
    for ( var as_link_i = 0; as_link_i < asLinks.length; as_link_i++ ) {
        if (!isEmpty(asLinks[as_link_i])) {
            as_link_list.push({
                "source":{"id":asLinks[as_link_i].source.id},
                "target":{"id":asLinks[as_link_i].target.id}
            });
        }
    }
    setCookie("as_links", JSON.stringify(as_link_list));
}

// 자원 데이터의 key에 해당하는 값 변경 확인
function confirmResource(key) {
    var inputTag = $("input[name=" + key + "]");
    if (inputTag.length == 0) {
        inputTag = $("select[name=" + key + "]");
    }
    if (inputTag.attr("type") == "checkbox") { // key가 이름이 아니고 체크박스일때
        if (selected_node.data[key] != inputTag.is(":checked") && typeof selected_node.data[key] != "undefined") {
            editedInfoFlag = true;
        }
    } else { // text 나 hidden일때
        var value = inputTag.val();
        var targetValue = selected_node.data[key];
        if (key == "name") {
            targetValue = selected_node.name;
        }
        if (targetValue != value && typeof targetValue != "undefined") {
            editedInfoFlag = true;
        }
    }
    restart();
    return selected_node;
}
// 자원 데이터와 right_pop 에 입력된 데이터가 같은지 확인
function confirmInfoPop(rType, confirmData) {
    if (rType == ROUTER) {
        var keyList = ["name", "admin_state"];
        confirmResource(keyList[0]);
        confirmResource(keyList[1]);
    } else if (rType == NETWORK) {
        var keyList = ["name", "cidr", "admin_state", "share", "ip_version", "gateway_ip", "enable_dhcp"];
        $.each(keyList, function(index, value) {
            confirmResource(value);
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
        if (!(selected_node.data.alloc_pools === alloc_pools_list)) {
            var mainList = selected_node.data.alloc_pools;
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
        if (!(selected_node.data.host_route === host_route_list)) {
            var mainList = selected_node.data.host_route;
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
        if (!(selected_node.data.dns === $("textarea[name=dns]").val())) {
            var mainList = selected_node.data.dns;
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
                var tenantNetForUpdate = selected_node.data.tenant_net_list.filter(function(vm_tenant_net) {
                    return vm_tenant_net['tenant_net'] == $(tenant_net).find(".vnet_name").text();
                })[0];
                if (typeof tenantNetForUpdate != "undefined") {
                    if (tenantNetForUpdate['public_ip'] != $(tenant_net).find("input[name=public_ip]").is(":checked") && typeof tenantNetForUpdate['public_ip'] != "undefined") {
                        editedInfoFlag = true;
                    }
                    if (tenantNetForUpdate['ip_address'] != $(tenant_net).find("input[name=ip_address]").val() && typeof tenantNetForUpdate['ip_address'] != "undefined") {
                        editedInfoFlag = true;
                    }
                    if (tenantNetForUpdate['mac_address'] != $(tenant_net).find("input[name=mac_address]").val() && typeof tenantNetForUpdate['mac_address'] != "undefined") {
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
    } else if (rType == AUTOSCALING) {
        var keyList = ["name", "cooldown", "desired_capacity", "min_size", "max_size"];
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
            data: data,
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
            if (modifyFlag && !selected_node.newNode) {
                $("input[name=name]").attr("disabled", true);
            }
        } else { // 조회모드
            var resource_type = "";
            var resource_url = '/dashboard/service/resource_data';
            var data = null;
            switch(rType) {
                case ROUTER:
                    resource_type = "ROUTER";
                    break;
                case "as_" + NETWORK:
                case NETWORK:
                    resource_type = "NETWORK";
                    break;
                case "as_" + VM:
                case VM:
                    resource_type = "SERVER";
                    break;
                case "as_" + VOLUME:

                    break;
                case VOLUME:
                    resource_type = "VOLUME";
                    break;
                case AUTOSCALING:
                    resource_type = "AUTOSCALING";
                    data = selected_node.data;
                    break;
                case LOADBALANCER:
                    resource_type = "LB";
                    data = selected_node.data;
                    break;
            }
            var result;
            if (selected_node) {
                $(".right_pop").loadPage({
                    url: resource_url,
                    data:{ resource_type:resource_type, resource_id:selected_node.id, data: JSON.stringify(data)},
                    success:function(result) {
                        $("#resource_update").hide();
                        $("#delBtn").hide();
                        $("#closeBtn").show();
                    }
                });
            }
            switch(rType) {
                case ROUTER:
                    resourceType = gettext("라우터");
                    break;
                case "as_" + NETWORK:
                case NETWORK:
                    resourceType = gettext("네트워크");
                    break;
                case "as_" + VM:
                case VM:
                    resourceType = gettext("가상머신");
                    break;
                case "as_" + VOLUME:
                case VOLUME:
                    resourceType = gettext("볼륨");
                    break;
                case FIREWALL:
                    resourceType = gettext("방화벽");
                    break;
                case AUTOSCALING:
                    resourceType = gettext("오토스케일링");
                    break;
                case LOADBALANCER:
                    resourceType = gettext("로드밸런서");
                    break;
                case INTERNET:
                    resourceType = gettext("인터넷");
                    break;
            }
//            d3.select(".right_pop_title_img").attr("src", "/static/img/right_" + rType + ".png");
            d3.select(".right_pop .type").text(resourceType);
        }
        $(".right_pop").on("keyup", "input", function(e) {
            if( e.keyCode==13 ){
                $("#resource_update").trigger("click");
            }
        });
        $(".right_pop").show();
        var focusElm = $(".right_pop input[autofocus]");
        if (!focusElm) {
            focusElm = $(".right_pop input:eq(0)");
        }
        focusElm.focus();
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
                getImagesAjax();
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
        data : {},
        dataType: 'json',
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
    writeModal(gettext("이미지"), '<div class="loader loader-6"></div>');
    $('#modalService').modal();
    U.ajax({
        url : '/dashboard/service/new_service/get_images',
        data : {  },
        dataType: 'json',
        success:function(jsonData) {
            if (typeof jsonData.error != "undefined") {
//                U.lobiboxMessage("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                jsonData = jsonData.success;
                loadingModal = null;
                var imageList = jsonData.images;
                var modalTitle = gettext("이미지");
                var contentHtml = "";
                contentHtml += "<table class='ind_tab01 search_tb' cellpadding='0' border='0' cellspacing='0'>";
                contentHtml += "<tr>";
    //            contentHtml += "<th class='ind_th01'>이름</th>    <th class='ind_th01'>업데이트 일시</th> <th class='ind_th01'>크기</th>     <th class='ind_th01'>유형</th>    <th class='ind_th01'>가시성</th>  <th class='ind_th01'></th>";
                contentHtml += "<th class='ind_th01'>" + gettext("이름") + "</th>    <th class='ind_th01'>" + gettext("업데이트 일시") + "</th> <th class='ind_th01'>" + gettext("크기") + "</th>     <th class='ind_th01'></th>";
                contentHtml += "</tr>";
                $.each(imageList, function(index, value) {
                    contentHtml += "<tr class='" + value.name + "'>";
    //                contentHtml += "<td class='ind_td01'>" + value.name + "</td><td class='ind_td01'>" + value.updated_at + "</td><td class='ind_td01'>" + value.size + "</td><td class='ind_td01'>" + value.disk_format + "</td><td class='ind_td01'>" + value.visibility + "</td><td class='ind_td01'><button class='btn btn-success'>" + "선택(수정)" + "</button></td>";
                    contentHtml += "<td class='ind_td01'>" + value.name + "</td><td class='ind_td01'>" + parseDateForm(value.updated_at) + "</td><td class='ind_td01'>" + bytesToSize(value["size"]) + "</td><td class='ind_td01'><button class='btn btn-success'>" + gettext("선택") + "</button></td>";
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
        dataType: 'json',
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
        dataType: 'json',
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
                contentHtml += "<th class='ind_th01'>" + gettext("이름") + "</th>    <th class='ind_th01'>VCPUS</th> <th class='ind_th01'>RAM</th>    <th class='ind_th01'>Root " + gettext("디스크") + "</th>  <th class='ind_th01'>" + gettext("임시 디스크") + "</th>   <th class='ind_th01'></th>";
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
            resultHtml += '<div class="right_d04">' + gettext("프로젝트") + ' ID</div>';
            resultHtml += '<div class="right_d03 project_id">' + data.tenant_id + '</div>';
            resultHtml += '<div class="right_d04">' + gettext("관리자 상태") + '</div>';
            resultHtml += '<div class="right_d03 admin_state_up">' + (data.admin_state_up ? "UP":"DOWN") + '</div>';
            resultHtml += '<div class="right_d04">' + gettext("외부 게이트웨이") + '</div>';
            resultHtml += '<div class="right_d03 external_gateway_info">';
            $.each(data.external_gateway_info.external_fixed_ips, function(idx, value) {
                if (idx != 0) resultHtml += "<br/>";
                resultHtml += value.ip_address;
            });
            resultHtml += '</div>';
            resultHtml += '<div class="right_d04">' + gettext('네트워크 이름') + '</div>';
            resultHtml += '<div class="right_d03 subnet">' + gettext('서브넷') + '-id,ip address' + '</div>';
            resultHtml += '<div class="right_d04">' + gettext("인터페이스") + '</div>';
            resultHtml += '<div class="right_d03 port">' + gettext("인터페이스") + '</div>';
            break;
        case "network":
            resultHtml += '<div class="right_d04">' + gettext("프로젝트") + ' ID</div>';
            resultHtml += '<div class="right_d03 project_id">' + data.tenant_id + '</div>';
            resultHtml += '<div class="right_d04">' + gettext("관리자 상태") + '</div>';
            resultHtml += '<div class="right_d03 admin_state_up">' + (data.admin_state_up ? "UP":"DOWN") + '</div>';
            resultHtml += '<div class="right_d04">공유</div>';
            resultHtml += '<div class="right_d03 shared">' + (data.shared ? "예":"아니오")+ '</div>';
            resultHtml += '<div class="right_d04">' + gettext("외부 네트워크") + '</div>';
            resultHtml += '<div class="right_d03 external">' + (data["router:external"] ? "예":"아니오") + '</div>';
            resultHtml += '<div class="right_d04">MTU</div>';
            resultHtml += '<div class="right_d03 mtu">' + data.mtu + '</div>';

            resultHtml += '<div class="right_d02">타입</div>';
            resultHtml += '<div class="right_d03 network_type">' + data["provider:network_type"] + '</div>';
            resultHtml += '<div class="right_d04">구분 ID</div>';
            resultHtml += '<div class="right_d03 segmentation">' + data["provider:segmentation_id"] + '</div>';
            resultHtml += '<div class="right_d04">' + gettext("물리적인 네트워크") + '</div>';
            resultHtml += '<div class="right_d03 physical_network">' + data["provider:physical_network"] + '</div>';
//
//
            break;
        case "server":
            resultHtml += '<div class="right_d04">' + gettext("가용 구역") + '</div>';
            resultHtml += '<div class="right_d03 availability_zone">' + data["OS-EXT-AZ:availability_zone"] + '</div>';
            resultHtml += '<div class="right_d04">' + gettext("생성 일시") + '</div>';
            resultHtml += '<div class="right_d03 created">' + parseDateForm(data.created) + '</div>';
            resultHtml += '<div class="right_d04">' + gettext("갱신 일시") + '</div>';
            resultHtml += '<div class="right_d03 updated">' + parseDateForm(data.updated) + '</div>';
            resultHtml += '<div class="right_d04">' + gettext("생성된 이후 시간") + '</div>';
            resultHtml += '<div class="right_d03"></div>';
            resultHtml += '<div class="right_d04 host">' + gettext("호스트") + '</div>';
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
                resultHtml += '<div class="right_d04">' + gettext("디스크") + '</div>';
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

            resultHtml += '<div class="right_d02">' + gettext("키 이름") + '</div>';
            resultHtml += '<div class="right_d03">' + ((data.key_name === null) ? "-":data.key_name ) + '</div>';

            resultHtml += '<div class="right_d04">' + gettext("이미지") + '</div>';
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
            resultHtml += '<div class="right_d04">' + gettext("생성 일시") + '</div>';
            resultHtml += '<div class="right_d03 createdAt">' + parseDateForm(data.createdAt) + '</div>';
            resultHtml += '<div class="right_d04">' + gettext("마운트 정보") + '</div>';
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
            resultHtml += '<div class="right_d04">' + gettext("연결모드") + '</div>';
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
        U.lobiboxMessage(gettext("가상 네트워크를 연결하세요."), "info", gettext("정보"));
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

function detailToggle(selector, btn) {
    if ($(selector).is(':visible')) $(selector).slideUp(500);
    else $(selector).slideDown(500);

    if ($(selector).attr("hidden") == "hidden") {
        $(selector).removeAttr("hidden");
        $(btn).children("img.pop03_img01").css("filter","flipv()").css("transform","rotate(180deg)");
    } else {
        $(selector).attr("hidden","");
        $(btn).children("img.pop03_img01").css("filter","").css("transform","");
    }
}