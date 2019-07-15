function DataTable (settings) {
    this.selector = settings["selector"];
    this.columns = settings["columns"];
    if ( settings["colgroup"] ) {
        this.colgroup = settings["colgroup"];
    } else {
        this.colgroup = [];
    }
    if ( settings["vertical"] ) {
        this.vertical = settings["vertical"];
    } else {
        this.vertical = false;
    }
    if ( settings["data"] ) {
        this.data = settings["data"];
        this.dataLength = this.data.length;
    } else {
        this.data = null;
        this.dataLength = 0;
    }
    if ( settings["subData"] ) {
        this.subData = settings["subData"];
    } else {
        this.subData = null;
    }
    if ( settings["customHtml"] ) {
        this.html = settings["customHtml"];
    } else {
        this.html = null;
    }
    if ( settings["parseString"] ) {
        this.parseString = settings["parseString"];
    } else {
        this.parseString = {};
    }
    if ( settings["min_row"] ) {
        this.addRowLength = (settings["min_row"] < this.dataLength) ? 0 : settings["min_row"] - this.dataLength;
        this.columnLength = Object.keys(this.columns).length;
    } else {
        this.addRowLength = 0;
    }
    if (settings.class) {
        // this.class = settings.class
        if (!this.vertical) {
            this.class = {
                "th":(( isEmpty(settings.class.th) ) ? "rs_td01" : settins.class.th),
                "td":(( isEmpty(settings.class.td) ) ? ["rs_td02", "rs_td03"] : settins.class.td)
            }
        } else {
            this.class = {
                "th":(( isEmpty(settings.class.th) ) ? "mypage_td01" : settins.class.th),
                "td":(( isEmpty(settings.class.td) ) ? ["mypage_td02", "mypage_td03"] : settins.class.td)
            }
        }
    } else {
        if (!this.vertical) {
            this.class = {
                "th":"rs_td01",
                "td":["rs_td02", "rs_td03"]
            }
        } else {
            this.class = {
                "th":"mypage_td01",
                "td":["mypage_td01", "mypage_td02"]
            }
        }
    }
    

    this.verticalOutput = function() { // TODO: key에 '.'이 포함되있으면 이라는 조건 붙여서 출력해야함
        var columnForm = "<th class='" + this.class.th + " %K'>%C</th>\n";
        var dataForm = "<td class='" + this.class.td[1] + " %K'>%D</td>\n";
        var resultHtml = "";
        var dataTable = this;
        for(var key in this.columns ) {
            resultHtml += "<tr>\n";
            var columnHtml = "";
            var dataHtml = "";
            var column = this.columns[key];
            if ( column instanceof Object ) {
                // 객체일때 여러줄로 출력
                columnHtml = columnForm.replace("%C", column.name).replace("%K", key);
                var data = "";
                $.each(column.dataName, function(dataNameKey, dataNameValue) {
                    if (dataTable.data[key] instanceof Array) { // TODO: 리스트부분 완전잘못됨
                        $.each(dataTable.data[key], function(dataIdx, dataNameObject) {
                            data += dataNameValue + " " + dataNameObject[dataNameKey] + "<br/>";
                        });
                    }else if (dataTable.data[key]) {
                        data += dataNameValue + " " + dataTable.data[key][dataNameKey] + "<br/>";
                    } else {
                        data += dataNameValue + " " + dataTable.data[key + ":" + dataNameKey] + "<br/>";
                    }
                });
                dataHtml = dataForm.replace("%D", data).replace("%K", key);
            } else if ( this.data[key] instanceof Array ) {
                // 배열일때 ul, li태그로 묶어 출력
                columnHtml = columnForm.replace("%C", column).replace("%K", key);
                var data = "<ul>";
                for ( var i = 0; i < this.data[key].length; i++ ) {
                    if (this.data[key][i] instanceof Object) {
                        data += "<li>" + this.data[key][i]["name"] + "</li>";
                    } else {
                        data += "<li>" + this.data[key][i] + "</li>";
                    }
                }
                data += "</ul>";
                dataHtml = dataForm.replace("%D", data).replace("%K", key);
            } else {
                // 변수일때
                var link = "";
                if ( column.indexOf(":link") != -1 ) {
                    /* class 에 link 를 포함 */
                    column = column.replace(":link", "");
                    link = " link";
                }

                columnHtml = columnForm.replace("%C", column).replace("%K", key);
                if (key.indexOf(".") != -1) {
                    var mainKey = key.replace(/\.\w+/g, "");
                    var subKey = key.replace(/\w+(\..+)/g, "$1").replace(".","");
                    dataHtml = dataForm.replace("%D", U.replaceEmptyText(this.data[mainKey][subKey])).replace("%K", key + link);
                } else {
                    if ( this.data[key] instanceof Object ) {
                        for (var dataNameKey in this.data[key] ) {
                            dataHtml = dataForm.replace("%D", this.data[key][dataNameKey]).replace("%K", key + link);
                        }
                        if (Object.keys(this.data[key]).length < 1) {
                            dataHtml = dataForm.replace("%D", "-").replace("%K", key + link);
                        }
                    } else {
                        dataHtml = dataForm.replace("%D", U.replaceEmptyText(this.data[key])).replace("%K", key + link);
                    }
                }
            }
            var data = this.data[key];
            resultHtml += columnHtml;
            resultHtml += dataHtml;
            resultHtml += "</tr>\n";
        }
        return resultHtml;
    }

    this.verticalTwoColOutput = function() {
        var columnForm = "<th class='" + this.class.th + " %K'>%C</th>\n";
        var dataForm = "<td class='" + this.class.td[1] + " %K'>%D</td>\n";
        var resultHtml = "";
        var index = 0;
        for(var key in this.columns ) {
            ++index;
            if (index % 2 == 1) {
                resultHtml += "<tr>\n";
            }
            var columnHtml = "";
            var dataHtml = "";
            var column = this.columns[key];
            if ( column instanceof Object ) {
                // 객체일때 여러줄로 출력
                columnHtml = columnForm.replace("%C", column.name).replace("%K", key);
                var data = "";
                for (var dataNameKey in column.dataName ) {
                    if (this.data[key]) {
                        data += column.dataName[dataNameKey] + " " + this.data[key][dataNameKey] + "<br/>";
                    } else {
                        data += column.dataName[dataNameKey] + " " + this.data[key + ":" + dataNameKey] + "<br/>";
                    }
                }
                dataHtml = dataForm.replace("%D", data).replace("%K", key);
            } else if ( this.data[key] instanceof Array ) {
                // 배열일때 ul, li태그로 묶어 출력
                columnHtml = columnForm.replace("%C", column).replace("%K", key);
                var data = "<ul>";
                for ( var i = 0; i < this.data[key].length; i++ ) {
                    if (this.data[key][i] instanceof Object) {
                        data += "<li>" + this.data[key][i]["name"] + "</li>";
                    } else {
                        data += "<li>" + this.data[key][i] + "</li>";
                    }
                }
                data += "</ul>";
                dataHtml = dataForm.replace("%D", data).replace("%K", key);
            } else {
                // 변수일때
                var link = "";
                if ( column.indexOf(":link") != -1 ) {
                    /* class 에 link 를 포함 */
                    column = column.replace(":link", "");
                    link = " link";
                }

                columnHtml = columnForm.replace("%C", column).replace("%K", key);
                if (key.indexOf(".") != -1) {
                    var mainKey = key.replace(/\.\w+/g, "");
                    var subKey = key.replace(/\w+(\..+)/g, "$1").replace(".","");
                    dataHtml = dataForm.replace("%D", U.replaceEmptyText(this.data[mainKey][subKey])).replace("%K", key + link);
                } else {
                    if ( this.data[key] instanceof Object ) {
                        for (var dataNameKey in this.data[key] ) {
                            dataHtml = dataForm.replace("%D", this.data[key][dataNameKey]).replace("%K", key + link);
                        }
                        if (Object.keys(this.data[key]).length < 1) {
                            dataHtml = dataForm.replace("%D", "-").replace("%K", key + link);
                        }
                    } else {
                        dataHtml = dataForm.replace("%D", U.replaceEmptyText(this.data[key])).replace("%K", key + link);
                    }
                }
            }
            var data = this.data[key];
            resultHtml += columnHtml;
            resultHtml += dataHtml;
            if (index % 2 == 0) {
                resultHtml += "</tr>\n";
            }
        }
        return resultHtml;
    }

    this.horizontalOutput = function () {
        /* 컬럼과 데이터 형식 */
//        var columnForm = "<th class='ind_th01 %K'>%C</th>\n";
//        var dataForm = "<td class='ind_td01 %K'>%D</td>\n";
        var columnForm = "<th class='" + this.class.th + " %K'>%C</th>\n";
        var dataForm = ["<td class='" + this.class.td[0] + " %K'>%D</td>\n", "<td class='" + this.class.td[1] + " %K'>%D</td>\n"];
        var tdClass = this.class.td;
        var resultHtml = "";

        var colgroup = "<colgroup>";
        for (var i = 0; i < this.colgroup.length; i++ ) {
            colgroup += "<col width='" + this.colgroup[i] + "%'/>";
        }
        colgroup += "</colgroup>";

        var columnHtml = "<tr>"; // 컬럼명
        for(var key in this.columns ) {
            var column = this.columns[key];
//            columnHtml += "<th class='ind_th01 " + key + "'>" + column + "</th>\n";
            columnHtml += columnForm.replace("%K", key).replace("%C", column);
        }
        columnHtml += "</tr>";

        var dataHtmlResult = ""; // 데이터
        for (var i = 0; i < this.dataLength; i++) {
            var dataHtml = "";
            for(var key in this.columns ) {
                if (key == "customHtml") {
                    dataHtml += this.createCustomHtml(key, i);
                    continue;
                }
                var column = this.columns[key];
                var link = "";
                if ( column.indexOf(":link") != -1 ) {
                    /* class 에 link 를 포함 */
                    link = " link";
                }
                if ( key.indexOf(".") != -1 ) { // key에 .이 포함되있다면
                    var mainKey = key.replace(/\.\w+/g, "");
                    var subKey = key.replace(/\w+(\..+)/g, "$1");
                    if ( this.data[i][mainKey] instanceof Array ) { // data[i][mainKey] = list
                        dataHtml += "<td class='" + this.class.td[i%2] + " " + key + link + "'><ul>";
                        for (var idx = 0; idx < this.data[i][mainKey].length; idx++ ) {
                            dataHtml += "<li>" + this.data[i][mainKey][idx][subKey.replace(".","")] + "</li>";
                        }
                        dataHtml += "</ul></td>\n";
                    } else if ( typeof this.data[i][mainKey] === "object" ) { // data[i][mainKey] = object
                        if (!isEmpty(this.data[i][mainKey])){
                            if (mainKey == "metadata") {
                                dataHtml += "<td class='" + this.class.td[i%2] + " " + key + link + "'>" + subKey.replace(".","")+ " = " + this.data[i][mainKey][subKey.replace(".","")] + "</td>\n";
                            } else {
                                dataHtml += "<td class='" + this.class.td[i%2] + " " + key + link + "'>" + this.data[i][mainKey][subKey.replace(".","")] + "</td>\n";
                            }
                        } else {
                            dataHtml += "<td class='" + this.class.td[i%2] + " " + key + link + "'>-</td>\n";
                        }
                    } else { // data[i][mainKey] = etc(string)
                        if ( this.data[i][mainKey].indexOf("\n") != -1 ) { // 문자열에 줄바꿈이있으면 []를붙여 리스트형태로 문자열변경
                            this.data[i][mainKey] = "[" + this.data[i][mainKey].replace(/\n/g, ",") + "]";
                        }
                        var jsonData = JSON.parse(this.data[i][mainKey]);
                        if ( jsonData instanceof Array ) { // 파싱한 JSON형태의 데이터 = list
                            // 배열일때 ul, li태그로 묶어 출력
                            var data = "<ul>";
                            for ( var i = 0; i < jsonData.length; i++ ) {
                                data += "<li>" + eval("jsonData[" + i + "]" + subKey) + "</li>";
                            }
                            data += "</ul>";
                            dataHtml += "<td class='" + this.class.td[i%2] + " " + key + link + "'>" + data + "</td>\n";
                        } else { // 파싱한 JSON형태의 데이터 = etc
                            dataHtml += "<td class='" + this.class.td[i%2] + " " + key + link + "'>" + eval("jsonData" + subKey) + "</td>\n";
                        }
                    }
                } else if ( this.data[i][key] instanceof Array && this.subData != null) { // subData = list
                    dataHtml += this.createSubDataByList(key, i);
                } else if ( Object.keys(this.parseString).indexOf(key) != -1 ) { // 출력string replace (key가 parseString에 있으면)
                    dataHtml += "<td class='" + this.class.td[i%2] + " " + key + link + "'>" + this.replaceString(key, i) + "</td>\n";
                } else {
                    dataHtml += "<td class='" + this.class.td[i%2] + " " + key + link + "'>" + (U.replaceEmptyText(this.data[i][key])) + "</td>\n";
                }
            }
            var filter = this.data[i].name;
            var dataHtml = "<tr data-id='"+this.data[i].id+"' data-filter='"+filter+"'>\n" + dataHtml + "</tr>\n";
            dataHtmlResult += dataHtml;
        }
        resultHtml = colgroup + columnHtml + dataHtmlResult;
        resultHtml = resultHtml.replace(":link", "");
        resultHtml += this.appendEmptyMinRow();
        return resultHtml;
    }

    this.createSubDataByList = function(key, i) {
        var data = this.data[i][key];
        var dataHtml = "";
        var dataForm = ["<td class='" + this.class.td[0] + " %K'>%D</td>\n", "<td class='" + this.class.td[1] + " %K'>%D</td>\n"];
        if ( this.subData[key] ) {
            var subData = this.subData[key];
            // 배열일때 ul, li태그로 묶어 출력
            var innerHtml = "";
            if (subData instanceof Array) {
                innerHtml = "<ul>";
                for ( var j = 0; j < data.length; j++) {
                    innerHtml += "<li>";
                    for ( var k = 0; k < subData.length; k++ ) {
                        if (k != 0) {
                            innerHtml += " ";
                        }
                        innerHtml += data[j][subData[k]];
                    }
//                                innerHtml += data[j];
                    innerHtml += "</li>";
                }
                innerHtml += "</ul>";
            } else if (subData == "count") {
                innerHtml = data.length;
            }
            dataHtml += dataForm[i%2].replace("%D", innerHtml).replace("%K", key);
        }
        return dataHtml;
    }

    this.createCustomHtml = function(key, i) {
        var data = this.data[i][key];
        var dataHtml = "";
        var dataForm = ["<td class='" + this.class.td[0] + " %K'>%D</td>\n", "<td class='" + this.class.td[1] + " %K'>%D</td>\n"];
        var innerHtml = "";
        $.each(this.html, function(idx, elem) {
            var tagClass = "";
            var tagID = "";
            var tagText = "";
            var tagData = "";
            var tagOption = "";
            if(elem["class"]) tagClass = "class='" + elem["class"] + "'";
            if(elem["id"]) tagID = "id='" + elem["id"] + "'";
            if(elem["text"]) tagText = elem["text"];
            if(elem["option"]) tagOption = elem["option"];
//            if(elem["data"]) tagData = "='" + elem[""] + "'";
            innerHtml += "<" + elem["tagName"] + " " + tagClass + " " + tagID + " " + tagOption + ">" + tagText + "</" + elem["tagName"] + ">";
//            $('<' + tagName + '/>').append(this.clone()).html();
        });
        dataHtml += dataForm[i%2].replace("%D", innerHtml).replace("%K", "");
        return dataHtml;
    }

    this.replaceString = function(key, i) {
        var data = this.data[i][key];
        var text = "";
        if (this.parseString[key]["type"] == "bool") {
            text = this.parseString[key]["replacement"][(data) ? 0 : 1];
        } else if (this.parseString[key]["type"] == "parse") {
            if (isEmpty(data)) return U.replaceEmptyText(data);
            text = data.replace(this.parseString[key]["replacement"]["reg"], this.parseString[key]["replacement"]["result"]);
        } else if (this.parseString[key]["type"] == "string") {
            text = this.parseString[key]["replacement"][data];
        } else if (this.parseString[key]["type"] == "tooLong") {
            if (data.length > this.parseString[key]["replacement"]["length"]) {
                text += '<div class="simplicity_text">';
                text += data.substr(0, this.parseString[key]["replacement"]["length"]) + "...";
                text += '<span class="tooltip_full_text">' + data + '</span>';
                text += '</div>';
            } else {
                text = data;
            }
        }
        return text;
    }

    this.showDataTable = function() {
        var resultHtml;
        if (this.vertical == true) { /* 데이터를 세로로 출력*/
            resultHtml = this.verticalOutput();
        } else if (this.vertical == "twoVer") {
            resultHtml = this.verticalTwoColOutput();
        } else {
            resultHtml = this.horizontalOutput();
        }
        $(this.selector + " table").html(resultHtml);
    };

    this.setLink = function(url, noHref, fullPath) {
        var linkTagList = $(this.selector + " table .link").get();
        for ( var i = 0; i < linkTagList.length; i++ ) {
            var linkTag = linkTagList[i];
            var beforHtml = (isEmpty(linkTag.innerHTML)) ? "(" + this.data[i].id + ")" : linkTag.innerHTML;
            if (typeof fullPath == "undefined") url = "/dashboard/admin/" + url + "/";
            else if (fullPath) url = fullPath + url + "/";
            else url = "";
            var resultHtml = "<a class=\"list_a01\" href='" + (noHref ? "#" : url + this.data[i].id + "/detail") + "' data-id='" + this.data[i].id + "'>" + beforHtml + "</a>";
            linkTag.innerHTML = resultHtml;
        }
    }

    this.setLinkIdentity = function(url) {
        var linkTagList = $(this.selector + " table .link").get();
        for ( var i = 0; i < linkTagList.length; i++ ) {
            var linkTag = linkTagList[i];
            var beforHtml = linkTag.innerHTML;
            var resultHtml = "<a href='/dashboard/identity/" + url + "/" + this.data[i].id + "'>" + beforHtml + "</a>";
            linkTag.innerHTML = resultHtml;
        }
    }


    this.appendEmptyMinRow = function() {
        var resultHtml = "";
        for (var i = 0; i < this.addRowLength; ++i) {
            resultHtml += "<tr>\n";
            for (var j = 0; j < this.columnLength; ++j) {
                resultHtml += "<td class='" + this.class.td[(this.dataLength + i)%2] + "'>&nbsp;</td>\n";
            }
            resultHtml += "</tr>\n";
        }
        return resultHtml;
    }

    return this;
}


