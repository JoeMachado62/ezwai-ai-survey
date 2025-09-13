import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf, Font } from '@react-pdf/renderer';
import type { ReportSection } from './report-types';

// Convert images to base64 data URIs for embedding
const IMAGE_MAP: { [key: string]: string } = {
  'cover': '/images/cover-bg.jpg',
  'executive': '/images/executive-bg.jpg',
  'quickwins': '/images/quickwins-bg.jpg',
  'roadmap': '/images/roadmap-bg.jpg',
  'competitive': '/images/competitive-bg.jpg',
  'implementation': '/images/implementation-bg.jpg'
};

// Create styles with better formatting
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  coverPage: {
    height: '100%',
    backgroundColor: '#1f2937',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    position: 'relative',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#08b2c6',
    opacity: 0.1,
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
    backgroundColor: '#08b2c6',
    padding: 30,
    marginBottom: 30,
    marginLeft: -40,
    marginRight: -40,
    marginTop: -40,
  },
  sectionNumber: {
    fontSize: 36,
    color: '#e1530a',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageHeader: {
    height: 200,
    marginLeft: -40,
    marginRight: -40,
    marginTop: -40,
    marginBottom: 30,
    backgroundColor: '#f3f4f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
  bulletList: {
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bulletPoint: {
    color: '#08b2c6',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.6,
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
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#6b7280',
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

// Parse content into structured elements
const renderContent = (content: string) => {
  const cleaned = cleanText(content);
  const paragraphs = cleaned.split(/\n\n+/);
  
  return paragraphs.map((paragraph, index) => {
    // Handle bullet points
    if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
      const items = paragraph.split(/\n/).filter(item => item.trim());
      return (
        <View key={index} style={styles.bulletList}>
          {items.map((item, i) => (
            <View key={i} style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
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
        <View key={index} style={styles.bulletList}>
          {items.map((item, i) => {
            const match = item.match(/^(\d+)\.\s*(.*)/);
            if (match) {
              return (
                <View key={i} style={styles.bulletItem}>
                  <Text style={[styles.bulletPoint, { color: '#08b2c6' }]}>
                    {match[1]}.
                  </Text>
                  <Text style={styles.bulletText}>
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
        <View style={styles.coverOverlay} />
        <Text style={styles.coverTitle}>AI Strategic Brief</Text>
        <Text style={styles.coverSubtitle}>A Growth & Innovation Roadmap for</Text>
        <Text style={styles.coverCompany}>{businessName}</Text>
      </View>
    </Page>
    
    {/* Content Pages */}
    {sections.map((section, index) => (
      <Page key={index} size="A4" style={styles.page}>
        <View style={styles.sectionPage}>
          {/* Section Header with colored background instead of image */}
          <View style={[styles.sectionHeader, { 
            backgroundColor: index % 2 === 0 ? '#08b2c6' : '#e1530a' 
          }]}>
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
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              EZWAI Consulting | Page {index + 2}
            </Text>
          </View>
        </View>
      </Page>
    ))}
    
    {/* Final Page */}
    <Page size="A4" style={styles.page}>
      <View style={[styles.coverPage, { backgroundColor: '#1f2937' }]}>
        <Text style={[styles.coverTitle, { fontSize: 24, color: '#08b2c6' }]}>
          EZWAI Consulting
        </Text>
        <Text style={[styles.coverSubtitle, { color: '#e1530a' }]}>
          Intelligent Automation for Growing Businesses
        </Text>
        <View style={{ marginTop: 40, padding: 20 }}>
          <Text style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 }}>
            This report was generated using proprietary AI analysis and creative direction.
            The information and recommendations contained herein are for strategic planning
            purposes and do not constitute financial or legal advice.
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

// Generate PDF as base64 string (for browser/client-side)
export async function generateRailwayPdfBase64(sections: ReportSection[], businessName: string): Promise<string> {
  try {
    const doc = <ReportPDF sections={sections} businessName={businessName} />;
    const pdfBlob = await pdf(doc).toBlob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
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

// For server-side usage (Node.js) - This is what Railway will use  
export async function generateRailwayPdfBuffer(sections: ReportSection[], businessName: string): Promise<Buffer> {
  try {
    console.log('[Railway PDF] Starting generation for', businessName);
    // Create the document element directly without type checking issues
    const doc = (
      <Document>
        {/* Cover Page */}
        <Page size="A4" style={styles.page}>
          <View style={styles.coverPage}>
            <View style={styles.coverOverlay} />
            <Text style={styles.coverTitle}>AI Strategic Brief</Text>
            <Text style={styles.coverSubtitle}>A Growth & Innovation Roadmap for</Text>
            <Text style={styles.coverCompany}>{businessName}</Text>
          </View>
        </Page>
        
        {/* Content Pages */}
        {sections.map((section, index) => (
          <Page key={index} size="A4" style={styles.page}>
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
            
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {businessName} | AI Strategic Brief | Page {index + 2}
              </Text>
            </View>
          </Page>
        ))}
      </Document>
    );
    
    const pdfInstance = pdf(doc as any);
    
    // Generate the buffer properly - toBuffer returns a stream that needs to be converted
    const stream = await pdfInstance.toBuffer();
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream as any) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    
    console.log('[Railway PDF] Generated buffer size:', buffer?.length || 0);
    
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF generation resulted in empty buffer');
    }
    
    return buffer;
  } catch (error) {
    console.error('[Railway PDF] Error generating PDF buffer:', error);
    throw error;
  }
}