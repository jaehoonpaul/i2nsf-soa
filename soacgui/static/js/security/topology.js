// set up SVG for D3
// set up initial nodes and links
// 설정 초기 노드와 링크
//  - nodes are known by 'id', not by index in array.
// - nodes 는 배열의 인덱스가 아니라, 'ID' 로 알려져있다.
//  - reflexive edges are indicated on the node (as a bold black circle).
// - reflexive : 가장자리 ( 굵은 검은 색 원으로 ) node 에 표시됩니다.
//  - links are always source < target; edge directions are set by 'left' and 'right'.
// - links 는 항상 source < target; 가장자리 방향은 '왼쪽'과 '오른쪽' 으로 설정됩니다.


var re = new RegExp("/dashboard/security/(\\w+)");
var re1 = new RegExp("/dashboard/security/[\\w-]+/(\\w+)");
var urlStr = $(location).attr('pathname');
var new_service_url = urlStr.replace(re, "$1").replace("/","");
var modify_service_url = urlStr.replace(re1, "$1").replace("/","");
var availabilityZoneList = null;
var security_resources = [];
var security_types = [];
var modifyBtnSrc = "/static/img/dashboard/security/security_save_bt_01.png";

//if (new_service_url == "create" || modify_service_url=="modify") {
//    editFlag = true;
//    if (modify_service_url=="modify") {
//        modifyFlag = true;
//        deleteCookie("nodes");
//        deleteCookie("links");
//        $("#saveBtn").attr("src", );
//    }
//    U.lobiboxMessage("CTRL을 누른 상태에서 드래그를 하면 아이콘을 이동할 수<br/>있습니다.", "info", "정보");
//    $("#cancelBtn").show();
//    $("#saveBtn").show();
//    $("#cancelBtn").click(function() {
//        U.confirm({
//            title:"취소",
//            message:"작업중인 데이터를 전부 지우고<br/><br/> 리스트 페이지로 이동하시겠습니까?",
//            func:function() {
//                deleteCookie("nodes");
//                deleteCookie("links");
//                location.href = "/dashboard/security";
//            }
//        });
//    });
//} else {
//    $("#service_list").show();
//    $("#modifyBtn").show();
//    $("#modifyBtn").click(function() {
//        location.href = urlStr.replace("detail", "modify");
//    });
//}

