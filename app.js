// 1. Envelope open animation
function openInvitation() {
  var env = document.getElementById("envelope-screen");
  if (env) {
    env.classList.add("envelope-flying");
    setTimeout(function () {
      env.style.display = "none";
    }, 1250);
    setTimeout(startAutoScroll, 1400);
  }
  var audio = document.getElementById("wedding-audio");
  if (audio) audio.play().catch(function () {});
}

// Personalize the envelope from an individual invitation URL, e.g. ?guest=Anh%20Minh.
(function () {
  var guestName = new URLSearchParams(window.location.search).get("guest");
  if (!guestName) return;
  guestName = guestName.trim().slice(0, 100);
  if (!guestName) return;
  var invitationText = Array.prototype.find.call(
    document.querySelectorAll('#envelope-screen span[dir="auto"]'),
    function (element) {
      return element.textContent.trim() === "Thân Mời";
    },
  );
  if (invitationText) {
    invitationText.textContent = "Thân Mời";
    var invitationBlock = invitationText.closest("div");
    if (
      invitationBlock &&
      !document.getElementById("guest-invitation-details")
    ) {
      var details = document.createElement("div");
      details.id = "guest-invitation-details";
      details.innerHTML =
        '<div class="guest-name-pill"></div><p class="guest-invitation-message">Đến dự buổi tiệc chung vui cùng gia đình</p>';
      details.querySelector(".guest-name-pill").textContent = guestName;
      invitationBlock.appendChild(details);
    }
  }
  document.title = "Thân mời " + guestName + " | Hải Yến & Hoàng Duy";
})();

// Floating decorative characters on the envelope screen
(function () {
  var layer = document.getElementById("ambient-layer");
  if (!layer) return;
  var colors = ["#a8e6a3", "#4CAF50", "#7bc47a", "#c8e6c9"];
  var rand = function (min, max) {
    return min + Math.random() * (max - min);
  };
  for (var i = 0; i < 12; i++) {
    var el = document.createElement("div");
    el.className = "absolute";
    el.textContent = "囍";
    el.style.cssText =
      "left:" +
      rand(0, 100) +
      "%;top:auto;bottom:-30px;color:" +
      colors[i % colors.length] +
      ";font-size:" +
      rand(11, 22) +
      "px;--sway:" +
      rand(-30, 30) +
      "px;" +
      "animation:ambient-rise " +
      rand(19, 26) +
      "s ease-in-out -" +
      rand(0, 20) +
      "s infinite";
    layer.appendChild(el);
  }
})();

// 2. Audio toggle
var isMusicPlaying = true;
function toggleMusic() {
  var audio = document.getElementById("wedding-audio");
  var btn = document.getElementById("music-btn");
  if (isMusicPlaying) {
    audio.pause();
    btn.classList.add("paused-music");
    btn.setAttribute("aria-label", "Phát nhạc");
  } else {
    audio.play().catch(function () {});
    btn.classList.remove("paused-music");
    btn.setAttribute("aria-label", "Tạm dừng nhạc");
  }
  isMusicPlaying = !isMusicPlaying;
}

// 3. 3D photo album carousel
var photoImages = [
  "assets/images/photo-1.jpg",
  "assets/images/photo-2.jpg",
  "assets/images/photo-3.jpg",
  "assets/images/photo-4.jpg",
  "assets/images/photo-5.jpg",
];
var totalPhotos = photoImages.length;
var currentSlide = 3;

// Keyed by offset from the current slide: 0 = center, 1/2 = right, 3 = far left, 4 = left.
var slidePositions = [
  {
    ratio: "0.666406 / 1",
    transform: "translateX(0%) translateZ(0px) rotateY(0deg) scale(1)",
    opacity: 1,
    z: 100,
  },
  {
    ratio: "0.666406 / 1",
    transform: "translateX(60%) translateZ(-150px) rotateY(45deg) scale(0.85)",
    opacity: 0.75,
    z: 99,
  },
  {
    ratio: "0.666406 / 1",
    transform: "translateX(120%) translateZ(-300px) rotateY(90deg) scale(0.7)",
    opacity: 0.5,
    z: 98,
  },
  {
    ratio: "0.666406 / 1",
    transform:
      "translateX(-120%) translateZ(-300px) rotateY(-90deg) scale(0.7)",
    opacity: 0.5,
    z: 98,
  },
  {
    ratio: "1.2 / 1",
    transform:
      "translateX(-60%) translateZ(-150px) rotateY(-45deg) scale(0.85)",
    opacity: 0.75,
    z: 99,
  },
];

