import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenAI(apiKey);
// Using gemini-1.5-flash for high availability and speed
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * System prompt that guides the Gemini model to provide personalized financial advice
 */
const getSystemPrompt = (userContext) => {
  const { occupation, ageGroup, primaryGoal } = userContext;

  return `You are MoneyMitra, a personalized financial advisor chatbot. You provide tailored financial advice for a ${occupation} in the ${ageGroup} age group with a goal to ${primaryGoal === 'save' ? 'Save Money' : primaryGoal === 'debt' ? 'Manage Debt' : 'Learn Financial Basics'}.

### SPECIAL FEATURE TRIGGERS:
1. **The Budget Starter**: If the user asks for a "budget," "template," "breakdown," or "plan," you MUST generate a structured Markdown Table.
   - Adjust categories based on their occupation (e.g., for Students, include "Course Material").
   - Use the 50/30/20 rule as a default guideline.

2. **The Opportunity Cost Analyzer (Latte Factor)**: If the user mentions a daily expense or "habit," you MUST:
   - Calculate daily, monthly, and 10-year costs.
   - Calculate "Opportunity Cost" at 8% annual return over 10 years.
   - Wrap the final impact in: '> 💡 **Aha! Moment:**'

3. **The Impulse Purchase Mirror**: If the user uses "mirror a purchase":
   - Calculate Work Hours based on ${occupation} and Growth Sacrifice at 10% return over 10 years.
   - Header: "### Purchase Mirror Reality Check".

### CRITICAL SCOPE CHECK:
If the question is NOT related to personal finance or is too vague, respond ONLY with the [OUT_OF_SCOPE] block.

### RESPONSE GUIDELINES:
- **Use Markdown Tables** for budgets.
- **Bold** all critical financial impact numbers.
- **Personalize**: ${occupation === 'Student' ? 'Focus on low income habits.' : 'Focus on emergency funds.'}
- **Mandatory Disclaimer**: End with: *Remember: This is educational information, not professional financial advice.*

[OUT_OF_SCOPE]
I'm MoneyMitra, a financial advisor chatbot designed specifically to help with financial questions. I can help you with budgeting, saving, and understanding financial concepts.
[END_OUT_OF_SCOPE]`;
};

/**
 * Helper to extract response text safely
 */
const isOutOfScope = (text) => text.includes('[OUT_OF_SCOPE]') && text.includes('[END_OUT_OF_SCOPE]');

const extractOutOfScopeMessage = (text) => {
  const start = text.indexOf('[OUT_OF_SCOPE]') + '[OUT_OF_SCOPE]'.length;
  const end = text.indexOf('[END_OUT_OF_SCOPE]');
  return text.substring(start, end).trim();
};

const buildConversationContext = (conversationHistory, maxMessages = 10) => {
  if (!conversationHistory || conversationHistory.length === 0) return '';
  const recentMessages = conversationHistory.slice(-maxMessages);
  const historyText = recentMessages.map(msg => `${msg.role === 'user' ? 'User' : 'MoneyMitra'}: ${msg.text}`).join('\n\n');
  return `\n\n--- Previous Conversation ---\n${historyText}\n--- End of Previous Conversation ---\n\n`;
};

/**
 * Main Chat function
 */
export const fetchGeminiResponse = async (userMessage, userContext, conversationHistory = []) => {
  try {
    if (!apiKey) throw new Error('API key is not configured.');

    const systemPrompt = getSystemPrompt(userContext);
    const conversationContext = buildConversationContext(conversationHistory);

    const fullPrompt = conversationHistory.length > 0
      ? `${systemPrompt}${conversationContext}Current User Question: ${userMessage}\n\nIMPORTANT: Consider the context above.`
      : `${systemPrompt}\n\nUser Question: ${userMessage}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();

    if (isOutOfScope(text)) {
      text = extractOutOfScopeMessage(text);
    }

    return text;
  } catch (error) {
    console.error('Error:', error);
    if (error.message.includes('quota')) throw new Error('⏳ API quota exceeded. Please wait a moment.');
    throw new Error(`Failed to get response: ${error.message}`);
  }
};

/**
 * Learning Hub: Fallback Lesson
 */
const getFallbackLesson = (userContext, currentLevel) => {
  const lessonBank = [
    {
      title: 'Mastering the 50/30/20 Rule',
      content: `The **50/30/20 rule** helps with cash flow. 50% Needs, 30% Wants, 20% Savings.`,
      quiz: {
        question: 'Which bucket is for long-term wealth?',
        options: ['Needs', 'Savings (20%)', 'Wants', 'Entertainment'],
        correctIndex: 1,
        explanation: 'The 20% bucket builds wealth.'
      }
    }
  ];
  return lessonBank[(Math.max(1, currentLevel) - 1) % lessonBank.length];
};

/**
 * Learning Hub: Generate Lesson
 */
export const generateLesson = async (userContext, currentLevel) => {
  try {
    if (!apiKey) throw new Error('API key missing');

    const prompt = `You are a financial educator. Create Level ${currentLevel} lesson for a ${userContext.occupation}. 
    Return ONLY raw JSON matching:
    {
      "title": "string",
      "content": "string (markdown)",
      "quiz": { "question": "string", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "string" }
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // Safety JSON extraction
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Lesson Gen Error:', error);
    return getFallbackLesson(userContext, currentLevel);
  }
};

export default { fetchGeminiResponse, generateLesson };
