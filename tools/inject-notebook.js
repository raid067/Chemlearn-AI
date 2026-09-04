const fs = require('fs');

let content = fs.readFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/dashboard.html', 'utf8');

if (!content.includes('html2pdf.bundle.min.js')) {
    content = content.replace('</head>', '    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>\n</head>');
}

if (!content.includes('Smart Notebook')) {
    const notebookHtml = `
            <!-- Smart Notebook -->
            <div class="dash-card">
                <div class="card-header">
                    <h2>?? Smart Notebook</h2>
                    <button class="btn-primary" onclick="exportNotebookToPDF()">Export PDF</button>
                </div>
                <div id="notebookContent" style="background:#f8fafc; padding:20px; border-radius:12px; min-height:200px; color:#1e293b;">
                    <em>No notes saved yet. Ask the AI Tutor something and click "Save to Notebook"!</em>
                </div>
            </div>
`;
    // Insert it before the end of dash-grid
    content = content.replace(/(<div class="dash-card" style="grid-column: 1 \/ -1;">[\s\S]*?<\/div>\s*<\/div>)/, notebookHtml + '\n');
}

fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/dashboard.html', content);
console.log('Injected Notebook UI');
