function showDataList(role){
    var dataTable = new DataTable({
        "selector" : "#role",
        "columns" : {
            "name" : "프로젝트 이름",
            "id" : "프로젝트 ID",
            "domain_id" : "도메인 이름",
            "enabled" : "활성화됨",
            "description" : "설명",
        },
        "data" : role,
        "vertical" : true,
    });
    dataTable.showDataTable();
}
function getDataAjax(){
    U.ajax({
        url : '',
        success:function(data){
            var role = data.success.role;
            showDataList(role);
        }
    });
}
$(function() {
    getDataAjax();
});