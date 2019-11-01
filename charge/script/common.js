//打开window
function openWin(name, params, isLogin, isTabBar) {
    if (typeof(params) == 'boolean') {
        isTabBar = isLogin;
        isLogin = params;
        params = {};
    }
    //需要先登陆
    if (isLogin && $api.getStorage('token') === undefined) {
        openWin('login');
        return;
    }
    api.openWin({
        name: name,
        url: 'widget://charge/' + name + '.html',
        pageParam: params,
        slidBackType: 'edge',
        slidBackEnabled: isTabBar && false,
        animation: isTabBar && {type:'none'},
    });
}

function openManagerView() {
    if ($api.getStorage('token') === undefined) {
        openWin('login');
        return;
    }
    var downloadManager = api.require('downloadManager');
    downloadManager.openManagerView({
        title: '我的缓存'
    }, function(ret, err) {
        if (ret) {
            console.log(JSON.stringify(ret));
            downloadManager.openDownloadedFile({
                id: ret.id
            }, function(ret, err) {
                if (ret) {
                    //alert(JSON.stringify(ret));
                } else {
                    api.toast({
                        msg: ret.msg,
                        duration: 2000,
                        location: 'middle'
                    });
                }
            });
        } else {
            alert(JSON.stringify(err));
        }
    });
}
function enqueue(url,title,iconPath,savePath) {
    var downloadManager = api.require('downloadManager');
    downloadManager.enqueue({
        url:url,
        savePath: savePath,
        cache: true,
        iconPath: iconPath,
        allowResume: true,
        title:title,
        networkTypes: 'all'
    }, function(ret, err) {
        if (ret) {
            id = ret.id;
            openManagerView()
            //alert(JSON.stringify(ret));
        } else {
            alert(JSON.stringify(err));
        }
    });
}
//打开浮层
function openDialog(frm, params){
    api.openFrame({
        name: frm,
        url: 'widget://charge/html/'+ frm +'.html',
        pageParam: params,
        rect:{x:0, y:0, w:'auto', h:'auto'},
        bgColor: 'rgba(0,0,0,0.4)',
        bounces: false,
    });
}
//打开播放页
function openPlayer(vid, tid, price){
    //先登录
    if ($api.getStorage('token') === undefined) {
        openWin('login');
        return;
    }
    //检查视频是否需要购买
    $api.get('my/rolevideo/'+ vid, function(){
        var name = api.systemType === 'ios' ? 'x5' : 'x5';
        api.openWin({
            name: name,
            url: 'widget://charge/'+ name +'.html',
            pageParam: {id:vid, tid:tid},
            reload: true,
        });
    },function(json){
        if(json.code === -1){
            openWin('login');
        }else
        if(json.code === 1){
            openDialog('sign', {id:vid, tid:tid, price: price, money: json.data.money, bgurl: json.data.bgurl});
        }
    });
}

//打开播放页
function openPlayers(vid,url,title,iconPath,savePath,tid,price){
    //先登录
      //console.log(vid);
    if ($api.getStorage('token') === undefined) {
        openWin('login');
        return;
    }
    //检查视频是否需要购买
    $api.get('my/rolevideo/'+ vid, function(){

        enqueue(url,title,iconPath,savePath)
    },function(json){
        if(json.code === -1){
            openWin('login');
        }else if(json.code === 1){
            openPlayer(vid, tid, price);
        }
    });
}

//登陆登出刷新
function LoginOut(fn1, fn2){
    //接受登陆监听
    api.addEventListener({
        name: 'islogin'
    }, function(ret, err){
        if(ret){
            window.scrollTo(0,0);
            fn1();
        }
    });
    //接受退出监听
    api.addEventListener({
        name: 'logout'
    }, function(ret, err){
        if(ret){
            window.scrollTo(0,0);
            fn2 ? fn2() : fn1();
        }
    });
}
//上拉加载更多
function loadMore(fn){
    api.addEventListener({
        name: 'scrolltobottom'
    }, function(){
        fn();
    });
}
//下拉刷新
function pullRefresh(callback){
    api.refreshHeaderLoadDone();
    api.setCustomRefreshHeaderInfo({
        bgColor: '#323232',
        image: {
            pull: [
            'widget://charge/image/loading1.png' ,
            'widget://charge/image/loading2.png' ,
            'widget://charge/image/loading3.png' ,
            'widget://charge/image/loading4.png' ,
            'widget://charge/image/loading5.png' ,
            'widget://charge/image/loading6.png' ,
            'widget://charge/image/loading7.png' ,
            'widget://charge/image/loading8.png'
            ],
            load: [ 'widget://charge/image/loading1.png'  ],
        }
    }, function() {
        api.refreshHeaderLoadDone();
        location.reload();
    });
}
/**
 * 时间秒数格式化
 * @param s 时间戳（单位：秒）
 * @returns 格式化后的时分秒
 */
function sec_to_time(s) {
    var min = Math.floor(s/60);
    var sec = Math.floor(s % 60);

    if(min < 10){min = "0" + min;}
    if(sec < 10){sec = "0" + sec;}

    return min +":"+ sec;
}

//table时间格式化
function tb_date(value, delimiter) {
  var now = new Date(value * 1000);
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var date = now.getDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();
  delimiter || (delimiter = ' ');
	return year+'-'+month+'-'+date+ delimiter +hour+':'+minute+':'+second;
}

/**
 * 二维码海报
 * string picUrl	海报背景图地址
 * string qrText	二维码文字
 * return string	生成的临时海报地址
 **/
function qrPoster(opts, fn) {
    //绘制画布

    var canvas = document.createElement('canvas');
    canvas.width = 750*2;
    canvas.height = 1334*2;
    var ctx = canvas.getContext('2d');
    ctx.scale(2,2);
    //绘制商品封面图
    var img = new Image();
    img.src = opts.picUrl;
    img.onload = function() {
        ctx.drawImage(img, 0, 0, 750, 1334);
        //绘制二维码
        var scanner = api.require('FNScanner');
        scanner.encodeImg({
            content: opts.qrText,
            saveImg: {
                path: 'fs://qr.jpg',
                w: 300,
                h: 300
            },
        }, function(ret){
            if(ret && ret.status){
                img.src = ret.imgPath;
                img.onload = function() {
                    console.log(456)
                    ctx.drawImage(img, 247, 960, 256, 256);
                    fn(canvas.toDataURL('image/jpeg', 1));
                };
            }
        });
    }
}

/**
 * 保存海报，微信分享
 * string base64	海报图片base64
 * string type	保存类型：save保存相册，wx微信好友
 **/
function saveQR(base64, type) {

    var trans = api.require('trans');
    var sharedModule = api.require('shareAction');
    var toast = new auiToast();
    var param = {
        base64Str: base64.slice('data:image/jpeg;base64,'.length),
        album: type === 'save' ? true : false,
        imgPath: 'fs://',
        imgName: Date.parse(new Date()) +'.jpg'
    };
    trans.saveImage(param, function(ret, err) {
        if (ret && ret.status) {
            if(type === 'save'){
                toast.success({title: '^_^ 保存成功'});
            }else
            if(type === 'share'){
                sharedModule.share({
                    path: 'fs://'+ param.imgName,
                    type: 'image',
                });
                toast.success({title: '^_^ 分享成功'});
            }
        }
    });
}
