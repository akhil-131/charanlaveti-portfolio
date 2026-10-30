/* ==========================================================================
   CINEMATIC INTRO PRELOADER CONTROLLER
   - Locks scrolling during the 3.0s opening sequence
   - Seamlessly releases scroll lock when curtain lifts
   - Cleanly removes preloader from DOM after curtain exits
   ========================================================================== */

(function () {
  // Ensure scroll is locked during the intro sequence
  document.body.classList.add('preloader-active');

  // At 3000ms the 3-second words finish and curtain rises: release scroll lock
  setTimeout(() => {
    document.body.classList.remove('preloader-active');
  }, 3000);

  // At 3800ms the curtain has finished sliding off-screen: cleanly remove element
  setTimeout(() => {
    const preloader = document.getElementById('sitePreloader');
    if (preloader && preloader.parentNode) {
      preloader.parentNode.removeChild(preloader);
    }
  }, 3800);
})();
