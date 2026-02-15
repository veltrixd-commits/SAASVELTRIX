// Company Registry & Subscription Management
// Manages company subscriptions and employee access approvals

export interface Company {
  id: string;
  name: string;
  employerCode: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'expired' | 'trial';
  adminEmail: string;
  createdAt: string;
  employees: CompanyEmployee[];
}

export interface CompanyEmployee {
  email: string;
  fullName: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  approvedAt?: string;
  permissions: string[];
  verificationCode?: string;
  verificationCodeIssuedAt?: string;
  verificationCodeVerifiedAt?: string;
}

export interface EmployeeRequestStatus {
  found: boolean;
  approved: boolean;
  pending: boolean;
  denied: boolean;
  companyName?: string;
  employerCode?: string;
  requestedAt?: string;
  approvedAt?: string;
  permissions?: string[];
  verificationCode?: string;
}

function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

function findCompanyIndexByCode(companies: Company[], companyCode: string): number {
  return companies.findIndex((c) => c.employerCode.toUpperCase() === companyCode.toUpperCase());
}

/**
 * Initialize demo companies in localStorage
 * In production, this data would come from a database
 */
export function initializeDemoCompanies(): void {
  if (typeof window === 'undefined') return;
  
  const existingCompanies = localStorage.getItem('companies');
  if (existingCompanies) return; // Don't override existing data
  
  const demoCompanies: Company[] = [
    {
      id: 'comp-1',
      name: 'Acme Corporation',
      employerCode: 'ACME2024',
      subscriptionPlan: 'enterprise',
      subscriptionStatus: 'active',
      adminEmail: 'admin@acme.com',
      createdAt: new Date().toISOString(),
      employees: [],
    },
    {
      id: 'comp-2',
      name: 'TechStart Inc',
      employerCode: 'TECHSTART',
      subscriptionPlan: 'professional',
      subscriptionStatus: 'active',
      adminEmail: 'admin@techstart.com',
      createdAt: new Date().toISOString(),
      employees: [],
    },
    {
      id: 'comp-3',
      name: 'Creative Studios',
      employerCode: 'CREATIVE123',
      subscriptionPlan: 'starter',
      subscriptionStatus: 'trial',
      adminEmail: 'admin@creativestudios.com',
      createdAt: new Date().toISOString(),
      employees: [],
    },
  ];
  
  localStorage.setItem('companies', JSON.stringify(demoCompanies));
}

/**
 * Validate employer code and return company if valid
 */
export function validateEmployerCode(code: string): Company | null {
  if (typeof window === 'undefined') return null;
  
  try {
    initializeDemoCompanies();
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) return null;
    
    const companies: Company[] = JSON.parse(companiesData);
    const company = companies.find(
      (c) => c.employerCode.toUpperCase() === code.toUpperCase()
    );
    
    if (company && company.subscriptionStatus === 'active') {
      return company;
    }
    
    if (company && company.subscriptionStatus === 'trial') {
      return company; // Allow trial companies
    }
    
    return null; // Expired or not found
  } catch (error) {
    console.error('Error validating employer code:', error);
    return null;
  }
}

/**
 * Request access to a company as an employee
 */
export function requestCompanyAccess(
  companyCode: string,
  employeeEmail: string,
  employeeName: string
): { success: boolean; company?: Company; error?: string; verificationCode?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not in browser environment' };
  }
  
  try {
    const company = validateEmployerCode(companyCode);
    
    if (!company) {
      return {
        success: false,
        error: 'Invalid employer code or company subscription expired',
      };
    }
    
    initializeDemoCompanies();
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) {
      return { success: false, error: 'Company registry not found' };
    }
    
    const companies: Company[] = JSON.parse(companiesData);
    const companyIndex = findCompanyIndexByCode(companies, companyCode);
    
    if (companyIndex === -1) {
      return { success: false, error: 'Company not found' };
    }
    
    // Check if employee already requested access
    const existingRequest = companies[companyIndex].employees.find(
      (e) => normalizeEmail(e.email) === normalizeEmail(employeeEmail)
    );
    
    if (existingRequest) {
      if (existingRequest.status === 'approved') {
        return {
          success: true,
          company: companies[companyIndex],
          verificationCode: existingRequest.verificationCode,
        };
      }

      if (!existingRequest.verificationCode) {
        existingRequest.verificationCode = generateVerificationCode();
        existingRequest.verificationCodeIssuedAt = new Date().toISOString();
        localStorage.setItem('companies', JSON.stringify(companies));
      }

      return {
        success: true,
        company: companies[companyIndex],
        verificationCode: existingRequest.verificationCode,
      };
    }
    
    // Add new employee request
    const newEmployee: CompanyEmployee = {
      email: employeeEmail,
      fullName: employeeName,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      permissions: ['wellness', 'performance', 'productivity', 'contentStudio'],
      verificationCode: generateVerificationCode(),
      verificationCodeIssuedAt: new Date().toISOString(),
    };
    
    companies[companyIndex].employees.push(newEmployee);
    localStorage.setItem('companies', JSON.stringify(companies));
    
    return {
      success: true,
      company: companies[companyIndex],
      verificationCode: newEmployee.verificationCode,
    };
  } catch (error) {
    console.error('Error requesting company access:', error);
    return { success: false, error: 'An error occurred' };
  }
}

