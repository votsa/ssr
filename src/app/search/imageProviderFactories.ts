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


type FactoryConfigs = {
  secret: string;
  url: string;
};

/**
 * Converts an url into base 64 and removes unsafe characters
 * @param url URL you want to convert.
 * @returns a base64 string
 */
export const safeBase64Url = (url: string) => {
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
export const imageProviderImgProxyFactory =
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