//
//function refreshNodes() {
//    // gNodes (node) group
//    // NB: the function arg is crucial here! nodes are known by id, not by index!
//    gNodes = gNodes.data(nodes, function(d) { return d.id; });
//    // update existing nodes (reflexive & selected visual states)
//    gNodes.selectAll('circle')
////        .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
//        .classed('reflexive', function(d) { return d === selected_node; });
//
//    gNodes.selectAll('text')
//        .text(function(d) { return d.name; });
//
//    // add new nodes
//    var g = gNodes.enter().append('svg:g');
//    var tempCir = g.append('svg:circle')
//        .attr('class', 'node')
//        .classed(function(d) { return d.resource_type; })
//        .attr('r', nodesRadius)          //반지름
////        .attr("cx", nodesRadius)  //중심이동
////        .attr("cy", nodesRadius)  //중심이동
////        .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
//        .style('fill', function(d) {
//            if (d.data.security) {
//                return "url(#security)";
//            } else {
//                return "url(#" + d.resource_type + ")";
//            }
//        })
//        .style('stroke', "#ddd")
//        .on('mouseover', function(d) {
//            // 다른 node를 클릭&drag후 마우스가 해당node에 over하면 1.1배커짐
//            // transform='scale(1.1)' => 1.1배
//            if (!mousedown_node || d === mousedown_node) return;
//            // enlarge target node
//            d3.select(this).attr('transform', 'scale(1.1)');
//        })
//        .on('mouseout', function(d) {
//            if (!mousedown_node || d === mousedown_node) return;
//            // 위 조건에서 마우스가 벗어나면 원래크기로 돌아옴
//            d3.select(this).attr('transform', '');
//        })
//        .on('mousedown', function(d) {
//            if (d3.event.ctrlKey || d3.event.button == 2) return;
//            // select node
//            mousedown_node = d;
//            down = d3.mouse(document.body);
//            if (editFlag) { // 수정모드
//                // 흐려지는이벤트
////                d3.select(this).style("filter", "url(#motionFilter)")
////                    .transition().duration(300)
////                    .delay(300)
////                    .style("filter", "");// 흐려지는 이벤트 끝
//                selected_link = null;
//                 // reposition drag line
//                drag_line.style('marker-end', 'url(#end-arrow)')
//                    .classed('hidden', false)
//                    .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
//            }
//            restart();
//        })
//        .on('mouseup', function(d) {
//            if (!mousedown_node) return;
//            drag_line.classed('hidden', true);//.style('marker-end', '');
//            mouseup_node = d;
//            if (!editFlag) {
//                d3.select(this).attr('transform', '');
//                if (!(dist(down, d3.mouse(document.body)) > tolerance)) {
//                    if (waitDblClick) {
//                        selected_node = d;
//                        window.clearTimeout(waitDblClick);
//                        waitDblClick = null;
//                        dblclickEvent(d);
//                    } else {
//                        waitDblClick = window.setTimeout((function(d, e) {
//                            clickedNode = d;
//                            return function() {
//                                waitDblClick = null;
//                            }
//                        })(d, d3.event), waitDblClickTime);
//                    }
//                }
//                return;
//            }
//            if (mouseup_node === mousedown_node && editFlag) { resetMouseVars(); return; }
//            d3.select(this).attr('transform', '');
//            resourceLinking();
//            restart();
//        });
//    if (editFlag) {
////        tempCir.on("contextmenu", function() {});
////        tempCir.on("contextmenu", d3.contextMenu(
////            function(d) {
////                if (d.resource_type == INTERNET) {
////                    var internetMenu = [];
////                    internetMenu.push({ title: function(d) { return d.name; } });
////                    internetMenu.push({
////                        title: function(d) {
////                            if (d.fixed == 5) {return "아이콘 위치 고정 해제";}
////                            else if (d.fixed == 4) {return "아이콘 위치 고정";}
////                            else if (d.fixed) {return "아이콘 위치 고정 해제";}
////                            else if (!d.fixed) {return "아이콘 위치 고정";}
////                            else {/*console.log(d.fixed);*/}
////                        },
////                        action: function(elm, d, i) {d.fixed = !d.fixed;restart();}
////                    });
////                    return internetMenu;
////                }
////                return menu;
////            }, {onOpen: function() {/* console.log('opened!'); */}, onClose: function() {/* console.log('closed!'); */}}
////        ));
//        tempCir.on("contextmenu", function(d) {
//            e = d3.event;
//            clickedNode = d;
//            $(".actionPopUp").offset({top:e.clientY - 3, left:e.clientX - 3});
//            $(".actionPopUp").slideDown("fast");
//            setResourceMenu(d);
//        }).on("dblclick", function(d) {
//            if ($(".right_pop").is(":visible") && d != selected_node) {
//                var confirmData = {
//                    title:"저장하기",
//                    message:"입력중인 정보창이 열려있습니다.<br/><br/>저장하시겠습니까?",
//                    func:function() {
//                        $("#resource_update").trigger("click");
//                        if (d.resource_type != INTERNET){
//                            selected_node = d;
//                            dblclickEvent(d);
//                        }
//                    },
//                    cancelFunc:function() {
//                        restart();
//                        if (d.resource_type != INTERNET){
//                            selected_node = d;
//                            dblclickEvent(d);
//                        }
//                    }
//                };
//                var rType = selected_node.resource_type;
//                confirmInfoPop(rType, confirmData);
//            } else {
//                if (d.resource_type != INTERNET){
//                    selected_node = d;
//                    dblclickEvent(d);
//                }
//            }
//        });
//    }
//    // show node IDs
//    g.append('svg:text')
//       .attr('x', 0)
//       .attr('y', nodesRadius + 10)
//       .attr('class', 'id')
//       .text(function(d) { return d.name; });
////    g.on("mouseover", function (d) {
////            d3.select(this).select('text')
////              .text(function(d) {return d.name;});
////        });
//    // remove old nodes
//    gNodes.exit().remove();
//    // set the graph in motion
//}


