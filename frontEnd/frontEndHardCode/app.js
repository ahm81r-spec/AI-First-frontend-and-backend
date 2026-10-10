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

"use strict";

/* ============================================================
   PRODUCT DATA
   ============================================================ */
const PRODUCT = {
  name: "MW75 TUMI",
  priceUnit: 750,
  currency: "$",
  colors: {
    black: {
      name: "Black",
      stock: 10,
      images: [
        {
          src: "https://cdn.shopify.com/s/files/1/0404/1101/files/MW75B_TUMI_800x800_Hero.png?v=1769444695",
          alt: "Floating black TUMI MW75 Active Noise-Cancelling Headphones — hero",
        },
        {
          src: "https://cdn.shopify.com/s/files/1/0404/1101/files/MW75B_TUMI_800x800_Front.png?v=1769444695",
          alt: "Black TUMI MW75 headphones — front view",
        },
        {
          src: "https://cdn.shopify.com/s/files/1/0404/1101/files/MW75B_TUMI_800x800_Engraving.png?v=1769444695",
          alt: "Black TUMI MW75 — TUMI engraving detail",
        },
        {
          src: "https://cdn.shopify.com/s/files/1/0404/1101/files/MW75B_TUMI_800x800_Straight_8b6fd9c0-e214-42cd-b617-eac997922263.png?v=1769444695",
          alt: "Black TUMI MW75 — straight on view",
        },
      ],
    },
    silver: {
      name: "Silver",
      stock: 0,
      images: [
        {
          src: "https://cdn.shopify.com/s/files/1/0404/1101/files/MW75S_TUMI_800x800_Hero.png?v=1769444695",
          alt: "Floating silver TUMI MW75 Active Noise-Cancelling Headphones — hero",
        },
        {
          src: "https://cdn.shopify.com/s/files/1/0404/1101/files/MW75S_TUMI_800x800_Front.png?v=1769444695",
          alt: "Silver TUMI MW75 headphones — front view",
        },
        {
          src: "https://cdn.shopify.com/s/files/1/0404/1101/files/MW75S_TUMI_800x800_Engraving.png?v=1769444695",
          alt: "Silver TUMI MW75 — TUMI engraving detail",
        },
        {
          src: "https://cdn.shopify.com/s/files/1/0404/1101/files/MW75S_TUMI_800x800_Straight_f01c8c31-58db-4162-a823-25764eae06d7.png?v=1769444571",
          alt: "Silver TUMI MW75 — straight on view",
        },
      ],
    },
  },
};

/* Emoji placeholders — kept as last-resort fallback only */
const COLOR_EMOJI = { black: "🎧", silver: "🎧" };

/* ============================================================
   STATE  (AC-13: resets on every page load — no persistence)
   ============================================================ */
