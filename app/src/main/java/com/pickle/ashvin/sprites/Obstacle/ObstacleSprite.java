package com.pickle.ashvin.sprites.Obstacle;

import android.graphics.Path;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.sprites.Sprite;

/**
 * Created by cmpic_000 on 12/31/2016.
 */

public abstract class ObstacleSprite extends Sprite {

    public ObstacleSprite(GameView view, Game game) {
        super(view, game);
    }

    abstract void init(int x, int y);

    @Override
    public void move() {
        super.move();
        region.set(x+width/2-10, y, (x+width/2)+10, y+height);
    }
}