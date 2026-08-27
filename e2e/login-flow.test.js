describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the login screen', async () => {
    await expect(element(by.text('Login'))).toBeVisible();
    await expect(element(by.id('emailInput'))).toBeVisible();
    await expect(element(by.id('passwordInput'))).toBeVisible();
  });

  it('should show validation error if email is empty', async () => {
    await element(by.id('loginButton')).tap();
    await expect(element(by.text('Invalid Email'))).toBeVisible();
    // Dismiss the alert
    await element(by.text('OK')).tap();
  });

  it('should show validation error if password is short', async () => {
    await element(by.id('emailInput')).typeText('simaran@gmail.com');
    await element(by.id('passwordInput')).typeText('Simaran@123\n'); // \n to dismiss keyboard
    await element(by.id('loginButton')).tap();
    await expect(element(by.text('Password must be at least 6 characters'))).toBeVisible();
    await element(by.text('OK')).tap();
  });

  it('should toggle to signup screen successfully', async () => {
    await element(by.id('toggleSignupButton')).tap();
    await expect(element(by.text('Sign Up'))).toBeVisible();
    await expect(element(by.text('First Name'))).toBeVisible();
    await expect(element(by.text('Last Name'))).toBeVisible();
  });
});
