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






// Helpers
shuffle = function (o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

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

// List of venues. These are foursquare IDs, with the idea that eventually it'll tie in 
venues = {
    "116208": "Jerry's Subs and Pizza",
    "66271": "Starbucks",
    "5518": "Ireland's Four Courts",
    "392360": "Five Guys",
    "2210952": "Uptown Cafe",
    "207306": "Corner Bakery Courthouse",
    "41457": "Delhi Dhaba",
    "101161": "TNR Cafe",
    "257424": "Afghan Kabob House",
    "512060": "The Perfect Pita",
    "66244": "California Tortilla",
    "352867": "Pho 75 - Rosslyn",
    "22493": "Ragtime",
    "268052": "Subway",
    "5665": "Summers Restaurant & Sports Bar",
    "129724": "Cosi",
    "42599": "Ray's Hell Burger"
};

// WHEEL!
var wheel = {

    timerHandle: 0,
    timerDelay: 25,

    sound: new Audio("sounds/click3.wav"),

    angleCurrent: 0,
    angleDelta: 0,

    size: 290,

    canvasContext: $("#canvas")[0].getContext("2d"),

    colors: ['#ffff00', '#ffc700', '#ff9100', '#ff6301', '#ff0000', '#c6037e',
             '#713697', '#444ea1', '#2772b2', '#0297ba', '#008e5b', '#8ac819'],

    segments: ["$100", "$10", "$25", "$250", "$30", "$1000", "$1", "$200", "$45", "$500", "$5", "$20", "Lose", "$1000000", "Lose", "$350", "$5", "$99"],
    currentSegment: null,

    seg_colors: [],
    // Cache of segments to colors
    maxSpeed: Math.PI * 2 / (16 + Math.floor(Math.random() * (10 - 1)) + 10),

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
        while (wheel.angleCurrent >= Math.PI * 2)
            wheel.angleCurrent -= Math.PI * 2;


        /*
        var currentSegment = wheel.getCurrentSegment();
        var segment = null;
        if (segment == currentSegment) {
            wheel.sound.play();
        }
        segment = currentSegment;
        console.log(currentSegment)
        */


        if (finished) {
            clearInterval(wheel.timerHandle);
            wheel.timerHandle = 0;
            wheel.angleDelta = 0;
        }

    },

    init: function (optionList) {
        try {
            wheel.initWheel();
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

    initWheel: function () {
        shuffle(wheel.colors);
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
        var ctx = wheel.canvasContext;

        ctx.clearRect(0, 0, 1000, 800);
    },

    drawNeedle: function () {
        var ctx = wheel.canvasContext;
        var centerX = wheel.centerX;
        var centerY = wheel.centerY;
        var size = wheel.size;

        ctx.lineWidth = 10;
        ctx.strokeStyle = '#888';
        ctx.fillStyle = '#000';

        ctx.beginPath();

        ctx.moveTo(centerX + 30, centerY - size - 30);
        ctx.lineTo(centerX - 30, centerY - size - 30);
        ctx.lineTo(centerX, centerY - size + 30);
        ctx.closePath();

        ctx.stroke();
        ctx.fill();

        // Which segment is being pointed to?

        var arc = Math.PI / (wheel.segments.length / 2);

        var degrees = (wheel.angleCurrent * 180 / Math.PI) + 90;
        var arcd = arc * 180 / Math.PI;
        var index = Math.floor((360 - degrees % 360) / arcd);

        wheel.setCurrentSegment(wheel.segments[index]);


        // Now draw the winning name
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = '#000000';
        ctx.font = "2em Arial";
        ctx.fillText(wheel.segments[index], centerX + 160, centerY - size + 10);
    },

    drawSegment: function (key, lastAngle, angle) {
        var ctx = wheel.canvasContext;
        var centerX = wheel.centerX;
        var centerY = wheel.centerY;
        var size = wheel.size;

        var segments = wheel.segments;
        var len = wheel.segments.length;
        var colors = wheel.seg_color;

        var value = wheel.segments[key];

        ctx.save();
        ctx.beginPath();



        // Start in the centre
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, size, lastAngle, angle, false); // Draw a arc around the edge
        ctx.lineTo(centerX, centerY); // Now draw a line back to the centre

        //ctx.lineTo()
        // Clip anything that follows to this area
        //ctx.clip(); // It would be best to clip, but we can double performance without it
        ctx.closePath();


        // Assuming your canvas element is ctx
        ctx.shadowColor = "#000" // string
            //Color of the shadow;  RGB, RGBA, HSL, HEX, and other inputs are valid.
        ctx.shadowOffsetX = 0; // integer
        //Horizontal distance of the shadow, in relation to the text.
        ctx.shadowOffsetY = 0; // integer
        //Vertical distance of the shadow, in relation to the text.
        ctx.shadowBlur = 20; // integer
        //Blurring effect to the shadow, the larger the value, the greater the blur.
        ctx.strokeStyle = "#000"



        ctx.fillStyle = wheel.colors[key];
        ctx.fill();
        ctx.stroke();
        var arc = Math.PI / (len / 2);
        // Now draw the text
        ctx.save(); // The save ensures this works on Android devices
        ctx.translate(centerX + Math.cos(lastAngle + arc / 2) * 50,
            centerY + Math.sin(lastAngle + arc / 2) * 50);
        ctx.rotate((lastAngle + angle) / 2);

        ctx.fillStyle = '#000000';
        ctx.fillText(value.substr(0, 20), size / 2 + 20, 0);
        ctx.restore();
    },

    drawWheel: function () {
        var ctx = wheel.canvasContext;

        var angleCurrent = wheel.angleCurrent;
        var lastAngle = angleCurrent;

        var segments = wheel.segments;
        var len = wheel.segments.length;
        var colors = wheel.colors;
        var colorsLen = wheel.colors.length;

        var centerX = wheel.centerX;
        var centerY = wheel.centerY;
        var size = wheel.size;

        var PI2 = Math.PI * 2;

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = "1.4em Arial";

        for (var i = 1; i <= len; i++) {
            var angle = PI2 * (i / len) + angleCurrent;
            wheel.drawSegment(i - 1, lastAngle, angle);
            lastAngle = angle;
        }
        // Draw a center circle
        wheel.canvasContext.beginPath();
        wheel.canvasContext.arc(centerX, centerY, 100, 0, PI2, true);
        wheel.canvasContext.closePath();



        wheel.canvasContext.fillStyle = '#000';
        wheel.canvasContext.strokeStyle = '#fff';
        wheel.canvasContext.shadowBlur = 50;
        wheel.canvasContext.shadowColor = "white";
        wheel.canvasContext.lineWidth = 5;
        wheel.canvasContext.fill();
        wheel.canvasContext.stroke();


        wheel.canvasContext.shadowBlur = 0;


        // Draw outer circle
        wheel.canvasContext.beginPath();
        wheel.canvasContext.arc(centerX, centerY, size, 0, PI2, false);
        wheel.canvasContext.closePath();

        wheel.canvasContext.lineWidth = 10;
        wheel.canvasContext.strokeStyle = '#000000';
        wheel.canvasContext.stroke();
    },


    neonLightEffect: function () {
        var text = "alert('" + String.fromCharCode(0x2665) + "')";
        var font = "30px Futura, Helvetica, sans-serif";
        var jitter = 0; // the distance of the maximum jitter
        var offsetX = 0;
        var offsetY = 0;
        var blur = 10;
        // save state
        wheel.canvasContext.save();
        wheel.canvasContext.font = font;
        // calculate width + height of text-block
        var metrics = wheel.canvasContext.measureText(text);
        // create clipping mask around text-effect
        wheel.canvasContext.rect(offsetX - blur / 2, offsetY - blur / 2,
            offsetX + metrics.width + blur, metrics.height + blur);
        wheel.canvasContext.clip();
        // create shadow-blur to mask rainbow onto (since shadowColor doesn't accept gradients)
        wheel.canvasContext.save();
        wheel.canvasContext.fillStyle = "#fff";
        wheel.canvasContext.shadowColor = "rgba(0,0,0,1)";
        wheel.canvasContext.shadowOffsetX = metrics.width + blur;
        wheel.canvasContext.shadowOffsetY = 0;
        wheel.canvasContext.shadowBlur = blur;
        wheel.canvasContext.fillText(text, -metrics.width + offsetX - blur, offsetY + metrics.top);
        wheel.canvasContext.restore();
        // create the rainbow linear-gradient
        var gradient = wheel.canvasContext.createLinearGradient(0, 0, metrics.width, 0);
        gradient.addColorStop(0, "rgba(255, 0, 0, 1)");
        gradient.addColorStop(0.15, "rgba(255, 255, 0, 1)");
        gradient.addColorStop(0.3, "rgba(0, 255, 0, 1)");
        gradient.addColorStop(0.5, "rgba(0, 255, 255, 1)");
        gradient.addColorStop(0.65, "rgba(0, 0, 255, 1)");
        gradient.addColorStop(0.8, "rgba(255, 0, 255, 1)");
        gradient.addColorStop(1, "rgba(255, 0, 0, 1)");
        // change composite so source is applied within the shadow-blur
        wheel.canvasContext.globalCompositeOperation = "source-atop";
        // apply gradient to shadow-blur
        wheel.canvasContext.fillStyle = gradient;
        wheel.canvasContext.fillRect(offsetX - jitter / 2, offsetY,
            metrics.width + offsetX, metrics.height + offsetY);
        // change composite to mix as light
        wheel.canvasContext.globalCompositeOperation = "lighter";
        // multiply the layer
        wheel.canvasContext.globalAlpha = 0.7
        wheel.canvasContext.drawImage(wheel.canvasContext.canvas, 0, 0);
        wheel.canvasContext.drawImage(wheel.canvasContext.canvas, 0, 0);
        wheel.canvasContext.globalAlpha = 1
            // draw white-text ontop of glow
        wheel.canvasContext.fillStyle = "rgba(255,255,255,0.95)";
        wheel.canvasContext.fillText(text, offsetX, offsetY + metrics.top);
        // created jittered stroke
        wheel.canvasContext.lineWidth = 0.80;
        wheel.canvasContext.strokeStyle = "rgba(255,255,255,0.25)";
        var i = 10;
        while (i--) {
            var left = jitter / 2 - Math.random() * jitter;
            var top = jitter / 2 - Math.random() * jitter;
            wheel.canvasContext.strokeText(text, left + offsetX, top + offsetY + metrics.top);
        }
        wheel.canvasContext.strokeStyle = "rgba(0,0,0,0.20)";
        wheel.canvasContext.strokeText(text, offsetX, offsetY + metrics.top);
        wheel.canvasContext.restore();
    },
    setCurrentSegment: function (currentSegment) {
        wheel.currentSegment = currentSegment;
    },
    getCurrentSegment: function () {
        return wheel.currentSegment;
    }
}

window.onload = function () {

    $("#balance").text("6500");
    wheel.init();


    wheel.update();

}
