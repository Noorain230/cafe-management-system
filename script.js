/* FIXED LOGIN LOOP + CART ICON */

/* MENU */
const menuItems = [
  { id: 1, name: 'Matcha', price: 200, category: 'coffee', image: 'images/matcha_3.jpg' },
  { id: 2, name: 'Americano', price: 180, category: 'coffee', image: 'images/americano_3.jpg' },
  { id: 3, name: 'Cappuccino', price: 150, category: 'coffee', image: 'images/cappuccino.jpg' },
  { id: 4, name: 'Tiramisu', price: 300, category: 'food', image: 'images/tiramisu.jpg' },
  { id: 5, name: 'Green Tea', price: 130, category: 'tea', image: 'images/green_tea_3.jpg' },
  { id: 6, name: 'Black Tea', price: 100, category: 'tea', image: 'images/Black_tea_2.jpg' },
  { id: 7, name: 'Cold Coffee', price: 170, category: 'coffee', image: 'images/cold_coffee.jpg' },
  { id: 8, name: 'Brownie', price: 150, category: 'food', image: 'images/brownie.jpg' },
  { id: 9, name: 'Muffin', price: 120, category: 'food', image: 'images/muffin.jpg' },
  { id: 10, name: 'Macroon', price: 300, category: 'food', image: 'images/macroon_1.jpg' },
  { id: 11, name: 'Croissant', price: 130, category: 'food', image: 'images/croissant.jpg' },
  { id: 12, name: 'Fruit Tart Pastry', price: 230, category: 'food', image: 'images/Fruit_tart_Pastry.jpg' },
  { id: 13, name: 'Donut', price: 320, category: 'food', image: 'images/donut.jpg' },
  { id: 14, name: 'Kulhad Tea', price: 80, category: 'tea', image: 'images/kulhad_tea_1.jpg' }
];

const storage = {
  get: key => JSON.parse(localStorage.getItem(key)) || null,
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: key => localStorage.removeItem(key)
};

let cart = [], currentUser = null, filteredItems = [...menuItems];

document.addEventListener('DOMContentLoaded', init);

function init() {
  applyTheme();
  loadCart();
  updateNavbar();
  loadPageSpecific();
}

function loadPageSpecific() {
  const page = window.location.pathname.split('/').pop().replace('.html', '');
  if (page === 'login') return initLogin();
  if (page === 'index') return initMenu();
  if (page === 'order') return initOrder();
  if (page === 'orders') return initOrders();
}

function loadCart() {
  cart = storage.get('cart') || [];
}

function applyTheme() {
  const theme = storage.get('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', current);
  storage.set('theme', current);
}

function updateNavbar() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
  currentUser = storage.get('currentUser');
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) logoutBtn.classList.toggle('hidden', !currentUser);
}

function logout() {
  storage.remove('currentUser');
  storage.remove('cart');
  cart = [];
  window.location.href = 'login.html';
}

// FIXED CART ICON
function toggleCart() {
  const modal = document.querySelector('.cart-modal');
  const overlay = document.querySelector('.overlay');
  modal.classList.toggle('open');
  overlay.classList.toggle('open');
  
  if (modal.classList.contains('open')) {
    loadCart();
    const itemsDiv = document.querySelector('#cartItems');
    if (itemsDiv) renderCartModal(itemsDiv);
  }
}

function renderCartModal(container) {
  container.innerHTML = '';
  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-secondary);">No items added</p>';
    return;
  }
  
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width:60px;height:60px;border-radius:8px;">
      <div style="flex:1;margin-left:1rem;">
        <h4>${item.name}</h4>
        <p>₹${item.price.toFixed(2)}</p>
      </div>
      <div class="qty-controls" style="display:flex;align-items:center;">
        <button onclick="updateQty(${item.id},-1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQty(${item.id},1)">+</button>
      </div>`;
    container.appendChild(div);
  });
  
  const totalDiv = document.createElement('div');
  totalDiv.className = 'cart-total';
  totalDiv.style.fontSize = '1.2rem';
  totalDiv.style.fontWeight = 'bold';
  totalDiv.textContent = `Total: ₹${total.toFixed(2)}`;
  container.appendChild(totalDiv);
}

function closeModals() {
  document.querySelector('.cart-modal')?.classList.remove('open');
  document.querySelector('.overlay')?.classList.remove('open');
}

function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function initLogin() {
  const form = document.querySelector('#authForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value.trim();
    if (username === 'admin' && password === 'manager') {
      storage.set('currentUser', {username: 'admin'});
      showToast('Login successful!');
      window.location.href = 'index.html';
    } else {
      showToast('Use valid credentials', 'error');
    }
  });
}

function initMenu() {
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  const grid = document.querySelector('.menu-grid');
  const search = document.getElementById('searchInput');
  const filters = document.querySelectorAll('.filter-btn');
  renderMenu(filteredItems, grid);
  if (search) search.addEventListener('input', e => filterMenu(e.target.value));
  filters.forEach(btn => btn.addEventListener('click', e => filterByCategory(e)));
}

function renderMenu(items, container) {
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card fade-in';
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="card-body">
        <h3 class="card-title">${item.name}</h3>
        <div class="card-price">₹${item.price.toFixed(2)}</div>
        <button class="add-to-cart" onclick="addToCart(${item.id})">Add to Cart</button>
      </div>`;
    container.appendChild(card);
  });
}

