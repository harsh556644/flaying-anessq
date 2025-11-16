let move_speed = 2.5; // 🏃 faster = slightly harder
let gravity = 0.45;

const bird = document.querySelector('.bird');
const img = document.getElementById('bird-1');

// 🎵 Sound Effects
const sound_point = new Audio('soundeffect/point.mp3');
const sound_die = new Audio('soundeffect/die.mp3');
const sound_bg = new Audio('soundeffect/bg.mp3');
const sound_win = new Audio('soundeffect/win.mp3');
sound_bg.loop = true;

const background = document.querySelector('.background').getBoundingClientRect();
const score_val = document.querySelector('.score_val');
const message = document.querySelector('.message');
const score_title = document.querySelector('.score_title');
const winOverlay = document.getElementById('win-overlay');
const winVideo = document.getElementById('win-video');
const playAgainBtn = document.getElementById('play-again-btn');

let game_state = 'Start';
let animationFrames = [];
img.style.display = 'none';
message.classList.add('messageStyle');

// 🕹 Start Controls
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && game_state !== 'Play') startGame();
});
document.addEventListener('touchstart', () => {
  if (game_state !== 'Play') startGame();
});

function startGame() {
  // reset
  document.querySelectorAll('.pipe_sprite').forEach((e) => e.remove());
  animationFrames.forEach((id) => cancelAnimationFrame(id));
  animationFrames = [];

  bird.style.top = '40vh';
  img.style.display = 'block';
  message.innerHTML = '';
  message.classList.remove('messageStyle');
  score_title.innerHTML = 'Score: ';
  score_val.innerHTML = '0';
  winOverlay?.classList.remove('show');
  winVideo?.pause();
  winVideo.currentTime = 0;

  sound_bg.currentTime = 0;
  sound_bg.play();

  game_state = 'Play';
  play();
}

function play() {
  let bird_dy = 0;
  let bird_props = bird.getBoundingClientRect();
  let pipe_separation = 0;
  const pipe_gap = 40; // smaller = harder
  const spawn_distance = 160; // faster pipe appearance
  let stop_pipes = false; // to stop pipes after win

  function movePipes() {
    if (game_state !== 'Play') return;
    const pipes = document.querySelectorAll('.pipe_sprite');

    pipes.forEach((element) => {
      const pipe_rect = element.getBoundingClientRect();
      bird_props = bird.getBoundingClientRect();

      if (pipe_rect.right <= 0) {
        element.remove();
      } else {
        // 💥 Collision detection
        if (
          bird_props.left < pipe_rect.left + pipe_rect.width &&
          bird_props.left + bird_props.width > pipe_rect.left &&
          bird_props.top < pipe_rect.top + pipe_rect.height &&
          bird_props.top + bird_props.height > pipe_rect.top
        ) {
          gameOver();
          return;
        }

        // 🏅 Scoring
        if (pipe_rect.right < bird_props.left && element.increase_score === '1') {
          score_val.innerHTML = parseInt(score_val.innerHTML) + 1;
          element.increase_score = '0';
          sound_point.play();

          if (parseInt(score_val.innerHTML) >= 30) {
            winGame();
            stop_pipes = true;
            return;
          }
        }

        element.style.left = pipe_rect.left - move_speed + 'px';
      }
    });
    const id = requestAnimationFrame(movePipes);
    animationFrames.push(id);
  }
  const moveID = requestAnimationFrame(movePipes);
  animationFrames.push(moveID);

  function jump() {
    if (game_state === 'Play') {
      img.src = 'images/bird-2.png';
      bird_dy = -6.2;
      setTimeout(() => (img.src = 'images/bird.png'), 150);
    }
  }

  document.removeEventListener('keydown', jumpKeyHandler);
  document.removeEventListener('touchstart', jumpTouchHandler);

  function jumpKeyHandler(e) {
    if (e.key === 'ArrowUp' || e.key === ' ') jump();
  }
  function jumpTouchHandler() {
    jump();
  }

  document.addEventListener('keydown', jumpKeyHandler);
  document.addEventListener('touchstart', jumpTouchHandler);

  function apply_gravity() {
    if (game_state !== 'Play') return;
    bird_dy += gravity;
    bird_props = bird.getBoundingClientRect();

    if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
      gameOver();
      return;
    }

    bird.style.top = bird_props.top + bird_dy + 'px';
    const id = requestAnimationFrame(apply_gravity);
    animationFrames.push(id);
  }
  const gravityID = requestAnimationFrame(apply_gravity);
  animationFrames.push(gravityID);

  function create_pipe() {
    if (game_state !== 'Play' || stop_pipes) return;

    if (pipe_separation > spawn_distance) {
      pipe_separation = 0;
      const pipe_pos = Math.floor(Math.random() * 40) + 10;

      const top_pipe = document.createElement('div');
      top_pipe.className = 'pipe_sprite';
      top_pipe.style.top = pipe_pos - 70 + 'vh';
      top_pipe.style.left = '100vw';
      document.body.appendChild(top_pipe);

      const bottom_pipe = document.createElement('div');
      bottom_pipe.className = 'pipe_sprite';
      bottom_pipe.style.top = pipe_pos + pipe_gap + 'vh';
      bottom_pipe.style.left = '100vw';
      bottom_pipe.increase_score = '1';
      document.body.appendChild(bottom_pipe);
    }

    pipe_separation++;
    const id = requestAnimationFrame(create_pipe);
    animationFrames.push(id);
  }
  const pipeID = requestAnimationFrame(create_pipe);
  animationFrames.push(pipeID);
}

function gameOver() {
  if (game_state !== 'Play') return;
  game_state = 'End';
  sound_bg.pause();
  sound_die.play();
  img.style.display = 'none';
  message.innerHTML = '💀 Game Over 💀<br>Tap or Press Enter to Restart';
  message.classList.add('messageStyle');
}

function winGame() {
  game_state = 'Win';
  sound_bg.pause();
  sound_win.play();
  img.style.display = 'none';
  message.innerHTML = '🎉 YOU WIN! 🎉<br><small>Press Enter or Tap to Play Again</small>';
  message.classList.add('messageStyle');
  winOverlay?.classList.add('show');
  winVideo?.play();
}

playAgainBtn?.addEventListener('click', () => {
  winOverlay.classList.remove('show');
  startGame();
});
