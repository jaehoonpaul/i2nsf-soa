function tabClick(i, tempTabList){
    var tabList = [];
    for (var idx = 0; idx < tempTabList.length; idx++ ) {
        var tempTab = tempTabList[idx];
        tabList.push(tempTab);
    }
    var tab = tabList.splice(i, 1);
    for (var j = 0; j < tabList.length; j++ ) {
        $("#" + tabList[j]).hide();
//        $("." + tabList[j]).removeClass("header_title_d04_click");
//        $("." + tabList[j]).addClass("header_title_d04");
        $("." + tabList[j]).removeClass("click");
    }
//    $("." + tab).addClass("header_title_d04_click");
//    $("." + tab).removeClass("header_title_d04");
    $("." + tab).addClass("click");
    $("#" + tab).show();
}


function postMove(url,data) {
    var f = document.createElement('form');
    var objs = document.createElement('input');
    var csrftoken = getCookie("csrftoken");

    objs.setAttribute('type', 'hidden');
    objs.setAttribute('name', 'csrfmiddlewaretoken');
    objs.setAttribute('value', csrftoken);
    f.appendChild(objs);
    var objs = document.createElement('input');
    objs.setAttribute('type', 'hidden');
    objs.setAttribute('name', 'jsonData');
    objs.setAttribute('value', data);
    f.appendChild(objs);
    f.action = url;
    f.method = "post";
    document.body.appendChild(f);
    f.submit();
}