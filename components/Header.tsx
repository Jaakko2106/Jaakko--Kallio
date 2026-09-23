
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
    onMenuToggle: () => void;
    isMenuOpen: boolean;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    activeSection?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen, theme, onThemeToggle, activeSection }) => {
    const { language, setLanguage, t } = useLanguage();
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            lastScrollY.current = window.scrollY;
            setIsScrolled(window.scrollY > 20);
        }

        const SCROLL_THRESHOLD = 8;
        const TOP_REVEAL_THRESHOLD = 50;
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    setIsScrolled(currentScrollY > 20);

                    // Always reveal near the top of the page
                    if (currentScrollY <= TOP_REVEAL_THRESHOLD) {
                        setIsVisible(true);
                        lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
                        ticking = false;
                        return;
                    }

                    const diff = currentScrollY - lastScrollY.current;

                    // Only react when scroll distance exceeds threshold to prevent jitter
                    if (Math.abs(diff) > SCROLL_THRESHOLD) {
                        if (diff > 0) {
                            // Scrolling down -> hide navbar
                            setIsVisible(false);
                        } else {
                            // Scrolling up -> show navbar
                            setIsVisible(true);
                        }
                        lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
                    }

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'fi' : 'en');
    };

    const handlePrint = () => {
        window.print();
    };

    // If the off-canvas menu is open, the header must remain visible
    const shouldShow = isMenuOpen || isVisible;

    return (
        <header 
            id="main-header"
            onFocusCapture={() => setIsVisible(true)}
            className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ease-in-out will-change-transform p-3.5 sm:p-4 flex justify-between items-center print:hidden ${
                shouldShow ? 'translate-y-0' : '-translate-y-full pointer-events-none'
            } ${
                isScrolled 
                    ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md border-b border-gray-200/50 dark:border-gray-800/50' 
                    : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-transparent'
            }`}
            aria-hidden={!shouldShow}
        >
            <div className="flex items-center gap-2 sm:gap-3">
                <a 
                    href="#home"
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                    aria-label="Jaakko CV Home"
                >
                    <svg width="40" height="40" viewBox="0 0 100 100" className="mr-2 sm:mr-3 flex-shrink-0 transition-transform group-hover:scale-105" aria-hidden="true">
                        <rect width="100" height="100" rx="20" fill="#4f46e5"/>
                        <text x="50" y="65" fontFamily="Inter, sans-serif" fontSize="50" fill="white" textAnchor="middle" fontWeight="bold">J</text>
                    </svg>
                    <span className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">Jaakko |</span>
                </a>

                {/* Sticky Section Position Badge in Header */}
                {isScrolled && activeSection && (
                    <span 
                        id="header-active-section-indicator"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 animate-fade-in transition-all duration-300 shadow-xs"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                        <span className="max-w-[110px] sm:max-w-none truncate">{t.menu[activeSection as keyof typeof t.menu] || activeSection}</span>
                    </span>
                )}
            </div>

            {/* Desktop Navigation Link Tabs with Active Indicator */}
            <nav 
                aria-label="Main section navigation"
                className="hidden xl:flex items-center gap-1 bg-gray-100/70 dark:bg-gray-800/60 p-1 rounded-full border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
            >
                {[
                    { id: 'home', label: t.menu.home },
                    { id: 'about', label: t.menu.about },
                    { id: 'experience', label: t.menu.experience },
                    { id: 'education', label: t.menu.education },
                    { id: 'works', label: t.menu.works },
                    { id: 'contact', label: t.menu.contact },
                ].map(item => {
                    const isActive = activeSection === item.id;
                    return (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                const el = document.getElementById(item.id);
                                if (el) {
                                    const headerHeight = 70;
                                    const topPos = el.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
                                    window.scrollTo({ top: topPos, behavior: 'smooth' });
                                }
                            }}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                                isActive
                                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                            }`}
                            aria-current={isActive ? 'true' : undefined}
                        >
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                            <span>{item.label}</span>
                        </a>
                    );
                })}
            </nav>
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-indigo-700 dark:text-indigo-400 font-bold text-sm uppercase hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-10 h-10 flex items-center justify-center"
                    aria-label={`Switch to ${language === 'en' ? 'Finnish' : 'English'}`}
                >
                    {language === 'en' ? 'FI' : 'EN'}
                </button>

                <a 
                    id="header-cv-goto-btn"
                    href="/Kopio%20tiedostosta%20CV_pakattu.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 p-2 sm:py-2 sm:px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 active:scale-95 transition-all duration-200 ease-in-out text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                    aria-label={t.header.downloadCv}
                    title={language === 'fi' ? 'Avaa Jaakko Kallion CV (PDF)' : 'Go to Jaakko Kallio CV (PDF)'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    <span className="hidden sm:inline">{t.header.downloadCv}</span>
                    <span className="sm:hidden text-xs">CV</span>
                </a>

                {/* Theme Toggle Button */}
                <button 
                    onClick={onThemeToggle}
                    className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={t.header.themeToggle}
                >
                    {theme === 'light' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    )}
                </button>

                <button 
                    id="menu-toggle" 
                    onClick={onMenuToggle} 
                    className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-800"
                    aria-label={isMenuOpen ? t.header.menuClose : t.header.menuOpen}
                    aria-expanded={isMenuOpen}
                    aria-controls="off-canvas-menu"
                >
                    <svg className="w-6 h-6 text-indigo-700 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
