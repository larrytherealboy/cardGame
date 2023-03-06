const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  // 當物件的屬性與函式/變數名稱相同時，可以省略不寫
  getCardContent(index) {
    const number = this.transforNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `<p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>`
  },

  getCardElement(index) {
    return `<div data-index='${index}' class="card back"></div>`
  },

  transforNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  // flipCards(1, 2, 3, 4, 5)
  // cards = [1,2,3,4,5]
  // ...：傳入一陣列參數
  flipCards(...cards) {
    cards.map(card => {
      // 回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }

      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards")
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriede(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAmination(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model = {
  revealedCards: [],
  isRevealedCardMatched() {
    return (this.revealedCards[0].dataset.index % 13) === (this.revealedCards[1].dataset.index % 13)
  },
  score: 0,
  triedTimes: 0,
}


// 程式中所有動作應該由 controller 統一發派
// 不要讓 controller 以外的內部函式暴露在 global 的區域
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        console.log(this)
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriede(model.triedTimes += 1)
        view.flipCards(card)
        model.revealedCards.push(card)

        // 判斷是否配對成功
        if (model.isRevealedCardMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAmination(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
          // setTimeout後，this 的對象變成了 setTimeout
        }
        break
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    // this(setTimeout) 改成 controller
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}


const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }

    return number
  }
}

// 取代 view.displayCards()
controller.generateCards()

// Render

// Listener

// Node List (array-like)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})