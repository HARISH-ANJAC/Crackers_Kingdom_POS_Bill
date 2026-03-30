import { Platform, Alert } from 'react-native';
import { toast } from '../components/common/Toast';

/**
 * Professional Export Utilities
 * Handles CSV generation, PDF conversion and Native Printing.
 */

export interface ExportColumn {
    key: string;
    title: string;
    render?: (item: any) => any;
}

// Conditionally import native modules - only on non-web platforms
let ReactNativeBlobUtil: any = null;
let RNHTMLtoPDF: any = null;
let RNPrint: any = null;

if (Platform.OS !== 'web') {
    try {
        const blobModule = require('react-native-blob-util');
        ReactNativeBlobUtil = blobModule.default || blobModule;
        console.log('[ExportUtils] ✅ react-native-blob-util loaded');
    } catch (e) {
        console.error('[ExportUtils] ❌ react-native-blob-util failed:', e);
    }

    try {
        const pdfModule = require('react-native-html-to-pdf');
        RNHTMLtoPDF = pdfModule.default || pdfModule;
        console.log('[ExportUtils] ✅ react-native-html-to-pdf loaded');
    } catch (e) {
        console.error('[ExportUtils] ❌ react-native-html-to-pdf failed:', e);
    }

    try {
        const printModule = require('react-native-print');
        RNPrint = printModule.default || printModule;
        console.log('[ExportUtils] ✅ react-native-print loaded');
    } catch (e) {
        console.error('[ExportUtils] ❌ react-native-print failed:', e);
    }
}

/**
 * Generates a premium HTML template for reports
 */
