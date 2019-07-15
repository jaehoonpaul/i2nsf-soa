var debug = true;

jQuery(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});

$(document).ready(function() {
});

function Alert(msg) {
	var title = null;
	var callback = null;

	if(arguments.length>1){
		if($.type(arguments[1])=="function"){
			title=null;
			callback = arguments[1];
		}else{
			title=arguments[1];
		}
	}

	U.lobiboxMessage(msg, "warning", title);
}

/**
 * @description page 기본셋팅
 * @param base
 * @author 정준호
 * @date 2017.04.28
 */
function setup(base) {

    /* selected */
    $("select[data-selected]", base).selectedcombo();

	/* 마우스 오른쪽 버튼 클릭방지
	document.oncontextmenu = function() {
		return false;
	}; */

	//code select box 세팅
	$("select[data-code]", base).codecombo();

	//checkbox 세팅
	$(":checkbox[data-cdgr]", base).codecheckbox();

	//'예' or '아니오' 라디오버튼 세팅
	$(":radio.radio", base).yesnoradio();

	// page 버튼 클릭 시 이벤트 처리
	$(".pagebtn", base).on("click", function() {
		var pager = $(this).parents(".pagenum").length == 1 ? $(this).parents(".pagenum") : $(this).parents(".paginate");

		var frm = pager.data("form");
		var url = pager.data("url");
		var total = pager.data("total");
		var pagesize = pager.data("pagesize");
		var page = $(this).data("page");
		var pageSize = $(this).data("pageSize");

		if (url.indexOf("#overlay") != -1) {
			var page_param = {
				page : page,
				total : total,
				pagesize : pagesize
			};

			var gs_param = $(frm).formToJSON();
			$(url).trigger("refreshPopup", $.extend({}, gs_param, page_param));
		} else {
			window.location.href = url + "?" + $(frm).formSerialize() + "&page=" + page;
		}
	});

	// tinymce 에디터 기본 세팅
	$("textarea.editor", base).tinymce({
		selector : "textarea.editor",
		fontsize_formats : "8pt 9pt 10pt 11pt 12pt 26pt 36pt",
		theme : "modern",
		language : "ko_KR",
		width : 630,
		height : 300,
		plugins : [
			"advlist autolink link image lists charmap preview hr anchor pagebreak",
			"searchreplace visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
			"save table contextmenu directionality emoticons paste textcolor" ],
		content_css : "/resources/css/editor_content.css",
		toolbar : "undo redo | fontsizeselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | l      forecolor backcolor | imageUp image media | preview  fillscreen | link",
		style_formats : [
            {
                title : 'Bold text',
                inline : 'b'
            }, {
                title : 'Red text',
                inline : 'span',
                styles : {
                color : '#ff0000'
                }
            }, {
                title : 'Red header',
                block : 'h1',
                styles : {
                    color : '#ff0000'
                }
            }, {
                title : 'Example 1',
                inline : 'span',
                classes : 'example1'
            }, {
                title : 'Example 2',
                inline : 'span',
                classes : 'example2'
            }, {
                title : 'Table styles'
            }, {
                title : 'Table row 1',
                selector : 'tr',
                classes : 'tablerow1'
            }
        ],
		setup : function(ed) {
			ed.addButton("imageUp", {
                title : "이미지업로드",
                image : "/resources/image/admin/btn/calendar.png",
                onclick : function() {
                    Popup({
                        title : "포토업로더",
                        url : "/common/editor/photoUploader",
                        width : 560,
                        close : function(result) {
                            if (result != null && result.figyeongro != null) {
                                ed.execCommand(
                                    'mceInsertContent', false,
                                    "<img src='https://enables.ksc.re.kr/file/image?path="
                                    + result.figyeongro + "&name=" + result.fimyeong + "'/>"
                                );

                                if (result.width > 400) {
                                    ed.execCommand(
                                        'mceInsertContent', false,
                                        "<br /><br /><br />"
                                    );

                                    var ifrm = $("#" + ed.editorId + "_ifr").contents();
                                    ifrm.find("html, body").animate({
                                        scrollTop : 250
                                    }, {
                                        duration : 'medium',
                                        easing : 'swing'
                                    });
                                } // endif
                            } // endif
                        } // end close
                    }); // end Popup
                } // end onclick
            }); // end addButton
        } // end setup
    }); // end tinymce
} // end function