/**
 * Check if employee has been approved
 */
export function checkEmployeeApproval(
  employeeEmail: string
): {
  approved: boolean;
  companyName?: string;
  permissions?: string[];
} {
  if (typeof window === 'undefined') {
    return { approved: false };
  }
  
  try {
    initializeDemoCompanies();
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) return { approved: false };
    
    const companies: Company[] = JSON.parse(companiesData);
    
    for (const company of companies) {
      const employee = company.employees.find(
        (e) => normalizeEmail(e.email) === normalizeEmail(employeeEmail)
      );
      
      if (employee && employee.status === 'approved') {
        return {
          approved: true,
          companyName: company.name,
          permissions: employee.permissions,
        };
      }
    }
    
    return { approved: false };
  } catch (error) {
    console.error('Error checking employee approval:', error);
    return { approved: false };
  }
}

/**
 * Approve employee access (called by company admin)
 * 
 * Common permission roles:
 * - 'sales' or 'pos': Grants access to Point of Sale system
 * - 'products': Access to product management
 * - 'wellness', 'performance', 'productivity', 'contentStudio': Personal features
 */
export function approveEmployee(
  companyCode: string,
  employeeEmail: string,
  permissions: string[] = ['wellness', 'performance', 'productivity']
): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) return false;
    
    const companies: Company[] = JSON.parse(companiesData);
    const companyIndex = findCompanyIndexByCode(companies, companyCode);
    
    if (companyIndex === -1) return false;
    
    const employeeIndex = companies[companyIndex].employees.findIndex(
      (e) => normalizeEmail(e.email) === normalizeEmail(employeeEmail)
    );
    
    if (employeeIndex === -1) return false;
    
    companies[companyIndex].employees[employeeIndex].status = 'approved';
    companies[companyIndex].employees[employeeIndex].approvedAt = new Date().toISOString();
    companies[companyIndex].employees[employeeIndex].permissions = permissions;
    companies[companyIndex].employees[employeeIndex].verificationCodeVerifiedAt =
      companies[companyIndex].employees[employeeIndex].verificationCodeVerifiedAt || new Date().toISOString();
    
    localStorage.setItem('companies', JSON.stringify(companies));
    return true;
  } catch (error) {
    console.error('Error approving employee:', error);
    return false;
  }
}

/**
 * Get all companies (for admin purposes)
 */
export function getAllCompanies(): Company[] {
  if (typeof window === 'undefined') return [];
  
  try {
    initializeDemoCompanies();
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) return [];
    
    return JSON.parse(companiesData);
  } catch (error) {
    console.error('Error getting companies:', error);
    return [];
  }
}

/**
 * Get company by employer code
 */
export function getCompanyByCode(code: string): Company | null {
  return validateEmployerCode(code);
}

export function getCompanyByAdminEmail(adminEmail: string): Company | null {
  if (typeof window === 'undefined') return null;

  try {
    initializeDemoCompanies();
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) return null;

    const companies: Company[] = JSON.parse(companiesData);
    return companies.find((company) => normalizeEmail(company.adminEmail) === normalizeEmail(adminEmail)) || null;
  } catch (error) {
    console.error('Error getting company by admin email:', error);
    return null;
  }
}

