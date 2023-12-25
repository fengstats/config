import fs from 'fs'
import path from 'path'
import clipboardy from 'clipboardy'
import NP from 'number-precision'

const year = '2023'
const month = '12'
let inputPath = `/Users/feng/codebase/personal/diary-note/${year}/${month}月`

const typeMap = {
  title: 'title',
  quote: 'quote',
  money: 'money',
}
const colorMap = {
  // 重要: '#65B741',
  // 休闲: '#e95548',
  重要: '#3eb370',
  生活: '#5296d5',
  休闲: '#ff4757',
  其他: '#7f8c8d',
}
const modeMap = {
  free: 'FREE',
  custom: 'CUSTOM',
  temp: 'TEMP',
}
const bracketMap = { '': '', '**': '**', '(': ')', '（': '）' }

let matchMode = modeMap['free']
let isInsertTemplate = true
let fileTotalTime = 0
// 月支出
let monthSpend = 0

const recordTitle = 'Record'
const includeTitleList = ['重要', '生活', '休闲']
const excludeFileList = []
const isSaveFile = true
const isRemoveTitle = false

function minToTime(time, separator = ':') {
  const h = String(Math.floor(time / 60)).padStart(2, '0')
  const m = String(Math.floor(time % 60)).padStart(2, '0')
  return h + separator + m
}

function minToTimeStr(t, bracket = '**') {
  if (t === 0) return ''
  const h = Math.floor(t / 60)
  const m = Math.floor(t % 60)
  const hStr = h === 0 ? '' : h + 'h'
  const mStr = m === 0 ? '' : String(m).padStart(2, '0') + 'min'
  return bracket + hStr + mStr + bracketMap[bracket]
}

function minToTimeStrChinese(t, bracket = '**') {
  if (t === 0) return ''
  const h = Math.floor(t / 60)
  const m = Math.floor(t % 60)
  const hStr = h === 0 ? '' : String(h).padStart(2, '0') + '时'
  const mStr = m === 0 ? '' : String(m).padStart(2, '0') + '分'
  return bracket + hStr + mStr + bracketMap[bracket]
}

function initData(isTmpMode) {
  isInsertTemplate = !isTmpMode
  fileTotalTime = 0
}

function addData(dataList, type, data) {
  const id = dataList.length + 1
  const { title = '', matchRegex = '', result = '' } = data
  // 公有参数
  const item = { id, type, title, matchRegex, result }
  switch (type) {
    case typeMap['title']:
      const { insert = '', statsTime = 0, matchList = [] } = data
      item.insert = insert
      item.statsTime = statsTime
      item.matchList = matchList
      break
    case typeMap['quote']:
      // ...
      break
    default:
      break
  }
  dataList.push(item)
}

function addSleepTimeData(dataList, text, match, title = '睡眠') {
  const sleepTimeRegex = /(\d{2}):(\d{2})-(\d{2}):(\d{2})/g
  while ((match = sleepTimeRegex.exec(text)) !== null) {
    const start = new Date()
    const end = new Date()
    const matchContent = match[0]
    const startHour = parseInt(match[1], 10)
    const startMinute = parseInt(match[2], 10)
    const endHour = parseInt(match[3], 10)
    const endMinute = parseInt(match[4], 10)
    start.setHours(startHour, startMinute)
    end.setHours(endHour, endMinute)
    if (end < start) {
      end.setDate(end.getDate() + 1)
    }
    const duration = end.getTime() - start.getTime()
    const statsTime = duration / 1000 / 60
    fileTotalTime += statsTime
    addData(dataList, typeMap['title'], {
      title,
      insert: `- [x] ${title}：${matchContent}`,
      matchRegex: `${matchContent}.*`,
      statsTime,
      result: `${matchContent} 💤 ${minToTimeStr(statsTime)}`,
    })
  }
}