function updateCarousel() {
  for (var i = 0; i < totalPhotos; i++) {
    var el = document.getElementById("slide-" + i);
    var dot = document.getElementById("dot-" + i);
    if (!el) continue;

    var diff = (i - currentSlide + totalPhotos) % totalPhotos;
    var pos = slidePositions[diff];
    el.setAttribute(
      "style",
      "aspect-ratio: " +
        pos.ratio +
        "; transition-duration: 1100ms; transform: " +
        pos.transform +
        "; opacity: " +
        pos.opacity +
        "; z-index: " +
        pos.z +
        ";",
    );
    el.classList.toggle("ring-2", diff === 0);
    el.classList.toggle("ring-white/30", diff === 0);

    if (dot) {
      dot.className =
        diff === 0
          ? "rounded-full transition-all duration-300 w-6 h-2 bg-current opacity-70"
          : "rounded-full transition-all duration-300 w-2 h-2 bg-current opacity-25 hover:opacity-40";
    }
  }
}

var carouselAutoAdvanceId = null;
var carouselAutoAdvanceDelay = 4500;

function startCarouselAutoAdvance() {
  if (carouselAutoAdvanceId || document.hidden) return;
  carouselAutoAdvanceId = setTimeout(function () {
    carouselAutoAdvanceId = null;
    if (document.hidden) return;
    nextSlide(false);
    startCarouselAutoAdvance();
  }, carouselAutoAdvanceDelay);
}
function stopCarouselAutoAdvance() {
  if (!carouselAutoAdvanceId) return;
  clearTimeout(carouselAutoAdvanceId);
  carouselAutoAdvanceId = null;
}
function restartCarouselAutoAdvance() {
  stopCarouselAutoAdvance();
  startCarouselAutoAdvance();
}
function goToSlide(idx) {
  currentSlide = idx;
  updateCarousel();
  restartCarouselAutoAdvance();
}
function nextSlide(resetTimer) {
  currentSlide = (currentSlide + 1) % totalPhotos;
  updateCarousel();
  if (resetTimer !== false) restartCarouselAutoAdvance();
}
function prevSlide() {
  currentSlide = (currentSlide - 1 + totalPhotos) % totalPhotos;
  updateCarousel();
  restartCarouselAutoAdvance();
}
function onCardClick(idx) {
  if (idx === currentSlide) openLightbox(idx);
  else goToSlide(idx);
}

// Touch swipe on gallery
(function () {
  var slide = document.getElementById("slide-3");
  var track = slide && slide.parentElement;
  if (!track) return;
  var startX = 0;
  track.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener(
    "touchend",
    function (e) {
      var diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) nextSlide();
        else prevSlide();
      }
    },
    { passive: true },
  );
})();

// Avoid advancing in background tabs.
document.addEventListener("visibilitychange", function () {
  if (document.hidden) stopCarouselAutoAdvance();
  else startCarouselAutoAdvance();
});
startCarouselAutoAdvance();

