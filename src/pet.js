const petElement = document.getElementById('pet');
const bubble = document.getElementById('bubble');
let sleeping = false;
let bubbleTimer;
let loveTimer;
function say(text) {
  clearTimeout(bubbleTimer);
  bubble.textContent = text;
  bubble.classList.add('visible');
  bubbleTimer = setTimeout(() => bubble.classList.remove('visible'), 3000);
}
function action(name) {
  if (name === 'sleep') {
    sleeping = !sleeping;
    petElement.classList.toggle('sleeping', sleeping);
    say(sleeping ? '休息一下… Zzz' : '睡醒啦，陪你工作！');
  } else if (name === 'love') {
    clearTimeout(loveTimer);
    petElement.classList.remove('loving');
    void petElement.offsetWidth;
    petElement.classList.add('loving');
    say('谢谢你陪着我 ♡');
    loveTimer = setTimeout(() => petElement.classList.remove('loving'), 1900);
  }
}
document.getElementById('interact').addEventListener('click', () => action('love'));
document.getElementById('menu').addEventListener('click', () => window.pet.menu());
petElement.addEventListener('contextmenu', event => { event.preventDefault(); window.pet.menu(); });
window.pet.onAction(action);
say('按住人物拖动，底部按钮互动 ♡');

window.pet.onPhoto(photo => {
  const portrait = document.getElementById('portrait');
  portrait.onload = () => { portrait.hidden = false; petElement.classList.add('has-photo'); };
  portrait.onerror = () => say('图片无法读取，请换一张');
  portrait.src = photo;
});