const generateProfessionalHTML = (title: string, data: any[], columns: ExportColumn[]) => {
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const tableRows = data.map((item, index) => {
        return `
            <tr>
                <td style="width: 30px; text-align: center; color: #94a3b8;">${index + 1}</td>
                ${columns.map(col => {
                    let val = '';
                    if (col.render) {
                        const rendered = col.render(item);
                        val = typeof rendered === 'string' || typeof rendered === 'number' ? String(rendered) : (item[col.key] || '');
                    } else {
                        val = item[col.key] || '';
                    }

                    // Professional Status Styling
                    const lowerVal = String(val).toLowerCase();
                    if (lowerVal === 'active' || lowerVal === 'success' || lowerVal === 'paid' || lowerVal === 'true') {
                        return `<td><span class="badge badge-success">${val === 'true' ? 'Active' : val}</span></td>`;
                    } else if (lowerVal === 'inactive' || lowerVal === 'failed' || lowerVal === 'unpaid' || lowerVal === 'false') {
                        return `<td><span class="badge badge-danger">${val === 'false' ? 'Inactive' : val}</span></td>`;
                    }
                    return `<td>${val}</td>`;
                }).join('')}
            </tr>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Helvetica', 'Arial', sans-serif;
                    margin: 0;
                    padding: 30px;
                    color: #1e293b;
                    background: #fff;
                    line-height: 1.5;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    border-bottom: 3px solid #3b82f6;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                }
                .brand h1 { margin: 0; color: #1d4ed8; font-size: 24px; font-weight: bold; }
                .brand p { margin: 2px 0 0; color: #64748b; font-size: 12px; }
                .meta { text-align: right; font-size: 11px; color: #94a3b8; }
                .report-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; }
                
                .summary-cards {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 25px;
                }
                .card {
                    flex: 1;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 12px;
                    border-radius: 8px;
                }
                .card-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; }
                .card-value { font-size: 16px; color: #1e293b; font-weight: bold; margin-top: 2px; }

                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th {
                    background: #f1f5f9;
                    color: #475569;
                    font-size: 10px;
                    font-weight: bold;
                    text-transform: uppercase;
                    padding: 10px 12px;
                    text-align: left;
                    border-bottom: 2px solid #e2e8f0;
                }
                td { padding: 10px 12px; font-size: 11px; border-bottom: 1px solid #f1f5f9; color: #334155; }
                tr:nth-child(even) { background: #fafafa; }
                
                .badge {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 9px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .badge-success { background: #dcfce7; color: #15803d; }
                .badge-danger { background: #fee2e2; color: #b91c1c; }
                
                .footer {
                    margin-top: 40px;
                    padding-top: 15px;
                    border-top: 1px solid #f1f5f9;
                    text-align: center;
                    font-size: 10px;
                    color: #94a3b8;
                }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                    @page { margin: 1cm; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="brand">
                    <h1>CRACKERS SHOP</h1>
                    <p>Official Administration Report</p>
                </div>
                <div class="meta">
                    <div class="report-title">${title}</div>
                    <div>Generated: ${date} | ${time}</div>
                </div>
            </div>

            <div class="summary-cards">
                <div class="card">
                    <div class="card-label">Total Records</div>
                    <div class="card-value">${data.length}</div>
                </div>
                <div class="card">
                    <div class="card-label">Classification</div>
                    <div class="card-value">Confidential</div>
                </div>
                <div class="card">
                    <div class="card-label">Status</div>
                    <div class="card-value">Verified</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 30px; text-align: center;">#</th>
                        ${columns.map(col => `<th>${col.title}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="footer">
                &copy; ${new Date().getFullYear()} Crackers Shop Platform. This is a system-generated document.
            </div>
        </body>
        </html>
    `;
};

/**
 * EXCEL / CSV Export
 */
export const exportToCSV = async (data: any[], columns: ExportColumn[], filename: string) => {
    try {
        const headers = columns.map(col => `"${col.title.replace(/"/g, '""')}"`).join(',');
        const rows = data.map(item => {
            return columns.map(col => {
                let val = col.render ? col.render(item) : (item[col.key] || '');
                val = (val === true) ? 'Active' : (val === false) ? 'Inactive' : val;
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(',');
        });

        const csvContent = "\uFEFF" + [headers, ...rows].join('\n');
        const finalFilename = `${filename}_${Date.now()}.csv`;

        if (Platform.OS === 'web') {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`File downloaded: ${finalFilename}`);
        } else {
            if (!ReactNativeBlobUtil) {
                return Alert.alert(
                    'Module Missing', 
                    'react-native-blob-util is not installed.\n\nTo fix:\n1. npm install react-native-blob-util\n2. cd android && ./gradlew clean\n3. cd .. && npm run android'
                );
            }

            const path = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${finalFilename}`;
            
            // Write as UTF-8 text
            await ReactNativeBlobUtil.fs.writeFile(path, csvContent, 'utf8');
            
            if (Platform.OS === 'android') {
                await ReactNativeBlobUtil.android.addCompleteDownload({
                    title: finalFilename,
                    description: 'Excel/CSV report from Crackers Shop',
                    mime: 'text/csv',
                    path: path,
                    showNotification: true,
                });
            }
            
            toast.success(`File saved to Downloads:\n${finalFilename}`);
        }
    } catch (error) {
        console.error('Excel Export Error:', error);
        toast.error(`Unable to generate Excel file.\n${error}`);
    }
};

/**
 * PRINT / PDF Export
 */
export const printData = async (title: string, data: any[], columns: ExportColumn[], format: 'print' | 'pdf' = 'print') => {
    const htmlContent = generateProfessionalHTML(title, data, columns);

    if (Platform.OS === 'web') {
        if (format === 'pdf') {
            // WEB PDF: Open print dialog with instructions to save as PDF
            const printWindow = window.open('', '_blank');
            if (!printWindow) return toast.warning('Please allow popups to generate the PDF.');
            
            const instructionHTML = htmlContent.replace(
                '</body>',
                `<div class="no-print" style="position: fixed; top: 10px; right: 10px; background: #3b82f6; color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999;">
                    <div style="font-weight: bold; margin-bottom: 5px;">📄 Save as PDF</div>
                    <div style="font-size: 12px;">Press <strong>Ctrl+P</strong> (or Cmd+P on Mac)</div>
                    <div style="font-size: 12px;">Then select "Save as PDF"</div>
                </div>
                <script>
                    // Auto-trigger print dialog
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 300);
                    };
                </script>
                </body>`
            );
            
            printWindow.document.write(instructionHTML);
            printWindow.document.close();
        } else {
            // WEB PRINT: Just open print dialog
            const printWindow = window.open('', '_blank');
            if (!printWindow) return toast.warning('Please allow popups to print.');
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.onload = () => {
                setTimeout(() => printWindow.print(), 300);
            };
        }
    } else {
        // ANDROID BEHAVIOR
        if (!RNPrint || !RNHTMLtoPDF || !ReactNativeBlobUtil) {
            const missingModules = [];
            if (!ReactNativeBlobUtil) missingModules.push('react-native-blob-util');
            if (!RNHTMLtoPDF) missingModules.push('react-native-html-to-pdf');
            if (!RNPrint) missingModules.push('react-native-print');
            
            return Alert.alert(
                'Native Modules Missing',
                `The following modules need to be installed:\n\n${missingModules.join('\n')}\n\n` +
                `To fix this issue:\n\n` +
                `1. Run these commands:\n` +
                `   npm install react-native-blob-util\n` +
                `   npm install react-native-html-to-pdf\n` +
                `   npm install react-native-print\n\n` +
                `2. Clean and rebuild:\n` +
                `   cd android\n` +
                `   ./gradlew clean\n` +
                `   cd ..\n` +
                `   npm run android\n\n` +
                `3. If issues persist, try:\n` +
                `   npx react-native doctor`
            );
        }

        try {
            if (format === 'print') {
                // ANDROID PRINT: Direct print dialog
                await RNPrint.print({ html: htmlContent });
            } else {
                // ANDROID PDF: Generate and save to Downloads
                const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
                const options = {
                    html: htmlContent,
                    fileName: fileName,
                    directory: 'Download',
                };

                const file = await RNHTMLtoPDF.generatePDF(options);
                const destPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}.pdf`;
                await ReactNativeBlobUtil.fs.cp(file.filePath, destPath);
                
                await ReactNativeBlobUtil.android.addCompleteDownload({
                    title: `${fileName}.pdf`,
                    description: 'Professional PDF report from Crackers Shop',
                    mime: 'application/pdf',
                    path: destPath,
                    showNotification: true,
                });
                
                toast.success(`Report saved to Downloads folder:\n${fileName}.pdf`);
            }
         } catch (error) {
            console.error('PDF/Print Error:', error);
            toast.error(`An error occurred while generating the report.\n\n${error}`);
        }
    }
};
