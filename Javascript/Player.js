var ScreenWidth = 960;
var ScreenHeight = 540;

var VideoWidth = 0;
var VideoHeight = 0;
var VideoDuration = 0;
var modeName="";

var Player = {
	plugin : null,
	state : -1,
	stopCallback : null,

	STOPPED : 0,
	PLAYING : 1,
	PAUSED : 2,
	FORWARD : 3,
	REWIND : 4,
	duration : 0,
    current_time : 0,
};

Player.init = function() {
	var success = true;

	this.state = this.STOPPED;
	this.plugin = document.getElementById("pluginPlayer");
//	this.mwPlugin = document.getElementById("pluginObjectTVMW");

        if (!this.plugin )
        {
        success = false;
        }
/*        if (!this.mwPlugin || !this.mwPlugin.GetSource) 
        {
        success = false;
        } 
        else 
		{
        this.originalSource = this.mwPlugin.GetSource();
        this.mwPlugin.SetMediaSource();
        }
        */
	this.setWindow();

	this.plugin.OnCurrentPlayTime = 'Player.setCurTime';
	this.plugin.OnStreamInfoReady = 'Player.setTotalTime';
	this.plugin.OnBufferingStart = 'Player.onBufferingStart';
	this.plugin.OnBufferingProgress = 'Player.onBufferingProgress';
	this.plugin.OnBufferingComplete = 'Player.onBufferingComplete';

	return success;
};
Player.onBufferingComplete = function() 
{
   alert("onBufferingComplete");
};   

Player.onBufferingProgress = function(percent)
{
	alert ("buffering progress = "+percent);
};
Player.onBufferingStart =function()
{
	alert ("buffering start");
};
Player.deinit = function()
{
	if (this.plugin)
		this.plugin.Stop();
//	if(this.mwPlugin != null)  this.mwPlugin.SetMediaSource(this.originalSource);
};


// переключение типа полноэкранного режима, значения от 1 до 5
Player.setScreenMode = function(modesize) {
	VideoWidth = this.plugin.GetVideoWidth();
	VideoHeight = this.plugin.GetVideoHeight();
	if (VideoWidth <= 0 || VideoHeight <= 0) return -1;

	var wCorr = VideoWidth < (VideoHeight * 4 / 3) ? VideoHeight * 4 / 3 : VideoWidth ;
	
	var crop = {
		x : 0,
		y : 0,
		w : VideoWidth ,
		h : VideoHeight
	};
	var disp = {
		x : 0,
		y : 0,
		w : ScreenWidth,
		h : ScreenHeight
	};
 //   this.plugin.SetCropArea(0, 0, 0, 0);

    var result = ((!modesize) ? 1 : modesize) + "";

	switch (result) {
	case "1":
		if ( VideoWidth/VideoHeight < 16/9 ) {
			modeName="Mode-1 4x3.";
			var h1 = wCorr * 9 / 16;
			crop = {
				x : 0,
				y : parseInt( (VideoHeight - h1) / 2),
				w : VideoWidth ,
				h : parseInt(h1)
			};
		} else {
			modeName="Mode-1 16x9.";
			var w1 = VideoHeight * 16 / 9;
			crop = {
				x : parseInt( (VideoWidth - w1) / 2),
				y : 0,
				w : parseInt(w1),
				h : VideoHeight
			};
		}
		break;
	case "2":
		if (VideoWidth/VideoHeight < 16/9 ) {
			modeName="Mode-2 4x3.";
			var h1 = ScreenHeight;
			var w1 = h1 * wCorr / VideoHeight;
			var x = (ScreenWidth - w1) / 2;
			if (x < 0)
				x = 0;
			disp = {
				x : parseInt(x),
				y : 0,
				w : parseInt(w1),
				h : parseInt(h1)
			};
		} else {
			modeName="Mode-2 16x9.";
			var w1 = ScreenWidth;
			var h1 = w1 * VideoHeight / VideoWidth;
			var y = (ScreenHeight - h1) / 2;
			if (y < 0)
				y = 0;
			disp = {
				x : 0,
				y : parseInt(y),
				w : parseInt(w1),
				h : parseInt(h1)
			};
		}
		;
		break;
	case "3":
		modeName="Mode-3 16x9 Zoom.";
		crop = {
			x: parseInt(0.0625* VideoWidth),
			y: parseInt(0.0625* VideoHeight),
			w: parseInt(0.875 * VideoWidth),
			h: parseInt(0.875 * VideoHeight),
		};
		break;
	case "4":
		modeName="Mode-4 Zoom.";
		crop = {
			x : 80,
			y : 80,
			w : VideoWidth  - 160,
			h : VideoHeight - 160
		};
		break;
	case "5":
		modeName="Mode-5 14x9.";
		crop = {
			x : 0,
			y : parseInt(0.0625 * VideoHeight),
			w : VideoWidth ,
			h : parseInt(0.875 * VideoHeight)
		};
		break;
	default:
		break;
}

	this.plugin.SetDisplayArea(disp.x, disp.y, disp.w, disp.h);
	this.plugin.SetCropArea(crop.x, crop.y, crop.w, crop.h);
	currentStatusLineText = modeName+" Video: "+VideoWidth+"x"+VideoHeight+"("+parseInt(1000*VideoWidth/VideoHeight)/1000 +") wCorr:"+wCorr +" ***** Dx:"+disp.x+
		" Dy:"+disp.y+" Dw:"+disp.w+" Dh:"+disp.h+ " ***** Cx:" + crop.x+ " Cy:" + crop.y+ " Cw:" + crop.w+ " Ch:" + crop.h;
	Display.statusLine (currentStatusLineText);
/*	alert ("{APP}setscreenmode modesize="+modesize);
	alert ("{APP}setscreenmode GVW="+VideoWidth);
	alert ("{APP}setscreenmode GVH="+VideoHeight);
	alert ("{APP}setscreenmode wCorr="+wCorr);
	alert ("{APP}setscreenmode result="+result);
	alert ("{APP}setscreenmode modeName="+modeName);
	alert ("{APP} Dx:" + disp.x);
	alert ("{APP} Dy:" + disp.y);
	alert ("{APP} Dw:" + disp.w);
	alert ("{APP} Dh:" + disp.h);

	alert ("{APP} Cx:" + crop.x);
	alert ("{APP} Cy:" + crop.y);
	alert ("{APP} Cw:" + crop.w);
	alert ("{APP} Ch:" + crop.h);*/
	if (this.state == this.PAUSED) {this.plugin.Pause();}
	return result;
};

