// set up SVG for D3
// set up initial nodes and links
// 설정 초기 노드와 링크
//  - nodes are known by 'id', not by index in array.
// - nodes 는 배열의 인덱스가 아니라, 'ID' 로 알려져있다.
//  - reflexive edges are indicated on the node (as a bold black circle).
// - reflexive : 가장자리 ( 굵은 검은 색 원으로 ) node 에 표시됩니다.
//  - links are always source < target; edge directions are set by 'left' and 'right'.
// - links 는 항상 source < target; 가장자리 방향은 '왼쪽'과 '오른쪽' 으로 설정됩니다.

var nodes = [
    {id: 0, reflexive: false, x: 100, y: 100, name: "hi", fixed:true},
    {id: 1, reflexive: true , x: 200, y: 200, name: "베르나르베르베르", fixed:true},
    {id: 2, reflexive: false, x: 300, y: 100, name: "타나타노트"},
    {id: 3, reflexive: true , x: 200, y: 200, name: "hello my world, kia"},
    {id: 4, reflexive: false, x: 300, y: 100},
    {id: 5, reflexive: false, x: 300, y: 100},
    {id: 6, reflexive: false, x: 300, y: 100}
  ],
  lastNodeId = 6,
  links = [
    {source: nodes[0], target: nodes[1], left: false, right: true },
    {source: nodes[1], target: nodes[2], left: false, right: true }
  ],
  groups = [
    {id:0, nodeList:[nodes[0], nodes[1], nodes[2]]},
    {id:1, nodeList:[nodes[3], nodes[4]]},
    {id:2, nodeList:[nodes[5]]}
  ];
var width  = 1280,
        height = 720,
        colors = d3.scale.category10();

var svg = d3.select('#vis')
    .append('svg')
    .attr('oncontextmenu', 'return false;')
    .attr('width', width)
    .attr('height', height);


//var nodes=[],
//        lastNodeId = -1,
//        links = [];
var nodesRadius = 30;
// init D3 force layout
var force = d3.layout.force()
        .nodes(nodes)
        //.links(links)     //링크된 노드의 거리 유지
        .size([width, height])
        //.linkDistance(150)    //링크된 노드의 거리
        .charge(-1000)       //노드간의 거리
        .on('tick', tick);
var focusNodeName = false;

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
    .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
        .attr('id', 'start-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 4)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
    .append('svg:path')
        .attr('d', 'M10,-5L0,0L10,5')
        .attr('fill', '#000');

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');

// handles to link and node element groups
// 생성순서에따라 위아래가 바뀜(태그위치)
// 만약 gGroup 이 pathLink 보다 위에 있다면 화면에서 그룹이 링크를 가려 눌리지않음
var gGroup = svg.append('svg:g'),
    pathLink = svg.append('svg:g').selectAll('path'),
    gNodes = gGroup.attr('group', '1').selectAll('g'),
    pathGroup = gGroup.selectAll('path');
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
        for(var j in d.nodeList)
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
        var sourcePadding = d.left ? nodesRadius + 5 : nodesRadius;
        var targetPadding = d.right ? nodesRadius + 5 : nodesRadius;
        var sourceX = d.source.x + (sourcePadding * normX);
        var sourceY = d.source.y + (sourcePadding * normY);
        var targetX = d.target.x - (targetPadding * normX);
        var targetY = d.target.y - (targetPadding * normY);
        return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });

    gNodes.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
    });
    showNodeInfo();
    var nodeName = $('#nodeName');
    nodeName.focus(function(){
        focusNodeName = true;
    });
    nodeName.blur(function(){
        focusNodeName = false;
    });
    $('#nameBtn').on('click', function(){
        selected_node.name = nodeName.val();
        restart();
    });
}

