/**
 * A surfboard
 *
 * Drawn by dancercal
 *
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin.sprites.Obstacle;

import android.graphics.Bitmap;
import android.graphics.Path;
import android.graphics.Region;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.R;
import com.pickle.ashvin.Util;

public class SurfBoard extends ObstacleSprite {

    /**
     * Static bitmap to reduce memory usage.
     */
    public static Bitmap globalBitmap;

    public SurfBoard(GameView view, Game game) {
        super(view, game);
        globalBitmap = Util.getScaledBitmapAlpha8(game, R.drawable.surfboard);
        this.bitmap = globalBitmap;
        this.width = this.bitmap.getWidth();
        this.height = this.bitmap.getHeight();
        this.region = new Region(x+width/2-10, y, (x+width/2)+10, y+height);
    }

    /**
     * Sets the position
     * @param x
     * @param y
     */
    public void init(int x, int y){
        this.x = x;
        this.y = y;
    }
}
