使用cheerio+superagent对网页的爬虫 ，并且使用async进行并发控制

app2.js

启动命令：nodemon app2.js 黄山

完成：

1.对网页上面图片对应的超链接进行爬取，并且对各个超链接再次进行爬取，获取图片详情

2.将图片详情（链接，名称，作者）保存在mongodb数据库

3.对网页上面爬取图片进行保存在本地pics的文件夹内，pic文件夹内部再建立文件夹，类似于 黄山1520836633740 （关键词再加时间戳） 加时间戳防止测试的时候文件夹命名相同导致错误




使用cheerio+superagent对网页的爬虫 

app.js 

启动命令：nodemon app.js

完成：

1.对网页上面爬取的图片进行保存在本地pics的文件夹内

2.将图片链接 和 图片名称保存在mongodb 数据库




