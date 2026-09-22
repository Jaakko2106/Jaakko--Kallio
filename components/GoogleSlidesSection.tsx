import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    GoogleSlidePresentationItem, 
    SAMPLE_PRESENTATIONS, 
    extractPresentationId, 
    getPresentationEmbedUrl, 
    fetchUserGoogleSlides, 
    createGoogleSlidePresentation 
} from '../utils/googleSlidesService';
import { 
    Presentation, 
    ExternalLink, 
    Plus, 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle, 
    Maximize2, 
    Layers, 
    Calendar, 
    Search,
    SlidersHorizontal,
    Sparkles
} from 'lucide-react';

const GoogleSlidesSection: React.FC = () => {
    const { user, accessToken, signIn, logOut, getAccessToken } = useAuth();
    const { t, language } = useLanguage();

    const [userDecks, setUserDecks] = useState<GoogleSlidePresentationItem[]>([]);
    const [selectedDeckId, setSelectedDeckId] = useState<string>(SAMPLE_PRESENTATIONS[0].id);
    const [selectedDeckTitle, setSelectedDeckTitle] = useState<string>(SAMPLE_PRESENTATIONS[0].title);
    const [customUrlInput, setCustomUrlInput] = useState<string>('');
    const [isLoadingDecks, setIsLoadingDecks] = useState<boolean>(false);
    const [isCreatingDeck, setIsCreatingDeck] = useState<boolean>(false);
    const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Modal state for creating a new presentation (Mandatory explicit confirmation)
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [newDeckTitle, setNewDeckTitle] = useState<string>('');

    // Fetch user's Google Slides presentations from Drive
    const loadDriveDecks = useCallback(async (token: string) => {
        setIsLoadingDecks(true);
        setErrorMsg(null);
        try {
            const files = await fetchUserGoogleSlides(token);
            setUserDecks(files);
            if (files.length > 0 && selectedDeckId === SAMPLE_PRESENTATIONS[0].id) {
                setSelectedDeckId(files[0].id);
                setSelectedDeckTitle(files[0].title);
            }
        } catch (err: any) {
            console.error('Failed to load drive decks:', err);
            setErrorMsg(err.message || 'Could not fetch Google Slides from Drive. You may need to grant permission.');
        } finally {
            setIsLoadingDecks(false);
        }
    }, [selectedDeckId]);

    // Initial check or reload when token becomes available
    useEffect(() => {
        if (accessToken) {
            loadDriveDecks(accessToken);
        }
    }, [accessToken, loadDriveDecks]);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        setErrorMsg(null);
        try {
            const token = await signIn();
            if (token) {
                await loadDriveDecks(token);
                setSuccessMsg(language === 'fi' ? 'Google Workspace yhdistetty onnistuneesti!' : 'Connected to Google Workspace successfully!');
                setTimeout(() => setSuccessMsg(null), 4000);
            }
        } catch (err: any) {
            console.error('Sign-in error:', err);
            setErrorMsg(err.message || 'Google sign-in was cancelled or failed.');
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleLoadCustomUrl = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customUrlInput.trim()) return;

        const extractedId = extractPresentationId(customUrlInput);
        if (extractedId) {
            setSelectedDeckId(extractedId);
            setSelectedDeckTitle('Custom Google Slides Deck');
            setSuccessMsg(language === 'fi' ? 'Esitys ladattu!' : 'Presentation loaded!');
            setTimeout(() => setSuccessMsg(null), 3000);
        }
    };

    const handleCreatePresentation = async () => {
        if (!newDeckTitle.trim()) return;

        const token = accessToken || await getAccessToken();
        if (!token) {
            setErrorMsg(language === 'fi' ? 'Kirjaudu sisään Google-tilillä luodaksesi esityksen.' : 'Please sign in with Google to create a presentation.');
            return;
        }

        setIsCreatingDeck(true);
        setErrorMsg(null);
        try {
            const newDeck = await createGoogleSlidePresentation(newDeckTitle, token);
            setShowCreateModal(false);
            setNewDeckTitle('');
            setSuccessMsg(language === 'fi' ? `Uusi esitys "${newDeck.title}" luotu Google Driveen!` : `New presentation "${newDeck.title}" created in Google Drive!`);
            setSelectedDeckId(newDeck.presentationId);
            setSelectedDeckTitle(newDeck.title);
            // Refresh list from Drive
            await loadDriveDecks(token);
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err: any) {
            console.error('Error creating presentation:', err);
            setErrorMsg(err.message || 'Failed to create Google Slides presentation.');
        } finally {
            setIsCreatingDeck(false);
        }
    };

    const embedUrl = getPresentationEmbedUrl(selectedDeckId);

    return (
        <section id="slides" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/20">
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Google Workspace</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {t.slides.title}
                </h2>
                <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300">
                    {t.slides.subtitle}
                </p>
            </div>

            {/* Notification messages */}
            {successMsg && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-sm font-medium animate-fade-in shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-800 dark:text-rose-200 flex items-center gap-3 text-sm font-medium animate-fade-in shadow-sm">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Google Authentication & Workspace Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-500/20 dark:border-amber-400/20 rounded-2xl p-5 sm:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm shadow-sm">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <Presentation className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                                Google Slides & Drive
                            </h3>
                            {accessToken ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t.slides.connectedAs}
                                </span>
                            ) : null}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-xl">
                            {accessToken 
                                ? (language === 'fi' 
                                    ? `Yhdistetty käyttäjätiliin: ${user?.email || 'Google-käyttäjä'}. Voit selata omia esityksiäsi suoraan Drivesta tai luoda uusia.` 
                                    : `Connected as ${user?.email || 'Google User'}. Browse your presentations directly from Drive or create new decks.`)
                                : t.slides.signInPrompt}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
                    {accessToken ? (
                        <>
                            <button
                                onClick={() => loadDriveDecks(accessToken)}
                                disabled={isLoadingDecks}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm transition-all disabled:opacity-50"
                                title={t.slides.refresh}
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDecks ? 'animate-spin' : ''}`} />
                                <span>{t.slides.refresh}</span>
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t.slides.createSlide}</span>
                            </button>
                        </>
                    ) : (
                        /* Official GSI Material Button styling required by Workspace Skill */
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isSigningIn}
                            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-300 dark:border-gray-600 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            <span>{isSigningIn ? (language === 'fi' ? 'Yhdistetään...' : 'Connecting...') : t.slides.connectGoogle}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Custom URL or Presentation ID Input Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
                <form onSubmit={handleLoadCustomUrl} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder={t.slides.enterUrlOrId}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!customUrlInput.trim()}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
                    >
                        {t.slides.loadSlide}
                    </button>
                </form>
            </div>

            {/* Main Presentation Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left/Main Column: Embedded Google Slides Player */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl">
                        {/* Player Header Bar */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 flex-shrink-0">
                                    <Presentation className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                        {selectedDeckTitle}
                                    </h3>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                        ID: {selectedDeckId}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <a
                                    href={`https://docs.google.com/presentation/d/${selectedDeckId}/edit`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
                                    title={t.slides.openInSlides}
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{t.slides.openInSlides}</span>
                                </a>
                            </div>
                        </div>

                        {/* Responsive 16:9 Google Slides Iframe Container */}
                        <div className="relative w-full aspect-video bg-black/90">
                            <iframe
                                key={selectedDeckId}
                                src={embedUrl}
                                title={selectedDeckTitle}
                                frameBorder="0"
                                width="100%"
                                height="100%"
                                allowFullScreen={true}
                                className="w-full h-full border-0"
                            />
                        </div>

                        {/* Player Footer & Controls */}
                        <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>
                                    {language === 'fi' ? 'Interaktiivinen diaesitys — käytä diojen alareunan nuolia tai näppäimiä' : 'Interactive presentation — use on-screen arrows or keyboard to navigate'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={`https://docs.google.com/presentation/d/${selectedDeckId}/present`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                    <Maximize2 className="w-3 h-3" />
                                    <span>{language === 'fi' ? 'Koko ruutu' : 'Fullscreen'}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Presentation Deck Selector (Drive Decks & Sample Presets) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* User's Google Drive Presentations */}
                    {accessToken && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-amber-500" />
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                        {t.slides.myPresentations}
                                    </h4>
                                </div>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                                    {userDecks.length}
                                </span>
                            </div>

                            {isLoadingDecks ? (
                                <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                                    <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                                    <span>{t.slides.loadingSlides}</span>
                                </div>
                            ) : userDecks.length === 0 ? (
                                <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                    <p>{t.slides.noSlidesFound}</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white font-semibold text-xs shadow-sm hover:bg-amber-600 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>{t.slides.createSlide}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                                    {userDecks.map((deck) => {
                                        const isSelected = selectedDeckId === deck.id;
                                        return (
                                            <button
                                                key={deck.id}
                                                onClick={() => {
                                                    setSelectedDeckId(deck.id);
                                                    setSelectedDeckTitle(deck.title);
                                                }}
                                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                                                    isSelected
                                                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/50 shadow-sm'
                                                        : 'bg-gray-50/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-amber-400/50'
                                                }`}
                                            >
                                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 flex-shrink-0 mt-0.5">
                                                    <Presentation className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                                                        {deck.title}
                                                    </p>
                                                    {deck.modifiedTime && (
                                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{new Date(deck.modifiedTime).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Featured / Sample Portfolio Presentations */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                {t.slides.samplePresentations}
                            </h4>
                        </div>

                        <div className="space-y-3">
                            {SAMPLE_PRESENTATIONS.map((sample) => {
                                const isSelected = selectedDeckId === sample.id;
                                return (
                                    <div
                                        key={sample.id}
                                        onClick={() => {
                                            setSelectedDeckId(sample.id);
                                            setSelectedDeckTitle(sample.title);
                                        }}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                                            isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/20'
                                                : 'bg-gray-50/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-indigo-400/50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-bold text-xs text-gray-900 dark:text-white leading-snug">
                                                {sample.title}
                                            </p>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                {sample.slidesCount} {t.slides.slidesCount}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                                            {sample.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 text-[10px]">
                                            <span className="text-gray-400">Design Case Study</span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                                                {t.slides.viewPresentation} →
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Explicit User Confirmation Modal for Creating Presentations (Workspace Skill Requirement) */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                                <Presentation className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {t.slides.createModalTitle}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t.slides.createModalDesc}
                                </p>
                            </div>
                        </div>

                        <div className="my-5">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                {t.slides.createModalInputLabel}
                            </label>
                            <input
                                type="text"
                                value={newDeckTitle}
                                onChange={(e) => setNewDeckTitle(e.target.value)}
                                placeholder={t.slides.createModalPlaceholder}
                                autoFocus
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {t.slides.createModalCancel}
                            </button>
                            <button
                                type="button"
                                onClick={handleCreatePresentation}
                                disabled={!newDeckTitle.trim() || isCreatingDeck}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isCreatingDeck && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                <span>{t.slides.createModalConfirm}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default GoogleSlidesSection;
