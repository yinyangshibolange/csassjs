const path = require("path")
const fs = require("fs")
const fs_promises = fs.promises
const sass = require('sass');
const logger = require("./logger")
const watchFiles = require("node-watch");

module.exports = async function (config) {
 logger.primary('sass编译中...')
 let item = config
 let origin = item.origin
 let target = item.target
 const origin_path = path.resolve(process.cwd(), origin)
 const target_path = path.resolve(process.cwd(), target)
 const includes = (item.includes || []).map(item => path.resolve(origin_path, item))
 const ignores = (item.ignores || []).map(item => path.resolve(origin_path, item))
 async function compileSassFile (fpath, fileName, target_path) {
  try {
   if (fileName.endsWith(".scss") || fileName.endsWith(".sass")) {
    const result = sass.compile(fpath);
    await fs_promises.writeFile(path.resolve(target_path, fileName.replace(/\.[a-zA-Z]+/, ".css")), result.css)
   }
  } catch (err) {
   console.error(err)
  }
 }
 async function compileSass (origin_path, target_path) {
  try {
   const stat = await fs_promises.stat(target_path)
   if (!stat.isDirectory()) {
    await fs_promises.mkdir(target_path)
   }
  } catch (err) {
   await fs_promises.mkdir(target_path)
  }
  try {
   const res = await fs_promises.readdir(origin_path)
   if (Array.isArray(res) && res.length > 0) {
    for (let j = 0; j < res.length; j++) {
     const fpath = path.resolve(origin_path, res[j])
     const fstat = await fs_promises.stat(fpath)
     if (fstat.isDirectory()) {
      if (!ignores.find(item => fpath.indexOf(item) > -1)) {
       if (Array.isArray(includes) && includes.length > 0) {
        if (includes.find(item => fpath.indexOf(item) > -1)) {
         await compileSass(fpath, path.resolve(target_path, res[j]))
        }
       } else {
        await compileSass(fpath, path.resolve(target_path, res[j]))
       }
      }


     } else if (fstat.isFile()) {
      if (!ignores.find(item => fpath.indexOf(item) > -1)) {
       if (Array.isArray(includes) && includes.length > 0) {
        if (includes.find(item => fpath.indexOf(item) > -1)) {
         await compileSassFile(fpath, res[j], target_path)
        }
       } else {
        await compileSassFile(fpath, res[j], target_path)
       }

      }

     }
    }
   }
  } catch (err) {
   console.error(err)
  }
 }

 await compileSass(origin_path, target_path)

 if (item.hot) {
  watchFiles(origin_path, {
   recursive: true,
  }, async function (eventType, filePath,) {
   if (filePath) {
    const filePathParse = path.parse(filePath)
    const updateDir = filePathParse.dir.replace(origin_path, '')
    if (!ignores.find(item => filePath.indexOf(path.resolve(origin_path, item)) > -1)) {
     if (Array.isArray(includes) && includes.length > 0) {
      if (includes.find(item => filePath.indexOf(path.resolve(origin_path, item)) > -1)) {
       const filename = filePathParse.name + filePathParse.ext
       await compileSassFile(filePath, filename, path.resolve(target_path, updateDir.substring(1)))
      }
     } else {
      const filename = filePathParse.name + filePathParse.ext
      await compileSassFile(filePath, filename, path.resolve(target_path, updateDir.substring(1)))
     }
    }
   }
  })
  logger.info(`${origin_path}监听中......`)
 }
 logger.primary('sass编译完成')
}
