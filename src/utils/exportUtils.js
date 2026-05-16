import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

export const exportProblemsToExcel = (problems, fileName = 'Problem_Statements.xlsx') => {
  const data = problems.map((p, index) => ({
    'S.No': index + 1,
    'Title': p.title,
    'Category': p.category,
    'Difficulty': p.difficulty,
    'Description': p.description,
    'Expected Outcome': p.expectedOutcome || '',
    'Tech Stack': p.techStack || '',
    'Resources': p.resources || '',
    'Max Teams Allowed': p.maxTeams > 0 ? p.maxTeams : 'Unlimited',
    'Teams Selected (Admin Only)': p.selectedBy ? p.selectedBy.length : 0,
    'Status': p.isActive ? 'Active' : 'Inactive'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Problem Statements');
  
  // Auto-size columns slightly
  const wscols = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 50 }, { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, fileName);
};

export const exportProblemToPDF = (problem) => {
  try {
    const doc = new jsPDF();
    let yPos = 20;
    
    // Helper to sanitize strings to avoid jsPDF font issues
    const sanitize = (str) => {
      if (!str) return '';
      return String(str).replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII chars
    };

    const safeTitle = sanitize(problem.title || 'Problem Statement');

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const splitTitle = doc.splitTextToSize(safeTitle, 170);
    doc.text(splitTitle, 20, yPos);
    yPos += (splitTitle.length * 8) + 5;

    // Metadata
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Category: ${sanitize(problem.category)}`, 20, yPos);
    doc.text(`Difficulty: ${sanitize(problem.difficulty)}`, 100, yPos);
    yPos += 10;
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    const addSection = (title, content) => {
      if (!content) return;
      
      const safeContent = sanitize(content);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const splitContent = doc.splitTextToSize(safeContent, 170);

      // Check if title + content exceeds page limit
      if (yPos + 10 + (splitContent.length * 6) > 280) { 
        doc.addPage(); 
        yPos = 20; 
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, yPos);
      yPos += 6;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(splitContent, 20, yPos);
      yPos += (splitContent.length * 6) + 8;
    };

    addSection('Description', problem.description);
    addSection('Expected Outcome', problem.expectedOutcome);
    addSection('Tech Stack', problem.techStack);
    addSection('Resources', problem.resources);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`TCE Hackathon - Problem Statement (${problem._id || 'Preview'})`, 20, 290);

    const filename = `${safeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
