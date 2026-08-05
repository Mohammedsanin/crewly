import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  FileText,
  Download,
  AlertCircle,
  BarChart2,
  Printer,
  TrendingDown,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const FinancialsView: React.FC = () => {
  const { clients, employees } = useERP();
  const [activeChartTab, setActiveChartTab] = useState<'annual' | 'quarterly' | 'margin'>('annual');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [projectionMultiplier, setProjectionMultiplier] = useState(1.0);

  const baseARR = clients.reduce((acc, c) => acc + c.contractValue, 0);
  const totalARR = baseARR * projectionMultiplier;

  // Derive monthly burn from employee headcount (rough estimate ₹80k/emp/month)
  const monthlyBurn = employees.length * 80000;
  // Net margin: only meaningful if we have revenue
  const netMarginPct =
    totalARR > 0
      ? Math.round(((totalARR - monthlyBurn * 12) / totalARR) * 1000) / 10
      : null;

  const invoices = clients.map((client, idx) => ({
    id: `INV-2026-${String(idx + 101).padStart(3, '0')}`,
    client: client.companyName,
    amount: Math.round(client.contractValue / 4),
    status:
      client.status === 'active'
        ? 'Paid'
        : client.status === 'onboarding'
        ? 'Processing'
        : 'Pending',
    date: client.startDate,
  }));

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  // 12 Months data modeling
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = months.map((month, idx) => {
    const wave = 0.85 + Math.sin(idx * 0.5) * 0.12 + (idx % 3 === 0 ? 0.06 : 0);
    const arrVal = totalARR > 0 ? (totalARR / 12) * wave : 0;
    const burnVal = monthlyBurn > 0 ? monthlyBurn * (0.95 + Math.cos(idx * 0.4) * 0.05) : 0;
    const profitVal = arrVal - burnVal;
    const marginVal = arrVal > 0 ? Math.round((profitVal / arrVal) * 100) : 0;

    return {
      month,
      arr: Math.round(arrVal),
      burn: Math.round(burnVal),
      profit: Math.round(profitVal),
      margin: marginVal,
    };
  });

  // Quarterly aggregated data modeling
  const quarters = [
    { name: 'Q1 (Jan-Mar)', arr: 0, burn: 0, profit: 0 },
    { name: 'Q2 (Apr-Jun)', arr: 0, burn: 0, profit: 0 },
    { name: 'Q3 (Jul-Sep)', arr: 0, burn: 0, profit: 0 },
    { name: 'Q4 (Oct-Dec)', arr: 0, burn: 0, profit: 0 },
  ];
  monthlyData.forEach((d, idx) => {
    const qIdx = Math.floor(idx / 3);
    quarters[qIdx].arr += d.arr;
    quarters[qIdx].burn += d.burn;
    quarters[qIdx].profit += d.profit;
  });

  // Chart configuration constants
  const chartHeight = 220;
  const chartWidth = 560;
  const maxVal = Math.max(...monthlyData.map((d) => Math.max(d.arr, d.burn, 100000)));

  const getChartY = (val: number) => {
    const y = chartHeight - (val / maxVal) * (chartHeight - 80);
    // Clamp the coordinate to prevent overflow (keep within 20px and baseline of chartHeight - 40)
    return Math.min(chartHeight - 40, Math.max(20, y));
  };

  const handleDownloadInvoice = (inv: typeof invoices[0]) => {
    const matchedClient = clients.find((c) => c.companyName === inv.client);
    const invoiceNum = inv.id;
    const billingDate = inv.date;
    const clientName = inv.client;
    const subtotal = inv.amount;
    const tax = Math.round(subtotal * 0.18); // 18% GST/tax
    const total = subtotal + tax;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNum} - Crewly</title>
          <style>
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 30px;
              margin-bottom: 30px;
            }
            .logo-box h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 900;
              letter-spacing: -0.5px;
              color: #4f46e5;
            }
            .logo-box p {
              margin: 4px 0 0 0;
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
            }
            .inv-meta {
              text-align: right;
            }
            .inv-meta h2 {
              margin: 0;
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
            }
            .inv-meta p {
              margin: 4px 0;
              font-size: 13px;
              color: #64748b;
            }
            .address-block {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .address-box h3 {
              margin: 0 0 10px 0;
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #94a3b8;
            }
            .address-box p {
              margin: 4px 0;
              font-size: 13px;
              font-weight: 600;
              color: #334155;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th {
              background-color: #f8fafc;
              border-bottom: 2px solid #e2e8f0;
              padding: 12px 16px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #64748b;
              text-align: left;
            }
            td {
              padding: 16px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 13px;
              color: #334155;
            }
            .text-right {
              text-align: right;
            }
            .totals-container {
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              width: 300px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 13px;
              font-weight: 600;
              color: #64748b;
            }
            .totals-row.grand {
              border-top: 2px solid #e2e8f0;
              padding-top: 12px;
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              font-weight: 600;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-box">
              <h1>Crewly</h1>
              <p>Quarterly Enterprise Billing Statement</p>
            </div>
            <div class="inv-meta">
              <h2>INVOICE</h2>
              <p><strong>Invoice ID:</strong> ${invoiceNum}</p>
              <p><strong>Billing Date:</strong> ${billingDate}</p>
              <p><strong>Status:</strong> ${inv.status.toUpperCase()}</p>
            </div>
          </div>

          <div class="address-block">
            <div class="address-box">
              <h3>Billed By</h3>
              <p><strong>Crewly Technologies Inc.</strong></p>
              <p>742 Evergreen Terrace</p>
              <p>San Francisco, CA 94107</p>
              <p>billing@crewly.io</p>
            </div>
            <div class="address-box">
              <h3>Billed To</h3>
              <p><strong>${clientName}</strong></p>
              <p>Industry: ${matchedClient?.industry || 'Technology Services'}</p>
              <p>Contact: ${matchedClient?.contactName || 'Corporate Procurement'}</p>
              <p>Email: ${matchedClient?.contactEmail || 'accounts@client.com'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Quarterly Enterprise License & Service Subscription</strong>
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                    Allocated capacity, SLA uptime guarantee (99.98%) & CRM synchronization workspace.
                  </div>
                </td>
                <td class="text-right">1</td>
                <td class="text-right">₹${subtotal.toLocaleString('en-IN')}</td>
                <td class="text-right">₹${subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>
                  <strong>SLA Premium Technical Support Allocation</strong>
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                    Priority incident management, emergency patching & developer console channels.
                  </div>
                </td>
                <td class="text-right">1</td>
                <td class="text-right">₹0 (Included)</td>
                <td class="text-right">₹0</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-container">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>₹${subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div class="totals-row">
                <span>Estimated Tax (GST 18%)</span>
                <span>₹${tax.toLocaleString('en-IN')}</span>
              </div>
              <div class="totals-row grand">
                <span>Grand Total</span>
                <span>₹${total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for partnering with Crewly. For support queries, email support@crewly.io.</p>
            <p style="font-size: 10px; margin-top: 4px;">Computer-generated statement. No physical signature required.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Invoice ID,Client,Amount,Status,Date\n' +
      invoices.map((i) => `"${i.id}","${i.client}",${i.amount},"${i.status}","${i.date}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crewly_financial_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="relative overflow-hidden rounded-3xl shadow-xl px-6 py-6 lg:px-8 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-700"
      >
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/15"
            style={{ width: 3 + (i % 3), height: 3 + (i % 3), left: `${i * 10 + 5}%`, top: `${15 + (i % 4) * 20}%` }}
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2 + (i % 3) * 0.5, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold mb-3">
              <IndianRupee className="w-3 h-3" />
              <span>Finance Module</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Financials</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Revenue intelligence · billing ledger · ARR tracking
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-850 text-xs font-black shadow-xl shadow-black/25 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Ledger</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: 'Total ARR Portfolio',
            value: clients.length > 0 ? fmt(totalARR) : '—',
            sub: clients.length > 0 ? `${clients.length} active contracts` : 'No clients registered yet',
            icon: IndianRupee,
            accent: 'from-emerald-400 to-teal-400',
            color: '#10b981',
            empty: clients.length === 0,
          },
          {
            label: 'Est. Monthly Burn',
            value: employees.length > 0 ? fmt(monthlyBurn) : '—',
            sub: employees.length > 0 ? `Based on ${employees.length} team members` : 'Add employees to estimate',
            icon: CreditCard,
            accent: 'from-indigo-400 to-violet-400',
            color: '#6366f1',
            empty: employees.length === 0,
          },
          {
            label: 'Net Profit Margin',
            value: netMarginPct !== null ? `${netMarginPct}%` : '—',
            sub: netMarginPct !== null ? 'ARR minus annual burn' : 'Requires revenue & team data',
            icon: ArrowUpRight,
            accent: 'from-purple-400 to-pink-400',
            color: '#8b5cf6',
            empty: netMarginPct === null,
          },
        ].map(({ label, value, sub, icon: Icon, accent, color, empty }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 340, damping: 24 }}
            className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-lg"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color }}>
                  {label}
                </span>
                <div className="p-2 rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <p className={`text-3xl font-black font-mono ${empty ? 'text-slate-300' : 'text-slate-800'}`}>
                {value}
              </p>
              <div className={`mt-3 text-xs font-bold flex items-center gap-1 ${empty ? 'text-slate-400' : ''}`} style={empty ? {} : { color }}>
                {empty ? <AlertCircle className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                <span>{sub}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Interactive Financial SVG Performance Trend Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-6 rounded-3xl border border-indigo-100/80 shadow-lg space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Financial Performance Trend</span>
            </h3>
            <p className="text-xs text-slate-500">Interactive revenue flow vs monthly corporate overhead burn</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* ARR Growth Simulation Slider */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl shadow-3xs">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">ARR Growth:</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={projectionMultiplier}
                onChange={(e) => setProjectionMultiplier(parseFloat(e.target.value))}
                className="w-20 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer shrink-0"
              />
              <span className="text-xs font-black text-indigo-700 font-mono w-10 text-right">
                {Math.round((projectionMultiplier - 1) * 100)}%
              </span>
            </div>

            {/* Interactive Chart Metric Tabs */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0">
              {(['annual', 'quarterly', 'margin'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveChartTab(tab);
                    setHoveredMonth(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeChartTab === tab ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'annual' && 'Monthly Performance'}
                  {tab === 'quarterly' && 'Quarterly Aggregate'}
                  {tab === 'margin' && 'Margin Analysis'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart View Content */}
        <div className="relative pt-4 flex flex-col items-center">
          {activeChartTab === 'annual' && (
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
              {/* SVG 12-Month Bar Chart */}
              <div className="relative flex-1 max-w-[580px] w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-hidden">
                  <defs>
                    <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fca5a5" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => (
                    <line
                      key={idx}
                      x1="30"
                      y1={40 + r * (chartHeight - 80)}
                      x2="550"
                      y2={40 + r * (chartHeight - 80)}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Profit Area Fill */}
                  <path
                    d={`M 30,${chartHeight - 40} L ${monthlyData
                      .map((d, i) => `${30 + i * 46},${getChartY(d.profit)}`)
                      .join(' L ')} L 536,${chartHeight - 40} Z`}
                    fill="url(#profitGrad)"
                  />

                  {/* Bars & Interactive triggers */}
                  {monthlyData.map((d, idx) => {
                    const x = 30 + idx * 46;
                    const barWidth = 10;
                    const arrHeight = (d.arr / maxVal) * (chartHeight - 80);
                    const burnHeight = (d.burn / maxVal) * (chartHeight - 80);

                    return (
                      <g key={d.month} className="cursor-pointer">
                        {/* ARR Bar */}
                        <rect
                          x={x - 6}
                          y={chartHeight - 40 - arrHeight}
                          width={barWidth}
                          height={arrHeight}
                          rx="3"
                          fill="url(#arrGrad)"
                          className="transition-all duration-300 hover:opacity-90"
                        />
                        {/* Burn Bar */}
                        <rect
                          x={x + 6}
                          y={chartHeight - 40 - burnHeight}
                          width={barWidth}
                          height={burnHeight}
                          rx="3"
                          fill="url(#burnGrad)"
                          className="transition-all duration-300 hover:opacity-90"
                        />

                        {/* Interactive Hover Area */}
                        <rect
                          x={x - 20}
                          y="10"
                          width="40"
                          height={chartHeight - 30}
                          fill="transparent"
                          onMouseEnter={() => setHoveredMonth(idx)}
                          onMouseLeave={() => setHoveredMonth(null)}
                        />

                        {/* X-Axis labels */}
                        <text x={x} y={chartHeight - 15} textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                          {d.month}
                        </text>
                      </g>
                    );
                  })}

                  {/* Profit Margin Glowing Line */}
                  <motion.path
                    d={`M ${monthlyData.map((d, i) => `${30 + i * 46},${getChartY(d.profit)}`).join(' L ')}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                  />

                  {/* Pulse Dots */}
                  {monthlyData.map((d, i) => {
                    const x = 30 + i * 46;
                    const y = getChartY(d.profit);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={hoveredMonth === i ? 5.5 : 3.5}
                        fill={hoveredMonth === i ? '#818cf8' : '#ffffff'}
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        className="transition-all duration-150 pointer-events-none"
                      />
                    );
                  })}
                </svg>

                {/* Floating Interactive Tooltip */}
                <AnimatePresence>
                  {hoveredMonth !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-100 shadow-xl space-y-1 z-20 pointer-events-none min-w-[150px]"
                    >
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        {months[hoveredMonth]} Trajectory
                      </p>
                      <div className="space-y-1 text-xs">
                        <p className="flex justify-between font-bold gap-3">
                          <span className="text-slate-500">ARR Stream:</span>
                          <span className="text-emerald-600 font-mono">{fmt(monthlyData[hoveredMonth].arr)}</span>
                        </p>
                        <p className="flex justify-between font-bold gap-3">
                          <span className="text-slate-500">Burn Rate:</span>
                          <span className="text-rose-600 font-mono">{fmt(monthlyData[hoveredMonth].burn)}</span>
                        </p>
                        <p className="flex justify-between font-bold gap-3 border-t border-slate-100 pt-1 mt-1">
                          <span className="text-slate-800">Net Profit:</span>
                          <span className="text-indigo-600 font-mono">{fmt(monthlyData[hoveredMonth].profit)}</span>
                        </p>
                        <p className="flex justify-between font-bold gap-3 text-[10px] text-slate-400">
                          <span>Margin:</span>
                          <span>{monthlyData[hoveredMonth].margin}%</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chart Side Legend */}
              <div className="space-y-4 max-w-xs w-full">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Legend & Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 leading-none">ARR Distribution</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Recurring contract value divided monthly plus seasonality</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3.5 h-3.5 rounded-md bg-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 leading-none">Monthly Burn Rate</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Corporate overhead estimated from headcount salary metrics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 bg-white shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 leading-none">Projected Monthly Profit</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Monthly profit stream before local tax provisions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeChartTab === 'quarterly' && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-4">
              {quarters.map((q, idx) => (
                <div key={q.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Quarter {idx + 1}</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">{q.name}</h4>
                  </div>
                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">ARR:</span>
                      <span className="text-slate-700 font-mono">{fmt(q.arr)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Burn:</span>
                      <span className="text-slate-700 font-mono">{fmt(q.burn)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-slate-200/80 pt-1 mt-1">
                      <span className="text-slate-900">Profit:</span>
                      <span className="text-indigo-600 font-mono">{fmt(q.profit)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeChartTab === 'margin' && (
            <div className="w-full bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex flex-col items-center">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-4">Projected Profit Margin Efficiency Map</h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full">
                {monthlyData.map((d) => (
                  <div key={d.month} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center justify-between text-center">
                    <span className="text-[10px] font-bold text-slate-400">{d.month}</span>
                    <span className="text-lg font-black text-indigo-700 my-1 font-mono">{d.margin}%</span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${d.margin > 70 ? 'badge-completed' : d.margin > 40 ? 'badge-progress' : 'badge-blocked'}`}>
                      {d.margin > 70 ? 'Optimal' : d.margin > 40 ? 'Stable' : 'Risk'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Invoice Ledger */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Quarterly Invoice Stream
            </h3>
            <p className="text-xs text-slate-500">Real-time billing ledger derived from active CRM accounts</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Client Account</th>
                <th className="px-4 py-3">Quarterly Billing (₹)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Billing Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{inv.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{inv.client}</td>
                    <td className="px-4 py-3 font-mono text-emerald-600 font-extrabold">{fmt(inv.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          inv.status === 'Paid' ? 'badge-completed' : 'badge-pending'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">{inv.date}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 font-extrabold transition-all cursor-pointer shadow-2xs text-[11px]"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Print Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs font-medium">
                    No active invoices. Register client accounts to generate billing streams.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
