/**
 * react 走秀网
 */


/**
 * 所有的页面都是通过  LayoutComponent 加载的   
 *
 * 不同的页面会对应  page不同的值   我们通过 这个page值不同  来渲染页面
 *
 * 同时 不同页面下面根据 不同标识的  不同   改变state  来渲染页面
 */

;(function(){

	/**
	 * LayoutComponent 负责 页面的更新 以及更新时候 相对应数据的初始化  
	 */

	var LayoutComponent = React.createClass({
		getDefaultProps: function(){
			return {
				pages: ["index","glists","clists","gcart","usercenter"],
				bannerSource: "http://datainfo.duapp.com/shopdata/getBanner.php",
				goodsSource: "http://datainfo.duapp.com/shopdata/getGoods.php",
				gcartSource: "http://datainfo.duapp.com/shopdata/getCar.php",
				cartSource: "http://datainfo.duapp.com/shopdata/getCar.php"
			}
		},
		getInitialState: function(){

			return {
				page: "index",
				bannerD: [],
				goodsD: [],
				gcartD: [],
				username: Cookie.getCookie("username") || '',
				goodsID: '',
				oldPage: ''
			}
		},
		changePage: function(name,_id){

			Popup.removeLoading();

			var _un = Cookie.getCookie('username') || '';

			if(_un && this.state.username != _un){

				/**
				 * 相当于  在切换用户的时候 会进入到这里
				 */
				
				this.setState({username: _un,page: name});

				return false;
			}

			if(name == this.state.page) return false;

			if(_id){

				this.setState({oldPage: this.state.page,page: name,goodsID: _id});

				return false;
			}

			if(name == "gcart"){

				this.setState({oldPage: this.state.page,page: name});

				return false;
			}

			this.setState({page: name});
		},
		ajaxGet: function(url,callback){

			Ajax.get.call(this,url,this,function(_this,msg){

				msg = msg.replace(/^callback\(/,()=>""),
				msg = msg.substring(0, msg.length-1),
				msg = JSON.parse(msg);

				callback&&callback(msg);

			});
		},
		showPopup: function(str){

			Popup.showP(str);
		},
		render: function(){

			var _un = this.state.username,page = this.state.page;

			return (
				<div className="main">

						
					{
						(!_un && <LoginRegisterComponent changePage={this.changePage} sp={this.showPopup} />) ||

						((_un && page == "index") && <IndexComponent changePage={this.changePage} bannerD={this.state.bannerD} username={this.state.username} goodsD={this.state.goodsD} />) ||
											
						((page == "goodlist") && <GoodlistComponent changePage={this.changePage} data={this.state.goodsD} username={this.state.username} />) ||

						((page == "gcart") && <GcartComponent changePage={this.changePage} oldPage={this.state.oldPage} userID={_un} source={this.props.gcartSource} />) ||

						((page == "usercenter") && <UsercenterComponent username={_un} changePage={this.changePage} />) ||

						((page == "gooddetails") && <GoodsDetails oldPage={this.state.oldPage} changePage={this.changePage} ID={this.state.goodsID} source={this.props.goodsSource} />)

					}

					{	

						( (page == "gooddetails") || (page == "gcart") || <FooterComponent changePage={this.changePage} name={this.state.page} /> )
						
					}

				</div>
			)
		},
		componentDidMount: function(){

			console.log("组件 加载完成了");

			Popup.addLoading('<div class="loading"></div>');

			var username = Cookie.getCookie('username') || '',page = this.state.page;

			/**
			 * 只有在初始化的时候 执行  
			 */
			if(page == "index"){

				var _bd = [],_gd=[],_this = this;

				setTimeout(function(){

					_this.ajaxGet(_this.props.goodsSource,function(data1){

						_gd = data1;	

						_this.ajaxGet(_this.props.bannerSource,function(data2){

							_bd = data2;

							var newData1 = [],nUrl,newData2 = [];

							for(let i=0,len=_bd.length;i<len;i++){

								nUrl = JSON.parse(_bd[i].goodsBenUrl)[0];

								newData1.push({url: nUrl});
							}



							for(let i=0,len=_gd.length;i<len;i++){

								newData2.push({
									goodsID: _gd[i].goodsID,
									goodsListImg: _gd[i].goodsListImg,
									goodsName: _gd[i].goodsName,
									price: _gd[i].price,
									discount: _gd[i].discount,
									imgsUrl: _gd[i].imgsUrl
								})
							}

							_this.setState({bannerD: newData1,goodsD: newData2});

						})
					})
				},25)

			}
			
		}
	})

	/**
	 * page == login   login || register   默认为login
	 */
	
	var LoginRegisterComponent = React.createClass({

		getDefaultProps: function(){

			return {

				source: "http://datainfo.duapp.com/shopdata/userinfo.php"
			}
		},
		getInitialState: function(){

			return {
				type: "login"
			}
		},
		changeType: function(ntype){

			if(this.state.type == ntype) return false;

			this.setState({type: ntype});

		},
		submitForm: function(option,type){

			if(!option) return false;

			var _source = '';

			for(let key in option){

				if( key == "url"){

					_source += option[key];

				}else{

					_source += key;

					_source += "=";

					_source +=  option[key];

					_source +=  "&";

				}

				
			}

			_source = _source.substr(0, _source.length - 1);


			Ajax.get(encodeURI(_source),this,function(_this,msg){

				_this.successHandler(msg,type);
			})

		},
		successHandler: function(data,type){

			Popup.removeLoading();

			switch (type) {
				case "login":
					/**
					 * 用户登录时候的处理
					 *
					 * 登录成功之后  跳转首页
					 */
					if( data == "0"){

						Popup.showP("用户名不存在");

					}else if(data == "2"){

						Popup.showP("用户名密码不符");

					}else{

						var _d = JSON.parse(data),userID = _d.userID,changePage = this.props.changePage;

						/**
						 * 登录成功之后有两个操作
						 *
						 * 1、把用户名存在cookie中  
						 *
						 * 2、切换到首页显示数据
						 */
						
						document.cookie="username="+userID;

						/*Cookie.setCookie("username",userID);*/

						changePage("index");

					}
					break;
				case "register":
					/**
					 * 用户注册时候的处理  
					 *
					 * 注册成功之后 跳转登录页面
					 */
					 if( data == "0"){

					 	Popup.showP("用户名重名");

					 }else if( data == "2" ){

					 	Popup.showP("服务器繁忙<br>请稍后重试");

					 }else if( data == "1" ){

					 	Popup.showP("注册成功、登陆后浏览网页");

					 	setTimeout(()=>{

					 		this.changeType("login");

					 	},1000)
					 }
					break;
				case "forget":
					/*用户找回密码时候的处理  这个由于收不到验证码  暂不处理*/
					alert("forget");
					break;
				default:
					// statements_def
					break;
			}



			return false;


		},
		checkInput: function(fn,type,event){

			var event = event || window.event,target = event.target,_popup = document.querySelector(".popup");

			/* 如果 _popup存在  说明程序进行中 则取消操作 */
			if(_popup !== null || _popup) return false;

			var objs = fn&&fn(),obj,value,ph,option;

			for(let key in objs){

				obj = objs[key];value = obj.value.trim();ph = obj.getAttribute("placeholder").trim();

				if(!value){

					Popup.showP(ph + "不能为空");

					return false;
				}

			}

			//都成功之后 开始登录 || 注册 || 修改密码程序
			
			Popup.addLoading('<div class="loading"></div>');

			option = {url: this.props["source"] + "?",userID: objs["username"].value,password: objs["userps"].value,status: type};

			this.submitForm(option,type);

		},
		render: function(){

			var _type = this.props.type || this.state.type;

			return (

				<div className="login">

					<div className="login-top" ref="login-top">
						{
							_type == "login" ? "用户登录" : ( _type == "register" ? "用户注册" : "忘记密码" )
						}

					</div>

					{ 
						((_type == "login") && <LoginComponent ci={this.checkInput} sp={this.props.sp} changeType={this.changeType} />) || 

						((_type == "register") && <RegisterComponent ci={this.checkInput} sp={this.props.sp} changeType={this.changeType} />) ||

						((_type == "forget") && <ForgetpsComponent ci={this.checkInput} sp={this.props.sp} changeType={this.changeType} />)
					}
					
				</div>
			)
		}
	})

	var LoginComponent = React.createClass({

		checkValue: function(){

			return this.refs;
		},
		render: function(){

			return (
				
				<form>
					<span className="input-box">
						<input type="text" ref="username" placeholder="用户名/手机号码" defaultValue="" className="input" id="username" />
						<label htmlFor="username" className="input-t"><i className="iconfont icon-user"></i></label>
					</span>

					<span className="input-box">
						<input type="passworld" ref="userps" placeholder="密码" defaultValue="" className="input" id="userps" />
						<label htmlFor="userps" className="input-t"><i className="iconfont icon-mima"></i></label>
					</span>

					<span className="input-box">
						<span className="forget-ps" onClick={this.props.changeType.bind(this,"forget")}>忘记密码？</span><span className="register-ps" onClick={this.props.changeType.bind(this,"register")}>没有账号？立即注册</span>
					</span>

					<span className="input-box">
						<span className="btn login-btn" onClick={this.props.ci.bind(this,this.checkValue,"login")}>登录</span>
					</span>
					
				</form>
			)
		},
		componentDidMount: function(){

			
		}
	})

	var RegisterComponent = React.createClass({
		checkValue: function(){

			return this.refs;
		},
		render: function(){

			return (
				
				<form>
					<span className="input-box">
						<input type="text" ref="username" placeholder="用户名/手机号码" defaultValue="" className="input" id="username" />
						<label htmlFor="username" className="input-t"><i className="iconfont icon-user"></i></label>
					</span>

					<span className="input-box">
						<input ref="userps" type="passworld" placeholder="密码" defaultValue="" className="input" id="userps" />
						<label htmlFor="userps" className="input-t"><i className="iconfont icon-mima"></i></label>
					</span>

					<span className="input-box">
						<input ref="userpst" type="passworld" placeholder="再次输入密码" defaultValue="" className="input" id="userpst" />
						<label htmlFor="userpst" className="input-t"><i className="iconfont icon-mima"></i></label>
					</span>

					<span className="input-box">
						<span className="btn login-btn" onClick={this.props.ci.bind(this,this.checkValue,"register")}>注册</span>
						<span className="btn login-btn" onClick={this.props.changeType.bind(this,"login")}>有账号？去登陆</span>
					</span>
					
				</form>
			)
		}
	})


	var ForgetpsComponent = React.createClass({
		checkValue: function(){

			return this.refs;
		},
		getInitialState: function(){

			return {
				code: "获取验证码"
			}
		},
		render: function(){

			return (

				<form>
					<span className="input-box">
						<input ref="username" type="text" placeholder="注册手机号码" value="" className="input" id="username" />
						<label htmlFor="username" className="input-t"><i className="iconfont icon-user"></i></label>
					</span>

					<span className="input-box">
						<input ref="icode" type="text" placeholder="输入验证码" value="" className="input" id="icode" />
						<span className="ident-code">{this.state.code}</span>
					</span>

					<span className="input-box">
						<input ref="newps" type="passworld" placeholder="新密码" value="" className="input" id="newps" />
						<label htmlFor="newps" className="input-t"><i className="iconfont icon-mima"></i></label>
					</span>

					<span className="input-box">
						<input ref="newpst" type="passworld" placeholder="重复新密码" value="" className="input" id="newpst" />
						<label htmlFor="newpst" className="input-t"><i className="iconfont icon-mima"></i></label>
					</span>

					<span className="input-box">

						<span value="" className="btn login-btn" onClick={this.props.ci.bind(this,this.checkValue,"forget")}>确认</span>
						<span value="" className="btn login-btn" onClick={this.props.changeType.bind(this,"login")}>去登陆</span>

					</span>
					
				</form>
			)
		}
	})


	/**
	 * page == gcart
	 */
	
	var GcartComponent = React.createClass({

		getInitialState: function(){

			return {

				userID: this.props.userID,
				source: this.props.source,
				updateSource: "http://datainfo.duapp.com/shopdata/updatecar.php",
				cartD: '',
				oldPage: this.props.oldPage,
				isEdit: false,
				mSum: 0,
				mDiscount: 0,
				mAccount: 0
			}
		},
		editHandler: function(event){

			var target = event.target,isEdit = this.state.isEdit;
			
			this.setState({isEdit: !isEdit});

			return false;

		},
		render: function(){

			var _d = this.state.cartD,len=_d.length,gcartlist = [];

			if(_d.length){

				for(let i=0;i<len;i++){

					gcartlist.push(<Gcartlist showGcart={this.showGcart} number={_d[i].number} isEdit={this.state.isEdit} changePage={this.props.changePage} classname={_d[i].className} goodsID={_d[i].goodsID} goodsListImg={_d[i].goodsListImg} goodsName={_d[i].goodsName} price={parseFloat(_d[i].price)} discount={parseFloat(_d[i].discount)}  />)
				}
			}

			return (

				<div>
					<div className="details-top">
						
						<span className="come-back" onClick={this.props.changePage.bind(this,this.props.oldPage)}> <i className="iconfont icon-left"></i> </span>

						<span className="details-title">购物车</span>

						<span className="edit-goodsall" onClick={this.editHandler}>{ this.state.isEdit ? "完成" : "编辑"}</span>
					</div>

					<div className="show-goods" data-user={this.state.userID}>
					
						{len && gcartlist}

					</div>

					<Gcartmoney isEdit={this.state.isEdit} gcartIds={this.state.gcartIds} mDiscount={this.state.mDiscount} mSum={this.state.mSum} mAccount={this.state.mAccount} />

				</div>

			)
		},

		showGcartHandler: function(){

			Ajax.get.call(this,this.state.source + "?userID="+this.state.userID,this,function(_this,data){

				data = data.replace(/^callback\(/,()=>""),
				data = data.substring(0, data.length-1),
				data = JSON.parse(data);

				var mSum = 0,mDiscount=0,mAccount=0,_d = data,len = _d.length,_n;

				if(len){

					for(let i=0;i<len;i++){

						_n = parseInt(_d[i].number);

						mSum += parseFloat(_d[i].price)*_n;

						mDiscount += parseFloat(parseFloat(_d[i].discount)*parseFloat(_d[i].price)/10)*_n;

						mAccount += _n;

					}
				}

				console.log(data);
				

				_this.setState({cartD: data,mSum: mSum,mDiscount: mDiscount,mAccount: mAccount})
				
			})
		},
		showSelectGcartHandler: function(){

			
		},
		alertTagHandler: function(){

		},
		showGcart: function(name,event){

			var target = event.target;

			event.stopPropagation();

			setTimeout(()=>{

				var flag,_s = this.state,tNum,tPrice = parseFloat(target.getAttribute("data-price")),
					tDiscount = parseFloat(target.getAttribute("data-discount"));
					

				if(name == 'select'){

					/**
					 * 在这里计算 购物车中选中的商品 以及数量 计算总的价格 然后渲染 Gcartmoney 组件
					 */

					flag = target.getAttribute("data-select"),
					tNum = parseInt(target.getAttribute("data-num"));

					if(flag == "true"){

						target.setAttribute("data-select","false");

						target.className = "select-goods";


						this.setState({mSum: _s.mSum - tPrice*tNum,mDiscount: _s.mDiscount - parseFloat(tPrice*tDiscount/10)*tNum,mAccount: _s.mAccount - tNum});

					}else{

						target.setAttribute("data-select","true");

						target.className = "select-goods active";

						this.setState({mSum: _s.mSum + tPrice*tNum,mDiscount: _s.mDiscount + parseFloat(tPrice*tDiscount/10)*tNum,mAccount: _s.mAccount + tNum});
					}

				}else if(name[0] == "cart"){

					if(name[1] == "del"){

						/**
						 * 弹出提示框  提示是否在购物车中移除该条目
						 */
						if(confirm("确定要移除此商品吗?")){

							Popup.addLoading('<div class="loading"></div>');

							tNum = parseInt(target.getAttribute("data-num"));

							/**
							 * 在这里的时候 我们先删除 该条目  然后  通过ajax 进行后台处理 
							 */

							var source = _s.updateSource,
								userID = "userID=" + document.querySelector(".show-goods").getAttribute("data-user"),
								goodsID = "goodsID=" + target.getAttribute("data-id"),
								cn = '.goods'+target.getAttribute("data-id"),
								_cnt = document.querySelector(cn);



							_cnt.parentNode.removeChild(_cnt);

						
							source = source + "?" + userID + "&" + goodsID + "&" + "number=0";

							Ajax.get.call(this,source,this,function(_this,msg){

								msg != "1" ? Popup.showP("商品删除成功") : "";

								_this.setState({mSum: _s.mSum - tPrice*tNum,mDiscount: _s.mDiscount - parseFloat(tPrice*tDiscount/10)*tNum,mAccount: _s.mAccount - tNum});

							})
						}

						

						return false;
					}

					tNum = 1;

					var tg = target.parentNode.querySelector(".g-num"),tgn = parseInt(tg.innerHTML, 10),timer = null;

					if(name[1] == "minus" && tgn === 1) return false;

					name[1] == "plus" ? tgn += 1 : tgn -= 1;

					clearTimeout(timer);

					timer = setTimeout(()=>{

						var source = _s.updateSource,
						userID = "userID=" + document.querySelector(".show-goods").getAttribute("data-user"),
						goodsID = "goodsID=" + target.getAttribute("data-id"),
						tppp = target.parentNode.parentNode.parentNode.parentNode,
						removeG = tppp.querySelector(".goods-edit"),
						_num = tppp.querySelector(".goods-num").querySelector("i");

						source = source + "?" + userID + "&" + goodsID + "&" + "number=" + tgn;

						Ajax.get.call(this,source,this,function(_this,msg){

							msg != "1" ? Popup.showP("更新购物车失败、请重试") : "";

						})

						tg.innerHTML = tgn;

						_num.innerHTML = tgn;

						removeG.setAttribute("data-num",tgn);

						name[1] == "plus" ? this.setState({mSum: _s.mSum + tPrice*tNum,mDiscount: _s.mDiscount + parseFloat(tPrice*tDiscount/10)*tNum,mAccount: _s.mAccount + tNum}) : 

						this.setState({mSum: _s.mSum - tPrice*tNum,mDiscount: _s.mDiscount - parseFloat(tPrice*tDiscount/10)*tNum,mAccount: _s.mAccount - tNum});

					},200)
				}


					

			},25)

		},
		componentDidMount: function(){

			Popup.addLoading('<div class="loading"></div>');

			this.showGcartHandler();
			
		},
		shouldComponentUpdate: function(){

			Popup.removeLoading();

			return true;
		}
	})

	var Gcartmoney = React.createClass({

		render: function(){

			return (

				<div className="details-bot">
						
					<span className="account-option">

						<span className="show-money">
							
							<i className="gcart-money">总共: ￥{this.props.mSum.toFixed(2)}</i>
							<i className="gcart-money">减免: ￥{this.props.mDiscount.toFixed(2)}</i>
							<i className="gcart-money">实付: ￥{(this.props.mSum - this.props.mDiscount).toFixed(2)}</i>


						</span>
					</span>

					<span className="go-account">去结算( <i className="sum-count">{this.props.mAccount}</i> )</span>

				</div>
			)
		},
		componentDidMount: function(){

			/*var gcarts = document.querySelectorAll(".select-goods");*/

		}
	})

	var Gcartlist = React.createClass({

		getDefaultProps: function(){

			return {

				source: "http://datainfo.duapp.com/shopdata/updatecar.php"
			}
		},
		joinCart: function(name,event){

			var target = event.target,_t;

			event.stopPropagation();

			setTimeout(()=>{

				if(name[0] == "a"){


					this.props.changePage("gooddetails",name[1]);					

				}

			},25)
		},
		render: function(){

			var _d = this.props,username = this.props.username,_id = _d.goodsID,isEdit = _d.isEdit;

			return (

				<a ref={_id} className={_id ? 'goods-list goods'+_id : 'goods-list'} data-id={_id} onClick={ !isEdit ? this.joinCart.bind(this,["a",_id]) : '' }>
						
					<span className="goods-img"><img src={_d.goodsListImg} /></span>
					<span className="goods-info">
						<div className="goods-name">{_d.goodsName}</div>
						<div className="goods-option">

							<span className="old-price">原价:<i>￥{_d.price}</i></span>
							<span className="new-price">现价:<i>￥{ _d.discount=="0" ? _d.price : parseFloat(_d.price*_d.discount/10)}</i></span>
							<span className="goods-discount">折扣:<i>{_d.discount}折</i></span>
							<span className="goods-discount goods-num">数量:<i>{_d.number}</i></span>
							<span data-id={_id} data-discount={_d.discount} data-num={_d.number} data-price={_d.price} className="select-goods active" data-select="true" onClick={this.props.showGcart.bind(this,"select")}></span>

						</div>

						<div className="goods-option">

							{
								isEdit ? (

									<div>
										<span className="goods-count">
											<span className="g-num">{_d.number}</span>
											<span data-id={_id} data-price={_d.price} data-discount={_d.discount} data-name={username} className="count-btn" onClick={this.props.showGcart.bind(this,["cart","plus"])}>+</span>
											<span data-id={_id} data-price={_d.price} data-discount={_d.discount} data-name={username} className="count-btn" onClick={this.props.showGcart.bind(this,["cart","minus"])}>-</span>
										</span>

										<span data-id={_id} data-price={_d.price} data-discount={_d.discount} data-num={_d.number} className="goods-edit" onClick={this.props.showGcart.bind(this,["cart","del"])}>移除购物车</span>
									</div>
								) : (

									<span className="">分类：{_d.classname}</span>
								)
							}

						</div>
					</span>
				</a>
			)
		}
	})

	/**
	 * page == usercenter 
	 */

	var UsercenterComponent = React.createClass({

		render: function(){

			return (

				<div>

					<div className="details-top">
						{this.props.username}
					</div>

					<UserinfoComponent />
					
				</div>
			)
		}
	})

	var UserinfoComponent = React.createClass({

		render: function(){

			return (

				<div className="user-info">

					<div className="user-show"></div>

					<ul className="user-info-c">
						
						<li className="info-list">
							账号设置
						</li>

						<li className="info-list">
							查看购物车 <i className="iconfont icon-right"></i>
						</li>

						<li className="info-list">
							联系我们
						</li>

						<li className="info-list">
							关于我们
						</li>
					</ul>
					
				</div>
			)
		}
	})

	/**
	 * page == index
	 */
	var IndexComponent = React.createClass({

		getDefaultProps: function(){

			return {
				
			}
		},
		getInitialState: function(){

			return {

				bannerD: [],
				goodsD: []
			}
		},
		render: function(){
			return (
				<div className="index">
					<HeaderComponent changePage={this.props.changePage} />
					<BannerComponent data={this.props.bannerD} />
					<GoodlistComponent changePage={this.props.changePage} data={this.props.goodsD} username={this.props.username} />
				</div>
			)
		},
		componentDidMount: function(){

			
		}
	})




	var HeaderComponent = React.createClass({

		render: function(){

			return (
				<div className="header">
					<Headersearch changePage={this.props.changePage} />
				</div>
			)
		}
	})

	var Headersearch = React.createClass({
		getDefaultProps: function(){

			return {
				source: 'http://datainfo.duapp.com/shopdata/selectGoodes.php'
			}
		},
		getInitialState: function(){

			return {

				rsd: '',
				flag: true,
				msg: '',
				originalD: {}
			}
		},
		searchGoods: function(event){

			var _v = (event.target.value).trim(),newData = [],rsd = this.state.rsd,_msg = this.state.msg;

			if(_v){

				Popup.addLoading('<div class="loading"></div>');

				Ajax.get.call(this,this.props.source+'?selectText='+encodeURI(_v),this,function(_this,msg){

					msg = msg.replace(/^callback\(/,()=>""),
					msg = msg.substring(0, msg.length-1),
					msg = JSON.parse(msg);

					if(!msg){

						_this.state.msg = '';

						if(!rsd){

							_this.setState({rsd: ''});
						}

						return false;
					}

					if(_this.state.msg.toString() == msg.toString()) return false;

					/*_this.state.msg = msg;*/

					for(let i=0,len=msg.length;i<len;i++){

						newData.push(msg[i].goodsName);
					}

					if(newData.toString() == rsd.toString()) return false;

					_this.setState({rsd: newData,msg: msg});
					
				})
				
			}else{

				if(!_msg && !rsd) return false;

				this.setState({msg: '',rsd: ''});
			}
		},
		render: function(){
			var sresult = [],data=this.state.rsd,msg = this.state.msg,len=data.length;

			if(data){
				for(let i=0;i<len;i++){

					sresult.push(<Searchresult changePage={this.props.changePage} _id={msg[i].goodsID} name={data[i]} />)
				}
			}
			return (
				<div className="search">
					<input type="text" onChange={this.searchGoods} placeholder="输入商品名搜索" className="search-input" />
					<div className="s-result">
						{len ? sresult : ''}
					</div>
				</div>
			)
		},
		shouldComponentUpdate: function(){

			Popup.removeLoading();

			return true;
		}
	})

	var Searchresult = React.createClass({

		render: function(){

			return (

				<span className="r-list" onClick={this.props.changePage.bind(this,"gooddetails",this.props._id)}>{this.props.name} <i className="iconfont icon-watch"></i></span>
			)
		}
	})


	var BannerComponent = React.createClass({

		getInitialState: function(){

			return {
				data: this.props.data
			}
		},
		render: function(){
			var dArr = [],data = this.props.data,len=data.length,flag = this.props.flag;

			if(data){

				if(flag){

					for(let i=0;i<len;i++){

						dArr.push(<Bannerlist url={data[i]} />)
					}

				}else{

					for(let i=0;i<len;i++){

						dArr.push(<Bannerlist url={data[i].url} />)
					}
				}
			}
			return (


				<div className="swiper-container">
				    <div className="swiper-wrapper">
				        {dArr}
				    </div>
				    <div className="swiper-pagination"></div>
				</div>

				

			)
		},
		componentWillMount: function(){
			
		},
		componentDidMount: function(){

			/*获取首页banner*/

			setTimeout(()=>{

				new Swiper ('.swiper-container', {
				    loop: true,
				    speed: 2000,
				    autoplay: this.props.flag ? 0 : 3000,
				    pagination: '.swiper-pagination',
				})

			}, 25)
		}
	})

	var Bannerlist = React.createClass({

		render: function(){

			return (
				<div className="swiper-slide"><img src={this.props.url} /></div>
			)
		}
	})
	/**
	 * page == goodlist 
	 */
	var GoodlistComponent = React.createClass({

		getDefaultProps: function(){

			return {
				source: "http://datainfo.duapp.com/shopdata/getGoods.php"
			}
		},
		getInitialState: function(){

			return {
				type: '',
				gData: []
			}
		},
		render: function(){
			
			var _d = this.props.data,len=_d.length,goodslist = [];

			if(_d.length){

				for(let i=0;i<len;i++){

					goodslist.push(<Goodslist changePage={this.props.changePage} goodsID={_d[i].goodsID} goodsListImg={_d[i].goodsListImg} goodsName={_d[i].goodsName} price={parseFloat(_d[i].price)} discount={parseFloat(_d[i].discount)}  />)
				}
			}

			return (

				<div className="show-goods" data-user={this.props.username}>
					
					{
						(len && goodslist) || <h1>数据加载中、请稍后</h1>
					}

				</div>
			)
		},
		componentDidMount: function(){

			/**
			 * type 为空时候 为首页的 热推 商品列表
			 */
			/*var type = this.state.type,source = this.props.source,newData=[];

			source = type ? source + type : source;

			console.log("11111111");

			console.log(this.props.data);

			this.setState({gData: this.props.data})*/

			
		}
	})

	var Goodslist = React.createClass({
		getDefaultProps: function(){

			return {

				source: "http://datainfo.duapp.com/shopdata/updatecar.php"
			}
		},
		joinCart: function(name,event){

			var target = event.target,_t;

			event.stopPropagation();

			setTimeout(()=>{

				if(name == "cart"){

					_t = this.cartAdd();

					var source = this.props.source,
						userID = "userID=" + document.querySelector(".show-goods").getAttribute("data-user"),
						goodsID = "goodsID=" + target.getAttribute("data-id"),
						isHave = target.getAttribute("data-show");

					if(isHave){

						Popup.showP("该商品已在您的购物车中<br>请在购物车中查看添加的商品");

						return false;
					}

					source = source + "?" + userID + "&" + goodsID + "&" + "number=1";

					target.parentNode.appendChild(_t);

					Ajax.get.call(this,source,this,function(_this,msg){

						Popup.showP( msg == "1" ? "成功加入购物车" : "加入购物车失败" );

						target.setAttribute("data-show","1");
					})

					setTimeout(function(){

						_t.parentNode.removeChild(_t);

					},400)


				}else if(name[0] == "a"){


					this.props.changePage("gooddetails",name[1]);					

				}

			},25)
		},
		cartAdd: function(){
			var _t;

			return _t = document.createElement("div"),
					_t.className = "cart-add",
					_t.innerHTML = "+1",
					_t;
		},
		render: function(){

			var _d = this.props,username = this.props.username,_id = _d.goodsID;

			return (

				<a ref={_id} className="goods-list" data-sumD={_d.sumD} data-id={_id} onClick={this.joinCart.bind(this,["a",_id])}>
						
					<span className="goods-img"><img src={_d.goodsListImg} /></span>
					<span className="goods-info">
						<div className="goods-name">{_d.goodsName}</div>
						<div className="goods-option">

							<span className="old-price">原价:<i>￥{_d.price}</i></span>
							<span className="new-price">现价:<i>￥{parseFloat(_d.price*_d.discount/10)}</i></span>
							<span className="goods-discount">折扣:<i>{_d.discount}折</i></span>
							
						</div>
						<div className="goods-option">
							<span data-id={_id} data-name={username} className="iconfont icon-gouwuche" onClick={this.joinCart.bind(this,"cart")}></span>
						</div>
					</span>
				</a>
			)
		}
	})


	var GoodsDetails = React.createClass({

		getDefaultProps: function(){

			return {


			}
		},
		getInitialState: function(){

			return {

				goodsID: this.props.ID,
				source: this.props.source,
				goodsD: ''
			}
		},
		render: function(){

			var _s = this.state,_dImgs,_D = _s.goodsD,_id;

			if(_D){

				_dImgs = JSON.parse(_D["goodsBenUrl"]);

				_id = _D["goodsID"];
			}

			return (

				<div>
					<div className="details-top">
						
						<span className="come-back" onClick={this.props.changePage.bind(this,this.props.oldPage)}> <i className="iconfont icon-left"></i> </span>

						<span>{_D["goodsName"]}</span>
					</div>

					{ _D && <BannerComponent data={_dImgs} flag="1" /> }

					{ _D && <SingleDetails data={_D} /> }

					{ _D && <DetailsFooter id={_id} changePage={this.props.changePage} /> }

				</div>
			)
		},
		componentDidMount: function(){

			Popup.addLoading('<div class="loading"></div>');

			Ajax.get.call(this,this.state.source + "?goodsID="+this.state.goodsID,this,function(_this,data){

				data = data.replace(/^callback\(/,()=>""),
				data = data.substring(0, data.length-1),
				data = JSON.parse(data)[0];

				_this.setState({goodsD: data})

				
			})
		},
		shouldComponentUpdate: function(){

			Popup.removeLoading();

			return true;
		}
	})


	var SingleDetails = React.createClass({

		render: function(){

			var _d = this.props.data,_id = _d.goodsID;

			return (

				<div className="show-goods">

					<div className="d-name">{_d.goodsName}</div>

					<div className="goods-option">

						<span className="old-price">原价:<i>￥{_d.price}</i></span>

						<span className="new-price">现价:<i>￥{_d.discount == "0" ? _d.price : parseFloat(_d.price * _d.discount/10)}</i></span>

						<span className="goods-discount">折扣:<i>{_d.discount}折</i></span>
						
					</div>

				</div>
			)
		}
	})

	var DetailsFooter = React.createClass({
		getDefaultProps: function(){

			return {

				source: "http://datainfo.duapp.com/shopdata/updatecar.php"
			}
		},
		joinCart: function(event){

			var target = event.target,_t;

			setTimeout(()=>{


					var source = this.props.source,
						userID = "userID=" + Cookie.getCookie("username"),
						goodsID = "goodsID=" + target.getAttribute("data-id"),
						isHave = target.getAttribute("data-show");

					if(isHave){

						Popup.showP("该商品您已经添加过一次<br>请在购物车中查看添加的商品");

						return false;
					}

					Popup.addLoading('<div class="loading"></div>');

					source = source + "?" + userID + "&" + goodsID + "&" + "number=1";


					Ajax.get.call(this,source,this,function(_this,msg){

						Popup.removeLoading(function(){

							Popup.showP( msg == "1" ? "成功加入购物车" : "加入购物车失败" );

							target.setAttribute("data-show","1");
						})

						
					})


			},25)
		},
		render: function(){

			return (

				<div className="dfooter">
					
					<span className="df-list back-index" onClick={this.props.changePage.bind(this,"index")}>返回首页</span>

					<span className="df-list add-cart" data-id={this.props.id} onClick={this.joinCart.bind(this)}>加入购物车</span>

				</div>
			)
		}
	})


	var FooterComponent = React.createClass({

		showClassName: function(cname,name){

			return cname == name ? "nav-list active" : "nav-list";
		},
		render: function(){

			return (
				<div className="footer">
					<a ref="a" className={this.showClassName(this.props.name,"index")} onClick={this.props.changePage.bind(this,"index")}><i className="iconfont icon-home"></i> 首页</a>
					<a className={this.showClassName(this.props.name,"gcart")} onClick={this.props.changePage.bind(this,"gcart")}><i className="iconfont icon-gouwuche"></i> 购物车</a>
					<a className={this.showClassName(this.props.name,"usercenter")} onClick={this.props.changePage.bind(this,"usercenter")}><i className="iconfont icon-user"></i> 个人中心</a>
				</div>
			)
		},
		componentWillMount: function(){

			console.log("FooterComponent componentWillMount")
		},
		shouldComponentUpdate: function(nextProps, nextState) {
			
			console.log('FooterComponent shouldComponentUpdate');

			Popup.removeLoading();			

			return true;
		}
	})









	ReactDOM.render(<LayoutComponent name="hello world!" />,document.querySelector("body"),function(){

		console.info("finish");
	})

})()