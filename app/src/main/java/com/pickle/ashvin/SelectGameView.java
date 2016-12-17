package com.pickle.ashvin;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.view.MotionEvent;
import android.view.View;

/**
 * Created by cmpickle on 12/16/16.
 */

public class SelectGameView extends View {

    private static Bitmap splash = null;
    private static Bitmap play = null;
    private static Bitmap speaker = null;
    private static Bitmap info = null;
    private static Bitmap socket = null;

    // Button regions: left, top, right, bottom
    private final static float[] REGION_PLAY = {169/720.0f, 515/1280f, 553/720.0f, 699/1280.0f};
    private final static float[] REGION_INFO = {585/720.0f, 1141/1280f, 700/720.0f, 1256/1280.0f};
    private final static float[] REGION_SPEAKER = {25/720.0f, 1140/1280f, 140/720.0f, 1255/1280.0f};
    private final static float[] REGION_SOCKET = {233/720.0f, 1149/1280f, 487/720.0f, 1248/1280.0f};

    private Rect dstSplash;
    private Rect srcSplash;
    private Rect dstPlay;
    private Rect srcPlay;
    private Rect dstSpeaker;
    private Rect srcSpeaker;
    private Rect dstInfo;
    private Rect srcInfo;
    private Rect dstSocket;
    private Rect srcSocket;

    private MainActivity mainActivity;

    public SelectGameView(MainActivity context) {
        super(context);
        this.mainActivity = context;
        if(splash == null) {
            splash = Util.getBitmapAlpha8(mainActivity, R.drawable.splash);
        }
        if(play == null) {
            play = Util.getBitmapAlpha8(mainActivity, R.drawable.play_button);
        }

        setWillNotDraw(false);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        canvas.drawBitmap(splash, srcSplash, dstSplash, null);
        canvas.drawBitmap(play, srcPlay, dstPlay, null);
    }

    @Override
    public boolean performClick() {
        return super.performClick();
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        dstSplash = new Rect(0, 0, getWidth(), getHeight());
        dstPlay = new Rect(    (int)(getWidth()*REGION_PLAY[0]),
                (int)(getHeight()*REGION_PLAY[1]),
                (int)(getWidth()*REGION_PLAY[2]),
                (int)(getHeight()*REGION_PLAY[3]));
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        performClick();
        if(event.getAction() == MotionEvent.ACTION_DOWN)
        {
            if((event.getX() > REGION_PLAY[0] * getWidth()) && (event.getX() < REGION_PLAY[2] * getWidth()) && (event.getY() > REGION_PLAY[1] * getHeight()) && (event.getY() < REGION_PLAY[3] * getHeight()))
            {
                mainActivity.startActivity(new Intent("com.pickle.ashvin.Game"));
            }
        }
        return true;
    }
}
