
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getReflectiveFeedback, getTopicSuggestions, getLearningAssistance } from './services/geminiService';

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Central spark representing insight and awareness */}
        <path d="M12 17.5v2.5" />
        <path d="M12 4v2.5" />
        <path d="M15.536 15.536l1.768 1.768" />
        <path d="M6.697 6.697l1.768 1.768" />
        <path d="M17.5 12h2.5" />
        <path d="M4 12h2.5" />
        <path d="M15.536 8.464l1.768-1.768" />
        <path d="M6.697 17.303l1.768-1.768" />

        {/* The brain/mind, as a softer, more organic shape representing intelligence and learning spirit */}
        <path d="M8 9.5C8.448 8.052 9.552 7 11 7h2c1.448 0 2.552 1.052 3 2.5" />
        <path d="M16 14.5c-.448 1.448-1.552 2.5-3 2.5h-2c-1.448 0-2.552-1.052-3-2.5" />
        <path d="M9 8.5c-2.43.58-4.285 2.435-4.865 4.865" />
        <path d="M15 15.5c2.43-.58 4.285-2.435 4.865-4.865" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);

const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
);


const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
    </div>
);

const Header: React.FC = () => (
    <header className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
            PEKA-SMART
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Asisten Reflektif AI untuk membantumu belajar Koding & Kecerdasan Artifisial.
        </p>
    </header>
);

export interface Message {
    role: 'user' | 'model';
    content: string;
    image?: string | null;
}

interface InputFormProps {
    onSubmit: (text: string, image: string | null) => void;
    isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
    const [inputValue, setInputValue] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recognitionRef = useRef<any>(null); // Using 'any' for SpeechRecognition for cross-browser compatibility

