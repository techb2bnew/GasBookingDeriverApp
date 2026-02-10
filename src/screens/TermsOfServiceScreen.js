import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontSize, spacing, borderRadius, wp, hp } from '../utils/dimensions';
import { COLORS } from '../utils/constants';

const TermsOfServiceScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using the DriverApp platform, you accept and agree to be bound by the 
            terms and provision of this agreement. If you do not agree to abide by the above, 
            please do not use this service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            DriverApp is a delivery platform that connects drivers with delivery opportunities. 
            Our service includes:
          </Text>
          <Text style={styles.bulletPoint}>• Driver registration and verification</Text>
          <Text style={styles.bulletPoint}>• Order matching and assignment</Text>
          <Text style={styles.bulletPoint}>• Payment processing and tracking</Text>
          <Text style={styles.bulletPoint}>• Customer support and dispute resolution</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Driver Requirements</Text>
          <Text style={styles.paragraph}>
            To use our service as a driver, you must:
          </Text>
          <Text style={styles.bulletPoint}>• Be at least 18 years old</Text>
          <Text style={styles.bulletPoint}>• Have a valid driver's license</Text>
          <Text style={styles.bulletPoint}>• Own or have access to a reliable vehicle</Text>
          <Text style={styles.bulletPoint}>• Pass background and vehicle checks</Text>
          <Text style={styles.bulletPoint}>• Maintain valid insurance coverage</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            As a user of our platform, you agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide accurate and truthful information</Text>
          <Text style={styles.bulletPoint}>• Maintain the security of your account</Text>
          <Text style={styles.bulletPoint}>• Comply with all applicable laws and regulations</Text>
          <Text style={styles.bulletPoint}>• Treat other users with respect and professionalism</Text>
          <Text style={styles.bulletPoint}>• Report any suspicious or inappropriate behavior</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Payment Terms</Text>
          <Text style={styles.paragraph}>
            Payment for delivery services will be processed through our secure payment system. 
            Drivers will receive payment for completed deliveries minus applicable fees and commissions. 
            Payment schedules and minimum payout amounts are subject to change with notice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account at any time for violations of these terms, 
            fraudulent activity, or other reasons at our sole discretion. You may also terminate 
            your account at any time by contacting our support team.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            DriverApp shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages resulting from your use of the service. Our total liability shall 
            not exceed the amount paid by you in the 12 months preceding the claim.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: legal@driverapp.com</Text>
          <Text style={styles.contactInfo}>Phone: +1 (234) 567-8900</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These terms constitute the entire agreement between you and DriverApp regarding the 
            use of our service. We reserve the right to modify these terms at any time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: spacing.xl,
    // minHeight: hp(18),
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#ffffff', // White text
    textAlign: 'center',
  },
  placeholder: {
    width: wp('10%'),
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  section: {
    marginTop: spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: spacing.sm,
  },
  lastUpdated: {
    fontSize: fontSize.xs,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    lineHeight: 20,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  contactInfo: {
    fontSize: fontSize.sm,
    color: COLORS.blue,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default TermsOfServiceScreen;
