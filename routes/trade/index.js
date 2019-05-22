var express = require("express");
const request = require("superagent");
var router = express.Router();
var multer = require("multer");

const resUrl = "http://47.104.211.149:8888"; //
//const resUrl = "http://192.168.1.110:8888";
// const resUrl = "http://192.168.2.126:99";
// const resUrl = "http://192.168.2.114:99";

/* GET home page. */
router.get("/", function(req, res, next) {
    const data = {
        username: "username",
        password: "password",
        validateCode: "validateCode",
        rememberMe: "rememberMe"
    };
    request
        .post("http://47.104.211.149/cnpyr-shop/shop/login")
        .send(data)
        .set("Accept", "application/json")
        .then(res => {
            console.log("---------- res ---------------");
            console.log(res.body);
            return res;
        });
    // res.render("trade/index", { title: "Express" });
});
router.get("/test", function(req, response, next) {
    request
        .get("http://47.104.211.149/cnpyr-shop/shop/index/news/industry")
        .query({})
        .set("Accept", "application/json")
        .then(res => {
            console.log("---------- res ---------------");
            console.log(res.body);
            // response.end(res.body);
            response.send(res.body);
            return res;
        });
});

// 图片
router.get("/api/shop/captcha/captchaImage", function(req, response, next) {
    request
        .get(resUrl + "/shop/captcha/captchaImage?type=math") //
        .set("Accept", "application/json")
        .then(res => {
            console.log(
                " --------------------------- response ----------------------",
                res.header["set-cookie"][0]
            );
            let cookie = getCookie("JSESSIONID", res.header["set-cookie"][0]);
            response.cookie("JSESSIONID", cookie, { maxAge: 600000000000000 });
            // console.log(cookie);
            response.end(res.body);
            //response.send(res.body);
        });
    // res.rende("trade/logins", { title: "Express" });
});

router.get("/api/*", function(req, response, next) {
    console.log("api get");
    console.log(req.path);
    let pathUrl = "";
    // if (req.path.indexOf("/entp") !== -1) {
    //     pathUrl = "http://47.104.211.149:9999/shop/entp";
    // } else {
    pathUrl = resUrl + req.path.replace("api/", "");
    //}
    if (pathUrl.indexOf("captchaImage") !== -1) {
        return false;
    }
    const data = req.query;
    console.log(pathUrl);
    console.log(data);
    const ServerCookie = req.headers ? req.headers.cookie : "";
    request
        .get(pathUrl)
        .query(data)
        .set("Accept", "application/json")
        .set("Cookie", ServerCookie)
        // .set("Content-Type", "application/json")
        .then(res => {
            response.send(res.body);
            return res;
        });
});

// upload文件如果不存在则会自己创建一个。 .single("file")
var uploadfn = multer({ dest: "upload/" }).single("file");
router.post("/common/*", uploadfn, function(req, response, next) {
    console.log("api upload");
    console.log(req.path);

    try {
        let pathUrl = resUrl + req.path.replace("api/", "");
        const data = req.body;
        console.log(pathUrl);
        console.log(data);
        const COOKIES = req.headers.cookie;
        const CONTENTTYPE = req.headers["content-type"] || "";
        let files = req.file;

        // "https://jsonplaceholder.typicode.com/posts/", // pathUrl,
        let fileReq = request.post(pathUrl); // ("http://47.104.211.149:8888/common/upload");
        if (files) {
            fileReq = fileReq.attach("file", files.path, files.name);
        } else {
            fileReq = fileReq.attach("image", files.path, files.name);
        }

        Object.keys(data).forEach(item => {
            fileReq = fileReq.field(item, data[item] || "");
        });

        fileReq
            .type(CONTENTTYPE)
            .set("Cookie", COOKIES)
            .then(res => {
                console.log(res);
                response.send(res.body);
                return res;
            });
    } catch (error) {
        console.log(error);
    }
});

router.post("/api/*", function(req, response, next) {
    console.log("api post");
    console.log(req.path);

    let pathUrl = "";
    // if (req.path.indexOf("/entp") !== -1) {
    //     pathUrl = "http://47.104.211.149:9999/shop/entp";
    // } else {
    pathUrl = resUrl + req.path.replace("api/", "");
    //}
    const data = req.body;
    console.log(pathUrl);
    console.log(data);
    const ServerCookie = req.headers.cookie;
    // 判断上传
    const CONTENTTYPE = req.headers["content-type"] || "";
    if (CONTENTTYPE.indexOf("multipart/form-data") > -1) {
        // files = data.file || {};
    }
    console.log(req);

    request
        .post(pathUrl)
        .send(data)
        .set("Cookie", ServerCookie)
        .set("Content-Type", "application/x-www-form-urlencoded")
        // .set("Content-Type", "application/json")
        // .set("Accept", "application/json")
        .then(res => {
            // console.log(res.body);
            response.send(res.body);
            return res;
        });
});

function getCookie(name, cookies) {
    var nameEQ = name + "=";
    var ca = cookies.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}
module.exports = router;
