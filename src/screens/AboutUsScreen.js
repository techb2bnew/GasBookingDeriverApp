import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontSize, spacing, borderRadius, wp, hp } from '../utils/dimensions';
import { COLORS } from '../utils/constants';

const AboutUsScreen = ({navigation}) => {
  const appVersion = '1.0.0';
  const buildNumber = '1';

  const companyInfo = {
    name: 'DriverApp',
    description: 'Connecting drivers with delivery opportunities across the city. We provide a reliable platform for drivers to earn money while helping businesses deliver their products efficiently.',
    founded: '2024',
    employees: '50+',
    drivers: '1000+',
    cities: '25+',
  };

 

  const handlePhoneCall = () => {
    const phoneNumber = '+1234567890';
    const telUrl = Platform.OS === 'ios' 
      ? `telprompt:${phoneNumber}` 
      : `tel:${phoneNumber}`;
    Linking.openURL(telUrl).catch(() => {
      // Fallback to regular tel:
      Linking.openURL(`tel:${phoneNumber}`).catch(() => {
        Alert.alert('Contact Us', `Unable to make call. Please dial: ${phoneNumber}`);
      });
    });
  };

  const StatCard = ({title, value, icon}) => (
    <View style={styles.statCard}>
      <Icon name={icon} size={20} color={COLORS.blue} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={styles.section}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Icon name="local-shipping" size={48} color="#ffffff" />
            </View>
            <Text style={styles.appName}>{companyInfo.name}</Text>
            <Text style={styles.version}>Version {appVersion} ({buildNumber})</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {companyInfo.name}</Text>
          <Text style={styles.description}>{companyInfo.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Impact</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Drivers"
              value={companyInfo.drivers}
              icon="people"
            />
            <StatCard
              title="Cities"
              value={companyInfo.cities}
              icon="location-city"
            />
            <StatCard
              title="Employees"
              value={companyInfo.employees}
              icon="business"
            />
            <StatCard
              title="Founded"
              value={companyInfo.founded}
              icon="calendar-today"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TouchableOpacity style={styles.phoneContainer} onPress={handlePhoneCall}>
            <Icon name="phone" size={20} color={COLORS.blue} />
            <Text style={styles.phoneText}>+1 (234) 567-8900</Text>
            <Icon name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.legalContainer}>
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <Text style={styles.legalText}>Privacy Policy</Text>
              <Icon name="chevron-right" size={20} color="#717182" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={() => navigation.navigate('TermsOfService')}
            >
              <Text style={styles.legalText}>Terms of Service</Text>
              <Icon name="chevron-right" size={20} color="#717182" />
            </TouchableOpacity>
            {/* <TouchableOpacity 
              style={styles.legalItem}
              onPress={() => navigation.navigate('DriverAgreement')}
            >
              <Text style={styles.legalText}>Driver Agreement</Text>
              <Icon name="chevron-right" size={20} color="#717182" />
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 {companyInfo.name}. All rights reserved.
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
    paddingTop: 20,
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: spacing.xs,
  },
  version: {
    fontSize: fontSize.xs,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: '#6b7280',
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statTitle: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  phoneText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginLeft: spacing.sm,
  },
  legalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  legalText: {
    fontSize: fontSize.sm,
    color: '#1f2937',
    fontWeight: '500',
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
  },
});

export default AboutUsScreen; 