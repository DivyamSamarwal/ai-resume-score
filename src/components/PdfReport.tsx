import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Path,
} from '@react-pdf/renderer';
import type { EvaluationResult, PillarScore } from '@/types';

const BORDER_COLOR = '#000000';
const PRIMARY_COLOR = '#fbbf24';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 20,
    marginBottom: 30,
  },
  headerBrand: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'extrabold',
    color: BORDER_COLOR,
  },
  headerTag: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: BORDER_COLOR,
    color: '#ffffff',
    padding: '4px 8px',
  },
  titleSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  summaryCard: {
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    padding: 16,
    marginBottom: 30,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  scoreCard: {
    borderWidth: 3,
    borderColor: BORDER_COLOR,
    padding: 20,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 5,
  },
  pillarCard: {
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    padding: 16,
    marginBottom: 15,
  },
  pillarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pillarTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  pillarScore: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  pillarList: {
    marginTop: 5,
  },
  pillarItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  pillarBullet: {
    width: 10,
    fontSize: 10,
  },
  pillarItemText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },
  pillarNegativeText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#d97706', // dark amber/orange
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
});

/**
 * Helper to render a bold box for the Score
 */
const ScoreRing = ({ score }: { score: number }) => {
  let color = '#ef4444'; // red
  if (score >= 40) color = '#f97316'; // orange
  if (score >= 60) color = '#f59e0b'; // yellow/amber
  if (score >= 80) color = '#22c55e'; // green

  return (
    <View
      style={{
        width: 100,
        height: 100,
        borderWidth: 6,
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}
    >
      <Text style={{ fontSize: 24, fontFamily: 'Helvetica-Bold' }}>
        {score}
      </Text>
    </View>
  );
};

const PillarDetails = ({ pillar }: { pillar: PillarScore }) => (
  <View style={styles.pillarCard} wrap={false}>
    <View style={styles.pillarHeader}>
      <Text style={styles.pillarTitle}>{pillar.label}</Text>
      <Text style={styles.pillarScore}>
        {pillar.score} / {pillar.maxScore}
      </Text>
    </View>
    
    <View style={styles.pillarList}>
      {pillar.positiveEvidence.map((ev, i) => (
        <View key={i} style={styles.pillarItem}>
          <Text style={styles.pillarBullet}>+</Text>
          <Text style={styles.pillarItemText}>{ev}</Text>
        </View>
      ))}
      {pillar.deductions.map((ded, i) => (
        <View key={i} style={styles.pillarItem}>
          <Text style={{ ...styles.pillarBullet, color: '#d97706' }}>-</Text>
          <Text style={styles.pillarNegativeText}>
            {ded.reason} ({-ded.points} pts)
          </Text>
        </View>
      ))}
    </View>
  </View>
);

export default function PdfReport({ result }: { result: EvaluationResult }) {
  const date = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerBrand}>Base100</Text>
          <Text style={styles.headerTag}>AI Evaluation Report</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Evaluation Results</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{result.summary}</Text>
        </View>

        {/* Score Ring */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCard}>
            <ScoreRing score={result.overallScore} />
            <Text style={styles.scoreLabel}>OVERALL SCORE</Text>
          </View>
        </View>

        {/* Strengths & Improvements */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Key Strengths</Text>
            {result.strengths.map((str, i) => (
              <View key={i} style={styles.pillarItem}>
                <Text style={styles.pillarBullet}>•</Text>
                <Text style={styles.pillarItemText}>{str}</Text>
              </View>
            ))}
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Areas for Improvement</Text>
            {result.improvements.map((imp, i) => (
              <View key={i} style={styles.pillarItem}>
                <Text style={styles.pillarBullet}>•</Text>
                <Text style={styles.pillarItemText}>{imp}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by Base100 AI Evaluator</Text>
          <Text style={styles.footerText}>{date}</Text>
        </View>
      </Page>

      {/* Page 2: Detailed Breakdown */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerBrand}>Base100</Text>
          <Text style={styles.headerTag}>Detailed Breakdown</Text>
        </View>

        <Text style={styles.sectionTitle}>Pillar Scores</Text>
        <PillarDetails pillar={result.pillars.openSource} />
        <PillarDetails pillar={result.pillars.selfMadeProjects} />
        <PillarDetails pillar={result.pillars.productionExperience} />
        <PillarDetails pillar={result.pillars.technicalSkills} />

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by Base100 AI Evaluator</Text>
          <Text style={styles.footerText}>{date}</Text>
        </View>
      </Page>
    </Document>
  );
}
