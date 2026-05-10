// tavor-mind — one-tap emergency widget for Scriptable
// Renders a red circle on Home Screen and an accessoryCircular variant on Lock Screen.
// Tapping anywhere on the widget opens the /emergency flow in Safari.

const URL = "https://tavorsharf-lang.github.io/tavor-mind/emergency";

const RED = new Color("#FF3B30");
const CANVAS = new Color("#F2F2F7");

const family = config.widgetFamily || "small";
const widget = new ListWidget();
widget.url = URL;

if (family === "accessoryCircular") {
  widget.addAccessoryWidgetBackground = true;
  centerImage(widget, drawLockCircle());
} else {
  widget.backgroundColor = CANVAS;
  widget.setPadding(0, 0, 0, 0);
  centerImage(widget, drawHomeButton(), 140);
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else if (family === "accessoryCircular") {
  await widget.presentAccessoryCircular();
} else {
  await widget.presentSmall();
}
Script.complete();

function centerImage(parent, img, sizePt) {
  parent.addSpacer();
  const row = parent.addStack();
  row.layoutHorizontally();
  row.addSpacer();
  const node = row.addImage(img);
  if (sizePt) node.imageSize = new Size(sizePt, sizePt);
  row.addSpacer();
  parent.addSpacer();
}

function drawHomeButton() {
  const size = 400;
  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  // Soft drop shadow — concentric ellipses, decreasing alpha, slight downward offset
  const shadowLayers = 14;
  const shadowOffset = size * 0.022;
  for (let i = shadowLayers; i >= 1; i--) {
    const expand = i * 1.6;
    const alpha = 0.05 * (1 - i / (shadowLayers + 2));
    ctx.setFillColor(new Color("#000000", alpha));
    ctx.fillEllipse(
      new Rect(
        cx - r - expand,
        cy - r - expand + shadowOffset,
        (r + expand) * 2,
        (r + expand) * 2,
      ),
    );
  }

  // Main red disc
  ctx.setFillColor(RED);
  ctx.fillEllipse(new Rect(cx - r, cy - r, r * 2, r * 2));

  // Top highlight — feathered white ellipse, suggests light from above
  const hlW = r * 1.1;
  const hlH = r * 0.55;
  const hlCx = cx;
  const hlCy = cy - r * 0.4;
  for (let i = 8; i >= 1; i--) {
    const grow = i * 0.9;
    ctx.setFillColor(new Color("#FFFFFF", 0.035));
    ctx.fillEllipse(
      new Rect(
        hlCx - hlW / 2 - grow,
        hlCy - hlH / 2 - grow,
        hlW + grow * 2,
        hlH + grow * 2,
      ),
    );
  }
  ctx.setFillColor(new Color("#FFFFFF", 0.16));
  ctx.fillEllipse(
    new Rect(hlCx - hlW * 0.35, hlCy - hlH * 0.35, hlW * 0.7, hlH * 0.7),
  );

  return ctx.getImage();
}

function drawLockCircle() {
  // Lock Screen accessoryCircular is monochrome — system tints content.
  // Just fill the available area with a solid disc.
  const size = 200;
  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  ctx.setFillColor(new Color("#FFFFFF"));
  ctx.fillEllipse(new Rect(6, 6, size - 12, size - 12));
  return ctx.getImage();
}
