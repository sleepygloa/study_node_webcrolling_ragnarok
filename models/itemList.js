module.exports = function(sequelize, DataTypes){
    const itemList = sequelize.define('ItemList', {
        index:{
            type:DataTypes.INTEGER(20),
            allowNull : false
        },
        itemImg:{
            type:DataTypes.STRING(200),
            allowNull : true,
        },
        link:{
            type:DataTypes.STRING(200),
            allowNull : true,
        },
        name:{
            type:DataTypes.STRING(100),
            allowNull : true,
        },
        category:{
            type:DataTypes.STRING(50),
            allowNull : true,
        },
        attack:{
            type:DataTypes.INTEGER(50),
            allowNull : true,
        },
        equipJob:{
            type:DataTypes.STRING(50),
            allowNull : true,
        }
    })
    return itemList;
};