function showNodeInfo(){
    var node_info_html = ""
    if (selected_node != null) {
        var selected_nodeKeyArray = Object.keys(selected_node);
        for(var i in selected_nodeKeyArray) {
            if (selected_nodeKeyArray[i] != "px" && selected_nodeKeyArray[i] != "py" && selected_nodeKeyArray[i] != "px" && selected_nodeKeyArray[i] != "py" ) {
                node_info_html += "<tr><td>" + selected_nodeKeyArray[i] + "</td><td> " + eval("selected_node." + selected_nodeKeyArray[i]) + "</td></tr>";
            }
        }
        tempCnt += 1;
        if (tempCnt / 50 == 1) {
            console.log("selected_nod[key] : "+Object.keys(selected_node));
            tempCnt = 0;
        }
    }
    else {
        node_info_html += "<tr><td>node를 선택하세요.</td></tr>";
    }
    d3.select("#infoTable").html(node_info_html);
}
var tempFlag= true;
// update graph (called when needed)
function restart() {
    pathGroup = pathGroup.data(groups);
    pathGroup.enter().append('path')
        .attr('class', 'subset')
        .style("fill", function(d) { return colors(d.id); })
        .style("stroke", function(d) { return colors(d.id); });
    pathGroup.exit().remove();

    // path (link) group
    pathLink = pathLink.data(links);
    // update existing links
    pathLink.classed('selected', function(d) { return d === selected_link; })
        .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
        .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });
        // add new links
    pathLink.enter().append('svg:path')
        .attr('class', 'link')
        .classed('selected', function(d) { return d === selected_link; })
        .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
        .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
        .on('mousedown', function(d) {
            if(d3.event.ctrlKey) return;
             // select link
            mousedown_link = d;
            if(mousedown_link === selected_link) selected_link = null;
            else selected_link = mousedown_link;
            selected_node = null;
            restart();
        });
    // remove old links
    pathLink.exit().remove();
        // gNodes (node) group
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    gNodes = gNodes.data(nodes, function(d) { return d.id; });
    // update existing nodes (reflexive & selected visual states)
    gNodes.selectAll('circle')
        .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
        .classed('reflexive', function(d) { return d.reflexive; });
    gNodes.selectAll('text')
        .text(function(d) { return d.name; });
    // add new nodes
    var g = gNodes.enter().append('svg:g');
    g.append('svg:circle')
        .attr('class', 'node')
        .attr('r', nodesRadius)          //반지름
        .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
        .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
        .classed('reflexive', function(d) { return d.reflexive; })
        .on('mouseover', function(d) {
            if(!mousedown_node || d === mousedown_node) return;
            // enlarge target node
            d3.select(this).attr('transform', 'scale(1.1)');
        })
        .on('mouseout', function(d) {
            if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            d3.select(this).attr('transform', '');
        })
        .on('mousedown', function(d) {
            if(d3.event.ctrlKey) return;
             // select node
            mousedown_node = d;
            if(mousedown_node === selected_node) {  //node 선택 해제
                selected_node = null;
                var nodeNameTableHtml = "";
                d3.select("#nameTable").html(nodeNameTableHtml);
            }
            else {  //node 선택
                selected_node = mousedown_node;
                var nodeNameTableHtml = "";
                nodeNameTableHtml += '    <tr>';
                nodeNameTableHtml += '        <td><input type="text" id="nodeName" value="' + selected_node.name + '"/></td>';
                nodeNameTableHtml += '        <td><input id="nameBtn" type="button" value="변경"/></td>';
                nodeNameTableHtml += '    </tr>';
                d3.select("#nameTable").html(nodeNameTableHtml);
            }
            selected_link = null;
             // reposition drag line
            drag_line
                .style('marker-end', 'url(#end-arrow)')
                .classed('hidden', false)
                .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
             restart();
        })
        .on('mouseup', function(d) {
            if(!mousedown_node) return;
             // needed by FF
            drag_line
                .classed('hidden', true)
                .style('marker-end', '');
             // check for drag-to-self
            mouseup_node = d;
            if(mouseup_node === mousedown_node) { resetMouseVars(); return; }
             // unenlarge target node
            d3.select(this).attr('transform', '');
             // add link to graph (update if exists)
            // NB: links are strictly source < target; arrows separately specified by booleans
            var source, target, direction;
            if(mousedown_node.id < mouseup_node.id) {
                source = mousedown_node;
                target = mouseup_node;
                direction = 'right';
            } else {
                source = mouseup_node;
                target = mousedown_node;
                direction = 'left';
            }
             var link;
            link = links.filter(function(l) {
                return (l.source === source && l.target === target);
            })[0];
             if(link) {
                link[direction] = true;
            } else {
                link = {source: source, target: target, left: false, right: false};
                link[direction] = true;
                links.push(link);
            }
             // select new link
            selected_link = link;
            selected_node = null;
            restart();
        });
    // show node IDs
    g.append('svg:text')
       .attr('x', 0)
       .attr('y', 4)
       .attr('class', 'id')
       .text(function(d) { return d.name; });
