// Get canvas element and 2D rendering context
const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");

// Global variables for spray paint state
let painting = false;  // Track if user is currently painting
let lastX = 0, lastY = 0;  // Store last mouse position (currently unused but available for future features)
let stillFrames = 0;  // Count frames where mouse hasn't moved (increases density/size)
let droplets = [];  // Array to store all active paint droplets for drip effect

// Load and configure spray sound effect
const sprey = new Audio('sounds/spray.mp3');
sprey.loop = true;  // Loop the spray sound while painting

// Start painting when mouse is pressed down
canvas.addEventListener("mousedown", () => painting = true);

// Stop painting when mouse is released
canvas.addEventListener("mouseup", () => painting = false);

// Stop painting when mouse leaves canvas area
canvas.addEventListener("mouseleave", () => painting = false);

// Call spray function when mouse moves (only paints if painting = true)
canvas.addEventListener("mousemove", spray);

// Audio controls - play spray sound when painting starts
canvas.addEventListener("mousedown", () => sprey.play());

// Pause spray sound when painting stops
canvas.addEventListener("mouseup", () => sprey.pause());

// Pause spray sound when mouse leaves canvas
canvas.addEventListener("mouseleave", () => sprey.pause());

function spray(e) {
  // Exit if not currently painting
  if (!painting) return;

  // Get current settings from UI controls
  const color = document.getElementById("colorPicker").value;  // Selected color
  const sprayType = document.getElementById("sprayType").value;  // Shape type (dot/square/star)
  const baseDensity = +document.getElementById("granularity").value;  // Base number of particles
  const baseSize = +document.getElementById("spraySize").value;  // Base size of particles
  
  // Calculate mouse position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Increase density and size based on how long mouse has been still
  // This creates a more realistic spray effect where holding still builds up paint
  const density = baseDensity + stillFrames * 2;
  const size = baseSize + stillFrames * 0.2;

  // Create multiple particles for spray effect
  for (let i = 0; i < density; i++) {
    // Add random offset to create spray pattern around mouse cursor
    const offsetX = (Math.random() - 0.5) * 20;  // Random X offset between -10 and +10
    const offsetY = (Math.random() - 0.5) * 20;  // Random Y offset between -10 and +10
    const cx = x + offsetX;  // Final X position
    const cy = y + offsetY;  // Final Y position

    // Set paint color
    ctx.fillStyle = color;

    // Draw particle based on selected shape type
    switch (sprayType) {
      case "dot":
        // Draw circular particle
        ctx.beginPath();
        ctx.arc(cx, cy, size, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case "square":
        // Draw square particle
        ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        break;
      case "star":
        // Draw star particle using custom function
        drawStar(cx, cy, 5, size, size / 2);
        break;
    }

    // Randomly create drip droplets based on drip amount setting
    const dripChance = +document.getElementById("dripAmount").value / 100;  // Convert percentage to decimal
    if (Math.random() < dripChance) {
      // Add new droplet to array for animation
      droplets.push({
        x: cx,           // Starting X position
        y: cy,           // Starting Y position
        r: size,         // Starting radius
        color,           // Paint color
        shape: sprayType, // Shape type
        speed: Math.random() * 0.4 + 0.1  // Random falling speed between 0.1 and 0.5
      });
    }
  }
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
  // Calculate rotation and step for star points
  let rot = Math.PI / 2 * 3;  // Start rotation (pointing up)
  let x = cx, y = cy;
  let step = Math.PI / spikes;  // Angle between each point

  // Begin drawing star path
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);  // Start at top point
  
  // Draw each spike of the star
  for (let i = 0; i < spikes; i++) {
    // Draw to outer point
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    // Draw to inner point
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  
  // Close the star shape and fill it
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function wash() {
  // Clear entire canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Reset all droplets
  droplets = [];
  
  // Reset still frames counter
  stillFrames = 0;
}

function dripPaint() {
  // Save current canvas state
  ctx.save();
  
  // Update and draw each droplet
  for (let d of droplets) {
    // Move droplet down
    d.y += d.speed;
    
    // Gradually shrink droplet as it falls
    d.r *= 0.98;

    // Set droplet color
    ctx.fillStyle = d.color;

    // Draw droplet based on its shape
    switch (d.shape) {
      case "dot":
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case "square":
        ctx.fillRect(d.x - d.r / 2, d.y - d.r / 2, d.r, d.r);
        break;
      case "star":
        drawStar(d.x, d.y, 5, d.r, d.r / 2);
        break;
    }
  }
  
  // Restore canvas state
  ctx.restore();

  // Remove droplets that are too small or have fallen off screen
  droplets = droplets.filter(d => d.r > 0.5 && d.y < canvas.height);
  
  // Schedule next animation frame
  requestAnimationFrame(dripPaint);
}

// Start the drip animation loop
dripPaint();

// Set canvas dimensions when page loads
window.addEventListener("load", () => {
  const canvas = document.getElementById("wall");
  // Set canvas internal dimensions to match CSS dimensions
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});

// Start drip animation (duplicate call - one of these can be removed)
dripPaint();

// Get references to color input and spray icon
const colorInput = document.getElementById('colorPicker');
const sprayIcon = document.getElementById('sprayIcon');

// Function to open color picker dialog
function openColorPicker() {
  colorInput.click();  // Programmatically click the hidden color input
}

// Load shake sound effect
const shakey = new Audio('sounds/shake.mp3');

// Add click event to spray icon
sprayIcon.addEventListener('click', () => {
    // Remove existing shake animation class
    sprayIcon.classList.remove('shake');
    
    // Force reflow to ensure class removal takes effect
    void sprayIcon.offsetWidth;
    
    // Add shake animation class
    sprayIcon.classList.add('shake');
    
    // Play shake sound
    shakey.play();
});

// Update spray icon background color when color picker changes
colorInput.addEventListener('input', () => {
  sprayIcon.style.backgroundColor = colorInput.value;
});

// Get wash button reference and load sponge sound
const btn = document.getElementById('washbtn');
const sponge = new Audio('sounds/sponge.mp3');

// Add click event to wash button
btn.addEventListener('click', () => {
  // Remove existing jello animation class
  btn.classList.remove('jello');
  
  // Force reflow to ensure class removal takes effect
  void btn.offsetWidth;
  
  // Add jello animation class
  btn.classList.add('jello');
  
  // Play sponge sound
  sponge.play();
});