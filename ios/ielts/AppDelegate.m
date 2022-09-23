/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
//#import <React/RCTPushNotificationManager.h>
#import <Firebase.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
//#import "GoogleSignIn"
#import <React/RCTLinkingManager.h>
#import "RNFirebaseNotifications.h" //Add This Line
#import "RNFirebaseMessaging.h"
#import <UserNotifications/UserNotifications.h>
#import "IQKeyboardManager.h"
#import "RNSplashScreen.h"

@import Firebase;

@implementation AppDelegate

RCT_EXPORT_MODULE()

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;
  
//  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"ielts"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [FIRApp configure];
  [RNFirebaseNotifications configure];  //Add This Line
  
//   [START set_messaging_delegate]
  [FIRMessaging messaging].delegate = self;
//   [END set_messaging_delegate]
  
  // Register for remote notifications. This shows a permission dialog on first run, to
  // show the dialog at a more appropriate time move this registration accordingly.
  // [START register_for_notifications]
  if ([UNUserNotificationCenter class] != nil) {
    // iOS 10 or later
    // For iOS 10 display notification (sent via APNS)
    [UNUserNotificationCenter currentNotificationCenter].delegate = self;
    UNAuthorizationOptions authOptions = UNAuthorizationOptionAlert |
    UNAuthorizationOptionSound | UNAuthorizationOptionBadge;
    [[UNUserNotificationCenter currentNotificationCenter]
     requestAuthorizationWithOptions:authOptions
     completionHandler:^(BOOL granted, NSError * _Nullable error) {
       // ...
     }];
  } else {
    // iOS 10 notifications aren't available; fall back to iOS 8-9 notifications.
    UIUserNotificationType allNotificationTypes =
    (UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge);
    UIUserNotificationSettings *settings =
    [UIUserNotificationSettings settingsForTypes:allNotificationTypes categories:nil];
    [application registerUserNotificationSettings:settings];
  }
  
  [application registerForRemoteNotifications];
  
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];
  //Gogle map
//  [GMSServices provideAPIKey:@"AIzaSyC02msDyQBsZ3OSkSqzot3_p8dYUFCIJJ8"];
  
  
  //IQManager
  [[IQKeyboardManager sharedManager] setEnable:false];
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self]; //Add This Line
  
  //Show splash screen
  [RNSplashScreen show];
  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayback error:nil];
  [[AVAudioSession sharedInstance] setActive:YES error:nil];
  [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];
  return YES;
}

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
   [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
  //  [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  //  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
  //  [RCTPushNotificationManager didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  //  [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  //  [RCTPushNotificationManager didReceiveLocalNotification:notification];
  [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [FBSDKAppEvents activateApp];
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
  
  return [[FBSDKApplicationDelegate sharedInstance] application:application
                                                        openURL:url
                                              sourceApplication:sourceApplication
                                                     annotation:annotation]
//  || [[GIDSignIn sharedInstance] handleURL:url
//                         sourceApplication:sourceApplication
//                                annotation:annotation]
  || [RCTLinkingManager application:application
                            openURL:url
                  sourceApplication:sourceApplication
                         annotation:annotation];
}

// We must explicitly expose methods otherwise JavaScript can't access anything
RCT_EXPORT_METHOD(navigateToLicensePlate)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
    [appDelegate goToNativeView];
  });
}

- (void) goToNativeView {
  UIStoryboard *mainStoryboard = [UIStoryboard storyboardWithName:@"Main" bundle: nil];
  UIViewController *sc= (UIViewController *)[mainStoryboard instantiateViewControllerWithIdentifier:@"ViewController"];
  [self.window.rootViewController presentViewController:sc animated:YES completion:nil];
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
//  if ([[self visibleViewController:[UIApplication sharedApplication].keyWindow.rootViewController] isKindOfClass:[ViewController class]]) {
//    return UIInterfaceOrientationMaskLandscapeRight;
//  }
  return UIInterfaceOrientationMaskPortrait;
}

- (UIViewController *)visibleViewController:(UIViewController *)rootViewController {
  
  if (rootViewController.presentedViewController == nil) {
    return rootViewController;
  }
  
  if ([rootViewController.presentedViewController isKindOfClass:[UINavigationController class]]) {
    UINavigationController *navigationController = (UINavigationController *)rootViewController.presentedViewController;
    UIViewController *lastViewController = [[navigationController viewControllers] lastObject];
    return [self visibleViewController:lastViewController];
  }
  if ([rootViewController.presentedViewController isKindOfClass:[UITabBarController class]]) {
    
    UITabBarController *tabBarController = (UITabBarController *)rootViewController.presentedViewController;
    UIViewController *selectedViewController = tabBarController.selectedViewController;
    
    return [self visibleViewController:selectedViewController];
  }
  
  UIViewController *presentedViewController = (UIViewController *)rootViewController.presentedViewController;
  
  return [self visibleViewController:presentedViewController];
}

- (void)applicationReceivedRemoteMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage { 
  
}

RCT_EXPORT_METHOD(loginAuthenFirebase: (NSString *) firebaseToken)
{
  dispatch_async(dispatch_get_main_queue(), ^{
      [[FIRAuth auth] signInWithCustomToken:firebaseToken
                                 completion:^(FIRAuthDataResult * _Nullable authResult,
                                              NSError * _Nullable error) {
                                   if (error) {
                                     NSLog(@"Sign in failed: %@", error.localizedDescription);
                                   } else {
                                     NSLog(@"Signed in with uid:");
                                   }
                                 }];
  });
  
}

@end

