/**
 * Theme and Language Switcher
 * M2Y.net Landing Page
 */

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.attachEventListeners();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        this.updateThemeIcon();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    updateThemeIcon() {
        const icon = document.querySelector('.theme-switcher i');
        const text = document.querySelector('.theme-switcher span');
        const switcher = document.querySelector('.theme-switcher');
        const currentLanguage = localStorage.getItem('language') || document.documentElement.getAttribute('lang') || 'en';
        const languagePack = window.translations?.[currentLanguage] || {};
        const nextThemeLabel = this.currentTheme === 'light'
            ? (languagePack.theme_switch_to_dark || 'Dark Mode')
            : (languagePack.theme_switch_to_light || 'Light Mode');
        
        if (icon) {
            icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        if (text) {
            text.textContent = nextThemeLabel;
        }

        if (switcher) {
            switcher.setAttribute('aria-label', nextThemeLabel);
            switcher.setAttribute('title', nextThemeLabel);
        }
    }

    attachEventListeners() {
        const switcher = document.querySelector('.theme-switcher');
        if (switcher) {
            switcher.addEventListener('click', () => this.toggleTheme());
        }
    }
}

class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = window.translations || {};
        this.init();
    }

    init() {
        this.applyLanguage(this.currentLanguage);
        this.attachEventListeners();
    }

    applyLanguage(lang) {
        if (!this.translations[lang]) {
            console.error(`Language ${lang} not found`);
            return;
        }

        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        
        // Update HTML dir and lang attributes
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        
        // Update all elements with data-i18n attribute
        this.updateTranslations();
        
        // Update language button
        this.updateLanguageButton();
        
        // Update active state in dropdown
        this.updateActiveLanguage();

        // Refresh theme label in the selected language
        window.themeManager?.updateThemeIcon();
    }

    updateTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        const currentLang = this.translations[this.currentLanguage];
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (currentLang[key]) {
                // Handle different element types
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.hasAttribute('placeholder')) {
                        element.placeholder = currentLang[key];
                    } else {
                        element.value = currentLang[key];
                    }
                } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                    // Preserve icons
                    const icon = element.querySelector('i');
                    if (icon) {
                        element.innerHTML = '';
                        element.appendChild(icon);
                        element.innerHTML += ' ' + currentLang[key];
                    } else {
                        element.textContent = currentLang[key];
                    }
                } else {
                    element.textContent = currentLang[key];
                }
            }
        });
    }

    updateLanguageButton() {
        const flagMap = {
            'en': '🇬🇧',
            'ar': '🇸🇦',
            'fr': '🇫🇷'
        };
        
        const nameMap = {
            'en': 'English',
            'ar': 'العربية',
            'fr': 'Français'
        };
        
        const flag = document.querySelector('.language-btn .language-flag');
        const text = document.querySelector('.language-btn .language-text');
        
        if (flag) {
            flag.textContent = flagMap[this.currentLanguage];
        }
        
        if (text) {
            text.textContent = nameMap[this.currentLanguage];
        }
    }

    updateActiveLanguage() {
        const options = document.querySelectorAll('.language-option');
        options.forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    changeLanguage(lang) {
        this.applyLanguage(lang);
        this.closeDropdown();
    }

    toggleDropdown() {
        const dropdown = document.querySelector('.language-dropdown');
        const button = document.querySelector('.language-btn');

        if (dropdown) {
            const isActive = dropdown.classList.toggle('active');
            button?.setAttribute('aria-expanded', String(isActive));
        }
    }

    closeDropdown() {
        const dropdown = document.querySelector('.language-dropdown');
        const button = document.querySelector('.language-btn');

        if (dropdown) {
            dropdown.classList.remove('active');
            button?.setAttribute('aria-expanded', 'false');
        }
    }

    attachEventListeners() {
        // Language button click
        const languageBtn = document.querySelector('.language-btn');
        if (languageBtn) {
            languageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        // Language options click
        const options = document.querySelectorAll('.language-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                this.changeLanguage(lang);
            });
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-switcher')) {
                this.closeDropdown();
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }
}

// Initialize managers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.languageManager = new LanguageManager();
    
    console.log('Theme and Language managers initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager, LanguageManager };
}
