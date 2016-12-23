/**
 * Main Activity / Splashscreen with buttons.
 * 
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.os.Bundle;
import android.content.SharedPreferences;
import android.support.v4.app.FragmentActivity;

public class MainActivity extends FragmentActivity {
    
    /** Name of the SharedPreference that saves the medals */
    public static final String medaille_save = "medaille_save";
    
    /** Key that saves the medal */
    public static final String medaille_key = "medaille_key";

    public static final String LEVELS_UNLOCKED = "levels_unlocked";
    public static final String LEVELS_KEY = "levels_key";
    public static int levelsUnlocked = 0;
    
    public static final float DEFAULT_VOLUME = 0.3f;
    
    /** Volume for sound and music */
    public static float volume = DEFAULT_VOLUME;
    
    private StartscreenView view;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        SharedPreferences levels = this.getSharedPreferences(LEVELS_UNLOCKED, 0);
        if(levels.contains(LEVELS_KEY)) {
            levelsUnlocked = levels.getInt(LEVELS_KEY, 0);
        } else {
            SharedPreferences.Editor editor = levels.edit();
            editor.putInt(LEVELS_KEY, levelsUnlocked);
        }

        view = new StartscreenView(this);
        setContentView(view);
        setSocket();
    }
    
    public void muteToggle() {
        if(volume != 0){
            volume = 0;
            view.setSpeaker(false);
        }else{
            volume = DEFAULT_VOLUME;
            view.setSpeaker(true);
        }
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
}
