function InMemoryFridge() {
    /**
     * Contains types of items by typeId, their count, max quanity and fillFactor (capacity)
     * Used for quick lookup on fillFactor
     *  eg: "1": {
     *       "type": 1,
     *       "count": 2,
     *       "fillFactor": .2, // 20% capacity
     *       "maxQuantity": 10
     *   }
     */
    const itemTypeMetrics = {};

    /**
     * Contains items by UUID for quick lookup when retrieving by ID
     * eg: "uuid": "itemType"
     */
    const itemsByUUID = {};

    /**
     * Contains a list of itemUUIDs by type for quick lookup while deleting
     * eg: "1":{"UUID":1}
     */
    const itemsByType = {};

    /**
     * Creates instance of an item type.  Calculates fillFactor based on input
     * @param {int} itemTypeId 
     * @param {int} count 
     * @param {float} maxQuantity 
     */
    createItemTypeMetric = (itemTypeId, count, maxQuantity) => {
        let fillFactor = 0;
        if (maxQuantity > 0) fillFactor = count / maxQuantity;

        const newItemType = {
            type: itemTypeId,
            count: count,
            fillFactor: fillFactor,
            maxQuantity: maxQuantity
        };

        return newItemType;
    };

    /**
       * This method is called every time an item is removed from the fridge
       * @param string itemUUID
       * 
       * void handleItemRemoved( String itemUUID );
      */
    this.handleItemRemoved = (itemUUID) => {
        if (!itemsByUUID[itemUUID]) return; // Item does not exist, no work to perform

        // Get items type
        const itemType = itemsByUUID[itemUUID];

        // Remove from item stores
        delete itemsByUUID[itemUUID];
        delete itemsByType[itemType][itemUUID];

        // Recalculate metrics
        const { count, maxQuantity } = itemTypeMetrics[itemType];
        const newCount = count - 1;
        const newItemType = createItemTypeMetric(itemType, newCount, maxQuantity);

        itemTypeMetrics[itemType] = newItemType;
    };

    /**
     * This method is called every time an item is stored in the fridge
     *
     * @param int itemType Item type
     * @param string itemUUID Unique ID of the tiem
     * @param string name Name of the item (NOT USED)
     * @param float fillFactor Always pass in the max allowable quanity of the item
     * void handleItemAdded( long itemType, String itemUUID, String name, Double fillFactor );
     */
    this.handleItemAdded = (itemType, itemUUID, name, fillFactor) => {
        let currentCount = 0;
        if (itemTypeMetrics[itemType]) currentCount = itemTypeMetrics[itemType].count;

        const newCount = currentCount + 1;
        const newItemType = createItemTypeMetric(itemType, newCount, fillFactor);

        // Update metrics
        itemTypeMetrics[itemType] = newItemType;
        // Update item by ID
        itemsByUUID[itemUUID] = itemType;
        // Update item by Type
        if (!itemsByType[itemType]) itemsByType[itemType] = {};
        itemsByType[itemType][itemUUID] = 1;
    };

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
    this.getItems = (fillFactor) => {
        // const matchingItems = itemTypeMetrics.reduce((match, metric) => {
        //     if (metric.fillFactor <= fillFactor) match.push([metric.type, metric.fillFactor]);
        //     return match;
        // }, []);
        const matchingItems = Object.keys(itemTypeMetrics).reduce((lMatch, metricKey) => {
            const metric = itemTypeMetrics[metricKey];
            if (metric.fillFactor <= fillFactor) lMatch.push([metric.type, metric.fillFactor]);
            return lMatch;
        }, []);

        return matchingItems;
    };

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
    this.getFillFactor = (itemType) => {
        if (!itemTypeMetrics[itemType]) return 0;
        return itemTypeMetrics[itemType].fillFactor;
    };

    /**
     * Stop tracking a given item. This method is used by the fridge to signal that its
     * owner will no longer stock this item and thus should not be returned from #getItems()
     *
     * @param itemType
     * 
     * void forgetItem( long itemType );
     */
    this.forgetItem = (itemType) => {
        // Remove reference by UUID
        Object.keys(itemsByType[itemType]).map(uuid => delete itemsByUUID[uuid]);
        // Remove type
        delete itemsByType[itemType];
        // Remove metrics
        delete itemTypeMetrics[itemType];
    };
};

const InMemoryFridgeFactory = () => new InMemoryFridge();

module.exports = InMemoryFridgeFactory;