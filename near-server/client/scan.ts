import jsQR from "jsqr";
import { eip681Payment, payeeFromQr } from "../src/payee";

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

let detector: BarcodeDetectorLike | null | undefined;

function barcodeDetector(): BarcodeDetectorLike | null {
  if (detector !== undefined) return detector;
  const Ctor = (
    window as unknown as {
      BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
    }
  ).BarcodeDetector;
  if (!Ctor) {
    detector = null;
    return null;
  }
  try {
    detector = new Ctor({ formats: ["qr_code"] });
  } catch {
    detector = null;
  }
  return detector;
}

function readQr(canvas: HTMLCanvasElement, both: boolean): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "";
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(image.data, image.width, image.height, { inversionAttempts: both ? "attemptBoth" : "dontInvert" })?.data ?? "";
}

async function textFromSource(source: CanvasImageSource, canvas: HTMLCanvasElement): Promise<string> {
  const found = barcodeDetector();
  if (found) {
    try {
      const codes = await found.detect(source);
      return codes[0]?.rawValue ?? "";
    } catch {
      detector = null;
    }
  }
  if (source instanceof HTMLVideoElement) {
    if (source.readyState < 2 || !source.videoWidth) return "";
    canvas.width = source.videoWidth;
    canvas.height = source.videoHeight;
    canvas.getContext("2d")?.drawImage(source, 0, 0);
    return readQr(canvas, false);
  }
  return "";
}

async function textFromFile(file: File, canvas: HTMLCanvasElement): Promise<string> {
  const bitmap = await createImageBitmap(file);
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "";
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const found = barcodeDetector();
  if (found) {
    try {
      const codes = await found.detect(canvas);
      if (codes[0]?.rawValue) return codes[0].rawValue;
    } catch {
      detector = null;
    }
  }
  return readQr(canvas, true);
}

/** Camera scan, with a still-image fallback. Frames stay in the browser. */
export function mountAddressScanner(apply: (payee: string) => void): void {
  const openButton = document.querySelector<HTMLButtonElement>("#scan-address");
  const modal = document.querySelector<HTMLElement>("#scan-modal");
  const video = document.querySelector<HTMLVideoElement>("#scan-video");
  const note = document.querySelector<HTMLElement>("#scan-note");
  const closeButton = document.querySelector<HTMLButtonElement>("#scan-close");
  const fileButton = document.querySelector<HTMLButtonElement>("#scan-file-btn");
  const fileInput = document.querySelector<HTMLInputElement>("#scan-file");
  if (!openButton || !modal || !video || !note || !closeButton || !fileButton || !fileInput) return;

  const canvas = document.createElement("canvas");
  let generation = 0;
  let timer = 0;
  let stream: MediaStream | null = null;

  function stop(): void {
    generation += 1;
    window.clearTimeout(timer);
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      stream = null;
    }
    video!.srcObject = null;
    modal!.hidden = true;
  }

  async function tick(current: number): Promise<void> {
    if (current !== generation || !video) return;
    try {
      const text = await textFromSource(video, canvas);
      const payee = text && (eip681Payment(text) || payeeFromQr(text)) ? text : "";
      if (payee && current === generation) {
        stop();
        apply(payee);
        return;
      }
    } catch {
      // The next frame retries. A permission error is handled when the camera opens.
    }
    if (current !== generation) return;
    timer = window.setTimeout(() => {
      void tick(current);
    }, 180);
  }

  async function open(): Promise<void> {
    stop();
    const current = generation;
    modal!.hidden = false;
    note!.textContent = "Point the camera at a wallet QR code. The picture stays on this device.";
    closeButton!.focus();
    if (!navigator.mediaDevices?.getUserMedia) {
      note!.textContent = "This browser cannot open the camera. Choose an image of the QR code instead.";
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      } catch {
        if (current !== generation) return;
        note!.textContent = "Camera is unavailable. Choose an image of the QR code instead.";
        return;
      }
    }
    if (current !== generation) {
      for (const track of stream.getTracks()) track.stop();
      stream = null;
      return;
    }
    video!.srcObject = stream;
    await video!.play();
    void tick(current);
  }

  openButton.addEventListener("click", () => {
    void open();
  });
  closeButton.addEventListener("click", () => stop());
  modal.addEventListener("click", (event) => {
    if (event.target === modal) stop();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal!.hidden) stop();
  });
  fileButton.addEventListener("click", () => fileInput!.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput!.files?.[0];
    fileInput!.value = "";
    if (!file) return;
    void textFromFile(file, canvas)
      .then((text) => {
        const payee = eip681Payment(text) || payeeFromQr(text) ? text : "";
        if (!payee) {
          note!.textContent = "That image has no wallet address.";
          return;
        }
        stop();
        apply(payee);
      })
      .catch(() => {
        note!.textContent = "Could not read that image.";
      });
  });
  window.addEventListener("pagehide", () => stop());
}
