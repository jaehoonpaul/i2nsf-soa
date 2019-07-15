var svgSFC = d3.select('#vis')
    .append('svg')
    .attr('oncontextmenu', 'return false;')
    .attr('width', $("#vis").width() - 20)
    .attr('height', 800)
    .attr('id', 'sfc');
var fc_list = [];
var sfg_list = [];

var margin_x = 10;
var margin_y = 0;

var circle_r = 30;
var inout_r = 6;
var offset = 110;
var distance_text = 50;
var rect_padding = 20;

var drop_margin_y = 125;
var circle_margin_y = 140;


var max_length = 0;

var RESOURCE_VM = "VM",
    RESOURCE_ROUTER = "ROUTER",
    ADD = "add";

$(document).ready(function() {
    U.showProgress();
	initialize();

    $("#createSFC").on("click", function(){
        showSFCModal();
    });

    $("#showTopology").on("click", function(){
        showTopologyModal();
    });

    $("#confirmSFC").on("click", function(){
        var sfc_name = $("#sfc_name").val();
        var sfc_desc = $("#sfc_desc").val();

        for(var i = 0; i < sfg_list.length; i++) {
            var sfg = sfg_list[i];
            var sfg_name = $("#sfgname"+i).val();
            var sfg_desc = $("#sfgname"+i).val();
            sfg.name = sfg_name;
            sfg.desc = sfg_desc;
        }
        createSFC(sfc_name, sfc_desc);
    });

    $("#showTopology").trigger("click");
    $("#showTopologyModal .pop_cancel_bt_img01").trigger("click");
    setTimeout(function() { U.hideProgress(); }, 300);
});

function loadChainingCookie() {
    log("loadChainingCookie()");

    var fc_list_str = getCookie("fc_list");
    var sfg_list_str = getCookie("sfg_list");

    if(fc_list_str != '') {
        fc_list = JSON.parse(fc_list_str);
        logobj("fc_list", fc_list);
    } else {
        log("fc_list is empty");
    }

    if(sfg_list_str != '') {
        sfg_list = JSON.parse(sfg_list_str);
        logobj("sfg_list", sfg_list);
    } else {
        log("sfg_list is empty");
    }
}

function saveChainingCookie() {
    setCookie("fc_list", JSON.stringify(fc_list));
    setCookie("sfg_list", JSON.stringify(sfg_list));
}

function deleteChainingCookie() {
    deleteCookie("fc_list");
    deleteCookie("sfg_list");
}


function showSFCModal() {

    $("#sfc_name").val("");
    $("#sfc_desc").val("");

    $("#sfg_desc_list").children().remove();
    for(var i = 0; i < sfg_list.length; i++) {
        var item = $("#sfg_desc_tmpl").clone().removeAttr("id").show();
        item.children(".sfgname").html('<img class="chaining_br_img" src="/static/img/common/br_img_03.png" alt="#"> 서비스기능그룹 #' + (i+1));
//            item.children().children(".sfgname").text("서비스기능그룹 #" + (i+1));
//            item.children().children(".sfgdesc").text("SFG" + (i+1) + " 설명");
        item.children().children(".sfgname_input").attr("id", "sfgname"+i);
        item.children().children(".sfgdesc_input").attr("id", "sfgdesc"+i);
        $("#sfg_desc_list").append(item);
    }

   	$('#showSFCModal').modal('toggle');
}

function showTopologyModal() {
   	$('#showTopologyModal').modal({backdrop:false, show:true});
   	$('.modal-container').draggable({
      handle: ".modal_header"
    });
}


function createSFC(sfc_name, sfc_desc) {
    log("createSFC()");
    logobj("fc_list", fc_list);
    logobj("sfg_list", sfg_list);

    U.ajax({
        progress : true,
        url : 'save',
        data : {
            'fc_list' : JSON.stringify(fc_list),
            'sfg_list' : JSON.stringify(sfg_list),
            'sfc_name' : sfc_name,
            'sfc_desc' : sfc_desc
         },
        success:function(result){
            logobj("result", result);
            if(result.success) {
                deleteChainingCookie();
                var urlStr = $(location).attr('pathname');
                var match = new RegExp("/dashboard/service/([\\w-]+)/.+").exec(urlStr);
                var service_id = match[1];
                if(typeof serviceDetailFromPost == "undefined") {
                    location.replace("/dashboard/service/" +service_id + "/chaining");
                } else {
                    postMove("/dashboard/service/" +service_id + "/chaining/", JSON.stringify(serviceDetailFromPost));
                }
            } else if(result.error) {
                U.lobibox(result.error.message, "error");
            } else {
                U.lobibox("작업 중 오류가 발생하여 완료되지 않았습니다", "error");
            }
        }
    });
}

function initialize() {

    initElements();
    loadChainingCookie();
//    deleteChainingCookie();

    if(fc_list.length > 0 || sfg_list.length > 0) {
        log("drawSFC()");
        drawSFC();
    } else {
        log("drawDefaultSFC()");
        drawDefaultSFC();
    }

//    initTest();

//    drawDefaultSFC();
}

function initElements() {
    // define arrow markers for graph links
    var defs = svgSFC.append('svg:defs');
    var svgPatternStr = "";
    svgPatternStr += 'defs.append("svg:pattern")';
    svgPatternStr += '.attr("id", "%T")';
    svgPatternStr += '.attr("width", 1).attr("height", 1)';
    svgPatternStr += '.attr("patternContentUnits", "objectBoundingBox")';
    svgPatternStr += '.append("svg:image")';
    svgPatternStr += '.attr("xlink:href", \'/static/img/service/topology/%T.png\')';
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
    eval(svgPatternStr.replace("%T", FW).replace("%T", "resource_fw"));
    eval(svgPatternStr.replace("%T", IPS).replace("%T", "resource_ips"));
    eval(svgPatternStr.replace("%T", DLP).replace("%T", "resource_dlp"));

    var marker = svgSFC.append('marker')
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

	var defs = svgSFC.append('svgSFC:defs');

	defs.append("svgSFC:pattern")
	    .attr("id", RESOURCE_ROUTER)
	    .attr("width", 1)
	    .attr("height", 1)
	    .attr("patternContentUnits", "objectBoundingBox")
	    .append("svgSFC:image")
	    .attr("xlink:href", '/static/img/service/topology/resource_router.png')
	    .attr("width", 1)
	    .attr("height", 1)
	    .attr("preserveAspectRatio", "xMinYMin");

	defs.append("svgSFC:pattern")
	    .attr("id", RESOURCE_VM)
	    .attr("width", 1)
	    .attr("height", 1)
	    .attr("patternContentUnits", "objectBoundingBox")
	    .append("svgSFC:image")
	    .attr("xlink:href", '/static/img/service/topology/resource_virtualmachine.png')
	    .attr("width", 1)
	    .attr("height", 1)
	    .attr("preserveAspectRatio", "xMinYMin");

	defs.append("svgSFC:pattern")
	.attr("id", ADD)
	.attr("width", 1)
	.attr("height", 1)
	.attr("patternContentUnits", "objectBoundingBox")
	.append("svgSFC:image")
	.attr("xlink:href", '/static/img/service/topology/plus_icon_01.png')
	.attr("width", 1)
	.attr("height", 1)
	.attr("preserveAspectRatio", "xMinYMin");

}