//    g.on("mouseover", function (d) {
//            d3.select(this).select('text')
//              .text(function(d){return d.name;});
//        });
    // remove old nodes
    gNodes.exit().remove();
    // set the graph in motion
    force.start();
}

function insertNewNode(nodeId, name, x, y) {
        var node = {id: nodeId, name: name, reflexive: false, fixed:true};  // fixed : 고정
        node.x = x;
        node.y = y;

        nodes.push(node);
}

function mousedown() {
    // prevent I-bar on drag
    //d3.event.preventDefault();
    // because :active only works in WebKit?
    svg.classed('active', true);
    if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

    // insert new node at point
    var point = d3.mouse(this);
    insertNewNode(++lastNodeId, "label", point[0], point[1]);
    restart();
}

function mousemove() {
    if(!mousedown_node) return;
    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
    restart();
}

function mouseup() {
    if(mousedown_node) {
        // hide drag line
        drag_line
            .classed('hidden', true)
            .style('marker-end', '');
    }
    // because :active only works in WebKit?
    svg.classed('active', false);
    // clear mouse event vars
    resetMouseVars();
}

function spliceLinksForNode(node) {
    var toSplice = links.filter(function(l) {
        return (l.source === node || l.target === node);
    });
    toSplice.map(function(l) {
        links.splice(links.indexOf(l), 1);
    });
}

// only respond once per keydown
var lastKeyDown = -1;

function keydown() {
//    d3.event.preventDefault();    //기본이벤트없애기

    if(lastKeyDown !== -1) return;
    lastKeyDown = d3.event.keyCode;
    // ctrl
    if(d3.event.keyCode === 17) {
        gNodes.call(force.drag);
        svg.classed('ctrl', true);
    }
    if((!selected_node && !selected_link) || focusNodeName) return;
    switch(d3.event.keyCode) {
        case 8: // backspace
        case 46: // delete
            if(selected_node) {
                nodes.splice(nodes.indexOf(selected_node), 1);
                spliceLinksForNode(selected_node);
            } else if(selected_link) {
                links.splice(links.indexOf(selected_link), 1);
            }
            selected_link = null;
            selected_node = null;
            restart();
            break;
        case 66: // B
            if(selected_link) {
                // set link direction to both left and right
                selected_link.left = true;
                selected_link.right = true;
            }
            restart();
            break;
        case 76: // L
            if(selected_link) {
                // set link direction to left only
                selected_link.left = true;
                selected_link.right = false;
            }
            restart();
            break;
        case 82: // R
            if(selected_node) {
                // toggle node reflexivity
                selected_node.reflexive = !selected_node.reflexive;
            } else if(selected_link) {
                // set link direction to right only
                selected_link.left = false;
                selected_link.right = true;
            }
            restart();
            break;
    }
}

function keyup() {
    lastKeyDown = -1;
    // ctrl
    if(d3.event.keyCode === 17) {
        gNodes
            .on('mousedown.drag', null)
            .on('touchstart.drag', null);
        svg.classed('ctrl', false);
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