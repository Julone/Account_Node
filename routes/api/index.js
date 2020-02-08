var router = require('express').Router();
const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/hwq?gssapiServiceName=mongodb';
mongoose.connect(url, { useUnifiedTopology: true,useNewUrlParser:true } );//连接mongodb数据库
var db = mongoose.connection;// 实例化连接对象
db.on('error', console.error.bind(console, '连接错误：'));
db.once('open', (callback) => {
    console.log('MongoDB连接成功！！');
});
router.use('/login',require('./login'));
router.use('/account',require('./account'));
router.use('/chart',require('./chart'));
router.use('/user',require('./user'));

module.exports = router;