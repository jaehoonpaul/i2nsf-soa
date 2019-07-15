

addGuides = function( e ) {
    // Add click event on the plot area
    e.chart.chartDiv.addEventListener( "click", function() {
        // we track cursor's last known position by "changed" event
        if ( e.chart.lastCursorPosition !== undefined ) {
            var value = parseFloat($(".amcharts-balloon-div-v1").text().replace(/\,/g,""));
            var valueAxes = e.chart.valueAxes[0];
            var guides = valueAxes.guides;
            var alarmType = "critical"; // TODO: 라디오로받아서
            var alarmGuide = guides.filter(function(guide) { return guide.type == alarmType; });

            if ( alarmGuide.length === 0 ) {
//                var guide = new AmCharts.Guide();
//                guide.value = guide.label = value;
                guide.value = value;
                guide.label = alarmType + ":" + value;
                guide.lineAlpha = 0.2;
                guide.lineThickness = 2;
                e.chart.valueAxes[0].addGuide( guide );
                guide.type = alarmType;
                var color = "#00cc00"; // infoColor

                if ( alarmType == "warnning" ) {
                    color = "#cc9900";
                } else if ( alarmType == "danger" ) {
                    color = "#cc5500";
                } else if ( alarmType == "critical" ) {
                    color = "#cc0000";
                }
                guide.lineColor = guide.color = color;
            } else {
                e.chart.valueAxes[0].guides[0].value = value;
                e.chart.valueAxes[0].guides[0].label = alarmType + ":" + value;
            }
            e.chart.validateData();
        }
    });
};