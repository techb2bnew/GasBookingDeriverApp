import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontSize, spacing, borderRadius,wp,hp } from '../utils/dimensions';

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
    Linking.openURL('tel:+1234567890').catch(() => {
      // Handle error if phone call cannot be initiated
    });
  };

  const StatCard = ({title, value, icon}) => (
    <View style={styles.statCard}>
      <Icon name={icon} size={24} color="#030213" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
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
            <Icon name="phone" size={24} color="#030213" />
            <Text style={styles.phoneText}>+1 (234) 567-8900</Text>
            <Icon name="call" size={20} color="#030213" />
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
    backgroundColor: "#3b82f6",
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: '#3b82f6', // Blue
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#030213',
    marginBottom: spacing.xs,
  },
  version: {
    fontSize: fontSize.sm,
    color: '#717182',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSize.md,
    lineHeight: 24,
    color: '#6b7280', // Gray text
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f3f3f5',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#030213',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statTitle: {
    fontSize: fontSize.xs,
    color: '#717182',
    textAlign: 'center',
  },
  teamContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ebef',
  },
  memberAvatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#030213',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#030213',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: '#717182',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#717182',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  phoneText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#030213',
    flex: 1,
    marginLeft: 12,
  },
  legalContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ebef',
  },
  legalText: {
    fontSize: 16,
    color: '#030213',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#717182',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff', // White background
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1f2937', // Dark shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280', // Gray text
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280', // Gray text
    marginLeft: 12,
  },
});

export default AboutUsScreen; 