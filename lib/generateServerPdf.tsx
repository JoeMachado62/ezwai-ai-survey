import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf, Font } from '@react-pdf/renderer';
import type { ReportSection } from './report-types';

// Register fonts if needed (optional)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf'
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  coverPage: {
    height: '100vh',
    backgroundColor: '#1f2937',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  coverTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  coverCompany: {
    fontSize: 32,
    color: '#e1530a',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionPage: {
    padding: 40,
  },
  sectionHeader: {
    backgroundColor: '#f3f4f6',
    padding: 30,
    marginBottom: 30,
    borderLeft: '4px solid #e1530a',
  },
  sectionNumber: {
    fontSize: 36,
    color: '#e1530a',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 10,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.8,
    color: '#374151',
    marginBottom: 20,
  },
  paragraph: {
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  statHighlight: {
    backgroundColor: '#f0fdff',
    color: '#08b2c6',
    fontWeight: 'bold',
    padding: '2 6',
    borderRadius: 4,
  },
  pullQuote: {
    borderLeft: '3px solid #e1530a',
    paddingLeft: 20,
    marginVertical: 20,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#e1530a',
  },
  statisticBox: {
    backgroundColor: '#f0fdff',
    border: '1px solid #08b2c6',
    padding: 20,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  statisticValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#08b2c6',
    marginBottom: 8,
  },
  statisticDescription: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
  },
  keyTakeawaysBox: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 8,
    borderTop: '4px solid #e1530a',
    marginTop: 20,
  },
  keyTakeawaysTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e1530a',
    marginBottom: 12,
  },
  keyTakeawayItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  keyTakeawayBullet: {
    color: '#e1530a',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
  },
  keyTakeawayText: {
    flex: 1,
    fontSize: 11,
    color: '#374151',
  },
  footer: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: 40,
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerTitle: {
    fontSize: 20,
    color: '#08b2c6',
    marginBottom: 8,
  },
  footerSubtitle: {
    fontSize: 12,
    color: '#e1530a',
    marginBottom: 20,
  },
  footerDisclaimer: {
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 400,
  },
});

// Clean citations from text
const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/cite[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*[a-z0-9_-]*(?:turn\d+|search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/\bturn\d+(?:search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]+/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Parse content into paragraphs and handle formatting
const renderContent = (content: string) => {
  const cleaned = cleanText(content);
  const paragraphs = cleaned.split(/\n\n+/);
  
  return paragraphs.map((paragraph, index) => {
    // Handle bullet points
    if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
      const items = paragraph.split(/\n/).filter(item => item.trim());
      return (
        <View key={index} style={{ marginBottom: 12 }}>
          {items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#08b2c6', marginRight: 8 }}>•</Text>
              <Text style={[styles.content, { flex: 1 }]}>
                {cleanText(item.replace(/^[•-]\s*/, ''))}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    
    // Handle numbered lists
    if (/^\d+\.\s/.test(paragraph.trim())) {
      const items = paragraph.split(/\n/).filter(item => item.trim());
      return (
        <View key={index} style={{ marginBottom: 12 }}>
          {items.map((item, i) => {
            const match = item.match(/^(\d+)\.\s*(.*)/);
            if (match) {
              return (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <Text style={{ color: '#08b2c6', fontWeight: 'bold', marginRight: 8 }}>
                    {match[1]}.
                  </Text>
                  <Text style={[styles.content, { flex: 1 }]}>
                    {cleanText(match[2])}
                  </Text>
                </View>
              );
            }
            return null;
          })}
        </View>
      );
    }
    
    // Regular paragraph - handle bold text
    const parts = paragraph.split(/\*\*(.*?)\*\*/g);
    return (
      <Text key={index} style={[styles.content, styles.paragraph]}>
        {parts.map((part, i) => 
          i % 2 === 1 ? (
            <Text key={i} style={styles.bold}>{cleanText(part)}</Text>
          ) : (
            <Text key={i}>{cleanText(part)}</Text>
          )
        )}
      </Text>
    );
  });
};

// Create PDF Document Component
const ReportPDF = ({ sections, businessName }: { sections: ReportSection[], businessName: string }) => (
  <Document>
    {/* Cover Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        <Text style={styles.coverTitle}>AI Strategic Brief</Text>
        <Text style={styles.coverSubtitle}>A Growth & Innovation Roadmap for</Text>
        <Text style={styles.coverCompany}>{businessName}</Text>
      </View>
    </Page>
    
    {/* Content Pages */}
    {sections.map((section, index) => (
      <Page key={index} size="A4" style={styles.page}>
        <View style={styles.sectionPage}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionNumber}>
                {(index + 1).toString().padStart(2, '0')}.
              </Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          </View>
          
          {/* Main Content */}
          <View>{renderContent(section.mainContent)}</View>
          
          {/* Pull Quote */}
          {section.pullQuote && (
            <Text style={styles.pullQuote}>"{cleanText(section.pullQuote)}"</Text>
          )}
          
          {/* Statistic */}
          {section.statistic && (
            <View style={styles.statisticBox}>
              <Text style={styles.statisticValue}>{section.statistic.value}</Text>
              <Text style={styles.statisticDescription}>{section.statistic.description}</Text>
            </View>
          )}
          
          {/* Key Takeaways */}
          {section.keyTakeaways && section.keyTakeaways.length > 0 && (
            <View style={styles.keyTakeawaysBox}>
              <Text style={styles.keyTakeawaysTitle}>Key Takeaways</Text>
              {section.keyTakeaways.map((item, i) => (
                <View key={i} style={styles.keyTakeawayItem}>
                  <Text style={styles.keyTakeawayBullet}>✓</Text>
                  <Text style={styles.keyTakeawayText}>{cleanText(item)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    ))}
    
    {/* Footer Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>EZWAI Consulting</Text>
        <Text style={styles.footerSubtitle}>Intelligent Automation for Growing Businesses</Text>
        <Text style={styles.footerDisclaimer}>
          This report was generated using proprietary AI analysis and creative direction. 
          The information and recommendations contained herein are for strategic planning 
          purposes and do not constitute financial or legal advice.
        </Text>
      </View>
    </Page>
  </Document>
);

// Generate PDF as base64 string
export async function generateServerPdfBase64(sections: ReportSection[], businessName: string): Promise<string> {
  try {
    const doc = <ReportPDF sections={sections} businessName={businessName} />;
    const pdfBlob = await pdf(doc).toBlob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove the data:application/pdf;base64, prefix
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// For server-side usage (Node.js)
export async function generateServerPdfBuffer(sections: ReportSection[], businessName: string): Promise<Buffer> {
  try {
    const doc = <ReportPDF sections={sections} businessName={businessName} />;
    const stream = await pdf(doc as any).toBuffer();
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream as any) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    
    return buffer;
  } catch (error) {
    console.error('Error generating PDF buffer:', error);
    throw error;
  }
}