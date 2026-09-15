export const MOCK_DEPARTMENTS = [
  { id: 1, name: 'IT & Engineering', description: 'Software engineering, DevOps, cloud infrastructure, and technical support', head_id: 1, head_name: 'Mike Manager', status: 'active', employee_count: 8 },
  { id: 2, name: 'Human Resources', description: 'Talent acquisition, employee relations, compliance, and workplace culture', head_id: 2, head_name: 'Sarah HR', status: 'active', employee_count: 4 },
  { id: 3, name: 'Finance & Accounting', description: 'Financial planning, payroll processing, tax compliance, and auditing', head_id: 3, head_name: 'Robert Brown', status: 'active', employee_count: 3 },
  { id: 4, name: 'Marketing & PR', description: 'Brand management, digital marketing campaigns, content, and public relations', head_id: 4, head_name: 'Lisa Davis', status: 'active', employee_count: 3 },
  { id: 5, name: 'Sales & Business', description: 'Client acquisition, enterprise sales, revenue growth, and account management', head_id: 5, head_name: 'David Jones', status: 'active', employee_count: 4 },
  { id: 6, name: 'Operations', description: 'Logistics, office administration, vendor management, and internal processes', head_id: 6, head_name: 'Admin User', status: 'active', employee_count: 3 }
];

export const MOCK_DESIGNATIONS = [
  { id: 1, name: 'Senior Software Engineer', department_id: 1, department_name: 'IT & Engineering', level: 3, status: 'active', employee_count: 3 },
  { id: 2, name: 'Full Stack Developer', department_id: 1, department_name: 'IT & Engineering', level: 2, status: 'active', employee_count: 3 },
  { id: 3, name: 'DevOps & Lead Architect', department_id: 1, department_name: 'IT & Engineering', level: 4, status: 'active', employee_count: 2 },
  { id: 4, name: 'HR Manager', department_id: 2, department_name: 'Human Resources', level: 4, status: 'active', employee_count: 1 },
  { id: 5, name: 'Talent Acquisition Lead', department_id: 2, department_name: 'Human Resources', level: 3, status: 'active', employee_count: 2 },
  { id: 6, name: 'HR Specialist', department_id: 2, department_name: 'Human Resources', level: 2, status: 'active', employee_count: 1 },
  { id: 7, name: 'Senior Financial Analyst', department_id: 3, department_name: 'Finance & Accounting', level: 3, status: 'active', employee_count: 2 },
  { id: 8, name: 'Accounts Manager', department_id: 3, department_name: 'Finance & Accounting', level: 4, status: 'active', employee_count: 1 },
  { id: 9, name: 'Digital Marketing Lead', department_id: 4, department_name: 'Marketing & PR', level: 3, status: 'active', employee_count: 2 },
  { id: 10, name: 'Content Strategy Manager', department_id: 4, department_name: 'Marketing & PR', level: 3, status: 'active', employee_count: 1 },
  { id: 11, name: 'Enterprise Sales Manager', department_id: 5, department_name: 'Sales & Business', level: 4, status: 'active', employee_count: 2 },
  { id: 12, name: 'Account Executive', department_id: 5, department_name: 'Sales & Business', level: 2, status: 'active', employee_count: 2 },
  { id: 13, name: 'Operations Manager', department_id: 6, department_name: 'Operations', level: 4, status: 'active', employee_count: 2 }
];

