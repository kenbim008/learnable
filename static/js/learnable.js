const currencyRates = {
    US: { symbol: "$", rate: 1, name: "USD" },
    NG: { symbol: "₦", rate: 1550, name: "NGN" },
    GB: { symbol: "£", rate: 0.79, name: "GBP" },
    EU: { symbol: "€", rate: 0.92, name: "EUR" },
    CA: { symbol: "C$", rate: 1.36, name: "CAD" },
};

let currentCountry = "US";

function convertPrice(priceUSD) {
    const { symbol, rate } = currencyRates[currentCountry];
    const converted = (Number(priceUSD) * rate).toFixed(2);
    return `${symbol}${converted}`;
}

function changeCountry() {
    const sel = document.getElementById("countrySelector");
    if (!sel) return;
    currentCountry = sel.value;
    document.querySelectorAll("[data-price-usd]").forEach((el) => {
        const usd = el.getAttribute("data-price-usd");
        el.textContent = convertPrice(usd);
    });
    const instructorPrice = document.getElementById("instructorPrice");
    if (instructorPrice) {
        instructorPrice.textContent = convertPrice(9.99);
    }
}

function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: "smooth" });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const sel = document.getElementById("countrySelector");
    if (sel) {
        sel.addEventListener("change", changeCountry);
        changeCountry();
    }

    document.addEventListener("contextmenu", (e) => {
        if (e.target && e.target.tagName === "VIDEO") {
            e.preventDefault();
            alert("Content is protected. Streaming only.");
        }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
        showToast("Welcome aboard.");
        params.delete("welcome");
        const rest = params.toString();
        const clean = window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash;
        window.history.replaceState({}, "", clean);
    }

    if (params.get("course_created") === "1") {
        showToast("Course saved.");
        params.delete("course_created");
        const rest = params.toString();
        const clean = window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash;
        window.history.replaceState({}, "", clean);
    }

    if (params.get("signed_out") === "1") {
        showToast("You're signed out.");
        params.delete("signed_out");
        const rest = params.toString();
        const clean = window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash;
        window.history.replaceState({}, "", clean);
    }

    document.querySelectorAll(".site-message__dismiss").forEach((btn) => {
        btn.addEventListener("click", () => {
            const row = btn.closest(".site-message");
            const wrap = btn.closest(".site-messages");
            row?.remove();
            if (wrap && !wrap.querySelector(".site-message")) {
                wrap.remove();
            }
        });
    });

    initPreviewModal();
});

function initPreviewModal() {
    const modal = document.getElementById("previewModal");
    if (!modal) return;

    const video = document.getElementById("previewModalVideo");
    const titleEl = document.getElementById("previewModalTitle");
    const closeBtn = document.getElementById("previewModalClose");

    function closePreview() {
        modal.classList.remove("active");
        modal.setAttribute("hidden", "");
        document.body.style.overflow = "";
        if (video) {
            video.pause();
            video.removeAttribute("src");
            video.load();
        }
    }

    function openPreview(src, title) {
        if (!video || !src) return;
        if (titleEl) titleEl.textContent = title ? `${title} — Preview` : "Course preview";
        video.src = src;
        modal.removeAttribute("hidden");
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        video.play().catch(() => {});
    }

    document.querySelectorAll(".js-preview-open").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPreview(btn.getAttribute("data-preview-src"), btn.getAttribute("data-preview-title"));
        });
    });

    closeBtn?.addEventListener("click", closePreview);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closePreview();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) closePreview();
    });
}

function showToast(text) {
    const el = document.createElement("div");
    el.className = "learnable-toast";
    el.setAttribute("role", "status");
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
        el.classList.add("learnable-toast--visible");
    });
    setTimeout(() => {
        el.classList.remove("learnable-toast--visible");
        setTimeout(() => el.remove(), 280);
    }, 2600);
}
