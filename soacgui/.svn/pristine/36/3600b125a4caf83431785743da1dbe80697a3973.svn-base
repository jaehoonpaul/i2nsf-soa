// set up SVG for D3
// set up initial nodes and links
// 설정 초기 노드와 링크
//  - nodes are known by 'id', not by index in array.
// - nodes 는 배열의 인덱스가 아니라, 'ID' 로 알려져있다.
//  - reflexive edges are indicated on the node (as a bold black circle).
// - reflexive : 가장자리 ( 굵은 검은 색 원으로 ) node 에 표시됩니다.
//  - links are always source < target; edge directions are set by 'left' and 'right'.
// - links 는 항상 source < target; 가장자리 방향은 '왼쪽'과 '오른쪽' 으로 설정됩니다.

// selected_node = mousedown_node;

var re = new RegExp("/dashboard/telemeter/(\\w+)");
var urlStr = $(location).attr('pathname');
var new_service_url = urlStr.replace(re, "$1").replace("/","");
var modifyFlag = false;

var VM = "VM",
    NETWORK = "network",
    ROUTER = "ROUTER",
    FIREWALL = "firewall",
    LOADBALANCER = "load_balancer",
    VOLUME = "volume",
    VPN = "vpn",
    UNKNOWN = "unknown";
var instanceList = [];
var nodesRadius = 30;
var nodes = [
//    {
//        id: 98921,
//        name: "public",
//        x: 100, y: 100,
//        reflexive: false,
//        fixed:false,
//        data:{
//            vm_name:"ETRI_NET",
//            vm_id:0,
//            status:"Active"
//        },
//        resource_type:"internet"
//    }
],
links = [],
groups = [];
var width  = $("#vis").width() - 20;
width = 400;
//var height = $("#vis").height() - 20;
var height = 850;
var colors = d3.scale.category10();

var svg = d3.select('#vis')
    .append('svg')
    .attr('oncontextmenu', 'return false;')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'service');

// init D3 force layout
var force = d3.layout.force()
        .nodes(nodes)
        .links(links)     //링크된 노드의 거리 유지
        .size([400, 450])   // 중력 이벤트 위치
        .linkDistance(150)    //링크된 노드의 거리
        .charge(-350)       //노드간의 거리
        .on('tick', tick);
var focusNodeName = false;

// define arrow markers for graph links
var defs = svg.append('svg:defs');
var svgPatternStr = "";
svgPatternStr += 'defs.append("svg:pattern")';
svgPatternStr += '.attr("id", "%T")';
svgPatternStr += '.attr("width", 1).attr("height", 1)';
svgPatternStr += '.attr("patternContentUnits", "objectBoundingBox")';
svgPatternStr += '.append("svg:image")';
svgPatternStr += '.attr("xlink:href", \'/static/img/%T.png\')';
svgPatternStr += '.attr("width", 1).attr("height", 1)';
svgPatternStr += '.attr("preserveAspectRatio", "xMinYMin slice");';
eval(svgPatternStr.replace("%T", "internet").replace("%T", "internet_60_01"));
eval(svgPatternStr.replace("%T", ROUTER).replace("%T", "resource_router"));
//eval(svgPatternStr.replace("%T", ROUTER+"_80").replace("%T", "resource_router_80"));
eval(svgPatternStr.replace("%T", NETWORK).replace("%T", "network_60_01"));
eval(svgPatternStr.replace("%T", VM).replace("%T", "resource_virtualmachine"));
//eval(svgPatternStr.replace("%T", VM+"_80").replace("%T", "resource_vm_80"));
eval(svgPatternStr.replace("%T", VOLUME).replace("%T", "volume_icon_02_60_01"));
eval(svgPatternStr.replace("%T", FIREWALL).replace("%T", "fire_wall_60_01"));
eval(svgPatternStr.replace("%T", LOADBALANCER).replace("%T", "loadbalancer_60_01"));

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');

d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

// handles to link and node element groups
// 생성순서에따라 위아래가 바뀜(태그위치)
// 만약 gGroup 이 pathLink 보다 위에 있다면 화면에서 그룹이 링크를 가려 눌리지않음
var gGroup = svg.append('svg:g'),
    pathGroup = svg.append('svg:g').selectAll('path'),
    pathLink = svg.append('svg:g').selectAll('path'),
    gNodes = svg.append('svg:g').selectAll('g');
// mouse event vars
var selected_node = null,
        selected_link = null,
        mousedown_link = null,
        mousedown_node = null,
        mouseup_node = null;

function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
}

