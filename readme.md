# csassjs

一个批量sass/scss编译器，对指定文件夹下scss/sass后缀的文件进行编译，并输出到指定文件夹，支持包含和忽略配置

## 使用方法

### 传统方法

1. 安装csassjs

```shell
npm install csassjs --save-dev / yarn add csassjs -D / pnpm add csassjs -D
```

2. 初始化配置文件

```shell
npx csass init
```

将在运行目录下生成一个csass.config.js配置文件

3. 按需修改配置文件

4. 编译并监听文件夹

```shell
npx csass start
```

### 使用脚本

```json
{
 "scripts": {
  "csass:start": "csass init && csass start -o static/scss -t static/css"
 }
}

```


### 在程序中使用

```nodejs
const csass  = require("csassjs")
const config = require("csass.config.js") // your vno config
csass(config)
 .then(() => {
  console.log("编译完成，开始监听文件夹")
 })
 .catch(err => {
  console.error(err)
 })
```


### 获取帮助

```shell
npx csass --help
npx csass init --help
npx csass start --help
```
