/**
 * The dialog shown when the game is over
 * 
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.app.Dialog;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.pickle.ashvin.db.Score;
import com.pickle.ashvin.db.Score_Table;
import com.raizlabs.android.dbflow.sql.language.SQLite;

public class GameOverDialog extends Dialog {

    public static final int REVIVE_PRICE = 5;
    
    /** The game that invokes this dialog */
    private Game game;
    private View view;
    
    private TextView tvCurrentScoreVal;
    private TextView tvBestScoreVal;

    public GameOverDialog(Game game, View view) {
        super(game);
        this.game = game;
        this.view = view;
        this.setContentView(R.layout.gameover);
        this.setCancelable(false);

        tvCurrentScoreVal = (TextView) findViewById(R.id.tv_current_score_value);
        tvBestScoreVal = (TextView) findViewById(R.id.tv_best_score_value);
    }
    
    public void init(){
        Button okButton = (Button) findViewById(R.id.b_ok);
        okButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveCoins();
                if(game.numberOfRevive <= 1){
                    game.accomplishmentBox.saveLocal();
                }
                
                dismiss();
                game.finish();
                view.invalidate();
            }
        });

        Button reviveButton = (Button) findViewById(R.id.b_revive);
        reviveButton.setText(game.getResources().getString(R.string.revive_button)
                            + " " + REVIVE_PRICE * game.numberOfRevive + " "
                            + game.getResources().getString(R.string.coins));
        reviveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
                game.coins -= REVIVE_PRICE * game.numberOfRevive;
                saveCoins();
                game.view.revive();
            }
        });
        if(game.coins < REVIVE_PRICE * game.numberOfRevive){
            reviveButton.setClickable(false);
        }else{
            reviveButton.setClickable(true);
        }
        
        manageScore();
        manageMedals();
    }
    
    private void manageScore(){
        game.accomplishmentBox.saveLocal();
        tvCurrentScoreVal.setText("" + game.accomplishmentBox.points);
        tvBestScoreVal.setText("" + game.accomplishmentBox.score.getValue());
    }
    
    private void manageMedals(){
        Score medaille_save = SQLite.select().from(Score.class).where(Score_Table.name.eq("medals")).querySingle();
        int medaille = medaille_save.getValue();
      
        if(game.accomplishmentBox.achievement_gold){
            ((ImageView)findViewById(R.id.medaille)).setImageBitmap(Util.getScaledBitmapAlpha8(game, R.drawable.gold));
            if(medaille < 3){
                SQLite.update(Score.class).set(Score_Table.value.eq(3)).where(Score_Table.name.eq("medals")).execute();
            }
        }else if(game.accomplishmentBox.achievement_silver){
            ((ImageView)findViewById(R.id.medaille)).setImageBitmap(Util.getScaledBitmapAlpha8(game, R.drawable.silver));
            if(medaille < 2){
                SQLite.update(Score.class).set(Score_Table.value.eq(2)).where(Score_Table.name.eq("medals")).execute();
            }
        }else if(game.accomplishmentBox.achievement_bronze){
            ((ImageView)findViewById(R.id.medaille)).setImageBitmap(Util.getScaledBitmapAlpha8(game, R.drawable.bronce));
            if(medaille < 1){
                SQLite.update(Score.class).set(Score_Table.value.eq(1)).where(Score_Table.name.eq("medals")).execute();
            }
        }else{
            (findViewById(R.id.medaille)).setVisibility(View.INVISIBLE);
        }
    }
    
    private void saveCoins(){
        SQLite.update(Score.class).set(Score_Table.value.eq(game.coins)).where(Score_Table.name.eq("coins")).execute();
    }
    
}
