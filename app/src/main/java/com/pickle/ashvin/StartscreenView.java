/**
 * Splashscreen with buttons.
 * 
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.view.MotionEvent;
import android.view.View;

public class StartscreenView extends View{
    
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

    public StartscreenView(MainActivity context) {
        super(context);
        this.mainActivity = context;
        if(splash == null) {
            splash = Util.getBitmapAlpha8(mainActivity, R.drawable.splash);
        }
        if(play == null) {
            play = Util.getBitmapAlpha8(mainActivity, R.drawable.play_button);
        }
        srcPlay = new Rect(0, 0, play.getWidth(), play.getHeight());
        if(speaker == null) {
            speaker = Util.getBitmapAlpha8(mainActivity, R.drawable.speaker);
        }
        if(info == null) {
            info = Util.getBitmapAlpha8(mainActivity, R.drawable.about);
        }
        srcInfo = new Rect(0, 0, info.getWidth(), info.getHeight());
        if(socket == null) {
            socket = Util.getBitmapAlpha8(mainActivity, R.drawable.socket);
        }
        
        setWillNotDraw(false);
        setSpeaker(true);
        setSocket(0);
    }
    
    public void setSpeaker(boolean on) {
        if(on) {
            srcSpeaker = new Rect(0, 0, speaker.getWidth(), speaker.getHeight()/2);
        } else {
            srcSpeaker = new Rect(0, speaker.getHeight()/2, speaker.getWidth(), speaker.getHeight());
        }
    }
    
    public void setSocket(int level) {
        srcSocket = new Rect(0, level*socket.getHeight()/4, socket.getWidth(), (level+1)*socket.getHeight()/4);
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        canvas.drawBitmap(splash, srcSplash, dstSplash, null);
        canvas.drawBitmap(play, srcPlay, dstPlay, null);
        canvas.drawBitmap(speaker, srcSpeaker, dstSpeaker, null);
        canvas.drawBitmap(info, srcInfo, dstInfo, null);
        canvas.drawBitmap(socket, srcSocket, dstSocket, null);
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
        dstSpeaker = new Rect(    (int)(getWidth()*REGION_SPEAKER[0]),
                                (int)(getHeight()*REGION_SPEAKER[1]),
                                (int)(getWidth()*REGION_SPEAKER[2]),
                                (int)(getHeight()*REGION_SPEAKER[3]));
        dstInfo = new Rect(    (int)(getWidth()*REGION_INFO[0]),
                            (int)(getHeight()*REGION_INFO[1]),
                            (int)(getWidth()*REGION_INFO[2]),
                            (int)(getHeight()*REGION_INFO[3]));
        dstSocket = new Rect(    (int)(getWidth()*REGION_SOCKET[0]),
                                (int)(getHeight()*REGION_SOCKET[1]),
                                (int)(getWidth()*REGION_SOCKET[2]),
                                (int)(getHeight()*REGION_SOCKET[3]));
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        performClick();
        if(event.getAction() == MotionEvent.ACTION_DOWN) {
            if(    (event.getX() > REGION_PLAY[0] * getWidth())
                    && (event.getX() < REGION_PLAY[2] * getWidth())
                    && (event.getY() > REGION_PLAY[1] * getHeight())
                    && (event.getY() < REGION_PLAY[3] * getHeight()) ) {
//                mainActivity.startActivity(new Intent("com.pickle.ashvin.Game"));
                mainActivity.startActivity(new Intent("com.pickle.ashvin.SelectGame"));
            } else if(    (event.getX() > REGION_SPEAKER[0] * getWidth())
                    && (event.getX() < REGION_SPEAKER[2] * getWidth())
                    && (event.getY() > REGION_SPEAKER[1] * getHeight())
                    && (event.getY() < REGION_SPEAKER[3] * getHeight()) ) {
                mainActivity.muteToggle();
            } else if(    (event.getX() > REGION_INFO[0] * getWidth())
                    && (event.getX() < REGION_INFO[2] * getWidth())
                    && (event.getY() > REGION_INFO[1] * getHeight())
                    && (event.getY() < REGION_INFO[3] * getHeight()) ) {
                mainActivity.startActivity(new Intent("com.pickle.ashvin.About"));
            }
        }
        return true;
    }

}
