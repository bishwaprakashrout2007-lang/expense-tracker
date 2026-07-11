import * as XLSX from 'xlsx';

export const exportToExcel = (reportType, data, monthName, yearName, totals) => {
  // Format data for sheet consumption
  const formattedData = data.map((item, idx) => ({
    'S.No': idx + 1,
    'Transaction Title': item.title,
    'Category': item.category,
    'Type': item.type.toUpperCase(),
    'Date Logged': new Date(item.date).toLocaleDateString(),
    'Amount (₹)': item.amount,
  }));

  // Create totals row
  formattedData.push({}); // Empty spacing row
  formattedData.push({
    'Transaction Title': 'REPORT METRICS SUMMARY',
    'Category': `Period: ${monthName} ${yearName}`,
    'Type': `Type: ${reportType}`,
    'Date Logged': 'Total Income:',
    'Amount (₹)': totals.income,
  });
  formattedData.push({
    'Date Logged': 'Total Expenses:',
    'Amount (₹)': totals.expense,
  });
  formattedData.push({
    'Date Logged': 'Net Balance:',
    'Amount (₹)': totals.balance,
  });

  // Create worksheet & workbook
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  
  // Append sheet
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Report');

  // Adjust column width sizes
  const wscols = [
    { wch: 6 },  // S.No
    { wch: 25 }, // Title
    { wch: 15 }, // Category
    { wch: 10 }, // Type
    { wch: 15 }, // Date
    { wch: 15 }, // Amount
  ];
  worksheet['!cols'] = wscols;

  // Save the Excel file
  const filename = `finsift_${reportType}_Report_${monthName}_${yearName}.xlsx`.replace(/\s+/g, '_');
  XLSX.writeFile(workbook, filename);
};
