import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<mat-card><mat-card-content>EmployeeDetail Works!</mat-card-content></mat-card>'
})
export class EmployeeDetail {}
