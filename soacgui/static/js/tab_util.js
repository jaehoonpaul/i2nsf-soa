var TabUtil = function (settings) {
    this.tabIndex = 0;
    this.setOption = function(op) {
        this.selector = op.selector;
		// Intent 기반 서비스에 Submit 항목 추가건 시작
        if (op.submitBtn) { this.submitBtn = $(op.submitBtn); }
		// Intent 기반 서비스에 Submit 항목 추가건 끝
        if (op.nextBtn) { this.nextBtn = $(op.nextBtn); }
        if (op.prevBtn) { this.prevBtn = $(op.prevBtn); }
        if (op.beforeEveryAct) { this.beforeEveryAct = op.beforeEveryAct; }
        if (op.afterEveryAct) { this.afterEveryAct = op.afterEveryAct; }


        this.headerList = $(this.selector + " .tab-btn");
        this.bodyList = $(this.selector + " .tab-body");
        this.length = this.headerList.length;
    }

    this.run = function() {
        $(this.headerList[0]).addClass("click");
        var body = this.bodyList[0];
        $(this.bodyList).hide();
        $(body).css("display", "block");
        this.checkIndex();
        if (this.beforeEveryAct) {
            this.beforeEveryAct(this);
        }
        var tabUtil = this;
        this.headerList.on("click", function() {
            var selIdx = tabUtil.headerList.index($(this));
            tabUtil.selectTab(selIdx, tabUtil);
        });

        if (this.nextBtn) {
            this.nextBtn.on("click", function() {
                tabUtil.next(tabUtil);
            });
        }
        if (this.prevBtn) {
            this.prevBtn.on("click", function() {
                tabUtil.prev(tabUtil);
            });
        }
        if (this.afterEveryAct) {
            this.afterEveryAct(this);
        }
        return this;
    }

    this.selectTab = function(selIdx, tabUtil) {
        if (!tabUtil) {
            tabUtil = this;
        }
        if (tabUtil.beforeEveryAct) {
            var tempFlag = tabUtil.beforeEveryAct(tabUtil, selIdx);
            if (tempFlag == 0) {
                return;
            }
        }
        tabUtil.tabIndex = selIdx;
        var headerList = tabUtil.headerList.slice();
        var bodyList = tabUtil.bodyList.slice();
        headerList.removeClass("click");
        $(headerList[selIdx]).addClass("click");
        var body = bodyList.splice(selIdx, 1);
        $(body).css("display", "block");
        $(bodyList).hide();
        tabUtil.checkIndex(tabUtil);

        if (tabUtil.afterEveryAct) {
            var tempFlag = tabUtil.afterEveryAct(tabUtil, selIdx);
            if (tempFlag == 0) {
                return;
            }
        }
    }

    this.next = function(tabUtil) {
        if (!tabUtil) { tabUtil = this; }
        if (tabUtil.tabIndex < tabUtil.headerList.length - 1) { tabUtil.selectTab(tabUtil.tabIndex + 1); }
    }

    this.prev = function(tabUtil) {
        if (!tabUtil) { tabUtil = this; }
        if (tabUtil.tabIndex > 0) { tabUtil.selectTab(tabUtil.tabIndex - 1); }
    }

    this.checkIndex = function(tabUtil) {
        if (!tabUtil) { tabUtil = this; }
        if (tabUtil.nextBtn) {
            if (tabUtil.tabIndex == tabUtil.headerList.length - 1) {
                tabUtil.nextBtn.hide();
            } else {
                tabUtil.nextBtn.show();
            }
        }
        if (tabUtil.prevBtn) {
            if (tabUtil.tabIndex == 0 && tabUtil.prevBtn) {
                tabUtil.prevBtn.hide();
            } else {
                tabUtil.prevBtn.show();
            }
        }
		// Intent 기반 서비스에 Submit 항목 추가건 시작
		if (tabUtil.submitBtn) {
			if (tabUtil.tabIndex == tabUtil.headerList.length - 1) {
				tabUtil.submitBtn.show();
			} else {
				tabUtil.submitBtn.hide();
			}
		}
		// Intent 기반 서비스에 Submit 항목 추가건 끝
    }

    this.removeTab = function(idx, tabUtil) {
        if (!tabUtil) { tabUtil = this; }
        $(tabUtil.headerList.splice(idx, 1)).hide();
        $(tabUtil.bodyList.splice(idx, 1)).hide();
        tabUtil.length = tabUtil.headerList.length;
    }

    this.hideTab = function(idx, tabUtil) {
        if (!tabUtil) { tabUtil = this; }
        tabUtil.headerList[idx].hide();
        tabUtil.bodyList[idx].hide();
    }

    if (settings) {
        this.setOption(settings);
    }

    return this;
}