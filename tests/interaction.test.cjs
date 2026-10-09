const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup() {
  const elements = Object.fromEntries(['pet', 'bubble', 'portrait', 'interact', 'menu'].map(id => {
    const classes = new Set();
    return [id, { classes, handlers: {}, classList: {
      add: x => classes.add(x), remove: x => classes.delete(x),
      toggle: (x, enabled) => enabled ? classes.add(x) : classes.delete(x)
    }, addEventListener(name, callback) { this.handlers[name] = callback; } }];
  }));
  let onAction, onPhoto, menuCalls = 0;
  const context = { document: { getElementById: id => elements[id] }, setTimeout: () => 1, clearTimeout() {} };
  context.window = context;
  Object.defineProperty(context, 'pet', { value: Object.freeze({
    menu: () => menuCalls++, onAction: f => { onAction = f; }, onPhoto: f => { onPhoto = f; }
  }), configurable: false, writable: false });
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/pet.js'), 'utf8'), context);
  return { elements, action: name => onAction(name), photo: value => onPhoto(value), menus: () => menuCalls };
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
