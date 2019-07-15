function ModalUtil(settings) {
    if (settings) {
        this.setOption(settings);
    }
    this.setOption = function(op) {
        if (op.selector) {
            this.selector = op.selector;
        }
        if (op.title) {
            this.title = op.title;
        }
        if (op.body) {
            this.body = op.body;
        }
        if (op.footer) {
            this.footer = op.footer;
        }
        if (op.class) {
            this.class = op.class;
        }
        if (op.width) {
            this.width = op.width;
        }
    }

    this.bindHtml = function() {
        if (this.width) {
            $(this.selector + " .modal-container").css("width", this.width);
        }
        $(this.selector + " .modal-title").text(this.title);
        this.modalBodyHtml = $(this.body).html();
        $(this.selector + " .modal-body").html(this.modalBodyHtml);
        $(this.body).html("");
        this.modalFooterHtml = $(this.footer).html();
        $(this.selector + " .modal-footer").html(this.modalFooterHtml);
        $(this.footer).html("");

        $(this.selector).addClass(this.class);

        $(this.selector).on("hidden.bs.modal", function() {
            modalUtil.unbindHtml();
        });
    }

    this.unbindHtml = function() {
        $(this.body).html(this.modalBodyHtml);
        $(this.footer).html(this.modalFooterHtml);
        $(this.selector + " #modalTitle").text("");
        $(this.selector + " #modalBody").html("");
        $(this.selector + " #modalFooter").html("");
    }

    this.changeBodyHtml = function(selector) {
        $(this.body).html(this.modalBodyHtml);
        this.modalBodyHtml = $(selector).html();
        $(this.selector + " #modalBody").html(this.modalBodyHtml);
    }

    this.changeFooterHtml = function(selector) {
        $(this.footer).html(this.modalFooterHtml);
        this.modalFooterHtml = $(selector).html();
        $(this.selector + " #modalFooter").html(this.modalFooterHtml);
    }

    return this;
}