
var m_sfc_list = [];
var fc_list = [];
var sfg_list = [];

var margin_x = 50;
var margin_y = 20;

var circle_r = 30;
var inout_r = 6;
var offset = 85;
var distance_text = 42;
var rect_padding = 30;

var drop_margin_y = 110;
var circle_margin_y = 168;

var max_item_no = 0;
var VM = "VM",
    ROUTER = "ROUTER",
    ADD = "add",
    RESUME = "resume",
    PAUSE = "pause",
    DELETE = "delete";

var width  = $("#vis").width() - 20;
var height = $("#vis").height() - 20;

//var svg = d3.select('#vis')
//    .append('svg')
//    .attr('oncontextmenu', 'return false;')
//    .attr('width', $("#vis").width())
//    .attr('height', height)
//    .attr('id', 'service');

var fc_menu = [
    { title: function(d) { return "FC Name : " + getValue(d.name); }},
    { title: function(d) { return "Resource Name : " + getValue(d.resource_name); }},
    { title: function(d) { return "Description : " + getValue(d.desc); }},
    { title: function(d) { return "Protocol : " + getValue(d.protocol); }},
    { title: function(d) { return "IP Version : " + getValue(d.ip_version); }},
    { title: function(d) { return "Source Port : " + getValue(d.src_port_min) + " ~ " + getValue(d.src_port_max); }},
    { title: function(d) { return "Destination Port : " + getValue(d.dst_port_min) + " ~ " + getValue(d.dst_port_max); }},
    { title: function(d) { return "Source IP Prefix : " + getValue(d.src_ip_prefix); }},
    { title: function(d) { return "Destination IP Prefix : " + getValue(d.dst_ip_prefix); }},
    { title: function(d) { return "Logical Source Port : " + getValue(d.logical_src_ip) + "(" + getValue(d.logical_src_port) + ")"; }},
    { title: function(d) { return "Logical Destination Port : " + getValue(d.logical_dst_port); }}
]

var sf_menu = [
    { title: function(d) { return "SFG Name : " + getValue(d.sfg_name); }},
    { title: function(d) { return "SFG Description : " + getValue(d.sfg_desc); }},
    { divider: true },
    { title: function(d) { return "SF Name : " + getValue(d.sf_name); }},
    { title: function(d) { return "SF Description : " + getValue(d.sf_desc); }},
    { title: function(d) { return "Ingress Port : " + getValue(d.ingress_ip) + "(" + getValue(d.ingress) + ")"; }},
    { title: function(d) { return "Egress Port : " + getValue(d.egress_ip) + "(" + getValue(d.egress) + ")"; }}
]

function getValue(value) {
	if(typeof value == 'undefined' || value == '' || value == 'null') {
	    return " - ";
	} else {
	    return value;
	}
}


$(document).ready(function() {


});

