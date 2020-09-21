// document.querySelector('body').style.backgroundColor = '#000000'

const el = document.querySelector('.wrapper');

function change(value) {
  console.log('>' + value)
  event.target.parentElement.nextElementSibling.textContent = value

  const num_colors = [
    document.querySelector('.red-number').textContent,
    document.querySelector('.green-number').textContent,
    document.querySelector('.blue-number').textContent
  ];

  let bg_hex = '#'
  for (const color of num_colors) {
    let rgb2hex = function (rgb) {
      let hex = Number(rgb).toString(16)
      if (hex.length < 2) {
        hex = '0' + hex
      }
      return hex
    }
    bg_hex = bg_hex + rgb2hex(color)
  }

  document.querySelector('span').textContent = bg_hex
  document.querySelector('body').style.backgroundColor = `${bg_hex}`
};

//Q1: 遇到一個問題，在進行背景的塗色時，一開始在css background 宣告顏色的時候，沒有辦法被覆蓋，
//    必須強制使用 !important，但使用這個方式會造成後面用js時無法更新顏色
//    所以就變成了載入js的時候將color塗上，請問這樣是正常的做法嗎？或者有沒有更優解呢？

////// My First Version, but the slider cannot change immediately. //////
// el.addEventListener('change', (event) => {
//   // console.log(event.target.value)

//   let target = event.target.parentElement

//   const num_red = document.querySelector('.red-number')
//   const num_green = document.querySelector('.green-number')
//   const num_blue = document.querySelector('.blue-number')

//   if (target.classList.contains('red-slider')) {
//     num_red.textContent = event.target.value
//   } else if (target.classList.contains('green-slider')) {
//     num_green.textContent = event.target.value
//   } else {
//     num_blue.textContent = event.target.value
//   }

//   // change color function
//   let rgb2hex = function (rgb) {
//     let hex = Number(rgb).toString(16)
//     if (hex.length < 2) {
//       hex = '0' + hex
//     }
//     return hex
//   }

//   const selectors = [num_red, num_green, num_blue];
//   let bg_hex = '#'
//   for (const selector of selectors) {
//     bg_hex = bg_hex + rgb2hex(selector.textContent)
//   }

//   document.querySelector('span').textContent = bg_hex
//   document.querySelector('body').style.backgroundColor = `${bg_hex}`
// });
