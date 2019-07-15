$(function() {
    $(".tab").on("click", function() {
        var showTarget = $(this).attr("id").replace("Tab", "");
        $(".tabBody").hide();
        $("." + showTarget).show();
        $(".tab").children().addClass("header_title_d04");
        $(".tab").children().removeClass("header_title_d04_click");
        $(this).children().addClass("header_title_d04_click");
        $(this).children().removeClass("header_title_d04");
    });
});