"use strict";

const AGE_STORAGE_KEY = "videosViralesHN_ageVerified";
const ageGate = document.getElementById("age-gate");
const confirmAgeButton = document.getElementById("confirm-age");
const leaveSiteButton = document.getElementById("leave-site");
const topbar = document.querySelector(".topbar");
const toast = document.getElementById("toast");
const currentYear = document.getElementById("current-year");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function storageAvailable() {
  try {
    const key = "__storage_test__";
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const canStore = storageAvailable();

function unlockSite({ save = true } = {}) {
  document.body.classList.remove("age-locked");
  ageGate.classList.add("is-hidden");
  ageGate.setAttribute("aria-hidden", "true");

  if (save && canStore) {
    localStorage.setItem(AGE_STORAGE_KEY, "true");
  }

  window.setTimeout(() => {
    ageGate.style.display = "none";
  }, 480);
}

function lockSite() {
  document.body.classList.add("age-locked");
  ageGate.style.display = "grid";
  ageGate.classList.remove("is-hidden");
  ageGate.removeAttribute("aria-hidden");
  window.setTimeout(() => confirmAgeButton.focus(), 120);
}

function initializeAgeGate() {
  const verified = canStore && localStorage.getItem(AGE_STORAGE_KEY) === "true";
  verified ? unlockSite({ save: false }) : lockSite();
}

confirmAgeButton.addEventListener("click", () => unlockSite());

leaveSiteButton.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
    window.setTimeout(() => {
      window.location.replace("https://x.com/");
    }, 600);
  } else {
    window.location.replace("https://x.com/");
  }
});

ageGate.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    leaveSiteButton.focus();
  }

  if (event.key !== "Tab") return;

  const focusable = [confirmAgeButton, leaveSiteButton];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function updateTopbar() {
  topbar.classList.toggle("is-scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateTopbar, { passive: true });
updateTopbar();

function initializeRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" }
  );

  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
    observer.observe(element);
  });
}

function initializeCardGlow() {
  document.querySelectorAll(".channel-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--x", `${x}%`);
      card.style.setProperty("--y", `${y}%`);
    });
  });
}

let toastTimer;
function showToast() {
  clearTimeout(toastTimer);
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1900);
}

document.querySelectorAll("[data-telegram-link]").forEach((link) => {
  link.addEventListener("click", showToast);
});

function initializeCyberCanvas() {
  if (reduceMotion) return;

  const canvas = document.getElementById("cyber-canvas");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  let width = 0;
  let height = 0;
  let ratio = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let animationFrame = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(22, Math.min(58, Math.floor(width / 26)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      radius: Math.random() * 1.4 + 0.5
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;

      context.beginPath();
      context.fillStyle = "rgba(83, 224, 255, 0.48)";
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();

      for (let secondIndex = index + 1; secondIndex < particles.length; secondIndex += 1) {
        const second = particles[secondIndex];
        const dx = particle.x - second.x;
        const dy = particle.y - second.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 125) {
          context.beginPath();
          context.strokeStyle = `rgba(62, 184, 255, ${(1 - distance / 125) * 0.13})`;
          context.lineWidth = 0.7;
          context.moveTo(particle.x, particle.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }
    }

    animationFrame = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
    } else {
      draw();
    }
  });

  resize();
  draw();
}

currentYear.textContent = new Date().getFullYear();
initializeAgeGate();
initializeRevealAnimations();
initializeCardGlow();
initializeCyberCanvas();
