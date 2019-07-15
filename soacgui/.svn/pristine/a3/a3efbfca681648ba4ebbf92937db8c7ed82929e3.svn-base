
var sfc = "#sfc";

var pressedCtrl = false;
var re = new RegExp("/dashboard/service/(\\w+)")
var urlStr = $(location).attr('pathname')
var new_service_url = urlStr.replace(re, "$1").replace("/","");
var modifyFlag = false;
var fixed = false;

var editFlag = false; // 생성 or 수정 모드 (editFlag && !modifyFlag = 생성모드)
var modifyFlag = false; // 수정모드
var sameNameFlag = false; // 같은 이름의 자원 존재 유무
var sameCIDRFlag = false; // 같은 CIDR 주소를 가진 자원 존재 유무
var invalidCIDRFlag = false; // CIDR표기법 검사 flag
var tolerance = 5;
var down, clickedNode, clickedLink, waitDblClick = null; // 더블클릭 이벤트에 쓰일 변수들
var waitDblClickTime = 250; // 더블클릭 wait 간격
var editedInfoFlag = false; // 자원 정보 변경 유무
var lastKeyDown = -1; // only respond once per keydown
var using_security_group_list = [];
var INTERNET = "internet",
    ROUTER = "ROUTER",
    NETWORK = "network",
    VM = "VM",
    VOLUME = "volume",
    FIREWALL = "firewall",
    LOADBALANCER = "load_balancer",
    VPN = "vpn",
    FW = "fw",
    IPS = "ips",
    DLP = "dlp",
    UNKNOWN = "unknown";

var nodesRadius = 30;
var nodes = [],
    links = [],
    groups = [];
var colors = d3.scale.category10();
var width  = $("#visTopology").width();
//var height = $("#visTopology").height() - 20;
var height = 500;

var svg = d3.select('#visTopology')
    .append('svg')
    .attr('oncontextmenu', 'return false;')
    .attr('width', $("#visTopology").width())
    .attr('height', height)
    .attr('id', 'service');

// init D3 force layout
var force = d3.layout.force()
        .nodes(nodes)
        .links(links)     //링크된 노드의 거리 유지
        .size([900, 500])   // 중력 이벤트 위치
        .linkDistance(150)    //링크된 노드의 거리
        .charge(-750)       //노드간의 거리
        .on('tick', tick);
var focusNodeName = false;

var buttonList = [{label:"고정", x:$("#visTopology").width() - 50, y:50}];
var button = d3.button()
               .on('press', function(d, i) {nodes.forEach(function(d, i) { d.fixed = true; }); log("press");})
               .on('release', function(d, i) {nodes.forEach(function(d, i) { d.fixed = false; }); log("release");});

