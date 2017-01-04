package com.pickle.ashvin.sprites.Obstacle;

import android.graphics.Bitmap;
import android.graphics.Path;
import android.graphics.Region;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.R;
import com.pickle.ashvin.Util;

/**
 * Created by cmpic_000 on 1/2/2017.
 */

public class Sun extends ObstacleSprite {

    /**
     * Static bitmap to reduce memory usage.
     */
    public static Bitmap globalBitmap;

    public Sun(GameView view, Game game) {
        super(view, game);
        globalBitmap = Util.getScaledBitmapAlpha8(game, R.drawable.sunbeam);
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
