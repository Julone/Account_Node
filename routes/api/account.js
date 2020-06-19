var router = require('express').Router();
var db = require('./../../model/mongo');
var typeModel = require('./../../schema/type_list');
var accountModel = require('./../../schema/account_list');
var mongoose = require('mongoose');
var ObjectId= mongoose.Types.ObjectId;
router.all('/getTypeList',function(req,res,next){
    var type = req.body.type || 'all';
    var user_id = req.session.user_id;
    var filter = {
        del_flag:false,
        user_id: user_id
    }
    if(type != 'all') filter['type_type']=new RegExp(type);
    typeModel.find(filter).select('type_name type_type').then(r=>{
        console.log(r)
        res.json({code:0,base:{count:r.length},data:r})
    })
})

router.post('/addTypeList',function(req,res,next){
    var {type_name ,type_type} = req.body;
    var user_id = req.session.user_id;
    var t = new typeModel({
        type_name,user_id,type_type,
        update_time: new Date(),
        add_time:new Date(),
        del_flag: false
    });
    t.save().then(r=>{
        res.json({code:200,msg:'添加成功'})
    }).catch(e=>{
        console.log(e)
        res.json({code:120,msg:'添加失败'})

    })
})
router.post('/delTypeList',function(req,res,next){
    var {type_id} = req.body;
    var user_id = req.session.user_id;
    typeModel.findOne({
        _id: ObjectId(type_id),
        user_id: user_id
    }).remove((err,doc)=>{
        console.log(err,doc)
        if(err){
            res.json({code:122,msg:'删除失败'})
        }else{
            res.json({code:200,msg:'删除成功！'})
        }
    })
})

router.post('/editTypeList',function(req,res,next){
    var {type_name ,type_type, type_id} = req.body;
    var user_id = req.session.user_id;
    typeModel.findOneAndUpdate({
        _id: ObjectId(type_id),
        user_id: user_id,
    },{
        type_name,
        type_type
    },{
        useFindAndModify:true
    },(err,doc)=>{
        console.log(err,doc)
        if(err || !doc){
            res.json({code:122,msg:'更改失败'})
        }else{
            res.json({code:200,msg:'更改成功！'})
        }
    })

})

router.post('/addTypeList',function(req,res,next){
    var {type_name ,type_type} = req.body;
    var user_id = req.session.user_id;
    var t = new typeModel({
        type_name,user_id,type_type,
        update_time: new Date(),
        add_time:new Date(),
        del_flag: false
    });
    t.save().then(r=>{
        console.log(r)
    }).catch(e=>{
        console.log(e)
    })
})
router.post('/deleteAccount',(req,res) =>{
    var del_id = req.body.account_id;

    accountModel.updateOne({
        _id:del_id,
        user_id: req.session.user_id
    },{
        del_flag:true
    },(err,raw) =>{
        if(err) res.json({code:110,msg:'删除失败'})
        else res.json({code:200, msg:'删除成功'})
    })
})
router.post('/updateAccount',(req,res) =>{
    var {account_reason , account_type, account_num, 
        account_date, account_desc,account_id} = req.body;
    accountModel.updateOne({
        _id:account_id
    },{
        account_reason , account_type, account_num,
        account_date, account_desc
    },(err,raw) =>{
        if(err) res.json({code:110,msg:'更新失败'})
        else res.json({code:200, msg:'更新成功'})
    })
})

router.post('/postAccountData',function(req,res,next){
    var a = new accountModel({
        user_id: req.session.user_id,//用户ID
        account_num: req.body.account_num,//金额
        account_type: req.body.account_type,//支出、收入
        account_reason: mongoose.Types.ObjectId(req.body.account_reason),//类别
        account_desc: req.body.account_desc,//备注
        account_date: new Date(req.body.account_date),//日期
        add_time: new Date(),//添加时间
        update_time:new Date(),//更新时间
        del_flag: false//默认不删除
    })
    a.save().then(data=>{
        res.json({code:200,data:data,msg:'记账成功！'});//添加成功
    }).catch(err=>{
        res.json({code: 105,msg:'记账失败，' + err._message});//添加失败
    })
})
router.post('/getAccountData',async function(req,res){
    var monthExp = req.body.monthExp || ""; //查询的年月
    var account_id = req.body.account_id;//是否包含账单记录
    var ObjectId = require('mongoose').Types.ObjectId//objectID类型
    var $match = {
        del_flag: false,//查找未删除的记录
        account_date: { 
            $regex: new RegExp(monthExp)//按照年月查找
        },
        user_id: req.session.user_id,//用户ID为Session中的用户ID
        account_reason: {$ne:[]}//消费类型不为空
    }
    if(account_id) $match._id = ObjectId(account_id);//如果有账单ID，则查找一条
    var result = await accountModel.aggregate([
        {
            $project:{
                account_date: {
                    $dateToString: {format:"%Y/%m/%d",date: "$account_date"}//格式化日期
                },
                account_num: 1,//金额,Mongo中1代表需要这个数据
                account_type: 1,//类型，判断收入还是支出
                account_reason:1,//类别，零食、数码等
                account_desc:1,//备注
                update_time:{
                    $toLong: '$update_time'
                },
                del_flag:1,//删除标记
                user_id:1//用户ID
            }
        },
        {
            $lookup://关联函数
              {
                from: "type_list",//与TYPE_LIST进行关联查询
                localField: "account_reason",//此为外键
                foreignField: "_id",//对应TYPE_LIST的主键
                as: "account_reason"//重命名为ACCOUNT_REASON
              }
         },
        { $match },//过滤条件
        {
            $project:{
                account_date:1,
                account_num: 1,
                account_type: 1,
                account_reason:1,
                account_desc:1,
                account_reason:{
                    $filter: {
                        input: "$account_reason",
                        as: "item",
                        cond: { $eq: [ "$$item.del_flag", false ] }//过滤不存在的记录
                     }
                },
                update_time:1,
            }
        },
        {   $unwind: "$account_reason" },//展开结果
        {
            $sort: {account_date: -1 ,update_time:-1}//降序排序
        }
    ])
    res.json({code:200,data:result,reqUrl: req.originalUrl});//答应结果
})


module.exports = router;