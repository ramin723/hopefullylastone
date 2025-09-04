declare module 'qrcode' {
  interface QRCodeOptions {
    type?: 'svg' | 'png' | 'canvas';
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    scale?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    width?: number;
  }

  function toString(text: string, options?: QRCodeOptions): Promise<string>;
  function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  function toCanvas(text: string, options?: QRCodeOptions): Promise<HTMLCanvasElement>;

  export default {
    toString,
    toDataURL,
    toCanvas
  };
}