export const MOCK_EMPLOYEES = [
  { id: 1, employee_code: 'EMP001', first_name: 'Alex', last_name: 'Morgan', email: 'alex.morgan@company.com', phone: '+1 (555) 234-5678', department_id: 1, department_name: 'IT & Engineering', designation_id: 1, designation_name: 'Senior Software Engineer', manager_id: 3, manager_name: 'Mike Manager', joining_date: '2022-03-15', employment_type: 'full_time', salary: 115000, status: 'active', city: 'San Francisco', state: 'CA' },
  { id: 2, employee_code: 'EMP002', first_name: 'Sarah', last_name: 'Jenkins', email: 'hr@company.com', phone: '+1 (555) 345-6789', department_id: 2, department_name: 'Human Resources', designation_id: 4, designation_name: 'HR Manager', manager_id: null, manager_name: 'Admin User', joining_date: '2021-01-10', employment_type: 'full_time', salary: 98000, status: 'active', city: 'New York', state: 'NY' },
  { id: 3, employee_code: 'EMP003', first_name: 'Mike', last_name: 'Ross', email: 'manager@company.com', phone: '+1 (555) 456-7890', department_id: 1, department_name: 'IT & Engineering', designation_id: 3, designation_name: 'DevOps & Lead Architect', manager_id: null, manager_name: 'Admin User', joining_date: '2020-06-01', employment_type: 'full_time', salary: 135000, status: 'active', city: 'Chicago', state: 'IL' },
  { id: 4, employee_code: 'EMP004', first_name: 'John', last_name: 'Smith', email: 'john.smith@company.com', phone: '+1 (555) 567-8901', department_id: 1, department_name: 'IT & Engineering', designation_id: 2, designation_name: 'Full Stack Developer', manager_id: 3, manager_name: 'Mike Ross', joining_date: '2023-02-14', employment_type: 'full_time', salary: 85000, status: 'active', city: 'Austin', state: 'TX' },
  { id: 5, employee_code: 'EMP005', first_name: 'Emma', last_name: 'Watson', email: 'emma.watson@company.com', phone: '+1 (555) 678-9012', department_id: 1, department_name: 'IT & Engineering', designation_id: 1, designation_name: 'Senior Software Engineer', manager_id: 3, manager_name: 'Mike Ross', joining_date: '2022-08-20', employment_type: 'full_time', salary: 110000, status: 'active', city: 'Seattle', state: 'WA' },
  { id: 6, employee_code: 'EMP006', first_name: 'Robert', last_name: 'Brown', email: 'robert.brown@company.com', phone: '+1 (555) 789-0123', department_id: 3, department_name: 'Finance & Accounting', designation_id: 8, designation_name: 'Accounts Manager', manager_id: null, manager_name: 'Admin User', joining_date: '2019-11-05', employment_type: 'full_time', salary: 105000, status: 'active', city: 'Boston', state: 'MA' },
  { id: 7, employee_code: 'EMP007', first_name: 'Lisa', last_name: 'Davis', email: 'lisa.davis@company.com', phone: '+1 (555) 890-1234', department_id: 4, department_name: 'Marketing & PR', designation_id: 9, designation_name: 'Digital Marketing Lead', manager_id: null, manager_name: 'Admin User', joining_date: '2021-09-01', employment_type: 'full_time', salary: 92000, status: 'active', city: 'Denver', state: 'CO' },
  { id: 8, employee_code: 'EMP008', first_name: 'David', last_name: 'Jones', email: 'david.jones@company.com', phone: '+1 (555) 901-2345', department_id: 5, department_name: 'Sales & Business', designation_id: 11, designation_name: 'Enterprise Sales Manager', manager_id: null, manager_name: 'Admin User', joining_date: '2021-04-18', employment_type: 'full_time', salary: 120000, status: 'active', city: 'Miami', state: 'FL' },
  { id: 9, employee_code: 'EMP009', first_name: 'Sophia', last_name: 'Taylor', email: 'sophia.t@company.com', phone: '+1 (555) 012-3456', department_id: 2, department_name: 'Human Resources', designation_id: 5, designation_name: 'Talent Acquisition Lead', manager_id: 2, manager_name: 'Sarah Jenkins', joining_date: '2023-05-10', employment_type: 'full_time', salary: 78000, status: 'active', city: 'Atlanta', state: 'GA' },
  { id: 10, employee_code: 'EMP010', first_name: 'Daniel', last_name: 'Anderson', email: 'daniel.a@company.com', phone: '+1 (555) 123-4567', department_id: 3, department_name: 'Finance & Accounting', designation_id: 7, designation_name: 'Senior Financial Analyst', manager_id: 6, manager_name: 'Robert Brown', joining_date: '2022-11-01', employment_type: 'full_time', salary: 88000, status: 'active', city: 'Dallas', state: 'TX' },
  { id: 11, employee_code: 'EMP011', first_name: 'Olivia', last_name: 'Martinez', email: 'olivia.m@company.com', phone: '+1 (555) 234-5679', department_id: 4, department_name: 'Marketing & PR', designation_id: 10, designation_name: 'Content Strategy Manager', manager_id: 7, manager_name: 'Lisa Davis', joining_date: '2023-01-15', employment_type: 'full_time', salary: 75000, status: 'active', city: 'Los Angeles', state: 'CA' },
  { id: 12, employee_code: 'EMP012', first_name: 'James', last_name: 'Wilson', email: 'james.w@company.com', phone: '+1 (555) 345-6780', department_id: 5, department_name: 'Sales & Business', designation_id: 12, designation_name: 'Account Executive', manager_id: 8, manager_name: 'David Jones', joining_date: '2023-07-01', employment_type: 'full_time', salary: 70000, status: 'active', city: 'Phoenix', state: 'AZ' },
  { id: 13, employee_code: 'EMP013', first_name: 'Chloe', last_name: 'Thomas', email: 'chloe.t@company.com', phone: '+1 (555) 456-7891', department_id: 6, department_name: 'Operations', designation_id: 13, designation_name: 'Operations Manager', manager_id: null, manager_name: 'Admin User', joining_date: '2022-04-12', employment_type: 'full_time', salary: 90000, status: 'active', city: 'Portland', state: 'OR' },
  { id: 14, employee_code: 'EMP014', first_name: 'Ethan', last_name: 'White', email: 'ethan.w@company.com', phone: '+1 (555) 567-8902', department_id: 1, department_name: 'IT & Engineering', designation_id: 2, designation_name: 'Full Stack Developer', manager_id: 3, manager_name: 'Mike Ross', joining_date: '2024-01-08', employment_type: 'contract', salary: 80000, status: 'active', city: 'Austin', state: 'TX' },
  { id: 15, employee_code: 'EMP015', first_name: 'Mia', last_name: 'Harris', email: 'mia.h@company.com', phone: '+1 (555) 678-9013', department_id: 2, department_name: 'Human Resources', designation_id: 6, designation_name: 'HR Specialist', manager_id: 2, manager_name: 'Sarah Jenkins', joining_date: '2023-10-15', employment_type: 'full_time', salary: 65000, status: 'inactive', city: 'Chicago', state: 'IL' }
];