function nodeOnClickEvent(d, e) {
    $(".actionPopUp").offset({top:e.clientY, left:e.clientX});
    $(".actionPopUp").slideDown("fast");
    setResourceMenu(d);
}


function loadNode(data, key, x=1, y=1) { // TODO:가상머신 두개일때 처리
    x = parseInt(Math.random() * width / 2) + parseInt(width /4);
    y = parseInt(Math.random() * height / 2) + parseInt(height /4);
    var id;
    var name;
    var resource_type;
    switch(key) {
        case INTERNET:
            id = data.id;
            name = data.name;
            resource_type = INTERNET
            break;
        case "volume_list":
            id = data.volume_id;
            name = data.volume_name;
            resource_type = VOLUME;

            break;
        case "vm_template_list":
        case "vm_list":
            id = data.vm_id;
            name = data.vm_name;
            if (modifyFlag) {
                name = data.server_name; // TODO:바꿔달라하자
                data.tenant_net_list = data.vnic_list;
                for (var i=0; i < data.volume_list.length; i++) {
//                    data.volume_list[i].name = data.volume_list[i].name.replace(name + "_","");
                    data.volume_list[i].vm_template = name;
                    loadNode(data.volume_list[i], "volume_list");
                }
            }
            resource_type = VM;
            break;
        case "network_list":
            id = data.network_id;
            name = data.network_name;
            resource_type = NETWORK;
            break;
        case "vrouter_list":
            id = data.vrouter_id;
            name = data.vrouter_name;
            resource_type = ROUTER;
            break;
        case "loadbalancer_list":
            id = data.lb_pool_id;
            name = data.lb_name;
            resource_type = LOADBALANCER;
            break;
        case "firewall_list":
            id = data.fw_id;
            name = data.fw_name;
            resource_type = FIREWALL;
            break;
        case "vpn_list":
            return;
        /*
            id = data.vpn_id;
            name = data.vpn_name;
            resource_type = VPN;
            break;*/
        default:
            resource_type = UNKNOWN;
            break;
    }
    var node = {
        id: id,
        name: name,
        reflexive: false,
        fixed: false,
        resource_type: resource_type,
        data: data,
        x: x,y: y
    }
    if (modifyFlag) {
        if (typeof node.id == "undefined") node.id = guid();
        if (typeof node.name == "undefined") node.name = data.name;
    }
    nodes.push(node);
    /*if (lastNodeX%100 <= 10) {
        lastNodeX += 100;
    } else {
        lastNodeX = 0;
    }*/
}

