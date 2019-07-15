var editFlag = false; // 생성 or 수정 모드 (editFlag && !modifyFlag = 생성모드)
var modifyFlag = false; // 수정모드
var intentFlag = false; // intent모드
var sameNameFlag = false; // 같은 이름의 자원 존재 유무
var sameCIDRFlag = false; // 같은 CIDR 주소를 가진 자원 존재 유무
var invalidCIDRFlag = false; // CIDR표기법 검사 flag
var tolerance = 5;
var down, clickedNode, clickedLink, waitDblClick = null; // 더블클릭 이벤트에 쓰일 변수들
var waitDblClickTime = 250; // 더블클릭 wait 간격
var editedInfoFlag = false; // 자원 정보 변경 유무
var lastKeyDown = -1; // only respond once per keydown
var using_security_group_list = [];
var roundRect = { // AutoScaling 영역 그리기
    w: 300,
    h: 325,
    r: 5,
    tw: 15, // 삼각형 넓이
    th: 30, // 삼각형 높이
    tp: 100 // 삼각형 시작위치
}; // w: 넓이, h: 높이, r: 모서리 반지름, tw: 삼각형 가로길이, th: 삼각형 세로길이, tp: 삼각형위치
var INTERNET = "internet",
    ROUTER = "router",
    NETWORK = "network",
    VM = "virtual_machine",
    VOLUME = "volume",
    FIREWALL = "firewall",
    VPN = "vpn",
    FW = "fw",
    IPS = "ips",
    DLP = "dlp",
    SECURITY = "security",
    AUTOSCALING = "autoscaling",
    LOADBALANCER = "loadbalancer",
    UNKNOWN = "unknown";

var nodesRadius = 30; // 노드의 크기
var nodes = [], // 자원 객체 리스트
    links = [], // 자원 링크 리스트
    groups = [], // 네트워크 + vm 그룹 리스트
    asGroups = [], // 오토스케일링 노드 리스트
    asLinks = [],
    menu = []; // contextMenu

var width  = $("#vis").width();
var height = $("#vis").height();
var colors = d3.scale.category10();

var svg = d3.select('#vis')
    .append('svg')
    .attr('oncontextmenu', 'return false;')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'service');

var charge = -1000;
// init D3 force layout
var force = d3.layout.force()
        .nodes(nodes)
        .links(links)     //링크된 노드의 거리 유지
        .size([width, height])
        .linkDistance(function(l) {
            var tempCharge = charge / (-5);
            if (l.target.resource_type == AUTOSCALING && l.target.expand_view) {
                tempCharge = 2 * tempCharge;
            }
            return tempCharge;
        })    //링크된 노드의 거리
        .charge(function(d) {
            var tempCharge = charge;
            var expand = false;
            $.each(asGroups, function(i, as) {
                if (as.expand_view) {
                    expand = true;
                }
            });
            if (expand) {
                tempCharge = tempCharge * 3;
            }
            return tempCharge;
        })       //노드간의 거리
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
svgPatternStr += '.attr("xlink:href", \'/static/img/service/topology/resource_%T.png\')';
svgPatternStr += '.attr("width", 1).attr("height", 1)';
svgPatternStr += '.attr("preserveAspectRatio", "xMinYMin slice");';
eval(svgPatternStr.replace(/%T/gi, INTERNET));
eval(svgPatternStr.replace(/%T/gi, ROUTER));
eval(svgPatternStr.replace(/%T/gi, NETWORK));
eval(svgPatternStr.replace("%T", VM).replace("%T", "virtualmachine"));
eval(svgPatternStr.replace(/%T/gi, VOLUME));
eval(svgPatternStr.replace(/%T/gi, FIREWALL));
eval(svgPatternStr.replace(/%T/gi, AUTOSCALING));
eval(svgPatternStr.replace(/%T/gi, LOADBALANCER));
//if (editFlag) {
    eval(svgPatternStr.replace(/%T/, "as_" + VM).replace(/%T/, "as_virtualmachine"));
//} else {
//    eval(svgPatternStr.replace(/%T/, "as_" + VM).replace(/%T/, "virtualmachine"));
//}
eval(svgPatternStr.replace(/%T/gi, "as_" + NETWORK));
eval(svgPatternStr.replace(/%T/gi, "as_" + VOLUME));
eval(svgPatternStr.replace(/%T/gi, SECURITY));
eval(svgPatternStr.replace(/%T/gi, FW));
eval(svgPatternStr.replace(/%T/gi, IPS));
eval(svgPatternStr.replace(/%T/gi, DLP));

var gradient = defs.append("svg:linearGradient")
    .attr("id", "autoscaling_group_bg")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "100%");
gradient.append("svg:stop")
    .attr('class', 'start')
    .attr("offset", "0%")
    .attr("stop-color", "white")
    .attr("stop-opacity", 0.5);
gradient.append("svg:stop")
    .attr('class', 'end')
    .attr("offset", "100%")
    .attr("stop-color", "white")
    .attr("stop-opacity", 0.3);

var radialGradientRed = svg.append("defs")
  .append("radialGradient")
    .attr("id", "radial-gradient-red");
radialGradientRed.append("stop")
    .attr("offset", "40%")
    .attr("stop-color", "#f2591d");
radialGradientRed.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#892e0b");

var radialGradientGreen = svg.append("defs")
  .append("radialGradient")
    .attr("id", "radial-gradient-green");
radialGradientGreen.append("svg:stop")
    .attr('class', 'start')
    .attr("offset", "40%")
    .attr("stop-color", "#2dc630");
radialGradientGreen.append("svg:stop")
    .attr('class', 'end')
    .attr("offset", "100%")
    .attr("stop-color", "#007205");

// 흐려지는 이벤트 효과
//defs.append("filter")
//	.attr("id", "motionFilter")
//	.attr("width", "300%")
//	.attr("x", "-100%")
//	.append("feGaussianBlur")
//	.attr("class", "blurValues")
//	.attr("in", "SourceGraphic")
//	.attr("stdDeviation", "0 8");// 흐려지는 이벤트 효과 끝

/*
defs.append("svg:pattern")
    .attr("id", INTERNET)
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
    .append("svg:image")
    .attr("xlink:href", '/static/img/resource_internet.png')
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMinYMin slice");

var defs = svg.append('svg:defs');
defs.append("svg:pattern")
    .attr("id", NETWORK)
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
    .append("svg:image")
    .attr("xlink:href", '/static/img/resource_network.png')
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMinYMin");

defs.append("svg:pattern")
    .attr("id", ROUTER)
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
    .append("svg:image")
    .attr("xlink:href", '/static/img/resource_router.png')
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMinYMin");

defs.append("svg:pattern")
    .attr("id", VM)
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
    .append("svg:image")
    .attr("xlink:href", '/static/img/resource_virtualmachine.png')
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMinYMin");

defs.append("svg:pattern")
    .attr("id", VOLUME)
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
    .append("svg:image")
    .attr("xlink:href", '/static/img/resource_volume.png')
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMinYMin");

defs.append("svg:pattern")
    .attr("id", FIREWALL)
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
    .append("svg:image")
    .attr("xlink:href", '/static/img/resource_firewall.png')
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMinYMin");

defs.append("svg:pattern")
    .attr("id", LOADBALANCER)
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
    .append("svg:image")
    .attr("xlink:href", '/static/img/resource_loadbalancer.png')
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMinYMin");
*/

defs.append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
    .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

/*
defs.append('svg:marker')
        .attr('id', 'start-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 4)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
    .append('svg:path')
        .attr('d', 'M10,-5L0,0L10,5')
        .attr('fill', '#000');
*/
// SVG영역 자동조절
function resizingSvg() {
    var width = $("#vis").width();
    var height = $("#vis").height();
    svg.attr("width", width)
        .attr("height", height);
    force.size([width, height]);
    restart();
}
window.addEventListener("resize", resizingSvg);
// element 를 최상위로 보이게함
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};
// element 를 최하위로 보이게함
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
    pathGroup = svg.append('svg:g').attr("class", "pathGroup").selectAll('path'),
    pathLink = svg.append('svg:g').attr("class", "pathLink").selectAll('path'),
    gNodes = svg.append('svg:g').attr("class", "gNodes").selectAll('g'),
    gASGroup = svg.append('svg:g').attr("class", "gASGroup").selectAll('g'),
    drag_line = svg.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0');

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

// zoom기능
var zoom = d3.behavior.zoom()
    .center([width/2, height/2])
    .scaleExtent([0.5, 2]);
// zoom 이벤트
function zoomEvent() {
    svg.selectAll("g.pathGroup").attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    svg.selectAll("g.pathLink").attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    svg.selectAll("g.gNodes").attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    svg.selectAll("g.gASGroup").attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    var translate = d3.event.translate;
    if (d3.event.scale == 2) {
        translate = width * 0.75;
    } else if (d3.event.scale == 0.5) {
        translate = width;
    }
    drag_line.attr('transform', 'translate(' + translate + ')scale(' + d3.event.scale + ')');
    restart();
}

// 주소가 create거나 new_service거나 modify라면 생성/수정모드
if (new_service_url == "create" || new_service_url == "new_service" || modify_service_url=="modify") {
    editFlag = true;
    if ($(location).attr('pathname').indexOf("intent") > 0) {
        intentFlag = true;
    }
    if (modify_service_url=="modify") {
        modifyFlag = true;
        deleteCookie("nodes");
        deleteCookie("links");
        $("#saveBtn").attr("src", modifyBtnSrc);
    }
    U.lobiboxMessage(gettext("CTRL을 누른 상태에서 드래그를 하면 아이콘을 이동할 수<br/>있습니다."), "info", gettext("정보"));
    $("#cancelBtn").show();
    $("#saveBtn").show();
    $("#cancelBtn").click(function() {
        U.confirm({
            title:gettext("취소"),
            message:gettext("작업중인 데이터를 전부 지우고<br/><br/> 리스트 페이지로 이동하시겠습니까?"),
            func:function() {
                deleteCookie("nodes");
                deleteCookie("links");
//                location.href = "/dashboard/service";
                window.history.back();
            }
        });
    });
} else { // 아니면 조회모드
    $("#service_list").show();
    $("#chainTab").show();
    $("#telemeterTab").show();
    $("#routingTab").show();
    $("#modifyBtn").show();

    $("#cancelBtn").click(function() {
//        location.href = "/dashboard/service";
        window.history.back();
    });
    $("#modifyBtn").click(function() {
        location.href = urlStr.replace("detail", "modify");
    });
}

