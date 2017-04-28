/**
 * 功能：jquery 截图插件
 * 说明：返回原图上的截取坐标x、y，截取宽、高
 * 编写：王 炜
 * 调用方法实例：
 **********************html************************************** 
    
	<DIV style="border: blue 1px dashed;">
   		<DIV id="dragDiv"></DIV>
	 </DIV>
	<input type="button" name="add" id="add" value="放大">
    <input type="button" name="del" id="del" value="缩小">
  
	  <input name="cropsx" type="hidden" id="cropsx" value="0">
	  <input name="cropsy" type="hidden" id="cropsy" value="0">
	  <input name="cropx" type="hidden" id="cropx" value="0">
	  <input name="cropy" type="hidden" id="cropy" value="0">

**********************js**************************************

	$('#dragDiv').imageDrop({
	    cover:'#cover',
		zoomBtn:{zin:'#add',zout:'#del'}, //放大、缩小按钮选择器
		zooMultiple:1.1,		//点击放大缩小后的倍率
		dropFrame:[300,300], 	//截取框的大小 、和生成后的照片成比例
		imgSrc:'http://pic16.nipic.com/20110829/2786001_092253229000_2.jpg',
		tips:'#tips',
		cropArr:['#cropMultiple','#cropsx','#cropsy','#cropx','#cropy'] //返回的5个值用于截屏( 倍率、抓取宽度、抓取高度，抓取坐标x,抓取坐标y)
	});    
 */