function saveServiceAjax() {
    var emptyNameNodeList = nodes.filter(function(node, i) {
        return isEmpty(node.name);
    });
    if (emptyNameNodeList.length > 0) {
        U.lobiboxMessage("자원의 이름은 필수 항목입니다.", "error", "에러");
        return;
    }
    var link_list = [];
    for ( var link_i = 0; link_i < links.length; link_i++ ) {
        link = {
            "source":{"name":links[link_i].source.name, "resource_type":links[link_i].source.resource_type},
            "target":{"name":links[link_i].target.name, "resource_type":links[link_i].target.resource_type}
        }
        link_list.push(link);
    }
    var node_list = [];
    for (var node_i=0; node_i < nodes.length; node_i++) {
        node = {
            "name":nodes[node_i].name,
            "resource_type":nodes[node_i].resource_type,
            "data":nodes[node_i].data
        }
        delete nodes[node_i].data.id;
        node_list.push(node);
    }

    var mapData = {"nodes":node_list, "links":link_list, "security_types":security_types};
    var vmNode = nodes.filter(function(node, idx) {
        return node.resource_type == VM
    })[0];
    $("input[name=image_name]").val(vmNode.data.image);
    var url = "";
    var security_info = {
        security_name: $("input[name=security_name]").val(),
        description: $("textarea[name=description]").val(),
        manufacturer_name: $("input[name=manufacturer_name]").val(),
        software_version: $("input[name=software_version]").val(),
        image_name: $("input[name=image_name]").val()
    }
    if (editFlag && !modifyFlag) {
        security_info["security_id"] = guid();
    }
    var formData = new FormData();
    if (isEmpty($("input[name=security_icon]")[0].files)) {
        security_info["security_icon"] = service.security_icon;
    } else {
        formData.append("security_icon", $("input[name=security_icon]")[0].files[0]);
    }
    if (isEmpty($("input[name=manufacturer_icon]")[0].files)) {
        security_info["manufacturer_icon"] = service.manufacturer_icon;
    } else {
        formData.append("manufacturer_icon", $("input[name=manufacturer_icon]")[0].files[0]);
    }
    if (isEmpty($("input[name=capability_xml]")[0].files)) {
        security_info["capability_xml"] = service.capability_xml;
    } else {
        formData.append("capability_xml", $("input[name=capability_xml]")[0].files[0]);
    }
    fileUpload({
        progress:true,
        formData:formData,
        success:function(jsonData) {
            if (jsonData.error) {
                if (jsonData.error.security_icon_path) {
                    U.lobiboxMessage(jsonData.error.security_icon_path, "error", "실패");
                }
                if (jsonData.error.manufacturer_file_path) {
                    U.lobiboxMessage(jsonData.error.manufacturer_file_path, "error", "실패");
                }
                if (jsonData.error.manufacturer_file_path) {
                    U.lobiboxMessage(jsonData.error.capability_xml_path, "error", "실패");
                }
            }
            if (!isEmpty($("#customCapabilityData").val())) {
                var data = {
                    "nsf": JSON.parse($("#customCapabilityData").val())
                };
            }
            if (jsonData.success) {
                var success = jsonData.success;
                if (success.security_icon_path) {
                    security_info["security_icon"] = success.security_icon_path;
                }
                if (success.manufacturer_file_path) {
                    security_info["manufacturer_icon"] = success.manufacturer_file_path;
                }
                if (success.capability_xml_path) {
                    security_info["capability_xml"] = success.capability_xml_path;
                }
            }

            data = {"security_info":security_info, "data":mapData};
            U.ajax({
                progress:true,
                url : url,
                data : {"data": JSON.stringify(data)},
                success:function(jsonData) {
                    if (typeof jsonData.success == "undefined") {
                        U.lobibox(jsonData.error.message, "error", jsonData.error.title);
                    } else {
                        deleteCookie("nodes");
                        deleteCookie("links");
                        U.lobiboxMessage(U.replaceEmptyText(jsonData.success.message), "info", jsonData.success.title);
                        location.replace("/dashboard/security");
                    }
                }
            });
        }
    });
}

function getService(jsonData) {
    var service_detail = jsonData.success.service_detail;
    service = {
        id : service_detail.region_id,
        name: service_detail.name,
        description: service_detail.description,
        status: service_detail.status
    };
    $(".service_name").html(service_detail.name);

    $.each(jsonData.public_network, function(index, public_net) {
        loadNode(public_net, INTERNET);
    });
    for (var key in service_detail) {
        if (service_detail[key] instanceof Array) {
            if (["network_list", "vrouter_list", "vm_template_list", "vm_list", "volume_list"].indexOf(key) == -1) continue;
            for (var i = 0; i < service_detail[key].length; i++) {
                loadNode(service_detail[key][i], key);
            }// end for
        }// end if
    }//end for
    if (typeof jsonData.links != "undefined") {

        for (var index = 0; index < jsonData.links.length; index++) {
            var source_name;
            var target_name;
            if (typeof jsonData.links[index].source == "string") { source_name = jsonData.links[index].source; }
            else { source_name = jsonData.links[index].source.name; }
            if (typeof jsonData.links[index].target == "string") { target_name = jsonData.links[index].target;}
            else { target_name = jsonData.links[index].target.name; }

            var source = findNodeByName(source_name, jsonData.links[index].source.resource_type, true);
            var target = findNodeByName(target_name, jsonData.links[index].target.resource_type, true);
            insertNewLink(source, target);
        }
    }
    restart();
}

