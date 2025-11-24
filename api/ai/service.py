"""
Unified AI Service Layer with Optional OpenAI Integration
MEGA-PHASE 6 - Real AI backend support (optional, env-flagged)

This module provides a central AI service that:
1. Uses OpenAI API when OPENAI_API_KEY is set (cost-controlled)
2. Falls back to existing pattern-based logic when key is missing or API fails
3. Supports multilingual responses when using real AI
4. Never breaks existing behavior - always has a safe fallback
"""
import os
import logging
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


def _get_openai_client():
    """
    Get OpenAI client instance, creating it only when API key is valid.
    Returns None if key is missing or invalid.
    
    CRITICAL: This prevents creating a client with empty API key,
    which would cause auth errors instead of fallback behavior.
    """
    if not OPENAI_AVAILABLE or not OpenAI_Class:
        return None
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or not api_key.strip():
        return None
    
    try:
        return OpenAI_Class(api_key=api_key.strip())
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
                "ai_backend": "openai" | "pattern",
                "language": str
            }
        }
    """
    # CRITICAL FIX: Get client instance (only created if API key is valid)
    openai_client = _get_openai_client()
    
    # Try OpenAI only if we have a valid client (which means valid API key)
    if openai_client:
        try:
            return _call_openai(task, language, payload, openai_client)
        except Exception as e:
            log.warning(f"OpenAI call failed: {e} - falling back to patterns")
    
    # Fallback to pattern-based logic (default behavior when no key or on error)
    return _pattern_based_response(task, language, payload)


def _call_openai(
    task: str,
    language: str,
    payload: Dict[str, Any],
    client
) -> Dict[str, Any]:
    """
    Call OpenAI API with cost controls and safety measures.
    
    Args:
        task: Task type
        language: Language code
        payload: Task payload
        client: OpenAI client instance (guaranteed to have valid API key)
    """
    # Build task-specific prompt
    system_prompt = _build_system_prompt(task, language)
    user_prompt = _build_user_prompt(task, payload)
    
    # Call OpenAI with cost controls
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # Cheap model
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=256,  # Cost control
        temperature=0.4,  # Focused responses
    )
    
    answer = response.choices[0].message.content.strip()
    
    # Format based on task type
    if task == "workflow":
        return {
            "success": True,
            "steps": _parse_workflow_steps(answer),
            "meta": {
                "ai_backend": "openai",
                "language": language,
                "model": "gpt-4o-mini"
            }
        }
    elif task == "debug":
        return {
            "success": True,
            "explanation": answer,
            "suggestions": _extract_suggestions(answer),
            "meta": {
                "ai_backend": "openai",
                "language": language
            }
        }
    elif task == "onboarding":
        return {
            "success": True,
            "guidance": answer,
            "next_step": _extract_next_step(answer),
            "meta": {
                "ai_backend": "openai",
                "language": language
            }
        }
    else:  # chat
        return {
            "success": True,
            "answer": answer,
            "meta": {
                "ai_backend": "openai",
                "language": language
            }
        }


def _build_system_prompt(task: str, language: str) -> str:
    """Build task and language-aware system prompt."""
    base = (
        "You are Levqor AI, an assistant for the Levqor automation platform. "
        "Keep responses concise (under 200 words), business-friendly, and actionable. "
        "Never execute code, expose secrets, or provide financial advice. "
    )
    
    if language != "en":
        lang_names = {
            "de": "German", "fr": "French", "es": "Spanish",
            "hi": "Hindi", "ar": "Arabic", "zh-hans": "Chinese (Simplified)"
        }
        lang_name = lang_names.get(language, language.upper())
        base += f"Respond in {lang_name}. "
    
    task_specifics = {
        "chat": "Answer user questions about workflows, pricing, features, and support.",
        "workflow": "Help users design automation workflows. Provide clear, numbered steps.",
        "debug": "Analyze errors and provide debugging guidance with specific suggestions.",
        "onboarding": "Guide new users through their first steps with Levqor."
    }
    
    return base + task_specifics.get(task, "Provide helpful assistance.")


def _build_user_prompt(task: str, payload: Dict[str, Any]) -> str:
    """Build task-specific user prompt from payload."""
    if task == "chat":
        query = payload.get("query", "")
        context = payload.get("context", {})
        page = context.get("page", "unknown")
        return f"User question (on {page} page): {query}"
    
    elif task == "workflow":
        description = payload.get("description", "")
        return f"Help me create a workflow: {description}"
    
    elif task == "debug":
        error = payload.get("error", "")
        return f"I'm getting this error: {error}. How do I fix it?"
    
    elif task == "onboarding":
        current_step = payload.get("current_step", 0)
        return f"I'm at onboarding step {current_step}. What should I do next?"
    
    return str(payload)


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
    
    suggestions = [
        "Check your workflow configuration for missing fields",
        "Verify API credentials and permissions",
        "Review recent changes to the workflow",
        "Check system status at levqor.ai/status"
    ]
    
    return {
        "success": True,
        "explanation": f"{greeting}Based on the error, here are some debugging steps to try.",
        "suggestions": suggestions,
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