export const MOCK_ATTENDANCE = [
  { id: 101, date: '2026-09-14', employee_name: 'Alex Morgan', employee_code: 'EMP001', department_name: 'IT & Engineering', check_in: '09:02:15', check_out: '18:05:00', working_hours: 9.05, status: 'present', remarks: 'On time' },
  { id: 102, date: '2026-09-14', employee_name: 'Sarah Jenkins', employee_code: 'EMP002', department_name: 'Human Resources', check_in: '08:55:10', check_out: '17:50:30', working_hours: 8.92, status: 'present', remarks: 'Early check-in' },
  { id: 103, date: '2026-09-14', employee_name: 'Mike Ross', employee_code: 'EMP003', department_name: 'IT & Engineering', check_in: '09:45:00', check_out: '18:30:00', working_hours: 8.75, status: 'late', remarks: 'Traffic delay' },
  { id: 104, date: '2026-09-14', employee_name: 'John Smith', employee_code: 'EMP004', department_name: 'IT & Engineering', check_in: '09:00:00', check_out: '18:00:00', working_hours: 9.00, status: 'present', remarks: 'Regular shift' },
  { id: 105, date: '2026-09-14', employee_name: 'Emma Watson', employee_code: 'EMP005', department_name: 'IT & Engineering', check_in: null, check_out: null, working_hours: 0, status: 'leave', remarks: 'Approved Casual Leave' },
  { id: 106, date: '2026-09-14', employee_name: 'Robert Brown', employee_code: 'EMP006', department_name: 'Finance & Accounting', check_in: '09:10:00', check_out: '13:30:00', working_hours: 4.33, status: 'half_day', remarks: 'Doctor appointment afternoon' },
  { id: 107, date: '2026-09-14', employee_name: 'Lisa Davis', employee_code: 'EMP007', department_name: 'Marketing & PR', check_in: '08:48:00', check_out: '17:45:00', working_hours: 8.95, status: 'present', remarks: 'On time' },
  { id: 108, date: '2026-09-14', employee_name: 'David Jones', employee_code: 'EMP008', department_name: 'Sales & Business', check_in: null, check_out: null, working_hours: 0, status: 'absent', remarks: 'Uninformed absence' },
  { id: 109, date: '2026-09-13', employee_name: 'Alex Morgan', employee_code: 'EMP001', department_name: 'IT & Engineering', check_in: '08:58:00', check_out: '18:00:00', working_hours: 9.03, status: 'present', remarks: 'Regular shift' },
  { id: 110, date: '2026-09-13', employee_name: 'Sarah Jenkins', employee_code: 'EMP002', department_name: 'Human Resources', check_in: '09:05:00', check_out: '18:10:00', working_hours: 9.08, status: 'present', remarks: 'Regular shift' },
  { id: 111, date: '2026-09-13', employee_name: 'Sophia Taylor', employee_code: 'EMP009', department_name: 'Human Resources', check_in: '09:01:00', check_out: '18:02:00', working_hours: 9.02, status: 'present', remarks: 'Regular shift' },
  { id: 112, date: '2026-09-13', employee_name: 'Daniel Anderson', employee_code: 'EMP010', department_name: 'Finance & Accounting', check_in: '09:12:00', check_out: '18:00:00', working_hours: 8.80, status: 'present', remarks: 'On time' }
];