// uuid생성
function guid() {
    function s4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// 마우스 이벤트 cache
function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
}

// drop down 이벤트
function dropdownEvent(sel, key, value) {
    $(sel).parents("ul").siblings("button").html("<p>" + key + "</p><span class='caret'></span>");
    $(sel).parents("ul").siblings("input").val(value);
}

// 자원 연결 정의
function resourceLinking() {
    var source = null, target = null;
    var subTarget = null;
    var dType = mousedown_node.resource_type;   // mouseDown 한 자원의 타입
    var uType = mouseup_node.resource_type;     // mouseUp 한 자원의 타입
    var linkFlag = true;
    switch (dType) {
        case ROUTER: // Router 기준
            if (uType == NETWORK || uType == INTERNET) {
                source = mousedown_node;    // Router
                target = mouseup_node;      // Network | Internet
            }
            break;
        case NETWORK:
        case INTERNET: // Network | Internet 기준
            if (uType == ROUTER) {
                source = mouseup_node;      // Router
                target = mousedown_node;    // Network | Internet
            } else if (uType == VM || uType == AUTOSCALING) {
                source = mousedown_node;    // Network | Internet
                target = mouseup_node;      // VirtualMachine | AutoScaling
                if (uType == AUTOSCALING) {
                    subTarget = getResourceInAutoScaling(mouseup_node, LOADBALANCER);
                }
            } else if (uType == LOADBALANCER || uType == "as_" + VM) {
                source = mousedown_node;    // Network | Internet
                target = getAutoScalingOfResource(mouseup_node);  // AutoScaling
                subTarget = mouseup_node;   // Loadbalancer | as_VirtualMachine
            }
            break
        case VM:
            if (uType == VOLUME) {
                source = mousedown_node;    // VirtualMachine
                target = mouseup_node;      // Volume
            }
        case AUTOSCALING: // VirtualMachine | AutoScaling 기준
            if (uType == NETWORK || uType == INTERNET) {
                source = mouseup_node;      // Network | Internet
                target = mousedown_node;    // VirtualMachine | AutoScaling
                if (dType == AUTOSCALING) {
                    subTarget = getResourceInAutoScaling(mousedown_node, LOADBALANCER);
                }
            }
            break;
        case VOLUME: // Volume 기준
            if (uType == VM) {
                source = mouseup_node;      // VirtualMachine
                target = mousedown_node;    // Volume
            }
        case LOADBALANCER:
        case "as_" + VM:
            if (uType == NETWORK || uType == INTERNET) {
                source = mouseup_node;      // Network | Internet
                target = getAutoScalingOfResource(mousedown_node);    // AutoScaling
                subTarget = mousedown_node;   // Loadbalancer | as_VirtualMachine
            }
            break;
    }
    if (source == null || target == null) {
        U.lobiboxMessage(gettext("잘못된 연결 입니다."), "info", gettext("정보"));
        return;
    }
    /*
             source      -      target
        Router           - Internet/Network
        Internet/Network - VM/AutoScaling
        VM               - Volume
    */
    var sType = source.resource_type;
    var tType = target.resource_type;

    if (sType == ROUTER) {
        if (tType == NETWORK) {
            if (!(source.data.tenant_net_list instanceof Array)) {
                source.data.tenant_net_list = [];
            }
            var equal_tenant_net = source.data.tenant_net_list.filter(function(tenant) {
                return tenant == target.name;
            });
            var already_link_router = links.filter(function(link, idx){
                return link.target.resource_type == NETWORK && link.target.name == target.name;
            });
            if (equal_tenant_net.length != 0) {
                U.lobiboxMessage("'" + target.name + gettext("'은 이미 연결 되었거나 이미 존재하는<br/>이름입니다. 이름을 변경후 연결해주세요."), "info", gettext("정보"));
                linkFlag = false;
            } else if (already_link_router.length != 0){
                U.lobiboxMessage("'" + target.name + gettext("'은 이미 다른 라우터에 연결되었습니다."), "info", gettext("정보"));
                linkFlag = false;
            } else {
                source.data.tenant_net_list.push(target.name);
            }
//            target.data = {gateway_ip:source.name};
//            $("select[name=gateway_ip]").val(source.name);
        } else if (tType == INTERNET) {
            source.data["external_net"] = target.name;
            $("input[name=external_net]").val(target.name);
        }
    } else if (sType == NETWORK || sType == INTERNET) {
        if (tType == VM) {
            if (!(target.data.tenant_net_list instanceof Array)) {
                target.data.tenant_net_list = [];
            }
            var equal_tenant_net = target.data.tenant_net_list.filter(function(tenant) {
                return tenant['tenant_net'] == source.name;
            });

            if (equal_tenant_net.length == 0) {
                target.data.tenant_net_list.push({tenant_net:source.name, name:"", public_ip:false});
            } else {
                U.lobiboxMessage("'" + source.name + gettext("'은 이미 연결 되었거나 이미 존재하는<br/>이름입니다. 이름을 변경후 연결해주세요."), "info", gettext("정보"));
                linkFlag = false;
            }
        } else if (tType == AUTOSCALING) {
            var tempAS = getAutoScalingOfResource(source);
            if (sType == NETWORK && !tempAS) {
                if (subTarget.resource_type == LOADBALANCER) {
                    if (subTarget.data.tenant_net == "") {
                        if (source.name == "") {
                            U.lobiboxMessage(gettext("network의 이름을 변경후 연결해주세요."), "info", gettext("정보"));
                            linkFlag = false;
                        } else {
                            subTarget.data.tenant_net = source.name;
                            subTarget.data.pool_member.subnet = source.name + "_subnet";
                        }
                    } else {
                        U.lobiboxMessage(gettext("이미 ") + subTarget.data.tenant_net + gettext("에 연결되있습니다."), "info", gettext("정보"));
                        linkFlag = false;
                    }
//                    if (!(subTarget.data.tenant_net_list instanceof Array)) {
//                        subTarget.data.tenant_net_list = [];
//                    }
//                    var equal_tenant_net = subTarget.data.tenant_net_list.filter(function(tenant_net) {
//                        return tenant_net['tenant_net'] == source.name;
//                    });
//                    if (equal_tenant_net.length == 0) {
//                        subTarget.data.tenant_net_list.push({tenant_net:source.name, name:"", public_ip:false});
//                    } else {
//                        U.lobiboxMessage("'" + source.name + gettext("'은 이미 연결 되었거나 이미 존재하는<br/>이름입니다. 이름을 변경후 연결해주세요."), "info", gettext("정보"));
//                        linkFlag = false;
//                    }
                } else if (subTarget.resource_type == "as_" + VM) {
                    if (!(subTarget.data.vnic_list instanceof Array)) {
                        subTarget.data.vnic_list = [];
                    }
                    var equal_tenant_net = subTarget.data.vnic_list.filter(function(vnic) {
                        return vnic['tenant_net'] == source.name;
                    });
                    if (equal_tenant_net.length == 0) {
                        subTarget.data.vnic_list.push({tenant_net:source.name, name:"", public_ip:false});
                    } else {
                        U.lobiboxMessage("'" + source.name + gettext("'은 이미 연결 되었거나 이미 존재하는<br/>이름입니다. 이름을 변경후 연결해주세요."), "info", gettext("정보"));
                        linkFlag = false;
                    }
                }
            } else if (sType == INTERNET) {
                var loadbalancer = getResourceInAutoScaling(target, LOADBALANCER);
                loadbalancer.data["external_network"] = source.name;
                $("input[name=external_network]").val(source.name);
            } else {
                U.lobiboxMessage(gettext("잘못된 연결 입니다."), "info", gettext("정보"));
                linkFlag = false;
            }
        }
    } else if (sType == VM) {
        if (tType == VOLUME) {
            var existLink = links.filter(function(link) {
                return target.id == link.target.id && source.id != link.source.id;
            });
            if (existLink.length > 0) {
                U.lobiboxMessage(gettext("볼륨(") + target.name + gettext(")은 이미 가상서버(") + target.data.vm_template + gettext(")에 연결 되어있습니다.<br/>연결 해제 후 다시 시도해주세요."), "info", gettext("정보"));
                linkFlag = false;
            } else {
                target.data['vm_template'] = source.name;
            }
        }
    }
    /*
    var source, target, direction;
    if (mousedown_node.id < mouseup_node.id) {
        source = mousedown_node;
        target = mouseup_node;
        direction = 'right';
    } else {
        source = mouseup_node;
        target = mousedown_node;
        direction = 'left';
    }
    */
    if (linkFlag) {
        var link = links.filter(function(l) { return (l.source === source && l.target === target); })[0];
        if (!link) {
            link = {source: source, target: target, left: true, right: true};
            links.push(link);
        }
        if (source.resource_type == NETWORK && target.resource_type == AUTOSCALING) {
            var subLink = {source: source, target: subTarget, left: true, right: true};
            asLinks.push(subLink);
        }
        selected_link = link;
        if (selected_node != null) {
            updateClick(selected_node.resource_type);
        }
        saveTopologyCookies();
    }

    showNodeInfo();
}

var tempCnt = 0

