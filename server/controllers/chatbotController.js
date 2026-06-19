const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `You are SkillBot, a friendly and helpful AI assistant for the SkillSwap Platform.

SkillSwap is a platform where users:
- Create profiles listing skills they OFFER (can teach) and skills they WANT to learn
- Get matched with other users whose skills complement theirs
- Chat in real-time with matches
- Propose skill swaps — structured exchanges where both users teach each other
- Track learning progress, schedule sessions, share resources, and take shared notes inside a Swap Panel

Your job is to:
1. Help users navigate and use the platform
2. Suggest which skills to add to their profile
3. Explain how matching, swaps, and chat work
4. Give learning tips and advice for skill exchanges
5. Answer general questions about popular skills (React, Python, Design, etc.)
6. Be encouraging and motivating

Keep responses concise, friendly, and practical. Use emojis occasionally to keep it warm.
If asked something completely unrelated to skills or the platform, gently redirect back.`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/chatbot
const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Fallback smart replies when no API key is set
      return res.json({ reply: getFallbackReply(message) });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build chat history for context
    const chatHistory = history.slice(-10).map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user',  parts: [{ text: 'Who are you?' }] },
        { role: 'model', parts: [{ text: SYSTEM_PROMPT }] },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const reply  = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.json({ reply: getFallbackReply(req.body.message) });
  }
};

// Smart fallback replies when Gemini key isn't set
function getFallbackReply(msg = '') {
  const m = msg.toLowerCase();

  if (m.includes('match') || m.includes('find'))
    return "🎯 Go to the **Matches** page to find users whose skills complement yours! The algorithm scores matches based on overlapping offered/wanted skills.";
  if (m.includes('swap'))
    return "🔄 To start a swap: go to **Matches** → click **🔄 Swap** on any card → choose skills → propose it! Your partner accepts and you both get a full Swap Panel with progress tracking, sessions, and shared notes.";
  if (m.includes('chat') || m.includes('message'))
    return "💬 Click the **Chat** button on any user card or go to the **Chat** page in the navbar. Messages are delivered in real-time and you'll get a notification when someone messages you!";
  if (m.includes('skill') && m.includes('add'))
    return "➕ Go to your **Profile** page → use the skill forms to add skills you offer and skills you want to learn. Add a category and experience level for better matches!";
  if (m.includes('profile'))
    return "👤 Click your name in the top-right navbar → **My Profile** to edit your bio, location, avatar, and manage your skills.";
  if (m.includes('progress'))
    return "📈 Inside a Swap Panel → go to the **Progress** tab. Drag the slider to update your learning %, and add milestones to track specific goals!";
  if (m.includes('session'))
    return "📅 In your Swap Panel → **Sessions** tab → schedule a learning session with a topic and date/time. Mark it done when completed!";
  if (m.includes('resource'))
    return "📚 In your Swap Panel → **Resources** tab → share links, videos, notes, or files with your swap partner!";
  if (m.includes('hello') || m.includes('hi') || m.includes('hey'))
    return "👋 Hey there! I'm SkillBot, your SkillSwap assistant. I can help you find matches, start swaps, use the chat, or answer any questions about the platform. What would you like to know?";
  if (m.includes('how') && m.includes('work'))
    return "⚡ Here's how SkillSwap works:\n1. Add skills you **offer** and skills you **want** to your profile\n2. Go to **Matches** to find compatible users\n3. **Chat** or propose a **Swap**\n4. Inside the Swap Panel, track progress, share resources, schedule sessions, and take notes together!";
  if (m.includes('react') || m.includes('python') || m.includes('design') || m.includes('figma'))
    return "🚀 That's a great skill! Add it to your profile under **Skills Offered** or **Skills Wanted** and our matching algorithm will find the perfect swap partner for you.";

  return "🤖 I'm SkillBot! I can help you with:\n• Finding skill matches\n• Starting a swap\n• Using the chat\n• Tracking your learning progress\n\nWhat would you like to know?";
}

module.exports = { chat };
