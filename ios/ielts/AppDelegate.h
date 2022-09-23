/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>
#import "React/RCTBridgeModule.h"
#import <AVFoundation/AVFoundation.h>
#import <AudioToolbox/AudioToolbox.h>

@import UserNotifications;
@import Firebase;



@interface AppDelegate : UIResponder <UIApplicationDelegate,RCTBridgeModule,UNUserNotificationCenterDelegate, FIRMessagingDelegate>

@property (nonatomic, strong) UIWindow *window;
- (void) goToNativeView; // called from the RCTBridge module
@end
