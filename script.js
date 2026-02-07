document.addEventListener('DOMContentLoaded', function() {
    console.log("Multi-Currency Expense Tracker loaded!");
    
    // Get all DOM elements
    const expensesForm = document.getElementById('expenses-form');
    const titleInput = document.getElementById('title');
    const amountInput = document.getElementById('amount');
    const currencySelect = document.getElementById('currency');
    const categorySelect = document.getElementById('category');
    const expensesList = document.getElementById('expenses-list');
    const mainTotalElement = document.getElementById('main-total');
    const currencyTotalsDisplay = document.getElementById('currency-totals-display');
    const conversionNote = document.getElementById('conversion-note');
    const clearAllBtn = document.getElementById('clear-all');
    const exportBtn = document.getElementById('export-btn');
    
    // Array to store expenses
    let expenses = [];
    
    // Currency symbols and names
    const currencyData = {
        'NGN': { symbol: '₦', name: 'Naira', flag: '🇳🇬', rateToUSD: 0.00067 },
        'USD': { symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateToUSD: 1 },
        'EUR': { symbol: '€', name: 'Euro', flag: '🇪🇺', rateToUSD: 1.07 },
        'GBP': { symbol: '£', name: 'British Pound', flag: '🇬🇧', rateToUSD: 1.25 },
        'GHS': { symbol: '₵', name: 'Ghana Cedis', flag: '🇬🇭', rateToUSD: 0.083 },
        'KES': { symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', rateToUSD: 0.0069 }
    };
    
    // Default currency (Naira)
    const defaultCurrency = 'NGN';
    
    // Format currency with proper symbol and commas
    function formatCurrency(amount, currencyCode) {
        const currency = currencyData[currencyCode] || currencyData[defaultCurrency];
        const symbol = currency.symbol;
        
        // Format with commas for thousands
        const formattedAmount = parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        
        return `${symbol}${formattedAmount}`;
    }
    
    // Get category emoji
    function getCategoryEmoji(category) {
        const emojis = {
            'Food': '🍔',
            'Data': '📱',
            'Transportation': '🚌',
            'Rent': '🏠',
            'Books': '📚',
            'Entertainment': '🎬',
            'Other': '📦'
        };
        return emojis[category] || '📝';
    }
    
    // Calculate totals by currency
    function calculateCurrencyTotals() {
        const totals = {};
        
        expenses.forEach(expense => {
            if (!totals[expense.currency]) {
                totals[expense.currency] = 0;
            }
            totals[expense.currency] += expense.amount;
        });
        
        return totals;
    }
    
    // Calculate main total in default currency (Naira)
    function calculateMainTotal() {
        const totals = calculateCurrencyTotals();
        let mainTotal = 0;
        
        // Convert all currencies to default currency (NGN)
        for (const [currency, amount] of Object.entries(totals)) {
            if (currency === defaultCurrency) {
                mainTotal += amount;
            } else {
                // Convert to Naira (using approximate rates)
                const rateToDefault = currencyData[currency].rateToUSD / currencyData[defaultCurrency].rateToUSD;
                mainTotal += amount * rateToDefault;
            }
        }
        
        return mainTotal;
    }
    
    // Update currency totals display
    function updateCurrencyTotals() {
        const totals = calculateCurrencyTotals();
        currencyTotalsDisplay.innerHTML = '';
        
        for (const [currency, amount] of Object.entries(totals)) {
            const currencyInfo = currencyData[currency];
            const totalItem = document.createElement('div');
            totalItem.className = 'currency-total-item';
            totalItem.innerHTML = `
                ${currencyInfo.flag} ${currencyInfo.name}<br>
                <strong>${formatCurrency(amount, currency)}</strong>
            `;
            currencyTotalsDisplay.appendChild(totalItem);
        }
        
        // Update conversion note
        if (Object.keys(totals).length > 1) {
            conversionNote.textContent = `Totals shown in original currencies. Main total converted to ${currencyData[defaultCurrency].name}.`;
        } else {
            conversionNote.textContent = '';
        }
    }
    
    // Update main total display
    function updateMainTotal() {
        const mainTotal = calculateMainTotal();
        mainTotalElement.textContent = formatCurrency(mainTotal, defaultCurrency);
    }
    
    // Delete an expense by id
    function deleteExpense(id) {
        expenses = expenses.filter(expense => expense.id !== id);
        renderExpenses();
        updateCurrencyTotals();
        updateMainTotal();
        saveToLocalStorage();
    }
    
    // Render all expenses to the list
    function renderExpenses() {
        expensesList.innerHTML = '';
        
        if (expenses.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #666;">No expenses yet. Add your first expense above!</div>';
            expensesList.appendChild(emptyMessage);
            return;
        }
        
        expenses.forEach(expense => {
            const listItem = document.createElement('li');
            
            const currencyInfo = currencyData[expense.currency] || currencyData[defaultCurrency];
            const categoryEmoji = getCategoryEmoji(expense.category);
            
            listItem.innerHTML = `
                <div class="expense-title">${expense.title}</div>
                <div class="expense-amount">
                    <strong>${formatCurrency(expense.amount, expense.currency)}</strong>
                    <small>${currencyInfo.flag}</small>
                </div>
                <div class="expense-category">${categoryEmoji} ${expense.category}</div>
                <div class="expense-date">${expense.date}</div>
                <div class="expense-actions">
                    <button class="delete-btn" data-id="${expense.id}">🗑️</button>
                </div>
            `;
            
            expensesList.appendChild(listItem);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteExpense(id);
            });
        });
    }
    
    // Save to local storage
    function saveToLocalStorage() {
        localStorage.setItem('studentExpenses', JSON.stringify(expenses));
        localStorage.setItem('preferredCurrency', currencySelect.value);
    }
    
    // Load from local storage
    function loadFromLocalStorage() {
        const savedExpenses = localStorage.getItem('studentExpenses');
        const savedCurrency = localStorage.getItem('preferredCurrency');
        
        if (savedExpenses) {
            expenses = JSON.parse(savedExpenses);
            renderExpenses();
            updateCurrencyTotals();
            updateMainTotal();
        }
        
        if (savedCurrency) {
            currencySelect.value = savedCurrency;
        }
    }
    
    // Handle form submission
    expensesForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const title = titleInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const currency = currencySelect.value;
        const category = categorySelect.value;
        
        // Validation
        if (!title) {
            alert('Please enter an expense title');
            titleInput.focus();
            return;
        }
        
        if (!amount || amount <= 0 || isNaN(amount)) {
            alert('Please enter a valid amount (greater than 0)');
            amountInput.focus();
            return;
        }
        
        if (!category) {
            alert('Please select a category');
            categorySelect.focus();
            return;
        }
        
        // Create new expense object
        const newExpense = {
            id: Date.now(),
            title: title,
            amount: amount,
            currency: currency,
            category: category,
            date: new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            })
        };
        
        // Add to expenses array
        expenses.push(newExpense);
        
        // Update UI
        renderExpenses();
        updateCurrencyTotals();
        updateMainTotal();
        saveToLocalStorage();
        
        // Reset form
        expensesForm.reset();
        currencySelect.value = defaultCurrency;
        titleInput.focus();
        
        // Show success message
        showNotification(`Expense added: ${formatCurrency(amount, currency)} for ${title}`);
    });
    
    // Clear all expenses
    clearAllBtn.addEventListener('click', function() {
        if (expenses.length === 0) {
            showNotification('No expenses to clear!');
            return;
        }
        
        if (confirm('Are you sure you want to clear ALL expenses? This cannot be undone.')) {
            expenses = [];
            renderExpenses();
            updateCurrencyTotals();
            updateMainTotal();
            saveToLocalStorage();
            showNotification('All expenses cleared!');
        }
    });
    
    // Export to CSV
    exportBtn.addEventListener('click', function() {
        if (expenses.length === 0) {
            showNotification('No expenses to export!');
            return;
        }
        
        // Create CSV content
        let csv = 'Title,Amount,Currency,Category,Date\n';
        
        expenses.forEach(expense => {
            csv += `"${expense.title}",${expense.amount},${expense.currency},${expense.category},"${expense.date}"\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showNotification('Expenses exported as CSV file!');
    });
    
    // Show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Add CSS animations for notification
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Escape key to reset form
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            expensesForm.reset();
            currencySelect.value = defaultCurrency;
            titleInput.focus();
        }
    });
    
    // Initialize the app
    function initApp() {
        loadFromLocalStorage();
        titleInput.focus();
        
        // Set default currency to Naira
        currencySelect.value = defaultCurrency;
    }
    
    // Start the app
    initApp();
    
    // Add sample data button (for testing - optional)
    const addSampleBtn = document.createElement('button');
    addSampleBtn.textContent = '📊 Add Sample Data (Testing)';
    addSampleBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #9b59b6;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        z-index: 100;
    `;
    document.body.appendChild(addSampleBtn);
    
    addSampleBtn.addEventListener('click', function() {
        const sampleExpenses = [
            { id: 1, title: "Jollof Rice & Chicken", amount: 1500, currency: "NGN", category: "Food", date: "Today" },
            { id: 2, title: "MTN Data Plan", amount: 5000, currency: "NGN", category: "Data", date: "Today" },
            { id: 3, title: "Uber to Campus", amount: 2500, currency: "NGN", category: "Transportation", date: "Yesterday" },
            { id: 4, title: "Textbooks", amount: 75, currency: "USD", category: "Books", date: "2 days ago" },
            { id: 5, title: "Netflix Subscription", amount: 3600, currency: "KES", category: "Entertainment", date: "This week" }
        ];
        
        expenses = [...sampleExpenses];
        renderExpenses();
        updateCurrencyTotals();
        updateMainTotal();
        saveToLocalStorage();
        showNotification('Sample data loaded!');
    });
});