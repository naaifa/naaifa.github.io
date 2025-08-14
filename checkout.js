const LS_CART = 'bg_cart';
const cart = JSON.parse(localStorage.getItem(LS_CART) || '[]');

const toIDR = (n) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const listEl = document.getElementById('summaryItems');
const totalEl = document.getElementById('summaryTotal');

function renderSummary(){
  listEl.innerHTML = '';
  if (cart.length===0){
    listEl.innerHTML = '<p>Keranjang kosong. <a href="index.html">Kembali belanja</a></p>';
    totalEl.textContent = toIDR(0);
    return;
  }
  let total = 0;
  cart.forEach(it=>{
    total += it.price*it.qty;
    const line = document.createElement('div');
    line.className = 'summary-line';
    line.innerHTML = `
      <img src="${it.img}" alt="${it.name}">
      <div>
        <div class="name"><strong>${it.name}</strong></div>
        <div class="muted">${toIDR(it.price)} × ${it.qty}</div>
      </div>
      <div class="subtotal">${toIDR(it.price*it.qty)}</div>
    `;
    listEl.appendChild(line);
  });
  totalEl.textContent = toIDR(total);
}
renderSummary();

document.getElementById('checkoutForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  // fake order creation
  const order = {
    id: 'BG-' + Math.random().toString(36).slice(2,8).toUpperCase(),
    at: new Date().toISOString(),
    items: cart,
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    payment: document.getElementById('payment').value,
    total: cart.reduce((n,i)=>n+i.price*i.qty,0)
  };
  localStorage.setItem('bg_last_order', JSON.stringify(order));
  // clear cart
  localStorage.removeItem(LS_CART);
  document.getElementById('orderSuccess').hidden = false;
});