function addTitleTimeData(dataList, text, match) {
  const contentRegex = /## (.+?)\n([\s\S]*?)(?=\n## |\n*$)/g
  const contentTimeRegex = /- \[x\].*\*\*(.*)\*\*/g
  const timeRegex = /\*\*(\d+h)?(\d+min)?\+?\*\*/

  while ((match = contentRegex.exec(text)) !== null) {
    const title = match[1]
    const matchContent = match[2].trim()
    const matchContentList = matchContent.match(contentTimeRegex) || []

    if (title === recordTitle) {
      isInsertTemplate = false
      continue
    }
    if (matchMode === modeMap['custom'] && !includeTitleList.includes(title)) {
      continue
    }
    if (!matchContent) {
      isRemoveTitle &&
        addData(dataList, typeMap['title'], {
          title,
          matchRegex: `\n## ${title}\n*`,
          result: '',
        })
      continue
    }
    // 自动计算
    if (title === '生活') {
      addMoneyData(dataList, matchContent, '支出小记')
      addMoneyData(dataList, matchContent, '收入小记')
    }

    const insert = `- [x] ${title}：`
    const matchRegex = `${title}：.*`
    let statsTime = 0
    for (const content of matchContentList) {
      let taskMinTime = 0
      const matchTimeList = content.match(new RegExp(timeRegex, 'g')) || []
      for (const taskContent of matchTimeList) {
        const item = taskContent.match(timeRegex) || []
        const hour = parseInt(item[1]) || 0
        const minute = parseInt(item[2]) || 0
        taskMinTime += hour * 60 + minute
      }
      statsTime += taskMinTime
    }
    fileTotalTime += statsTime
    addData(dataList, typeMap['title'], {
      title,
      insert,
      matchRegex,
      statsTime,
      result: `${title}：${minToTimeStr(statsTime)}`,
      matchList: matchContentList,
    })
  }
}

function addTotalTimeData(dataList, title = '总时长') {
  // dataList.forEach((item) => {
  //   if (item.statsTime !== 0) {
  //     item.percentage = Math.round((item.statsTime / totalTime) * 100)
  //     item.result += `（${item.percentage}%）`
  //   }
  // })

  addData(dataList, typeMap['quote'], {
    title,
    insert: `\n> ${title}：\n`,
    matchRegex: `${title}：.*`,
    result: `${title}：${minToTimeStr(fileTotalTime)}`,
  })
}

// 支出小记
function addMoneyData(dataList, text, title) {
  // NOTE: \\s\\S 这里是因为字符串形式需要转移
  // /> 支出小记：.*\n([\s\S]*?)(?=\n{2}|$)'
  const regex = new RegExp(`> ${title}：.*\n([\\s\\S]*?)(?=\n{2}|$)`)
  const moneyRegex = /-.*（(.*?) 元.*）/g

  const match = regex.exec(text)
  if (match) {
    const matchContent = match[1]
    const moneyList = []
    let matchMoney
    while ((matchMoney = moneyRegex.exec(matchContent)) !== null) {
      moneyList.push(matchMoney[1])
    }
    let result = `${title}：`
    if (moneyList.length) {
      const spend = NP.plus(...moneyList)
      monthSpend = NP.plus(spend, monthSpend)
      result += `${moneyList.join('+')}（${spend} 元）`
    } else {
      result += '0 元'
    }
    addData(dataList, typeMap['money'], {
      title,
      matchRegex: `${title}：.*`,
      result,
      moneyList,
    })
  }
}

function insertRecordTemplate(dataList, text, title) {
  let insertTemplate = `## ${title}\n\n`
  for (const { insert } of dataList) {
    if (insert) insertTemplate += insert + '\n'
  }
  return insertTemplate + text
}

function matchContentReplace(dataList, text) {
  for (const { matchRegex, result } of dataList) {
    if (matchRegex === '') continue
    const regex = new RegExp(matchRegex)
    text = text.replace(regex, result)
  }
  return text
}

function parseFileContent(dataList, text) {
  addSleepTimeData(dataList, text)
  addTitleTimeData(dataList, text)
  addTotalTimeData(dataList)
}