const state = {
  selectedColor: "black", // initial condition per PRD §4
  currentImageIndex: 0,
  quantity: 1,
  cart: [], // { color, qty, unitPrice }
};

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const dom = {
  mainImage: document.getElementById("mainImage"),
  thumbsContainer: document.getElementById("thumbsContainer"),
  galleryPrev: document.getElementById("galleryPrev"),
  galleryNext: document.getElementById("galleryNext"),
  imgCurrent: document.getElementById("imgCurrent"),
  imgTotal: document.getElementById("imgTotal"),
  gDots: document.getElementById("gDots"),

  colorSwatches: document.querySelectorAll(".color-pill"),

  selectedColorLabel: document.getElementById("selectedColorLabel"),

  qtyMinus: document.getElementById("qtyMinus"),
  qtyPlus: document.getElementById("qtyPlus"),
  qtyDisplay: document.getElementById("qtyDisplay"),
  qtyLimitNote: document.getElementById("qtyLimitNote"),

  addToCartBtn: document.getElementById("addToCartBtn"),
  confirmationMsg: document.getElementById("confirmationMsg"),

  cartBtn: document.getElementById("cartBtn"),
  cartCount: document.getElementById("cartCount"),
  cartOverlay: document.getElementById("cartOverlay"),
  cartCloseBtn: document.getElementById("cartCloseBtn"),
  cartItemsList: document.getElementById("cartItemsList"),
  cartFooter: document.getElementById("cartFooter"),
  drawerSubtotal: document.getElementById("drawerSubtotal"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  checkoutNote: document.getElementById("checkoutNote"),
};

/* ============================================================
   HELPERS
   ============================================================ */

/** Format a number as a currency string */
function formatPrice(amount) {
  return PRODUCT.currency + amount.toFixed(2);
}

/** Check whether an image URL loads (kept for safety) */
function imageExists(src, cb) {
  const img = new Image();
  img.onload = () => cb(true);
  img.onerror = () => cb(false);
  img.src = src;
}

/**
 * Set the main gallery image with a fade transition.
 */
function setMainImage(colorKey, index) {
  const imgData = PRODUCT.colors[colorKey].images[index];

  dom.mainImage.classList.add("fade-out");
  setTimeout(() => {
    dom.mainImage.src = imgData.src;
    dom.mainImage.alt = imgData.alt;
    dom.mainImage.classList.remove("fade-out");
  }, 180);
}

/** Build thumbnail buttons for the current color */
function buildThumbnails(colorKey) {
  const colorData = PRODUCT.colors[colorKey];
  dom.thumbsContainer.innerHTML = "";

  // Rebuild mobile dots too
  if (dom.gDots) {
    dom.gDots.innerHTML = "";
    colorData.images.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "g-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-hidden", "true");
      dom.gDots.appendChild(dot);
    });
  }

  colorData.images.forEach((imgData, i) => {
    const btn = document.createElement("button");
    btn.className =
      "thumb-btn" + (i === state.currentImageIndex ? " active" : "");
    btn.setAttribute("aria-label", `View image ${i + 1}: ${imgData.alt}`);
    btn.setAttribute(
      "aria-pressed",
      i === state.currentImageIndex ? "true" : "false",
    );
    btn.dataset.index = i;

    const img = document.createElement("img");
    img.src = imgData.src;
    img.alt = imgData.alt;
    img.loading = "lazy";
    btn.appendChild(img);

    btn.addEventListener("click", () => selectImage(i));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectImage(i);
      }
    });

    dom.thumbsContainer.appendChild(btn);
  });
}

/** Update the active thumbnail highlight */
function updateThumbnailHighlight(index) {
  const thumbs = dom.thumbsContainer.querySelectorAll(".thumb-btn");
  thumbs.forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
    btn.setAttribute("aria-pressed", i === index ? "true" : "false");
  });
}

/** Update gallery arrow disabled states and counter */
function updateGalleryControls() {
  const total = PRODUCT.colors[state.selectedColor].images.length;
  dom.galleryPrev.disabled = state.currentImageIndex === 0;
  dom.galleryNext.disabled = state.currentImageIndex === total - 1;

  // Counter (may be null if element removed from HTML)
  if (dom.imgCurrent) dom.imgCurrent.textContent = state.currentImageIndex + 1;
  if (dom.imgTotal) dom.imgTotal.textContent = total;

  // Mobile dots
  if (dom.gDots) {
    dom.gDots.querySelectorAll(".g-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === state.currentImageIndex);
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
  const next = state.currentImageIndex + direction;
  if (next >= 0 && next < total) selectImage(next);
}

dom.galleryPrev.addEventListener("click", () => navigateGallery(-1));
dom.galleryNext.addEventListener("click", () => navigateGallery(1));

/* ============================================================
   COLOR SELECTION  (FR-04, FR-05)
   ============================================================ */

function selectColor(colorKey) {
  if (!PRODUCT.colors[colorKey]) return; // guard: warna tidak dikenal

  state.selectedColor = colorKey;
  state.currentImageIndex = 0;
  state.quantity = 1;

  const isOutOfStock = PRODUCT.colors[colorKey].stock === 0;

  // Update swatch UI
  dom.colorSwatches.forEach((btn) => {
    const isActive = btn.dataset.color === colorKey;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    btn.setAttribute("aria-checked", isActive ? "true" : "false");
  });

  // Update label (tambahkan penanda jika OOS)
  dom.selectedColorLabel.textContent =
    PRODUCT.colors[colorKey].name + (isOutOfStock ? " (Out of stock)" : "");

  // Update gallery (FR-05)
  buildThumbnails(colorKey);
  setMainImage(colorKey, 0);
  updateGalleryControls();

  // Nonaktifkan Add to Cart jika stok habis
  dom.addToCartBtn.disabled = isOutOfStock;
  dom.addToCartBtn.textContent = isOutOfStock ? "Sold Out" : "Add to Cart";
  dom.addToCartBtn.setAttribute(
    "aria-label",
    isOutOfStock ? "Silver is sold out" : "Add MW75 TUMI to cart",
  );

  // Reset quantity UI
  updateQuantityDisplay();

  // Clear old confirmation (per PRD interaction rule)
  hideConfirmation();
}

dom.colorSwatches.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectColor(btn.dataset.color);
  });
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectColor(btn.dataset.color);
    }
  });
});