(function($) {

	/**
	 * @description 팝업창 닫기
	 * @returns this
	 * @author 정준호
	 * @date 2017.04.28
	 */
	$.fn.closePopup = function(result) {
		this.overlay().close(null, result);
		return this;
	};

	/**
	 * @description form value값 리셋
	 * @param frm
	 * @author 정준호
	 * @date 2017.04.28
	 */
	$.fn.reset = function(frm) {
		$(this).on("click", function(e) {
			$(frm + " input:text").val("");
			$(frm + " select").find("option:first").attr("selected", "selected");
		});
	};

	/**
	 * @description checkbox 생성
	 * @param {Json} opt
	 * @author 정준호
	 * @date 2017.04.28
	 */
	$.fn.checkbox = function(opt) {
		if (!opt) {
			opt = {};
		}
		opt.on = opt.on ? opt.on : "Y";
		opt.off = opt.off ? opt.off : "N";

		this.each(function() {
			var val = $(this).data("val") != null && $(this).data("val") != "" ? $(this).data("val") : opt.off;

			$(this).data("val", val);
			$("<input/>").val(val).attr({
				"name" : $(this).attr("id"),
				"type" : "hidden"
			}).insertAfter($(this));

			if ($(this).data("val") == opt.off) {
				$(this).addClass("off");
			} else {
				$(this).attr("checked", "checked");
			}
		});

		this.click(function(e) {
			$(this).toggleClass("off");

			var val = $(this).hasClass("off") ? opt.off : opt.on;
			$(this).val(val);
			$(this).next().val(val);
			$(this).trigger("change");
		});

		return this;
	};

	/**
	 * @description 셀렉트박스 공통. pt.data : 배열 opt.value : option value opt.text : option text<br>
	 * select 태그에서 data-selected="값" 설정해 주면 디폴트 P.json 과 조합해서 사용
	 * @param {Json} opt
	 * @author 정준호
	 * @date 2017.04.28
	 */
	$.fn.datacombo = function(opt) {
		this.each(function() {
			var s = $(this);

			if (!s.is("select")) {
				return;
			}
			s.children("option[value!='']").remove();
			s.val("");

			P.json({
				url : opt.url,
				data : opt.data,
				success : function(result) {
					if (result) {
						var datasource = opt.index == "single" ? result : result[opt.index];
						$.each(datasource, function(k, v) {
							if (opt.datagroupkey == "groupkey") {
								s.append($("<option />").val(v[opt.value]).text(v[opt.text]).attr("alt", v[opt.datagroupkey]).attr("class", "eyprgr_option"));
							} else {
								s.append($("<option />").val(v[opt.value]).text(v[opt.text]));
							}
						});

						if (s.data("selected")) s.val(s.data("selected"));
					}
				}
			});
		});

		return this;
	};

    $.fn.selectedcombo = function(opt) {
		this.each(function() {
		    var s = $(this);
		    var selected = s.data("selected");
			if (!s.is("select")) {
				return;
			}
			if (isEmpty(selected)) {
			    selected = $(this).children(":eq(0)").val();
			}
			s.val(selected).prop("selected", true);
		});
    }

	/**
	 * @description 코드관리 테이블을 이용하여 코드 셀렉트박스 생성
	 * @param {Json} opt
	 * @author 정준호
	 * @date 2017.04.28
	 */
	$.fn.codecombo = function(opt) {
		this.each(function() {
			var s = $(this);
			var code = s.data("code");

			if (!s.is("select")) {
				return;
			}
			s.children("option[value!='']").remove();
			s.val("");

			P.json({
				url : "/common/code/" + code,
				success : function(codes) {
					if (codes.list) {
						$.each(codes.list, function(k, v) {
							s.append($("<option />").val(v.cdkey).text(v.cdmyeong));
						});
					}

					if (s.data("selected"))
						s.val(s.data("selected"));
				}
			});
		});

		return this;
	};

	/**
	 * @description 코드관리 테이블을 이용하여 라디오버튼 생성
	 * @param {Json} opt
	 * @author 정준호
	 * @date 2017.04.28
	 */
	$.fn.codecheckbox = function(opt) {
		this.each(function() {
			var s = $(this);
			var code = s.data("cdgr");
			var type = s.data("type") ? s.data("type") : "text";
			var selectCd = s.data("selected") ? (s.data("selected") + "").split(",") : [];

			P.json({
				url : "/common/code/" + code,
				success : function(codes) {
					if (codes) {
						$.each(codes, function(k, v) {
							var radio = $("<input type='checkbox' />").val(v.cdkey).attr("class", s.attr("id"));
							if (selectCd.contains(v.cdkey)) {
								radio.attr("checked", "checked");
							}
							radio.on("change", function() {
								_refreshcheckval();
							});

							if (type == "text")
								radio = $("<label/>").append(radio).append("<span>" + v.cdmyeong + "</span>");
							else if (type = "image")
								radio = $("<label/>").append(radio).append("<img src='/file/image.do?path=" + v.sbfilejuso + "&name=" + v.sbfilemyeong + "'/>");

							s.before(radio);
						});
					}
				}
			});

			function _refreshcheckval() {
				var arr = [];
				$("." + s.attr("id") + ":checked").each(function() {
					arr.push($(this).val());
				});
				$("input[name='" + s.attr("id") + "']").val(arr.join("||"));
			}
			s.remove();
			_refreshcheckval();
		});

		return this;
	};

	/**
	 * @description 예 or 아니오 라디오버튼 생성
	 * @param {Json} opt
	 * @author 정준호
	 * @date 2017.04.28
	 */
	$.fn.yesnoradio = function(opt) {
		this.each(function() {
			var s = $(this);

			var data = [{value : "Y", text : "예"}, {value : "N", text : "아니오"}];
			var selected = s.data("selected") + "" == "Y"
					|| s.data("selected") + "" == "true"
					|| s.data("selected") + "" == "" ? "Y" : "N";

			$.each(data, function(idx, v) {
				var radio = $("<input type='radio' />").val(v.value).attr("name", s.attr("id"));
				if (selected == v.value) {
					radio.attr("checked", "checked");
				}
				radio = $("<label/>").append(radio).append("<span>" + v.text + "</span>");

				s.before(radio);
				radio.find(":radio").on("click", function() {
					s.val(v.value);
					s.trigger("change");
				});
			});
			s.hide();
		});

		return this;
	};

	/**
	 * @description 폼 내용을 json으로 변환
	 * @author 정준호
	 * @date 2017.04.28
	 */

	$.fn.formToJSON = function() {
		var arrayData, objectData;
		arrayData = this.serializeArray();
		objectData = {};

		$.each(arrayData, function() {
			var value;

			if (this.value != null) {
				value = this.value;
			} else {
				value = '';
			}

			if (objectData[this.name] != null) {
				if (!objectData[this.name].push) {
					objectData[this.name] = [ objectData[this.name] ];
				}

				objectData[this.name].push(value);
			} else {
				objectData[this.name] = value;
			}
		});

		return objectData;
	};

	/**
	 * @description form 데이터 형식 체크
	 * @param {Json} opt
	 * @returns 제출 가능 여부
	 * @author 정준호
	 * @date 2017.04.28
	 */
	$.fn.checkform = function() {
		var base = this;
		U.processJoinField(".item", base);

		var chkResult = true;

		var V_RESULT = function() {
			this.result = false;
			this.message = "";
			this.isValid = function() {
				return this.result;
			};
		};

		var V_COMMAND = function(command) {
			this.validator;
			this.args = [];

			var idx1 = command.indexOf("(");
			var idx2 = command.indexOf(")");
			if (idx1 > 0) {
				this.validator = command.substring(0, idx1);
				this.args = command.substring(idx1 + 1, idx2).split(",");
				this.args = $.map(this.args, function(n) {
					return (n + "").trim();
				});
			} else {
				this.validator = command;
			}
		};


		var validator = {
			/**
			 * @description 필수값 체크
			 * @param obj 폼 데이터
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			required : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0);
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) 필수입력 항목입니다.", obj.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 문자열 길이 체크
			 * @param obj 폼 데이터
			 * @param chkLength 체크 길이
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			length : function(obj, chkLength) {
				var result = new V_RESULT();
				result.result = (obj.val().getByteLength() == chkLength);
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) $2글자를 입력해 주세요.", obj.attr("alt"), chkLength);
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 문자열 길이 체크(최소값)
			 * @param obj 폼 데이터
			 * @param chkLength 체크 길이
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			min : function(obj, chkLength) {
				var result = new V_RESULT();
				result.result = (obj.val().getByteLength() >= chkLength);
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) $2글자 이상 입력해 주세요.", obj.attr("alt"), chkLength);
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 문자열 길이 체크(최대값)
			 * @param obj 폼 데이터
			 * @param chkLength 체크 길이
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			max : function(obj, chkLength) {
				var result = new V_RESULT();
				result.result = (obj.val().getByteLength() <= chkLength);
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) $2글자 이하로 입력해 주세요.", obj.attr("alt"), chkLength);
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 숫자 크기 비교 (>)
			 * @param obj 데이터
			 * @param val 비교값
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			gt_val : function(obj, val) {
				var result = new V_RESULT();

				if (val[0].isNumber()) {
					result.result = (parseInt(obj.val()) > parseInt(val));
				} else {
					result.result = (obj.val() > val);
				}

				if (!result.result) {
					result.message = _makeMessage("[$1]에 $2보다 큰값을 입력해 주세요.", obj.attr("alt"), val);
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 숫자 크기 비교 (>=)
			 * @param obj 데이터
			 * @param val 비교값
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			ge_val : function(obj, val) {
				var result = new V_RESULT();

				if (val[0].isNumber()) {
					result.result = (parseInt(obj.val()) >= parseInt(val));
				} else {
					result.result = (obj.val() >= val);
				}

				if (!result.result) {
					result.message = _makeMessage("[$1]에 $2보다 크거나 같은값을 입력해 주세요.", obj.attr("alt"), val);
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 숫자 크기 비교 (<)
			 * @param obj 데이터
			 * @param val 비교값
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			lt_val : function(obj, val) {
				var result = new V_RESULT();

				if (val[0].isNumber()) {
					result.result = (parseInt(obj.val()) < parseInt(val));
				} else {
					result.result = (obj.val() < val);
				}

				if (!result.result) {
					result.message = _makeMessage("[$1]에 $2보다 작은값을 입력해 주세요.", obj.attr("alt"), val);
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},
			/**
			 * @description 숫자 크기 비교 (<=)
			 * @author 정준호(2017.04.28)
			 * @param obj
			 * @param val
			 * @returns {Boolean} result
			 */
			le_val : function(obj, val) {
				var result = new V_RESULT();

				if (obj.val() == "") {
					result.result = true;
					return result;
				}

				if (val[0].isNumber()) {
					result.result = (parseInt(obj.val()) <= parseInt(val));
				} else {
					result.result = (obj.val() <= val);
				}

				if (!result.result) {
					result.message = _makeMessage("[$1]에 $2보다 작거나 같은값을 입력해 주세요.", obj.attr("alt"), val);
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 두 값이 일치하는지 비교
			 * @param obj 비교할 데이터
			 * @param eqField 비교 대상
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			eq : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='" + eqField + "']", base);
				result.result = (obj.val() == eqField.val());
				if (!result.result) {
					result.message = _makeMessage("[$1]와(과) [$2]에 입력된 값이 다릅니다.", obj.attr("alt"), eqField.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 두 값 비교 (>)
			 * @param obj 비교할 데이터
			 * @param eqField 비교 대상
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			gt : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='" + eqField + "']", base);
				result.result = (obj.val() > eqField.val());
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) [$2]보다 커야합니다.", obj.attr("alt"), eqField.attr("alt"));
				}

				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 두 값 비교 (<)
			 * @param obj 비교할 데이터
			 * @param eqField 비교 대상
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			lt : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='" + eqField + "']", base);
				result.result = (obj.val() < eqField.val());
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) [$2]보다 작아야합니다.", obj.attr("alt"), eqField.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 두 값 비교 (>=)
			 * @param obj 비교할 데이터
			 * @param eqField 비교 대상
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			ge : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='" + eqField + "']", base);
				result.result = (obj.val() >= eqField.val());
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) [$2]보다 크거나 같아야 합니다.", obj.attr("alt"), eqField.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 두 값 비교 (<=)
			 * @param obj 비교할 데이터
			 * @param eqField 비교 대상
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			le : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='" + eqField + "']", base);
				result.result = (obj.val() <= eqField.val());
				if (!result.result){
					result.message = _makeMessage("[$1]은(는) [$2]보다 작거나 같아야 합니다.", obj.attr("alt"), eqField.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},
			/**
			 * @description 두 값 비교 (<=). 빈 값까지 체크
			 * @param obj
			 * @param eqField
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			empt_le : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='" + eqField + "']", base);
				result.result = (obj.val() <= eqField.val()) || eqField.val() == "";
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) [$2]보다 작거나 같아야 합니다.", obj.attr("alt"), eqField.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 이메일 형식 체크
			 * @param obj
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			email : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0) ? (obj.val().isEmail()) : true;
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) 유효한 이메일을 입력해 주세요.", obj.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 휴대폰 번호 형식 체크
			 * @param obj
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			phone : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0) ? (obj.val().isPhone()) : true;

				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) 유효한 전화번호를 입력해 주세요.", obj.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 입력한 값이 숫자인지 체크
			 * @param obj
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			num : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0) ? (obj.val().isNumber()) : true;
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) 숫자를 입력해 주세요.", obj.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 입력한 값이 영문자인지 체크
			 * @param obj
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			alpha : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0) ? (obj.val().isAlpha()) : true;
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) 영문 문자를 입력해 주세요.", obj.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 주민등록번호 형식 체크
			 * @param obj
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			jumin : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0) ? (obj.val().isJumin()) : true;
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) 유효한 주민등록번호를 입력해 주세요.", obj.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 입력값이 ip 인지 체크
			 * @param obj
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			ip : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0) ? (obj.val().isIP()) : true;
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) 유효한 IP 주소를 입력해 주세요.", obj.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 입력값이 id형식인지 체크
			 * @param obj
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			id : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0) ? (obj.val().isID()) : true;
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) 영문으로 시작하는 5~12자 영문자 또는 숫자이어야 합니다.", obj.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 입력값이 날짜형식인지 체크
			 * @param obj
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			date : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0) ? (obj.val().isDate()) : true;
				if (!result.result) {
					result.message = _makeMessage("[$1]의 날짜 형식이 다르거나 날짜가 잘못되었습니다. ex)2010-01-01, 20100101", obj.attr("alt"));
				}

				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			},

			/**
			 * @description 입력값이 소수점형식인지 체크
			 * @param obj
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			double : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length > 0) ? (obj.val().isDouble()) : true;

				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) 숫자만 입력 가능합니다.", obj.attr("alt"));
				}

				if (!obj.parent().is(":visible")) {
					result.result = true;
				}
				return result;
			},

			/**
			 * @description 입력값 사이의 날짜 차이 계산
			 * @param obj
			 * @param eqField
			 * @returns {Boolean} result
			 * @author 정준호
			 * @date 2017.04.28
			 */
			betweenday : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='" + eqField + "']", base);
				result.result = (betweenday(obj.val(), eqField.val())) <= 365;
				if (!result.result) {
					result.message = _makeMessage("[$1]은(는) [$2]과 간격이 1년까지 최대 허용됩니다.", obj.attr("alt"), eqField.attr("alt"));
				}
				if (!obj.parent().is(":visible")) {
					result.result = true;
				}

				return result;
			}
		};

		/**
		 * @description Alert창에 표시할 메시지 만들기
		 * @param message 메시지
		 * @author 정준호
		 * @date 2017.04.28
		 */
		function _makeMessage(message) {
			$.each(arguments, function(k, v) {
				if (k > 0) {
					message = message.replaceAll("$" + k, v);
				}
			});

			return message;
		}

		var message = "";
		var target = $("[data-check]", base);

		var err_css = {
			"border-color" : "#dd4b39",
			"background-color" : "#fff"
		};
		var success_css = {
			"border-color" : "",
			"background-color" : ""
		};

		$.each(target, function() {
			var formField = $(this);
			var checkList = formField.data("check").split(" ");

			$.each(checkList, function(k, v) {
				var cmd = new V_COMMAND(v);
				try {
					var r = validator[cmd.validator](formField, cmd.args);
					if (!r.isValid()) {
						message += r.message + "<br/>";
						formField.css(err_css).addClass("error_required");
						chkResult = false;
						return false;
					} else {
						formField.css(success_css)
								.removeClass("error_required");
					}
				} catch (err) {
					alert("지원하지 않는 validation! [" + name + " check attribute를 확인하세요. (" + cmd.validator + ")]");
				}
			});
		});

		if (!chkResult) {
			U.lobiboxMessage(message, "warning", "필수값 누락");
		}

		return chkResult;
	};

	/**
	 * @description 엑셀 다운로드 파라미터 get url에 붙이기
	 * @param filename 엑셀파일이름
	 * @param model 모델형식
	 * @returns {Boolean} result
	 * @author 정준호
	 * @date 2017.04.28
	 */
	$.fn.xlsparam = function(filename, model) {
		var arr = [];
		this.find("[data-colname]").each(
			function() {
				arr.push($(this).data("colname") + "＠" + $(this).text() + "＠" + $(this).data("type") + "＠" + $(this).data("width"));
			});

		return "xlsparam=" + arr.join("＃") + "&xlsname="
				+ (filename ? filename : "") + "&model="
				+ (model ? model : "list") + "&page_size=65535";
	};

})(jQuery);