function drawSFC() {
	// FC Zone
	svgSFC.append('rect')
	.attr("id", "fc_zone")
	.attr("class", "bgbox")
	.attr("fill", "white")
	.attr("stroke", "#d2d3d4")
	.attr("stroke-width", "1")
	.attr("rx", 30)
	.attr("ry", 30)
	.attr("x", 0 + margin_x)
	.attr("y", 0 + margin_y)
	.attr("width", 240)
	.attr("height", 260);

	// FC Title
	svgSFC.append('text')
	.attr("id", "fc_title")
	.attr("class", "sc_title")
	.attr("fill", "#b0b5c9")
//	.attr("font-weight", "bold")
//	.attr("font-size", 16)
	.attr("text-anchor", "middle")
	.attr("x", 120 + margin_x)
	.attr("y", 30 + margin_y)
	.text("Flow Classifiers");

	// SFG Zone
	svgSFC.append('rect')
	.attr("id", "sfg_zone")
	.attr("class", "bgbox")
	.attr("fill", "white")
	.attr("stroke", "#d2d3d4")
	.attr("stroke-width", "1")
	.attr("rx", 30)
	.attr("ry", 30)
	.attr("x", 260 + margin_x)
	.attr("y", 0 + margin_y)
	.attr("width", function() {
	    if(sfg_list.length > 1) {
	        return 400 + (200 * (sfg_list.length-1));
	    } else {
	        return 600;
	    }
	})
	.attr("height", 260);

	// SFG Title
	svgSFC.append('text')
	.attr("id", "sfg_title")
	.attr("class", "sc_title")
	.attr("fill", "#b0b5c9")
//	.attr("font-weight", "bold")
//	.attr("font-size", 16)
	.attr("text-anchor", "middle")
	.attr("x", 560 + margin_x)
	.attr("y", 30 + margin_y)
	.text("Service Function Groups");

	// FC Group
	var g = svgSFC.append('g')
	.attr("id", "fc_group");



    var fc_length = fc_list.length;

    var fcRectHeight = 160 + ((fc_length) * offset);
    var fcRectVCenter = 60 + (fcRectHeight/2) + margin_y;

    log(fcRectHeight);


	g.append('rect')
	.attr("id", "fc_rect")
	.attr("class", "fc_drop")
	.attr("fill", "#e3f0fc")
	.attr("rx", 20)
	.attr("ry", 20)
	.attr("x", 40 + margin_x)
	.attr("y", 60 + margin_y)
	.attr("width", 160)
	.attr("height", fcRectHeight);


	// FC Add Button
	g.append('circle')
	.attr("id", "addfc")
	.attr("class", "btn-add")
	.attr("fill", 'url("#add")')
	.attr("cx", 120 + margin_x)
	.attr("cy", circle_margin_y + margin_y + ((fc_length) * offset))
	.attr("r", circle_r)
    .attr("stroke", "#d2d3d4")
    .attr("stroke-width", 1);


///////////////

    // FC out
	var fc_out = g.append('circle')
	.attr("class", "inout")
	.attr("fill", "#4b73eb")
    .attr("r", inout_r)
	.attr("cx", 200 + margin_x)
	.attr("cy", fcRectVCenter);


    for (var i = 0; i < fc_list.length; i++) {

        var fc = fc_list[i];

        var g = d3.select('#fc_group').append('g')
        .attr("id", "fc_g_" + i)
        .attr("class", "rgroup");

        var circle = g.append('circle')
        .attr("id", "fc_"+i)
        .attr("class", "set-resource")
        .attr("r", circle_r)
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", "1")
        .attr("fill", "url('#" + ((fc.security) ? fc.security_type : fc.type) + "')")
		.attr("cx", 120 + margin_x) // 고정
		.attr("cy", circle_margin_y + margin_y + (i * offset)) // length에 따라
		.attr("data-toggle", "popover");

        g.append('text')
    	.attr("class", "res_txt")
    	.attr("fill", "#4e515e")
        .attr("text-anchor", "middle")
    	.attr("x", 120 + margin_x)
    	.attr("y", distance_text + circle_margin_y + margin_y + (i * offset))
    	.text(fc.resource_name);;


        if(typeof fc.egress_ip != 'undefined' && fc.egress_ip != '') {
             var out = d3.select("#fc_group").select(".inout");

                d3.select("#fc_g_" + i).append('line')
                .attr("class", "arrow egress")
                .attr("fill", "#a1abc3")
                .attr("stroke", "#d2d3d4")
                .attr("stroke-width", 2)
                .attr("x1", 120 + margin_x)
                .attr("y1", circle.attr("cy"))
                .attr("x2", fc_out.attr("cx"))
                .attr("y2", fc_out.attr("cy")) ;
        }

        initPopover(fc, circle);
    }

//var sf = {sf_name: data.name, sf_desc: '', resource_id: data.id};

////////////



	// ** x1: 출발지 원 cx보다 8크게, x2: 목적지 원 cx보다 15적게

	// FC to SFG arrow
	g.append('line')
	.attr("class", "arrow")
	.attr("fill", "#a1abc3")
    .attr("stroke", "#d2d3d4")
    .attr("stroke-width", 2)
	.attr("x1", 205 + margin_x)
	.attr("y1", fcRectVCenter)
	.attr("x2", 285 + margin_x)
	.attr("y2", fcRectVCenter)
	.attr("marker-end", "url(#triangle)");


    for (var sfg_i = 0; sfg_i < sfg_list.length; sfg_i++) {
        var sf_list = sfg_list[sfg_i].sf_list;
        var sf_length = sf_list.length;

        var sfRectHeight = 160 + ((sf_length) * offset);
        var sfRectVCenter = 60 + (sfRectHeight/2) + margin_y;

        // SF Group
        g = svgSFC.append('g')
        .attr("id", "sfg_" + sfg_i);

        g.append('rect')
        .attr("id", "sfg_rect_" + sfg_i)
        .attr("class", "sf_drop")
        .attr("fill", "#e3f0fc")
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("x", 300 + (200 * sfg_i) + margin_x)
        .attr("y", 60 + margin_y)
        .attr("width", 160)
        .attr("height", sfRectHeight);

        // SF in
        var sf_in = g.append('circle')
        .attr("class", "inout")
        .attr("fill", "#4b73eb")
        .attr("r", inout_r)
        .attr("cx", 300 + (200 * sfg_i) +margin_x)
        .attr("cy", sfRectVCenter);

        // SF out
        var sf_out = g.append('circle')
        .attr("class", "inout")
        .attr("fill", "#4b73eb")
        .attr("r", inout_r)
        .attr("cx", 460 + (200 * sfg_i) +margin_x)
        .attr("cy", sfRectVCenter);

        // SFG Add arrow
        g.append('line')
        .attr("class", "arrow")
        .attr("fill", "#a1abc3")
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", 2)
        .attr("x1", 465 + (200 * sfg_i) +margin_x)
        .attr("y1", sfRectVCenter)
        .attr("x2", 485 + (200 * sfg_i) +margin_x)
        .attr("y2", sfRectVCenter)
        .attr("marker-end", "url(#triangle)");

        for (var sf_i = 0; sf_i < sf_list.length; sf_i++) {

            var sf = sf_list[sf_i];

            var sf_name = sf.sf_name;
            var ingress = sf.ingress;
            var ingress_ip = sf.ingress_ip;
            var egress = sf.egress;
            var egress_ip = sf.egress_ip;

            var circle = g.append('circle')
                .attr("id", "sf_" + sfg_i + "_" + sf_i)
                .attr("class", "set-resource")
                .attr("r", circle_r)
                .attr("stroke", "#d2d3d4")
                .attr("stroke-width", "1")
                .attr("fill", "url('#" + ((sf.security) ? sf.security_type : "VM") + "')")
                .attr("cx", 380 + (200 * sfg_i) + margin_x) // group_i에 따라 변경
                .attr("cy", circle_margin_y + (sf_i * offset) + margin_y) // length에 따라
                .attr("data-toggle", "popover");

            // 리소스 라벨
            g.append('text')
            .attr("class", "res_txt")
            .attr("fill", "#4e515e")
    //        .attr("font-weight", "bold")
    //        .attr("font-size", 14)
            .attr("text-anchor", "middle")
            .attr("x", 380 + (200 * sfg_i) + margin_x)
            .attr("y", distance_text + circle_margin_y + (sf_i * offset) + margin_y)
            .text(sf_name);


            if(typeof sf.ingress_ip != 'undefined' && sf.ingress_ip != '') {
                g.append('line')
                .attr("class", "arrow ingress")
                .attr("fill", "#a1abc3")
                .attr("stroke", "#d2d3d4")
                .attr("stroke-width", 2)
                .attr("x1", sf_in.attr("cx"))
                .attr("y1", sf_in.attr("cy"))
                .attr("x2", circle.attr("cx"))
                .attr("y2", circle.attr("cy"));
            }

            if(typeof sf.egress_ip != 'undefined' && sf.egress_ip != '') {
                g.append('line')
                .attr("class", "arrow ingress")
                .attr("fill", "#a1abc3")
                .attr("stroke", "#d2d3d4")
                .attr("stroke-width", 2)
                .attr("x1", circle.attr("cx"))
                .attr("y1", circle.attr("cy"))
                .attr("x2", sf_out.attr("cx"))
                .attr("y2", sf_out.attr("cy"));
            }

            sf.resource_name = sf.sf_name;
            sf.type = 'VM';

            initPopover(sf, circle);
        }

        g.append('circle')
            .attr("id", "addsf_" + sfg_i)
            .attr("class", "btn-add")
            .attr("fill", 'url("#add")')
            .attr("cx", 380 + (200 * sfg_i) +margin_x)
            .attr("cy", circle_margin_y + margin_y + ((sf_length) * offset))
            .attr("r", circle_r)
            .attr("stroke", "#d2d3d4")
            .attr("stroke-width", 1);

        if(sfg_i == sfg_list.length - 1) {
            // SFG Add button
            g.append('circle')
            .attr("id", "add_group")
            .attr("class", "btn-add")
            .attr("fill", 'url("#add")')
            .attr("cx", 540 + (200 * sfg_i) +margin_x)
            .attr("cy", sfRectVCenter)
            .attr("r", circle_r)
            .attr("stroke", "#d2d3d4")
            .attr("stroke-width", 1)
            .on("click", function(){
                addSFG();
            });
        }
    }



// sfg width변경

    d3.selectAll('circle').moveToFront();
    d3.selectAll('text').moveToFront();
    alignVertical(0, false);
}


