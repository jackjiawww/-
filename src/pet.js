const pet = document.getElementById('pet');
const bubble = document.getElementById('bubble');
let dragging = false;
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
    pet.classList.toggle('sleeping', sleeping);
    say(sleeping ? '休息一下… Zzz' : '睡醒啦，陪你工作！');
  } else if (name === 'love') {
    clearTimeout(loveTimer);
    pet.classList.remove('loving');
    void pet.offsetWidth;
    pet.classList.add('loving');
    say('谢谢你陪着我 ♡');
    loveTimer = setTimeout(() => pet.classList.remove('loving'), 1900);
  }
}
pet.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  dragging = true;
  pet.setPointerCapture(event.pointerId);
  pet.classList.add('dragging');
  window.pet.dragStart();
});
pet.addEventListener('pointermove', () => { if (dragging) window.pet.dragMove(); });
function endDrag() {
  dragging = false;
  pet.classList.remove('dragging');
  window.pet.dragEnd();
}
pet.addEventListener('pointerup', endDrag);
pet.addEventListener('pointercancel', endDrag);
pet.addEventListener('lostpointercapture', endDrag);
window.addEventListener('blur', endDrag);
pet.addEventListener('dblclick', () => action('love'));
pet.addEventListener('contextmenu', event => { event.preventDefault(); endDrag(); window.pet.menu(); });
window.pet.onAction(action);
say('你好呀！右键看看 🐾');

window.pet.onPhoto(photo => {
  const portrait = document.getElementById('portrait');
  portrait.onload = () => { portrait.hidden = false; pet.classList.add('has-photo'); };
  portrait.onerror = () => say('图片无法读取，请换一张');
  portrait.src = photo;
});
