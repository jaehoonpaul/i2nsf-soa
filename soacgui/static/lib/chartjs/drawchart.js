/*
    config = {
        type: string,
        options: options,
        data: {labels: [], datasets: []}
    }

    options = {
        responsive: boolean,
        title: {
            display: boolean,
            text: "Chart.js 라인 차트 데모"
        },
        tooltips: {
            mode: 'index',
            intersect: true
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [
                {
                    display: boolean,
                    scaleLabel: {
                        display: boolean,
                        labelString: string
                    }
                }
            ],
            yAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Y라벨'
                    }
                }
            ]
        },
        legend: legend,
        legendCallback: function(chart) {return HTML;}
    }

    legend = {
        display: true,
        position: 'top',
        fullWidth: true,
        onClick: function() {},
        onHover: function() {},
        reverse: false,
        labels: labels
    }

    labels = {
        boxWidth: 40,
        fontSize: 12,
        fontStyle: 'normal',
        fontColor: '#666',
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        padding: 10,
        generateLabels: function() {return legendItemInterface;}
        filter: null,
        usePointStyle: false
    }

    legendItemInterface = {
        text: String,
        fillStyle: Color,
        hidden: Boolean,
        lineCap: String,
        lineDash: Array[Number],
        lineDashOffset: Number,
        lineJoin: String,
        lineWidth: Number,
        strokeStyle: Color,
        pointStyle: String
    }
*/

var ChartMaker = function(opt) {
    this.type = {
        line: 'line',
        bar: 'bar',
        radar: 'radar',
        polarArea: 'polarArea',
        doughnut: 'doughnut',
        pie: 'pie',
        bubble: 'bubble'
    }
    
    this.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)'
    };

    this.displayDateFormats = {
        millisecond: 'h:mm:ss.SSS a',
        second: 'h:mm:ss a',
        minute: 'h:mm a',
        hour: 'hA',
        day: 'MMM D',
        week: 'll',
        month: 'MMM YYYY',
        quarter: '[Q]Q - YYYY',
        year: 'YYYY'
    }
    
    this.selector = "canvas";

    this.config = {
        type: this.type['line'],
        options: {
            responsive: true,
            title: {display: true, text: "Chart.js 라인 차트 데모"},
            tooltips: {mode: 'index', intersect: true,},
            hover: {mode: 'nearest', intersect: true},
            scales: {
                xAxes: [{display: true, scaleLabel: {display: true, labelString: 'X라벨'}}],
                yAxes: [{display: true, scaleLabel: {display: true, labelString: 'Y라벨'}}]
            }
        },
        data: {datasets:[]}
    };

    this.setConfig = function(config) {
        if (config.selector) {this.selector = config.selector;}
        /* config */
        if (config.type) {this.config.type = config.type;}
        /* option */
        if (config.options) {
            chartMaker = this;
            $.each(config.options, function(k, v) {
                chartMaker.config.options[k] = v;
            });
        }

        if (config.title) {this.config.options.title = config.title;}
        if (config.tootips) {this.config.options.tootips = config.tootips;}
        if (config.hover) {this.config.options.hover = config.hover;}

        if (config.scales) {this.config.options.scales = config.scales;}
        if (config.xAxes) {this.config.options.scales.xAxes = config.xAxes;}
        if (config.yAxes) {this.config.options.scales.yAxes = config.yAxes;}

        if (config.legend) {this.config.options.legend = config.legend;}

        /* data */
        if (config.data) {this.setData(config.data);}

        /* custom */
        this.width = 400;
        if (config.width) {this.width = config.width;}
        this.height = 290;
        if (config.height) {this.height = config.height;}
    }
    
    this.setData = function(data) {
        if (isEmpty(data.datasets)) {
            this.config.data.datasets.push({data: data});
        } else {
            this.config.data = data;
        }
        var chartColors = this.chartColors;
        $.each(this.config.data.datasets, function(i, dataset) {
            var colorKeys = Object.keys(chartColors);
//            var colorKey = colorKeys[i % colorKeys.length];
            var colorKey = colorKeys[Number.parseInt(Math.random() * colorKeys.length)];
//                console.log("colorKey: " + colorKey + ", random: " + Number.parseInt(Math.random() * colorKeys.length));
            if (isEmpty(dataset.backgroundColor)) {
                dataset.backgroundColor = chartColors[colorKey];
            }
            if (isEmpty(dataset.borderColor)) {
                dataset.borderColor = chartColors[colorKey];
            }
            if (isEmpty(dataset.fill)) {
                dataset.fill = false;
            }
        });
    }
    
    this.drawChart = function() {
		var selElem;
		if (typeof this.selector == "string") {
		    selElem = $(this.selector);
		} else {
		    selElem = this.selector;
		}
		if (isEmpty(selElem)) {
		    console.log("empty selector", this.selector);
		} else if (isEmpty(selElem.prop("tagName"))) {
		    console.log("empty selector.prop(tagName)", this.selector);
		}
		if (selElem.prop("tagName").toLocaleLowerCase() != "canvas") {
		    selElem.html("");
			var canvas = $("<canvas width='" + this.width + "' height='" + this.height + "'>");
			canvas.appendTo(selElem);
			selElem = canvas;
		}
		this.chart = new Chart(selElem, this.config);
        return this.chart;
    }
    
    this.drawChartTest = function() {
        var data = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: []
        }

        var temp_data = {fill: false, data: []};
        for (var i = 0; i < 8; i++) {
            temp_data.data.push(this.randomScalingFactor());
        }
        for (var i = 0; i < 8; i++) {
            temp_data.label = '데이터' + i;
            data.datasets.push(temp_data);
        }
        this.setConfig({data: data});
        return this.drawChart();
    }

    this.rand = function(min, max) {
        var seed = this._seed;
        min = min === undefined ? 0 : min;
        max = max === undefined ? 1 : max;
        this._seed = (seed * 9301 + 49297) % 233280;
        return min + (this._seed / 233280) * (max - min);
    }

    this.randomScalingFactor = function() {
		return Math.round(this.rand(-100, 100));
	};

    this.setConfig(opt);
    return this;
}