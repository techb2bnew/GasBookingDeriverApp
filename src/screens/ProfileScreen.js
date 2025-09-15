import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { fontSize, spacing, borderRadius ,wp,hp} from '../utils/dimensions';
import CustomAlert from '../components/CustomAlert';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { orderHistory } = useOrder();
  const [stats, setStats] = useState({
    totalDelivered: 0,
    totalCanceled: 0,
    totalEarnings: 0,
    rating: 4.8,
  });
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    calculateStats();
  }, [orderHistory]);

  const calculateStats = () => {
    const delivered = orderHistory.filter(order => order.status === 'delivered').length;
    const canceled = orderHistory.filter(order => order.status === 'canceled').length;
    const earnings = orderHistory
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (order.deliveryFee || 0), 0);

    setStats({
      totalDelivered: delivered,
      totalCanceled: canceled,
      totalEarnings: earnings,
      rating: 4.8, // Mock rating
    });
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = () => {
    setShowLogoutAlert(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutAlert(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteAlert(true);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteAlert(false);
    // Here you would typically make an API call to delete the account
    Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
    logout();
  };

  const cancelDeleteAccount = () => {
    setShowDeleteAlert(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        {/* Profile Header with Enhanced Design */}
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderBackground} />
          <View style={styles.avatarContainer}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Icon name="person" size={40} color="#ffffff" />
              </View>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.driverName}>{user?.name || 'Driver Name'}</Text>
            <Text style={styles.driverEmail}>{user?.phone}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#fbbf24" />
              <Text style={styles.rating}>{stats.rating}</Text>
              <Text style={styles.ratingText}>• Professional Driver</Text>
            </View>
          </View>
        </View>

        {/* Information Cards */}
        <View style={styles.infoCards}>
          {/* Personal Information Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Icon name="person-outline" size={20} color="#030213" />
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="phone" size={16} color="#717182" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>
                    {user?.phone || 'Not added'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="location-on" size={16} color="#717182" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>
                    {user?.address || 'Not added'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Vehicle Information Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Icon name="directions-car" size={20} color="#030213" />
              <Text style={styles.cardTitle}>Vehicle Information</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="directions-car" size={16} color="#717182" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Vehicle Number</Text>
                  <Text style={styles.infoValue}>
                    {user?.vehicleNumber || 'Not added'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="badge" size={16} color="#717182" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>License Number</Text>
                  <Text style={styles.infoValue}>
                    {user?.licenseNumber || 'Not added'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="build" size={16} color="#717182" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Vehicle Model</Text>
                  <Text style={styles.infoValue}>
                    {user?.vehicleModel || 'Not added'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="palette" size={16} color="#717182" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Vehicle Color</Text>
                  <Text style={styles.infoValue}>
                    {user?.vehicleColor || 'Not added'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>


      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.menuItemLeft}>
            <Icon name="person" size={20} color="#030213" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#717182" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('HelpSupport')}
        >
          <View style={styles.menuItemLeft}>
            <Icon name="help" size={20} color="#030213" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#717182" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AboutUs')}
        >
          <View style={styles.menuItemLeft}>
            <Icon name="info" size={20} color="#030213" />
            <Text style={styles.menuItemText}>About</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#717182" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}>
          <View style={styles.menuItemLeft}>
            <Icon name="logout" size={20} color="#ef4444" />
            <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.deleteItem]}
          onPress={handleDeleteAccount}>
          <View style={styles.menuItemLeft}>
            <Icon name="delete-forever" size={20} color="#ef4444" />
            <Text style={[styles.menuItemText, styles.deleteText]}>Delete Account</Text>
          </View>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={showLogoutAlert}
        title="Logout"
        message="Are you sure you want to logout from your account? You will need to sign in again to access the app."
        type="warning"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      <CustomAlert
        visible={showDeleteAlert}
        title="Delete Account"
        message="This action cannot be undone. All your data including order history, earnings, and profile information will be permanently deleted from our servers."
        type="error"
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={confirmDeleteAccount}
        onCancel={cancelDeleteAccount}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#1f2937', // Dark text
  },
  profileSection: {
    paddingVertical: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  profileHeaderBackground: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#f3f4f6', // Light background
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  avatarOuter: {
    position: 'relative',
  },
  avatar: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: '#3b82f6', // Blue
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1f2937', // Dark shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: spacing.xs,
    elevation: 3,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('3.5%'),
    backgroundColor: '#10b981', // Green
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#1f2937', // Dark text
    marginBottom: spacing.xs,
  },
  driverEmail: {
    fontSize: fontSize.sm,
    color: '#6b7280', // Gray text
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#1f2937', // Dark text
  },
  ratingText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.xs,
    color: '#6b7280', // Gray text
  },

  infoCards: {
    paddingHorizontal: spacing.xl,
  },
  infoCard: {
    backgroundColor: '#ffffff', // White background
    borderRadius: spacing.lg,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // Light background border
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginLeft: spacing.md,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6', // Light background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280', // Gray text
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937', // Dark text
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsHeader: {
    marginBottom: 20,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#6b7280', // Gray text
    marginTop: 4,
  },
  statsContainer: {
    gap: 16,
  },
  mainStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mainStatCard: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1f2937', // Dark shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainStatIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#3b82f6', // Blue
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mainStatContent: {
    flex: 1,
  },
  mainStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937', // Dark text
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 14,
    color: '#6b7280', // Gray text
    fontWeight: '500',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryStatCard: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
    borderRadius: 12,
    padding: 16,
    shadowColor: '#1f2937', // Dark shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryStatTitle: {
    fontSize: 12,
    color: '#6b7280', // Gray text
    marginLeft: 8,
    fontWeight: '500',
  },
  secondaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937', // Dark text
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937', // Dark text
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // Light background border
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937', // Dark text
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 16,
  },
  logoutText: {
    color: '#ef4444', // Red for logout
  },
  deleteItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  deleteText: {
    color: '#ef4444', // Red for delete
  },
});

export default ProfileScreen;