export const MOCK_LEAVE_TYPES = [
  { id: 1, name: 'Casual Leave', days_allowed: 12, description: 'Personal errands, casual days off' },
  { id: 2, name: 'Sick Leave', days_allowed: 10, description: 'Medical recovery, doctor visits' },
  { id: 3, name: 'Earned Leave', days_allowed: 15, description: 'Annual paid vacation entitlement' },
  { id: 4, name: 'Maternity/Paternity', days_allowed: 90, description: 'Parental leave for new parents' },
  { id: 5, name: 'Unpaid Leave', days_allowed: 30, description: 'Extended leave without pay' }
];

export const MOCK_LEAVE_BALANCES = [
  { leave_type_id: 1, leave_type_name: 'Casual Leave', total_days: 12, used_days: 3, remaining_days: 9 },
  { leave_type_id: 2, leave_type_name: 'Sick Leave', total_days: 10, used_days: 1, remaining_days: 9 },
  { leave_type_id: 3, leave_type_name: 'Earned Leave', total_days: 15, used_days: 4, remaining_days: 11 },
  { leave_type_id: 5, leave_type_name: 'Unpaid Leave', total_days: 30, used_days: 0, remaining_days: 30 }
];

export const MOCK_LEAVE_REQUESTS = [
  { id: 201, employee_id: 5, employee_name: 'Emma Watson', employee_code: 'EMP005', leave_type_id: 1, leave_type_name: 'Casual Leave', start_date: '2026-09-14', end_date: '2026-09-15', days: 2, reason: 'Family event out of town', status: 'approved', approver_name: 'Mike Ross', created_at: '2026-09-10' },
  { id: 202, employee_id: 4, employee_name: 'John Smith', employee_code: 'EMP004', leave_type_id: 2, leave_type_name: 'Sick Leave', start_date: '2026-09-18', end_date: '2026-09-19', days: 2, reason: 'Dental surgery and recovery', status: 'pending', approver_name: null, created_at: '2026-09-12' },
  { id: 203, employee_id: 9, employee_name: 'Sophia Taylor', employee_code: 'EMP009', leave_type_id: 3, leave_type_name: 'Earned Leave', start_date: '2026-10-05', end_date: '2026-10-09', days: 5, reason: 'Annual autumn vacation trip', status: 'pending', approver_name: null, created_at: '2026-09-13' },
  { id: 204, employee_id: 11, employee_name: 'Olivia Martinez', employee_code: 'EMP011', leave_type_id: 1, leave_type_name: 'Casual Leave', start_date: '2026-09-01', end_date: '2026-09-01', days: 1, reason: 'Home renovation inspection', status: 'approved', approver_name: 'Lisa Davis', created_at: '2026-08-28' },
  { id: 205, employee_id: 12, employee_name: 'James Wilson', employee_code: 'EMP012', leave_type_id: 2, leave_type_name: 'Sick Leave', start_date: '2026-08-20', end_date: '2026-08-21', days: 2, reason: 'Flu symptoms', status: 'approved', approver_name: 'David Jones', created_at: '2026-08-19' },
  { id: 206, employee_id: 10, employee_name: 'Daniel Anderson', employee_code: 'EMP010', leave_type_id: 5, leave_type_name: 'Unpaid Leave', start_date: '2026-08-01', end_date: '2026-08-05', days: 5, reason: 'Personal sabbatical', status: 'rejected', approver_name: 'Robert Brown', created_at: '2026-07-25' }
];

