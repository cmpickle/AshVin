/**
 * An abstract class that manages obstacle sprites.
 *
 * This class makes sure that an obstacle sprite's region moves with it and can appropriately
 * collide with the player
 *
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin.sprites.Obstacle;
import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.sprites.Sprite;

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
