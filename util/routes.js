var path = require("path");
var fs = require("fs");
// 递归 routes
const readDir = (url, filepath) => {
    const exists = fs.existsSync(url);
    const stat = fs.statSync(url);
    const sep = path.sep;
    let pathList = [];
    if (exists && stat) {
        let fpath = url.split(sep);
        let filename = fpath[fpath.length - 1];
        //判断文件、文件目录是否存在
        if (stat.isFile()) {
            filename = filename.substr(0, filename.length - 3);
            pathList.push({
                path: filepath ? filepath : filename,
                filename: filepath + filename
            });
        } else if (stat.isDirectory()) {
            let files = fs.readdirSync(url);
            if (files && files.length > 0) {
                files.forEach(file => {
                    let routesPath = "";
                    if (filepath) {
                        routesPath = filepath;
                    }
                    if (!file.includes(".js")) {
                        routesPath = (filepath ? filepath : "") + file + "/";
                    }
                    let lists = readDir(url + sep + file, routesPath);
                    pathList = pathList.concat(lists); //递归
                });
            }
        }
    } else {
        console.info("根目录不存在.");
    }
    return pathList;
};

module.exports = readDir;