function drawDefaultSFC() {
	// FC Zone
	svgSFC.append('rect')
	.attr("id", "fc_zone")
	.attr("class", "bgbox")
	.attr("fill", "white")
	.attr("stroke", "#d2d3d4")
	.attr("stroke-width", "1")
	.attr("rx", 30)
	.attr("ry", 30)
	.attr("x", 0 + margin_x)
	.attr("y", 0 + margin_y)
	.attr("width", 240)
	.attr("height", 260);

	// FC Title
	svgSFC.append('text')
	.attr("id", "fc_title")
	.attr("class", "sc_title")
	.attr("fill", "#b0b5c9")
//	.attr("font-weight", "bold")
//	.attr("font-size", 16)
	.attr("text-anchor", "middle")
	.attr("x", 120 + margin_x)
	.attr("y", 30 + margin_y)
	.text("Flow Classifiers");

	// SFG Zone
	svgSFC.append('rect')
	.attr("id", "sfg_zone")
	.attr("class", "bgbox")
	.attr("fill", "white")
	.attr("stroke", "#d2d3d4")
	.attr("stroke-width", "1")
	.attr("rx", 30)
	.attr("ry", 30)
	.attr("x", 260 + margin_x)
	.attr("y", 0 + margin_y)
	.attr("width", 600)
	.attr("height", 260);

	// SFG Title
	svgSFC.append('text')
	.attr("id", "sfg_title")
	.attr("class", "sc_title")
	.attr("fill", "#b0b5c9")
//	.attr("font-weight", "bold")
//	.attr("font-size", 16)
	.attr("text-anchor", "middle")
	.attr("x", 560 + margin_x)
	.attr("y", 30 + margin_y)
	.text("Service Function Groups");

	// FC Group
	var g = svgSFC.append('g')
	.attr("id", "fc_group");

	g.append('rect')
	.attr("id", "fc_rect")
	.attr("class", "fc_drop")
	.attr("fill", "#e3f0fc")
	.attr("rx", 20)
	.attr("ry", 20)
	.attr("x", 40 + margin_x)
	.attr("y", 60 + margin_y)
	.attr("width", 160)
	.attr("height", 160);

	// FC Add Button
	g.append('circle')
	.attr("id", "addfc")
	.attr("class", "btn-add")
	.attr("fill", 'url("#add")')
	.attr("cx", 120 + margin_x)
	.attr("cy", circle_margin_y + margin_y)
	.attr("r", circle_r)
    .attr("stroke", "#d2d3d4")
    .attr("stroke-width", 1);

	// FC out
	g.append('circle')
	.attr("class", "inout")
	.attr("fill", "#4b73eb")
    .attr("r", inout_r)
	.attr("cx", 200 + margin_x)
	.attr("cy", 140 + margin_y);

	// ** x1: 출발지 원 cx보다 8크게, x2: 목적지 원 cx보다 15적게

	// FC to SFG arrow
	g.append('line')
	.attr("class", "arrow")
	.attr("fill", "#a1abc3")
    .attr("stroke", "#d2d3d4")
    .attr("stroke-width", 2)
	.attr("x1", 205 + margin_x)
	.attr("y1", 140 + margin_y)
	.attr("x2", 285 + margin_x)
	.attr("y2", 140 + margin_y)
	.attr("marker-end", "url(#triangle)");

// SF Group
	g = svgSFC.append('g')
	.attr("id", "sfg_0");

	g.append('rect')
	.attr("id", "sfg_rect_0")
	.attr("class", "sf_drop")
	.attr("fill", "#e3f0fc")
    .attr("rx", 20)
    .attr("ry", 20)
    .attr("x", 300 + margin_x)
    .attr("y", 60 + margin_y)
    .attr("width", 160)
    .attr("height", 160);

	// SF Add Button
	g.append('circle')
	.attr("id", "addsf_0")
	.attr("class", "btn-add")
	.attr("fill", 'url("#add")')
	.attr("cx", 380 + margin_x)
    .attr("cy", circle_margin_y + margin_y)
    .attr("r", circle_r)
    .attr("stroke", "#d2d3d4")
    .attr("stroke-width", 1);

	// SF in
	g.append('circle')
	.attr("class", "inout")
    .attr("fill", "#4b73eb")
    .attr("r", inout_r)
	.attr("cx", 300 + margin_x)
	.attr("cy", circle_margin_y + margin_y);

	// SFG Add arrow
	g.append('line')
	.attr("class", "arrow")
	.attr("fill", "#a1abc3")
    .attr("stroke", "#d2d3d4")
    .attr("stroke-width", 2)
	.attr("x1", 465 + margin_x)
	.attr("y1", circle_margin_y + margin_y)
	.attr("x2", 485 + margin_x) //500
	.attr("y2", circle_margin_y + margin_y)
	.attr("marker-end", "url(#triangle)");

	// SF out
	g.append('circle')
	.attr("class", "inout")
    .attr("fill", "#4b73eb")
    .attr("r", inout_r)
	.attr("cx", 460 + margin_x)
	.attr("cy", circle_margin_y + margin_y);

	var sfg = {};
	var sf_list = [];
	sfg.sf_list = sf_list;
	sfg_list.push(sfg);

	// SFG Add button
	g.append('circle')
	.attr("id", "add_group")
	.attr("class", "btn-add")
	.attr("fill", "url('#" + ADD + "')")
	.attr("cx", 540 + margin_x)
	.attr("cy", circle_margin_y + margin_y)
	.attr("r", circle_r)
    .attr("stroke", "#d2d3d4")
    .attr("stroke-width", 1)
	.on("click", function(){
		addSFG();
	});;

}

