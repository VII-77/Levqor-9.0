"""
Unified AI Service Layer with Optional OpenAI Integration
MEGA-PHASE 8 - Enhanced multilingual AI with GPT-4o-mini only

This module provides a central AI service that:
1. Uses OpenAI API (gpt-4o-mini) when OPENAI_API_KEY is set AND AI_ENABLED != "false"
2. Falls back to existing pattern-based logic when key is missing or API fails
3. Supports multilingual responses (40 languages) when using real AI
4. Never breaks existing behavior - always has a safe fallback
5. Strict cost controls: max_tokens=256, 10s timeout, pricing safety prompts
6. Full metrics tracking for OpenAI calls and errors
"""
import os
import logging
import json
from typing import Dict, Any, Tuple, List, Optional

log = logging.getLogger("levqor.ai.service")

# Try to import OpenAI client class
OPENAI_AVAILABLE = False
OpenAI_Class = None

try:
    from openai import OpenAI as OpenAI_Class
    OPENAI_AVAILABLE = True
    log.info("OpenAI library available - will use when OPENAI_API_KEY is set")
except Exception as e:
    log.warning(f"OpenAI import failed: {e} - using pattern-based fallbacks")


def is_ai_enabled() -> bool:
    """
    Check if AI is enabled based on environment variables.
    
    AI is enabled ONLY if:
    1. OPENAI_API_KEY is set and non-empty
    2. AI_ENABLED is NOT explicitly set to "false" or "0"
    3. OpenAI library is available
    
    Returns:
        bool: True if AI should be used, False for pattern-based fallback
    """
    if not OPENAI_AVAILABLE or not OpenAI_Class:
        return False
    
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return False
    
    ai_enabled = os.getenv("AI_ENABLED", "1").lower().strip()
    if ai_enabled in ("false", "0", "no", "off"):
        log.info("AI explicitly disabled via AI_ENABLED env var")
        return False
    
    return True


def _get_openai_client():
    """
    Get OpenAI client instance, creating it only when API key is valid AND AI is enabled.
    Returns None if key is missing, invalid, or AI is disabled.
    
    CRITICAL: This prevents creating a client with empty API key,
    which would cause auth errors instead of fallback behavior.
    
    MEGA-PHASE 8: Now also checks AI_ENABLED flag
    """
    if not is_ai_enabled():
        return None
    
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    
    try:
        # Set timeout at client level (10s for all requests)
        return OpenAI_Class(api_key=api_key, timeout=10.0)
    except Exception as e:
        log.warning(f"Failed to create OpenAI client: {e}")
        return None


