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

const applyMenuFilter = (filter) => {
  menuTabs.forEach((tab) => {
    const isActive = tab.dataset.menuFilter === filter;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  menuPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.menuCategory === filter);
  });
};

menuTabs.forEach((tab) => {
  tab.setAttribute("aria-pressed", String(tab.classList.contains("active")));
  tab.addEventListener("click", () => applyMenuFilter(tab.dataset.menuFilter));
});

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
