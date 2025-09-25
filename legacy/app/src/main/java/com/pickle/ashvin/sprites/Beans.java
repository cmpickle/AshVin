/**
 * A can of beans
 *
 * Beans, beans the magical fruit the more you eat the more you toot!
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
import android.graphics.Region;

public class Beans extends PowerUp {
    
    /**
     * Static bitmap to reduce memory usage.
     */
    public static Bitmap globalBitmap;
    
    public static final int POINTS_TO_BEANS = 42;

    public Beans(GameView view, Game game) {
        super(view, game);
        if(globalBitmap == null){
            globalBitmap = Util.getScaledBitmapAlpha8(game, R.drawable.beans);
        }
        this.bitmap = globalBitmap;
        this.width = this.bitmap.getWidth();
        this.height = this.bitmap.getHeight();
        this.region = new Region(x, y, x+width, y+height);
    }

    /**
     * When eaten the player will turn into nyan cat.
     */
    @Override
    public void onCollision() {
        super.onCollision();
        view.changeToFartPickle();
    }

    @Override
    public void move() {
        super.move();
        this.region.set(x,y, x+bitmap.getWidth(), y+bitmap.getHeight());
    }
}
