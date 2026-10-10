/**
 * SoundStore — MW75 TUMI Product Page
 * app.js
 *
 * Features covered:
 *  FR-02  Photo carousel (prev/next + thumbnails)
 *  FR-04  Color selection (Black active, Silver out-of-stock)
 *  FR-05  Main photo changes on color change
 *  FR-08  Cart summary (color, qty, total price)
 *  AC-08  Checkout button active only when color selected
 *  AC-12  Full keyboard support
 *  AC-13  State resets on page reload (no persistence)
 */

'use strict';

const API_URL = 'http://localhost:3000/api/products/1';

/* ============================================================
   PRODUCT DATA
   ============================================================ */
let PRODUCT = null;

/* Emoji placeholders — kept as last-resort fallback only */
const COLOR_EMOJI = { black: '🎧', silver: '🎧' };

/* ============================================================
   STATE  (AC-13: resets on every page load — no persistence)
   ============================================================ */
const state = {
  selectedColor: null,
  currentImageIndex: 0,
  quantity: 1,
  cart: [],                  // { color, qty, unitPrice }
};

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const dom = {
  page:               document.getElementById('productPage'),
  pageStatus:         document.getElementById('pageStatus'),
  pageError:          document.getElementById('pageError'),
  errorMessage:       document.getElementById('errorMessage'),
  retryButton:        document.getElementById('retryButton'),
  breadcrumbProduct:  document.getElementById('breadcrumbProduct'),
  productName:        document.getElementById('productName'),
  productSubtitle:    document.getElementById('productSubtitle'),
  priceAmount:        document.getElementById('priceAmount'),
  productPrice:       document.getElementById('productPrice'),
  productDescription: document.getElementById('productDescription'),
  colorOptions:       document.getElementById('colorOptions'),
  mainImage:          document.getElementById('mainImage'),
  thumbsContainer:    document.getElementById('thumbsContainer'),
  galleryPrev:        document.getElementById('galleryPrev'),
  galleryNext:        document.getElementById('galleryNext'),
  imgCurrent:         document.getElementById('imgCurrent'),
  imgTotal:           document.getElementById('imgTotal'),
  gDots:              document.getElementById('gDots'),

  selectedColorLabel: document.getElementById('selectedColorLabel'),

  qtyMinus:           document.getElementById('qtyMinus'),
  qtyPlus:            document.getElementById('qtyPlus'),
  qtyDisplay:         document.getElementById('qtyDisplay'),
  qtyLimitNote:       document.getElementById('qtyLimitNote'),

  addToCartBtn:       document.getElementById('addToCartBtn'),
  confirmationMsg:    document.getElementById('confirmationMsg'),

  cartBtn:            document.getElementById('cartBtn'),
  cartCount:          document.getElementById('cartCount'),
  cartOverlay:        document.getElementById('cartOverlay'),
  cartCloseBtn:       document.getElementById('cartCloseBtn'),
  cartItemsList:      document.getElementById('cartItemsList'),
  cartFooter:         document.getElementById('cartFooter'),
  drawerSubtotal:     document.getElementById('drawerSubtotal'),
  checkoutBtn:        document.getElementById('checkoutBtn'),
  checkoutNote:       document.getElementById('checkoutNote'),
};

/* ============================================================
   HELPERS
   ============================================================ */

/** Format a number as a currency string */
function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: PRODUCT.currency,
  }).format(amount);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

/** Check whether an image URL loads (kept for safety) */
function imageExists(src, cb) {
  const img = new Image();
  img.onload  = () => cb(true);
  img.onerror = () => cb(false);
  img.src = src;
}

/**
 * Set the main gallery image with a fade transition.
 */
function setMainImage(colorKey, index) {
  const imgData = PRODUCT.colors[colorKey].images[index];

  dom.mainImage.classList.add('fade-out');
  setTimeout(() => {
    dom.mainImage.src = imgData.src;
    dom.mainImage.alt = imgData.alt;
    dom.mainImage.classList.remove('fade-out');
  }, 180);
}

