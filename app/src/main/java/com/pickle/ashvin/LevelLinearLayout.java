/**
 * Custom Linear Layout
 *
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.content.Context;
import android.graphics.Canvas;
import android.util.AttributeSet;
import android.widget.LinearLayout;

public class LevelLinearLayout extends LinearLayout {
    private float scale = LevelPagerAdapter.BIG_SCALE;

    public LevelLinearLayout(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public LevelLinearLayout(Context context) {
        super(context);
    }

    public void setScaleBoth(float scale) {
        this.scale = scale;
        this.invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        int w = this.getWidth();
        int h = this.getHeight();
        canvas.scale(scale, scale, w/2, h/2);
        //canvas.translate(30f, 0f);

        super.onDraw(canvas);
    }
}
