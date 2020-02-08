var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('type_list',new Schema({
    user_id: {type:String},
    type_name: String, //零食
    type_type: String, //收入支出
    add_time: {type:Date,default:new Date()},
    update_time: {type:Date,default:new Date()},
    del_flag: {type:Boolean,default:false}
}),'type_list')