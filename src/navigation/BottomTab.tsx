import React from 'react';
import { Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        // tabBarActiveTintColor: theme.colors.primaryDark,
        // tabBarInactiveTintColor: theme.colors.textDisabled,

        tabBarStyle: {
          //   backgroundColor: theme.colors.background,
          height: 78,
          paddingTop: 8,
          paddingBottom: 14,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          //   fontSize: theme.fontSizes.sm,
          //   fontFamily: theme.fonts.body,
          marginBottom: 4,
        },
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarButton: props => (
          <Pressable
            android_ripple={{ color: '#EAD7D7' }}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={props.onPress}
          >
            {props.children}
          </Pressable>
        ),
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ focused, color }) => {
          let iconName: any = 'help-circle';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Trends') {
            iconName = focused ? 'images' : 'images-outline';
          }

          //   return <Ionicons name={iconName} size={24} color={color} />;
          return null; // Placeholder for icon rendering, replace with actual icon component
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Trends"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Trends' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTab;
