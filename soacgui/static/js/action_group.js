function ActionGroup(settings) {
    this.selector = settings["selector"];
    this.clickEvent = settings["clickEvent"];
    if (settings["openGroupEvent"]){
        this.openGroupEvent = settings["openGroupEvent"];
    }

    this.setCloseEvent = function() {
        $(document).on("click", function(e) {
            $.each($('.actionGroup'), function(idx, elem) {
                if ($(elem).is(":visible") && !$(e.target).hasClass("action") && !$(e.target).parent().hasClass("action")) {
                    $(elem).slideUp("fast");
                }
            });
        });
    }

    this.run = function() {
        var actionGroup = this;
        $(this.selector).off("click", ".action");
        $(this.selector).on("click", ".action", function() {
            if (!$(this).siblings(".actionGroup").is(":visible")) {
                if (actionGroup.openGroupEvent) {
                    actionGroup.openGroupEvent(this);
                }
                var target = $(".actionGroup");
                target.each(function(i, value) {
                    $(value).offset({"top":$(value).parent().offset().top + $(value).parent().height()});
                });
                var openElem = this;
                $(".actionGroup").not($(openElem).siblings()).slideUp("fast");
                $(openElem).siblings().slideDown("fast");
            } else {
                $(".actionGroup").slideUp("fast");
            }
        });
        $(this.selector).off("click", ".actionGroup a");
        $(this.selector).on("click", ".actionGroup a", this.clickEvent);
    }
    return this;
}

function DropDownGroup(opt) {
	$(opt.selector).off("click", ".dd_group .dd_btn");
	$(opt.selector).on("click", ".dd_group .dd_btn", function() {
		if ($(this).parents(".dd_group").find(".dd_menu").is(":visible")) {
			$(this).parents(".dd_group").find(".dd_menu").slideUp("fast");
		} else {
			$(this).parents(".dd_group").find(".dd_menu").slideDown("fast");
		}
	});

	$(document).off("click");
	$(document).on("click", function(e) {
		$.each($(opt.selector + ' .dd_menu'), function(idx, elem) {
			if ($(elem).is(":visible") && !$(e.target).hasClass(".dd_group") && $(e.target).parents(".dd_group").find(elem).length < 1) {
			    $(elem).slideUp("fast");
			}
		});
	});

    if (opt.click) {
        $(opt.selector).off("click", ".dd_group .dd_menu .dd_menu_btn");
        $(opt.selector).on("click", ".dd_group .dd_menu .dd_menu_btn", opt.click);
    } else {
        $(opt.selector).off("click", ".dd_group .dd_menu .dd_menu_btn");
        $(opt.selector).on("click", ".dd_group .dd_menu .dd_menu_btn", function() {
            var dd_group = $(this).parents(".dd_group");
            var dd_menu = $(this).parents(".dd_menu");
            var roles_display = dd_group.find(".roles_display");
            if ($(this).find(".icon-check-empty").length < 1) {
                $(this).find(".icon-check").addClass("icon-check-empty").removeClass("icon-check");
            } else {
                $(this).find(".icon-check-empty").addClass("icon-check").removeClass("icon-check-empty");
            }
            var rolesStr = "";
            dd_menu.find(".icon-check").each(function(i, v) {
                if (i > 0) {
                    rolesStr += ", ";
                }
                rolesStr += $(v).parent().text();
            });
            if (rolesStr === "") {
                rolesStr = "No Roles";
            }
            roles_display.text(rolesStr);
        });
    }
}