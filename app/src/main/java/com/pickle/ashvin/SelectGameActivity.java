package com.pickle.ashvin;

import android.os.Bundle;
import android.support.v4.app.FragmentActivity;

/**
 * Created by cmpic_000 on 12/17/2016.
 */

public class SelectGameActivity extends FragmentActivity {

    private SelectGameView view;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        view = new SelectGameView(this);
        setContentView(view);
    }

    @Override
    protected void onResume() {
        super.onResume();
    }
}
