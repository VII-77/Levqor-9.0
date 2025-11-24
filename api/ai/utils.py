"""
AI Utilities for Language Validation and Common Helpers
MEGA-PHASE 4B - Multilingual AI UX Backend Integration
"""

# All supported language codes (matching frontend src/config/languages.ts)
ALLOWED_LANG_CODES = {
    # Core routed locales (full translation support)
    'en', 'de', 'fr', 'es',
    # European languages
    'pt', 'it', 'nl', 'sv', 'no', 'da',
    'fi', 'pl', 'cs', 'sk', 'hu',
    'ro', 'bg', 'el', 'ru', 'uk',
    # Middle Eastern languages
    'tr', 'ar', 'he', 'fa', 'ur',
    # South Asian languages
    'hi', 'bn', 'ta', 'te', 'ml',
    'pa', 'gu',
    # East Asian languages
    'zh-hans', 'zh-hant',
    'ja', 'ko',
    # Southeast Asian languages
    'vi', 'id', 'ms', 'th'
}

def normalize_language(lang):
    """
    Normalize and validate a language code.
    
    Args:
        lang: Language code (can be None, empty, or invalid)
    
    Returns:
        str: Normalized language code (en, de, fr, es, hi, etc.) or 'en' as fallback
    
    Safety:
        - Handles None, empty strings, and unexpected types
        - Always returns a valid, safe language code
        - Converts to lowercase for consistency
    """
    # Handle None or non-string types
    if not lang or not isinstance(lang, str):
        return 'en'
    
    # Normalize to lowercase and strip whitespace
    normalized = lang.lower().strip()
    
    # Validate against allowed codes
    if normalized in ALLOWED_LANG_CODES:
        return normalized
    
    # Fallback to English for unknown codes
    return 'en'


def get_language_display_name(lang_code):
    """
    Get a human-readable display name for a language code.
    Useful for logging and debugging.
    
    Args:
        lang_code: Normalized language code
    
    Returns:
        str: Display name (e.g., 'English', 'Hindi', 'Arabic')
    """
    lang_names = {
        'en': 'English', 'de': 'German', 'fr': 'French', 'es': 'Spanish',
        'pt': 'Portuguese', 'it': 'Italian', 'nl': 'Dutch', 'sv': 'Swedish',
        'no': 'Norwegian', 'da': 'Danish', 'fi': 'Finnish', 'pl': 'Polish',
        'cs': 'Czech', 'sk': 'Slovak', 'hu': 'Hungarian', 'ro': 'Romanian',
        'bg': 'Bulgarian', 'el': 'Greek', 'ru': 'Russian', 'uk': 'Ukrainian',
        'tr': 'Turkish', 'ar': 'Arabic', 'he': 'Hebrew', 'fa': 'Persian',
        'ur': 'Urdu', 'hi': 'Hindi', 'bn': 'Bengali', 'ta': 'Tamil',
        'te': 'Telugu', 'ml': 'Malayalam', 'pa': 'Punjabi', 'gu': 'Gujarati',
        'zh-hans': 'Chinese (Simplified)', 'zh-hant': 'Chinese (Traditional)',
        'ja': 'Japanese', 'ko': 'Korean', 'vi': 'Vietnamese',
        'id': 'Indonesian', 'ms': 'Malay', 'th': 'Thai'
    }
    return lang_names.get(lang_code, 'Unknown')