function Popup(opt) {
	var popid = "overlay"+(Math.floor(Math.random()*1000000)+1);
	var div = $("<div class='overlay'><h1 id='overlay_title'/><div id='overlay_content' style='max-height:650px; overflow-y:auto; overflow-x:hidden;'/></div>").attr("id", popid);
	
	if (opt.title) div.find("#overlay_title").text(opt.title);
	$("body").append(div);
	
	opt.data = opt.data ? opt.data : {};
	opt.data.base = "#"+popid;
	opt.data.layout = "none";
	
	opt.width = opt.width ? opt.width : 860,
	
	div.overlay({
		top:"1%", 
		oneInstance: false, 
		load: true, 
		fixed: false,
		closeOnClick: false,
		speed : 200,
		closeSpeed : 0,
		mask: {
			color: "#000000",
			loadSpeed: 100,
			opacity: 0
		},
		onClose : function(overlay, result) {
			if (opt.close) opt.close(result);
			div.remove();
		},
		onBeforeLoad : function() {
			var overlay = this.getOverlay();
			var contentArea = overlay.find("#overlay_content");
			$.ajax({
				url : opt.url,
				type : "post",
				dataType : "html",
				data : opt.data,
				async : false,
				success : function(html) {
					contentArea.html(html).css("width", opt.width);
					setup(contentArea);
//					setup_page(contentArea);
					
					overlay.draggable({handle:"#overlay_title"});
					
					div.trigger("popupBeforeLoad");
				}
			});
		},
		onLoad : function() {
			var contentArea = this.getOverlay().find("#overlay_content");
			contentArea.find("input[type='text']:visible:not(.datetime,.date)").eq(0).focus();
			
			div.trigger("popupAfterLoad");
		}
	}).load();
	
	div.on("refreshPopup", function(evt, data) {
		var contentArea = $(this).find("#overlay_content");
		var newParam = $.extend({}, opt.data, data);
		
		$.ajax({
			url : opt.url,
			type : "post",
			dataType : "html",
			data : newParam,
			async : false,
			success : function(html) {
				contentArea.html(html).css("width", opt.width);
				setup(contentArea);
//				setup_page(contentArea);
			}
		});
	});
}



function P() {};
P.prototype = new Object();

/**
 * 페이지 저장
 * @param opt
 */
P.save = function(opt) {
	if ( opt.form ) {
		if ( $(opt.form).checkform() ) {
			$(opt.form).find(".number").each(function() {
				var num = $(this).val() ? $(this).val() : "";
				$(this).val(num.replaceAll(",", ""));
			});

			$(opt.form).attr("action", opt.action+".json");
			$(opt.form).ajaxSubmit({
				data : opt.data,
				type : "post",
				dataType : "json",
				success : function(result) {
					if (opt.success) opt.success(result);
				},
				error : function(res) {
					if (opt.error) opt.error(res.responseText);
					else P.parseError(res.responseText);
				}
			});
		}
	} else {
		$.ajax({
			url : opt.action+".json",
			data : opt.data,
			type : "post",
			dataType : "json",
			success : function(result) {
				if (opt.success) opt.success(result);
			},
			error : function(res) {
				if (opt.error) opt.error(res.responseText);
				else P.parseError(res.responseText);
			}
		});
	}
};

P.json = function(opt) {
    if (opt.async == undefined) {
        opt.async = false;
    }
	$.ajax({
		url : opt.url,
		data : opt.data,
		async : opt.async,
		type : "post",
		dataType : "json",
		success : function(result) {
			opt.success(result);
		},
		error : function(res) {
			P.parseError(res.responseText);
//			alert(res.responseText);
		}
	});
};

P.parseError = function(message) {
	try{
		alert($.parseJSON(message).error_message);
	}catch(e) {
		var msg = $("<div/>").html(message).find("#message");
		//var msg = $(html);
		if (msg.length==0) {
//			alert("오류가 발생했습니다.\n관리자에게 문의해주세요.");
		} else {
			alert(msg.text());
		}
	}
};

function U() {};
U.prototype = new Object();

