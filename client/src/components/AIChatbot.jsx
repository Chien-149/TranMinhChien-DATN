import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Spin, Tooltip, Dropdown, Empty } from 'antd';
import {
    MessageCircle,
    X,
    Send,
    Sparkles,
    User,
    Bot,
    Minimize2,
    Maximize2,
    Trash2,
    Plus,
    History,
    ChevronDown,
} from 'lucide-react';
import Cookies from 'js-cookie';
import {
    requestAIChat,
    requestGetChatHistory,
    requestGetChatById,
    requestCreateNewChat,
    requestClearAllChats,
} from '../config/aiRequest2';

/**
 * Floating AI Chatbot Widget - Có lưu lịch sử
 */
export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                'Xin chào! 👋 Tôi là AI tư vấn nghề nghiệp.\n\nTôi có thể giúp bạn:\n• Gợi ý việc làm phù hợp\n• Định hướng nghề nghiệp\n• Tư vấn kỹ năng cần học\n• Giải đáp thắc mắc về CV\n\nBạn cần hỗ trợ gì?',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef(null);
    const isLoggedIn = Cookies.get('logged') === '1';

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load chat history when logged in
    useEffect(() => {
        if (isLoggedIn && isOpen) {
            loadChatHistory();
        }
    }, [isLoggedIn, isOpen]);

    const loadChatHistory = async () => {
        try {
            const res = await requestGetChatHistory();
            if (res.metadata) {
                setChatHistory(res.metadata);
            }
        } catch (error) {
            console.error('Load chat history error:', error);
        }
    };

    const loadChat = async (id) => {
        try {
            const res = await requestGetChatById(id);
            if (res.metadata) {
                setMessages(res.metadata.messages);
                setChatId(id);
                setShowHistory(false);
            }
        } catch (error) {
            console.error('Load chat error:', error);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

        setLoading(true);
        try {
            const res = await requestAIChat(userMessage, chatId);

            if (res.metadata?.response) {
                setMessages((prev) => [...prev, { role: 'assistant', content: res.metadata.response }]);
                // Cập nhật chatId từ server
                if (res.metadata.chatId) {
                    setChatId(res.metadata.chatId);
                }
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const createNewChat = async () => {
        if (isLoggedIn) {
            try {
                const res = await requestCreateNewChat();
                if (res.metadata) {
                    setMessages(res.metadata.messages);
                    setChatId(res.metadata._id);
                    loadChatHistory();
                }
            } catch (error) {
                console.error('Create new chat error:', error);
            }
        } else {
            setMessages([
                {
                    role: 'assistant',
                    content: 'Xin chào! 👋 Bạn cần hỗ trợ gì?',
                },
            ]);
            setChatId(null);
        }
    };

    const clearAllHistory = async () => {
        if (!isLoggedIn) return;
        try {
            await requestClearAllChats();
            setChatHistory([]);
            createNewChat();
        } catch (error) {
            console.error('Clear history error:', error);
        }
    };

    const quickActions = [
        { icon: '💼', text: 'Gợi ý việc cho Frontend' },
        { icon: '📝', text: 'Cách viết CV ấn tượng' },
        { icon: '💰', text: 'Mức lương IT 2024' },
        { icon: '🚀', text: 'Lộ trình học lập trình' },
    ];

    // Floating Button
    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 group">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-ping opacity-25" />
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center">
                        <MessageCircle size={24} />
                    </div>
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        AI Tư vấn nghề nghiệp
                        <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-[400px]'}`}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 ${
                    isMinimized ? '' : 'h-[550px]'
                } flex flex-col`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">AI Career Assistant</h3>
                            {!isMinimized && (
                                <div className="flex items-center gap-1 text-xs text-white/70">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    {isLoggedIn ? 'Đang lưu lịch sử' : 'Chưa đăng nhập'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {isLoggedIn && (
                            <>
                                <Tooltip title="Chat mới">
                                    <button
                                        onClick={createNewChat}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Lịch sử">
                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <History size={16} />
                                    </button>
                                </Tooltip>
                            </>
                        )}
                        <Tooltip title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}>
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            </button>
                        </Tooltip>
                        <Tooltip title="Đóng">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* History Panel */}
                        {showHistory && isLoggedIn && (
                            <div className="absolute top-14 left-0 right-0 bg-white border-b shadow-lg max-h-[300px] overflow-y-auto z-10">
                                <div className="p-3 border-b flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Lịch sử chat</span>
                                    {chatHistory.length > 0 && (
                                        <button
                                            onClick={clearAllHistory}
                                            className="text-xs text-red-500 hover:text-red-600"
                                        >
                                            Xóa tất cả
                                        </button>
                                    )}
                                </div>
                                {chatHistory.length > 0 ? (
                                    <div className="divide-y">
                                        {chatHistory.map((chat) => (
                                            <button
                                                key={chat._id}
                                                onClick={() => loadChat(chat._id)}
                                                className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                                                    chatId === chat._id ? 'bg-indigo-50' : ''
                                                }`}
                                            >
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                    {chat.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {chat.messageCount} tin nhắn
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-gray-400 text-sm">Chưa có lịch sử chat</div>
                                )}
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                                                : 'bg-white border border-gray-200 text-purple-600'
                                        }`}
                                    >
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div
                                        className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl rounded-br-md shadow-md'
                                                : 'bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-purple-600 flex items-center justify-center shadow-sm">
                                        <Bot size={14} />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                        <div className="flex gap-1">
                                            <span
                                                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '0ms' }}
                                            />
                                            <span
                                                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '150ms' }}
                                            />
                                            <span
                                                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '300ms' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length <= 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-400 mb-2">Gợi ý nhanh:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickActions.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInputValue(action.text)}
                                            className="flex items-center gap-2 text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                                        >
                                            <span>{action.icon}</span>
                                            <span className="text-gray-600 line-clamp-1">{action.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nhập câu hỏi của bạn..."
                                    className="pr-10 py-2.5 rounded-xl border-gray-200 hover:border-purple-300 focus:border-purple-400"
                                    disabled={loading}
                                />
                                <Button
                                    type="primary"
                                    icon={<Send size={16} />}
                                    onClick={handleSend}
                                    loading={loading}
                                    disabled={!inputValue.trim()}
                                    className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 border-none hover:opacity-90 flex items-center justify-center"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 text-center mt-2">
                                {isLoggedIn ? '💾 Lịch sử được lưu tự động' : '🔒 Đăng nhập để lưu lịch sử'}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