// update force layout (called automatically each iteration)
var tempCnt = 0
function tick() {

    pathGroup.attr('d', function(d) {
        var data = "";
        for(var j = 0; j < d.nodeList.length; j++)
            data += (j != 0 ? "L" : "M") + d.nodeList[j].x + "," + d.nodeList[j].y;
        if (data.length !== 2) data += "Z"; // work around Firefox bug.
        return data;
    });
    // draw directed edges with proper padding from node centers
    pathLink.attr('d', function(d) {
        var deltaX = d.target.x - d.source.x;       //선 연결 X좌표 중앙에서출발
        var deltaY = d.target.y - d.source.y;       //선 연결 Y좌표 중앙에서출발
        var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        var normX = deltaX / dist;
        var normY = deltaY / dist;
        var sourcePadding = d.left ? nodesRadius + 1 : nodesRadius;
        var targetPadding = d.right ? nodesRadius + 1 : nodesRadius;
        var sourceX = d.source.x + (sourcePadding * normX);
        var sourceY = d.source.y + (sourcePadding * normY);
        var targetX = d.target.x - (targetPadding * normX);
        var targetY = d.target.y - (targetPadding * normY);
        return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });

    gNodes.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
    });

}

function refreshGroups() {
    insertGroup();
    pathGroup = pathGroup.data(groups, function(d) { return d.id; });
    pathGroup.enter().append('path')
        .attr('class', 'subset')
        .style("fill", function(d) { return colors(d.id); })
        .style("stroke", function(d) { return colors(d.id); });
    pathGroup.exit().remove();
}

function refreshLinks() {

    // path (link) group
    pathLink = pathLink.data(links);
    // update existing links
    pathLink.classed('selected', function(d) { return d === selected_link; })
        // add new links
    pathLink.enter().append('svg:path')
        .attr('class', 'link')
        .classed('selected', function(d) { return d === selected_link; })
        .on('mousedown', function(d) {
            restart();
        });
    // remove old links
    pathLink.exit().remove();
}

function refreshNodes() {
    // gNodes (node) group
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    gNodes = gNodes.data(nodes, function(d) { return d.id; });
    // update existing nodes (reflexive & selected visual states)
    gNodes.selectAll('circle')
//        .classed('reflexive', function(d) { return d.id == $(".instance_list_click").text(); });
        .classed('reflexive', function(d) { return (d.resource_type == VM/* || d.resource_type == ROUTER*/) && d === selected_node; });
//        .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
//        .classed('reflexive', function(d) { return d.resource_type == VM || d.resource_type == ROUTER; });

    gNodes.selectAll('text')
        .text(function(d) { return d.name; });

    // add new nodes
    var g = gNodes.enter().append('svg:g');
    g.append('svg:circle')
        .attr('class', 'node')
        .classed(function(d) { return d.resource_type; })
        .attr('r', nodesRadius)          //반지름
        .style('fill', function(d) { return "url(#" + d.resource_type + ")"; })
        .style('stroke', "#ddd")
        .on('mousedown', function(d) {
            if (d3.event.button == 2) return;
            // select node
            if (d.resource_type == VM) {
                resetMouseVars();
                mousedown_node = d;
                //TODO: 마우스Down이벤트
				var instanceListHtml = $('#instanceList').children();
                var selectInstance = instanceListHtml.filter(function(idx, elem) {
					return d.id == $(elem).children().text();
				})[0];
				getInstanceInfo(d.id); //, $(selectInstance).children());
            }/* else {
                getNewSamplesList(d.id);
            } */
            restart();
        })
        .on('mouseup', function(d) {
            if (!mousedown_node || d.resource_type != VM) return;
            if (d === mousedown_node) {
                selected_node = d;
                resetMouseVars();
                restart();
                return;
            }
            d3.select(this).attr('transform', '');
            restart();
        });

    // show node IDs
    g.append('svg:text')
       .attr('x', 0)
       .attr('y', nodesRadius + 8)
       .attr('class', 'id')
       .text(function(d) { return d.name; });
    gNodes.exit().remove();
}
var tempFlag= true;
// update graph (called when needed)
function restart() {
    refreshGroups();
    refreshLinks();
    refreshNodes();
    pathGroup.moveToBack();
    force.start();
}

function getCpuDelta(id) {
    console.log(id);
    U.ajax({
		url : "/dashboard/telemeter/metering/" + id,
        success:function(jsonData) {
            console.log(jsonData);
        }
    });
}
/*
function getNewSamplesList(id) {
    console.log(id);
    U.ajax({
		url : "/dashboard/telemeter/new_samples/" + id,
        success:function(jsonData) {
            console.log(jsonData);
        }
    });
}*/

