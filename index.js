(() => {
    "use strict";

    const EXTENSION_NAME = "RP Glass";
    const VERSION = "0.1.0";

    function init() {
        document.documentElement.classList.add("rp-glass-loaded");
        console.log(`💜 ${EXTENSION_NAME} v${VERSION} loaded`);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
