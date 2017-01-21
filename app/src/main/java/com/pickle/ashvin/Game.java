/**
 * The Game
 * 
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.content.SharedPreferences;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.SoundPool;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.v4.app.FragmentActivity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.Toast;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.InterstitialAd;

public class Game extends FragmentActivity {

    public static final String KEY_EXTRA = "com.pickle.ashvin.KEY_LEVEL";
    public static final String coin_save = "coin_save";
    public static final String coin_key = "coin_key";
    public static final boolean PAID_VERSION = false;
    public static final boolean DEV_MODE = false;

    public static SoundPool soundPool = new SoundPool(5, AudioManager.STREAM_MUSIC, 0);
    public static MediaPlayer musicPlayer = null;

    private static int gameOverCounter = 0;
    public static final int GAMES_PER_AD = 3;
    private InterstitialAd interstitial;
    private int level = 0;

    public boolean musicShouldPlay = false;

    /** Time interval (ms) you have to press the backbutton twice in to exit */
    private static final long DOUBLE_BACK_TIME = 1000;
    private long backPressed;
    
    /** To do UI things from different threads */
    public MyHandler handler;

    AccomplishmentBox accomplishmentBox;
    GameView view;
    GameOverDialog gameOverDialog;

    int coins;
    public int numberOfRevive = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Bundle b = getIntent().getExtras();
        level = b.getInt(KEY_EXTRA);

        accomplishmentBox = new AccomplishmentBox();
        view = new GameView(this, level);
        gameOverDialog = new GameOverDialog(this, view);
        handler = new MyHandler(this);
        setContentView(view);
        initMusicPlayer();
        loadCoins();
        if(gameOverCounter % GAMES_PER_AD == 0 && !PAID_VERSION) {
            setupAd();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        SoundPool soundPool = null;
        MediaPlayer musicPlayer = null;
        gameOverDialog = null;
        handler = null;
        accomplishmentBox = null;

        unbindDrawables(view);
        view.cleanView();
    }

