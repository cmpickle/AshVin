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
    private static Bitmap play2 = null;
    private static Bitmap speaker = null;
    private static Bitmap info = null;
    private static Bitmap socket = null;

    // Button regions: left, top, right, bottom
    private final static float[] REGION_PLAY = {169/720.0f, 515/1280f, 553/720.0f, 699/1280.0f};
    private final static float[] REGION_PLAY2 = {169/720.0f, 715/1280f, 553/720.0f, 899/1280.0f};
    private final static float[] REGION_INFO = {585/720.0f, 1141/1280f, 700/720.0f, 1256/1280.0f};
    private final static float[] REGION_SPEAKER = {25/720.0f, 1140/1280f, 140/720.0f, 1255/1280.0f};
    private final static float[] REGION_SOCKET = {233/720.0f, 1149/1280f, 487/720.0f, 1248/1280.0f};

    private Rect dstSplash;
    private Rect srcSplash;
    private Rect dstPlay;
    private Rect dstPlay2;
    private Rect srcPlay;
    private Rect srcPlay2;
    private Rect dstSpeaker;
    private Rect srcSpeaker;
    private Rect dstInfo;
    private Rect srcInfo;
    private Rect dstSocket;
    private Rect srcSocket;

    private SelectGameActivity selectActivity;

    public SelectGameView(SelectGameActivity context) {
        super(context);
        this.selectActivity = context;
        if(splash == null) {
            splash = Util.getBitmapAlpha8(selectActivity, R.drawable.splash);
        }
        if(play == null) {
            play = Util.getBitmapAlpha8(selectActivity, R.drawable.play_button);
        }
        if(play2 == null) {
            play2 = Util.getBitmapAlpha8(selectActivity, R.drawable.play_button);
        }

        setWillNotDraw(false);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        canvas.drawBitmap(splash, srcSplash, dstSplash, null);
        canvas.drawBitmap(play, srcPlay, dstPlay, null);
        canvas.drawBitmap(play2, srcPlay2, dstPlay2, null);
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
        dstPlay2 = new Rect(    (int)(getWidth()*REGION_PLAY2[0]),
                (int)(getHeight()*REGION_PLAY2[1]),
                (int)(getWidth()*REGION_PLAY2[2]),
                (int)(getHeight()*REGION_PLAY2[3]));
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        performClick();
        if(event.getAction() == MotionEvent.ACTION_DOWN)
        {
            if((event.getX() > REGION_PLAY[0] * getWidth()) && (event.getX() < REGION_PLAY[2] * getWidth()) && (event.getY() > REGION_PLAY[1] * getHeight()) && (event.getY() < REGION_PLAY[3] * getHeight()))
            {
                Intent intent = new Intent("com.pickle.ashvin.Game");
                intent.putExtra(Game.KEY_EXTRA, 0);
                selectActivity.startActivity(intent);
            }
            if((event.getX() > REGION_PLAY2[0] * getWidth()) && (event.getX() < REGION_PLAY2[2] * getWidth()) && (event.getY() > REGION_PLAY2[1] * getHeight()) && (event.getY() < REGION_PLAY2[3] * getHeight()))
            {
                Intent intent = new Intent("com.pickle.ashvin.Game");
                intent.putExtra(Game.KEY_EXTRA, 1);
                selectActivity.startActivity(intent);
            }
        }
        return true;
    }
}