// 라인 그리는 기능
function drawLinkLine(d, convert) {
    if (isEmpty(d.target) || isEmpty(d.source)) {
        return;
    }
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
    if (convert == "source") {
        targetX = d.target.x;
        targetY = d.target.y;
    } else if (convert == "target") {
        sourceX = d.source.x;
        sourceY = d.source.y;
    } else if (convert == "None") {
        sourceX = d.source.x;
        sourceY = d.source.y;
        targetX = d.target.x;
        targetY = d.target.y;
    }
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
}

// auto scaling 라인 그리는 기능
function drawASLinkLine(d, convert) {
    if (isEmpty(d.target) || isEmpty(d.source)) {
        return;
    }
    var as = getAutoScalingOfResource(d.target);
    var tempTarget = d.target;
    var tempSource = d.source;
    if (as && d.target.resource_type != "as_" + VOLUME) {
        tempSource = {x: tempSource.x - (as.x + nodesRadius + 10), y: tempSource.y - (as.y - roundRect.tp)};
    }
    var deltaX = tempTarget.x - tempSource.x;
    var deltaY = tempTarget.y - tempSource.y;
    var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    var normX = deltaX / dist;
    var normY = deltaY / dist;
    var sourcePadding = d.left ? nodesRadius + 1 : nodesRadius;
    var targetPadding = d.right ? nodesRadius + 1 : nodesRadius;
    var sourceX = tempSource.x + (sourcePadding * normX);
    var sourceY = tempSource.y + (sourcePadding * normY);
    var targetX = tempTarget.x - (targetPadding * normX);
    var targetY = tempTarget.y - (targetPadding * normY);
    if (convert == "source") {
        targetX = tempTarget.x;
        targetY = tempTarget.y;
    } else if (convert == "target") {
        sourceX = tempSource.x;
        sourceY = tempSource.y;
    } else if (convert == "None") {
        sourceX = tempSource.x;
        sourceY = tempSource.y;
        targetX = tempTarget.x;
        targetY = tempTarget.y;
    }
    if (as && d.target.resource_type != "as_" + VOLUME) {
        targetX = d.target.x;
        targetY = d.target.y;
    }
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
}

// 계속 호출되며 node, link 등 topology를 그림
function tick() {
    pathGroup.attr('d', function(d) {
        var data = "";
        for (var j = 0; j < d.nodeList.length; j++) {
            if (j>1) {
                data += (j != 0 ? "L" : "M") + d.nodeList[0].x + "," + d.nodeList[0].y;
            }
            data += (j != 0 ? "L" : "M") + d.nodeList[j].x + "," + d.nodeList[j].y;
//            a = (y2-y1)/(x2-x1)
//            b = y1-a*x1
//            y3 == a*x3+b //같은 선
//            y3 < a*x3+b //선 아래
//            y3 > a*x3+b //선 위
        }
        if (data.length !== 2) data += "Z"; // work around Firefox bug.
        return data;
    });
    gASGroup.selectAll("g.pathASLink").selectAll("path").attr('d', drawASLinkLine);

    // draw directed edges with proper padding from node centers
    pathLink.attr('d', drawLinkLine)
        .style("opacity", function(d) {
            if (d.target.expand_view) {
                return 0.1;
            } else {
                return 1;
            }
        });

    if (!editFlag) {
        gNodes.call(force.drag);
    }
    gNodes.attr('transform', function(d) {
        if (d.resource_type != AUTOSCALING) {
            $.each(asGroups, function(i, as) {
                if (as.expand_view) {
                    var margin = 60;
                    var asgX0 = as.x + nodesRadius + 10 - margin;
                    var asgY0 = as.y - roundRect.tp - margin;
                    var asgX1 = as.x + nodesRadius + 10 + roundRect.w + margin;
                    var asgY1 = as.y - roundRect.tp + roundRect.h + margin;
                    if (d.x > asgX0 && d.x < asgX1 && d.y > asgY0 && d.y < asgY1) {
                        var center = {x: (asgX1 + asgX0) / 2, y: (asgY1 + asgY0) / 2}; // autoscalingGroupArea Center
                        var cdx = d.x - center.x;
                        var cdy = d.y - center.y;
                        if (cdx*cdx >= cdy*cdy) { // 중심에서 x 가 더 멀면
                            if (cdx < 0) {
                                d.x -= 3;
                            } else {
                                d.x += 3;
                            }
                        } else {
                            if (cdy < 0) {
                                d.y -= 3;
                            } else {
                                d.y += 3;
                            }
                        }
                    }
                }
            });
        }
        return 'translate(' + d.x + ',' + d.y + ')';
    });

    gASGroup.attr('transform', function(d) {
        return 'translate(' + (d.x + nodesRadius + 10) + ', ' + (d.y - roundRect.tp) + ')';
    });
    gASGroup.selectAll('path.pathASArea').attr("d", function(d) {
        var maxX = 0;
        var maxY = 0;
        $.each(d.data.as_nodes, function(i, as_node) {
            if (as_node.x > maxX) {
                maxX = as_node.x;
            }
            if (as_node.y > maxY) {
                maxY = as_node.y;
            }
        });
        pathStr = getASAreaPath({w: maxX + 75, h: maxY + 75, r: 5, tw: 15, th: 30, tp: 100});
        return pathStr;
    });
    gASGroup.selectAll('g.gASNodes').selectAll('g.gASNode').attr('transform', function(d) {
        return 'translate(' + d.x + ', ' + d.y + ')';
    });
    gASGroup.selectAll("foreignObject")
        .attr('width', function(d) {
            var maxX = 0;
            $.each(d.data.as_nodes, function(i, as_node) {
                if (as_node.x > maxX) {
                    maxX = as_node.x;
                }
            });
            return maxX + 75;
        })
        .attr('height', 40);
    gASGroup.selectAll('div').style('width', function(d) {
        var maxX = 0;
        $.each(d.data.as_nodes, function(i, as_node) {
            if (as_node.x > maxX) {
                maxX = as_node.x;
            }
        });
        return maxX + 75 + "px";
    });

    /*
    var nodeName = $('#nodeName');
    nodeName.focus(function() {
        focusNodeName = true;
    });
    nodeName.blur(function() {
        focusNodeName = false;
    });
    $('#nameBtn').on('click', function() {
        selected_node.name = nodeName.val();
        restart();
    });
    */
}

// group 새로고침
function refreshGroups() {
    insertGroup();
    pathGroup = pathGroup.data(groups, function(d) { return d.id; });
    pathGroup.enter().append('path')
        .attr('class', 'subset')
        .style("fill", function(d) { return colors(d.id); })
        .style("stroke", function(d) { return colors(d.id); });
    pathGroup.exit().remove();
}

// link 새로고침
function refreshLinks() {
    // path (link) group
    pathLink = pathLink.data(links);
    // update existing links
    pathLink.classed('selected', function(d) { return d === selected_link; })
//        .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
//        .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });
        // add new links
    pathLink.enter().append('svg:path')
        .attr('class', 'link')
        .classed('selected', function(d) { return d === selected_link; })
//        .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
//        .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
        .on('mousedown', function(d) {
            if (d3.event.ctrlKey) return;
             // select link
            if (editFlag) {
                mousedown_link = d;
            }
            if (mousedown_link === selected_link) {
                selected_link = null;
            } else if (editFlag) {
                selected_link = mousedown_link;
            }
//            selected_node = null;
            restart();
        })
        .on('contextmenu', function(d) {
            if (editFlag) {
                e = d3.event;
                clickedLink = d;
                $(".actionPopUp").offset({top:e.clientY - 3, left:e.clientX - 3});
                $(".actionPopUp").slideDown("fast");
                setLinkMenu(d);
            }
        });
    // remove old links
    pathLink.exit().remove();
}

