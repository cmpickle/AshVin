/**
 * The abstract spriteclass for power-ups
 * 
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin.sprites;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;

public abstract class PowerUp extends Sprite {
    public PowerUp(GameView view, Game game) {
        super(view, game);
        init();
    }
    
    /**
     * Sets this sprite above the visible screen.
     * At x = 4/5 of the screen.
     * Uses the speed of the GameView to let the power-up fall slowly down.
     */
    private void init(){
        this.x = view.getWidth() * 4/5;
        this.y = 0 - this.height;
        this.speedX = - view.getSpeedX();
        this.speedY = (int) (view.getSpeedX() * (Math.random() + 0.5));
    }
}
