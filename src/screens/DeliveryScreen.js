import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Platform,
  PermissionsAndroid,
  Linking,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Keyboard,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OTPTextInput from 'react-native-otp-textinput';
import { useOrder } from '../context/OrderContext';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontSize, spacing, borderRadius, wp, hp } from '../utils/dimensions';

const DeliveryScreen = ({ navigation }) => {
  const { currentOrder, completeOrder } = useOrder();
  const [deliveryPhoto, setDeliveryPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [apiError, setApiError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const selectImage = () => {
    // Alert.alert(
    //   'Select Photo',
    //   'Choose how you want to add a delivery proof photo',
    //   [
    //     { text: 'Cancel', style: 'cancel' },
    //     { text: 'Camera', onPress: openCamera },
    //     // { text: 'Gallery', onPress: openGallery },
    //   ]
    // );
    openCamera()
  };

  async function requestCameraPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  const openCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to take delivery proof photos',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: false,
        cameraType: 'back',
      };

      const response = await launchCamera(options);

      if (response.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      if (response.errorCode) {
        console.error('Camera error:', response.errorCode);
        Alert.alert('Camera Error', 'Failed to open camera. Please try again.');
        return;
      }

      if (response.assets && response.assets[0]) {
        setDeliveryPhoto(response.assets[0]);
        console.log('Photo captured successfully');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', 'Failed to open camera. Please try again.');
    }
  };

  const openGallery = async () => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 1,
      };

      const response = await launchImageLibrary(options);

      if (response.didCancel) {
        console.log('User cancelled gallery');
        return;
      }

      if (response.errorCode) {
        console.error('Gallery error:', response.errorCode);
        Alert.alert('Gallery Error', 'Failed to open gallery. Please try again.');
        return;
      }

      if (response.assets && response.assets[0]) {
        setDeliveryPhoto(response.assets[0]);
        console.log('Photo selected successfully');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Gallery Error', 'Failed to open gallery. Please try again.');
    }
  };

  // Timer effect for resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleCompleteDelivery = async () => {
    if (!deliveryPhoto) {
      setApiError('Please take a delivery proof photo');
      return;
    }

    setSendingOtp(true);
    setApiError('');

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setApiError('Authentication token not found');
        setSendingOtp(false);
        return;
      }

      const result = await authService.sendDeliveryOtp(token, currentOrder.id);

      if (result.success) {
        setSendingOtp(false);
        setShowOtpModal(true);
        setResendTimer(30); // 30 seconds timer
        setCanResend(false);
        console.log('OTP sent successfully');
      } else {
        setApiError(result.error || 'Failed to send OTP');
        setSendingOtp(false);
      }
    } catch (error) {
      setApiError('Network error occurred');
      setSendingOtp(false);
      console.log('Error sending OTP:', error);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setSendingOtp(true);
    setOtpError('');

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setOtpError('Authentication token not found');
        setSendingOtp(false);
        return;
      }

      const result = await authService.sendDeliveryOtp(token, currentOrder.id);

      if (result.success) {
        setSendingOtp(false);
        setResendTimer(30); // 30 seconds timer
        setCanResend(false);
        setDeliveryOtp(''); // Clear previous OTP
      } else {
        setOtpError(result.error || 'Failed to resend OTP');
        setSendingOtp(false);
      }
    } catch (error) {
      setOtpError('Network error occurred');
      setSendingOtp(false);
      console.log('Error resending OTP:', error);
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setDeliveryOtp('');
    setOtpError('');
    setResendTimer(0);
    setCanResend(true);
  };

  const handleOtpSubmit = async () => {
    if (!deliveryOtp || deliveryOtp.length !== 6) {
      setOtpError('Please enter 6-digit OTP');
      return;
    }

    setOtpError('');
    setVerifyingOtp(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setOtpError('Authentication token not found');
        setVerifyingOtp(false);
        return;
      }

      // Console logs for API endpoint and payload
      console.log('=== DELIVERY OTP VERIFICATION API CALL ===');
      console.log('API Endpoint:', `/api/orders/${currentOrder.id}/verify-otp`);
      console.log('Method:', 'POST');
      console.log('Headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      });
      console.log('Payload:', {
        otp: deliveryOtp,
        deliveryNote: notes,
        paymentReceived: true,
        deliveryProof: deliveryPhoto ? 'Image file' : 'No image'
      });
      console.log('Order ID:', currentOrder.id);
      console.log('OTP:', deliveryOtp);
      console.log('Delivery Note:', notes);
      console.log('Payment Received:', true);
      console.log('Delivery Photo:', deliveryPhoto ? 'Present' : 'Not present');
      console.log('==========================================');

      const result = await authService.verifyDeliveryOtpWithProof(
        token, 
        currentOrder.id, 
        deliveryOtp, 
        notes, 
        true, // paymentReceived is always true
        deliveryPhoto
      );

      // Console log for API response
      console.log('=== API RESPONSE ===');
      console.log('Response:', result);
      console.log('===================');

      if (result.success) {
        setVerifyingOtp(false);
        setShowOtpModal(false);
        console.log('Delivery completed successfully!');
        // Navigate back to dashboard
        navigation.navigate('Main', { screen: 'Dashboard' });
      } else {
        setOtpError(result.error || 'Failed to verify OTP');
        setVerifyingOtp(false);
      }
    } catch (error) {
      setOtpError('Network error occurred');
      setVerifyingOtp(false);
      console.log('Error verifying OTP:', error);
    }
  };
  const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  const truncateText = (text, maxLength = 15) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Delivery</Text>
        <View style={styles.headerRight} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.orderSummary}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.label}>Order ID:</Text>
                  <Text style={styles.value}>#{currentOrder?.id}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label}>Order Number:</Text>
                  <Text style={styles.value}>{currentOrder?.orderNumber}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label}>Customer:</Text>
                  <Text style={styles.value}>{capitalizeFirstLetter(currentOrder?.customerName)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label}>Customer Phone:</Text>
                  <Text style={styles.value}>{currentOrder?.customerPhone}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label}>Customer Email:</Text>
                  <Text style={styles.value}>{currentOrder?.customerEmail}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label}>Payment Method:</Text>
                  <Text style={styles.value}>{currentOrder?.paymentMethod?.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label}>Total Amount:</Text>
                  <Text style={styles.value}>₹{currentOrder?.totalAmount}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label}>Delivery Address:</Text>
                  <Text style={styles.value}>{currentOrder?.customerAddress}</Text>
                </View>
              </View>
            </View>

            <View style={styles.photoSection}>
              <Text style={styles.sectionTitle}>Delivery Proof</Text>
              <Text style={styles.sectionSubtitle}>
                Take a photo as proof of delivery
              </Text>

              <TouchableOpacity style={styles.photoContainer} onPress={selectImage}>
                {deliveryPhoto ? (
                  <View style={styles.photoWrapper}>
                    <Image source={{ uri: deliveryPhoto.uri }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.retakeButton}
                      onPress={selectImage}
                    >
                      <Icon name="refresh" size={16} color="#ffffff" />
                      <Text style={styles.retakeButtonText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Icon name="camera-alt" size={48} color="#6b7280" />
                    <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
                    <Text style={styles.photoPlaceholderSubtext}>Camera or Gallery</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Delivery Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any delivery notes..."
                placeholderTextColor="#6b7280"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {apiError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.completeButton,
                (!deliveryPhoto || sendingOtp) && styles.completeButtonDisabled,
              ]}
              onPress={handleCompleteDelivery}
              disabled={!deliveryPhoto || sendingOtp}>
              <Icon name="check-circle" size={20} color="#ffffff" />
              <Text style={styles.completeButtonText}>
                {sendingOtp ? 'Sending OTP...' : 'Complete Delivery'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseOtpModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Delivery OTP</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseOtpModal}
                >
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Please enter the 6-digit OTP provided by customer
              </Text>

              {currentOrder?.customerEmail && (
                <View style={styles.customerEmailContainer}>
                  <Icon name="email" size={16} color="#6b7280" />
                  <Text style={styles.customerEmailText}>{currentOrder.customerEmail}</Text>
                </View>
              )}

              {deliveryPhoto && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: deliveryPhoto.uri }} style={styles.previewImage} />
                  <Text style={styles.imageText}>Delivery Photo</Text>
                </View>
              )}

              <View style={styles.otpContainer}>
                <OTPTextInput
                  handleTextChange={(text) => {
                    setDeliveryOtp(text);
                    if (otpError) setOtpError('');
                  }}
                  containerStyle={styles.otpInputContainer}
                  textInputStyle={styles.otpInput}
                  tintColor="#1f2937"
                  offTintColor="#6b7280"
                  defaultValue=""
                  keyboardType="numeric"
                  autoFocus={true}
                  inputCount={6}
                  keyboardAppearance="light"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    // Auto-submit when 6 digits are entered
                    if (deliveryOtp.length === 6) {
                      handleOtpSubmit();
                    }
                  }}
                  {...(Platform.OS === 'ios' && {
                    inputAccessoryViewID: 'otpToolbar'
                  })}
                />

              </View>
              {otpError ? (
                <View style={styles.otpErrorContainer}>
                  <Text style={styles.otpErrorText}>{otpError}</Text>
                </View>
              ) : null}

              {/* Resend OTP Button */}
              <TouchableOpacity
                style={styles.resendOtpButton}
                onPress={handleResendOtp}
                disabled={!canResend || sendingOtp}
              >
                <Icon 
                  name="refresh" 
                  size={16} 
                  color={canResend && !sendingOtp ? '#035db7' : '#9ca3af'} 
                />
                <Text 
                  style={[
                    styles.resendOtpText, 
                    (!canResend || sendingOtp) && styles.resendOtpTextDisabled
                  ]}
                >
                  {sendingOtp 
                    ? 'Sending...' 
                    : canResend 
                      ? 'Resend OTP' 
                      : `Resend in ${resendTimer}s`
                  }
                </Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleCloseOtpModal}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleOtpSubmit}
                  disabled={verifyingOtp}>
                  {verifyingOtp ? (
                    <Text style={[styles.modalButtonText, { color: "#ffffff" }]}>Verifying...</Text>
                  ) : (
                    <Text style={[styles.modalButtonText, { color: "#ffffff" }]}>Complete Delivery</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  headerRight: {
    width: wp('10%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  orderSummary: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: '#6b7280', // Gray text
    marginBottom: spacing.lg,
  },
  summaryCard: {
    backgroundColor: '#ffffff', // White background
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#1f2937', // Dark shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    width: "40%",// Gray text
  },
  value: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#1f2937', // Dark text
    width: "60%",
  },
  photoSection: {
    marginTop: spacing.xxl,
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#f3f4f6', // Light background border
    borderStyle: 'dashed',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  photoWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#ffffff', // White text
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#6b7280', // Gray text
    marginTop: 8,
  },
  photoPlaceholderSubtext: {
    fontSize: 12,
    color: '#6b7280', // Gray text
    marginTop: 4,
  },
  notesSection: {
    marginTop: 32,
  },
  notesInput: {
    backgroundColor: '#ffffff', // White background
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937', // Dark text
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#f3f4f6', // Light background border
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981', // Green background
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 32,
  },
  completeButtonDisabled: {
    backgroundColor: '#6b7280', // Gray when disabled
  },
  completeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff', // White text
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#dc2626',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff', // White background
    borderRadius: 16,
    padding: 24,
    // margin: 20,
    width: '90%',
    maxWidth: wp('100%'),
    shadowColor: '#1f2937', // Dark shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937', // Dark text
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280', // Gray text
    textAlign: 'center',
    marginBottom: 24,
  },
  customerEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  customerEmailText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    marginLeft: 8,
  },
  resendOtpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  resendOtpText: {
    fontSize: 14,
    color: '#035db7',
    fontWeight: '600',
    marginLeft: 6,
  },
  resendOtpTextDisabled: {
    color: '#9ca3af',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6', // Light background border
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#035db7', // Blue
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937', // Dark text
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: 8,
    marginBottom: 8,
  },
  imageText: {
    fontSize: 12,
    color: '#6b7280', // Gray text
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  otpInputContainer: {
    paddingHorizontal: spacing.md,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: borderRadius.lg,
    fontSize: fontSize.lg,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    width: 45,
    height: 48,
    textAlign: 'center',
    marginHorizontal:2
  },
  errorText: {
    color: '#ef4444', // Red
    fontSize: 12,
    textAlign: 'center',
  },
  otpErrorContainer: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  otpErrorText: {
    color: '#dc2626',
    fontSize: fontSize.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  keyboardToolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f3f4f6', // Light background
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // Very light border
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#035db7', // Blue
  },
  doneButtonText: {
    color: '#ffffff', // White text
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DeliveryScreen;