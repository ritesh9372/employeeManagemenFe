import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { AnnouncementService } from '../../services/announcement.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>Announcements & Bulletins</h2>
          <p class="subtitle">Company-wide news and updates</p>
        </div>
        <button mat-raised-button color="primary" (click)="openModal()" *ngIf="authService.isAdminOrHR()">
          <mat-icon>campaign</mat-icon> Post Announcement
        </button>
      </div>

      <div class="inline-loader" *ngIf="isAnnouncementsLoading">
        <mat-spinner diameter="32"></mat-spinner>
        <span>Loading announcements...</span>
      </div>

      <div class="feed-grid" *ngIf="!isAnnouncementsLoading">
        <mat-card class="feed-card" *ngFor="let a of announcements">
          <mat-card-header>
            <div class="feed-icon"><mat-icon>campaign</mat-icon></div>
            <div>
              <mat-card-title>{{a.title}}</mat-card-title>
              <mat-card-subtitle>Posted by {{a.created_by_name || 'HR Team'}} • {{a.created_at ? (a.created_at | date:'mediumDate') : (a.publish_date | date:'mediumDate')}}</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-card-content class="feed-body">
            <p>{{a.description}}</p>
          </mat-card-content>
        </mat-card>

        <div class="no-records-card" *ngIf="announcements.length === 0">
          <mat-icon class="empty-icon">volume_off</mat-icon>
          <p>No active announcements posted.</p>
        </div>
      </div>

      <!-- Modal Form renders immediately -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Post Announcement</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="annForm" (ngSubmit)="saveAnnouncement()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title *</mat-label>
              <input matInput formControlName="title" placeholder="e.g. Quarterly Townhall Meeting">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Announcement Text *</mat-label>
              <textarea matInput formControlName="description" rows="4" placeholder="Provide notice body..."></textarea>
            </mat-form-field>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="annForm.invalid || isSubmitting">
                <mat-spinner diameter="18" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">Publish</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 20px; color: #555; }
    .feed-grid { display: flex; flex-direction: column; gap: 16px; }
    .feed-card { border-radius: 12px !important; }
    .feed-icon { width: 44px; height: 44px; border-radius: 50%; background: #e8eaf6; color: #1a237e; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
    .feed-body { padding-top: 12px; font-size: 0.95rem; color: #333; line-height: 1.5; }

    .no-records-card { text-align: center; padding: 48px; background: white; border-radius: 12px; color: #777; }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 12px; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-box { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 520px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a237e; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
  `]
})
export class Announcements implements OnInit {
  authService = inject(AuthService);
  private annService = inject(AnnouncementService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  announcements: any[] = [];
  isAnnouncementsLoading = false;
  isSubmitting = false;
  showModal = false;

  annForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isAnnouncementsLoading = true;
    this.cdr.markForCheck();
    this.annService.getAll().pipe(
      finalize(() => {
        this.isAnnouncementsLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.announcements = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.announcements.length === 0) this.announcements = [];
        this.cdr.markForCheck();
      }
    });
  }

  openModal(): void {
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.annForm.reset();
    this.cdr.markForCheck();
  }

  saveAnnouncement(): void {
    if (this.annForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.annService.create(this.annForm.value).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Announcement published!', 'Close', { duration: 3000 });
        this.closeModal();
        this.loadAnnouncements();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }
}
