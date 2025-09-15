import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OTPTextInput from 'react-native-otp-textinput';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { wp, hp, fontSize, spacing, borderRadius } from '../utils/dimensions';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [errors, setErrors] = useState({ phone: '', otp: '', server: '' });
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const { login, loading } = useAuth();

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validatePhone = () => {
    let nextErrors = { phone: '', otp: '', server: '' };
    const phoneRegex = /^[0-9]{10,}$/;

    if (!phoneNumber) {
      nextErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(phoneNumber)) {
      nextErrors.phone = 'Enter a valid phone number (minimum 10 digits)';
    }

    setErrors(nextErrors);
    return !nextErrors.phone;
  };

  const validateOtp = () => {
    let nextErrors = { phone: '', otp: '', server: '' };

    if (!otp || otp.length !== 4) {
      nextErrors.otp = 'Please enter 4-digit OTP';
    }

    setErrors(nextErrors);
    return !nextErrors.otp;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;
    setErrors(prev => ({ ...prev, server: '' }));

    try {
      const result = await authService.sendOtp(phoneNumber);
      if (result.success) {
        setShowOtpInput(true);
        // Don't start timer on initial send
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, server: 'Failed to send OTP. Try again.' }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;
    setErrors(prev => ({ ...prev, server: '' }));

    try {
      const result = await login(phoneNumber, otp);
      if (!result.success) {
        setErrors(prev => ({ ...prev, server: result.error || 'Invalid OTP. Try again.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, server: 'Verification failed. Try again.' }));
    }
  };

  const handleResendOtp = async () => {
    if (isResendDisabled) return;
    setOtp('');
    setErrors(prev => ({ ...prev, server: '' }));

    try {
      const result = await authService.sendOtp(phoneNumber);
      if (result.success) {
        setResendTimer(30); // 30 seconds timer
        setIsResendDisabled(true);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, server: 'Failed to resend OTP. Try again.' }));
    }
  };

  const handleBackToPhone = () => {
    setShowOtpInput(false);
    setOtp('');
    setResendTimer(0);
    setIsResendDisabled(false);
    setErrors({ phone: '', otp: '', server: '' });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.backgroundGradient} />
      <View style={styles.content}>
        {showOtpInput && <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToPhone}>
          <Icon name="arrow-back" size={24} color="#1f2937" />
          {/* <Text style={styles.backButtonText}>Back to Phone</Text> */}
        </TouchableOpacity>}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="local-shipping" size={60} color="#ffffff" />
          </View>
          <Text style={styles.title}>Gas Delivery</Text>
          <Text style={styles.subtitle}>Sign in to start delivering</Text>
        </View>

        <View style={styles.form}>
          {!showOtpInput ? (
            <>
              <View style={[styles.inputContainer, errors.phone ? styles.inputError : null]}>
                <Icon name="phone" size={20} color={errors.phone ? '#ef4444' : '#6b7280'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#6b7280"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text.replace(/[^0-9]/g, ''));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="done"
                />
              </View>
              {Boolean(errors.phone) && <Text style={styles.fieldError}>{errors.phone}</Text>}

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.loginButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>
                  We've sent a 4-digit code to {'\n'}
                  <Text style={styles.phoneHighlight}>+91 {phoneNumber}</Text>
                </Text>

                <View style={styles.otpInputWrapper}>
                  <OTPTextInput
                    handleTextChange={(text) => {
                      setOtp(text);
                      if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
                    }}
                    containerStyle={styles.otpInputContainer}
                    textInputStyle={styles.otpInput}
                    tintColor="#1f2937"
                    offTintColor="#6b7280"
                    defaultValue=""
                    keyboardType="numeric"
                    autoFocus={true}
                    inputCount={4}
                  />
                </View>

                {Boolean(errors.otp) && <Text style={styles.fieldError}>{errors.otp}</Text>}

                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive the code? </Text>
                  {isResendDisabled ? (
                    <Text style={styles.timerText}>Resend in {formatTime(resendTimer)}</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResendOtp}
                      disabled={loading}>
                      <Text style={styles.resendButtonText}>Resend</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          )}

          {Boolean(errors.server) && (
            <View style={styles.errorBanner}>
              <Icon name="error-outline" size={18} color="#ef4444" />
              <Text style={styles.errorBannerText}>{errors.server}</Text>
            </View>
          )}
        </View>
        {/* <View style={styles.footer}>
          <Text style={styles.footerText}>© 2023 Gas Delivery. All rights reserved.</Text>
        </View> */}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff' // White background
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#f8fafc', // Very light background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignContent: "center",
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoContainer: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    backgroundColor: '#3b82f6', // Blue
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#1f2937', // Dark text
    marginTop: spacing.lg,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: '#6b7280', // Gray text
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
    width: "100%",
    marginTop: 20,
    borderColor: '#e5e7eb', // Light border
    shadowColor: '#1f2937',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: spacing.sm,
    elevation: 0,
  },
  inputContainerFocused: {
    borderColor: '#3b82f6', // Blue when focused
    shadowColor: '#3b82f6',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputIcon: {
    marginRight: spacing.md,
    color: '#6b7280', // Gray icon
  },
  inputIconFocused: {
    color: '#3b82f6', // Blue when focused
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: '#1f2937', // Dark text
    fontWeight: '500',
  },
  fieldError: {
    color: '#ef4444', // Red
    fontSize: fontSize.xs,
    paddingHorizontal: 20,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2', // Light red background
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#fecaca', // Light red border
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
    width: '100%',
  },
  errorBannerText: {
    color: '#b91c1c', // Dark red
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  inputError: {
    borderColor: '#ef4444', // Red
    backgroundColor: '#fef2f2' // Light red background
  },
  loginButton: {
    backgroundColor: '#3b82f6', // Blue
    borderRadius: borderRadius.xl,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    alignItems: 'center',
    marginTop: spacing.xxl,
    width: "100%",
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: spacing.sm,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af', // Gray when disabled
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff', // White text
    fontSize: fontSize.lg,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Back Button Styles
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: spacing.xl,
    zIndex: 1000,

  },
  backButtonText: {
    color: '#1f2937', // Dark text
    fontSize: fontSize.md,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },

  // OTP Section Styles
  otpSection: {
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpLabel: {
    fontSize: fontSize.sm,
    color: '#6b7280', // Gray text
    textAlign: 'center',
    lineHeight: 20,
  },
  phoneHighlight: {
    color: '#1f2937', // Dark text
    fontWeight: '600',
  },
  otpInputWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: '#d1d5db', // Lighter border
    borderRadius: borderRadius.md,
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    backgroundColor: '#ffffff', // White background
    width: wp('12.5%'),
    height: wp('12.5%'),
    textAlign: 'center',
    shadowColor: '#1f2937',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 0,
  },
  otpInputFocused: {
    borderColor: '#3b82f6', // Blue when focused
    shadowColor: '#3b82f6',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: fontSize.sm,
    color: '#6b7280', // Gray text
  },
  resendButton: {
    marginLeft: spacing.sm,
  },
  resendButtonText: {
    color: '#3b82f6', // Blue
    fontSize: fontSize.sm,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  timerText: {
    color: '#6b7280', // Gray text
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.xs,
    color: '#9ca3af', // Light gray
    textAlign: 'center',
  }
});

export default LoginScreen;