U.ajax = function(opt) {
//console.debug(opt.data);

    if (opt.progress) {
        U.showProgress();
    }
    if (!opt.dataType) {
        opt.dataType = "text";
    }
    if (!opt.type) {
        opt.type = "POST";
    }
    if (!opt.async) {
        opt.async = true;
    }
	$.ajax({
		url : opt.url,
		data : opt.data,
		async : opt.async,
		type : opt.type,
		dataType: opt.dataType,
		success : function(result) {
		    if (typeof result == "string") {
		        try {
		            result = JSON.parse(result);
		        } catch (exception) {
		            console.log("malformed json: ", result, exception);
		        }
		    }
		    if (result) {
                if (result.success) {
                    // 수정한곳
                    if (typeof result.success.error_msg_list != "undefined") {
                        var message = "";
                        var error_msg_list = result.success.error_msg_list;
                        for(var key in error_msg_list) {
                            message += "title: " + key + "\n";
                            message += "message: " + JSON.stringify(error_msg_list[key]) + "\n";
                        }
    //		            alert(message);
                    }
                    // 수정한곳 끝
                }
                if (result.error) {
                    if (typeof opt.error == "function") {
                        opt.error(result);
                    } else {
                        if (isEmpty(result.error.message) && !isEmpty(result.error.error_message)) {
                            if (isEmpty(result.error.error_message.description)) {
                                result.error["message"] = result.error.error_message.faultstring;
                            } else {
                                result.error["message"] = result.error.error_message.description;
                            }
                            if (isEmpty(result.error.error_message.title)) {
                                result.error["title"] = "error";
                            } else {
                                result.error["title"] = result.error.error_message.title;
                            }
                        }
                        U.lobiboxErrorMessage(result);
                    }
                } else if (!result.success) {
                    opt.success(result);
//                    U.lobibox("작업 중 오류가 발생하여 완료되지 않았습니다", "error", "오류");
//                    console.log(result);
                }
		    } else {
                U.lobibox("result: null", "error", "null");
//                console.log(result);
		    }
            if (opt.progress) {
                U.hideProgress();
            }
            if (result) {
                if (result.success && opt.success) {
                    opt.success(result);
                }
            }
		},
		error : function(request, textStatus, errorThrown) {
            if (typeof opt.error == "function") {
                opt.error(request, textStatus, errorThrown);
            } else {
                if (request.status == 401) {
                    $.fn.modal.Constructor.DEFAULTS.keyboard = false;
                    U.lobibox("The request you have made requires authentication.", "error", "Unauthorized(401)");
                    $('#loginModal').modal('show');
                } else {
    //            console.log(typeof opt.error == "function", typeof opt.error);
                    if (request.status != 0) {
                        // alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                        if (request.responseJSON) {
                            if (request.responseJSON.error) {
                                var error = request.responseJSON.error;
                                U.lobibox(error.message, "error", error.title);
                            }
                        } else {
                            try {
                                var response = JSON.parse(request.responseText);
                                if (response.error) {
                                    U.lobibox(response.error.message, "error", response.error.title);
                                }
                            } catch (exception) {
                                console.log(exception);
                            }
                            U.lobibox(request.responseText, "error", errorThrown + "(" + request.status + ")");
                        }
                    }
                }
            }
            U.hideProgress();
		}
	});
};

U.msg = function(message) {
    var x = $("#snackbar");
    x.html(message);
    x.addClass("show");
    setTimeout(function() { x.removeClass("show"); }, 4000);
}
//U.msg = function(message, type, title) {
//    var msgData = {
//        size: 'mini',
//        msg: message
//    };
//    if (arguments.length==3) {
//        msgData.set("title", title);
//        Lobibox.notify(type, msgData);
//    } else if (arguments.length==2) {
//        Lobibox.notify(type, msgData);
//    } else {
//        Lobibox.notify("info", msgData);
//    }
//}

U.lobibox = function(message, type, title) { //AVAILABLE TYPES: "error", "info", "success", "warning"
    if (message.indexOf("<style") != -1) {
        message = message.replace(/[\s\S]+<body\>([\s\S]+)<\/body\>[\s\S]+/gi, "$1");
    }
//    console.log(message, arguments.callee.caller.name, arguments.callee.caller.toString());
    var msgData = {
        size: 'large',
        msg: message,
        sound:false,
        width: 500,
        height: 10
    };

    if (arguments.length==3) {
        msgData["title"] = title;
        Lobibox.notify(type, msgData);
    } else if (arguments.length==2) {
        Lobibox.notify(type, msgData);
    } else {
        msgData["title"] = "정보";
        Lobibox.notify("info", msgData);
    }
    $(".lobibox-notify-title").css("margin-bottom", "7px");
    $(".lobibox-notify-wrapper-large .lb-notify-wrapper .lobibox-notify .lobibox-notify-body").css("margin", "13px 20px 13px 90px");
    $(".lobibox-notify-icon-wrapper").css("width", "60px");
    $(".lobibox-notify-icon>div .icon-el").css("font-size", "55px");
}

U.lobiboxMessage = function(message, type, title) {
    var msgData = {
        msg: message,
        showClass:"fadeInUp",
        hideClass:"fadeOutDown",
        sound:false,
        delayIndicator: false,
        position:"center bottom",
        width: 500,
        height: 10,
        delay:4000
    };
    var argumentLength = arguments.length;
    var lobibox = $(".lobibox-notify-wrapper .lobibox-notify").data('lobibox');
    if (lobibox && lobibox.$el.is(":visible")){
        lobibox.remove();
        setTimeout(function(){
            if (argumentLength==3) {
                msgData["title"] = title;
                Lobibox.notify(type, msgData);
            } else if (argumentLength==2) {
                Lobibox.notify(type, msgData);
            } else {
                msgData["title"] = "정보";
                Lobibox.notify("info", msgData);
            }
            $(".lobibox-notify-title").css("margin-bottom", "7px");
            $(".lobibox-notify-wrapper .lobibox-notify.animated-fast").css("height","87px");
        }, 500);
    } else {
        if (argumentLength==3) {
            msgData["title"] = title;
            Lobibox.notify(type, msgData);
        } else if (argumentLength==2) {
            Lobibox.notify(type, msgData);
        } else {
            msgData["title"] = "정보";
            Lobibox.notify("info", msgData);
        }
        $(".lobibox-notify-title").css("margin-bottom", "7px");
        $(".lobibox-notify-wrapper .lobibox-notify.animated-fast").css("height","87px");
    }

}
U.lobiboxSimpleMessage = function(message, type) {
    var msgData = {
        size: 'mini',
        msg: message,
        width: 500,
        height: 10,
        rounded: true,
        delayIndicator: false,
        delay:5000
    };

    if (arguments.length==2) {
        Lobibox.notify(type, msgData);
    } else {
        Lobibox.notify("info", msgData);
    }
}
U.lobiboxErrorMessage = function(result) {
    if (result.error instanceof Array) {
        $.each(result.error, function(i, v) {
            U.lobibox(v.message, "error", v.title);
        });
    } else {
        if (result.error.code == '401') {
            $.fn.modal.Constructor.DEFAULTS.keyboard = false;
            U.lobibox(result.error.message, "error", result.error.title);
            $('#loginModal').modal('show');
            U.hideProgress();
        } else if (result.error && result.error.error && result.error.error.code == '404' && result.error.error.message == "Failed to validate token") {
            $.fn.modal.Constructor.DEFAULTS.keyboard = false;
            U.lobibox(result.error.error.message, "error", result.error.error.title);
            $('#loginModal').modal('show');
            U.hideProgress();
        } else {
            if (typeof result.error.message != "undefined") {
                U.lobibox(result.error.message, "error", result.error.title);
            } else {
                for (var key in result.error) {
                    U.lobibox(result.error[key].message, "error", key + "(" + result.error[key].code + ")");
                }
            }
        }
    }
}

U.showProgress = function() {
    var modalIDs = [
        '#loginModal',
        '#commonModal',
        '#topModal',
        '#modal',
        '#modalService',
        '#confirm_modal',
        '#modalDelete'
    ];
    var showModalFlag = false;
    $.each(modalIDs, function(i, v) {
        if($(v).is(":visible")) {
            showModalFlag = true;
            return;
        }
    });
    if (showModalFlag) {
        $("#main_progress").css('z-index', "1051");
    } else {
        $("#main_progress").css('z-index', "98");
    }
    $("#main_progress").show();
}

U.hideProgress = function() {
    $("#main_progress").hide();
}

U.alert = function(opt) {
    bootbox.confirm({
        title: opt.title,
        message: opt.message,
        size: 'small',
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> 취소'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> 확인'
            }
        },
        callback: function (result) {
            opt.result(result);
        }
    });
}

U.alertOk = function(opt) {
    bootbox.alert({
        title: opt.title,
        message: opt.message,
        size: 'small',
    });
}

/**
 * Time 스트링을 자바스크립트 Date 객체로 변환<br/>
 * ex) toDate("2009-11-25", "-");<br/>
 * ex) toDate("20091125", "");<br/>
 * @param dateStr 날짜형식 문자열
 * @param delemeter
 * @returns {Date}
 */
U.toDate = function(dateStr, delm) {
	var year;
	var month;
	var day;
	
	if ( delm ) {
		var d = dateStr.split(delm);
		year  = d[0];
		month = d[1] - 1;
		day   = d[2];
	} else {
		year  = dateStr.substr(0,4);
		month = dateStr.substr(4,2) - 1;
		day   = dateStr.substr(6,2);
	}

	return new Date(year,month,day);
};