function saveFile(filePath, data) {
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error('❌ 文件更新失败', err)
    } else {
      // console.log('✅ 文件更新成功')
    }
  })
}

function run(filePath) {
  let text = fs.readFileSync(filePath, 'utf8')

  if (!text) {
    console.log('这是一个空文件噢~')
    return
  }

  const isTmpMode = matchMode === modeMap['temp']
  const oldTotalTimeList = text.match(/\n> 总时长：\*\*(\d+h)?(\d+min)?.*\*\*/) ?? []
  const oldTotalTime = parseInt(oldTotalTimeList[1] || '0') * 60 + parseInt(oldTotalTimeList[2] || '0')
  const dataList = []

  initData(isTmpMode)
  parseFileContent(dataList, text)

  if (isInsertTemplate) text = insertRecordTemplate(dataList, text, recordTitle)
  if (dataList.length) text = matchContentReplace(dataList, text)

  if (oldTotalTime !== fileTotalTime && isSaveFile) saveFile(filePath, text)
  // 手动更新
  // saveFile(filePath, text)

  if (Math.min(oldTotalTime, fileTotalTime) < 24 * 60) {
    if (fileTotalTime === 0) {
      console.log(`
      <div style="margin: 0 0 12px;">
        暂无时长可统计~ 可先添加二级标题 -> 任务列表 -> 在尾部追加花费时间
      </div>
      `)
      return
    }
    let title = path.parse(filePath).name
    let content = ''
    // 可能有多个睡眠数据
    let sleepTime = 0
    for (const { title, statsTime } of dataList) {
      if (title === '睡眠') sleepTime += statsTime
    }
    if (sleepTime) title += ` 💤 ${minToTimeStr(sleepTime, '')}`
    title += ` 🕛 ${minToTime(fileTotalTime)}`
    // 临时模式将标题替换为总时长
    // 将总时长写入到系统剪贴板中
    if (isTmpMode) {
      title = `总时长：<span style="color: ${colorMap['重要']}">${minToTimeStr(fileTotalTime, '')}</span>`
      clipboardy.write(minToTimeStr(fileTotalTime, ''))
    } else {
      clipboardy.write(minToTime(fileTotalTime))
    }
    for (const { type, title, statsTime } of dataList) {
      if (type !== typeMap['title'] || title === '睡眠' || statsTime === 0) continue
      content += `<li>${title}<span style="color: ${colorMap[title]}; font-weight: 700;">（${minToTimeStr(
        statsTime,
        '',
      )}）</span></li>`
    }
    const template = `
    <div style="font-family: Input Mono Freeze;">
      <h1 style="margin: 0; font-size: 15px; font-weight: 700;">${title}</h1>
      <ul style="padding: 0; margin: 12px 0; padding-left: 12px;line-height: 2;">
        ${content}
      </ul>
    </div>
    `
    console.log(template)
  }
}

function setup(inputPath) {
  // 如果有值就按照临时模式匹配
  const forceInputPath = process.argv.slice(2)[0]
  if (forceInputPath) {
    matchMode = modeMap['temp']
    inputPath = forceInputPath
  }
  const filePathList = []

  if (!inputPath) {
    console.log('请先传入一个文件/文件夹')
    return
  } else if (!fs.existsSync(inputPath)) {
    console.log('没有找到这个文件/文件夹~')
    return
  }

  if (fs.statSync(inputPath).isFile()) {
    run(inputPath)
    return
  }

  const files = fs.readdirSync(inputPath)
  for (const file of files) {
    if (path.extname(file) !== '.md' || excludeFileList.includes(file)) continue
    const filePath = path.join(inputPath, file)
    if (fs.statSync(filePath).isFile()) filePathList.push(filePath)
  }

  filePathList.forEach((filePath) => {
    run(filePath)
  })

  console.log(
    `<div style="font-family: Input Mono Freeze">
      ${month}月已经花了 <span style="color: ${colorMap['生活']};font-size: 16px; font-weight: 700;">${monthSpend}</span> 元了嗷老弟 🥲
    </div>`,
  )
}

setup(inputPath)
