const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
const crcTable = (() => {
  let c;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(width, height, getPixelRgba) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createPngChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      rawData[offset++] = Math.min(255, Math.max(0, Math.round(r)));
      rawData[offset++] = Math.min(255, Math.max(0, Math.round(g)));
      rawData[offset++] = Math.min(255, Math.max(0, Math.round(b)));
      rawData[offset++] = Math.min(255, Math.max(0, Math.round(a)));
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createPngChunk('IDAT', compressedData);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw UdanPath icon
function getUdanPathPixel(x, y, size) {
  const normX = x / size; // 0 to 1
  const normY = y / size; // 0 to 1

  // Background Gradient: Deep Indigo -> Vibrant Violet -> Touch of Rose
  // from (0,0) to (1,1)
  const diag = (normX + normY) / 2;
  const r1 = 79, g1 = 70, b1 = 229;   // #4f46e5 (Indigo)
  const r2 = 124, g2 = 58, b2 = 237;  // #7c3aed (Purple)
  const r3 = 236, g3 = 72, b3 = 153;  // #ec4899 (Pink)

  let bgR, bgG, bgB;
  if (diag < 0.6) {
    const t = diag / 0.6;
    bgR = r1 + (r2 - r1) * t;
    bgG = g1 + (g2 - g1) * t;
    bgB = b1 + (b2 - b1) * t;
  } else {
    const t = (diag - 0.6) / 0.4;
    bgR = r2 + (r3 - r2) * t;
    bgG = g2 + (g3 - g2) * t;
    bgB = b2 + (b3 - b2) * t;
  }

  // Rounded squircle mask for touch icon (radius ~ 22% of size)
  const cornerRadius = 0.22;
  const dx = Math.max(0, Math.abs(normX - 0.5) - (0.5 - cornerRadius));
  const dy = Math.max(0, Math.abs(normY - 0.5) - (0.5 - cornerRadius));
  const distFromCorner = Math.hypot(dx, dy);
  
  let alpha = 255;
  if (distFromCorner > cornerRadius) {
    alpha = 0;
  } else if (distFromCorner > cornerRadius - (1.5 / size)) {
    // Anti-alias outer corner
    alpha = Math.round(255 * (1 - (distFromCorner - (cornerRadius - 1.5 / size)) / (1.5 / size)));
  }

  if (alpha === 0) return [0, 0, 0, 0];

  // Draw Emblem: Stylized bold "U" with a sleek forward flight wing
  // Center is at (0.5, 0.5)
  // Define U geometry:
  // Left pillar: X from 0.28 to 0.38, Y from 0.25 to 0.60
  // Bottom curve: semi-circle connecting left & right
  // Right pillar: X from 0.62 to 0.72, Y from 0.25 to 0.60
  // Flight arrow / chevron shooting upward-right through the center

  // Check if pixel is inside the "U" shape
  let inU = false;
  const cx = 0.5;
  const bottomCenterY = 0.58;
  const outerR = 0.22;
  const innerR = 0.12;

  // Pillars
  const inLeftPillar = normX >= 0.28 && normX <= 0.38 && normY >= 0.26 && normY <= bottomCenterY;
  const inRightPillar = normX >= 0.62 && normX <= 0.72 && normY >= 0.26 && normY <= bottomCenterY;
  
  // Bottom curve (arc between 0.28 and 0.72)
  let inBottomCurve = false;
  if (normY >= bottomCenterY) {
    const dArc = Math.hypot(normX - cx, normY - bottomCenterY);
    if (dArc <= outerR && dArc >= innerR && normY <= bottomCenterY + outerR) {
      inBottomCurve = true;
    }
  }

  if (inLeftPillar || inRightPillar || inBottomCurve) {
    inU = true;
  }

  // Also draw a sleek flight path / upward arrow emblem in the center (Udan = Flight)
  // Arrow from (0.42, 0.48) to (0.58, 0.36)
  // Arrowhead at (0.58, 0.36)
  let inArrow = false;
  const ax = normX - 0.50;
  const ay = normY - 0.42;
  // Rotated coordinates for a 45 degree paper flight symbol
  const rotX = (ax - ay) * 0.7071;
  const rotY = (ax + ay) * 0.7071;
  if (rotY >= -0.09 && rotY <= 0.09 && rotX >= -0.02 && rotX <= 0.02) {
    // Arrow shaft
    if (normY <= 0.50 && normY >= 0.34) {
      inArrow = true;
    }
  }
  // Triangle arrowhead at tip
  const tipX = normX - 0.53;
  const tipY = normY - 0.34;
  if (tipY >= 0 && tipY <= 0.07 && Math.abs(tipX) <= (0.07 - tipY) * 0.9) {
    inArrow = true;
  }

  if (inU || inArrow) {
    // White emblem with subtle inner gradient glow
    return [255, 255, 255, alpha];
  }

  return [bgR, bgG, bgB, alpha];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate files:
const targets = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-precomposed.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

targets.forEach(({ name, size }) => {
  const filePath = path.join(publicDir, name);
  const buf = createPng(size, size, (x, y) => getUdanPathPixel(x, y, size));
  fs.writeFileSync(filePath, buf);
  console.log(`Generated: ${filePath} (${size}x${size}, ${buf.length} bytes)`);
});

