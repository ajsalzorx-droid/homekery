const header = document.querySelector("#header");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("#nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const revealItems = document.querySelectorAll(".reveal");
const orderForm = document.querySelector("#order-form");
const filterChips = document.querySelectorAll(".filter-chip");
const categoryLinks = document.querySelectorAll(".category-strip a[data-filter]");
const productCards = document.querySelectorAll(".product-card");
const resultCount = document.querySelector("#result-count");
const menuTabs = document.querySelectorAll(".menu-tab");
const menuPanels = document.querySelectorAll(".menu-panel");
const menuSearchInput = document.querySelector("#menu-search-input");
const menuSearchClear = document.querySelector(".menu-search-clear");
const menuSearchSubmit = document.querySelector(".menu-search-submit");
const menuSearchStatus = document.querySelector("#menu-search-status");
const menuSearchResults = document.querySelector("#menu-search-results");
const menuRows = document.querySelectorAll(".menu-row");
const menuTableWrap = document.querySelector(".menu-table-wrap");
const headerSearchInput = document.querySelector("#header-search-input");
const headerSearchResults = document.querySelector("#header-search-results");
const voiceButtons = document.querySelectorAll(".voice-search-btn");
const cartToggle = document.querySelector(".cart-toggle");
const cartPanel = document.querySelector("#cart-panel");
const cartCount = document.querySelector("#cart-count");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartOrder = document.querySelector("#cart-order");
const cartClear = document.querySelector(".cart-clear");
const cartClose = document.querySelector(".cart-close");
const whatsAppNumber = "918078747875";
const cartStorageKey = "homekeryCart";

const setHeaderState = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState);

menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("active");
  menuToggle.classList.toggle("active", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const productLabel = (count) => `${count} item${count === 1 ? "" : "s"}`;

const applyProductFilter = (filter) => {
  let visibleCount = 0;

  filterChips.forEach((item) => {
    const isActive = item.dataset.filter === filter;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  categoryLinks.forEach((item) => {
    item.classList.toggle("active", item.dataset.filter === filter);
  });

  productCards.forEach((card) => {
    const shouldShow = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("hidden", !shouldShow);
    if (shouldShow) visibleCount += 1;
  });

  if (resultCount) {
    resultCount.textContent = filter === "all"
      ? `Showing all ${productLabel(visibleCount)}`
      : `Showing ${productLabel(visibleCount)}`;
  }
};

filterChips.forEach((chip) => {
  chip.setAttribute("aria-pressed", String(chip.classList.contains("active")));
  chip.addEventListener("click", () => applyProductFilter(chip.dataset.filter));
});

categoryLinks.forEach((link) => {
  link.addEventListener("click", () => applyProductFilter(link.dataset.filter));
});

applyProductFilter("all");

const getStoredCart = () => {
  try {
    return JSON.parse(localStorage.getItem(cartStorageKey)) || [];
  } catch {
    return [];
  }
};

let cart = getStoredCart();

const saveCart = () => {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
};

const renderCart = () => {
  cartCount.textContent = String(cart.length);
  cartEmpty.style.display = cart.length ? "none" : "block";
  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-line">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.price || "Custom quote")}</span>
      </div>
      <button class="cart-remove" type="button" data-cart-index="${index}">Remove</button>
    </div>
  `).join("");

  const message = cart.length
    ? [
      "Hi Homekery, I want to order:",
      ...cart.map((item, index) => `${index + 1}. ${item.name} - ${item.price || "Custom quote"}`),
      "",
      "Please confirm availability and delivery."
    ].join("\n")
    : "Hi Homekery, I want to order a cake";

  cartOrder.href = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
};

const addToCart = (name, price = "") => {
  cart.push({ name, price });
  saveCart();
  renderCart();
  cartPanel.classList.add("active");
  cartPanel.setAttribute("aria-hidden", "false");
  cartToggle.setAttribute("aria-expanded", "true");
};

const addCartButtonsToProducts = () => {
  productCards.forEach((card) => {
    const priceRow = card.querySelector(".price-row");
    const name = card.querySelector("h3")?.textContent.trim();
    const price = card.querySelector(".price-row strong")?.textContent.trim().replace(/\s+/g, " ");
    if (!priceRow || !name || priceRow.querySelector(".cart-add")) return;

    const button = document.createElement("button");
    button.className = "cart-add";
    button.type = "button";
    button.textContent = "Add";
    button.addEventListener("click", () => addToCart(name, price));
    priceRow.insertBefore(button, priceRow.querySelector("a"));
  });
};

addCartButtonsToProducts();

let activeMenuFilter = "cake-flavors";
let headerSearchScrolled = false;

const applyMenuFilter = (filter) => {
  activeMenuFilter = filter;

  menuTabs.forEach((tab) => {
    const isActive = tab.dataset.menuFilter === filter;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  menuRows.forEach((row) => row.classList.remove("hidden"));
  menuPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.menuCategory === filter);
  });

  if (menuSearchInput) {
    menuSearchInput.value = "";
    menuSearchStatus.textContent = "";
  }
};

menuTabs.forEach((tab) => {
  tab.setAttribute("aria-pressed", String(tab.classList.contains("active")));
  tab.addEventListener("click", () => applyMenuFilter(tab.dataset.menuFilter));
});

const applyMenuSearch = () => {
  const query = menuSearchInput.value.trim().toLowerCase();

  if (!query) {
    menuTableWrap.classList.remove("searching");
    menuSearchResults.classList.remove("active");
    menuSearchResults.innerHTML = "";
    menuRows.forEach((row) => row.classList.remove("hidden"));
    menuPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.menuCategory === activeMenuFilter);
    });
    menuTabs.forEach((tab) => {
      const isActive = tab.dataset.menuFilter === activeMenuFilter;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
    menuSearchStatus.textContent = "";
    return;
  }

  let matchCount = 0;
  const matchedRows = [];
  menuTableWrap.classList.add("searching");

  menuTabs.forEach((tab) => {
    tab.classList.remove("active");
    tab.setAttribute("aria-pressed", "false");
  });

  menuRows.forEach((row) => {
    const matches = row.textContent.toLowerCase().includes(query);
    row.classList.toggle("hidden", !matches);
    if (matches) {
      matchCount += 1;
      matchedRows.push(row);
    }
  });

  menuPanels.forEach((panel) => {
    const hasVisibleRows = panel.querySelectorAll(".menu-row:not(.hidden)").length > 0;
    panel.classList.toggle("active", hasVisibleRows);
  });

  menuSearchStatus.textContent = matchCount
    ? `Showing ${matchCount} matching item${matchCount === 1 ? "" : "s"}`
    : "No menu items found. Try another search.";

  if (matchCount) {
    menuSearchResults.innerHTML = matchedRows.slice(0, 12).map((row) => {
      const panel = row.closest(".menu-panel");
      const category = panel?.querySelector(".menu-panel-head h3")?.textContent.trim() || "Menu";
      const name = getRowLabel(row);
      const price = row.querySelector("strong")?.innerHTML || "";
      return `
        <article class="menu-result-card">
          <div>
            <h3>${escapeHtml(name)}</h3>
            <p>${escapeHtml(category)}</p>
          </div>
          <strong>${price}</strong>
          <button class="cart-add" type="button" data-cart-name="${escapeHtml(name)}" data-cart-price="${escapeHtml(getRowPrice(row))}">Add</button>
        </article>
      `;
    }).join("");
    menuSearchResults.classList.add("active");
  } else {
    menuSearchResults.innerHTML = "";
    menuSearchResults.classList.remove("active");
  }
};

if (menuSearchInput) {
  menuSearchInput.addEventListener("input", applyMenuSearch);
  menuSearchSubmit?.addEventListener("click", () => {
    applyMenuSearch();
    menuSearchInput.focus();
  });
  menuSearchClear.addEventListener("click", () => {
    menuSearchInput.value = "";
    applyMenuSearch();
    menuSearchInput.focus();
  });
}

const getRowLabel = (row) => row.querySelector("span")?.childNodes[0]?.textContent.trim() || "";
const getRowPrice = (row) => row.querySelector("strong")?.textContent.trim().replace(/\s+/g, " ") || "";

const productSearchData = Array.from(menuRows).map((row) => {
  const panel = row.closest(".menu-panel");
  const categoryTitle = panel?.querySelector(".menu-panel-head h3")?.textContent.trim() || "Menu";
  return {
    row,
    category: panel?.dataset.menuCategory || "cake-flavors",
    categoryTitle,
    name: getRowLabel(row),
    price: getRowPrice(row)
  };
}).filter((item) => item.name);

const cardSearchData = Array.from(productCards).map((card) => ({
  name: card.querySelector("h3")?.textContent.trim() || "",
  categoryTitle: card.querySelector(".crumb")?.textContent.trim() || "Products",
  price: card.querySelector(".price-row strong")?.textContent.trim().replace(/\s+/g, " ") || "",
  image: card.querySelector(".product-image img")?.src || "",
  target: "#cakes"
})).filter((item) => item.name);

const collectionSearchData = [
  { name: "Cake Flavors", target: "cake-flavors", image: "assets/pink-cream-berry.jpg" },
  { name: "Cheese Cake", target: "cheese-cake", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=300&q=80" },
  { name: "Mousse Cake", target: "mousse-cake", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80" },
  { name: "Brownies & Cookies", target: "brownies-cookies", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&q=80" },
  { name: "Puddings", target: "puddings", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80" },
  { name: "Tea Cakes", target: "tea-cakes", image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=300&q=80" }
];

const pageSearchData = [
  { name: "About Homekery", target: "#about" },
  { name: "Cake Menu & Price List", target: "#menu" },
  { name: "Gallery", target: "#gallery" },
  { name: "Reviews", target: "#reviews" },
  { name: "Contact / Order", target: "#contact" }
];

const articleSearchData = [
  {
    name: "How to order a custom cake",
    categoryTitle: "Ordering Guide",
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=300&q=80",
    target: "#contact"
  }
];

const closeHeaderSearch = () => {
  headerSearchResults.classList.remove("active");
  headerSearchResults.innerHTML = "";
};

const selectHeaderSearchResult = (item) => {
  applyMenuFilter(item.category);
  menuSearchInput.value = item.name;
  applyMenuSearch();
  document.querySelector("#menu").scrollIntoView({ behavior: "smooth", block: "start" });
  headerSearchInput.value = "";
  closeHeaderSearch();
};

const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

const simpleMatch = (value, query) => value.toLowerCase().includes(query);

const goToPage = (target) => {
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  headerSearchInput.value = "";
  closeHeaderSearch();
};

const selectCollection = (collection) => {
  applyMenuFilter(collection.target);
  document.querySelector("#menu").scrollIntoView({ behavior: "smooth", block: "start" });
  headerSearchInput.value = "";
  closeHeaderSearch();
};

const renderResultCard = (item, options = {}) => `
  <button class="search-result-card" type="button" data-result-type="${options.type || "product"}" data-result-index="${options.index}">
    <img src="${escapeHtml(item.image || "assets/pink-cream-berry.jpg")}" alt="">
    <span>
      <span class="result-eyebrow">${escapeHtml(item.categoryTitle || options.eyebrow || "Products")}</span>
      <span class="result-name">${escapeHtml(item.name)}</span>
      ${item.price ? `<span class="result-price">${escapeHtml(item.price)}</span>` : ""}
    </span>
  </button>
`;

cartToggle.addEventListener("click", () => {
  const isOpen = cartPanel.classList.toggle("active");
  cartPanel.setAttribute("aria-hidden", String(!isOpen));
  cartToggle.setAttribute("aria-expanded", String(isOpen));
});

cartClose.addEventListener("click", () => {
  cartPanel.classList.remove("active");
  cartPanel.setAttribute("aria-hidden", "true");
  cartToggle.setAttribute("aria-expanded", "false");
});

cartClear.addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
});

cartItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".cart-remove");
  if (!removeButton) return;
  cart.splice(Number(removeButton.dataset.cartIndex), 1);
  saveCart();
  renderCart();
});

menuSearchResults.addEventListener("click", (event) => {
  const addButton = event.target.closest(".cart-add");
  if (!addButton) return;
  addToCart(addButton.dataset.cartName, addButton.dataset.cartPrice);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".cart-shell") && cartPanel.classList.contains("active")) {
    cartPanel.classList.remove("active");
    cartPanel.setAttribute("aria-hidden", "true");
    cartToggle.setAttribute("aria-expanded", "false");
  }
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

voiceButtons.forEach((button) => {
  if (!SpeechRecognition) {
    button.disabled = true;
    button.title = "Voice search is not supported in this browser";
    return;
  }

  button.addEventListener("click", () => {
    const input = document.querySelector(`#${button.dataset.voiceTarget}`);
    if (!input) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    button.classList.add("listening");
    button.setAttribute("aria-label", "Listening for voice search");
    recognition.start();

    recognition.addEventListener("result", (event) => {
      input.value = event.results[0][0].transcript;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    recognition.addEventListener("end", () => {
      button.classList.remove("listening");
      button.setAttribute("aria-label", button.classList.contains("menu-voice") ? "Search menu by voice" : "Search by voice");
    });

    recognition.addEventListener("error", () => {
      button.classList.remove("listening");
      button.setAttribute("aria-label", button.classList.contains("menu-voice") ? "Search menu by voice" : "Search by voice");
    });
  });
});

renderCart();

const renderHeaderSearch = () => {
  const query = headerSearchInput.value.trim().toLowerCase();
  const rawQuery = headerSearchInput.value.trim();

  if (menuSearchInput) {
    menuSearchInput.value = rawQuery;
    applyMenuSearch();
  }

  if (!query) {
    headerSearchScrolled = false;
    closeHeaderSearch();
    return;
  }

  if (!headerSearchScrolled) {
    document.querySelector("#menu").scrollIntoView({ behavior: "smooth", block: "start" });
    headerSearchScrolled = true;
  }

  const menuMatches = productSearchData.filter((item) => simpleMatch(item.name, query));
  const productMatches = cardSearchData.filter((item) => simpleMatch(item.name, query));
  const collections = collectionSearchData.filter((item) => simpleMatch(item.name, query));
  const pages = pageSearchData.filter((item) => simpleMatch(item.name, query));
  const articles = articleSearchData.filter((item) => simpleMatch(item.name, query));
  const suggestions = [...new Set([
    ...menuMatches.map((item) => item.name),
    ...productMatches.map((item) => item.name),
    query
  ])].slice(0, 4);
  const products = [...productMatches, ...menuMatches].slice(0, 3);

  headerSearchResults.innerHTML = "";

  if (!products.length && !collections.length && !pages.length && !articles.length) {
    headerSearchResults.innerHTML = '<div class="header-search-empty">No products found</div>';
    headerSearchResults.classList.add("active");
    return;
  }

  headerSearchResults.innerHTML = `
    <div class="search-panel-side">
      <div class="search-panel-block">
        <h3 class="search-panel-title">Suggestions</h3>
        ${suggestions.map((item) => `<button class="search-suggestion" type="button" data-suggestion="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
      </div>
      <div class="search-panel-block">
        <h3 class="search-panel-title">Pages</h3>
        ${(pages.length ? pages : pageSearchData.slice(0, 2)).map((item) => `<button class="search-page-link" type="button" data-page-target="${item.target}">${escapeHtml(item.name)}</button>`).join("")}
      </div>
    </div>
    <div class="search-panel-main">
      <div class="search-result-section">
        <h3 class="search-panel-title">Products</h3>
        ${products.length ? products.map((item, index) => renderResultCard(item, { type: item.row ? "menu" : "card", index })).join("") : '<div class="header-search-empty">No matching products</div>'}
      </div>
      <div class="search-result-section">
        <h3 class="search-panel-title">Collections</h3>
        ${(collections.length ? collections : collectionSearchData.slice(0, 1)).map((item, index) => renderResultCard(item, { type: "collection", index, eyebrow: "Collection" })).join("")}
      </div>
      <div class="search-result-section">
        <h3 class="search-panel-title">Articles</h3>
        ${(articles.length ? articles : articleSearchData).map((item, index) => renderResultCard(item, { type: "article", index })).join("")}
      </div>
    </div>
  `;

  headerSearchResults.querySelectorAll(".search-suggestion").forEach((button) => {
    button.addEventListener("click", () => {
      headerSearchInput.value = button.dataset.suggestion;
      renderHeaderSearch();
    });
  });

  headerSearchResults.querySelectorAll(".search-page-link").forEach((button) => {
    button.addEventListener("click", () => goToPage(button.dataset.pageTarget));
  });

  headerSearchResults.querySelectorAll(".search-result-card").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.resultIndex);
      const type = button.dataset.resultType;
      if (type === "menu") selectHeaderSearchResult(products[index]);
      if (type === "card") goToPage("#cakes");
      if (type === "collection") selectCollection((collections.length ? collections : collectionSearchData)[index]);
      if (type === "article") goToPage((articles.length ? articles : articleSearchData)[index].target);
    });
  });

  headerSearchResults.classList.add("active");
};

if (headerSearchInput) {
  headerSearchInput.addEventListener("input", renderHeaderSearch);
  headerSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const firstMatch = productSearchData.find((item) =>
        item.name.toLowerCase().includes(headerSearchInput.value.trim().toLowerCase())
      );
      if (firstMatch) selectHeaderSearchResult(firstMatch);
    }
    if (event.key === "Escape") closeHeaderSearch();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header-search")) closeHeaderSearch();
  });
}

applyMenuFilter("cake-flavors");

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(orderForm);
  const message = [
    "Hello Homekery, I would like to submit a cake inquiry.",
    `Name: ${formData.get("name")}`,
    `Phone: ${formData.get("phone")}`,
    `Event Date: ${formData.get("event-date")}`,
    `Cake Details: ${formData.get("details")}`
  ].join("\n");

  window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  orderForm.reset();
});
