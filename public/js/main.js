/**
 * M2Y.net Landing Page - Main JavaScript
 * Handles all interactive functionality
 */

// ================================
// Utility Functions
// ================================

const Utils = {
    /**
     * Debounce function to limit function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Smooth scroll to element
     */
    smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
};

// ================================
// Navigation Module
// ================================

const Navigation = {
    init() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.bindEvents();
        this.handleScroll();
    },

    bindEvents() {
        // Handle hamburger click
        this.hamburger?.addEventListener('click', () => this.toggleMenu());
        
        // Handle nav link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavLinkClick(e));
        });
        
        // Handle scroll events
        window.addEventListener('scroll', Utils.debounce(() => this.handleScroll(), 10));
    },

    toggleMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    },

    handleNavLinkClick(e) {
        const href = e.target.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                Utils.smoothScrollTo(target);
                
                // Close mobile menu if open
                if (this.navMenu.classList.contains('active')) {
                    this.toggleMenu();
                }
                
                // Update active link
                this.navLinks.forEach(link => link.classList.remove('active'));
                e.target.classList.add('active');
            }
        }
    },

    handleScroll() {
        const scrollPosition = window.scrollY;
        
        // Add/remove scrolled class to navbar
        if (scrollPosition > 50) {
            this.navbar?.classList.add('scrolled');
        } else {
            this.navbar?.classList.remove('scrolled');
        }
    }
};

// ================================
// Counter Animation Module
// ================================

const CounterAnimation = {
    init() {
        this.counters = document.querySelectorAll('.stat-number');
        this.animated = false;
        
        if (this.counters.length > 0) {
            window.addEventListener('scroll', () => this.checkPosition());
            this.checkPosition();
        }
    },

    checkPosition() {
        if (this.animated) return;
        
        const firstCounter = this.counters[0];
        if (firstCounter && Utils.isInViewport(firstCounter)) {
            this.animateCounters();
            this.animated = true;
        }
    },

    animateCounters() {
        this.counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            
            updateCounter();
        });
    }
};

// ================================
// Scroll Animations Module
// ================================

const ScrollAnimations = {
    init() {
        this.animatedElements = document.querySelectorAll(
            '.section-header, .about-card, .feature-card, .platform-card, .contact-card, .contact-form-wrapper, .cta-content'
        );

        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            this.animatedElements.forEach(element => element.classList.add('in-view'));
        }
    },

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.12
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
};

// ================================
// Back to Top Module
// ================================

const BackToTop = {
    init() {
        this.button = document.getElementById('backToTop');
        
        if (this.button) {
            this.bindEvents();
            this.handleScroll();
        }
    },

    bindEvents() {
        this.button.addEventListener('click', () => this.scrollToTop());
        window.addEventListener('scroll', Utils.debounce(() => this.handleScroll(), 10));
    },

    handleScroll() {
        const scrollPosition = window.scrollY;
        
        if (scrollPosition > 300) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// ================================
// Contact Form Module
// ================================

const ContactForm = {
    init() {
        this.form = document.getElementById('contactForm');
        this.messageContainer = document.getElementById('formMessage');
        
        if (this.form) {
            this.bindEvents();
        }
    },

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Get form data
        const formData = {
            name: this.form.name.value,
            email: this.form.email.value,
            platform: this.form.platform.value,
            message: this.form.message.value,
        };
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showMessage('success', data.message);
                this.form.reset();
            } else {
                this.showMessage('error', data.message);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('error', 'An error occurred. Please try again later.');
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    },

    showMessage(type, message) {
        this.messageContainer.className = `form-message ${type}`;
        this.messageContainer.textContent = message;
        this.messageContainer.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            this.messageContainer.style.display = 'none';
        }, 5000);
    }
};

// ================================
// Lazy Loading Module
// ================================

const LazyLoading = {
    init() {
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        } else {
            // Fallback to Intersection Observer
            const images = document.querySelectorAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
};

// ================================
// Performance Monitoring
// ================================

const Performance = {
    init() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.logPerformanceMetrics();
                }, 0);
            });
        }
    },

    logPerformanceMetrics() {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        if (perfData) {
            console.group('🚀 Page Performance Metrics');
            console.log(`DNS Lookup: ${Math.round(perfData.domainLookupEnd - perfData.domainLookupStart)}ms`);
            console.log(`TCP Connection: ${Math.round(perfData.connectEnd - perfData.connectStart)}ms`);
            console.log(`Request Time: ${Math.round(perfData.responseStart - perfData.requestStart)}ms`);
            console.log(`Response Time: ${Math.round(perfData.responseEnd - perfData.responseStart)}ms`);
            console.log(`DOM Processing: ${Math.round(perfData.domComplete - perfData.domLoading)}ms`);
            console.log(`Total Load Time: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
            console.groupEnd();
        }
    }
};

// ================================
// Application Initialization
// ================================

class App {
    constructor() {
        this.modules = [
            Navigation,
            CounterAnimation,
            ScrollAnimations,
            BackToTop,
            ContactForm,
            LazyLoading,
            Performance
        ];
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeModules());
        } else {
            this.initializeModules();
        }
    }

    initializeModules() {
        console.log('🎯 Initializing M2Y.net Landing Page...');
        
        this.modules.forEach(module => {
            try {
                module.init();
                console.log(`✅ ${module.constructor.name || 'Module'} initialized`);
            } catch (error) {
                console.error(`❌ Error initializing module:`, error);
            }
        });
        
        console.log('✨ All modules loaded successfully!');
    }
}

// Initialize the application
const app = new App();
app.init();

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, Utils, Navigation, ContactForm };
}
