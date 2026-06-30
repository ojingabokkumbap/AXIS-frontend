import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

export interface AdminWarningPayload {
  level: string;
  reason: string;
  message: string;
}

export interface ExamSessionSocketHandlers {
  onWarning?: (payload: AdminWarningPayload) => void;
  onForceTerminate?: (payload: { reason: string }) => void;
  onTimerPaused?: (payload: { reason: string; pausedAt: number }) => void;
  onTimerResumed?: (payload: { hardDeadline: string | null; elapsedMs?: number }) => void;
  onTimeExtended?: (payload: { seconds: number; hardDeadline: string | null }) => void;
}

/**
 * Candidate-side Socket.io client for admin monitor actions pushed during an exam.
 * Connects to `/ws/exam`, joins the session room, and forwards server events.
 */
export function useExamSessionSocket(
  sessionId: string | undefined,
  enabled: boolean,
  handlers: ExamSessionSocketHandlers,
): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!sessionId || !enabled) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const apiBase = (import.meta.env.VITE_API_BASE_URL as string)?.trim().replace(/\/$/, '') || '';
    const wsUrl = apiBase || window.location.origin.replace(/:\d+$/, ':3333');

    const socket: Socket = io(`${wsUrl}/ws/exam`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 5_000,
    });

    const join = () => {
      socket.emit('exam:join', { sessionId });
    };

    socket.on('connect', join);
    socket.on('exam:warning', (payload: AdminWarningPayload) => {
      handlersRef.current.onWarning?.(payload);
    });
    socket.on('exam:force-terminate', (payload: { reason: string }) => {
      handlersRef.current.onForceTerminate?.(payload);
    });
    socket.on('exam:timer-paused', (payload: { reason: string; pausedAt: number }) => {
      handlersRef.current.onTimerPaused?.(payload);
    });
    socket.on('exam:timer-resumed', (payload: { hardDeadline: string | null; elapsedMs?: number }) => {
      handlersRef.current.onTimerResumed?.(payload);
    });
    socket.on('exam:time-extended', (payload: { seconds: number; hardDeadline: string | null }) => {
      handlersRef.current.onTimeExtended?.(payload);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [sessionId, enabled]);
}
