
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface OffCanvasMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activeSection?: string;
}

interface MenuItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const OffCanvasMenu: React.FC<OffCanvasMenuProps> = ({ isOpen, onClose, activeSection }) => {
    const { t, language, setLanguage } = useLanguage();
    const { user, isAdmin, signIn, logOut } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState("https://lh3.googleusercontent.com/a/ACg8ocIbYAtYBynI5k_UqBs1sOOl8RnaqJ3VHv89wBhQZTyr4OOJ2EtFHQ=s288-c-no");

    useEffect(() => {
        const saved = localStorage.getItem('home-avatar');
        if (saved) setAvatarUrl(saved);

        const handleUpdate = () => {
            const updated = localStorage.getItem('home-avatar');
            if (updated) setAvatarUrl(updated);
        };

        window.addEventListener('image-updated', handleUpdate);
        return () => window.removeEventListener('image-updated', handleUpdate);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('href')?.substring(1);
        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
        onClose();
    };

    const handlePrint = () => {
        window.print();
    };

    const menuItems: MenuItem[] = [
        {
            href: "#home",
            label: t.menu.home,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        },
        {
            href: "#about",
            label: t.menu.about,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        },
        {
            href: "#experience",
            label: t.menu.experience,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a10 10 0 0 1-10 10c-4.42 0-8-3.13-8-7a10 10 0 0 1 10-10c4.42 0 8 3.13 8 7"/><path d="M12 12h.01"/></svg>
        },
        {
            href: "#education",
            label: t.menu.education,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.838a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
        },
        {
            href: "#works",
            label: t.menu.works,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M17.5 6.5 17 7l-1.75 1.75A.5.5 0 0 1 13.75 9l-1.5-1.5a.5.5 0 0 1-.13-.45c-.3-.83-.98-1.5-1.82-1.82a.5.5 0 0 1-.45-.13L7 7.5l.5-.5"/><path d="M4.6 9.4a5.5 5.5 0 0 0 0 7.2L9.4 19"/><path d="M14.6 19.4a5.5 5.5 0 0 0 7.2 0L19.4 14.6"/><path d="M19.4 9.4a5.5 5.5 0 0 0-7.2 0L14.6 4.6"/></svg>
        },
        {
            href: "#slides",
            label: t.menu.slides,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><rect width="18" height="14" x="3" y="3" rx="2"/><path d="M21 12H3"/><path d="m8 21 4-4 4 4"/></svg>
        },
        {
            href: "#contact",
            label: t.menu.contact,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        }
    ];

    return (
        <div 
            id="off-canvas-menu" 
            className={`off-canvas-menu fixed top-0 left-0 h-full w-[86vw] max-w-[340px] sm:w-80 text-white shadow-2xl p-5 sm:p-6 z-[60] flex flex-col justify-between overflow-y-auto overscroll-contain backdrop-blur-2xl bg-slate-950/85 border-r border-white/10 ${isOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            aria-hidden={!isOpen}
        >
            <div>
                {/* Header row with logo and close button */}
                <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/30 border border-white/20">
                            J
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold text-white tracking-tight leading-tight">Jaakko Kallio</span>
                            <span className="text-[11px] text-indigo-300 font-medium">{language === 'fi' ? 'Valikko | CV' : 'Menu & CV'}</span>
                        </div>
                    </div>

                    <button 
                        id="close-menu" 
                        onClick={onClose} 
                        className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-label={t.header.menuClose}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                {/* Navigation items */}
                <nav className="flex flex-col space-y-1.5 py-2">
                    {menuItems.map((item) => {
                        const isCurrent = activeSection && item.href === `#${activeSection}`;
                        return (
                            <a 
                                key={item.href}
                                href={item.href} 
                                onClick={handleLinkClick} 
                                className={`group flex items-center justify-between px-3.5 py-2.5 text-sm sm:text-base font-medium rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[44px] ${
                                    isCurrent 
                                        ? 'bg-indigo-600/35 text-white border border-indigo-500/40 shadow-sm' 
                                        : 'hover:bg-white/10 active:bg-white/15 text-white/90'
                                }`}
                                tabIndex={isOpen ? 0 : -1}
                                aria-current={isCurrent ? 'page' : undefined}
                            >
                                <div className="flex items-center">
                                    <span className={`transition-colors flex-shrink-0 ${isCurrent ? 'text-indigo-300' : 'text-indigo-300 group-hover:text-white'}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`font-medium ${isCurrent ? 'text-white font-semibold' : 'text-white/90 group-hover:text-white'}`}>
                                        {item.label}
                                    </span>
                                </div>
                                {isCurrent && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-xs">
                                        {language === 'fi' ? 'Nyt' : 'Current'}
                                    </span>
                                )}
                            </a>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Actions & Profile Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-3.5">
                {/* Go to CV & Print CV buttons */}
                <div className="flex items-center gap-2">
                    <a 
                        href="/Kopio%20tiedostosta%20CV_pakattu.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-2.5 px-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center gap-2 text-xs"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        <span>{t.header.downloadCv}</span>
                    </a>
                    <button 
                        onClick={handlePrint}
                        className="bg-white/10 hover:bg-white/15 text-white/90 hover:text-white p-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        title={t.header.printCv}
                        aria-label={t.header.printCv}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                    </button>
                </div>

                {/* Profile Info Card - Frosted Glass Container */}
                <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-3 flex flex-col gap-2.5 backdrop-blur-md shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/20 shadow-inner">
                            <img 
                                src={avatarUrl} 
                                alt="Jaakko" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-white leading-tight truncate">Jaakko Kallio</p>
                            <p className="text-[10px] text-indigo-200 truncate">{t.home.role}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-indigo-300 hover:text-indigo-100 transition-colors cursor-default">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>
                                <span className="truncate">jaakko.kkallio@gmail.com</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-2 flex flex-col gap-2">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20">
                                        {user.photoURL && <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/70 truncate max-w-[100px]">{user.email}</span>
                                        {isAdmin && <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">Admin</span>}
                                    </div>
                                </div>
                                <button 
                                    onClick={logOut}
                                    className="text-[10px] bg-white/10 hover:bg-white/20 text-white py-1 px-2 rounded transition-colors"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={signIn}
                                className="w-full flex items-center justify-center gap-2 bg-white text-indigo-900 text-xs font-bold py-1.5 px-3 rounded-xl hover:bg-indigo-50 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                                Admin Login
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Language Toggle */}
                <div className="flex gap-2 justify-center text-[10px] uppercase font-bold tracking-wider pt-2 border-t border-white/10">
                    <button 
                        onClick={() => setLanguage('fi')}
                        className={`px-3 py-1 rounded-lg transition-colors ${language === 'fi' ? 'bg-white/15 text-white font-extrabold' : 'text-white/40 hover:text-white/70'}`}
                    >
                        FI
                    </button>
                    <span className="text-white/20 flex items-center">|</span>
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1 rounded-lg transition-colors ${language === 'en' ? 'bg-white/15 text-white font-extrabold' : 'text-white/40 hover:text-white/70'}`}
                    >
                        EN
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default OffCanvasMenu;