function initTest() {

//	for (var int = 0; int < 5; int++) {
//		svgSFC.append('circle')
//		.attr("id", "resource")
//		.attr("class", "btn-resource draggable")
//		.attr("cx", 200 + margin_x)
//		.attr("cy", 40 + margin_y)
//		.attr("type", NETWORK)
//		.attr("fill", 'url("#network")');
//	}
//	for (var int = 0; int < 5; int++) {
//		svgSFC.append('circle')
//		.attr("id", "resource")
//		.attr("class", "btn-resource draggable")
//		.attr("cx", 240 + margin_x)
//		.attr("cy", 60 + margin_y)
//		.attr("type", ROUTER)
//		.attr("fill", "url('#" + ROUTER + "')");
//	}
	for (var int = 0; int < 5; int++) {
		svgSFC.append('circle')
		.attr("id", "resource")
		.attr("class", "btn-resource draggable fc_resource")
		.attr("cx", 220 + margin_x)
		.attr("cy", 120 + margin_y)
		.attr("type", VM)
		.attr('r', 40)
        .attr('stroke', '#d2d3d4')
        .attr('stroke-width', 1)
		.attr("fill", "url('#" + VM + "')");
	}
}

function initPopover(data, target) {

  var ip_list = [];

//    log(data.id);

    U.ajax({
        url : 'ports',
        data : {
            'resource_id' : data.resource_id,
            'resource_type' : data.type == RESOURCE_ROUTER ? RESOURCE_ROUTER : 'SERVER'
         },
        success:function(result) {

//            logobj("ports result", result);

            var port_list = result.success.ports;
            for (var port_i = 0; port_i < port_list.length; port_i++) {
                var port = port_list[port_i];
                var id = port.id;
                var fixed_ip_list = port.fixed_ips;

                for (var ip_i = 0; ip_i < fixed_ip_list.length; ip_i++) {
                    var fixed_ip = fixed_ip_list[ip_i];
                    var ip = {'id':id, 'address' : fixed_ip.ip_address};
                    ip_list.push(ip);
                }
            }
            setPopover(data, ip_list, target);
        }
    });
}

function setPopover(data, ip_list, target) {

	$(target).popover({
	    html: true,
		content: function() {
			
			var id = $(this).attr("id");
//			log("id: " + id);
//			log(data);

            // Flow Classifiers
			if(id.indexOf('fc') > -1) {

//			logobj("setPopover data", data);
//			logobj("setPopover ip_list", ip_list);
//			logobj("setPopover ins ", instance_list.length);

				var div = $('#fc-popover-content');

                var div_name = div.children(".pop_name");
                var div_id = div.children("div").eq(1).children(".pop_id");
                var span_status = div.children("div").eq(2).children("div").eq(1).children(".pop_status");
//                var div_icon = div.children("div").eq(2).children("div").eq(1).children(".pop_status_icon");

                div_name.text(data.resource_name);
                div_id.text(data.resource_id);
//                span_status.text(data.data.status);

                div.children(".address_list").children().remove();
                div.children(".btn_remove").attr("onClick", "removeFC(" + id + ")");

                var num = id.split("_")[1];
                var fc = fc_list[num];

                var egress_ip = fc.egress_ip;

                for(var ip_i = 0; ip_i < ip_list.length; ip_i++) {
                    var ip = ip_list[ip_i];
                   var item = $("#fc_tmpl").clone().removeAttr("id").show();
                    item.children('.pop_ip').text(ip.address);
                    item.children('.btn_egress').attr("onClick", "egressFC(" + id + ",'" + ip.id + "','" + ip.address +"')");
                    if(egress_ip == ip.address) {
                        item.children('.btn_egress').addClass("chaining_pop02_d07_select01");
                    }
                    div.children(".address_list").append(item);
                }

				return $('#fc-popover-content').html();

			// Service Function Groups
			} else {

			    var div = $('#sf-popover-content');

                var div_name = div.children(".pop_name");
                var div_id = div.children("div").eq(1).children(".pop_id");
                var span_status = div.children("div").eq(2).children("div").eq(1).children(".pop_status");
//                var div_icon = div.children("div").eq(2).children("div").eq(1).children(".pop_status_icon");
                div_name.text(data.resource_name);
                div_id.text(data.resource_id);
//                span_status.text(data.data.status);

                div.children(".btn_remove").attr("onClick", "removeSF(" + id + ")");

                div.children(".address_list").children().remove();

                var group_i = id.split("_")[1];
                var sf_i = id.split("_")[2];
                var sf_list = sfg_list[group_i].sf_list;
                var sf = sf_list[sf_i];

                var ingress_ip = sf.ingress_ip;
                var egress_ip = sf.egress_ip;

                for(var ip_i = 0; ip_i < ip_list.length; ip_i++) {
                    var ip = ip_list[ip_i];
                   var item = $("#sf_tmpl").clone().removeAttr("id").show();
                    item.children('.pop_ip').text(ip.address);
                    if(ingress_ip == ip.address) {
                        item.children('.btn_ingress').addClass("chaining_pop02_d07_select01");
                    }
                    if(egress_ip == ip.address) {
                        item.children('.btn_egress').addClass("chaining_pop02_d07_select01");
                    }
                    item.children('.btn_ingress').attr("onClick", "ingressSF(" + id + ",'" + ip.id + "','" + ip.address +"',this)");
                    item.children('.btn_egress').attr("onClick", "egressSF(" + id + ",'" + ip.id + "','" + ip.address +"',this)");
                    div.children(".address_list").append(item);
                }

				return $('#sf-popover-content').html();
			}
		},
	    container: 'body'
	}).on('show.bs.popover', function() {
		var id = $(this).attr("id");
//		log(id + "-");
	});

	$("[data-toggle=popover]").click(function (){
        $("[data-toggle=popover]").not(this).popover('hide');
	});
}

