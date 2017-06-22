/**
 * fis3-deploy-qcloud
 */

// 引入 Node.js SDK
var COS = require('cos-nodejs-sdk-v5');
var fs = require('fs');

var cos;
var config;


/**
 * 直接上传二进制流
 */
function uploadBuf(release, content, file, callback) {
    var subpath = file.subpath;
    var objkey = release.replace(/^\//, '');


    fis.log.debug(config);


    fis.log.debug('file.basename');
    fis.log.debug(file.basename);
    fis.log.debug('objkey', objkey);
    fis.log.debug(fs.createReadStream(objkey));
    fis.log.debug('fs.statSync(objkey).size', fs.statSync(objkey).size)

    cos.putObject({
        Bucket: config.Bucket, /* 必须 */
        Region: config.Region,
        Key: file.basename, /* 必须 */
        // Body: filepath,
        Body: fs.createReadStream(objkey), /* 必须 */
        ContentLength: fs.statSync(objkey).size, /* 必须 */
        onProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
        },
    }, function (err, data) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            fis.log.debug(data)
            // var time = '[' + fis.log.now(true) + ']';
            // process.stdout.write(
            //     ' uploadQcloud - '.green.bold +
            //     time.grey + ' ' + 
            //     subpath.replace(/^\//, '') +
            //     ' >> '.yellow.bold +
            //     ret.key + '\n'
            // );
            callback();
        }
    });
}

/**
 * deploy-qcloud 插件接口
 * @param  {Object}   options  插件配置
 * @param  {Object}   modified 修改了的文件列表（对应watch功能）
 * @param  {Object}   total    所有文件列表
 * @param  {Function} callback     调用下一个插件
 * @return {undefined}
 */
module.exports = function(options, modified, total, callback) {
    
    cos = new COS(options);
    config = options;

    var steps = [];

    modified.forEach(function(file) {
        var reTryCount = options.retry;
        steps.push(function(next) {
            var _upload = arguments.callee;

            uploadBuf(file.getHashRelease(), file.getContent(), file, function(error){
                if (error) {
                    if (!--reTryCount) {
                        throw new Error(error);
                    } else {
                        _upload(next);
                    }
                } else {
                    next();
                }
            });
        });
    });
    fis.util.reduceRight(steps, function(next, current) {
        return function() {
            current(next);
        };
    }, callback)();
};

module.exports.options = {
  // 允许重试两次。
  retry: 2
};
