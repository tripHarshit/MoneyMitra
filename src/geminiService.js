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



  return `You are MoneyMitra, a personalized financial advisor chatbot. You provide tailored financial advice for a ${occupation} in the ${ageGroup} age group with a goal to ${primaryGoal === 'save' ? 'Save Money' : primaryGoal === 'debt' ? 'Manage Debt' : 'Learn Financial Basics'}.



### SPECIAL FEATURE TRIGGERS:

1. **The Budget Starter**: If the user asks for a "budget," "template," "breakdown," or "plan," you MUST generate a structured Markdown Table.

   - Adjust categories based on their occupation (e.g., for Students, include "Course Material"; for Professionals, include "Rent/EMI").

   - Use the 50/30/20 rule as a default guideline.



2. **The Opportunity Cost Analyzer (Latte Factor)**: If the user mentions a daily expense (e.g., "coffee," "snacks," "subscriptions") or a "habit," you MUST:

   - Calculate the daily cost, monthly cost, and 10-year cost.

   - Calculate the "Opportunity Cost": Show what that money would be worth in 10 years if invested at a 8% annual return.

   - You MUST wrap ONLY the final impact statement in a blockquote starting exactly with this string: '> 💡 **Aha! Moment:**'



3. **The Impulse Purchase Mirror**: If the user uses the keyword "mirror a purchase", you MUST:

   - Calculate Work Hours: Estimate an hourly wage based on the user's ${occupation} and calculate how many hours they must work to afford the item.

   - Calculate Growth Sacrifice: Show the value of that amount in 10 years if invested at a 10% annual return.

   - Output Format: Use a clean Markdown structure with a header "### Purchase Mirror Reality Check" and two distinct sections: "**The Cost in Life**" and "**The Growth Sacrifice**".



### CRITICAL SCOPE CHECK:

If the question is NOT related to personal finance or is too vague (e.g., "hi", "abc"), respond ONLY with the [OUT_OF_SCOPE] block.



### RESPONSE GUIDELINES:

- **Use Markdown Tables** for all budget templates.

- **Bold** all critical financial impact numbers.

- **Personalize** advice: ${occupation === 'Student' ? 'Focus on building habits with low income.' :

      occupation === 'Early-career Professional' ? 'Focus on emergency funds and early investing.' :

        'Provide practical, occupation-specific advice.'

    }

- **Mandatory Disclaimer**: End every response with: *Remember: This is educational information, not professional financial advice.*



[OUT_OF_SCOPE]

I'm MoneyMitra, a financial advisor chatbot designed specifically to help with financial questions... [Include full text from original]

[END_OUT_OF_SCOPE]`;

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

      model: 'gemini-1.5-flash-8b',

      contents: fullPrompt

    });



    // Access the text from response

    let text = '';



    if (response.text && typeof response.text === 'string') {

      text = response.text;

    } else if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {

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



/**

 * Shuffle quiz options using Fisher-Yates and update correctIndex to match.

 */

const shuffleQuizOptions = (quiz) => {

  if (!quiz || !Array.isArray(quiz.options) || quiz.options.length === 0) return quiz;



  const correctAnswer = quiz.options[quiz.correctIndex ?? 0];

  const shuffled = [...quiz.options];



  // Fisher-Yates shuffle

  for (let i = shuffled.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

  }



  return {

    ...quiz,

    options: shuffled,

    correctIndex: shuffled.indexOf(correctAnswer),

  };

};



/**

 * Request a structured lesson and quiz from Gemini for the Learning Hub

 */

const getFallbackLesson = (userContext, currentLevel) => {

  const goalText = userContext?.primaryGoal || 'financial growth';



  const lessonBank = [

    {

      title: 'Mastering the 50/30/20 Rule',

      content: `The **50/30/20 rule** is a simple framework for monthly cash flow planning. Allocate about **50%** of your income to essentials, **30%** to lifestyle, and **20%** to savings or debt reduction.



For your goal of **${goalText}**, start by tracking one full month of real expenses and then moving each expense into these buckets. The purpose is not perfection, but consistency. Small monthly improvements compound into meaningful long-term outcomes.` ,

      quiz: {

        question: 'In the 50/30/20 model, which bucket is primarily meant for long-term wealth building?',

        options: ['Needs (50%)', 'Savings and debt payoff (20%)', 'Wants (30%)', 'Entertainment add-ons'],

        correctIndex: 1,

        explanation: 'The 20% bucket is where wealth-building happens through savings, investing, and debt reduction.'

      }

    },

    {

      title: 'Emergency Fund Design That Actually Works',

      content: `An emergency fund protects your plan from unexpected shocks like medical costs, job gaps, or urgent repairs. A practical target is **3-6 months** of essential expenses in a liquid account.



Instead of waiting for a large lump sum, automate small weekly transfers. For **${goalText}**, consistency matters more than amount. Build the habit first, then increase contribution size over time.`,

      quiz: {

        question: 'What is the primary purpose of an emergency fund?',

        options: ['To maximize returns', 'To reduce the impact of unexpected expenses', 'To replace retirement investing', 'To speculate on short-term stocks'],

        correctIndex: 1,

        explanation: 'Emergency funds are a risk buffer, not a return-maximization tool.'

      }

    },

    {

      title: 'Compounding and Time Horizon',

      content: `Compounding means returns can generate their own returns over time. The longer your horizon, the greater this effect becomes.



For **${goalText}**, focus on regular contributions and staying invested through market noise. Timing the market is difficult, but time in the market is a durable advantage for most long-term plans.`,

      quiz: {

        question: 'Which factor most strengthens compounding outcomes?',

        options: ['Frequent switching between assets', 'Longer time horizon with regular investing', 'Only investing after market rallies', 'Avoiding all risk forever'],

        correctIndex: 1,

        explanation: 'Compounding benefits most from time and consistency, not frequent strategy changes.'

      }

    }

  ];



  const lesson = lessonBank[(Math.max(1, currentLevel) - 1) % lessonBank.length];

  return { ...lesson, quiz: shuffleQuizOptions(lesson.quiz) };

};



export const generateLesson = async (userContext, currentLevel) => {

  try {

    if (!apiKey) throw new Error('API key is not configured.');



    const { occupation, ageGroup, primaryGoal } = userContext;



    const prompt = `You are a financial educator creating a short micro-course for a ${occupation} in the ${ageGroup} age group whose goal is to ${primaryGoal}.

This is Level ${currentLevel} of their financial journey.

Create a short, engaging lesson focused on a financial concept appropriate for this level. 

Level 1 should be very basic (e.g., compounding or budgeting), Level 2 slightly harder, and so on.



You MUST respond strictly in valid JSON format matching this structure:

{

  "title": "Title of the Lesson",

  "content": "A detailed but engaging 2-3 paragraph explanation of the topic. Use markdown if needed.",

  "quiz": {

    "question": "A multiple choice question testing the concept taught",

    "options": ["Option A", "Option B", "Option C", "Option D"],

    "correctIndex": 0, // integer 0-3 representing the correct option

    "explanation": "Short explanation of why the correct answer is right."

  }

}



Do not include any text outside the JSON object. Do not wrap in markdown \`\`\`json blocks. Return ONLY the raw JSON object string.`;



    const response = await ai.models.generateContent({

      model: 'gemini-1.5-flash',

      contents: prompt

    });



    let text = '';

    if (response.text && typeof response.text === 'string') {

      text = response.text;

    } else if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {

      text = response.candidates[0].content.parts.map(part => part.text).join('');

    } else if (response.text && typeof response.text === 'function') {

      text = response.text();

    } else if (typeof response === 'string') {

      text = response;

    }



    // Clean up potential markdown formatting from JSON output

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    

    // Attempt to extract purely the JSON object if there's trailing/leading text

    const startIndex = text.indexOf('{');

    const endIndex = text.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1) {

      text = text.substring(startIndex, endIndex + 1);

    }

    

    let parsed = JSON.parse(text);

    

    // Helper to fix potential capitalization issues ('Quiz' vs 'quiz')

    const lowerKeys = Object.keys(parsed).reduce((acc, key) => {

      acc[key.toLowerCase()] = parsed[key];

      return acc;

    }, {});

    

    const quizData = lowerKeys.quiz || {};

    // Ensure all structure exists to prevent crashes

    const rawQuiz = {

      question: quizData.question || "Did you understand the key concepts?",

      options: (quizData.options && Array.isArray(quizData.options) && quizData.options.length > 0) ? quizData.options : ["Yes, let's proceed to the next lesson", "I need to review"],

      correctIndex: quizData.correctIndex !== undefined ? parseInt(quizData.correctIndex, 10) : 0,

      explanation: quizData.explanation || "Great effort! Keeping up with these micro-lessons will help you succeed."

    };



    return {

      title: lowerKeys.title || "Financial Lesson",

      content: lowerKeys.content || "Ready to learn something new today?",

      quiz: shuffleQuizOptions(rawQuiz)

    };

  } catch (error) {

    console.error('Error generating lesson. Raw error:', error);

    return getFallbackLesson(userContext, currentLevel);

  }

};



export default {

  fetchGeminiResponse,

  generateLesson

};
