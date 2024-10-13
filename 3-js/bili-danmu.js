import axios from 'axios'

const request = axios.create({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    Referer: 'https://www.bilibili.com/',
  },
})

request.interceptors.response.use(
  (response) => response.data,
  (err) => {
    console.log(err)
  },
)

let count = 970 

async function sendReq() {
  // 三个变量需要控制
  // msg 弹幕
  // cookie
  // csrf 验证
  // roomid 房间号

  const msg = count--
  const roomid = '32380080'
  const csrf = 'd9869c210ec46e4a22c7b49e7b6c8bef'

  const res = await request({
    url: 'https://api.live.bilibili.com/msg/send',
    method: 'POST',
    headers: {
      cookie: `Hm_lpvt_8a6e55dbd2870f0f5bc9194cddf32a02=1719750073; Hm_lvt_8a6e55dbd2870f0f5bc9194cddf32a02=1719750073; PVID=6; browser_resolution=1756-1001; CURRENT_FNVAL=4048; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjAwMDkyNjgsImlhdCI6MTcxOTc1MDAwOCwicGx0IjotMX0.4xLm1sY2H4sdDOGHHFDtPSfCH4hAl2cL5cQDJ0vy8jk; bili_ticket_expires=1720009208; bp_t_offset_3546561336314420=948808372184940544; home_feed_column=5; b_lsid=4510F78D8_19069176086; enable_web_push=DISABLE; header_theme_version=CLOSE; sid=6ugtopg9; LIVE_BUVID=AUTO7017141061232796; DedeUserID=3546561336314420; DedeUserID__ckMd5=7d88b7f3940d5e75; SESSDATA=8dad6bc2%2C1729657772%2Cbe34b%2A41CjCfxU8MV6b9uHoy_rynrikLq0BIEXzAWKKulelMMSIe7BMnG9U0DZcC-BYTL945GdYSVnpEQ1dIMGFVSVZfWXFSUjhueVpzcUc0b2hPY3JfYWQ4ajBveEFBRkpVblFGSTJlbU1QZElnQ3hmRS1rTEUwVl9KR1pLRkVHUXJCc1piLVF1TW11WHl3IIEC; bili_jct=d9869c210ec46e4a22c7b49e7b6c8bef; FEED_LIVE_VERSION=V_WATCHLATER_PIP_WINDOW3; buvid_fp=e91b03d2e1ed017e755baff80ded460c; _uuid=9DD9BE11-EA53-D4E9-FCFC-E6D1AB5E2DE527149infoc; buvid4=DC6A0D8F-FBA1-1AE6-7E3D-2662B1421CD227327-024042604-szwJdP2i5gLa6D9G20NMIw%3D%3D; rpdid=|(u)~m~Y)uku0J'u~||YJ|lYu; b_nut=1700630560; buvid3=14B1BF0D-524D-B89C-BBBF-0E8C47F5FFEE60432infoc`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: {
      msg,
      csrf,
      roomid,
      // 下面这几个固定的，但是必须要发
      fontsize: 25,
      color: 5816798,
      rnd: 1719748133,
    },
  })

  if (res.code === 0) {
    console.log(`弹幕: ${msg} 发送成功 ✅`)
  } else {
    console.log(`弹幕: ${msg} 发送失败 ❌`)
    console.log(res)
  }
}


function getRandomNum(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min
  console.log(num)
  return num
}

sendReq()

setInterval(() => {
  sendReq()
}, 20000)