//    @Override
//    protected void onStop() {
//        super.onStop();
//
//        unbindDrawables(view);
//        view.cleanView();
//    }

    private void unbindDrawables(View view) {
        if(view.getBackground() != null) {
            view.getBackground().setCallback(null);
        }
        if(view instanceof ViewGroup && !(view instanceof AdapterView)) {
            for(int i = 0; i<((ViewGroup) view).getChildCount(); i++) {
                unbindDrawables(((ViewGroup) view).getChildAt(i));

                ((ViewGroup) view).removeAllViews();            }
        }
    }

    public void initMusicPlayer(){
        if(musicPlayer == null){
            // to avoid unnecessary reinitialisation
            musicPlayer = MediaPlayer.create(this, R.raw.songfart);
            musicPlayer.setLooping(true);
            musicPlayer.setVolume(MainActivity.volume, MainActivity.volume);
        }
        musicPlayer.seekTo(0);    // Reset song to position 0
    }
    
    private void loadCoins(){
        SharedPreferences saves = this.getSharedPreferences(coin_save, 0);
        this.coins = saves.getInt(coin_key, 0);
    }

    /**
     * Pauses the view and the music
     */
    @Override
    protected void onPause() {
        view.pause();
        if(musicPlayer.isPlaying()){
            musicPlayer.pause();
        }
        super.onPause();
    }

    /**
     * Resumes the view (but waits the view waits for a tap)
     * and starts the music if it should be running.
     * Also checks whether the Google Play Services are available.
     */
    @Override
    protected void onResume() {
        view.drawOnce();
        if(musicShouldPlay){
            musicPlayer.start();
        }
        super.onResume();
    }
    
    /**
     * Prevent accidental exits by requiring a double press.
     */
    @Override
    public void onBackPressed() {
        if(System.currentTimeMillis() - backPressed < DOUBLE_BACK_TIME){
            super.onBackPressed();
        }else{
            backPressed = System.currentTimeMillis();
            Toast.makeText(this, getResources().getString(R.string.on_back_press), Toast.LENGTH_LONG).show();
        }
    }

    /**
     * Sends the handler the command to show the GameOverDialog.
     * Because it needs an UI thread.
     */
    public void gameOver() {
        if (gameOverCounter % GAMES_PER_AD == 0) {
            handler.sendMessage(Message.obtain(handler, MyHandler.SHOW_AD));
        } else {
            handler.sendMessage(Message.obtain(handler, MyHandler.GAME_OVER_DIALOG));
        }
    }
    
    public void increaseCoin(){
        this.coins++;
        if(Game.DEV_MODE)
            this.coins+=100;
        if(coins >= 50 && !accomplishmentBox.achievement_50_coins){
            accomplishmentBox.achievement_50_coins = true;
            handler.sendMessage(Message.obtain(handler,1,R.string.toast_achievement_50_coins, MyHandler.SHOW_BEANS));
        }
    }

    /**
     * What should happen, when an obstacle is passed?
     */
    public void increasePoints(){
        accomplishmentBox.points++;

        AccomplishmentBox records = AccomplishmentBox.getLocal(this);
        
        this.view.getPlayer().upgradeBitmap(accomplishmentBox.points);
        
        if(accomplishmentBox.points >= AccomplishmentBox.BRONZE_POINTS){
            if(!records.achievement_bronze){
                accomplishmentBox.achievement_bronze = true;
                handler.sendMessage(Message.obtain(handler, MyHandler.SHOW_BEANS, R.string.toast_achievement_bronze, MyHandler.SHOW_BEANS));
            }
            
            if(accomplishmentBox.points >= AccomplishmentBox.SILVER_POINTS){
                if(!records.achievement_silver){
                    accomplishmentBox.achievement_silver = true;
                    handler.sendMessage(Message.obtain(handler, MyHandler.SHOW_BEANS, R.string.toast_achievement_silver, MyHandler.SHOW_BEANS));
                }
                
                if(accomplishmentBox.points >= AccomplishmentBox.GOLD_POINTS){
                    if(!records.achievement_gold){
                        accomplishmentBox.achievement_gold = true;
                        handler.sendMessage(Message.obtain(handler, MyHandler.SHOW_BEANS, R.string.toast_achievement_gold, MyHandler.SHOW_BEANS));
                    }
                }
            }
        }
    }
    
    /**
     * Shows the GameOverDialog when a message with code 0 is received.
     */
    static class MyHandler extends Handler{
        public static final int GAME_OVER_DIALOG = 0;
        public static final int SHOW_BEANS = 1;
        public static final int SHOW_AD = 2;
        
        private Game game;
        
        public MyHandler(Game game){
            this.game = game;
        }
        
        @Override
        public void handleMessage(Message msg) {
            switch(msg.what){
                case GAME_OVER_DIALOG:
                    showGameOverDialog();
                    break;
                case SHOW_BEANS:
                    Toast.makeText(game, msg.arg1, Toast.LENGTH_SHORT).show();
                    break;
                case SHOW_AD:
                    showAd();
                    break;
            }
        }

        private void showAd() {
            if(game.interstitial == null) {
                showGameOverDialog();
            } else {
                if(game.interstitial.isLoaded()) {
                    game.interstitial.show();
                } else {
                    showGameOverDialog();
                }
            }
        }
        
        private void showGameOverDialog() {
            ++Game.gameOverCounter;
            game.gameOverDialog.init();
            game.gameOverDialog.show();
        }
    }

    private void setupAd() {
        interstitial = new InterstitialAd(this);
        interstitial.setAdUnitId(getResources().getString(R.string.ad_unit_id));
        AdRequest.Builder adRequestBuilder = new AdRequest.Builder();
        //Cameron's Device ID
        adRequestBuilder.addTestDevice("AB86373C2F012DC6CFCA112F9E25C0C7");
        //Nathan's Device ID
        adRequestBuilder.addTestDevice("D7125D1B856F1556CBD9932A7F86FC5C");
        AdRequest adRequest = adRequestBuilder.build();
        interstitial.loadAd(adRequest);
        interstitial.setAdListener(new MyAdListener());
    }

    private class MyAdListener extends AdListener {
        public void onAdClosed() {
            handler.sendMessage(Message.obtain(handler, MyHandler.GAME_OVER_DIALOG));
        }
    }
}