export const MOCK_PAYROLL = [
  { id: 301, employee_id: 1, employee_name: 'Alex Morgan', employee_code: 'EMP001', department_name: 'IT & Engineering', month: 9, year: 2026, basic: 60000, hra: 24000, allowances: 18000, bonus: 5000, gross_salary: 107000, tax: 10700, deductions: 2140, net_salary: 94160, status: 'processed', paid_on: null },
  { id: 302, employee_id: 2, employee_name: 'Sarah Jenkins', employee_code: 'EMP002', department_name: 'Human Resources', month: 9, year: 2026, basic: 50000, hra: 20000, allowances: 15000, bonus: 3000, gross_salary: 88000, tax: 8800, deductions: 1760, net_salary: 77440, status: 'processed', paid_on: null },
  { id: 303, employee_id: 3, employee_name: 'Mike Ross', employee_code: 'EMP003', department_name: 'IT & Engineering', month: 9, year: 2026, basic: 70000, hra: 28000, allowances: 22000, bonus: 10000, gross_salary: 130000, tax: 13000, deductions: 2600, net_salary: 114400, status: 'processed', paid_on: null },
  { id: 304, employee_id: 4, employee_name: 'John Smith', employee_code: 'EMP004', department_name: 'IT & Engineering', month: 9, year: 2026, basic: 45000, hra: 18000, allowances: 12000, bonus: 0, gross_salary: 75000, tax: 7500, deductions: 1500, net_salary: 66000, status: 'draft', paid_on: null },
  { id: 305, employee_id: 5, employee_name: 'Emma Watson', employee_code: 'EMP005', department_name: 'IT & Engineering', month: 9, year: 2026, basic: 58000, hra: 23200, allowances: 16800, bonus: 4000, gross_salary: 102000, tax: 10200, deductions: 2040, net_salary: 89760, status: 'draft', paid_on: null },
  { id: 306, employee_id: 1, employee_name: 'Alex Morgan', employee_code: 'EMP001', department_name: 'IT & Engineering', month: 8, year: 2026, basic: 60000, hra: 24000, allowances: 18000, bonus: 0, gross_salary: 102000, tax: 10200, deductions: 2040, net_salary: 89760, status: 'paid', paid_on: '2026-08-28' },
  { id: 307, employee_id: 2, employee_name: 'Sarah Jenkins', employee_code: 'EMP002', department_name: 'Human Resources', month: 8, year: 2026, basic: 50000, hra: 20000, allowances: 15000, bonus: 0, gross_salary: 85000, tax: 8500, deductions: 1700, net_salary: 74800, status: 'paid', paid_on: '2026-08-28' },
  { id: 308, employee_id: 3, employee_name: 'Mike Ross', employee_code: 'EMP003', department_name: 'IT & Engineering', month: 8, year: 2026, basic: 70000, hra: 28000, allowances: 22000, bonus: 0, gross_salary: 120000, tax: 12000, deductions: 2400, net_salary: 105600, status: 'paid', paid_on: '2026-08-28' }
];

