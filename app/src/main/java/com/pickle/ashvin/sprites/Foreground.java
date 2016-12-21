/**
 * Manages the bitmap at the front
 * 
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin.sprites;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.R;
import com.pickle.ashvin.Util;

import android.graphics.Bitmap;

public class Foreground extends Background {
    /**
     * Height of the ground relative to the height of the bitmap
     */
    public static final float GROUND_HEIGHT = (1f * /*45*/ 35) / 720;

    /**
     * Static bitmap to reduce memory usage.
     */
    public static Bitmap globalBitmap;
    
//    public Foreground(GameView view, Game game) {
//        super(view, game);
//        if(globalBitmap == null){
//            globalBitmap = Util.getDownScaledBitmapAlpha8(game, R.drawable.fg01);
//        }
//        this.bitmap = globalBitmap;
//    }

    public Foreground(GameView view, Game game, int level) {
        super(view, game, level);
        int resId = R.drawable.fg00;

        switch(level) {
            case 0:
                resId = R.drawable.fg00;
                break;
            case 1:
                resId = R.drawable.fg01;
                break;
        }

        globalBitmap = Util.getDownScaledBitmapAlpha8(game, resId);
        this.bitmap = globalBitmap;
    }
}
