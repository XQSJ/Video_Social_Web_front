const OSS = require('ali-oss');

const client = new OSS({
    // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'cs-shanghai',
    // 从环境变量中获取访问凭证
    // 当然，以下两个也可以直接写死
    accessKeyId: 'LTAI5tEdXUnEBu5V7sQVnkJs',
    accessKeySecret: 'PRYEoatScwy8LlRROPbaRJ0DYxtdr9',
    // 填写Bucket名称。
    bucket: 'vsm-oss'
});
