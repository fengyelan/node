
/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2018-03-11 16:25:09
 * @version $Id$
 */

var superagent = require('superagent'),
    cheerio = require('cheerio'),
    fs = require('fs-extra'),
    url = require('url'),
    path = require('path'),
    async = require('async');




//连接数据库
var mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1/test");
var db = mongoose.connect;
var Schema = mongoose.Schema;


//下面是一个图片网站，搜索某个特定的XX 命令行：nodemon app.js 黄山
var q = process.argv[2];
var picUrl = "https://pixabay.com/zh/photos/";

var dir = path.join(__dirname + '/pics', '/' + q + new Date().getTime());
fs.mkdir(dir);


superagent.get(picUrl)
    .query("q=" + encodeURIComponent(q))
    .end(function(err, res) {
        if (err) {
            return console.log(err);
        }

        var $ = cheerio.load(res.text);

		var urls = [];

        $(".item").each(function(id, el) {
            var $el = $(el);
            urls.push("https://pixabay.com" + $el.find("a").attr("href"));
        });

        //async控制并发，设置的并发数是3
        async.mapLimit(urls, 3, function(item, cb) {

            fetchUrl(item,cb);
            
        }, function(err, res) {
            console.log('err:' + err);
            console.log('res:' + res);
        });

    });

//声明Schema
var picSchema = new Schema({
    title: String,
    picUrl: String,
    author: String
},{
    versionKey: false
});

// //创建模型
var picDetailModel = mongoose.model('PicDetail'+q, picSchema);
var count = 0;
var i = 0;

/*
 *@desc获取单个图片的详情
 */
function fetchUrl(url,cb) {
	count++;
    console.log("此时并发数是：" + count);
    superagent.get(url)
        .end(function(err, res) {
            if (err) return console.log(err);
            count--;
            console.log("释放一个，此时并发是：" + count);
            var $ = cheerio.load(res.text);
            var author = $('.right').find("a").eq(0).find("img").attr("alt");
            var $img = $('#media_container').find("img"),
                picUrl = $img.attr("data-lazy") || $img.attr("src"),
                title = $img.attr("alt");
            savePicDB(title, picUrl, author);
            var filename = picUrl.split("/").pop();
            download(dir,filename,picUrl);
            i++;
            cb(null,"done"+i);

        });
}

/*
 *@desc 将图片详情保存在数据库
 *包括图片的链接，标题，作者
 */

function savePicDB(title, pic_url, author) {
    //创建实体
    var picDetailEntity = new picDetailModel({
        title: title,
        picUrl: pic_url,
        author: author
    });

    //存入数据库
    picDetailEntity.save(function(err) {
        if (err) {
            return console.log(err);
        }
    });
}


/*
 *@desc 下载文件到本地文件夹
 *@param dir:需要放在本地的文件夹名称
 *@param filename:图片名字
 *@param url:图片链接
 */
function download(dir, filename, url) {
    superagent.get(url)
        .pipe(fs.createWriteStream(path.join(dir, filename)));
}