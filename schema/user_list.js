var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('user_list',new Schema({
    // _id: ObjectID,
    user_id: String,
    user_pass: String,
    user_name: String,
    user_sex: {type:String,default:'男'},
    user_remark: String,
    user_birthday:Date,
    reg_time: Date,
}),'user_list')