export const MOCK_TASKS = [
  { id: 401, title: 'Upgrade Production Kubernetes Cluster', description: 'Migrate core microservices to Kubernetes v1.30 with zero downtime', assigned_to: 1, assigned_name: 'Alex Morgan', department_name: 'IT & Engineering', priority: 'critical', status: 'in_progress', due_date: '2026-09-20' },
  { id: 402, title: 'Q4 Employee Onboarding Preparation', description: 'Prepare welcome kits, equipment orders, and orientation schedules for 12 new hires', assigned_to: 9, assigned_name: 'Sophia Taylor', department_name: 'Human Resources', priority: 'high', status: 'in_progress', due_date: '2026-09-25' },
  { id: 403, title: 'Annual Financial Audit & Compliance', description: 'Compile general ledger, tax schedules, and internal audit reports for external auditor review', assigned_to: 6, assigned_name: 'Robert Brown', department_name: 'Finance & Accounting', priority: 'critical', status: 'review', due_date: '2026-09-30' },
  { id: 404, title: 'Launch Q4 Enterprise Product Campaign', description: 'Design landing pages, social ads, and email sequences for the new product launch', assigned_to: 7, assigned_name: 'Lisa Davis', department_name: 'Marketing & PR', priority: 'high', status: 'todo', due_date: '2026-10-01' },
  { id: 405, title: 'Refactor Authentication & RBAC Service', description: 'Implement JWT refresh tokens, role-based route guards, and audit log integration', assigned_to: 4, assigned_name: 'John Smith', department_name: 'IT & Engineering', priority: 'high', status: 'completed', due_date: '2026-09-12' },
  { id: 406, title: 'Q4 Enterprise Client Prospecting', description: 'Reach out to top 50 target accounts in Midwest territory with customized demos', assigned_to: 12, assigned_name: 'James Wilson', department_name: 'Sales & Business', priority: 'medium', status: 'in_progress', due_date: '2026-10-15' },
  { id: 407, title: 'Office Workstation Hardware Upgrade', description: 'Procure and setup 15 high-performance dual-monitor workstations for engineering team', assigned_to: 13, assigned_name: 'Chloe Thomas', department_name: 'Operations', priority: 'medium', status: 'todo', due_date: '2026-09-28' },
  { id: 408, title: 'Update Company Security Policies 2026', description: 'Revise password requirements, remote work VPN rules, and SOC2 compliance docs', assigned_to: 2, assigned_name: 'Sarah Jenkins', department_name: 'Human Resources', priority: 'low', status: 'completed', due_date: '2026-09-05' }
];

