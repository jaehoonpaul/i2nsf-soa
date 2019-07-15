var modifyFlag = false;
var progress_flag = false;
var pre_progress_flag = false;
var progress_list = [];

var VM = "virtual_machine",
    NETWORK = "network",
    ROUTER = "router",
//    FIREWALL = "firewall",
    FW = "fw",
    IPS = "ips",
    DLP = "dlp",
    LOADBALANCER = "loadbalancer",
    AUTOSCALING = "autoscaling",
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
var temp_id = 0;
var nodesRadius = 15;
var linkDistance = 45;
var charge = -100;

var selected_topology = null;


var svgPatternStr = "";
svgPatternStr += 'this.defs.append("svg:pattern")';
svgPatternStr += '.attr("id", "%T")';
svgPatternStr += '.attr("width", 1).attr("height", 1)';
svgPatternStr += '.attr("patternContentUnits", "objectBoundingBox")';
svgPatternStr += '.append("svg:image")';
svgPatternStr += '.attr("xlink:href", \'/static/img/service/topology/resource_%T.png\')';
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
    var colors = d3.scale.category10();
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
    this.defs = this.svg.append('svg:defs');
    var topology = this;

    eval(svgPatternStr.replace(/%T/gi, INTERNET));
    eval(svgPatternStr.replace(/%T/gi, ROUTER));
    eval(svgPatternStr.replace(/%T/gi, NETWORK));
    eval(svgPatternStr.replace("%T", VM).replace("%T", "virtualmachine"));
    eval(svgPatternStr.replace(/%T/gi, VOLUME));
