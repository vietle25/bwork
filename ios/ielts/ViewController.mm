////
////  ViewController.m
////  TestIPSS
////
////  Created by Macintosh on 1/26/19.
////  Copyright © 2019 Viscom. All rights reserved.
////
//
//#import "ViewController.h"
//#include <vector>
//#include "TGMTcolor.h"
//#include "TGMTbike.h"
//#import <AVFoundation/AVFoundation.h>
//#include <Security/Security.h>
//#import "ModuleWithEmitter.h"
//#import "IQKeyboardManager.h"
////#import <opencv2/videoio/cap_ios.h>
////using namespace cv;
//
//@interface ViewController ()
//@property (weak, nonatomic) IBOutlet UITextField *tfResult;
//@property (weak, nonatomic) IBOutlet UIButton *btTaken;
//@property (weak, nonatomic) IBOutlet UIButton *btTakenAgain;
//@property (weak, nonatomic) IBOutlet UIButton *btInputPlate;
//
//@property (weak, nonatomic) IBOutlet UIView *previewView;
//@property (nonatomic) AVCaptureSession *captureSession;
//@property (nonatomic) AVCapturePhotoOutput *stillImageOutput;
//@property (nonatomic) AVCaptureVideoPreviewLayer *videoPreviewLayer;
//@property (nonatomic) ModuleWithEmitter *emitter;
//@property (weak, nonatomic) IBOutlet UIButton *btAgree;
//@end
//
//@implementation ViewController
//
//- (IBAction)onInputBSX:(id)sender {
//  [self.captureSession stopRunning];
//  [self handleButtonTaken:true];
//}
//
//- (void)viewWillDisappear:(BOOL)animated {
//  [super viewWillDisappear:animated];
//  [self.captureSession stopRunning];
//  [[UIDevice currentDevice] setValue:[NSNumber numberWithInteger:UIInterfaceOrientationPortrait] forKey:@"orientation"];
//  [[IQKeyboardManager sharedManager] setEnable:false];
//}
//
//- (IBAction)onDimissClick:(id)sender {
//  [self.tfResult endEditing:true];
//}
//
//- (IBAction)onTakenAgainClick:(id)sender {
//  [self handleButtonTaken:false];
//}
//
//- (void) startCamera {
//  if (!self.captureSession.isRunning) {
//    [self.captureSession startRunning];
//  } else {
//    if (@available(iOS 11.0, *)) {
//      AVCapturePhotoSettings *settings = [AVCapturePhotoSettings photoSettingsWithFormat:@{AVVideoCodecKey: AVVideoCodecTypeJPEG}];
//      [self.stillImageOutput capturePhotoWithSettings:settings delegate:self];
//    }
//  }
//}
//
//- (void) handleButtonTaken: (Boolean) isHiden {
//  if (!isHiden) {
//    [self startCamera];
//  }
//  [self.btTaken setHidden:isHiden];
//  [self.btTakenAgain setHidden:!isHiden];
//  [self.btAgree setHidden:!isHiden];
//  [self.tfResult setHidden:!isHiden];
//  [self.btInputPlate setHidden:isHiden];
//}
//
//- (IBAction)onTakenPhoto:(id)sender {
//  [self startCamera];
//}
//
//- (void)captureOutput:(AVCapturePhotoOutput *)output didFinishProcessingPhoto:(AVCapturePhoto *)photo error:(NSError *)error API_AVAILABLE(ios(11.0)){
//  [self handleButtonTaken:true];
//    if (@available(iOS 11.0, *)) {
//        NSData *imageData = photo.fileDataRepresentation;
//      if (imageData) {
//        UIImage *imageLand = [UIImage imageWithData:imageData];
//        UIImage * image = [UIImage imageWithCGImage:imageLand.CGImage
//                                              scale:imageLand.scale
//                                        orientation:UIImageOrientationUp];
//        //Save image to folder sx411
//        NSString *stringPath = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)objectAtIndex:0]stringByAppendingPathComponent:@"SX411"];
//        NSError *error = nil;
//        if (![[NSFileManager defaultManager] fileExistsAtPath:stringPath])
//          [[NSFileManager defaultManager] createDirectoryAtPath:stringPath withIntermediateDirectories:NO attributes:nil error:&error];
//        NSString *fileName = [stringPath stringByAppendingFormat:@"/image.jpg"];
//        NSData *data = UIImageJPEGRepresentation(image, 1.0);
//        [data writeToFile:fileName atomically:YES];
//        //End save file
//        
//        [self.captureSession stopRunning];
//        [self readLincensePlate:fileName];
//      }
//    } else {
//        // Fallback on earlier versions
//    }
//}
//
//- (void)viewDidLoad {
//  [super viewDidLoad];
//  // Do any additional setup after loading the view, typically from a nib.
////  [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(initCamera) object:nil];
//  [self performSelector:@selector(initCamera) withObject:nil afterDelay:1.0];
//  self.emitter = [ModuleWithEmitter new];
//  self.emitter = [ModuleWithEmitter allocWithZone: nil];
//  [[UIDevice currentDevice] setValue:[NSNumber numberWithInteger:UIInterfaceOrientationLandscapeRight] forKey:@"orientation"];
//  [[IQKeyboardManager sharedManager] setEnable:true];
//  [self setCorner:self.btAgree];
//  [self setCorner:self.btTakenAgain];
//    [self setCorner:self.btInputPlate];
//    [self setCorner:self.btTaken];
//}
//
//- (void) setCorner: (UIButton*) button {
//    [[button layer] setCornerRadius:4];
//    [[button layer] setMasksToBounds:true];
//}
//
//- (void) initCamera {
//  self.captureSession = [AVCaptureSession new];
//  self.captureSession.sessionPreset = AVCaptureSessionPresetPhoto;
//  [self createCamera];
//  NSString *filePath = [[NSBundle mainBundle] pathForResource:@"cascade_square" ofType:@"xml"];
//  std::string *casadeQuadFile = new std::string([filePath UTF8String]);
//  
//  filePath = [[NSBundle mainBundle] pathForResource:@"chars" ofType:@"xml"];
//  std::string *charsFile = new std::string([filePath UTF8String]);
//  
//  filePath = [[NSBundle mainBundle] pathForResource:@"chars" ofType:@"xml"];
//  std::string *digitFile = new std::string([filePath UTF8String]);
//  
//  GetTGMTbike()->Init(*casadeQuadFile, *charsFile, *digitFile);
//  
////  filePath = [[NSBundle mainBundle] pathForResource:@"plate" ofType:@"jpg"];
//}
//
//- (void) readLincensePlate: (NSString*) image {
//  
////  std::string *imgFile = new std::string([filePath UTF8String]);
////
////  BikePlateCpp tmp = GetTGMTbike()->ReadPlate(*imgFile);
////  std::string txt = tmp.text;
//  
//  
//  std::string *imgFile1 = new std::string([image UTF8String]);
//  BikePlateCpp tmp1 = GetTGMTbike()->ReadPlate(*imgFile1);
//  std::string txt1 = tmp1.text;
//  [self.tfResult setText:[NSString stringWithFormat:@"%s",txt1.c_str()]];
//}
//
//- (void)setupLivePreview {
//    
//    self.videoPreviewLayer = [AVCaptureVideoPreviewLayer layerWithSession:self.captureSession];
//    if (self.videoPreviewLayer) {
//        
//        self.videoPreviewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill;
//        self.videoPreviewLayer.connection.videoOrientation = AVCaptureVideoOrientationLandscapeRight;
//        [self.previewView.layer addSublayer:self.videoPreviewLayer];
//        
//        //Step12
//        dispatch_queue_t globalQueue =  dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0);
//        dispatch_async(globalQueue, ^{
//            [self.captureSession startRunning];
//            //Step 13
//            dispatch_async(dispatch_get_main_queue(), ^{
//                self.videoPreviewLayer.frame = self.previewView.bounds;
//            });
//        });
//        
//    }
//}
//
//- (void) createCamera {
//  AVCaptureDevice *backCamera = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
//  if (!backCamera) {
//    NSLog(@"Unable to access back camera!");
//    return;
//  }
//  NSError *error;
//  AVCaptureDeviceInput *input = [AVCaptureDeviceInput deviceInputWithDevice:backCamera
//                                                                      error:&error];
//  if (!error) {
//    //Step 9
//    self.stillImageOutput = [AVCapturePhotoOutput new];
//    if ([self.captureSession canAddInput:input] && [self.captureSession canAddOutput:self.stillImageOutput]) {
//      
//      [self.captureSession addInput:input];
//      [self.captureSession addOutput:self.stillImageOutput];
//      [self setupLivePreview];
//    }
//  }
//  else {
//    NSLog(@"Error Unable to initialize back camera: %@", error.localizedDescription);
//  }
//  
//}
//
//
//- (void)didReceiveMemoryWarning {
//  [super didReceiveMemoryWarning];
//  // Dispose of any resources that can be recreated.
//}
//
//- (IBAction)onOkClick:(id)sender {
//  [self.emitter sendData:self.tfResult.text];
//  [self dismissViewControllerAnimated:NO completion:nil];
//}
//
//- (IBAction)onCloseClick:(id)sender {
//  [self dismissViewControllerAnimated:true completion:nil];
//}
//
//@end
//
//
