// 单词排序脚本

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 在 ES Module 里面不能直接用 __dirname 麻烦死我了
// NOTE: 因为我在 package.json 中配置 type: module
const _fileName = fileURLToPath(import.meta.url)
const filePath = process.argv.slice(2)[0] || path.join(path.dirname(_fileName), 'index.md')
const data = fs.readFileSync(filePath, 'utf8')

let text = ''
let match = null
// const regex = /(> .*)\n([\s\S]*?)(?=\n{2}|$)/g
const regex = /(>.*)\n([\s\S]*?)(?=(>.*)|$)/g
while ((match = regex.exec(data)) !== null) {
  // 匹配出所有的单词
  const title = match[1]
  const words = match[2].match(/\w+/g)
  text += title + '\n\n- ' + words.sort().join('\n- ') + '\n\n'
}

// 写入文件
fs.writeFileSync(filePath, text, 'utf8')
