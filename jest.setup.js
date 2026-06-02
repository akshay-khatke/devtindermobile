import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
  };
});

// Mocking SVG imports
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: (props) => React.createElement('Svg', props),
    Circle: (props) => React.createElement('Circle', props),
    Rect: (props) => React.createElement('Rect', props),
    Path: (props) => React.createElement('Path', props),
    G: (props) => React.createElement('G', props),
  };
});

// Mocking images
jest.mock('../../assets/images/login_image.png', () => 'login_image');
jest.mock('../../assets/images/google.png', () => 'google_icon');
jest.mock('../../assets/images/facebook.png', () => 'facebook_icon');
jest.mock('../../assets/svg/login.svg', () => 'LoginSVG');
