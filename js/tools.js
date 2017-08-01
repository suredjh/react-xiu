;(function(win,doc){
	var Cookie,_t,Ls,Ajax,Popup;
	String.prototype.trim = function(){
		return this.replace(/^\s+|\s+$/g,'');
	}
	Cookie = (function(){

		var ck = doc.cookie;

		function Cookie(){

		}

		return Cookie.prototype.setCookie = function(cookieName, cookieValue, expires){

			ck = cookieName + '=' + cookieValue;
		},
		Cookie.prototype.getCookie = function(cookieName){

			var cookieValue = '';
			var posName = ck.indexOf(escape(cookieName) + '=');
			if (posName != 1) {
			var posValue = posName + (escape(cookieName) + '=').length;
			var endPos = document.cookie.indexOf(';', posValue)};
			if (endPos != -1) cookieValue = unescape(document.cookie.substring(posValue, endPos));
			else cookieValue = unescape(document.cookie.substring(posValue));

			return cookieValue.slice(1,cookieValue.length);

		},Cookie;
	})(),
	Ajax = (function(){

		var obj=new XMLHttpRequest();

		function Ajax(){

		}

		return Ajax.prototype.get = function(url,_this,fn){

			obj.open('GET',url,true);

	        obj.onreadystatechange=function(){
	            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) { // readyState==4说明请求已完成
	                fn&&fn(_this,obj.responseText);  //从服务器获得数据
	            }
	        };
        	obj.send(null);
		},
		Ajax.prototype.post = function(url, data, fn){
			obj.open("POST", url, true);
	        obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // 发送信息至服务器时内容编码类型
	        obj.onreadystatechange = function () {
	            if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) {  // 304未修改
	                // console.log(obj.responseText);
	                fn&&fn(obj.responseText);
	            }
	        };
	        obj.send(data);
		},
		Ajax;
	})(),
	Popup = (function(){

		function Popup(str){

			this.str = str || "";

			this.flag = false;

			this.cLoading = '';

		}

		return Popup.prototype.template = function(str,type){

			var _pn;
			_pn = document.createElement("div");

			if(type){
				_pn.style.padding = "40px";
				_pn.style.top = "30%";
				_pn.style.fontSize = "32px";
				_pn.style.color = "#f1f1f1";

			}

			return _pn.className = "popup hide",
					_pn.innerHTML = str || this.str,
					_pn;
		},
		Popup.prototype.addLoading = function(str){

			document.querySelector("body").appendChild(this.template(str,true));

			var _p = document.querySelector(".popup");

			_p.className = "popup";

			this.cLoading = _p;
		},
		Popup.prototype.removeLoading = function(callback){

			var _sp = document.querySelectorAll(".popup"),len = _sp.length || 0;

			if(len){

				Array.prototype.forEach.call(_sp,function(item){

					item.className = "popup hide";

					item.parentNode.removeChild(item);

				})

				callback&&callback();
			}


		},
		Popup.prototype.showP = function(str){

			if(this.flag) return false;

			this.flag = true;

			document.querySelector("body").appendChild(this.template(str));

			var _p = document.querySelector(".popup");

			_p.className = "popup";

			setTimeout(()=>{

				_p.className = "popup hide";

				_p.parentNode.removeChild(_p);

				this.flag = false;

			}, 2500)

		},
		Popup;
	})(),

	win.Cookie = new Cookie(),
	win.Ajax = new Ajax(),
	win.Popup = new Popup();

})(window,document);

// console.log( (new Date() + 1).toGMTString() )

Cookie.setCookie("userID","1111")


// console.log(Popup);this.props.ci.bind(this,this.refs)