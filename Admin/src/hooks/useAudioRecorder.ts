/**
 * useVoiceSegments
 * ─────────────────
 * Uses the already-installed @react-native-voice/voice to collect multiple
 * transcript segments (like voice memos).  Each time the user presses START →
 * speaks → presses STOP, a new segment is appended to the list.
 * All segments are merged and sent to the AI as one combined text.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import Voice, {
    SpeechResultsEvent,
    SpeechErrorEvent,
} from '@react-native-voice/voice';

export interface VoiceSegment {
    id: string;
    text: string;
    timestamp: number;
}

export const useAudioRecorder = () => {
    // isSessionActive controls the UI button perfectly without flickering
    const [isSessionActive, setIsSessionActive] = useState(false);
    
    // Internal native state
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordTime, setRecordTime] = useState('00:00');
    const [segments, setSegments] = useState<VoiceSegment[]>([]);
    
    // The final visible text on UI
    const [liveText, setLiveText] = useState('');

    // Refs
    const isActiveRef = useRef(false);
    const localeRef = useRef('ta-IN');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const secondsRef = useRef(0);

    // Text accumulation buffers
    const accumulatedTextRef = useRef(''); // completely finalized chunks
    const chunkTextRef = useRef(''); // currently active native voice chunk

    const updateLiveDisplay = useCallback(() => {
        const acc = accumulatedTextRef.current.trim();
        const chk = chunkTextRef.current.trim();
        const combo = [acc, chk].filter(Boolean).join('. ');
        setLiveText(combo);
    }, []);

    const commitCurrentChunk = useCallback(() => {
        if (chunkTextRef.current.trim()) {
            const acc = accumulatedTextRef.current.trim();
            const chk = chunkTextRef.current.trim();
            accumulatedTextRef.current = [acc, chk].filter(Boolean).join('. ');
            chunkTextRef.current = '';
        }
    }, []);

    /* ── Timer helpers ── */
    const startTimer = useCallback(() => {
        secondsRef.current = 0;
        timerRef.current = setInterval(() => {
            secondsRef.current += 1;
            const m = String(Math.floor(secondsRef.current / 60)).padStart(2, '0');
            const s = String(secondsRef.current % 60).padStart(2, '0');
            setRecordTime(`${m}:${s}`);
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setRecordTime('00:00');
    }, []);

    /* ── Voice callbacks ── */
    useEffect(() => {
        if (Platform.OS === 'web') return;

        Voice.onSpeechStart = () => {
            setIsRecording(true);
        };

        Voice.onSpeechEnd = () => {
            setIsRecording(false);
            commitCurrentChunk();
            updateLiveDisplay();

            // Auto-restart if session is still active
            if (isActiveRef.current) {
                setTimeout(() => {
                    if (isActiveRef.current) {
                        Voice.start(localeRef.current).catch(() => { });
                    }
                }, 100);
            }
        };

        Voice.onSpeechError = (e: SpeechErrorEvent) => {
            setIsRecording(false);
            const code = String(e.error?.code ?? '');
            if ((code === '5' || code.startsWith('5/') || code === '7' || code.startsWith('7/')) && isActiveRef.current) {
                commitCurrentChunk();
                updateLiveDisplay();
                setTimeout(() => {
                    if (isActiveRef.current) {
                        Voice.start(localeRef.current).catch(() => { });
                    }
                }, 100);
                return;
            }
        };

        Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
            if (e.value?.[0]) {
                chunkTextRef.current = e.value[0];
                updateLiveDisplay();
            }
        };

        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
            if (e.value?.[0]) {
                chunkTextRef.current = e.value[0];
                commitCurrentChunk();
                updateLiveDisplay();
            }
        };

        return () => {
            isActiveRef.current = false;
            Voice.destroy().then(Voice.removeAllListeners).catch(() => { });
        };
    }, [commitCurrentChunk, updateLiveDisplay]);

    /* ── Web: use browser SpeechRecognition ── */
    const webRecognitionRef = useRef<any>(null);

    const startWebRecognition = useCallback(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const rec = new SR();
        rec.lang = localeRef.current;
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e: any) => {
            let finalized = '';
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) {
                    finalized += e.results[i][0].transcript;
                } else {
                    interim += e.results[i][0].transcript;
                }
            }
            if (finalized) {
                accumulatedTextRef.current += (accumulatedTextRef.current ? '. ' : '') + finalized.trim();
            }
            chunkTextRef.current = interim.trim();
            updateLiveDisplay();
        };
        rec.onend = () => {
            if (isActiveRef.current) rec.start();
            else setIsRecording(false);
        };
        rec.start();
        webRecognitionRef.current = rec;
        setIsRecording(true);
    }, [updateLiveDisplay]);

    const stopWebRecognition = useCallback(() => {
        webRecognitionRef.current?.stop();
        webRecognitionRef.current = null;
    }, []);

    /* ─────────────────────────────────────────────────────────
     * onStartRecord
     * ──────────────────────────────────────────────────────── */
    const onStartRecord = useCallback(async (locale = 'ta-IN') => {
        localeRef.current = locale;
        isActiveRef.current = true;
        setIsSessionActive(true);
        setIsPaused(false);
        
        accumulatedTextRef.current = '';
        chunkTextRef.current = '';
        updateLiveDisplay();
        
        startTimer();

        if (Platform.OS === 'web') {
            startWebRecognition();
            return;
        }
        try {
            await Voice.start(locale);
        } catch (e) {
            isActiveRef.current = false;
            setIsSessionActive(false);
            stopTimer();
        }
    }, [startWebRecognition, startTimer, updateLiveDisplay]);

    /* ─────────────────────────────────────────────────────────
     * onPauseRecord
     * ──────────────────────────────────────────────────────── */
    const onPauseRecord = useCallback(async () => {
        isActiveRef.current = false;
        setIsSessionActive(false);
        setIsPaused(true);
        setIsRecording(false);
        stopTimer();

        if (Platform.OS === 'web') {
            stopWebRecognition();
            return;
        }
        try { await Voice.stop(); } catch (_) { }
    }, [stopWebRecognition, stopTimer]);

    /* ─────────────────────────────────────────────────────────
     * onResumeRecord
     * ──────────────────────────────────────────────────────── */
    const onResumeRecord = useCallback(async () => {
        isActiveRef.current = true;
        setIsSessionActive(true);
        setIsPaused(false);
        startTimer();

        if (Platform.OS === 'web') {
            startWebRecognition();
            return;
        }
        try {
            await Voice.start(localeRef.current);
        } catch (_) { }
    }, [startWebRecognition, startTimer]);

    /* ─────────────────────────────────────────────────────────
     * onStopRecord
     * ──────────────────────────────────────────────────────── */
    const onStopRecord = useCallback(async () => {
        isActiveRef.current = false;
        setIsSessionActive(false);
        setIsRecording(false);
        setIsPaused(false);
        stopTimer();

        if (Platform.OS === 'web') {
            stopWebRecognition();
        } else {
            try { await Voice.stop(); } catch (_) { }
        }

        commitCurrentChunk();
        const finalText = accumulatedTextRef.current.trim();
        
        if (finalText) {
            setSegments(prev => [
                ...prev,
                { id: `seg_${Date.now()}`, text: finalText, timestamp: Date.now() },
            ]);
        }
        
        accumulatedTextRef.current = '';
        chunkTextRef.current = '';
        updateLiveDisplay();
    }, [stopWebRecognition, stopTimer, commitCurrentChunk, updateLiveDisplay]);

    const deleteSegment = useCallback((id: string) => {
        setSegments(prev => prev.filter(s => s.id !== id));
    }, []);

    const clearAllSegments = useCallback(() => {
        setSegments([]);
        accumulatedTextRef.current = '';
        chunkTextRef.current = '';
        updateLiveDisplay();
    }, [updateLiveDisplay]);

    const combinedTranscript = useCallback(() =>
        segments.map(s => s.text).join('. '),
    [segments]);

    return {
        isSessionActive, // New stable UI toggle state
        isRecording,
        isPaused,
        recordTime,
        segments,
        liveText,
        onStartRecord,
        onPauseRecord,
        onResumeRecord,
        onStopRecord,
        deleteSegment,
        clearAllSegments,
        combinedTranscript,
    };
};
