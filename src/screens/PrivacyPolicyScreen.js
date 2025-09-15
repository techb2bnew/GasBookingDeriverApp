import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontSize, spacing, borderRadius,wp,hp } from '../utils/dimensions';

const PrivacyPolicyScreen = ({navigation}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#030213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, such as when you create an account, 
            complete your profile, or contact us for support. This may include:
          </Text>
          <Text style={styles.bulletPoint}>• Personal identification information (name, email address, phone number)</Text>
          <Text style={styles.bulletPoint}>• Driver's license and vehicle information</Text>
          <Text style={styles.bulletPoint}>• Location data when using our services</Text>
          <Text style={styles.bulletPoint}>• Payment and banking information</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
          <Text style={styles.bulletPoint}>• Process transactions and send related information</Text>
          <Text style={styles.bulletPoint}>• Send technical notices and support messages</Text>
          <Text style={styles.bulletPoint}>• Respond to your comments and questions</Text>
          <Text style={styles.bulletPoint}>• Monitor and analyze trends and usage</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy. We may share your information with:
          </Text>
          <Text style={styles.bulletPoint}>• Service providers who assist in our operations</Text>
          <Text style={styles.bulletPoint}>• Business partners for delivery coordination</Text>
          <Text style={styles.bulletPoint}>• Law enforcement when required by law</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of 
            transmission over the internet is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access and update your personal information</Text>
          <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
          <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
          <Text style={styles.bulletPoint}>• Request data portability</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: privacy@driverapp.com</Text>
          <Text style={styles.contactInfo}>Phone: +1 (234) 567-8900</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This privacy policy is effective as of the date listed above and will remain in effect 
            except with respect to any changes in its provisions in the future.
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
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // Light background border
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937', // Dark text
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

export default PrivacyPolicyScreen;
