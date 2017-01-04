/**
 * A knife
 *
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */
package com.pickle.ashvin.sprites.Obstacle;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.R;
import com.pickle.ashvin.Util;

import android.graphics.Bitmap;
import android.graphics.Path;
import android.graphics.Region;

public class Knife extends ObstacleSprite {

    /**
     * Static bitmap to reduce memory usage.
     */
    public static Bitmap globalBitmap;

    public Knife(GameView view, Game game) {
        super(view, game);
        globalBitmap = Util.getScaledBitmapAlpha8(game, R.drawable.knife);
        this.bitmap = globalBitmap;
        this.width = this.bitmap.getWidth();
        this.height = this.bitmap.getHeight();
        this.region = new Region(x+width/2-10, y, (x+width/2)+10, y+height);
//        Path path = new Path();
//        path.lineTo((float) 0, (float) 0);
//        path.lineTo((float) this.width, 0);
//        path.lineTo((float) this.width, (float) this.height);
//        path.arcTo(null, (float) 90, (float) 180);
//        this.region.setPath(path, new Region(x,y,x+width,y+height));
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