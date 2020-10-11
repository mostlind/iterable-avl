interface Node<T> {
  val: T;
  left?: AVLNode<T>;
  right?: AVLNode<T>;
  height: number;
}

type AVLNode<T> = Node<T> | undefined;

function createNode<T>(
  val: T,
  left?: AVLNode<T>,
  right?: AVLNode<T>
): AVLNode<T> {
  return {
    val,
    left,
    right,
    height: 1 + Math.max(height(left), height(right)),
  };
}

function* traverse<T>(node: AVLNode<T>): Generator<T> {
  if (typeof node === "undefined") {
    return;
  }

  if (typeof node.left !== "undefined") {
    yield* traverse(node.left);
  }

  yield node.val;

  if (typeof node.right !== "undefined") {
    yield* traverse(node.right);
  }
}

function* traverseReversed<T>(node: AVLNode<T>): Generator<T> {
  if (typeof node === "undefined") {
    return;
  }

  if (typeof node.right !== "undefined") {
    yield* traverseReversed(node.right);
  }

  yield node.val;

  if (typeof node.left !== "undefined") {
    yield* traverseReversed(node.left);
  }
}

function insert<T>(
  node: AVLNode<T> | undefined,
  val: T,
  key: Key<T>
): AVLNode<T> {
  if (typeof node === "undefined") {
    return createNode(val);
  }

  const valKey = key(val);
  const nodeKey = key(node.val);

  if (valKey < nodeKey) {
    node.left = insert(node.left, val, key);
  }

  if (valKey > nodeKey) {
    node.right = insert(node.right, val, key);
  }

  node.height = 1 + Math.max(height(node.left), height(node.right));

  return balanceAfterInsert(node, val, key);
}

function balanceFactor<T>(node: AVLNode<T> | undefined) {
  if (typeof node === "undefined") {
    return 0;
  }
  return height(node.left) - height(node.right);
}

function balanceAfterInsert<T>(node: AVLNode<T>, inserted: T, key: Key<T>) {
  if (typeof node === "undefined") {
    return node;
  }
  const bf = balanceFactor(node);

  if (bf > 1) {
    if (key(inserted) < key(node!.left!.val)) {
      return rightRotate(node);
    } else {
      node.left = leftRotate(node?.left);
      return rightRotate(node);
    }
  }

  if (bf < -1) {
    if (key(inserted) > key(node!.right!.val)) {
      return leftRotate(node);
    } else {
      node.right = rightRotate(node.right);
      return leftRotate(node);
    }
  }

  return node;
}

function height<T>(node: AVLNode<T>): number {
  if (typeof node === "undefined") {
    return 0;
  }

  return node.height;
}

function leftRotate<T>(node: AVLNode<T>) {
  const right = node!.right;
  const rightLeft = right!.left;
  right!.left = node;
  node!.right = rightLeft;

  node!.height = 1 + Math.max(height(node!.left), height(node!.right));
  right!.height = 1 + Math.max(height(right!.left), height(right!.right));

  return right;
}

function rightRotate<T>(node: AVLNode<T>) {
  const left = node!.left;
  const leftRight = left!.right;
  left!.right = node;
  node!.left = leftRight;

  node!.height = 1 + Math.max(height(node!.left), height(node!.right));
  left!.height = 1 + Math.max(height(left!.left), height(left!.right));

  return left;
}

function remove<T, U>(node: AVLNode<T>, val: U, key: Key<T>) {
  const nodeKey: any = node === undefined ? undefined : key(node.val);
  if (typeof node === "undefined") {
    return node;
  } else if (val < nodeKey) {
    node.left = remove(node.left, val, key);
  } else if (val > nodeKey) {
    node.right = remove(node.right, val, key);
  } else {
    if (typeof node.left === "undefined") {
      return node.right;
    } else if (typeof node.right === "undefined") {
      return node.left;
    }
    const temp = minNodeValue(node.right);
    node.val = temp!.val;
    node.right = remove(node.right, temp!.val, key);
  }
  if (typeof node === "undefined") {
    return node;
  }

  node.height = 1 + Math.max(height(node.left), height(node.right));

  const bf = balanceFactor(node);

  if (bf > 1) {
    if (balanceFactor(node.left) >= 0) {
      return rightRotate(node);
    } else {
      node.left = leftRotate(node.left);
      return rightRotate(node);
    }
  }
  if (bf < -1) {
    if (balanceFactor(node.right) <= 0) {
      return leftRotate(node);
    } else {
      node.right = rightRotate(node.right);
      return leftRotate(node);
    }
  }

  return node;
}

function get<T, U>(
  node: AVLNode<T>,
  keyFn: (t: T) => U,
  key: U
): T | undefined {
  if (typeof node === "undefined") {
    return undefined;
  }

  const nodeKey = keyFn(node.val);

  if (key === nodeKey) {
    return node.val;
  }

  if (key > nodeKey) {
    return get(node.right, keyFn, key);
  }

  if (key < nodeKey) {
    return get(node.left, keyFn, key);
  }

  return;
}

function minNodeValue<T>(node: AVLNode<T>): AVLNode<T> {
  if (typeof node === "undefined" || typeof node.left === "undefined") {
    return node;
  }
  return minNodeValue(node.left);
}

interface AVLTree<T, U> {
  insert: (t: T) => void;
  remove: (t: T) => void;
  get: (key: U) => T | undefined;
  reversed: Iterable<T>;
  [Symbol.iterator]: () => Iterator<T>;
}

type Comparable = string | number | Date;
type Key<T> = (t: T) => Comparable;

export function AVLTree<T, U extends Comparable>(
  key: (t: T) => U
): AVLTree<T, U>;
export function AVLTree<T extends Comparable>(
  items: Iterable<T>
): AVLTree<T, T>;
export function AVLTree<T, U extends Comparable>(
  items: Iterable<T>,
  key: (t: T) => U
): AVLTree<T, U>;
export function AVLTree<T, U>(...args: any[]) {
  let tree: AVLNode<T> = undefined;
  let keyFn = (x: any) => x;
  if (typeof args[0] === "function") {
    keyFn = args[0];
  }

  if (typeof args[1] === "function") {
    keyFn = args[1];
  }

  if (typeof args[0]?.[Symbol.iterator] !== "undefined") {
    for (let item of args[0]) {
      tree = insert(tree, item, keyFn);
    }
  }

  return {
    insert: (val: T) => {
      tree = insert(tree, val, keyFn);
    },
    get: (val: U) => get(tree, keyFn, val),
    remove: (val: U) => {
      tree = remove(tree, val, keyFn);
    },
    reversed: {
      [Symbol.iterator]: () => traverseReversed(tree),
    },
    [Symbol.iterator]: () => traverse(tree),
  };
}
