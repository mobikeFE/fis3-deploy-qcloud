# fis3 静态资源腾讯云 部署插件

FIS 部署腾讯云存储插件。

## 安装

全局安装或者本地安装都可以。

```
npm install fis3-deploy-qcloud or npm install fis3-deploy-qcloud -g
```

## 使用方法

也可以使用统一的 deploy 插件配置方法

```js
fis.match('*.js', {
    deploy: fis.plugin('qcloud', {
        AppId: '**',
        Region: 'cn-south',
        SecretId: '**',
        SecretKey: '**',
        Bucket: '**'
    })
})
```
