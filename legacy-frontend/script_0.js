
        // Canvas Particle Engine removed for performance optimization

        // --- INSTANT REVIEW COMPONENT STORAGE & LOGIC ---
        window.addEventListener('load', () => {
            let pagesVisited = parseInt(localStorage.getItem("pagesVisited")) || 0;
            pagesVisited++;
            localStorage.setItem("pagesVisited", pagesVisited.toString());

            if(pagesVisited >= 2 && !localStorage.getItem("reviewSubmitted")) {
                document.getElementById("reviewPopup").style.display = "flex";
            }
            renderAdminReviews();
        });

        function closeReviewPopup() {
            document.getElementById("reviewPopup").style.display = "none";
        }
        document.getElementById("closeReviewPopupBtn").addEventListener('click', closeReviewPopup);

        document.getElementById('instantReviewForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('revName').value;
            const stars = document.getElementById('revStars').value;
            const text = document.getElementById('revText').value;

            const starStr = "★".repeat(stars) + "☆".repeat(5 - stars);
            const dynamicReview = { name, stars: starStr, text };

            let customReviewsList = JSON.parse(localStorage.getItem("adminReviewsList")) || [];
            customReviewsList.push(dynamicReview);

            localStorage.setItem("adminReviewsList", JSON.stringify(customReviewsList));
            localStorage.setItem("reviewSubmitted", "true");

            alert("Thank you! Your feedback has been stored.");
            closeReviewPopup();
            renderAdminReviews();
        });

        function renderAdminReviews() {
            const tbody = document.getElementById('adminReviewTableBody');
            const noMsg = document.getElementById('noReviewsMessage');
            let customReviewsList = JSON.parse(localStorage.getItem("adminReviewsList")) || [];

            tbody.innerHTML = "";
            if (customReviewsList.length === 0) {
                noMsg.style.display = "block";
            } else {
                noMsg.style.display = "none";
                customReviewsList.forEach(review => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${escapeHtml(review.name)}</strong></td>
                        <td style="color:#fbbf24">${review.stars}</td>
                        <td>${escapeHtml(review.text)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }

        function escapeHtml(str) {
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        // --- SECRET EASTER EGG ADMIN TOGGLE LOGIC ---
        let clickCount = 0;
        let clickTimeout;

        document.getElementById('secretAdminTrigger').addEventListener('click', () => {
            clickCount++;

            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => { clickCount = 0; }, 1000);

            if (clickCount === 3) {
                clickCount = 0;
                const adminPanel = document.getElementById('adminPanel');
                adminPanel.style.display = "block";
                adminPanel.scrollIntoView({ behavior: 'smooth' });
            }
        });

        document.getElementById('lockAdminPanelBtn').addEventListener('click', () => {
            document.getElementById('adminPanel').style.display = "none";
        });

        // --- AUTH MODAL SYSTEM ENGINE ---
        const authModal = document.getElementById('authModal');
        const openLoginBtn = document.getElementById('openLoginBtn');
        const openSignupBtn = document.getElementById('openSignupBtn');
        const closeModalBtn = document.getElementById('closeModalBtn');

        const modalTitle = document.getElementById('modalTitle');
        const modalSubtext = document.getElementById('modalSubtext');
        const authSubmitBtn = document.getElementById('authSubmitBtn');

        window.openModal = function openModal(mode) {
            setAuthMode(mode);
            authModal.classList.add('active');
        }

        function closeModal() {
            authModal.classList.remove('active');
        }

        function setAuthMode(mode) {
            if (mode === 'signup') {
                document.body.classList.add('auth-mode-signup');
                modalTitle.textContent = "Create Account";
                modalSubtext.innerHTML = "Already have an account? <span id='toggleAuthModeBtn'>Sign In</span>";
                authSubmitBtn.textContent = "Sign Up";
            } else {
                document.body.classList.remove('auth-mode-signup');
                modalTitle.textContent = "Sign In";
                modalSubtext.innerHTML = "New to ChemLearn? <span id='toggleAuthModeBtn'>Create an account</span>";
                authSubmitBtn.textContent = "Sign In";
            }

            const toggleBtn = document.getElementById('toggleAuthModeBtn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    const currentMode = document.body.classList.contains('auth-mode-signup') ? 'signin' : 'signup';
                    setAuthMode(currentMode);
                });
            }
        }

        openLoginBtn.addEventListener('click', () => {

    if(auth.currentUser){

        if(confirm("Logout?")){

            signOut(auth);

        }

    }else{

        openModal('signin');

    }

});
        openSignupBtn.addEventListener('click', () => openModal('signup'));
        closeModalBtn.addEventListener('click', closeModal);

        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeModal();
        });

        // Fake LIVE UPDATING interval removed to eliminate deceptive UX patterns

        // --- DYNAMIC REVIEW SLIDER CONTROLS ENGINE ---
        const track = document.getElementById('sliderTrack');
        const cards = document.querySelectorAll('.review-card');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const dotContainer = document.getElementById('dotContainer');

        let cardsPerView = window.innerWidth > 1024 ? 3 : (window.innerWidth > 720 ? 2 : 1);
        let totalSteps = Math.ceil(cards.length / cardsPerView);
        let currentIndex = 0;
        let autoPlayTimer = null;

        function buildPaginationDots() {
            dotContainer.innerHTML = '';
            for (let i = 0; i < totalSteps; i++) {
                const dot = document.createElement('button');
                dot.className = `slider-dot-btn ${i === currentIndex ? 'active' : ''}`;
                dot.addEventListener('click', () => {
                    stopAutoplay();
                    moveToStep(i);
                    startAutoplay();
                });
                dotContainer.appendChild(dot);
            }
        }

        function updateLayoutState() {
            cardsPerView = window.innerWidth > 1024 ? 3 : (window.innerWidth > 720 ? 2 : 1);
            totalSteps = Math.ceil(cards.length / cardsPerView);

            if (currentIndex >= totalSteps) {
                currentIndex = totalSteps - 1;
            }
            buildPaginationDots();
        }

        function moveToStep(stepIndex) {
            currentIndex = stepIndex;

            if (currentIndex >= totalSteps) currentIndex = 0;
            if (currentIndex < 0) currentIndex = totalSteps - 1;

            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap = 24;
            const moveDistance = currentIndex * cardsPerView * (cardWidth + gap);

            track.style.transform = `translateX(-${moveDistance}px)`;

            const dots = dotContainer.querySelectorAll('.slider-dot-btn');
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function startAutoplay() {
            stopAutoplay();
            autoPlayTimer = setInterval(() => {
                moveToStep(currentIndex + 1);
            }, 5000);
        }

        function stopAutoplay() {
            if (autoPlayTimer) clearInterval(autoPlayTimer);
        }

        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            moveToStep(currentIndex - 1);
            startAutoplay();
        });

        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            moveToStep(currentIndex + 1);
            startAutoplay();
        });

        window.addEventListener('resize', () => {
            updateLayoutState();
            moveToStep(currentIndex);
        });

        updateLayoutState();
        startAutoplay();
    