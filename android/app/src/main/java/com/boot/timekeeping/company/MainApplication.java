package com.boot.timekeeping.company;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Color;
import android.os.Build;

import androidx.multidex.MultiDex;

import com.boot.timekeeping.company.alarm.ANPackage;
import com.crashlytics.android.Crashlytics;
import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.liang.RNAlarmPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.liang.RNAlarmPackage;
import com.showlocationservicesdialogbox.LocationServicesDialogBoxPackage;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import io.fabric.sdk.android.Fabric;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.storage.RNFirebaseStoragePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;

public class MainApplication extends Application implements ReactApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            @SuppressWarnings("UnnecessaryLocalVariable")
            List<ReactPackage> packages = new PackageList(this).getPackages();
            // Packages that cannot be autolinked yet can be added manually here:
            packages.add(new LocationServicesDialogBoxPackage());
            packages.add(new RNAlarmPackage());
            packages.add(new ANPackage());
            packages.add(new RNFirebaseMessagingPackage());
            packages.add(new RNFirebaseNotificationsPackage());
            packages.add(new RNFirebaseDatabasePackage());
            packages.add(new RNFirebaseStoragePackage());
            packages.add(new RNFirebaseAuthPackage());
            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    FacebookSdk.setApplicationId("3663504140338883");
    FacebookSdk.sdkInitialize(this);
    super.onCreate();
    Fabric.with(this, new Crashlytics());
    SoLoader.init(this, /* native exopackage */ false);
    AppEventsLogger.activateApp(this);
    initializeFlipper(this);

    String id = "bbChannelId";					// The id of the channel.
    CharSequence name = "Thông báo chấm công";			// The user-visible name of the channel.
    String description = "Thông báo trước giờ check in và check out";	// The user-visible description of the channel.

    if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel mChannel = new NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH);

      // Configure the notification channel.
      mChannel.setDescription(description);

      mChannel.enableLights(true);
      // Sets the notification light color for notifications posted to this
      // channel, if the device supports this feature.
      mChannel.setLightColor(Color.TRANSPARENT);

      mChannel.enableVibration(true);
      mChannel.setVibrationPattern(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400});

      NotificationManager mNotificationManager = (NotificationManager) this.getSystemService(Context.NOTIFICATION_SERVICE);
      mNotificationManager.createNotificationChannel(mChannel);
    }
  }

  @Override
  protected void attachBaseContext(Context base) {
    super.attachBaseContext(base);
    MultiDex.install(this);
  }

  /**
    * Loads Flipper in React Native templates.
    *
    * @param context
    */
  private static void initializeFlipper(Context context) {
      if (BuildConfig.DEBUG) {
          try {
          /*
            We use reflection here to pick up the class that initializes Flipper,
            since Flipper library is not available in release mode
            */
          Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
          aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
          } catch (ClassNotFoundException e) {
              e.printStackTrace();
          } catch (NoSuchMethodException e) {
              e.printStackTrace();
          } catch (IllegalAccessException e) {
              e.printStackTrace();
          } catch (InvocationTargetException e) {
              e.printStackTrace();
          }
      }
  }
}
