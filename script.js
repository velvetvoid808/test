/* =====================================================
   KH ESPORTS CHAMPIONSHIP 2026
   NAVIGATION SYSTEM — SINGLE SOURCE OF TRUTH
===================================================== */

(() => {
    "use strict";

    // ===== ELEMENTS =====
    const navbar = document.getElementById("navbar");
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const menuBackdrop = document.getElementById("menuBackdrop");

    const desktopLinks = Array.from(document.querySelectorAll(".nav-links a"));
    const mobileLinks = Array.from(document.querySelectorAll(".mobile-links a"));
    const sections = Array.from(document.querySelectorAll("main section[id]"));

    // 所有可点击的导航元素（包括 mobile 中的 RULEBOOK 和 REGISTER）
    const allNavClickTargets = [
        ...desktopLinks,
        ...mobileLinks,
        ...document.querySelectorAll(".mobile-action"),
        ...document.querySelectorAll(".nav-button, .nav-rulebook"),
    ];

    // ===== NAVBAR SCROLL EFFECT =====
    function updateNavbar() {
        if (!navbar) return;
        navbar.classList.toggle("scrolled", window.scrollY > 24);
    }

    // ===== MOBILE MENU =====
    function openMenu() {
        if (!mobileMenu || !menuBackdrop || !menuToggle) return;
        mobileMenu.classList.add("open");
        menuBackdrop.classList.add("open");
        menuToggle.classList.add("open");
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close navigation menu");
        document.body.classList.add("menu-open");
    }

    function closeMenu() {
        if (!mobileMenu || !menuBackdrop || !menuToggle) return;
        mobileMenu.classList.remove("open");
        menuBackdrop.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        document.body.classList.remove("menu-open");
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            mobileMenu.classList.contains("open") ? closeMenu() : openMenu();
        });
    }
    if (menuBackdrop) {
        menuBackdrop.addEventListener("click", closeMenu);
    }

    // ===== SMOOTH NAVIGATION =====
    function getHeaderOffset() {
        return navbar ? navbar.offsetHeight + 12 : 0;
    }

    function scrollToTarget(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth"
        });
    }

    function handleNavigationClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#") || href === "#") return;

        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (!target) return;

        event.preventDefault();
        closeMenu();
        scrollToTarget(targetId);

        // 更新 URL hash（不触发滚动）
        if (window.history && window.history.pushState) {
            window.history.pushState(null, "", href);
        }
    }

    // 为所有导航链接绑定点击事件
    allNavClickTargets.forEach(link => {
        link.addEventListener("click", handleNavigationClick);
    });

    // ===== ACTIVE NAVIGATION =====
    function setActiveSection(sectionId) {
        desktopLinks.forEach(link => {
            const matches = link.getAttribute("href") === `#${sectionId}`;
            link.classList.toggle("active", matches);
        });
        mobileLinks.forEach(link => {
            const matches = link.getAttribute("href") === `#${sectionId}`;
            link.classList.toggle("active", matches);
        });
    }

    function getCurrentSection() {
        if (!sections.length) return "home";

        const headerHeight = navbar ? navbar.offsetHeight : 0;
        // 激活判定点：navbar 底部 + 80px 偏移
        const marker = window.scrollY + headerHeight + 80;

        let current = sections[0].id;
        for (const section of sections) {
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            if (marker >= sectionTop) {
                current = section.id;
            } else {
                break;
            }
        }

        // 特殊处理：导航中没有 "REGISTER" 项，所以滚动到 #register 时高亮 #rules
        if (current === "register") {
            current = "rules";
        }

        return current;
    }

    function updateActiveSection() {
        setActiveSection(getCurrentSection());
    }

    // ===== SCROLL HANDLER =====
    let ticking = false;
    function handleScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            updateNavbar();
            updateActiveSection();
            ticking = false;
        });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    // ===== RESIZE =====
    window.addEventListener("resize", () => {
        if (window.innerWidth > 1100) {
            closeMenu();
        }
        updateActiveSection();
    });

    // ===== ESCAPE KEY =====
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    // ===== POPSTATE (browser back/forward) =====
    window.addEventListener("popstate", updateActiveSection);

    // ===== INITIAL STATE =====
    updateNavbar();
    updateActiveSection();

    // 延迟再次刷新，确保所有布局已稳定
    setTimeout(updateActiveSection, 100);
    setTimeout(updateActiveSection, 500);

    // =====================================================
    //  REPEATING SCROLL ANIMATION (REVEAL)
    //  使用 IntersectionObserver，元素离开视口时移除类，
    //  以便再次滚动进入时动画重播。
    // =====================================================
    const revealElements = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("reveal-visible");
                    } else {
                        entry.target.classList.remove("reveal-visible");
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -8% 0px"
            }
        );
        revealElements.forEach((el) => revealObserver.observe(el));
    } else {
        // fallback for older browsers
        revealElements.forEach((el) => el.classList.add("reveal-visible"));
    }

})();
