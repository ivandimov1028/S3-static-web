// SECURITY NOTE:
// No external input handling, no eval, no DOM injection from user data
// Only safe UI animations

// FADE-IN ON SCROLL (IntersectionObserver = safe, performant)
const elements = document.querySelectorAll(".fade-in");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, {
  threshold: 0.1
});

elements.forEach(el => observer.observe(el));


// OPTIONAL: smooth hover table row highlight (light enhancement)
const rows = document.querySelectorAll("tbody tr");

rows.forEach(row => {
  row.addEventListener("mouseenter", () => {
    row.style.backgroundColor = "rgba(255,255,255,0.05)";
  });

  row.addEventListener("mouseleave", () => {
    row.style.backgroundColor = "transparent";
  });
});


// Counter for visitors (fetch from serverless function)
// We cache the last successful count in cookies so repeat visits within a
// short window do not trigger another Lambda request.
const VISITOR_COUNTER_URL = "https://g099cr2o2f.execute-api.us-east-1.amazonaws.com/visit";
const VISITOR_COUNT_COOKIE = "cloud_portfolio_cached_count";
const VISITOR_RECENT_COOKIE = "cloud_portfolio_recent_visit";
const VISITOR_CACHE_SECONDS = 60 * 60 * 24;

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, maxAgeSeconds) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

function readCachedCount() {
  const cachedCount = Number(getCookie(VISITOR_COUNT_COOKIE));
  const recentVisit = Number(getCookie(VISITOR_RECENT_COOKIE));

  if (!Number.isFinite(cachedCount) || !Number.isFinite(recentVisit)) {
    return null;
  }

  const ageInSeconds = Math.floor(Date.now() / 1000) - recentVisit;
  if (ageInSeconds > VISITOR_CACHE_SECONDS) {
    return null;
  }

  return cachedCount;
}

function renderVisitorCount(el, count) {
  el.textContent = `Visitors: ${count.toLocaleString()}`;
}

async function updateVisitorCounter() {
  const el = document.getElementById("visitorCounter");
  if (!el) return;

  const cachedCount = readCachedCount();
  if (cachedCount !== null) {
    renderVisitorCount(el, cachedCount);
    return;
  }

  try {
    const res = await fetch(VISITOR_COUNTER_URL, {
      cache: "no-store" // prevent caching
    });

    if (!res.ok) {
      throw new Error(`Visitor API responded with ${res.status}`);
    }

    const data = await res.json();
    const count = Number(data.count ?? data.visitors ?? data.value ?? data.total);

    if (!Number.isFinite(count)) {
      throw new Error("Visitor API did not return a numeric count");
    }

    setCookie(VISITOR_COUNT_COOKIE, String(count), VISITOR_CACHE_SECONDS);
    setCookie(VISITOR_RECENT_COOKIE, String(Math.floor(Date.now() / 1000)), VISITOR_CACHE_SECONDS);
    renderVisitorCount(el, count);
  } catch (e) {
    el.textContent = "Visitors: unavailable";
    console.warn("Visitor counter could not be loaded.", e);
  }
}

document.addEventListener("DOMContentLoaded", updateVisitorCounter);
