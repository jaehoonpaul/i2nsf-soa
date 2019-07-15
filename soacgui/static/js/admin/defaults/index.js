var quotas;
function getQuotasAjax(){
    U.ajax({
        url : '',
        success:function(data){
            quotas = data.success.quotaList;
            getQuotas();
        }
    });
}

function getQuotas() {
    /*for (var i in service){
        var match = new RegExp("http://([\\d]{1,3}.[\\d]{1,3}.[\\d]{1,3}.[\\d]{1,3})").exec(service[i].links.self);
        console.log(service[i].links.self);
        console.log(match);
        var host = match[1];
        service[i]["host"] = host;
    }*/
    var dataTable = new DataTable({
        "selector" : "#quotas",
        "columns" : {
            "name" : "할당량 이름",
            "limit" : "제한",
        },
        "data" : quotas
    });
    dataTable.showDataTable();

    /*
    var body = $("#modalEdit .modal-body").empty();
    for (var i=0, item; item=quotas[i]; i++) {
        body.append(
                "<div>"
            +       "<label for='input"+item.name+"'>"+item.name+"</label>"
            +       "<input type='number' min='-1' value='"+item.limit+"' name='"+item.name+"' id='input"+item.name+"' />"
            +   "</div>"
        );
    }
    */
    var table = $("#modalEdit .modal-body .rs_tab02").empty();
    for (var i=0, item; item=quotas[i]; i++) {
        table.append(
                "<tr>"
            +       "<th class='mypage_td01'><label for='input"+item.name+"'>"+item.name+"</label></th>"
            +       "<td class='mypage_td02'><input type='number' min='-1' value='"+item.limit+"' name='"+item.name+"' id='input"+item.name+"' /></td>"
            +   "</tr>"
        );
    }
}



// update
$(function() {
    var modalEdit = $("#modalEdit");
    console.log($("#btnEditDefault"));
    $("#btnEditDefault").on("click", function() { // 데이터 가져와서 채우기
        modalEdit.modal();
    });
    $("#btnEditSave").on("click", function() {
        var data = {};
        $("#modalEdit .modal-body input").each(function() {
            var input = $(this);
            data[input.attr("name")] = input.val();
        });
        console.log(data);
        alert(data + " 저장 넣기");
//        $("#modalEdit").modal("hide");
    });
});
