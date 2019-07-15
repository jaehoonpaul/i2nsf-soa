function setAllocatedAvailableTable(opt) {
    var name = opt.name;
    var isOne = opt.isOne;
    var role = opt.role;

    var tableAllocated = $("#"+name+"_allocated");
    var tableAvailable = $("#"+name+"_available");
    var tbodyAllocated = tableAllocated.find("tbody");
    var tbodyAvailable = tableAvailable.find("tbody");
    var tfootAllocated = tableAllocated.find("tfoot");
    var tfootAvailable = tableAvailable.find("tfoot");
//    var inputFilter = $("#"+name+"Filter");
    function refreshTable() {
        setTbodyLineClass(tbodyAllocated);
        setTbodyLineClass(tbodyAvailable);
        if (tbodyAllocated.find("tr").length) {
            tfootAllocated.hide();
        } else {
            tfootAllocated.show();
        }
        var availableCount = 0;
        tbodyAvailable.find("tr").each(function() {
            if ($(this).css("display") != "none") availableCount++;
        });
        if (availableCount) {
            tfootAvailable.hide();
        } else {
            tfootAvailable.show();
        }
    }
    refreshTable();
    tbodyAllocated.on("click", ".btnRemove", function() {
        var btn = $(this);
        var tr = $(this).parents("tr");
        var id = tr.data("id");
        if (tbodyAvailable.find("tr[data-id=" + id + "]").length == 0) {
            var newTr = tr.clone();
            newTr.find(".btnRemove").removeClass("btnRemove").addClass("btnAdd").text("+");
            tbodyAvailable.append(newTr);
        }
        tr.remove();
        tbodyAvailable.find("tr[data-id='"+id+"']").removeClass("hidden").data("filter", tr.data("filter"));
        refreshTable();
    });
    tbodyAvailable.on("click", ".btnAdd", function() {
        if (isOne) {
            tbodyAllocated.find("tr .btnRemove").click();
        }
        var tr = $(this).parents("tr");
        var newTr = tr.clone();
        tr.addClass("hidden").data("filter", null);
        if (role) {
            var dd_group = $(".template .dd_group").clone();
            var firstItem = dd_group.find(".icon-check-empty:eq(0)");
            firstItem.addClass("icon-check").removeClass("icon-check-empty");
            newTr.find("td:eq(0)").append(dd_group);
            newTr.find(".roles_display").text(firstItem.parent().text());
        }
        tbodyAllocated.append(newTr);
        newTr.find(".btnAdd").removeClass("btnAdd").addClass("btnRemove").text("-");
        refreshTable();
    });
//    setFilter(tableAvailable, inputFilter, function() { refreshTable(); });
}

function setTbodyLineClass(tbody) {
    var i = 0;
    tbody.find("tr").each(function() {
        var tr = $(this);
        if (tr.css("display") == "none") {
            return;
        }
        var tdClass = "rs_td0" + (i%2+2);
        tr.each(function() {
            tr.removeClass("rs_td02").removeClass("rs_td03").addClass(tdClass);
        });
        i++;
    });
}