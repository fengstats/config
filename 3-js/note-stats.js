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
// 前后缀括号映射
const bracketMap = { '': '', '**': '**', '(': ')', '（': '）' }

let matchMode = modeMap['free']
// 是否需要插入模板格式信息，用于匹配替换，默认开启
let isInsertTemplate = true
// 文件总时长
let fileTotalTime = 0

// 固定插件标题
const insertTitle = 'Record'
// 需要匹配的标题列表
const includeTitleList = ['重要', '生活', '休闲']
// 需要排除的目录或者文件
const excludeFileList = []
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
  function setup() {
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

    // 如果是文件直接执行
    if (fs.statSync(inputPath).isFile()) {
      run(inputPath)
      return
    }

    // TODO: 下面就是目录的情况了，目前没有支持递归扫描，只支持该目录第一层 md 文件

    // 读取所有文件名
    const files = fs.readdirSync(inputPath)
    for (let file of files) {
      // 过滤不是 md 的文件或者被排除的文件
      if (path.extname(file) !== '.md' || excludeFileList.includes(file)) continue
      // 合并为完整路径
      const filePath = path.join(inputPath, file)
      // 将扫描到的文件添加到文件列表（排除一些文件和目录）
      if (fs.statSync(filePath).isFile()) filePathList.push(filePath)
    }

    // 遍历文件列表开始执行
    filePathList.forEach((filePath) => {
      run(filePath)
    })
  }

  // 数据初始化
  function initData(isTmpMode) {
    // 在临时模式下默认不插入
    isInsertTemplate = !isTmpMode
    fileTotalTime = 0
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

  // 启动
  function run(filePath) {
    // 文件内容
    let text = fs.readFileSync(filePath, 'utf8')
    // 是否为临时模式
    const isTmpMode = matchMode === modeMap['temp'] ? true : false
    // 在处理前通过正则校验提取旧日记的总时长
    const oldTotalTimeList = text.match(/\n> 总时长：\*\*(\d+h)?(\d+min)?.*\*\*/) ?? []
    const oldTotalTime = parseInt(oldTotalTimeList[1] || '0') * 60 + parseInt(oldTotalTimeList[2] || '0')
    // 数据列表
    const dataList = []

    // 初始化
    initData(isTmpMode)
    // 核心处理
    parseFileContent(dataList, text)

    // 是否插入模板
    if (isInsertTemplate) text = insertRecordTemplate(dataList, text, insertTitle)
    // 根据不同的正则，替换文件中的内容
    if (dataList.length) text = matchContentReplace(dataList, text)

    // 将内容写入到『Record』中
    // 优化：新总时长对比旧总时长，不一致时进行写入更新
    if (oldTotalTime !== fileTotalTime && isSaveFile) saveFile(filePath, text)
    // saveFile(filePath, text)

    // 之总时长超过或等于 24h 一律认为已经完成，但是会存在最后一次超过或等于的情况
    // 这时候我们还是要打印的，所以两个总时长取一个较小的
    if (Math.min(oldTotalTime, fileTotalTime) >= 24 * 60 && !isTmpMode) return

    // 开始打印！去除 .md 的后缀名
    let index = 1
    let bracket = ''
    let printContent = `${path.parse(filePath).name}`
    // 关于睡眠数据特殊处理
    for (let item of dataList) {
      if (item.title === '睡眠') {
        printContent += ` 💤 ${minToTimeStr(item.statsTime, '')}`
        break
      }
    }
    // 加上总时长
    printContent += ` 🕛 ${isTmpMode ? minToTimeStr(fileTotalTime, '') : minToTime(fileTotalTime)}\n`
    // 剩余标题数据
    for (let item of dataList) {
      const { title, statsTime } = item
      // 不包含睡眠和总时长
      if (['睡眠', '总时长'].includes(title) || statsTime === 0) continue
      printContent += `\n${index++}. ${title} ${minToTimeStr(statsTime, bracket)}`
    }
    console.log(printContent, '\n')
  }

  // 解析文件内容，根据匹配正则录入数据
  function parseFileContent(dataList, text) {
    // 睡眠时长
    addSleepTimeData(dataList, text)
    // 内容时长
    addTitleTimeData(dataList, text)
    // 总时长
    addTotalTimeData(dataList, fileTotalTime)
  }

  // 根据匹配正则添加睡眠时长数据
  function addSleepTimeData(dataList, text, match, sleepTitle = '睡眠') {
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
      const statsTime = duration / 1000 / 60
      // 累加给文件总时长
      fileTotalTime += statsTime
      // 录入数据
      addData(
        dataList,
        sleepTitle,
        `- [x] ${sleepTitle}：${matchContent}`,
        matchContent + '.*',
        `${matchContent} 💤 ${minToTimeStr(statsTime)}`,
        statsTime,
      )
    }
  }

  // 根据匹配正则添加标题为主的内容数据时长
  function addTitleTimeData(dataList, text, match) {
    const contentRegex = /## (.+?)\n([\s\S]*?)(?=\n## |\n*$)/g
    const contentTimeRegex = /- \[x\].*\*\*(.*)\*\*/g
    // NOTE: 后面的 \+? 为了兼容旧笔记数据，如 1h+、25min+ 等等
    const timeRegex = /\*\*(\d+h)?(\d+min)?\+?\*\*/

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
      if (matchMode === modeMap['custom'] && !includeTitleList.includes(title)) {
        continue
      }
      // 没有匹配到内容的标题
      if (!matchContent) {
        // 顺便看看要不要删除
        isRemoveTitle && addData(dataList, title, '', `\n## ${title}\n*`, '')
        continue
      }

      // OK，校验都结束了，那我们下面开始匹配时间数据并计算

      // 插入内容
      let insertContent = `- [x] ${title}：`
      // 匹配标题
      let matchTitle = `${title}：.*`
      // 当前标题下的总时长
      let statsTime = 0
      for (let content of matchContentList) {
        // 每个任务的统计时长
        let taskMinTime = 0
        const matchTimeList = content.match(new RegExp(timeRegex, 'g')) || []
        // NOTE: 兼容单个任务内出现多个时长的情况
        for (let taskContent of matchTimeList) {
          const item = taskContent.match(timeRegex) || []
          const hour = parseInt(item[1]) || 0
          const minute = parseInt(item[2]) || 0
          taskMinTime += hour * 60 + minute
        }
        // 累加到标题总时长
        statsTime += taskMinTime
      }
      // 标题总时长累加到文件总时长上
      fileTotalTime += statsTime
      // 添加数据，后续统一处理
      addData(dataList, title, insertContent, matchTitle, `${title}：${minToTimeStr(statsTime)}`, statsTime, {
        matchContentList,
      })
    }
  }

  // 录入总时长
  function addTotalTimeData(dataList, totalTime, title = '总时长') {
    // 根据总时长给原有标题时长添加百分比信息
    dataList.forEach((item) => {
      if (item.statsTime !== 0) {
        item.percentage = Math.round((item.statsTime / totalTime) * 100)
        // NOTE: 这里百分比是四舍五入的，可能会存在总和不为 100 的情况
        item.result += `（${item.percentage}%）`
      }
    })

    addData(dataList, title, `\n> ${title}：\n`, `${title}：.*`, `${title}：${minToTimeStr(totalTime)}`, totalTime)
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

  // salute！
  setup()
})()
