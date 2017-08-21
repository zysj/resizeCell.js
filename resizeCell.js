/**
 * 表格宽度调整工具类
 * 表格单元格宽度拖拉改变，不能与ng-table放在同一个元素下，因为都是使用独立域的指令，会产生冲突。
 */
define(['jquery'],
		function(){
	
    function resizeCell(options,selector){
    	this.$body = $('body');
    	//指令使用情况
    	if(selector){
    		if($('.resize-div').length==0){
    			this.$el = $(selector);
    			this.$table = this.$el.find('table');
    		}else{
    			this.isLoaded = true;
    		}
    	}else{//其它使用情况
    		if($('[resize-cell]').length==0){
    			this.$el = $('[resize-cell]');
        		this.$table = this.$el.find('table');
    		}else{
    			this.isLoaded = true;
    		}
    	}
    	//如果该table的父元素有resize-cell指令，那么判断是否已经被其中一种方式初始化了
    	if(!this.isLoaded){
	    	this.$theadth;
	    	this.$colgp;
	    	this.$resize = $('<div class="resize-div"></div>');
	    	this.$el.css('position','relative').append(this.$resize);
	    	this.elOffsetX;
	    	this.options = $.extend({},this.defaults,options);
    	}
    }
    
    resizeCell.prototype.defaults = {
    	maxWidth:600,
    	minWidth:50
    }
    
    resizeCell.prototype.init = function(){
    	if(this.isLoaded)return;
    	var that = this;
    	this.$el.on('mouseleave',function(){
			this.resizeEnd();
		}.bind(this));
    	
		this.$el.on('mouseup',function(e){
			that.tdMouUp(e,$(this));
		});
		
		
		this.$table.on('mouseover',function(e){
			that.resizeStart(e);
		})
    }
  //表格头部单元格鼠标移动事件处理函数
    resizeCell.prototype.mouMov = function(event,self){
    	var that = this;
    	var e = event || window.event;
		var width = self.outerWidth();
		var offX = e.offsetX || e.originalEvent.offsetX;
		//当鼠标移动至当前单元格的尾部5px以内时改变鼠标的样子，
		//并且监听鼠标的鼠标键下按事件，超出5px距离则不监听鼠标键下按事件
		if(width-offX<=5){
			this.$body.addClass('noselect');	
			self.addClass('cursor-col-resize');
			this.$theadth.on('mousedown',function(e){
				that.tdMouDown(e,$(this));
			});
		}else{
			self.removeClass('cursor-col-resize').css('cursor','auto');
			this.$theadth.off('mousedown');
		}
    }
    
    //鼠标键下按事件处理函数
	//下按时辅助div元素保存当前的浏览器页面鼠标的左偏值和当前单元格的索引
	//body元素监听鼠标移动事件
    resizeCell.prototype.tdMouDown = function(event,self){
    	var e = event || window.event;
		var index = this.$theadth.index(self);
		var offX = e.clientX || e.pageX || e.screenX;
		this.$resize.preX = offX;
		this.$resize.curIndex = index;
		this.$resize.show();
		this.$resize.css('left',offX-this.elOffsetX);
		//$body.addClass('noselect');		//为了鼠标移动时不会选择文本
		this.$resize.isMov = true;			//使用isMov来控制当辅助元素移动时不会删除noselect类名
		//使用body来监听鼠标移动事件
		this.$body.on('mousemove',function(event){
			var e = event || window.event;
			var offX = e.clientX || e.pageX || e.screenX;
			this.$resize.css('left',offX-this.elOffsetX);
		}.bind(this))
    }
	
    //鼠标键放松事件处理函数和鼠标超出表格的母元素范围处理函数
	//给记录的单元格的width属性赋值，隐藏辅助元素，消除中间数据
    resizeCell.prototype.tdMouUp = function(event,self){
    	if(!this.$resize || typeof this.$resize.curIndex == 'undefined' ||  this.$resize.curIndex ==null)return;
    	var e = event || window.event;
		var offX = e.clientX || e.pageX || e.screenX;
		var $curcol = $(this.$colgp[this.$resize.curIndex]);
		var colWidth = Math.abs(offX-this.$resize.preX+$curcol.width());
		//当单元格是倒数第二个时，如果是缩小宽度，则同时增大最后一个单元格的宽度
		if(this.$resize.curIndex == this.$theadth.length-2&& offX-this.$resize.preX<0){
			var lastChild = $(this.$colgp[this.$colgp.length-1])
			var lastWidth = lastChild.width()+Math.abs(offX-this.$resize.preX)*0.4;
			lastChild.attr('width',lastWidth);
		}
		$curcol.attr('width',colWidth<this.options.minWidth?this.options.minWidth:(colWidth>this.options.maxWidth?this.options.maxWidth:colWidth));
		this.resizeEnd();
    }
    
    //结束宽度调整
    resizeCell.prototype.resizeEnd = function(){
    	this.$body.off('mousemove').removeClass('noselect');
		this.$resize.hide();
		this.$resize.isMov = false;
		this.$resize.preX = this.$resize.curIndex = null;
    }
    
    resizeCell.prototype.resizeStart = function(event){
    	var that = this;
    	//由于表格是异步请求函数生成，因此需要在鼠标浮动在表格上才能获取相关元素
		if(!this.$theadth || !this.$theadth.isLoaded){		//保证只初始化一次
			this.elOffsetX = this.$el.offset().left;
			this.$theadth = this.$theadth || this.$table.find('tr.ng-table-sort-header th');
			this.$colgp = this.$colgp || this.$table.find('colgroup col');
			this.$theadth.isLoaded = true;
			this.$theadth.on('mousemove',function(e){
				that.mouMov(e,$(this));
			});
			this.$theadth.on('mouseleave',function(){
				if(!that.$resize.isMov){
					that.$body.removeClass('noselect');	
				}
			})
		}
    }
    
    return resizeCell;
	
});
