
#### Todo

- 增加自定义镜像选择
- 增加内部发包功能`ynpm publish`✅
- 内部发包权限管理✅
- 实现npm私有镜像镜像`@`下载 ✅
- 给出下载进度
- 去除`If happen error, call me, my mobile is 186`✅


- ynpm-tools 部分

  1. sshk 的时候，npmrc文件中 _auth 没写进去。
  2. sshk 提示信息不全。完整提示网站地址。
  3. set email的时候，直接生成sshk，且提示出来。
  4. 增加ynpm sshk 只是获取sshk的提示，进行展示。
  5. publish 
  6. install  需测试npm包是否冲突问题。安装到本地是否可用。
  7. 尝试npm register 方式调用 install，去掉npminstall 包的依赖。
  

- npm publish 部分

 1. uiser_id 未存进去数据库。
 2. 根据auth查询改成根据user_id 查询。


- web 部分

1. 新手指南、安装使用教程
2. 我发布的页面，要根据user_id 
3. 组件详情页面，为显示问题。
4. 热门包，过滤不对。


- Nexus 

1. Nexus账户同步到我们自己的数据库。
 

- bug
 
 1. npm install 包数量显示。
 2. 界面UI，热门包显示问题。
 3. 界面问题。setting不能点击。
 4. 界面问题。刷新丢失数据问题。
 5. 界面问题。刷新丢失数据问题。
 6. publish 包的时候，错误提示不够明确。
 7. install 包的时候，参数错误的提示要详细



