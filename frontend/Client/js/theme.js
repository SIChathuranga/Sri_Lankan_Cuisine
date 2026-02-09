/**
 * Theme Manager
 * Handles dark/light mode toggle with localStorage persistence
 */

class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'sri-lankan-cuisine-theme';
        this.THEME_LIGHT = 'light';
        this.THEME_DARK = 'dark';

        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        // Get saved theme or detect system preference
        const savedTheme = this.getSavedTheme();
        const systemTheme = this.getSystemTheme();
        const initialTheme = savedTheme || systemTheme;

        this.setTheme(initialTheme, false);
        this.setupToggleButtons();
        this.watchSystemTheme();
    }

    /**
     * Get saved theme from localStorage
     */
    getSavedTheme() {
        return localStorage.getItem(this.STORAGE_KEY);
    }

    /**
     * Get system theme preference
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return this.THEME_DARK;
        }
        return this.THEME_LIGHT;
    }

    /**
     * Set theme
     * @param {string} theme - 'light' or 'dark'
     * @param {boolean} save - Whether to save to localStorage
     */
    setTheme(theme, save = true) {
        document.documentElement.setAttribute('data-theme', theme);

        if (save) {
            localStorage.setItem(this.STORAGE_KEY, theme);
        }

        this.updateToggleButtons(theme);
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === this.THEME_LIGHT ? this.THEME_DARK : this.THEME_LIGHT;
        this.setTheme(newTheme);
    }

    /**
     * Setup toggle button event listeners
     */
    setupToggleButtons() {
        const toggleButtons = document.querySelectorAll('#darkModeToggle, .theme-toggle');

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.toggleTheme();
            });
        });
    }

    /**
     * Update toggle button appearance
     * @param {string} theme - Current theme
     */
    updateToggleButtons(theme) {
        const toggleButtons = document.querySelectorAll('#darkModeToggle, .theme-toggle');

        toggleButtons.forEach(button => {
            const icon = button.querySelector('i');
            // Check if button is icon-only (circular)
            const isIconOnly = button.classList.contains('rounded-circle');

            if (theme === this.THEME_DARK) {
                // In Dark Mode, show Sun/Brightness (switch to Light)
                if (icon) {
                    icon.className = 'bi bi-brightness-high-fill';
                }
                const iconHtml = icon ? icon.outerHTML : '<i class="bi bi-brightness-high-fill"></i>';
                button.innerHTML = isIconOnly ? iconHtml : `${iconHtml} Light Mode`;
            } else {
                // In Light Mode, show Moon (switch to Dark)
                if (icon) {
                    icon.className = 'bi bi-moon-fill';
                }
                const iconHtml = icon ? icon.outerHTML : '<i class="bi bi-moon-fill"></i>';
                button.innerHTML = isIconOnly ? iconHtml : `${iconHtml} Dark Mode`;
            }
        });
    }

    /**
     * Watch for system theme changes
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!this.getSavedTheme()) {
                    const newTheme = e.matches ? this.THEME_DARK : this.THEME_LIGHT;
                    this.setTheme(newTheme, false);
                }
            });
        }
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || this.THEME_LIGHT;
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
