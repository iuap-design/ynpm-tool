# ynpm-tool - 内部镜像

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


# 正常发包
$ ynpm publish

# 内网发包
$ ynpm publish inner

# 帮助
$ ynpm 或 ynpm -h 或 ynpm --help

# 版本
$ ynpm -v 或 ynpm --version
```



#### 权限说明

- **默认用户**

  所有下载安装工具的，均可使用`ynpm install`功能下载安装包

- **发包用户**

  > `0.2.0`版本起实现内网发包，可支持`@group/packageName`形式的私有包发送。

  管理员会提供账号，可通过申请获得，简单配置即可实现内部发包。

  - 管理员提供账号密码，形式为`user:pass`转化为`base64`后的字符串形式（请以管理员实际给到的密码为准，以下仅为测试）：

    ```
    b252bm86b252bm9QYXNz
    ```

  - 用户在shell中，配置一条`_auth`信息，即可实现内网发包功能：

    ```
    $ npm config set _auth=b252bm86b252bm9QYXNz
    ```

- **发包说明**

  为避免发包用户滥用权限，所有发包用户均需提供私有包的组织（或项目名），即`@group`.

  如用户账号仅支持发布`@ynpmyou_fed`的私有包，发布的包会做以下验证，判断是否可上传：

  ```
  @ynpmyou_fed/tinper  // 可正常内网发布
  @ynpmyou_fed/comp    // 可正常内网发布 
  @mywork/tinper      // 超出权限，不可发布
  @newgroup/comp      // 超出权限，不可发布
  ```

  ​

#### Todo

- 增加自定义镜像选择
- 增加内部发包功能`ynpm publish`✅
- 内部发包权限管理✅
- 实现npm私有镜像镜像`@`下载 ✅
- 给出下载进度
- 去除`If happen error, call me, my mobile is 186`✅