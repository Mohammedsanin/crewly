import { Task, Client, Employee, CompanyProfile } from '../types';

/**
 * Utility to trigger browser file download for text/CSV
 */
const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * EXCEL / CSV EXPORTERS (UTF-8 BOM with Professional Formatted Structure)
 */

export const exportPendingTasksToCSV = (tasks: Task[], companyName: string) => {
  const pending = tasks.filter((t) => t.status !== 'done');
  
  const titleHeader = [`"SYNCWAVE ERP - OFFICIAL PENDING DELIVERABLES REPORT"`];
  const companyMeta = [`"Company: ${companyName.replace(/"/g, '""')}"`, `"Generated: ${new Date().toLocaleString()}"`, `"Total Items: ${pending.length}"`];
  const blankLine = [''];
  
  const headers = ['Task ID', 'Task Title', 'Status', 'Priority', 'Assigned To', 'Client Name', 'Due Date', 'Tags', 'Last Updated'];
  
  const rows = pending.map((t) => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.status.toUpperCase().replace('_', ' ')}"`,
    `"${t.priority.toUpperCase()}"`,
    `"${t.assignedTo.replace(/"/g, '""')}"`,
    `"${(t.clientName || 'Internal').replace(/"/g, '""')}"`,
    `"${t.dueDate}"`,
    `"${t.tags.join(', ').replace(/"/g, '""')}"`,
    `"${new Date(t.updatedAt).toLocaleDateString()}"`,
  ]);

  const summary = ['', '', '"OPEN ITEMS COUNT"', `"${pending.length}"`, '', '', '', '', ''];

  const csvContent = '\uFEFF' + [
    titleHeader.join(','),
    companyMeta.join(','),
    blankLine.join(','),
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    blankLine.join(','),
    summary.join(','),
  ].join('\r\n');

  const filename = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Pending_Tasks_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
};

