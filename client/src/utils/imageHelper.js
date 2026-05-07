const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Resolve image URL - handles both Cloudinary full URLs and legacy local filenames.
 * @param {string} value - Could be a full URL (https://...) or a local filename
 * @param {'logo'|'avatars'|'industries'|'blogs'|'cv'} folder - Local upload folder (for legacy)
 * @returns {string|null} Full URL or null
 */
export function getImageUrl(value, folder = 'logo') {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value; // Already a full URL (Cloudinary)
    }
    // Legacy: local file
    return `${API_URL}/uploads/${folder}/${value}`;
}
