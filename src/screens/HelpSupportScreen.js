import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontSize, spacing, borderRadius, wp, hp } from '../utils/dimensions';

const HelpSupportScreen = ({ navigation }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I accept delivery orders?',
      answer: 'When you receive a new order notification, tap on it to view the details. If you want to accept the order, tap the "Accept" button. Make sure to check the pickup and delivery locations before accepting.',
    },
    {
      id: 2,
      question: 'What should I do if I can\'t find the pickup location?',
      answer: 'If you can\'t locate the pickup address, try using the in-app navigation or contact the customer directly through the app. You can also call our support team for assistance.',
    },
    {
      id: 3,
      question: 'How do I report an issue with an order?',
      answer: 'If you encounter any issues with an order, use the "Report Issue" button in the order details. You can also contact our support team through the chat or call option.',
    },
    {
      id: 4,
      question: 'How are my earnings calculated?',
      answer: 'Your earnings are calculated based on the delivery fee, distance traveled, and any additional bonuses. You can view your earnings breakdown in the earnings section of your profile.',
    },
    {
      id: 5,
      question: 'What should I do if a customer is not available for delivery?',
      answer: 'If the customer is not available, try calling them first. If they don\'t respond, you can mark the order as "Customer Unavailable" and follow the app\'s instructions for returning the order.',
    },
    {
      id: 6,
      question: 'How do I update my vehicle information?',
      answer: 'You can update your vehicle information in the Profile section. Go to Edit Profile and update your vehicle number, license number, and other details.',
    },
  ];

  const contactOptions = [
    {
      id: 1,
      title: 'Call Support',
      subtitle: 'Speak with our support team',
      icon: 'phone',
      action: () => handleCallSupport(),
    },
    {
      id: 2,
      title: 'Email Support',
      subtitle: 'Send us an email',
      icon: 'email',
      action: () => handleEmailSupport(),
    },
    // {
    //   id: 3,
    //   title: 'Live Chat',
    //   subtitle: 'Chat with support agent',
    //   icon: 'chat',
    //   action: () => handleLiveChat(),
    // },
  ];

  const handleCallSupport = () => {
    Alert.alert(
      'Call Support',
      'Would you like to call our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Linking.openURL('tel:+1234567890'),
        },
      ]
    );
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@driverapp.com?subject=Driver Support Request');
  };

  // const handleLiveChat = () => {
  //   Alert.alert(
  //     'Live Chat',
  //     'Live chat feature is coming soon. For now, please use call or email support.',
  //     [{ text: 'OK' }]
  //   );
  // };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const FAQItem = ({ faq }) => (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => toggleFaq(faq.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Icon
          name={expandedFaq === faq.id ? 'expand-less' : 'expand-more'}
          size={24}
          color="#717182"
        />
      </View>
      {expandedFaq === faq.id && (
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      )}
    </TouchableOpacity>
  );

  const ContactOption = ({ option }) => (
    <TouchableOpacity style={styles.contactOption} onPress={option.action}>
      <View style={styles.contactIcon}>
        <Icon name={option.icon} size={24} color="#030213" />
      </View>
      <View style={styles.contactText}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
      </View>
      <View>
        <Icon name="chevron-right" size={20} color="#717182" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.contactContainer}>
            {contactOptions.map(option => (
              <ContactOption key={option.id} option={option} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faqs.map(faq => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.emergencyCard}>
            <Icon name="warning" size={24} color="#ef4444" />
            <Text style={styles.emergencyTitle}>Emergency Support</Text>
            <Text style={styles.emergencyText}>
              For urgent issues or safety concerns, call our emergency line immediately.
            </Text>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => Linking.openURL('tel:+1234567890')}
            >
              <Text style={styles.emergencyButtonText}>Call Emergency Line</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: spacing.lg,
  },
  contactContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ebef',
  },
  contactIcon: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  // contactText: {
  //   flex: 1,
  // },
  contactTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: '#030213',
    // marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: fontSize.sm,
    color: '#717182',
  },
  faqContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // Light background border
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  faqQuestion: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
    color: '#1f2937', // Dark text
    marginRight: spacing.md,
  },
  faqAnswer: {
    fontSize: fontSize.sm,
    color: '#6b7280', // Gray text
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#717182',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  contactCard: {
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
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginBottom: 12,
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
    width: "70%"
  },
  contactButton: {
    backgroundColor: '#035db7', // Blue
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff', // White text
  },
});

export default HelpSupportScreen; 