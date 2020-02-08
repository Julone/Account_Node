var express = require('express');
var router = express.Router();
var Mock = require('mockjs');
let {Random} = Mock;
/* GET users listing. */
router.all('/', function(req, res, next) {
    var length = ~~(Math.random() * 12);
    var rs = Array.from({length},el=>{
        return Mock.mock({
            'id|+1': Random.natural(158440,158999),
            'title|1': Mock.mock('@city') + Random.cname() +"仓库",
            'num':{
                'huohao|1-50': 1,
                'zongxiang|1-80': 1,
                'zongjian|1-1000': 1,
            },
            'date':Random.date(),
            '_':Random.datetime("T")
        });
    });
    res.cookie("name",'zhangsan',{maxAge: 900000, httpOnly: true});
    var data =  {
        code: 200,
        msg: '数据请求成功',
        module:'审计盘点',
        coockie:req.cookie,
        data: rs,
        explain:{
            id: '单据号',
            title: '仓库名',
            num:{
                huohao:'货号数',
                zongxiang:'总箱数',
                zongjian:'总件数',
            },
            date: '日期',
            _:'时间戳'
        }
    }
    // res.send(`
    //     ${JSON.stringify(data,null,4)}
    //  `);
    res.json(data);
});
router.post('/a', function(req, res, next) {
    var data = Mock.mock({
        // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
        'list|1-10': [{
            // 属性 id 是一个自增数，起始值为 1，每次增 1
            'id|+1': 1
        }],
        "string|1": true,
        "id":Random.guid(),
        username: Random.cname(),
        paramh:Random.cparagraph( 2,5),
        bgColor: Random.rgb(),
        date: '@time()'

    });
    res.send(
        `
        <PRE>${JSON.stringify(data, null, 4)}</PRE>`
    );
});
module.exports = router;
