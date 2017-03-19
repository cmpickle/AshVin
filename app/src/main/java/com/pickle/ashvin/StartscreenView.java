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
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Toast;

public class StartscreenView extends View{

    private static Bitmap splash = null;
    private static Bitmap play = null;
    private static Bitmap speaker = null;
    private static Bitmap info = null;
    private static Bitmap socket = null;
    private static Bitmap coin = null;
    
    // Button regions: left, top, right, bottom
    private final static float[] REGION_PLAY = {169/720.0f, 515/1280f, 553/720.0f, 699/1280.0f};
    private final static float[] REGION_INFO = {585/720.0f, 1141/1280f, 700/720.0f, 1256/1280.0f};
    private final static float[] REGION_SPEAKER = {25/720.0f, 1140/1280f, 140/720.0f, 1255/1280.0f};
    private final static float[] REGION_SOCKET = {233/720.0f, 1149/1280f, 487/720.0f, 1248/1280.0f};
    private final static float[] REGION_COIN = {670/720.0f, 0/1280f, 720/720.0f, 50/1280.0f};
    
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
    private Rect srcCoin;
    private Rect dstCoin;

    private MainActivity mainActivity;

    public StartscreenView(MainActivity context) {
        super(context);
        this.mainActivity = context;
        if(splash == null) {
            splash = Util.getBitmapAlpha8(mainActivity, R.drawable.splash);
        }
        srcSplash = new Rect(0, 0, splash.getWidth(), splash.getHeight());
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
        if(coin == null && Game.DEV_MODE) {
            coin = Util.getBitmapAlpha8(mainActivity, R.drawable.coin);
        }
        if(Game.DEV_MODE)
            srcCoin = new Rect(0,0, coin.getWidth()/12, coin.getHeight());
        
        setWillNotDraw(false);
        setSpeaker(true);
        setSocket(0);
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        splash = null;
        play = null;
        speaker = null;
        info = null;
        socket = null;
        coin = null;
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
        if(Game.DEV_MODE)
            canvas.drawBitmap(coin, srcCoin, dstCoin, null);
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
        if(Game.DEV_MODE) {
            dstCoin = new Rect( (int)(getWidth()*REGION_COIN[0]),
                                (int)(getHeight()*REGION_COIN[1]),
                                (int)(getWidth()*REGION_COIN[2]),
                                (int)(getHeight()*REGION_COIN[3]));
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        performClick();
        if(event.getAction() == MotionEvent.ACTION_DOWN) {
            if(    (event.getX() > REGION_PLAY[0] * getWidth())
                    && (event.getX() < REGION_PLAY[2] * getWidth())
                    && (event.getY() > REGION_PLAY[1] * getHeight())
                    && (event.getY() < REGION_PLAY[3] * getHeight()) ) {
                mainActivity.startActivity(new Intent("com.pickle.ashvin.SelectLevelActivity"));
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
            } else if(    Game.DEV_MODE && (event.getX() > REGION_COIN[0] * getWidth())
                    && (event.getX() < REGION_COIN[2] * getWidth())
                    && (event.getY() > REGION_COIN[1] * getHeight())
                    && (event.getY() < REGION_COIN[3] * getHeight()) ) {
                SharedPreferences coin_save = mainActivity.getSharedPreferences(Game.COIN_SAVE, 0);
                SharedPreferences.Editor editor = coin_save.edit();
                editor.putInt(Game.COIN_KEY, 50 + coin_save.getInt(Game.COIN_KEY, 0));
                editor.commit();
                Toast.makeText(mainActivity, "coins added", Toast.LENGTH_SHORT).show();
            }
        }
        return true;
    }
}
