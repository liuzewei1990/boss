/// <reference path="Joy.js" />
document.body.addEventListener('touchmove', bodyPreventDefault, false);
function bodyPreventDefault(event) {
	event.preventDefault();
}

var imgUrl = "images/boss.jpg";

//获取用户信息
var WX_USER = {
	openid: F.get_query_string["openid"],
	name: F.get_query_string["nickname"],
	headerUrl: F.get_query_string["headimgurl"] || imgUrl
};

console.log(WX_USER);
F.set_share({
	title: "一封来自Boss直聘的邀请函",
	desc: "其他999个Boss都去了......",
	link: F.domain
}, {
	title: "一封来自Boss直聘的邀请函",
	link: F.domain
}, function () {
	F.set_ajax_yunfan({ act: "share" }, function () { });
});
var isOverflow = true;
var s = "cubic-bezier(0,.78,.32,1.08)";
var ajaxDataBase64 = "";
var GlabalHeaderUrl = "";
function fadeInP2(index, callBack) {
	/// <summary>
	/// 聊天窗口消息调用
	/// </summary>
	/// <param name="index" type="type">图片编号</param>
	/// <param name="callBack" type="type">发送成功的回调</param>
	var p2 = $(".page2");
	var img = new Image();
	img.onload = function () {
		//填充元素并返回元素集合
		var oLis = p2.find($(".p2_newsList").append('<li><img src="' + this.src + '" alt="Alternate Text" /></li>').find("li"));

		oLis.eq(oLis.size() - 1).css({ height: "0px" }).show(1, function () {
			//撑开消息内容
			playMusic("mail");
			var oImgHeight = $(this).find("img").height();
			$(this).animate({ height: oImgHeight + "px" }, 300, function () {
				callBack();
			});
			//如果消息高度溢出了使新的消息向上顶
			var top = $(this).position().top + oImgHeight,
			 inputHeight = p2.find(".input").height(),
			 maxHeight = p2.height() - inputHeight;
			if (top > maxHeight && isOverflow) {
				console.log("超了");
				$(".newsContainer").css({ bottom: inputHeight + "px" });
				$(".p2_newsList").css({ bottom: "0%" });
				isOverflow = false;
			}
		})
	};
	img.src = "images/p2_news_" + index + ".png";
}

function fadeInP1(index) {
	/// <summary>
	/// 首页消息调用方法
	/// </summary>
	/// <param name="index" type="type">图片编号</param>
	var img = new Image();
	img.onload = function () {
		$($(".p1_newsList").prepend('<li><img src="' + this.src + '" alt="Alternate Text" /></li>').find("li")[0]).css({ height: "0px" }).show(1, function () {
			playMusic("mail");
			var height = $(this).find("img").height();
			$(this).animate({ height: height + "px" }, 300);
		})
	};
	img.src = "images/news_" + index + ".png";
}

function timer(time) {
	/// <summary>
	/// //Promise状态控制
	/// </summary>
	/// <param name="time" type="type">延迟加载的时间</param>
	return new Promise(function (resolve, reject) {
		setTimeout(resolve, time);
	});
}

function drawCanvas(headerImgUrl, nickName, callBack) {
	var oC = document.createElement("canvas");
	var scale = 0.8;
	oC.width = 750 * scale;
	oC.height = 1334 * scale;
	var cTx = oC.getContext("2d");

	var background = new Image();
	var headerImg = new Image();
	background.onload = headerImg.onload = function () {
		this.isLoaded = true;
		if (background.isLoaded && headerImg.isLoaded) {
			var y = 475 * scale, r = 80 * scale;
			//绘制头像
			cTx.fillStyle = "#000";
			cTx.arc(oC.width / 2, y, r - 2, 0, Math.PI / 180 * 360, true);
			cTx.fill();
			cTx.globalCompositeOperation = "source-atop";
			cTx.drawImage(headerImg, oC.width / 2 - r, y - r, r * 2, r * 2);
			cTx.globalCompositeOperation = "destination-over";
			cTx.drawImage(background, 0, 0, oC.width, oC.height);
			//绘制文字
			cTx.globalCompositeOperation = "source-atop";
			cTx.font = "28px 微软雅黑";
			cTx.fillStyle = "#000";
			cTx.textAlign = "center";
			cTx.textBaseline = "middle";
			cTx.fillText(nickName, oC.width / 2, y + r + 60 * scale);
			var resultBase64 = oC.toDataURL();
			//回调
			setTimeout(function () {
				callBack(resultBase64);
			}, 500);
		}
	};
	background.src = "images/p5Bg_" + Math.floor(Math.random() * 3 + 1) + ".jpg";
	headerImg.src = headerImgUrl;
}

