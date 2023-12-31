import fs from 'fs'
import NP from 'number-precision'

const inputPath = `/Users/feng/codebase/personal/config/3-js/index.md`
let text = fs.readFileSync(inputPath, 'utf8')

const regex = /> 支出小记：.*\n([\s\S]*?)(?=\n\n)/
const moneyRegex = /（(.*) 元）/g

const match = regex.exec(text)

console.log(NP.plus(...['1', '2', '', '0.2', '0.1']))

if (match) {
  const matchContent = match[1]
  console.log(matchContent)
  let matchMoney
  while ((matchMoney = moneyRegex.exec(matchContent)) !== null) {
    console.log(matchMoney[1])
  }
}
