
document.addEventListener("DOMContentLoaded", function () {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("open");
    });
  }

  document.querySelectorAll(".dropdown-toggle").forEach(function(button) {
    button.addEventListener("click", function() {
      const dropdown = button.closest(".dropdown");
      if (dropdown) dropdown.classList.toggle("open");
    });
  });

  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const to = document.getElementById("inquiry").value;
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const organization = document.getElementById("organization").value.trim();
      const inquiryLabel = document.getElementById("inquiry").selectedOptions[0].text;
      const message = document.getElementById("message").value.trim();

      const subject = encodeURIComponent("TRAIL Center Inquiry: " + inquiryLabel);
      const body = encodeURIComponent(
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Organization: " + organization + "\n" +
        "Inquiry Type: " + inquiryLabel + "\n\n" +
        "Message:\n" + message
      );

      window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
    });
  }
});
