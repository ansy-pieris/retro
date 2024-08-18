document.addEventListener('DOMContentLoaded', () => {
    const formatCurrency = (amount) => `RS:${amount.toFixed(2)}`;
    const updateTotalPrice = () => {
        const rows = document.querySelectorAll('#order-table tbody tr');
        let total = 0;
        rows.forEach(row => {
            const pricePerUnit = parseFloat(row.querySelector('.price').dataset.pricePerUnit);
            const quantity = parseInt(row.querySelector('.quantity span').textContent, 10);
            total += pricePerUnit * quantity;
        });
        const formattedTotal = formatCurrency(total);
        document.getElementById('total-price').textContent = `Total Price: ${formattedTotal}`;
        // Saving the total price to session storage
        sessionStorage.setItem('totalPrice', formattedTotal);
    };

    const addToOrderTable = (productId, name, price, quantity) => {
        const orderTableBody = document.querySelector('#order-table tbody');
        const existingRow = Array.from(orderTableBody.rows).find(row => row.dataset.productId === productId);

        if (existingRow) {
            const quantityCell = existingRow.querySelector('.quantity span');
            const priceCell = existingRow.querySelector('.price');
            const currentQuantity = parseInt(quantityCell.textContent, 10);
            const newQuantity = currentQuantity + quantity;
            quantityCell.textContent = newQuantity;
            priceCell.textContent = formatCurrency(price * newQuantity);
            priceCell.dataset.pricePerUnit = price;

            if (newQuantity <= 0) {
                existingRow.remove();
            }
        } else {
            const row = document.createElement('tr');
            row.dataset.productId = productId;
            row.innerHTML = `
                <td>${name}</td>
                <td class="quantity">
                    <div class="quantity-controls">
                        <button class="decrease"><</button>
                        <span>${quantity}</span>
                        <button class="increase">></button>
                    </div>
                </td>
                <td class="price" data-price-per-unit="${price}">${formatCurrency(price * quantity)}</td>
            `;
            orderTableBody.appendChild(row);

            row.querySelector('.decrease').addEventListener('click', () => {
                const quantitySpan = row.querySelector('.quantity span');
                let quantity = parseInt(quantitySpan.textContent, 10);
                if (quantity > 1) {
                    quantity--;
                    quantitySpan.textContent = quantity;
                    row.querySelector('.price').textContent = formatCurrency(price * quantity);
                } else {
                    row.remove();
                }
                updateTotalPrice();
                saveOrderToLocalStorage();
            });

            row.querySelector('.increase').addEventListener('click', () => {
                const quantitySpan = row.querySelector('.quantity span');
                let quantity = parseInt(quantitySpan.textContent, 10);
                quantity++;
                quantitySpan.textContent = quantity;
                row.querySelector('.price').textContent = formatCurrency(price * quantity);
                updateTotalPrice();
                saveOrderToLocalStorage();
            });
        }

        updateTotalPrice();
        saveOrderToLocalStorage();
    };

    document.getElementById('add-to-favorites').addEventListener('click', () => {
        const rows = document.querySelectorAll('#order-table tbody tr');
        if (rows.length === 0) {
            alert('No items selected to add to favorites.');
            return;
        }
        const favorites = Array.from(rows).map(row => ({
            productId: row.dataset.productId,
            name: row.cells[0].textContent,
            price: parseFloat(row.querySelector('.price').dataset.pricePerUnit),
            quantity: parseInt(row.querySelector('.quantity span').textContent, 10)
        }));
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Items have been added to favorites!');
    });

    document.getElementById('apply-favorites').addEventListener('click', () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (favorites.length === 0) {
            alert('No favorites to apply.');
            return;
        }
        const orderTableBody = document.querySelector('#order-table tbody');
        orderTableBody.innerHTML = ''; 
        favorites.forEach(item => {
            addToOrderTable(item.productId, item.name, item.price, item.quantity);
        });
        alert('Favorites have been applied!');
    });

    const saveOrderToLocalStorage = () => {
        const rows = document.querySelectorAll('#order-table tbody tr');
        const orderData = Array.from(rows).map(row => ({
            productId: row.dataset.productId,
            name: row.cells[0].textContent,
            price: parseFloat(row.querySelector('.price').dataset.pricePerUnit),
            quantity: parseInt(row.querySelector('.quantity span').textContent, 10)
        }));
        localStorage.setItem('orderData', JSON.stringify(orderData));
    };

    const loadOrderFromLocalStorage = () => {
        const orderData = JSON.parse(localStorage.getItem('orderData')) || [];
        orderData.forEach(item => {
            addToOrderTable(item.productId, item.name, item.price, item.quantity);
        });

        // Load total price from session storage
        const storedTotalPrice = sessionStorage.getItem('totalPrice');
        if (storedTotalPrice) {
            document.getElementById('total-price').textContent = `Total Price: ${storedTotalPrice}`;
        }
    };

    document.querySelectorAll('.add-to-order').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product-id');
            const row = button.closest('tr');
            const name = row.cells[1].textContent;
            const price = parseFloat(row.cells[2].textContent.replace('RS:', ''));
            const quantity = getQuantity(row.querySelector('.item-quantity'));

            if (quantity > 0) {
                addToOrderTable(productId, name, price, quantity);
                row.querySelector('.item-quantity').value = 0; 
            }
        });
    });

    document.getElementById('buy-now').addEventListener('click', () => {
        const orderTableBody = document.querySelector('#order-table tbody');
        if (orderTableBody.rows.length === 0) {
            alert('Your order is empty.');
            return;
        }
        // Save order data and redirect
        saveOrderToLocalStorage();
        window.location.href = 'order.html';
    });

    const getQuantity = (inputElement) => {
        const value = parseInt(inputElement.value, 10);
        return isNaN(value) || value <= 0 ? 0 : value;
    };

    loadOrderFromLocalStorage();
});
