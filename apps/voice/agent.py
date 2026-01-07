"""
WA3i Voice Agent - Custom agent using OpenRouter for Arabic support
"""

from typing import Optional, Tuple
import openai
from vocode.streaming.agent.base_agent import BaseAgent, RespondAgent
from vocode.streaming.models.agent import AgentConfig
from pydantic import Field
import config


class WA3iAgentConfig(AgentConfig, type="wa3i_agent"):
    """Configuration for WA3i Voice Agent"""
    model: str = "anthropic/claude-3-haiku"  # Fast and good for conversation
    language: str = "ar"  # Default to Arabic
    system_prompt: str = Field(
        default="""أنت WA3i، مساعد ذكاء اصطناعي متخصص في الصحة النفسية والتحليل المعرفي.

مهمتك:
- مساعدة المستخدمين على فهم أنماط تفكيرهم
- تحديد التحيزات المعرفية
- تقديم رؤى مخصصة للتطوير الشخصي
- دعم التعافي من الإدمان وتحديد المحفزات العاطفية

كن:
- متعاطفاً ومتفهماً
- محترماً وغير حكمي
- موجزاً في ردودك الصوتية (جملتين إلى ثلاث جمل كحد أقصى)
- داعماً ومشجعاً

تحدث بالعربية الفصحى البسيطة."""
    )
    temperature: float = 0.7
    max_tokens: int = 150  # Keep responses short for voice


class WA3iAgent(RespondAgent[WA3iAgentConfig]):
    """WA3i Voice Agent using OpenRouter"""

    def __init__(self, agent_config: WA3iAgentConfig):
        super().__init__(agent_config)

        # Configure OpenRouter client (OpenAI compatible)
        self.client = openai.AsyncOpenAI(
            api_key=config.OPENROUTER_API_KEY,
            base_url=config.OPENROUTER_BASE_URL,
        )
        self.conversation_history = []

    async def respond(
        self,
        human_input: str,
        conversation_id: str,
        is_interrupt: bool = False,
    ) -> Tuple[str, bool]:
        """Generate response using OpenRouter"""

        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": human_input
        })

        # Keep conversation history manageable
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]

        messages = [
            {"role": "system", "content": self.agent_config.system_prompt},
            *self.conversation_history
        ]

        try:
            response = await self.client.chat.completions.create(
                model=self.agent_config.model,
                messages=messages,
                temperature=self.agent_config.temperature,
                max_tokens=self.agent_config.max_tokens,
                extra_headers={
                    "HTTP-Referer": "https://wa3i.app",
                    "X-Title": "WA3i Voice Agent"
                }
            )

            assistant_message = response.choices[0].message.content

            # Add assistant response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })

            return assistant_message, False

        except Exception as e:
            error_msg = "عذراً، حدث خطأ. هل يمكنك تكرار ذلك؟" if self.agent_config.language == "ar" else "Sorry, an error occurred. Can you repeat that?"
            return error_msg, False

    async def generate_response(
        self,
        human_input: str,
        conversation_id: str,
        is_interrupt: bool = False,
    ) -> str:
        """Wrapper for respond method"""
        response, _ = await self.respond(human_input, conversation_id, is_interrupt)
        return response


# English version of the agent
class WA3iEnglishAgentConfig(WA3iAgentConfig, type="wa3i_english_agent"):
    """English configuration for WA3i Voice Agent"""
    language: str = "en"
    system_prompt: str = Field(
        default="""You are WA3i, an AI assistant specialized in mental health and cognitive analysis.

Your mission:
- Help users understand their thought patterns
- Identify cognitive biases
- Provide personalized insights for personal development
- Support addiction recovery and identify emotional triggers

Be:
- Empathetic and understanding
- Respectful and non-judgmental
- Concise in your voice responses (2-3 sentences max)
- Supportive and encouraging

Speak in clear, simple English."""
    )