/** Build thumbnail buttons for the current color */
function buildThumbnails(colorKey) {
  const colorData = PRODUCT.colors[colorKey];
  dom.thumbsContainer.innerHTML = '';

  // Rebuild mobile dots too
  if (dom.gDots) {
    dom.gDots.innerHTML = '';
    colorData.images.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'g-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-hidden', 'true');
      dom.gDots.appendChild(dot);
    });
  }

  colorData.images.forEach((imgData, i) => {
    const btn = document.createElement('button');
    btn.className = 'thumb-btn' + (i === state.currentImageIndex ? ' active' : '');
    btn.setAttribute('aria-label', `View image ${i + 1}: ${imgData.alt}`);
    btn.setAttribute('aria-pressed', i === state.currentImageIndex ? 'true' : 'false');
    btn.dataset.index = i;

    const img = document.createElement('img');
    img.src = imgData.src;
    img.alt = imgData.alt;
    img.loading = 'lazy';
    btn.appendChild(img);

    btn.addEventListener('click', () => selectImage(i));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectImage(i);
      }
    });

    dom.thumbsContainer.appendChild(btn);
  });
}

/** Update the active thumbnail highlight */
function updateThumbnailHighlight(index) {
  const thumbs = dom.thumbsContainer.querySelectorAll('.thumb-btn');
  thumbs.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
    btn.setAttribute('aria-pressed', i === index ? 'true' : 'false');
  });
}

/** Update gallery arrow disabled states and counter */
function updateGalleryControls() {
  const total = PRODUCT.colors[state.selectedColor].images.length;
  dom.galleryPrev.disabled = state.currentImageIndex === 0;
  dom.galleryNext.disabled = state.currentImageIndex === total - 1;

  // Counter (may be null if element removed from HTML)
  if (dom.imgCurrent) dom.imgCurrent.textContent = state.currentImageIndex + 1;
  if (dom.imgTotal)   dom.imgTotal.textContent   = total;

  // Mobile dots
  if (dom.gDots) {
    dom.gDots.querySelectorAll('.g-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === state.currentImageIndex);
    });
  }
}

/* ============================================================
   GALLERY ACTIONS
   ============================================================ */

/** Select a specific image index */
function selectImage(index) {
  const total = PRODUCT.colors[state.selectedColor].images.length;
  if (index < 0 || index >= total) return;

  state.currentImageIndex = index;
  setMainImage(state.selectedColor, index);
  updateThumbnailHighlight(index);
  updateGalleryControls();
}

/** Navigate forward or backward */
function navigateGallery(direction) {
  const total = PRODUCT.colors[state.selectedColor].images.length;
  const next  = state.currentImageIndex + direction;
  if (next >= 0 && next < total) selectImage(next);
}

dom.galleryPrev.addEventListener('click', () => navigateGallery(-1));
dom.galleryNext.addEventListener('click', () => navigateGallery(1));

/* ============================================================
   COLOR SELECTION  (FR-04, FR-05)
   ============================================================ */

function selectColor(colorKey) {
  if (!PRODUCT.colors[colorKey]) return; // guard: warna tidak dikenal

  state.selectedColor      = colorKey;
  state.currentImageIndex  = 0;
  state.quantity           = getMaximumQuantity(colorKey) > 0 ? 1 : 0;

  const isOutOfStock = PRODUCT.colors[colorKey].stock === 0;

  // Update swatch UI
  dom.colorOptions.querySelectorAll('.color-pill').forEach((btn) => {
    const isActive = btn.dataset.color === colorKey;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed',  isActive ? 'true'  : 'false');
    btn.setAttribute('aria-checked',  isActive ? 'true'  : 'false');
  });

  // Update label (tambahkan penanda jika OOS)
  dom.selectedColorLabel.textContent = PRODUCT.colors[colorKey].name +
    (isOutOfStock ? ' (Out of stock)' : '');

  // Update gallery (FR-05)
  buildThumbnails(colorKey);
  setMainImage(colorKey, 0);
  updateGalleryControls();

  // Nonaktifkan Add to Cart jika stok habis
  dom.addToCartBtn.disabled = isOutOfStock;
  dom.addToCartBtn.textContent = isOutOfStock ? 'Sold Out' : 'Add to Cart';
  dom.addToCartBtn.setAttribute(
    'aria-label',
    isOutOfStock ? `${PRODUCT.colors[colorKey].name} is sold out` : `Add ${PRODUCT.name} to cart`
  );
  updateAddToCartAvailability();

  // Reset quantity UI
  updateQuantityDisplay();

  // Clear old confirmation (per PRD interaction rule)
  hideConfirmation();
}

dom.colorOptions.addEventListener('click', (event) => {
  const button = event.target.closest('.color-pill');
  if (button) selectColor(button.dataset.color);
});

/* ============================================================
   QUANTITY  (FR-08: limited by selected variant stock)
   ============================================================ */

