var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// 读取html模版
var ejs = require("ejs");
// 绑定 routes
const readDir = require("./util/routes");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// 设置html引擎 设置视图引擎
app.engine("html", ejs.__express);
app.set("view engine", "html");

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 静态文件
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views/trade")));
app.use(express.static(path.join(__dirname, "views/bim")));

// 绑定 routers
const paths = readDir(path.join(__dirname, "routes"));
console.log(paths);
paths.forEach(item => {
    app.use("/" + item.path, require("./routes/" + item.filename + ".js"));
    if (item === "index") {
        app.use("/index", require("./routes/" + item.filename + ".js"));
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
