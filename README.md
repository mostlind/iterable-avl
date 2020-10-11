# Iterable AVL Tree

A typed, iterable AVL Tree implementation

## Usage

### Import

```typescript
import { AVLTree } from "iterable-avl";
```

### Constructor

```typescript
type AVLTree<Value, KeyType>

interface Person {
  id: string,
  name: string
}

// Using key function
// Will infer the type of the tree based on the key function
function identifyPerson({id}: Person): string {
  return id
}

AVLTree(identifyPerson) // AVLTree<Person, string>


// Using comparable types
// Uses the value to identify nodes
AVLTree([1, 2, 3, 4]) // AVLTree<number, number>

// Using an input iterator and key function
const alice: Person = {id: "123", name: "alice"}
AVLTree([alice], identifyPerson) // AVLTree<Person, string>
```

### Instance Methods

```typescript
const tree = AVLTree(identifyPerson);

// Insert
tree.insert(alice);

// Retrieve
tree.get("123"); // {id: "123", name: "alice"}
tree.get("456"); // undefined

// Remove
tree.remove("123");
```

### Iteration

```typescript
const bob: Person = { id: "456", name: "bob" };
tree.insert(alice);
tree.insert(bob);

for (let person of tree) {
  console.log(person.name);
}
// > alice
// > bob

// reversed
for (let person of tree.reversed) {
  console.log(person.name);
}
// > bob
// > alice
```
