const petElement = document.getElementById('pet');
const bubble = document.getElementById('bubble');
const portrait = document.getElementById('portrait');
const expression = document.getElementById('expression');
const snackEffect = document.getElementById('snack-effect');
let sleeping = false;
let bubbleTimer;
let reactionTimer;
let customPhoto = false;
let pokeCount = 0;
const reactions = ['loving', 'poked', 'happy', 'sour', 'spicy', 'cool'];
const snacks = {
  cookie: { emoji: '🍪', face: '😋', motion: 'happy', text: '饼干脆脆的！再来一块～', portrait: 'happy' },
  strawberry: { emoji: '🍓', face: '🥰', motion: 'loving', text: '草莓甜甜的，最喜欢啦！', portrait: 'happy' },
  lemon: { emoji: '🍋', face: '😖', motion: 'sour', text: '呜哇，好酸！脸都皱起来了～', portrait: 'surprised' },
  chili: { emoji: '🌶️', face: '🥵', motion: 'spicy', text: '辣辣辣！下次给我冰淇淋吧！', portrait: 'surprised' },
  icecream: { emoji: '🍦', face: '😌', motion: 'cool', text: '凉凉的，好舒服～', portrait: 'happy' }
};
function say(text) {
  clearTimeout(bubbleTimer);
  bubble.textContent = text;
  bubble.classList.add('visible');
  bubbleTimer = setTimeout(() => bubble.classList.remove('visible'), 3500);
}
function setPortrait(name) {
  if (!customPhoto) portrait.src = `assets/${name === 'neutral' ? 'portrait' : name}.png`;
}
function clearReaction() {
  clearTimeout(reactionTimer);
  for (const name of reactions) petElement.classList.remove(name);
  expression.textContent = sleeping ? '💤' : '🙂';
  snackEffect.textContent = '';
  setPortrait('neutral');
}
function react(motion, face, text, image = 'neutral', food = '') {
  sleeping = false;
  petElement.classList.remove('sleeping');
  clearReaction();
  void petElement.offsetWidth;
  petElement.classList.add(motion);
  expression.textContent = face;
  snackEffect.textContent = food;
  setPortrait(image);
  say(text);
  reactionTimer = setTimeout(clearReaction, 3000);
}
function feed(name) {
  const snack = snacks[name];
  if (!snack) return;
  react(snack.motion, snack.face, snack.text, snack.portrait, snack.emoji);
}
function action(name) {
  if (name === 'sleep') {
    sleeping = !sleeping;
    clearReaction();
    petElement.classList.toggle('sleeping', sleeping);
    say(sleeping ? '休息一下… Zzz' : '睡醒啦，陪你工作！');
  } else if (name === 'love') {
    react('loving', '🥰', '谢谢你陪着我 ♡', 'happy');
  } else if (name === 'poke') {
    pokeCount++;
    react('poked', '😳', pokeCount % 3 === 0 ? '又戳我！我可要戳回去啦～' : '欸？你戳到我啦！', 'surprised');
  }
}
document.getElementById('interact').addEventListener('click', () => action('love'));
document.getElementById('poke').addEventListener('click', () => action('poke'));
portrait.addEventListener('click', () => action('poke'));
document.getElementById('menu').addEventListener('click', () => window.pet.menu());
for (const name of Object.keys(snacks)) document.getElementById(`feed-${name}`).addEventListener('click', () => feed(name));
petElement.addEventListener('contextmenu', event => { event.preventDefault(); window.pet.menu(); });
window.pet.onAction(action);
say('点我戳一戳，或选一个零食喂我！');
window.pet.onPhoto(photo => {
  customPhoto = true;
  clearReaction();
  portrait.onload = () => { portrait.hidden = false; petElement.classList.add('has-photo'); };
  portrait.onerror = () => say('图片无法读取，请换一张');
  portrait.src = photo;
});
