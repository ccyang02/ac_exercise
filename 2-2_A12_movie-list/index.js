const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
let modeFlag = 'card' // default
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeSelectors = document.querySelector('#mode-seletors')


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1), modeFlag)
  })
  .catch((err) => console.log(err))


// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  currentPage = Number(event.target.dataset.page)
  console.log(currentPage)
  renderMovieList(getMoviesByPage(currentPage), modeFlag)
})

function renderMovieList(data, mode) {

  // console.log(data)
  let rawHTML = ''

  if (mode === 'card') {
    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${
        POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `
    })
  } else {
    rawHTML = `<div class="col-12"><ul class="list-group">`
    data.forEach((item) => {
      rawHTML += `
        <li class="list-group-item container">
          <div class="row">
            <div class="col-8">
              <p>${item.title}</p>
            </div>
            <div class="btns-in-lists col-4">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </li>
      `
    })
    rawHTML += `</ul></div>`
  }
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMoviesByPage(page) {
  // movies ? "movies" : "filteredMovies"
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


searchForm.addEventListener('click', function onSearchFormSubmitted(event) {
  event.preventDefault() // 讓使用者點擊 form 時不要刷新頁面 (終止瀏覽器的預設行為)

  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('請輸入有效字串!')
  // }

  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  // 搜尋後重新輸出畫面

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1), 'card') // let card mode to be the default when user do searching
})

modeSelectors.addEventListener('click', function onSelectMovieModes(event) {
  if (event.target.matches('#mode-card')) {
    modeFlag = 'card'

  } else if (event.target.matches('#mode-list')) {
    modeFlag = 'list'
  }
  renderMovieList(getMoviesByPage(currentPage), modeFlag)
  renderPaginator(movies.length)
})


// 1. 切換的時候是當前頁面的切換!
// 2. 直接假定 search 後必定會先出現 card mode
