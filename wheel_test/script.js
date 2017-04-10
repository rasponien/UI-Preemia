function addWinningsToBalance(amount, duration) {
    if (duration === undefined) {
        duration = 1000;
    }
    var balance = parseInt($("#balance").text());
    $("#balance").text(balance + amount);
    //console.log("Add winnings to balance :" + balance);
    $('#balance').each(function () {
        $(this).prop('Counter', balance).animate({
            Counter: $(this).text()
        }, {
            duration: duration,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
                //$(this).css("font-size",40 + (now % (amount < 10 ? 1 : 5)));
            }
        });

    });




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
Number.prototype.toDegrees = function () {
    return (this * 180) / Math.PI

}






// WHEEL!
var WOW_THRESHOLD = 500;

function togglethresh() {
    WOW_THRESHOLD = -1 * WOW_THRESHOLD;
}
var winsnd1 = new Audio("sounds/winning1.wav");
var winsnd2 = new Audio("sounds/winning2.wav");
var wheel = {

    timerHandle: 0,
    timerDelay: 25,
    snds: [
        new Audio("sounds/click1.wav"),
        new Audio("sounds/click2.wav"),
        new Audio("sounds/click3.wav"),
        new Audio("sounds/click4.wav"),
        new Audio("sounds/click5.wav"),
        new Audio("sounds/click6.wav")
    ],
    sndix: 0,
    angleCurrent: 0,
    angleDelta: 0,

    size: 350,
    innerCircleSize: 130,
    textPosFromCenter: 125,

    canvasContext: $("#canvas")[0].getContext("2d"),

    colorIncrementor: 0,
    colors: ['#000', '#f00', '#060'],
    segments: [1500, 150, 50, 350, 5000, 100, 500, 200, 10, 700, 3, 20, 1, 100000, 0, 350, 2, 99],
    degreesPerSegment: 0,
    currentSegment: null,


    // Cache of segments to colors
    maxSpeed: Math.PI * 2 / (16 + Math.floor(Math.random() * (20))),

    // How long to spin up for (in ms)
    upTime: 500,
    // How long to slow down for (in ms)
    downTime: 6000,
    spinStart: 0,

    frames: 0,

    centerX: 380,
    centerY: 380,

    spin: function () {
        // deduct spin cost
        $("#balance").text(parseInt($("#balance").text()) - 500);
        // Start the wheel only if it's not already spinning
        $(".btn-spin").addClass("push");
        setTimeout(function () {
            if (wheel.timerHandle == 0) {
                wheel.spinStart = new Date().getTime();
                wheel.frames = 0;
                $("#score-container").css("display", "block");


                wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
            }
        }, 175)

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
            wheel.sndix = (wheel.sndix + 1) % wheel.snds.length;
        }


        if (finished) {
            setTimeout(function () {
                $(".btn-spin").removeClass("push")
            }, 1000)
            banner = $(".wow");
            clearInterval(wheel.timerHandle);
            wheel.timerHandle = 0;
            wheel.angleDelta = 0;

            banner.text(currentSegment);
            banner.removeClass("wowdark");
            var LINGER = 3500;
            var addedclass = "wowmeh";
            var winning_sound;
            var addFadeout = false;
            var soundDuration;
            if (currentSegment > WOW_THRESHOLD) {
                // http://freesound.org/people/lukaso/sounds/69682/
                winning_sound = winsnd2;
                winning_sound.volume = 0.35;
                soundDuration = winning_sound.duration;

                addFadeout = true;

                if (currentSegment > 3 * WOW_THRESHOLD) {
                    addedclass = "wowmega";

                    LINGER = 5500;
                } else {
                    LINGER = 4500;
                    addedclass = "wowactive";
                }
            } else {
                winning_sound = winsnd1;
                //winning_sound = new Audio("sounds/oneCoin.wav");
                // http://freesound.org/people/FenrirFangs/sounds/213978/ --oneCoin.wav
            }

            if (currentSegment > 0) winning_sound.play();
            // Audio fadeout
            if (addFadeout) {
                var fadeDelay = soundDuration * 1000 * 0.6;
                var fadeDuration = soundDuration * 1000 * 0.4;
                var fadeInterval = fadeDuration / 20;
                setTimeout(function () {
                    interval = setInterval(function () {
                        if (fadeDuration <= 0) clearInterval(interval);
                        fadeDuration -= fadeInterval;
                        winning_sound.volume = Math.max(0, winning_sound.volume - 0.35 * 0.05);
                    }, fadeInterval)
                }, fadeDelay)
            }

            banner.addClass(addedclass);
            setTimeout(function () {
                addWinningsToBalance(currentSegment, LINGER - 1250)
            }, 500);
            setTimeout(function () {
                //banner.switchClass("wowactive","wowdark",0.5);
                banner.addClass("wowdark");
                setTimeout(function () {
                    $(".wow").removeClass(addedclass);
                    $("#score-container").css("display", "none");
                    banner.removeClass(addedclass);
                }, 1000)
            }, LINGER)
        }

    },

    init: function () {
        try {
            wheel.initCanvas();
            wheel.draw();

        } catch (exceptionData) {
            alert('Wheel is not loaded ' + exceptionData);
        }

    },
    initCanvas: function () {
        var canvas = $('#canvas')[0];
        canvas.addEventListener("click", wheel.spin, false);
        wheel.setDegreesPerSegment((Math.PI * 2) / wheel.segments.length);
    },


    // Called when segments have changed
    update: function () {
        var r = 0;
        wheel.angleCurrent = (0.5 / wheel.segments.length) * Math.PI * 2;

        // Generate a color cache (so we have consistant coloring)
        var seg_color = new Array();
        for (var i = 0; i < wheel.segments.length; i++) {
            seg_color.push(wheel.colors[wheel.segments[i].toString().hashCode().mod(wheel.colors.length)]);
            wheel.seg_color = seg_color;
            wheel.draw();
        }
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

        //logic (which value needle points to)
        var degrees = wheel.angleCurrent.toDegrees() + 90;
        var arcInDegrees = wheel.getDegreesPerSegment().toDegrees();
        var index = Math.floor((360 - degrees % 360) / arcInDegrees);
        wheel.setCurrentSegment(wheel.segments[index]);

    },

    drawSegment: function (key, lastAngle, angle) {

        wheel.canvasContext.save();

        //shape
        wheel.canvasContext.beginPath();
        wheel.canvasContext.moveTo(wheel.centerX, wheel.centerY);
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, wheel.size, lastAngle, angle, false);
        wheel.canvasContext.lineTo(wheel.centerX, wheel.centerY);
        wheel.canvasContext.closePath();

        //style
        wheel.canvasContext.shadowColor = "#000"
        wheel.canvasContext.shadowOffsetX = 0;
        wheel.canvasContext.shadowOffsetY = 0;
        wheel.canvasContext.strokeStyle = "#000"
        wheel.canvasContext.shadowBlur = 30;
        wheel.canvasContext.stroke();

        //color
        if (wheel.colorIncrementor == wheel.colors.length) {
            wheel.colorIncrementor = 0;
        }
        wheel.canvasContext.fillStyle = wheel.colors[wheel.colorIncrementor];
        wheel.colorIncrementor++;
        wheel.canvasContext.fill();
        var gradient = wheel.canvasContext.createRadialGradient(
            wheel.centerX, wheel.centerY, 70,
            wheel.centerX, wheel.centerY, wheel.size);
        gradient.addColorStop("0", "#fff");
        gradient.addColorStop("1", "#000");
        wheel.canvasContext.lineWidth = 5;
        wheel.canvasContext.strokeStyle = gradient;
        wheel.canvasContext.stroke();

        // draw text
        wheel.canvasContext.save();
        wheel.canvasContext.translate(
            wheel.centerX + Math.cos(lastAngle + wheel.getDegreesPerSegment() / 2) * wheel.textPosFromCenter,
            wheel.centerY + Math.sin(lastAngle + wheel.getDegreesPerSegment() / 2) * wheel.textPosFromCenter);
        wheel.canvasContext.rotate((lastAngle + angle) / 2);

        //text style
        wheel.canvasContext.fillStyle = '#fff';
        wheel.canvasContext.fillText(wheel.segments[key], wheel.size / 2 + 20, 0);

        wheel.canvasContext.restore();
    },

    drawWheel: function () {

        var lastAngle = wheel.angleCurrent;

        wheel.canvasContext.textBaseline = "middle";
        wheel.canvasContext.textAlign = "right";
        wheel.canvasContext.font = "25px Arial";
        for (var segment = 1; segment <= wheel.segments.length; segment++) {
            var angle = (Math.PI * 2) * (segment / wheel.segments.length) + wheel.angleCurrent;
            wheel.drawSegment(segment - 1, lastAngle, angle);
            lastAngle = angle;
        }


        // Draw a center circle
        wheel.canvasContext.beginPath();
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, wheel.innerCircleSize, 0, Math.PI * 2, false);
        wheel.canvasContext.closePath();

        wheel.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.72)';
        wheel.canvasContext.fill();

        wheel.canvasContext.beginPath();
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, wheel.innerCircleSize, 0, Math.PI * 2, false);


        /*
        wheel.canvasContext.beginPath();

        wheel.canvasContext.lineWidth = 19;
        wheel.canvasContext.shadowBlur = 90
        wheel.canvasContext.shadowColor = '#0fa';
        wheel.canvasContext.shadowOffsetX = 0;
        wheel.canvasContext.shadowOffsetY = 0;
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, wheel.innerCircleSize, 0, Math.PI * 2, false);
        wheel.canvasContext.stroke();
        wheel.canvasContext.stroke();
        wheel.canvasContext.shadowBlur = 0;
        */
        wheel.canvasContext.lineWidth = 9;
        wheel.canvasContext.strokeStyle = '#222';
        wheel.canvasContext.stroke();
        
        

        // Draw outer circle
        wheel.canvasContext.beginPath();
        wheel.canvasContext.arc(wheel.centerX, wheel.centerY, wheel.size, 0, Math.PI * 2, false);
        wheel.canvasContext.closePath();

        // Outer circle style
        wheel.canvasContext.lineWidth = 10;
        wheel.canvasContext.strokeStyle = '#222';
        wheel.canvasContext.stroke();


    },
    setCurrentSegment: function (currentSegment) {
        wheel.currentSegment = currentSegment;
    },
    getCurrentSegment: function () {
        return wheel.currentSegment;
    },
    setDegreesPerSegment: function (degreesPerSegment) {
        wheel.degreesPerSegment = degreesPerSegment;
    },
    getDegreesPerSegment: function () {
        return wheel.degreesPerSegment;
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
    /* disable cancer music
    var start_wheel_sound = new Audio("sounds/jackson5.mp3");
    start_wheel_sound.volume=0.1;
	start_wheel_sound.play();
    */
    wheel.update();

}
