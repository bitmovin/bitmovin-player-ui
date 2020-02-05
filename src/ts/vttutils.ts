import { SubtitleRegionContainer, SubtitleLabel } from './components/subtitleoverlay';
import { VTTProperties, VTTRegionProperties } from 'bitmovin-player/types/subtitles/vtt/API';

// Our default height of a line
const lineHeight = 28;

enum Direction {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

const DirectionPair = new Map<Direction, Direction>([
  [Direction.Top, Direction.Bottom],
  [Direction.Left, Direction.Right],
  [Direction.Right, Direction.Left],
]);

/**
 * Sets the default standardized styles for the Cue Box
 * https://w3.org/TR/webvtt1/#applying-css-properties
 */
const setDefaultVttStyles = (cueContainer: SubtitleLabel) => {
  if (cueContainer.vtt.region) {
    cueContainer.getDomElement().css('position', 'relative');
    cueContainer.getDomElement().css('unicode-bidi', 'plaintext');
  } else {
    cueContainer.getDomElement().css('position', 'absolute');
    cueContainer.getDomElement().css('overflow-wrap', 'break-word');
    cueContainer.getDomElement().css('overflow', 'hidden');
    cueContainer.getDomElement().css('display', 'inline-flex');
    cueContainer.getDomElement().css('flex-flow', 'column');
    cueContainer.getDomElement().css('justify-content', 'flex-end');
  }
};

/**
 * Align the Cue Box's line
 * https://w3.org/TR/webvtt1/#webvtt-cue-line-alignment
 */
const setVttLineAlign = (cueContainer: SubtitleLabel, { lineAlign }: VTTProperties, direction: Direction) => {
  switch (lineAlign) {
    case 'center':
      cueContainer.getDomElement().css(`margin-${direction}`, `${-lineHeight / 2}px`);
      break;
    case 'end':
      cueContainer.getDomElement().css(`margin-${direction}`, `${-lineHeight}px`);
  }
};

/**
 * Defines the line positioning of the Cue Box
 * https://w3.org/TR/webvtt1/#webvtt-cue-line
 */
const setVttLine = (cueContainer: SubtitleLabel, vtt: VTTProperties, direction: Direction) => {
  if (vtt.line !== 'auto') {
    if (!vtt.snapToLines) {
      cueContainer.getDomElement().css(direction, vtt.line as string);
      cueContainer.getDomElement().css(DirectionPair.get(direction), 'unset');

      setVttLineAlign(cueContainer, vtt, direction);
    } else if (vtt.snapToLines && vtt.line > 0) {
      cueContainer.getDomElement().css(direction, `${vtt.line as number * lineHeight}px`);
      cueContainer.getDomElement().css(DirectionPair.get(direction), 'unset');

      setVttLineAlign(cueContainer, vtt, direction);
    } else if (vtt.snapToLines && vtt.line < 0) {
      cueContainer.getDomElement().css(DirectionPair.get(direction), `${vtt.line as number * -lineHeight}px`);
      cueContainer.getDomElement().css(direction, 'unset');

      setVttLineAlign(cueContainer, vtt, DirectionPair.get(direction));
    }
  }
};

/**
 * Defines the writing direction of the Cue Box
 * https://w3.org/TR/webvtt1/#webvtt-cue-writing-direction
 */
const setVttWritingDirection = (cueContainer: SubtitleLabel, vtt: VTTProperties) => {
  if (vtt.vertical === '') {
    cueContainer.getDomElement().css('writing-mode', 'horizontal-tb');
    setVttLine(cueContainer, vtt, Direction.Top);
  } else if (vtt.vertical === 'lr') {
    cueContainer.getDomElement().css('writing-mode', 'vertical-lr');
    cueContainer.getDomElement().css('left', 'unset');
    cueContainer.getDomElement().css('right', '0');
    setVttLine(cueContainer, vtt, Direction.Right);
  } else if (vtt.vertical === 'rl') {
    cueContainer.getDomElement().css('writing-mode', 'vertical-rl');
    cueContainer.getDomElement().css('left', '0');
    cueContainer.getDomElement().css('right', 'unset');
    setVttLine(cueContainer, vtt, Direction.Left);
  }
};

/**
 * Defines the Cue position alignment
 * https://w3.org/TR/webvtt1/#webvtt-cue-position-alignment
 */
const setVttPositionAlign = (cueContainer: SubtitleLabel, vtt: VTTProperties, direction: Direction) => {
  switch (vtt.positionAlign) {
    case 'line-left':
      cueContainer.getDomElement().css(direction, `${vtt.position}%`);
      cueContainer.getDomElement().css(DirectionPair.get(direction), 'auto');
      break;
    case 'center':
      cueContainer.getDomElement().css(direction, `${vtt.position as number - (vtt.size || 100)}%`);
      cueContainer.getDomElement().css(DirectionPair.get(direction), 'auto');
      break;
    case 'line-right':
      cueContainer.getDomElement().css(direction, 'auto');
      cueContainer.getDomElement().css(DirectionPair.get(direction), `${vtt.position}%`);
      break;
    default:
      cueContainer.getDomElement().css(direction, `${vtt.position}%`);
      cueContainer.getDomElement().css(DirectionPair.get(direction), 'auto');
  }
};

export namespace VttUtils {
  export const setVttCueBoxStyles = (cueContainer: SubtitleLabel, vtt: VTTProperties) => {
    setDefaultVttStyles(cueContainer);

    setVttWritingDirection(cueContainer, vtt);

    // https://w3.org/TR/webvtt1/#webvtt-cue-text-alignment
    const textAlign = vtt.align === 'middle' ? 'center' : vtt.align;
    cueContainer.getDomElement().css('text-align', textAlign);

    // https://www.w3.org/TR/webvtt1/#webvtt-cue-position
    if (vtt.position === 'auto') {
      cueContainer.getDomElement().css('left', '0');
      cueContainer.getDomElement().css('bottom', '0');
    }

    // https://w3.org/TR/webvtt1/#webvtt-cue-size
    const containerSize = vtt.size;
    if (vtt.vertical === '') {
      cueContainer.getDomElement().css('width', `${containerSize}%`);
      setVttPositionAlign(cueContainer, vtt, Direction.Left);
    } else {
      cueContainer.getDomElement().css('height', `${containerSize}%`);
      setVttPositionAlign(cueContainer, vtt, Direction.Top);
    }
  };

  /** https://www.w3.org/TR/webvtt1/#regions
   *  https://www.speechpad.com/captions/webvtt#toc_16
   */
  export const setVttRegionStyles = (regionContainer: SubtitleRegionContainer, region: VTTRegionProperties, overlaySize: { width: number, height: number }) => {
    const regionPositionX = overlaySize.width * region.viewportAnchorX / 100 - ((overlaySize.width * region.width / 100) * region.regionAnchorX / 100);
    const regionPositionY = overlaySize.height * region.viewportAnchorY / 100 - ((region.lines * lineHeight) * region.regionAnchorY / 100);
    regionContainer.getDomElement().css('position', 'absolute');
    regionContainer.getDomElement().css('overflow', 'hidden');
    regionContainer.getDomElement().css('width', `${region && region.width ? region.width : 100}%`);
    regionContainer.getDomElement().css('left', `${regionPositionX}px`);
    regionContainer.getDomElement().css('right', 'unset');
    regionContainer.getDomElement().css('top', `${regionPositionY}px`);
    regionContainer.getDomElement().css('bottom', 'unset');
    regionContainer.getDomElement().css('height', `${region && region.lines ? region.lines * lineHeight : 3 * lineHeight}px`);
  };
}
