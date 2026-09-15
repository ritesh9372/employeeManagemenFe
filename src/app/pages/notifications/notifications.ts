import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>System Notifications</h2>
          <p class="subtitle">Stay updated on approvals, assignments, and alerts</p>
        </div>
        <button mat-stroked-button color="primary" (click)="markAllRead()">
          <mat-icon>done_all</mat-icon> Mark All as Read
        </button>
      </div>

      <div class="inline-loader" *ngIf="isNotifLoading">
        <mat-spinner diameter="32"></mat-spinner>
        <span>Loading notifications...</span>
      </div>

      <div class="notif-list" *ngIf="!isNotifLoading">
        <mat-card class="notif-card" *ngFor="let n of notifications" [class.unread]="!n.is_read">
          <mat-card-content class="notif-content">
            <div class="notif-icon"><mat-icon>notifications</mat-icon></div>
            <div class="notif-details">
              <strong>{{n.title}}</strong>
              <p>{{n.message}}</p>
              <span class="notif-time">{{n.created_at | date:'medium'}}</span>
            </div>
            <button mat-icon-button (click)="markRead(n)" *ngIf="!n.is_read"><mat-icon>check</mat-icon></button>
          </mat-card-content>
        </mat-card>

        <div class="empty-state" *ngIf="notifications.length === 0">
          <mat-icon>notifications_off</mat-icon>
          <h3>No notifications</h3>
          <p>You are all caught up!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 20px; color: #555; }
    .notif-list { display: flex; flex-direction: column; gap: 12px; }
    .notif-card { border-radius: 12px !important; }
    .notif-card.unread { border-left: 4px solid #1a237e; background: #f4f5fa; }
    .notif-content { display: flex; align-items: center; gap: 16px; padding: 16px !important; }
    .notif-icon { width: 40px; height: 40px; border-radius: 50%; background: #e8eaf6; color: #1a237e; display: flex; align-items: center; justify-content: center; }
    .notif-details { flex: 1; }
    .notif-details p { margin: 4px 0 2px; font-size: 0.875rem; color: #444; }
    .notif-time { font-size: 0.75rem; color: #888; }
    .empty-state { text-align: center; padding: 48px; color: #777; background: white; border-radius: 12px; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 8px; }
  `]
})
export class Notifications implements OnInit {
  private notifService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  notifications: any[] = [];
  isNotifLoading = false;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isNotifLoading = true;
    this.cdr.markForCheck();
    this.notifService.getAll().pipe(
      finalize(() => {
        this.isNotifLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.notifications = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.notifications.length === 0) this.notifications = [];
        this.cdr.markForCheck();
      }
    });
  }

  markRead(n: any): void {
    this.notifService.markAsRead(n.id).subscribe({
      next: () => {
        n.is_read = 1;
        this.cdr.markForCheck();
      }
    });
  }

  markAllRead(): void {
    this.notifService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = 1);
        this.cdr.markForCheck();
      }
    });
  }
}