Player.playVideo = function() // играть
{
	this.state = this.PLAYING;

	this.plugin.Play(url);
	Display.showplayer();
	Main.setFullScreenMode();
	Player.setFullscreen();
//	this.plugin.SetDisplayArea(0, 0, ScreenWidth, ScreenHeight);
//	Display.statusLine ( "VideoWidth: "+VideoWidth+" VideoHeight:"+VideoHeight);
};
Player.setWindow = function() // видео скрыто
{this.plugin.SetDisplayArea(0,0, 0, 0); };

Player.setFullscreen = function() // полноэкранный режим
{this.plugin.SetDisplayArea(0, 0, ScreenWidth, ScreenHeight);};

Player.pauseVideo = function() // пауза
{
	this.state = this.PAUSED;
	this.plugin.Pause();
	Display.showplayer();
	document.getElementById("but_pause").style.display="block";
	document.getElementById("but_play").style.display="none";
};

Player.stopVideo = function() // стоп
{
	// Display.setTime(0);
	if (this.state != this.STOPPED) {
		this.plugin.Stop();
		this.state = this.STOPPED;
		if (this.stopCallback) {
			// this.stopCallback();
		}
		Main.setWindowMode(); 
		document.getElementById("main").style.display = "block";
		Display.hideplayer();
	}
};

Player.resumeVideo = function() // стоп кадр
{
	this.state = this.PLAYING;
	this.plugin.Resume();
    Display.showplayer();
	document.getElementById("but_pause").style.display="none";
	document.getElementById("but_play").style.display="block";
};

Player.getState = function() // текущее состояние
{
	return this.state;
};

Player.skipForwardVideo = function() {

	this.skipState = this.FORWARD;
	this.plugin.JumpForward(30);
	Display.showplayer();
};

Player.skipForwardVideoFast = function() {

	this.skipState = this.FORWARD;
	this.plugin.JumpForward(120);
	Display.showplayer();
};

Player.skipBackwardVideo = function() {

	this.skipState = this.REWIND;
	this.plugin.JumpBackward(30);
	Display.showplayer();
};

Player.skipBackwardVideoFast = function() {

	this.skipState = this.REWIND;
	this.plugin.JumpBackward(120);
	Display.showplayer();
};

Player.PercentJump = function(percent) 
{
                if(this.jump==0)
                {
                    this.statusmessage = percent*10 + "%";
                    var jump_to_minutes = (this.duration*percent/10 - this.current_time)/1000;
                                if (jump_to_minutes > 0)
                                {
                                    this.plugin.JumpForward(jump_to_minutes); 
                                    this.jump=1;
                                }
                                else if (jump_to_minutes < 0)
                                {
                                    this.plugin.JumpBackward(jump_to_minutes*-1);
                                    this.jump=1;

                                }
                                widgetAPI.putInnerHTML(Display.statusDiv,(this.statusmessage));
                                if(this.jump==1)
                                {
                                    this.state = this.PAUSA;
                                    Display.showplayer();
                                    clearTimeout(Display.loadingshow_timer);
                                }
                }
};

// функция таймера проигрывания трека, вызывается плагином:
// plugin.OnCurrentPlayTime
	Player.setCurTime = function(time) {
	Display.setTime(time);
};
// функция размера трека, вызывается плагином: plugin.OnStreamInfoReady

Player.setTotalTime = function() {
	VideoDuration = Player.plugin.GetDuration();
	VideoWidth = Player.plugin.GetVideoWidth();
	VideoHeight = Player.plugin.GetVideoHeight();
	Display.setTotalTime(VideoDuration);
	//Display.statusLine ( "StreamInfoReady. Video: "+VideoWidth+"x"+VideoHeight+" ScreenMode: "+currentFSMode);
	Player.setScreenMode (currentFSMode);
};