function getMaximumQuantity(colorKey) {
  return PRODUCT.colors[colorKey].stock;
}

function getCartQuantity(colorKey) {
  return state.cart.find((item) => item.color === colorKey)?.qty ?? 0;
}

function updateAddToCartAvailability() {
  if (!state.selectedColor) return;
  const stock = PRODUCT.colors[state.selectedColor].stock;
  const remainingStock = stock - getCartQuantity(state.selectedColor);
  const unavailable = remainingStock <= 0;

  dom.addToCartBtn.disabled = unavailable;
  dom.addToCartBtn.textContent = stock === 0
    ? 'Sold Out'
    : unavailable
      ? 'Maximum Stock in Cart'
      : 'Add to Cart';
}

function updateQuantityDisplay() {
  const qty = state.quantity;
  const maximum = getMaximumQuantity(state.selectedColor);
  dom.qtyDisplay.textContent = qty;

  dom.qtyMinus.disabled = qty <= 1;
  dom.qtyPlus.disabled  = maximum === 0 || qty >= maximum;

  dom.qtyLimitNote.textContent =
    maximum > 0 && qty >= maximum
      ? `Maximum quantity is ${maximum} (available stock).`
      : '';
}

dom.qtyMinus.addEventListener('click', () => {
  if (state.quantity > 1) {
    state.quantity--;
    updateQuantityDisplay();
    hideConfirmation();
  }
});

dom.qtyPlus.addEventListener('click', () => {
  if (state.quantity < getMaximumQuantity(state.selectedColor)) {
    state.quantity++;
    updateQuantityDisplay();
    hideConfirmation();
  }
});

/* ============================================================
   CONFIRMATION MESSAGE
   ============================================================ */

function showConfirmation(message) {
  dom.confirmationMsg.textContent = '✅ ' + message;
  dom.confirmationMsg.removeAttribute('hidden');
}

function hideConfirmation() {
  dom.confirmationMsg.setAttribute('hidden', '');
  dom.confirmationMsg.textContent = '';
}

/* ============================================================
   CART  (FR-08)
   ============================================================ */

/** Add / merge item into cart array */
function addToCart() {
  const colorKey  = state.selectedColor;
  const colorName = PRODUCT.colors[colorKey].name;
  const existing = state.cart.find((item) => item.color === colorKey);
  const remainingStock = Math.max(
    0,
    getMaximumQuantity(colorKey) - (existing?.qty ?? 0)
  );
  const qty = Math.min(state.quantity, remainingStock);

  if (qty === 0) {
    updateAddToCartAvailability();
    showConfirmation(`No ${colorName} stock remains.`);
    return;
  }

  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      color:     colorKey,
      colorName: colorName,
      qty:       qty,
      unitPrice: PRODUCT.priceUnit,
    });
  }

  updateCartBadge();
  renderCartDrawer();
  updateAddToCartAvailability();

  const total = formatPrice(qty * PRODUCT.priceUnit);
  showConfirmation(
    `${qty}× ${PRODUCT.name} (${colorName}) added — ${total}`
  );
}

dom.addToCartBtn.addEventListener('click', addToCart);

/** Total quantity across all cart items */
function cartTotalQty() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

