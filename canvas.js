import { sectors } from './sectors.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const coordDisplay = document.getElementById('coordinates');
const minZoom = 0.05;
const maxZoom = 1.0;

let gridSize = 50;
let panX = 0;
let panY = 0;

let isPanning = false;
let lastMouseX, lastMouseY;
let zoomFactor = 1.0;

export function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawGrid();
}

export function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  // Apply zoom transformation and translate based on panX and panY
  ctx.scale(zoomFactor, zoomFactor);

  // Calculate the starting point for drawing the grid (ensure grid lines stay anchored)
  const startX = -panX % gridSize;
  const startY = -panY % gridSize;

  ctx.strokeStyle = 'lightgrey'; // Grid line color

  // Draw vertical grid lines
  for (let x = startX; x <= canvas.width / zoomFactor; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height / zoomFactor);
    ctx.stroke();
  }

  // Draw horizontal grid lines
  for (let y = startY; y <= canvas.height / zoomFactor; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width / zoomFactor, y);
    ctx.stroke();
  }

  ctx.restore();
}

export function initEventListeners() {
  window.addEventListener('resize', setCanvasSize);
  canvas.addEventListener('mousemove', mouseMove);
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);
  canvas.addEventListener('wheel', handleZoom);

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}

export function mouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) / zoomFactor;
  const mouseY = (e.clientY - rect.top) / zoomFactor;
  const worldX = mouseX + panX;
  const worldY = mouseY + panY;

  coordDisplay.textContent = `World X: ${worldX.toFixed(
    2
  )}, World Y: ${worldY.toFixed(2)}`;

  if (isPanning) {
    panX += lastMouseX - mouseX;
    panY += lastMouseY - mouseY;
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

export function mouseDown(e) {
  if (e.button === 2) {
    // Right-click for panning
    isPanning = true;
  }
}

export function mouseUp(e) {
  if (e.button === 2) {
    // Stop panning on right-click release
    isPanning = false;
  }
}

export function handleZoom(e) {
  e.preventDefault();
  const zoomStep = 0.1;
  if (e.deltaY < 0) {
    zoomFactor = Math.min(zoomFactor + zoomStep, maxZoom);
  } else {
    zoomFactor = Math.max(zoomFactor - zoomStep, minZoom);
  }
  setCanvasSize();
}

function drawActors() {
  sectors.forEach((sector) => {
    sector.drawActors(ctx, panX, panY, zoomFactor);
    sector.drawBorder(ctx, panX, panY, zoomFactor);
    sector.checkActorPositions();
  });
}

let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

export function canvasRenderLoop() {
  const currentTime = performance.now();
  frameCount++;

  // If a second has passed, calculate the FPS
  if (currentTime - lastTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastTime = currentTime;

    // Print the FPS to the console (or display it on the canvas if needed)
    console.log(`FPS: ${fps}`);
  }

  drawGrid();
  drawActors();

  window.requestAnimationFrame(canvasRenderLoop);
}

export function moveCameraTo(worldX, worldY) {
  // Calculate the center of the screen
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Adjust panX and panY so that the worldX and worldY are centered
  // This adjustment now accounts for the zoomFactor correctly
  panX = worldX - centerX / zoomFactor;
  panY = worldY - centerY / zoomFactor;

  // Redraw the grid and actors to reflect the new camera position
  drawGrid(); // No need to resize the canvas, just redraw the content
  drawActors();
}
