import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = (reportType, data, monthName, yearName, totals) => {
  const doc = new jsPDF();
  
  // App branding color
  const primaryColor = [99, 102, 241]; // Brand brand-500 (#6366f1)

  // Header Title
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FinanceFlow', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Personal Financial Reports', 14, 25);
  
  // Date created
  const dateStr = new Date().toLocaleDateString();
  doc.text(`Created: ${dateStr}`, 150, 25);

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 28, 196, 28);

  // Report details
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Report Type: ${reportType} Report`, 14, 38);
  doc.text(`Billing Period: ${monthName} ${yearName}`, 14, 44);

  // Financial aggregates Summary
  doc.setFontSize(10);
  doc.text(`Total Income: Rs. ${totals.income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, 38);
  doc.text(`Total Expenses: Rs. ${totals.expense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, 44);
  doc.setFont(undefined, 'bold');
  doc.text(`Net Balance: Rs. ${totals.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, 50);
  doc.setFont(undefined, 'normal');

  // Table header & rows
  const tableColumn = ['Title', 'Category', 'Type', 'Date', 'Amount (Rs.)'];
  const tableRows = [];

  data.forEach(item => {
    const itemData = [
      item.title,
      item.category,
      item.type.toUpperCase(),
      new Date(item.date).toLocaleDateString(),
      item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    ];
    tableRows.push(itemData);
  });

  // Generate table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 58,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      4: { halign: 'right' } // Right align amount column
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });

  // Footer page numbering
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
    doc.text('FinanceFlow SaaS - linkedin.com/in/financeflow', 130, doc.internal.pageSize.height - 10);
  }

  // Save the PDF file
  const filename = `FinanceFlow_${reportType}_Report_${monthName}_${yearName}.pdf`.replace(/\s+/g, '_');
  doc.save(filename);
};
