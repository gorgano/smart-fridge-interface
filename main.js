const uuidv4 = require('uuid');
const InMemoryFridgeFactory = require('./InMemoryFridge');
const SmartFridgeInterfaceFactory = require('./SmartFridgeInterface');

const memoryFridge = InMemoryFridgeFactory();
const smartFridge = SmartFridgeInterfaceFactory(memoryFridge);

// Create known items
// This would be handled by some event emitter, 
//   but this will serve as an example
// Create 6 item type 1, with a max quantity of 10
// Keep reference of first item and second items for later
const uItem1 = uuidv4();
const uItem2 = uuidv4();
smartFridge.handleItemAdded(1, uItem1, "Any Name", 10);
smartFridge.handleItemAdded(1, uItem2, "Any Name", 10);
smartFridge.handleItemAdded(1, uuidv4(), "Any Name", 10);
smartFridge.handleItemAdded(1, uuidv4(), "Any Name", 10);
smartFridge.handleItemAdded(1, uuidv4(), "Any Name", 10);
smartFridge.handleItemAdded(1, uuidv4(), "Any Name", 10);

// Add another item types to see data.  
smartFridge.handleItemAdded(2, uuidv4(), "Any Name", 10);
smartFridge.handleItemAdded(2, uuidv4(), "Any Name", 10);
smartFridge.handleItemAdded(3, uuidv4(), "Any Name", 10);

// Get Fill Factor
const fillFactor = smartFridge.getFillFactor(1);
console.log(`Got fillFactor ${fillFactor}, expected 0.6`);

// Get Items (not return item type 1)
const lowItems = smartFridge.getItems(0.5);
console.log('Got the following items with 0.5; do NOT expect type 1:');
console.log(lowItems);

// Remove Item (again handled by emitter)
smartFridge.handleItemRemoved(uItem1);
console.log("Removed item 1...");
const fillFactorAfterRemove = smartFridge.getFillFactor(1);
console.log(`Got fillFactor for type 1 is now ${fillFactorAfterRemove}, expected 0.5`);

// Get Items (DOES return item type 1)
const lowItemsAfterRemove = smartFridge.getItems(0.5);
console.log('Got the following items with 0.5; EXPECT type 1:');
console.log(lowItemsAfterRemove);

// Remove type
smartFridge.forgetItem(1);
console.log("Forgot item type 1");

const fillFactorAfterForget = smartFridge.getFillFactor(1);
console.log(`Got fillFactor for type 1 is now ${fillFactorAfterForget}, expected 0`);

const lowItemsAfterForget = smartFridge.getItems(0.5);
console.log('Got the following items with 0.5; do NOT expect type 1:');
console.log(lowItemsAfterForget);
