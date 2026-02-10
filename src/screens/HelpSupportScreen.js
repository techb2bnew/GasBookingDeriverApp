import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontSize, spacing, borderRadius, wp, hp } from '../utils/dimensions';
import { COLORS } from '../utils/constants';

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
    const phoneNumber = '+1234567890';
    // Format phone number for tel: link
    const telUrl = Platform.OS === 'ios' 
      ? `telprompt:${phoneNumber}` 
      : `tel:${phoneNumber}`;
    
    Linking.openURL(telUrl).catch(() => {
      // Fallback to regular tel: if telprompt fails
      Linking.openURL(`tel:${phoneNumber}`).catch(() => {
        Alert.alert('Call Support', `Unable to make call. Please dial: ${phoneNumber}`);
      });
    });
  };

  const handleEmailSupport = () => {
    const email = 'support@driverapp.com';
    const subject = 'Driver Support Request';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Email Support', `Unable to open email. Please email us at: ${email}`);
    });
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
        <Icon name={option.icon} size={20} color={COLORS.blue} />
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
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
              onPress={() => {
                const phoneNumber = '+1234567890';
                const telUrl = Platform.OS === 'ios' 
                  ? `telprompt:${phoneNumber}` 
                  : `tel:${phoneNumber}`;
                Linking.openURL(telUrl).catch(() => {
                  // Fallback to regular tel:
                  Linking.openURL(`tel:${phoneNumber}`).catch(() => {
                    Alert.alert('Emergency Line', `Unable to make call. Please dial: ${phoneNumber}`);
                  });
                });
              }}
            >
              <Icon name="phone" size={18} color="#ffffff" style={{ marginRight: spacing.xs }} />
              <Text style={styles.emergencyButtonText}>Call Emergency Line</Text>
            </TouchableOpacity>
          </View>
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
    color: '#ffffff',
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
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: spacing.md,
  },
  contactContainer: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: fontSize.xs,
    color: '#6b7280',
  },
  faqContainer: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fecaca',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#ef4444',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emergencyText: {
    fontSize: fontSize.xs,
    color: '#717182',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  emergencyButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    minWidth: 160,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

export default HelpSupportScreen; 