const express = require('express');
const mysql = require('mysql');
const app = express();
var session = require('express-session');
var bodyparser = require('body-parser');


app.use(express.static('public')); //静態資源
app.use(express.urlencoded({extended: false})); //提交表单必备语句

app.engine('html', require('express-art-template'))

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

//session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 30, //session's time
    },
}));

//CONNECT mySQL
//[easyTask] database: appUser  task
const connection = mysql.createConnection({
    host: '127.0.0.1', //or localhost
    user: 'root',
    password: '',
    database: 'easyTask',
    multipleStatements: true // multiple SQL
});

module.exports = connection

//connect message
connection.connect((err) => {
    if (err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
    console.log('success');
});

//routing↓routing↓routing↓routing↓routing↓routing↓routing↓routing↓routing↓routing↓routing↓
//--------------ログイン画面--------------//
app.get('/loginReg', (req, res) => {
    res.render('loginReg.ejs');
})
//--------------ログイン機能--------------//
app.use('/login', (req, res) => {
    var login = {
        "user": req.body.user,
        "pwd": req.body.pwd
    }

    var loginsql = "select id,password from appUser where id='" + login.user + "'and password='" + login.pwd + "'"
    connection.query(loginsql, (err, result) => {
        if (err) {
            console.log('err message:', err)
            return
        }
        if (result == '') {
            //console.log('パスワードが間違っています！')
            res.json({code: -1, msg: 'パスワードが間違っています！'})
        } else {
            req.session.userName = req.body.user; //session
            console.log('ログインしました！Sessionは' + req.session.userName);
            res.json({code: 1, msg: 'ログインしました！'})

        }
    })
})

//--------------ログアウト機能--------------//
app.get('/logout', function (req, res) {
    req.session.userName = null; //sessionを削除する
    res.redirect('/loginReg');
});

//--------------ユーザー新規登録画面--------------//
app.get('/register', (req, res) => {
    res.render('register.ejs');
})
//--------------ユーザー新規登録機能--------------//
app.post('/reg', (req, res) => {
    //console.log(req.body.userPass);
    connection.query(
        'INSERT INTO appUser SET ?',
        {
            id: req.body.userID,
            password: req.body.userPass1
        },

        (error, results) => {
            if (error) {
                console.log('登録失敗！' + error);
            } else {
                console.log('新規ユーザーを登録しました！');
                res.redirect('/loginReg');
            }
        }
    );
})

//--------------task homepage--------------//
app.get('/', (req, res) => {

    if (req.session.userName != null) {
        //task: uncomplete & completed
        var uncompleteTask = "select * from task where userID='" + req.session.userName + "' and status='0' ORDER BY startDay DESC"
        var completedTask = "select * from task where userID='" + req.session.userName + "' and status='1' ORDER BY finishDay DESC"
        var sql = uncompleteTask + ";" + completedTask

        connection.query(
            sql,
            (error, results) => {
                //console.log(results.length);
                res.render('hello.ejs', {
                    ucTASK: results[0],
                    cTASK: results[1],
                    userID: req.session.userName
                });
            }
        );
    } else {
        res.redirect('/loginReg');
    }

});

//--------------Delete Task--------------//
app.post('/delete', (req, res) => {  //在这里，:id已经和列表页面的userID对应起来了
    let arr = req.body.taskList
    let deleId = arr.toString()
    let deleSql = "DELETE FROM task WHERE taskId in (" + deleId + ")";
    console.log(deleSql)
    connection.query(
        deleSql, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log('删除数据成功啦！');
                res.json({code: 1, msg: '删除成功'})
            }
        });
})

//--------------Make Task Finish--------------//
app.post('/complete', (req, res) => {  //在这里，:id已经和列表页面的userID对应起来了
    var arr = req.body.taskList
    let idList = arr.toString()
    let completSql = "UPDATE task SET status=1 WHERE taskId in (" + idList + ")";
    //console.log(completSql)
    connection.query(
        completSql, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log('完成数据成功啦！');
                res.json({code: 1, msg: '设置成功'})
            }
        });

})

//--------------新しいタスク画面--------------//
app.get('/new', (req, res) => {

    res.render('new.ejs');
})


//--------------POST新しいタスク--------------//
app.post('/create', (req, res) => {
    console.log(req.body);
    //Date Format
    var startString = req.body.startDay;
    startDate = new Date(Date.parse(startString));

    var finishString = req.body.finishDay;
    finishDate = new Date(Date.parse(finishString));
    connection.query(
        'INSERT INTO task SET ?',
        {
            taskId: req.body.taskId,
            title: req.body.title,
            startDay: startDate,
            finishDay: finishDate,
            priority: req.body.pri,
            status: req.body.stu,
            userId: req.session.userName
        },
        (error, results) => {
            if (error) {
                console.log('追加失敗！' + error);
            } else {
                console.log('追加しました！');
                res.redirect('/'); //重定向显示，防止每次刷新都新增一条重复的数据
            }
        }
    );

})

//--------------タスク更新画面--------------//

app.get('/edit/:id', (req, res) => {
    connection.query(
        'SELECT * FROM task WHERE taskId=?',
        [req.params.id],
        (error, results) => {
            res.render('edit.ejs', {item: results[0]});
        })
})

//--------------タスク更新--------------//
app.post('/update/:id', (req, res) => {
    console.log(req.body);
    //Date Format
    var startString = req.body.startDay;
    startDate = new Date(Date.parse(startString));

    var finishString = req.body.finishDay;
    finishDate = new Date(Date.parse(finishString));
    var editSql = 'UPDATE task SET taskId=?,title=?,startDay=?,finishDay=?,priority=?,status=? WHERE taskId=?';
    var parm = [
        req.body.taskId,
        req.body.title,
        startDate,
        finishDate,
        req.body.pri,
        req.body.stu,
        req.params.id
    ]
    connection.query(
        editSql,
        parm,
        (error, results) => {
            if (error) {
                console.log('更新失敗！' + error);
            } else {
                console.log('更新しました！');
                res.redirect('/');
            }
        }
    );

})

//监听端口
app.listen(8000);