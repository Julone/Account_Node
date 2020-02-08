var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var {ObjectId} = mongoose.Types;
module.exports = mongoose.model('account_list',new Schema({
    // _id:ObjectId,
    user_id: String,
    account_num: Number,
    account_type: String,
    account_reason: ObjectId,
    account_date:Date,
    account_desc:String,

    add_time:Date,
    update_time:Date,
    del_flag: Boolean,

}),'account_list')