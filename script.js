   document.addEventListener('DOMContentLoaded', function() {
    console.log("Expense Tracker loaded!");
    
    // Get all DOM elements
    const expensesForm = document.getElementById('expenses-form');
    const titleInput = document.getElementById('title');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    const expensesList = document.getElementById('expenses-list');
    const totalAmountElement = document.getElementById('total-amount');
    
    // Array to store expenses
    let expenses = [];
    
    // Format currency to 2 decimal places
    function formatCurrency(amount) {
        return '$' + parseFloat(amount).toFixed(2);
    }
    
    // Calculate total of all expenses
    function calculateTotal() {
        const total = expenses.reduce((sum, expense) => {
            return sum + expense.amount;
        }, 0);
        
        totalAmountElement.textContent = formatCurrency(total);
    }
    
    // Get CSS class based on category
    function getCategoryClass(category) {
        const categoryMap = {
            'Food': 'expense-food',
            'Rent': 'expense-rent',
            'Transportation': 'expense-transportation',
            'Data': 'expense-data',
            'Other': 'expense-other'
        };
        return categoryMap[category] || 'expense-other';
    }
    
    // Delete an expense by id
    function deleteExpense(id) {
        expenses = expenses.filter(expense => expense.id !== id);
        renderExpenses();
        calculateTotal();
        saveToLocalStorage();
    }
    
    // Display all expenses in the list
    function renderExpenses() {
        expensesList.innerHTML = '';
        
        expenses.forEach(expense => {
            const listItem = document.createElement('li');
            listItem.className = getCategoryClass(expense.category);
            
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'expense-details';
            
            // Create title element
            const titleSpan = document.createElement('span');
            titleSpan.className = 'title';
            titleSpan.textContent = expense.title;
            
            // Create amount element
            const amountSpan = document.createElement('span');
            amountSpan.className = 'amount';
            amountSpan.textContent = formatCurrency(expense.amount);
            
            // Create category element
            const categorySpan = document.createElement('span');
            categorySpan.className = 'category';
            categorySpan.textContent = expense.category;
            
            // Add elements to details div
            detailsDiv.appendChild(titleSpan);
            detailsDiv.appendChild(amountSpan);
            detailsDiv.appendChild(categorySpan);
            
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => deleteExpense(expense.id);
            
            // Add everything to list item
            listItem.appendChild(detailsDiv);
            listItem.appendChild(deleteBtn);
            
            // Add list item to the list
            expensesList.appendChild(listItem);
        });
    }
    
    // Save expenses to local storage
    function saveToLocalStorage() {
        localStorage.setItem('studentExpenses', JSON.stringify(expenses));
    }
    
    // Load expenses from local storage
    function loadFromLocalStorage() {
        const savedExpenses = localStorage.getItem('studentExpenses');
        if (savedExpenses) {
            expenses = JSON.parse(savedExpenses);
            renderExpenses();
            calculateTotal();
        }
    }
    
    // Handle form submission
    expensesForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const title = titleInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;
        
        // Validate inputs
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
            id: Date.now(), // Unique ID based on timestamp
            title: title,
            amount: amount,
            category: category,
            date: new Date().toLocaleDateString()
        };
        
        // Add to expenses array
        expenses.push(newExpense);
        
        // Update UI
        renderExpenses();
        calculateTotal();
        saveToLocalStorage();
        
        // Reset form
        expensesForm.reset();
        titleInput.focus();
    });
    
    // Initialize the app
    function initApp() {
        loadFromLocalStorage();
        titleInput.focus();
    }
    
    // Add sample data for testing (optional)
    function addSampleData() {
        const sampleExpenses = [
            { id: 1, title: "Lunch at cafeteria", amount: 12.50, category: "Food", date: "Today" },
            { id: 2, title: "Mobile data plan", amount: 25.00, category: "Data", date: "Today" },
            { id: 3, title: "Bus ticket", amount: 3.75, category: "Transportation", date: "Yesterday" },
        ];
        
        expenses = [...sampleExpenses];
        renderExpenses();
        calculateTotal();
        saveToLocalStorage();
    }
    
    // Escape key to reset form
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            expensesForm.reset();
            titleInput.focus();
        }
    });
    
    // Start the app
    initApp();
});