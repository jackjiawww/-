const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup() {
  const elements = Object.fromEntries(['pet', 'bubble', 'portrait', 'interact', 'menu', 'expression', 'snack-effect', 'poke', 'feed-cookie', 'feed-strawberry', 'feed-lemon', 'feed-chili', 'feed-icecream'].map(id => {
    const classes = new Set();
    return [id, { classes, handlers: {}, classList: {
      add: x => classes.add(x), remove: x => classes.delete(x),
      toggle: (x, enabled) => enabled ? classes.add(x) : classes.delete(x)
    }, addEventListener(name, callback) { this.handlers[name] = callback; } }];
  }));
  let onAction, onPhoto, menuCalls = 0;
  const timers = new Map(); let timerId = 0;
  const context = { document: { getElementById: id => elements[id] }, setTimeout: f => { timers.set(++timerId, f); return timerId; }, clearTimeout: id => timers.delete(id) };
  context.window = context;
  Object.defineProperty(context, 'pet', { value: Object.freeze({
    menu: () => menuCalls++, onAction: f => { onAction = f; }, onPhoto: f => { onPhoto = f; }
  }), configurable: false, writable: false });
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/pet.js'), 'utf8'), context);
  return { elements, action: name => onAction(name), photo: value => onPhoto(value), menus: () => menuCalls, finish: () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(f => f()); } };
}
test('interaction button animates and displays a response', () => {
  const { elements } = setup();
  elements.interact.handlers.click();
  assert(elements.pet.classes.has('loving'));
  assert.match(elements.bubble.textContent, /谢谢/);
});
test('menu button invokes the desktop bridge', () => {
  const s = setup(); s.elements.menu.handlers.click(); assert.equal(s.menus(), 1);
});
test('menu actions toggle sleep and wake', () => {
  const s = setup(); s.action('sleep'); assert(s.elements.pet.classes.has('sleeping'));
  s.action('sleep'); assert(!s.elements.pet.classes.has('sleeping'));
});
test('replacement image is revealed after it loads', () => {
  const s = setup(); s.photo('data:image/png;base64,test');
  s.elements.portrait.onload();
  assert.equal(s.elements.portrait.hidden, false);
  assert(s.elements.pet.classes.has('has-photo'));
});

test('clicking portrait pokes and changes expression and image', () => {
  const s = setup(); s.elements.portrait.handlers.click();
  assert(s.elements.pet.classes.has('poked'));
  assert.equal(s.elements.expression.textContent, '😳');
  assert.equal(s.elements.portrait.src, 'assets/surprised.png');
  s.finish(); assert(!s.elements.pet.classes.has('poked'));
  assert.equal(s.elements.portrait.src, 'assets/portrait.png');
});
test('each snack has a distinct response and animation feedback', () => {
  const responses = new Set();
  for (const name of ['cookie', 'strawberry', 'lemon', 'chili', 'icecream']) {
    const s = setup(); s.elements[`feed-${name}`].handlers.click();
    responses.add(s.elements.bubble.textContent);
    assert(s.elements['snack-effect'].textContent);
    assert.notEqual(s.elements.expression.textContent, '🙂');
    s.finish(); assert.equal(s.elements['snack-effect'].textContent, '');
  }
  assert.equal(responses.size, 5);
});
test('feeding wakes pet and rapid actions replace previous reaction', () => {
  const s = setup(); s.action('sleep'); s.elements['feed-chili'].handlers.click();
  assert(!s.elements.pet.classes.has('sleeping'));
  assert(s.elements.pet.classes.has('spicy'));
  s.elements['feed-icecream'].handlers.click();
  assert(!s.elements.pet.classes.has('spicy')); assert(s.elements.pet.classes.has('cool'));
});
test('custom photos are preserved during poke and feeding', () => {
  const s = setup(); s.photo('data:image/png;base64,custom');
  s.elements.portrait.handlers.click(); s.elements['feed-cookie'].handlers.click(); s.finish();
  assert.equal(s.elements.portrait.src, 'data:image/png;base64,custom');
});
