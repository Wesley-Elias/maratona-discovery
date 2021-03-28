// ==> ==> ==> ==> Abrir e fechar o Modal <== <== <== <==

const Modal = {
  open() {
    // Abrir modal
    // Adicionar a classe active ao modal
    document.querySelector('.modal-overlay').classList.add('active')

  },
  close() {
    // Fechar Modal
    // Remover a classe active do Modal
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}

// ==> ==> ==> ==> Tratamento das transações <== <== <== <==

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const Transactions = {
  all: Storage.get(),

  add(transaction) {
    Transactions.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transactions.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0;

    // Pegar todas as transações
    // Para cada transação Verificar se a transação é > 0
    Transactions.all.forEach((transaction) => {
      if( transaction.amount > 0) {
        // Se for maior, Somar a uma variável e retornar a variável
        income += transaction.amount
      }
    })

    return income
  },
  expenses() {
    let expense = 0;

    // Pegar todas as transações
    // Para cada transação Verificar se a transação é < 0
    Transactions.all.forEach((transaction) => {
      if( transaction.amount < 0) {
        // Se for maior, Somar a uma variável e retornar a variável
        expense += transaction.amount
      }
    })

    return expense
  },
  total() {
    // Somas das entradas - a saída
    return Transactions.incomes() + Transactions.expenses()
  },
}

// Pegar as transações do meu objeto no JavaScript e colocar (substituir) no HTML

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index // Guarda a posição do array
    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSClass = transaction.amount > 0 ? "income" : "expense" // Verifica se o valor é uma despesa ou entrada
    
    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class=${CSSClass}>${amount}</td>
      <td class="date">${transaction.date}</td>
      <td><img src="./assets/minus.svg" alt="Remover transação" onclick="Transactions.remove(${index})"></td>
    `
    return html;
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transactions.incomes())
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transactions.expenses())
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transactions.total())
  },

  clearTransactions () {
    DOM.transactionsContainer.innerHTML = ""
  },

}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    
    value = String(value).replace(/\D/g, "")
    value = Number(value) / 100

    value = value.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
    })
    
    return signal + value
  },

  formatAmount(value) {
    value = value * 100
    
    return Math.round(value)
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
}

const Form = {
  description: document.querySelector('input#description'),

  amount: document.querySelector('input#amount'),

  date: document.querySelector('input#date'),

  getValues() { 
    return {
      description: Form.description.value,
      amount: Form.amount.value, 
      date: Form.date.value,
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if(description.trim() === "" || amount.trim() === "" || date.trim() === "" ) { // Trim faz uma limpeza dos espaços vazios da string
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  formatValues() {  
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)
    
    return {
      description, // Mesma coisa que description: description,
      amount,
      date,
    }
  },

  saveTransaction(transaction) {
    Transactions.add(transaction)
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      // Verificar se todas as informações foram preenchidas
      Form.validateFields()

      // Formatar os dados para salvar
      const transaction = Form.formatValues()

      // Salvar
      Form.saveTransaction(transaction)
      
      // Apagar os dados do formulário, para quando iniciar outra transação, o formulário esteja apagado
      Form.clearFields()
      
      // Fechar o Modal
      Modal.close()

      // Atualizar a aplicação
      // Quando Salvamos uma transação com o saveTransaction, já damos um upload no App
      // App.reload()
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init () {
    Transactions.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })
    
    DOM.updateBalance()

    Storage.set(Transactions.all)
  },

  reload () {
    DOM.clearTransactions()
    App.init()
  },
}

App.init()