/**
 * 날짜에 특정 필드를 amount 만큼 더하거나 뺀다.
 * @param src     더하거나 뺄 대상 날짜(Date 타입이나 "2011-06-01" 형식의 문자열)
 * @param field   대상 필드( y, m, d )
 * @param amount  더가허나 뺄 숫자
 * @returns {String}
 */
U.addDate = function(src, field, amount) {
	var d = (src.getDate) ? src : U.toDate(src, "-");
	d.addDate(field, amount);
	
	var month = parseInt(d.getMonth())+1;
	var day = parseInt(d.getDate());
	
	return d.getFullYear() + "-" + (month<10?"0"+month:month) + "-" + (day<10?"0"+day:day);
};

/**
 * 천단위로 숫자에 콤마찍기
 * @param n
 * @returns
 */
U.formatNumber = function(n) {
	if (n==0 || n == null)return "";
	var reg = /(^[+-]?\d+)(\d{3})/;
	n += '';

	while (reg.test(n))
		n = n.replace(reg, '$1' + ',' + '$2');

	return n;
};

/**
 * 오늘 날짜를 포맷에 맞춰 리턴<br/>
 * ex) <br/>
 *     오늘이 2011년 6월 1일이라면,<br/><br/>
 *     
 *     U.curDate()  => 2011-06-01 리턴<br/>
 *     U.curDate("yyyy")  => 2011 리턴<br/>
 *     U.curDate("mm")  => 6 리턴<br/>
 *     U.curDate("yyyy년 mm월 dd일")  => 2011년 06월 11일 리턴<br/>
 * @param format yyyy|mm|dd|hh|nn|ss|a/p
 * @returns
 */
U.curDate = function(format) {
	var d = new Date();
	
	return d.format(format ? format : "yyyy-mm-dd");
};


/**
 * 이번주의 월요일
 * @returns
 */
U.monday = function() {
	var d = new Date();
	d = d.addDate("d", d.getDay()-1);
	
	return d.format("yyyy-mm-dd");
};

/**
 * 이번주의 금요일
 * @returns
 */
U.friday = function() {
	var d = new Date();
	d = d.addDate("d", 7-d.getDay());
	
	return d.format("yyyy-mm-dd");
};


/**
 * 문자열 중에 특정문자열 전체 치환
 * @param str1
 * @param str2
 * @returns {String}
 */
String.prototype.replaceAll = function(from, to) {
	var temp_str = "";
	var temp_trim = this.replace(/(^\s*)|(\s*$)/g, "");

	if (temp_trim && from != to) {
		temp_str = temp_trim;
		while (temp_str.indexOf(from) > -1)
			temp_str = temp_str.replace(from, to);
	}

	return temp_str;
};

/**
 * 문자열 트림 처리
 * @returns {String}
 */
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/gi,""); 
};

/**
 * 문자열이 ID형식 인지 체크
 * @returns {Boolean}
 */
String.prototype.isID = function() {
	var pattern = /^[a-z]+[a-z0-9]{4,12}$/g;
	return pattern.test(this) ? true : false;
};

/**
 * 문자열이 한글인지 체크
 * @returns {Boolean}
 */
String.prototype.isHan = function() {
	var pattern = /[가-힝]/;
	return pattern.test(this) ? true : false;
};

/**
 * 문자열이 알파벳인지 체크
 * @returns {Boolean}
 */
String.prototype.isEng = function() {
	var pattern = /^[a-zA-Z]+$/;
	return pattern.test(this) ? true : false;
};

/**
 * 문자열이 숫자인지 체크
 * @returns
 */
String.prototype.isNumber = function() {
	var pattern = /^[0-9]+$/;
	return pattern.test(this) ? true : false;
};

/**
 * 문자열이 날짜인지 체크
 * @returns
 */
String.prototype.isDate = function() {
	
	var value = this;
	var pattern1 = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
	var pattern2 = /^[0-9]{8}$/;
	
	var check = pattern1.test(value) ? 1 : 0;
	if (check == 0) check = pattern2.test(value) ? 2 : 0;
	
	if (check > 0) {
		
		var y;
		var m;
		var d;
		
		if (check == 1) {
			y = value.substring(0,4);
			m = value.substring(5,7);
			d = value.substring(8,10);
		} else if (check == 2) {
			y = value.substring(0,4);
			m = value.substring(4,6);
			d = value.substring(6,8);
		}
		
	    var err = false;
	    var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	    if (y % 1000 != 0 && y % 4 == 0) days[1] = 29;	// 윤년
	    if (d > days[m-1] || d < 1) err = true;			// 날짜 
	    if (m < 1 || m > 12) err = true;				// 월 
	    if (m % 1 != 0 || y % 1 != 0 || d % 1 != 0) err = true; // 정수
	    if (err) {
	    	return false;
	    } 
	} else {
		return false;
	}
	
	return true;
};

/**
 * 문자열이 숫자와 알파벳으로 이루어 졌는지 체크
 * @returns {Boolean}
 */
String.prototype.isAlphaNumber = function() {
	var regExp = /[a-zA-Z0-9-]/;
	for (var i = 0; i < this.length; i++) {
		if (!regExp.test(this.charAt(i))) {
			return false;
		}
	}
	return true;
};

/**
 * 문자열이 알파벳으로 이루어 졌는지 체크
 * @returns {Boolean}
 */
String.prototype.isAlpha = function() {
	var regExp = /[a-zA-Z]/;
	for (var i = 0; i < this.length; i++) {
		if (!regExp.test(this.charAt(i))) {
			return false;
		}
	}
	return true;
};

/**
 * 문자열이 이메일 형식인지 체크
 * @returns {Boolean}
 */
String.prototype.isEmail = function() {
	var pattern = /^[_a-zA-Z0-9-\.]+@[\.a-zA-Z0-9-]+\.[a-zA-Z]+$/;
	return pattern.test(this) ? true : false;
};

/**
 * 문자열이 집전화 또는 핸드폰번호 형식인지 체크
 * @returns {Boolean}
 */
String.prototype.isPhone = function() {
	var pattern = /^(0[2-8][0-5]?|01[01346-9])-?([1-9]{1}[0-9]{2,3})-?([0-9]{4})$/;
	var pattern15xx = /^(1544|1566|1577|1588|1644|1688)-?([0-9]{4})$/;
    return pattern.exec(this) || pattern15xx.exec(this) ? true : false;
};

/**
 * 문자열이 집전화 형식인지 체크
 * @returns {Boolean}
 */
String.prototype.isHomephone = function() {
	var pattern = /^(0[2-8][0-5]?)-?([1-9]{1}[0-9]{2,3})-?([0-9]{4})$/;
	var pattern15xx = /^(1544|1566|1577|1588|1644|1688)-?([0-9]{4})$/;
	return pattern.exec(this) || pattern15xx.exec(this) ? true : false;
};

/**
 * 문자열이 핸드폰번호 형식인지 체크
 * @returns {Boolean}
 */
String.prototype.isHandphone = function() {
	var pattern = /^(01[01346-9])-?([1-9]{1}[0-9]{2,3})-?([0-9]{4})$/;
	return pattern.exec(this) ? true : false;
};

/**
 * 주민번호 형식체크
 * @returns {Boolean}
 */
String.prototype.isJumin = function() {
	var pattern = /^([0-9]{6})-?([0-9]{7})$/;
    var num = this;
    if (!pattern.test(num)) return false;
    num = RegExp.$1 + RegExp.$2;

    var sum = 0;
    var last = num.charCodeAt(12) - 0x30;
    var bases = "234567892345";
    for (var i=0; i<12; i++) {
        if (isNaN(num.substring(i,i+1))) return false;
        sum += (num.charCodeAt(i) - 0x30) * (bases.charCodeAt(i) - 0x30);
    }
    var mod = sum % 11;
    return (11 - mod) % 10 == last ? true : false;
};

String.prototype.abbr = function(len) {
	if (this.length <= len) {
        return this+"";
    }
	
	return this.substring(0, len - 3) + "...";
};

/**
 * 문자열의 바이트수 리턴
 * @returns {Number}
 */
String.prototype.byteLength = function() {
	var l= 0;
	
	for(var idx=0; idx < this.length; idx++) {
		var c = escape(this.charAt(idx));
		
		if ( c.length==1 ) l ++;
		else if ( c.indexOf("%u")!=-1 ) l += 2;
		else if ( c.indexOf("%")!=-1 ) l += c.length/3;
	}
	
	return l;
};

String.prototype.toDate = function(delm) {
	delm = (delm) ? delm : "-";
	var d = this.split(delm);
	
	return new Date(d[0],d[1] - 1,d[2]);
};

String.prototype.stripTag = function() {
	return this.replace(/(<([^>]+)>)/ig,"");
};

