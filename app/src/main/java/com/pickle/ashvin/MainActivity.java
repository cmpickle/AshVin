/**
 * Main Activity / Splashscreen with buttons.
 * 
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.content.SharedPreferences;
import android.support.v4.app.FragmentActivity;
import com.facebook.stetho.*;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;

public class MainActivity extends FragmentActivity {
    
    /** Name of the SharedPreference that saves the medals */
    public static final String medaille_save = "medaille_save";
    /** Key that saves the medal */
    public static final String medaille_key = "medaille_key";

    /**Key that saves mute preference*/
    public static final String MUTE_PREFERENCE = "mute_preference";
    public static final String MUTE_KEY = "mute_key";
    public static final float DEFAULT_VOLUME = 0.3f;
    /** Volume for sound and music */
    public static float volume = DEFAULT_VOLUME;

    public static final String LEVELS_UNLOCKED = "levels_unlocked";
    public static final String LEVELS_KEY = "levels_key";
    public static int levelsUnlocked = 0;
    
    private StartscreenView view;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Stetho.initializeWithDefaults(this);

        SharedPreferences levels = this.getSharedPreferences(LEVELS_UNLOCKED, 0);
        if(levels.contains(LEVELS_KEY)) {
            levelsUnlocked = levels.getInt(LEVELS_KEY, 0);
        }

        view = new StartscreenView(this);

        SharedPreferences mute = this.getSharedPreferences(MUTE_PREFERENCE, 0);
        if(mute.getBoolean(MUTE_KEY, false)) {
            muteToggle();
        }
        setContentView(view);
        setSocket();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        setContentView(null);
        view = null;
    }
    
    public void muteToggle() {
        SharedPreferences mute = this.getSharedPreferences(MUTE_PREFERENCE, 0);
        SharedPreferences.Editor editor = mute.edit();

        if(volume != 0){
            volume = 0;
            view.setSpeaker(false);
            MuteAudio();
            editor.putBoolean(MUTE_KEY, true);
        }else{
            volume = DEFAULT_VOLUME;
            view.setSpeaker(true);
            UnMuteAudio();
            editor.putBoolean(MUTE_KEY, false);
        }
        editor.apply();

        view.invalidate();
    }
    
    /**
     * Fills the socket with the medals that have already been collected.
     */
    private void setSocket(){
        SharedPreferences saves = this.getSharedPreferences(medaille_save, 0);
        view.setSocket(saves.getInt(medaille_key, 0));
        view.invalidate();
    }

    /**
     * Updates the socket for the medals.
     */
    @Override
    protected void onResume() {
        super.onResume();
        setSocket();
    }

    public void MuteAudio(){
        AudioManager mAlramMAnager = (AudioManager) this.getSystemService(AUDIO_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            mAlramMAnager.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_MUTE, 0);
        } else {
            mAlramMAnager.setStreamMute(AudioManager.STREAM_MUSIC, true);
        }
    }

    public void UnMuteAudio(){
        AudioManager mAlramMAnager = (AudioManager) this.getSystemService(AUDIO_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            mAlramMAnager.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_UNMUTE,0);
        } else {
            mAlramMAnager.setStreamMute(AudioManager.STREAM_MUSIC, false);
        }
    }
}
