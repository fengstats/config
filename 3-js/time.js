// 接收命令行输入
// @ts-ignore
const input = process.argv.slice(2)
const len = input.length

function timeTransform(t) {
  const h = Math.floor(t / 60)
  // 不满10补0
  const m = Math.floor(t % 60)
  // 0的情况就不输出了
  return `${h == 0 ? '' : h + 'h'}${m == 0 ? '' : `${m}`.padStart(2, '0') + 'min'}`
}

;(function () {
  if (len == 0) {
    console.log('给点东西')
    return
  }

  let copyContent = ''

  if (len == 1) {
    // 将总分钟转换为：小时 + 分钟
    const m = input[0]
    copyContent = timeTransform(m)
  } else if (len == 2) {
    // 将小时分钟转换为：总分钟
    const h = parseInt(eval(input[0]))
    const m = parseInt(eval(input[1]))
    const minuteTime = h * 60 + m
    copyContent = minuteTime + ''
    console.log(timeTransform(minuteTime))
  } else {
    // 将输入的数据加起来，输出总分钟，以及小时 + 分钟
    const timeSumStr = input.filter((item) => parseInt(item) > 0).join('+')
    // 让 js 帮我们算好了
    // NOTE: es module 下如果遇到 01、02... 这样的数值进入运算就会报错，所以还是不用了
    // SyntaxError: Octal literals are not allowed in strict mode.
    // const minuteSum = eval(timeSumStr)
    const minuteSum = input.reduce((accumulator, currentTime) => parseInt(currentTime) + accumulator, 0)
    copyContent = `${timeTransform(minuteSum)}`
    const output = `${timeSumStr}\n${minuteSum}\n`
    console.log(output)
  }
  console.log(copyContent)
})()
