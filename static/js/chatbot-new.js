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
        toggleButton.innerHTML = '<i class="fas fa-robot"></i>';
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
                keywords: ['about', 'who', 'background', 'introduce', 'yourself', 'tell me about'],
                responses: [
                    `🌟 **Abdullah Siddique** is a passionate AI/ML engineer who's making waves in the tech world! 

🎓 **Currently studying** Computer Science at University of Agriculture, Faisalabad with a 3.5/4.0 GPA
🏆 **Hackathon champion** - Won Harvard's CS50 Puzzle Day and participated in 10+ hackathons
👨‍🏫 **Educator at heart** - Stanford Code in Place Section Leader and instructor at iCodeGuru
🚀 **AI enthusiast** who loves building impactful machine learning models and innovative solutions

Abdullah combines technical expertise with a passion for teaching, making him both a skilled developer and an inspiring mentor! 💡`,

                    `Let me tell you about **Abdullah** - he's quite an impressive individual! 🌟

🤖 **AI/ML Expert**: Specializes in building intelligent systems and machine learning models
🎯 **Problem Solver**: Thrives on tackling complex challenges in artificial intelligence  
📚 **Lifelong Learner**: Always exploring cutting-edge technologies and methodologies
🌍 **Global Impact**: Teaching and mentoring students worldwide through Stanford's program

What makes Abdullah special is his ability to bridge the gap between complex AI concepts and practical applications while helping others learn along the way! ⚡`
                ]
            },

            // Enhanced Projects section
            projects: {
                keywords: ['project', 'projects', 'work', 'portfolio', 'built', 'created', 'developed', 'applications'],
                responses: [
                    `🚀 **Abdullah's Featured Projects** showcase his AI/ML expertise:

🤖 **SkillBridge – AI Career Assistant**
Revolutionary platform offering mock interviews, resume analysis, and personalized career guidance using Gemma 2 models
[🌐 Try it live](https://rococo-crepe-f85566.netlify.app/)

🧭 **Compass AI – Marketing Assistant** *(🏆 WINNER)*
Intelligent tool creating tailored marketing campaigns and analyzing audience data using advanced LLMs
[🔗 Live Demo](https://compassai.streamlit.app/)

🗣️ **Echo AI – Voice Companion**
Sophisticated voice-enabled assistant with speech-to-text and conversational AI capabilities
[▶️ Experience it](https://echo-ai-chatbot-seven.vercel.app/)

Each project demonstrates Abdullah's ability to transform complex AI concepts into user-friendly, practical solutions! 💡`,

                    `Here are some **exciting projects** Abdullah has been working on! 🌟

🎯 **SkillBridge**: An AI-powered career development platform that's helping people land their dream jobs with intelligent interview prep and resume optimization

🏆 **Compass AI**: The hackathon-winning marketing assistant that's revolutionizing how businesses create campaigns - this one really put Abdullah on the map!

🤖 **Echo AI**: A voice-activated companion that shows Abdullah's expertise in speech recognition and natural language processing

What's impressive is how each project solves real-world problems while showcasing different aspects of AI/ML development! Want to know more about any specific project? 🚀`
                ]
            },

            // Enhanced Skills section
            skills: {
                keywords: ['skill', 'skills', 'technology', 'technologies', 'languages', 'tech stack', 'programming', 'tools'],
                responses: [
                    `💻 **Abdullah's Technical Arsenal** is quite impressive:

**🤖 AI/ML Powerhouse:**
• Python, NumPy, Pandas - Data manipulation mastery
• Scikit-learn, TensorFlow, PyTorch - ML/DL frameworks
• LangChain, OpenAI API - LLM integration expertise

**🌐 Full-Stack Development:**
• React.js, Node.js - Modern web applications  
• HTML/CSS, JavaScript - Frontend fundamentals
• Bootstrap - Responsive design

**📊 Data & Analytics:**
• SQL Databases - Data management
• Digital Image Processing - Computer vision
• Statistical Modeling - Data insights

**☁️ Additional Skills:**
• Android App Development
• Cloud Computing platforms
• Data Structures & Algorithms

Abdullah stays current with the latest tech trends and continuously expands his skill set! 🚀`,

                    `🔥 **Abdullah's expertise spans multiple domains:**

**Artificial Intelligence & Machine Learning** 🤖
He's not just familiar with these technologies - he's building award-winning projects with them! From neural networks to natural language processing.

**Web Development** 🌐  
Full-stack capabilities with modern frameworks like React and Node.js, creating seamless user experiences.

**Data Science** 📊
Strong foundation in data manipulation, analysis, and visualization using Python's data science ecosystem.

**Software Engineering** ⚡
Solid understanding of algorithms, data structures, and software development best practices.

What sets Abdullah apart is his ability to integrate these skills to create innovative solutions that actually solve real problems! 💡`
                ]
            },

            // Enhanced Experience section  
            experience: {
                keywords: ['experience', 'work', 'job', 'career', 'volunteer', 'teaching', 'instructor', 'professional'],
                responses: [
                    `👨‍💻 **Abdullah's Professional Journey** is truly inspiring:

**🏫 Instructor at iCodeGuru** *(July 2024 - Present)*
Leading comprehensive sessions on AI, ML, Data Structures & Algorithms, and SQL databases. Abdullah mentors students and guides them through real-world project development.

**🎓 Section Leader at Stanford University** *(May-June 2025)*  
Volunteered for Stanford's prestigious Code in Place program, teaching Python to students globally and providing personalized coding guidance.

**🔑 Key Contributions:**
• Teaching complex AI/ML concepts in accessible ways
• Mentoring students through hands-on project development  
• Leading coding sessions and providing detailed feedback
• Building bridges between theory and practical application

Abdullah's teaching philosophy combines technical expertise with genuine care for student success! 🌟`,

                    `🌟 **Abdullah's experience beautifully blends education and innovation:**

As an **educator**, he's shaping the next generation of developers through his work at iCodeGuru and Stanford's Code in Place program. His students benefit from his real-world project experience and his ability to make complex concepts understandable.

As a **technologist**, he's constantly applying his knowledge through hackathons and innovative projects, staying at the forefront of AI/ML developments.

What makes Abdullah special is how he combines **learning** and **teaching** - every project teaches him something new, and every lesson he teaches is informed by hands-on experience! 🚀`
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
                keywords: ['contact', 'reach', 'email', 'social', 'connect', 'linkedin', 'github', 'touch', 'hire'],
                responses: [
                    `📧 **Ready to connect with Abdullah?** Here's how:

**📬 Email:** [abdullahsiddique773@gmail.com](mailto:abdullahsiddique773@gmail.com) - Best for detailed discussions
**💼 LinkedIn:** [Connect professionally](https://www.linkedin.com/in/mr-abdullah-siddique/) - See his full career journey  
**💻 GitHub:** [Check out his code](https://github.com/abdullah90907) - Explore repositories and contributions
**🎥 YouTube:** [Watch his content](https://www.youtube.com/@abdullahsiddique-dev) - Educational videos and tutorials

**📄 Resume:** [Download here](https://drive.google.com/file/d/1wnebmQDLC77lyZF_sM5rYXyXabw1ZMF6/view?usp=sharing)

Abdullah is always open to discussing new opportunities, collaborations, or just having a chat about technology! Whether you're looking to hire, collaborate, or learn - he'd love to hear from you! 🤝`,

                    `🤝 **Abdullah loves connecting with fellow tech enthusiasts!**

Whether you're interested in **collaboration**, **hiring**, or just want to **chat about AI/ML**, he's very approachable and responsive.

**For quick questions:** LinkedIn or email work great
**For project collaboration:** GitHub is perfect to see his coding style  
**For learning opportunities:** Check out his YouTube channel

Pro tip: Mention what specific project or skill caught your attention - Abdullah enjoys detailed technical discussions! 💡

He's particularly interested in AI/ML projects, educational initiatives, and innovative tech solutions. Don't hesitate to reach out! 🚀`
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
