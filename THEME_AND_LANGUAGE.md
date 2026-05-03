# Theme and Language Switching Guide

## Overview

The M2Y.net landing page now supports **theme switching** (Light/Dark mode) and **multi-language support** (English, Arabic, and French).

## Features Implemented

### 1. Theme Switching 🌓

Switch between light and dark themes with a single click.

**Current Theme:**  
- **Dark Mode** (default): Professional dark gradient background
- **Light Mode**: Clean white background with colorful accents

**How to Use:**
- Click the theme switcher button in the navbar (sun/moon icon)
- Theme preference is saved in localStorage and persists across visits

**Technical Details:**
- CSS custom properties for seamless theme transitions
- Smooth 0.3s transition for all color changes
- All components automatically adapt to the selected theme

### 2. Multi-Language Support 🌍

Switch between three languages instantly:

**Supported Languages:**
- 🇬🇧 **English** (en) - Default
- 🇸🇦 **Arabic** (ar) - Full RTL support
- 🇫🇷 **French** (fr)

**How to Use:**
- Click the language switcher button in the navbar (globe icon)
- Select your preferred language from the dropdown
- Language preference is saved in localStorage

**Technical Details:**
- 200+ translation keys covering all page content
- RTL (Right-to-Left) support for Arabic
- Automatic text direction and alignment adjustments
- Icons and visual elements preserved during translation

## User Experience

### Theme Switching
1. **Visual Feedback**: Icon rotates 180° on hover
2. **Persistent**: Theme choice saved across sessions
3. **Smooth Transitions**: All colors animate smoothly
4. **Responsive**: Works seamlessly on all devices

### Language Switching
1. **Dropdown Menu**: Click globe icon to open language selector
2. **Active Indicator**: Current language highlighted in dropdown
3. **Flag Icons**: Visual representation of each language
4. **Instant Translation**: Content updates immediately

## Files Created/Modified

### New Files
- `/public/js/translations.js` - Translation data for 3 languages
- `/public/js/switcher.js` - Theme and language switching logic
- `/public/css/theme.css` - Theme-specific styles and transitions

### Modified Files
- `/views/index.ejs` - Added script and CSS links
- `/views/partials/navbar.ejs` - Added switcher controls
- `/views/partials/hero.ejs` - Added data-i18n attributes
- `/views/partials/about.ejs` - Added data-i18n attributes
- `/views/partials/platforms.ejs` - Added data-i18n attributes
- `/views/partials/features.ejs` - Added data-i18n attributes
- `/views/partials/cta.ejs` - Added data-i18n attributes
- `/views/partials/contact.ejs` - Added data-i18n attributes
- `/views/partials/footer.ejs` - Added data-i18n attributes

## Translation System

### How It Works

1. **Translation Keys**: Every text element has a `data-i18n` attribute
```html
<h1 data-i18n="hero_title">Welcome to M2Y.net</h1>
```

2. **Translation Object**: Organized by language code
```javascript
const translations = {
    en: { hero_title: "Welcome to M2Y.net" },
    ar: { hero_title: "مرحباً بك في M2Y.net" },
    fr: { hero_title: "Bienvenue sur M2Y.net" }
};
```

3. **Automatic Updates**: JavaScript finds all `[data-i18n]` elements and updates their content

### Adding New Translations

To add a new translatable text:

1. Add the key to all three languages in `/public/js/translations.js`:
```javascript
en: { new_key: "English text" },
ar: { new_key: "النص العربي" },
fr: { new_key: "Texte français" }
```

2. Add the `data-i18n` attribute to your HTML:
```html
<p data-i18n="new_key">English text</p>
```

### RTL Support for Arabic

When Arabic is selected:
- `dir="rtl"` applied to `<html>` element
- Text alignment switches to right
- Layout reverses (flexbox, grid)
- Custom border adjustments
- Language dropdown position adjusted

## Browser Compatibility

✅ **Supported Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

⚠️ **Note:** localStorage is required for preference persistence

## Mobile Responsiveness

On screens < 768px:
- Theme switcher shows icon only (text hidden)
- Language switcher shows flag only (text hidden)
- Compact button design
- Touch-optimized tap targets

## Keyboard Accessibility

- **Escape key**: Closes language dropdown
- **Tab navigation**: All controls are keyboard accessible
- **ARIA labels**: Screen reader friendly

## Developer Notes

### Class Structure

**ThemeManager Class:**
- `init()` - Initialize theme from localStorage
- `applyTheme(theme)` - Apply theme to document
- `toggleTheme()` - Switch between light/dark
- `updateThemeIcon()` - Update button icon

**LanguageManager Class:**
- `init()` - Initialize language from localStorage
- `applyLanguage(lang)` - Apply language and update content
- `updateTranslations()` - Replace all [data-i18n] content
- `changeLanguage(lang)` - Switch language
- `toggleDropdown()` - Show/hide language selector

### Performance

- **Theme switching**: < 50ms (CSS-only animations)
- **Language switching**: < 100ms (DOM updates)
- **localStorage**: Instant read/write
- **No page reload**: Both features work client-side

### Customization

To customize colors for light theme, edit `/public/css/theme.css`:

```css
[data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #0a0e27;
    /* ... other variables */
}
```

## Testing Checklist

✅ Theme switching works on all pages  
✅ Language switching updates all text  
✅ Preferences persist after page reload  
✅ Mobile layout displays correctly  
✅ RTL mode works properly for Arabic  
✅ Dropdown closes on outside click  
✅ Keyboard navigation functional  

## Known Limitations

1. **Dynamic Content**: Platform statistics from API don't translate (numbers & percentages)
2. **Images**: Alt text for images remains in original language
3. **Meta Tags**: SEO meta tags not dynamically updated
4. **Validation Messages**: Browser default validation messages use browser language

## Future Enhancements

- [ ] Add more languages (German, Spanish, Chinese)
- [ ] Translate alt text for images
- [ ] Dynamic meta tags for SEO
- [ ] Auto-detect user's browser language
- [ ] Admin panel for managing translations
- [ ] Export/import translation files
- [ ] Translation memory for consistency

## Support

For questions or issues:
- **Email**: info@m2y.net
- **Phone**: +20 128 764 4099
- **Developer**: M2ydevelopers

---

**Last Updated**: March 10, 2026  
**Version**: 1.1.0  
**Author**: M2ydevelopers