(function($) {
    $.fn.imageDrop = function(options) {
        var opts = $.extend({},$.fn.imageDrop.defaults, options);
        var _this = this;
        var bDraging = false;
        var moveEle = $(this);
        var zoomImgX = moveEle.find("img").width(),
        zoomImgY = moveEle.find("img").height();
        var cropMultiple = 0; //截取倍率
        var cropsx = 0,
        cropsy = 0,
        cropx = 0,
        cropy = 0; //最后返回的四个值
        var oldImgW, oldImgH; //原图宽高
		var SetMin = 0;//偏离最小值几倍
        //鼠标坐标
        _this.mouseCoords = function(e) {
            return {
                x: e.pageX || (e.clientX + document.body.scrollLeft - document.body.clientLeft),
                y: e.pageY || (e.clientY + document.body.scrollTop - document.body.clientTop)
            };
        };

        var dragParams = {
            initDiffX: '',
            initDiffY: '',
            moveX: '',
            moveY: ''
        };
        moveEle.css({
            'position': 'absolute',
            'left': '0',
            'top': '0'
        });

        var _moveEle = $.extend($.moveEle, $(options.cover));

        _moveEle.bind('mousedown',
        function(e) {
            bDraging = true;
            _moveEle.css({
                'cursor': 'move'
            });
            if (_moveEle.get(0).setCapture) {
                _moveEle.get(0).setCapture();
            }
            dragParams.initDiffX = _this.mouseCoords(e).x - moveEle.position().left;
            dragParams.initDiffY = _this.mouseCoords(e).y - moveEle.position().top;
        });

        _moveEle.bind('mouseup',
        function(e) {
            bDraging = false;
            _moveEle.css({
                'cursor': 'default'
            });
            if (_moveEle.get(0).releaseCapture) {
                _moveEle.get(0).releaseCapture();
            }
        });

        _moveEle.bind('mousemove',
        function(e) {
            if (!bDraging) return false;

            dragParams.moveX = _this.mouseCoords(e).x - dragParams.initDiffX;
            dragParams.moveY = _this.mouseCoords(e).y - dragParams.initDiffY;

            //设置拖动位置
            _this.fixAreaBack(false);

        });
		
		//鼠标点击平移部分
		var isClickMove = false;
		if (opts.mouseClickMove.left){
			$(opts.mouseClickMove.left).unbind("click").bind("click",function(){
				if(isClickMove) return false;
				isClickMove = true;
				dragParams.moveX -= opts.mouseClickMove.step;
                //设置拖动位置
               _this.fixAreaBack(true,function(){
					  isClickMove = false;
			   });
			})
		}
		
		if (opts.mouseClickMove.right){
			$(opts.mouseClickMove.right).unbind("click").bind("click",function(){
				if(isClickMove) return false;
				dragParams.moveX += opts.mouseClickMove.step;
                //设置拖动位置
              _this.fixAreaBack(true,function(){
					  isClickMove = false;
			   });
			})
		}
		
		if (opts.mouseClickMove.up){
			$(opts.mouseClickMove.up).unbind("click").bind("click",function(){
				if(isClickMove) return false;
				dragParams.moveY -= opts.mouseClickMove.step;
                //设置拖动位置
               _this.fixAreaBack(true,function(){
					  isClickMove = false;
			   });
			})
		}
		
		if (opts.mouseClickMove.down){
			$(opts.mouseClickMove.down).unbind("click").bind("click",function(){
				if(isClickMove) return false;
				dragParams.moveY += opts.mouseClickMove.step;
                //设置拖动位置
               _this.fixAreaBack(true,function(){
					  isClickMove = false;
			   });
			})
		}
		//end
		
		//设置拖动后位置函数
		_this.fixAreaBack = function(isAnimate,callBack){
			    if (opts.fixarea){
					if (dragParams.moveX < opts.fixarea[0]) {
						dragParams.moveX = opts.fixarea[0]
					}
	
					if (dragParams.moveX > opts.fixarea[1]) {
						dragParams.moveX = opts.fixarea[1]
					}
	
					if (dragParams.moveY < opts.fixarea[2]) {
						dragParams.moveY = opts.fixarea[2]
					}
					if (dragParams.moveY > opts.fixarea[3]) {
						dragParams.moveY = opts.fixarea[3]
					}
				}
				
				//此处用Animate会有js错待纠正
				moveEle.css({
						'left': dragParams.moveX,
						'top': dragParams.moveY
				});

				_this.setCropCoord();
				if(callBack) callBack.call();
				 
		};

        //设置可拖动范围
        _this.setArea = function() {
            //改变截图倍率
            cropMultiple = oldImgW / zoomImgX;

            //设置截图范围
            _this.setCropArea();

            opts.fixarea[0] = (zoomImgX <= opts.dropFrame[0]) ? 0 : (opts.dropFrame[0] - zoomImgX);
            opts.fixarea[1] = (zoomImgX <= opts.dropFrame[0]) ? (opts.dropFrame[0] - zoomImgX) : 0;
            opts.fixarea[2] = (zoomImgY <= opts.dropFrame[1]) ? 0 : (opts.dropFrame[1] - zoomImgY);
            opts.fixarea[3] = (zoomImgY <= opts.dropFrame[1]) ? (opts.dropFrame[1] - zoomImgY) : 0;

        };
		//end

        //设置抓取原图大小,缩放后需要重新设置
        _this.setCropArea = function() {
            cropsx = opts.dropFrame[0] * cropMultiple;
            cropsy = opts.dropFrame[1] * cropMultiple;
			cropsx = (cropsx>oldImgW)?oldImgW:cropsx;
			cropsy = (cropsy>oldImgH)?oldImgH:cropsy;
            $(opts.cropArr[1]).val(cropsx);
            $(opts.cropArr[2]).val(cropsy);
        };

        //设置抓取原图坐标，图片
        _this.setCropCoord = function() {
            cropx = dragParams.moveX * cropMultiple * -1;
            cropy = dragParams.moveY * cropMultiple * -1;
            $(opts.cropArr[3]).val(cropx);
            $(opts.cropArr[4]).val(cropy);
        };

        if (opts.zoomBtn.zin) {
			var iszin = false;
            $(opts.zoomBtn.zin).unbind("click").bind('click',
            function() {
				if(iszin) return false;
				iszin = true;

                var _oZoomImgX = zoomImgX;
                var _oZoomImgY = zoomImgY;

                zoomImgX *= opts.zooMultiple;
                zoomImgY *= opts.zooMultiple;

                //计算放大后图像的偏移
                var left = (_oZoomImgX-zoomImgX)/2;
                var top = (_oZoomImgY-zoomImgY)/2;

                dragParams.moveX -= -1*left;
                dragParams.moveY -= -1*top;
                _this.setCropCoord();

                moveEle.animate({
                    'width': zoomImgX,
                    'height': zoomImgY,
                    'left': '+='+left,
                    'top': '+='+top
                }).find('img,div').animate({
                    'width': zoomImgX,
                    'height': zoomImgY
                },function(){
					iszin = false;
				});
                _this.setArea();
				SetMin++;
				if(opts.zoomBtn.zinCallBack){
					opts.zoomBtn.zinCallBack.call(this,SetMin);
				}
            })
        }

        if (opts.zoomBtn.zout) {
			var isout = false;
            $(opts.zoomBtn.zout).unbind("click").bind('click',
            function() {
				if(isout) return false;
				if(opts.zoomBtn.zinCallBack&&SetMin==0){
					opts.zoomBtn.zinCallBack.call(this,SetMin);
					return false;
				}
				isout = true;

                var _oZoomImgX = zoomImgX;
                var _oZoomImgY = zoomImgY;

                zoomImgX /= opts.zooMultiple;
                zoomImgY /= opts.zooMultiple;

                //计算缩小后图像的偏移
                var left = (_oZoomImgX-zoomImgX)/2;
                var top = (_oZoomImgY-zoomImgY)/2;

                dragParams.moveX -= -1*left;
                dragParams.moveY -= -1*top;
                _this.setCropCoord();

                moveEle.animate({
                    'width': zoomImgX,
                    'height': zoomImgY,
                    'left': '+='+left,
                    'top': '+='+top
                }).find('img,div').animate({
                    'width': zoomImgX,
                    'height': zoomImgY
                },function(){
					isout = false;
				});
                _this.setArea();
				SetMin--;
				if(opts.zoomBtn.zinCallBack){
					opts.zoomBtn.zinCallBack.call(this,SetMin);
				}
            })
        }

        _this.init = function() {
            if (!opts.imgSrc) {
                alert('need image src');
                return false;
            }
            moveEle.parent().css({
                'width': opts.dropFrame[0],
                'height': opts.dropFrame[1],
                'position': 'relative',
                'overflow': 'hidden'
            });
            var imgObj = new Image();
            imgObj.src = opts.imgSrc+'?r='+Math.random();
            $(opts.tips).html('image loading...');
            imgObj.onload = function() {
                $(opts.tips).html('');
                if ((imgObj.width / imgObj.height) < (opts.dropFrame[0] / opts.dropFrame[1])) {
                    zoomImgX = opts.dropFrame[0];
                    zoomImgY = zoomImgX * imgObj.height / imgObj.width;
                } else {
                    zoomImgY = opts.dropFrame[1];
                    zoomImgX = zoomImgY * imgObj.width / imgObj.height;
                }
                moveEle.css({
                    'left': 0,
                    'top': 0,
                    'width': zoomImgX + 'px',
                    'height': zoomImgY + 'px'
                });
                moveEle.html('<img style="position:absolute; top: 0;left:0" src="' + opts.imgSrc + '" width=' + zoomImgX + ' height=' + zoomImgY + '><div style=" position: absolute; width: ' + zoomImgX + 'px; background: url(about:blank); height: ' + zoomImgY + 'px; top:0;left:0;"></div>');
				
				//存储原图大小
                oldImgW = imgObj.width;
                oldImgH = imgObj.height;

                _this.setArea();
            }
        };
        _this.init();

    };

    $.fn.imageDrop.defaults = {
        fixarea: [],
        zooBtn: null,
        zooMultiple: 1.10,
		mouseClickMove:{left:false,right:false,up:false,down:false,step:0}
    };

})(jQuery);