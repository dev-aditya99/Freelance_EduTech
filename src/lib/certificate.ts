import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fetch from "node-fetch";
import { format } from "date-fns";

export async function generateCertificatePdf(
  studentName: string,
  courseTitle: string,
  certificateNumber: string,
  templateUrl: string,
  enrolledAt: Date,
) {
  const enrolledDate = format(new Date(enrolledAt), "dd MMMM yyyy");
  const issuedDate = format(new Date(Date.now()), "dd MMMM yyyy");
  const pdfDoc = await PDFDocument.create();
  const templateImageBytes = await fetch(templateUrl).then((res) =>
    res.arrayBuffer(),
  );

  // PNG ya JPG ke hisaab se embed karein
  const templateImage = await pdfDoc.embedPng(templateImageBytes);

  const page = pdfDoc.addPage([842, 595]); // Landscape A4
  const { width, height } = page.getSize();

  // 1. Draw Background Image
  page.drawImage(templateImage, { x: 0, y: 0, width, height });

  // 2. Embed Fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 3. Draw Text (Coordinates yahan adjust kiye hain)
  // Student Name (Center aligned logic)
  page.drawText(studentName.toUpperCase(), {
    x: 361 - studentName.length * 6, // Roughly centering based on length
    y: 291,
    size: 30,
    font: titleFont,
    color: rgb(0.1, 0.1, 0.3),
  });

  // Course Title
  page.drawText(courseTitle, {
    x: 391 - courseTitle.length * 4,
    y: 261,
    size: 18,
    font: titleFont,
    color: rgb(0, 0, 0),
  });

  const timeText = `Between ${enrolledDate} to ${issuedDate}`;

  // Course Time timeText
  page.drawText(timeText, {
    x: 418 - timeText.length * 4,
    y: 160,
    size: 15,
    font: titleFont,
    color: rgb(0, 0, 0),
  });

  // Certificate Number (Bottom left)
  page.drawText(`Certificate No: ${certificateNumber}`, {
    x: 50,
    y: 50,
    size: 10,
    font: normalFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  return await pdfDoc.save();
}
