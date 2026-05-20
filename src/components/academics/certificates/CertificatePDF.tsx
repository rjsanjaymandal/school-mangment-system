import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed (using default for now, but in a real app you might want custom fonts)
// Font.register({ family: 'Open Sans', src: '...' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        border: '10px solid #0f172a',
    },
    innerBorder: {
        border: '2px solid #e2e8f0',
        width: '100%',
        height: '100%',
        padding: 30,
        alignItems: 'center',
        position: 'relative',
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        color: '#0f172a',
        fontStyle: 'italic',
        fontFamily: 'Times-Roman',
    },
    subHeader: {
        fontSize: 10,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 10,
    },
    name: {
        fontSize: 28,
        color: '#0f172a',
        marginBottom: 40,
        fontWeight: 'bold',
    },
    courseInfo: {
        fontSize: 14,
        color: '#334155',
        marginBottom: 50,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderTop: '1px solid #e2e8f0',
        paddingTop: 10,
    },
    signatureBox: {
        width: 150,
        alignItems: 'center',
    },
    signatureLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#0f172a',
        marginTop: 20,
        marginBottom: 5,
    },
    signatureText: {
        fontSize: 10,
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    seal: {
        width: 50,
        height: 50,
        borderRadius: 25,
        border: '2px solid #0f172a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sealInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        border: '1px solid #0f172a',
    }
});

interface CertificatePDFProps {
    certificate: any;
}

export const CertificatePDF = ({ certificate }: CertificatePDFProps) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.innerBorder}>
                <Text style={styles.header}>Certificate of Achievement</Text>

                <Text style={styles.subHeader}>Awarded To</Text>

                <Text style={styles.name}>
                    {certificate.student?.profile?.first_name} {certificate.student?.profile?.last_name}
                </Text>

                <Text style={styles.courseInfo}>
                    For successfully completing {certificate.type} with outstanding performance.
                    {"\n\n"}
                    Reference: {certificate.reference_number}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontSize: 12 }}>{new Date().toLocaleDateString()}</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>Date</Text>
                    </View>

                    <View style={styles.seal}>
                        <View style={styles.sealInner} />
                    </View>

                    <View style={styles.signatureBox}>
                        <Text style={{ fontSize: 12, fontStyle: 'italic', fontFamily: 'Times-Roman' }}>Institutional Head</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>Signature</Text>
                    </View>
                </View>
            </View>
        </Page>
    </Document>
);

