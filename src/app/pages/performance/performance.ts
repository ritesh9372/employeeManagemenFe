import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { PerformanceService } from '../../services/performance.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>Performance Reviews</h2>
          <p class="subtitle">Employee evaluations, ratings, and feedback</p>
        </div>
        <button mat-raised-button color="primary" (click)="openModal()" *ngIf="!authService.isEmployee()">
          <mat-icon>rate_review</mat-icon> New Review
        </button>
      </div>

      <div class="inline-loader" *ngIf="isReviewsLoading">
        <mat-spinner diameter="32"></mat-spinner>
        <span>Loading performance reviews...</span>
      </div>

      <div class="review-grid" *ngIf="!isReviewsLoading">
        <mat-card class="review-card" *ngFor="let r of reviews">
          <mat-card-header>
            <div class="score-badge">{{r.overall_rating}}<span class="score-max">/5</span></div>
            <div>
              <mat-card-title>{{r.employee_name}}</mat-card-title>
              <mat-card-subtitle>{{r.review_period || 'General Review'}} • Evaluated by {{r.reviewer_name || 'Manager'}}</mat-card-subtitle>
            </div>
          </mat-card-header>

          <mat-card-content class="review-body">
            <div class="score-bar-grid">
              <div class="score-item"><span>Productivity:</span> <strong>{{r.productivity_score}}/5</strong></div>
              <div class="score-item"><span>Quality:</span> <strong>{{r.quality_score}}/5</strong></div>
              <div class="score-item"><span>Teamwork:</span> <strong>{{r.teamwork_score}}/5</strong></div>
              <div class="score-item"><span>Communication:</span> <strong>{{r.communication_score}}/5</strong></div>
            </div>

            <div class="feedback-box" *ngIf="r.strengths">
              <strong>Strengths:</strong> {{r.strengths}}
            </div>
            <div class="feedback-box" *ngIf="r.comments">
              <strong>Comments:</strong> {{r.comments}}
            </div>
          </mat-card-content>
        </mat-card>

        <div class="no-records-card" *ngIf="reviews.length === 0">
          <mat-icon class="empty-icon">star_rate</mat-icon>
          <p>No performance reviews recorded yet.</p>
        </div>
      </div>

      <!-- Modal Form renders immediately -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>New Performance Review</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="reviewForm" (ngSubmit)="saveReview()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Employee *</mat-label>
              <mat-select formControlName="employee_id">
                <mat-option *ngIf="isEmployeesLoading" disabled>Loading employees...</mat-option>
                <mat-option *ngFor="let emp of employees" [value]="emp.id">{{emp.first_name}} {{emp.last_name}}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Review Period (e.g. Q3 2026)</mat-label>
              <input matInput formControlName="review_period">
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Productivity (1-5)</mat-label>
                <input matInput type="number" formControlName="productivity_score" min="1" max="5">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Quality (1-5)</mat-label>
                <input matInput type="number" formControlName="quality_score" min="1" max="5">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Teamwork (1-5)</mat-label>
                <input matInput type="number" formControlName="teamwork_score" min="1" max="5">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Communication (1-5)</mat-label>
                <input matInput type="number" formControlName="communication_score" min="1" max="5">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Strengths</mat-label>
              <textarea matInput formControlName="strengths" rows="2" placeholder="Key achievements..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Comments & Feedback</mat-label>
              <textarea matInput formControlName="comments" rows="2" placeholder="Areas of improvement..."></textarea>
            </mat-form-field>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="reviewForm.invalid || isSubmitting">
                <mat-spinner diameter="18" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">Submit Review</span>
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
    .review-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
    .review-card { border-radius: 12px !important; }
    .score-badge { width: 48px; height: 48px; border-radius: 50%; background: #1a237e; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; margin-right: 12px; }
    .score-max { font-size: 0.7rem; font-weight: 400; opacity: 0.8; }
    .review-body { padding-top: 16px; }
    .score-bar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 0.85rem; }
    .score-item { background: #f5f5f5; padding: 6px 12px; border-radius: 6px; display: flex; justify-content: space-between; }
    .feedback-box { font-size: 0.85rem; color: #444; margin-top: 8px; background: #e8eaf6; padding: 10px; border-radius: 8px; }

    .no-records-card { grid-column: 1 / -1; text-align: center; padding: 48px; background: white; border-radius: 12px; color: #777; }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 12px; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-box { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a237e; }
    .form-row { display: flex; gap: 12px; }
    .flex-1 { flex: 1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
  `]
})
export class Performance implements OnInit {
  authService = inject(AuthService);
  private perfService = inject(PerformanceService);
  private empService = inject(EmployeeService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  reviews: any[] = [];
  employees: any[] = [];
  isReviewsLoading = false;
  isEmployeesLoading = false;
  isSubmitting = false;
  showModal = false;

  reviewForm: FormGroup = this.fb.group({
    employee_id: [null, Validators.required],
    review_period: ['Q3 2026'],
    attendance_score: [4],
    productivity_score: [4],
    quality_score: [4],
    teamwork_score: [4],
    communication_score: [4],
    strengths: [''],
    comments: ['']
  });

  ngOnInit(): void {
    this.loadEmployees();
    this.loadReviews();
  }

  loadEmployees(): void {
    this.isEmployeesLoading = true;
    this.cdr.markForCheck();
    this.empService.getAll().pipe(
      finalize(() => {
        this.isEmployeesLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.employees = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  loadReviews(): void {
    this.isReviewsLoading = true;
    this.cdr.markForCheck();
    this.perfService.getAll().pipe(
      finalize(() => {
        this.isReviewsLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.reviews = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.reviews.length === 0) this.reviews = [];
        this.cdr.markForCheck();
      }
    });
  }

  openModal(): void {
    this.showModal = true;
    if (this.employees.length === 0) this.loadEmployees();
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  saveReview(): void {
    if (this.reviewForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    this.perfService.create(this.reviewForm.value).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Review submitted successfully!', 'Close', { duration: 3500 });
        this.closeModal();
        this.loadReviews();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }
}