var buttons = svg.selectAll('.button')
                 .data(buttonList)
                 .enter()
                 .append('g')
                 .attr('class', 'button')
                 .call(button);

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
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
        for (var j = 0; j < d.nodeList.length; j++) {
            if (j>1) {
                data += (j != 0 ? "L" : "M") + d.nodeList[0].x + "," + d.nodeList[0].y;
            }
            data += (j != 0 ? "L" : "M") + d.nodeList[j].x + "," + d.nodeList[j].y;
        }
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
    gNodes.selectAll('circle');
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
        .style('fill', function(d) {
            if (d.data.security ) {
                if (isEmpty(d.data.security_type)) {
                    return "url(#security)";
                } else {
                    return "url(#" + d.data.security_type + ")";
                }
            } else {
                return "url(#" + d.resource_type + ")";
            }
        })
        .style('stroke', "#ddd")
        .on('mousedown', function(d) {
            log("mousedown");
            if(d3.event.button == 2) return;
            // select node
            resetMouseVars();
            mousedown_node = d;
            log("if out = " + d.resource_type);
            if((d.resource_type == ROUTER || d.resource_type == VM) && !pressedCtrl && svgSFC.selectAll("g[resource_id='" + d.id + "']")[0].length <= 0 && $("#showTopologyModal").hasClass("in")) {
            log("if in");
                var addClass = " fc_resource";
                if(d.resource_type == VM) {
                    addClass += " sf_resource";
                }
                log("copy");
                log(d);
//                current_x = d.x;
//                current_y = d.y;
                current_x = 1000;
                current_y = 50;

                current_x += d3.selectAll(".fc_resource")[0].length * 10;
                current_y += d3.selectAll(".fc_resource")[0].length * 10;

                var gCopy = d3.select(sfc).append('svg:g')
                .attr("id", "resource")
                .attr("type", d.resource_type)
                .attr("resource_id", d.id)
                .attr("class", "draggable "  + addClass);

                var rect = gCopy.append('rect')
                .attr("fill", "white")
                .attr("stroke", "#d2d3d4")
                .attr("stroke-width", "1")
                .attr("rx", 20)
                .attr("ry", 20)
                .attr("x", current_x - 45)
                .attr("y", current_y - 38)
                .attr("width", 90)
                .attr("height", 90);


                var circle = gCopy.append('circle')
//                var circle = d3.select('svg').append('circle')
                .attr("class", "btn-resource")
                .attr("cx", current_x)
                .attr("cy", current_y)
                .attr('r', 30)
                .attr('stroke', '#d2d3d4')
                .attr('stroke-width', 1)
                .attr("fill", 'url("#' + ((d.data.security) ? d.data.security_type : d.resource_type) + '")');

                var text = gCopy.append('svg:text')
                .attr('x', current_x)
                .attr('y', current_y + 42)
                 .attr("text-anchor", "middle")
                .text(function() { return d.name; });

                rect.transition().attr("x", current_x + 5);
                circle.transition().attr("cx", current_x + 50);
                text.transition().attr("x", current_x + 50);
            } else if (svgSFC.selectAll("g[resource_id='" + d.id + "']")[0].length > 0) {
                U.lobiboxMessage("이미 존재하는 자원입니다.","warning");
            }
            restart();
        })
        .on('mouseup', function(d) {
            if(!mousedown_node) return;
            if(mouseup_node === mousedown_node) { resetMouseVars(); return; }
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

function findNodeById(id){
    var node = null;
    for (var i = 0; i < nodes.length; i++) {
        if(nodes[i].id == id) {
            node = nodes[i];
            break;
        }
    }
    return node;
}


function findNodeByName(name, resource_type){
    var node = null;
    for (var i = 0; i < nodes.length; i++) {
        if (typeof nodes[i].name == "undefined") {
            break;
        }
        if (nodes[i].name == name && nodes[i].resource_type == resource_type) {
            node = nodes[i];
            break;
        } else if (nodes[i].name.indexOf(name) > 0 && nodes[i].resource_type == VOLUME && resource_type == VOLUME) {
             // 볼륨이름은 저장했을때와 달라서 포함이라도 통과
            node = nodes[i];
            break;
        }
    }
    if (node == null) {
        for (var i = 0; i < nodes.length; i++) {
            if (typeof nodes[i].name == "undefined") {
                break;
            }
            if ((nodes[i].name == name) || (nodes[i].name.indexOf(name) > 0 && nodes[i].resource_type == VOLUME)) { // 이전 버전
                node = nodes[i];
                break;
            }
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
                    if (groups[i].nodeList.indexOf(node1) == -1){
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

function insertNewNode(data, key, x=1, y=1){
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

function loadNode(data, key, cx=1, cy=1){
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
            x = 60;
            y = 60;
//            fixed = true;
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
            delete data.security_type;
            delete data.security;
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
        fixed: fixed,
        resource_type: resource_type,
        resource_id: id,
        resource_name: name,
        type: resource_type,
        data: data,
        x: x,y: y
    }
    nodes.push(node);
}

function insertNewLink(node1, node2){
    var link = {
        source: node1, target: node2,
        left: true, right: true
    };
    links.push(link);
    insertGroup();
}

function getService(jsonData) {
    jsonData = jsonData.success;
    $("#service_name").text(jsonData.service.service_detail.name);
    $.each(jsonData.public_network, function(index, public_net) {
        var public_paddingX = 20 * 2;
        var public_paddingY = 20 * 2;
        loadNode(public_net, "internet", public_paddingX, public_paddingY);
    });
    for (var key in jsonData.service.service_detail) {
        if (jsonData.service.service_detail[key] instanceof Array) {
            for (var i = 0; i < jsonData.service.service_detail[key].length; i++) {
                loadNode(jsonData.service.service_detail[key][i], key);
            }// end for
        }// end if
    }//end for
    if(typeof jsonData.links != "undefined"){
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
//    if (!isEmpty(jsonData.security_types)) { // 보안장비 아이콘 표시
//        security_types = jsonData.security_types;
//        $.each(security_types, function(idx, val) {
//            securityNode = findNodeByName(val.name, VM);
//            securityNode.data["security_type"] = val.security_type;
//            securityNode.data["security"] = true;
//        });
//    }
    restart();
}

function getServiceAjax() { // token, tenant_name, user_name, service_id
    U.ajax({
        progress:true,
        url : '',
        success:function(jsonData){
            getService(jsonData);
        }
        // end success
    });
}

function mousedown() {
    // prevent I-bar on drag
    //d3.event.preventDefault();
    // because :active only works in WebKit?
    svg.classed('active', true);
    log("mousedown()");
    if(mousedown_node || mousedown_link) return;
    restart();
}

function mousemove() {
    if(!mousedown_node || !modifyFlag) return;
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
    if(lastKeyDown !== -1) return;
    lastKeyDown = d3.event.keyCode;
    if(d3.event.keyCode === 17) {
        gNodes.call(force.drag);
        pressedCtrl = true;
    }
    if((!selected_node && !selected_link) || focusNodeName) return;
}

function keyup() {
    lastKeyDown = -1;
    // ctrl
    if(d3.event.keyCode === 17) {
        gNodes
            .on('mousedown.drag', null)
            .on('touchstart.drag', null);
        svg.classed('ctrl', true);
        pressedCtrl = false;
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