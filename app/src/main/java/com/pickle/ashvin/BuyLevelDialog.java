/**
 * The dialog that appears to buy a level
 *
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.app.Dialog;
import android.content.Context;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.pickle.ashvin.db.Score;
import com.pickle.ashvin.db.Score_Table;
import com.raizlabs.android.dbflow.sql.language.SQLite;

public class BuyLevelDialog extends Dialog {
    public static final int PURCHASE_PRICE = 50;

    /** The game that invokes this dialog */
    private SelectLevelActivity selectLevelActivity;
    private View view;

    private TextView tvLevelCost;

    public BuyLevelDialog(Context selectLevelActivity, View view) {
        super(selectLevelActivity);
        this.selectLevelActivity = (SelectLevelActivity) selectLevelActivity;
        this.view = view;
        this.setContentView(R.layout.buy_level);
        this.setCancelable(false);

        tvLevelCost = (TextView) findViewById(R.id.tv_level_cost);
    }

    public void init(final int level){
        Button cancelButton = (Button) findViewById(R.id.b_cancel);
        cancelButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
                view.invalidate();
            }
        });

        Button buyButton = (Button) findViewById(R.id.b_buy);
        buyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
                selectLevelActivity.coins -= PURCHASE_PRICE;
                manageLevels(level);
                saveCoins();
            }
        });
        if(selectLevelActivity.coins < PURCHASE_PRICE){
            buyButton.setClickable(false);
        }else{
            buyButton.setClickable(true);
        }

    }

    private void manageLevels(int level){
        int levelCode = 1;
        levelCode = levelCode << level;
        Score levels = SQLite.select().from(Score.class).where(Score_Table.name.eq("levels")).querySingle();
        SQLite.update(Score.class).set(Score_Table.value.eq(levels.getValue() + levelCode)).execute();
        MainActivity.levelsUnlocked = levels.getValue();
    }

    private void saveCoins(){
        SQLite.update(Score.class).set(Score_Table.value.eq(selectLevelActivity.coins)).where(Score_Table.name.eq("coins")).execute();
    }
}
