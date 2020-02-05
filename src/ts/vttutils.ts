import { SubtitleRegionContainer, SubtitleLabel } from './components/subtitleoverlay';
import { VTTProperties, VTTRegionProperties } from 'bitmovin-player/types/subtitles/vtt/API';
import { DOM } from './dom';

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
const setDefaultVttStyles = (cueContainerDom: DOM, vtt: VTTProperties) => {
  if (vtt.region) {
    cueContainerDom.css('position', 'relative');
    cueContainerDom.css('unicode-bidi', 'plaintext');
  } else {
    cueContainerDom.css('position', 'absolute');
    cueContainerDom.css('overflow-wrap', 'break-word');
    cueContainerDom.css('overflow', 'hidden');
    cueContainerDom.css('display', 'inline-flex');
    cueContainerDom.css('flex-flow', 'column');
    cueContainerDom.css('justify-content', 'flex-end');
  }
};

/**
 * Align the Cue Box's line
 * https://w3.org/TR/webvtt1/#webvtt-cue-line-alignment
 */
const setVttLineAlign = (cueContainerDom: DOM, { lineAlign }: VTTProperties, direction: Direction) => {
  switch (lineAlign) {
    case 'center':
      cueContainerDom.css(`margin-${direction}`, `${-lineHeight / 2}px`);
      break;
    case 'end':
      cueContainerDom.css(`margin-${direction}`, `${-lineHeight}px`);
  }
};

/**
 * Defines the line positioning of the Cue Box
 * https://w3.org/TR/webvtt1/#webvtt-cue-line
 */
const setVttLine = (cueContainerDom: DOM, vtt: VTTProperties, direction: Direction) => {
  if (vtt.line !== 'auto') {
    if (!vtt.snapToLines) {
      cueContainerDom.css(direction, vtt.line as string);
      cueContainerDom.css(DirectionPair.get(direction), 'unset');
      setVttLineAlign(cueContainerDom, vtt, direction);
    } else if (vtt.snapToLines && vtt.line > 0) {
      cueContainerDom.css(direction, `${vtt.line as number * lineHeight}px`);
      cueContainerDom.css(DirectionPair.get(direction), 'unset');
      setVttLineAlign(cueContainerDom, vtt, direction);
    } else if (vtt.snapToLines && vtt.line < 0) {
      cueContainerDom.css(DirectionPair.get(direction), `${vtt.line as number * -lineHeight}px`);
      cueContainerDom.css(direction, 'unset');
      setVttLineAlign(cueContainerDom, vtt, DirectionPair.get(direction));
    }
  }
};

/**
 * Defines the writing direction of the Cue Box
 * https://w3.org/TR/webvtt1/#webvtt-cue-writing-direction
 */
const setVttWritingDirection = (cueContainerDom: DOM, vtt: VTTProperties) => {
  if (vtt.vertical === '') {
    cueContainerDom.css('writing-mode', 'horizontal-tb');
    setVttLine(cueContainerDom, vtt, Direction.Top);
  } else if (vtt.vertical === 'lr') {
    cueContainerDom.css('writing-mode', 'vertical-lr');
    cueContainerDom.css('left', 'unset');
    cueContainerDom.css('right', '0');
    setVttLine(cueContainerDom, vtt, Direction.Right);
  } else if (vtt.vertical === 'rl') {
    cueContainerDom.css('writing-mode', 'vertical-rl');
    cueContainerDom.css('left', '0');
    cueContainerDom.css('right', 'unset');
    setVttLine(cueContainerDom, vtt, Direction.Left);
  }
};

/**
 * Defines the Cue position alignment
 * https://w3.org/TR/webvtt1/#webvtt-cue-position-alignment
 */
const setVttPositionAlign = (cueContainerDom: DOM, vtt: VTTProperties, direction: Direction) => {
  switch (vtt.positionAlign) {
    case 'line-left':
      cueContainerDom.css(direction, `${vtt.position}%`);
      cueContainerDom.css(DirectionPair.get(direction), 'auto');
      break;
    case 'center':
      cueContainerDom.css(direction, `${vtt.position as number - (vtt.size || 100)}%`);
      cueContainerDom.css(DirectionPair.get(direction), 'auto');
      break;
    case 'line-right':
      cueContainerDom.css(direction, 'auto');
      cueContainerDom.css(DirectionPair.get(direction), `${vtt.position}%`);
      break;
    default:
      cueContainerDom.css(direction, `${vtt.position}%`);
      cueContainerDom.css(DirectionPair.get(direction), 'auto');
  }
};

export namespace VttUtils {
  export const setVttCueBoxStyles = (cueContainer: SubtitleLabel) => {
    const vtt = cueContainer.vtt;
    const cueContainerDom = cueContainer.getDomElement();

    setDefaultVttStyles(cueContainerDom, vtt);
    setVttWritingDirection(cueContainerDom, vtt);

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
      setVttPositionAlign(cueContainerDom, vtt, Direction.Left);
    } else {
      cueContainer.getDomElement().css('height', `${containerSize}%`);
      setVttPositionAlign(cueContainerDom, vtt, Direction.Top);
    }
  };

  /** https://www.w3.org/TR/webvtt1/#regions
   *  https://www.speechpad.com/captions/webvtt#toc_16
   */
  export const setVttRegionStyles = (regionContainer: SubtitleRegionContainer, region: VTTRegionProperties, overlaySize: { width: number, height: number }) => {
    const regionContainerDom = regionContainer.getDomElement();
    const regionPositionX = overlaySize.width * region.viewportAnchorX / 100 - ((overlaySize.width * region.width / 100) * region.regionAnchorX / 100);
    const regionPositionY = overlaySize.height * region.viewportAnchorY / 100 - ((region.lines * lineHeight) * region.regionAnchorY / 100);
    regionContainerDom.css('position', 'absolute');
    regionContainerDom.css('overflow', 'hidden');
    regionContainerDom.css('width', `${region && region.width ? region.width : 100}%`);
    regionContainerDom.css('left', `${regionPositionX}px`);
    regionContainerDom.css('right', 'unset');
    regionContainerDom.css('top', `${regionPositionY}px`);
    regionContainerDom.css('bottom', 'unset');
    regionContainerDom.css('height', `${region && region.lines ? region.lines * lineHeight : 3 * lineHeight}px`);
  };
}
