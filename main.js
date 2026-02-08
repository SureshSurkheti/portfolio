var typed = new Typed(".text", {
    strings: ["Full Stack Developer", "Web Designer", "Freelancer"],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});

const sections = document.querySelectorAll(
  "#home, #about, #services, #skills, #portfolio, #contact"
);
const navLinks = document.querySelectorAll(".navbar a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;

    if (
      window.scrollY >= sectionTop &&
      window.scrollY < sectionTop + sectionHeight
    ) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
    // Skill percentages
    const skillPercentages = {
      html: "90%",
      css: "60%",
      javascript: "85%",
      python: "50%",
      vuejs: "75%"
    };
  
    // Select all progress-line spans
    const bars = document.querySelectorAll(".technical-bars .bar .progress-line");
  
    bars.forEach((bar) => {
      // Get the skill name from the class (e.g., "html", "css")
      const skillClass = Array.from(bar.classList).find((cls) =>
        skillPercentages.hasOwnProperty(cls)
      );
  
      if (skillClass) {
        // Set the width dynamically
        const span = bar.querySelector("span");
        if (span){
          span.style.width = skillPercentages[skillClass];
        }
      }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    if (menuToggle && navbar) {
      menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!expanded));
        navbar.classList.toggle('show');
      });

      // Close menu when a nav link is clicked (mobile)
      navbar.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          if (navbar.classList.contains('show')) {
            navbar.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  });
  // Wrap everything to ensure HTML is loaded first
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("my-form");
    const status = document.getElementById("form-status"); // Ensure this ID is in your HTML

    if (!form || !status) return; // Safety check

    async function handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.target);

        fetch(event.target.action, {
            method: form.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                status.style.display = "block";
                status.style.color = "#0ef"; // This was causing the error if status was undefined
                status.innerHTML = "Form is successfully sent!";
                form.reset();
                setTimeout(() => { status.style.display = "none"; }, 5000);
            } else {
                status.style.display = "block";
                status.style.color = "red";
                status.innerHTML = "Oops! There was a problem.";
            }
        }).catch(error => {
            status.style.display = "block";
            status.style.color = "red";
            status.innerHTML = "Oops! Connection error.";
        });
    }

    form.addEventListener("submit", handleSubmit);
});