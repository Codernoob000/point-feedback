import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import httpx
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()
load_dotenv(Path(__file__).resolve().parent.parent.parent.parent / ".env")
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

logger = logging.getLogger("point_feedback.ai")


class AIService:
    @staticmethod
    async def analyze_feedback(
        comment: str,
        selector: str,
        target_text: Optional[str] = None,
        sentiment: str = "neutral",
        viewport_width: int = 1920,
        dom_hierarchy: Optional[list] = None
    ) -> Dict[str, str]:
        """
        Generates Issue Summary, Category, Priority, and Transcript.
        Uses Groq LLM if GROQ_API_KEY is available; otherwise applies intelligent developer heuristics.
        """
        groq_api_key = os.getenv("GROQ_API_KEY", "").strip()

        if groq_api_key:
            models_to_try = [
                os.getenv("GROQ_MODEL", "").strip(),
                "openai/gpt-oss-120b",
                "qwen/qwen3.8-27b",
                "openai/gpt-oss-20b",
                "llama-3.3-70b-versatile"
            ]
            # Deduplicate and remove empty
            models_to_try = [m for i, m in enumerate(models_to_try) if m and m not in models_to_try[:i]]

            prompt = f"""
You are a senior frontend engineer triaging visual feedback.

Feedback Comment: "{comment}"
Target Selector: "{selector}"
Element Text: "{target_text or ''}"
User Sentiment: "{sentiment}"
Viewport Width: {viewport_width}px
DOM Hierarchy: {" > ".join(dom_hierarchy) if dom_hierarchy else selector}

Respond in pure, valid JSON with no markdown wrapping:
{{
  "summary": "A concise, developer-grade ticket title (e.g. 'Checkout button unresponsive on iOS Safari')",
  "category": "One of: UI Bug, Performance, Accessibility, Feature Request",
  "priority": "One of: Low, Medium, High",
  "transcript": "A clear, polished transcription of the user's issue or null if none needed"
}}
""".strip()

            for model_name in models_to_try:
                try:
                    async with httpx.AsyncClient(timeout=20.0) as client:
                        resp = await client.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers={
                                "Authorization": f"Bearer {groq_api_key}",
                                "Content-Type": "application/json"
                            },
                            json={
                                "model": model_name,
                                "messages": [
                                    {
                                        "role": "system",
                                        "content": "You are a senior frontend engineer triaging visual feedback. Always respond with pure, valid JSON."
                                    },
                                    {
                                        "role": "user",
                                        "content": prompt
                                    }
                                ],
                                "temperature": 0.2
                            }
                        )

                        if resp.status_code == 200:
                            data = resp.json()
                            raw_content = data["choices"][0]["message"]["content"].strip()

                            # Clean potential markdown fences
                            if raw_content.startswith("```"):
                                parts = raw_content.split("```")
                                if len(parts) >= 2:
                                    raw_content = parts[1]
                                    if raw_content.startswith("json"):
                                        raw_content = raw_content[4:]
                                raw_content = raw_content.strip()

                            result = json.loads(raw_content)

                            # Validate and normalize category
                            cat = result.get("category", "UI Bug")
                            cat_lower = str(cat).lower()
                            if "perf" in cat_lower:
                                category = "Performance"
                            elif "access" in cat_lower or "a11y" in cat_lower:
                                category = "Accessibility"
                            elif "feature" in cat_lower or "request" in cat_lower or "wish" in cat_lower:
                                category = "Feature Request"
                            else:
                                category = "UI Bug"

                            # Normalize priority to lowercase for database schema consistency
                            prio = result.get("priority", "medium").lower()
                            if "high" in prio or "crit" in prio:
                                priority = "high"
                            elif "low" in prio:
                                priority = "low"
                            else:
                                priority = "medium"

                            summary = result.get("summary") or f"Issue on {selector}"
                            transcript = result.get("transcript") or (f'"{comment}"' if comment else None)

                            return {
                                "summary": summary[:150],
                                "category": category,
                                "priority": priority,
                                "transcript": transcript
                            }
                        else:
                            logger.warning(
                                "Groq model %s returned status %d: %s. Trying next candidate...",
                                model_name,
                                resp.status_code,
                                resp.text[:120]
                            )
                except Exception as ex:
                    logger.warning("Groq AI attempt with model %s failed: %s", model_name, ex)
                    continue

        # =========================================================================
        # Intelligent Heuristic Fallback Engine
        # =========================================================================
        c_lower = (comment or "").lower()
        is_mobile = viewport_width < 768

        # 1. Determine Category
        if any(w in c_lower for w in ["slow", "lag", "delay", "freeze", "loading", "latency", "hang", "fps"]):
            category = "Performance"
        elif any(w in c_lower for w in ["contrast", "screen reader", "tab", "aria", "color", "font size", "read", "blind", "a11y"]):
            category = "Accessibility"
        elif any(w in c_lower for w in ["add", "wish", "feature", "suggest", "would be nice", "can we have", "idea", "missing"]):
            category = "Feature Request"
        else:
            category = "UI Bug"

        # 2. Determine Priority
        if sentiment == "angry" or any(w in c_lower for w in ["broken", "crash", "cant click", "cannot submit", "error", "fail", "lost money", "blocker", "critical", "unresponsive"]):
            priority = "high"
        elif sentiment == "loved" or category == "Feature Request":
            priority = "low"
        else:
            priority = "medium"

        # 3. Generate Concise Developer Summary
        element_clean = selector.split(" > ")[-1].replace("#", " #").replace(".", " .").strip()
        if target_text and len(target_text.strip()) > 0 and len(target_text.strip()) < 30:
            target_desc = f"'{target_text.strip()}' element"
        else:
            target_desc = f"{element_clean}"

        device_desc = "on mobile" if is_mobile else ""

        if comment.strip():
            short_comment = comment.split(".")[0].strip()
            summary = f"{target_desc}: {short_comment} {device_desc}".strip()
        else:
            summary = f"Visual feedback on {target_desc} {device_desc}".strip()

        transcript = f'"{comment}"' if comment else "Contextual voice note recorded."

        return {
            "summary": summary[:120],
            "category": category,
            "priority": priority,
            "transcript": transcript
        }
