#import "SpotifyIos.h"
#import <ExpoModulesCore/ExpoModulesCore.h>

@interface SpotifyIosModule ()
@end

@implementation SpotifyIosModule

EXPORT_MODULE(SpotifyIos)

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end 