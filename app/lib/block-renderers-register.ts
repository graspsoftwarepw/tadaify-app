/**
 * block-renderers-register — central import-side-effects file that registers
 * every per-block-type renderer into `block-render-registry`.
 *
 * The route `app/routes/$handle.tsx` imports this module at top level so that
 * by the time the loader runs, every registered renderer is available to
 * `getBlockRenderer(block.block_type)`. Future per-type stories (image,
 * countdown, podcast, …) add ONE more import below — no other surface changes.
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56) — registers the `link`
 * renderer. Phase 1 left the registry empty; this is the first per-type
 * binding to ship.
 */

import { registerBlockRenderer } from "~/lib/block-render-registry";
import { LinkBlockRenderer } from "~/components/blocks/public/LinkBlockRenderer";
import { ProductBlockRenderer } from "~/components/blocks/public/ProductBlockRenderer";
import { HeadingBlockRenderer } from "~/components/blocks/public/HeadingBlockRenderer";
import { DividerBlockRenderer } from "~/components/blocks/public/DividerBlockRenderer";
import { ImageBlockRenderer } from "~/components/blocks/public/ImageBlockRenderer";
import { VideoBlockRenderer } from "~/components/blocks/public/VideoBlockRenderer";
import { AccordionBlockRenderer } from "~/components/blocks/public/AccordionBlockRenderer";
import { SocialBlockRenderer } from "~/components/blocks/public/SocialBlockRenderer";
import { EmbedBlockRenderer } from "~/components/blocks/public/EmbedBlockRenderer";

registerBlockRenderer("link", LinkBlockRenderer);
registerBlockRenderer("product", ProductBlockRenderer);
registerBlockRenderer("heading", HeadingBlockRenderer);
registerBlockRenderer("divider", DividerBlockRenderer);
registerBlockRenderer("image", ImageBlockRenderer);
registerBlockRenderer("video", VideoBlockRenderer);
registerBlockRenderer("accordion", AccordionBlockRenderer);
registerBlockRenderer("social", SocialBlockRenderer);
registerBlockRenderer("embed", EmbedBlockRenderer);
