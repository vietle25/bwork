#pragma once
#include "stdafx.h"
#include "TGMTblob.h"
#include <atomic>
#include "TGMTsvm.h"

#define GetTGMTbike TGMTbike::GetInstance
#define CHAR_WIDTH 18
#define CHAR_HEIGHT 42
#define PLATE_WIDTH 200 * 2
#define PLATE_HEIGHT 160 * 2
#define MAX_ANGLE 40
#define ANGLE 2
#define PADDING 3
#define VERSION "IPSSbike_2.9.2_"
#define IMAGE_HOST "http://viscomsolution.com/tracking/dosavefile.php"
#define TRACKING_HOST "http://viscomsolution.com/tracking/tracking_ipssbike.php"
#define INI_APPNAME_SECTION "IPSSbike"
#define TRACKING_USERNAME "tracking"
#define TRACKING_PASSWORD "_viScomtR@ckInG69#"

#if defined(LIB_CS) || defined(LIB_CPP)
	#if defined(_DEBUG)
	#else
		#define TRACKING
	#endif
#else
	#if defined(_DEBUG)
		#define NOKEY
	#else
		#define NOKEY
	#endif
#endif

#if defined(WIN32) || defined(WIN64)
#define WRITE_IPSS_LOG(...) if(m_enableLog)WriteLog(__VA_ARGS__)
#else
#define WRITE_IPSS_LOG(...)
#endif

class BikePlateCpp
{
public:
    std::string text;
    std::string error;
    bool isValid;
    long elapsedMilisecond;
    cv::Mat image;
	bool hasPlate;
	std::string color;

	BikePlateCpp();
    ~BikePlateCpp();	
};

class TGMTbike
{
	bool m_warpPointValid = false;
	bool m_licenseFromFile = false;

	std::string m_outputFolder ="";

	static TGMTbike* m_instance;
	cv::CascadeClassifier m_cascade;
	cv::Point2f mWarpPoints[4];

	
	bool m_saveImageCantDetected = false;
	bool m_isLicensed = true;
	bool m_saveOutputImage = false;
	bool m_enableLog = true;
	bool m_cropResult = false;
	bool m_saveInputImage = false;
	bool m_enableDebug = false;

	std::string mFilePath = "";
	std::string m_fileOutputName = "";
	std::string mFileNameUserSet = "";
	std::string m_udid = "";
	std::string m_space1 = "-";
	std::string m_space2 = " ";

	int m_thresh = 91;

	TGMTsvm m_svmChar;
	TGMTsvm m_svmDigit;
#ifndef NOKEY	
	void CheckLicense();
#endif

#if defined(TRACKING)
	void SendFailedImage(cv::Mat mat);
#endif

	cv::Mat CorrectAngle(cv::Mat matPlate);
	cv::Mat ConvertToBinary(cv::Mat matPlate);
	cv::Mat TrimPlate(cv::Mat matPlateBinary);

	bool IsValidText(std::string text);
public:
    static TGMTbike* GetInstance();

	TGMTbike();
	~TGMTbike();

	void SetUdid(std::string udid);
	
	BikePlateCpp ReadPlate(std::string filePath);
	BikePlateCpp ReadPlate(cv::Mat matInput);
	
	void Init();
	void Init(std::string cascadeFile, std::string recogCharFile, std::string recogDigitFile);

	//detect and draw plate on input image, return plate cropped
	cv::Mat DetectPlate(cv::Mat& matInput);
	std::vector<TGMTblob::Blob> GetBlobsFromPlate(cv::Mat& matPlate);

#ifndef ANDROID
	/*Read warp points from Registry*/
	bool SetWarpPoints(cv::Point2f points[4]);
	bool SetWarpPoints(cv::Point2f tl, cv::Point2f tr, cv::Point2f br, cv::Point2f bl);
	bool SetWarpPoints(int x0, int y0, int x1, int y1, int x2, int y2, int x3, int y3);
	bool IsWarpEnable(){ return m_warpPointValid; };	
#endif

#if (defined(WIN32) || defined(WIN64))&& defined(TRACKING)
	void SendUserInfo();
#endif

	void SetOutputFolder(std::string folder);
	std::string GetOutputFolder(){ return m_outputFolder; };

	void SetOutputFileName(std::string fileName);
	std::string GetOutputFileName(){ return mFileNameUserSet; };

	//save image can not detected in to folder
	void SaveImageCantDetected(bool save);
	
	bool IsLicense() {return m_isLicensed;}

	void SetCropResult(bool crop) { m_cropResult = crop; };
	bool IsCroppingResult() { return m_cropResult; };

	void SetSaveInputImage(bool save) { m_saveInputImage = save; };
	bool IsSavingInputImage() { return m_saveInputImage; };

	void SetWriteLog(bool write) { m_enableLog = write; };
	bool IsWrittingLog() { return m_enableLog; };	

private:
	
	std::string RecognizeChar(std::vector<TGMTblob::Blob> blobs, cv::Size plateSize);
	std::string RecognizeChar(TGMTblob::Blob blob);
	std::string RecognizeDigit(TGMTblob::Blob blob);
	cv::Mat Blob2MatChar(TGMTblob::Blob blob);

	void WriteResourceToDisk();
};
