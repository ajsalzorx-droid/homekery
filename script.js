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
const menuSearchStatus = document.querySelector("#menu-search-status");
const menuRows = document.querySelectorAll(".menu-row");
const menuTableWrap = document.querySelector(".menu-table-wrap");
const headerSearchInput = document.querySelector("#header-search-input");
const headerSearchResults = document.querySelector("#header-search-results");
const whatsAppNumber = "971500000000";

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
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
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

let activeMenuFilter = "cake-flavors";

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
  menuTableWrap.classList.add("searching");

  menuTabs.forEach((tab) => {
    tab.classList.remove("active");
    tab.setAttribute("aria-pressed", "false");
  });

  menuRows.forEach((row) => {
    const matches = row.textContent.toLowerCase().includes(query);
    row.classList.toggle("hidden", !matches);
    if (matches) matchCount += 1;
  });

  menuPanels.forEach((panel) => {
    const hasVisibleRows = panel.querySelectorAll(".menu-row:not(.hidden)").length > 0;
    panel.classList.toggle("active", hasVisibleRows);
  });

  menuSearchStatus.textContent = matchCount
    ? `Showing ${matchCount} matching item${matchCount === 1 ? "" : "s"}`
    : "No menu items found. Try another search.";
};

if (menuSearchInput) {
  menuSearchInput.addEventListener("input", applyMenuSearch);
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
  return {
    row,
    category: panel?.dataset.menuCategory || "cake-flavors",
    name: getRowLabel(row),
    price: getRowPrice(row)
  };
}).filter((item) => item.name);

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

const renderHeaderSearch = () => {
  const query = headerSearchInput.value.trim().toLowerCase();

  if (!query) {
    closeHeaderSearch();
    return;
  }

  const matches = productSearchData
    .filter((item) => item.name.toLowerCase().includes(query))
    .slice(0, 7);

  headerSearchResults.innerHTML = "";

  if (!matches.length) {
    headerSearchResults.innerHTML = '<div class="header-search-empty">No products found</div>';
    headerSearchResults.classList.add("active");
    return;
  }

  matches.forEach((item) => {
    const button = document.createElement("button");
    button.className = "header-search-result";
    button.type = "button";
    button.innerHTML = `<span>${item.name}</span><small>${item.price}</small>`;
    button.addEventListener("click", () => selectHeaderSearchResult(item));
    headerSearchResults.append(button);
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