export const exportFinancialsToCSV = (clients: Client[], companyInfo: CompanyProfile) => {
  const totalARR = clients.reduce((acc, c) => acc + c.contractValue, 0);

  const titleHeader = [`"SYNCWAVE ERP - EXECUTIVE FINANCIAL REVENUE REPORT"`];
  const companyMeta = [`"Company: ${companyInfo.name.replace(/"/g, '""')}"`, `"Tax ID: ${companyInfo.taxId}"`, `"Report Date: ${new Date().toLocaleDateString()}"`];
  const blankLine = [''];

  const headers = ['Client Company', 'Primary Contact', 'Contact Email', 'Industry Sector', 'Account Status', 'Contract ARR ($)', 'Partnership Date'];
  
  const rows = clients.map((c) => [
    `"${c.companyName.replace(/"/g, '""')}"`,
    `"${c.contactName.replace(/"/g, '""')}"`,
    `"${c.contactEmail.replace(/"/g, '""')}"`,
    `"${c.industry.replace(/"/g, '""')}"`,
    `"${c.status.toUpperCase()}"`,
    `"${c.contractValue}"`,
    `"${c.startDate}"`,
  ]);

  const summaryRow = ['', '', '', '', '"TOTAL ANNUAL RECURRING REVENUE (ARR)"', `"${totalARR}"`, ''];

  const csvContent = '\uFEFF' + [
    titleHeader.join(','),
    companyMeta.join(','),
    blankLine.join(','),
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    blankLine.join(','),
    summaryRow.join(','),
  ].join('\r\n');

  const filename = `${companyInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
};

/**
 * ULTRA-PREMIUM PRINTABLE PDF REPORT GENERATORS
 */

export const generatePendingTasksPDFReport = (tasks: Task[], companyInfo: CompanyProfile) => {
  const pending = tasks.filter((t) => t.status !== 'done');
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sprint Deliverables Report - ${companyInfo.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @page { size: A4 portrait; margin: 12mm 15mm; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.5;
          }

          /* Executive Header Bar */
          .header-banner {
            background: linear-gradient(135deg, #312e81 0%, #4338ca 60%, #6366f1 100%);
            color: #ffffff;
            border-radius: 16px;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            box-shadow: 0 10px 25px -5px rgba(67, 56, 202, 0.25);
          }
          .brand-title {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .brand-subtitle {
            font-size: 11px;
            color: #c7d2fe;
            font-weight: 600;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .header-meta {
            text-align: right;
            font-size: 10px;
            color: #e0e7ff;
          }
          .meta-pill {
            background: rgba(255, 255, 255, 0.15);
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 4px;
            backdrop-filter: blur(4px);
          }

          /* Executive Summary KPI Grid */
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            margin-bottom: 24px;
          }
          .kpi-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px 16px;
            position: relative;
            overflow: hidden;
          }
          .kpi-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; bottom: 0;
            width: 4px;
          }
          .kpi-blue::before { background: #4338ca; }
          .kpi-amber::before { background: #d97706; }
          .kpi-purple::before { background: #9333ea; }
          .kpi-label {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: 800;
            color: #64748b;
            letter-spacing: 0.5px;
          }
          .kpi-value {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
            font-family: monospace;
          }

          /* Styled Section Title */
          .section-heading {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            color: #334155;
            letter-spacing: 0.6px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          /* Professional Table */
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            margin-bottom: 24px;
          }
          th {
            background: #1e1b4b;
            color: #ffffff;
            text-align: left;
            padding: 10px 12px;
            font-size: 9px;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          td {
            border-bottom: 1px solid #f1f5f9;
            padding: 10px 12px;
            font-size: 11px;
            color: #334155;
          }
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .task-title {
            font-weight: 700;
            color: #0f172a;
          }

          /* Status & Priority Pills */
          .pill {
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            display: inline-block;
          }
          .priority-urgent { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
          .priority-high { background: #ffedd5; color: #9a3412; border: 1px solid #fdba74; }
          .priority-medium { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
          .priority-low { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
          .status-badge { background: #e0f2fe; color: #0369a1; font-weight: 800; border-radius: 6px; padding: 3px 7px; font-size: 9px; }

          /* Signoff Block */
          .sign-block {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 16px;
            border-t: 1px dashed #cbd5e1;
          }
          .sign-box {
            width: 200px;
            text-align: center;
          }
          .sign-line {
            border-b: 1px solid #94a3b8;
            height: 30px;
            margin-bottom: 6px;
          }
          .sign-label {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
          }

          /* Footer */
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-t: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <!-- Header Banner -->
        <div class="header-banner">
          <div>
            <div class="brand-title">SYNCWAVE ERP</div>
            <div class="brand-subtitle">${companyInfo.name} • Sprint Deliverables Audit</div>
          </div>
          <div class="header-meta">
            <div class="meta-pill">CONFIDENTIAL REPORT</div>
            <div>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div>Tax ID: ${companyInfo.taxId}</div>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="kpi-grid">
          <div class="kpi-card kpi-blue">
            <div class="kpi-label">Open Sprint Deliverables</div>
            <div class="kpi-value">${pending.length}</div>
          </div>
          <div class="kpi-card kpi-amber">
            <div class="kpi-label">Urgent Deliverables</div>
            <div class="kpi-value">${pending.filter((t) => t.priority === 'urgent').length}</div>
          </div>
          <div class="kpi-card kpi-purple">
            <div class="kpi-label">Active In-Progress</div>
            <div class="kpi-value">${pending.filter((t) => t.status === 'in_progress').length}</div>
          </div>
        </div>

        <!-- Section Title -->
        <div class="section-heading">
          <span>Sprint Deliverables Register</span>
          <span style="color: #6366f1;">${pending.length} Active Items</span>
        </div>

        <!-- Deliverables Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 35%;">Task Deliverable Title</th>
              <th style="width: 12%;">Status</th>
              <th style="width: 12%;">Priority</th>
              <th style="width: 15%;">Assigned Member</th>
              <th style="width: 14%;">Client Partner</th>
              <th style="width: 12%;">Target Date</th>
            </tr>
          </thead>
          <tbody>
            ${
              pending.length > 0
                ? pending
                    .map(
                      (t) => `
              <tr>
                <td class="task-title">${t.title}</td>
                <td><span class="status-badge">${t.status.replace('_', ' ').toUpperCase()}</span></td>
                <td><span class="pill priority-${t.priority}">${t.priority}</span></td>
                <td>${t.assignedTo}</td>
                <td>${t.clientName || 'Internal Workspace'}</td>
                <td style="font-family: monospace; font-weight: 600;">${t.dueDate}</td>
              </tr>
            `
                    )
                    .join('')
                : `<tr><td colspan="6" style="text-align:center; padding: 24px; color: #94a3b8;">No pending deliverables registered. All sprint items complete!</td></tr>`
            }
          </tbody>
        </table>

        <!-- Sign-off Block -->
        <div class="sign-block">
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-label">Prepared By (Sprint Master)</div>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-label">Approved By (Executive Admin)</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>SYNCWAVE ERP Systems • Enterprise Confidential Document</div>
          <div>Security Verified: SOC2 Type II • Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const generateRevenuePDFReport = (clients: Client[], companyInfo: CompanyProfile) => {
  const totalARR = clients.reduce((acc, c) => acc + c.contractValue, 0);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Executive Revenue Audit - ${companyInfo.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @page { size: A4 portrait; margin: 12mm 15mm; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.5;
          }

          /* Executive Green Header Bar */
          .header-banner {
            background: linear-gradient(135deg, #064e3b 0%, #059669 60%, #10b981 100%);
            color: #ffffff;
            border-radius: 16px;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.25);
          }
          .brand-title {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .brand-subtitle {
            font-size: 11px;
            color: #a7f3d0;
            font-weight: 600;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .header-meta {
            text-align: right;
            font-size: 10px;
            color: #ecfdf5;
          }
          .meta-pill {
            background: rgba(255, 255, 255, 0.15);
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 4px;
            backdrop-filter: blur(4px);
          }

          /* KPI Grid */
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .kpi-card {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 14px;
            padding: 16px;
          }
          .kpi-label {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: 800;
            color: #065f46;
            letter-spacing: 0.5px;
          }
          .kpi-value {
            font-size: 26px;
            font-weight: 800;
            color: #047857;
            margin-top: 4px;
            font-family: monospace;
          }

          /* Table */
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            margin-bottom: 24px;
          }
          th {
            background: #064e3b;
            color: #ffffff;
            text-align: left;
            padding: 10px 12px;
            font-size: 9px;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          td {
            border-bottom: 1px solid #f1f5f9;
            padding: 10px 12px;
            font-size: 11px;
            color: #334155;
          }
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          .total-row td {
            background: #ecfdf5 !important;
            font-weight: 800;
            font-size: 12px;
            border-top: 2px solid #059669;
          }

          /* Signoff Block */
          .sign-block {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 16px;
            border-t: 1px dashed #cbd5e1;
          }
          .sign-box {
            width: 200px;
            text-align: center;
          }
          .sign-line {
            border-b: 1px solid #94a3b8;
            height: 30px;
            margin-bottom: 6px;
          }
          .sign-label {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
          }

          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-t: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <div>
            <div class="brand-title">SYNCWAVE FINANCIALS</div>
            <div class="brand-subtitle">${companyInfo.name} • Executive Revenue Audit</div>
          </div>
          <div class="header-meta">
            <div class="meta-pill">FINANCIAL STATEMENT</div>
            <div>Report Date: ${new Date().toLocaleDateString()}</div>
            <div>Tax ID: ${companyInfo.taxId}</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Annual Recurring Revenue (ARR)</div>
            <div class="kpi-value">$${totalARR.toLocaleString()}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Active Enterprise Client Accounts</div>
            <div class="kpi-value">${clients.length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 24%;">Enterprise Client</th>
              <th style="width: 18%;">Primary Contact</th>
              <th style="width: 22%;">Contact Email</th>
              <th style="width: 16%;">Industry</th>
              <th style="width: 20%; text-align: right;">Contract ARR ($)</th>
            </tr>
          </thead>
          <tbody>
            ${
              clients.length > 0
                ? clients
                    .map(
                      (c) => `
              <tr>
                <td><strong>${c.companyName}</strong></td>
                <td>${c.contactName}</td>
                <td>${c.contactEmail}</td>
                <td>${c.industry}</td>
                <td style="text-align: right; font-family: monospace; font-weight: 800; color: #047857;">$${c.contractValue.toLocaleString()}</td>
              </tr>
            `
                    )
                    .join('')
                : `<tr><td colspan="5" style="text-align:center; padding: 24px; color: #94a3b8;">No client accounts currently registered.</td></tr>`
            }
            <tr class="total-row">
              <td colspan="4" style="text-align: right;">TOTAL ANNUAL RECURRING REVENUE (ARR):</td>
              <td style="text-align: right; font-family: monospace; color: #047857; font-size: 13px;">$${totalARR.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="sign-block">
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-label">VP of Finance</div>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-label">Chief Executive Officer</div>
          </div>
        </div>

        <div class="footer">
          <div>SYNCWAVE ERP Financial Statement • Executive Confidential</div>
          <div>Security Verified: SOC2 Type II • Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
