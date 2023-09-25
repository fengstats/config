const fs = require('fs')
const path = require('path')

// 临时模式
let tempMode = false
// 匹配模式
// free: 默认，自由标题匹配
// custom: 自定义标题匹配，需要配置 includeTitleList
let MATCH_MODE = 'free'
// 固定插件标题
const insertTitle = 'Record'
// 需要匹配的标题列表
const includeTitleList = ['重要的事', '生活', '休闲']
// 需要排除的目录或者文件
const excludeFileList = ['.DS_Store']
// 是否进行控制台打印调试
const IS_PRINT_CONSOLE = true
// 是否需要插入模板格式信息（用于匹配替换）
let IS_INSERT_TEMPLATE = true
// 是否写入文件
const IS_WRITE_FILE = true
// 是否删除未匹配到内容的标题
const IS_REMOVE_TITLE = false

// 时间转换：分钟转换为小时 + 分钟，可选前后缀参数
function timeTransform(t, timePrefix = '：**', timeSuffix = '**', isTotalTime = false) {
  // TODO: 临时处理
  if (tempMode && !isTotalTime) {
    timePrefix = '（**'
    timeSuffix = '**）'
  }
  if (t === 0) return tempMode ? '（）' : '：'
  const h = Math.floor(t / 60)
  // 不满 10 补 0
  const m = Math.floor(t % 60)
  // 0 的情况就不输出了
  return `${timePrefix}${h == 0 ? '' : h + 'h'}${m == 0 ? '' : `${m}`.padStart(2, '0') + 'min'}${timeSuffix}`
}

;(function () {
  const args = process.argv.slice(2)
  const inputPath = args[0]
  const filePathList = []
  tempMode = args[1] === '1' ? true : false

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

  // 启动1
  function run(filePath) {
    // 文件内容
    let text = fs.readFileSync(filePath, 'utf8')

    // 通过正则校验数据是否需要解析
    // TODO: 貌似并不可行，万一解析的最后一次因为写错了时间超过了 24h，那么该文件就不会再被解析了
    // const hour = parseInt((text.match(/\n> .*\*\*(\d+)h.*\*\*/) || [])[1] || '0')

    // 数据列表
    const dataList = []
    // 初始化
    initData()

    // 核心处理
    const totalTime = parseFileContent(dataList, text)

    // 插入模板
    IS_INSERT_TEMPLATE && (text = insertRecordTemplate(dataList, text, insertTitle))
    // 替换文件中的内容
    dataList.length && (text = matchContentReplace(dataList, text))
    // 将内容写入到「Record」 中
    IS_WRITE_FILE && saveFile(filePath, text)

    // 之前的数据就不打印了，没啥用捏
    if (totalTime < 24 * 60) console.log(`${path.basename(filePath)} ⚡${timeTransform(totalTime, '', '')} `)
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
    IS_INSERT_TEMPLATE = true
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
        `${matchContent} ⚡️ ${timeTransform(minuteTime, '**')}`,
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
    let index = 0
    while ((match = contentRegex.exec(text)) !== null) {
      const title = match[1]
      const matchContent = match[2].trim()
      const matchContentList = matchContent.match(contentTimeRegex) || []
      // 一些些额外处理
      if (title === insertTitle) {
        // 不需要插入
        IS_INSERT_TEMPLATE = false
        continue
      } else if (MATCH_MODE === 'custom' && !includeTitleList.includes(title)) {
        // 不满足自定义匹配的标题
        continue
      } else if (!matchContent) {
        // 没有内容的标题
        IS_REMOVE_TITLE && addData(dataList, title, '', `\n## ${title}\n*`, '')
        continue
      }
      // } else if (!matchContentList?.length) {
      //   // 没有匹配到时间的直接叉出去
      //   continue
      // }
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
      const insertContent = tempMode ? `${++index}. ${title}（）` : `- [x] ${title}：`
      const matchTitle = tempMode ? `${title}（.*` : `${title}：.*`
      addData(dataList, title, insertContent, matchTitle, `${title}` + timeTransform(minuteTime), minuteTime, {
        matchContentList,
      })
    }
  }

  // 计算总时长录入
  function calculateTotalTimeAdd(dataList, title = '总时长') {
    let totalTime = 0
    dataList.forEach(({ statsTime }) => (totalTime += statsTime))
    !tempMode &&
      dataList.forEach((item) => {
        if (item.statsTime !== 0) {
          item.percentage = Math.round((item.statsTime / totalTime) * 100)
          // NOTE: 这里百分比是四舍五入的，可能会存在总和不为 100 的情况
          item.result += `（<font color="#45465e">${item.percentage}%</font>）`
        }
      })
    addData(
      dataList,
      title,
      `\n> ${title}：\n`,
      title + '：.*',
      title + timeTransform(totalTime, '：**', '**', true),
      totalTime,
    )
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
