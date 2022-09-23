////
////  ModuleWithEmitter.m
////  ielts
////
////  Created by Le Thanh Tuan on 2/14/19.
////  Copyright © 2019 Facebook. All rights reserved.
////
//
//#import <Foundation/Foundation.h>
//
//#import "ModuleWithEmitter.h"
//
//@implementation ModuleWithEmitter
//{
//  bool hasListeners;
//}
//
//RCT_EXPORT_MODULE();
//
//+ (id)allocWithZone:(NSZone *)zone {
//  static ModuleWithEmitter *sharedInstance = nil;
//  static dispatch_once_t onceToken;
//  dispatch_once(&onceToken, ^{
//    sharedInstance = [super allocWithZone:zone];
//  });
//  return sharedInstance;
//}
//
//// Will be called when this module's first listener is added.
//-(void)startObserving {
//  hasListeners = YES;
//}
//
//// Will be called when this module's last listener is removed, or on dealloc.
//-(void)stopObserving {
//  hasListeners = NO;
//}
//
//- (NSArray<NSString *> *)supportedEvents {
//  return @[@"EventReminder"];
//}
//
//- (void)sendData:(NSString *)plate
//{
////  if (hasListeners) {
//    [self sendEventWithName:@"EventReminder" body:@{@"name": plate}];
////  }
//}
//
//@end