export const MOCK_PERFORMANCE_REVIEWS = [
  { id: 501, employee_id: 1, employee_name: 'Alex Morgan', reviewer_name: 'Mike Ross', review_period: 'Q2 2026', attendance_score: 5, productivity_score: 5, quality_score: 4, teamwork_score: 5, communication_score: 4, overall_rating: 4.6, strengths: 'Exceptional architectural foresight and system reliability. Always delivers projects ahead of schedule.', comments: 'Outstanding technical leader who elevates team standards consistently.' },
  { id: 502, employee_id: 4, employee_name: 'John Smith', reviewer_name: 'Mike Ross', review_period: 'Q2 2026', attendance_score: 4, productivity_score: 4, quality_score: 4, teamwork_score: 4, communication_score: 4, overall_rating: 4.0, strengths: 'Solid code quality, quick problem solver, great collaborator.', comments: 'Consistently meets code review standards and takes initiative on bug fixes.' },
  { id: 503, employee_id: 7, employee_name: 'Lisa Davis', reviewer_name: 'Admin User', review_period: 'Q2 2026', attendance_score: 5, productivity_score: 4, quality_score: 5, teamwork_score: 4, communication_score: 5, overall_rating: 4.6, strengths: 'Creative campaign design, high engagement metrics, clear stakeholder reporting.', comments: 'Led our highest performing marketing campaign this year.' },
  { id: 504, employee_id: 8, employee_name: 'David Jones', reviewer_name: 'Admin User', review_period: 'Q2 2026', attendance_score: 4, productivity_score: 5, quality_score: 4, teamwork_score: 4, communication_score: 5, overall_rating: 4.4, strengths: 'Exceeded quarterly revenue quota by 125%. Excellent negotiation skills.', comments: 'Top performing sales manager for the quarter.' },
  { id: 505, employee_id: 9, employee_name: 'Sophia Taylor', reviewer_name: 'Sarah Jenkins', review_period: 'Q2 2026', attendance_score: 5, productivity_score: 4, quality_score: 4, teamwork_score: 5, communication_score: 4, overall_rating: 4.4, strengths: 'Reduced time-to-hire by 18 days while increasing candidate quality score.', comments: 'Fantastic recruitment execution across engineering and finance hiring.' }
];

export const MOCK_HOLIDAYS = [
  { id: 601, name: 'Gandhi Jayanti', date: '2026-10-02', type: 'public', description: 'National holiday honoring Mahatma Gandhi' },
  { id: 602, name: 'Dussehra (Vijayadashami)', date: '2026-10-12', type: 'public', description: 'Major festival celebration holiday' },
  { id: 603, name: 'Diwali Eve', date: '2026-10-31', type: 'company', description: 'Company paid holiday for Diwali preparations' },
  { id: 604, name: 'Diwali (Deepavali)', date: '2026-11-01', type: 'public', description: 'Festival of Lights national holiday' },
  { id: 605, name: 'Company Foundation Day', date: '2026-11-15', type: 'company', description: 'Annual company anniversary & team outing day' },
  { id: 606, name: 'Thanksgiving Day', date: '2026-11-26', type: 'public', description: 'Public holiday for giving thanks' },
  { id: 607, name: 'Christmas Eve', date: '2026-12-24', type: 'optional', description: 'Optional holiday for festive celebrations' },
  { id: 608, name: 'Christmas Day', date: '2026-12-25', type: 'public', description: 'Global holiday celebrating Christmas' },
  { id: 609, name: "New Year's Eve", date: '2026-12-31', type: 'company', description: 'Half-day company holiday' },
  { id: 610, name: "New Year's Day", date: '2027-01-01', type: 'public', description: 'First day of the new year' }
];

export const MOCK_ANNOUNCEMENTS = [
  { id: 701, title: 'Annual Corporate Strategy Summit 2026', description: 'We are thrilled to announce our Annual Corporate Strategy Summit scheduled for November 12-14. All department leads and employees are invited to join interactive sessions, keynotes, and product workshops.', publish_date: '2026-09-10', target: 'all', created_by_name: 'Admin User', created_at: '2026-09-10T10:00:00Z' },
  { id: 702, title: 'New Health Insurance & Wellness Benefits Coverage', description: 'Human Resources has upgraded our comprehensive health plan to include dental, vision, mental health counseling, and gym reimbursements starting October 1st. Please review the handbook update.', publish_date: '2026-09-08', target: 'all', created_by_name: 'Sarah Jenkins', created_at: '2026-09-08T14:30:00Z' },
  { id: 703, title: 'Q4 AWS & Cloud Architecture Certification Subsidy', description: 'The IT Department is sponsoring up to $500 per engineer for AWS and Azure cloud certification exams passed before December 31, 2026.', publish_date: '2026-09-05', target: 'department', created_by_name: 'Mike Ross', created_at: '2026-09-05T09:15:00Z' },
  { id: 704, title: 'Flexible Hybrid Work Policy Updates', description: 'Effective October 1st, employees have the option to choose up to 3 work-from-home days per week with core collaboration hours established between 10 AM and 4 PM.', publish_date: '2026-09-01', target: 'all', created_by_name: 'Sarah Jenkins', created_at: '2026-09-01T11:00:00Z' }
];

