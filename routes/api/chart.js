var router = require('express').Router();
var db = require('./../../model/mongo');
var typeModel = require('./../../schema/type_list');
var accountModel = require('./../../schema/account_list');
var mongoose = require('mongoose');
router.get('/getDataByMonth',async (req,res) =>{
    // var del_id = req.body.account_id；
    var user_id = req.session.user_id;
    var date = req.query.dateExp || "2020/01";

    var result = await accountModel.aggregate([
        {
            $project:{
                account_date: {
                    $dateToString: {format:"%Y/%m/%d",date: "$account_date"}
                },
                account_num: 1,
                account_type: 1,
                account_reason:1,
                account_desc:1,
                del_flag:1,
                user_id:1
            }
        },
        {
            $lookup:
              {
                from: "type_list",
                localField: "account_reason",
                foreignField: "_id",
                as: "account_reason"
              }
         },
        { 
            $match:{
                del_flag:false,
                // $and:[
                //     {"account_date":{"$gte":"2015/05/21"}},
                //     {"account_date":{"$lte":"2020/01/28"}}
                // ],
                account_date: new RegExp(date),
                user_id: user_id
            } 
        },
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
                        cond: { $eq: [ "$$item.del_flag", false ] }
                    },
                }
            }
        },
        {   $unwind: "$account_reason" },
        {
            $project:{
                account_date:1,
                account_num: 1,
                account_type: 1,
                account_reason:1,
                account_desc:1,
                account_reason: "$account_reason.type_name",
               
            }
        },
        // {   $skip:0},{$limit:5},
        {
            $sort: {account_date: -1 }
        }
    ])
    function getFilter1(data, condition){
        if(data.length == 0) return {'暂无数据':1};
        return data.reduce((t,el) => {
            if(el.account_type != condition) return t;
            if(!t[el.account_reason]){
                t[el.account_reason] = 0;
            }
            t[el.account_reason] += 1;
            return t;
        }, {});
    }
    function getFilter2(data, condition){
        var first = new Date(date);
        var dayCount =  new Date(first.getFullYear(),first.getMonth() + 1,0).getDate();
        var sample = Array.from({length:dayCount}).reduce((t,el,i)=>{
            t[i+1+"日"] = 0;
            return t;
        },{});
        var data1 = data.reduce((t,el) => {
             if(el.account_type != condition) return t;
             if(!t[el.account_date]){
                 t[el.account_date] = 0;
             }
             t[el.account_date] += el.account_num;
             return t;
         }, {})
         for(let el in data1){
            var ix = parseInt(String(el.match(/[\d]+$/)));
            sample[ix +"日"] = data1[el];
         }
         return sample;
     }

    var resultData = {
        in: {
            data: result.filter(el=> el.account_type == 'in'),
            reasonGraphic:getFilter1(result,'in'),
            countGraphic: getFilter2(result,'in')
        },
        out: {
            data: result.filter(el=> el.account_type == 'out'),
            reasonGraphic:getFilter1(result,'out'),
            countGraphic: getFilter2(result,'out')
        }
    }    
    res.json({code: 200 ,msg: '',data:resultData});


})
module.exports = router;
