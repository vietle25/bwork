package com.boot.timekeeping.company.alarm;

import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import java.util.ArrayList;

/**
 * Created by emnity on 6/24/17.
 * Set alarms for scheduled alarms after system reboot.
 */

public class ANBootReceiver extends BroadcastReceiver {
    private static final String TAG = ANBootReceiver.class.getSimpleName();

    @Override
    public void onReceive(Context context, Intent intent) {
        ANHelper helper = new ANHelper((Application) context.getApplicationContext());
        ArrayList<Bundle> bundles = helper.getScheduledAlarms();
        for(Bundle bundle: bundles){
            helper.scheduleAlarm(bundle);
        }
    }
}
