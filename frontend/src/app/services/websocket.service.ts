import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { InstallationProgress } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket | null = null;
  private progressSubject = new Subject<InstallationProgress>();
  private logSubject = new Subject<{ taskId: string; softwareId: string; message: string; progress: number }>();
  private completeSubject = new Subject<{ installationId: string }>();

  get progress$(): Observable<InstallationProgress> {
    return this.progressSubject.asObservable();
  }

  get logs$(): Observable<{ taskId: string; softwareId: string; message: string; progress: number }> {
    return this.logSubject.asObservable();
  }

  get complete$(): Observable<{ installationId: string }> {
    return this.completeSubject.asObservable();
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.wsUrl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('progress', (data: InstallationProgress) => {
      this.progressSubject.next(data);
    });

    this.socket.on('log', (data: any) => {
      this.logSubject.next(data);
    });

    this.socket.on('installation-complete', (data: { installationId: string }) => {
      this.completeSubject.next(data);
    });
  }

  joinInstallation(installationId: string): void {
    this.socket?.emit('join-installation', installationId);
  }

  leaveInstallation(installationId: string): void {
    this.socket?.emit('leave-installation', installationId);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
