import {
    PDFDocument,
    StandardFonts,
    rgb,
} from "pdf-lib";

export async function generateCertificatePdf(
    studentName: string,
    courseTitle: string,
    certificateNumber: string
) {
    const pdf =
        await PDFDocument.create();

    const page =
        pdf.addPage([842, 595]);

    const titleFont =
        await pdf.embedFont(
            StandardFonts.HelveticaBold
        );

    const normalFont =
        await pdf.embedFont(
            StandardFonts.Helvetica
        );

    page.drawRectangle({
        x: 20,
        y: 20,
        width: 802,
        height: 555,
        borderWidth: 3,
        borderColor: rgb(0, 0, 0),
        color: rgb(1, 1, 1),
    });

    page.drawText(
        "EDTECH",
        {
            x: 370,
            y: 540,
            size: 18,
            font: titleFont,
        }
    );

    page.drawText(
        "CERTIFICATE OF COMPLETION",
        {
            x: 220,
            y: 480,
            size: 28,
            font: titleFont,
        }
    );

    page.drawText(
        "This Certificate Is Proudly Awarded To",
        {
            x: 245,
            y: 420,
            size: 16,
            font: normalFont,
        }
    );

    page.drawText(
        studentName,
        {
            x: 260,
            y: 370,
            size: 26,
            font: titleFont,
        }
    );

    page.drawText(
        "For Successfully Completing",
        {
            x: 275,
            y: 310,
            size: 16,
            font: normalFont,
        }
    );

    page.drawText(
        courseTitle,
        {
            x: 220,
            y: 260,
            size: 24,
            font: titleFont,
        }
    );

    page.drawText(
        `Issued On: ${new Date().toLocaleDateString()}`,
        {
            x: 60,
            y: 80,
            size: 12,
            font: normalFont,
        }
    );

    page.drawText(
        `Certificate No: ${certificateNumber}`,
        {
            x: 60,
            y: 55,
            size: 12,
            font: normalFont,
        }
    );

    page.drawText(
        "Authorized Signature",
        {
            x: 620,
            y: 80,
            size: 12,
            font: normalFont,
        }
    );

    page.drawLine({
        start: { x: 600, y: 100 },
        end: { x: 760, y: 100 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    return await pdf.save();
}