function findNodeById(id) {
    var node = null;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id == id) {
            node = nodes[i];
            break;
        }
    }
    return node;
}


function findNodeByName(name) {
    var node = null;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].name == name) {
            node = nodes[i];
            break;
        } else if (nodes[i].name.indexOf(name) > 2 && nodes[i].resource_type == VOLUME) {
            node = nodes[i];
            break;
        }
    }
    return node;
}

function insertGroup() {
    for ( var i = 0; i < links.length; i++ ) {
        var node1 = links[i].source;
        var node2 = links[i].target;
        if (node1.resource_type == NETWORK && node2.resource_type == VM) {
            // node1 이 network이고 node2 가 vm 이면
            var flag = false;
            for (var j = 0; j < groups.length; j++) {
                if (groups[j].id == node1.id) {
                    // 그룹들 중 network id로 생성된 그룹이 있다면 추가만
                    if (groups[j].nodeList.indexOf(node2) == -1) {
                        // 해당 group에 추가할 node가 없으면 추가
                        groups[j].nodeList.push(node2);
                    }
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                // 생성된 그룹이 없다면 생성
                var group = { id:node1.id, nodeList:[node1, node2] };
                groups.push(group);
            }
        } else if (node1.resource_type == VM && node2.resource_type == NETWORK) {
            var flag = false;
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].id == node2.id) {
                    if (groups[i].nodeList.indexOf(node1) == -1) {
                        groups[i].nodeList.push(node1);
                    }
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                var group = { id:node2.id, nodeList:[node2, node1] };
                groups.push(group);
            }
        }
    }
}

function insertNewNode(data, key, x=1, y=1) {
    var id = data.id;
    var name = "new_" + data.name;
    var resource_type;
    switch(key) {
        case "vm":
            resource_type = VM;
            break;
        case "volume":
            resource_type = VOLUME;
            break;
        case "network":
            resource_type = NETWORK;
            break;
        case "vrouter":
            resource_type = ROUTER;
            break;
        case "loadbalancer":
            resource_type = LOADBALANCER;
            break;
        case "firewall":
            resource_type = FIREWALL;
            break;
        default:
            resource_type = UNKNOWN;
            break;
    }
    var node = {
        id: id,
        name: name,
        reflexive: false,
        fixed: true,
        resource_type: resource_type,
        resource_id: id,
        resource_name: name,
        type: resource_type,
        data: data,
        x: x,y: y
    }
    nodes.push(node);
}

function loadNode(data, key, cx=1, cy=1) {
    x = parseInt(Math.random() * width / 2) + parseInt(width /4);
    y = parseInt(Math.random() * height / 2) + parseInt(height /4);
    var id;
    var name;
    var resource_type;
    switch(key) {
        case "internet":
            id = data.id;
            name = data.name;
            resource_type = "internet"
            x = cx;
            y = cy;
            break;
        case "volume_list":
            id = data.volume_id;
            name = data.volume_name;
            resource_type = VOLUME;
            break;
        case "vm_list":
            id = data.vm_id;
            name = data.vm_name;
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
        resource_id: id,
        resource_name: name,
        type: resource_type,
        data: data,
        x: x,y: y
    }
    nodes.push(node);
}

function insertNewLink(node1, node2) {
    var link = {
        source: node1, target: node2,
        left: true, right: true
    };
    links.push(link);
    insertGroup();
}

