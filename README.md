# smart-fridge-interface

## Assumptions

* The intent of the `fillFactor`, especially around adding items is unclear to me.  
I have several different ideas on what it could mean when adding items, however for this I will assume it is the **maximum number of items of that type**.

  I would be happy to talk further and explore other meanings.  `getItems` talks about containers, which makes me wonder if itemUUID is more of a containerId, with its `fillFactor` being the count within the container.  
  
  Another possibility is the `fillFactor` represents the percentage of the total for that itemType the new item represents.

* The intent of the `name` parameter on the `handleAddItem` function is a little unclear as well.  I would assume it is either:
  * The name of the *item*; this seems unlikely as I don't see why an item would have a name. viz why would an 'apple' `type` have a special name?
  * The name of the *type*; this feels more likely, but out of place here. If the type is already defined by the `itemType`, wouldn't there be a lookup table that stored information around the type?  I would assume there would be a `createType` implementation to store type information in a particular way.

  In the end, the `name` is never referenced in any of the calls, so I have **not stored the value**.  Since it appears un-used, I would normally recommend removing it.  If the second method above *is* the intent, I would suggest moving the item type creation to a central area.

* I assume that language is not important.  I will be using **Node**.  *I understand you are moving in that direction*  Node has no interface concept, being prototype.  However, many of the benefits of an interface may be obtained by using dependency injection and inversion of control.  Though this is admittedly closer in behavior to an abstract class.

## Implementation
### Classic Polymorphic Behavior
My solution uses dependency injection to allow different storage methods.  The interface further allows inversion of control, using the injected methods to perform the real work.  

Going forward, if a more classic 'extension' is desired for a child class, one would simply use a known storage method (InMemoryFridge) and expose functions from SmartFridgeInterface.

For instance, if a Samsung Smart Fridge was desired:

```javascript
function SamsungSmartFridge() {
  this.init = () => {
    const memoryFridge = InMemoryFridgeFactory();
    const smartFridge = SmartFridgeInterfaceFactory(memoryFridge);
    this = smartFridge;
  }
  ...
}
```

### A note on Storage and Computational Complexity
I used memory storage for simplicity.  To that end, I also store some things multiple time.  For insance the itemUUID is stored in both `itemsByUUID` as well as in `itemsByType`.  This is done to increase seak time in the following instances:
* `handleItemRemoved`, uses `itemsByUUID` to lookup the type of the time.  This alows for a faster path to the type and recalculating the metrics.  
* `handleItemAdd`, performs all calculations, as this is expected to be called less than `getItems`.
* `forgetItem`, uses `itemsByType` to quickly identify all the items of a given type.  This prevents the application from needing to loop over *every* item in the fridge.

## Observations

### UUID?
I’m curious about the choice of a string variable type to represent a UUID.  Java has a UUID type and I was curious if there was a reason behind using a string instead.

### getItems return type
The return from getItems is an array of objects (array of arrays).  Why was that used rather than returning an array of a specific class.  For instance:
```java
class returnItem {
  String itemType;
  Double fillFactor
}

returnTime[] getItems( Double fillFactor );
```
The above seems more explicit on what is being returned and doesn’t force the caller to understand the return shape by ordinal.

## Usage
```bash
> npm install
> npm start
```

## Initial Challenge
```java
/**
 * Interface for the Smart Fridge Manager
 *
 */
public interface SmartFridgeManager {

    /**
     * Event Handlers - These are methods invoked by the SmartFridge hardware to send notification of items that have
     * been added and/or removed from the fridge. Every time an item is removed by the fridge user, it will emit a
     * handleItemRemoved() event to this class, every time a new item is added or a previously removed item is re-inserted,
     * the fridge will emit a handleItemAdded() event with its updated fillFactor.
     */

    /**
     * This method is called every time an item is removed from the fridge
     *
     * @param itemUUID
     */
    void handleItemRemoved( String itemUUID );

    /**
     * This method is called every time an item is stored in the fridge
     *
     * @param itemType
     * @param itemUUID
     * @param name
     * @param fillFactor
     */
    void handleItemAdded( long itemType, String itemUUID, String name, Double fillFactor );

    /**
     * These are the query methods for the fridge to be able to display alerts and create shopping
     * lists for the fridge user.
     */ 

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
     */
    Object[] getItems( Double fillFactor );

    /**
     * Returns the fill factor for a given item type to be displayed to the owner. Unless all available containers are
     * empty, this method should only consider the non-empty containers
     * when calculating the overall fillFactor for a given item.
     *
     * @param itemType
     *
     * @return a double representing the average fill factor for the item type
     */
    Double getFillFactor( long itemType );

    /**
     * Stop tracking a given item. This method is used by the fridge to signal that its
     * owner will no longer stock this item and thus should not be returned from #getItems()
     *
     * @param itemType
     */
    void forgetItem( long itemType );
    
}
```
