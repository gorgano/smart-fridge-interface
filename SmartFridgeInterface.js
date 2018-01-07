

function SmartFridgeInterface() {
    let fridge;

    this.init = (fridgeImplementation) => {
        fridge = fridgeImplementation;
    };

    /**
      * This method is called every time an item is removed from the fridge
      * @param string itemUUID
      * void handleItemRemoved( String itemUUID );
     */
    this.handleItemRemoved = (itemUUID) => fridge.handleItemRemoved(itemUUID);

    /**
     * This method is called every time an item is stored in the fridge
     *
     * @param itemType
     * @param itemUUID
     * @param name
     * @param fillFactor
     * void handleItemAdded( long itemType, String itemUUID, String name, Double fillFactor );
     */
    this.handleItemAdded = (itemType, itemUUID, name, fillFactor) => fridge.handleItemAdded(itemType, itemUUID, name, fillFactor);

    /**
        * Returns a list of items based on their fill factor. This method is used by the
        * fridge to display items that are running low and need to be replenished.
        *
        * i.e.
        *      getItems( 0.5 ) - will return any items that are 50% or less full, including
        *                        items that are depleted. Unless all available containers are
        *                        empty, this method should only consider the non-empty containers
        *                        when calculating the overall fillFactor for a given item.
        *
        * @return an array of arrays containing [ itemType, fillFactor ]
        * 
        * Object[] getItems( Double fillFactor );
        */
    this.getItems = (fillFactor) => fridge.getItems(fillFactor);

    /**
     * Returns the fill factor for a given item type to be displayed to the owner. Unless all available containers are
     * empty, this method should only consider the non-empty containers
     * when calculating the overall fillFactor for a given item.
     *
     * @param itemType
     *
     * @return a double representing the average fill factor for the item type
     * Double getFillFactor( long itemType ); 
     */
    this.getFillFactor = (itemType) => fridge.getFillFactor(itemType);

    /**
     * Stop tracking a given item. This method is used by the fridge to signal that its
     * owner will no longer stock this item and thus should not be returned from #getItems()
     *
     * @param itemType
     * 
     * void forgetItem( long itemType );
     */
    this.forgetItem = (itemType) => fridge.forgetItem(itemType);
};

const smartFridgeFactory = (fridgeImplementation) => {
    const frigeInterface = new SmartFridgeInterface();
    frigeInterface.init(fridgeImplementation);
    return frigeInterface;
}

module.exports = smartFridgeFactory;