const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
// const SHOW_URL = BASE_URL + '/api/v1/users/:id'
const USERS_PER_PAGE = 18
const users = []
let filteredUsers = []

const filteredGroups = {
  gender: ['male', 'female'],
  yearRange: ['range1', 'range2', 'range3', 'range4'],
}

const userPanel = document.querySelector('#user-panel')
const filterPanel = document.querySelector('#filter-panel')
const modalPanel = document.querySelector('#modal-panel')
const searchInput = document.querySelector('#search-input')
const searchButton = document.querySelector('#search-button')
const paginator = document.querySelector('#paginator')
const prompt = document.querySelector('#warning-prompt')
const dropReg = document.querySelector('#dropdown-region')


axios.get(INDEX_URL)
  .then((res) => {
    users.push(...res.data.results)
    view.renderPaginator(users.length)
    view.renderUserPanel(view.getUsersByPage(1))

    const regions = users.map(user => user.region)
    const sortedRegions = [...new Set(regions)].sort()
    view.renderRegions(sortedRegions)

    filteredGroups.region = sortedRegions
  })
  .catch((err) => console.log(err))


const view = {
  getUserPanelContent(user) {
    const maleIcon = '<i class="fas fa-mars fa-md" style="color: blue" aria-hidden="true"></i>'
    const femaleIcon = '<i class="fas fa-venus fa-md" style="color: red" aria-hidden="true"></i>'
    const genderIcon = (user.gender === 'male') ? maleIcon : femaleIcon

    return `
      <div class="col-6 col-sm-4 col-md-3 col-lg-2">
        <div class="card">
          <img src="${user.avatar}" class="card-img-top" data-id="${user.id}" data-toggle="modal" data-target="#userModal" alt="...">
          <div class="card-body">
            <a href="#" class="card-link" data-id="${user.id}" data-toggle="modal" data-target="#userModal">${user.name + ' ' + user.surname}</a>
          </div>
          <div class="card-footer">
            ${genderIcon}
            <span class="card-text"><small class="text-muted">${user.age}-year-old</small></span>
          </div>
        </div>
      </div>
    `
  },

  getPaginatorContent(page) {
    return `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  },

  getRegionContent(region) {
    return `<a class="dropdown-item" href="#" data-dropdown="${region}">${region}</a>`
  },

  getUsersByPage(page) {
    // users ? "users" : "filteredUsers"
    const data = filteredUsers.length ? filteredUsers : users
    const startIndex = (page - 1) * USERS_PER_PAGE
    return data.slice(startIndex, startIndex + USERS_PER_PAGE)
  },

  renderUserPanel(users) {
    let userPanelContent = ''
    const noMatchedPrompt = `
      <p class="no-matched-prompt font-weight-bold">Sorry, \
      we did not find user lists according to your condition. :( </p>
    `

    if (users.length != 0) {
      users.forEach(user => {
        userPanelContent += this.getUserPanelContent(user)
      })
      userPanel.innerHTML = userPanelContent
    } else {
      userPanel.innerHTML = noMatchedPrompt
    }
  },

  renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
    let rawHTML = ''

    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += this.getPaginatorContent(page)
    }
    paginator.innerHTML = rawHTML
    paginator.querySelector('li').classList.add('active') // get the first li tag
  },

  renderRegions(regions) {
    let dropdownRegions = ``
    regions.forEach(region => {
      dropdownRegions += this.getRegionContent(region)
    })
    dropReg.innerHTML = dropdownRegions
  }
}

function getGroup(element) {
  for (let group of Object.keys(filteredGroups)) {
    if (filteredGroups[group].includes(element)) {
      return group
    }
  }
  return 'invalidType'
}

function onFilteringEvent() {
  filteredUsers = users.slice() // clone an array
  const filterTokens = searchInput.value.trim().split(' ')
  let invalidTokens = ""

  filterTokens.forEach((token) => {
    // console.log('>> tokens: ' + token)
    if (!token.includes('#')) {
      // name or surname
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(token.toLowerCase()) ||
        user.surname.toLowerCase().includes(token.toLowerCase()))
    } else {
      // the rest of groups: gender, year range & regions
      const group = getGroup(token.slice(1))

      if (group === 'gender') {
        filteredUsers = filteredUsers.filter((user) =>
          user.gender === token.slice(1))

      } else if (group === 'yearRange') {
        // console.log(token.substring('e'))
        const i = Number(token.slice(-1)) - 1
        const yearsBound = [[0, 30], [31, 40], [41, 50], [51, 99]]
        filteredUsers = filteredUsers.filter((user) =>
          Number(user.age) >= yearsBound[i][0] && Number(user.age) <= yearsBound[i][1])
      } else if (group === 'region') {
        filteredUsers = filteredUsers.filter((user) =>
          user.region.toLowerCase() === token.slice(1).toLowerCase())
      } else {
        invalidTokens += `${token} `
        // console.log('There exists wrong tag content!')
      }
    }
  })

  if (filteredUsers.length === 0) {
    view.renderUserPanel([])
  } else {
    view.renderUserPanel(view.getUsersByPage(1))
  }
  view.renderPaginator(filteredUsers.length)

  if (invalidTokens !== '') {
    prompt.innerHTML = `
        <div class="alert alert-danger mt-2" id="success-alert">
          <button type="button" class="close" data-dismiss="alert">x</button>
          <strong>Warning! </strong> There exists invalid tag content: ${invalidTokens}
        </div>
    `
  }
}

function onPanelClicked(event) {
  if (event.target.matches('.dropdown-item')) {
    event.preventDefault()

    if (searchInput.value) {
      searchInput.value += ` #${event.target.dataset.dropdown}`
    } else {
      searchInput.value += `#${event.target.dataset.dropdown}`
    }
  }
}

