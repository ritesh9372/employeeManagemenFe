import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { HolidayService } from '../../services/holiday.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>Company Holidays</h2>
          <p class="subtitle">Official public and company holiday calendar</p>
        </div>
        <button mat-raised-button color="primary" (click)="openModal()" *ngIf="authService.isAdminOrHR()">
          <mat-icon>add</mat-icon> Add Holiday
        </button>
      </div>

      <mat-card class="table-card">
        <div class="inline-loader" *ngIf="isHolidaysLoading">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading holiday calendar...</span>
        </div>

        <table mat-table [dataSource]="holidays" class="full-width-table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let h"><strong>{{h.date | date:'fullDate'}}</strong></td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Holiday Name</th>
            <td mat-cell *matCellDef="let h">{{h.name}}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let h">
              <mat-chip [class]="'chip-' + h.type">{{h.type | uppercase}}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let h">{{h.description || 'N/A'}}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="no-records-msg" *ngIf="!isHolidaysLoading && holidays.length === 0">
          <mat-icon>event</mat-icon>
          <p>No company holidays configured.</p>
        </div>
      </mat-card>

      <!-- Modal Form renders immediately -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Add New Holiday</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="holidayForm" (ngSubmit)="saveHoliday()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Holiday Name *</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Independence Day">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date *</mat-label>
              <input matInput type="date" formControlName="date">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="public">Public Holiday</mat-option>
                <mat-option value="company">Company Holiday</mat-option>
                <mat-option value="optional">Optional Holiday</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2" placeholder="Details..."></textarea>
            </mat-form-field>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="holidayForm.invalid || isSubmitting">
                <mat-spinner diameter="18" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 16px; color: #555; background: #fafafa; }
    .table-card { border-radius: 12px !important; overflow: hidden; }
    .full-width-table { width: 100%; }

    .no-records-msg { text-align: center; padding: 32px; color: #777; }
    .no-records-msg mat-icon { font-size: 36px; height: 36px; width: 36px; color: #ccc; margin-bottom: 8px; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-box { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 480px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a237e; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
  `]
})
export class Holidays implements OnInit {
  authService = inject(AuthService);
  private holidayService = inject(HolidayService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  holidays: any[] = [];
  isHolidaysLoading = false;
  isSubmitting = false;
  showModal = false;
  displayedColumns = ['date', 'name', 'type', 'description'];

  holidayForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    date: ['', Validators.required],
    type: ['public'],
    description: ['']
  });

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(): void {
    this.isHolidaysLoading = true;
    this.cdr.markForCheck();
    this.holidayService.getAll().pipe(
      finalize(() => {
        this.isHolidaysLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.holidays = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.holidays.length === 0) this.holidays = [];
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
    this.holidayForm.reset({ type: 'public' });
    this.cdr.markForCheck();
  }

  saveHoliday(): void {
    if (this.holidayForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    this.holidayService.create(this.holidayForm.value).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Holiday added!', 'Close', { duration: 3000 });
        this.closeModal();
        this.loadHolidays();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }
}
