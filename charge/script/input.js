var code_data = '';
//生成验证码
function RndNum(n){
  var rnd="";
  for(var i=0;i<n;i++)
      rnd+=Math.floor(Math.random()*10);
  return rnd;
}
//验证码倒计时
function sendsms(input){
  code_data = RndNum(6);
  var content = escape('#code#='+code_data);
    var getcode = $api.byId('getcode');
    var tipcode = $api.eq(getcode, 1);
    $api.one(getcode, 'click', function(){
        if(is_phone(input) === true){
          api.ajax({
              url: 'http://v.juhe.cn/sms/send?mobile='+$api.val(input)+'&tpl_id=168537&tpl_value='+content+'&key=0cb50358ebe22ad3e24d02d1fea6cb62',
              method: 'get'
          },function(ret, err){
                //验证码倒计时
                var i = 59;
                var timer = window.setInterval(function(){
                    if(i === 0){
                        window.clearInterval(timer);
                        $api.html(tipcode, '获取验证码');
                        sendsms(input);
                    }else{
                        $api.html(tipcode, i--+'s重新发送');
                    }
                }, 1000);
            });
        }else{
            sendsms(input);
        }
    });
};
//input焦点
function input_fous(input){
    var icon;
    for(var i=0; i<input.length; i++){
        $api.addEvt(input[i], 'focus', function(){
            icon = $api.eq($api.prev(this.parentNode), 1);
            $api.addCls(icon, 'aui-text-danger');
        });
        $api.addEvt(input[i], 'blur', function(){
            if($api.val(this) === ''){
                $api.removeCls(icon, 'aui-text-danger');
            }
        });
    }
}
//密码查看
function pwd_see(input){ 
    var see = $api.byId('see');
    $api.addEvt(see, 'click', function(){
        $api.toggleCls($api.eq(see, 1), 'aui-icon-attention');
        if($api.attr(input, 'type') === 'password'){
            $api.attr(input, 'type', 'text');
        }else{
            $api.attr(input, 'type', 'password');
        }
    });
}
//检验手机号合法性
function is_phone(phone) {
    if(/^1[3456789]\d{9}$/.test($api.val(phone))){
        return true;
    }
    new auiToast().fail({title:'请输入正确的手机号'});
    return false;
}
//短信验证码
function is_code(code) {
    if($api.val(code).length === 6){
        return true;
    }
    new auiToast().fail({title:'请输入短信验证码'});
    return false;
}
//密码检验
function is_pwd(password) {
    if($api.val(password).length >= 8){
        return true;
    }
    new auiToast().fail({title:'请输入8~32位密码'});
    return false;
}
//检验邀请码
function is_invite(invite){
    return true;
    // if(/^[0-9A-Z]{7}$/.test($api.val(invite))){
    //     return true;
    // }
    // new auiToast().fail({title:'请输入邀请码'});
    // return false;
}
//监听剪切板邀请码
function clip_invite(input){
    var clipBoard = api.require('clipBoard');
    var set_input = function(value){
        clipBoard.set({value: ''});
        $api.val(input, value);
        icon = $api.eq($api.prev(input.parentNode), 1);
        $api.addCls(icon, 'aui-text-danger');
    }
    var get_clip = function(){
        clipBoard.get(function(ret) {
            if (ret.type === 'string' && ret.value.length > 8) {
                var str = ret.value.match(/＄[0-9A-Z]{7}＄/);
                if(str) set_input(str[0].slice(1, 8));
            }
        });
    }
    //首次剪切板邀请口令
    get_clip();
    //监听剪切板邀请口令
    api.addEventListener({name: 'resume'}, function(ret) {
        get_clip();
    });
    //粘贴邀请码
    var getinvite = $api.byId('getinvite');
    $api.addEvt(getinvite, 'click', function(){
        clipBoard.get(function(ret) {
            if (ret.type === 'string') {
                ret.value = $api.trim(ret.value);
                if(/^[0-9A-Z]{7}$/.test(ret.value)) set_input(ret.value);
            }
        });
    });
}
