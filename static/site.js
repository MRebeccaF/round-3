document.addEventListener("DOMContentLoaded", () => {
  const adPopup = document.querySelector("#ad-popup");
  const closeButton = document.querySelector(".popup-close");
  const message = document.querySelector("#human-message");

  window.setTimeout(() => {
    if (adPopup) adPopup.hidden = false;
  }, 1200);

  closeButton?.addEventListener("click", () => {
    adPopup.hidden = true;
  });

  document.querySelectorAll(".broken-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      alert("Sorry! This link is broken. Please tell the webmaster.");
    });
  });

  document.querySelectorAll("[data-decoy]").forEach((button) => {
    button.addEventListener("click", () => {
      if (message) message.textContent = "Nope. Try the icon from the instructions.";
    });
  });

  document.querySelector("[data-rickroll]")?.addEventListener("click", () => {
    window.location.assign("/rickroll/");
  });
});