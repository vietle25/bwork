package com.boot.timekeeping.company.alarm;

import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ANDismissReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        new ANHelper((Application) context.getApplicationContext())
                .removeFiredNotification(
                        String.valueOf(intent.getExtras().getInt("notification_id")));
        new ANHelper((Application) context.getApplicationContext())
                .cancelNotification(
                        String.valueOf(intent.getExtras().getInt("notification_id")));
    }
}
