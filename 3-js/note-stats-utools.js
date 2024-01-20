import fs from 'fs'
import path from 'path'
import clipboardy from 'clipboardy'
import NP from 'number-precision'

const year = '2024'
const month = '01'
let inputPath = `/Users/feng/codebase/personal/diary-note/${year}/${month}月`

const isRemoveTitle = false
const recordTitle = 'Record'
const includeTitleList = ['重要', '生活', '休闲']
const excludeFileList = []
const bracketMap = { '': '', '**': '**', '(': ')', '（': '）' }
const typeMap = {
  title: 'title',
  quote: 'quote',
  money: 'money',
}
// 生活: '',
const colorMap = {
  重要: ['#3eb370', '#44c47b'],
  出行: ['#3eb370', '#44c47b'],
  睡眠: ['#91c5b9', '#91c5b9'],
  生活: ['#4e99de', '#1f99ed'],
  // 休闲: ["#f09665", "#FC8D2A"],
  休闲: ['#ff6b81', '#ff4757'],
  其他: ['#a5b1c2', '#a5b1c2'],
}
const modeMap = {
  free: 'FREE',
  custom: 'CUSTOM',
  temp: 'TEMP',
}
const style = {
  // fontFamily: 'font-family: Input Mono Freeze',
  // fontFamily: 'font-family: Comic Sans MS',
  // fontFamily: 'font-family: Maple UI',
  fontFamily: '',
  fontWeight: 'font-weight: 700',
  fontSize: 'font-size: 16px',
  autoCenter: 'width: fit-content; margin: 0 auto;',
}

let matchMode = modeMap['free']
let isSaveFile = true
let isInsertTemplate = true
// 月支出
let monthSpend = 0
// 月收入
let monthEarn = 0
// 单文件总时长
let fileTotalTime = 0

function generateMoneyHtml(title, money, text, emoji) {
  return `
  <div style="${style.fontFamily}; ${style.autoCenter}; margin-bottom: 8px;">
    这个月${text}
    <span style="
      display: inline-block;
      width: 75px;
      text-align: center;
      color: ${colorMap[title][1]};
      ${style.fontSize}; 
      ${style.fontWeight};"
    >${money}</span> 元了 ${emoji}
  </div>`
}

// 生成任务模板
function generateTaskHtml(title, content = '') {
  return `
  <div style="${style.fontFamily}">
    <h1 style="
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      ${style.fontWeight};
    "
    >${title}</h1>
    <ul style="
      padding: 0; 
      margin: 12px 0;
      padding-left: 12px;
      line-height: 2; 
      text-align: center;
    ">${content}</ul>
  </div>
  `
}

// 生成单个任务 HTML 模板
function generateTaskItemHtml(title, statsTime) {
  // <div style="margin-right: 8px;">ꔷ</div>
  const progressHeight = `height: 18px`
  const progressRadius = `border-radius: 9px`
  const [color1, color2] = colorMap[title] || colorMap['生活']
  const percentage = Math.round((100 * statsTime) / fileTotalTime)
  // 单独处理百分比小于 10% 的进度小球大小和位置
  const circleBoxSize = percentage >= 10 ? 40 : 34
  const circleBoxTop = percentage >= 10 ? 0.88 : 0.64 // 大往上，小往下
  const circleTextTop = percentage >= 10 ? 0.32 : 0.06 // 大往下，小往上
  const titleFlex = matchMode === modeMap['temp'] ? 0.3 : 0.08
  const isMinPercentage = percentage >= 2
  return `
  <li class="task-item" style="
      ${style.fontSize};
      display: flex;
      align-items: center;
      margin: 0.25rem 0;
      margin-left: -12px;
    "
  >
    <div class="title" style="
        flex: ${titleFlex};
        color: ${color2};
        ${style.fontWeight};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      "
    >${title}</div>
    <div class="progress" style="
        ${progressHeight};
        ${progressRadius};
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        flex-grow: 1;
        margin: 0 6px;
        background: linear-gradient(to right, #ecf0f1 80%, transparent 100%);
        ${!isMinPercentage ? 'overflow: hidden;' : ''}
      "
    >
      <div class="progress-bar" style="
          position: relative;
          ${progressHeight};
          ${progressRadius};
          width: ${percentage}%;
        background: linear-gradient(to right, ${color1}, ${color2});
        "
      >
        ${
          isMinPercentage
            ? `<div class="progress-percentage" style="
            position: absolute;
            height: ${circleBoxSize}px;
            width: ${circleBoxSize}px;
            top: -${circleBoxTop}em;
            right: -1.5em;
            padding-top: ${circleTextTop}em;
            border-radius: 50%;
            font-size: 14px;
            color: #ffffff;
            background-color: ${color2};
            border: 2px solid #ffffff;
            box-sizing: border-box;
          "
          >${percentage}%</div>
        `
            : ''
        }
      </div>
    </div>
    <div style="
        flex: 0.14;
        color: ${color2};
        ${style.fontWeight}
    "
    >${minToTimeStr(statsTime, '')}</div>
  </li>`
}

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

