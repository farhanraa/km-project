FR = {
	initialized: false, pgrs: 0, duration: 0, fileItem: false,
	paused: true, thumbDrag: false, volume: 50, isMobile: window.parent.FR.isMobile,
	volumeSlider: false,
	init: function() {
		if (this.initialized) {return false;}
		window.parent.FR.UI.AudioPlayer.app = FR;
		Ext.QuickTips.init();
		var tbarItems = [
			{
				tooltip: FR.T('Shuffle'), iconCls: 'fa fa-random',
				handler: function() {window.parent.FR.UI.gridPanel.store.sort('random');}
			},
			{
				tooltip: FR.T('Previous'), style: 'margin-left:5px;font-size:1.2em',
				iconCls: 'fa fa-fw fa-step-backward',
				id: 'fr-prev-btn',
				handler: this.previousFile, scope: this
			},{
				tooltip: FR.T('Play/Pause'), style: 'margin-left:5px;font-size:1.5em',
				iconCls: 'fa fa-fw fa-play', handler: this.playPause,
				id: 'fr-play-btn', scope: this
			},{
				tooltip: FR.T('Next'), style: 'margin-left:5px;font-size:1.2em',
				id: 'fr-next-btn', iconCls: 'fa fa-fw fa-step-forward',
				handler: this.nextFile, scope: this
			}
		];
		if (this.isMobile) {
			this.volume = 100;
		} else {
			tbarItems.push('->');
			tbarItems.push('<div id="volSlider" style="width:120px;"></div>');
			tbarItems.push('<li class="fa fa-fw fa-large fa-lg fa-volume-up" style="color:#B0B0B0;margin-right:9px;"></li>');
		}
		this.toolbar = new Ext.Toolbar({items: tbarItems});
		this.progress = new Ext.Slider({
			style: 'margin:0 14px 0 7px',
			value: 0,
			minValue: 0,
			maxValue: 100,
			listeners: {
				dragstart: function() {FR.thumbDrag = true;},
				dragend: function() {FR.thumbDrag = false;},
				changecomplete: function(s, newValue) {
					this.song.seek(newValue/100*FR.duration);
				}, scope: this
			}
		});
		this.viewport = new Ext.Viewport({
			layout: 'border',
			items: [
				{
					region: 'west', width: 125,
					html: '<div id="cover"></div>'
				},
				{
					layout: 'border',
					region: 'center',
					items: [
						{
							region: 'north',
							html: '<div style="margin:5px;"><div style="position:relative;height:40px;"><div id="closeBtn"></div><div id="loadInfo">&nbsp;</div><div id="songDur">00:00 / 00:00</div></div><div id="songInfo">&nbsp;</div></div>',
							height: 60
						},
						{
							region: 'center',
							bbar: this.toolbar,
							items: this.progress
						}
					]
				}
			]
		});
		new Ext.Button({
			renderTo: 'closeBtn',
			tooltip: FR.T('Close player'),
			iconCls: 'fa fa-fw fa-close gray',
			handler: function() {
				this.reset();
				with (window.parent) {
					FR.UI.AudioPlayer.close();
				}
			}, scope: this
		});
		if (!this.isMobile) {
			this.volumeSlider = new Ext.Slider({
				renderTo: 'volSlider',
				tooltip: 'Adjust Volume',
				value: 50, minValue: 0, maxValue: 100,
				listeners: {
					change: function (s, newValue) {
						FR.setVolume(newValue);
					}
				}
			});
		}
		this.updater = new Ext.util.DelayedTask(function(){
			FR.setProgress(FR.song.getProgress());
			FR.updateProgress();
			FR.updater.delay(500);
		});

		window.parent.FR.UI.AudioPlayer.onLoad(FR);
		if (window.parent.FR.currentSelectedFile) {
			FR.loadFile(window.parent.FR.currentSelectedFile, Ext.isAndroid);
		}
		this.initialized = true;
	},
	setVolume: function(v) {
		if (this.song) {
			this.song.setVolume(v);
		}
		this.volume = v;
	},
	stopPlayback: function() {
		this.song.stop();
		this.paused = true;
		Ext.getCmp('fr-play-btn').setIconClass('fa fa-fw fa-play');
		this.progress.setValue(0);
		this.reset();
	},
	playPause: function() {
		if (this.paused) {
			this.play();
		} else {
			this.pause();
		}
	},
	pause: function() {
		if (!this.song) {return false;}
		this.updater.cancel();
		Ext.getCmp('fr-play-btn').setIconClass('fa fa-fw fa-play');
		this.song.pause();
		this.paused = true;
	},
	play: function() {
		if (!this.song) {
			this.nextFile();
		} else {
			this.song.play();
		}
		Ext.getCmp('fr-play-btn').setIconClass('fa fa-fw fa-pause');
		this.paused = false;
	},
	setProgress: function(p) {
		FR.pgrs = p;
	},
	setDuration: function(d) {
		FR.duration = d;
	},
	reset: function() {
		this.updater.cancel();
		if (this.song) {
			this.song.destroy();
		}
		this.pgrs = 0;
		this.duration = 0;
		Ext.get('cover').setStyle('backgroundImage', 'url(images/fico/audio.png)');
		Ext.get('songDur').update(FR.formatTime(0) + ' / ' + FR.formatTime(0));
		Ext.get('loadInfo').update('');
		this.progress.setValue(0);
	},
	updateProgress: function() {
		if (FR.duration) {
			if (FR.progress.disabled) {
				FR.progress.enable();
			}
			var perc = FR.pgrs / FR.duration * 100;
			FR.progress.setValue(perc);
			Ext.get('songDur').update(FR.formatTime(FR.pgrs) + ' / ' + FR.formatTime(FR.duration));
		} else {
			Ext.get('songDur').update(FR.formatTime(FR.pgrs) + ' / &infin;');
			if (!FR.progress.disabled) {
				FR.progress.disable();
			}
		}
	},
	formatTime: function(s){
		var min=parseInt(s/60);
		var sec=parseInt(s%60);
		return String.leftPad(min,2,'0')+':'+String.leftPad(sec,2,'0');
	},
	getDurationEstimate: function(song) {
		if (song.instanceOptions.isMovieStar) {
			return (song.duration);
		} else {
			return song.durationEstimate || (song.duration || 0);
		}
	},
	setCoverImage: function() {
		var url = 'images/fico/'+this.fileItem.data.icon;
		if (this.fileItem.data.thumb) {
			url = window.parent.FR.UI.getThumbURL(this.fileItem.data);
		}
		var img = Ext.get(Ext.DomHelper.createDom({tag: 'img'}));
		img.on('load', function () {
			Ext.get('cover').setStyle('backgroundImage', 'url(' + this.getAttribute('src') + ')');
		});
		img.dom.src = url;
	},
	loadFile: function(fileItem) {
		if (fileItem.data.isFolder || fileItem.data.filetype != 'mp3') {return false;}
		this.fileItem = fileItem;
		if (this.song) {this.reset();}
		var ext = window.parent.FR.utils.getFileExtension(fileItem.data.filename);
		Ext.get('songInfo').update(fileItem.data.filenameHTML);
		var url = URLRoot+'/?module=custom_actions&action=audio_player&method=stream&path='+encodeURIComponent(fileItem.data.path);
		this.song = new Song({
			url: url,
			ext: ext,
			volume: this.volume,
			onLoad: function(duration) {
				FR.setDuration(duration);
				FR.updateProgress();
			},
			onPlay: function() {
				FR.setCoverImage();
				FR.updater.delay(0);
			},
			onLoadError: function(id, error) {
				with (window.parent) {FR.UI.feedback(FR.T('Failed to load audio file: %1').replace('%1', error));}
			},
			onEnd: function() {
				FR.nextFile();
			},
			onBuffering: function(percent) {
				if (percent < 100) {
					Ext.get('loadInfo').update('Loading: ' + Math.round(percent) + '%');
				} else {
					Ext.get('loadInfo').update('');
				}
			},
			onMetadata: function() {}
		});
		this.play();
	},
	nextFile: function() {
		var s = window.parent.FR.UI.gridPanel.selModel;
		var v = window.parent.FR.UI.gridPanel.view;
		if (!s.selectNext()) {
			window.parent.FR.UI.gridPanel.selModel.selectFirstRow();
		}
		if (s.last) {
			v.ensureVisible(s.last, 0, false);
		}
	},
	previousFile: function() {
		window.parent.FR.UI.gridPanel.selModel.selectPrevious();
	}
};