function filterMenu(query) {
  filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );
  renderMenu(filteredItems, document.querySelector('.menu-grid'));
}

function filterByCategory(e) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  const cat = e.target.dataset.category;
  filteredItems = cat === 'all' ? menuItems : menuItems.filter(item => item.category === cat);
  renderMenu(filteredItems, document.querySelector('.menu-grid'));
}

function addToCart(id) {
  const item = menuItems.find(i => i.id === id);
  loadCart();
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  storage.set('cart', cart);
  updateNavbar();
  showToast(item.name + ' added!');
}

function updateQty(id, delta) {
  loadCart();
  const item = cart.find(c => c.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(c => c.id !== id);
    }
    storage.set('cart', cart);
    updateNavbar();
    const itemsDiv = document.querySelector('#cartItems');
    if (itemsDiv && itemsDiv.parentElement.classList.contains('open')) renderCartModal(itemsDiv);
  }
}

function initOrder() {
  if (!currentUser) window.location.href = 'login.html';
  renderOrderPage();
}

function renderOrderPage() {
  loadCart();
  const container = document.querySelector('#cartItemsSummary');
  const totalEl = document.getElementById('orderTotal');
  const confirmBtn = document.getElementById('confirmOrderBtn');
  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">Cart empty</p>';
    totalEl.textContent = '';
    confirmBtn.disabled = true;
    return;
  }
  let total = 0;
  container.innerHTML = cart.map(item => {
    total += item.price * item.quantity;
    return `<div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div style="flex:1;">
        <h4>${item.name}</h4>
        <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
      </div>
      <div class="qty-controls">
        <button onclick="updateQty(${item.id}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQty(${item.id}, 1)">+</button>
      </div>
      <button onclick="removeFromCart(${item.id})" style="background:var(--error);">Remove</button>
    </div>`;
  }).join('');
  totalEl.textContent = `Total: ₹${total.toFixed(2)}`;
  confirmBtn.disabled = false;
}

function removeFromCart(id) {
  loadCart();
  cart = cart.filter(c => c.id !== id);
  storage.set('cart', cart);
  updateNavbar();
  const container = document.querySelector('#cartItemsSummary');
  if (container) renderOrderPage();
}

function confirmOrder() {
  const customerName = document.getElementById('customerName').value.trim();
  const paymentMethod = document.getElementById('paymentMethod').value;
  if (!customerName || !paymentMethod) return showToast('Fill fields', 'error');
  loadCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    customerName,
    items: cart.map(i => ({name: i.name, qty: i.quantity, price: i.price})),
    totalAmount: total.toFixed(2),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    paymentMethod
  };
  let orders = storage.get('orders') || [];
  orders.unshift(order);
  storage.set('orders', orders);
  storage.remove('cart');
  cart = [];
  document.getElementById('customerName').value = '';
  document.getElementById('paymentMethod').value = '';
  renderOrderPage();
  showToast('Order placed!');
}

function initOrders() {
  currentUser = storage.get('currentUser');
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  const tbody = document.querySelector('#ordersBody');
  if (!tbody) return;
  const orders = storage.get('orders') || [];
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-secondary);">No orders yet</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map((order, index) => {
    const itemsList = order.items.map(i => `${i.name} x${i.qty}`).join(', ');
    return `
      <tr>
        <td>${order.customerName || 'N/A'}</td>
        <td>${itemsList}</td>
        <td>$${order.totalAmount}</td>
        <td>${order.date || 'N/A'}</td>
        <td>${order.time || 'N/A'}</td>
        <td>${order.paymentMethod || 'N/A'}</td>
        <td><button class="btn" onclick="generateReceipt(${index})" style="padding:0.5rem 1rem; font-size:0.9rem;">Receipt</button></td>
      </tr>`;
  }).join('');
}

function generateReceipt(index) {
  const orders = storage.get('orders') || [];
  const order = orders[index];
  if (!order) return showToast('Error', 'error');
  
  let receipt = `=== Cafe Receipt ===

Customer Name: ${order.customerName}

Items bought:
`;
  order.items.forEach(item => receipt += `- ${item.name} x${item.qty}: ₹${(item.price * item.qty).toFixed(2)}

`);
  receipt += `Total Amount:  ₹${order.totalAmount}

Date: ${order.date}
Time: ${order.time}
Payment Method: ${order.paymentMethod}

Thank you! Visit Again ☕
===============`;

  const blob = new Blob([receipt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt_${order.customerName}_${order.date}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Receipt downloaded!');
}

// Global
document.addEventListener('click', e => {
  if (e.target.matches('.dark-toggle')) toggleTheme();
  if (e.target.matches('.logout-btn')) logout();
  if (e.target.matches('.overlay')) closeModals();
});