// 4. Lightbox
var lbIndex = 0;
function openLightbox(idx) {
  stopCarouselAutoAdvance();
  lbIndex = idx;
  updateLightbox();
  var dlg = document.getElementById("lightbox-dialog");
  if (dlg) dlg.showModal();
}
function closeLightbox() {
  var dlg = document.getElementById("lightbox-dialog");
  if (dlg) dlg.close();
  startCarouselAutoAdvance();
}
function lightboxNav(dir) {
  lbIndex = (lbIndex + dir + totalPhotos) % totalPhotos;
  updateLightbox();
}
function lightboxGoto(idx) {
  lbIndex = idx;
  updateLightbox();
}
function updateLightbox() {
  var img = document.getElementById("lightbox-main-img");
  var ctr = document.getElementById("lightbox-counter");
  if (img) img.src = photoImages[lbIndex];
  if (ctr) ctr.textContent = lbIndex + 1 + " / " + totalPhotos;

  for (var i = 0; i < totalPhotos; i++) {
    var thumb = document.getElementById("lb-thumb-" + i);
    if (!thumb) continue;
    if (i === lbIndex) {
      thumb.className =
        "flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md sm:rounded-lg overflow-hidden transition-all duration-200 scale-105 shadow-lg";
      thumb.style.outline = "rgb(31, 58, 37) solid 2px";
      thumb.style.outlineOffset = "2px";
    } else {
      thumb.className =
        "flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md sm:rounded-lg overflow-hidden transition-all duration-200 opacity-60 hover:opacity-100";
      thumb.style.outline = "";
      thumb.style.outlineOffset = "";
    }
  }
}

// 5. Countdown to 2026-11-28 10:00 (UTC+7)
var targetTime = new Date("2026-11-28T10:00:00+07:00").getTime();
function tickCountdown() {
  var diff = targetTime - Date.now();
  var el = document.getElementById("countdown-text");
  if (!el) return;
  if (diff <= 0) {
    el.textContent = "Hôm nay là ngày hôn lễ!";
    return;
  }
  var d = Math.floor(diff / (1000 * 60 * 60 * 24));
  var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  var s = Math.floor((diff % (1000 * 60)) / 1000);
  el.textContent = d + " ngày " + h + " giờ " + m + " phút " + s + " giây";
}
tickCountdown();
setInterval(tickCountdown, 1000);

// 6. Auto-scroll controller
var isAutoScrolling = false;
var autoScrollSpeed = 34; // pixels/sec
var scrollFrameId = null;
var prevTime = null;
var autoScrollRemainder = 0;

function startAutoScroll() {
  if (isAutoScrolling) return;
  isAutoScrolling = true;
  prevTime = performance.now();
  autoScrollRemainder = 0;

  function scrollLoop(currentTime) {
    if (!isAutoScrolling) return;
    var delta = currentTime - prevTime;
    prevTime = currentTime;

    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= maxScroll - 2) {
      stopAutoScroll();
      return;
    }

    // Whole pixels only: some browsers discard sub-pixel scroll values.
    autoScrollRemainder += (delta / 1000) * autoScrollSpeed;
    var pixels = Math.floor(autoScrollRemainder);
    if (pixels > 0) {
      autoScrollRemainder -= pixels;
      window.scrollBy(0, pixels);
    }
    scrollFrameId = requestAnimationFrame(scrollLoop);
  }

  scrollFrameId = requestAnimationFrame(scrollLoop);
}

function stopAutoScroll() {
  isAutoScrolling = false;
  if (scrollFrameId) {
    cancelAnimationFrame(scrollFrameId);
    scrollFrameId = null;
  }
}

function toggleAutoScroll() {
  if (isAutoScrolling) stopAutoScroll();
  else startAutoScroll();
}

// Clicking blank page area toggles auto-scroll once the envelope is open.
document.addEventListener("click", function (e) {
  if (
    e.target.closest(
      "button, a, input, dialog, .card-slide, #music-btn, #lightbox-dialog, .carousel-dots, [data-slide-index]",
    )
  )
    return;
  var env = document.getElementById("envelope-screen");
  if (env && env.style.display !== "none") return;
  toggleAutoScroll();
});

// Manual scrolling takes over from auto-scroll.
window.addEventListener(
  "wheel",
  function () {
    if (isAutoScrolling) stopAutoScroll();
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  function (e) {
    if (isAutoScrolling && !e.target.closest("#envelope-screen"))
      stopAutoScroll();
  },
  { passive: true },
);
