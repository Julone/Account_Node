var router = require('express').Router();
var bcrypt = require('./../../util/bcrypt'); //加密算法库
var userModel = require('./../../schema/user_list');//MongoDB数据模型
var typeModel = require('./../../schema/type_list')

router.post('/login',function(req,res,next){
    var data = {
        user_id: req.body.user_id, //用户账号
        user_pass: req.body.user_pass //用户密码
    };
    var errors = `<script>alert('帐号或密码错误，登录失败！');history.go(-1)</script>`;
    userModel.findOne({user_id:data.user_id}).then(response=>{
        if(response){//如果查询到存在该用户账号
            let isEqual = bcrypt.compareSync(data.user_pass,response.user_pass);
            if(isEqual){ //如果密码与数据库中的密码匹配，登录成功时
                req.session.user_id = response._id;//将用户ID存储于SESSION
                var cookie_config = {maxAge:1000 * 60 * 60 * 2, signed:true,path: '/'};
                res.cookie('user_id',response._id, cookie_config) //将用户ID存储COOKIE
                res.redirect('/index'); //跳转至首页
            }else{
                res.send(errors)//账号密码不匹配,提示并返回上一级。
            }
        }else{
            res.send(errors)//账号密码不匹配,提示并返回上一级。
        }
    });
})

router.post('/regist',function(req,res,next){
    if(req.body.userpass != req.body.userpass2){//如果密码与确认密码不一致
        res.send(`<script>alert('用户密码和确认密码不一致！');location.href='/regist'</script>`)
    }
    if(/^\w{6,30}$/.test(req.body.userpass) == false){//密码如果不符合规则
        res.send(`<script>alert('用户密码至少为6位！');location.href='/regist'</script>`)
    }
    var dataModel = {
        user_id: req.body.username,//用户账号
        user_pass: bcrypt.toHashSync(req.body.userpass),//加密用户密码
        user_name: req.body.username,//用户名默认为用户ID
        user_remark: '',//用户憋住
        user_birthday:new Date(1980),//用户生日，初始值1980年
        user_sex:'',//用户性别
        reg_time: new Date(),//注册时间为今天
    };
    var newUser = new userModel(dataModel); //实例化用户数据
    userModel.find({
        user_id: req.body.username //查找是否包含此user_id的用户
    }).then(response=>{
        if( response.length != 0){ //如果该用户ID已存在
            return res.send(`<script>alert('用户名已被注册，请更换！');location.href='/regist'</script>`)
        }else{
            newUser.save().then(async function(doc){
                // 如果用户注册成功，提示并前往登录页面。
                await initData(doc._id);
                return res.send(`<script>alert('注册成功，前往登录！');location.href='/login'</script>`)
            }).catch(function(){
                // 如果用户注册失败，提示并前往注册页面。
                res.send(`<script>alert('注册失败，请重试！');location.href='/regist'</script>`)
            })   
        }
    })
})
function initData(user_id){

    return new Promise((res,rej)=>{
        var a1 = ['零食','交通','数码','化妆品','面膜','文具','日用品','玩具'].map(el=>{
            return {user_id,type_name:el,type_type:'out'}
        });
        var a2 = ['工资','理财','兼职','税收'].map(el=>{
            return {user_id,type_name:el,type_type:'in'}
        })
        typeModel.insertMany([...a1,...a2],(err,docs)=>{
            console.log(err,docs);
            if(err) rej('init failed');
            else res('ok')
        })
    })
    

}


module.exports = router;