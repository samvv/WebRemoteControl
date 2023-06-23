
type Vec2  = [x: number, y: number];

interface ElementWithPos {
  position: Vec2;
  element: HTMLElement;
}

const controls = new Set<ElementWithPos>();

let selection!: ElementWithPos;

function setSelection(nextSelection: ElementWithPos) {
  selection.element.style.outline = '';
  nextSelection.element.style.outline = '4px solid red';
  selection = nextSelection;
  selection.element.scrollIntoView();
  console.log(selection.element);
}

function isChildOf(child: Node, parent: Node) {
  let curr = child;
  for (;;) {
    if (curr === parent) {
      return true;
    }
    if (curr.parentNode === null) {
      break;
    }
    curr = curr.parentNode;
  }
  return false;
}

const enum Direction {
  Up = 1 << 0,
  Down = 1 << 1,
  Left = 1 << 2,
  Right = 1 << 3,
  Horizontal = Left | Right,
  Vertical = Up | Down,
}

function selectNearest(target: Vec2) {
  const mapped = [...controls]
    .map(control => ({ control, distance: Math.sqrt((control.position[0] - target[0]) ** 2 + (control.position[1] - target[1]) ** 2) }));
  mapped.sort((a, b) => a.distance - b.distance);
  const nearest = mapped[0].control;
  selection = nearest;
}

function selectNext(direction: Direction) {

  const mainAxis = (direction & Direction.Horizontal) ? 0 : 1;
  const otherAxis = (direction & Direction.Horizontal) ? 1 : 0;

  let parent = selection.element.parentNode;
  let mayGoOut = false;

  while (parent !== null) {

    const mapped = [...controls]
      .filter(control => isChildOf(control.element, parent!))
      .map(({ position, element }) => ({ element, distance: [ position[0] - selection.position[0], position[1] - selection.position[1] ], position }))
      .filter(control => {
        switch (direction) {
          case Direction.Up:
           return control.distance[1] < 0;
          case Direction.Down:
           return control.distance[1] > 0;
          case Direction.Left:
            return control.distance[0] < 0;
         case Direction.Right:
           return control.distance[0] > 0;
        }
      });

    if (mapped.length > 0) {
      mapped.sort((a, b) => {
        // if (a.distance[mainAxis] === b.distance[mainAxis]) {
        //   return a.distance[otherAxis] === b.distance[otherAxis] ? 0 : a.distance[otherAxis] < b.distance[otherAxis] ? -1 : 1;
        // }
        // return a.distance[mainAxis] - b.distance[mainAxis];
        switch (direction) {
          case Direction.Up:
            return b.distance[1] - a.distance[1];
          case Direction.Down:
            return a.distance[1] - b.distance[1];
          case Direction.Left:
            return b.distance[0] - a.distance[0];
          case Direction.Right:
            return a.distance[0] - b.distance[0];
        }
      });
      const nearest = mapped[0];
      nearest.element.style.outline = '2px solid lightblue';
      setSelection(nearest);
      return;
    }

    mayGoOut = true;
    parent = parent.parentNode;
  }

}

function selectDown() {
  selectNext(Direction.Down);
}

function selectUp() {
  selectNext(Direction.Up);
}

function selectLeft() {
  selectNext(Direction.Left);
}

function selectRight() {
  selectNext(Direction.Right);
}

function isHidden(element: Element): boolean {
  let curr = element;
  for (;;) {
    const css = window.getComputedStyle(curr);
    if  (css.display === 'none' || css.height === '0' || css.width === '0' || css.width === '1px') {
      return true;
    }
    if (curr.parentElement === null) {
      return false;
    }
    curr = curr.parentElement;
  }
}

window.addEventListener('load', () => {
  const elements = document.body.querySelectorAll('a, button')
  for (const element of elements) {
    if (!isHidden(element)) {
      const rect = element.getBoundingClientRect();
      controls.add({ element: element as HTMLElement, position: [rect.x, rect.y ] });
    }
  }
  selectNearest([0, 0]);
});

window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
      selectUp();
      e.preventDefault();
      break;
    case 'ArrowDown':
      selectDown();
      e.preventDefault();
      break;
    case 'ArrowLeft':
      selectLeft();
      e.preventDefault();
      break;
    case 'ArrowRight':
      selectRight();
      e.preventDefault();
      break;
  }
});

