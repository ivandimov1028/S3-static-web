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
// The API must return JSON with a numeric count field.
const VISITOR_COUNTER_URL = "https://g099cr2o2f.execute-api.us-east-1.amazonaws.com/visit";

async function updateVisitorCounter() {
  const el = document.getElementById("visitorCounter");
  if (!el) return;

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

    el.textContent = `Visitors: ${count.toLocaleString()}`;
  } catch (e) {
    el.textContent = "Visitors: unavailable";
    console.warn("Visitor counter could not be loaded.", e);
  }
}

document.addEventListener("DOMContentLoaded", updateVisitorCounter);
