import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="section-header">
        <div>
          <h2>System Settings</h2>
          <p class="subtitle">Application preferences and system information</p>
        </div>
      </div>

      <mat-card class="settings-card">
        <mat-card-header>
          <div class="icon-circle"><mat-icon>info</mat-icon></div>
          <div>
            <mat-card-title>Employee Management System v1.0.0</mat-card-title>
            <mat-card-subtitle>Built with Angular 22, Express 5, and MySQL</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content class="settings-body">
          <p>System is running in production mode. Database connection is active and configured.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .settings-card { border-radius: 12px !important; }
    .icon-circle { width: 44px; height: 44px; border-radius: 50%; background: #e8eaf6; color: #1a237e; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
    .settings-body { padding-top: 16px; color: #444; }
  `]
})
export class Settings {}
