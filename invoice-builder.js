document.addEventListener('DOMContentLoaded', function() {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];

    // Add event listeners
    document.getElementById('addItem').addEventListener('click', addItem);
    document.getElementById('addChecklistItem').addEventListener('click', addChecklistItem);
    document.getElementById('exportData').addEventListener('click', exportToJSON);
    
    document.addEventListener('input', calculateTotals);
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            removeItem(e.target);
        }
        if (e.target.classList.contains('remove-checklist')) {
            removeChecklistItem(e.target);
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

function addChecklistItem() {
    const checklist = document.getElementById('checklist');
    const newItem = document.createElement('div');
    newItem.className = 'checklist-item';
    newItem.innerHTML = 
        <input type="text" class="checklist-input" placeholder="Checklist item">
        <input type="checkbox" class="checklist-completed">
        <label>Completed</label>
        <button type="button" class="remove-checklist">Remove</button>
    ;
    checklist.appendChild(newItem);
}

function removeChecklistItem(button) {
    const item = button.closest('.checklist-item');
    item.remove();
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

// Enhanced save functionality with new fields
document.getElementById('saveInvoice').addEventListener('click', function() {
    const invoiceData = {
        // Basic invoice info
        invoiceNumber: document.getElementById('invoiceNumber').value,
        date: document.getElementById('invoiceDate').value,
        dueDate: document.getElementById('dueDate').value,
        
        // Customer info
        customer: {
            name: document.getElementById('customerName').value,
            address: document.getElementById('customerAddress').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value
        },
        
        // Job information
        jobInfo: {
            summaryOfWork: document.getElementById('summaryOfWork').value,
            techStatus: document.getElementById('techStatus').value,
            estimatedTotal: document.getElementById('estimatedTotal').value,
            leadSource: document.getElementById('leadSource').value,
            jobTags: document.getElementById('jobTags').value.split(',').map(tag => tag.trim()),
            lockboxCode: document.getElementById('lockboxCode').value,
            urgencyLevel: document.getElementById('urgencyLevel').value
        },
        
        // Private notes
        privateNotes: document.getElementById('privateNotes').value,
        
        // Line items
        items: [],
        
        // Checklist
        checklist: [],
        
        // Totals
        totals: {
            subtotal: document.getElementById('subtotal').textContent,
            tax: document.getElementById('taxAmount').textContent,
            discount: document.getElementById('discount').value,
            total: document.getElementById('total').textContent
        },
        
        // Metadata
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
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

    // Collect checklist items
    const checklistItems = document.querySelectorAll('.checklist-item');
    checklistItems.forEach(item => {
        const text = item.querySelector('.checklist-input').value;
        const completed = item.querySelector('.checklist-completed').checked;
        
        if (text) {
            invoiceData.checklist.push({
                item: text,
                completed: completed
            });
        }
    });

    // Save to localStorage
    localStorage.setItem('currentInvoice', JSON.stringify(invoiceData));
    alert('Enhanced invoice saved successfully!');
    
    console.log('Invoice Data:', invoiceData); // For debugging
});

// Export to JSON functionality
function exportToJSON() {
    const invoiceData = JSON.parse(localStorage.getItem('currentInvoice') || '{}');
    
    if (Object.keys(invoiceData).length === 0) {
        alert('No invoice data to export. Please save an invoice first.');
        return;
    }
    
    const dataStr = JSON.stringify(invoiceData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = invoice-.json;
    link.click();
}

// Print functionality
document.getElementById('printInvoice').addEventListener('click', function() {
    window.print();
});

// Email functionality (placeholder)
document.getElementById('emailInvoice').addEventListener('click', function() {
    alert('Email functionality will be integrated with your email service provider!');
});

// Auto-save functionality (saves every 30 seconds)
setInterval(function() {
    const saveButton = document.getElementById('saveInvoice');
    if (saveButton) {
        saveButton.click();
        console.log('Auto-saved at', new Date().toLocaleTimeString());
    }
}, 30000); // 30 seconds
