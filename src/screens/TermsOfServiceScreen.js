import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontSize, spacing, borderRadius ,wp,hp} from '../utils/dimensions';

const TermsOfServiceScreen = ({navigation}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
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
      </View>
    </ScrollView>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: "#035db7",
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#ffffff', // White text
  },
  placeholder: {
    width: wp('10%'),
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginBottom: spacing.md,
  },
  lastUpdated: {
    fontSize: fontSize.sm,
    color: '#717182',
    fontStyle: 'italic',
  },
  paragraph: {
    fontSize: fontSize.md,
    color: '#717182',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletPoint: {
    fontSize: fontSize.md,
    color: '#717182',
    lineHeight: 24,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  contactInfo: {
    fontSize: fontSize.md,
    color: '#030213',
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: '#717182',
    textAlign: 'center',
    lineHeight: 20,
  },
  description: {
    fontSize: fontSize.md,
    lineHeight: 24,
    color: '#6b7280', // Gray text
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: '#ffffff', // White background
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: spacing.lg,
    shadowColor: '#1f2937', // Dark shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: spacing.sm,
    elevation: 3,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: '#6b7280', // Gray text
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#6b7280', // Gray text
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280', // Gray text
    flex: 1,
  },
});

export default TermsOfServiceScreen;
