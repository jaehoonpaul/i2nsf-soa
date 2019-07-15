$(function() {
    setAllocatedAvailableTable({name: "user", role: true});
    DropDownGroup({selector: "#user_allocated"});
    setAllocatedAvailableTable({name: "group", role: true});
    DropDownGroup({selector: "#group_allocated"});
});

/* 프로젝트에 할당할 유저 역할 목록 얻기 */
function getAssignList() {
    var assignList = {users: [], groups: []};
    $("#user_allocated").find("tbody tr").each(function(i, v) {
        var user_id = $(v).data("id");
        var assign = {user_id: user_id, role_id_list: []};
        // allocated 에 있는 assignments 를 기존에 있었는지 조회후 없던것만 추가함, 있던것은 role에 check=true를 삽입
        $(v).find(".icon-check").each(function(ii, iv) {
            var appendFlag = true;
            var role_id = $(iv).parents(".dd_menu_btn").data("role-id");
            if (originalRoles) {
                var existUser = originalRoles.users.filter(function(user) {
                    return user.id == user_id;
                });

                if (existUser.length == 1) {
                    var existRole = existUser[0].roles.filter(function(role) {
                        return role.id == role_id;
                    });
                    if (existRole.length == 1) {
                        existRole[0]["check"] = true;
                        appendFlag = false;
                    }
                }
            }
            if (appendFlag) {
                assign.role_id_list.push(role_id);
            }
        });
        if (assign.role_id_list.length > 0) {
            assignList.users.push(assign);
        }
    });
    $("#group_allocated").find("tbody tr").each(function(i, v) {
        var group_id = $(v).data("id");
        var assign = {group_id: group_id, role_id_list: []};
        // allocated 에 있는 assignments 를 기존에 있었는지 조회후 없던것만 추가함, 있던것은 role에 check=true를 삽입
        $(v).find(".icon-check").each(function(ii, iv) {
            var appendFlag = true;
            var role_id = $(iv).parents(".dd_menu_btn").data("role-id");
            if (originalRoles) {
                var existGroup = originalRoles.groups.filter(function(group) {
                    return group.id == group_id;
                });

                if (existGroup.length == 1) {
                    var existRole = existGroup[0].roles.filter(function(role) {
                        return role.id == role_id;
                    });
                    if (existRole.length == 1) {
                        existRole[0]["check"] = true;
                        appendFlag = false;
                    }
                }
            }
            if (appendFlag) {
                assign.role_id_list.push(role_id);
            }
        });
        if (assign.role_id_list.length > 0) {
            assignList.groups.push(assign);
        }
    });
    return assignList;
}

function getUnassignList() {
    var unassignList = {users: [], groups: []};
    $.each(originalRoles.users, function(i, user) {
        var user_id = user.id;
        var unassign = {user_id: user_id, role_id_list: []};
        $.each(user.roles.filter(function(role) { return !role.check; }), function(ii, role) {
            unassign.role_id_list.push(role.id);
        });
        if (unassign.role_id_list.length > 0) {
            unassignList.users.push(unassign);
        }
    });
    $.each(originalRoles.groups, function(i, group) {
        var group_id = group.id;
        var unassign = {group_id: group_id, role_id_list: []};
        $.each(group.roles.filter(function(role) { return !role.check; }), function(ii, role) {
            unassign.role_id_list.push(role.id);
        });
        if (unassign.role_id_list.length > 0) {
            unassignList.groups.push(unassign);
        }
    });
    return unassignList;
}