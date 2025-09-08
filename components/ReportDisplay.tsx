'use client';

import React from 'react';

interface ReportData {
  company_name: string;
  website: string;
  industry: string;
  executive_summary: string;
  current_state: {
    tech_maturity: string;
    key_challenges: string[];
    existing_tools: string[];
  };
  quick_wins: Array<{
    title: string;
    description: string;
    impact: string;
    timeline: string;
    estimated_savings?: string;
  }>;
  strategic_recommendations: Array<{
    area: string;
    recommendation: string;
    benefits: string[];
    priority: string;
    implementation_complexity: string;
  }>;
  competitive_analysis: {
    industry_trends: string[];
    competitor_capabilities: string[];
    opportunities: string[];
  };
  roi_projections: {
    efficiency_gains: string;
    cost_savings: string;
    revenue_opportunities: string;
    payback_period: string;
  };
  implementation_roadmap: Array<{
    phase: string;
    timeline: string;
    focus_areas: string[];
    expected_outcomes: string[];
  }>;
  risk_assessment: {
    potential_risks: string[];
    mitigation_strategies: string[];
  };
  next_steps: string[];
  sources: string[];
}

interface ReportDisplayProps {
  reportData: ReportData;
}

export default function ReportDisplay({ reportData }: ReportDisplayProps) {
  return (
    <div className="report-section">
      <div className="report-header">
        <h1 className="report-title">AI Opportunities Report</h1>
        <p className="report-subtitle">for {reportData.company_name}</p>
      </div>

      <div className="report-content">
        <div className="report-section-title">Executive Summary</div>
        <div className="report-item">
          <div className="report-item-description">{reportData.executive_summary}</div>
        </div>

        <div className="report-section-title">Quick Wins</div>
        {reportData.quick_wins.map((win, index) => (
          <div key={index} className="report-item">
            <div className="report-item-title">{win.title}</div>
            <div className="report-item-description">{win.description}</div>
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#08b2c6' }}>
              <strong>Impact:</strong> {win.impact} | <strong>Timeline:</strong> {win.timeline}
              {win.estimated_savings && <> | <strong>Savings:</strong> {win.estimated_savings}</>}
            </div>
          </div>
        ))}

        <div className="report-section-title">Strategic Recommendations</div>
        {reportData.strategic_recommendations.map((rec, index) => (
          <div key={index} className="report-item">
            <div className="report-item-title">{rec.area}</div>
            <div className="report-item-description">{rec.recommendation}</div>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              {rec.benefits.map((benefit, i) => (
                <li key={i} style={{ fontSize: '14px', color: '#666' }}>{benefit}</li>
              ))}
            </ul>
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#8f8f91' }}>
              Priority: {rec.priority} | Complexity: {rec.implementation_complexity}
            </div>
          </div>
        ))}

        <div className="report-section-title">ROI Projections</div>
        <div className="report-item">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <strong>Efficiency Gains:</strong><br />{reportData.roi_projections.efficiency_gains}
            </div>
            <div>
              <strong>Cost Savings:</strong><br />{reportData.roi_projections.cost_savings}
            </div>
            <div>
              <strong>Revenue Opportunities:</strong><br />{reportData.roi_projections.revenue_opportunities}
            </div>
            <div>
              <strong>Payback Period:</strong><br />{reportData.roi_projections.payback_period}
            </div>
          </div>
        </div>

        <div className="report-section-title">Implementation Roadmap</div>
        {reportData.implementation_roadmap.map((phase, index) => (
          <div key={index} className="report-item">
            <div className="report-item-title">{phase.phase} - {phase.timeline}</div>
            <div style={{ marginTop: '10px' }}>
              <strong>Focus Areas:</strong>
              <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                {phase.focus_areas.map((area, i) => (
                  <li key={i} style={{ fontSize: '14px' }}>{area}</li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: '10px' }}>
              <strong>Expected Outcomes:</strong>
              <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                {phase.expected_outcomes.map((outcome, i) => (
                  <li key={i} style={{ fontSize: '14px', color: '#08b2c6' }}>{outcome}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        <div className="report-section-title">Next Steps</div>
        <div className="report-item">
          <ol style={{ paddingLeft: '20px' }}>
            {reportData.next_steps.map((step, index) => (
              <li key={index} style={{ marginBottom: '10px', fontSize: '15px' }}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button 
          className="btn" 
          style={{ background: '#ff6b11' }}
          onClick={() => window.print()}
        >
          Print/Save Report
        </button>
      </div>
    </div>
  );
}