var API_URL = '/api';
var transactions = [];

var form = document.getElementById('transactionForm');
var categoryInput = document.getElementById('category');
var descInput = document.getElementById('description');
var amountInput = document.getElementById('amount');
var typeInput = document.getElementById('type');
var transactionList = document.getElementById('transactionList');
var totalBalanceEl = document.getElementById('totalBalance');
var totalIncomeEl = document.getElementById('totalIncome');
var totalExpenseEl = document.getElementById('totalExpense');
var resetBtn = document.getElementById('resetBtn');

function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function fetchTransactions() {
  fetch(API_URL + '/transactions')
    .then(function(response) {
      if (!response.ok) throw new Error('Gagal fetch data');
      return response.json();
    })
    .then(function(data) {
      transactions = data;
      updateUI();
    })
    .catch(function(error) {
      console.error('Error:', error);
      transactionList.innerHTML = '<div class="empty-state"><p style="color:#e74c3c;">Gagal koneksi ke server!</p></div>';
    });
}

function addTransactionToDB(transaction) {
  return fetch(API_URL + '/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  })
  .then(function(response) {
    if (!response.ok) {
      return response.json().then(function(data) {
        throw new Error(data.error || 'Gagal menambah transaksi');
      });
    }
    return response.json();
  })
  .then(function(newTransaction) {
    transactions.push(newTransaction);
    updateUI();
    return true;
  })
  .catch(function(error) {
    alert('Error: ' + error.message);
    return false;
  });
}

function deleteTransactionFromDB(id) {
  return fetch(API_URL + '/transactions/' + id, {
    method: 'DELETE'
  })
  .then(function(response) {
    if (!response.ok) {
      return response.json().then(function(data) {
        throw new Error(data.error || 'Gagal menghapus transaksi');
      });
    }
    return response.json();
  })
  .then(function() {
    transactions = transactions.filter(function(t) { return t.id !== id; });
    updateUI();
    return true;
  })
  .catch(function(error) {
    alert('Error: ' + error.message);
    return false;
  });
}

function resetAllTransactions() {
  if (transactions.length === 0) {
    alert('Belum ada transaksi untuk di-reset.');
    return;
  }
  if (!confirm('Yakin ingin menghapus SEMUA transaksi?')) return;
  fetch(API_URL + '/transactions', {
    method: 'DELETE'
  })
  .then(function(response) {
    if (!response.ok) {
      return response.json().then(function(data) {
        throw new Error(data.error || 'Gagal reset transaksi');
      });
    }
    return response.json();
  })
  .then(function() {
    transactions = [];
    updateUI();
    alert('Semua transaksi berhasil direset!');
  })
  .catch(function(error) {
    alert('Error: ' + error.message);
  });
}

function updateUI() {
  var totalIncome = 0;
  var totalExpense = 0;
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'income') {
      totalIncome += transactions[i].amount;
    } else {
      totalExpense += transactions[i].amount;
    }
  }
  var balance = totalIncome - totalExpense;
  totalBalanceEl.textContent = formatRupiah(balance);
  totalIncomeEl.textContent = formatRupiah(totalIncome);
  totalExpenseEl.textContent = formatRupiah(totalExpense);
  renderTransactionList();
}

function renderTransactionList() {
  if (transactions.length === 0) {
    transactionList.innerHTML = '<div class="empty-state"><p>Belum ada transaksi. Tambahkan sekarang!</p></div>';
    return;
  }
  var html = '';
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    var amountClass = t.type === 'income' ? 'income' : 'expense';
    var sign = t.type === 'income' ? '+' : '-';
    html += '<div class="transaction-item">';
    html += '<div class="transaction-info">';
    html += '<span class="transaction-category">' + t.category + '</span>';
    html += '<span class="transaction-desc">' + t.description + '</span>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:12px;">';
    html += '<span class="transaction-amount ' + amountClass + '">' + sign + ' ' + formatRupiah(t.amount) + '</span>';
    html += '<button class="transaction-delete" data-id="' + t.id + '">';
    html += '<i class="fas fa-times"></i>';
    html += '</button>';
    html += '</div>';
    html += '</div>';
  }
  transactionList.innerHTML = html;
  var deleteButtons = document.querySelectorAll('.transaction-delete');
  for (var j = 0; j < deleteButtons.length; j++) {
    deleteButtons[j].addEventListener('click', function(e) {
      var id = parseInt(this.getAttribute('data-id'));
      deleteTransactionFromDB(id);
    });
  }
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  var category = categoryInput.value;
  var description = descInput.value.trim();
  var amount = parseFloat(amountInput.value);
  var type = typeInput.value;
  if (!description) {
    alert('Deskripsi tidak boleh kosong!');
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert('Jumlah harus angka positif!');
    return;
  }
  var transaction = { category: category, description: description, amount: amount, type: type };
  addTransactionToDB(transaction).then(function(success) {
    if (success) {
      form.reset();
      categoryInput.value = 'Makanan';
      typeInput.value = 'income';
      descInput.focus();
    }
  });
});

resetBtn.addEventListener('click', resetAllTransactions);
fetchTransactions();
