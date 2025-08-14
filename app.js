// Utility: currency formatter (IDR)
const toIDR = (n) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

// Demo product data (can be replaced with real CMS/API)
const PRODUCTS = [
  {id:'GM001', name:'Gamis Linen Vintage', cat:'gamis', price:349000, img:'https://images.unsplash.com/photo-1592878849125-1df13ba87b1f?q=80&w=1200&auto=format&fit=crop', badge:'Terlaris'},
  {id:'GM002', name:'Gamis Satin Classic', cat:'gamis', price:429000, img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop'},
  {id:'HJ001', name:'Hijab Voal Adem', cat:'hijab', price:89000, img:'https://images.unsplash.com/photo-1621743478916-9890795f25a7?q=80&w=1200&auto=format&fit=crop', badge:'Baru'},
  {id:'HJ002', name:'Hijab Pashmina Flowy', cat:'hijab', price:109000, img:'https://images.unsplash.com/photo-1585381634631-46c7f04a55aa?q=80&w=1200&auto=format&fit=crop'},
  {id:'KM001', name:'Kemeja Katun Copper', cat:'kemeja', price:189000, img:'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop'},
  {id:'KM002', name:'Kemeja Oversize Vintage', cat:'kemeja', price:209000, img:'https://images.unsplash.com/photo-1520975921264-404ed899ab8f?q=80&w=1200&auto=format&fit=crop'},
  {id:'SP001', name:'Sepatu Leather Classic', cat:'sepatu', price:499000, img:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop', badge:'Limited'},
  {id:'SP002', name:'Sepatu Canvas Casual', cat:'sepatu', price:279000, img:'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop'},
];

// LocalStorage keys
const LS_CART = 'bg_cart';

// State
let cart = JSON.parse(localStorage.getItem(LS_CART) || '[]');

// Elements
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const grid = document.getElementById('productGrid');
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const closeCart = document.getElementById('closeCart');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// Build product cards
function renderProducts(list){
  grid.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product card reveal';
    card.innerHTML = `
      <div class="thumb">
        <img src="${p.img}" alt="${p.name}">
        ${p.badge ? `<span class="badge">${p.badge}</span>`:''}
      </div>
      <div class="meta">
        <strong class="name">${p.name}</strong>
        <div class="muted">${p.cat.toUpperCase()}</div>
        <div class="price">${toIDR(p.price)}</div>
      </div>
      <div class="actions">
        <button class="btn ghost" data-id="${p.id}" data-action="detail">Detail</button>
        <button class="btn primary" data-id="${p.id}" data-action="add">+ Keranjang</button>
      </div>
    `;
    grid.appendChild(card);
  });
  revealObserve();
}

// Search & Sort
function filterAndSort(){
  const q = (searchInput?.value || '').toLowerCase().trim();
  let list = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.cat.includes(q));
  switch (sortSelect?.value){
    case 'priceAsc': list.sort((a,b)=>a.price-b.price); break;
    case 'priceDesc': list.sort((a,b)=>b.price-a.price); break;
    default: list = list; // newest by data order
  }
  renderProducts(list);
}

// Cart utilities
function saveCart(){ localStorage.setItem(LS_CART, JSON.stringify(cart)); }
function calcCount(){ return cart.reduce((n,i)=>n+i.qty,0); }
function calcTotal(){ return cart.reduce((n,i)=>n+i.qty*i.price,0); }

function addToCart(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if (!p) return;
  const exist = cart.find(x=>x.id===id);
  if (exist){ exist.qty += 1; }
  else{ cart.push({id:p.id, name:p.name, price:p.price, img:p.img, qty:1}); }
  saveCart(); updateCartUI(); openCart();
}

function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id);
  saveCart(); updateCartUI();
}

function changeQty(id,delta){
  const it = cart.find(x=>x.id===id);
  if (!it) return;
  it.qty = Math.max(1, it.qty + delta);
  saveCart(); updateCartUI();
}

