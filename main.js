var typed = new Typed(".text", {
    strings: ["Full Stack Developer", "Web Designer", "Freelancer"],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
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
        bar.querySelector("span").style.width = skillPercentages[skillClass];
      }
    });
  });