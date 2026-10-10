(() => {
    const loginStorageKey = "fxecStudentName";
    const overlay = document.createElement("div");
    overlay.className = "fxec-modal";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <section class="fxec-modal-panel" role="dialog" aria-modal="true" aria-labelledby="fxec-modal-title">
            <button class="fxec-modal-close" type="button" aria-label="Close dialog"><i class="fa-solid fa-xmark"></i></button>
            <div class="fxec-modal-content"></div>
        </section>`;
    document.body.append(overlay);

    const content = overlay.querySelector(".fxec-modal-content");
    const closeButton = overlay.querySelector(".fxec-modal-close");
    let returnFocusTo = null;

    const showToast = (message) => {
        let toast = document.querySelector(".fxec-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "fxec-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.append(toast);
        }
        toast.textContent = message;
        toast.classList.add("is-visible");
        window.clearTimeout(showToast.timeoutId);
        showToast.timeoutId = window.setTimeout(() => toast.classList.remove("is-visible"), 4000);
    };

    const closeModal = () => {
        overlay.hidden = true;
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        if (returnFocusTo instanceof HTMLElement) returnFocusTo.focus();
    };

    const openModal = (trigger, view) => {
        returnFocusTo = trigger instanceof HTMLElement ? trigger : null;
        content.innerHTML = view;
        overlay.hidden = false;
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        closeButton.focus();
    };

    const getStudentName = () => localStorage.getItem(loginStorageKey);

    const refreshLoginLinks = () => {
        const name = getStudentName();
        document.querySelectorAll('a[href$="student-login.html"]').forEach((link) => {
            if (link.dataset.loginLabel === undefined) link.dataset.loginLabel = link.textContent.trim();
            if (/register/i.test(link.dataset.loginLabel)) return;
            if (name) {
                link.textContent = `Welcome, ${name}`;
                link.setAttribute("aria-label", `Signed in as ${name}. Open student account`);
            } else {
                link.textContent = link.dataset.loginLabel;
                link.removeAttribute("aria-label");
            }
        });
    };

    const openLogin = (trigger) => {
        const name = getStudentName();
        if (name) {
            openModal(trigger, `
                <p class="fxec-modal-eyebrow">Student account</p>
                <h2 id="fxec-modal-title">Welcome, ${escapeHtml(name)}</h2>
                <p class="fxec-modal-copy">You are signed in on this device.</p>
                <button class="btn fxec-logout" type="button">Sign out</button>`);
            return;
        }
        openModal(trigger, `
            <p class="fxec-modal-eyebrow">FXEC Events Portal</p>
            <h2 id="fxec-modal-title">Student login</h2>
            <p class="fxec-modal-copy">Sign in with your roll number or student email.</p>
            <form class="fxec-modal-form" data-form="login">
                <div class="field">
                    <label for="fxec-login-id">Roll number or student email</label>
                    <input id="fxec-login-id" name="studentId" type="text" autocomplete="username" required>
                </div>
                <div class="field">
                    <label for="fxec-login-password">Password</label>
                    <input id="fxec-login-password" name="password" type="password" autocomplete="current-password" required>
                </div>
                <button class="btn" type="submit">Sign in <i class="fa-solid fa-arrow-right"></i></button>
            </form>
            <p class="fxec-modal-note">Demo interface only; connect a secure authentication service for real accounts.</p>`);
    };

    const openRegistration = (trigger, eventName) => {
        openModal(trigger, `
            <p class="fxec-modal-eyebrow">Event registration</p>
            <h2 id="fxec-modal-title">Register for ${escapeHtml(eventName)}</h2>
            <p class="fxec-modal-copy">Enter your student details to reserve your place.</p>
            <form class="fxec-modal-form" data-form="event-registration">
                <input type="hidden" name="eventName" value="${escapeHtml(eventName)}">
                <div class="field">
                    <label for="fxec-register-name">Full name</label>
                    <input id="fxec-register-name" name="fullName" type="text" autocomplete="name" minlength="2" required>
                </div>
                <div class="field">
                    <label for="fxec-register-roll">Roll number</label>
                    <input id="fxec-register-roll" name="rollNumber" type="text" required>
                </div>
                <div class="field">
                    <label for="fxec-register-department">Department</label>
                    <select id="fxec-register-department" name="department" required>
                        <option value="">Select department</option>
                        <option>Computer Science and Engineering</option>
                        <option>Electronics and Communication Engineering</option>
                        <option>Electrical and Electronics Engineering</option>
                        <option>Mechanical Engineering</option>
                        <option>Civil Engineering</option>
                        <option>Information Technology</option>
                        <option>Other</option>
                    </select>
                </div>
                <div class="field">
                    <label for="fxec-register-email">Student email</label>
                    <input id="fxec-register-email" name="email" type="email" autocomplete="email" required>
                </div>
                <div class="field">
                    <label for="fxec-register-phone">Phone number</label>
                    <input id="fxec-register-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required>
                </div>
                <button class="btn" type="submit">Submit registration <i class="fa-solid fa-arrow-right"></i></button>
            </form>
            <p class="fxec-modal-note">Your registration is confirmed in this demo. No server is connected.</p>`);
    };

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const loginLink = target.closest('a[href$="student-login.html"]');
        if (loginLink) {
            event.preventDefault();
            if (/register/i.test(loginLink.textContent)) {
                openRegistration(loginLink, loginLink.closest(".event-card")?.querySelector("h3")?.textContent.trim() || "FXEC event");
            } else {
                openLogin(loginLink);
            }
            return;
        }

        if (target.closest(".fxec-modal-close") || target === overlay) {
            closeModal();
            return;
        }

        if (target.closest(".fxec-logout")) {
            localStorage.removeItem(loginStorageKey);
            refreshLoginLinks();
            closeModal();
            showToast("You have signed out.");
            return;
        }

        const filterButton = target.closest(".filter");
        if (filterButton) {
            const selected = filterButton.textContent.trim().toLowerCase();
            const categoryAliases = {
                technical: ["technical", "hackathon"],
                cultural: ["cultural"],
                sports: ["sports"],
                workshops: ["workshop"],
                seminars: ["seminar"]
            };
            document.querySelectorAll(".filter").forEach((button) => {
                const isSelected = button === filterButton;
                button.classList.toggle("is-active", isSelected);
                button.setAttribute("aria-pressed", String(isSelected));
            });
            document.querySelectorAll(".event-card").forEach((card) => {
                const category = card.querySelector(".event-tag")?.textContent.trim().toLowerCase() || "";
                const aliases = categoryAliases[selected] || [selected.replace(/s$/, "")];
                card.hidden = selected !== "all events" && !aliases.some((alias) => category.startsWith(alias));
            });
            return;
        }

        const placeholderLink = target.closest('a[href="#"]');
        if (placeholderLink) {
            event.preventDefault();
            showToast("This link has not been configured yet.");
        }
    });

    document.addEventListener("submit", (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;

        if (form.dataset.form === "login") {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const identifier = new FormData(form).get("studentId")?.toString().trim();
            if (!identifier) return;
            const name = identifier.includes("@") ? identifier.split("@")[0] : identifier;
            localStorage.setItem(loginStorageKey, name);
            refreshLoginLinks();
            closeModal();
            showToast(`Welcome, ${name}. You are signed in.`);
            return;
        }

        if (form.dataset.form === "event-registration") {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const phoneInput = form.querySelector("#fxec-register-phone");
            const phone = phoneInput.value.trim();
            const phoneDigits = phone.replace(/\D/g, "");
            if (!/^[0-9+() -]{7,20}$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
                phoneInput.setCustomValidity("Enter a valid phone number.");
                phoneInput.reportValidity();
                phoneInput.addEventListener("input", () => phoneInput.setCustomValidity(""), { once: true });
                return;
            }
            const eventName = new FormData(form).get("eventName")?.toString() || "the event";
            content.innerHTML = `
                <div class="fxec-success-icon"><i class="fa-solid fa-check"></i></div>
                <p class="fxec-modal-eyebrow">Registration complete</p>
                <h2 id="fxec-modal-title">You're on the list!</h2>
                <p class="fxec-modal-copy">Your registration for ${escapeHtml(eventName)} has been received.</p>
                <button class="btn fxec-done" type="button">Done</button>`;
            content.querySelector(".fxec-done").addEventListener("click", closeModal);
            showToast(`Registration submitted for ${eventName}.`);
            return;
        }

        if (form.closest(".contact-form")) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            form.reset();
            showToast("Your message is ready. Connect a mail service to deliver it to the events team.");
            return;
        }

        if (form.closest(".auth-form") && document.querySelector(".admin-badge")) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            showToast("Admin authentication is not configured. No sign-in was performed.");
            return;
        }

        if (form.closest(".auth-form") && !document.querySelector(".admin-badge")) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const password = form.querySelector("#pass");
            const confirmation = form.querySelector("#confirm");
            if (password && confirmation && password.value !== confirmation.value) {
                confirmation.setCustomValidity("Passwords do not match.");
                confirmation.reportValidity();
                confirmation.addEventListener("input", () => confirmation.setCustomValidity(""), { once: true });
                return;
            }
            form.reset();
            showToast("Student account details validated. Account creation requires a connected service.");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !overlay.hidden) closeModal();
    });

    document.querySelectorAll(".nav-links").forEach((navLinks, index) => {
        const toggle = document.createElement("button");
        toggle.className = "mobile-nav-toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-label", "Open navigation menu");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        toggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
            toggle.innerHTML = `<i class="fa-solid fa-${isOpen ? "xmark" : "bars"}" aria-hidden="true"></i>`;
        });
        navLinks.parentElement.insertBefore(toggle, navLinks);
        toggle.dataset.navToggle = String(index);
    });

    document.querySelectorAll(".filter").forEach((button, index) => {
        button.setAttribute("aria-pressed", String(index === 0));
        if (index === 0) button.classList.add("is-active");
    });
    document.querySelectorAll(".event-card").forEach((card) => {
        if (card.querySelector(".btn")) return;
        const eventName = card.querySelector("h3")?.textContent.trim();
        const body = card.querySelector(".event-body");
        if (!eventName || !body) return;
        const registerLink = document.createElement("a");
        registerLink.className = "btn";
        registerLink.href = "student-login.html";
        registerLink.textContent = "Register now";
        body.append(registerLink);
    });

    refreshLoginLinks();

    if (document.body.classList.contains("portal-page") && window.location.pathname.endsWith("student-login.html")) {
        openLogin(null);
    }

    function escapeHtml(value) {
        return value.replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }
})();
