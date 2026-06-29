import r2 from "@/lib/r2";

import {
    PutObjectCommand,
} from "@aws-sdk/client-s3";

export async function uploadCertificate(
    pdfBytes: Buffer,
    certificateNumber: string
) {
    const storageKey =
        `certificates/${certificateNumber}.pdf`;

    await r2.send(
        new PutObjectCommand({
            Bucket:
                process.env
                    .R2_BUCKET_NAME!,

            Key: storageKey,

            Body: pdfBytes,

            ContentType:
                "application/pdf",
        })
    );

    return storageKey;
}