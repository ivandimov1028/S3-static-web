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

// UNIQUE VISITOR COUNTER
// Requires a backend endpoint that increments the count only when a browser
// has not already been marked with the visit cookie.
const VISITOR_COUNTER_API = "/api/visitors";
const VISITOR_COOKIE_NAME = "cloud_portfolio_visited";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, maxAgeSeconds) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

async function updateVisitorCounter() {
  const counterElement = document.getElementById("visitorCounter");
  if (!counterElement) return;

  const alreadyCounted = getCookie(VISITOR_COOKIE_NAME) === "1";

  try {
    const response = await fetch(VISITOR_COUNTER_API, {
      method: alreadyCounted ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: alreadyCounted ? undefined : JSON.stringify({
        page: window.location.pathname,
        referrer: document.referrer || null
      })
    });

    if (!response.ok) {
      throw new Error(`Counter request failed with status ${response.status}`);
    }

    const data = await response.json();
    const count = data.uniqueVisitors ?? data.count ?? data.value;

    if (!alreadyCounted) {
      setCookie(VISITOR_COOKIE_NAME, "1", VISITOR_COOKIE_MAX_AGE);
    }

    counterElement.textContent = typeof count === "number"
      ? `Unique visitors: ${count.toLocaleString()}`
      : "Unique visitors: unavailable";
  } catch (error) {
    counterElement.textContent = "Unique visitors: unavailable";
    console.warn("Visitor counter could not be loaded.", error);
  }
}

document.addEventListener("DOMContentLoaded", updateVisitorCounter);
