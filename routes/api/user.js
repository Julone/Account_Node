var router = require('express').Router();
var db = require('./../../model/mongo');
var bcrypt = require('./../../util/bcrypt');
var userModel = require('./../../schema/user_list');
var clockModel = require('./../../schema/clockin_list');
router.post('/info',(req,res) => {
    var user_id = req.session.user_id; //用户ID
    var date = new Date();//今日日期
    var today = date.getFullYear() +'/'+(date.getMonth()+1) +"/" + date.getDate();
    userModel.findById(user_id,async (err,docs)=>{
        if(err) res.json({code: 404, msg:'找不到用户'});
        if(docs){
            var clockDays = await clockModel.find({
                user_id: user_id.trim()
            }).countDocuments(); //总共签到日期
  
            var isClocked = !! await clockModel.findOne({
                add_time: {
                    $gt: new Date(today),
                    $lt: new Date(new Date(today).getTime() + 1000 * 60 * 60 * 24)
                },//大于今天的00:00且小于明天的00:00。
                user_id: user_id//用户名
            }).countDocuments();//今日是否签到
            var {user_sex,user_name,user_remark,user_birthday} = docs;
            return res.json({code:200,data:{ 
                user_sex,user_name,user_remark,user_birthday,
                clockDays,isClocked}})
        } else{
            res.json({code:404, msg:'找不到用户'});
        }
    })
})

router.post('/clockin',(req,res)=>{
    var user_id = req.session.user_id;
    var date = new Date();
    var today = date.getFullYear() +'/'+(date.getMonth()+1) +"/" + date.getDate();
    clockModel.findOne({
        add_time: {
            $gt: new Date(today),
            $lt: new Date(new Date(today).getTime() + 1000 * 60 * 60 * 24)
        },
        user_id: user_id
    },(err,doc)=>{
        console.log(err,doc)
        if(err) {
            res.json({code:500,msg:'签到失败'})
        } else {
            if(doc) {
                doc.updateOne({
                    update_time:new Date()
                },(err,row)=>{
                    res.json({code:201,msg:'今日已签到，无需再次签到'})
                })
            }else{
                new clockModel({user_id:user_id,add_time:new Date()}).save((err,doc)=>{
                    res.json({code:200,msg:'签到成功'})
                })
            }
        }
    })

})

router.post('/changeInfo',(req,res) => {
    var user_id = req.session.user_id;
    var {user_name,user_sex,user_remark} = req.body;
    let user_birthday = new Date(req.body.user_birthday);
    userModel.findByIdAndUpdate(user_id, { 
        user_name,user_sex,user_remark,user_birthday
     }, {
        useFindAndModify:true,
     },(err,docs) =>{
         if(err) res.json({code:500,msg:'更新资料错误！'});
         console.log(docs)
         res.json({code :200, msg:'更新资料成功'});
     })
});
router.post('/changePassword',(req,res) => {
    var user_id = req.session.user_id || '5e3c10b2ca87e42d94792b82';
    var old_pass = req.body.old_pass;
    var new_pass = req.body.new_pass;
    var new_pass2 = req.body.new_pass2;
    if(!(old_pass&&new_pass&&new_pass2)) return res.json({code:122,msg:'不能传空值'});
    if(new_pass != new_pass2) return res.json({code:122,msg:'新密码与确认密码不一致！'});
    userModel.findById(user_id,(err,docs) =>{
        if(err) return res.json({code:500,msg:'用户不存在'});
        var isEqual = bcrypt.compareSync(old_pass,String(docs.user_pass));
        if(isEqual){
            docs.updateOne({$set: {
                user_pass: bcrypt.toHashSync(new_pass)
            }},(err,row)=>{
                if(err)  return res.json({code:124,msg:'更改密码错误！'});
                if(row.n >= 0) {
                    res.json({code:200,msg:'更改密码成功！'});
                }else{
                    res.json({code:120,msg:'更改密码失败2！'});
                }
            })
        }else{
            res.json({code:123,msg:'原始密码错误！'});
        }
    })
});

module.exports = router;