function initialize(sfc_list) {
//    initElements();
    m_sfc_list = sfc_list;
    for (var sfc_i = 0; sfc_i < sfc_list.length; sfc_i++) {
        if (typeof sfc_list[sfc_i].fc_list == "string") {
            sfc_list[sfc_i].fc_list = eval(sfc_list[sfc_i].fc_list.replace(/u\'/g, "'").replace(/True/g, "true").replace(/False/g, "false"));
        }
        if (typeof sfc_list[sfc_i].sfg_list == "string") {
            sfc_list[sfc_i].sfg_list = eval(sfc_list[sfc_i].sfg_list.replace(/u\'/g, "'").replace(/True/g, "true").replace(/False/g, "false"));
        }
    }
    drawSFC(sfc_list);
}

function initElements(svg) {
    var marker = svg.append('marker')
        .attr("id", "triangle")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", "0")
        .attr("refY", "5")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "4")
        .attr("fill", "#a1abc3")
        .attr("markerHeight", "6")
        .attr("orient", "auto");

    marker.append('path')
        .attr("d", "M 0 0 L 10 5 L 0 10 z");

	var defs = svg.append('svg:defs');

	defs.append("svg:pattern")
	    .attr("id", ROUTER)
	    .attr("width", 1)
	    .attr("height", 1)
	    .attr("patternContentUnits", "objectBoundingBox")
	    .append("svg:image")
	    .attr("xlink:href", '/static/img/service/topology/resource_router.png')
	    .attr("width", 1)
	    .attr("height", 1)
	    .attr("preserveAspectRatio", "xMinYMin");

	defs.append("svg:pattern")
	    .attr("id", VM)
	    .attr("width", 1)
	    .attr("height", 1)
	    .attr("patternContentUnits", "objectBoundingBox")
	    .append("svg:image")
	    .attr("xlink:href", '/static/img/service/topology/resource_virtualmachine.png')
	    .attr("width", 1)
	    .attr("height", 1)
	    .attr("preserveAspectRatio", "xMinYMin");

	defs.append("svg:pattern")
        .attr("id", RESUME)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternContentUnits", "objectBoundingBox")
        .append("svg:image")
        .attr("xlink:href", '/static/img/service/topology/play_icon.png')
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "xMinYMin");

	defs.append("svg:pattern")
        .attr("id", PAUSE)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternContentUnits", "objectBoundingBox")
        .append("svg:image")
        .attr("xlink:href", '/static/img/service/topology/pause_icon.png')
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "xMinYMin");

	defs.append("svg:pattern")
        .attr("id", DELETE)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternContentUnits", "objectBoundingBox")
        .append("svg:image")
        .attr("xlink:href", '/static/img/service/topology/delete_icon.png')
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "xMinYMin");
}

function getLengthList(sfc_list) {

    var length_list = [];

    for (var sfc_i = 0; sfc_i < sfc_list.length; sfc_i++) {

        var fc_list = sfc_list[sfc_i].fc_list;
        var sfg_list = sfc_list[sfc_i].sfg_list;
        var max_length = fc_list.length;

        for (var sfg_i = 0; sfg_i < sfg_list.length; sfg_i++) {
            var sfg = sfg_list[sfg_i];
            var sf_length = sfg.sf_list.length;
            if(max_length < sf_length) max_length = sf_length;
        }
        length_list.push(max_length);
    }
    return length_list;
}

