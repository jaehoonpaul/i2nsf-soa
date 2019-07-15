var selected_routing;
var existCIDRList = [];
function createSecurityResource(d) {
    var data = d.data;
    data["name"] = d.name;
//    data["security_id"] = guid();
    var sameLength = security_resources.filter(function(security_resource, idx) {
        return security_resource.security_name == data.name;
    }).length;
    if (sameLength > 0) {
        U.lobiboxMessage(gettext("같은 이름의 보안장비가 존재합니다."), "info", gettext("정보"));
        return;
    } else if (isEmpty(d.name)) {
        U.lobiboxMessage(gettext("보안장비 이름은 필수항목입니다."), "info", gettext("정보"));
        return;
    }
    U.ajax({
        url : '/dashboard/security/create',
        data : {"data": JSON.stringify(data)},
        success: function(jsonData) {
            if (typeof jsonData.error != "undefined") {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            var result = jsonData.success;
            security_resources.push(data);
            resetSecurityLeft();
            setHeightOfSecurityLeft();
        }// end success
    });
}

function getSecurityResourceList() {
    U.ajax({
        url : '/dashboard/security/',
        success: function(jsonData) {
            if (typeof jsonData.error != "undefined") {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            security_resources = jsonData.success.security_resources;
            resetSecurityLeft();
            setHeightOfSecurityLeft();
        }// end success
    });
}

function getCIDRList() {
    U.ajax({
        url : '/dashboard/admin/networks/',
        dataType: 'json',
        data: {"project_id": $("div.project_list_d05.click").attr("id")},
        success: function(jsonData) {
            if (typeof jsonData.error != "undefined") {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                $.each(jsonData.networks, function(i, network) {
                    $.each(network.subnets, function(s_i, subnet) {
                        existCIDRList.push(subnet.cidr);
                    });
                });
            }
        }// end success
    });
}

function getResourceInAutoScaling(node, type) {
    return node.data.as_nodes.filter(function(as_node) {
        return as_node.resource_type.indexOf(type) > -1;
    })[0];
}

function getAutoScalingOfResource(as_node) {
    return nodes.filter(function(node) {
        return node.resource_type == AUTOSCALING && node.data.as_nodes.includes(as_node);
    })[0];
}

function resetSecurityLeft() {
    $("#security_item").html("");
    $.each(security_resources, function(idx, security_resource) {
        var appendTarget = "#item1";
        if (idx == 0 ) {
            $("<div>", {style: "height:12px"}).appendTo("#security_item");
            if (security_resources.length > 8) {
                $("<div>", {id: "item1", style: "float:left"}).appendTo("#security_item");
                $("#item_left_menu").css("width", "250px");
                $("#resource_tab").offset({"left": 335 + 125});
                $("#security_tab").offset({"left": 335 + 125});
                $("<div>", {id: "item2", style: "display:block"}).appendTo("#security_item");
            } else {
                $("<div>", {id: "item1", style: "display:block"}).appendTo("#security_item");
            }
//            $("<div>", {class: "security_item_border"}).appendTo("#security_item");
        }
        if (security_resources.length > 8) {
            var tempTargetList = ["#item1", "#item2"];
            appendTarget = tempTargetList[idx%2];
        }
        var security_type = "security_01";
        if (!isEmpty(JSON.parse(security_resource.data.security_types)[0])) {
            security_type = JSON.parse(security_resource.data.security_types)[0].security_type + "_icon_60_02";
        }
        $("<img>", {
            class: "security_left_img01 item",
            id: security_resource.security_name + "_security",
            src: "/static/img/service/topology/" + security_type + ".png",
            alt: "#",
            data: security_resource
        })
        /*.on("contextmenu", function() {
            var elem = this;
            U.confirm({
                title: "삭제",
                message: security_resource.security_name + "를 삭제하시겠습니까?",
                func: function() {
                    deleteSecurityResource(elem);
                }
            });
        })*/.data("data", security_resource)
        .data("name", security_resource.security_name).appendTo(appendTarget);
        var security_resource_name = security_resource.security_name;
        if (security_resource.security_name.length > 13) {
            security_resource_name = security_resource.security_name.substr(0,13)  + "\n" + security_resource.security_name.substr(13,security_resource.security_name.length - 13);
        }
        $("<div>", {
            class: "security_left_d02 " + security_resource.security_name + "_security",
            text: security_resource_name
        }).appendTo(appendTarget);
    });
    $("#security_item img").attr("draggable", "true").attr("ondragstart", "securityDrag(event)");
}

function deleteSecurityResource(elem) {
    var name = $(elem).data("name");
    U.ajax({
        url : '/dashboard/security/' + name + "/delete",
        success: function(jsonData) {
            if (typeof jsonData.error != "undefined") {
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            }
            var result = jsonData.success;
            U.lobiboxMessage(U.replaceEmptyText(result.message), "info", result.title);
            var delIdx = security_resources.findIndex(function(security_resource, idx) {
                return security_resource.security_name == name;
            });
            security_resources.splice(delIdx, 1);
            var id = $(elem).attr("id");
            $("." + id).remove();
            $(elem).remove();
            resetSecurityLeft();
            setHeightOfSecurityLeft();
        }
    });
}

function setHeightOfSecurityLeft() {
//     $("#item_left_menu").height((security_resources.length + 4) * 100 - 5);
//    var left_menu = $(".topology_left_d01.left_menu");
//    var left_menu_handle = $(".topology_left_img02.toggle");
//    var topMiddle = left_menu.offset().top + left_menu.height()/2 - left_menu_handle.height()/2;
//    left_menu_handle.offset({top: topMiddle});
}

function showConsoleURL(vm_id) {
    U.ajax({
        url : '/dashboard/service/console_url',
        data : { vm_id: vm_id },
        success: function(jsonData) {
            if (typeof jsonData.error != "undefined") {
//                U.lobiboxMessage("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                window.open(jsonData.success.console.url, vm_id, "width=1024, height=800, toolbar=no, menubar=no, location=no, top=300, left=300");
            }
        }// end success
    });
}

function writeModal(modalTitle, contentHtml) {
    $("#modalService .modal-container").width(600);
    $("#modalService .modal-title").text(modalTitle);
    $("#modalService .modal-body02").html(contentHtml);
    $("#modalService .modal-footer").html('<div class="pop01_d04"><img src="/static/img/cancel_bt_01.png" alt="#" data-dismiss="modal"></div>');
}

// app starts here
svg.on('mousedown', mousedown)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup);
d3.select(window)
    .on('keydown', keydown)
    .on('keyup', keyup);
restart();




function dblclickEvent(d) {
    d3.select('.d3-context-menu').style('display', 'none');
    if (d.resource_type == AUTOSCALING) {
        if (editFlag) {
            d.expand_view = selected_node == d || !d.expand_view;
            setInfoHtml();
            restart();
        } else {
            d.expand_view = selected_node == d || !d.expand_view;
            showNodeInfo();
            restart();
        }
    } else if (editFlag && d.resource_type != INTERNET) {
        restart();
        setInfoHtml();
    } else if (d.resource_type != INTERNET) {
        showNodeInfo();
        restart();
    }
}

function setLinkMenu(d) {
    var linkMenu = [
        {
            title: function(d) {
                return d.source.name + " - " + d.target.name;
            }
        },
    ];
    linkMenu.push({
        divider: true
    });
    linkMenu.push({
        title: function(d) {
            return gettext("삭제");
        },
        action: function(elm, d, i) {
            selected_link = d;
            if (selected_link) {
                if (selected_node != null) {
                    updateClick(selected_node.resource_type);
                }
                spliceGroupElementForLink(selected_link);
                deleteDataByLink(selected_link);
                links.splice(links.indexOf(selected_link), 1);
                selected_link = null;
                restart();
                setCookie("nodes", JSON.stringify(nodes));
                var link_list = [];
                for ( var link_i = 0; link_i < links.length; link_i++ ) {
                    link_list.push({
                        "source": {"id": links[link_i].source.id},
                        "target": {"id": links[link_i].target.id}
                    });
                }
                setCookie("links", JSON.stringify(link_list));
            }
        }
    });
    $(".actionPopUp").html("");
    $.each(linkMenu, function(idx, menu) {
        var op = {}
        if (typeof menu.title === "string") op["text"] = menu.title;
        else if (menu.title) op["text"] = menu.title(d);

        if (idx == linkMenu.length - 2 && (d.resource_type != "internet" || editFlag)) {
            $("<div>", {class: "actionGroup_d02"}).appendTo(".actionPopUp");
        } else if (menu.divider) {
            $("<div>", {class: "pop02_d01"}).appendTo(".actionPopUp");
        } else if (menu.action) {
            op["href"] = "#";
            op["class"] = "actionGroup_a01";
            var tempATag = $("<a>", op);
            tempATag.on("click",{elm: this, d: d, i: idx}, function(event) {
                menu.action(event.data.elm, event.data.d, event.data.i);
            });
            tempATag.appendTo(".actionPopUp");
            $("<br/>").appendTo(".actionPopUp");
        } else {
            op["class"] = "actionGroup_d01";
            $("<div>", op).appendTo(".actionPopUp");
        }
    });
}

function setResourceMenu(d) {
    var resourceMenu = [
        {
            title: function(d) {
                return gettext("이름") + ": " + d.name;
            }
        },
    ];
    if (!editFlag || modifyFlag) {
        if (d.resource_type != AUTOSCALING && d.resource_type != LOADBALANCER) {
            resourceMenu.push({title: function(d) { return "ID: " + d.id; }});
            resourceMenu.push({title: function(d) { return gettext("상태") + ": " + d.data.status; }});
        }
    }
    if (d.resource_type!=INTERNET) {
        resourceMenu.push({
            title: function(d) {
                switch(d.resource_type) {
                    case VOLUME:
                        return gettext("크기") + ": " + d.data.volume_size + " GB";
                    case NETWORK:
                        return "CIDR: " + d.data.cidr;
                    case VM:
                        if (editFlag || !modifyFlag) {break;}
                        var addressesHtml = "";
                        $.each(d.data.addresses, function(index, value) {
                            if (index != 0) {
                                addressesHtml += ", ";
                            }
                            addressesHtml += value;
                        });
                        return "IP " + gettext("주소") + ": " +  addressesHtml;
                    case ROUTER:
                        return gettext("게이트웨이 주소") + ": " + U.replaceEmptyText(d.data.gateway_ip);
                }
            }
        });
        resourceMenu.push({
            divider: true
        });
        resourceMenu.push({
            title: function(d) {
                return gettext("상세 정보 조회");
            },
            action: function(elm, d, i) {
                selected_node = d;
                restart();
                showNodeInfo();
            }
        });
        switch(d.resource_type) {
            case VOLUME:
                resourceMenu.push({
                    title: gettext("스냅샷 생성"),
                    action: function(elm, d, i) {

                    }
                });
                resourceMenu.push({
                    title: function(d) {
                        if (d.data.status == "in-use") {
                            return gettext("볼륨 연결 해제");
                        } else if (d.data.status == "available") {
                            return gettext("볼륨 연결")
                        } else {
                            return "error"
                        }
                    },
                    action: function(elm, d, i) {
                    }
                });
                resourceMenu.push({
                    title:  gettext("볼륨 삭제"),
                    action: function(elm, d, i) {
                    }
                });
                break;
            case NETWORK:
                resourceMenu.push({
                    title: gettext("포트 조회"),
                    action: function(elm, d, i) {

                    }
                });
                break;
            case "as_" + VM:
            case VM:
                if (editFlag) {break;}
                if (d.data.status == "ACTIVE") {
                   resourceMenu.push({
                       title: gettext("서버 종료"),
                       action: function(elm, d, i) {
                           var action = {"os-stop": null};
                           actionServer(d.id, action);
                       }
                   });
                    resourceMenu.push({
                        title: gettext("서버 일시정지"),
                        action: function(elm, d, i) {
                            var action = {"pause": null};
                            actionServer(d.id, action);
                        }
                    });
                    resourceMenu.push({
                        title: gettext("서버 재부팅"),
                        action: function(elm, d, i) {
                            var action = {"reboot": {"type": "SOFT"}};
                            actionServer(d.id, action);
                        }
                    });
                    resourceMenu.push({
                        title: gettext("콘솔창 열기"),
                        action: function(elm, d, i) {
                            showConsoleURL(d.id);
                        }
                    });
                } else if (d.data.status == "SHUTOFF") {
                    resourceMenu.push({
                        title: gettext("서버 시작"),
                        action: function(elm, d, i) {
                            var action = {"os-start": null};
                            actionServer(d.id, action);
                        }
                    });
                } else if (d.data.status == "PAUSED") {
                    resourceMenu.push({
                        title: gettext("서버 재시작"),
                        action: function(elm, d, i) {
                            var action = {"unpause": null};
                            actionServer(d.id, action);
                        }
                    });
                } else if (d.data.status == "REBOOT") {
                } else if (d.data.status == "HARD_REBOOT") {}

                resourceMenu.push({
                    title: gettext("서버 강제 재부팅"),
                    action: function(elm, d, i) {
                        var action = {"reboot": {"type": "HARD"}};
                        actionServer(d.id, action);
                    }
                });

                /*
                 * 여기부터 ETRI 요청사항 추가
                */
                resourceMenu.push({
                    divider: true
                });

                resourceMenu.push({
                    title: gettext("정책 관리"),
                    action: function(elm, d, i) {
                        PopupUtil({
                            url: "/dashboard/service/policy/modal",
                            title: gettext("정책 관리"),
                            width: 1000,
                            success: function(result) {

                            }
                        });
                    }
                });

                /*
                 * 여기까지 ETRI 요청사항 추가 끝
                */

                // resourceMenu.push({
                //     title: gettext("보안서비스 등록"),
                //     action: function(elm, d, i) {
                //         createSecurityResource(d);
                //     }
                // });
                break;
            case ROUTER:
                resourceMenu.push({
                    title: gettext("인터페이스 관리"),
                    action: function(elm, d, i) {
                        U.lobiboxMessage(gettext("준비중입니다") + ".", "info", gettext("정보"));
                    }
                });
                resourceMenu.push({
                    title: gettext("라우팅 정책 설정"),
                    action: function(elm, d, i) {
                        PopupUtil({
                            url: "/dashboard/service/routing/" + d.id,
                            title: gettext("라우팅 정책 설정"),
                            tab: {selector: "#commonModal"},
                            width: 1000,
                            success: function(result) {
                                setInitRouting();
                                selected_routing = d.id;
                            }
                        });
                    }
                });
                break;
        }
    }
    if (editFlag) {

        resourceMenu = [{
            title: function(d) {
                return d.name;
            }
        }];
        resourceMenu.push({
            divider: true
        });
        if (d.resource_type == AUTOSCALING) {
            if (d.expand_view) {
                resourceMenu.push({
                    title: gettext("오토스케일링 그룹 접기"),
                    action: function(elm, d, i) {
                        d.expand_view = false;
                        restart();
                    }
                });
            } else {
                resourceMenu.push({
                    title: gettext("오토스케일링 그룹 펼치기"),
                    action: function(elm, d, i) {
                        d.expand_view = true;
                        restart();
                    }
                });
            }
        }
        resourceMenu.push({
            title: function(d) {
                return gettext("편집");
            },
            action: function(elm, d, i) {
                selected_node = d;
                restart();
                setInfoHtml();
                showNodeInfo();
            }
        });
        resourceMenu.push({
            title: function(d) {
                return gettext("삭제");
            },
            action: function(elm, d, i) {
                selected_node = d;
                deleteNode();
//                U.lobiboxMessage(gettext("편집 취소 확인모달창 추가할것"));
                showNodeInfo();
                restart();
            }
        });
//        if (d.resource_type == VM) {
//            resourceMenu.push({
//                title: gettext("보안서비스 등록"),
//                action: function(elm, d, i) {
//                    createSecurityResource(d);
//                }
//            });
//        }
    } else {
        if (d.resource_type == AUTOSCALING) {
            if (d.expand_view) {
                resourceMenu.push({
                    title: gettext("오토스케일링 그룹 접기"),
                    action: function(elm, d, i) {
                        d.expand_view = false;
                        restart();
                    }
                });
            } else {
                resourceMenu.push({
                    title: gettext("오토스케일링 그룹 펼치기"),
                    action: function(elm, d, i) {
                        d.expand_view = true;
                        restart();
                    }
                });
            }
        }
    }

    resourceMenu.push({divider: true});
    resourceMenu.push({
        title: function(d) {
            if (d.fixed == 5) {
                return gettext("아이콘 위치 고정 해제");
            } else if (d.fixed == 4) {
                return gettext("아이콘 위치 고정");
            } else if (d.fixed) {
                return gettext("아이콘 위치 고정 해제");
            } else if (!d.fixed) {
                return gettext("아이콘 위치 고정");
            } else {
                console.log(d.fixed);
            }
        },
        action: function(elm, d, i) {
            d.fixed = !d.fixed;
            restart();
        }
    });
    $(".actionPopUp").html("");
    $.each(resourceMenu, function(idx, menu) {
        var op = {}
        if (typeof menu.title === "string") op["text"] = menu.title;
        else if (menu.title) op["text"] = menu.title(d);

        if (idx == resourceMenu.length - 2 && (d.resource_type != "internet" || editFlag)) {
            $("<div>", {class: "actionGroup_d02"}).appendTo(".actionPopUp");
        } else if (menu.divider) {
            $("<div>", {class: "pop02_d01"}).appendTo(".actionPopUp");
        } else if (menu.action) {
            op["href"] = "#";
            op["class"] = "actionGroup_a01";
            var tempATag = $("<a>", op);
            tempATag.on("click",{elm: this, d: d, i: idx}, function(event) {
                menu.action(event.data.elm, event.data.d, event.data.i);
            });
            tempATag.appendTo(".actionPopUp");
            $("<br/>").appendTo(".actionPopUp");
        } else {
            op["class"] = "actionGroup_d01";
            $("<div>", op).appendTo(".actionPopUp");
        }
    });
}

function actionServer(server_id, action) {
    U.ajax({
        url : "/dashboard/admin/instances/" + server_id + "/action",
        data : { "data": JSON.stringify(action) },
        success: function(jsonData) {
            if (typeof jsonData.success == "undefined") {
//                U.msg("제목: " + jsonData.error.title + "\n메세지: " + jsonData.error.message);
                U.lobibox(jsonData.error.message, "error", jsonData.error.title);
            } else {
                if (action == {"forceDelete": null}) {
                    location.href = "";
                } else if (jsonData.success == "reload") {
                    var msg = "";
                    var select_server = nodes.find(function(v, i){return v.id == server_id;});
                    if ("reboot" in action || "os-start" in action || "resume" in action || "unpause" in action) {
                        select_server.data.status = "ACTIVE";
                        msg = gettext("(재)시작");
                        if ("reboot" in action) {
                            msg = gettext("재부팅");
                        }
                    } else if ("os-stop" in action) {
                        msg = gettext("종료");
                        select_server.data.status = "SHUTOFF";
                    } else if ("pause" in action) {
                        msg = gettext("일시정지");
                        select_server.data.status = "PAUSED";
                    }
                    U.lobiboxMessage("서버가 " + msg + " 되었습니다.", "info", gettext("정보"));
                } else {
                    if (typeof jsonData.success.console != "undefined") {
                        window.open(jsonData.success.console.url, server_id, "width=1024, height=800, toolbar=no, menubar=no, location=no, top=300, left= 300");
                    }
                }
            }
        }
    });
}

function parseDateForm(data) {
    data = U.replaceEmptyText(data);
    return data.replace(/([\d]{4}-[\d]{2}-[\d]{2})T([\d]{2}:[\d]{2}:[\d]{2})Z?/gi, "$1 $2");
}


$(function() {
    $("#vis").attr("ondrop", "drop(event)").attr("ondragover", "allowDrop(event)");
    $("#resource_item img").attr("draggable", "true").attr("ondragstart", "drag(event)");
    if (editFlag) {
        getAvailabilityZone();
        document.addEventListener('contextmenu', event => event.preventDefault());
        getSecurityResourceList();
        getCIDRList();
    }
    $(document).on("click", function(e) {
        if ($('.actionPopUp').is(":visible") ) {
            $(".actionPopUp").offset({top: 0, left: 0});
            $('.actionPopUp').hide();
        }
    });
});