/** Total price across all cart items */
function cartTotalPrice() {
  return state.cart.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

/** Update the badge number on the cart icon */
function updateCartBadge() {
  const total = cartTotalQty();
  dom.cartCount.textContent = total;
  dom.cartCount.dataset.empty = total === 0 ? 'true' : 'false';
}

/** Re-render the cart drawer contents */
function renderCartDrawer() {
  if (state.cart.length === 0) {
    dom.cartItemsList.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    dom.cartFooter.setAttribute('hidden', '');
    return;
  }

  dom.cartFooter.removeAttribute('hidden');
  dom.cartItemsList.innerHTML = '';

  state.cart.forEach((item) => {
    const colorData = PRODUCT.colors[item.color];

    const el = document.createElement('div');
    el.className = 'cart-item';
    el.setAttribute('role', 'listitem');

    // Cart item image
    const imgWrapper = document.createElement('div');
    const img = document.createElement('img');
    img.src = colorData.images[0].src;
    img.alt = `${PRODUCT.name} ${item.colorName}`;
    img.className = 'cart-item-img';
    imgWrapper.appendChild(img);

    const info = document.createElement('div');
    info.className = 'cart-item-info';
    info.innerHTML = `
        <div class="cart-item-name">${escapeHtml(PRODUCT.name)}</div>
        <div class="cart-item-meta">Color: ${escapeHtml(item.colorName)}</div>
      <div class="cart-item-row">
          <div class="cart-item-qty" role="group" aria-label="Quantity for ${escapeHtml(item.colorName)}">
            <button class="cart-item-qty-btn" data-action="minus" data-color="${escapeHtml(item.color)}" aria-label="Decrease quantity"${item.qty <= 1 ? ' disabled' : ''}>−</button>
          <span class="cart-item-qty-num" aria-live="polite">${item.qty}</span>
            <button class="cart-item-qty-btn" data-action="plus"  data-color="${escapeHtml(item.color)}" aria-label="Increase quantity"${item.qty >= getMaximumQuantity(item.color) ? ' disabled' : ''}>+</button>
        </div>
        <span class="cart-item-price">${formatPrice(item.qty * item.unitPrice)}</span>
      </div>
        <button class="cart-item-remove" data-color="${escapeHtml(item.color)}" aria-label="Remove ${escapeHtml(item.colorName)} from cart">Remove</button>
    `;

    el.appendChild(imgWrapper);
    el.appendChild(info);
    dom.cartItemsList.appendChild(el);
  });

  // Wire up quantity buttons inside cart
  dom.cartItemsList.querySelectorAll('.cart-item-qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const color  = btn.dataset.color;
      const action = btn.dataset.action;
      const item   = state.cart.find((i) => i.color === color);
      if (!item) return;

      if (action === 'plus'  && item.qty < getMaximumQuantity(color)) item.qty++;
      if (action === 'minus' && item.qty > 1)        item.qty--;

      updateCartBadge();
      renderCartDrawer();
      updateAddToCartAvailability();
    });
  });

  // Wire up remove buttons
  dom.cartItemsList.querySelectorAll('.cart-item-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      state.cart  = state.cart.filter((i) => i.color !== color);
      updateCartBadge();
      renderCartDrawer();
      updateAddToCartAvailability();
    });
  });

  // Update subtotal
  dom.drawerSubtotal.textContent = formatPrice(cartTotalPrice());

  // Reset checkout note when cart is re-rendered
  dom.checkoutNote.textContent = '';
}

/* ============================================================
   CART DRAWER — open / close
   ============================================================ */

function openCart() {
  dom.cartOverlay.removeAttribute('hidden');
  // Trigger CSS animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => dom.cartOverlay.classList.add('open'));
  });
  // Move focus into drawer for accessibility
  dom.cartCloseBtn.focus();
  // Trap scroll on body
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  dom.cartOverlay.classList.remove('open');
  dom.cartOverlay.addEventListener('transitionend', () => {
    dom.cartOverlay.setAttribute('hidden', '');
  }, { once: true });
  document.body.style.overflow = '';
  dom.cartBtn.focus();
}

dom.cartBtn.addEventListener('click', openCart);
dom.cartCloseBtn.addEventListener('click', closeCart);

// Close on overlay backdrop click
dom.cartOverlay.addEventListener('click', (e) => {
  if (e.target === dom.cartOverlay) closeCart();
});

// Close on Escape key (AC-12)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !dom.cartOverlay.hasAttribute('hidden')) {
    closeCart();
  }
});

/* ============================================================
   CHECKOUT  (FR-08 / US-06)
   ============================================================ */

dom.checkoutBtn.addEventListener('click', () => {
  if (state.cart.length === 0) return;

  const lines = state.cart.map(
    (item) => `${item.qty}× ${PRODUCT.name} (${item.colorName})`
  ).join(', ');

  dom.checkoutNote.textContent =
    `✅ Order placed: ${lines}. Total: ${formatPrice(cartTotalPrice())}`;

  // Clear cart after "checkout"
  setTimeout(() => {
    state.cart = [];
    updateCartBadge();
    renderCartDrawer();
    updateAddToCartAvailability();
    hideConfirmation();
  }, 2500);
});

/* ============================================================
   KEYBOARD: gallery arrow keys when gallery has focus
   ============================================================ */
document.querySelector('.gallery-stage').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  navigateGallery(-1);
  if (e.key === 'ArrowRight') navigateGallery(1);
});

/* ============================================================
   INIT  (AC-13: always start from default state)
   ============================================================ */

function init() {
  const defaultColor = Object.keys(PRODUCT.colors).find(
    (color) => PRODUCT.colors[color].stock > 0
  ) ?? Object.keys(PRODUCT.colors)[0];
  selectColor(defaultColor);

  // Set initial quantity
  updateQuantityDisplay();

  // Cart badge
  updateCartBadge();

  // Ensure confirmation is hidden
  hideConfirmation();

  // Render empty cart drawer
  renderCartDrawer();
}