function getSecurity(jsonData) {
    var security_resource = jsonData.success.security_resource;
    $(".security_name").html(security_resource.security_name);
    service = {
        id: security_resource.security_id,
        name: security_resource.security_name,
        description: security_resource.description,
        security_icon : security_resource.security_icon,
        manufacturer_icon : security_resource.manufacturer_icon,
        manufacturer_name : security_resource.manufacturer_name,
        software_version : security_resource.software_version
    };
    var security_group = jsonData.success.security_resource.data;
    security_types = JSON.parse(security_group.security_types);
    var loadLinks = JSON.parse(security_group.links);
    var loadNodes = JSON.parse(security_group.nodes);
    var vmNode = null;
    $.each(loadNodes, function(idx, loadNode) {
        loadNode.data.name = loadNode.name;
        var existNode = nodes.filter(function(node, index) {
            return node.name == loadNode.name && node.resource_type == loadNode.resour;
        });
        if (existNode.length == 0) {
            if (loadNode.resource_type == "virtual_machine") {
                loadNode.data.security = true;
                var x = parseInt(Math.random() * 100 - 50) + $("#vis").width();
                var y = parseInt(Math.random() * 100 - 50) + $("#vis").height();
                loadNode.data.id = guid();
                insertNewNode(loadNode.data, x, y, false);
            } else {
                var x = parseInt(Math.random() * 100 - 50) + $("#vis").width();
                var y = parseInt(Math.random() * 100 - 50) + $("#vis").height();
                loadNode.data.id = guid();
                insertNewNode(loadNode.data, x, y, false);
            }
        }
    });

    for (var index = 0; index < loadLinks.length; index++) {
        var source_name;
        var target_name;
        if (typeof loadLinks[index].source == "string") { source_name = loadLinks[index].source; }
        else { source_name = loadLinks[index].source.name; }
        if (typeof loadLinks[index].target == "string") { target_name = loadLinks[index].target;}
        else { target_name = loadLinks[index].target.name; }

        var source = findNodeByName(source_name, loadLinks[index].source.resource_type);
        var target = findNodeByName(target_name, loadLinks[index].target.resource_type);
        insertNewLink(source, target);
    }

    restart();
}
function getSecurityAjax() { // token, tenant_name, user_name, service_id
    var url = '';
    if (editFlag && !modifyFlag) return;
    if (modifyFlag) url = 'detail';
    U.ajax({
        progress : true,
        url : url,
        success:function(jsonData) {
            if (typeof jsonData.success != 'undefined') {
                getSecurity(jsonData);
                if (getCookie("nodes") && editFlag) {
                    var nodesTemp = JSON.parse(getCookie("nodes"));
                    var linksTemp = JSON.parse(getCookie("links"));
                    for (var i = 0; i < nodesTemp.length; i++) {
                        if (nodesTemp[i].resource_type != INTERNET) {
                            nodes.push(nodesTemp[i]);
                        }
                    }
                    for (var i = 0; i < linksTemp.length; i++) {
                        if (linksTemp[i].resource_type != INTERNET) {
                            var source = findNodeById(linksTemp[i].source.id);
                            var target = findNodeById(linksTemp[i].target.id);
                            insertNewLink(source, target);
                        }
                    }
                    restart();
                }
            }
            if (typeof jsonData.error != 'undefined') {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
        }
        // end success
    });
}
function getServiceAjax() { // token, tenant_name, user_name, service_id
    return;
//    U.ajax({
//        progress : true,
//        url : '',
//        success:function(jsonData) {
//            if (typeof jsonData.success != 'undefined') {
//                getService(jsonData);
//                if (getCookie("nodes") && editFlag) {
//                    var nodesTemp = JSON.parse(getCookie("nodes"));
//                    var linksTemp = JSON.parse(getCookie("links"));
//                    for (var i = 0; i < nodesTemp.length; i++) {
//                        if (nodesTemp[i].resource_type != INTERNET) {
//                            nodes.push(nodesTemp[i]);
//                        }
//                    }
//                    for (var i = 0; i < linksTemp.length; i++) {
//                        if (linksTemp[i].resource_type != INTERNET) {
//                            var source = findNodeById(linksTemp[i].source.id);
//                            var target = findNodeById(linksTemp[i].target.id);
//                            insertNewLink(source, target);
//                        }
//                    }
//                    restart();
//                } else if (!editFlag) { // 조회모드
//                    $("#chainTab").removeAttr("href");
//                    var jsonData = {"success":{"service":jsonData.success, "links":jsonData.links, "public_network":jsonData.public_network}};
//                    $("#chainTab").click(function() {postMove("./chaining/", JSON.stringify(jsonData))});
//                    $("#chainTab").css("cursor", "pointer");
//                }
//            }
//            if (typeof jsonData.error != 'undefined') {
////                U.lobiboxMessage("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
//                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
//            }
//        }
//        // end success
//    });
}
//
//function drop(ev) {
//    ev.preventDefault();
//    var nodeData = {
//        id:guid()
//    };
//    var resource_type;
//    var key;
//    if (ev.dataTransfer.getData("type") == "security") {
////        nodeData = Object.assign(nodeData, JSON.parse(ev.dataTransfer.getData("data")));
//        var loadData = JSON.parse(JSON.parse(ev.dataTransfer.getData("data")).data.data);
//        var security_group = loadData;
//        security_types = security_group.security_types;
//        var loadLinks = security_group.links;
//        var loadNodes = security_group.nodes;
//        var vmNode = null;
//        $.each(loadNodes, function(idx, loadNode) {
//            loadNode.data.name = loadNode.name;
//            var existNode = nodes.filter(function(node, index) {
//                return node.name == loadNode.name;
//            });
//            if (existNode.length == 0) {
//                if (loadNode.resource_type == "virtual_machine") {
//                    loadNode.data.security = true;
//                }
//                var x = parseInt(Math.random() * 100 - 50) + $("#vis").width()/2;
//                var y = parseInt(Math.random() * 100 - 50) + $("#vis").height()/2;
//                loadNode.data.id = guid();
//                insertNewNode(loadNode.data, x, y, false);
//            }
//        });
//        for (var index = 0; index < loadLinks.length; index++) {
//            var source = findNodeByName(loadLinks[index].source);
//            var target = findNodeByName(loadLinks[index].target);
//            insertNewLink(source, target);
//        }
//    } else if (ev.dataTransfer.getData("type") == "resource") {
//        var data = ev.dataTransfer.getData("text");
////        var selItem = $("#"+data);
//        key = data.replace("_item","");
//        nodeData.name = "";
//        switch(key) {
//            case "vm":
//                resource_type = VM;
//                break;
//            case "volume":
//                resource_type = VOLUME;
//                break;
//            case "network":
//                resource_type = NETWORK;
//                data.enable_dhcp = true;
//                break;
//            case "vrouter":
//                resource_type = ROUTER;
//                break;
//            case "loadbalancer":
//                resource_type = LOADBALANCER;
//                break;
//            case "firewall":
//                resource_type = FIREWALL;
//                break;
//            default:
//                resource_type = UNKNOWN;
//                break;
//        }
//        nodeData.resource_type = resource_type;
//
//        if (typeof nodeData.name != "undefined") {
//            insertNewNode(nodeData, ev.pageX - 210 , ev.pageY - 122);
//        }
//
//        if (ev.dataTransfer.getData("type") == "security") {
//            for (var index = 0; index < loadLinks.length; index++) {
//                var source = findNodeByName(loadLinks[index].source);
//                var target = findNodeByName(loadLinks[index].target);
//                insertNewLink(source, target);
//            }
//        }
//    }
//    restart();
//}