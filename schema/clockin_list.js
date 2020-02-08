var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('clockin_list',new Schema({
    user_id: String, //用户名
    clock_status: {type:Boolean,default: true}, //打卡状态
    add_time: {type:Date,default:new Date()},
    update_time: {type:Date,default:new Date()},
    del_flag: {type:Boolean,default:false}
}),'clockin_list')