export const MOCK_NOTIFICATIONS = [
  { id: 801, title: 'Leave Application Approved', message: 'Your Casual Leave request for 2026-09-14 to 2026-09-15 has been approved by Mike Ross.', type: 'leave', is_read: 0, created_at: '2026-09-14T08:30:00Z' },
  { id: 802, title: 'New Task Assigned: Kubernetes Upgrade', message: 'You have been assigned a critical task: "Upgrade Production Kubernetes Cluster". Due on Sep 20.', type: 'task', is_read: 0, created_at: '2026-09-13T16:45:00Z' },
  { id: 803, title: 'September Payroll Draft Ready', message: 'Payroll for September 2026 has been generated. Please review tax deductions before finalizing.', type: 'payroll', is_read: 0, created_at: '2026-09-12T11:20:00Z' },
  { id: 804, title: 'Performance Review Completed', message: 'Your Q2 2026 Performance Evaluation has been finalized with an overall rating of 4.6/5.0.', type: 'performance', is_read: 1, created_at: '2026-09-10T15:10:00Z' },
  { id: 805, title: 'New Company Announcement', message: 'Annual Corporate Strategy Summit 2026 has been published by Admin User.', type: 'announcement', is_read: 1, created_at: '2026-09-10T10:05:00Z' },
  { id: 806, title: 'New Employee Joined IT Team', message: 'Ethan White has joined the IT & Engineering department as Full Stack Developer.', type: 'info', is_read: 1, created_at: '2026-09-01T09:00:00Z' }
];

export const MOCK_ADMIN_DASHBOARD = {
  totalEmployees: 15,
  activeEmployees: 14,
  inactiveEmployees: 1,
  totalDepartments: 6,
  presentToday: 11,
  onLeave: 2,
  pendingLeaveRequests: 2,
  totalMonthlyPayroll: 1245000,
  pendingTasks: 5,
  upcomingBirthdays: [
    { first_name: 'Alex', last_name: 'Morgan', dob: '1992-09-22', profile_photo: null },
    { first_name: 'Sophia', last_name: 'Taylor', dob: '1994-09-28', profile_photo: null },
    { first_name: 'Daniel', last_name: 'Anderson', dob: '1990-10-05', profile_photo: null }
  ],
  upcomingHolidays: MOCK_HOLIDAYS.slice(0, 5),
  recentEmployees: MOCK_EMPLOYEES.slice(0, 5),
  recentLeaveRequests: MOCK_LEAVE_REQUESTS.slice(0, 5),
  attendanceStats: { present: 11, absent: 1, late: 1, leave: 2 },
  departmentDistribution: [
    { name: 'IT & Engineering', count: 8 },
    { name: 'Human Resources', count: 4 },
    { name: 'Finance & Accounting', count: 3 },
    { name: 'Sales & Business', count: 4 },
    { name: 'Marketing & PR', count: 3 },
    { name: 'Operations', count: 3 }
  ],
  leaveStats: { approved: 12, pending: 2, rejected: 1 },
  monthlyPayrollData: [
    { month: '2026-04', amount: 1180000 },
    { month: '2026-05', amount: 1195000 },
    { month: '2026-06', amount: 1210000 },
    { month: '2026-07', amount: 1225000 },
    { month: '2026-08', amount: 1240000 },
    { month: '2026-09', amount: 1245000 }
  ]
};
