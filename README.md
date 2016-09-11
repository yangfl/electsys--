This project is under heavy development, yet some of functions are available now. Feel free to open an issue or contact me if you have any problems or suggestions during test.


## Electsys&#35;


Just another electsys optimizer, inspired by https://github.com/laohyx/electsys

### Requirements

Basic ECMAScript 6 support

async/await (enable by `--js-flags="--harmony-async-await"` or chrome://flags/#enable-javascript-harmony )

`fetch` API

### Features
* 高速登录
* 界面清理
* 选课优化
* 自动评教

### 使用方法
点击右上角“选课”，等待系统检查选课状态  
单击右侧按钮，选择课程类型（按住 ctrl 键以联合选择）  
单击课程名称，加载教师列表  
点击教师名称，使用外部资源查看教师评价  
双击课程名称，自动选择教师并提交（按住 ctrl 键自动退选冲突课程）  
单击课程表内课程，退选此课  
按 S 键提交已选课程
