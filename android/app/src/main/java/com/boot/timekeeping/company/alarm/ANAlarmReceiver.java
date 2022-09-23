package com.boot.timekeeping.company.alarm;

import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Created by emnity on 6/24/17.
 */

public class ANAlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        new ANHelper((Application) context.getApplicationContext())
                .sendNotification(intent.getExtras());
    }
}
