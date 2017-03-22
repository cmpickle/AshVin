package com.pickle.ashvin.db;

import com.raizlabs.android.dbflow.annotation.Column;
import com.raizlabs.android.dbflow.annotation.PrimaryKey;
import com.raizlabs.android.dbflow.annotation.Table;
import com.raizlabs.android.dbflow.structure.BaseModel;

/**
 * @author Cameron Pickle
 *         Copyright (C) Cameron Pickle (cmpickle) on 3/21/2017.
 */

@Table(database = FartingDatabase.class)
public class Achievements extends BaseModel {

    @PrimaryKey(autoincrement = true)
    long id;

    @Column
    boolean bronze = false;

    @Column
    boolean silver = false;

    @Column
    boolean gold = false;

    @Column
    boolean coins_50 = false;

    @Column
    boolean superfart = false;

    public boolean getBronze() {
        return bronze;
    }

    public void setBronze(boolean bronze) {
        this.bronze = bronze;
    }

    public boolean getSilver() {
        return silver;
    }

    public void setSilver(boolean silver) {
        this.silver = silver;
    }

    public boolean getGold() {
        return gold;
    }

    public void setGold(boolean gold) {
        this.gold = gold;
    }

    public boolean getCoins50() {
        return coins_50;
    }

    public void setCoins_50(boolean coins_50) {
        this.coins_50 = coins_50;
    }

    public boolean getSuperfart() {
        return superfart;
    }

    public void setSuperfart(boolean superfart) {
        this.superfart = superfart;
    }
}