function drawSFC(sfc_list) {

    var length_list = getLengthList(sfc_list);

    log("SFC Length : " + sfc_list.length);
    log(length_list);


    for (var sfc_i = 0; sfc_i < sfc_list.length; sfc_i++) {

        var sfc_id = sfc_list[sfc_i].sfc_id;
        var sfc_name = sfc_list[sfc_i].sfc_name;
        var sfc_status = sfc_list[sfc_i].sfc_status;

        var fc_list = sfc_list[sfc_i].fc_list;
        var sfg_list = sfc_list[sfc_i].sfg_list;

        var max_length = length_list[sfc_i];

        var svg = d3.select(".contents").append("svg")
        .attr("id", "svg" + sfc_i)
        .attr("width", 1280)
        .attr("height", 170 + (max_length * offset) + (margin_y * 2));
//        .attr("style", "background-color: #f1f1f1;");

        initElements(svg);

        // Title Zone
        var title_zone = svg.append('rect')
        .attr("id", "title_zone_" + sfc_i)
        .attr("class", "bgbox")
        .attr("fill", "white")
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", "1")
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("x", 0 + margin_x - 20)
        .attr("y", 0 + margin_y)
        .attr("height", 145 + (max_length * offset) + (margin_y * 2));

        // SFC Title
        svg.append('text')
        .attr("id", "fc_title")
        .attr("class", "sfc_title")
        .attr("fill", "#b0b5c9")
        .attr("x", 100 + margin_x)
        .attr("y", 40 + margin_y)
        .text(sfc_name);


        // FC Zone
        svg.append('rect')
        .attr("id", "fc_zone_" + sfc_i)
        .attr("class", "bgbox")
        .attr("fill", "white")
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", "1")
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("x", 0 + margin_x)
        .attr("y", 65 + margin_y)
        .attr("width", 240)
        .attr("height", offset + (max_length * offset) + 10);

        // FC Title
        svg.append('text')
        .attr("id", "fc_title")
        .attr("class", "sc_title")
        .attr("fill", "#b0b5c9")
//        .attr("font-weight", "bold")
//        .attr("font-size", 16)
        .attr("text-anchor", "middle")
        .attr("x", 120 + margin_x)
        .attr("y", 90 + margin_y)
        .text("Flow Classifiers");

        var fc_diff = max_length - fc_list.length;

        var fcg = svg.append('g')
	    .attr("id", "fc_group_" + sfc_i)
	    .attr("class", "fc_group")
	    .attr("transform", "translate(0," + fc_diff * (offset/2) +")"); // v_align

        var rectHeight = rect_padding + (fc_list.length * offset);
        var rectVCenter = drop_margin_y + (rectHeight/2) + margin_y;

        fcg.append('rect')
        .attr("id", "fc_rect")
        .attr("class", "fc_drop")
        .attr("fill", "#e3f0fc")
	    .attr("rx", 20)
    	.attr("ry", 20)
        .attr("x", 40 + margin_x)
        .attr("y", drop_margin_y + margin_y)
        .attr("width", 160)
        .attr("height", rectHeight);

        fcg.append('circle')
        .attr("class", "inout")
        .attr("fill", "#4b73eb")
        .attr("r", inout_r)
        .attr("cx", 200 + margin_x)
        .attr("cy", rectVCenter);

        var fg = fcg.selectAll('g').data(fc_list).enter();
        fg.append('circle')
        .attr("id", function(d, i) {
            return "fc_" + i;
        })
        .attr("class", "set-resource")
        .attr("r", 30)
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", "1")
        .attr("cx", 120 + margin_x) // 고정
        .attr("cy", function(d, i) {
           return  circle_margin_y + margin_y + (i * offset);
        })
        .attr("fill", function(d) {
            if(d.type == ROUTER) {
                return "url('#" + ROUTER + "')";
            } else if(d.type == VM) {
                return "url('#" + VM + "')";
            }
        })
        .on("click", d3.contextMenu(fc_menu));

        // 리소스 라벨
        fg.append('text')
        .attr("class", "func_txt")
        .attr("fill", "#4e515e")
        .attr("text-anchor", "middle")
        .attr("x", 120 + margin_x)
        .attr("y", function(d, i) {
            return distance_text + circle_margin_y + margin_y + (i * offset);
        })
        .text(function(d) {
            return d.name + " : " + d.resource_name;
        });

        var zone_width = (200 * sfg_list.length) + 40;
        if(zone_width < 600) zone_width = 600;

        title_zone.attr("width", zone_width + 300);

        // SFG Zone
        svg.append('rect')
        .attr("id", "sfg_zone")
        .attr("class", "bgbox")
        .attr("fill", "white")
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", "1")
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("x", 260 + margin_x)
        .attr("y", 65 + margin_y)
        .attr("width", zone_width) // min 600
        .attr("height", offset + (max_length * offset) + 10);

        // SFG Title
        svg.append('text')
        .attr("id", "sfg_title")
        .attr("class", "sc_title")
        .attr("fill", "#b0b5c9")
        .attr("text-anchor", "middle")
        .attr("x", 240 + (zone_width/2) + margin_x + 20)
        .attr("y", 90 + margin_y)
        .text("Service Function Groups");


        for (var sfg_i = 0; sfg_i < sfg_list.length; sfg_i++) {
            var sfg = sfg_list[sfg_i];

            var sfg_name = sfg.name;

            var sf_list = sfg.sf_list;

            for (var sf_i = 0; sf_i < sf_list.length; sf_i++) {
                var sf = sf_list[sf_i];
                sf.sfg_name = sfg.name;
                sf.sfg_desc = sfg.desc;
            }

            var sf_diff = max_length - sf_list.length;

            var g = svg.append('g')
            .attr("id", "sfg_" + sfg_i)
            .attr("transform", "translate(0," + sf_diff * (offset/2) +")"); // v_align


            var sfHeight = rect_padding + (sf_list.length * offset);
            var sfVCenter = drop_margin_y + (sfHeight/2) + margin_y;

            g.append('rect')
            .attr("id", "sfg_rect_" + sfg_i)
            .attr("class", "sf_drop")
            .attr("fill", "#e3f0fc")
            .attr("rx", 20)
            .attr("ry", 20)
            .attr("x", 300 + (200 * sfg_i) + margin_x)
            .attr("y", drop_margin_y + margin_y)
            .attr("width", 160)
            .attr("height", sfHeight);

            g.append('text')
            .attr("class", "func_txt")
            .attr("fill", "#4e515e")
            .attr("text-anchor", "middle")
            .attr("x", 300 + (200 * sfg_i) + margin_x + 80)
            .attr("y", drop_margin_y + margin_y + 20)
            .text(sfg_name);

            var gc = g.selectAll('g').data(sf_list).enter();
            gc.append('circle')
            .attr("id", function(d, i) {
                return "sf_" + sfg_i + "_" + i;
            })
            .attr("class", "set-resource")
            .attr("r", 30)
            .attr("stroke", "#d2d3d4")
            .attr("stroke-width", "1")
            .attr("cx", 380 + (200 * sfg_i) + margin_x)
            .attr("cy", function(d, i) {
               return  circle_margin_y + (i * offset) + margin_y;
            })
            .attr("fill", "url('#" + VM + "')")
            .on("click", d3.contextMenu(sf_menu));

            // 리소스 라벨
            gc.append('text')
            .attr("class", "func_txt")
            .attr("fill", "#4e515e")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) {
                return 380 + (200 * sfg_i) + margin_x;
            })
            .attr("y", function(d, i) {
                return distance_text + circle_margin_y + margin_y + (i * offset);
            })
            .text(function(d) {
                return d.sf_name;
            });


            gc.append('circle')
            .attr("class", "inout")
            .attr("fill", "#4b73eb")
            .attr("r", inout_r)
            .attr("cx", function() {
                return 300 + (200 * sfg_i) +margin_x;
            })
            .attr("cy", sfVCenter);

            // 마지막이면 표시하지 않음
            if(sfg_i < sfg_list.length - 1) {
                // SF out
                gc.append('circle')
                .attr("class", "inout")
                .attr("fill", "#4b73eb")
                .attr("r", inout_r)
                .attr("cx", 460 + (200 * sfg_i) +margin_x)
                .attr("cy", sfVCenter);

                // SFG Add arrow
                gc.append('line')
                .attr("class", "arrow")
                .attr("fill", "#a1abc3")
                .attr("stroke", "#d2d3d4")
                .attr("stroke-width", 2)
                .attr("x1", 460 + (200 * sfg_i) +margin_x)
                .attr("y1", sfVCenter)
                .attr("x2", 485 + (200 * sfg_i) +margin_x)
                .attr("y2", sfVCenter)
                .attr("marker-end", "url(#triangle)");
            }
        }

        // FC to SFG arrow
        fcg.append('line')
        .attr("class", "arrow")
        .attr("fill", "#a1abc3")
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", 2)
        .attr("x1", 200 + margin_x)
        .attr("y1", rectVCenter)
        .attr("x2", 285 + margin_x)
        .attr("y2", rectVCenter)
        .attr("marker-end", "url(#triangle)");

        d3.selectAll('.fc_group').moveToFront();

        if(sfc_status == 'PAUSED') {
            svg.append('circle')
                .attr("class", "exec_btn")
                .attr("r", 18)
                .attr("stroke", "#d2d3d4")
                .attr("stroke-width", 1)
                .attr("fill", "url('#" + RESUME + "')")
                .attr("cx", 70)
                .attr("cy", 35 + margin_y)
                .attr("type", "resume")
                .attr("sfc_name", sfc_name)
                .on("click", function(d) {
                    execSFC(d3.select(this).attr("type"), d3.select(this).attr("sfc_name"), d3.select(this).attr("sfc_name"));
                });
        } else {
            svg.append('circle')
                .attr("class", "exec_btn")
                .attr("r", 18)
                .attr("stroke", "#d2d3d4")
                .attr("stroke-width", 1)
                .attr("fill", "url('#" + PAUSE + "')")
                .attr("cx", 70)
                .attr("cy", 35 + margin_y)
                .attr("type", "pause")
                .attr("sfc_id", sfc_id)
                .attr("sfc_name", sfc_name)
                .on("click", function(d) {
                    execSFC(d3.select(this).attr("type"), d3.select(this).attr("sfc_id"), d3.select(this).attr("sfc_name"));
                });
        }

        svg.append('circle')
        .attr("sfc_id", sfc_id)
        .attr("class", "exec_btn")
        .attr("r", 18)
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", 1)
        .attr("fill", "url('#delete')")
        .attr("cx", 112)
        .attr("cy", 35 + margin_y)
        .attr("type", "delete")
        .attr("sfc_id", sfc_id)
        .attr("sfc_name", sfc_name)
        .on("click", function(d) {
            execSFC(d3.select(this).attr("type"), d3.select(this).attr("sfc_id"), d3.select(this).attr("sfc_name"));
        });
	}
	d3.selectAll('circle').moveToFront();
}

