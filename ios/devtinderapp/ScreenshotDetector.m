#import "ScreenshotDetector.h"

@implementation ScreenshotDetector
{
    BOOL _hasListeners;
}

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onScreenshotDetected"];
}

- (void)startObserving {
    _hasListeners = YES;
}

- (void)stopObserving {
    _hasListeners = NO;
}

RCT_EXPORT_METHOD(startListening) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(handleScreenshot:)
                                                     name:UIApplicationUserDidTakeScreenshotNotification
                                                   object:nil];
    });
}

RCT_EXPORT_METHOD(stopListening) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [[NSNotificationCenter defaultCenter] removeObserver:self
                                                        name:UIApplicationUserDidTakeScreenshotNotification
                                                      object:nil];
    });
}

- (void)handleScreenshot:(NSNotification *)notification {
    if (_hasListeners) {
        [self sendEventWithName:@"onScreenshotDetected" body:@"Screenshot detected by system API"];
    }
}

// These are required by RCTEventEmitter, no need to do anything inside
RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {}
RCT_EXPORT_METHOD(removeListeners:(double)count) {}

@end
