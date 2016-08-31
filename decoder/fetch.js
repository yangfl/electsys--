'use strict'
const CAPTCHA_IMG = 'https://jaccount.sjtu.edu.cn/jaccount/captcha'
const INTERVAL = 200

let button = document.getElementsByTagName('button')[0]
let img = document.getElementsByTagName('img')[0]
let canvas = document.getElementsByTagName('canvas')[0]
let context = canvas.getContext('2d')
let span = document.getElementsByTagName('pre')[0]

let jobID


button.onclick = function () {
  if (this.innerHTML == 'Start') {
    start()
  } else {
    stop()
  }
}


img.onload = function () {
  chrome.downloads.erase({filenameRegex: '.pbm$'})
  decode()
}


img.reload = function () {
  img.src= CAPTCHA_IMG + '?' + randomFilename()
}


function randomFilename () {
  return Date.now().toString() + Math.random()
}


function start () {
  chrome.permissions.request({ permissions: ['downloads'] },
    function (granted) {
      if (granted) {
        button.innerHTML = 'Stop'
        jobID = setTimeout(img.reload)
      } else {
        console.error('Permissions denied')
      }
    })
}


function stop () {
  chrome.permissions.remove({ permissions: ['downloads'] },
    function (removed) {
      if (removed) {
        button.innerHTML = 'Start'
        clearTimeout(jobID)
        jobID = undefined
        console.log('Permissions removed')
      } else {
        console.error('Permissions can\'t be removed')
      }
    })
}


const THRESHOLD = 128


function decode () {
  context.drawImage(img, 0, 0)
  let image_rgb_data = context.getImageData(0, 0, img.width, img.height).data
  let image_data = []
  for (let y = 0; y < img.height; y++){
    let row_data = []
    for (let i = y * img.width * 4; i < (y + 1) * img.width * 4; i += 4) {
      if (image_rgb_data[i] < THRESHOLD ||
          image_rgb_data[i + 1] < THRESHOLD ||
          image_rgb_data[i + 2] < THRESHOLD) {
        row_data.push(1)
      } else {
        row_data.push(0)
      }
    }
    image_data.push(row_data)
  }
  let l_sum_y = matrixYSum(image_data)
  for (let [start, end] of splitWave(l_sum_y)) {
    chrome.downloads.download({
      url: `data:,P1%0A${end - start} ${img.height}%0A${
        image_data.map(row => row.slice(start, end).join(' ')).join('%0A')}`,
      filename: '_' + (end - start) + '_' + Date.now() + '.pbm',
    })
  }
  if (jobID) {
    jobID = setTimeout(img.reload, INTERVAL)
  }
}


function matrixXSum (data, from = 0, to) {
  return data.map(row =>
    row.slice(from, to).reduce((prev, curr) => prev + curr))
}


function matrixYSum (data) {
  let l_sum_y = Array(data[0].length).fill(0)
  data.forEach(row => row.forEach((v, i) => {
    l_sum_y[i] += v
  }))
  return l_sum_y
}


function* splitWave (wave) {
  let start
  let end
  for (let i = 0; i < wave.length; i++) {
    let v = wave[i]
    if (v && !start) {
      start = i
    }
    if (!v && start) {
      end = i
      yield [start, end]
      start = undefined
    }
  }
  if (start) {
    yield [start, wave.length]
  }
}
