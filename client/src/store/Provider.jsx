import Context from './Context';
import CryptoJS from 'crypto-js';

import cookies from 'js-cookie';

import { useEffect, useState, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import { io } from 'socket.io-client';
import { requestGetAllConversation } from '../config/ConversationRequest';
import { authAPI } from '../api/auth.api';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [dataCategory, setDataCategory] = useState([]);
    const [jobs, setJobs] = useState([]);

    const [conversations, setConversations] = useState([]);
    const [newMessage, setNewMessage] = useState(null);
    const [newNotification, setNewNotification] = useState(null);

    const socketRef = useRef(null);

    useEffect(() => {
        const fetchConversations = async () => {
            const res = await requestGetAllConversation();
            setConversations(res.metadata);
        };
        if (dataUser._id) {
            fetchConversations();
        }
    }, [dataUser._id]);

    useEffect(() => {
        if (!dataUser._id) return;

        const socket = io(import.meta.env.VITE_API_URL, {
            withCredentials: true,
        });

        socket.on('new_message', (data) => {
            setNewMessage(data);
        });

        socket.on('new_conversation', (data) => {
            setConversations((prev) => [data, ...prev]);
        });

        socket.on('new_notification', (data) => {
            setNewNotification(data);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [dataUser._id]);

    const fetchAuth = async () => {
        try {
            const res = await authAPI.getMe();
            const bytes = CryptoJS.AES.decrypt(res.data.metadata, import.meta.env.VITE_SECRET_CRYPTO);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) {
                console.error('Failed to decrypt data');
                return;
            }
            const userData = JSON.parse(originalText);
            setDataUser(userData || {});
        } catch {
            setDataUser({});
        } finally {
            // ...
        }
    };

    useEffect(() => {
        const token = cookies.get('logged');
        if (!token) {
            return;
        }

        fetchAuth();
    }, []);

    return (
        <Context.Provider
            value={{
                dataUser,
                conversations,
                newMessage,
                newNotification,
            }}
        >
            {children}
            <ToastContainer />
        </Context.Provider>
    );
}