var Song = function(opts) {
	this.progress = 0;
	this.duration = 0;

	if ((!Ext.isChrome && !Ext.isGecko) && (opts.ext == 'flac' || opts.ext == 'm4a')) {
		this.aurora = true;
	}
	var onPlay = function() {
		opts.onPlay();
	};

	if (this.aurora) {
		var onLoad = function(duration) {
			this.duration = Math.ceil(duration/1000);
			opts.onLoad(this.duration);
		};
		this.player = AV.Player.fromURL(opts.url);
		this.player.volume = opts.volume;

		this.player.on('ready', function(){
			onLoad(this.duration);
			onPlay();
		});

		var onProgress = function(p) {
			this.progress = Math.ceil(p/1000);
		};
		this.player.on('progress', onProgress.bind(this));

		this.player.on('error', opts.onLoadError.bind(this));
		this.player.on('end', opts.onEnd.bind(this));
		this.player.on('metadata', opts.onMetadata.bind(this));
		this.player.on('buffer', opts.onBuffering.bind(this));

	} else {
		this.player = new Howl({
			src: [opts.url],
			format: [opts.ext],
			volume: (opts.volume / 100),
			preload: true,
			html5: true,
			onload: function() {
				opts.onLoad(this.duration());
			},
			onplay: onPlay.bind(this),
			onloaderror: opts.onLoadError.bind(this),
			onend: opts.onEnd.bind(this)
		});
	}
};
Song.prototype.play = function() {
	this.player.play();
};
Song.prototype.pause = function() {
	this.player.pause();
};
Song.prototype.getDuration = function() {
	return this.duration;
};
Song.prototype.getProgress = function() {
	if (this.aurora) {
		return this.progress;
	}
	return this.player.seek();
};
Song.prototype.destroy = function() {
	this.player.stop();
	if (!this.aurora) {
		this.player.unload();
	}
};
Song.prototype.setVolume = function(v) {
	if (this.aurora) {
		this.player.volume = v;
	} else {
		this.player.volume(v/100);
	}
};
Song.prototype.seek = function(p) {
	this.player.seek(p);
};

Ext.onReady(function(){
	FR.init();
	Ext.fly('loadMsg').fadeOut();
});