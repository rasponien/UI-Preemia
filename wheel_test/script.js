function addWinningsToBalance(text) {

    if (text != "Lose") {
        var res = parseInt(text.substring(1, text.length));
        var balance = parseInt($("#balance").text());
        $("#balance").text(balance + res);

        $('#balance').each(function () {
            $(this).prop('Counter', balance).animate({
                Counter: $(this).text()
            }, {
                duration: 1000,
                easing: 'swing',
                step: function (now) {
                    $(this).text(Math.ceil(now));
                }
            });
        });

    }
}


//meant for caching colors
String.prototype.hashCode = function () {
    // See http://www.cse.yorku.ca/~oz/hash.html        
    var hash = 5381;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash << 5) + hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
Number.prototype.mod = function (n) {
    return ((this % n) + n) % n;
}


// WHEEL!
var wheel = {



    timerHandle: 0,
    timerDelay: 25,
    snds: [new Audio("sounds/click1.wav"),
        new Audio("sounds/click2.wav"),
        new Audio("sounds/click2.wav"),
        new Audio("sounds/click3.wav"),
        new Audio("sounds/click3.wav"),
        new Audio("sounds/click4.wav"),
        new Audio("sounds/click5.wav"),
        new Audio("sounds/click3.wav"),
        new Audio("sounds/click5.wav"),
        new Audio("sounds/click5.wav"),
        new Audio("sounds/click6.wav")
    ],
    sndix: 0,
    angleCurrent: 0,
    angleDelta: 0,

    size: 290,

    canvasContext: $("#canvas")[0].getContext("2d"),

    colorIncrementor: 0,
    colors: ['#000', '#f00', '#060'],

    segments: [100, 10, 25, 250, 30, 1000, 500, 200, 45, 500, 5, 20, 0, 1000000, 0, 350, 5, 99],
    currentSegment: null,
    //segmentAngle: (Math.PI * 2) / this.segments.length,
    seg_colors: [],
    // Cache of segments to colors
    maxSpeed: Math.PI * 2 / (16 + Math.floor(Math.random() * (20))),

    // How long to spin up for (in ms)
    upTime: 500,
    // How long to slow down for (in ms)
    downTime: 6000,
    spinStart: 0,

    frames: 0,

    centerX: 300,
    centerY: 300,

    spin: function () {

        // Start the wheel only if it's not already spinning
        if (wheel.timerHandle == 0) {
            wheel.spinStart = new Date().getTime();
            wheel.frames = 0;

            wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
        }
    },

    onTimerTick: function () {
        lastSegment = wheel.getCurrentSegment()
        wheel.frames++;
        wheel.draw();

        var duration = (new Date().getTime() - wheel.spinStart);
        var progress = 0;
        var finished = false;

        if (duration < wheel.upTime) {
            progress = duration / wheel.upTime;
            wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2);
        } else {
            progress = duration / wheel.downTime;
            wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2 + Math.PI / 2);
            if (progress >= 1) {
                finished = true;
            };
        }

        // Keep the angle in a reasonable range
        wheel.angleCurrent += wheel.angleDelta;
        wheel.angleCurrent = wheel.angleCurrent % (Math.PI * 2);
        //while (wheel.angleCurrent >= Math.PI * 2)
        //    wheel.angleCurrent -= Math.PI * 2;
    
        
        var currentSegment = wheel.getCurrentSegment();
        var segment = null;
        if (lastSegment != currentSegment) {
            
            snd = wheel.snds[wheel.sndix];
            snd.volume = 0.3;
            snd.play();
            wheel.sndix = (wheel.sndix + 1) % wheel.snds.length ;
        }
        //console.log(currentSegment)
        //wheel.sound.play();
        


        if (finished) {
            clearInterval(wheel.timerHandle);
            wheel.timerHandle = 0;
            wheel.angleDelta = 0;
            $(".wow").text(currentSegment)
            $(".wow").removeClass("wowdark")
            var addedclass = "wowmeh";
            if (currentSegment > 500){
                addedclass = "wowactive"
            }
            $(".wow").addClass(addedclass);
            setTimeout(function () {
                //$(".wow").switchClass("wowactive","wowdark",0.5);
                $(".wow").addClass("wowdark");
                setTimeout(function () {
                    $(".wow").removeClass(addedclass);
                },1000)
            },3500)
        }

    },

    init: function (optionList) {
        try {
            wheel.initCanvas();
            wheel.draw();

        } catch (exceptionData) {
            alert('Wheel is not loaded ' + exceptionData);
        }

    },
    initCanvas: function () {
        var canvas = $('#wheel #canvas')[0];
        //canvas = document.createElement('canvas');
        //$(canvas).attr('width', 1000).attr('height', 600).attr('id', 'canvas').appendTo('.wheel');
        //console.log(canvas)
        //canvas = $.initElement(canvas);
        //console.log(wheel.spin)
        canvas.addEventListener("click", wheel.spin, false);
        wheel.canvasContext = canvas.getContext("2d");
    },


    // Called when segments have changed
    update: function () {
        var r = 0;
        wheel.angleCurrent = ((r + 0.5) / wheel.segments.length) * Math.PI * 2;

        var segments = wheel.segments;
        var len = segments.length;
        var colors = wheel.colors;
        var colorLen = colors.length;

        // Generate a color cache (so we have consistant coloring)
        var seg_color = new Array();
        for (var i = 0; i < len; i++)
            seg_color.push(colors[segments[i].hashCode().mod(colorLen)]);

        wheel.seg_color = seg_color;

        wheel.draw();
    },

    draw: function () {
        wheel.clear();
        wheel.drawWheel();
        wheel.drawNeedle();



    },
    clear: function () {
        wheel.canvasContext.clearRect(0, 0, 1000, 800);
    },
    drawNeedle: function () {

        //shape
        wheel.canvasContext.beginPath();

        wheel.canvasContext.moveTo(wheel.centerX, wheel.centerY - wheel.size);
        wheel.canvasContext.lineTo(wheel.centerX - 20, wheel.centerY - wheel.size - 10);
        wheel.canvasContext.lineTo(wheel.centerX, wheel.centerY - wheel.size + 30);
        wheel.canvasContext.lineTo(wheel.centerX + 20, wheel.centerY - wheel.size - 10);

        wheel.canvasContext.closePath();


        //style
        wheel.canvasContext.lineWidth = 7;
        wheel.canvasContext.strokeStyle = '#888';
        wheel.canvasContext.stroke();

        wheel.canvasContext.fillStyle = '#000';
        wheel.canvasContext.fill();


        //logic - which value needle points to
        var arc = Math.PI / (wheel.segments.length / 2);
        var degrees = (wheel.angleCurrent * 180 / Math.PI) + 90;
        var arcInDegrees = arc * 180 / Math.PI;
        var index = Math.floor((360 - degrees % 360) / arcInDegrees);
        wheel.setCurrentSegment(wheel.segments[index]);


        //needle text - võtame selle kidlasti ära (hetkel jätan sisse, saab vaadata)
        wheel.canvasContext.textAlign = "left";
        wheel.canvasContext.textBaseline = "middle";
        wheel.canvasContext.fillStyle = '#000000';
        wheel.canvasContext.font = "2em Arial";
        wheel.canvasContext.fillText(wheel.segments[index], wheel.centerX + 160, wheel.centerY - wheel.size + 10);
    },

    drawSegment: function (key, lastAngle, angle) {

        var segmentValue = wheel.segments[key];
        var arc = Math.PI / (wheel.segments.length / 2);

        wheel.canvasContext.save();


        //shape
        wheel.canvasContext.beginPath();

        wheel.canvasContext.moveTo(wheel.centerX, wheel.centerY);
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, wheel.size, lastAngle, angle, false);
        wheel.canvasContext.lineTo(wheel.centerX, wheel.centerY); // Now draw a line back to the centre

        wheel.canvasContext.closePath();


        //style
        wheel.canvasContext.shadowColor = "#000"
        wheel.canvasContext.shadowOffsetX = 0;
        wheel.canvasContext.shadowOffsetY = 0;
        wheel.canvasContext.shadowBlur = 30;
        wheel.canvasContext.strokeStyle = "#000"


        if (wheel.colorIncrementor == wheel.colors.length) {
            wheel.colorIncrementor = 0;
        }
        wheel.canvasContext.fillStyle = wheel.colors[wheel.colorIncrementor];
        wheel.colorIncrementor++;

        wheel.canvasContext.fill();

        var gradient = wheel.canvasContext.createRadialGradient(
            wheel.centerX, wheel.centerY, 70, wheel.centerX, wheel.centerY, wheel.size);
        gradient.addColorStop("0", "#fff");
        gradient.addColorStop("1", "#000");
        wheel.canvasContext.lineWidth = 5;
        wheel.canvasContext.strokeStyle = gradient;
        wheel.canvasContext.stroke();



        // draw text
        wheel.canvasContext.save();
        wheel.canvasContext.translate(
            wheel.centerX + Math.cos(lastAngle + arc / 2) * 50,
            wheel.centerY + Math.sin(lastAngle + arc / 2) * 50);
        wheel.canvasContext.rotate((lastAngle + angle) / 2);


        //text style
        wheel.canvasContext.fillStyle = '#fff';
        wheel.canvasContext.fillText(segmentValue, wheel.size / 2 + 20, 0);

        wheel.canvasContext.restore();
    },

    drawWheel: function () {

        var lastAngle = wheel.angleCurrent;

        wheel.canvasContext.textBaseline = "middle";
        wheel.canvasContext.textAlign = "center";

        wheel.canvasContext.font = "25px Arial";
        for (var segment = 1; segment <= wheel.segments.length; segment++) {
            var angle = (Math.PI * 2) * (segment / wheel.segments.length) + wheel.angleCurrent;
            wheel.drawSegment(segment - 1, lastAngle, angle);
            lastAngle = angle;
        }


        // Draw a center circle
        wheel.canvasContext.beginPath();
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, 100, 0, Math.PI * 2, false);
        wheel.canvasContext.closePath();

        wheel.canvasContext.fillStyle = '#f00';
        wheel.canvasContext.fill();

        wheel.canvasContext.beginPath();
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, 100, 0, Math.PI * 2, false);

        wheel.canvasContext.beginPath();
        wheel.canvasContext.lineWidth = 15;
        wheel.canvasContext.shadowBlur = 90
        wheel.canvasContext.shadowColor = '#ff0';
        wheel.canvasContext.strokeStyle = '##F0FF4D';
        wheel.canvasContext.shadowOffsetX = 0;
        wheel.canvasContext.shadowOffsetY = 0;
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, 100, 0, Math.PI * 2, false);
        wheel.canvasContext.stroke();
        wheel.canvasContext.stroke();
        wheel.canvasContext.shadowBlur = 0;


        // Draw outer circle
        wheel.canvasContext.beginPath();
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, wheel.size, 0, Math.PI * 2, false);
        wheel.canvasContext.closePath();

        // Outer circle style
        wheel.canvasContext.lineWidth = 10;
        wheel.canvasContext.strokeStyle = '#222';
        wheel.canvasContext.stroke();


        /*
        //text style
        wheel.canvasContext.fillStyle = '#000000';
        wheel.canvasContext.fillText("SPIN", wheel.centerX, wheel.centerY - 40);
        wheel.canvasContext.fillText("TO", wheel.centerX, wheel.centerY);
        wheel.canvasContext.fillText("WIN", wheel.centerX, wheel.centerY + 40);
        */

    },
    setCurrentSegment: function (currentSegment) {
        wheel.currentSegment = currentSegment;
    },
    getCurrentSegment: function () {
        return wheel.currentSegment;
    },
    disableScrolling: function () {

        $('body').on({
            'mousewheel': function (e) {
                if (e.target.id == 'el') {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
            }
        })

    }
}

window.onload = function () {

    $("#balance").text("6500");
    wheel.disableScrolling();
    wheel.init();


    wheel.update();

}
