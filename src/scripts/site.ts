// Інтерактив главної: меню, активний пункт, нижня панель, вкладки цін, заповнення шкал.
// Без скриптів весь вміст видно: обидві панелі цін показані одна під одною, шкали заповнені.

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Мобільне меню (popover): закривається після вибору пункту */
const menu = document.getElementById("menu") as (HTMLElement & { hidePopover?: () => void }) | null;
menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.hidePopover?.()));

/* Активний пункт меню за розділом у полі зору */
const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav a[href^='#']"));
const byId = new Map(navLinks.map((a) => [a.hash.slice(1), a]));
if ("IntersectionObserver" in window && navLinks.length) {
  const spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      navLinks.forEach((a) => a.removeAttribute("aria-current"));
      byId.get(e.target.id)?.setAttribute("aria-current", "true");
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
}

/* Нижня панель зв'язку: з'являється, коли перший екран пішов угору */
const bar = document.querySelector<HTMLElement>(".callbar");
const hero = document.getElementById("hero");
if (bar && hero && "IntersectionObserver" in window) {
  bar.classList.add("is-armed");
  new IntersectionObserver(([e]) => {
    bar.classList.toggle("is-shown", !e.isIntersecting && e.boundingClientRect.top < 0);
  }).observe(hero);
}

/* Вкладки цін: role="tablist", стрілки клавіатури, перехід за якорями #prices-stationary / #prices-ambulatory */
const tablist = document.querySelector<HTMLElement>("[role='tablist']");
if (tablist) {
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>("[role='tab']"));
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls") || "")!);
  const select = (i: number, focus = false) => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = false;
      panels[j].classList.toggle("is-active", on);
      panels[j].setAttribute("aria-hidden", String(!on));
      panels[j].toggleAttribute("inert", !on);
    });
    if (focus) tabs[i].focus();
  };
  tablist.closest(".prices")?.classList.add("has-tabs");
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (ev) => {
      const n = tabs.length;
      if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
        ev.preventDefault();
        select((i + (ev.key === "ArrowRight" ? 1 : n - 1)) % n, true);
      } else if (ev.key === "Home") { ev.preventDefault(); select(0, true); }
      else if (ev.key === "End") { ev.preventDefault(); select(n - 1, true); }
    });
  });
  const fromHash = () => {
    const i = panels.findIndex((p) => "#" + p.id === location.hash);
    if (i >= 0) select(i);
  };
  document.querySelectorAll<HTMLAnchorElement>("a[data-tab]").forEach((a) =>
    a.addEventListener("click", () => select(Number(a.dataset.tab))));
  window.addEventListener("hashchange", fromHash);
  select(0);
  fromHash();
}

/* Заповнення шкал при вході в екран */
const fills = document.querySelectorAll<HTMLElement>("[data-fill]");
if (reduce || !("IntersectionObserver" in window)) {
  fills.forEach((el) => el.classList.add("is-filled"));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add("is-filled"); io.unobserve(e.target); }
    }
  }, { threshold: 0.35 });
  fills.forEach((el) => io.observe(el));
}
