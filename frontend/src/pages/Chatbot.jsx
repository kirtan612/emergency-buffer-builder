import { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Shield } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQuestions = [
    'Can I spend ₹300 today?',
    'Why am I broke?',
    'How do I improve savings?',
    "What's my risk level?",
    'How many days can I survive?',
  ];

  // Welcome message on first load
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      text: "Hello! I'm your Buffer Advisor 🛡️\n\nI can analyze your spending, check your survival runway, and help you make smarter financial decisions.\n\nWhat would you like to know?",
      timestamp: new Date(),
      suggestions: quickQuestions,
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSendMessage = async (messageText) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call API
      const response = await sendChatMessage(text);

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.reply || 'I received your message!',
        timestamp: new Date(),
        suggestions: response.suggestions || quickQuestions,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "I'm having trouble connecting. Please try again.",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Styles
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: '#0A0F1E',
    display: 'flex',
    flexDirection: 'column',
  };

  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 64px)',
  };

  const headerStyle = {
    backgroundColor: '#1F2937',
    borderBottom: '1px solid #374151',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const headerLeftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const botAvatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    border: '2px solid #00D4FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const headerTitleStyle = {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.5rem',
    color: '#F9FAFB',
    marginBottom: '0.25rem',
  };

  const headerSubtitleStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#6B7280',
  };

  const onlineIndicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    color: isOnline ? '#10B981' : '#6B7280',
  };

  const pulseDotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isOnline ? '#10B981' : '#6B7280',
    animation: isOnline ? 'pulse 2s ease-in-out infinite' : 'none',
  };

  const chatWindowStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const messageContainerStyle = (isUser) => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    animation: 'slideUp 0.3s ease-out',
  });

  const messageWrapperStyle = (isUser) => ({
    display: 'flex',
    gap: '0.75rem',
    maxWidth: '70%',
    flexDirection: isUser ? 'row-reverse' : 'row',
  });

  const avatarStyle = (isUser) => ({
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: isUser ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0, 212, 255, 0.1)',
    border: `2px solid ${isUser ? '#00D4FF' : '#00D4FF'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

  const messageBubbleStyle = (isUser, isError) => ({
    backgroundColor: isUser ? '#00D4FF' : isError ? 'rgba(239, 68, 68, 0.1)' : '#1F2937',
    border: isError ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #374151',
    borderRadius: isUser ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
    padding: '1rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: isUser ? '#0A0F1E' : isError ? '#EF4444' : '#F9FAFB',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  });

  const timestampStyle = (isUser) => ({
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.625rem',
    color: '#6B7280',
    marginTop: '0.25rem',
    textAlign: isUser ? 'right' : 'left',
  });

  const suggestionsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.75rem',
  };

  const suggestionChipStyle = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '9999px',
    padding: '0.5rem 1rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    color: '#9CA3AF',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const typingIndicatorStyle = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  };

  const typingDotsStyle = {
    display: 'flex',
    gap: '0.25rem',
    padding: '1rem',
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '1rem 1rem 1rem 0',
  };

  const dotStyle = (delay) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00D4FF',
    animation: `bounce 1.4s ease-in-out ${delay}s infinite`,
  });

  const inputAreaStyle = {
    backgroundColor: '#1F2937',
    borderTop: '1px solid #374151',
    padding: '1.5rem',
  };

  const inputContainerStyle = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
  };

  const inputStyle = {
    flex: 1,
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#F9FAFB',
    outline: 'none',
    transition: 'all 0.2s ease',
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
  };

  const sendButtonStyle = {
    width: '44px',
    height: '44px',
    backgroundColor: isLoading || !inputValue.trim() ? '#374151' : '#00D4FF',
    border: 'none',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes bounce {
            0%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-8px);
            }
          }
          .chat-window::-webkit-scrollbar {
            width: 8px;
          }
          .chat-window::-webkit-scrollbar-track {
            background: #111827;
          }
          .chat-window::-webkit-scrollbar-thumb {
            background: #374151;
            border-radius: 4px;
          }
          .chat-window::-webkit-scrollbar-thumb:hover {
            background: #00D4FF;
          }
          input:focus, textarea:focus {
            border-color: #00D4FF !important;
            box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1) !important;
          }
          .suggestion-chip:hover {
            border-color: #00D4FF !important;
            color: #00D4FF !important;
            transform: translateY(-2px);
          }
          .send-button:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          }
        `}
      </style>
      <div style={pageStyle}>
        <div style={containerStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={headerLeftStyle}>
              <div style={botAvatarStyle}>
                <Shield size={24} color="#00D4FF" />
              </div>
              <div>
                <div style={headerTitleStyle}>Buffer Advisor</div>
                <div style={headerSubtitleStyle}>
                  AI Financial Assistant
                </div>
              </div>
            </div>
            <div style={onlineIndicatorStyle}>
              <div style={pulseDotStyle}></div>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          {/* Chat Window */}
          <div className="chat-window" style={chatWindowStyle}>
            {messages.map((message) => (
              <div key={message.id}>
                <div style={messageContainerStyle(message.type === 'user')}>
                  <div style={messageWrapperStyle(message.type === 'user')}>
                    <div style={avatarStyle(message.type === 'user')}>
                      {message.type === 'user' ? (
                        <User size={18} color="#00D4FF" />
                      ) : (
                        <Bot size={18} color="#00D4FF" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={messageBubbleStyle(
                          message.type === 'user',
                          message.isError
                        )}
                      >
                        {message.text}
                      </div>
                      <div style={timestampStyle(message.type === 'user')}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {message.type === 'bot' && message.suggestions && (
                  <div style={{ marginLeft: '52px', marginTop: '0.5rem' }}>
                    <div style={suggestionsContainerStyle}>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-chip"
                          style={suggestionChipStyle}
                          onClick={() => handleSendMessage(suggestion)}
                          disabled={isLoading}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div style={typingIndicatorStyle}>
                <div style={avatarStyle(false)}>
                  <Bot size={18} color="#00D4FF" />
                </div>
                <div style={typingDotsStyle}>
                  <div style={dotStyle(0)}></div>
                  <div style={dotStyle(0.2)}></div>
                  <div style={dotStyle(0.4)}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={inputAreaStyle}>
            {!isOnline && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.875rem',
                  color: '#EF4444',
                  textAlign: 'center',
                }}
              >
                You are offline. Please check your connection.
              </div>
            )}
            <div style={inputContainerStyle}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your financial advisor..."
                style={inputStyle}
                disabled={isLoading || !isOnline}
                rows={1}
              />
              <button
                className="send-button"
                style={sendButtonStyle}
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim() || !isOnline}
              >
                <Send size={20} color={isLoading || !inputValue.trim() ? '#6B7280' : '#0A0F1E'} />
              </button>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                Need human help? Contact Kirtan: 📧 <a href="mailto:kirtanjogani3@gmail.com" style={{ color: '#00D4FF', textDecoration: 'none' }}>kirtanjogani3@gmail.com</a> | 📱 <a href="tel:+919374134341" style={{ color: '#00D4FF', textDecoration: 'none' }}>+91-9374134341</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
