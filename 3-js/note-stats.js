const fs = require('fs')
const path = require('path')

// 匹配模式
const modeMap = {
  // 默认匹配，也就是所有标题都会匹配
  free: 'FREE',
  // 自定义匹配，会过滤掉除了在 includeTitleList 中的其他标题
  custom: 'CUSTOM',
  // 临时匹配，与默认匹配一样，只不过输出格式有点差别，可以在执行脚本时开启
  temp: 'TEMP',
}
// 括号映射
const bracketMap = { '': '', '**': '**', '(': ')', '（': '）' }

let matchMode = modeMap['free']
// 固定插件标题
const insertTitle = 'Record'
// 需要匹配的标题列表
const includeTitleList = ['重要', '生活', '休闲']
// 需要排除的目录或者文件
const excludeFileList = ['.DS_Store']

// 是否需要插入模板格式信息，用于匹配替换，默认开启
let isInsertTemplate = true
// 是否写入文件，默认开启
const isSaveFile = true
// 是否删除未匹配到内容的标题，默认关闭
const isRemoveTitle = false

// 时间转换：分钟转换为 h+min/h/min，可选前后缀参数
function minToTimeStr(t, bracket = '**') {
  // 没有值返回空字符串
  if (t === 0) return ''

  const h = Math.floor(t / 60)
  const m = Math.floor(t % 60)
  // 0 的情况返回空字符串
  // 不满 10 补 0
  // 小时不补 0（感觉不好看，不直观）
  const hStr = h === 0 ? '' : h + 'h'
  const mStr = m === 0 ? '' : String(m).padStart(2, '0') + 'min'

  return bracket + hStr + mStr + bracketMap[bracket]
}

// 时间转换：分钟转换为 00:00 形式
function minToTime(time) {
  const h = String(Math.floor(time / 60)).padStart(2, '0')
  const m = String(Math.floor(time % 60)).padStart(2, '0')
  return h + ':' + m
}

