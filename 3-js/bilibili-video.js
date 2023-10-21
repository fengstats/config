// ==UserScript==
// @name Bilibili 合集时长显示
// @namespace http://tampermonkey
// @version 1.0
// @description
// @updateNote
// @author txsxcy
// @license GPL
// @match         *://www.bilibili.com/*
// @icon         chrome://favicon/http://www.bilibili.com/
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

// 样式加载
;(function () {
  'use strict'
  const style = `
    .video-info {
        overflow: hidden;
        text-align: center;
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        background-color: rgb(241, 242, 243);
        border-radius: 6px;
        font-size: 15px;
        line-height: 30px;
        margin-bottom: 25px;
        padding: 10px 10px 0px 10px;
        pointer-events: all;
    }
    .video-info li {
        width: 30%;
        float: left;
        margin-right: 10px;
        margin-bottom: 10px;
        list-style: none;
    }
    .video-info ul li:hover {
        background-color: rgb(255, 255, 255);
        border-radius: 12px;
        color: #00aeec;
        cursor:pointer
    }
    .video-info ul li:hover span {
        color: #00aeec;
    }
    .video-info span {
        display: block;
        width: 100%;
    }
    .video-info li span:first-child {
        color: #222;
        font-weight: 700;
    }
    .video-info li span:last-child {
        font-size: 12px;
        color: #18191c;
    }
  `
  const styleEl = document.createElement('style')
  styleEl.textContent = style
  document.head.appendChild(styleEl)
})()

// 启动
;(function () {
  // 是否多p视频
  let isMultiPVideo = false
  // 原始播放速度
  let video = document.querySelector('video') || document.querySelector('bwp-video')
  let videoTimes = []

  const liEl = document.body
  liEl.removeEventListener('click', showRemainingDuration)
  liEl.addEventListener('click', showRemainingDuration)

  // 等待元素加载完成
  onReady(
    '.bpx-player-video-area',
    function () {
      const div = document.createElement('div')
      div.setAttribute('id', 'speed')
      div.innerHTML = '<span></span>'
      document.querySelector('.bpx-player-video-area').appendChild(div)
    },
    100,
  )
  onReady(
    '.list-box .duration',
    function () {
      isMultiPVideo = true
      videoTimes = getVideoTimes()
      showRemainingDuration()
    },
    100,
  )
  // onReady(
  //   '.video-episode-card__info',
  //   function () {
  //     setTimeout(() => {
  //       isMultiPVideo = true
  //       videoTimes = getVideoTimes()
  //       showRemainingDuration()
  //     }, 3000)
  //   },
  //   100,
  // )

  // 获取视频播放时间数组
  function getVideoTimes() {
    if (videoTimes.length > 0) {
      return videoTimes
    }
    let lis = document.querySelectorAll('.list-box .duration')
    if (lis.length === 0) {
      lis = document.querySelectorAll('.video-sections-item .video-episode-card__info-duration')
    }
    lis.forEach((currentValue, index) => {
      const time = currentValue.innerText.replace(/\.\d+/g, '')
      videoTimes.push({
        timeStr: time,
        timeSeconds: timeToSeconds(time),
      })
    })
    return videoTimes
  }

  function showRemainingDuration(speed = 1) {
    console.log('showRemainingDuration running...')
    let matches = document.querySelector('.cur-page').innerText.match(/\((\d+)\/(\d+)\)/)
    let start = parseInt(matches[1])
    let end = parseInt(matches[2])
    let videoData = document.querySelector('#danmukuBox')
    let duration = calTime(start, end)
    // 获取要插入的元素的父元素
    let parent = videoData.parentElement
    // 查找是否有类名为 "video-info" 的元素
    let info = parent.querySelector('.video-info')
    // 如果存在，则删除它
    if (info) {
      info.remove()
    }
    const videoInfo = [
      {
        title: '总时长',
        duration: durationToString(calTime(1, end).total),
        style: 'font-weight: bold;font-size: 1em;',
      },
      {
        title: '已看',
        duration: durationToString(calTime(1, start - 1).total),
        style: 'color: #16a085;font-weight: bold;font-size: 1em;',
      },
      {
        title: '剩余',
        duration: durationToString(calTime(start, end).total),
        style: 'font-size: 1em;',
      },
    ]

    let html = ''
    videoInfo.forEach((info) => {
      html += `<li>
            <span>${info.title}</span>
            <span style="${info.style}">${info.duration}</span>
        </li>`
    })

    html = `<div>
            <ul>
                ${html}
            </ul>
        </div>`

    videoData.insertAdjacentHTML('afterend', `<div class="video-info">${html}</div>`)
  }

  // 根据视频播放时间数组和范围计算时间数据
  function calTime(start, end) {
    const duration = { total: 0, watched: 0, remaining: 0 }
    const endIndex = Math.min(videoTimes.length, end)
    for (let i = start - 1; i < endIndex; i++) {
      const data = videoTimes[i]
      if (i < end - 1) {
        duration.watched += data.timeSeconds
      } else {
        duration.remaining += data.timeSeconds
      }
      duration.total += data.timeSeconds
    }
    return duration
  }

  // 秒转 hh:mm
  function durationToString(duration) {
    const h = parseInt(duration / 3600)
    const m = parseInt(duration / 60) % 60
    const s = duration % 60

    if (h > 0) {
      return `${h}h${m}min`
    } else {
      return `${m}min`
    }
  }

  // 等待元素加载完成函数
  function onReady(selector, func, times = -1, interval = 20) {
    let intervalId = setInterval(() => {
      if (times === 0) {
        clearInterval(intervalId)
      } else {
        times -= 1
      }
      if (document.querySelector(selector)) {
        clearInterval(intervalId)
        func()
      }
    }, interval)
  }

  // 将时间字符串转换为秒数
  function timeToSeconds(time) {
    const timeArr = time.split(':')
    let timeSeconds = 0
    if (timeArr.length === 3) {
      timeSeconds += Number(timeArr[0]) * 60 * 60
      timeSeconds += Number(timeArr[1]) * 60
      timeSeconds += Number(timeArr[2])
    } else {
      timeSeconds += Number(timeArr[0]) * 60
      timeSeconds += Number(timeArr[1])
    }
    return timeSeconds
  }
})()
