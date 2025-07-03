// Enhanced Chatbot with Dynamic Responses - Portfolio Integration
class PortfolioChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.conversationContext = [];
        this.userName = null;
        this.init();
        this.loadKnowledgeBase();
        this.loadPersonalityResponses();
    }

    init() {
        this.createChatbotHTML();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    createChatbotHTML() {
        // Create chatbot toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'chatbot-toggle';
        toggleButton.innerHTML = '<i class="fas fa-comments"></i>';
        toggleButton.setAttribute('aria-label', 'Open AI Assistant');
        
        // Create chatbot container
        const chatbotContainer = document.createElement('div');
        chatbotContainer.className = 'chatbot-container';
        chatbotContainer.innerHTML = `
            <div class="chatbot-header">
                <h3>🤖 Abdullah's AI Assistant</h3>
                <p>Powered by AI • Ask me anything!</p>
                <button class="chatbot-close" aria-label="Close chatbot">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages"></div>
            <div class="quick-suggestions" id="quick-suggestions">
                <button class="suggestion-btn" data-message="What projects has Abdullah worked on?">🚀 Projects</button>
                <button class="suggestion-btn" data-message="What skills does Abdullah have?">💻 Skills</button>
                <button class="suggestion-btn" data-message="Tell me about Abdullah's experience">👨‍💻 Experience</button>
                <button class="suggestion-btn" data-message="How can I contact Abdullah?">📧 Contact</button>
            </div>
            <div class="chatbot-input-container">
                <div class="chatbot-input-wrapper">
                    <input type="text" class="chatbot-input" placeholder="Type your message..." maxlength="500">
                    <button class="chatbot-send-btn" aria-label="Send message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        // Append to body
        document.body.appendChild(toggleButton);
        document.body.appendChild(chatbotContainer);

        // Store references
        this.toggleButton = toggleButton;
        this.container = chatbotContainer;
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.input = chatbotContainer.querySelector('.chatbot-input');
        this.sendButton = chatbotContainer.querySelector('.chatbot-send-btn');
        this.closeButton = chatbotContainer.querySelector('.chatbot-close');
        this.suggestionsContainer = document.getElementById('quick-suggestions');
    }

    bindEvents() {
        // Toggle chatbot
        this.toggleButton.addEventListener('click', () => this.toggleChatbot());
        this.closeButton.addEventListener('click', () => this.closeChatbot());

        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Update button state based on input
        this.input.addEventListener('input', () => {
            this.sendButton.disabled = !this.input.value.trim();
        });

        // Suggestion buttons
        this.suggestionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const message = e.target.getAttribute('data-message');
                this.input.value = message;
                this.sendMessage();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChatbot();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target) && !this.toggleButton.contains(e.target)) {
                this.closeChatbot();
            }
        });
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        this.isOpen = true;
        this.container.classList.add('active');
        this.toggleButton.classList.add('active');
        setTimeout(() => this.input.focus(), 100);
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chatbot_opened', {
                'event_category': 'engagement'
            });
        }
    }

    closeChatbot() {
        this.isOpen = false;
        this.container.classList.remove('active');
        this.toggleButton.classList.remove('active');
    }

    addWelcomeMessage() {
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'welcome-message';
        const timeOfDay = this.getTimeOfDay();
        welcomeMsg.innerHTML = `
            <strong>👋 ${timeOfDay}! I'm Abdullah's AI Assistant</strong>
            <small>I'm here to help you learn about Abdullah's projects, skills, experience, and achievements. Feel free to ask me anything or use the quick buttons below!</small>
        `;
        this.messagesContainer.appendChild(welcomeMsg);
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isTyping) return;

        // Store context
        this.conversationContext.push(message);
        if (this.conversationContext.length > 5) {
            this.conversationContext.shift(); // Keep last 5 messages for context
        }

        // Add user message
        this.addMessage(message, 'user');
        this.input.value = '';
        this.sendButton.disabled = true;

        // Show typing indicator
        this.showTyping();

        // Process message
        try {
            const response = await this.processMessage(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
            this.updateSuggestions(message);
        } catch (error) {
            this.hideTyping();
            this.addMessage("I apologize, but I'm having trouble processing your request right now. Please try asking something else!", 'bot');
            console.error('Chatbot error:', error);
        }

        this.sendButton.disabled = false;
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (sender === 'bot') {
            content = this.formatBotMessage(content);
        }
        
        messageDiv.innerHTML = content;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Store message
        this.messages.push({ content, sender, timestamp: new Date() });
    }

    formatBotMessage(content) {
        // Enhanced markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/🎯|🚀|💻|📧|🏆|📚|🤖|💡|⚡|🌟/g, '<span style="font-size: 1.1em;">$&</span>');
    }

    showTyping() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    updateSuggestions(lastMessage) {
        const suggestions = this.getContextualSuggestions(lastMessage);
        this.suggestionsContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.setAttribute('data-message', suggestion.message);
            btn.innerHTML = suggestion.display;
            this.suggestionsContainer.appendChild(btn);
        });
    }

    getContextualSuggestions(lastMessage) {
        const lowerMessage = lastMessage.toLowerCase();
        
        if (lowerMessage.includes('project')) {
            return [
                { display: '🎯 Which project won hackathons?', message: 'Which projects won hackathons?' },
                { display: '💻 Technical details', message: 'Tell me technical details about the projects' },
                { display: '🔗 Live demos', message: 'Can I see live demos of the projects?' },
                { display: '⚡ Latest work', message: 'What is Abdullah working on currently?' }
            ];
        } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
            return [
                { display: '🤖 AI/ML expertise', message: 'Tell me about AI and ML skills' },
                { display: '🌐 Web development', message: 'What web technologies does Abdullah know?' },
                { display: '📊 Data science', message: 'Does Abdullah work with data science?' },
                { display: '☁️ Cloud platforms', message: 'What cloud platforms does Abdullah use?' }
            ];
        } else if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
            return [
                { display: '👨‍🏫 Teaching experience', message: 'Tell me about teaching experience' },
                { display: '🏆 Achievements', message: 'What are Abdullah\'s biggest achievements?' },
                { display: '🎓 Education', message: 'Tell me about Abdullah\'s education' },
                { display: '🤝 Mentoring', message: 'How does Abdullah help others?' }
            ];
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('linkedin') || lowerMessage.includes('connect')) {
            return [
                { display: '📧 Email Abdullah', message: 'What is Abdullah\'s email address?' },
                { display: '💼 LinkedIn Profile', message: 'How can I connect with Abdullah on LinkedIn?' },
                { display: '💻 GitHub Projects', message: 'Show me Abdullah\'s GitHub profile' },
                { display: '📄 Download Resume', message: 'Where can I get Abdullah\'s resume?' }
            ];
        } else {
            return [
                { display: '🚀 Featured projects', message: 'Show me the best projects' },
                { display: '🏆 Recent wins', message: 'What competitions has Abdullah won recently?' },
                { display: '📧 Get in touch', message: 'How can I contact Abdullah?' },
                { display: '💡 About Abdullah', message: 'Tell me more about Abdullah' }
            ];
        }
    }

    loadPersonalityResponses() {
        this.personalityResponses = {
            greetings: [
                "Hello there! 👋 I'm excited to tell you about Abdullah's amazing work in AI and machine learning!",
                "Hi! 🌟 Great to meet you! I'm here to share all about Abdullah's projects and achievements.",
                "Hey! 🤖 Welcome! I'm Abdullah's AI assistant, ready to chat about his incredible journey in tech!",
                "Greetings! ✨ I'm thrilled you're here! Let me tell you about Abdullah's exciting work."
            ],
            thanks: [
                "You're absolutely welcome! 😊 Is there anything else you'd like to know about Abdullah?",
                "My pleasure! 🌟 Feel free to ask me anything else about his projects or experience!",
                "Happy to help! 🤖 I love talking about Abdullah's achievements - what else interests you?",
                "Anytime! ✨ I'm here whenever you want to learn more about Abdullah's work!"
            ],
            goodbyes: [
                "Thanks for chatting! 👋 Don't forget to reach out to Abdullah directly - he'd love to hear from you!",
                "Goodbye! 🌟 Hope you learned something new about Abdullah. Feel free to come back anytime!",
                "See you later! 🤖 Remember, Abdullah is always open to new opportunities and collaborations!",
                "Farewell! ✨ It was great talking with you about Abdullah's journey. Take care!"
            ],
            confused: [
                "I'm not quite sure I understand that, but I'd love to help! 🤔 Could you try asking about Abdullah's projects, skills, or experience?",
                "Hmm, that's an interesting question! 💭 I'm best at discussing Abdullah's work in AI, his projects, and achievements. What would you like to know?",
                "I might need a bit more context! 🧠 I'm great at talking about Abdullah's background, projects, or how to get in touch with him.",
                "That's a unique question! 🤖 I'm designed to help with information about Abdullah's portfolio. Try asking about his latest projects!"
            ]
        };
    }

    getRandomResponse(category) {
        const responses = this.personalityResponses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    loadKnowledgeBase() {
        this.knowledgeBase = {
            // Enhanced About section
            about: {
                keywords: ['about', 'who', 'background', 'introduce', 'yourself', 'tell me about', 'biography', 'story'],
                responses: [
                    `🌟 **Meet Abdullah Siddique** - A Rising Star in AI/ML Engineering!

🎓 **Academic Excellence:** Computer Science student at University of Agriculture, Faisalabad (3.5/4.0 GPA)
🏆 **Competition Champion:** Harvard CS50 Puzzle Day winner (9/9 problems solved perfectly!)
🚀 **Hackathon Hero:** Multiple wins including Next² Edge Runners first place with Compass AI
👨‍🏫 **Global Educator:** Stanford Code in Place Section Leader & iCodeGuru Instructor

**🎯 What Drives Abdullah:**
• **Innovation:** Building AI solutions that make a real difference
• **Education:** Teaching complex concepts in accessible, engaging ways  
• **Excellence:** Consistently delivering high-quality work across all domains
• **Impact:** Creating technology that solves genuine problems

**🌍 Global Recognition:**
From Stanford's prestigious teaching program to international hackathon victories, Abdullah has proven his expertise on the world stage while maintaining a genuine passion for helping others learn and grow.

Abdullah perfectly combines technical brilliance with genuine human connection - making him not just a great developer, but an inspiring leader! ✨`,

                    `Let me tell you about **Abdullah** - he's the kind of person who makes you excited about the future of technology! 🚀

**🧠 Brilliant Problem Solver:** Whether it's winning Harvard's challenging puzzle competition or building award-winning AI applications, Abdullah consistently demonstrates exceptional analytical thinking.

**🤖 AI Visionary:** He doesn't just use existing tools - he creates innovative AI solutions that push boundaries and solve real problems.

**👨‍� Natural Teacher:** Being selected for Stanford's Code in Place program says everything about his ability to share knowledge effectively and inspire others.

**🌟 Authentic Leader:** What makes Abdullah special isn't just his technical skills - it's his genuine desire to use technology for good and help others along the way.

From competitive programming success to hackathon victories to global teaching roles, Abdullah represents the best of what's possible when talent meets passion and purpose! 💡`
                ]
            },

            // Enhanced Projects section
            projects: {
                keywords: ['project', 'projects', 'work', 'portfolio', 'built', 'created', 'developed', 'applications', 'apps', 'demos'],
                responses: [
                    `🚀 **Abdullah's Standout Projects** showcase innovation and technical excellence:

**🎯 SkillBridge - AI Career Assistant** *(Latest)*
🔗 [Try it live](https://rococo-crepe-f85566.netlify.app/)
Revolutionary platform offering AI-powered mock interviews, intelligent resume analysis, and personalized career guidance using advanced Gemma 2 models. Features real-time feedback and industry-specific recommendations.

**🧭 Compass AI - Marketing Assistant** *(🏆 Hackathon Winner)*
🔗 [Live Demo](https://compassai.streamlit.app/)
**FIRST PLACE** winner in Next² Edge Runners hackathon! Intelligent marketing tool that creates tailored campaigns, analyzes audience data, and optimizes content using sophisticated LLM integration.

**🗣️ Echo AI - Voice Companion**
🔗 [Experience it](https://echo-ai-chatbot-seven.vercel.app/)
Sophisticated voice-enabled assistant featuring advanced speech-to-text, natural language processing, and conversational AI capabilities. Demonstrates expertise in audio processing and real-time AI interactions.

**🔍 LungLens - Medical AI** *(Healthcare Innovation)*
Intelligent diagnostic tool for pneumonia detection using deep learning and medical image analysis. Shows Abdullah's versatility in applying AI to critical healthcare challenges.

Each project solves real-world problems while pushing the boundaries of what's possible with AI! 💡`,

                    `🌟 **Here's what makes Abdullah's projects exceptional:**

**� Award-Winning Innovation:** Compass AI didn't just participate in a hackathon - it WON against tough competition, proving the real-world value of Abdullah's solutions!

**� Practical Impact:** Every project addresses genuine needs - from career development (SkillBridge) to healthcare (LungLens) to business efficiency (Compass AI).

**🤖 Cutting-Edge AI:** These aren't basic apps - they integrate advanced machine learning, natural language processing, and sophisticated AI models.

**🚀 Full-Stack Excellence:** Each project demonstrates end-to-end development skills, from AI algorithms to polished user interfaces.

**📈 Continuous Innovation:** Abdullah keeps building - always working on new ideas and improving existing solutions.

Want to explore any specific project in detail? I can tell you about the technical implementation, challenges solved, or impact achieved! �`
                ]
            },

            // Enhanced Skills section
            skills: {
                keywords: ['skill', 'skills', 'technology', 'technologies', 'languages', 'tech stack', 'programming', 'tools', 'expertise', 'frameworks'],
                responses: [
                    `💻 **Abdullah's Comprehensive Tech Stack:**

**🤖 AI/ML Expertise:**
• **Languages:** Python (Advanced), JavaScript  
• **ML Libraries:** TensorFlow, PyTorch, Scikit-learn, NumPy, Pandas
• **LLM Integration:** LangChain, OpenAI API, Gemma models, RAG systems
• **Computer Vision:** OpenCV, Digital Image Processing
• **Data Science:** Statistical Modeling, Data Visualization

**🌐 Full-Stack Web Development:**
• **Frontend:** React.js, HTML5, CSS3, JavaScript ES6+, Bootstrap
• **Backend:** Node.js, Express.js, RESTful APIs
• **Databases:** SQL, Database Design & Optimization

**📱 Mobile & Other Technologies:**
• **Mobile:** Android App Development (Java/Kotlin)
• **Cloud:** Cloud Computing platforms, deployment strategies
• **Algorithms:** Data Structures, Competitive Programming
• **Version Control:** Git, GitHub workflows

**🎯 Specializations:**
• Natural Language Processing (NLP)
• Speech Recognition & Text-to-Speech
• Conversational AI systems
• Real-time data processing

Abdullah stays updated with cutting-edge technologies and continuously expands his expertise! 🚀`,

                    `🔥 **What makes Abdullah's skill set special:**

**🧠 AI/ML Mastery:** Not just theoretical knowledge - he builds real, working AI applications that win hackathons and solve actual problems!

**⚡ Full-Stack Capabilities:** Can take an idea from concept to deployment, handling both smart algorithms and beautiful user interfaces.

**📊 Data Science Proficiency:** Strong statistical foundation combined with practical data manipulation and visualization skills.

**🎯 Problem-Solving Approach:** Excellent algorithmic thinking proven through competitive programming success and complex project implementations.

**🚀 Continuous Learning:** Always exploring emerging technologies - recently working with advanced LLM integrations and voice AI systems.

The real strength is how Abdullah combines these technical skills with teaching ability, making him both an excellent developer and mentor! 💡`
                ]
            },

            // Enhanced Experience section  
            experience: {
                keywords: ['experience', 'work', 'job', 'career', 'volunteer', 'teaching', 'instructor', 'professional', 'roles'],
                responses: [
                    `👨‍💻 **Abdullah's Professional Journey** demonstrates remarkable growth and impact:

**🏫 Instructor at iCodeGuru** *(July 2024 - Present)*
Leading comprehensive educational sessions on:
• Artificial Intelligence & Machine Learning fundamentals
• Data Structures & Algorithms optimization
• SQL databases and query optimization
• Real-world project development and mentoring

**🎓 Section Leader - Stanford Code in Place** *(May-June 2025)*
Selected for Stanford University's prestigious global Python education program:
• Teaching Python programming to international students
• Providing personalized coding guidance and feedback
• Facilitating interactive learning sessions
• Mentoring aspiring developers worldwide

**🌟 Key Professional Strengths:**
• **Technical Expertise:** Deep knowledge combined with practical application
• **Communication Skills:** Making complex concepts accessible and engaging
• **Mentorship Ability:** Guiding students through challenging learning curves
• **Global Impact:** Teaching and inspiring learners across different cultures

**🎯 Teaching Philosophy:** Abdullah believes in learning by doing - every lesson includes hands-on practice, real-world examples, and personalized feedback to ensure genuine understanding.

His dual role as educator and innovator creates a unique perspective that benefits both his students and his own technical development! 🚀`,

                    `🌟 **Abdullah's experience beautifully showcases the educator-innovator combination:**

As a **Stanford Section Leader**, he joined an elite group of educators chosen for their technical skills AND teaching ability - Stanford doesn't pick just anyone for this role! 🎓

At **iCodeGuru**, he's not just delivering lectures - he's crafting comprehensive learning experiences that help students master everything from basic algorithms to advanced AI concepts.

**What makes his approach special:**
🎯 **Real-world focus** - Every lesson connects to practical applications
💡 **Interactive learning** - Students don't just listen, they build and create
🤝 **Personal mentorship** - Individual attention to help each student succeed
🚀 **Industry relevance** - Teaching skills that actually matter in today's tech landscape

The beautiful thing is how his teaching experience enhances his development work, and vice versa. When you can explain complex AI concepts to beginners, you truly understand them yourself! �`
                ]
            },

            // Enhanced Achievements section
            achievements: {
                keywords: ['achievement', 'achievements', 'awards', 'wins', 'competitions', 'certificates', 'hackathon', 'recognition'],
                responses: [
                    `🏆 **Abdullah's Achievement Highlights** are quite remarkable:

**🥇 Harvard CS50x Puzzle Winner** - Solved all 9/9 problems optimally in this prestigious competition
**🌟 Next² Edge Runners Winner** - Compass AI took first place in this Intel & Software AG sponsored hackathon  
**🎓 Stanford Code in Place 2025** - Selected as Section Leader for this exclusive program
**💻 Facebook Meta Hacker Cup** - Demonstrated competitive programming excellence
**🎯 CALICO Fall '24 – UC Berkeley** - Solved 5/8 challenging algorithmic problems

**📊 Overall Impact:**
• 10+ hackathons participated with multiple wins
• Global recognition from top-tier institutions
• Proven track record in competitive programming
• Leadership roles in prestigious educational programs

These achievements showcase Abdullah's consistency in excellence across different domains! ⚡`,

                    `🎉 Let me share some of **Abdullah's most impressive wins:**

The **Harvard CS50 Puzzle Day victory** was incredible - solving all 9 problems perfectly shows his algorithmic thinking skills! 🧠

The **hackathon wins** (especially Compass AI taking first place) demonstrate his ability to build innovative solutions under pressure 🚀

Being selected as a **Stanford Section Leader** is huge - they only choose the most capable and passionate educators 👨‍🏫

What I love most is that each achievement represents different skills: problem-solving, innovation, leadership, and teaching. Abdullah isn't just good at one thing - he's excellent across the board! 🌟`
                ]
            },

            // Enhanced Contact section
            contact: {
                keywords: ['contact', 'reach', 'email', 'social', 'connect', 'linkedin', 'github', 'touch', 'hire', 'message', 'dm', 'talk'],
                responses: [
                    `📧 **Ready to connect with Abdullah?** Here are the best ways:

**📬 Primary Email:** [abdullahsiddique773@gmail.com](mailto:abdullahsiddique773@gmail.com)
Perfect for detailed discussions, project proposals, job opportunities, or any professional inquiries!

**💼 LinkedIn:** [🔗 Connect with Abdullah on LinkedIn](https://www.linkedin.com/in/mr-abdullah-siddique/)
Great for professional networking, seeing his latest updates, and sending quick messages

**💻 GitHub:** [Check out his code](https://github.com/abdullah90907)
Explore his repositories, see his coding style, and collaborate on open-source projects

**🎥 YouTube:** [Watch tutorials](https://www.youtube.com/@abdullahsiddique-dev)
Educational content, project walkthroughs, and tech insights

**📄 Resume:** [Download here](https://drive.google.com/file/d/1wnebmQDLC77lyZF_sM5rYXyXabw1ZMF6/view?usp=sharing)

💡 **Pro tip:** Abdullah typically responds within 24 hours and loves discussing AI/ML projects, collaboration opportunities, and helping fellow developers! 🤝`,

                    `🤝 **Abdullah is very approachable and loves connecting!**

**For immediate contact:** Feel free to email me at - [abdullahsiddique773@gmail.com](mailto:abdullahsiddique773@gmail.com)

**For professional networking:** [💼 LinkedIn - Connect Here](https://www.linkedin.com/in/mr-abdullah-siddique/) is perfect for career discussions and opportunities

**For code collaboration:** [GitHub](https://github.com/abdullah90907) to see his work and discuss technical projects

Abdullah is particularly interested in:
🤖 AI/ML project collaborations
👨‍🏫 Teaching and mentoring opportunities  
🚀 Innovative tech solutions and startups
🎯 Hackathon partnerships and competitions

Whether you're a recruiter, fellow developer, student, or someone with an exciting project idea - don't hesitate to reach out! He genuinely enjoys helping others and exploring new opportunities. 🌟`
                ]
            }
        };
    }

    async processMessage(message) {
        // Simulate more natural thinking time
        const thinkingTime = 800 + Math.random() * 1500;
        await new Promise(resolve => setTimeout(resolve, thinkingTime));

        const lowerMessage = message.toLowerCase();
        
        // Detect user name
        if (lowerMessage.includes('my name is') || lowerMessage.includes('i am')) {
            const nameMatch = message.match(/(?:my name is|i am|i'm)\s+([a-zA-Z]+)/i);
            if (nameMatch) {
                this.userName = nameMatch[1];
                return `Nice to meet you, ${this.userName}! 😊 I'm excited to tell you all about Abdullah's work. What would you like to know?`;
            }
        }

        // Enhanced greeting detection
        if (lowerMessage.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/)) {
            return this.getRandomResponse('greetings');
        }

        // Enhanced thanks detection
        if (lowerMessage.match(/\b(thank|thanks|thx|appreciate|grateful)\b/)) {
            return this.getRandomResponse('thanks');
        }

        // Enhanced goodbye detection
        if (lowerMessage.match(/\b(bye|goodbye|see you|farewell|later|gtg)\b/)) {
            return this.getRandomResponse('goodbyes');
        }

        // Specific LinkedIn detection
        if (lowerMessage.includes('linkedin') || lowerMessage.includes('professional network') || lowerMessage.includes('career network')) {
            return `💼 **Connect with Abdullah on LinkedIn!**

🔗 **LinkedIn Profile:** [Abdullah Siddique - AI/ML Engineer](https://www.linkedin.com/in/mr-abdullah-siddique/)

Click the link above to:
• See his professional journey and latest updates
• Connect for networking opportunities
• Send him a direct message about collaborations
• View his recommendations and endorsements
• Follow his career achievements and posts

Abdullah is very active on LinkedIn and regularly shares insights about AI/ML, teaching experiences, and project updates. It's a great way to stay connected with his professional journey! 🌟

You can also reach him via:
📧 **Email:** [abdullahsiddique773@gmail.com](mailto:abdullahsiddique773@gmail.com)
💻 **GitHub:** [github.com/abdullah90907](https://github.com/abdullah90907)`;
        }

        // Find the best matching knowledge base entry
        let bestMatch = null;
        let maxScore = 0;

        for (const [key, entry] of Object.entries(this.knowledgeBase)) {
            const score = entry.keywords.reduce((acc, keyword) => {
                if (lowerMessage.includes(keyword)) {
                    return acc + keyword.length;
                }
                return acc;
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                bestMatch = entry;
            }
        }

        // If we found a good match, return a random response from the category
        if (bestMatch && maxScore > 0) {
            const responses = bestMatch.responses || [bestMatch.response];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        // Fallback with personality
        return this.getRandomResponse('confused');
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        new PortfolioChatbot();
    }, 300);
});

// Theme change integration
document.addEventListener('themeChanged', function() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (chatbotContainer) {
        chatbotContainer.style.display = 'none';
        chatbotContainer.offsetHeight;
        chatbotContainer.style.display = '';
    }
});