;(function () {
  const args = process.argv.slice(2)
  const inputPath = args[0]
  const filePathList = []

  // 选择匹配模式，如果有值说明匹配到了
  if (modeMap[args[1]]) matchMode = modeMap[args[1]]

  // 异常处理
  if (!inputPath) {
    console.log('请先传入一个文件/文件夹')
    return
  } else if (!fs.existsSync(inputPath)) {
    console.log('没有找到这个文件/文件夹~')
    return
  }

  // 判断路径为文件还是文件夹
  if (fs.statSync(inputPath).isFile()) {
    filePathList.push(inputPath)
  } else {
    // 读取所有文件名
    const files = fs.readdirSync(inputPath)
    files.forEach((file) => {
      if (excludeFileList.includes(file)) {
        return
      }
      // 合并为完整路径
      const filePath = path.join(inputPath, file)
      // 将扫描到的文件添加到文件列表（排除一些文件和目录）
      if (fs.statSync(filePath).isFile()) filePathList.push(filePath)
    })
  }

  // 遍历文件列表开始处理
  filePathList.forEach((filePath) => {
    run(filePath)
  })

  // 启动
  function run(filePath) {
    // 文件内容
    let text = fs.readFileSync(filePath, 'utf8')

    // 在处理前通过正则校验提取旧日记的总时长
    const oldTotalTimeList = text.match(/\n> 总时长：\*\*(\d+h)?(\d+min)?.*\*\*/) ?? []

    // 数据列表
    const dataList = []

    // 初始化
    initData()

    // 核心处理
    const totalTime = parseFileContent(dataList, text)

    // 插入模板
    if (isInsertTemplate) text = insertRecordTemplate(dataList, text, insertTitle)

    // 根据不同的正则，替换文件中的内容
    if (dataList.length) text = matchContentReplace(dataList, text)

    // 将内容写入到『Record』中
    const oldTotalTime = parseInt(oldTotalTimeList[1] || '0') * 60 + parseInt(oldTotalTimeList[2] || '0')
    // 优化：新总时长对比旧总时长，不一致时进行写入更新
    if (oldTotalTime !== totalTime && isSaveFile) saveFile(filePath, text)

    // 超过 24h 一律认为已经完成，就不打印啦~
    if (totalTime >= 24 * 60) return

    // 开始打印！去除 .md 的后缀名
    let printContent = `${path.parse(filePath).name}`
    // 关于睡眠数据特殊处理
    for (let item of dataList) {
      if (item.title === '睡眠') {
        printContent += ` 💤 ${minToTimeStr(item.statsTime, '')}`
        break
      }
    }
    // 加上总时长
    printContent += ` ⏱ ${minToTime(totalTime)}\n`

    // 剩余标题数据
    let index = 1
    for (let item of dataList) {
      const { title, statsTime } = item

      // 不包含睡眠和总时长
      if (['睡眠', '总时长'].includes(title) || statsTime === 0) continue
      printContent += `\n${index++}. ${title}${minToTimeStr(statsTime, '（')}`
    }

    console.log(printContent, '\n')
  }

  // 录入数据
  function addData(dataList, title, insertContent, matchContent, result, statsTime = 0, options = {}) {
    dataList.push({
      // 标题
      title,
      // 插入模板需要的内容
      insertContent,
      // 替换匹配需要的内容
      matchContent,
      // 替换结果
      result,
      // 此标题下的统计时长
      statsTime,
      // 一些其他的可选参数
      ...options,
    })
  }

  // 数据初始化
  function initData() {
    isInsertTemplate = true
  }

  // 解析文件内容，根据匹配正则录入数据
  function parseFileContent(dataList, text) {
    // 睡眠时长
    addSleepTimeData(dataList, text)
    // 内容时长
    addTitleData(dataList, text)
    // 总时长
    return calculateTotalTimeAdd(dataList)
  }

  // 根据匹配正则添加睡眠时长数据
  function addSleepTimeData(dataList, text, match) {
    const sleepTitle = '睡眠'
    const sleepTimeRegex = /(\d{2}):(\d{2})-(\d{2}):(\d{2})/g
    while ((match = sleepTimeRegex.exec(text)) !== null) {
      // 开始与结束时间，默认当前时间
      const start = new Date()
      const end = new Date()
      const matchContent = match[0]
      const startHour = parseInt(match[1], 10)
      const startMinute = parseInt(match[2], 10)
      const endHour = parseInt(match[3], 10)
      const endMinute = parseInt(match[4], 10)
      start.setHours(startHour, startMinute)
      end.setHours(endHour, endMinute)
      // 如果结束时间在开始时间之前，表示跨天
      if (end < start) {
        // 将结束时间调整为第二天
        end.setDate(end.getDate() + 1)
      }
      // 计算时间差
      const duration = end.getTime() - start.getTime()
      const minuteTime = duration / 1000 / 60
      addData(
        dataList,
        sleepTitle,
        `- [x] ${sleepTitle}：${matchContent}`,
        matchContent + '.*',
        `${matchContent} 💤 ${minToTimeStr(minuteTime)}`,
        minuteTime,
      )
    }
  }

  // 根据匹配正则添加标题为主的内容数据时长
  function addTitleData(dataList, text, match) {
    const contentRegex = /## (.+?)\n([\s\S]*?)(?=\n## |\n*$)/g
    const contentTimeRegex = /- \[x\].*\*\*(.*)\*\*/g
    // NOTE: 后面的 \+? 为了兼容之前没有写具体时间的数据，如 1h+、25min+ 等等
    const timeRegex = /\*\*(\d+h)?(\d+min)?\+?\*\*/

    let index = 1
    while ((match = contentRegex.exec(text)) !== null) {
      const title = match[1]
      const matchContent = match[2].trim()
      const matchContentList = matchContent.match(contentTimeRegex) || []

      // 该文件中已有插入标题，无需自动插入
      if (title === insertTitle) {
        isInsertTemplate = false
        continue
      }

      // 过滤不满足 custom 模式内包含的标题
      if (matchMode === modeMap['custom'] && !includeTitleList.includes(title)) continue

      if (!matchContent) {
        // 没有内容的标题
        isRemoveTitle && addData(dataList, title, '', `\n## ${title}\n*`, '')
        continue
      }

      // 转换时间格式
      const minuteTime =
        matchContentList?.reduce((accumulator, content) => {
          let minuteTime = 0
          // 匹配小时与分钟
          const matchTimeList = content.match(new RegExp(timeRegex, 'g')) || []
          // console.log(matchTimeList)
          // 兼容单任务出现多时间的内容
          matchTimeList.forEach((timeContent) => {
            const item = timeContent.match(timeRegex) || []
            const hour = parseInt(item[1]) || 0
            const minute = parseInt(item[2]) || 0
            minuteTime += hour * 60 + minute
          })
          // 计算总分钟数
          return minuteTime + accumulator
        }, 0) || 0
      // TODO: 临时处理

      // 插入内容
      let insertContent = `- [x] ${title}：`
      // 匹配标题
      let matchTitle = `${title}：.*`

      // if (matchMode === modeMap['temp']) {
      //   insertContent = `${index++}. ${title}（）`
      //   matchTitle = `${title}（.*`
      // }

      addData(dataList, title, insertContent, matchTitle, `${title}：${minToTimeStr(minuteTime)}`, minuteTime, {
        matchContentList,
      })
    }
  }

  // 计算总时长录入
  function calculateTotalTimeAdd(dataList, title = '总时长') {
    const totalTime = dataList.reduce((prev, { statsTime }) => prev + statsTime, 0)
    dataList.forEach((item) => {
      if (item.statsTime !== 0) {
        item.percentage = Math.round((item.statsTime / totalTime) * 100)
        // TODO: 这里百分比是四舍五入的，可能会存在总和不为 100 的情况
        item.result += `（${item.percentage}%）`
      }
    })

    addData(dataList, title, `\n> ${title}：\n`, `${title}：.*`, `${title}：${minToTimeStr(totalTime)}`, totalTime)
    return totalTime
  }

  // 根据扫描标题动态插入格式模板
  function insertRecordTemplate(dataList, text, title) {
    let insertTemplate = `## ${title}\n\n`
    dataList.forEach(({ insertContent }) => {
      // 插入内容为空就不用插入了
      if (insertContent) {
        insertTemplate += insertContent + '\n'
      }
    })
    return insertTemplate + text
  }

  // 根据内容匹配正则替换数据（返回替换后的数据，不影响原数据）
  function matchContentReplace(dataList, text) {
    dataList.forEach(({ matchContent: match, result }) => {
      text = text.replace(new RegExp(match), result)
    })
    return text
  }

  // 保存文件内容
  function saveFile(filePath, text) {
    fs.writeFileSync(filePath, text, 'utf8')
  }
})()