function getService(jsonData) {
    if (typeof jsonData.success == "undefined") {
        console.log(jsonData);
        return;
    }
    jsonData = jsonData.success;
    $("#service_name").text(jsonData.service_detail.name);
    var server_list = jsonData.service_detail.vm_list;
    var serverListHtml = '';
//    $.each(server_list, function(idx, server) {
//        var className = "rs_td0" + (idx % 2 + 2).toString();
//        serverListHtml += '<tr id="' + server.vm_id + '">';
//        serverListHtml += '<td class="' + className +'">프로젝트</td>';
//        serverListHtml += '<td class="' + className +'">호스트</td>';
//        serverListHtml += '<td class="' + className +'"><a href="#" class="selectServer">' + server.vm_name + '</a></td>';
//        serverListHtml += '<td class="' + className +'">' + server.image + '</td>';
//        serverListHtml += '<td class="' + className +'">';
//        $.each(server.vnic_list, function(net_idx, vnic) {
//            if (net_idx != 0) serverListHtml += "<br/>";
//            serverListHtml += vnic.name;
//        });
//        serverListHtml += '</td>';
//        serverListHtml += '<td class="' + className +'">' + server.flavor + '</td>';
//        serverListHtml += '<td class="' + className +'">상태</td>';
//        serverListHtml += '<td class="' + className +'">작업</td>';
//        serverListHtml += '<td class="' + className +'">전원상태</td>';
//        serverListHtml += '<td class="' + className +'">생성된 이후 시간</td>';
//        serverListHtml += '</tr>';
//    });

    $.each(server_list, function(idx, server) {
       /* var className = "rs_td0" + (idx % 2 + 2).toString();
        serverListHtml += '<tr id="' + server.vm_id + '">';
        serverListHtml += '<td class="' + className +'"><a href="#" class="selectServer">' + server.vm_name + '</a></td>';
        serverListHtml += '<td class="' + className +'">';
        $.each(server.addresses, function(net_idx, vnic) {
            if (net_idx != 0) serverListHtml += "<br/>";
            serverListHtml += vnic;
        });
        serverListHtml += '</td>';
        serverListHtml += '<td class="' + className +'">' + server.status + '</td>';
        serverListHtml += '</tr>';*/
        serverListHtml += "<option value='"+server.vm_id+"'>"+server.vm_name+"</option>";
    });
    $("#selectInstanceList").append(serverListHtml);
    $("#selectInstanceList option:last").attr("selected","selected");
    getInstanceInfo($("#selectInstanceList").val());
   // $("#listTable tbody").html(serverListHtml);
    /*
    $.each(jsonData.public_network, function(index, public_net) {
        var public_paddingX = 20 * 2;
        var public_paddingY = 20 * 2;
        loadNode(public_net, "internet", public_paddingX, public_paddingY);
    });
    for (var key in jsonData.service_detail) {
        if (jsonData.service_detail[key] instanceof Array) {
            for (var i = 0; i < jsonData.service_detail[key].length; i++) {
                loadNode(jsonData.service_detail[key][i], key);
            }// end for
        }// end if
    }//end for
    if (typeof jsonData.links != "undefined") {
        for (var index = 0; index < jsonData.links.length; index++) {
            var source = findNodeByName(jsonData.links[index].source);
            var target = findNodeByName(jsonData.links[index].target);
//                    var source = findNodeById(jsonData.links[index].source);
//                    var target = findNodeById(jsonData.links[index].target);
            insertNewLink(source, target);
        }
    }
    restart();
    */
//    nodesLoadComplete();
}

function getServiceAjax() { // token, tenant_name, user_name, service_id
	var urlStr = $(location).attr('pathname');
        var match = new RegExp("/dashboard/telemeter/([\\w-]+)/.+").exec(urlStr);
        var service_id = match[1];
    U.ajax({
        progress:true,
		url : "/dashboard/service/" +service_id + "/detail",
        success:function(jsonData) {
            getService(jsonData);
            $("#selectInstanceList").trigger("change");
        }
        // end success
    });
}

function selectNode(node_id) {
    selected_node = nodes.find(function(node) {
        return node.id == node_id;
    });
    restart();
}



function mousedown() {
    // prevent I-bar on drag
    //d3.event.preventDefault();
    // because :active only works in WebKit?
    svg.classed('active', true);
    if (mousedown_node || mousedown_link) return;

    restart();
}

function mousemove() {
    if (!mousedown_node || !modifyFlag) return;
    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
    restart();
}

function mouseup() {
    // because :active only works in WebKit?
    svg.classed('active', false);
    // clear mouse event vars
    resetMouseVars();
}

// only respond once per keydown
var lastKeyDown = -1;

function keydown() {
//    d3.event.preventDefault();    //기본이벤트없애기

    if (lastKeyDown !== -1) return;
    lastKeyDown = d3.event.keyCode;
    if ((!selected_node && !selected_link) || focusNodeName) return;
    /*switch(d3.event.keyCode) {
        case 70: // F
            if (selected_node) {
                selected_node.fixed = !selected_node.fixed;
            }
            restart();
            break;
    }*/
}

function keyup() {
    lastKeyDown = -1;
    // ctrl
    if (d3.event.keyCode === 17) {
        gNodes
            .on('mousedown.drag', null)
            .on('touchstart.drag', null);
        svg.classed('ctrl', true);
    }
}

// app starts here
svg.on('mousedown', mousedown)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup);
d3.select(window)
    .on('keydown', keydown)
    .on('keyup', keyup);
restart();