String.prototype.betweenDays = function(compare) {
	return Math.round(Math.abs(this.toDate()-compare.toDate())/ONE_DAY);
};
String.prototype.betweenMonths = function(compare) {
	var d1 = this.toDate();
	var d2 = compare.toDate();
	
	var months = (d2.getFullYear()-d1.getFullYear()) * 12;
	months -= d1.getMonth()+1;
	months += d2.getMonth()+1;
	
	return Math.abs(months);
};

String.prototype.zf = function(l) { return '0'.string(l - this.length) + this; };
String.prototype.string = function(l) { var s = '', i = 0; while (i++ < l) { s += this; } return s; };

Number.prototype.zf = function(l) { return this.toString().zf(l); };

/**
 * 날짜의 특정 필드 연산
 * @param field y, m, d
 * @param amount 더하거나 뺄 숫자
 * @returns {Date}
 */
Date.prototype.addDate = function(field, amount) { 
	if (isNaN(amount)) { 
		return false; 
	} 

	amount = new Number(amount); 
	switch(field.toLowerCase()) { 
		case "y": { 
			this.setFullYear(this.getFullYear() + amount); 
			break; 
		}
		case "m": { 
			this.setMonth(this.getMonth() + amount); 
			break; 
		} 
		case "d": { 
			this.setDate(this.getDate() + amount); 
			break; 
		} 
		default: { 
			return false; 
		} 
	} 
	return this; 
};

/**
 * 날짜를 문자열로 변환
 * @param delim ex) (new Date()).toString("-")  --> 2011-06-01
 * @returns {String}
 */
Date.prototype.toString = function(delm) {
	if (!delm) delm = "";
	
	var year = this.getFullYear().toString();
	var month = this.getMonth() + 1;
	var day = this.getDate();

	return year + delm + month.zf(2) + delm + day.zf(2);
};

/**
 * 
 * @param f  yyyy|mm|dd|hh|nn|ss|a/p
 * @returns
 */
Date.prototype.format = function(f) {
    if (!this.valueOf()) return ' ';

    var d = this;

    return f.replace(/(yyyy|mm|dd|hh|nn|ss|a\/p)/gi,
        function($1)
        {
            switch ($1.toLowerCase())
            {
            case 'yyyy': return d.getFullYear();
            case 'mm':   return (d.getMonth() + 1).zf(2);
            case 'dd':   return d.getDate().zf(2);
            case 'hh':   return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case 'nn':   return d.getMinutes().zf(2);
            case 'ss':   return d.getSeconds().zf(2);
            case 'a/p':  return d.getHours() < 12 ? 'a' : 'p';
            }
        }
    );
};

Array.prototype.remove = function(idx) {
	var temp = new Array();
	var i = this.length;

	while (i > idx) {
		var kk = this.pop();
		temp.push(kk);

		i--;
	}

	for ( var i = temp.length - 2; i >= 0; i--) {
		this.push(temp[i]);
	}
};

Array.prototype.contains = function (element) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == element) {
			return true;
		}
	}
	return false;
};