//    eval(svgPatternStr.replace(/%T/gi, FIREWALL));
    eval(svgPatternStr.replace("%T", LOADBALANCER).replace("%T", "loadbalancer"));
    eval(svgPatternStr.replace(/%T/gi, "security"));
    eval(svgPatternStr.replace(/%T/gi, FW));
    eval(svgPatternStr.replace(/%T/gi, IPS));
    eval(svgPatternStr.replace(/%T/gi, DLP));
    eval(svgPatternStr.replace(/%T/gi, AUTOSCALING));

    this.force = d3.layout.force()
            .nodes(this.nodes)
            .links(this.links)     //링크된 노드의 거리 유지
            .size([this.width, this.height])
            .linkDistance(linkDistance)    //링크된 노드의 거리
            .charge(charge);       //노드간의 거리;

    this.drag_line = this.svg.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0');

    this.gGroup = this.svg.append('svg:g');
    this.pathGroup = this.svg.append('svg:g').selectAll('path');
    this.pathLink = this.svg.append('svg:g').selectAll('path');
    this.gNodes = this.svg.append('svg:g').selectAll('g');

    this.refreshGroups = function() {
        topology.insertGroup();
        topology.pathGroup = topology.pathGroup.data(topology.groups, function(d) { return d.id; });
        topology.pathGroup.enter().append('path')
            .attr('class', 'subset')
            .style("fill", function(d) { return colors(d.id); })
            .style("stroke", function(d) { return colors(d.id); });
        topology.pathGroup.exit().remove();
    }

    this.refreshLinks = function() {
        topology.pathLink = topology.pathLink.data(topology.links);
        topology.pathLink.enter().append('svg:path')
            .attr('class', 'link');
        topology.pathLink.exit().remove();
    }

    this.refreshNodes = function() {
        topology.gNodes = topology.gNodes.data(topology.nodes, function(d) { return d.id; });
        topology.gNodes.selectAll('circle')
            .classed('reflexive', function(d) { return d.data.security; });

        topology.gNodes.selectAll('text')
            .text(function(d) { return d.name; });

        var g = topology.gNodes.enter().append('svg:g');
        var tempCir = g.append('svg:circle')
            .attr('class', function(d) {
                if(d.data.security) {return 'node reflexive';}
                else {return 'node';}
            })
            .classed(function(d) { return d.resource_type; })
            .attr('r', nodesRadius)
            .style('fill', function(d) {
                if (d.data.security) {
                    return "url(#" + d.data.security_type + ")";
                } else {
                    return "url(#" + d.resource_type + ")";
                }
            })
            .style('stroke', function(d){
                if (d.data.security_type == FW) {
                    return "#5225db";
                } else if (d.data.security_type == IPS) {
                    return "#19c3d9";
                } else if (d.data.security_type == DLP) {
                    return "#ba20da";
                } else {
                    return "#ddd";
                }
            })
            .on("mouseover", function(d){
                d.x += (Math.random())*4;
                d.y += (Math.random())*4;
            })
            .on("mousemove", function(d){
                d.x += (Math.random())*4;
                d.y += (Math.random())*4;
            });
        topology.gNodes.exit().remove();
    }
    topology.restart = function() {
        topology.refreshGroups();
        topology.refreshLinks();
        topology.refreshNodes();
        topology.pathGroup.moveToBack();
        topology.force.start();
        topology.force.on('tick', this.tick);
    }

    this.tick = function() {
        topology.pathGroup.attr('d', function(d) {
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
        topology.pathLink.attr('d', function(d) {
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

        topology.gNodes.attr('transform', function(d) {
            if (d.x > this.width - nodesRadius) {
                d.x = this.width - nodesRadius;
            } else if (d.x < nodesRadius) {
                d.x = nodesRadius;
            }
            if (d.y > this.height - nodesRadius) {
                d.y = this.height - nodesRadius;
            } else if (d.y < nodesRadius) {
                d.y = nodesRadius;
            }
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    }

    this.findNodeByName = function(name, resource_type, messageFlag) {
        var node = null;
        for (var i = 0; i < this.nodes.length; i++) {
            if (typeof this.nodes[i].name == "undefined") {
                break;
            }
            if (this.nodes[i].name == name && this.nodes[i].resource_type == resource_type) {
                node = this.nodes[i];
                break;
            } else if (this.nodes[i].name.indexOf(name) > 0 && this.nodes[i].resource_type == VOLUME && resource_type == VOLUME) {
                 // 볼륨이름은 저장했을때와 달라서 포함이라도 통과
                node = this.nodes[i];
                break;
            }
        }
        if (node == null) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (typeof this.nodes[i].name == "undefined") {
                    break;
                }
                if ((this.nodes[i].name == name) || (this.nodes[i].name.indexOf(name) > 0 && this.nodes[i].resource_type == VOLUME)) { // 이전 버전
                    node = this.nodes[i];
                    break;
                }
            }
        }
        if (node == null && messageFlag) {
            U.lobibox("해당자원이 존재하지 않습니다.", "error", name);
        }
        return node;
    }

    this.insertGroup = function() {
        for (var links_i =0; links_i < this.links.length; links_i++) {
            if(isEmpty(this.links[links_i].source) || isEmpty(this.links[links_i].target)) {
                U.msg("link 정보가 올바르지 않습니다.");
                continue;
            }
            var node1 = this.links[links_i].source;
            var node2 = this.links[links_i].target;

            if(node1 == null || node2 == null) {
                U.msg("link 정보가 올바르지 않습니다.");
                continue;
            }
            if (node1.resource_type == NETWORK && (node2.resource_type == VM || node2.resource_type == AUTOSCALING)) {
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
            x = 20 * (5 - depth);
            y = 10 * (5 - depth) + 10;
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
            data:{},
            x: x,y: y
        }
        if (data.resource_type != "as_" + NETWORK && data.resource_type != LOADBALANCER) {
            this.nodes.push(node);
        }
    }

    this.removeNode = function(node) {

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
            default:
                resource_type = UNKNOWN;
                break;
        }
        if (isEmpty(id)) id = temp_id++;
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

    this.insertNewLink = function(node1, node2) {
        if (node1 == null || node2 == null) return;
        var link = {
            source: node1, target: node2,
            left: true, right: true
        };
        topology.links.push(link);
        topology.insertGroup();
    }
    $(this.svgSelecter).hover(function(){
        topology.restart();
    });
    $(this.svgSelecter).on("mousemove", function(){
        topology.restart();
    });
}

//function refreshServiceTable() {
//    U.ajax({
//        url : '',
//        success:function(jsonData) {
//            if(typeof jsonData.error != 'undefined') {
//                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
//            }
//            var service_list = jsonData.success.service_list;
//            var service_id_list = [];
//            var progress_id_list = [];
//            var delete_id_list = [];
//			$.each(service_list, function(index, service){
//				service_id_list.push(service.service_id);
//				if (service.status.indexOf("PROGRESS") != -1) {
//				    progress_list.push(service);
//				}
//			});
//            $('#service_list tr:not(:eq(0))').each(function(i, tr) {
//                var tr_data_id = $(tr).data('id');
//                if (typeof tr_data_id != "undefined" && service_id_list.indexOf(tr_data_id) == -1) {
//                    delete_id_list.push(tr_data_id);
//                }
//            });
////			if (progress_list.length > 0) {progress_flag = true;} else {progress_flag = false;}
//            $.each(service_list, function(index, service) {
//                refresh_tr = $('#service_list tr[data-id=' + service.service_id + ']');
//                refresh_tr.children("td.stack_name").html($('<a>', {
//                    class:"list_a01",
//                    href:service.service_id + '/detail',
//                    "data-id":service.service_id,
//                    text:service.stack_name
//                }));
//                refresh_tr.children("td.tenant_name").text(service.tenant_name);
//                refresh_tr.children("td.service_description").text(U.replaceEmptyText(service.service_description));
//                var status = service.status.replace(/([\w]+)_(complete|progress|failed)/gi, "<img class='status_image' src='/static/img/STATUS_$2.png' alt='#'>$1_$2")
//                refresh_tr.children("td.status").html(status);
//                refresh_tr.children("td.sfc_cnt").text(U.replaceEmptyText(service.sfc_cnt));
//                refresh_tr.children("td.create_at").text(U.replaceEmptyText(service.create_at).replace(/T/gi, " "));
//                refresh_tr.children("td.updated_at").text(U.replaceEmptyText(service.updated_at).replace(/T/gi, " "));
//            });
//            if (delete_id_list.length != 0) {
//                location.reload();
//            }
//
//            if(progress_list.length > 0) { window.setTimeout(function(){refreshServiceTable()}, 3000); }
//            progress_list = [];
//        }
//    });
//}

$(function() {
//    $(".contents").loadPage({url: "/dashboard/service/all_service"});
//    U.ajax({
//        url : '/dashboard/service/all_service/',
//        success:function(jsonData) {
//            var service_resources = jsonData.success.service_list;
//             $.each(service_resources, function(idx, service) {
//                var serviceHtml = "";
//                serviceHtml += '<div class="all_service_card_d01" id="service_card'+idx+'"><div class="ind_d02"><div class="ind_d05"><img class="security_card_img01" id="securityIcon'+idx+'" src="/static/img/common/red_icon_01.png" alt="#">';
//                serviceHtml += '<div id="title'+idx+'" style="float:left;"></div><div class="clear_float"></div></div>';
//                serviceHtml += '<table class="all_service_card_tab01" id="serviceTable" cellpadding="0" border="0" cellspacing="0"></table>';
//                serviceHtml += '<div class="clear_float"></div></div>';
//                serviceHtml += '<div class="all_service_card_d02"></div></div>';
//                $(".contents").append(serviceHtml);
//                var dataTable = new DataTable({
//                    "selector" : "#service_card"+idx,
//                    "columns"  : {
//                        "stack_name" : '<img class="br_img03" src="/static/img/common/br_img_03.png" alt="#">서비스 이름',
//                        "status" : '<img class="br_img03" src="/static/img/common/br_img_03.png" alt="#">상태',
//                        "create_at" : '<img class="br_img03" src="/static/img/common/br_img_03.png" alt="#">생성일',
//                    },
//                    "data" : service,
//                    "vertical" : true
//                });
//                dataTable.showDataTable();
//                $("#serviceTable th").attr('class','security_card_td01');
//                $("#serviceTable td").attr('class','security_card_td02');
//                $("#title"+idx).text(service.tenant_name);
//
//                if (service.status.indexOf("COMPLETE") != -1) {
//                    $("#securityIcon"+idx).attr("src","/static/img/common/green_icon_01.png");
//                } else if (service.status.indexOf("PROGRESS") != -1) {
//                    $("#securityIcon"+idx).attr("src","/static/img/common/yellow_icon_01.png");
//                } else if (service.status.indexOf("FAILED") != -1) {
//                    $("#securityIcon"+idx).attr("src","/static/img/common/red_icon_01.png");
//                }
//            });
//        }
//    });
});
function loadFinished() {
    $(".all_service_card_d01").each(function(idx, card){
        var service_id = $(card).data("service_id");
        getSimpleServiceAjax(service_id);
    });
    $(".all_service_card_d01").on("click", function() {
        var service_id = $(this).data("service_id")
        U.ajax({
            progress:true,
            url:"/auth/switch/project",
            data:{"data":JSON.stringify({"project_name":$(this).data("project_name")})},
            success:function(jsonData) {
                if (!isEmpty(jsonData.error)) {
                    U.lobiboxMessage(jsonData.error.message, "error", jsonData.error.title);
                }
                location.href = "/dashboard/service/" + service_id + "/detail";
            }
        });
    });

}

function getSimpleServiceAjax(service_id) {
    U.ajax({
        progress : true,
        url : '/dashboard/service/' + service_id + '/simple',
        success:function(jsonData){
            if(typeof jsonData.error != 'undefined') {
//                U.msg("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            getSimpleService(jsonData, service_id);
        }
    });
}

function getSimpleService(jsonData, service_id) {
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
            var source_name;
            var target_name;
            if (typeof links[index].source == "string") { source_name = links[index].source; }
            else { source_name = links[index].source.name; }
            if (typeof links[index].target == "string") { target_name = links[index].target; }
            else { target_name = links[index].target.name; }

            var source = topology.findNodeByName(source_name, links[index].source.resource_type);
            var target = topology.findNodeByName(target_name, links[index].target.resource_type);
            topology.insertNewLink(source, target);
        }
    }
    if (!isEmpty(jsonData.used_security_group_list)) {
        var used_security_group_list = jsonData.used_security_group_list;
        $.each(used_security_group_list, function(idx, used_security_group) {
            var findNode = topology.findNodeByName(used_security_group.vm_name, VM);
            if (isEmpty(used_security_group.security_type)) {
                var tempSecurityTypes = jsonData.security_types.find(function(security_type, idx){return security_type.name == findNode.name});
                if (!isEmpty(tempSecurityTypes)) {
                    used_security_group.security_type = tempSecurityTypes.security_type;
                }
            }
            findNode.data["security_type"] = used_security_group.security_type;
            findNode.data["security"] = true;
        });
    }
    var selTopology = topologyList.filter(function(old_topology) {
        return old_topology.id == service_id;
    });
    if(selTopology.length > 0){
        selTopology[0] = topology;
    } else {
        topologyList.push(topology);
    }
    topology.restart();
}