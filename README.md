# smart-fridge-interface

## Assumptions

* The intent of the `fillFactor`, especially around adding items is unclear to me.  
I have several different ideas on what it could mean when adding items, however for this I will assume it is the **maximum number of items of that type**.

  I would be happy to talk further and explore other meanings.  `getItems` talks about containers, which makes me wonder if itemUUID is more of a containerId, with its `fillFactor` being the count within the container.  Further, that `fillFactor` is a double suggests partial amounts.

* I also assume that language is not important.  I will be using **Node**.  *I understand you are moving in that direction* and it is the language I have been using most heavily in the past year.  Node has no interface concept, being prototype.  However, many of the benefits of an interface may be obtained by using dependency injection and inversion of control.  Though this is admittedly closer in behavior to an abstract class.

  If you need me to re-write this in C# or Java, please let me know.

## Observations

### UUID?
I’m curious about the choice of a string variable type to represent a UUID.  Java has a UUID type and I was currious if there was a reason behind using a string instead.

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

## Inital Challange
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