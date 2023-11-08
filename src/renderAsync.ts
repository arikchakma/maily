import { JSONContent, Maily, RenderOptions } from './maily';

export async function renderAsync(
  content: JSONContent,
  options?: RenderOptions
): Promise<string> {
  const maily = new Maily(content);
  return maily.renderAsync(options);
}
