// Author Berney Parker
// http://codepen.io/barney-parker/pen/OPyYqy
var options = ["$100", "$10", "$25", "$250", "$30", "$1000", "$1", "$200", "$45", "$500", "$5", "$20", "Lose", "$1000000", "Lose", "$350", "$5", "$99"];


var optionStyles = {
 
    strokeStyle : "#fff",
    lineWidth : 5
    
}











var startAngle = 0;
var arc = Math.PI / (options.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var context;
//
//document.getElementById("spin").addEventListener("click", spin);
$("#balance").text("6500");

function spinMusicStart(){
   var start_wheel_sound = new Audio("sound/wheel.mp3");
   start_wheel_sound.play();
   console.log("Spin music start");
}

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function RGB2Color(r,g,b) {
	return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI*2/maxitem;
  
  red   = Math.sin(frequency*item+2+phase) * width + center;
  green = Math.sin(frequency*item+0+phase) * width + center;
  blue  = Math.sin(frequency*item+4+phase) * width + center;
  
  return RGB2Color(red,green,blue);
}


function drawRouletteWheel() {
  var canvas = $("#canvas");
  if (canvas[0].getContext) {
      
    var outsideRadius = 220;
    var textRadius = 180;
    var insideRadius = 125;

    context = canvas[0].getContext("2d");
    context.clearRect(0,0,canvas[0].width,canvas[0].height);

    
    context.arc(250, 250, 90, 0, 360, false);
    context.fill();
      
    context.strokeStyle = optionStyles.strokeStyle;
    context.lineWidth = 5;

    context.font = 'bold 12px Helvetica, Arial';

    for(var i = 0; i < options.length; i++) {
      var angle = startAngle + i * arc;
      //context.fillStyle = colors[i];
      context.fillStyle = getColor(i, options.length);

      context.beginPath();
      context.arc(250, 250, outsideRadius, angle, angle + arc, false);
      context.arc(250, 250, insideRadius, angle + arc, angle, true);
        
        if (i != options.length - 1 ) {
            context.stroke();
            
        }
            context.fill();

      context.save();
      context.shadowOffsetX = -1;
      context.shadowOffsetY = -1;
      context.shadowBlur    = 0;
      context.shadowColor   = "rgb(220,220,220)";
      context.fillStyle = "black";
        console.log(arc)
        
      context.translate(250 + Math.cos(angle + arc / 2) * textRadius, 
                    250 + Math.sin(angle + arc / 2) * textRadius);
      context.rotate(angle + arc / 2 + Math.PI / 2);
      var text = options[i];
      context.fillText(text, -context.measureText(text).width / 2, 0);
      context.restore();
    } 

    //Arrow
    context.fillStyle = "black";
    context.beginPath();
    context.moveTo(250 - 4, 250 - (outsideRadius + 5));
    context.lineTo(250 + 4, 250 - (outsideRadius + 5));
    context.lineTo(250 + 4, 250 - (outsideRadius - 5));
    context.lineTo(250 + 9, 250 - (outsideRadius - 5));
    context.lineTo(250 + 0, 250 - (outsideRadius - 13));
    context.lineTo(250 - 9, 250 - (outsideRadius - 5));
    context.lineTo(250 - 4, 250 - (outsideRadius - 5));
    context.lineTo(250 - 4, 250 - (outsideRadius + 5));
    context.fill();
  }
}

function spin() {
	$("#balance").text(parseInt($("#balance").text())-500);
	spinAngleStart = Math.random() * 10 + 10;
	spinTime = 0;
	spinTimeTotal = Math.random() * 3 + 4 * 1000;
	rotateWheel();
}

function rotateWheel() {
  spinTime += 30;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 40);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  context.save();
  context.font = 'bold 30px Helvetica, Arial';
  var text = options[index];
  context.fillText(text, 250 - context.measureText(text).width / 2, 250 + 10);
  context.restore();
  addWinningsToBalance(text);
}


function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}

function addWinningsToBalance(text){
	
	if(text!="Lose"){
		var res =  parseInt(text.substring(1, text.length));	
		var balance = parseInt($("#balance").text());
		$("#balance").text(balance+res);
		
		$('#balance').each(function () {
			$(this).prop('Counter',balance).animate({
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

drawRouletteWheel();

