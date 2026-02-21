import PDFDocument from "pdfkit";

interface ReportInput {
  originalScore: number;
  finalScore: number;
  improvement: number;
  highlighted: Array<{ sentence: string; aiProbability: number }>;
}

export const generatePdfBuffer = (input: ReportInput): Promise<Buffer> => {
  const doc = new PDFDocument({ margin: 36 });
  const chunks: Uint8Array[] = [];

  return new Promise((resolve) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text("AI Detection & Humanization Report");
    doc.moveDown();
    doc.fontSize(12).text(`Original AI Score: ${input.originalScore}%`);
    doc.text(`Final AI Score: ${input.finalScore}%`);
    doc.text(`Improvement: ${input.improvement}%`);
    doc.text(`Generated: ${new Date().toISOString()}`);

    doc.moveDown();
    doc.fontSize(14).text("Highlighted AI-like Sections");
    input.highlighted.forEach((entry) => {
      doc.fontSize(11).text(`(${entry.aiProbability}%) ${entry.sentence}`);
    });

    doc.end();
  });
};