interact('.draggable')
	  .draggable({
	    // enable inertial throwing
	    inertia: true,
	    // keep the element within the area of it's parent
	    restrict: {
	      restriction: "parent",
	      endOnly: true,
	      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
	    },
	    // enable autoScroll
	    autoScroll: true,

	    // call this function on every dragmove event
	    onmove: dragMoveListener,
	    // call this function on every dragend event
	    onend: function (event) {

	      var textEl = event.target.querySelector('p');

	      textEl && (textEl.textContent =
	        'moved a distance of '
	        + (Math.sqrt(event.dx * event.dx +
	                     event.dy * event.dy)|0) + 'px');
	    }
	  });

	  function dragMoveListener (event) {
	    var target = event.target
	        // keep the dragged position in the data-x/data-y attributes
	        // for circle, text

	        x = (parseFloat($(target).children('circle').attr('cx')) || 0) + event.dx,
	        y = (parseFloat($(target).children('circle').attr('cy')) || 0) + event.dy;
	        $(target).children('circle').attr('cx', x);
    	    $(target).children('circle').attr('cy', y);
	        $(target).children('text').attr('x', x);
    	    $(target).children('text').attr('y', y + 42);
	        $(target).children('rect').attr('x', x - 45);
    	    $(target).children('rect').attr('y', y - 38);

//	        x = (parseFloat(target.children[0].getAttribute('cx')) || 0) + event.dx,
//	        y = (parseFloat(target.children[0].getAttribute('cy')) || 0) + event.dy;
//	        target.children[0].setAttribute('cx', x);
//    	    target.children[0].setAttribute('cy', y);
//	        target.children[1].setAttribute('x', x);
//    	    target.children[1].setAttribute('y', y + 55);

//	        x = (parseFloat(target.getAttribute('cx')) || 0) + event.dx,
//	        y = (parseFloat(target.getAttribute('cy')) || 0) + event.dy;
//	        target.setAttribute('cx', x);
//    	    target.setAttribute('cy', y);

//	        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
//	        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	    // translate the element
//	    target.style.webkitTransform =
//	    target.style.transform =
//	      'translate(' + x + 'px, ' + y + 'px)';

	    // update the posiion attributes
//	    target.setAttribute('data-x', x);
//	    target.setAttribute('data-y', y);


	  }

	  // this is used later in the resizing and gesture demos
	  window.dragMoveListener = dragMoveListener;

	// 드롭존
	interact('.fc_drop').dropzone({
		  accept: '.fc_resource',
		  overlap: 0.75,
		  ondropactivate: function (event) {
//		    event.target.classList.add('drop-active');
            event.target.setAttribute("stroke", "#22a2ed");
            event.target.setAttribute("stroke-width", "2");
		  },
		  ondragenter: function (event) {
		    var draggableElement = event.relatedTarget,
		        dropzoneElement = event.target;
//		    dropzoneElement.classList.remove('drop-active');
//		    dropzoneElement.classList.add('drop-target');
            dropzoneElement.setAttribute("fill", "white");
            dropzoneElement.setAttribute("stroke", "#22a2ed");
            dropzoneElement.setAttribute("stroke-width", "2");
		  },
		  ondragleave: function (event) {
//		    event.target.classList.remove('drop-target');
//		    event.target.classList.add('drop-active');
		    event.target.setAttribute("fill", "#e3f0fc");
            event.target.setAttribute("stroke", "#22a2ed");
            event.target.setAttribute("stroke-width", "2");
		  },
		  ondrop: function (event) {
			var id = event.target.id;
			log("drop zone id: " + id);

			event.relatedTarget.remove();
			var type = $(event.relatedTarget).attr("type");
            var resource_id = $(event.relatedTarget).attr("resource_id");

			var result = nodes.filter(function(v) {
			    return v.id === resource_id;
			});

			var data = result[0];
			logobj("drop data", data);
			addFC(id, data);

		  },
		  ondropdeactivate: function (event) {
//		    event.target.classList.remove('drop-active');
//		    event.target.classList.remove('drop-target');
            event.target.setAttribute("fill", "#e3f0fc");
            event.target.removeAttribute("stroke");
            event.target.removeAttribute("stroke-width");

		  }
		});

	// 드롭존
	interact('.sf_drop').dropzone({
		  accept: '.sf_resource',
		  overlap: 0.75,

		  ondropactivate: function (event) {
//		    event.target.classList.add('drop-active');
            event.target.setAttribute("stroke", "#22a2ed");
            event.target.setAttribute("stroke-width", "2");
		  },
		  ondragenter: function (event) {
		    var draggableElement = event.relatedTarget,
		        dropzoneElement = event.target;
//		    dropzoneElement.classList.remove('drop-active');
//		    dropzoneElement.classList.add('drop-target');
            dropzoneElement.setAttribute("fill", "white");
            dropzoneElement.setAttribute("stroke", "#22a2ed");
            dropzoneElement.setAttribute("stroke-width", "2");
		  },
		  ondragleave: function (event) {
//		    event.target.classList.remove('drop-target');
//		    event.target.classList.add('drop-active');
		    event.target.setAttribute("fill", "#e3f0fc");
            event.target.setAttribute("stroke", "#22a2ed");
            event.target.setAttribute("stroke-width", "2");
		  },
		  ondrop: function (event) {

			var id = event.target.id;
			log("drop zone id: " + id);

			event.relatedTarget.remove();

            var resource_id = $(event.relatedTarget).attr("resource_id");

			var result = nodes.filter(function(v) {
			    return v.id === resource_id;
			});

			var data = result[0];

			logobj("drop data", data);

			addSF(id, data);

		  },
		  ondropdeactivate: function (event) {
//		    event.target.classList.remove('drop-active');
//		    event.target.classList.remove('drop-target');
            event.target.setAttribute("fill", "#e3f0fc");
            event.target.removeAttribute("stroke");
            event.target.removeAttribute("stroke-width");
		  }
		});

	function addFC(zone_id, node) {

        var type = ROUTER;
		logobj("addFC data", node);

		if(node.resource_type == 'router') node.resource_type = RESOURCE_ROUTER;
		if(node.resource_type == 'virtual_machine') node.resource_type = RESOURCE_VM;

		var i = fc_list.length;
        var fc = {type : node.resource_type, resource_name : node.name, resource_id : node.id};
//        if (node.resource_type == RESOURCE_VM) { // 보안장비 아이콘 표시
//            fc["security"] = node.data.security
//            fc["security_type"] = node.data.security_type;
//        }
        fc_list.push(fc);
        log(fc_list);
        
        var g = d3.select('#fc_group').append('g')
        .attr("id", "fc_g_" + i)
        .attr("class", "rgroup");
        
        var circle = g.append('circle')
        .attr("id", "fc_"+i)
        .attr("class", "set-resource")
        .attr("r", circle_r)
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", "1")
        .attr("fill", "url('#" + ((node.data.security) ? node.data.security_type : node.resource_type) + "')")
		.attr("cx", 120 + margin_x) // 고정
		.attr("cy", circle_margin_y + margin_y + (i * offset)) // length에 따라
		.attr("data-toggle", "popover");
//        log("zone_id: " + zone_id);

    	// 리소스 라벨
    	g.append('text')
    	.attr("class", "res_txt")
    	.attr("fill", "#4e515e")
//        .attr("font-weight", "bold")
//        .attr("font-size", 14)
        .attr("text-anchor", "middle")
    	.attr("x", 120 + margin_x)
    	.attr("y", distance_text + circle_margin_y + margin_y + (i * offset))
    	.text(node.name);
        
        var rectHeight = 160 + ((i + 1) * offset);
        var rectVCenter = 60 + (rectHeight/2) + margin_y;
        
        // rect 크기 조정
        d3.select('#' + zone_id)
        .transition()
        .attr("height", rectHeight);

        // egress 라인 조정
		d3.select("#fc_group").selectAll(".egress")
		.transition()
		.attr("y2", rectVCenter);
        
        log("fc rect height " + (160 + ((i + 1) * offset)));
        
        // addFc 이동
        d3.select('#addfc')
        .transition()
        .attr("cy", circle_margin_y + margin_y + ((i + 1) * offset)); // length에 따라
        
        // 라인 이동
        d3.select('#fc_group').select('.inout')
        .transition()
        .attr("cy", rectVCenter);
        
        d3.select('#fc_group').select('.arrow')
        .transition()
        .attr("y1", rectVCenter)
        .attr("y2", rectVCenter);
        
//        log("test zone " + i)

		if(sfg_list.length == 0) {
			d3.select('#add_group')
			.transition()
			.attr("cy", rectVCenter);
		}

        d3.selectAll('circle').moveToFront();
        d3.selectAll('.rgroup').moveToFront();

        alignVertical(i, true);
        initPopover(node, circle);

        saveChainingCookie();
	}

	function addSF(zone_id, node) {

		var i = sfg_list.length; // 가로 길이를 위해?

//		log("sfg_list.length1 : " + sfg_list.length);
//        logobj("addSF Data", node);

		var group_i = zone_id.split("_")[2]; // 그룹 인덱스, 가로 길이
//		log("group index: " + group_i);

		var sfg = sfg_list[group_i];

//		logobj("sfg1", sfg);

//		g.append('circle')
//		.attr("id", "addsf_0")
//		.attr("class", "btn-add")
//		.attr("cx", 380 + margin_x)
//		.attr("cy", 140 + margin_y)

		var sf_i = 0;

		// SFG의 첫 SF
		if(typeof sfg == 'undefined') {
			sfg = {};
		// SF가 존재하던 SFG
		} else {
		    if(typeof sfg.sf_list != 'undefined') {
			    sf_i = sfg.sf_list.length;
			}
		}

//		log("sf_i: " + sf_i);

		var sf = {sf_name: node.name, sf_desc: '', resource_id: node.id};
//		if (node.data.security) { // 보안장비 아이콘 표시
//		    sf["security"] = node.data.security;
//		    sf["security_type"] = node.data.security_type;
//		}
		sfg.sf_list.push(sf);
		sfg_list[group_i] = sfg;

        var g = d3.select('#sfg_' + group_i).append('g')
        .attr("id", "sfg_" + group_i + "_" + sf_i)
        .attr("class", "rgroup");


		var circle = g.append('circle')
		.attr("id", "sf_" + group_i + "_" + sf_i)
		.attr("class", "set-resource")
		.attr("r", circle_r)
        .attr("stroke", "#d2d3d4")
        .attr("stroke-width", "1")
        .attr("fill", "url('#" + ((node.data.security) ? node.data.security_type : node.resource_type) + "')")
		.attr("cx", 380 + (200 * group_i) + margin_x) // group_i에 따라 변경
		.attr("cy", circle_margin_y + (sf_i * offset) + margin_y) // length에 따라
		.attr("data-toggle", "popover");

    	// 리소스 라벨
    	g.append('text')
    	.attr("class", "res_txt")
    	.attr("fill", "#4e515e")
//        .attr("font-weight", "bold")
//        .attr("font-size", 14)
        .attr("text-anchor", "middle")
    	.attr("x", 380 + (200 * group_i) + margin_x)
    	.attr("y", distance_text + circle_margin_y + (sf_i * offset) + margin_y)
    	.text(node.name);

		var rectHeight = 160 + ((sf_i + 1) * offset);
        var rectVCenter = 60 + (rectHeight/2) + margin_y;


		d3.select('#' + zone_id)
        .transition()
        .attr("height", rectHeight);

        // ingress 라인 조정
		d3.select('#sfg_'+group_i).selectAll(".ingress")
		.transition()
		.attr("y2", rectVCenter);

        // egress 라인 조정
		d3.select('#sfg_'+group_i).selectAll(".egress")
		.transition()
		.attr("y2", rectVCenter);

        // 라인 이동
        d3.select('#sfg_'+group_i).selectAll('.inout')
        .transition()
        .attr("cy", rectVCenter);

        d3.select('#sfg_'+group_i).select('.arrow')
        .transition()
        .attr("y1", rectVCenter)
        .attr("y2", rectVCenter);


		d3.select('#addsf_' + group_i)
        .transition()
        .attr("cy", circle_margin_y + margin_y + ((sf_i + 1) * offset)); // length에 따라

		if(sfg_list.length - 1 == group_i) {
			d3.select('#add_group')
			.transition()
			.attr("cy", rectVCenter);
		}


		log("sfg_list.length2 : " + sfg_list.length);

		logobj("added sfg", sfg);

		logobj("sfg list", sfg_list);

		alignVertical(sf_i, true);

//		var sfg = [];
//        var sf = {id: i, name: '테스트'};
//        sfg.push(sf);
		d3.selectAll('circle').moveToFront();

		initPopover(node, circle);

		saveChainingCookie();
	}

	// 서비스 펑션 그룹 생성
	function addSFG() {

        log("addSFG");

//        $("#sf_name").val("");
//        $("#sf_desc").val("");
//		$('#showSfModal').modal('toggle');
//		$('#sf_confirm').unbind('click').on('click', function() {

        log("sf_confirm");

//            var name = $("#sf_name").val();
//            var desc = $("#sf_desc").val();

            var group_i = sfg_list.length;

            if (group_i >= 7) {
                return;
            }
//            var sf = {name: name, desc: desc};
            var sfg = {};
//            sfg.name = name;
//            sfg.desc = desc;

            var sf_list = [];
            sfg.sf_list = sf_list;

            sfg_list.push(sfg);

    //		log("addSFG i = " + group_i);

            //////////

            var g = svgSFC.append('g')
            .attr("id", "sfg_" + group_i);


            g.append('rect')
            .attr("id", "sfg_rect_" + group_i)
            .attr("class", "sf_drop")
            .attr("fill", "#e3f0fc")
            .attr("rx", 20)
            .attr("ry", 20)
            .attr("x", 300 + (200 * group_i) + margin_x)
            .attr("y", 60 + margin_y)
            .attr("width", 160)
            .attr("height", 160);


            g.append('text')
            .attr("class", "res_txt")
            .attr("fill", "#4e515e")
            .attr("text-anchor", "middle")
            .attr("x", 300 + (200 * group_i) + margin_x + 80)
            .attr("y", 85 + margin_y)
            .text(name);

    //		log(300 + (200 * group_i) + margin_x);

            // SF Add Button
            g.append('circle')
            .attr("id", "addsf_" + group_i)
            .attr("class", "btn-add")
            .attr("fill", 'url("#add")')
            .attr("cx", 380 + (200 * group_i) +margin_x)
            .attr("cy", circle_margin_y + margin_y)
            .attr("r", circle_r)
            .attr("stroke", "#d2d3d4")
            .attr("stroke-width", 1);


            // SF in
            g.append('circle')
            .attr("class", "inout")
            .attr("fill", "#4b73eb")
            .attr("r", inout_r)
            .attr("cx", 300 + (200 * group_i) +margin_x)
            .attr("cy", circle_margin_y + margin_y);

            if (group_i >= 6) {

                return;
            }
            // SF out
            g.append('circle')
            .attr("class", "inout")
            .attr("fill", "#4b73eb")
            .attr("r", inout_r)
            .attr("cx", 460 + (200 * group_i) +margin_x)
            .attr("cy", circle_margin_y + margin_y);

            // SFG Add arrow
            g.append('line')
            .attr("class", "arrow")
            .attr("fill", "#a1abc3")
            .attr("stroke", "#d2d3d4")
            .attr("stroke-width", 2)
            .attr("x1", 465 + (200 * group_i) +margin_x)
            .attr("y1", circle_margin_y + margin_y)
            .attr("x2", 485 + (200 * group_i) +margin_x)
            .attr("y2", circle_margin_y + margin_y)
            .attr("marker-end", "url(#triangle)");


            d3.select('#add_group').remove();

            // SFG Add button
            g.append('circle')
            .attr("id", "add_group")
            .attr("class", "btn-add")
            .attr("fill", 'url("#add")')
            .attr("cx", 540 + (200 * group_i) +margin_x)
            .attr("cy", circle_margin_y + margin_y)
            .attr("r", circle_r)
            .attr("stroke", "#d2d3d4")
            .attr("stroke-width", 1)
            .on("click", function(){
                addSFG();
            });;

            log("group_i = " + group_i);

            if(group_i > 1) {
                d3.select('#sfg_zone')
    //			.transition() // 동작 이슈
                .attr("width", 600 + (200 * (group_i-1)));

                log("groupi " + group_i);
            }

            alignVertical(0, false);
            d3.selectAll('circle').moveToFront();
            d3.selectAll('.draggable').moveToFront();

//		});

        saveChainingCookie();
	}


	function getName(data) {

	    switch(data.resource_type) {
        case VM:
            return "";
        case NETWORK:
        log("in network ");
        log(data.network_name);
            return data.network_name;
        case ROUTER:
            return "";
        case FIREWALL:
            return "";
        case LOADBALANCER:
            return "";
        case VOLUME:
            return "";
        case VPN:
            return "";
        case UNKNOWN:
            return "";

        }
	}

	function getMaxLength() {
	    var max = fc_list.length;
	    for (var i = 0; i < sfg_list.length; i++) {
	        var sf_list = sfg_list[i].sf_list;
            if(typeof sf_list != 'undefined') {
			    if(max < sf_list.length) max = sf_list.length;
            }
	    }
	    return max;
	}
	
	function alignVertical(num, isAnim) {
		
//		if(num > max_length) max_length = num;

		max_length = getMaxLength();

		d3.select("#sfc")
		.attr("height", 720 + (max_length * offset));

		if(fc_list.length == 0) {
			var check = 0;
			for (var i = 0; i < sfg_list.length; i++) {
				var sf_list = sfg_list[i].sf_list;
				if(typeof sf_list != 'undefined') {
				    check = sf_list.length;
				}
				if(check > 0) break;
			}
			// all 0
			if(check == 0) {
			}
		}

		log("align max_length : " + max_length);

//		if(max_length > 0) {
        	d3.select('#fc_zone')
			.transition()
			.attr("height", max_length * offset + 260);
        	
        	d3.select('#sfg_zone')
        	.transition()
        	.attr("height", max_length * offset + 260);
//        }
		
		var fc_diff = max_length - fc_list.length;
//		var fc_diff = max_length - fc_list.length+1;

		if(isAnim) {
			d3.select("#fc_group")
			.transition()
			.attr("transform", "translate(0," + fc_diff * (offset/2) +")");
		} else {
			d3.select("#fc_group")
			.attr("transform", "translate(0," + fc_diff * (offset/2) +")");
		}
		
		for (var i = 0; i < sfg_list.length; i++) {
			var sf_list = sfg_list[i].sf_list;
			var sf_diff = max_length - sf_list.length;
//			var sf_diff = max_length - sf_list.length + 1;

			if(isAnim) {
				d3.select("#sfg_" + i)
				.transition()
				.attr("transform", "translate(0," + sf_diff * (offset/2) +")");
			} else {
				d3.select("#sfg_" + i)
				.attr("transform", "translate(0," + sf_diff * (offset/2) +")");
			}
		}
	}

	function ingressSF(target, port_id, address, hide) {

        $(hide).parent().parent().children().children(".btn_ingress").removeClass("chaining_pop02_d07_select01");
        $(hide).addClass("chaining_pop02_d07_select01");

        var resource = d3.select(target)
        var id = resource.attr("id");

        log("E: " + id);

        var group_i = id.split("_")[1];
        var sf_i = id.split("_")[2];

        // 데이터 반영
        var sf_list = sfg_list[group_i].sf_list;
        var sf = sf_list[sf_i];
        sf.ingress = port_id;
        sf.ingress_ip = address;

        if(typeof sf.egress_ip != 'undefined') {
            $(target).popover('hide');
        }

        var rect = d3.select("#sfg_rect_" + group_i);

        var x = Number(rect.attr("x"));
        var width = Number(rect.attr("width"));
        var y = Number(rect.attr("y"));
        var height = Number(rect.attr("height"));


        var g = d3.select("#sfg_" + group_i + "_" + sf_i);

        var ingress = g.select('.ingress');

        if(ingress[0][0] == null) {
            g.append('line')
            .attr("class", "arrow ingress")
            .attr("fill", "#a1abc3")
            .attr("stroke", "#d2d3d4")
            .attr("stroke-width", 2)
            .attr("x1", resource.attr("cx"))
            .attr("y1", resource.attr("cy"))
            .attr("x2", x)
            .attr("y2", y + height / 2);
        }

        saveChainingCookie();
        d3.selectAll('circle').moveToFront();
        d3.selectAll('text').moveToFront();


//		$('#showSfModal').modal('toggle');
//		$('#sf_confirm').unbind('click').on('click', function(){
//		});

	}
	
	function egressSF(target, port_id, address, hide) {

	    $(hide).parent().parent().children().children(".btn_egress").removeClass("chaining_pop02_d07_select01");
        $(hide).addClass("chaining_pop02_d07_select01");

        var resource = d3.select(target)
        var id = resource.attr("id");

        log("egressSF: " + id);

        var group_i = id.split("_")[1];
        var sf_i = id.split("_")[2];

        var sf_list = sfg_list[group_i].sf_list;
        var sf = sf_list[sf_i];
        sf.egress = port_id;
        sf.egress_ip = address;

        if(typeof sf.ingress_ip != 'undefined') {
            $(target).popover('hide');
        }

        var rect = d3.select("#sfg_rect_" + group_i);

        var x = Number(rect.attr("x"));
        var width = Number(rect.attr("width"));
        var y = Number(rect.attr("y"));
        var height = Number(rect.attr("height"));

        var g = d3.select("#sfg_" + group_i + "_" + sf_i);

        var egress = g.select('.egress');

        if(egress[0][0] == null) {
            g.append('line')
            .attr("class", "arrow egress")
            .attr("fill", "#a1abc3")
            .attr("stroke", "#d2d3d4")
            .attr("stroke-width", 2)
            .attr("x1", resource.attr("cx"))
            .attr("y1", resource.attr("cy"))
            .attr("x2", x + width)
            .attr("y2", y + height / 2);
        }

        saveChainingCookie();
        d3.selectAll('circle').moveToFront();
        d3.selectAll('text').moveToFront();
	}

	function changeIndexFC(index, rectVCenter) {

	    log("changeIndex " + index)

        for (var i = index; i < fc_list.length + 1; i++) {
            var target_i = Number(i) + 1;
            log(i + ", " + target_i);
            var g = d3.select('#fc_g_' + target_i).attr("id", "fc_g_" + i);
            d3.select('#fc_' + target_i).attr("id", "fc_" + i);

            g.selectAll('line').attr("y1", function() {
                var y1 = d3.select(this).attr("y1");
                return y1 - offset;
            }).attr("y2", rectVCenter);

            g.selectAll('circle').transition().attr("cy", function() {
                var cy = d3.select(this).attr("cy");
                return cy - offset;
            });

            g.selectAll('text').transition().attr("y", function() {
                var y = d3.select(this).attr("y");
                return y - offset;
            });
        }

        var y = d3.select('#addfc').attr("cy");
        d3.select('#addfc').transition().attr("cy", y - offset);
	}


	function changeIndexSF(g_index, index, rectVCenter) {

	    log("changeIndexSF " + g_index + '_'+ index)

	    var sf_list = sfg_list[g_index].sf_list;

        for (var i = index; i < sf_list.length + 1; i++) {
            var target_i = Number(i) + 1;
            log(i + ", " + target_i);
            var g = d3.select('#sfg_' + g_index + '_' + target_i).attr("id", "sfg_" + g_index + "_" + i);
            d3.select('#sf_' + g_index + '_' + target_i).attr("id", "sf_" + g_index + "_" + i);

            g.selectAll('line').attr("y1", function() {
                var y1 = d3.select(this).attr("y1");
                return y1 - offset;
            }).attr("y2", rectVCenter);

            g.selectAll('circle').transition().attr("cy", function() {
                var cy = d3.select(this).attr("cy");
                return cy - offset;
            });

            g.selectAll('text').transition().attr("y", function() {
                var y = d3.select(this).attr("y");
                return y - offset;
            });
        }

        var y = d3.select('#addsf_' + g_index).attr("cy");
        d3.select('#addsf_' + g_index).transition().attr("cy", y - offset);
	}


	function removeFC(target) {

        $(target).popover('hide');

        var resource = d3.select(target);
        var id = resource.attr("id");

        log("fcRemove: " + id);
        log("fc_list length = " + fc_list.length)

        var num = id.split("_")[1];

        d3.select('#fc_g_' + num).remove();

        log("max length = " + getMaxLength());

        // data 삭제
        fc_list.splice(num, 1);

        log("max length after = " + getMaxLength());
        log("fc_list after length = " + fc_list.length)

   		var i = fc_list.length;

        var rectHeight = 160 + (i * offset);
        var rectVCenter = 60 + (rectHeight/2) + margin_y;

        changeIndexFC(num, rectVCenter);

        // 라인 이동
        d3.select('#fc_group').select('.inout')
        .transition()
        .attr("cy", rectVCenter);

        d3.select('#fc_group').select('.arrow')
        .transition()
        .attr("y1", rectVCenter)
        .attr("y2", rectVCenter);

        // rect 크기 조정
        d3.select('#fc_rect')
        .transition()
        .attr("height", rectHeight);



        alignVertical(0, true);
        saveChainingCookie();
	}

	function removeSF(target) {
        $(target).popover('hide');

        var resource = d3.select(target);
        var id = resource.attr("id");

        log("sfRemove: " + id);

        var g_num = id.split("_")[1];
        var num = id.split("_")[2];

        d3.select('#sfg_' + g_num + '_' + num).remove();

        log("max length = " + getMaxLength());

        var sfg = sfg_list[g_num];
        var sf_list = sfg.sf_list;

        log("sf_list length = " + sf_list.length)

        // data 삭제
        sf_list.splice(num, 1);

        log("max length after = " + getMaxLength());
        log("sf_list after length = " + sf_list.length)


   		var i = sf_list.length;

        var rectHeight = 160 + (i * offset);
        var rectVCenter = 60 + (rectHeight/2) + margin_y;

        changeIndexSF(g_num, num, rectVCenter);

        // 라인 이동
        d3.select('#sfg_' + g_num).selectAll('.inout')
        .transition()
        .attr("cy", rectVCenter);

        d3.select('#sfg_' + g_num).select('.arrow')
        .transition()
        .attr("y1", rectVCenter)
        .attr("y2", rectVCenter);

        d3.select('#sfg_' + g_num).select('#add_group')
        .transition()
        .attr("cy", rectVCenter);

        // rect 크기 조정
        d3.select('#sfg_rect_'+g_num)
        .transition()
        .attr("height", rectHeight);

        alignVertical(0, true);
        saveChainingCookie();
	}
	
	function egressFC(target, port_id, address) {

	    var resource = d3.select(target);
        var id = resource.attr("id");

        var num = id.split("_")[1];

        log("egressFC num : " + num);
        // 데이터
        var fc = fc_list[num];

       log("egressFC target = " + target);
       log("egressFC id = " + id);
//       log("egressFC port_id = " + port_id);

        $("#fc_logical_src_port").val(port_id);

		$(target).popover('hide');

		$('#showFcModal').modal('toggle');

		$("#fc_name").val(fc.name);
        $("#fc_desc").val(fc.desc);
        $("#fc_protocol").val(fc.protocol);
        $("#fc_ip_version").val(fc.ip_version);
        $("#fc_src_port_min").val(fc.src_port_min);
        $("#fc_src_port_max").val(fc.src_port_max);
        $("#fc_dst_port_min").val(fc.dst_port_min);
        $("#fc_dst_port_max").val(fc.dst_port_max);
        $("#fc_src_ip_prefix").val(fc.src_ip_prefix);
        $("#fc_dst_ip_prefix").val(fc.dst_ip_prefix);
        $("#fc_logical_dst_port").val(fc.logical_dst_port);

		$('#fc_confirm').unbind('click').on('click', function(){

		log("egressFC: " + port_id + ", " + address);

		    // 데이터 추가
            var name = $("#fc_name").val();
            var desc = $("#fc_desc").val();
            var protocol = $("#fc_protocol").val();
            var ip_version = $("#fc_ip_version").val();
            var src_port_min = $("#fc_src_port_min").val();
            var src_port_max = $("#fc_src_port_max").val();
            var dst_port_min = $("#fc_dst_port_min").val();
            var dst_port_max = $("#fc_dst_port_max").val();
            var src_ip_prefix = $("#fc_src_ip_prefix").val();
            var dst_ip_prefix = $("#fc_dst_ip_prefix").val();
            var logical_src_port = $("#fc_logical_src_port").val();
            var logical_dst_port = $("#fc_logical_dst_port").val();

            fc.name = name;
            fc.desc = desc;
            fc.protocol = protocol;
            fc.ip_version = ip_version;
            fc.src_port_min = src_port_min;
            fc.src_port_max = src_port_max;
            fc.dst_port_min = dst_port_min;
            fc.dst_port_max = dst_port_max;
            fc.src_ip_prefix = src_ip_prefix;
            fc.dst_ip_prefix = dst_ip_prefix;
            fc.logical_src_port = logical_src_port;
            fc.logical_src_ip = address;
            fc.logical_dst_port = logical_dst_port;

            fc.egress_ip = address;

            logobj("fcdata", fc);
            logobj("fclist", fc_list);

            // 라인 존재 유무 체크
            var egress = d3.select("#fc_g_" + num).select('.egress');

            if(egress[0][0] == null) {

                // 라인 그리기
                var out = d3.select("#fc_group").select(".inout");

                d3.select("#fc_g_" + num).append('line')
                .attr("class", "arrow egress")
                .attr("fill", "#a1abc3")
                .attr("stroke", "#d2d3d4")
                .attr("stroke-width", 2)
                .attr("x1", resource.attr("cx"))
                .attr("y1", resource.attr("cy"))
                .attr("x2", out.attr("cx"))
                .attr("y2", out.attr("cy"));
            }

            d3.selectAll('circle').moveToFront();
            d3.selectAll('text').moveToFront();

            saveChainingCookie();
		});
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