// node 새로고침
function refreshNodes() {
    // gNodes (node) group
    gNodes = gNodes.data(nodes, function(d) { return d.id; });
    gNodes.selectAll('circle.node').classed('reflexive', function(d) { return d === selected_node; })
        .style('opacity', function(d) {
            if (d.expand_view) {
                return 0.1;
            } else {
                return 1;
            }
        });
    gNodes.selectAll('text.name').text(function(d) {
        if (!editFlag && d.resource_type == "as_" + VM && !isEmpty(d.data.asg_name)) {
            return d.data.asg_name;
        }
        return d.name;
    });
    gNodes.selectAll('circle.vm_cnt').attr('fill', function(d) {
        if (d.data.as_nodes) {
            var vm_cnt = d.data.as_nodes.filter(as_node => as_node.resource_type == "as_" + VM).length;
            if (vm_cnt <= 0) {
                return "url(#radial-gradient-red)";
            } else {
                return "url(#radial-gradient-green)";
            }
        }
    });
    gNodes.selectAll('text.vm_cnt').text(function(d) {
        if (d.data.as_nodes) {
            var vm_cnt = d.data.as_nodes.filter(as_node => as_node.resource_type == "as_" + VM).length;
            if (vm_cnt == 0) {
                return "-";
            } else {
                return vm_cnt;
            }
        }
    });

    // add new nodes
    var g = gNodes.enter().append('svg:g').attr('class', function(d) { return d.resource_type; });
    var tempCir = g.append('svg:circle').attr('class', 'node')
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
        .style('stroke', "#ddd");
    if (!editFlag) {
        g.append('svg:circle').attr("class", "vm_cnt")
                .attr('r', 12)
                .style('stroke', "#999")
                .style('stroke-width', 2)
                .attr("fill", "url(#radial-gradient-red)")
                .style('opacity', function(d) {
                    if (d.resource_type == AUTOSCALING) {
                        return 1;
                    } else {
                        return 0;
                    }
                }).attr('transform', function(d) {
                    return 'translate(' + (- nodesRadius + 5) + ', ' + (- nodesRadius + 5) + ')';
                });
        g.append("svg:text")
            .attr("class", "vm_cnt")
            .attr('x', -nodesRadius + 5)
            .attr('y', -nodesRadius + 10)
            .style('fill', "#333")
            .style('font-weight', "bold")
            .style("font-size", "13px")
            .style('opacity', function(d) {
                if (d.resource_type == AUTOSCALING) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .text(function(d) {
                if (d.data.as_nodes) {
                    return "-";
                }
            });
    }

    setNodeEvent(tempCir);

    refreshNodeText(g);
    refreshAutoScalingGroup(g);

    // 오래된 nodes 제거
    gNodes.exit().remove();
}

// 노드 이벤트 정의
function setNodeEvent(tempCir) {
    tempCir.on('mouseover', function(d) {
        if (!mousedown_node || d === mousedown_node) return;
        // 타겟 노드 크기
        d3.select(this).attr('transform', 'scale(1.1)');
    }).on('mouseout', function(d) {
        if (!mousedown_node || d === mousedown_node) return;
        // 위 조건에서 마우스가 벗어나면 원래크기로 돌아옴
        d3.select(this).attr('transform', '');
    });
    tempCir.on('mousedown', function(d) {
        if (d3.event.ctrlKey || d3.event.button == 2) return;
        mousedown_node = d;
        down = d3.mouse(document.body);
        if (editFlag) { // 수정모드
            selected_link = null;
             // 라인 드래그
            drag_line.style('marker-end', 'url(#end-arrow)')
                .classed('hidden', false)
                .attr('d', function() {
                    var tempNode = mousedown_node;
                    var as = getAutoScalingOfResource(mousedown_node);
                    if (as) {
                        tempNode = {x: mousedown_node.x - (as.x + nodesRadius + 10), y: mousedown_node.y - (as.y - roundRect.tp)}
                    }
                    return 'M' + tempNode.x + ',' + tempNode.y + 'L' + tempNode.x + ',' + tempNode.y
                });
        }
        restart();
    });
    tempCir.on('mouseup', function(d) {
        if (!mousedown_node) return;
        drag_line.classed('hidden', true);//.style('marker-end', '');
        mouseup_node = d;
        if (!editFlag) {
            d3.select(this).attr('transform', '');
            if (!(dist(down, d3.mouse(document.body)) > tolerance)) {
                if (waitDblClick) {
                    selected_node = d;
                    window.clearTimeout(waitDblClick);
                    waitDblClick = null;
                    dblclickEvent(d);
                } else {
                    waitDblClick = window.setTimeout((function(d, e) {
                        clickedNode = d;
                        return function() {
                            waitDblClick = null;
                            nodeOnClickEvent(d, e);
                        }
                    })(d, d3.event), waitDblClickTime);
                }
            }
            return;
        }
        if (mouseup_node === mousedown_node && editFlag) {
            resetMouseVars();
            return;
        }
        d3.select(this).attr('transform', '');
        resourceLinking();
        restart();
    });
    if (editFlag) {
        tempCir.on("contextmenu", function(d) {
            e = d3.event;
            clickedNode = d;
            $(".actionPopUp").offset({top:e.clientY - 3, left:e.clientX - 3});
            $(".actionPopUp").slideDown("fast");
            setResourceMenu(d);
        });
        tempCir.on("dblclick", function(d) {
            if (d.resource_type != INTERNET){
                if ($(".right_pop").is(":visible")) {
                    var confirmData = {
                        title:gettext("저장하기"),
                        message:gettext("입력중인 정보창이 열려있습니다.<br/><br/>저장하시겠습니까?"),
                        func:function() {
                            $("#resource_update").trigger("click");
                            selected_node = d;
                            dblclickEvent(d);
                        },
                        cancelFunc:function() {
                            selected_node = d;
                            dblclickEvent(d);
                        }
                    };
                    var rType = selected_node.resource_type;
                    confirmInfoPop(rType, confirmData);
                } else {
                    selected_node = d;
                    dblclickEvent(d);
                }
            }
        });
    }
}

// node 의 text 새로고침
function refreshNodeText(g) {
    g.append('svg:text')
        .attr('x', 0)
        .attr('y', nodesRadius + 10)
        .attr('class', 'name')
        .text(function(d) {
            if (!editFlag && d.resource_type == "as_" + VM && !isEmpty(d.data.asg_name)) {
                return d.data.asg_name;
            }
            return d.name;
        });
}

// auto scaling 자원들의 위치를 지정하기위한 함수
function getPositionSeries(length, gap, start) {
    // [(3, 3), (3, 2), (2, 3), (3, 1), (1, 3) ...]
    var result = [];
    var n = 0;
    while (result.length < length) {
        var sub = 0;
        for (var i = 0; i < 2 * gap * n + 5; i++) {
            var pos = {x: gap * n + start, y: gap * n + start};
            if (i % 2 == 0) {
                pos.x -= sub;
                sub += 1;
            } else {
                pos.y -= sub;
            }
            result.push(pos);
            if (result.length >= length) {
                break;
            }
        }
        n += 1;
    }
    return result;
}

// volume 자원의 위치를 지정하기 위한 함수
function getVolumePositionSeries(length, gap, start) {
    var result = [];
    var n = 0;
    while (result.length < length) {
        var sub = 0;
        for (var i = 0; i < 2 * gap * n + 7; i++) {
            var pos = {x: gap * n + start, y: gap * n + start};
            if (i % 2 == 0) {
                pos.x -= sub;
                sub += 1;
            } else {
                pos.y -= sub;
            }
            if (i != 1 && i != 2) {
                result.push(pos);
            }
            if (result.length >= length) {
                break;
            }
        }
        n += 1;
    }
    return result;
}

// auto scaling 그룹을 새로고침
function refreshAutoScalingGroup(g) {
    // nodes에서 오토스케일링 노드만 골라냄
    asGroups = nodes.filter(node => node.resource_type == AUTOSCALING);
    // gASGroup에 데이터셋
    gASGroup = gASGroup.data(asGroups, function(d) {return d.id;});
    gASGroup.selectAll("circle").classed('reflexive', function(d) {return d === selected_node;});
    gASGroup.selectAll("text.name").text(function(d) {
        if (!editFlag && d.resource_type == "as_" + VM && !isEmpty(d.data.asg_name)) {
            return d.data.asg_name;
        }
        return d.name;
    });
    gASGroup.selectAll("span.as_name").text(function(d) {return d.name;});
    var gASArea = gASGroup.enter().append("svg:g").attr("class", "gASArea");
    drawASArea(gASArea);
    refreshASLinks(gASArea);
    refreshASNodes(gASArea);
    // 오토스케일링 d.expand_view에 따라 숨기거나 보여줌
    gASGroup.attr('hidden', function(d) {
//        if (d.expand_view) {
//            if (!editFlag && !d.data.get_vm) {
//                d.data.get_vm = true;
//                getAutoScalingVm(d, true);
//            }
//        }
        return (d.expand_view) ? null : true;
    });
    gASGroup.exit().remove();
}

// auto scaling 의 vm을 얻는 함수
function getAutoScalingVm(d, progress) {
    var data = {
        "name": service.name,
        "stack_id": service.stack_id
    }
    if (service.volume_search) {
        data["volume_search"] = true;
    }
    U.ajax({
        progress : progress,
        url : '/dashboard/service/get_asg_vm',
        dataType: 'json',
        data: data,
        success: function(jsonData) {
            if (jsonData.success) {
                $.each(jsonData.success.error_msg_list, function(i, error) {
                    U.lobibox(error.message, "error", error.title);
                });
                if (jsonData.success.servers) {
                    var volumePositionList;
                    var as_volumes = [];
                    if (!isEmpty(jsonData.success.volumes)) {
                        volumePositionList = getVolumePositionSeries(jsonData.success.volumes.length, 2, 3);
                    }
                    var gap = 1;
                    if (!isEmpty(volumePositionList)) {
                        gap += 1;
                    }
                    var positionList = getPositionSeries(jsonData.success.servers.length, gap, 2);
                    // clear as_vm & as_volume
                    var spliceIndexList = [];
                    $.each(d.data.as_nodes, function(i, as_node) {
                        if (as_node.resource_type == "as_" + VM || as_node.resource_type == "as_" + VOLUME) {
                            spliceIndexList.push(i);
                        }
                    });
                    $.each(spliceIndexList.reverse(), function(i, spliceIndex) {
                        d.data.as_nodes.splice(spliceIndex, 1);
                    });
                    // end clear as_vm & as_volume
                    // set as_vm
                    $.each(jsonData.success.servers, function(i, server) {
                        if (!isEmpty(volumePositionList)) {
                            var attatch_volumes = jsonData.success.volumes.filter(function(volume) {
                                var is_attach = false;
                                $.each(volume.attachments, function(a_i, attachment) {
                                    if (attachment.server_id == server.id) {
                                        is_attach = true;
                                        return;
                                    }
                                });
                                return is_attach;
                            });
                            as_volumes = as_volumes.concat(attatch_volumes);
                        }
                        var as_vm = {
                            id: server.id,
                            name: server.name,
                            resource_type: "as_" + VM,
                            data: server,
                            x: 75 + 75 * positionList[i].x,
                            y: 100 + 75 * positionList[i].y
                        }
                        d.data.as_nodes.push(as_vm);
                        $.each(tempAsLinks, function(j, tempAsLink) {
                            var source_name;
                            if (typeof tempAsLink.source == "string") { source_name = tempAsLink.source; }
                            else { source_name = tempAsLink.source.name; }
                            var source = findNodeByName(source_name, tempAsLink.source.resource_type, true);
                            var existAsLinks = asLinks.filter(asLink => asLink.source.id == source.id && asLink.target.id == as_vm.id);
                            if (existAsLinks.length > 0) {
                                $.each(existAsLinks, function(eal_i, eal) {
                                    asLinks.splice(asLinks.indexOf(eal));
                                });
                            }
                            asLinks.push({source: source, target: as_vm});
                        });
                        var as_network = getResourceInAutoScaling(d, NETWORK);
                        if (asLinks.filter(asLink => asLink.source.id == as_network.id && asLink.target.id == as_vm.id).length < 1) {
                            asLinks.puth({source: as_network, target: as_vm});
                        }
                    });
                    $.each(d.data.as_nodes.filter(as_node => as_node.resource_type == "as_" + VM), function(i, as_vm) {
                        as_vm.x = 75 + 75 * positionList[i].x;
                        as_vm.y = 100 + 75 * positionList[i].y;
                    });
                    // set as_volume
                    if (!isEmpty(as_volumes)) {
                        $.each(as_volumes, function(i, volume) {
                            var as_volume = {
                                id: volume.id,
                                name: volume.name,
                                resource_type: "as_" + VOLUME,
                                data: volume,
                                x: 75 + 75 * volumePositionList[i].x,
                                y: 100 + 75 * volumePositionList[i].y
                            }
                            d.data.as_nodes.push(as_volume);
                            as_vms = d.data.as_nodes.filter(as_node => as_node.resource_type == "as_" + VM);
                            asLinks.push({source: as_vms[i], target: as_volume});
                        });
                        $.each(d.data.as_nodes.filter(as_node => as_node.resource_type == "as_" + VOLUME), function(i, as_volume) {
                            as_volume.x = 75 + 75 * volumePositionList[i].x;
                            as_volume.y = 100 + 75 * volumePositionList[i].y;
                        });
                    }
                    restart();
                }
            }
        },
        error: function(request, textStatus, errorThrown) {
            if (arguments.length == 1) {
                U.lobiboxErrorMessage(request);
            } else {
                if (request.status == 401) {
                    $.fn.modal.Constructor.DEFAULTS.keyboard = false;
                    U.lobibox("The request you have made requires authentication.", "error", "Unauthorized(401)");
                    $('#loginModal').modal('show');
                } else {
                    if (request.status != 0) {
                        // alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                        if (request.responseJSON) {
                            if (request.responseJSON.error) {
                                var error = request.responseJSON.error;
                                U.lobibox(error.message, "error", error.title);
                            }
                        } else {
                            try {
                                var response = JSON.parse(request.responseText);
                                if (response.error) {
                                    U.lobibox(response.error.message, "error", response.error.title);
                                }
                            } catch (exception) {
                                console.log(exception);
                            }
                            U.lobibox(request.responseText, "error", errorThrown + "(" + request.status + ")");
                        }
                    }
                }
            }
            clearInterval(reload);
        }
    });
}

// auto scaling 테두리를 그리기위한 함수
function getASAreaPath(rr) {
    var pathStr = "M" + rr.r + " 0 "; // 시작점
    pathStr += "A " + rr.r + " " + rr.r + ", 0, 0, 0, 0 " + rr.r + " "; // lt호
    pathStr += "V " + (rr.tp - rr.th/2) + " "; // 수직 & 삼각형rt
    pathStr += "L " + (-rr.tw) + " " + rr.tp + " "; // 삼각형lc
    pathStr += "L 0 " + (rr.tp + rr.th/2) + " "; // 삼각형rb
    pathStr += "V " + (rr.h - rr.r) + " "; // 수직
    pathStr += "A " + rr.r + " " + rr.r + ", 0, 0, 0, " + rr.r + " " + rr.h + " "; // lb호
    pathStr += "H " + (rr.w - rr.r) + " "; // 수평
    pathStr += "A " + rr.r + " " + rr.r + ", 0, 0, 0, " + rr.w + " " + (rr.h - rr.r) + " "; // rb호
    pathStr += "V " + rr.r + " "; // 수직
    pathStr += "A " + rr.r + " " + rr.r + ", 0, 0, 0, " + (rr.w - rr.r) + " 0" + " "; // rt호
    pathStr += "Z";
    return pathStr;
}

// auto scaling 테두리를 그리기위한 함수
function drawASArea(gASArea) {
    var pathStr = getASAreaPath(roundRect);
    gASArea.append("svg:path").attr("class", "pathASArea")
        .attr("d", pathStr)
        .style("fill","url(#autoscaling_group_bg)")
        .style("stroke", "#ddd");
    var foreignObject = gASArea.append("svg:foreignObject").attr("width", 999999);
    var asgTitle = foreignObject.append("xhtml:div").attr('class', 'autoscaling_group');
    asgTitle.append("xhtml:span").attr("class", "as_name").text(function(d) {return d.name;});
    asgTitle.append("xhtml:img").attr("class", "topology_left_close01")
        .attr("src", "/static/img/right_close.png").attr("alt", "#")
        .on("click", function(d) {
            d.expand_view = false;
            selected_link = null;
            selected_node = null;
            showNodeInfo();
            restart();
        });
}

// auto scaling node 들을 새로고침
function refreshASNodes(gASArea) {
    gASArea.append("svg:g").attr("class", function(as) {return as.id;}).classed("gASNodes", true);
    gASGroup.selectAll('g.gASNodes').each(function(as) {
        var gASNodes = d3.select(this).selectAll("g");
        gASNodes = gASNodes.data(function(d) {return as.data.as_nodes;}, function(asd) {return asd.id;});
        var g = gASNodes.enter().append("svg:g")
            .attr('class', function(asd) {return asd.resource_type}).classed("gASNode", true)
            .attr('transform', function(asd) {
                return 'translate(' + asd.x + ',' + asd.y + ')';
            });
        refreshNodeText(g);
        var tempCir = g.append('svg:circle').attr('class', 'node').classed(function(asd) { return asd.resource_type; })
            .attr('r', nodesRadius).style('fill', function(asd) {
                if (asd.resource_type == "as_" + VM && !editFlag) {
                    return "url(#" + VM + ")"
                } else {
                    return "url(#" + asd.resource_type + ")";
                }
            })
            .style('stroke', "#ddd");
        setNodeEvent(tempCir);
        gASNodes.exit().remove();
    });
}

// auto scaling link 들을 새로고침
function refreshASLinks(gASArea) {
    gASArea.append("svg:g").attr("class", "pathASLink");
    gASGroup.selectAll("g.pathASLink").each(function(as) {
        var loadbalancer = getResourceInAutoScaling(as, LOADBALANCER);
        var as_vm = getResourceInAutoScaling(as, "as_" + VM);
        var as_volume = getResourceInAutoScaling(as, "as_" + VOLUME);
        var tempASLinks = [{source: {x: 75, y: 100}, target: {x: 150, y: 175}}, {source: {x: 150, y: 175}, target: {x: 225, y: 250}}];
        var as_vm_list = as.data.as_nodes.filter(as_node => as_node.resource_type == "as_" + VM);
        var as_volume_list = as.data.as_nodes.filter(as_node => as_node.resource_type == "as_" + VOLUME);
        if (!editFlag) {
            $.each(as_vm_list, function(av_i, av) {
                if (av.x != 225 || av.y != 250) {
                    tempASLinks.push({source: {x: 150, y: 175}, target: {x: av.x, y: av.y}});
                    if (!isEmpty(as_volume_list[av_i])) {
                        tempASLinks.push({source: {x: av.x, y: av.y}, target: {x: as_volume_list[av_i].x, y: as_volume_list[av_i].y}});
                    }
                }
            });
        }
        tempASLinks = tempASLinks.concat(asLinks.filter(function(asLink) {
            return ((asLink.target === loadbalancer || as_vm_list.indexOf(asLink.target) != -1) && asLink.source.resource_type != "as_" + NETWORK) || asLink.target === as_volume;
        }));
        var pathASLink = d3.select(this).selectAll("path");
        pathASLink = pathASLink.data(tempASLinks);
        path = pathASLink.enter().append('svg:path')
            .attr('class', 'link')
            .attr('d', drawLinkLine);
        pathASLink.exit().remove();
    });
}

// topology 를 새로고침 (필요시마다 호출하면 됨)
function restart() {
    refreshGroups();
    refreshLinks();
    refreshNodes();
    pathGroup.moveToBack();
    force.start();
}

// ID로 node 찾기
function findNodeById(id) {
    var node = null;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id == id) {
            node = nodes[i];
            break;
        } else if (nodes[i].resource_type == AUTOSCALING) {
            for (var as_i = 0; as_i < nodes[i].data.as_nodes.length; as_i++) {
                if (nodes[i].data.as_nodes[as_i].id == id) {
                    node = nodes[i].data.as_nodes[as_i];
                    break;
                }
            }
        }
    }
    return node;
}
// 이름으로 node 찾기
function findNodeByName(name, resource_type, messageFlag) {
    var node = null;
    for (var i = 0; i < nodes.length; i++) {
        if (typeof nodes[i].name == "undefined") {
            if (typeof nodes[i].data.name != "undefined") {
                nodes[i].name = nodes[i].data.name;
            } else if (typeof nodes[i].data.server_name != "undefined") {
                nodes[i].name = nodes[i].data.server_name;
            } else {
                break;
            }
        }
        if (nodes[i].name == name && nodes[i].resource_type == resource_type) {
            node = nodes[i];
            break;
        } else if (nodes[i].name.indexOf(name) > 0 && nodes[i].resource_type.indexOf(VOLUME) != -1 && resource_type.indexOf(VOLUME) != -1) {
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
    if (node == null) {
        for (var i = 0; i < nodes.length; i++) {
            if (typeof nodes[i].name == "undefined") {
                break;
            }
            if (nodes[i].resource_type == AUTOSCALING) {
                node = getResourceInAutoScaling(nodes[i], resource_type);
                break;
            }
        }
    }
    if (node == null && messageFlag && resource_type != "as_" + VOLUME) {
        U.lobibox(gettext("해당자원이 존재하지 않습니다."), "error", name);
    }
    return node;
}

// group 만들기
function insertGroup() {
    for (var links_i =0; links_i < links.length; links_i++) {
        if (typeof links[links_i].source == "undefined" || typeof links[links_i].target == "undefined" || links[links_i].source == null || links[links_i].target == null) {
            U.lobiboxMessage(gettext("연결 정보가 올바르지 않습니다."), "error", gettext("에러"));
            continue;
        }
        var source = (links[links_i].source.resource_type == NETWORK) ? links[links_i].source : links[links_i].target;
        var target = (links[links_i].source  === source) ? links[links_i].target : links[links_i].source;

        // source  == network && target == vm
        if (source.resource_type == NETWORK) {
            if (target.resource_type == VM || target.resource_type == AUTOSCALING) {
                var flag = false;
                for (var group_i = 0; group_i < groups.length; group_i++) {
                    if (groups[group_i].id == source.id) {
                        // 그룹들 중 network id로 생성된 그룹이 있다면 node를 해당 그룹에 추가
                        if (groups[group_i].nodeList.indexOf(target) == -1) {
                            // 추가할 node가 해당 group에 없으면 추가
                            groups[group_i].nodeList.push(target);
                        }
                        flag = true;
                        break;
                    }
                }
//                if (!flag) {
//                    // 생성된 그룹이 없다면 생성
//                    var group = { id:source.id, nodeList:[source, target] };
//                    groups.push(group);
//                }
            }
        }
    }
}

// 새로운 노드 생성
function insertNewNode(data, x=(width/2), y=(height/2), fixed) {
    var node = {
        id: data.id,
        name: data.name,
        reflexive: false,
        fixed: true,
        newNode: true,
        resource_type: data.resource_type,
        data: data,
        x: x,y: y
    }
    if (!fixed) {
        node.fixed = false;
    }
    switch (data.resource_type) {
        case NETWORK:
            var group = { id:node.id, nodeList:[node] };
            groups.push(group);
            break;
        case AUTOSCALING:
            node.expand_view = false;
            node.data.scaling_policy_list = [{
                name: "",
                adjustment_type: "change_in_capacity",
                scaling_adjustment: 1,
                meter_name: "cpu_util",
                threshold: 50
            }];
            node.data.as_nodes = [];
            var tempLoadbalancerNode = {
                id: guid(),
                name: "",
                resource_type: LOADBALANCER,
                x: 75,
                y: 100,
                newNode: true,
                data: {
                    pool_member: {
                        name: "",
                        protocol_port: 80,
                        weight: 1,
                        subnet: ""
                    },
                    lb_algorithm: "ROUND_ROBIN",
                    protocol: "",
                    protocol_port: 80,
                    tenant_net: ""
                }
            };
            node.data.as_nodes.push(tempLoadbalancerNode);
            var tempNetworkNode = {
                id: guid(),
                x: 150,
                y: 175,
                name: "",
                data: {
                    alloc_pools_list: [],
                    host_route: [],
                    enable_dhcp: true
                },
                resource_type: "as_" + NETWORK
            };
            node.data.as_nodes.push(tempNetworkNode);
            var tempVMNode = {
                id: guid(),
                resource_type: "as_" + VM,
                x: 225,
                y: 250,
                newNode: true,
                data: {
                    flavor: "",
                    image: "",
                    vnic_list: [{
                        public_ip: false,
                        tenant_net: "",
                        name: ""
                    }]
                }
            };
            node.data.as_nodes.push(tempVMNode);
            asLinks = asLinks.concat([
                {source: tempNetworkNode, target: tempLoadbalancerNode},
                {source: tempNetworkNode, target: tempVMNode}
            ]);
            break;
    }

    nodes.push(node);
}

// 새로운 link 생성
function insertNewLink(node1, node2) {
    if (node1 == null || node2 == null) return;
    var link = {
        source: node1, target: node2,
        left: true, right: true
    };
    links.push(link);
    insertGroup();
}

// toSave object 에 node 정보 저장
function saveNodeData(toSave, data, exceptList, optionalList) {
    $.each(data, function(key, val) {
        // console.log("key: ", key, "\nvalue: ", val, "\nexceptFlag: ", exceptList.indexOf(key) in exceptList, "\noptionalFlag: ", optionalList.indexOf(key) in optionalList, "\nemptyFlag: ", isEmpty(val), "\nTotal_flag: ", !((exceptList.indexOf(key) in exceptList) || (optionalList.indexOf(key) in optionalList && isEmpty(val))))
        if (!((exceptList.indexOf(key) in exceptList) || (optionalList.indexOf(key) in optionalList && isEmpty(val)))) {
            toSave[key] = val;
        }
    });
}

// 서비스 생성시 service object에 정보 저장
function saveNode(node) {
    var data = node.data;
    //////////////////////////////////////////////////////////////////////////////
    var resource_type = node.resource_type;
    switch(resource_type) {
        case ROUTER:
            var vrouter = {};
            vrouter['name'] = node.name;
            vrouter['external_net'] = data.external_net;
            vrouter['tenant_net_list'] = data.tenant_net_list;
            vrouter['admin_state'] = data.admin_state;

            service['vrouter_list'].push(vrouter);
            break;
        case NETWORK:
            var network = {};
            network['name'] = node.name;
            network['admin_state'] = data.admin_state;
            network['cidr'] = data.cidr;
            network['share'] = data.share;
            network['ip_version'] = data.ip_version;
            network['gateway_ip'] = data.gateway_ip;
            network['enable_dhcp'] = data.enable_dhcp;

            network['alloc_pools_list'] = data.alloc_pools;
            var dns_list = [];
            if (typeof data.dns != "undefined" && data.dns.replace(/\s/g,"") != "") {
                dns_list.concat(data.dns.split("\n"));
            }
            network['dns_list'] = dns_list;
            network['host_route'] = data.host_route;

            service['network_list'].push(network);
            break;
        case VM:
            var vm_template = {};
            vm_template['server_name'] = node.name;
            vm_template['availability'] = data.availability;
            vm_template['booting_source_type'] = data.booting_source_type;
            vm_template['image'] = data.image;
            vm_template['flavor'] = data.flavor;
            var vnic_list = [];
            $.each(data.tenant_net_list, function(index, tenant_net) {
                var tenantNetBuffer = {
                    name: index.toString(),
                    tenant_net:tenant_net.tenant_net,
                    public_ip:tenant_net.public_ip
                }

                if (typeof tenant_net.mac_address != "undefined" && tenant_net.mac_address != "") { //수정수정수정~
                    tenantNetBuffer['mac_address'] = tenant_net.mac_address;
                }
                if (typeof tenant_net.ip_address != "undefined" && tenant_net.ip_address != "") {
                    tenantNetBuffer['ip_address'] = tenant_net.ip_address;
                }
                vnic_list.push(tenantNetBuffer);
            });
            vm_template['vnic_list'] = vnic_list;
            vm_template['volume_list'] = [];

            vm_template['security_group'] = data.security_group;
            vm_template['key_name'] = data.key_name;
            vm_template['custom_script'] = data.custom_script;

            service['vm_template_list'].push(vm_template);
            break;
        case VOLUME:
            var volume = {};
            volume['name'] = node.name;
            volume[data.image_type] = data.volume_image;
            volume['size'] = data.size;
            var vm_template_for_push = service['vm_template_list'].filter(function(d) {
                return d.server_name == data.vm_template;
            })[0]; //수정수정
            vm_template_for_push['volume_list'].push(volume);
            break;
        case AUTOSCALING:
            var autoscaling = {};
            var asExcept = ["name", "as_nodes", "resource_type", "id"], // 제외
                asOptional = ["cooldown", "desired_capacity"], // optional 값
                lbExcept = ["name"], // 제외
                lbOptional = ["description", "public_vip", "external_network", "connection_limit", "persistence", "monitor"], // optional 값
                asVmExcept = [], // 제외
                asVmOptional = ["key_name", "user_data_format", "user_data", "pool_id", "subnet"]; // optional값
            // autoscaling data set
            autoscaling["name"] = node.name;
            saveNodeData(autoscaling, node.data, asExcept, asOptional);
            $.each(autoscaling.scaling_policy_list, function(i, policy) {
                $.each(policy, function(key, value) {
                    if (typeof value === "string" && isNumber(value)) {
                        policy[key] = parseInt(value);
                    }
                });
            });
            $.each(node.data.as_nodes, function(i, as_node) {
                if (as_node.resource_type == LOADBALANCER) {
                    // loadbalancer data set
                    var loadbalancer = {name: as_node.name};
                    saveNodeData(loadbalancer, as_node.data, lbExcept, lbOptional);
                    if (!isEmpty(loadbalancer.monitor)) {
                        if (isEmpty(loadbalancer.monitor.name)) {
                            delete loadbalancer.monitor;
                        } else {
                            if (loadbalancer.monitor.type.indexOf('HTTP') == -1) {
                                delete loadbalancer.monitor.http_method;
                            }
                        }
                    }
                    service["loadbalancer_list"].push(loadbalancer);
                } else if (as_node.resource_type == "as_" + VM) {
                    // vm_resource data set
                    autoscaling["vm_resource"] = {};
                    saveNodeData(autoscaling.vm_resource, as_node.data, asVmExcept, asVmOptional);
                    if (!isEmpty(autoscaling.vm_resource.vnic_list)) {
                        var vnic_list = [];
                        $.each(autoscaling.vm_resource.vnic_list, function(index, vnic) {
                            var tenantNetBuffer = {
                                name: index.toString(),
                                tenant_net: vnic.tenant_net,
                                public_ip: vnic.public_ip
                            }
                            vnic_list.push(tenantNetBuffer);
                        });
                        autoscaling.vm_resource['vnic_list'] = vnic_list;
                    }
                } else if (as_node.resource_type == "as_" + NETWORK) {
                    var network = {name: as_node.name};
                    saveNodeData(network, as_node.data, ["dns"], []);
                    var dns_list = [];
                    if (typeof data.dns != "undefined" && data.dns.replace(/\s/g,"") != "") {
                        dns_list.concat(data.dns.split("\n"));
                    }
                    network['dns_list'] = dns_list;
//                    network['host_route'] = data.host_route;
//                    network['alloc_pools_list'] = data.alloc_pools;

                    service["network_list"].push(network);
                }
            });
            $.each(node.data.as_nodes, function(i, as_node) {
            if (as_node.resource_type == "as_" + VOLUME) {
                var volume = getResourceInAutoScaling(node, VOLUME);
                    autoscaling.vm_resource["volume_list"] = [{
                        name: volume.name,
                        size: volume.data.size
                    }];
                    if (!isEmpty(volume.data.image_type) && volume.data.image_type != 'none') {
                        autoscaling.vm_resource.volume_list[0]["type"] = volume.data.image_type;
                    }
                    if (!isEmpty(volume.data.volume_image)) {
                        autoscaling.vm_resource.volume_list[0]["image"] = volume.data.volume_image;
                    } else if (!isEmpty(volume.data.snapshot)) {
                        autoscaling.vm_resource.volume_list[0]["snapshot"] = volume.data.snapshot;
                    }
                }
            });
            service['auto_scaling_list'].push(autoscaling);
            break;
        /*
        case LOADBALANCER:
            var loadbalancer = {};
            loadbalancer['name'] = 'test-lb-01';
            loadbalancer['description'] = '';
            loadbalancer['pool_member_list'] = [];

            var pool_member = {};
            pool_member['name'] = 'test-pool-01';
            pool_member['protocol_port'] = '';
            pool_member['weight'] = 1;

            loadbalancer['pool_member_list'].push(pool_member);
            loadbalancer['tenant_net'] = '';
            loadbalancer['public_vip'] = false;
            loadbalancer['lb_method'] = '';
            loadbalancer['protocol'] = '';
            loadbalancer['port'] = 80;
            loadbalancer['connection_limit'] = 100;
            loadbalancer['persistence'] = '';
            loadbalancer['cookie_name'] = '';
            loadbalancer['monitors_list'] = [];


            var monitors = {};
            monitors['name'] = 'test-monitor-01';
            monitors['type'] = 'HTTP';
            monitors['delay'] = 60;
            monitors['timeout'] = 600;
            monitors['max_retries'] = 6;
            monitors['http_method'] = '';
            monitors['url_path'] = '';
            monitors['expected_codes_list'] = [];

            service['loadbalancer_list'].push(loadbalancer);
            break;
        case FIREWALL:
            service['firewall'] = {};

            var firewall = {};
            firewall['name'] = 'test-fw-01';
            firewall['description'] = '';
            firewall['fw_rule_list'] = [];

            var fw_rule = {};
            fw_rule['name'] = 'test-fw-rule-01';
            fw_rule['description'] = '';
            fw_rule['protocol'] = 'TCP';
            fw_rule['src_ip'] = '192.168.0.99';
            fw_rule['dst_ip'] = '';
            fw_rule['src_port'] = '';
            fw_rule['dst_port'] = '';
            fw_rule['action'] = 'ALLOW';
            fw_rule['enabled'] = true;

            service['firewall'] = firewall;
            break;
        case VPN:
            var vpn = {};
            vpn['name'] = 'test-vpn-01';
            vpn['description'] = '';
            vpn['tenant_net'] = '';
            vpn['peer_region_id'] = '';
            vpn['peer_tenant_net'] = '';
            vpn['mtu'] = 1500;
            vpn['psk'] = '';
            service['vpn_list'].push(vpn);
            break;
        */
        case INTERNET:
            break;
        default:
            console.log("UNKNOWN DATA");
            resource_type = UNKNOWN;
            break;
    }
}

// 마우스 down 이벤트
function mousedown() {
    svg.classed('active', true);
    if (d3.event.ctrlKey || mousedown_node || mousedown_link) return;

    restart();
}

// 마우스 이동 이벤트
function mousemove() {
    if (!mousedown_node || !editFlag) return;
    // update drag line
    var dragLineLink = {source: mousedown_node, target: {x: d3.mouse(this)[0], y: d3.mouse(this)[1]}};
    var as = getAutoScalingOfResource(mousedown_node);
    if (as) {
        dragLineLink.source = {x: mousedown_node.x + (as.x + nodesRadius + 10), y: mousedown_node.y + (as.y - roundRect.tp)};
    }
    drag_line.attr('d', drawLinkLine(dragLineLink, "None"));
    restart();
}

// 마우스 up 이벤트
function mouseup() {
    if (selected_node != null && !editFlag) {
//        selected_node = null;
//        showNodeInfo();
        restart();
    }
    if (mousedown_node || !editFlag) {
        drag_line.classed('hidden', true).style('marker-end', '');
    }
    svg.classed('active', false);
    resetMouseVars();
}

// node 삭제시 link도 같이 삭제하기 위한 함수
function spliceLinksForNode(node) {
    // links에서 삭제한 node를 갖고있는 link를 찾아 list로 반환
    var linkToSplice = links.filter(function(l) {
        return (l.source === node || l.target === node);
    });
    if (node.resource_type == VM || node.resource_type == AUTOSCALING) {
        for (var i = 0; i < linkToSplice.length; i++) {
            spliceGroupElementForLink(linkToSplice[i]);
        }
    }
    var groupToSplice = groups.filter(function(g) {
        return (g.id == node.id);
    });
    var asToSplice = asLinks.filter(function(l) {
        return (l.source === node || l.target === node);
    });
    groupToSplice.map(function(g) {
        groups.splice(groups.indexOf(g), 1);
    });
    deleteLink(linkToSplice, asToSplice);
}

// link 삭제
function deleteLink(linkToSplice, asToSplice) {
    linkToSplice.map(function(l) {
        deleteDataByLink(l);
        links.splice(links.indexOf(l), 1);
    });
    if (asToSplice) {
        asToSplice.map(function(l) {
            deleteDataByLink(l);
            asLinks.splice(asLinks.indexOf(l), 1);
        });
    }
}
// 링크 삭제시 연결된 노드를 그룹에서 제거(network - vm, autoscaling)
function spliceGroupElementForLink(link) {
    var groupId;
    var target;
    if (link.source.resource_type == NETWORK) {
        if (link.target.resource_type == VM || link.target.resource_type == AUTOSCALING) {
            groupId = link.source.id;
            target = link.target;
        }
    } else if (link.target.resource_type == NETWORK) {
        if (link.source.resource_type == VM || link.source.resource_type == AUTOSCALING) {
            groupId = link.target.id;
            target = link.source;
        }
    } else {
        return;
    }
    var groupToSpliceNode = groups.filter(function(g) {
        return (g.id == groupId && g.nodeList.indexOf(target) != -1);
    });
    groupToSpliceNode.map(function(group) {
        var i = groups.indexOf(group);
        groups[i].nodeList.splice(group.nodeList.indexOf(target), 1);
    });
}

// node 삭제
function deleteNode() {
    if (selected_node.resource_type == INTERNET) return;
    if (selected_node.resource_type == "as_" + NETWORK) return;
    if (selected_node.resource_type == "as_" + VM) return;
    if (selected_node.resource_type == LOADBALANCER) return;
    spliceLinksForNode(selected_node);
    if (selected_node.resource_type == "as_" + VOLUME) {
        var as = getAutoScalingOfResource(selected_node);
        as.data.as_nodes.splice(as.data.as_nodes.indexOf(selected_node), 1);
        d3.selectAll("g.gASArea").filter(d => d === as).select("path")
            .attr("d", getASAreaPath({w: 300, h: 325, r: 5, tw: 15, th: 30, tp: 100}));
    } else {
        nodes.splice(nodes.indexOf(selected_node), 1);
    }
    selected_link = null;
    selected_node = null;
    restart();
    showNodeInfo();

    setCookie("nodes", JSON.stringify(nodes));

    var link_list = [];
    for ( var link_i = 0; link_i < links.length; link_i++ ) {
        link_list.push({
            "source":{"id":links[link_i].source.id},
            "target":{"id":links[link_i].target.id}
        });
    }
    setCookie("links", JSON.stringify(link_list));
}

// link 지우기 전에 data먼저 지우기
function deleteDataByLink(link) {
    var sType = link.source.resource_type;
    var tType = link.target.resource_type;
//    U.lobiboxMessage("확인창 모달 추가할것.\nselect만 갱신되도록 할것.");

    var source = nodes.filter(function(d) {
        return (d === link.source);
    })[0];
    var target = nodes.filter(function(d) {
        return (d === link.target);
    })[0];

    if ( sType == INTERNET) {
        if (tType == VM) {
            var tenant_net = target.data.tenant_net_list.find(function(tenant_net, idx) {
                return tenant_net.tenant_net == source.name;
            });
            var toDelIdx = target.data.tenant_net_list.indexOf(tenant_net);
            target.data.tenant_net_list.splice(toDelIdx,1);
        } else if (tType == AUTOSCALING) {
            getResourceInAutoScaling(target, LOADBALANCER).data.external_network = "";
            $("input[name=external_network]").val("");
        }
    } else if (sType == ROUTER) {
        if (tType == NETWORK) {
            var toDelIdx = source.data.tenant_net_list.indexOf(target.name);
            source.data.tenant_net_list.splice(toDelIdx,1);
        } else if (tType == INTERNET) {
            source.data.external_net = "";
            $("input[name=external_net]").val("");
        }
    } else if (sType == NETWORK) {
        if (tType == VM) {
            var tenant_net = target.data.tenant_net_list.find(function(tenant_net, idx) {
                return tenant_net.tenant_net == source.name;
            });
            var toDelIdx = target.data.tenant_net_list.indexOf(tenant_net);
            target.data.tenant_net_list.splice(toDelIdx,1);
        } else if (tType == AUTOSCALING) {
            var loadbalancer = getResourceInAutoScaling(target, LOADBALANCER);
            var lb_tenant_net = loadbalancer.data.tenant_net = "";
//            var lb_tenant_net = loadbalancer.data.tenant_net_list.find(function(tenant_net, idx) {
//                return tenant_net == source.name;
//            });
//            var lbToDelIdx = loadbalancer.data.tenant_net_list.indexOf(lb_tenant_net);
//            loadbalancer.data.tenant_net_list.splice(toDelIdx,1);
            var as_vm = getResourceInAutoScaling(target, VM);
            var vm_tenant_net = as_vm.data.vnic_list.find(function(vnic, idx) {
                return vnic.tenant_net == source.name;
            });
            var vmToDelIdx = as_vm.data.vnic_list.indexOf(vm_tenant_net);
            as_vm.data.vnic_list.splice(vmToDelIdx,1);
        }
    } else if (sType == VM) {
        if (tType == VOLUME) {
            target.data.vm_template = "";
        }
    } else {
//        console.log("source: " + sType + ", target: " + tType);
    }
    showNodeInfo();
}

// key down 이벤트
function keydown() {
//    d3.event.preventDefault();    //기본이벤트없애기
    if (lastKeyDown !== -1 ) return;
    lastKeyDown = d3.event.keyCode;
    // ctrl
    if (d3.event.keyCode === 17) {
        gNodes.call(force.drag);
        svg.classed('ctrl', true);
        restart();
//    } else if (d3.event.keyCode === 16) {
//        zoom.on('zoom', zoomEvent);
    }
    if ((!selected_node && !selected_link) || !editFlag) return;
    switch(d3.event.keyCode) {
//        case 8: // backspace
        case 46: // delete
            /*if (selected_node) {
                deleteNode();
            } else */
            if (selected_link) {
                if (selected_node != null) {
                    updateClick(selected_node.resource_type);
                }
                spliceGroupElementForLink(selected_link);
                deleteDataByLink(selected_link);
                links.splice(links.indexOf(selected_link), 1);
                var asToSplice = asLinks.filter(asLink => asLink.source == selected_link.source);
                if (asToSplice) {
                    asToSplice.map(function(l) {
                        deleteDataByLink(l);
                        asLinks.splice(asLinks.indexOf(l), 1);
                    });
                }
                selected_link = null;
                restart();
                setCookie("nodes", JSON.stringify(nodes));
                var link_list = [];
                for ( var link_i = 0; link_i < links.length; link_i++ ) {
                    link_list.push({
                        "source":{"id":links[link_i].source.id},
                        "target":{"id":links[link_i].target.id}
                    });
                }
                setCookie("links", JSON.stringify(link_list));
            }
            break;
        /*
        case 66: // B
            if (selected_link) {
                // set link direction to both left and right
                selected_link.left = true;
                selected_link.right = true;
            }
            restart();
            break;
        case 70: // F
            if (selected_node) {
                selected_node.fixed = !selected_node.fixed;
            }
            restart();
            break;
        case 76: // L
            if (selected_link) {
                // set link direction to left only
                selected_link.left = true;
                selected_link.right = false;
            }
            restart();
            break;
        case 82: // R
            if (selected_node) {
                // toggle node reflexivity
                selected_node.reflexive = !selected_node.reflexive;
            } else if (selected_link) {
                // set link direction to right only
                selected_link.left = false;
                selected_link.right = true;
            }
            restart();
            break;
            */
    }

}

// keyup 이벤트
function keyup() {
    lastKeyDown = -1;
    // ctrl
    if (d3.event.keyCode === 17) {
        gNodes.on('mousedown.drag', null)
            .on('touchstart.drag', null);
        svg.classed('ctrl', false);
//    } else if (d3.event.keyCode === 16) {
//        zoom.on("zoom", null);
    }
}

// drop 기본 이벤트 제거
function allowDrop(ev) {
    ev.preventDefault();
}

// drag 이벤트
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.setData("type", "resource");
}

// 보안장비 drag 이벤트
function securityDrag(ev) {
    ev.dataTransfer.setData("data", JSON.stringify($(ev.target).data()));
    ev.dataTransfer.setData("type", "security");
}

// 거리 조절 함수
function dist(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
}

// drop 이벤트
function drop(ev) {
    ev.preventDefault();
    var nodeData = {
        id:guid()
    };
    var resource_type;
    var key;
    if (ev.dataTransfer.getData("type") == "security") {
        var security_info = JSON.parse(ev.dataTransfer.getData("data")).data;
        var existUsedSecurityGroup = using_security_group_list.filter(function(using_security_group, idx) {
            return using_security_group.security_id == security_info.security_id;
        });
        if (existUsedSecurityGroup.length == 0) {
            loadSecurityGroupNodes(security_info, ev);
        }
    } else if (ev.dataTransfer.getData("type") == "resource") {
        var data = ev.dataTransfer.getData("text");
//        var selItem = $("#"+data);
        key = data.replace("_item","");
        nodeData.name = "";
        switch(key) {
            case "vm":
                resource_type = VM;
                break;
            case "volume":
                resource_type = VOLUME;
                break;
            case "network":
                resource_type = NETWORK;
                nodeData.alloc_pools = [];
                nodeData.host_route = [];
                nodeData.enable_dhcp = true;
                break;
            case "vrouter":
                resource_type = ROUTER;
                break;
//            case "loadbalancer":
//                resource_type = LOADBALANCER;
//                break;
            case "autoscaling":
                resource_type = AUTOSCALING;
                break;
            case "firewall":
                resource_type = FIREWALL;
                break;
            default:
                resource_type = UNKNOWN;
                break;
        }
        nodeData.resource_type = resource_type;
        if (ev.target.id != "service" && $(ev.target).parents(".gASArea").length == 1) {
            if (resource_type == VOLUME) {
                var as = d3.select($(ev.target).parents(".gASArea")[0]).data()[0];
                if (as && as.data.as_nodes.filter(as_node => as_node.resource_type == "as_" + VOLUME).length == 0) {
                    var as_vm = getResourceInAutoScaling(as, VM);
                    nodeData.vm_template = as_vm.id;
                    var as_volume = {
                        id: nodeData.id,
                        name: nodeData.name,
                        reflexive: false,
                        fixed: true,
                        newNode: true,
                        resource_type: "as_" + nodeData.resource_type,
                        data: nodeData,
                        x: 300, y: 325
                    };
                    as.data.as_nodes.push(as_volume);
                    asLinks.push({source: as_vm, target: as_volume});
                }
            } else {
                U.lobiboxMessage(gettext("오토스케일링 그룹에는 Volume만 추가할 수 있습니다."), "warning");
            }
        } else if (typeof nodeData.name != "undefined") {
            insertNewNode(nodeData, ev.pageX - 210 , ev.pageY - 122);
        }

//        if (ev.dataTransfer.getData("type") == "security") {
//            for (var index = 0; index < loadLinks.length; index++) {
//                var source_name;
//                var target_name;
//                if (source_name instanceof String) { source_name = jsonData.links[index].source; }
//                else { source_name = jsonData.links[index].source.name; }
//                if (target_name instanceof String) { target_name = jsonData.links[index].target;}
//                else { target_name = jsonData.links[index].target.name; }
//
//                var source = findNodeByName(source_name, loadLinks[index].source.resource_type);
//                var target = findNodeByName(target_name, loadLinks[index].target.resource_type);
//                insertNewLink(source, target);
//            }
//        }
    }
    restart();
}

// 보안장비 드랍다운시 불러오기
function loadSecurityGroupNodes(security_info, ev) {
    var loadedData = security_info.data;
    if (typeof loadedData == "string") {
        loadedData = JSON.parse(security_info.data);
    }
    $.each(loadedData, function(key, val) {
        if (typeof val == "string") {
            loadedData[key] = JSON.parse(val);
        }
    });
    security_types = security_types.concat(loadedData.security_types);
    var loadLinks = loadedData.links;
    var tmpNodes = loadedData.nodes;
    var vmNode = null;
    var useSecurityGroup = {security_id:security_info.security_id, server_list:[]};
    // 자원 불러오기
    var virtual_machine_cnt = 0;
    $.each(tmpNodes, function(idx, tmpNode) {
        tmpNode.data.name = tmpNode.name;
        var existNode = nodes.filter(function(node, index) {
            return node.name == tmpNode.name && tmpNode.resource_type == node.resource_type;
        });
        if (existNode.length == 0) {
            var x = ev.pageX - 210;
            var y = ev.pageY - 122;
            if (tmpNode.resource_type == "virtual_machine") {
                tmpNode.data.security = true;
                var security_type = loadedData.security_types.find(function(security_type, s_idx) {
                    return security_type.name == tmpNode.name;
                }).security_type;

                tmpNode.data.security_group = {
                    "id":security_info.security_id,
                    "type":security_type
                };

                useSecurityGroup.server_list.push(tmpNode.name);

                x -= (virtual_machine_cnt) * 50;
                y -= (virtual_machine_cnt++) * 50;
            } else {
                x = parseInt(Math.random() * 300 + 50 + x);
                y = parseInt(Math.random() * 300 + 50 + y);
            }
            tmpNode.data.id = guid();
            insertNewNode(tmpNode.data, x, y, false);
            restart();
        }
    });
    // 링크 연결
    for (var index = 0; index < loadLinks.length; index++) {
        var source_name;
        var target_name;
        if (typeof loadLinks[index].source == "string") { source_name = loadLinks[index].source; }
        else { source_name = loadLinks[index].source.name; }
        if (typeof loadLinks[index].target == "string") { target_name = loadLinks[index].target; }
        else { target_name = loadLinks[index].target.name; }

        var source = findNodeByName(source_name, loadLinks[index].source.resource_type);
        var target = findNodeByName(target_name, loadLinks[index].target.resource_type);
        insertNewLink(source, target);
    }
    using_security_group_list.push(useSecurityGroup);
}

// 조회모드시
if (!editFlag) {
    zoom.on('zoom', zoomEvent);
    svg.call(zoom).on("mousedown.zoom", null)
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null)
        .on("dblclick.zoom", null);
}
resizingSvg();