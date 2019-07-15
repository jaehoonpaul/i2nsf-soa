var modifyFlag = false;
var progress_flag = false;
var pre_progress_flag = false;
var progress_list = [];

var VM = "virtual_machine",
    NETWORK = "network",
    ROUTER = "router",
    FIREWALL = "firewall",
    LOADBALANCER = "load_balancer",
    VOLUME = "volume",
    VPN = "vpn",
    INTERNET = "internet",
    UNKNOWN = "unknown";

function guid() {
    function s4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

var nodesRadius = 15;
var linkDistance = 45;
var charge = -100;

var selected_topology = null;

var colors = d3.scale.category10();

var svgPatternStr = "";
svgPatternStr += 'this.defs.append("svg:pattern")';
svgPatternStr += '.attr("id", "%T")';
svgPatternStr += '.attr("width", 1).attr("height", 1)';
svgPatternStr += '.attr("patternContentUnits", "objectBoundingBox")';
svgPatternStr += '.append("svg:image")';
svgPatternStr += '.attr("xlink:href", \'/static/img/resource_%T.png\')';
svgPatternStr += '.attr("width", 1).attr("height", 1)';
svgPatternStr += '.attr("preserveAspectRatio", "xMinYMin slice");';

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
var force = null;

var svg_list = [];
var force_list = [];
var topologyList = [];
function Topology(service_id) {
    this.id = service_id;
    this.svgSelecter = "#vis_" + service_id;
    this.width  = $(this.svgSelecter).width();
    this.height = $(this.svgSelecter).height();
    this.groups = [];
    this.links = [];
    this.nodes = [];
    this.menu = [];
    this.svg = d3.select(this.svgSelecter)
        .append('svg')
        .attr('oncontextmenu', 'return false;')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('id', 'service');

    this.force = d3.layout.force();
    this.defs = this.svg.append('svg:defs');

    eval(svgPatternStr.replace(/%T/gi, INTERNET));
    eval(svgPatternStr.replace(/%T/gi, ROUTER));
    eval(svgPatternStr.replace(/%T/gi, NETWORK));
    eval(svgPatternStr.replace("%T", VM).replace("%T", "virtualmachine"));
    eval(svgPatternStr.replace(/%T/gi, VOLUME));
    eval(svgPatternStr.replace(/%T/gi, FIREWALL));
    eval(svgPatternStr.replace("%T", LOADBALANCER).replace("%T", "loadbalancer"));

//    this.defs.append('svg:marker')
//            .attr('id', 'end-arrow')
//            .attr('viewBox', '0 -5 10 10')
//            .attr('refX', 6)
//            .attr('markerWidth', 3)
//            .attr('markerHeight', 3)
//            .attr('orient', 'auto')
//        .append('svg:path')
//            .attr('d', 'M0,-5L10,0L0,5')
//            .attr('fill', '#000');

    this.drag_line = this.svg.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0');

    this.gGroup = this.svg.append('svg:g');
    this.pathGroup = this.svg.append('svg:g').selectAll('path');
    this.pathLink = this.svg.append('svg:g').selectAll('path');
    this.gNodes = this.svg.append('svg:g').selectAll('g');

    this.refreshGroups = function() {
        this.insertGroup();
        this.pathGroup = this.pathGroup.data(this.groups, function(d) { return d.id; });
        this.pathGroup.enter().append('path')
            .attr('class', 'subset')
            .style("fill", function(d) { return colors(d.id); })
            .style("stroke", function(d) { return colors(d.id); });
        this.pathGroup.exit().remove();
    }

    this.refreshLinks = function() {
        this.pathLink = this.pathLink.data(this.links);
        this.pathLink.enter().append('svg:path')
            .attr('class', 'link');
        this.pathLink.exit().remove();
    }

    this.refreshNodes = function() {
        this.gNodes = this.gNodes.data(this.nodes, function(d) { return d.id; });
        this.gNodes.selectAll('circle');

        this.gNodes.selectAll('text')
            .text(function(d) { return d.name; });

        var g = this.gNodes.enter().append('svg:g');
        var tempCir = g.append('svg:circle')
            .attr('class', 'node')
            .classed(function(d) { return d.resource_type; })
            .attr('r', nodesRadius)
            .style('fill', function(d) { return "url(#" + d.resource_type + ")"; })
            .style('stroke', "#ddd");
//        g.append('svg:text')
//           .attr('x', 0)
//           .attr('y', nodesRadius + 10)
//           .attr('class', 'id')
//           .text(function(d) { return d.name; });
        this.gNodes.exit().remove();
    }
    this.restart = function() {
        this.refreshGroups();
        this.refreshLinks();
        this.refreshNodes();
        this.pathGroup.moveToBack();
        this.force.start();
    }

    this.findNodeByName = function(name){
        var node = null;
        for (var i = 0; i < this.nodes.length; i++) {
            if(this.nodes[i].name == name) {
                node = this.nodes[i];
                break;
            } else if(this.nodes[i].name.indexOf(name) > 2 && this.nodes[i].resource_type == VOLUME) {
                node = this.nodes[i];
                break;
            }
        }
        return node;
    }

    this.insertGroup = function() {
        for (var links_i =0; links_i < this.links.length; links_i++) {
            if(typeof this.links[links_i].source == "undefined" || typeof this.links[links_i].target == "undefined") {
                U.msg("link 정보가 올바르지 않습니다.");
                continue;
            }
            var node1 = this.links[links_i].source;
            var node2 = this.links[links_i].target;

            if(node1 == null || node2 == null) {
                U.msg("link 정보가 올바르지 않습니다.");
                continue;
            }
            if (node1.resource_type == NETWORK && node2.resource_type == VM) {
                // node1 이 network이고 node2 가 vm 이면
                var flag = false;
                for (var group_i = 0; group_i < this.groups.length; group_i++) {
                    if (this.groups[group_i].id == node1.id) {
                        // 그룹들 중 network id로 생성된 그룹이 있다면 추가만
                        if (this.groups[group_i].nodeList.indexOf(node2) == -1) {
                            // 해당 group에 추가할 node가 없으면 추가
                            this.groups[group_i].nodeList.push(node2);
                        }
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    // 생성된 그룹이 없다면 생성
                    var group = { id:node1.id, nodeList:[node1, node2] };
                    this.groups.push(group);
                }
            } else if (node1.resource_type == VM && node2.resource_type == NETWORK) {
                var flag = false;
                for (var group_i = 0; group_i < this.groups.length; group_i++) {
                    if (this.groups[group_i].id == node2.id) {
                        if (this.groups[group_i].nodeList.indexOf(node1) == -1){
                            this.groups[group_i].nodeList.push(node1);
                        }
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    var group = { id:node2.id, nodeList:[node2, node1] };
                    this.groups.push(group);
                }
            }
        }
    }

    this.insertNewNode = function(data, cx=1, cy=1){
        var fixed;
        var x, y;
        if(data.resource_type == INTERNET){
            var depth = 0;
            $.each(this.nodes, function(index, resource) {
                var rType = resource.resource_type;
                if(rType == ROUTER && depth < 1) {
                    depth = 1;
                } else if(rType == NETWORK && depth < 2) {
                    depth = 2;
                } else if(rType == VM && depth < 3) {
                    depth = 3;
                } else if(rType == VOLUME && depth < 4) {
                    depth = 4;
                }
            });
            x = 20 * (6 - depth);
            y = 10 * (6 - depth) + 10;
            fixed = true;
        } else {
            x = parseInt(Math.random() * this.width / 2) + parseInt(this.width /4);
            y = parseInt(Math.random() * this.height / 2) + parseInt(this.height /4);
            fixed = false;
        }
        var node = {
            id: data.id,
            name: data.name,
            reflexive: false,
            fixed: fixed,
            resource_type: data.resource_type,
            x: x,y: y
        }
        this.nodes.push(node);
    }

    this.loadNode = function(data, key, cx=1, cy=1){
        x = parseInt(Math.random() * this.width / 2) + parseInt(this.width /4);
        y = parseInt(Math.random() * this.height / 2) + parseInt(this.height /4);
        var id;
        var name;
        var fixed = false;
        var resource_type;
        switch(key) {
            case INTERNET:
                id = data.id;
                name = data.name;
                resource_type = INTERNET
                fixed = true;
                x = cx;
                y = cy;
//                x = 20;
//                y = 20;
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
//        console.log("x: " + x.toString());
//        console.log("y: " + y.toString());
        var node = {
            id: id,
            name: name,
            reflexive: false,
            fixed: fixed,
            resource_type: resource_type,
            x: x,y: y
        }
        this.nodes.push(node);
    }

    this.insertNewLink = function(node1, node2){
        var link = {
            source: node1, target: node2,
            left: true, right: true
        };
        this.links.push(link);
        this.insertGroup();
    }
}

function tick() {
    if (typeof selected_topology == "undefined") return;
    selected_topology.pathGroup.attr('d', function(d) {
        var data = "";
        for(var j = 0; j < d.nodeList.length; j++) {
            if(j>1){
                data += (j != 0 ? "L" : "M") + d.nodeList[0].x + "," + d.nodeList[0].y;
            }
            data += (j != 0 ? "L" : "M") + d.nodeList[j].x + "," + d.nodeList[j].y;
        }
        if (data.length !== 2) data += "Z";
        return data;
    });
//    console.log("haha");
    selected_topology.pathLink.attr('d', function(d) {
        var deltaX = d.target.x - d.source.x;       //선 연결 X좌표 중앙에서출발
        var deltaY = d.target.y - d.source.y;       //선 연결 Y좌표 중앙에서출발
        var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        var normX = deltaX / dist;
        var normY = deltaY / dist;
        var sourcePadding = nodesRadius;
        var targetPadding = nodesRadius;
        var sourceX = d.source.x + (sourcePadding * normX);
        var sourceY = d.source.y + (sourcePadding * normY);
        var targetX = d.target.x - (targetPadding * normX);
        var targetY = d.target.y - (targetPadding * normY);
        return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });

    selected_topology.gNodes.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
    });
}

function getServiceData(service_id){
    U.ajax({
        progress : true,
        dataType: "json",
        url : '/dashboard/service/' + service_id + '/simple',
        success:function(jsonData){
            if(typeof jsonData.error != 'undefined') {
//                U.msg("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            $("#vis_" + service_id).html("");

            var service = jsonData.success;
            var resources = service.resources;
            var topology = new Topology(service_id);
            // resource
            if(typeof resources != "undefined"){
                var public_networks = [];
                for (var i = 0; i < resources.length; i++) {
                    var nodeData = {
                        id:guid(),
                        name:resources[i].name,
                        resource_type:resources[i].resource_type
                    }
                    if(resources[i].resource_type != INTERNET){
                        // 먼저, public_network이외의 자원들을 다 넣고
                        topology.insertNewNode(nodeData);
                    } else {
                        // public_network는 담아두었다가
                        public_networks.push(nodeData);
                    }
                }
                for (var i = 0; i < public_networks.length; i++) {
                    // 담아두었던 public_network는 나중에 insert
                    topology.insertNewNode(public_networks[i]);
                }
            }

            var links = service.links;
            if(typeof links != "undefined"){
                for (var index = 0; index < links.length; index++) {
                    var source = topology.findNodeByName(links[index].source);
                    var target = topology.findNodeByName(links[index].target);
                    topology.insertNewLink(source, target);
                }
            }
            var selTopology = topologyList.filter(function(old_topology) {
                return old_topology.id == service_id;
            });
            if(selTopology.length > 0){
                selTopology[0] = topology;
            } else {
                topologyList.push(topology);
            }
        }
    });
}

function refreshServiceCard(){
    U.ajax({
        url : '',
        dataType: "json",
        success:function(jsonData){
            if(typeof jsonData.error != 'undefined') {
//                U.msg("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }

            var service = jsonData.success;
			var service_id_list = [];
			$.each(service.service_list, function(index, service_info){
				service_id_list.push(service_info.service_id);
			});
			var delete_topology_list = topologyList.filter(function(topology_info){
				return service_id_list.indexOf(topology_info.id) == -1;
			});
			$.each(delete_topology_list, function(index, topology_info){
				$('.front.s02_d01.' + topology_info.id).parents(".card").remove();
			});
            var refresh_service_list = service.service_list.filter(function(service_info){
                return progress_list.indexOf(service_info.service_id) != -1;
            });

            var temp_progress_list = [];
            $.each(refresh_service_list, function(index, service_info){
                var statusBuffer = "service_green_iocn";
                if(service_info.status.indexOf("PROGRESS") >= 0) {
                    pre_progress_flag = progress_flag;
                    progress_flag = true;
                    temp_progress_list.push(service_info.service_id);
                    statusBuffer = "service_yellow_iocn";
                } else if(service_info.status.indexOf("FAIL") >= 0) {
                    statusBuffer = "service_red_iocn";
                    pre_progress_flag = progress_flag;
                    progress_flag = false;
                } else {
                    pre_progress_flag = progress_flag;
                    progress_flag = false;
                }
                if(!pre_progress_flag) {
                    getServiceData(service_info.service_id);
                    pre_progress_flag = progress_flag;
                }
                if(service_info.status == 'SUSPEND_COMPLETE') {
                    statusBuffer = "service_yellow_iocn";
                }
                $('.front.s02_d01.' + service_info.service_id).find(".status_text").text("상태: " + service_info.status);
                $('.front.s02_d01.' + service_info.service_id).find(".status_image").attr("src", "/static/img/" + statusBuffer + ".png");


                var action;
                var actionText = "";
                var imageText = "";
                if(service_info.status == 'CREATE_COMPLETE' || service_info.status == 'RESUME_COMPLETE') {
                    action = "suspend";
                    actionText = "일시정지";
                    imageText = "pause_icon_opacity1.png";
                } else if(service_info.status == 'SUSPEND_COMPLETE') {
                    action = "resume";
                    actionText = "재시작";
                    imageText = "play_icon_opacity1.png";
                } else {
                    imageText = "s02_01.png";
                }
                var actionButtonHtml = '<img src="/static/img/' + imageText + '" alt="">' + actionText;
                $('.front.s02_d01.' + service_info.service_id).siblings(".back").find("a.s02_d04.action_btn").attr("href", service_info.service_id + '/' + action);
                $('.front.s02_d01.' + service_info.service_id).siblings(".back").find("a.s02_d04.action_btn").html(actionButtonHtml);
            });
            progress_list = temp_progress_list;

            if(progress_list.length > 0) { window.setTimeout(function(){refreshServiceCard()}, 3000); }
        }
    });

//                    location.replace("/dashboard/service");
}
function deleteService(service_id) {
    U.ajax({
        url : service_id + '/delete',
        dataType: "json",
        success:function(jsonData){
            if(typeof jsonData.success != "undefined") {
                location.reload();
            }
        }
    });
}

function sleep(msecs) {
    var start = new Date().getTime();
    var cur = start;
    while(cur - start < msecs) {
        cur = new Date().getTime();
    }
}

$(function() {
    U.ajax({
        progress : true,
        url : '',
        dataType: "json",
        success:function(jsonData){
            var statusBuffer = "service_green_iocn";
            if(typeof jsonData.error != "undefined") {
//                U.msg("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            // fail
            }
            if(typeof jsonData.success != "undefined") {
                var serviceList = jsonData.success.service_list;
                var listHtml = "";
                $.each(serviceList, function(index, service) {
                    listHtml += '<tr>';
                    listHtml += '<td class="rs_td0' + (2 + (index % 2)).toString() + '"><a class="list_a01" href="' + service.service_id + '/detail">' + service.stack_name + '</a></td>';
                    listHtml += '<td class="rs_td0' + (2 + (index % 2)).toString() + '">' + service.tenant_name + '</td>';
                    listHtml += '<td class="rs_td0' + (2 + (index % 2)).toString() + '">' + service.user_name + '</td>';
                    listHtml += '<td class="rs_td0' + (2 + (index % 2)).toString() + '">' + service.service_description.replace(/\n/gi,"<br/>") + '</td>';
                    listHtml += '<td class="rs_td0' + (2 + (index % 2)).toString() + '">' + service.status + '</td>';
                    listHtml += '<td class="rs_td0' + (2 + (index % 2)).toString() + '">' + service.sfc_cnt + '</td>';
                    listHtml += '<td class="rs_td0' + (2 + (index % 2)).toString() + '">' + service.created_at + '</td>';
                    listHtml += '<td class="rs_td0' + (2 + (index % 2)).toString() + '">' + (!service.updated_at ? '-':service.updated_at) + '</td>';
                    listHtml += '<td class="rs_td0' + (2 + (index % 2)).toString() + '">';
                    listHtml += '<select class="actions_sel01">';
                    listHtml += '<option>수정</option>';
                    listHtml += '<option>삭제</option>';
                    listHtml += '<option>일시정지</option>';
                    listHtml += '</select>';
                    listHtml += '</td>';
                    listHtml += '</tr>';
                });
                $("#grid-container").html(listHtml);
                //backupLoadServiceCard(jsonData);
            } // success


            if(progress_flag){ // in progress 일 때
//                refreshServiceCard();
                window.setTimeout(function(){refreshServiceCard();}, 1000);
                // 카드 하나만 새로고침
            }
        }
        // end success
    });
});

function backupLoadServiceCard(jsonData) {
    var serviceList = jsonData.success.service_list;
    var listHtml = "";

//    var progressPattern = '<div class="s02_d03"><img class="s02_img02" src="/static/img/s02_01.png" alt="#">';
//    progressPattern += '<span class="s02_s01">%T </span>';
//    progressPattern += '<div class="maxProgress"><div class="amount"><div class="rate">%R</div></div></div></div>';
//    progressPattern.replace("%T", "").replace("%R", "");
    var descriptionPattern = '<div class="s02_d03"><img class="s02_img02" src="/static/img/s02_01.png" alt="#"><span class="s02_s01">%T</span></div>';

    $.each(serviceList, function(index, service) {
        var statusBuffer = "service_green_iocn";
        if(service.status.indexOf("PROGRESS") >= 0) {
            progress_flag = true;
            progress_list.push(service.service_id);
            statusBuffer = "service_yellow_iocn";
        } else if(service.status.indexOf("FAIL") >= 0) {
            statusBuffer = "service_red_iocn";
        }
        if(service.status == 'SUSPEND_COMPLETE') {
            statusBuffer = "service_yellow_iocn";
        }
        // a Tag card
        listHtml += '<div class="card"><div class="card-grid">';

        // front
        listHtml += '<div class="front s02_d01 ' + service.service_id + '" style="overflow:hidden;"><div class="s02_d02">';
        listHtml += '<span>' + service.stack_name + '</span><div style="margin-right:15px;float:right;"><img class="status_image" src="/static/img/' + statusBuffer + '.png" alt="#"></div>';
        listHtml += '<div class="clear_float"></div></div>';
        listHtml += descriptionPattern.replace("%T", "ID: " + service.service_id);
        listHtml += descriptionPattern.replace("%T", "상태: " + service.status).replace("s02_s01", "s02_s01 status_text");
        listHtml += descriptionPattern.replace("%T", "프로젝트/사용자: " + service.tenant_name + " / " + service.user_name);
        //listHtml += descriptionPattern.replace("%T", "사용자 이름: ");
        listHtml += descriptionPattern.replace("%T", "생성일: " + service.created_at);
        listHtml += descriptionPattern.replace("%T", "수정일: " + (!service.updated_at ? "-":service.updated_at));
        listHtml += descriptionPattern.replace("%T", "서비스체이닝 수: " + service.sfc_cnt);
        var description = service.service_description;
        if(typeof service.service_description != "undefined"){
            listHtml += descriptionPattern.replace("%T", "설명<br/><div style='width:300px;word-break:break-all; word-wrap:break-word;'>&nbsp;&nbsp;&nbsp;" + service.service_description.replace(/\n/gi,"<br/>") + "</div>");
        }
        listHtml += '</div>'; // end front

        // back
        listHtml += '<div class="back s02_d01">';//<a href="' + service.service_id + '/delete"><img class="s02_img01" src="/static/img/del_icon_01.png" alt="#"></a>
        listHtml += '<div class="clear_float"></div>';
        listHtml += '<a href="' + service.service_id + '/detail">';
        listHtml += '<div class="vis_group" id="vis_' + service.service_id + '" style="height:155px;"></div>';

        listHtml += '</a><div class="clear_float"></div>';
        var action;
        var actionText = "";
        var imageText = "";
        if(service.status == 'CREATE_COMPLETE' || service.status == 'RESUME_COMPLETE') {
            action = "suspend";
            actionText = "일시정지";
            imageText = "pause_icon_opacity1.png"
        } else if(service.status == 'SUSPEND_COMPLETE') {
            action = "resume";
            actionText = "재시작";
            imageText = "play_icon_opacity1.png"
        } else {
            imageText = "s02_01.png"
        }

        listHtml += '<a href="' + service.service_id + '/' + action + '" class="s02_d04 action_btn"><img src="/static/img/' + imageText + '" alt="">' + actionText + '</a>';
        //listHtml += '<a href="' + service.service_id + '/modify"                    호 class="s02_d04"><img src="/static/img/edit_icon_01.png" alt="#">수정</a>';
        if(service.sfc_cnt == 0 || typeof service.sfc_cnt == "undefined"){
//                        listHtml += '<a href="' + service.service_id + '/delete" class="s02_d04"><img src="/static/img/del_icon_01.png" alt="#">삭제</a>';
            listHtml += '<a onclick="deleteService(\'' + service.service_id + '\')" class="s02_d04"><img src="/static/img/del_icon_01.png" alt="#">삭제</a>';
        } else {
            listHtml += '<a onclick="U.msg(\'먼저 서비스 체이닝을 삭제하세요.\')" class="s02_d04"><img src="/static/img/del_icon_01.png" alt="#">삭제</a>';
        }
        listHtml += '</div>'; // end back
        listHtml +='</div></div>'; // end a Tag card
    });
    if(serviceList.length < 1) {
        listHtml += '        <div class="none_text_01">';
        listHtml += '';
        listHtml += '           현재 생성된 서비스가 없습니다.';
        listHtml += '';
        listHtml += '       </div>';
    }
    $("#grid-container").html(listHtml);

    $.each(serviceList, function(index, service) {
        getServiceData(service.service_id);
    });

    // card-grid event
    $(".card-grid").flip({trigger:'hover', autoSize:false});
    $(".card-grid").on("flip:done", function() {
        var flip = $(this).data("flip-model");
        $(this).find(".amount").each(function() {
            var elem = $(this);
            if(flip.isFlipped){
                var rate = elem.text();
                var match = new RegExp("(\\d+)/(\\d+)").exec(rate);
                var amount = parseInt(match[1]);
                var max = parseInt(match[2]);

                var width = elem.width();
                var maxWidth = elem.parent().width();
                var targetWidth = (maxWidth * amount/max);
                var id = setInterval(frame, 5);
                function frame(){
                    if (width > targetWidth * 0.99) {
                        elem.width(targetWidth);
                        clearInterval(id);
                    } else {
                        elem.width(width);
                        width += targetWidth*0.01;	// 목표 길이의 1%씩 증가
                    }
                }
            } else {
                elem.width(0);
            }
        });


        var flip = $(this).data("flip-model");
        if(flip.isFlipped){
            var service_id = $(this).find(".vis_group")[0].id.replace("vis_","");
            var selTopology = topologyList.filter(function(topology) {
                return topology.id == service_id;
            });
            selected_topology = selTopology[0];
            if(selected_topology){
                force = d3.layout.force()
                    .nodes(selected_topology.nodes)
                    .links(selected_topology.links)     //링크된 노드의 거리 유지
                    .size([selected_topology.width*1.2, selected_topology.height*1.2])
                    .linkDistance(linkDistance)    //링크된 노드의 거리
                    .charge(charge)       //노드간의 거리
                    .on('tick', tick);
                force.start();
                selected_topology.restart();
            } else {
                U.msg("불러오는 중입니다.");
            }
        }
    });// end card-grid event
}