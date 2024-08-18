document.addEventListener('DOMContentLoaded', () => {
    const formatCurrency = (amount) => `RS:${amount.toFixed(2)}`;

    const addToOrderTable = (productId, name, price, quantity) => {
        const orderTableBody = document.querySelector('#order-table tbody');
        const row = document.createElement('tr');
        row.dataset.productId = productId;
        row.innerHTML = `
            <td>${name}</td>
            <td>${quantity}</td>
            <td>${formatCurrency(price * quantity)}</td>
        `;
        orderTableBody.appendChild(row);
    };
    const loadOrderFromLocalStorage = () => {
        const orderData = JSON.parse(localStorage.getItem('orderData')) || [];
        orderData.forEach(item => {
            addToOrderTable(item.productId, item.name, item.price, item.quantity);
        });
        const storedTotalPrice = sessionStorage.getItem('totalPrice');
        if (storedTotalPrice) {
            document.getElementById('total-price').textContent = `Total Price: ${storedTotalPrice}`;
        }
    };
    const clearOrderSummary = () => {
        const orderTableBody = document.querySelector('#order-table tbody');
        while (orderTableBody.firstChild) {
            orderTableBody.removeChild(orderTableBody.firstChild);
        }
        document.getElementById('total-price').textContent = 'Total Price: 0.00';
        localStorage.removeItem('orderData');
        sessionStorage.removeItem('totalPrice');
    };
const clearForm = () => {
    const form = document.querySelector('.main-form form');
    form.reset();
};

const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};

const showAlert = () => {
    const today = new Date();
    const placedDate = formatDate(today);
    const receivingDate = new Date(today);
    receivingDate.setDate(today.getDate() + 3);
    const formattedReceivingDate = formatDate(receivingDate);

    const alertMessage = `Thank you for your purchase! Your order was placed on ${placedDate} and will be received by ${formattedReceivingDate}.`;
    
    document.getElementById('alertMessage').textContent = alertMessage;
    
    const alertCard = document.getElementById('customAlert');
    alertCard.classList.remove('hidden');
    alertCard.classList.add('popUp'); 

    document.getElementById('closeAlert').addEventListener('click', () => {
        alertCard.classList.remove('popUp');
        alertCard.classList.add('popOut'); 
        
        setTimeout(() => {
            alertCard.classList.add('hidden');
            alertCard.classList.remove('popOut');
            window.location.href = 'order-form.html';
        }, 500); 
    });
};


document.querySelector('.main-form form').addEventListener('submit', (e) => {
    e.preventDefault();
    showAlert();
    clearForm();
});

    const placeOrderButton = document.getElementById('place-order');
    placeOrderButton.addEventListener('click', (e) => {
        e.preventDefault(); 

        const orderTableBody = document.querySelector('#order-table tbody');
        if (orderTableBody.children.length === 0) {
            alert('Your order table is empty. Please add items to your order before placing it.');
            return;
        }
        const form = document.querySelector('.main-form form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        clearOrderSummary();
        clearForm();
        showAlert();
    });

    loadOrderFromLocalStorage();
});