function titleSet(titleStr) {
	/// <summary>
	/// title重新设置
	/// </summary>
	/// <param name="title" type="type">新title</param>
	if (UAS.isIos) {
		var $body = $("body");
		document.title = titleStr;
		var $iframe = $('<iframe src="/favicon.ico"></iframe>');
		$iframe.on('load', function () {
			setTimeout(function () {
				$iframe.off('load').remove();
			}, 0);
		}).appendTo($body);
	} else {
		document.title = titleStr;
	}
}

function fadeInResultPage(url) {
	var oImg = new Image();
	oImg.onload = function () {
		$(".pace").remove();
		$(".page4").remove();
		$(".page5").append('<img src="' + this.src + '" alt="" /><p>长按保存图片</p>').fadeIn(500);
	}
	oImg.src = url;
}

//加载器
Pace.options = {
	ajax: false,
	document: false,
	eventLag: false,
};
Pace.on('done', function () {
	$(".pace").fadeOut(500);

	//首屏开始
	timer(500)
	    .then(function () {
	    	F.set_ajax_yunfan({ act: "uv", openid: WX_USER.openid }, function () { });
	    	F.set_ajax_yunfan({ act: "pv" }, function () { });
	    	$(".page1").fadeIn(500); return timer(1000);
	    })
	//发送消息
	    .then(function () { fadeInP1(1); return timer(1000) })
	    .then(function () { fadeInP1(2); return timer(800) })
	    .then(function () { fadeInP1(3); return timer(800) })
	    .then(function () { fadeInP1(4); return timer(800) })
	    .then(function () { fadeInP1(5); return timer(0) })
	    .then(function () {
	    	return new Promise(function (resolve, reject) {
	    		$(".page1").on("touchend", function () {
	    			$(this).hide(1, function () {
	    				resolve();
	    			});
	    			playMusic("unlock");
	    		})
	    	});
	    })
	 //进入启动页面
	    .then(function () { $(".page1").remove(); $(".start-up").show(); return timer(1000) })
	 //进入聊天窗口
	    .then(function () {
	    	$(".page2").show();
	    	//设置title页面标题
	    	titleSet("Boss直聘融资发布会（10）");
	    	return new Promise(function (resolve) {
	    		$(".start-up").fadeOut(500, function () {
	    			$(this).remove();
	    			setTimeout(resolve, 1000);
	    		});
	    	});
	    })

	 //发送聊天消息
	    .then(function () { return new Promise(function (resolve) { fadeInP2(1, function () { setTimeout(resolve, 800) }) }) })
	    .then(function () { return new Promise(function (resolve) { fadeInP2(2, function () { setTimeout(resolve, 900) }) }) })
	    .then(function () { return new Promise(function (resolve) { fadeInP2(3, function () { setTimeout(resolve, 800) }) }) })
	    .then(function () { return new Promise(function (resolve) { fadeInP2(4, function () { setTimeout(resolve, 900) }) }) })
	    .then(function () { return new Promise(function (resolve) { fadeInP2(5, function () { setTimeout(resolve, 800) }) }) })
	    .then(function () { return new Promise(function (resolve) { fadeInP2(6, function () { setTimeout(resolve, 900) }) }) })
	    .then(function () { return new Promise(function (resolve) { fadeInP2(7, function () { setTimeout(resolve, 800) }) }) })
	    .then(function () { return new Promise(function (resolve) { fadeInP2(8, function () { setTimeout(resolve, 900) }) }) })
	    .then(function () { return new Promise(function (resolve) { fadeInP2(9, function () { setTimeout(resolve, 800) }) }) })
	    .then(function () { return new Promise(function (resolve) { fadeInP2(10, function () { setTimeout(resolve, 900) }) }) })
	    .then(function () {
	    	//最后一条对话消息处理
	    	return new Promise(function (resolve) {
	    		var oImg = new Image();
	    		oImg.onload = function () {
	    			playMusic("mail");
	    			$(".p2_newsList").append($("#boss").html())
				    .find(".wx_name").html(WX_USER.name).end()
				    .find(".header").html('<img src="' + this.src + '" alt="Alternate Text" />')
	    			setTimeout(resolve, 2000)
	    		};
	    		oImg.src = "images/boss.jpg";
	    	})
	    })
	 //弹出虚拟键盘
	    .then(function () {
	    	return new Promise(function (resolve) {

	    		$(".inputContainer").find(".send").show(1).end().find(".hidden").animate({ height: $(".key").height() + "px" }, function () {
	    			$(".newsContainer").animate({ bottom: ($(".key").height() + $(this).prev().height()) + "px" }, 200);
	    			$(this).find(".key").addClass("keyAnimate");
	    			playMusic("tockLoop");
	    			//打字机效果
	    			var input = $(this).prev();
	    			input.html("");
	    			var txt = "哈哈，给我留个前排座位。";
	    			var str = "";
	    			for (var i = 0; i < txt.length; i++) {
	    				(function (i) {
	    					setTimeout(function () {
	    						str += txt[i];
	    						input.html("").html(str);
	    					}, 200 * i + 500);
	    				})(i);
	    			}
	    			//文字打完后停止动画
	    			setTimeout(function () {
	    				$(".hidden").find(".key").css({ backgroundPositionY: "0%" }).removeClass("keyAnimate");
	    				if (UAS.isIos) musics["tockLoop"].stop();
	    				resolve();
	    			}, 2900);
	    		});
	    	});
	    })
	 //显示蒙层 提示用户点击发送按钮
	    .then(function () {
	    	return new Promise(function (resolve) {
	    		$(".shadow").show().find(".mask").on("touchend", function () {
	    			playMusic("tink");
	    			resolve();
	    		})
	    	});
	    })
	 //显示用户发送的消息
	    .then(function () {
	    	$(".shadow").hide();
	    	$(".input").text("");
	    	return new Promise(function (resolve) {
	    		var oImg = new Image();
	    		oImg.onload = function () {
	    			playMusic("mail");
	    			$(".p2_newsList").append($("#self").html())
				    .find(".self").find("span").html(WX_USER.name).end()
				    .find(".header").html('<img src="' + this.src + '" alt="Alternate Text" />');
	    			setTimeout(resolve, 2000);//2秒后进入介绍页
	    		};
	    		oImg.src = WX_USER.headerUrl;
	    	});
	    })
	//进入介绍页
	    .then(function () {
	    	$(".page2").remove();
	    	titleSet("Boss直聘融资发布会");
	    	//预加载P3的动画帧
	    	var oImg = new Image();
	    	oImg.onload = function () {
	    		$(".page3").show();
	    	};
	    	oImg.src = "images/mdds.png";

	    	return new Promise(function (resolve) {
	    		$(".page3").find(".mdds").on("webkitAnimationEnd", function () {
	    			setTimeout(resolve, 500)
	    		})
	    	});
	    })
	    .then(function () { $(".mdds").css({ top: "3%", opacity: 1 }); return timer(200); })
	    .then(function () { $(".p3_1").css({ top: "17%", opacity: 1 }); return timer(300); })
	    .then(function () { $(".p3_2").css({ top: "25%", opacity: 1 }); return timer(200); })
	    .then(function () { $(".p3_3").css({ top: "31%", opacity: 1 }); return timer(500); })
	    .then(function () {
	    	//解绑 Body 的默认行为
	    	document.body.removeEventListener('touchmove', bodyPreventDefault, false);
	    	$(".p3_4").css({ top: "36%", opacity: 1 });
	    	return new Promise(function (resolve) {
	    		//点击报名
	    		$(".signBtn").on("click", function () {
	    			$(".pace").css({ zIndex: "-10000" });
	    			playMusic("tink");
	    			//检测是否已经报过名
	    			$.ajax({
	    				type: "GET",
	    				async: false,
	    				dataType: "jsonp",
	    				url: "http://yunfan.huosu.com/customer/boss/api/index.php",
	    				data: {
	    					act: "getpic",
	    					openid: WX_USER.openid
	    				},
	    				success: function (obj) {
	    					if (obj instanceof Object) {
	    						if (obj.code == 200) {
	    							var url = obj.data.data;
	    							$(".page3").remove();
	    							fadeInResultPage(url);
	    						}
	    						if (obj.code == 300) {
	    							resolve();
	    						}

	    					} else { console.info("Ajax返回结果类型错误") }
	    				},
	    				error: function () { console.info("Ajax链接失败") }
	    			});

	    		});
	    	});
	    })
	.then(function () {
		$(".page3").remove();
		$("body").scrollTop(0);

		var p4 = $(".page4");
		var currEle = null;
		p4.fadeIn(500);
		var inputs = p4.find("input[type=text]").each(function (i, ele) {
			$(ele).on("focus", function () {
				if (currEle) currEle.removeClass("checkend");
				$(this).val("").css({ color: "#FFF" }).addClass("checkend");
				currEle = $(this);
			});
		});
		var u_name = $("#u_name"), g_name = $("#g_name"), u_zhiwei = $("#u_zhiwei"), u_eamil = $("#u_eamil"), u_phone = $("#u_phone");
		var formData = {};
		p4.fadeIn(800, function () {

			//提前处理微信头像保存本地服务器
			$.ajax({
				type: "GET",
				async: false,
				dataType: "jsonp",
				url: "http://yunfan.huosu.com/customer/boss/api/index.php",
				data: {
					act: "photo",
					photo: decodeURIComponent(WX_USER.headerUrl)
				},
				success: function (obj) {
					if (obj instanceof Object) {
						if (obj.code == 200) GlabalHeaderUrl = obj.data;
						else GlabalHeaderUrl = "images/wx.png";
					} else { console.info("Ajax返回结果类型错误") }
				},
				error: function () { console.info("Ajax链接失败") }
			});

		});

		return new Promise(function (resolve) {
			p4.find("#btn").on("click", function () {
				playMusic("tink");
				//遍历检查哪个文本没有填写
				for (var i = 0; i < inputs.size() ; i++) {
					var currInput = inputs.eq(i);
					if (currInput.val() === "" || currInput.val() === currInput.attr("data-info")) {
						currInput.val(currInput.attr("data-info")).css({ color: "red" });
						return;
					}
				}
				////验证邮箱
				if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(u_eamil.val())) {
					u_eamil.val("邮箱地址填写错误").css({ color: "red" });
					return;
				}
				//验证手机号
				if (!(/^1[3|4|5|7|8]\d{9}$/.test(u_phone.val()))) {
					u_phone.val("手机号格式不正确").css({ color: "red" });
					return;
				}
				//存入对象
				inputs.each(function (i, ele) {
					formData[ele.id] = $(ele).val();
				});
				//显示处理中...
				$(".pace").css({ backgroundColor: "rgba(0,0,0,0.7)", top: $("body").scrollTop() + "px" }).css({ zIndex: "1000" }).show(1, function () {
					$(this).find(".pace-progress").removeAttr("data-progress-text").html("请稍等...");
					document.body.addEventListener("touchmove", bodyPreventDefault, false);
				});
				//防止GIF图卡顿添加一个延迟执行下一步
				setTimeout(function () {
					resolve(formData);
				}, 500);
			});
		});
	})
	.then(function (formData) {
		//如果过来的数据存在的话
		if (!F.is_object(formData)) {

			return new Promise(function (resolve) {
				//生成Canvas画布
				drawCanvas(GlabalHeaderUrl, formData.u_name + " • " + formData.g_name, function (resultBase64) {
					//将生成后的base64保存到后台
					$.ajax({
						type: "POST",
						async: false,
						dataType: "json",
						url: "http://yunfan.huosu.com/customer/boss/api/index.php",
						data: {
							act: "pic",
							openid: WX_USER.openid,
							nickname: WX_USER.name,
							headimgurl: WX_USER.headerUrl,
							name: formData.u_name,
							company: formData.g_name,
							job: formData.u_zhiwei,
							mail: formData.u_eamil,
							phone: formData.u_phone,
							base64: resultBase64
						},
						success: function (obj) {
							if (obj instanceof Object) {
								//返回图片路径进入下一帧
								var url = obj.data;
								if (confirm("信息我们收到！报名成功将收到确认短信。")) {
									resolve(url);
								} else {
									resolve(url);
								}
							} else { console.info("Ajax返回结果类型错误") }
						},
						error: function () { console.info("Ajax链接失败") }
					});
				});
			});
		}
	})
      //进入结果页
	.then(function (url) {
		fadeInResultPage(url);
	});
});