function initData() {
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
      monthSpend = NP.plus(addMoneyData(dataList, matchContent, '支出小记'), monthSpend)
      monthEarn = NP.plus(addMoneyData(dataList, matchContent, '收入小记'), monthEarn)
      addMoneyData(dataList, matchContent, '人情世故')
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
  addData(dataList, typeMap['quote'], {
    title,
    insert: `\n> ${title}：\n`,
    matchRegex: `${title}：.*`,
    result: `${title}：${minToTimeStr(fileTotalTime)}`,
  })
}

function addMoneyData(dataList, text, title) {
  // NOTE: \\s\\S 这里是因为字符串形式需要转移
  // /> 支出小记：.*\n([\s\S]*?)(?=\n{2}|$)'
  const regex = new RegExp(`> ${title}：.*\n([\\s\\S]*?)(?=\n{2}|$)`)
  const moneyRegex = /-.*（(.*?) 元.*）/g

  let money = 0
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
      money = NP.plus(spend, money)
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
  return money
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
    generateTaskHtml('这是一个空文件嗷~')
    return
  }

  const oldTotalTimeList = text.match(/\n> 总时长：\*\*(\d+h)?(\d+min)?.*\*\*/) ?? []
  const oldTotalTime = parseInt(oldTotalTimeList[1] || '0') * 60 + parseInt(oldTotalTimeList[2] || '0')
  const dataList = []
  initData()
  parseFileContent(dataList, text)

  if (isInsertTemplate) text = insertRecordTemplate(dataList, text, recordTitle)
  if (dataList.length) text = matchContentReplace(dataList, text)
  if (oldTotalTime !== fileTotalTime && isSaveFile) saveFile(filePath, text)
  // 手动更新
  // saveFile(filePath, text)

  if (Math.min(oldTotalTime, fileTotalTime) < 24 * 60) {
    let title = path.parse(filePath).name
    let content = ''
    if (fileTotalTime === 0) {
      // printTip(`${title}：`)
      console.log(generateTaskHtml(title, '暂无时长可统计，可先添加二级标题 → 任务列表 → 尾部追加时间'))
      return
    }

    title += `<div style="margin: 0 10px;">🕛</div>`
    title += `${minToTime(fileTotalTime)}`

    // 临时模式将标题替换为总时长，将总时长写入到系统剪贴板中
    if (matchMode === modeMap['temp']) {
      title = `总时长：<span style="color: ${colorMap['重要'][1]}">${minToTimeStr(fileTotalTime, '')}</span>`
      clipboardy.write(minToTimeStr(fileTotalTime, ''))
    } else {
      clipboardy.write(minToTime(fileTotalTime))
    }
    for (const { type, title, statsTime } of dataList) {
      // 过滤
      if (type !== typeMap['title'] || title === '睡眠' || statsTime === 0) continue
      // 加入输出模板中
      content += generateTaskItemHtml(title, statsTime)
    }

    // 添加睡眠时间，注意可能有多个睡眠数据
    let sleepTime = 0
    for (const { title, statsTime } of dataList) {
      if (title === '睡眠') sleepTime += statsTime
    }
    if (sleepTime) {
      // title += ` 💤 ${minToTimeStr(sleepTime, '')}`
      content += generateTaskItemHtml('睡眠', sleepTime)
    }

    // 输出
    console.log(generateTaskHtml(title, content))
  }
}

function setup(inputPath) {
  // 如果有值就按照临时模式匹配
  const forceInputPath = process.argv.slice(2)[0]
  if (forceInputPath) {
    matchMode = modeMap['temp']
    inputPath = forceInputPath
    // 不需要插入标题和保存
    isInsertTemplate = false
    isSaveFile = false
  }
  if (!inputPath) {
    generateTaskHtml('请先传入一个文件/文件夹')
    return
  }
  if (!fs.existsSync(inputPath)) {
    generateTaskHtml('没有找到这个文件/文件夹~')
    return
  }
  if (fs.statSync(inputPath).isFile()) {
    run(inputPath)
    return
  }

  // 执行
  const files = fs.readdirSync(inputPath)
  for (const file of files) {
    if (path.extname(file) !== '.md' || excludeFileList.includes(file)) continue
    const filePath = path.join(inputPath, file)
    if (fs.statSync(filePath).isFile()) {
      run(filePath)
    }
  }

  console.log(generateMoneyHtml('重要', monthEarn, '赚了', '🎉'))
  console.log(generateMoneyHtml('生活', monthSpend, '花了', '💢'))
}

setup(inputPath)
