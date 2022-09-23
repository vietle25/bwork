package com.boot.timekeeping.company;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.facebook.common.util.UriUtil;
import com.liang.RNAlarmConstants;

import static android.content.Context.NOTIFICATION_SERVICE;

/**
 * Created by GBLiang on 9/22/2017.
 */

public class RNALarmReceiver extends BroadcastReceiver {

    static MediaPlayer player = new MediaPlayer();


    @Override
    public void onReceive(Context context, Intent intent) {

        if (intent.getExtras().getBoolean("stopNotification")) {
            if (player.isPlaying()) {
                player.stop();
                player.reset();
            }
        } else {
            String id = "bbChannelId";                    // The id of the channel.
            CharSequence name = "Thông báo chấm công";            // The user-visible name of the channel.
            String description = "Thông báo trước giờ check in và check out";    // The user-visible description of the channel.
            Uri uri;
            String title = intent.getStringExtra(RNAlarmConstants.REACT_NATIVE_ALARM_TITLE);
            String musicUri = intent.getStringExtra(RNAlarmConstants.REACT_NATIVE_ALARM_MUSIC_URI);
            if (musicUri == null || "".equals(musicUri)) {
                uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            } else {
                uri = UriUtil.parseUriOrNull(musicUri);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

                NotificationChannel mChannel = new NotificationChannel(id, name,
                        NotificationManager.IMPORTANCE_HIGH);

                // Configure the notification channel.
                mChannel.setDescription(description);

                mChannel.enableLights(true);
                // Sets the notification light color for notifications posted to this
                // channel, if the device supports this feature.
                mChannel.setLightColor(Color.TRANSPARENT);

                mChannel.enableVibration(true);
                mChannel.setVibrationPattern(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400});
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build();
                // Uri soundUri = Uri.parse(
                //         "android.resource://" +
                //                 context.getPackageName() +
                //                 "/" +
                //                 R.raw.constellation);
                Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
                if (alarmSound == null) {
                    alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                    if (alarmSound == null) {
                        alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                    }
                }
                mChannel.setSound(alarmSound, audioAttributes);
                NotificationManager mNotificationManager =
                        (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                mNotificationManager.createNotificationChannel(mChannel);
                NotificationCompat.Builder mBuilder =
                        new NotificationCompat.Builder(context, id)
                                .setSmallIcon(R.mipmap.ic_notification)
                                .setContentTitle(title)
                                .setContentText(title)
                                .setDefaults(NotificationCompat.DEFAULT_ALL)
                                .setPriority(NotificationCompat.PRIORITY_MAX)
                                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                                .setCategory(NotificationCompat.CATEGORY_ALARM)
                                .setAutoCancel(true)
                                .setSound(alarmSound)
                                .setVibrate(null);
                mNotificationManager.notify(1, mBuilder.build());

            } else {
                Intent intentActivity = new Intent(context, MainActivity.class);
                intentActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

                PendingIntent pi = PendingIntent.getActivity(context, 100, intentActivity, PendingIntent.FLAG_CANCEL_CURRENT);
                Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
                if (alarmSound == null) {
                    alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                    if (alarmSound == null) {
                        alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                    }
                }
                Notification.Builder notificationBuilder = new Notification.Builder(context)
                        .setSmallIcon(android.R.drawable.sym_def_app_icon)
                        .setVibrate(new long[]{0, 200})
                        .setSound(alarmSound)
                        .setContentTitle(title);

//                notificationBuilder.build().flags |= Notification.FLAG_AUTO_CANCEL;
//                Notification notification = notificationBuilder.build();
//                notificationBuilder.setDefaults(Notification.DEFAULT_ALL);
                notificationBuilder.setFullScreenIntent(pi, true);
                notificationBuilder.setDeleteIntent(createOnDismissedIntent(context));
                notificationBuilder.setAutoCancel(true);
                NotificationManager notificationManager = (NotificationManager) context.getSystemService(NOTIFICATION_SERVICE);
                notificationManager.notify(0, notificationBuilder.build());
            }
        }
    }

    private PendingIntent createOnDismissedIntent(Context context) {
        Intent intent = new Intent(RNAlarmConstants.REACT_NATIVE_ALARM);
        intent.putExtra("stopNotification", true);
        PendingIntent pendingIntent =
                PendingIntent.getBroadcast(context, 1, intent, 0);
        if (player != null && player.isPlaying()) {
            player.stop();
            player.reset();
        }
        return pendingIntent;
    }

}
