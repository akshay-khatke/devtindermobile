#import "BatteryModule.h"
#import <UIKit/UIKit.h>

@implementation BatteryModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getBatteryLevel:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [UIDevice currentDevice].batteryMonitoringEnabled = YES;
        float batteryLevel = [UIDevice currentDevice].batteryLevel;
        
        if (batteryLevel < 0.0) {
            reject(@"BATTERY_ERROR", @"Could not get battery level", nil);
        } else {
            int percentage = (int)(batteryLevel * 100);
            resolve(@(percentage));
        }
    });
}

@end
