## 概述

`ynpm`为`node`在公司内部的镜像仓库配套的命令行工具，根据镜像代理，嵌套`npm`，关于镜像和命令行工具说明如下：

- 镜像
  - 使用`Nexus Repository OSS`搭建`npm`镜像
  - 镜像源使用淘宝`cnpm`镜像库
  - 镜像无需同步，下载即缓存，实现一次下载，全员共享
- 命令行
  - 实现自动根据IP选择下载源
    - 内网自动使用公司镜像
    - 外网自动使用淘宝镜像
    - 不对`npm`的镜像源入侵

总体实现：公司内通过使用`ynpm`,实现快速下载包，减少下载等待时间

## 安装

```
npm install ynpm-cli -g
```



## 使用

```
# 安装(install相关命令均支持)
ynpm install xxx --option

# 帮助
ynpm 或 ynpm -h 或 ynpm --help

# 版本
ynpm -v 或 ynpm --version
```

- 其他命令暂不准备实现