/* ============================================================
   QUANTITY  (FR-08, Success Criteria §4: range 1–10)
   ============================================================ */

const MAX_QTY = 10;

function updateQuantityDisplay() {
  const qty = state.quantity;
  dom.qtyDisplay.textContent = qty;

  dom.qtyMinus.disabled = qty <= 1;
  dom.qtyPlus.disabled = qty >= MAX_QTY;

  // Limit note
  if (qty >= MAX_QTY) {
    dom.qtyLimitNote.textContent = `Maximum quantity is ${MAX_QTY}.`;
  } else if (qty <= 1) {
    dom.qtyLimitNote.textContent = "";
  } else {
    dom.qtyLimitNote.textContent = "";
  }
}

dom.qtyMinus.addEventListener("click", () => {
  if (state.quantity > 1) {
    state.quantity--;
    updateQuantityDisplay();
    hideConfirmation();
  }
});

dom.qtyPlus.addEventListener("click", () => {
  if (state.quantity < MAX_QTY) {
    state.quantity++;
    updateQuantityDisplay();
    hideConfirmation();
  }
});

/* ============================================================
   CONFIRMATION MESSAGE
   ============================================================ */

function showConfirmation(message) {
  dom.confirmationMsg.textContent = "✅ " + message;
  dom.confirmationMsg.removeAttribute("hidden");
}

function hideConfirmation() {
  dom.confirmationMsg.setAttribute("hidden", "");
  dom.confirmationMsg.textContent = "";
}

/* ============================================================
   CART  (FR-08)
   ============================================================ */

/** Add / merge item into cart array */
function addToCart() {
  const colorKey = state.selectedColor;
  const colorName = PRODUCT.colors[colorKey].name;
  const qty = state.quantity;

  // Find existing entry for this color
  const existing = state.cart.find((item) => item.color === colorKey);
  if (existing) {
    const newQty = Math.min(existing.qty + qty, MAX_QTY);
    existing.qty = newQty;
  } else {
    state.cart.push({
      color: colorKey,
      colorName: colorName,
      qty: qty,
      unitPrice: PRODUCT.priceUnit,
    });
  }

  updateCartBadge();
  renderCartDrawer();

  const total = formatPrice(qty * PRODUCT.priceUnit);
  showConfirmation(`${qty}× ${PRODUCT.name} (${colorName}) added — ${total}`);
}

dom.addToCartBtn.addEventListener("click", addToCart);

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
  dom.cartCount.dataset.empty = total === 0 ? "true" : "false";
}

