var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var cors= require('cors');
var session = require('express-session');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev',{skip:(req,res)=>{
  return !!['/css','/layui','/img','/js'].find(el=>{
    return !!~req.path.indexOf(el);
  })
}}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('sere324243243242314ctkey'));
const hour = 1000 * 60 * 60;
var session_config = {
    secret: 'session_secret',
    resave: true,
    saveUninitialized: true,
    key: 'session_sid',
    cookie: { 
        maxAge: hour * 2,
        // maxAge: 1000 * 10,
        secure: false
    }
}
app.use(session(session_config));
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.options('*',cors());
app.use((req,res,next)=>{
  var isLogin = req.session.user_id || req.signedCookies.user_id || req.cookies.user_id;
  if(isLogin || req.path == '/login' || req.path == '/regist' || req.path.indexOf('/api') != -1){
    req.session.user_id = isLogin;
    next();
  }else{
    res.redirect('/login')
  }
})

app.use('/', require('./routes/index'));
app.use('/mock', cors({credentials:true}),require('./routes/users'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
