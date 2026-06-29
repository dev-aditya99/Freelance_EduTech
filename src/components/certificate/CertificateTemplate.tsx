import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";

// Optional: Tum yahan Google Fonts se custom fonts load kar sakte ho
// Font.register({
//   family: "GreatVibes",
//   src: "https://fonts.gstatic.com/s/greatvibes/v14/RWmMoKWR9v4ksMfaWd_JN9XliaO6-zc.ttf",
// });

interface CertificateProps {
    studentName: string;
    courseTitle: string;
    certificateNumber: string;
    issueDate: string;
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#ffffff",
        padding: 30,
        flexDirection: "column",
    },
    outerBorder: {
        border: "3pt solid #1E3A8A", // Navy Blue
        height: "100%",
        padding: 15,
    },
    innerBorder: {
        border: "1pt solid #94A3B8", // Slate Gray
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        backgroundColor: "#F8FAFC", // Very light blue/gray background
    },
    brand: {
        fontSize: 22,
        color: "#1E3A8A",
        fontWeight: "heavy",
        letterSpacing: 4,
        marginBottom: 30,
    },
    heading: {
        fontSize: 32,
        color: "#0F172A",
        fontWeight: "bold",
        marginBottom: 20,
    },
    subText: {
        fontSize: 14,
        color: "#475569",
        marginBottom: 15,
    },
    studentName: {
        fontSize: 42,
        color: "#1E3A8A",
        marginVertical: 25,
        textAlign: "center",
        // fontFamily: "GreatVibes", // Uncomment if using custom font
    },
    courseName: {
        fontSize: 26,
        color: "#0F172A",
        fontWeight: "bold",
        marginVertical: 15,
        textAlign: "center",
    },
    footer: {
        position: "absolute",
        bottom: 50,
        left: 40,
        right: 40,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    footerCol: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    footerLine: {
        width: 140,
        height: 1,
        backgroundColor: "#333333",
        marginBottom: 8,
    },
    footerText: {
        fontSize: 10,
        color: "#64748B",
    },
    certId: {
        position: "absolute",
        bottom: 20,
        width: "100%",
        textAlign: "center",
        fontSize: 10,
        color: "#64748B",
    }
});

interface CertificateProps {
    studentName: string;
    courseTitle: string;
    certificateNumber: string;
    issueDate: string;
}

const CertificateTemplate: React.FC<CertificateProps> = ({
    studentName,
    courseTitle,
    certificateNumber,
    issueDate,
}) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.outerBorder}>
                <View style={styles.innerBorder}>
                    {/* Header */}
                    <Text style={styles.brand}>EDTECH PLATFORM</Text>

                    <Text style={styles.heading}>CERTIFICATE OF COMPLETION</Text>
                    <Text style={styles.subText}>This certificate is proudly presented to</Text>

                    {/* Student Name */}
                    <Text style={styles.studentName}>{studentName}</Text>

                    <Text style={styles.subText}>has successfully completed the course</Text>

                    {/* Course Name */}
                    <Text style={styles.courseName}>{courseTitle}</Text>

                    {/* Footer Area */}
                    <View style={styles.footer}>
                        <View style={styles.footerCol}>
                            <View style={styles.footerLine} />
                            <Text style={styles.footerText}>Date of Issue</Text>
                            <Text style={styles.footerText}>{issueDate}</Text>
                        </View>

                        <View style={styles.footerCol}>
                            <View style={styles.footerLine} />
                            <Text style={styles.footerText}>Authorized Signature</Text>
                            <Text style={styles.footerText}>Director</Text>
                        </View>
                    </View>

                    {/* Verification ID */}
                    <Text style={styles.certId}>
                        Certificate ID: {certificateNumber}
                    </Text>
                </View>
            </View>
        </Page>
    </Document>
);

export default CertificateTemplate;