/**
 * Select Game Activity
 *
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.os.Bundle;
import android.support.v4.app.FragmentActivity;

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