def generate_ai_response(
    task: str,
    language: str,
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Unified AI dispatcher that tries OpenAI first, then falls back to patterns.
    
    MEGA-PHASE 8: Enhanced with full metrics tracking and error handling
    
    Args:
        task: Type of AI task ('chat', 'workflow', 'debug', 'onboarding')
        language: Normalized language code (en, de, fr, es, hi, etc.)
        payload: Task-specific data (query, error, context, etc.)
    
    Returns:
        dict with at least:
        {
            "success": bool,
            "answer" or "steps" or "explanation": str/list,
            "meta": {
                "ai_backend": "openai" | "pattern" | "stub_fallback",
                "language": str
            }
        }
    """
    openai_client = _get_openai_client()
    
    if openai_client:
        try:
            from api.metrics.app import increment_openai_call, increment_openai_error
            
            increment_openai_call()
            result = _call_openai(task, language, payload, openai_client)
            
            result.setdefault("meta", {})
            result["meta"]["ai_backend"] = "openai"
            result["meta"]["language"] = language
            return result
            
        except Exception as e:
            from api.metrics.app import increment_openai_error
            increment_openai_error()
            
            error_msg = str(e)
            if len(error_msg) > 100:
                error_msg = error_msg[:100] + "..."
            
            log.warning(f"OpenAI call failed ({task}, {language}): {error_msg} - falling back")
    
    return _pattern_based_response(task, language, payload)


def _call_openai(
    task: str,
    language: str,
    payload: Dict[str, Any],
    client
) -> Dict[str, Any]:
    """
    Call OpenAI API with cost controls and safety measures.
    
    MEGA-PHASE 8: Enhanced with JSON parsing, pricing safety, and structured outputs
    
    Args:
        task: Task type
        language: Language code
        payload: Task payload
        client: OpenAI client instance (guaranteed to have valid API key, 10s timeout)
    
    Returns:
        Task-specific structured response with success=True
    
    Raises:
        Exception on any error (caught by caller for fallback)
    """
    system_prompt = _build_system_prompt(task, language)
    user_prompt = _build_user_prompt(task, payload)
    
    model_name = os.getenv("AI_MODEL", "gpt-4o-mini")
    
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=256,
        temperature=0.5,
    )
    
    answer = response.choices[0].message.content.strip()
    
    if task == "workflow":
        steps = _parse_workflow_json(answer) or _parse_workflow_steps(answer)
        return {
            "success": True,
            "steps": steps,
            "meta": {
                "ai_backend": "openai",
                "language": language,
                "model": model_name
            }
        }
    
    elif task == "debug":
        parsed = _parse_debug_json(answer)
        if parsed:
            return {
                "success": True,
                "explanation": parsed.get("explanation", answer),
                "steps": parsed.get("steps", []),
                "prevention": parsed.get("prevention", ""),
                "meta": {
                    "ai_backend": "openai",
                    "language": language,
                    "model": model_name
                }
            }
        return {
            "success": True,
            "explanation": answer,
            "steps": [],
            "prevention": "",
            "meta": {
                "ai_backend": "openai",
                "language": language,
                "model": model_name
            }
        }
    
    elif task == "onboarding":
        parsed = _parse_onboarding_json(answer)
        if parsed:
            return {
                "success": True,
                "guidance": parsed.get("guidance", answer),
                "next_step": parsed.get("next_step", ""),
                "meta": {
                    "ai_backend": "openai",
                    "language": language,
                    "model": model_name
                }
            }
        return {
            "success": True,
            "guidance": answer,
            "next_step": _extract_next_step(answer),
            "meta": {
                "ai_backend": "openai",
                "language": language,
                "model": model_name
            }
        }
    
    else:
        return {
            "success": True,
            "answer": answer,
            "meta": {
                "ai_backend": "openai",
                "language": language,
                "model": model_name
            }
        }


def _get_language_name(code: str) -> str:
    """Get human-readable language name from code."""
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
    return lang_names.get(code.lower(), 'English')


def _build_system_prompt(task: str, language: str) -> str:
    """
    Build task and language-aware system prompt with pricing safety.
    
    MEGA-PHASE 8: Enhanced with Blueprint pricing safety and structured output requirements
    """
    base = (
        "You are Levqor AI, an assistant for the Levqor automation platform. "
        "Keep responses concise (under 200 words), business-friendly, and actionable. "
        "CRITICAL PRICING RULES: "
        "- Monthly plans: £9, £29, £59, £149 (Starter/Growth/Business/Agency) "
        "- Annual: £90, £290, £590, £1490 "
        "- 7-day free trial (card required) "
        "- NEVER invent discounts, modify prices, or suggest different amounts. "
        "- If asked about pricing, mention tiers exist and direct to pricing page. "
        "Never execute code, expose secrets, or provide financial advice. "
    )
    
    if language != "en":
        lang_name = _get_language_name(language)
        base += f"Respond in fluent {lang_name}. If unsure, use English. "
    
    task_specifics = {
        "chat": (
            "Answer user questions about workflows, pricing, features, and support. "
            "Be helpful and guide them to the appropriate resources."
        ),
        "workflow": (
            "Help users design automation workflows. "
            "Output numbered steps or JSON format: "
            '{"steps": [{"type": "trigger", "label": "...", "description": "..."}]}. '
            "Focus on workflow logic only - never mention pricing or billing."
        ),
        "debug": (
            "Analyze errors and provide debugging guidance. "
            "Output JSON format: "
            '{"explanation": "...", "steps": [{"action": "...", "description": "..."}], "prevention": "..."}. '
            "Provide specific, actionable suggestions."
        ),
        "onboarding": (
            "Guide new users through their first steps with Levqor. "
            "Output JSON format: "
            '{"guidance": "...", "next_step": "..."}. '
            "Be encouraging and provide clear next actions."
        )
    }
    
    return base + task_specifics.get(task, "Provide helpful assistance.")


def _build_user_prompt(task: str, payload: Dict[str, Any]) -> str:
    """
    Build task-specific user prompt from payload.
    
    MEGA-PHASE 8: Truncates long inputs to prevent excessive token usage
    """
    if task == "chat":
        query = payload.get("query", "")[:500]
        context = payload.get("context", {})
        page = context.get("page", "unknown")
        return f"User question (on {page} page): {query}"
    
    elif task == "workflow":
        description = payload.get("description", "")[:1000]
        return f"Help me create a workflow: {description}"
    
    elif task == "debug":
        error = payload.get("error", "")[:1000]
        context = payload.get("context", {})
        component = context.get("component", "")
        if component:
            return f"Error in {component}: {error}. How do I fix it?"
        return f"I'm getting this error: {error}. How do I fix it?"
    
    elif task == "onboarding":
        current_step = payload.get("current_step", "welcome")
        context = payload.get("context", {})
        progress = context.get("progress", {})
        return f"Onboarding step: {current_step}. Progress: {progress}. What's next?"
    
    return str(payload)[:500]


def _parse_workflow_json(text: str) -> Optional[List[Dict[str, Any]]]:
    """
    Try to parse workflow steps from JSON format.
    
    Expected format: {"steps": [{"type": "...", "label": "...", "description": "..."}]}
    
    Returns:
        List of step dicts if successful, None if parsing fails
    """
    try:
        text_clean = text.strip()
        if text_clean.startswith("```json"):
            text_clean = text_clean[7:]
        if text_clean.startswith("```"):
            text_clean = text_clean[3:]
        if text_clean.endswith("```"):
            text_clean = text_clean[:-3]
        
        data = json.loads(text_clean.strip())
        
        if isinstance(data, dict) and "steps" in data:
            steps = data["steps"]
            if isinstance(steps, list) and len(steps) > 0:
                return steps
        
        return None
    except Exception:
        return None


def _parse_debug_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Try to parse debug response from JSON format.
    
    Expected format: {"explanation": "...", "steps": [...], "prevention": "..."}
    
    Returns:
        Dict with explanation/steps/prevention if successful, None if parsing fails
    """
    try:
        text_clean = text.strip()
        if text_clean.startswith("```json"):
            text_clean = text_clean[7:]
        if text_clean.startswith("```"):
            text_clean = text_clean[3:]
        if text_clean.endswith("```"):
            text_clean = text_clean[:-3]
        
        data = json.loads(text_clean.strip())
        
        if isinstance(data, dict) and "explanation" in data:
            return {
                "explanation": data.get("explanation", ""),
                "steps": data.get("steps", []),
                "prevention": data.get("prevention", "")
            }
        
        return None
    except Exception:
        return None


def _parse_onboarding_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Try to parse onboarding response from JSON format.
    
    Expected format: {"guidance": "...", "next_step": "..."}
    
    Returns:
        Dict with guidance/next_step if successful, None if parsing fails
    """
    try:
        text_clean = text.strip()
        if text_clean.startswith("```json"):
            text_clean = text_clean[7:]
        if text_clean.startswith("```"):
            text_clean = text_clean[3:]
        if text_clean.endswith("```"):
            text_clean = text_clean[:-3]
        
        data = json.loads(text_clean.strip())
        
        if isinstance(data, dict) and ("guidance" in data or "next_step" in data):
            return {
                "guidance": data.get("guidance", ""),
                "next_step": data.get("next_step", "")
            }
        
        return None
    except Exception:
        return None


def _parse_workflow_steps(text: str) -> List[Dict[str, Any]]:
    """Extract numbered steps from OpenAI response."""
    steps = []
    lines = text.split("\n")
    step_num = 1
    
    for line in lines:
        line = line.strip()
        if line and (line[0].isdigit() or line.startswith("-") or line.startswith("•")):
            # Clean step text
            cleaned = line.lstrip("0123456789.-•) ").strip()
            if cleaned:
                steps.append({
                    "step": step_num,
                    "action": cleaned
                })
                step_num += 1
    
    return steps if steps else [{"step": 1, "action": text}]


def _extract_suggestions(text: str) -> List[str]:
    """Extract debugging suggestions from response."""
    suggestions = []
    for line in text.split("\n"):
        line = line.strip()
        if line and (line.startswith("-") or line.startswith("•") or line.startswith("Try")):
            suggestions.append(line.lstrip("-•").strip())
    return suggestions[:3]  # Max 3 suggestions


def _extract_next_step(text: str) -> str:
    """Extract next action from onboarding response."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    return lines[0] if lines else text[:100]


def _get_greeting_prefix(language: str) -> str:
    """
    Get language-appropriate greeting prefix for responses.
    MEGA-PHASE 7: Supports all 9 Tier-1 languages.
    
    Args:
        language: Normalized language code (en, de, fr, es, pt, it, hi, ar, zh-hans)
    
    Returns:
        Greeting string appropriate for the language, empty for English
    """
    greetings = {
        "en": "",  # No prefix for English (default)
        "de": "Hallo! ",  # German
        "fr": "Bonjour! ",  # French
        "es": "¡Hola! ",  # Spanish
        "pt": "Olá! ",  # Portuguese
        "it": "Ciao! ",  # Italian
        "hi": "नमस्ते! ",  # Hindi
        "ar": "مرحباً! ",  # Arabic
        "zh-hans": "你好！",  # Chinese Simplified
    }
    return greetings.get(language.lower(), "")


def _pattern_based_response(
    task: str,
    language: str,
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Fallback to existing pattern-based logic.
    This preserves all existing behavior when OpenAI is not available.
    MEGA-PHASE 7: Now includes language-aware response prefixes.
    """
    if task == "chat":
        return _pattern_chat(payload, language)
    elif task == "workflow":
        return _pattern_workflow(payload, language)
    elif task == "debug":
        return _pattern_debug(payload, language)
    elif task == "onboarding":
        return _pattern_onboarding(payload, language)
    
    return {"success": False, "error": "Unknown task type"}


def _pattern_chat(payload: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
    """Pattern-based chat (existing logic from api/ai/chat.py) with multilingual support."""
    query = payload.get("query", "").lower()
    context = payload.get("context", {})
    greeting = _get_greeting_prefix(language)
    
    if any(word in query for word in ["workflow", "create", "build"]):
        return {
            "success": True,
            "answer": (
                f"{greeting}To create a workflow in Levqor, go to the Workflows section in your dashboard. "
                "You can use our Natural Language Builder to describe what you want in plain English, "
                "or use the visual builder for more control."
            ),
            "steps": [
                {"step": 1, "action": "Navigate to Dashboard → Workflows"},
                {"step": 2, "action": "Click 'New Workflow'"},
                {"step": 3, "action": "Choose Natural Language or Visual mode"}
            ],
            "meta": {"ai_backend": "pattern", "language": language}
        }
    
    elif any(word in query for word in ["pricing", "cost", "price", "plan"]):
        return {
            "success": True,
            "answer": (
                f"{greeting}Levqor offers 4 pricing tiers: Starter (£9/mo), Growth (£29/mo), "
                "Business (£59/mo), and Agency (£149/mo). All plans include a 7-day free trial. "
                "View full details at levqor.ai/pricing"
            ),
            "meta": {"ai_backend": "pattern", "language": language}
        }
    
    elif any(word in query for word in ["trial", "free"]):
        return {
            "success": True,
            "answer": (
                f"{greeting}All Levqor plans include a 7-day free trial. Card required, but you won't be "
                "charged if you cancel before Day 7. Start your trial on the pricing page."
            ),
            "meta": {"ai_backend": "pattern", "language": language}
        }
    
    else:
        return {
            "success": True,
            "answer": (
                f"{greeting}I can help you with workflows, pricing, trials, support, and data management. "
                "For specific questions, please contact our support team."
            ),
            "meta": {"ai_backend": "pattern", "language": language}
        }


def _pattern_workflow(payload: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
    """Pattern-based workflow builder with multilingual support."""
    description = payload.get("description", "").lower()
    greeting = _get_greeting_prefix(language)
    
    return {
        "success": True,
        "steps": [
            {"step": 1, "action": f"{greeting}Define trigger (when should workflow run?)"},
            {"step": 2, "action": "Add conditions (optional filters)"},
            {"step": 3, "action": "Configure actions (what should happen?)"},
            {"step": 4, "action": "Test workflow with sample data"},
            {"step": 5, "action": "Activate workflow"}
        ],
        "meta": {"ai_backend": "pattern", "language": language}
    }


def _pattern_debug(payload: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
    """Pattern-based debug assistance with multilingual support."""
    error = payload.get("error", "").lower()
    greeting = _get_greeting_prefix(language)
    
    steps = [
        {"action": "Check your workflow configuration for missing fields"},
        {"action": "Verify API credentials and permissions"},
        {"action": "Review recent changes to the workflow"},
        {"action": "Check system status at levqor.ai/status"}
    ]
    
    return {
        "success": True,
        "explanation": f"{greeting}Based on the error, here are some debugging steps to try.",
        "steps": steps,
        "prevention": "Implement proper error handling and validation to prevent this issue.",
        "meta": {"ai_backend": "pattern", "language": language}
    }


def _pattern_onboarding(payload: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
    """Pattern-based onboarding guidance with multilingual support."""
    current_step = payload.get("current_step", 0)
    greeting = _get_greeting_prefix(language)
    
    steps_map = {
        0: f"{greeting}Welcome! Let's get you started by creating your first workflow.",
        1: f"{greeting}Great! Now connect your first integration (email, Slack, or CRM).",
        2: f"{greeting}Perfect! Test your workflow with sample data to make sure it works.",
        3: f"{greeting}Excellent! You're ready to activate your workflow and automate."
    }
    
    guidance = steps_map.get(current_step, f"{greeting}Continue exploring Levqor features!")
    
    return {
        "success": True,
        "guidance": guidance,
        "next_step": guidance,
        "meta": {"ai_backend": "pattern", "language": language}
    }