function execSFC(order, sfc_id, sfc_name) {

    log("execSFC " + order + ", " + sfc_id);

    var msg ="";

    if(order == 'delete') {
        msg += "삭제 하시겠습니까?"
    } else if(order == 'pause') {
        msg += "일시정지 하시겠습니까?"
    } else if(order == 'resume') {
        msg += "재시작 하시겠습니까?"
    }

    U.alert({
       title : sfc_name,
       message : msg,
       result : function(result) {
           if(result) {
               U.ajax({
                progress : true,
                url : 'exec',
                data : {
                    'order' : order,
                    'sfc_id' : sfc_id
                },
                success : function(result) {
                    logobj(order + " result", result);
                    if(result.success) {
                        location.reload(true);
                    } else if(result.error) {
                        U.lobibox(result.error.message, "error");
                    } else {
                        U.msg("작업 중 오류가 발생하여 완료되지 않았습니다");
                    }
                }
            });
           }
       }
   });

//      $.ajax({
//        type:"POST",
//        url : 'exec',
//        data : {
//            'order' : order
//         },
//        success:function(result){
//            logobj(order + " result", result);
//            if(result.success) {
//
//            }
//        }
//    });

}


function drawFC(fc_list, sfc_i) {

    for (var fc_i = 0; fc_i < fc_list.length; fc_i++) {
        var fc = fc_list[fc_i];

    }
}

function drawSFG(sfg_list, sfc_i) {

    for (var sfg_i = 0; sfg_i < sfg_list.length; sfg_i++) {
        var sfg = sfg_list[sfg_i];
    }


   // SFG Zone
        d3.select('svg').append('rect')
        .attr("id", "sfg_zone")
        .attr("class", "bgbox")
        .attr("fill", "white")
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", "1")
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("x", 260 + margin_x)
        .attr("y", 0 + margin_y)
        .attr("width", 600)
        .attr("height", 500);

        // SFG Title
        d3.select('svg').append('text')
        .attr("id", "sfg_title")
        .attr("class", "sc_title")
        .attr("fill", "#b0b5c9")
//        .attr("font-weight", "bold")
//        .attr("font-size", 16)
        .attr("text-anchor", "middle")
        .attr("x", 560 + margin_x)
        .attr("y", 30 + margin_y)
        .text("Service Function Groups");

}


function log(str) {
    if(debug)
        console.debug(str);
}

function logobj(title, obj) {
    if(debug) {
        console.info(title);
        console.info(obj);
    }
}

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
