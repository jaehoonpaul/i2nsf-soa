var meter_names = [							// 인덱스
    "memory",                           //  0
    "memory.resident",                  //  1
    "cpu",                              //  2
    "cpu.delta",                        //  3
    "cpu_util",                         //  4
    "vcpus",                            //  5
    "disk.read.requests",               //  6
    "disk.write.requests",              //  7
    "disk.read.bytes",                  //  8
    "disk.write.bytes",                 //  9
    "disk.read.requests.rate",          // 10
    "disk.write.requests.rate",         // 11
    "disk.read.bytes.rate",             // 12
    "disk.write.bytes.rate",            // 13
    "disk.root.size",                   // 14
    "disk.ephemeral.size",              // 15
    "disk.capacity",                    // 16
    "disk.allocation",                  // 17
    "disk.usage",                       // 18
    "network.incoming.bytes",           // 19
    "network.outgoing.bytes",           // 20
    "network.incoming.packets",         // 21
    "network.outgoing.packets",         // 22
    "network.incoming.bytes.rate",      // 23
    "network.outgoing.bytes.rate",      // 24
    "network.incoming.packets.rate",    // 25
    "network.outgoing.packets.rate",    // 26
    "image",                            // 27
    "image.size",                       // 28
];
var networkMeterName = ['network.incoming.bytes','network.outgoing.bytes','network.incoming.packets','network.outgoing.packets','network.incoming.bytes.rate','network.outgoing.bytes.rate','network.incoming.packets.rate','network.outgoing.packets.rate'];
var meter_name_map = {
        "memory":[
            "memory",
            "memory.resident",
        ],
        "cpu":[
            "cpu",
            "cpu.delta",
            "cpu_util",
            "vcpus",
        ],
        "disk":[
            "disk.read.requests",
            "disk.write.requests",
            "disk.read.bytes",
            "disk.write.bytes",
            "disk.read.requests.rate",
            "disk.write.requests.rate",
            "disk.read.bytes.rate",
            "disk.write.bytes.rate",
            "disk.root.size",
            "disk.ephemeral.size",
            "disk.capacity",
            "disk.allocation",
            "disk.usage",
        ],
        "network":[
            "network.incoming.bytes",
            "network.outgoing.bytes",
            "network.incoming.packets",
            "network.outgoing.packets",
            "network.incoming.bytes.rate",
            "network.outgoing.bytes.rate",
            "network.incoming.packets.rate",
            "network.outgoing.packets.rate"
        ],
    };

var initChartMeterName = {
    "memory": false,
    "cpu": false,
    "disk": false,
    "network": false
}
var progressHtml = '';
progressHtml += '<div class="sk-fading-circle">';
progressHtml += '    <div class="sk-circle1 sk-circle"></div>';
progressHtml += '    <div class="sk-circle2 sk-circle"></div>';
progressHtml += '    <div class="sk-circle3 sk-circle"></div>';
progressHtml += '    <div class="sk-circle4 sk-circle"></div>';
progressHtml += '    <div class="sk-circle5 sk-circle"></div>';
progressHtml += '    <div class="sk-circle6 sk-circle"></div>';
progressHtml += '    <div class="sk-circle7 sk-circle"></div>';
progressHtml += '    <div class="sk-circle8 sk-circle"></div>';
progressHtml += '    <div class="sk-circle9 sk-circle"></div>';
progressHtml += '    <div class="sk-circle10 sk-circle"></div>';
progressHtml += '    <div class="sk-circle11 sk-circle"></div>';
progressHtml += '    <div class="sk-circle12 sk-circle"></div>';
progressHtml += '</div>';

function cancelBtn() {
	U.alert({
		title : "취소",
		message : "작업중인 데이터를 전부 지우고 리스트 페이지로 이동하시겠습니까?",
		result : function(result) {
			if(result){
				location.href = "/dashboard/telemeter/alarms/";
			}
		}
	});
}