function setFilter(table, input, complete) {
    input.on("keyup", function() {
        var filterString = $(this).val();
        var count = 0;
        var trs = table.find("tr");
        if (filterString.length) {
            trs.each(function() {
                var tr = $(this);
                var filtering = tr.data("filter");
                if (typeof(filtering) != "string") {
                    return;
                }
                if (filtering.indexOf(filterString) >= 0) {
                    tr.show();
                    tr.find("td").removeClass("rs_td0"+((count+1)%2+2)).addClass("rs_td0"+(count%2+2));
                    count++;
                } else {
                    tr.hide();
                }
            });
        } else {
            trs.each(function() {
                var tr = $(this);
                var filtering = tr.data("filter");
                if (typeof(filtering) != "string") {
                    return;
                }
                tr.show();
                tr.find("td").removeClass("rs_td0"+((count+1)%2+2)).addClass("rs_td0"+(count%2+2));
                count++;
            });
        }
        if (complete) complete();
    });
}

function initActionSelect(selects, doAction) {
    selects.each(function() {
        var select = $(this);
        select.prepend("<option class='actionBtn' value='' disabled>"+select.find("option:eq(0)").text()+"</option>");
        select.val("");
        select.on("change", function() {
            var action = select.val();
            if (action == "") return;
            select.val("");
            select.find("option:eq(0)").text(select.find("option[value='"+action+"']").text());
            var contentKey = select.parents("tr").data("content");
            console.log(action + " of " + contentKey);
            doAction(contentKey, action);
        });
    });
}
