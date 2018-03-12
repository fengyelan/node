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
    path = require('path');


//连接数据库
var mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1/test");
var db = mongoose.connect;
var Schema = mongoose.Schema;
// //声明Schema
var picSchema = new Schema({
    title: String,
    picUrl: String
}, {
    versionKey: false
});

// //创建模型
var picModel = mongoose.model('Pic', picSchema);

//下面是一个图片网站，搜索某个特定的XX
var q = "华山";
var picUrl = "https://pixabay.com/zh/photos/?q=" + encodeURIComponent(q);

var dir = path.join(__dirname+'/pics', '/' + q + new Date().getTime());
fs.mkdir(dir);

superagent.get(picUrl)
    .end(function(err, res) {
        if (err) {
            return console.log(err);
        }

        var $ = cheerio.load(res.text);

        $(".item").each(function(id, el) {
            var $el = $(el),
                $img = $el.find("a img"),
                //图片使用了懒加载
                //前面的图片标签是<img srcset="https://cdn.pixabay.com/photo/2018/03/12/00/24/nature-3218449__340.jpg 1x, https://cdn.pixabay.com/photo/2018/03/12/00/24/nature-3218449__480.jpg 2x" src="https://cdn.pixabay.com/photo/2018/03/12/00/24/nature-3218449__340.jpg" alt="自然, 植物区系, 户外, 草, 特写, 增长, 干, 夏天, 光明, 野生" title="自然, 植物区系, 户外, 草, 特写, 增长, 干, 夏天, 光明">
                //后面的图片的src是/static/img/blank.gif，真实的图片地址是在data-lazy属性里面存折
                //<img src="/static/img/blank.gif" data-lazy-srcset="https://cdn.pixabay.com/photo/2018/03/11/22/05/cyprus-3218163__340.jpg 1x, https://cdn.pixabay.com/photo/2018/03/11/22/05/cyprus-3218163__480.jpg 2x" data-lazy="https://cdn.pixabay.com/photo/2018/03/11/22/05/cyprus-3218163__340.jpg" alt="塞浦路斯, 拉纳卡, 的Ayios的Georgios, 结构, 拱, 宗教" title="塞浦路斯, 拉纳卡, 的Ayios的Georgios, 结构, 拱">
                //以逗号分隔的一个或多个字符串列表表明一系列用户代理使用的可能的图像
                //由以下组成：
                // 一个图像的 URL。
                // 可选的，空格后跟以下的其一：
                // 一个宽度描述符，这是一个正整数，后面紧跟 'w' 符号。该整数宽度除以sizes属性给出的资源（source）大小来计算得到有效的像素密度，即换算成和x描述符等价的值。
                // 一个像素密度描述符，这是一个正浮点数，后面紧跟 'x' 符号。
                // 如果没有指定源描述符，那它会被指定为默认的 1x。
                pic_url = $img.attr("data-lazy") || $img.attr("src"),
                title = $img.attr("title");


            //保存到数据库
            saveDB(title, pic_url);


            var filename = pic_url.split('/').pop();

            //下载到本地文件夹
            download(dir, filename, pic_url);


        });
    });

/*
 *@desc 保存图片链接和名称到数据库
 *
 */
var i=0;
function saveDB(title, pic_url) {
    //创建实体
    var picEntity = new picModel({
        title: title,
        picUrl: pic_url
    });

    //存入数据库
    picEntity.save(function(err) {
        if (err) {
            return console.log(err);
        } else {
            i++;
            console.log("success"+i);
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