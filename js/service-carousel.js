(() => {
  const carousel = document.querySelector(".service-carousel");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll("[data-service-slide]")];
  const slidesContainer = carousel.querySelector(".service-carousel__slides");
  const thumbs = [...carousel.querySelectorAll("[data-service-index]")];
  let activeIndex = 0;
  let transitionTimer;

  if (!slides.length) return;

  function equalizeSlideHeights() {
    const hiddenStates = slides.map((slide) => slide.hidden);
    slidesContainer.style.height = "auto";

    slides.forEach((slide) => {
      slide.hidden = false;
      slide.style.height = "auto";
    });

    const maxHeight = Math.max(...slides.map((slide) => slide.offsetHeight));

    slides.forEach((slide, slideIndex) => {
      slide.style.height = `${maxHeight}px`;
      slide.hidden = hiddenStates[slideIndex];
    });

    slidesContainer.style.height = `${maxHeight}px`;
  }

  function showSlide(index) {
    const nextIndex = (index + slides.length) % slides.length;
    if (nextIndex === activeIndex) return;

    const previousIndex = activeIndex;
    activeIndex = nextIndex;
    window.clearTimeout(transitionTimer);

    slides.forEach((slide, slideIndex) => {
      const isPrevious = slideIndex === previousIndex;
      const isActive = slideIndex === activeIndex;

      slide.classList.remove("is-active", "is-fading-in", "is-fading-out");
      slide.hidden = !isPrevious && !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));

      if (isPrevious) slide.classList.add("is-fading-out");
      if (isActive) slide.classList.add("is-fading-in");
    });

    const transitionIndex = activeIndex;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (activeIndex !== transitionIndex) return;
        const incomingSlide = slides[transitionIndex];
        incomingSlide.classList.remove("is-fading-in");
        incomingSlide.classList.add("is-active");
      });
    });

    transitionTimer = window.setTimeout(() => {
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.hidden = !isActive;
        slide.classList.remove("is-fading-in", "is-fading-out");
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
    }, 760);

    thumbs.forEach((thumb, thumbIndex) => {
      const isActive = thumbIndex === activeIndex;
      thumb.classList.toggle("is-active", isActive);
      thumb.setAttribute("aria-pressed", String(isActive));
    });

  }

  carousel.querySelectorAll("[data-service-step]").forEach((button) => {
    button.addEventListener("click", () => {
      showSlide(activeIndex + Number(button.dataset.serviceStep));
    });
  });

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      showSlide(Number(thumb.dataset.serviceIndex));
    });
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(activeIndex + 1);
    }
  });

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeIndex;
    slide.hidden = !isActive;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });
  equalizeSlideHeights();

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(equalizeSlideHeights);
  });

  thumbs.forEach((thumb, thumbIndex) => {
    const isActive = thumbIndex === activeIndex;
    thumb.classList.toggle("is-active", isActive);
    thumb.setAttribute("aria-pressed", String(isActive));
  });

})();
