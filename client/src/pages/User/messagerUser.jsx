import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Avatar, Badge, Empty } from 'antd';
import {
    SearchOutlined,
    SendOutlined,
    UserOutlined,
    MoreOutlined,
    PhoneOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { useStore } from '../../hook/useStore';
import {
    requestCreateMessage,
    requestGetMessageByConversationId,
    requestUpdateMessageIsRead,
} from '../../config/messageRequest';
import { requestGetAllConversation } from '../../config/ConversationRequest';

function MessagerUser() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [message, setMessage] = useState('');
    const [listMessager, setListMessager] = useState([]);
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    const { conversations, dataUser, newMessage } = useStore();
    const [conversationList, setConversationList] = useState([]);

    // Sync conversations from store to local state and fetch fresh data on mount
    useEffect(() => {
        if (conversations && conversations.length > 0) {
            setConversationList(conversations);
        }

        const fetchConversations = async () => {
            try {
                const res = await requestGetAllConversation();
                if (res.metadata) {
                    setConversationList(res.metadata);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách trò chuyện:', error);
            }
        };
        fetchConversations();
    }, [conversations]);

    // Helper function để scroll xuống cuối
    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 100);
    };

    // Helper function để lấy thông tin member khác trong conversation (user hoặc company)
    const getOtherMember = (conversation) => {
        if (!conversation || !conversation.members) return null;

        // Tìm member không phải là current user
        const otherMember = conversation.members.find((member) => {
            return member.memberId?.toString() !== dataUser._id?.toString();
        });

        return otherMember;
    };

    // Helper function để lấy tên hiển thị của member
    const getMemberName = (member) => {
        if (!member?.memberData) return 'Unknown';
        return member.memberData.fullName || member.memberData.companyName || 'Unknown';
    };

    // Helper function để lấy avatar của member
    const getMemberAvatar = (member) => {
        if (!member?.memberData) return null;
        if (member.memberType === 'user') {
            return member.memberData.avatar;
        } else if (member.memberType === 'company') {
            return member.memberData.companyLogo
                ? member.memberData.companyLogo.startsWith('http')
                    ? member.memberData.companyLogo
                    : `${import.meta.env.VITE_API_URL}/uploads/logo/${member.memberData.companyLogo}`
                : null;
        }
        return null;
    };

    // Handle incoming socket messages
    useEffect(() => {
        if (newMessage && newMessage.conversation) {
            // Cập nhật danh sách tin nhắn khi có tin nhắn mới
            if (selectedConversation && newMessage.conversation === selectedConversation._id) {
                setListMessager((prev) => {
                    const exists = prev.some((msg) => msg._id === newMessage._id);
                    if (exists) return prev;
                    return [...prev, newMessage];
                });
                scrollToBottom();
            } else {
                // Nếu tin nhắn không phải của conversation đang xem, tăng unread count
                setConversationList((prev) =>
                    prev.map((conv) => {
                        if (conv._id === newMessage.conversation) {
                            return {
                                ...conv,
                                unreadCount: (conv.unreadCount || 0) + 1,
                            };
                        }
                        return conv;
                    }),
                );
            }
        }
    }, [newMessage, selectedConversation]);

    // Helper function để format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    // useEffect để set selectedConversation dựa trên id từ URL
    useEffect(() => {
        if (id && conversationList.length > 0) {
            const conv = conversationList.find((c) => c._id === id);
            if (conv) {
                setSelectedConversation(conv);
            } else {
                setSelectedConversation(null);
            }
        } else {
            setSelectedConversation(null);
        }
    }, [id, conversationList]);

    // useEffect để fetch messages khi selectedConversation thay đổi
    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedConversation?._id) {
                try {
                    const res = await requestGetMessageByConversationId(selectedConversation._id);
                    setListMessager(res.metadata || []);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                    setListMessager([]);
                }
            } else {
                setListMessager([]);
            }
        };
        fetchMessages();
    }, [selectedConversation]);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        if (listMessager.length > 0) {
            scrollToBottom();
        }
    }, [listMessager]);

    // Hàm xử lý khi click vào conversation
    const handleConversationClick = async (conversation) => {
        const otherMember = getOtherMember(conversation);
        if (!otherMember) return;

        // Đánh dấu tin nhắn là đã đọc
        if (conversation.unreadCount > 0) {
            try {
                await requestUpdateMessageIsRead({
                    conversationId: conversation._id,
                    sender: otherMember.memberId,
                });

                // Cập nhật unread count về 0
                setConversationList((prev) =>
                    prev.map((conv) => {
                        if (conv._id === conversation._id) {
                            return { ...conv, unreadCount: 0 };
                        }
                        return conv;
                    }),
                );
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        }

        navigate(`/user/messages/${conversation._id}`);
    };

    // Helper function để format message time
    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Kiểm tra tin nhắn có phải của mình không
    const isMyMessage = (msg) => {
        // So sánh sender._id với dataUser._id
        return msg.sender?._id === dataUser._id;
    };

    const handleSendMessage = async () => {
        if (message.trim() && selectedConversation) {
            const data = {
                conversationId: selectedConversation._id,
                content: message.trim(),
                senderType: 'user', // User gửi tin nhắn
            };

            try {
                const res = await requestCreateMessage(data);
                setMessage('');

                // Thêm tin nhắn mới vào danh sách ngay lập tức
                if (res.message === 'success' && res.metadata) {
                    setListMessager((prev) => {
                        const exists = prev.some((msg) => msg._id === res.metadata._id);
                        if (exists) return prev;
                        return [...prev, res.metadata];
                    });
                    scrollToBottom();
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const otherMemberInSelected = selectedConversation ? getOtherMember(selectedConversation) : null;

    return (
        <div className="h-[90vh] flex bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Sidebar - Danh sách cuộc trò chuyện */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
                {/* Header Sidebar */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Tin nhắn</h2>
                    <Input
                        placeholder="Tìm kiếm..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        className="rounded-full"
                        size="large"
                    />
                </div>

                {/* Danh sách cuộc trò chuyện */}
                <div className="flex-1 overflow-y-auto">
                    {conversationList && conversationList.length > 0 ? (
                        conversationList.map((conversation) => {
                            const otherMember = getOtherMember(conversation);
                            if (!otherMember) return null;
                            {
                                console.log(otherMember);
                            }
                            return (
                                <div
                                    key={conversation._id}
                                    onClick={() => handleConversationClick(conversation)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                                        selectedConversation?._id === conversation._id
                                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative">
                                            <Avatar
                                                src={getMemberAvatar(otherMember)}
                                                size={48}
                                                icon={<UserOutlined />}
                                            >
                                                {!getMemberAvatar(otherMember) && getMemberName(otherMember)?.charAt(0)}
                                            </Avatar>
                                            {otherMember.memberType === 'company' && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs">🏢</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-800 truncate">
                                                    {getMemberName(otherMember)}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    {conversation.unreadCount > 0 && (
                                                        <Badge
                                                            count={conversation.unreadCount}
                                                            style={{ backgroundColor: '#1890ff' }}
                                                        />
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(conversation.updatedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p
                                                    className={`text-sm truncate flex-1 ${
                                                        conversation.unreadCount > 0
                                                            ? 'text-gray-800 font-semibold'
                                                            : 'text-gray-600'
                                                    }`}
                                                >
                                                    {otherMember.memberType === 'company'
                                                        ? 'Nhà tuyển dụng'
                                                        : 'Nhấn để xem'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                            Chưa có cuộc trò chuyện nào
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation && otherMemberInSelected ? (
                    <>
                        {/* Header Chat */}
                        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar
                                        src={getMemberAvatar(otherMemberInSelected)}
                                        size={44}
                                        icon={<UserOutlined />}
                                    >
                                        {!getMemberAvatar(otherMemberInSelected) &&
                                            getMemberName(otherMemberInSelected)?.charAt(0)}
                                    </Avatar>
                                    {otherMemberInSelected.memberType === 'company' && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-[10px]">🏢</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {getMemberName(otherMemberInSelected)}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {otherMemberInSelected.memberType === 'company' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <PhoneOutlined className="text-xl text-blue-500" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <VideoCameraOutlined className="text-xl text-blue-500" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <MoreOutlined className="text-xl text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            <div className="space-y-4">
                                {listMessager && listMessager.length > 0 ? (
                                    <>
                                        {listMessager.map((msg) => {
                                            const isMe = isMyMessage(msg);
                                            return (
                                                <div
                                                    key={msg._id}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {!isMe && (
                                                        <Avatar
                                                            src={getMemberAvatar(otherMemberInSelected)}
                                                            size={32}
                                                            className="mr-2 flex-shrink-0"
                                                            icon={<UserOutlined />}
                                                        />
                                                    )}
                                                    <div
                                                        className={`max-w-md ${
                                                            isMe
                                                                ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl'
                                                                : 'bg-white text-gray-800 rounded-r-2xl rounded-tl-2xl shadow-sm'
                                                        } px-4 py-2`}
                                                    >
                                                        <p className="text-sm">{msg.content}</p>
                                                        <span
                                                            className={`text-xs mt-1 block ${
                                                                isMe ? 'text-blue-100' : 'text-gray-400'
                                                            }`}
                                                        >
                                                            {formatMessageTime(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Chưa có tin nhắn nào. Hãy gửi lời chào!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Nhập tin nhắn..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onPressEnter={handleSendMessage}
                                    size="large"
                                    className="rounded-full"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors flex items-center justify-center w-12 h-12"
                                >
                                    <SendOutlined className="text-lg" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <Empty
                            description={
                                <span className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</span>
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagerUser;
