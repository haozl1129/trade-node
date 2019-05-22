const express = require("express");
const Redis = require("ioredis");

const log = require("../util/chalkLog");
const router = express.Router();
const config = {
    port: 6379,
    host: "d-awsbj-uds-001-001.dsh08y.0001.cnn1.cache.amazonaws.com.cn"
};

router.get("/", async function(req, res, next) {
    const redis = new Redis(config.port, config.host);
    try {
        redis.sadd("tablelist", [1, 2, 3]);
        let tablelist = await redis.get("tablelist");
        log(tablelist);
    } catch (error) {
        log.errorlog(error);
    }

    let test = await redis.get("uds-node-accessToken");
    log.redlog(test);
    redis.get("foo", function(err, result) {
        log(result);
        res.send(result);
    });
});

router.get("/bef", async function(req, res, next) {});

module.exports = router;
