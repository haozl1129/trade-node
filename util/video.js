const downloadVideo = async video => {
    // 判断视频文件是否已经下载
    if (!fs.existsSync(`/download/${video.title}.mp4`)) {
        await getVideoData(video.src, "binary").then(fileData => {
            console.log("下载视频中：", video.title);
            savefileToPath(video.title, fileData).then(res =>
                console.log(`${res}: ${video.title}`)
            );
        });
    } else {
        console.log(`视频文件已存在：${video.title}`);
    }
};
// 获取视频数据
const getVideoData = (url, encoding) => {
    return new Promise((resolve, reject) => {
        let req = http.get(url, function(res) {
            let result = "";
            encoding && res.setEncoding(encoding);
            res.on("data", function(d) {
                result += d;
            });
            res.on("end", function() {
                resolve(result);
            });
            res.on("error", function(e) {
                reject(e);
            });
        });
        req.end();
    });
};
// 将视频数据保存到本地
const savefileToPath = (fileName, fileData) => {
    let fileFullName = `/download/${fileName}.mp4`;
    return new Promise((resolve, reject) => {
        fs.writeFile(fileFullName, fileData, "binary", function(err) {
            if (err) {
                console.log("savefileToPath error:", err);
            }
            resolve("已下载");
        });
    });
};
