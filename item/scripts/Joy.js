
;; void (function (win, doc) {

	var UA = navigator.userAgent,
	    isAndroid = /android|adr/gi.test(UA),
	    isIos = /iphone|ipod|ipad/gi.test(UA) && !isAndroid, // 据说某些国产机的UA会同时包含 android iphone 字符
	    isMobile = isAndroid || isIos;  // 粗略的判断

	win.UAS = {
		isAndroid: isAndroid,
		isIos: isIos
	}

	win.mobileUtil = {
		isAndroid: isAndroid,
		isIos: isIos,
		isMobile: isMobile,

		isNewsApp: /NewsApp\/[\d\.]+/gi.test(UA),
		isWeixin: /MicroMessenger/gi.test(UA),
		isQQ: /QQ\/\d/gi.test(UA),
		isYixin: /YiXin/gi.test(UA),
		isWeibo: /Weibo/gi.test(UA),
		isTXWeibo: /T(?:X|encent)MicroBlog/gi.test(UA),

		tapEvent: isMobile ? 'tap' : 'click',

		fixScreen: function () {
			/// <summary>
			/// 页面适配
			/// </summary>
			var metaEl = doc.querySelector('meta[name="viewport"]'),
			    metaCtt = metaEl ? metaEl.content : '',
			    matchScale = metaCtt.match(/initial\-scale=([\d\.]+)/),
			    matchWidth = metaCtt.match(/width=([^,\s]+)/);

			if (!metaEl) { // REM
				var docEl = doc.documentElement,
				    maxwidth = docEl.dataset.mw || 750, // 每 dpr 最大页面宽度
				    dpr = isIos ? Math.min(win.devicePixelRatio, 3) : 1,
				    scale = 1 / dpr,
				    tid;

				docEl.removeAttribute('data-mw');
				docEl.dataset.dpr = dpr;
				metaEl = doc.createElement('meta');
				metaEl.name = 'viewport';
				metaEl.content = fillScale(scale);
				docEl.firstElementChild.appendChild(metaEl);

				var refreshRem = function () {
					var width = docEl.getBoundingClientRect().width;
					if (width / dpr > maxwidth) {
						width = maxwidth * dpr;
					}
					var rem = width / 16;
					docEl.style.fontSize = rem + 'px';
				};

				win.addEventListener('resize', function () {
					clearTimeout(tid);
					tid = setTimeout(refreshRem, 300);
				}, false)
				win.addEventListener('pageshow', function (e) {
					if (e.persisted) {
						clearTimeout(tid);
						tid = setTimeout(refreshRem, 300);
					}
				}, false);

				refreshRem();
			}
			else if (isMobile && !matchScale && (matchWidth && matchWidth[1] != 'device-width')) { // 定宽
				var width = parseInt(matchWidth[1]),
				    iw = win.innerWidth || width,
				    ow = win.outerWidth || iw,
				    sw = win.screen.width || iw,
				    saw = win.screen.availWidth || iw,
				    ih = win.innerHeight || width,
				    oh = win.outerHeight || ih,
				    ish = win.screen.height || ih,
				    sah = win.screen.availHeight || ih,
				    w = Math.min(iw, ow, sw, saw, ih, oh, ish, sah),
				    scale = w / width;
				if (scale < 1) {
					metaEl.content = metaCtt + ',' + fillScale(scale);
				}
			}

			function fillScale(scale) {
				return 'initial-scale=' + scale + ',maximum-scale=' + scale + ',minimum-scale=' + scale;
			}
		}(),

		/**
		 * 转href参数成键值对
		 * @param href {string} 指定的href，默认为当前页href
		 * @returns {object} 键值对
		 */
		getSearch: function (href) {
			href = href || win.location.search;
			var data = {}, reg = new RegExp("([^?=&]+)(=([^&]*))?", "g");
			href && href.replace(reg, function ($0, $1, $2, $3) {
				data[$1] = $3;
			});
			return data;
		}
	};

	function MyAudio(obj) {
		/// <summary>
		/// AudioContext音乐构造函数
		/// </summary>
		/// <param name="obj" type="type"></param>
		if (!obj) return;
		this.context = new (window.AudioContext || window.webAudioContext || window.webkitAudioContext)();
		this.audioBuffer = null;
		this.source = null;
		this.loop = obj.isLoop;
		var _this = this;
		//下载音乐文件
		var xhr = new XMLHttpRequest();
		xhr.open('GET', obj.src, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function (e) {
			initSound(this.response);
			//下载完成解码操作
			function initSound(arrayBuffer) {
				_this.context.decodeAudioData(arrayBuffer, function (buffer) {
					_this.audioBuffer = buffer;
				}, function (e) {
					console.log('Error decoding file', e);
				});
			}
		};
		xhr.send();
	};

	MyAudio.prototype.play = function () {
		/// <summary>
		/// 音乐播放方法
		/// </summary>
		if (this.audioBuffer) {
			this.source = this.context.createBufferSource();
			this.source.buffer = this.audioBuffer;
			this.source.loop = this.loop;
			this.source.connect(this.context.destination);
			this.source.start(0);
		}
	};

	MyAudio.prototype.stop = function () {
		/// <summary>
		/// 音乐停止方法
		/// </summary>
		if (this.source) {
			this.source.stop(0);
		}
	};
	//检测如果是IOS系统就使用AudioContext音乐对象
	if (isIos) win.musics = {
		mail: new MyAudio({
			src: "audio/mail.mp3"
		}),
		blued: new MyAudio({
			src: "audio/blued.mp3"
		}),
		unlock: new MyAudio({
			src: "audio/unlock.mp3"
		}),
		tockLoop: new MyAudio({
			src: "audio/tock-loop.mp3",
			isLoop: true
		}),
		tink: new MyAudio({
			src: "audio/tink.mp3"
		})
	};

	//调用播放方法
	win.playMusic = function (id) {
		if (isIos) {
			musics[id].play(); //ios 下播放AudioContext
		} else if (isAndroid) {
			doc.getElementById(id).play(); //android 下播放Audio
		} else {
			doc.getElementById(id).play(); //其他 播放Audio
		}
	};

	win.F = {
		enter: function () {
			//如果有本地储存数据 或者 url中有数据就进入结果页面
		},
		domain: function () {
			/// <summary>
			/// 主域名
			/// </summary>
			/// <returns type=""></returns>
			return (!(/\?/.test(location.href)) ? location.href : /([^?]+)\??/.exec(location.href)[1]);
		}(),
		is_object: function (obj) {
			/// <summary>
			/// 检测一个对象是否为空
			/// </summary>
			/// <param name="obj" type="type">要检测的对象</param>
			/// <returns type=""></returns>
			if (!obj) return;
			if (Object.keys(obj).length === 0) return true;
			else return false;
		},
		is_weixn: function () {
			/// <summary>
			/// 检测是否是微信浏览器打开
			/// </summary>
			/// <returns type=""></returns>
			var ua = navigator.userAgent.toLowerCase();
			if (ua.match(/MicroMessenger/i) == "micromessenger") {
				return true;
			} else {
				return false;
			}
		},
		is_value_type: function () {
			/// <summary>
			/// 检测一个值的具体类型
			/// </summary>
			/// <returns type=""></returns>
			return this.toString.call(val).slice(8, this.toString.call(val).length - 1);
		},
		get_query_string: function () {
			/// <summary>
			/// 获取url参数
			/// </summary>
			/// <returns type=""></returns>
			var obj = {};
			var result = location.search.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"));
			if (!result) return obj;
			for (var i = 0; i < result.length; i++) {
				result[i] = result[i].substring(1).split("=");
				var key = decodeURIComponent(result[i][0]),
				        value = decodeURIComponent(result[i][1]);
				var num = Number(value);
				obj[key] = isNaN(num) ? value : num;
			}
			return Object.freeze(obj);
		}(),
		get_window_view: function () {
			/// <summary>
			/// 返回window宽和高
			/// </summary>
			/// <returns type=""></returns>
			var obj = {};
			obj.w = window.innerWidth;
			obj.h = window.innerHeight;
			return obj;
		},
		get_localStorage: function () {
			/// <summar>y
			/// 获取本地储存数据
			/// </summary>
			/// <returns type=""></returns>
			if (!localStorage) return;
			var obj = {};
			for (var i in localStorage) {
				obj[i] = localStorage[i];
			}
			return obj;
		}(),
		set_accredit: function (bool) {
			/// <summary>
			/// 开启微信授权
			/// </summary>
			/// <param name="bool" type="type">是否获取用户信息</param>
			if (this.get_query_string["openid"]) return;
			window["location"]["replace"]("http://weixin.huosu.com/api/index.php?act=authorize&url=" + window["location"]["href"] + "&is_userinfo=" + (bool ? "1" : "0"));
		},
		set_share: function (obj1, obj2, callBack) {
			/// <summary>
			/// 微信自定义分享
			/// </summary>
			/// <param name="obj" type="type">分享好友参数</param>
			/// <param name="obj2" type="type">分享朋友圈参数</param>
			/// <param name="callBack" type="type">分享成功后的回调函数</param>
			var imgUrl = "http://yunfan.huosu.com/customer/boss/icon.jpg"; //上线后改地址
			$.ajax({
				type: "GET", async: true, dataType: "jsonp", url: "http://weixin.huosu.com/api/index.php", data: { act: "sign", }, success: function (obj, info) { wxConfig(obj) },
				error: function () { }
			});
			function wxConfig(obj) {
				wx.config({
					debug: false, appId: obj.data.appId, timestamp: obj.data.timestamp, nonceStr: obj.data.nonceStr, signature: obj.data.signature,
					jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'translateVoice', 'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'onVoicePlayEnd', 'pauseVoice', 'stopVoice', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard']
				});
				wx.ready(function () {
					wx.onMenuShareAppMessage({
						title: obj1.title, desc: obj1.desc, link: obj1.link, imgUrl: imgUrl,
						trigger: function (res) { },
						success: function (res) { callBack && callBack() },
						cancel: function (res) { },
						fail: function (res) { }
					});
					wx.onMenuShareTimeline({
						title: obj2.title, link: obj2.link, imgUrl: imgUrl,
						trigger: function (res) { },
						success: function (res) { callBack && callBack() },
						cancel: function (res) { },
						fail: function (res) { }
					});

				});
			};
		},
		set_ajax: function (data, callback) {
			/// <summary>
			/// 请求Ajax
			/// </summary>
			/// <param name="data" type="type">请求参数</param>
			/// <param name="callback" type="type">回调函数</param>
			$.ajax({
				type: "GET",
				async: false,
				dataType: "jsonp",
				url: "http://mobi.cntosee.com/qiandao/",
				data: data,
				success: function (obj) { if (obj instanceof Object) { callback(obj); } else { console.info("Ajax返回结果类型错误") } },
				error: function () { console.info("Ajax链接失败") }
			});
		},
		set_ajax_yunfan: function (data, callback) {
			/// <summary>
			/// 请求Ajax
			/// </summary>
			/// <param name="data" type="type">请求参数</param>
			/// <param name="callback" type="type">回调函数</param>
			$.ajax({
				type: "GET",
				async: false,
				dataType: "jsonp",
				url: "http://yunfan.huosu.com/customer/boss/api/index.php",
				data: data,
				success: function (obj) { if (obj instanceof Object) { callback(obj); } else { console.info("Ajax返回结果类型错误") } },
				error: function () { console.info("Ajax链接失败") }
			});
		},
		set_localStorage: function (obj) {
			/// <summary>
			/// 设置本地储存
			/// </summary>
			/// <param name="obj" type="type">要设置的参数对象</param>
			if (!obj) return;
			for (var i in obj) localStorage[i] = obj[i];
		},
		remove_localStorage: function () {
			/// <summary>
			/// 删除本地储存
			/// </summary>
			localStorage.removeItem("wendao_id");
			localStorage.removeItem("wendao_title");
			localStorage.removeItem("wendao_desc");
		},

	};


})(window, document);