/** Re-render the cart drawer contents */
function renderCartDrawer() {
  if (state.cart.length === 0) {
    dom.cartItemsList.innerHTML =
      '<p class="cart-empty">Your cart is empty.</p>';
    dom.cartFooter.setAttribute("hidden", "");
    return;
  }

  dom.cartFooter.removeAttribute("hidden");
  dom.cartItemsList.innerHTML = "";

  state.cart.forEach((item) => {
    const colorData = PRODUCT.colors[item.color];

    const el = document.createElement("div");
    el.className = "cart-item";
    el.setAttribute("role", "listitem");

    // Cart item image
    const imgWrapper = document.createElement("div");
    const img = document.createElement("img");
    img.src = colorData.images[0].src;
    img.alt = `${PRODUCT.name} ${item.colorName}`;
    img.className = "cart-item-img";
    imgWrapper.appendChild(img);

    const info = document.createElement("div");
    info.className = "cart-item-info";
    info.innerHTML = `
      <div class="cart-item-name">${PRODUCT.name}</div>
      <div class="cart-item-meta">Color: ${item.colorName}</div>
      <div class="cart-item-row">
        <div class="cart-item-qty" role="group" aria-label="Quantity for ${item.colorName}">
          <button class="cart-item-qty-btn" data-action="minus" data-color="${item.color}" aria-label="Decrease quantity">−</button>
          <span class="cart-item-qty-num" aria-live="polite">${item.qty}</span>
          <button class="cart-item-qty-btn" data-action="plus"  data-color="${item.color}" aria-label="Increase quantity">+</button>
        </div>
        <span class="cart-item-price">${formatPrice(item.qty * item.unitPrice)}</span>
      </div>
      <button class="cart-item-remove" data-color="${item.color}" aria-label="Remove ${item.colorName} from cart">Remove</button>
    `;

    el.appendChild(imgWrapper);
    el.appendChild(info);
    dom.cartItemsList.appendChild(el);
  });

  // Wire up quantity buttons inside cart
  dom.cartItemsList.querySelectorAll(".cart-item-qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      const action = btn.dataset.action;
      const item = state.cart.find((i) => i.color === color);
      if (!item) return;

      if (action === "plus" && item.qty < MAX_QTY) item.qty++;
      if (action === "minus" && item.qty > 1) item.qty--;

      updateCartBadge();
      renderCartDrawer();
    });
  });

  // Wire up remove buttons
  dom.cartItemsList.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      state.cart = state.cart.filter((i) => i.color !== color);
      updateCartBadge();
      renderCartDrawer();
    });
  });

  // Update subtotal
  dom.drawerSubtotal.textContent = formatPrice(cartTotalPrice());

  // Reset checkout note when cart is re-rendered
  dom.checkoutNote.textContent = "";
}

/* ============================================================
   CART DRAWER — open / close
   ============================================================ */

function openCart() {
  dom.cartOverlay.removeAttribute("hidden");
  // Trigger CSS animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => dom.cartOverlay.classList.add("open"));
  });
  // Move focus into drawer for accessibility
  dom.cartCloseBtn.focus();
  // Trap scroll on body
  document.body.style.overflow = "hidden";
}

function closeCart() {
  dom.cartOverlay.classList.remove("open");
  dom.cartOverlay.addEventListener(
    "transitionend",
    () => {
      dom.cartOverlay.setAttribute("hidden", "");
    },
    { once: true },
  );
  document.body.style.overflow = "";
  dom.cartBtn.focus();
}

dom.cartBtn.addEventListener("click", openCart);
dom.cartCloseBtn.addEventListener("click", closeCart);

// Close on overlay backdrop click
dom.cartOverlay.addEventListener("click", (e) => {
  if (e.target === dom.cartOverlay) closeCart();
});

// Close on Escape key (AC-12)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !dom.cartOverlay.hasAttribute("hidden")) {
    closeCart();
  }
});

/* ============================================================
   CHECKOUT  (FR-08 / US-06)
   ============================================================ */

dom.checkoutBtn.addEventListener("click", () => {
  if (state.cart.length === 0) return;

  const lines = state.cart
    .map((item) => `${item.qty}× ${PRODUCT.name} (${item.colorName})`)
    .join(", ");

  dom.checkoutNote.textContent = `✅ Order placed: ${lines}. Total: ${formatPrice(cartTotalPrice())}`;

  // Clear cart after "checkout"
  setTimeout(() => {
    state.cart = [];
    updateCartBadge();
    renderCartDrawer();
    hideConfirmation();
  }, 2500);
});

/* ============================================================
   KEYBOARD: gallery arrow keys when gallery has focus
   ============================================================ */
document.querySelector(".gallery-main").addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") navigateGallery(-1);
  if (e.key === "ArrowRight") navigateGallery(1);
});

/* ============================================================
   INIT  (AC-13: always start from default state)
   ============================================================ */

function init() {
  // Set initial color (Black)
  selectColor("black");

  // Set initial quantity
  updateQuantityDisplay();

  // Cart badge
  updateCartBadge();

  // Ensure confirmation is hidden
  hideConfirmation();

  // Render empty cart drawer
  renderCartDrawer();
}

init();
