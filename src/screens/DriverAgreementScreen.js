import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { fontSize, spacing, borderRadius,wp,hp } from '../utils/dimensions';

const DriverAgreementScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Agreement</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.agreementContent}>
          <Text style={styles.sectionTitle}>1. Agreement Overview</Text>
          <Text style={styles.paragraph}>
            This Driver Agreement ("Agreement") is entered into between you ("Driver") and Gas Delivery 
            ("Company") regarding your participation as a delivery driver on our platform. By accepting 
            this agreement, you acknowledge that you have read, understood, and agree to be bound by 
            the terms and conditions outlined below.
          </Text>

          <Text style={styles.sectionTitle}>2. Driver Status</Text>
          <Text style={styles.paragraph}>
            As a driver on our platform, you are an independent contractor, not an employee of Gas Delivery. 
            This means:
          </Text>
          <Text style={styles.bulletPoint}>• You are responsible for your own taxes and insurance</Text>
          <Text style={styles.bulletPoint}>• You can choose your own working hours and delivery areas</Text>
          <Text style={styles.bulletPoint}>• You are responsible for your own vehicle and equipment</Text>
          <Text style={styles.bulletPoint}>• You will be paid based on completed deliveries</Text>

          <Text style={styles.sectionTitle}>3. Driver Responsibilities</Text>
          <Text style={styles.paragraph}>
            As a gas delivery driver, you agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Maintain a valid driver's license and vehicle registration</Text>
          <Text style={styles.bulletPoint}>• Ensure your vehicle is in good working condition</Text>
          <Text style={styles.bulletPoint}>• Follow all traffic laws and safety regulations</Text>
          <Text style={styles.bulletPoint}>• Handle gas cylinders with care and maintain safety standards</Text>
          <Text style={styles.bulletPoint}>• Provide excellent customer service</Text>
          <Text style={styles.bulletPoint}>• Complete deliveries within the estimated time</Text>
          <Text style={styles.bulletPoint}>• Report any issues or accidents immediately</Text>

          <Text style={styles.sectionTitle}>4. Safety Requirements</Text>
          <Text style={styles.paragraph}>
            Safety is our top priority. You must:
          </Text>
          <Text style={styles.bulletPoint}>• Wear appropriate safety gear when handling gas cylinders</Text>
          <Text style={styles.bulletPoint}>• Follow proper gas cylinder handling procedures</Text>
          <Text style={styles.bulletPoint}>• Never smoke or use open flames near gas cylinders</Text>
          <Text style={styles.bulletPoint}>• Ensure proper ventilation during delivery</Text>
          <Text style={styles.bulletPoint}>• Report any gas leaks or safety concerns immediately</Text>

          <Text style={styles.sectionTitle}>5. Payment and Earnings</Text>
          <Text style={styles.paragraph}>
            Your earnings will be based on:
          </Text>
          <Text style={styles.bulletPoint}>• Base delivery fee per order</Text>
          <Text style={styles.bulletPoint}>• Distance traveled</Text>
          <Text style={styles.bulletPoint}>• Number of cylinders delivered</Text>
          <Text style={styles.bulletPoint}>• Peak hour bonuses</Text>
          <Text style={styles.bulletPoint}>• Customer tips (if applicable)</Text>

          <Text style={styles.sectionTitle}>6. Termination</Text>
          <Text style={styles.paragraph}>
            Either party may terminate this agreement with written notice. Grounds for immediate 
            termination include:
          </Text>
          <Text style={styles.bulletPoint}>• Violation of safety protocols</Text>
          <Text style={styles.bulletPoint}>• Repeated customer complaints</Text>
          <Text style={styles.bulletPoint}>• Failure to maintain required documents</Text>
          <Text style={styles.bulletPoint}>• Criminal activity or fraud</Text>

          <Text style={styles.sectionTitle}>7. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about this Driver Agreement, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: drivers@gasdelivery.com</Text>
          <Text style={styles.contactInfo}>Phone: +1 (234) 567-8900</Text>
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
    // minHeight: hp(14),
    backgroundColor: "#035db7",
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lxlg,
    fontWeight: '600',
    color: '#ffffff', // White text
  },
  headerRight: {
    width: wp('10%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  agreementContent: {
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#030213',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: fontSize.md,
    lineHeight: 24,
    color: '#030213',
    marginBottom: spacing.lg,
  },
  bulletPoint: {
    fontSize: fontSize.md,
    lineHeight: 24,
    color: '#030213',
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  contactInfo: {
    fontSize: fontSize.md,
    color: '#030213',
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
});

export default DriverAgreementScreen;
