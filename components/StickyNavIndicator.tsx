import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    Home, 
    User, 
    Briefcase, 
    GraduationCap, 
    Palette, 
    Presentation, 
    Mail, 
    ChevronLeft, 
    ChevronRight,
    Layers
} from 'lucide-react';

export interface StickyNavIndicatorProps {
    activeSection?: string;
    onSectionChange?: (sectionId: string) => void;
}

export const SECTION_IDS = [
    'home',
    'about',
    'experience',
    'education',
    'works',
    'slides',
    'contact'
] as const;

export type SectionId = typeof SECTION_IDS[number];

const StickyNavIndicator: React.FC<StickyNavIndicatorProps> = ({ 
    activeSection: controlledActiveSection, 
    onSectionChange 
}) => {
    const { t, language } = useLanguage();
    const [internalActiveSection, setInternalActiveSection] = useState<string>('home');
    const [scrollProgress, setScrollProgress] = useState<number>(0);
    const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState<boolean>(false);
    const [hoveredSection, setHoveredSection] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeSection = controlledActiveSection ?? internalActiveSection;

    // Define sections with their translated labels and Lucide icons
    const sections = useMemo(() => [
        { id: 'home', label: t.menu.home, icon: Home },
        { id: 'about', label: t.menu.about, icon: User },
        { id: 'experience', label: t.menu.experience, icon: Briefcase },
        { id: 'education', label: t.menu.education, icon: GraduationCap },
        { id: 'works', label: t.menu.works, icon: Palette },
        { id: 'slides', label: t.menu.slides, icon: Presentation },
        { id: 'contact', label: t.menu.contact, icon: Mail },
    ], [t]);

    const activeIndex = useMemo(() => {
        const index = sections.findIndex(s => s.id === activeSection);
        return index !== -1 ? index : 0;
    }, [sections, activeSection]);

    const activeSectionItem = sections[activeIndex] || sections[0];

    // Scroll spy logic to track current section and reading progress
    const updateScrollMetrics = useCallback(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // 1. Calculate reading scroll progress
        const maxScroll = Math.max(1, documentHeight - windowHeight);
        const progress = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
        setScrollProgress(progress);

        // 2. If at top, activate home
        if (scrollY < 100) {
            if (activeSection !== 'home') {
                setInternalActiveSection('home');
                onSectionChange?.('home');
            }
            return;
        }

        // 3. If near bottom of the page (within 120px), activate contact
        if (windowHeight + scrollY >= documentHeight - 120) {
            if (activeSection !== 'contact') {
                setInternalActiveSection('contact');
                onSectionChange?.('contact');
            }
            return;
        }

        // 4. Determine which section intersects the central reading band
        const triggerY = windowHeight * 0.38;
        let detectedId: string = 'home';

        for (const sec of sections) {
            const el = document.getElementById(sec.id);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= triggerY && rect.bottom > triggerY) {
                    detectedId = sec.id;
                    break;
                }
            }
        }

        if (detectedId && detectedId !== activeSection) {
            setInternalActiveSection(detectedId);
            onSectionChange?.(detectedId);
        }
    }, [activeSection, onSectionChange, sections]);

    useEffect(() => {
        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateScrollMetrics);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        // Initial detection
        updateScrollMetrics();

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [updateScrollMetrics]);

    // Close mobile popover when clicking outside
    useEffect(() => {
        if (!isMenuDropdownOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsMenuDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuDropdownOpen]);

    // Smooth scroll navigation handler
    const scrollToSection = (id: string) => {
        setIsMenuDropdownOpen(false);
        const element = document.getElementById(id);
        if (element) {
            const header = document.getElementById('main-header');
            const headerHeight = header ? header.getBoundingClientRect().height : 70;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = Math.max(0, elementPosition - headerHeight - 16);

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeIndex > 0) {
            scrollToSection(sections[activeIndex - 1].id);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeIndex < sections.length - 1) {
            scrollToSection(sections[activeIndex + 1].id);
        }
    };

    return (
        <>
            {/* Top Reading Progress Hairline */}
            <div 
                className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 z-[65] pointer-events-none transition-[width] duration-150 ease-out print:hidden"
                style={{ width: `${scrollProgress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(scrollProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Reading progress"
            />

            {/* Desktop Vertical Sticky Indicator Rail (Right side) */}
            <nav 
                id="sticky-nav-indicator-desktop"
                aria-label="CV sections navigation"
                className="fixed right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center print:hidden select-none"
            >
                <div className="relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-gray-200/70 dark:border-slate-800/80 shadow-lg shadow-indigo-950/5 dark:shadow-black/30 rounded-full px-2 py-3.5 flex flex-col items-center gap-3 transition-all duration-300">
                    {/* Position Counter Tag */}
                    <div 
                        className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/40 tracking-wider"
                        title={`${language === 'fi' ? 'Kohta' : 'Section'} ${activeIndex + 1} / ${sections.length}`}
                    >
                        {activeIndex + 1}/{sections.length}
                    </div>

                    {/* Connecting vertical background track */}
                    <div className="w-[1.5px] bg-gray-200 dark:bg-slate-700/60 absolute left-1/2 -translate-x-1/2 top-11 bottom-5 -z-10 rounded-full" />

                    {/* Section Indicator Items */}
                    <div className="flex flex-col items-center gap-2.5">
                        {sections.map((sec, idx) => {
                            const isActive = sec.id === activeSection;
                            const isHovered = hoveredSection === sec.id;
                            const IconComponent = sec.icon;

                            return (
                                <div key={sec.id} className="relative flex items-center justify-center group">
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection(sec.id)}
                                        onMouseEnter={() => setHoveredSection(sec.id)}
                                        onMouseLeave={() => setHoveredSection(null)}
                                        className={`relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                                            isActive
                                                ? 'w-7 h-7 bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                                                : 'w-6 h-6 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800/60'
                                        }`}
                                        aria-label={`${sec.label} (${idx + 1}/${sections.length})`}
                                        aria-current={isActive ? 'true' : undefined}
                                    >
                                        {isActive ? (
                                            <IconComponent className="w-3.5 h-3.5 flex-shrink-0 animate-scale-up" />
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-current transition-transform duration-200 group-hover:scale-125" />
                                        )}
                                    </button>

                                    {/* Tooltip Label (Floating leftward) */}
                                    <div 
                                        className={`absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 z-50 ${
                                            isActive || isHovered
                                                ? 'opacity-100 translate-x-0'
                                                : 'opacity-0 translate-x-2'
                                        }`}
                                    >
                                        <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xl backdrop-blur-md whitespace-nowrap flex items-center gap-1.5 border ${
                                            isActive
                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/20'
                                                : 'bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 border-slate-700/50 dark:border-slate-200'
                                        }`}>
                                            <span className="text-[10px] opacity-75 font-mono">{idx + 1}.</span>
                                            <span>{sec.label}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Mobile Sticky Navigation Capsule (Bottom Center) */}
            <div 
                ref={dropdownRef}
                className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 md:hidden print:hidden flex flex-col items-center"
            >
                {/* Expandable Quick Section Menu */}
                {isMenuDropdownOpen && (
                    <div className="mb-2 w-[88vw] max-w-[320px] p-2 rounded-2xl bg-slate-950/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/15 dark:border-slate-700/60 shadow-2xl text-white animate-fade-in z-50">
                        <div className="px-3 py-1.5 flex items-center justify-between border-b border-white/10 mb-1 text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                            <span>{language === 'fi' ? 'Siirry osioon' : 'Jump to Section'}</span>
                            <span className="text-[10px] text-white/50">{activeIndex + 1}/{sections.length}</span>
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-1 py-1">
                            {sections.map((sec, idx) => {
                                const isCurrent = sec.id === activeSection;
                                const ItemIcon = sec.icon;
                                return (
                                    <button
                                        key={sec.id}
                                        type="button"
                                        onClick={() => scrollToSection(sec.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                            isCurrent
                                                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ItemIcon className="w-3.5 h-3.5 text-indigo-400" />
                                            <span>{sec.label}</span>
                                        </div>
                                        <span className="text-[10px] opacity-60 font-mono">0{idx + 1}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Floating Capsule Bar */}
                <div 
                    id="sticky-nav-indicator-mobile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 dark:bg-slate-900/90 text-white backdrop-blur-xl border border-white/15 dark:border-slate-700/60 shadow-2xl transition-all duration-300"
                >
                    {/* Previous Section Button */}
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={activeIndex === 0}
                        aria-label="Previous section"
                        className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-white" />
                    </button>

                    {/* Central Indicator Pill (Tap to toggle section menu) */}
                    <button
                        type="button"
                        onClick={() => setIsMenuDropdownOpen(prev => !prev)}
                        className="flex items-center gap-2 px-2 py-0.5 rounded-full hover:bg-white/5 transition-all text-xs font-medium focus:outline-none"
                        aria-expanded={isMenuDropdownOpen}
                        aria-label={`Current section: ${activeSectionItem.label}. Tap to choose section.`}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        
                        <span className="font-semibold text-white/95 max-w-[110px] truncate">
                            {activeSectionItem.label}
                        </span>

                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/15 text-indigo-200">
                            {activeIndex + 1}/{sections.length}
                        </span>

                        {/* Mini Micro Dots Stepper */}
                        <div className="hidden xs:flex items-center gap-1 pl-1">
                            {sections.map((sec, idx) => (
                                <span
                                    key={sec.id}
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                        sec.id === activeSection
                                            ? 'w-2.5 bg-indigo-400'
                                            : 'w-1 bg-white/30'
                                    }`}
                                />
                            ))}
                        </div>
                    </button>

                    {/* Next Section Button */}
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={activeIndex === sections.length - 1}
                        aria-label="Next section"
                        className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default StickyNavIndicator;
