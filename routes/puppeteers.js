var express = require("express");
// 请求
const superagent = require("superagent");
// 类似 jq
const cheerio = require("cheerio");

const puppeteer = require("puppeteer");
// 设备配置
const devices = require("puppeteer/DeviceDescriptors");
const iPhone = devices["iPhone 6"];

const log = require("../util/chalkLog");
// import { yellowlog, bluelog, greenlog, errorlog } from "../util/chalkLog";

var router = express.Router();

/* GET users listing. */
router.get("/", function(req, res, next) {
    // ----- 抓取 -----
    superagent.get("https://www.v2ex.com/").end((err, sres) => {
        // 常规的错误处理
        if (err) {
            return next(err);
        }
        // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
        // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
        // 剩下就都是 jquery 的内容了
        let $ = cheerio.load(sres.text);
        chalk.errorlog("text :");
        redlog.errorlog("text :");
        chalk.yellowlog($);
        let items = [];
        $(".item_title a").each((idx, element) => {
            let $element = $(element);
            items.push({
                title: $element.text(),
                href: $element.attr("href")
            });
        });
        res.send(items);
    });
    // ----- end -----
});

// 模拟浏览器
router.get("/goto", async function(req, res, next) {
    log.errorlog("选择登陆失败，按钮搜不到");
    // 启动
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.v2ex.com/");
    await page.screenshot({ path: "download/example.png" });
    page.waitFor(2000);
    await page.pdf({ path: "download/example_pdf.pdf" });
    // 关闭
    await browser.close();
    res.send("完成");
});

// 自动测试
router.get("/test", async function(req, res, next) {
    // 启动
    const browser = await puppeteer.launch({
        headless: false //设置有头
    });
    const page = await browser.newPage();
    // 模拟机型
    await page.emulate(iPhone);
    log.greenlog("进入页面");
    await page.goto(
        "https://y.qq.com/m/ticket/index.html#js_sale_page/528731707/104"
    );
    page.once("load", async () => {
        console.log("Page loaded!");
    });

    await page.waitFor(2000);
    await page.waitForSelector("#js_tobuy");
    await page.screenshot({
        path: "download/1.png"
    });

    await page.waitFor(2000);
    log.bluelog("点击购买");
    await page.tap("#js_tobuy");
    await page.screenshot({
        path: "download/2.png"
    });

    await page.waitFor(2000);
    // 选择登陆
    await page.waitForSelector(".js_login_select");
    const js_login_select = await page.$(".js_login_select");
    if (js_login_select) {
        log.bluelog("选择登陆");
        // await page.evaluate(param => {
        //     console.log(param);
        //     param.click();
        // }, js_login_select);
        const err = await js_login_select.tap();
        log.errorlog(err);
    } else {
        log.errorlog("选择登陆失败，按钮搜不到");
        return false;
    }
    //await page.tap(".js_login_select");
    await page.screenshot({
        path: "download/3.png"
    });

    // 账号密码 page.setCookie
    await page.waitFor(3000);
    log.bluelog("账号密码");
    await page.type("#u", "账号");
    await page.type("#p", "密码", { delay: 200 });
    await page.tap("#go");
    await page.screenshot({
        path: "download/4.png"
    });

    // 购买按钮
    await page.waitFor(3000);
    await page.waitForSelector("#js_tobuy");
    log.bluelog("购买按钮");
    await page.tap("#js_tobuy");

    // 选择价格
    await page.waitForSelector(".js_plus");
    await page.screenshot({
        path: "download/5.png"
    });
    log.bluelog("价格");
    await page.tap(".js_plus");
    await page.tap("#js_ticket_selected");

    // 方法注入 *****
    const dimensions = await page.evaluate(param => {
        alert("我的方法dimensions和" + param);
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            deviceScaleFactor: window.devicePixelRatio
        };
    }, "参数");
    yellowlog("Dimensions:", dimensions);

    // 关闭
    // await browser.close();
    res.send("完成");
});

// 网页性能
router.get("/tracing", async (req, res, next) => {
    // 启动
    const browser = await puppeteer.launch({
        headless: false //设置成是否打开浏览器
    });
    const page = await browser.newPage();
    await page.emulate(iPhone);
    await page.tracing.start({
        path: "download/trace.json",
        screenshots: true
    });
    await page.goto(
        "https://uds-test.nioapis.com/hades-apis/uds/in/hades/v1/cdn/resources?template_name=uds.hades.test_drive.miniapp_config"
        //"https://y.qq.com/m/ticket/index.html#js_sale_page/528731707/104"
    );
    await page.tracing.stop();
});

// 请求过滤
router.get("/request", async (req, res, next) => {
    // 启动
    const browser = await puppeteer.launch({
        headless: false //设置成是否打开浏览器
    });
    const page = await browser.newPage();
    // await page.emulate(iPhone);
    // 启动 request
    await page.setRequestInterception(true);
    // Response
    page.on("request", interceptedRequest => {
        if (
            interceptedRequest.url().endsWith(".png") ||
            interceptedRequest.url().endsWith(".jpg") ||
            interceptedRequest.url().includes(".jpg")
        ) {
            // 中断
            interceptedRequest.abort();
        } else {
            interceptedRequest.continue();
        }
    });
    await page.goto("https://www.58pic.com/");
    //  获取页面
    const html = await page.$eval("body", e => e.outerHTML);
    console.log(html);
    dumpFrameTree(page.mainFrame(), "");
    await browser.close();

    function dumpFrameTree(frame, indent) {
        log(indent + frame.url());
        for (let child of frame.childFrames()) {
            dumpFrameTree(child, indent + "  ");
        }
    }
});

// 注入
router.get("/addjs", async (req, res, next) => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    log("打开");
    await page.goto("https://www.58pic.com/");
    page.waitFor(2000);
    await page.pdf({
        path: "download/example_pdf.pdf"
    });
    // const st = await page.$(".modelNav-left");
    // await page.addScriptTag({ path: "public/javascripts/test.js" });
});
// 页面事件
router.get("/12306", async (req, res, next) => {
    // 启动
    const browser = await puppeteer.launch({
        headless: false //设置有头
    });
    const page = await browser.newPage();
    // 模拟机型
    log.greenlog("进入页面");
    await page.goto("https://kyfw.12306.cn/otn/resources/login.html");
    log.greenlog("加载中...");
    await page.waitForSelector("#J-login");
    log.greenlog("完成加载，登陆中...");
    await page.type("#J-userName", "账号");
    await page.type("#J-password", "密码", { delay: 100 });
    await page.tap("#J-login");
    log.greenlog("跳转查询");
    await page.goto("https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc");

    await page.waitForSelector("#fromStationText");

    log.bluelog("选择目的地。。。");
    await page.click("#toStationText");
    await page.focus("#toStationText");
    await page.type("#toStationText", "hd", { delay: 100 });
    await page.waitFor(1000);
    await page.waitForSelector("#citem_0");
    await page.tap("#citem_0");

    log.bluelog("选择出发地。。。");
    await page.waitFor(1000);
    await page.click("#fromStationText");
    await page.focus("#fromStationText");
    await page.type("#fromStationText", "bj", { delay: 100 });
    await page.waitFor(1000);
    await page.waitForSelector("#citem_0");
    await page.tap("#citem_0");
    await page.tap("#query_ticket");

    log.greenlog("查询中。。。");
    await page.waitForSelector("a.btn72");
    await page.tap("a.btn72");
});
module.exports = router;
