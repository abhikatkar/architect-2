/**
 * The four options of the App preview switcher, and the geometry of the three
 * device frames.
 *
 * "auto" is the default and means "match the panel you are in".
 *
 * A server component cannot measure the viewport, and this product works with
 * no JavaScript, so the previous attempt at "phone under 640px" could only
 * have been a lie: it was a function whose docblock promised width detection,
 * whose body did nothing, and which nothing ever called. Two rounds of review
 * reported the bug it was supposed to have fixed.
 *
 * Auto is CSS instead of detection: phone width below 640px, full width above,
 * with no measurement and no JavaScript. The explicit options still override,
 * and each of those three draws a real frame around the app (D65).
 */
export const DEVICES = ["auto", "phone", "tablet", "desktop"] as const;
export type Device = (typeof DEVICES)[number];

/** The three that draw a frame. Auto deliberately does not. */
export type FramedDevice = Exclude<Device, "auto">;

export function parseDevice(value: string | string[] | undefined): Device {
  const v = Array.isArray(value) ? value[0] : value;
  return DEVICES.includes(v as Device) ? (v as Device) : "auto";
}

export const DEVICE_LABEL: Record<Device, string> = {
  auto: "Auto",
  phone: "Phone",
  tablet: "Tablet",
  desktop: "Desktop",
};

/**
 * What the switcher announces. The visible label is one word, because the row
 * has to fit a 390px canvas, so the label a screen reader reads says what the
 * option actually does.
 */
export const DEVICE_ARIA: Record<Device, string> = {
  auto: "Preview at the width of this panel",
  phone: "Preview in a phone frame",
  tablet: "Preview in a tablet frame",
  desktop: "Preview in a desktop browser frame",
};

export type FrameGeometry = {
  /** Inner width of the screen. This is the width the app lays out at. */
  width: number;
  /** Inner height of the screen, status bar and browser chrome excluded. */
  height: number;
  /** The body around the screen, on all four sides. */
  bezel: number;
  /** Outer corner radius of the body. */
  radius: number;
  /** Hairline edge of the body, counted into the outer box. */
  border: number;
  /** Browser chrome above the screen: dots and address bar. Desktop only. */
  chrome: number;
  /** Status bar strip inside the screen: time, signal, battery. Phone only. */
  status: number;
};

/**
 * Generic devices, drawn from these six numbers and nothing else.
 *
 * Not a copy of any real product: no notch, no island, no camera dot, no
 * traffic light colours, no home button. A phone is a tall rounded slab with a
 * thin bezel and a status strip, a tablet is a wider slab with a thicker one,
 * and a desktop is a browser window. That is as far as the resemblance goes,
 * and it is as far as it needs to go for a preview to read as a device.
 *
 * The widths are the numbers the request named. The heights are the one place a
 * judgement was made: the phone is 2:1 and the desktop screen is 16:9, both
 * common, and the tablet is a 4:3 slate the wide way round. A 3:4 slate at this
 * width would be 1093px of screen holding about 450px of app, and a preview
 * that is two thirds empty is a worse answer than a frame in proportions the
 * panel can hold. Photographed both ways before choosing. See D65.
 *
 * Bezels are on the 4px spacing scale. Radii are not on the radius scale on
 * purpose: a device corner is geometry rather than interface hierarchy, and the
 * glass radius below follows the bezel, because a bezel curves on the inside
 * too. See D65.
 */
export const DEVICE_FRAMES: Record<FramedDevice, FrameGeometry> = {
  phone: {
    width: 390,
    height: 752,
    bezel: 12,
    radius: 44,
    border: 0,
    chrome: 0,
    status: 28,
  },
  tablet: {
    width: 820,
    height: 616,
    bezel: 24,
    radius: 40,
    border: 0,
    chrome: 0,
    status: 0,
  },
  desktop: {
    width: 1280,
    height: 720,
    bezel: 0,
    radius: 12,
    border: 1,
    chrome: 40,
    status: 0,
  },
};

/**
 * The outer box, which is the thing that has to fit the canvas, and the glass
 * radius inside the bezel.
 *
 * Derived rather than stored beside the parts, for the same reason the spend
 * total is (D57): two numbers that have to agree are one number and an
 * arithmetic. The CSS reads these through two custom properties, and
 * scripts/device-check.mjs asserts the painted box against them.
 */
export function frameBox(device: FramedDevice) {
  const f = DEVICE_FRAMES[device];
  return {
    width: f.width + 2 * f.bezel + 2 * f.border,
    height: f.height + f.status + f.chrome + 2 * f.bezel + 2 * f.border,
    glassRadius: Math.max(0, f.radius - f.bezel),
  };
}

/**
 * One line under the switcher saying what the current option does.
 *
 * The width comes out of the table above rather than being typed into the copy,
 * so the sentence cannot end up claiming a width the CSS does not use.
 */
export function deviceNote(device: Device): string {
  if (device === "auto") {
    return "No frame. The app lays out at the width of this panel.";
  }
  return `${DEVICE_LABEL[device]} frame. The app inside lays out at ${DEVICE_FRAMES[device].width} px on any screen, and the frame scales down to fit this panel.`;
}
