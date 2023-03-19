// 根据下面 3 条规则，写一个函数按规则输入和输出
const list1 = ['janus', 'boys', 'toys'] // 's'
const list2 = ['medicine', 'racer', 'car'] // ''
const list3 = ['national', 'arrival', 'mental'] // 'al'
const list4 = ['le', 'hle', 'hhle'] // 'le'

// 求数组元素最长相同后缀
function getSameSuffix(arr) {
  console.log('\n======================================')
  if (arr.length === 0) {
    return ''
  }
  // 大致思路
  // 1. 定义
  //   isPass：用于表示是否继续循环查找, true 继续，false 停止
  //   shortStr：最短元素，默认为第一个，遍历一遍后替换掉，主要是用于节约比对次数，提升性能
  //   suffixStr：正在进行比对的后缀字符
  //   suffixStep：后缀步长初始为1，每查找一次+1，用于单个元素长度减去后计算得出需要比对的后缀字符位置
  // 2. 遍历一遍数组取出一个最短元素，赋值其对应的后缀字符，suffixStep+1
  // 3. 遍历数组元素进行后缀对比
  // 4. 相等则通过，以此类推，直到最短元素长度小于后缀步长或者出现比对不通过的情况时 isPass 标识设置为 false
  let isPass = true
  let shortStr = arr[0]
  let suffixStr = ''
  let suffixStep = 1
  let resList = []
  arr.forEach((element) => {
    if (shortStr.length > element.length) {
      shortStr = element
    }
  })
  console.log(`最短元素：${shortStr}`)
  while (isPass) {
    suffixStr = shortStr[shortStr.length - suffixStep]
    console.log(`${suffixStep} 比对后缀字符：${suffixStr}`)
    arr.some((ele) => {
      if (ele[ele.length - suffixStep] !== suffixStr) {
        // 结束
        isPass = false
        return true
      }
    })
    if (isPass) {
      resList.unshift(suffixStr)
      suffixStep++
    }
    if (suffixStep > shortStr.length) {
      console.log('超过最短元素长度，停止查找')
      isPass = false
    }
  }
  return 'result: ' + resList.join('')
}

console.log(getSameSuffix(list1))
console.log(getSameSuffix(list2))
console.log(getSameSuffix(list3))
console.log(getSameSuffix(list4))
