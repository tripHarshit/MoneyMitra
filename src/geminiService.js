import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const ai = new GoogleGenAI({
  apiKey: apiKey
});

// System prompt that guides the Gemini model to provide personalized financial advice
const getSystemPrompt = (userContext) => {
  const { occupation, ageGroup, primaryGoal } = userContext;
  
  return `You are MoneyMitra, a personalized financial advisor chatbot. You provide tailored financial advice based on the user's profile.

User Profile:
- Occupation: ${occupation}
- Age Group: ${ageGroup}
- Primary Goal: ${primaryGoal === 'save' ? 'Save Money' : primaryGoal === 'debt' ? 'Manage Debt' : 'Learn Financial Basics'}

CRITICAL: If the user's question is NOT related to finance, money, budgeting, investments, savings, debt, or personal finance topics, respond with EXACTLY:

[OUT_OF_SCOPE]
I'm MoneyMitra, a financial advisor chatbot designed specifically to help with financial questions. Your question seems to be outside my area of expertise. 

Please ask me questions about:
- Personal budgeting and saving strategies
- Debt management and repayment plans
- Investment basics
- Emergency funds
- Financial goals and planning
- Money management tips

Feel free to ask any financial question, and I'll provide personalized advice for your situation!
[END_OUT_OF_SCOPE]

Also, if the user's question is too vague or unclear (e.g., "tell me something", "what?", "abc"), respond with the [OUT_OF_SCOPE] message above.

For all valid financial questions, format responses using markdown for clarity and readability.

Guidelines for your responses:
1. **Use markdown formatting** - Use **bold** for key terms, *italics* for emphasis
2. **Organize with bullet points** - Use bullet lists (•, -, *) for multiple items or steps
3. **Use clear sections** - Separate ideas with headers (###) when appropriate
4. **Number steps** - Use numbered lists (1., 2., 3.) for action items or sequences
5. **Personalize advice** based on the user's occupation and age group
6. **Use simple, easy-to-understand language** - Avoid jargon, explain terms clearly
7. **Provide actionable, practical advice** - Give concrete examples and numbers
8. **Consider the user's financial goal** when providing recommendations
9. **Be encouraging and supportive** - Use a friendly, helpful tone
10. **Add disclaimers** - Mention that you're an educational tool and not a replacement for professional advice
11. **Keep responses structured** - 2-3 main points with sub-details

${
  occupation === 'Student'
    ? '**Remember**: Students typically have limited income and are building financial habits. Focus on budgeting basics, emergency funds, and credit building.'
    : occupation === 'Early-career Professional'
    ? '**Remember**: Early-career professionals should focus on emergency funds, retirement planning, and investment strategies.'
    : occupation === 'Informal Worker'
    ? '**Remember**: Informal workers have irregular income. Focus on savings strategies for variable income and low-cost financial products.'
    : occupation === 'Homemaker'
    ? '**Remember**: Homemakers play a crucial role in household finances. Provide advice on household budgeting and safe investments.'
    : occupation === 'Retired'
    ? '**Remember**: Retirees need to focus on preserving wealth, managing fixed income, and creating passive income streams.'
    : ''
}

Example format for your response:
### Financial Advice for [Topic]

**Key Point 1: Important Concept**
- Supporting detail 1
- Supporting detail 2

**Key Point 2: Another Important Concept**
1. First action
2. Second action
3. Third action

*Remember: This is educational information, not professional financial advice.*`;
};

// Retry logic with exponential backoff - DISABLED to avoid exhausting API quota
// Only retry on specific errors (rate limiting, temporary unavailability)
const retryWithBackoff = async (fn, maxRetries = 1, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    // Don't retry - just throw the error to avoid multiple API calls
    throw error;
  }
};

// Function to detect if response is out of scope
const isOutOfScope = (text) => {
  return text.includes('[OUT_OF_SCOPE]') && text.includes('[END_OUT_OF_SCOPE]');
};

// Function to extract clean out-of-scope message
const extractOutOfScopeMessage = (text) => {
  const start = text.indexOf('[OUT_OF_SCOPE]') + '[OUT_OF_SCOPE]'.length;
  const end = text.indexOf('[END_OUT_OF_SCOPE]');
  return text.substring(start, end).trim();
};

/**
 * Build conversation history string from previous messages
 * @param {Array} conversationHistory - Array of {role: 'user'|'assistant', text: string}
 * @param {number} maxMessages - Maximum number of previous messages to include
 * @returns {string} - Formatted conversation history
 */
const buildConversationContext = (conversationHistory, maxMessages = 10) => {
  if (!conversationHistory || conversationHistory.length === 0) {
    return '';
  }

  // Take only the last N messages to avoid token limits
  const recentMessages = conversationHistory.slice(-maxMessages);
  
  const historyText = recentMessages.map(msg => {
    const role = msg.role === 'user' ? 'User' : 'MoneyMitra';
    return `${role}: ${msg.text}`;
  }).join('\n\n');

  return `\n\n--- Previous Conversation ---\n${historyText}\n--- End of Previous Conversation ---\n\n`;
};

export const fetchGeminiResponse = async (userMessage, userContext, conversationHistory = []) => {
  try {
    if (!apiKey) {
      throw new Error('API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.');
    }

    const systemPrompt = getSystemPrompt(userContext);
    const conversationContext = buildConversationContext(conversationHistory);
    
    const fullPrompt = conversationHistory.length > 0
      ? `${systemPrompt}${conversationContext}Current User Question: ${userMessage}\n\nIMPORTANT: Consider the previous conversation context when answering. If this is a follow-up question, provide a contextually relevant response.`
      : `${systemPrompt}\n\nUser Question: ${userMessage}`;

    // Call API once - no retries to avoid quota exhaustion
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt
    });
    
    // Access the text from response.candidates[0].content.parts[0].text
    let text = '';
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      text = response.candidates[0].content.parts.map(part => part.text).join('');
    } else if (response.text && typeof response.text === 'function') {
      text = response.text();
    } else if (typeof response === 'string') {
      text = response;
    } else {
      console.log('Response structure:', JSON.stringify(response, null, 2));
      throw new Error('Unexpected response structure from API');
    }
    
    if (!text || text.trim() === '') {
      throw new Error('Empty response received from API');
    }
    
    // Check if the response is out of scope and extract the message
    if (isOutOfScope(text)) {
      text = extractOutOfScopeMessage(text);
    }
    
    return text;
  } catch (error) {
    console.error('Error fetching Gemini response:', error);
    
    // Provide specific error messages based on error type
    if (error.message.includes('API key')) {
      throw new Error(error.message);
    }
    
    if (error.message.includes('401') || error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
      throw new Error('❌ Invalid API Key: Please check your .env.local file and ensure the API key is correct.');
    }
    
    if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('quota')) {
      throw new Error('⏳ API quota exceeded: Your free tier limit has been reached. Please wait a moment and try again, or upgrade your API plan.');
    }
    
    if (error.message.includes('timeout') || error.message.includes('deadline')) {
      throw new Error('⏱️ Request timeout: The server took too long to respond. Please try again.');
    }
    
    if (error.message.includes('temporarily unavailable') || error.message.includes('SERVICE_UNAVAILABLE')) {
      throw new Error('🔧 Service temporarily unavailable: The Gemini API is currently unavailable. Please try again in a few moments.');
    }
    
    throw new Error(`Failed to get response: ${error.message}`);
  }
};

export default {
  fetchGeminiResponse
};