function updateCartUI(){
  if (cartCount) cartCount.textContent = calcCount();
  if (!cartItems) return;
  cartItems.innerHTML = '';
  if (cart.length===0){
    cartItems.innerHTML = `<p>Keranjang kosong.</p>`;
  } else {
    cart.forEach(it=>{
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${it.img}" alt="${it.name}">
        <div>
          <div class="name">${it.name}</div>
          <div class="muted">${toIDR(it.price)}</div>
          <div class="qty">
            <button class="btn ghost" data-action="dec" data-id="${it.id}">-</button>
            <span style="padding:.2rem .6rem">${it.qty}</span>
            <button class="btn ghost" data-action="inc" data-id="${it.id}">+</button>
          </div>
        </div>
        <div class="subtotal">${toIDR(it.qty*it.price)}<br><button class="btn ghost" data-action="rm" data-id="${it.id}">hapus</button></div>
      `;
      cartItems.appendChild(row);
    });
  }
  if (cartTotal) cartTotal.textContent = toIDR(calcTotal());
}

// Open/close cart
function openCart(){ cartDrawer?.classList.add('open'); }
function closeCartDrawer(){ cartDrawer?.classList.remove('open'); }

// Slider
const slider = document.getElementById('slider');
const slides = slider ? Array.from(slider.querySelectorAll('.slide')) : [];
let slideIndex = 0;
function showSlide(i){
  slides.forEach((s,idx)=> s.classList.toggle('active', idx===i));
}
function nextSlide(){ slideIndex = (slideIndex+1)%slides.length; showSlide(slideIndex); }
function prevSlide(){ slideIndex = (slideIndex-1+slides.length)%slides.length; showSlide(slideIndex); }
if (slides.length){ showSlide(slideIndex); setInterval(nextSlide, 6000); }
document.getElementById('nextSlide')?.addEventListener('click', nextSlide);
document.getElementById('prevSlide')?.addEventListener('click', prevSlide);

// Reveal on scroll
function revealObserve(){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  },{threshold:.15});
  els.forEach(el=>io.observe(el));
}
revealObserve();

// Delegated events
grid?.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const id = btn.dataset.id; const action = btn.dataset.action;
  if (action==='add') addToCart(id);
  if (action==='detail') alert('Detail produk akan hadir. Sementara ini: '+ id);
});
cartItems?.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const id = btn.dataset.id; const action = btn.dataset.action;
  if (action==='dec') changeQty(id,-1);
  if (action==='inc') changeQty(id, 1);
  if (action==='rm') removeFromCart(id);
});
cartButton?.addEventListener('click', openCart);
document.getElementById('closeCart')?.addEventListener('click', closeCartDrawer);

// Search/sort listeners
searchInput?.addEventListener('input', filterAndSort);
sortSelect?.addEventListener('change', filterAndSort);

// Init
filterAndSort();
updateCartUI();

// -------- Background Audio (copyright-free, generated client-side) --------
// We synthesize a gentle ambient chord with WebAudio so it's license-free and very light.
let audioCtx, masterGain, isPlaying=false;
function createAmbient(){
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.05; // subtle volume
  masterGain.connect(audioCtx.destination);

  const freqs = [261.63, 329.63, 392.00]; // C major triad
  freqs.forEach((f,i)=>{
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    gain.gain.value = 0;
    osc.connect(gain).connect(masterGain);
    osc.start();

    // gentle fade in/out loop
    const now = audioCtx.currentTime;
    const period = 8 + i*2;
    function schedule(){
      const t = audioCtx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + period*0.5);
      gain.gain.linearRampToValueAtTime(0, t + period);
      setTimeout(schedule, period*1000);
    }
    schedule();
  });
}
function toggleAudio(){
  if (!isPlaying){
    if (!audioCtx) createAmbient();
    else audioCtx.resume();
    isPlaying = true;
  } else {
    audioCtx.suspend();
    isPlaying = false;
  }
}
document.getElementById('audioToggle')?.addEventListener('click', toggleAudio);

// Footer contact form (demo)
document.getElementById('contactForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  alert('Terima kasih! Pesanmu sudah terkirim.');
});
