import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

export const useVoiceSearch = (onFinalResult?: (text: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState('');

    // Refs to avoid stale closures in callbacks
    const transcriptRef = useRef('');
    const isListeningRef = useRef(false);   // tracks if we are in active "session"
    const isPausedRef = useRef(false);
    const localeRef = useRef('en-US');
    const onFinalResultRef = useRef(onFinalResult);

    // Keep refs in sync
    useEffect(() => { onFinalResultRef.current = onFinalResult; }, [onFinalResult]);

    const updateTranscript = useCallback((text: string) => {
        transcriptRef.current = text;
        setTranscript(text);
    }, []);

    const resetTranscript = useCallback(() => {
        transcriptRef.current = '';
        setTranscript('');
    }, []);

    useEffect(() => {
        if (Platform.OS === 'web') return;

        Voice.onSpeechStart = () => {
            setIsListening(true);
            isListeningRef.current = true;
        };

        // Android Voice is NOT continuous — it stops after a pause in speech.
        // If we're still in an active "session" (not paused/cancelled), restart it.
        Voice.onSpeechEnd = () => {
            setIsListening(false);
            if (isListeningRef.current && !isPausedRef.current) {
                // Auto-restart after a brief delay
                setTimeout(() => {
                    if (isListeningRef.current && !isPausedRef.current) {
                        Voice.start(localeRef.current).catch(() => {});
                    }
                }, 300);
            }
        };

        Voice.onSpeechError = (e: SpeechErrorEvent) => {
            const code = String(e.error?.code ?? e.error?.message ?? '');
            // Code 5 = client-side timeout (normal after speech ends) — restart if in session
            if (code === '5' || code.startsWith('5/')) {
                setIsListening(false);
                if (isListeningRef.current && !isPausedRef.current) {
                    setTimeout(() => {
                        if (isListeningRef.current && !isPausedRef.current) {
                            Voice.start(localeRef.current).catch(() => {});
                        }
                    }, 300);
                }
                return;
            }
            // Code 7 = no match — not fatal, let it auto-restart
            if (code === '7' || code.startsWith('7/')) {
                setIsListening(false);
                return;
            }
            console.warn('Speech Error:', code, e);
            setError(e.error?.message || 'Speech recognition error');
            setIsListening(false);
        };

        // Real-time partial words — just update the display, do NOT call callback
        Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
            if (e.value && e.value.length > 0) {
                updateTranscript(e.value[0]);
            }
        };

        // Final recognised text for this chunk — accumulate, do NOT call callback yet
        // (callback is called only when user presses DONE)
        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
            if (e.value && e.value.length > 0) {
                updateTranscript(e.value[0]);
            }
        };

        return () => {
            isListeningRef.current = false;
            Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
        };
    }, [updateTranscript]);

    const startListening = useCallback(async (locale = 'en-US') => {
        localeRef.current = locale;
        isPausedRef.current = false;
        setIsPaused(false);
        setError(null);

        if (Platform.OS === 'web') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setError('Speech recognition not supported in this browser');
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.lang = locale;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onstart = () => { setIsListening(true); isListeningRef.current = true; };
            recognition.onend = () => { setIsListening(false); };
            recognition.onerror = (e: any) => setError(e.error);
            recognition.onresult = (e: any) => {
                const text = e.results[e.results.length - 1][0].transcript;
                updateTranscript(text);
            };
            recognition.start();
            return;
        }

        isListeningRef.current = true;
        try {
            await Voice.start(locale);
        } catch (e: any) {
            console.error('Start Voice Error:', e);
            isListeningRef.current = false;
            setError(e.message);
        }
    }, [updateTranscript]);

    /**
     * stopListening — called when user presses DONE.
     * Stops the voice session and fires the final callback with accumulated transcript.
     */
    const stopListening = useCallback(async () => {
        isListeningRef.current = false;
        isPausedRef.current = false;

        const finalText = transcriptRef.current;

        if (Platform.OS === 'web') {
            if (finalText.trim() && onFinalResultRef.current) {
                onFinalResultRef.current(finalText);
            }
            return;
        }

        try {
            await Voice.stop();
        } catch (_) {}

        // Fire callback with whatever has been transcribed
        if (finalText.trim() && onFinalResultRef.current) {
            onFinalResultRef.current(finalText);
        }
    }, []);

    /**
     * cancelListening — called when user presses CANCEL / closes modal.
     * Stops voice without firing the callback. Clears transcript.
     */
    const cancelListening = useCallback(async () => {
        isListeningRef.current = false;
        isPausedRef.current = false;
        setIsListening(false);
        setIsPaused(false);
        resetTranscript();
        if (Platform.OS === 'web') return;
        try {
            await Voice.cancel();
        } catch (_) {}
    }, [resetTranscript]);

    /**
     * pauseListening — pauses the microphone without clearing the transcript.
     * User can resume later.
     */
    const pauseListening = useCallback(async () => {
        isPausedRef.current = true;
        setIsPaused(true);
        setIsListening(false);
        if (Platform.OS === 'web') return;
        try {
            await Voice.stop();
        } catch (_) {}
    }, []);

    /**
     * resumeListening — restarts recording using saved locale without clearing transcript.
     */
    const resumeListening = useCallback(async () => {
        isPausedRef.current = false;
        isListeningRef.current = true;
        setIsPaused(false);
        setError(null);
        if (Platform.OS === 'web') return;
        try {
            await Voice.start(localeRef.current);
        } catch (e: any) {
            console.error('Resume Voice Error:', e);
            isListeningRef.current = false;
        }
    }, []);

    return {
        isListening,
        isPaused,
        error,
        transcript,
        startListening,
        stopListening,
        cancelListening,
        pauseListening,
        resumeListening,
        resetTranscript,
    };
};
