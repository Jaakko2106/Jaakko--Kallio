/**
 * Google Slides & Google Drive Workspace Integration Service
 */

export interface GoogleSlidePresentationItem {
    id: string;
    title: string;
    thumbnailLink?: string;
    webViewLink?: string;
    modifiedTime?: string;
    slidesCount?: number;
    isPreset?: boolean;
    description?: string;
}

export interface GoogleSlidePage {
    objectId: string;
    pageElementsCount?: number;
}

export interface GoogleSlideDetails {
    presentationId: string;
    title: string;
    slides: GoogleSlidePage[];
    revisionId?: string;
}

// Default curated portfolio & design presentation presets
export const SAMPLE_PRESENTATIONS: GoogleSlidePresentationItem[] = [
    {
        id: '1u3Z1m9L9pT8hX2a4q7E1N0M3c7K4l8P0q', // Sample placeholder / fallback
        title: 'Brand Identity & Visual Storytelling Guide',
        description: 'Comprehensive brand standards, typography hierarchy, and logo applications deck.',
        slidesCount: 14,
        isPreset: true,
        modifiedTime: '2024-11-15T12:00:00.000Z',
    },
    {
        id: '12d3F4G5H6J7K8L9M0N1P2Q3R4S5T6U7V8W',
        title: 'Cinema Julia 1&2 Operational Rebrand Pitch',
        description: 'Case study presentation exploring digital cinema signage, ticketing UX, and promotional campaigns.',
        slidesCount: 18,
        isPreset: true,
        modifiedTime: '2024-10-20T10:30:00.000Z',
    },
    {
        id: '1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2w',
        title: 'Graphic Design Portfolio & Creative Case Studies',
        description: 'Curated selection of print, digital illustration, and brand identity projects.',
        slidesCount: 22,
        isPreset: true,
        modifiedTime: '2024-09-05T08:15:00.000Z',
    }
];

/**
 * Extracts a presentation ID from a Google Slides URL or returns the clean ID
 */
export function extractPresentationId(input: string): string {
    const trimmed = input.trim();
    // Match /d/{presentationId} in typical docs.google.com/presentation/d/... URLs
    const urlMatch = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
    }
    // Also match embed or pub URLs
    const pubMatch = trimmed.match(/\/presentation\/d\/e\/([a-zA-Z0-9-_]+)/);
    if (pubMatch && pubMatch[1]) {
        return pubMatch[1];
    }
    // If it's already an ID, strip parameters
    return trimmed.split('?')[0].split('#')[0];
}

/**
 * Generates an iframe embed URL for responsive viewing
 */
export function getPresentationEmbedUrl(presentationId: string, autoPlay: boolean = false, delayMs: number = 3000): string {
    const cleanId = extractPresentationId(presentationId);
    return `https://docs.google.com/presentation/d/${cleanId}/embed?start=${autoPlay}&loop=false&delayms=${delayMs}`;
}

/**
 * Fetches user's presentations from Google Drive using drive.readonly scope
 */
export async function fetchUserGoogleSlides(accessToken: string): Promise<GoogleSlidePresentationItem[]> {
    try {
        const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.presentation' and trashed = false");
        const fields = encodeURIComponent("files(id, name, thumbnailLink, webViewLink, createdTime, modifiedTime, description)");
        const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=20&orderBy=modifiedTime desc`;

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('Failed to fetch Drive files:', errorData);
            throw new Error(errorData.error?.message || `Google Drive API error (${res.status})`);
        }

        const data = await res.json();
        const files = data.files || [];

        return files.map((file: any) => ({
            id: file.id,
            title: file.name || 'Untitled Presentation',
            thumbnailLink: file.thumbnailLink,
            webViewLink: file.webViewLink || `https://docs.google.com/presentation/d/${file.id}/edit`,
            modifiedTime: file.modifiedTime,
            description: file.description,
            isPreset: false,
        }));
    } catch (err) {
        console.error('Error fetching Google Slides presentations from Drive:', err);
        throw err;
    }
}

/**
 * Fetches presentation details via Google Slides API using presentations.readonly scope
 */
export async function fetchPresentationDetails(presentationId: string, accessToken: string): Promise<GoogleSlideDetails> {
    const cleanId = extractPresentationId(presentationId);
    const url = `https://slides.googleapis.com/v1/presentations/${cleanId}`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Google Slides API error (${res.status})`);
    }

    const data = await res.json();
    return {
        presentationId: data.presentationId,
        title: data.title,
        slides: (data.slides || []).map((slide: any) => ({
            objectId: slide.objectId,
            pageElementsCount: slide.pageElements ? slide.pageElements.length : 0,
        })),
        revisionId: data.revisionId,
    };
}

/**
 * Creates a new blank Google Slides presentation via Slides API
 * (Requires explicit user confirmation before calling)
 */
export async function createGoogleSlidePresentation(title: string, accessToken: string): Promise<{ presentationId: string; title: string }> {
    const url = `https://slides.googleapis.com/v1/presentations`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title.trim() || 'New Portfolio Presentation',
        }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to create presentation (${res.status})`);
    }

    const data = await res.json();
    return {
        presentationId: data.presentationId,
        title: data.title,
    };
}
