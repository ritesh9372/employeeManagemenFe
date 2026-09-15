import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<mat-card><mat-card-content>EmployeeForm Works!</mat-card-content></mat-card>'
})
export class EmployeeForm {}
