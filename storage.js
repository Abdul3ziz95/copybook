// حفظ المعاملة في LocalStorage
function saveTransactionToStorage(transaction) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// استرجاع المعاملات من LocalStorage
function getTransactionsFromStorage() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}