(function($) {

	$.fn.closePopup = function(result) {
		this.overlay().close(null, result);
		
		return this;
	};

	$.fn.reset = function(frm) {
		$(this).on("click", function(e) {
			$(frm+" input:text").val("");
			$(frm+" select").find("option:first").attr("selected", "selected");
		});
	};
	
	$.fn.checkform = function() {
		var base = this;
		U.processJoinField(".item", base);
		
		var chkResult = true;
		
		var V_RESULT = function() {
			this.result = false;
			this.message = "";
			this.isValid = function() {return this.result;};
		};
		
		var V_COMMAND = function(command) {
			this.validator;
			this.args = [];
			
			var idx1 = command.indexOf("(");
			var idx2 = command.indexOf(")");
			if ( idx1>0 ) {
				this.validator = command.substring(0, idx1);
				this.args = command.substring(idx1+1, idx2).split(",");
				this.args = $.map(this.args, function(n) {return (n+"").trim();});
			} else {
				this.validator = command;
			}
		};
		
		var validator = {
			required : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length>0);
				if (!result.result) result.message = _makeMessage("[$1]은(는) 필수입력 항목입니다.", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;

				return result;
			},
			length : function(obj, chkLength) {
				var result = new V_RESULT();
				result.result = (obj.val().getByteLength()==chkLength);
				if (!result.result) result.message = _makeMessage("[$1]은(는) $2글자를 입력해 주세요.", obj.attr("alt"), chkLength);
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			min : function(obj, chkLength) {
				var result = new V_RESULT();
				result.result = (obj.val().getByteLength()>=chkLength);
				if (!result.result) result.message = _makeMessage("[$1]은(는) $2글자 이상 입력해 주세요.", obj.attr("alt"), chkLength);
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			max : function(obj, chkLength) {
				var result = new V_RESULT();
				result.result = (obj.val().getByteLength()<=chkLength);
				if (!result.result) result.message = _makeMessage("[$1]은(는) $2글자 이하로 입력해 주세요.", obj.attr("alt"), chkLength);
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			gt_val : function(obj, val) {
				var result = new V_RESULT();
				
				if ( val[0].isNumber() ) {
					result.result = (parseInt(obj.val())>parseInt(val));
				} else {
					result.result = (obj.val()>val);
				}
				
				if (!result.result) result.message = _makeMessage("[$1]에 $2보다 큰값을 입력해 주세요.", obj.attr("alt"), val);
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			ge_val : function(obj, val) {
				var result = new V_RESULT();
				
				if ( val[0].isNumber() ) {
					result.result = (parseInt(obj.val())>=parseInt(val));
				} else {
					result.result = (obj.val()>=val);
				}
				
				if (!result.result) result.message = _makeMessage("[$1]에 $2보다 큰거나 같은값을 입력해 주세요.", obj.attr("alt"), val);
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			lt_val : function(obj, val) {
				var result = new V_RESULT();
				
				if ( val[0].isNumber() ) {
					result.result = (parseInt(obj.val())<parseInt(val));
				} else {
					result.result = (obj.val()<val);
				}
				
				if (!result.result) result.message = _makeMessage("[$1]에 $2보다 작은값을 입력해 주세요.", obj.attr("alt"), val);
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},

			le_val : function(obj, val) {
				var result = new V_RESULT();
				
				if (obj.val()=="") {
					result.result = true;
					return result;
				}
				
				if ( val[0].isNumber() ) {
					result.result = (parseInt(obj.val())<=parseInt(val));
				} else {
					result.result = (obj.val()<=val);
				}
				
				if (!result.result) result.message = _makeMessage("[$1]에 $2보다 작거나 같은값을 입력해 주세요.", obj.attr("alt"), val);
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			eq : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='"+eqField+"']", base);
				result.result = (obj.val()==eqField.val());
				if (!result.result) result.message = _makeMessage("[$1]와(과) [$2]에 입력된 값이 다릅니다.", obj.attr("alt"), eqField.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			gt : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='"+eqField+"']", base);
				result.result = (obj.val()>eqField.val());
				if (!result.result) result.message = _makeMessage("[$1]은(는) [$2]보다 커야합니다.", obj.attr("alt"), eqField.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			lt : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='"+eqField+"']", base);
				result.result = (obj.val()<eqField.val());
				if (!result.result) result.message = _makeMessage("[$1]은(는) [$2]보다 작아야합니다.", obj.attr("alt"), eqField.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			ge : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='"+eqField+"']", base);
				result.result = (obj.val()>=eqField.val());
				if (!result.result) result.message = _makeMessage("[$1]은(는) [$2]보다 크거나 같아야 합니다.", obj.attr("alt"), eqField.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			le : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='"+eqField+"']", base);
				result.result = (obj.val()<=eqField.val());
				if (!result.result) result.message = _makeMessage("[$1]은(는) [$2]보다 작거나 같아야 합니다.", obj.attr("alt"), eqField.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			empt_le : function(obj, eqField) {
				var result = new V_RESULT();
				eqField = $("[name='"+eqField+"']", base);
				result.result = (obj.val()<=eqField.val()) || eqField.val()=="";
				if (!result.result) result.message = _makeMessage("[$1]은(는) [$2]보다 작거나 같아야 합니다.", obj.attr("alt"), eqField.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			email : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length>0) ? (obj.val().isEmail()) : true;;
				if (!result.result) result.message = _makeMessage("[$1]은(는) 유효한 이메일을 입력해 주세요.", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			phone : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length>0) ? (obj.val().isPhone()) : true;
				if (!result.result) result.message = _makeMessage("[$1]은(는) 유효한 전화번호를 입력해 주세요.", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			num : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length>0) ? (obj.val().isNumber()) : true;
				if (!result.result) result.message = _makeMessage("[$1]은(는) 숫자를 입력해 주세요.", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			alpha : function(obj) {
				var result = new V_RESULT();;
				result.result = (obj.val().trim().length>0) ? (obj.val().isAlpha()) : true;
				if (!result.result) result.message = _makeMessage("[$1]은(는) 영문 문자를 입력해 주세요.", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			jumin : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length>0) ? (obj.val().isJumin()) : true;
				if (!result.result) result.message = _makeMessage("[$1]은(는) 유효한 주민등록번호를 입력해 주세요.", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			ip : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length>0) ? (obj.val().isIP()) : true;
				if (!result.result) result.message = _makeMessage("[$1]은(는) 유효한 IP 주소를 입력해 주세요.", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			id : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length>0) ? (obj.val().isID()) : true;
				if (!result.result) result.message = _makeMessage("[$1]은(는) 영문으로 시작하는 5~12자 영문자 또는 숫자이어야 합니다.", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			date : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length>0) ? (obj.val().isDate()) : true;
				if (!result.result) result.message = _makeMessage("[$1]의 날짜 형식이 다르거나 날짜가 잘못되었습니다. ex)2010-01-01, 20100101", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			},
			// 실수 체크
			double : function(obj) {
				var result = new V_RESULT();
				result.result = (obj.val().trim().length>0) ? (obj.val().isDouble()) : true;
				if (!result.result) result.message = _makeMessage("[$1]은(는) 숫자를 입력해 주세요.", obj.attr("alt"));
				if ( !obj.parent().is(":visible") ) result.result = true;
				
				return result;
			}
		};
		
		function _makeMessage(message) {
			$.each(arguments, function(k, v) {
				if ( k>0 ) message = message.replaceAll("$"+k, v);
			});
			
			return message;
		}
		
		var message = "";
		var target = $("[data-check]", base);
		
		var err_css = {"border-color" : "#dd4b39","background-color" : "#fff"};
		var success_css = {"border-color" : "","background-color" : ""};
		
		$.each(target, function() {
			var formField = $(this);
//			var output = formField.parent().find(".form_error_message");
//			
//			if ( output.length==0 ) {
//				output = $("<span/>").addClass("form_error_message");
//				formField.parent().append(output);
//			}

			var checkList = formField.data("check").split(" ");
			
			$.each(checkList, function(k, v) {
				var cmd = new V_COMMAND(v);
				try{
					var r = validator[cmd.validator](formField, cmd.args);

					if (!r.isValid()) {
//						output.text(r.message);
						message += r.message+"<br/>";
						formField.css(err_css).addClass("error_required");
						chkResult = false;
//						if ( message==null ) message = r.message;
						
						return false;
					} else {
						formField.css(success_css).removeClass("error_required");
						
//						if (formField.siblings("[data-check]").length>0) {}
//						else output.empty();
					}
				}catch(err) {
					alert("지원하지 않는 validation! ["+name+" check attribute를 확인하세요. (" + cmd.validator +")]");
				}
			});
		});
		
		if (!chkResult) {
			U.lobiboxMessage(message, "warning", "필수값 누락");
		}
		
		return chkResult;
	};

	
})(jQuery);

/**
 * @description 여러 필드의 문자열 합치기
 * @param target
 * @param base
 * @author 정준호
 * @date 2017.04.28
 */
U.processJoinField = function(target, base) {
	target = (target == null) ? ".item > .joinable" : target + " > .joinable";
	if (base != null) {
		target = $(target, base);
	} else {
		target = $(target);
	}
	target.each(function() {
		var joinWith = $(this).data("with") == null ? joinWith : $(this).data("with");
		_process($(this), joinWith);
	});

	function _process(items, joinWith) {
		if (items.length == 0) {
			return;
		}
		$.each(items, function(k, v) {
			var joinWith = $(this).data("with") == null ? "@" : $(this).data("with");
			var accept = $(this).data("accept");

			_process($(this).children(".joinable"), joinWith);

			var id = $(this).attr("id");
			var inputs = $(this).children("input,select");
			var sub = $(this).children(".joinable");

			var tmp = [];
			if (inputs.length > 0) {
				$.each(inputs, function() {
					if ($(this).val() != "") {
						tmp.push($(this).val());
					}
				});
			} else if (sub.length > 0) {
				$.each(sub, function() {
					if ($(this).data("joinStr") != "") {
						tmp.push($(this).data("joinStr"));
					}
				});
			}

			var joinedString = tmp.join(joinWith);

			if (accept != null) {
				accept = accept.split(",");
				var chk = false;
				$.each(accept, function(k, v) {
					if (chk) {
						return;
					}
					if (v.toLowerCase() == "ip") {
						chk = joinedString.isIP();
					} else if (v.toLowerCase() == "email") {
						chk = joinedString.isEmail();
					} else if (v.toLowerCase() == "phone") {
						chk = joinedString.isPhone();
					} else if (v.toLowerCase() == "jumin") {
						chk = joinedString.isJumin();
					}
				});

			}

			if (id == null || id == "") {
				$(this).data("joinStr", joinedString);
			} else {
				var hidden = $(this).siblings("input[name='" + id + "']");

				if (hidden.length > 0) {
					hidden.val(joinedString);
				} else {
					var t = $("<input/>").attr({
						type : "hidden",
						name : id,
						value : joinedString
					});

					$(this).parent().append(t);
				}
			}
		});
	}
};

function DateUtil() {
	// *******************************************
	// 월	: 0 ~ 11 ( 1월 ~ 12월 )
	// 요일	: 0 ~  6 (일요일 ~ 토요일)
	// *******************************************
	this.date = null;

    this.setSecond = function(sec) {
        this.date = new Date(sec * 1000);
        return this.date;
    }

    this.setNanosecond = function(ns) {
        this.date = new Date(ns);
        return this.date;
    }

	// 현재시간으로 초기화
	this.setNow = function() {
		this.date = new Date();		
	}
	
	this.setKorToGmt = function() {
		this.date.setHours(this.date.getHours() - 9);
		return this.date;
	}
	
	this.setGmtToKor = function() {
		this.date.setHours(this.date.getHours() + 9);
		return this.date;
	}

	this.getTodayDate = function() {
		this.setNow();
		return this.date;
	}

	// 어제 날짜
	this.getYesterdayDate = function() {
		this.setNow();
		this.subDays(1);
		return this.date;
	}

	// 일주일 전 날짜
	this.getOneWeekBeforeDate = function() {
		this.setNow();
		this.subDays(7);
		return this.date;
	}

	// 이번달 1일 날짜
	this.getFirstDayOfThisMonthDate = function() {
		this.setNow();
		this.date.setDate(1);
		return this.date;
	}

	// 15일 전 날짜
	this.getFifteenDaysBeforeDate = function() {
		this.setNow();
		this.subDays(15);
		return this.date;
	}

	// 30일 전 날짜
	this.getThirtyDaysBeforeDate = function() {
		this.setNow();
		this.subDays(30);
		return this.date;
	}

	// 한달 전 날짜
	this.getOneMonthBeforeDate = function() {
		this.setNow();
		this.subMonth(1);
		return this.date;
	}

	// 1년 전 날짜
	this.getOneYearBeforeDate = function() {
		this.setNow();
		this.date.setYear(this.date.getFullYear() - 1);
		return this.date;
	}

	// 사용자정의 날짜
	this.setCustomDate = function(date) {
		this.date = new Date(date);
		return this.date;
	}

	// this.date 에서 days일 후
	this.sumDays = function(days) {
		this.date.setDate(this.date.getDate() + days);
	}

	// this.date 에서 days일 전
	this.subDays = function(days) {
		this.date.setDate(this.date.getDate() - days);
	}

	// this.date 에서 month개월 후
	this.sumMonth = function(month) {
		this.date.setMonth(this.date.getMonth() + month);
	}

	// this.date 에서 month개월 전
	this.subMonth = function(month) {
		this.date.setMonth(this.date.getMonth() - month);
	}

	// this.date 의 년 setting
	this.setYear = function(year) {
		this.date.setYear(year);
	}

	// this.date 의 월 setting
	this.setMonth = function(month) {
		this.date.setMonth(month);
	}

	// this.date 의 일 setting
	this.setDate = function(days) {
		this.date.setDate(days);
	}

	this.toString = function() {
		if (this.date == null) {
			this.setNow();
		}
		return this.getFormatDate(this.date);
	}

    this.getFormatDate = function(format) {
        var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
		var date = this.date;

        return format.replace(/(yyyy|yy|MM|M|dd|d|EE|E|HH|H|hh|h|mm|m|ss|s|a\/p)/g, function($1) {
			switch ($1) {
				case "yyyy": return date.getFullYear();
				case "MM": return (date.getMonth() + 1).zf(2);
				case "dd": return date.getDate().zf(2);
				case "EE": return weekName[date.getDay()];
				case "HH": return date.getHours().zf(2);
				case "hh": return ((h = date.getHours() % 12) ? h : 12).zf(2);
				case "mm": return date.getMinutes().zf(2);
				case "ss": return date.getSeconds().zf(2);

				case "yy": return (date.getFullYear() % 100).zf(2);
				case "M": return (date.getMonth() + 1);
				case "d": return date.getDate();
				case "E": return weekName[date.getDay()].charAt(0);
				case "H": return date.getHours();
				case "h": return ((h = date.getHours() % 12) ? h : 12);
				case "m": return date.getMinutes();
				case "s": return date.getSeconds();
				case "a/p": return date.getHours() < 12 ? "오전" : "오후";
				default: return $1;
			}
		});
    }
	return this;
}


function NumUtils(number) {
	this.number = 0;
	if (argument.length = 1 && typeof(number) == "number") {
		this.number = number;
	}
};
NumUtils.prototype = new Object();
NumUtils.prototype.convertSize = function(number, size) {
	if (argument.length == 0) {
		
		if (this.number > 1000) {
			return;// TODO: 추후 만들예정
		}
	}
}

var isEmpty = function(value) {
    if (typeof value  == "number") {
        return false;
    } else if ( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length) ) {
        return true;
    } else {
        return false;
    }
};

function isNumber(s) {
  s += '';
  s = s.replace(/^\s*|\s*$/g, '');
  if (s == '' || isNaN(s)) return false;
  return true;
}

U.addOption = function(selector, data) {
    if (data instanceof String) {
        $(selector).append($('<option>', {
            text:data
        }));
    } else if (data instanceof Array) {
        $.each(data, function (idx, item) {
            if(item instanceof Object) {
                $(selector).append($('<option>', {value:Object.keys(item), text:item[Object.keys(item)]}));
            } else {
                $(selector).append($('<option>', {value:idx, text:item}));
            }
        });
    } else if (data instanceof Object) {
        for (var key in data) {
            $(selector).append($('<option>', {value:key, text:data[key]}));
        }
    }
}

U.replaceEmptyText = function(value) {
    return (isEmpty(value)) ? "-":value;
}

U.confirm = function(opt) {
    this.title = opt.title;
    this.message = opt.message;
    if (opt.width) {
        this.width = opt.width;
    } else {
        this.width = 400;
    }
//    this.buttons = {
//        cancel: opt.buttons.cancel,
//        confirm: opt.buttons.confirm
//    };
//    this.callback = opt.func;

    $("#confirm_modal .modal-container").width(this.width);
    $("#confirm_modal .modal-title").text(this.title);
    $("#confirm_modal .modal-body").html(this.message);
    $("#confirm_modal .modal-body").css("padding-top", "15px");
    $("#confirm_modal .modal-body").css("padding-bottom", "12px");
    $("#confirm_modal #confirm").off("click");
    $("#confirm_modal #confirm").on("click", function() {
        opt.func();
        $("#confirm_modal").modal("hide");
    });
    if (opt.cancelFunc) {
        $("#confirm_modal #confirmCancel").off("click");
        $("#confirm_modal #confirmCancel").on("click", function() {
            opt.cancelFunc();
            $("#confirm_modal").modal("hide");
        });
    }
    $("#confirm_modal").modal();
}

U.appendProgress = function(selector) {
    $(selector).html($(".sk-fading-circle")[0].outerHTML);
}

function deleteCookie(cookie_name) {
    document.cookie = cookie_name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
}


/**
 * @description 파일 업로드
 * @author 정준호(2017.04.28)
 * @param opt
 */
U.upload = function(opt) {
	var button = $.type(opt.button) == "string" ? $(opt.button) : opt.button;
	var actionUrl = opt.action ? opt.action : "/file/upload.do";

	if (button.length == 0)
		return;

	new AjaxUpload(button, {
		action : actionUrl,
		name : "upfile",
		autoSubmit : true,
		responseType : "json",
		onChange : function(file, ext) {
			if (opt.allow && opt.allow != "*") {
				if (opt.allow.toLowerCase().indexOf(ext) < 0) {
					U.msg("[" + opt.allow + "] 파일만 업로드 가능합니다.");
					return false;
				}
			}
		},
		onSubmit : function(file, ext) {
			U.msg("업로드중입니다..");
			this.disable();
		},
		onComplete : function(file, result) {
			if (result.error) {
				U.msg(result.error);
				this.enable();
			} else {
				U.msg({
					message : "업로드완료",
					timeout : 500
				});
				result.name = decodeURIComponent(result.name).replaceAll("+", " ");
				this.enable();
				if (opt.success)
					opt.success(result);
			}
		}
	});
};


function fileUpload(opt) {
    if (opt.progress) { U.showProgress(); }
    $.ajax({
        url: '/files/upload',
        type: "POST",
        data: opt.formData,
        processData: false,
        contentType: false,
        success:function(jsonData) {
            if (opt.progress) { U.hideProgress(); }
            if (opt.success) { opt.success(jsonData); }
        }
    });
}



$.fn.loadPage = function(opt) {
    if (opt.progress) {
        U.showProgress();
    }
    this.each(function() {
        var el = $(this);
        var data = $.extend({}, opt.data, {
            layout : "none",
            apply : "y",
            fromaction : "loadpage"
        });
        $.ajax({
            url : opt.url,
            data : data,
            dataType : "html",
            async : true,
            success : function(html) {
                try {
                    var result = jQuery.parseJSON(html);
                    if (result.error) {
                        if (result.error.code == '401') {
                            $.fn.modal.Constructor.DEFAULTS.keyboard = false;
                            U.lobibox("The request you have made requires authentication.", "error", "Unauthorized(401)");
                            $('#loginModal').modal('show');
                            U.hideProgress();
                        } else {
                            if (typeof result.error.message != "undefined") {
                                U.lobibox(result.error.message, "error", result.error.title);
                            } else {
                                for (var key in result.error) {
                                    U.lobibox(result.error[key].message, "error", key + "(" + result.error[key].code + ")");
                                }
                            }
                        }
                    }
                } catch (error) {
                    el.html(html);
                    setup(el);
                    if (opt.success) {
                        opt.success();
                    }
                }
                if (opt.progress) {
                    U.hideProgress();
                }
            },
            error : function(request, status, error) {
//                console.log("error");
                if (request.status != 0) {
                    U.lobibox(request.responseText, "error", error + "(" + request.status + ")");
                    if (opt.progress) {
                        U.hideProgress();
                    }
                }
            }
        });
    });
    return this;
}

//function loadPage(selector, url, type) {
//    U.showProgress();
//	$.ajax({
//		url : url,
//		async : true,
//		type : type,
//		success : function(result) {
//		    $(selector).html(result);
//            U.hideProgress();
//		},
//		error : function(request, status, error) {
//		    if (request.status != 0) {
//                U.lobibox(request.responseText, "error", error + "(" + request.status + ")");
//                U.hideProgress();
//		    }
//		}
//	});
//}

function PopupUtil(opt) {
    U.showProgress();
    var width = 800;
    var data = {"modal_title": opt.title};
    if (opt.width) {
        width = opt.width;
    }
    var show = true;
    if (!isEmpty(opt.show)) {
        show = opt.show;
    }
    if (opt.data) {
        Object.assign(data, opt.data);
    }
    var selector = "#commonModal";
    if (opt.selector) {
        selector = opt.selector
    }
	$(selector).loadPage({
		url : opt.url,
		data : data,
		success : function(result) {
		    $(selector + " .modal-container").width(width);
		    if (opt.class) {
		        $(selector + " .modal-body").addClass(opt.class);
		    }
            U.hideProgress();
            if (opt.tab) {
                opt.tab["selector"] = (opt.tab["selector"]) ? opt.tab["selector"] : selector;
                var tabUtil = new TabUtil(opt.tab);
                tabUtil.run();
            }
            if (show) {
                $(selector).modal();
                if (opt.tab) {
                    $(selector).on("hidden.bs.modal", function() {
                        tabUtil.tabIndex = 0;
                    });
                }
            }

            if (opt.success) {
                opt.success(result);
            }
		},
		error : function(request, status, error) {
		    if (request.status != 0) {
                U.lobibox(request.responseText, "error", error + "(" + request.status + ")");
                U.hideProgress();
		    }
		}
	});
}

function enscroll(selector) {
    $(selector).enscroll({
        showOnHover: false,
        verticalTrackClass: 'track',
        verticalHandleClass: 'handle',
        zIndex:9999999999
    });
}

$.fn.serializeObject = function() {
    var obj = null;
    try {
        if (this[0].tagName && this[0].tagName.toUpperCase() == "FORM") {
            var arr = this.serializeArray();
            if (arr) {
                obj = {};
                jQuery.each(arr, function() {
                    obj[this.name] = this.value;
                });
            }//if ( arr ) {
        }
    } catch (e) {
        alert(e.message);
    } finally {
    }

    return obj;
};

function evalPythonToJS(str) {
    str = str.replace(/u'/g, "'").replace(/True/g, "true").replace(/None/g, "null").replace(/False/g, "false");
//    console.log(str);
    return JSON.parse(str);
}

