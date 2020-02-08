var express = require('express');
var router = express.Router();
var request = require('request-promise');
var createError = require('http-errors')

router.use('/api',require('./api'));
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session.user_info)
  if(req.session.user_info){
    console.log(req.session.user_info);
    res.render('index', { user_info: req.session.user_info });
  }else{
    res.redirect('/login')
  }
});
router.get('/index',(req,res)=>{
  res.render('index', { user_info: req.session.user_info });
})
router.get('/add_item',(req,res)=>{
  res.render('add_item');
})
router.get('/update_item',(req,res)=>{
  res.render('update_item',{account_id: req.query.account_id});
})
router.get('/login',(req,res,next) =>{
  res.render('login')
})
router.get('/regist',(req,res,next) =>{
  res.render('regist')
})
router.get('/chart',(req,res,next)=>{
  res.render('chart')
})
router.get('/my',async (req,res,next)=>{
  res.render('user');
})
router.get('/update_pass',(req,res,next)=>{
  res.render('update_pass')
})
router.get('/update_type',(req,res,next)=>{
  res.render('update_type')
})

module.exports = router;
