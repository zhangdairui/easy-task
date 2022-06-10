const express = require('express');
const mysql = require('mysql'); //mysql声明
const app = express();
var session = require('express-session');
var bodyparser = require('body-parser');


app.use(express.static('public')); //使用 express.static 中间件来设置静态文件路径,在指定静态资源的时候路径更省事
app.use(express.urlencoded({extended: false})); //提交表单必备语句

app.engine('html', require('express-art-template'))

app.use(bodyparser.json()); // 使用bodyparder中间件，
app.use(bodyparser.urlencoded({ extended: true }));



// 使用 session 中间件
app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 30, // 设置 session 的有效时间，单位毫秒
    },
}));

//连接mySQL
//shoppingMain数据库里有两个表格，分别是USER和ADMIN
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoppingMain'
});



//连接mySQL时提示成功失败
connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

//routing↓routing↓routing↓routing↓routing↓routing↓routing↓routing↓routing↓routing↓routing↓
//没有路由的话没法将ejs页面展示在浏览器上。


//--------------登录页面--------------//
app.get('/loginReg',(req,res) => {
  res.render('loginReg.ejs');
})

//--------------登录功能--------------//

app.use('/login', (req, res)=> {
    var login = {
        "user": req.body.user,
        "pwd": req.body.pwd
    }

    var loginsql = "select adminID,adminPass from ADMIN where adminID='" + login.user + "'and adminPass='" + login.pwd + "'"
    connection.query(loginsql,  (err, result)=> {
        if (err) {
            console.log('err message:', err)
            return
        }
        if (result == '') {
            console.log('用户名或密码错误！')
            res.json({ code: -1, msg: '用户名或密码错误！' })

        } else {
            
            req.session.userName = req.body.user; // 登录成功，设置 session
            
            console.log('用户名密码匹配成功！Session设置为'+ req.session.userName);
            res.json({ code: 1, msg: '登录成功' })  

            // res.redirect('/'); //登录这一整块已经注定是前端跳转了，所以不要这样用后端redirect，是无效的

        }
    })
})

//--------------登出功能--------------//
app.get('/logout', function (req, res) {
    req.session.userName = null; // 删除session
    res.redirect('/loginReg');
});


//--------------注册页面--------------//
app.get('/register',(req,res) => {
  res.render('register.ejs');
})
//--------------注册功能--------------//
app.post('/reg',(req,res) => {
  console.log(req.body.userPass);
  //将提交的内容插入数据库
  connection.query(
    'INSERT INTO ADMIN SET ?',  //mySQL插入语句，问号对应下面几行的内容
    {adminID: req.body.userID,  
    adminPass: req.body.userPass1},
    
    (error,results) => {
      if (error) {
        console.log('注册失败了');
      }else{
        console.log('注册成功啦');
        
      
        res.redirect('/loginReg');
      }
      
    }

    );
})




//--------------list首页--------------//
app.get('/', (req, res) => {

  if (req.session.userName != null) {
     
      connection.query(
      'SELECT * FROM USER',  //将表格所有内容打印出来，在hello.ejs中有USER的地方会接住这个results
       (error, results) => {
      //console.log(results); //每次刷新主页都在terminal打出所有数据
      res.render('hello.ejs',{USER: results, xiaoming: req.session.userName});}


  );
}else{
  res.redirect('/loginReg');
}

});

//--------------添加新user页面--------------//
app.get('/new',(req,res) => {

  res.render('new.ejs');
})

//--------------添加新list项目提交表单--------------//
app.post('/create',(req,res) => {
  console.log(req.body.userName);
  //将提交的内容插入数据库
  connection.query(
    'INSERT INTO USER SET ?',  //mySQL插入语句，问号对应下面几行的内容
    {userID:req.body.userID,  //数据库中的userID对应用户输入的userID（也就是name为userID的输入框里的内容）
    userName:req.body.userName,
    userPass:req.body.userPass},
    //将新的数据库显示在网页上
    (error,results) => {
      if (error) {
        console.log('插入数据失败了'+error);
      }else{
        console.log('插入数据成功啦');
        res.redirect('/'); //重定向显示，防止每次刷新都新增一条重复的数据
      }
      
    }


    );

})

//--------------删除已经有的user--------------//
app.post('/delete/:id',(req,res) => {  //在这里，:id已经和列表页面的userID对应起来了
        connection.query(
          'DELETE FROM USER WHERE userID=?',
          [req.params.id], //指定删除哪一行，这里的id是从网页中的删除按钮传过来的，用:id接住了
          (error,results) => {
            if (error) {
              console.log('删除数据失败了');
            }else{
              console.log('删除数据成功啦！id为'+req.params.id+'的user被删除了');
              res.redirect('/'); //重定向显示，防止每次刷新都新增一条重复的数据
            }
          });
})

//--------------编辑user信息页面从数据库中取值显示--------------//
app.get('/edit/:id',(req,res) => {
  connection.query(
    'SELECT * FROM USER WHERE userID=?',
    [req.params.id],
    (error,results) =>{
      res.render('edit.ejs',{item:results[0]});
    } )
})

//--------------编辑user信息提交更新数据库--------------//
app.post('/update/:id',(req,res)=>{

  var userModSql = 'UPDATE USER SET userID=?,userName=?,userPass=?,userMail=?,userPhone=?,userAddr=? WHERE userID=?';
  var userModSql_Params = [
    req.body.userID,
    req.body.userName,
    req.body.userPass,
    req.body.userMail,
    req.body.userPhone,
    req.body.userAddress,
    req.params.id //这里一定要用id，而不是userID，app.js只认识它自己定义的id，而不认识userID
    ];
  
  connection.query(
    userModSql, //sql语句
    userModSql_Params, //指定如何修改
    (error,results) =>{
      if (error){
        console.log('修改用户信息失败了');
      }else{
       connection.query(
        'SELECT * FROM USER',
        (error, results) => {
        console.log('修改用户信息成功啦！id为'+req.params.id+'的user信息被修改了');
        res.redirect('/'); //重定向显示
    });
      }
     }
    );
})

//--------------从数据库中搜索userID，展示该user信息--------------//
app.post('/search',(req,res) => {
   //将提交的id在数据库搜索
    connection.query(
    'SELECT * FROM USER WHERE userID=?',
    [req.body.searchID],
    (error,results) =>{

      res.render('hello.ejs',{USER: results}); 
      //res.render是渲染视图的函数：res.render(view,[locals],callback)
      //第一个参数是渲染的view，同时向callback传递渲染的字符串也就是results，作为USER传到hello.ejs的<%=%>中
    } )
})


//监听端口
app.listen(8000);