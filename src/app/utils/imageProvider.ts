type FactoryConfigs = {
  secret: string;
  url: string;
};

/**
 * Converts an url into base 64 and removes unsafe characters
 * @param url URL you want to convert.
 * @returns a base64 string
 */
const safeBase64Url = (url: string) => {
  if (typeof window === 'undefined') {
    return Buffer.from(url).toString('base64').replace('+', '-').replace('/', '_').replace(/=+$/, '')
  }
  return window.btoa(url).replace('+', '-').replace('/', '_').replace(/=+$/, '')
}

/**
 * This image provider will use imgproxy to process images according to our necessities
 * Passing the configuration
 * @param config necessary configuration in order for the imgproxy service to work
 * @returns an image provider method of the type ImageProvider
 */
const imageProviderImgProxyFactory =
  (config: FactoryConfigs): ImageProvider =>
  (url: string, size: [number, number], processingOptions = {}) => {
    const [imageWidth, imageHeight] = size;
    const defaultProcessingOptions = {
      rs: `fit:${imageWidth}:${imageHeight}:0:0`,
      dpr: 1,
    };

    const extraProcessingOptions = {
      ...defaultProcessingOptions,
      ...processingOptions,
    };

    const paramsForProcessingOptions = Object.keys(
      extraProcessingOptions
    ).reduce((acc, processingParam) => {
      return (acc += `${processingParam}:${
        (extraProcessingOptions as Record<string, string | number>)[
          processingParam
        ]
      }/`);
    }, "");

    const imageSrc = `${config.url}${safeBase64Url(
      `${btoa(config.secret)}|/${paramsForProcessingOptions}${safeBase64Url(
        url
      )}.jpeg`
    )}`;
    return imageSrc;
  };

export type SizeType =
  | 'extraLarge'
  | 'large'
  | 'main'
  | 'medium'
  | 'small'
  | 'mobileLarge'
  | 'mobileMedium'
  | 'mobileSmall'
  | 'gridPrimary'
  | 'gridSecondary'

export const SIZES: Record<SizeType, [number, number]> = {
  extraLarge: [740, 393],
  large: [615, 340],
  main: [292, 284],
  medium: [59, 59],
  small: [38, 38],
  mobileLarge: [620, 176],
  mobileMedium: [620, 152],
  mobileSmall: [126, 152],
  gridPrimary: [456, 330],
  gridSecondary: [228, 162]
}

export type ImageProvider = (
  url: string,
  size: [number, number],
  /**
   * You can use any of the processing options available to imgproxy
   * as key:value options
   * Example:
   * To adjust dpr to 2
   * {dpr: 2}
   * Source:
   * https://docs.imgproxy.net/generating_the_url?id=processing-options
   * */
  additionalProcessingOptions?: Record<string, any>
) => string

let imageProvider: ImageProvider

export function getImageProvider() {
  if (typeof imageProvider === 'undefined') {
    imageProvider = imageProviderImgProxyFactory({
      secret: process.env.NEXT_PUBLIC_IMAGE_RESIZE_SERVICE_SECRET as string,
      url: process.env.NEXT_PUBLIC_IMAGE_RESIZE_SERVICE_URL as string
    })
  }

  return imageProvider
}