function onModalUpdated(event) {
  console.log()
  const id = event.target.dataset.id
  axios.get(INDEX_URL + id)
    .then((res) => {
      modalPanel.querySelector('.left-body-content').innerHTML = `<img src="${res.data.avatar}">`
      modalPanel.querySelector('#modalName').innerText = res.data.name + ' ' + res.data.surname
      modalPanel.querySelector('#modalMail').innerText = res.data.email
      modalPanel.querySelector('#modalAge').innerText = res.data.age
      modalPanel.querySelector('#modalGender').innerText = res.data.gender
      modalPanel.querySelector('#modalRegion').innerText = res.data.region
      modalPanel.querySelector('#modalBirth').innerText = res.data.birthday
    }).catch((err) => console.log(err))
}

function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  view.renderUserPanel(view.getUsersByPage(page))

  for (let i = 1; i <= paginator.childNodes.length; i++) {
    paginator.children[i - 1].className = 'page-item'
  }
  event.target.parentElement.className = 'page-item active'
}

function onSearchInputPressEvent(event) {
  if (event.code === 'Enter') {
    event.preventDefault()
    onFilteringEvent(event)
  }
}

function onSearchInputUpEvent(event) {
  if (event.code === 'Backspace' && searchInput.value.length === 0) {
    filteredUsers = []
    view.renderUserPanel(view.getUsersByPage(1))
    view.renderPaginator(users.length)
  }
}

// modal 的更新
userPanel.addEventListener('click', e => onModalUpdated(e))

// 搜尋的相關動作
searchButton.addEventListener('click', e => onFilteringEvent(e))
searchInput.addEventListener('keypress', e => onSearchInputPressEvent(e))
searchInput.addEventListener('keyup', e => onSearchInputUpEvent(e))

// 點選不同頁數的動作
paginator.addEventListener('click', e => onPaginatorClicked(e))

// 點選 filter dropdown 的動作
filterPanel.addEventListener('click', e => onPanelClicked(e))

// const STATE = {
//   AllFriendsInit: "AllFriendsInit",
//   FilteredFriends: "FilteredFriends",
//   FilteredFriendsAgain: "FilteredFriendsAgain",
// }

// const controller = {
//   currentState = STATE.AllFriendsInit,

//   dispatchUserAction(actionState) {
//     switch(actionState) {
//       case STATE.AllFriendsInit:

//     }
//   },

// }