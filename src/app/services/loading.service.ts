import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  startRequest(): void {
    this.activeRequests.update(count => count + 1);
    this.updateLoadingState();
  }

  endRequest(): void {
    this.activeRequests.update(count => Math.max(0, count - 1));
    this.updateLoadingState();
  }

  private updateLoadingState(): void {
    this.isLoading.set(this.activeRequests() > 0);
  }
}