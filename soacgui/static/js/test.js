////var meter_name = "cpu_util";
////var data = {
////    "query": [
////        {
////            "field": "resource",
////            "op": "eq",
////            "value": "a5a78de5-8931-4dac-8bd1-a18f6141e68f"
////        },
////    ],
////    "period": 600,
////    "groupby": ["project_id", "resource_id"],
////    "aggregates": {"func":"cardinality", "param":"resource_id"}
////};
////U.ajax({
////    url : "/dashboard/ceilometer/statistics/" + meter_name,
////    data : data,
////    success:function(jsonData) {
////        console.log(jsonData);
////    }
////});
//
//var timeFormat = "yyyy-MM-ddTHH:mm:ss";
//$(function() {
//    //showStatisticsById("a5a78de5-8931-4dac-8bd1-a18f6141e68f");
////	var statistics = new Statistics();
////	var resource_id = "a5a78de5-8931-4dac-8bd1-a18f6141e68f";
////	statistics.getOneDayStatisticsListById(resource_id);
////	statistics.getStatisticsDetailById(resource_id, "cpu");
////    U.ajax({
////        url : "/dashboard/ceilometer/instance_info",
////        data:{"vm_id": "9d3f7a1a-fd78-43d3-8294-5ae0789bf76e"},
////        success:function(jsonData) {
////            console.log(jsonData);
////        }
////    });
//    var security_icon = $("input[name=security_icon]")[0].files[0];
//    var manufacturer_icon = $("input[name=manufacturer_icon]")[0].files[0];
//    $("#submit").on("click", function() {
//        var formData = new FormData();
//        formData.append("security_icon",     security_icon);
//        formData.append("manufacturer_icon", manufacturer_icon);
//        fileUpload({
//            progress:true,
//            formData:formData
//        });
//    });
////    var service_id = "4b72e30c-c832-11e7-a0e4-5065f3f1290c";
////    var server_id = "ec3008df-ecb9-43a6-95df-9a0da27ff0d0";
////    U.ajax({
////        url : "/dashboard/security/search",
////        data:{"data":JSON.stringify({"service_id":service_id, "server_id":server_id})},
////        success:function(jsonData) {
////            console.log(jsonData);
////        }
////    });
////    var data = {
////        "alarm_actions": [
////            "http://192.168.10.25:8080/alarm",
////        ],
////        "alarm_id": null,
////        "description": "An event alarm kkkk",
////        "enabled": true,
////        "insufficient_data_actions": [
////            "http://192.168.10.25:8080/nodata",
////        ],
////        "name": "InstanceStatusAlarm",
////        "event_rule": {
////            "event_type": "compute.instance.update",
////            "query" : [
////                {
////                    "field" : "traits.instance_id",
////                    "type" : "string",
////                    "value" : "9d3f7a1a-fd78-43d3-8294-5ae0789bf76e",
////                    "op" : "eq",
////                },
////                {
////                    "field" : "traits.state",
////                    "type" : "string",
////                    "value" : "error",
////                    "op" : "eq",
////                },
////            ]
////        },
////        "ok_actions": [],
////        "project_id": "227c72fcda1241b59b1241548649700c",
////        "repeat_actions": false,
////        "severity": "moderate",
////        "state": "ok",
////        "type": "event",
////        "user_id": "f266e9e2e0fe43dfb2f9492851d470cd"
////    };
////    var dateUtil = new DateUtil();
//    var data = {
//        'name': 'cpu_delta_alarms4',
//        'description': 'somebody help me!',
//        'threshold_rule': {
//            'meter_name': 'cpu.delta',
//            'statistic': 'avg',
//            'threshold': 29000000000,
//            'query': [
//                {
//                    'field': 'resource',
//                    'value': '9d3f7a1a-fd78-43d3-8294-5ae0789bf76e',
//                    'op': 'eq'
//                }
//            ],
//            'comparison_operator': 'ge',
//        },
//        'type': 'threshold',
////        "time_stamp" : dateUtil.getFormatDate(timeFormat),
//        "project_id": "227c72fcda1241b59b1241548649700c",
//        "user_id": "f266e9e2e0fe43dfb2f9492851d470cd"
//    };
////    U.ajax({
////        url : "/dashboard/telemeter/alarms/create",
////        data: {"data":JSON.stringify(data)},
////        success:function(result) {
////            console.log(result);
////        }
////    });
////    U.ajax({
////        url : "/dashboard/telemeter/alarms/a620ec43-b207-4190-84cd-97351d7f9095/update",
////        data: {"data":JSON.stringify(data)},
////        success:function(result) {
////            console.log(result);
////        }
////    });
////    U.ajax({
////        url : "/dashboard/telemeter/alarms/9d3f7a1a-fd78-43d3-8294-5ae0789bf76e/instance_history",
////        data: {},
////        success:function(result) {
////            console.log(result);
////        }
////    });
//
//});
//
//function Statistics() {
//	var dateUtil = new DateUtil();
//	var fieldList = ["timestamp", "user_id", "resource"]; // 2017-06-02T21:04:01
//
//	var optionList = [
//	//   키     |설명|인덱스
//		"ne", // != 0
//		"ge", // >= 1
//		"le", // <= 2
//		"gt", // >  3
//		"lt", // <  4
//		"eq"  // =  5
//	];
//
//	var meter_names = [						// 인덱스
//		"memory",                           //  0
//		"memory.resident",                  //  1
//
//		"cpu",                              //  2
//		"cpu.delta",                        //  3
//		"cpu_util",                         //  4
//		"vcpus",                            //  5
//
//		"disk.read.requests",               //  6
//		"disk.write.requests",              //  7
//		"disk.read.bytes",                  //  8
//		"disk.write.bytes",                 //  9
//		"disk.read.requests.rate",          // 10
//		"disk.write.requests.rate",         // 11
//		"disk.read.bytes.rate",             // 12
//		"disk.write.bytes.rate",            // 13
//		"disk.root.size",                   // 14
//		"disk.ephemeral.size",              // 15
//		"disk.capacity",                    // 16
//		"disk.allocation",                  // 17
//		"disk.usage",                       // 18
//
//		"network.incoming.bytes",           // 19
//		"network.outgoing.bytes",           // 20
//		"network.incoming.packets",         // 21
//		"network.outgoing.packets",         // 22
//		"network.incoming.bytes.rate",      // 23
//		"network.outgoing.bytes.rate",      // 24
//		"network.incoming.packets.rate",    // 25
//		"network.outgoing.packets.rate"     // 26
//	];
//
//	function createData(query, period, groupby, aggregates) {
//		var data = {};
//		data.query = query;
//		if (arguments.length >= 2) {
//			data.period = period;
//		}
//		if (arguments.length >= 3) {
//			data.groupby = groupby;
//		}
//		if (arguments.length >= 4) {
//			data.aggregates = aggregates;
//		}
//		return data;
//	}
//
//	this.getStatisticsList = function(meter_name, data) {
//		U.ajax({
//			url : "/dashboard/telemeter/statistics/" + meter_name,
//			data : {"data":JSON.stringify(data)},
//			success:function(jsonData) {
//				console.log(jsonData);
//			}
//		});
//	}
//
//	this.getOneDayStatisticsListById = function(resource_id) {
////		var resource_id = "a5a78de5-8931-4dac-8bd1-a18f6141e68f";
//		dateUtil.getYesterdayDate();
//		var query = [
//			{
//				"field": "resource",
//				"op": "eq",
//				"value": resource_id
//			},
//			{
//				"field": "timestamp",
//				"op": "gt",
//				"value": dateUtil.getFormatDate(timeFormat)
//			},
//		];
//		var data = createData(query, 3600);
//		this.getStatisticsList("memory"                  , data);
//		this.getStatisticsList("memory.resident"         , data);
//		this.getStatisticsList("cpu"                     , data);
//		this.getStatisticsList("cpu.delta"               , data);
//		this.getStatisticsList("cpu_util"                , data);
//		this.getStatisticsList("vcpus"                   , data);
//		this.getStatisticsList("disk.read.requests"      , data);
//		this.getStatisticsList("disk.write.requests"     , data);
//		this.getStatisticsList("disk.read.bytes"         , data);
//		this.getStatisticsList("disk.write.bytes"        , data);
//		this.getStatisticsList("disk.read.requests.rate" , data);
//		this.getStatisticsList("disk.write.requests.rate", data);
//		this.getStatisticsList("disk.read.bytes.rate"    , data);
//		this.getStatisticsList("disk.write.bytes.rate"   , data);
//		this.getStatisticsList("disk.root.size"          , data);
//		this.getStatisticsList("disk.ephemeral.size"     , data);
//		this.getStatisticsList("disk.capacity"           , data);
//		this.getStatisticsList("disk.allocation"         , data);
//		this.getStatisticsList("disk.usage"              , data);
//	}
//
//	this.getStatisticsDetailById = function(resource_id, meter_name) {
//		var dateList = [];
//		dateUtil.getYesterdayDate(); // 하루
//		dateList.push(dateUtil.getFormatDate(timeFormat));
//		dateUtil.getOneWeekBeforeDate(); // 일주일
//		dateList.push(dateUtil.getFormatDate(timeFormat));
//		dateUtil.getFirstDayOfThisMonthDate(); // 이번달 오늘까지
//		dateList.push(dateUtil.getFormatDate(timeFormat));
//		dateUtil.getFifteenDaysBeforeDate(); // 15일
//		dateList.push(dateUtil.getFormatDate(timeFormat));
//		dateUtil.getThirtyDaysBeforeDate(); // 30일
//		dateList.push(dateUtil.getFormatDate(timeFormat));
//		dateUtil.getOneYearBeforeDate(); // 1년
//		dateList.push(dateUtil.getFormatDate(timeFormat));
//
//		var query = [
//			{
//				"field": "resource",
//				"op": "eq",
//				"value": resource_id
//			},
//			{
//				"field": "timestamp",
//				"op": "gt",
//				"value": dateList[0]
//			},
//		];
//		var data = createData(query, 3600); // 하루
//		this.getStatisticsList(meter_name, data);
//
//		data.query[1].value = dateList[1]; // 일주일
//		data.period = 43200;
//		this.getStatisticsList(meter_name, data);
//
//		data.query[1].value = dateList[2]; // 이번달 오늘까지
//		data.period = parseInt(dateUtil.getTodayDate().getDate() * 24 * 3600 / 20);// 20개 데이터 나오도록
//		this.getStatisticsList(meter_name, data);
//
//		data.query[1].value = dateList[3]; // 최근15일
//		data.period = 86400;
//		this.getStatisticsList(meter_name, data);
//
//		data.query[1].value = dateList[4]; // 최근30일
//		data.period = 86400;
//		this.getStatisticsList(meter_name, data);
//
//		data.query[1].value = dateList[5]; // 1년
//		data.period = 2592000;
//		this.getStatisticsList(meter_name, data);
//	}
//
//	//this.getStatisticsDetailById
//
//	return this;
//}