export function getEmployeeRequestStatus(employeeEmail: string): EmployeeRequestStatus {
  if (typeof window === 'undefined') {
    return { found: false, approved: false, pending: false, denied: false };
  }

  try {
    initializeDemoCompanies();
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) {
      return { found: false, approved: false, pending: false, denied: false };
    }

    const companies: Company[] = JSON.parse(companiesData);
    for (const company of companies) {
      const employee = company.employees.find((entry) => normalizeEmail(entry.email) === normalizeEmail(employeeEmail));
      if (!employee) continue;

      return {
        found: true,
        approved: employee.status === 'approved',
        pending: employee.status === 'pending',
        denied: employee.status === 'denied',
        companyName: company.name,
        employerCode: company.employerCode,
        requestedAt: employee.requestedAt,
        approvedAt: employee.approvedAt,
        permissions: employee.permissions,
        verificationCode: employee.verificationCode,
      };
    }

    return { found: false, approved: false, pending: false, denied: false };
  } catch (error) {
    console.error('Error getting employee request status:', error);
    return { found: false, approved: false, pending: false, denied: false };
  }
}

export function getPendingCompanyRequests(companyCode: string): CompanyEmployee[] {
  if (typeof window === 'undefined') return [];

  try {
    initializeDemoCompanies();
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) return [];

    const companies: Company[] = JSON.parse(companiesData);
    const companyIndex = findCompanyIndexByCode(companies, companyCode);
    if (companyIndex === -1) return [];

    return companies[companyIndex].employees.filter((employee) => employee.status === 'pending');
  } catch (error) {
    console.error('Error getting pending company requests:', error);
    return [];
  }
}

export function approveEmployeeWithAuthCode(
  companyCode: string,
  employeeEmail: string,
  verificationCode: string,
  permissions: string[] = ['wellness', 'performance', 'productivity']
): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not in browser environment' };
  }

  try {
    initializeDemoCompanies();
    const companiesData = localStorage.getItem('companies');
    if (!companiesData) {
      return { success: false, error: 'Company registry not found' };
    }

    const companies: Company[] = JSON.parse(companiesData);
    const companyIndex = findCompanyIndexByCode(companies, companyCode);
    if (companyIndex === -1) {
      return { success: false, error: 'Company not found' };
    }

    const employeeIndex = companies[companyIndex].employees.findIndex(
      (entry) => normalizeEmail(entry.email) === normalizeEmail(employeeEmail)
    );

    if (employeeIndex === -1) {
      return { success: false, error: 'Employee request not found' };
    }

    const employee = companies[companyIndex].employees[employeeIndex];

    if (employee.status === 'approved') {
      return { success: true };
    }

    const expectedCode = String(employee.verificationCode || '').trim();
    const providedCode = String(verificationCode || '').trim();

    if (!providedCode) {
      return { success: false, error: 'Verification code is required' };
    }

    if (!expectedCode || expectedCode !== providedCode) {
      return { success: false, error: 'Invalid verification code for this employee request' };
    }

    employee.verificationCodeVerifiedAt = new Date().toISOString();
    employee.status = 'approved';
    employee.approvedAt = new Date().toISOString();
    employee.permissions = permissions;

    localStorage.setItem('companies', JSON.stringify(companies));
    return { success: true };
  } catch (error) {
    console.error('Error approving employee with auth code:', error);
    return { success: false, error: 'An error occurred while approving employee' };
  }
}

/**
 * Quick approve employee with sales role
 * Usage: approveSalesEmployee('ACME2024', 'employee@example.com')
 */
export function approveSalesEmployee(
  companyCode: string,
  employeeEmail: string
): boolean {
  return approveEmployee(companyCode, employeeEmail, [
    'wellness',
    'performance', 
    'productivity',
    'contentStudio',
    'sales', // POS access
    'products' // Product management access
  ]);
}

/**
 * Approve employee with custom permissions
 * Common roles:
 * - Sales: ['sales', 'pos', 'products']
 * - Admin: ['sales', 'pos', 'products', 'finance', 'analytics']  
 * - Basic: ['wellness', 'performance', 'productivity']
 */
export function approveEmployeeWithRole(
  companyCode: string,
  employeeEmail: string,
  role: 'sales' | 'admin' | 'basic'
): boolean {
  const rolePermissions = {
    sales: ['wellness', 'performance', 'productivity', 'contentStudio', 'sales', 'pos', 'products'],
    admin: ['wellness', 'performance', 'productivity', 'contentStudio', 'sales', 'pos', 'products', 'finance', 'analytics', 'leads'],
    basic: ['wellness', 'performance', 'productivity', 'contentStudio'],
  };
  
  return approveEmployee(companyCode, employeeEmail, rolePermissions[role]);
}
