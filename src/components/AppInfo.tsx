import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme';

export function AppInfo() {
  const { width } = useWindowDimensions();

  const renderFeatureSection = (title: string, icon: string, description: string) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 200 }}
      style={styles.card}
    >
      <View style={styles.featureHeader}>
        <Feather name={icon as any} size={24} color={theme.colors.primary} />
        <Text style={styles.featureTitle}>{title}</Text>
      </View>
      <Text style={styles.featureDescription}>{description}</Text>
    </MotiView>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>APP INFORMATION</Text>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.card}
      >
        <Text style={styles.tagline}>Built with privacy in mind.{'\n'}Your tasks, your device, your data.</Text>
        <Text style={styles.introText}>
          In today's connected world, your privacy matters more than ever. SecureDo helps you stay 
          organized while keeping your data completely private and secure on your device.
        </Text>
      </MotiView>

      <Text style={styles.subSectionTitle}>Key Features</Text>

      {renderFeatureSection(
        "Task Management",
        "check-square",
        "Create and organize daily tasks with ease. Add descriptions, due times, and checklists to stay on top of your goals."
      )}

      {renderFeatureSection(
        "Analytics & Insights",
        "bar-chart-2",
        "Track your productivity with beautiful charts and stats. Understand your patterns and improve your task completion rate."
      )}

      {renderFeatureSection(
        "Smart Reminders",
        "bell",
        "Set daily planning and review reminders. Never miss important tasks with customizable notification times."
      )}

      {renderFeatureSection(
        "Complete Privacy",
        "shield",
        "Your data never leaves your device. No accounts, no cloud storage, no tracking - just pure privacy."
      )}

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200 }}
        style={styles.card}
      >
        <Text style={styles.privacyTitle}>Our Promise</Text>
        <Text style={styles.privacyText}>
          • 100% Private: All data stays on your device
          {'\n'}• No Internet Required: Works completely offline
          {'\n'}• No Registration: Start using instantly
          {'\n'}• No Analytics: Zero tracking or monitoring
          {'\n'}• Your Control: Easy data export and backup
        </Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200 }}
        style={[styles.card, styles.feedbackCard]}
      >
        <Text style={styles.feedbackTitle}>Help Us Improve</Text>
        <Text style={styles.feedbackText}>
          Have suggestions or found a bug? We'd love to hear from you! Visit our GitHub issues page:
          {'\n\n'}
          github.com/chinmayembedded/SecureDo/issues
        </Text>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    letterSpacing: 1,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  introText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  featureDescription: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  privacyText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 32,
  },
  feedbackCard: {
    backgroundColor: theme.colors.primary,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  feedbackText: {
    fontSize: 15,
    color: theme.colors.background,
    lineHeight: 22,
  },
}); 