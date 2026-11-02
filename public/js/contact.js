const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const formLoadTimeInput = document.getElementById("form-load-time");

const pageLoadTimestamp = Date.now();
if (formLoadTimeInput) {
  formLoadTimeInput.value = pageLoadTimestamp;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  statusEl.textContent = "";
  statusEl.className = "form-status";

  const data = Object.fromEntries(new FormData(form));

  try {
    const response = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || "Something went wrong.");
    }

    form.reset();
    statusEl.textContent = "Thanks, we'll be in touch within one business day.";
    statusEl.classList.add("form-status--success");
  } catch (error) {
    statusEl.textContent =
      error.message ||
      "Something went wrong. Please email hello@calicomedia.co instead.";
    statusEl.classList.add("form-status--error");
  } finally {
    button.disabled = false;
  }
});