function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function normalizeProduct(product) {
  if (
    !product ||
    !Number.isSafeInteger(product.id) ||
    typeof product.name !== 'string' ||
    !product.name.trim() ||
    typeof product.subtitle !== 'string' ||
    typeof product.currency !== 'string' ||
    !Number.isFinite(product.price) ||
    product.price <= 0 ||
    !isHttpUrl(product.image) ||
    typeof product.description !== 'string' ||
    !product.description.trim() ||
    !Array.isArray(product.variants?.color) ||
    !Number.isInteger(product.variants.quantity) ||
    product.variants.quantity < 0 ||
    !Array.isArray(product.variants.colorOptions) ||
    product.variants.colorOptions.length === 0
  ) {
    throw new Error('The API returned product data in an unexpected format.');
  }

  for (const variant of product.variants.colorOptions) {
    if (
      typeof variant.name !== 'string' ||
      !variant.name.trim() ||
      !Number.isInteger(variant.stock) ||
      variant.stock < 0 ||
      !Array.isArray(variant.images) ||
      variant.images.length === 0 ||
      variant.images.some(
        (image) => !isHttpUrl(image.url) || typeof image.alt !== 'string'
      )
    ) {
      throw new Error('The API returned invalid product variant data.');
    }
  }

  return {
    name: product.name,
    subtitle: product.subtitle,
    priceUnit: product.price,
    currency: product.currency,
    description: product.description,
    colors: Object.fromEntries(
      product.variants.colorOptions.map((variant) => [
        variant.name.toLowerCase(),
        {
          name: variant.name,
          stock: variant.stock,
          images: variant.images.map((image) => ({
            src: image.url,
            alt: image.alt,
          })),
        },
      ])
    ),
  };
}

function renderProductDetails() {
  dom.productName.textContent = PRODUCT.name;
  dom.productSubtitle.textContent = PRODUCT.subtitle;
  dom.priceAmount.textContent = formatPrice(PRODUCT.priceUnit);
  dom.productPrice.setAttribute(
    'aria-label',
    `Price: ${formatPrice(PRODUCT.priceUnit)}`
  );
  dom.productDescription.textContent = PRODUCT.description;
  dom.breadcrumbProduct.textContent = PRODUCT.name;
  document.title = `${PRODUCT.name} — Master & Dynamic`;

  dom.colorOptions.replaceChildren();
  Object.entries(PRODUCT.colors).forEach(([key, color]) => {
    const button = document.createElement('button');
    button.className = `color-pill${color.stock === 0 ? ' oos' : ''}`;
    button.type = 'button';
    button.dataset.color = key;
    button.dataset.colorName = color.name;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');
    button.setAttribute(
      'aria-label',
      color.stock === 0
        ? `${color.name} — out of stock, view images only`
        : `${color.name} — ${color.stock} in stock`
    );

    const swatch = document.createElement('span');
    swatch.className = 'pill-swatch';
    swatch.dataset.color = key;
    swatch.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'pill-name';
    name.textContent = color.name;
    button.append(swatch, name);

    if (color.stock === 0) {
      const soldOut = document.createElement('span');
      soldOut.className = 'pill-oos-tag';
      soldOut.textContent = 'Sold Out';
      button.append(soldOut);
    }

    dom.colorOptions.append(button);
  });

  dom.page.hidden = false;
  dom.page.setAttribute('aria-busy', 'false');
}

async function loadProduct() {
  dom.pageStatus.hidden = false;
  dom.pageStatus.textContent = 'Loading product details…';
  dom.pageError.hidden = true;
  dom.page.hidden = true;

  try {
    const response = await fetch(API_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Product not found. Check the product ID in the API URL.');
      }
      throw new Error(`Product API request failed with status ${response.status}.`);
    }

    PRODUCT = normalizeProduct(await response.json());
    renderProductDetails();
    init();
    dom.pageStatus.hidden = true;
  } catch (error) {
    dom.pageStatus.hidden = true;
    dom.errorMessage.textContent = error instanceof TypeError
      ? 'Cannot connect to the product API. Make sure the backend is running at http://127.0.0.1:3000.'
      : error.message;
    dom.pageError.hidden = false;
  }
}

dom.retryButton.addEventListener('click', loadProduct);
loadProduct();
