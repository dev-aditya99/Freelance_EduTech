import { pdf } from "@react-pdf/renderer";
import CertificateTemplate from "@/components/certificate/CertificateTemplate";

export async function generateCertificateBuffer(
    studentName: string,
    courseTitle: string,
    certificateNumber: string
) {
    const stream = await pdf(
        <CertificateTemplate
            studentName={studentName}
            courseTitle={courseTitle}
            certificateNumber={certificateNumber}
            issueDate={new Date().toLocaleDateString()}
        />
    ).toBuffer();

    const chunks: Uint8Array[] = [];

    for await (const chunk of stream as any) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}