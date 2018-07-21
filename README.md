# ynpm - 内部镜像

#### 概述

`ynpm`为`npm`在公司内部的镜像仓库配套的命令行工具，根据镜像代理，嵌套`npm`，关于镜像和命令行工具说明如下：

- 镜像
  - 使用`Nexus Repository OSS`搭建`npm`镜像
  - 镜像源使用淘宝`cnpm`镜像库
  - 镜像无需同步，下载即缓存，实现一次下载，全员共享
- 命令行
  - 实现自动根据IP选择下载源
    - 内网自动使用公司镜像
    - 外网自动使用淘宝镜像
    - 不对`npm`的镜像源入侵

总体实现

- 公司内通过使用`ynpm`,实现快速下载包，减少下载等待时间
- 支持内网发布私有包



#### 安装

```
npm install ynpm-tool -g
```



#### 基本使用

```
# 安装(install相关命令均支持)
$ ynpm install xxx --option

# 正常发包[只发布用友内网包]
$ ynpm publish

# 设置用户名
$ ynpm set user=jonyshi

# 设置用email
$ ynpm set email=jonyshi

# 获取sshk
$ ynpm set sshk

# 帮助
$ ynpm 或 ynpm -h 或 ynpm --help

# 版本
$ ynpm -v 或 ynpm --version
```



#### 权限说明

- **默认内网发包**

  所有下载安装工具的，均可使用`ynpm install`功能下载安装包或`ynpm publish`内网发包

- **内网发包用户**

  > `0.2.0`版本起实现内网发包，可支持`@group/packageName`形式的私有包发送。

  管理员会提供账号，可通过申请获得，简单配置即可实现内部发包。

  内部发包使用说明，可参考此[官网新手文档](https://package.yonyoucloud.com/)

  ​


#### Q&A

* 下载包极慢，报错timeout

  根据反馈，少数包会报错。原因是安装包依赖一个外链下载(可能是github或amazon等第三方地址)。因为众所周知的原因，你很有可能下载不到从而出现timeout(相同的问题cnpm也会存在）.

  解决办法：冷静点，再装一次
