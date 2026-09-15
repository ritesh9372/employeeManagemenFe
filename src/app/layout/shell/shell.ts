import { Component, OnInit, OnDestroy, ViewChild, inject, PLATFORM_ID } from "@angular/core";
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { MatSidenavModule, MatSidenav } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatBadgeModule } from "@angular/material/badge";
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BreakpointObserver } from "@angular/cdk/layout";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AuthService } from "../../service/auth";
import { NotificationService } from "../../services/notification.service";

interface NavItem { icon: string; label: string; route: string; roles?: string[]; }

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule,
    MatListModule, MatMenuModule, MatBadgeModule, MatDividerModule, MatTooltipModule
  ],
  templateUrl: "./shell.html",
  styleUrl: "./shell.css"
})
export class Shell implements OnInit, OnDestroy {
  @ViewChild("sidenav") sidenav!: MatSidenav;
  authService = inject(AuthService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private notificationService = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();
  isMobile = false;
  unreadCount = 0;

  navItems: NavItem[] = [
    { icon: "dashboard", label: "Dashboard", route: "/dashboard" },
    { icon: "people", label: "Employees", route: "/employees", roles: ["admin", "hr", "manager"] },
    { icon: "business", label: "Departments", route: "/departments", roles: ["admin", "hr", "manager"] },
    { icon: "badge", label: "Designations", route: "/designations", roles: ["admin", "hr", "manager"] },
    { icon: "access_time", label: "Attendance", route: "/attendance" },
    { icon: "event_busy", label: "Leave Management", route: "/leaves" },
    { icon: "payments", label: "Payroll", route: "/payroll", roles: ["admin", "hr", "manager"] },
    { icon: "task_alt", label: "Tasks", route: "/tasks" },
    { icon: "star", label: "Performance", route: "/performance" },
    { icon: "celebration", label: "Holidays", route: "/holidays" },
    { icon: "campaign", label: "Announcements", route: "/announcements" },
    { icon: "assessment", label: "Reports", route: "/reports", roles: ["admin", "hr"] },
    { icon: "notifications", label: "Notifications", route: "/notifications" },
    { icon: "person", label: "My Profile", route: "/profile" },
    { icon: "settings", label: "Settings", route: "/settings", roles: ["admin", "hr"] },
  ];

  get visibleNavItems(): NavItem[] {
    return this.navItems.filter(i => !i.roles || this.authService.hasAnyRole(i.roles));
  }
  get userInitials(): string {
    return (this.authService.currentUser?.name || "").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  }
  get userName(): string { return this.authService.currentUser?.name || ""; }
  get userRole(): string { return this.authService.userRole; }
  get roleLabel(): string {
    const r: Record<string, string> = { admin: "Administrator", hr: "HR Manager", manager: "Manager", employee: "Employee" };
    return r[this.userRole] || this.userRole;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.breakpointObserver.observe(["(max-width: 768px)"]).pipe(takeUntil(this.destroy$)).subscribe(r => { this.isMobile = r.matches; });
      this.notificationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe(c => { this.unreadCount = c; });
      this.notificationService.refreshCount();
    }
  }
  toggleSidenav(): void { this.sidenav?.toggle(); }
  onNavClick(): void { if (this.isMobile) this.sidenav?.close(); }
  logout(): void { this.authService.logout(); this.router.navigate(["/login"]); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