    const cleanupCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const handleOpenCamera = async () => {
        cleanupCamera();
        setCameraError(null);
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError("Tidak bisa mengakses kamera. Pastikan Anda telah memberikan izin.");
            setIsCameraOpen(false);
        }
    };

    const handleCloseCamera = useCallback(() => {
        cleanupCamera();
        setIsCameraOpen(false);
    }, [cleanupCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                setCapturedImage(dataUrl);
                handleCloseCamera();
            }
        }
    };

    const handleToggleListening = () => {
        // FIX: Cast window to any to access experimental SpeechRecognition APIs
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechError("Maaf, browsermu tidak mendukung fitur speech-to-text.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'id-ID';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setSpeechError(null);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'not-allowed') {
                setSpeechError("Izin mikrofon ditolak. Aktifkan di pengaturan browser.");
            } else {
                setSpeechError(`Terjadi kesalahan: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setInputValue(prev => prev.slice(0, prev.length - interimTranscript.length) + finalTranscript + interimTranscript);
        };

        recognition.start();
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((inputValue.trim() || capturedImage) && !isLoading) {
            onSubmit(inputValue, capturedImage);
            setInputValue('');
            setCapturedImage(null);
        }
    };
    
    useEffect(() => {
        return () => {
            cleanupCamera();
            recognitionRef.current?.stop();
        };
    }, [cleanupCamera]);

    return (
        <>
            <form onSubmit={handleSubmit} className="relative mt-4">
                {capturedImage && (
                    <div className="mb-2 relative w-32 h-32 border-2 border-slate-200 rounded-lg overflow-hidden group">
                        <img src={capturedImage} alt="Captured preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => setCapturedImage(null)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                )}
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                        isListening ? "Mendengarkan... katakan sesuatu." : 
                        capturedImage ? "Tambahkan deskripsi untuk gambarmu..." : "Tuliskan jawaban, kode, atau refleksimu di sini..."
                    }
                    className="w-full h-32 p-4 pr-28 text-slate-700 bg-white border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none shadow-sm"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        handleSubmit(e);
                      }
                    }}
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                     <button
                        type="button"
                        onClick={handleToggleListening}
                        className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        disabled={isLoading}
                        aria-label={isListening ? 'Berhenti Merekam' : 'Mulai Merekam Suara'}
                    >
                        <MicrophoneIcon />
                    </button>
                     <button
                        type="button"
                        onClick={handleOpenCamera}
                        className="p-2 rounded-full text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isLoading}
                        aria-label="Buka Kamera"
                    >
                        <CameraIcon />
                    </button>
                    <button
                        type="submit"
                        className="p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isLoading || (!inputValue.trim() && !capturedImage)}
                        aria-label="Dapatkan Umpan Balik"
                    >
                        <SendIcon />
                    </button>
                </div>
            </form>
             {speechError && <p className="mt-2 text-sm text-red-600 text-center">{speechError}</p>}
            {isCameraOpen && (
                 <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                    <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-[80%] rounded-lg shadow-2xl"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    {cameraError && <p className="text-white mt-4">{cameraError}</p>}
                    <div className="mt-6 flex items-center gap-6">
                        <button onClick={handleCloseCamera} className="px-6 py-3 text-white font-semibold bg-slate-600 rounded-lg hover:bg-slate-700 transition-colors">Batal</button>
                        <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 hover:ring-white/50 transition-all">
                            <div className="w-16 h-16 rounded-full bg-blue-600"></div>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

interface ChatHistoryProps {
    messages: Message[];
    isLoading: boolean;
    isHelping: boolean;
    error: string | null;
    onHelpRequest: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, isHelping, error, onHelpRequest }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, isHelping]);

    const isLastMessageModel = messages.length > 0 && messages[messages.length - 1].role === 'model';

    return (
        <div className="w-full min-h-[350px] p-4 bg-slate-50/50 backdrop-blur-sm border border-slate-200 rounded-xl shadow-inner flex flex-col overflow-y-auto max-h-[60vh]">
            {messages.length === 0 && !isLoading && (
                <div className="m-auto text-center text-slate-500">
                    <BrainIcon />
                    <h3 className="mt-4 text-xl font-semibold text-slate-700">Selamat Datang!</h3>
                    <p className="mt-1">
                        Saya siap membantumu merefleksikan proses belajarmu. <br/>
                        Masukkan hasil pekerjaanmu untuk memulai.
                    </p>
                </div>
            )}
            
            <div className="space-y-6">
                {messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                        <div key={index} className="flex flex-col">
                            <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                 {!isUser && (
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 17.5v2.5" /><path d="M12 4v2.5" /><path d="M15.536 15.536l1.768 1.768" /><path d="M6.697 6.697l1.768 1.768" /><path d="M17.5 12h2.5" /><path d="M4 12h2.5" /><path d="M15.536 8.464l1.768-1.768" /><path d="M6.697 17.303l1.768-1.768" /><path d="M8 9.5C8.448 8.052 9.552 7 11 7h2c1.448 0 2.552 1.052 3 2.5" /><path d="M16 14.5c-.448 1.448-1.552 2.5-3 2.5h-2c-1.448 0-2.552-1.052-3-2.5" /><path d="M9 8.5c-2.43.58-4.285 2.435-4.865 4.865" /><path d="M15 15.5c2.43-.58 4.285-2.435 4.865-4.865" />
                                        </svg>
                                    </div>
                                )}
                                <div className={`max-w-xl p-4 rounded-2xl shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`}>
                                    {message.image && (
                                        <img src={message.image} alt="User submission" className="rounded-lg mb-2 max-w-xs max-h-64 object-contain" />
                                    )}
                                    <p className="text-base whitespace-pre-wrap break-words">{message.content}</p>
                                </div>
                                {isUser && (
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center shadow-md">
                                        <UserIcon />
                                    </div>
                                )}
                            </div>
                            {!isUser && index === messages.length - 1 && !isLoading && !isHelping && (
                                <div className="mt-3 self-start ml-14">
                                    <button
                                        onClick={onHelpRequest}
                                        className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100/80 border border-blue-200 rounded-lg hover:bg-blue-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                                    >
                                        🎓 Bantu Saya Belajar
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {(isLoading || isHelping) && (
                 <div className="flex items-start gap-3 justify-start mt-6">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 17.5v2.5" /><path d="M12 4v2.5" /><path d="M15.536 15.536l1.768 1.768" /><path d="M6.697 6.697l1.768 1.768" /><path d="M17.5 12h2.5" /><path d="M4 12h2.5" /><path d="M15.536 8.464l1.768-1.768" /><path d="M6.697 17.303l1.768-1.768" /><path d="M8 9.5C8.448 8.052 9.552 7 11 7h2c1.448 0 2.552 1.052 3 2.5" /><path d="M16 14.5c-.448 1.448-1.552 2.5-3 2.5h-2c-1.448 0-2.552-1.052-3-2.5" /><path d="M9 8.5c-2.43.58-4.285 2.435-4.865 4.865" /><path d="M15 15.5c2.43-.58 4.285-2.435 4.865-4.865" />
                        </svg>
                    </div>
                    <div className="max-w-xl p-4 rounded-2xl bg-white rounded-bl-none border border-slate-200 shadow-sm">
                        <div className="flex items-center space-x-2">
                             <LoadingSpinner />
                             <span className="text-sm text-slate-500">{isHelping ? 'Mencari bantuan...' : 'Memberi umpan balik...'}</span>
                        </div>
                    </div>
                </div>
            )}

            {error && <p className="mt-4 text-red-600 font-medium text-center">{error}</p>}
            <div ref={chatEndRef} />
        </div>
    );
};

const TopicSuggestion: React.FC<{
    onSuggest: () => void;
    suggestions: string | null;
    isLoading: boolean;
    isDisabled: boolean;
    error: string | null;
}> = ({ onSuggest, suggestions, isLoading, isDisabled, error }) => {
    
    const renderSuggestions = (text: string) => {
        const lines = text.split('\n').filter(Boolean);
        const listStartIndex = lines.findIndex(line => line.match(/^\d+\.\s/));

        if (listStartIndex === -1) {
            return <p>{text}</p>;
        }

        const intro = lines.slice(0, listStartIndex).join('\n');
        const listItems = lines.slice(listStartIndex);

        return (
            <div className="prose prose-sm max-w-none text-slate-700">
                {intro && <p>{intro}</p>}
                <ol className="list-decimal list-inside mt-2 space-y-1">
                    {listItems.map((item, index) => (
                        <li key={index}>{item.replace(/^\d+\.\s/, '')}</li>
                    ))}
                </ol>
            </div>
        );
    };

    return (
        <div className="my-4 text-center">
            {!suggestions && (
                <button
                    onClick={onSuggest}
                    disabled={isDisabled || isLoading}
                    className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100/80 border border-blue-200 rounded-lg hover:bg-blue-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Menganalisis...' : '💡 Minta Saran Topik Belajar'}
                </button>
            )}
            
            {suggestions && (
                 <div className="p-4 mt-2 text-left bg-blue-50 border border-blue-200 rounded-lg">
                    {renderSuggestions(suggestions)}
                </div>
            )}
            
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};


export default function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHelping, setIsHelping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<string | null>(null);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem('peka-smart-chat-history');
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages) as Message[]);
            }
        } catch (e) {
            console.error("Failed to parse chat history from localStorage", e);
        }
    }, []);

    useEffect(() => {
        try {
            if (messages.length > 0) {
                localStorage.setItem('peka-smart-chat-history', JSON.stringify(messages));
            } else {
                localStorage.removeItem('peka-smart-chat-history');
            }
        } catch (e) {
            console.error("Failed to save/clear chat history in localStorage", e);
        }
    }, [messages]);

    const handleFeedbackRequest = useCallback(async (text: string, image: string | null) => {
        setIsLoading(true);
        setError(null);
        
        const userMessage: Message = { role: 'user', content: text, image: image };
        
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        try {
            const feedback = await getReflectiveFeedback(text, image);
            setMessages(prev => [...prev, { role: 'model', content: feedback, image: null }]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Tidak bisa menghubungi PEKA-SMART. Coba lagi nanti. (${errorMessage})`);
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const handleSuggestionRequest = useCallback(async () => {
        setIsSuggesting(true);
        setSuggestionError(null);
        setSuggestions(null);

        try {
            const result = await getTopicSuggestions(messages);
            setSuggestions(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setSuggestionError(errorMessage);
        } finally {
            setIsSuggesting(false);
        }
    }, [messages]);
    
    const handleHelpRequest = useCallback(async () => {
        setIsHelping(true);
        setError(null);

        try {
            const helpText = await getLearningAssistance(messages);
            setMessages(prev => [...prev, { role: 'model', content: helpText, image: null }]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Tidak bisa mendapatkan bantuan saat ini. Coba lagi nanti. (${errorMessage})`);
        } finally {
            setIsHelping(false);
        }
    }, [messages]);

    const handleClearChat = useCallback(() => {
        if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat percakapan? Tindakan ini tidak dapat dibatalkan.")) {
            setMessages([]);
            setSuggestions(null);
            setError(null);
            setSuggestionError(null);
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 bg-grid-slate-200/[0.4]">
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <Header />
                <div className="relative mt-8 p-6 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200">
                    {messages.length > 0 && !isLoading && (
                        <button
                            onClick={handleClearChat}
                            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors z-10"
                            aria-label="Bersihkan riwayat chat"
                        >
                            <TrashIcon />
                        </button>
                    )}
                    <ChatHistory 
                        messages={messages} 
                        isLoading={isLoading} 
                        isHelping={isHelping} 
                        error={error} 
                        onHelpRequest={handleHelpRequest} 
                    />
                    <TopicSuggestion 
                        onSuggest={handleSuggestionRequest}
                        suggestions={suggestions}
                        isLoading={isSuggesting}
                        isDisabled={messages.length < 2 || isLoading || isHelping}
                        error={suggestionError}
                    />
                    <InputForm onSubmit={handleFeedbackRequest} isLoading={isLoading || isHelping} />
                </div>
                <footer className="text-center mt-12 text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} PEKA-SMART. Dibuat untuk pembelajaran yang bermakna.</p>
                </footer>
            </main>
        </div>
    );
}
