package com.pickle.ashvin.db;

import com.raizlabs.android.dbflow.annotation.Column;
import com.raizlabs.android.dbflow.annotation.PrimaryKey;
import com.raizlabs.android.dbflow.annotation.Table;
import com.raizlabs.android.dbflow.annotation.Unique;

/**
 * @author Cameron Pickle
 *         Copyright (C) Cameron Pickle (cmpickle) on 3/20/2017.
 */

@Table(database = FartingDatabase.class)
public class Achievements {

    @PrimaryKey(autoincrement = true)
    long id;

    @Column
    @Unique
    String type;

    @Column
    int value;

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }
}
