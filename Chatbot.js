import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card, ListGroup, Row, Col, Dropdown, Badge } from 'react-bootstrap';
import Modal from 'react-modal';
import Picker from 'emoji-picker-react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { FaRobot, FaUser, FaSun, FaMoon, FaCopy, FaTrash, FaPaperPlane, FaMicrophone, FaEllipsisV } from 'react-icons/fa';
import { BsEmojiSmile, BsArrowDown } from 'react-icons/bs';
import './Chatbot.css';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [typingIndicator, setTypingIndicator] = useState(false);
    const [botTyping, setBotTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([
        "What's the weather today?",
        "Tell me a joke",
        "Who is the principal?",
        "What courses do you offer?"
    ]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(transcript);
                setIsRecording(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Speech recognition failed. Please try typing instead.',
                    timestamp: new Date().toLocaleTimeString()
                }]);
            };
        } else {
            console.warn('Speech recognition not supported');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Add a welcome message with an emoji and image
    useEffect(() => {
        setMessages([
            {
                role: 'assistant',
                content: 'Hello! I\'m VIGNAN JnanaMitra, your AI assistant. How can I help you today? 😊',
                image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    }, []);

    // Scroll to the bottom of the chat whenever messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, typingIndicator]);

    // Simulate bot typing
    useEffect(() => {
        if (botTyping) {
            const timer = setTimeout(() => {
                setTypingIndicator(false);
                setBotTyping(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [botTyping]);

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const newUserMessage = {
            role: 'user',
            content: userInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        setShowEmojiPicker(false);
        setTypingIndicator(true);
        setBotTyping(true);

        try {
            // Simulate API delay for demo
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await axios.post('http://localhost:8003/api/chat', {
                messages: messages,
                new_message: userInput
            });

            let imageUrl = '';
            if (userInput.toLowerCase().includes('france')) {
                imageUrl = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
            } else if (userInput.toLowerCase().includes('college') || userInput.toLowerCase().includes('vignan')) {
                imageUrl = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
            }

            const newBotMessage = {
                role: 'assistant',
                content: response.data.message,
                image: imageUrl,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages((prev) => [...prev, newBotMessage]);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message;
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `Error: ${errorMessage} 😓`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        } finally {
            setIsLoading(false);
            setTypingIndicator(false);
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: 'Chat cleared! How can I assist you now? 😊',
                image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    const toggleTheme = () => {
        setIsDarkTheme((prev) => !prev);
    };

    const openModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedImage('');
    };

    const onEmojiClick = (emojiObject) => {
        setUserInput((prev) => prev + emojiObject.emoji);
        inputRef.current.focus();
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Show a subtle notification instead of alert
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = 'Copied!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    };

    const handleSuggestionClick = (suggestion) => {
        setUserInput(suggestion);
        inputRef.current.focus();
    };

    const startRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Particle effect initialization
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async (container) => {
        console.log(container);
    }, []);

    return (
        <Container className={`chat-container ${isDarkTheme ? 'dark-theme' : ''}`}>
            <Particles
                id="tsparticles"
                init={particlesInit}
                loaded={particlesLoaded}
                options={{
                    background: {
                        color: {
                            value: "transparent",
                        },
                    },
                    fpsLimit: 60,
                    particles: {
                        number: {
                            value: 50,
                            density: {
                                enable: true,
                                area: 800,
                            },
                        },
                        color: {
                            value: isDarkTheme ? "#ffffff" : "#000000",
                        },
                        shape: {
                            type: "circle",
                        },
                        opacity: {
                            value: 0.5,
                            random: true,
                        },
                        size: {
                            value: 3,
                            random: true,
                        },
                        move: {
                            enable: true,
                            speed: 1,
                            direction: "none",
                            random: false,
                            straight: false,
                            outModes: "out",
                            bounce: false,
                        },
                    },
                    detectRetina: true,
                }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
            />

            <div className="chat-header">
                <h2 className="text-center mb-4 title">
                    <FaRobot className="mr-2" /> VIGNAN JnanaMitra
                    <Badge bg="info" className="ml-2">Beta</Badge>
                </h2>
            </div>

            <Card className="chat-card">
                <Card.Body>
                    <Card.Title className="d-flex justify-content-between align-items-center">
                        <span>Chat with VIGNAN JnanaMitra</span>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-basic">
                                <FaEllipsisV />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleClearChat}>
                                    <FaTrash className="mr-2" /> Clear Chat
                                </Dropdown.Item>
                                <Dropdown.Item onClick={toggleTheme}>
                                    {isDarkTheme ? (
                                        <>
                                            <FaSun className="mr-2" /> Light Mode
                                        </>
                                    ) : (
                                        <>
                                            <FaMoon className="mr-2" /> Dark Mode
                                        </>
                                    )}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Card.Title>

                    <div className="suggestions-container">
                        {suggestions.map((suggestion, index) => (
                            <Button
                                key={index}
                                variant="outline-primary"
                                size="sm"
                                className="mr-2 mb-2"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </Button>
                        ))}
                    </div>

                    <ListGroup variant="flush" className="chat-messages">
                        {messages.map((msg, index) => (
                            <ListGroup.Item key={index} className="border-0">
                                <Row className={msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}>
                                    <Col xs="auto">
                                        {msg.role === 'assistant' ? (
                                            <div className="avatar-container">
                                                <FaRobot className="avatar bot-avatar" />
                                            </div>
                                        ) : (
                                            <div className="avatar-container">
                                                <FaUser className="avatar user-avatar" />
                                            </div>
                                        )}
                                    </Col>
                                    <Col xs={8} className="p-0">
                                        <div className={`message-bubble ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}>
                                            <div className="message-header">
                                                <strong>{msg.role === 'user' ? 'You' : 'VIGNAN JnanaMitra'}</strong>
                                                <small className="message-timestamp">{msg.timestamp}</small>
                                            </div>
                                            <div className="message-content">
                                                {msg.content}
                                                {msg.image && (
                                                    <img
                                                        src={msg.image}
                                                        alt="Chat Image"
                                                        className="chat-image mt-2"
                                                        onClick={() => openModal(msg.image)}
                                                    />
                                                )}
                                            </div>
                                            <div className="message-actions">
                                                <button
                                                    className="copy-button"
                                                    onClick={() => copyToClipboard(msg.content)}
                                                    title="Copy to clipboard"
                                                >
                                                    <FaCopy />
                                                </button>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                        {(typingIndicator || isLoading) && (
                            <ListGroup.Item className="border-0">
                                <Row className="justify-content-start">
                                    <Col xs="auto">
                                        <div className="avatar-container">
                                            <FaRobot className="avatar bot-avatar" />
                                        </div>
                                    </Col>
                                    <Col xs={8} className="p-0">
                                        <div className="message-bubble bot-message typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        )}
                        <div ref={messagesEndRef} />
                    </ListGroup>
                    <div className="scroll-to-bottom" onClick={scrollToBottom}>
                        <BsArrowDown />
                    </div>
                </Card.Body>
            </Card>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '0',
                        border: 'none',
                        background: 'transparent'
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)'
                    }
                }}
            >
                <img src={selectedImage} alt="Large View" className="modal-image" />
                <Button variant="danger" onClick={closeModal} className="mt-3">
                    Close
                </Button>
            </Modal>

            <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mt-4">
                <Form.Group className="d-flex position-relative">
                    <button
                        type="button"
                        className="emoji-button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        title="Emoji picker"
                    >
                        <BsEmojiSmile />
                    </button>
                    {showEmojiPicker && (
                        <div className="emoji-picker">
                            <Picker onEmojiClick={onEmojiClick} />
                        </div>
                    )}
                    <Form.Control
                        as="textarea"
                        rows={1}
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="message-input"
                    />
                    <div className="input-buttons">
                        <button
                            type="button"
                            className={`voice-button ${isRecording ? 'recording' : ''}`}
                            onClick={isRecording ? stopRecording : startRecording}
                            title={isRecording ? 'Stop recording' : 'Voice input'}
                            disabled={!('webkitSpeechRecognition' in window)}
                        >
                            <FaMicrophone />
                        </button>
                        <Button
                            variant="primary"
                            className="send-button"
                            onClick={handleSendMessage}
                            disabled={isLoading || !userInput.trim()}
                            title="Send message"
                        >
                            {isLoading ? '...' : <FaPaperPlane />}
                        </Button>
                    </div>
                </Form.Group>
            </Form>

            <div className="fab" onClick={toggleTheme}>
                {isDarkTheme ? <FaSun /> : <FaMoon />}
            </div>
        </Container>
    );
};

export default Chatbot;