document.addEventListener('DOMContentLoaded', function() {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];

    // Add event listeners
    document.getElementById('addItem').addEventListener('click', addItem);
    document.addEventListener('input', calculateTotals);
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            removeItem(e.target);
        }
    });

    // Initial calculation
    calculateTotals();
});

function addItem() {
    const tbody = document.getElementById('itemsBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = 
        <td><input type="text" class="item-desc" placeholder="Service description"></td>
        <td><input type="number" class="item-qty" value="1" min="1"></td>
        <td><input type="number" class="item-rate" placeholder="0.00" step="0.01"></td>
        <td class="item-amount">.00</td>
        <td><button type="button" class="remove-item">Remove</button></td>
    ;
    tbody.appendChild(newRow);
}

function removeItem(button) {
    const row = button.closest('tr');
    row.remove();
    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    
    // Calculate line item totals
    const rows = document.querySelectorAll('#itemsBody tr');
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amount = qty * rate;
        
        row.querySelector('.item-amount').textContent = '$' + amount.toFixed(2);
        subtotal += amount;
    });

    // Update subtotal
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);

    // Calculate tax
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    document.getElementById('taxAmount').textContent = '$' + taxAmount.toFixed(2);

    // Calculate total
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const total = subtotal + taxAmount - discount;
    document.getElementById('total').textContent = '$' + total.toFixed(2);
}

// Save invoice functionality
document.getElementById('saveInvoice').addEventListener('click', function() {
    const invoiceData = {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        date: document.getElementById('invoiceDate').value,
        dueDate: document.getElementById('dueDate').value,
        customer: {
            name: document.getElementById('customerName').value,
            address: document.getElementById('customerAddress').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value
        },
        items: [],
        totals: {
            subtotal: document.getElementById('subtotal').textContent,
            tax: document.getElementById('taxAmount').textContent,
            discount: document.getElementById('discount').value,
            total: document.getElementById('total').textContent
        }
    };

    // Collect line items
    const rows = document.querySelectorAll('#itemsBody tr');
    rows.forEach(row => {
        const desc = row.querySelector('.item-desc').value;
        const qty = row.querySelector('.item-qty').value;
        const rate = row.querySelector('.item-rate').value;
        
        if (desc && qty && rate) {
            invoiceData.items.push({
                description: desc,
                quantity: qty,
                rate: rate,
                amount: row.querySelector('.item-amount').textContent
            });
        }
    });

    // Save to localStorage for now (later integrate with Supabase)
    localStorage.setItem('currentInvoice', JSON.stringify(invoiceData));
    alert('Invoice saved successfully!');
});

// Print functionality
document.getElementById('printInvoice').addEventListener('click', function() {
    window.print();
});

// Email functionality (placeholder)
document.getElementById('emailInvoice').addEventListener('click', function() {
    alert('Email functionality will be added in the next version!');
});
