import {SubtitleRegionContainer, SubtitleCueBoxContainer} from './subtitleoverlay';
import { VTTProperties, VTTRegionProperties } from 'bitmovin-player/types/subtitles/vtt/API';

type Direction = 'top' | 'bottom' | 'left' | 'right';

const lineHeight = 28;

const DirectionPair = new Map<Direction, Direction>([
  ['top', 'bottom'],
  ['left', 'right'],
  ['right', 'left'],
]);

/**
 * Sets the default standardized styles for the Cue Box
 * https://w3.org/TR/webvtt1/#applying-css-properties
 */
const setDefaultVttStyles = (cueContainer: SubtitleCueBoxContainer | SubtitleRegionContainer) => {
  cueContainer.getDomElement().css('unicode-bidi', 'plaintext');
  cueContainer.getDomElement().css('overflow-wrap', 'break-word');
  cueContainer.getDomElement().css('text-wrap', 'balance');
  cueContainer.getDomElement().css('white-space', 'pre-line');
};

/**
 * Align the Cue Box's line
 * https://w3.org/TR/webvtt1/#webvtt-cue-line-alignment
 */
const setVttLineAlign = (cueContainer: SubtitleCueBoxContainer | SubtitleRegionContainer, {lineAlign}: VTTProperties, direction: Direction) => {
  if (lineAlign != null && lineAlign === 'center') {
    cueContainer.getDomElement().css(`margin-${direction}`, `${-lineHeight / 2}px`);
  } else if (lineAlign != null && lineAlign === 'end') {
    cueContainer.getDomElement().css(`margin-${direction}`, `${-lineHeight}px`);
  }
};

/**
 * Defines the positioning of the Cue Box
 * https://w3.org/TR/webvtt1/#webvtt-cue-line
 */
const setVttLine = (cueContainer: SubtitleCueBoxContainer | SubtitleRegionContainer, vtt: VTTProperties, direction: Direction) => {
  if (vtt.line != null && typeof vtt.line === 'number' && !vtt.snapToLines) {
    cueContainer.getDomElement().css(direction, `${vtt.line}%`);
    cueContainer.getDomElement().css(DirectionPair.get(direction), 'unset');

    setVttLineAlign(cueContainer, vtt, direction);
  } else if (vtt.line != null && typeof vtt.line === 'number' && vtt.snapToLines && vtt.line > 0) {
    cueContainer.getDomElement().css(direction, `${vtt.line * lineHeight}px`);
    cueContainer.getDomElement().css(DirectionPair.get(direction), 'unset');

    setVttLineAlign(cueContainer, vtt, direction);
  } else if (vtt.line != null && typeof vtt.line === 'number' && vtt.snapToLines && vtt.line < 0) {
    cueContainer.getDomElement().css(DirectionPair.get(direction), `${vtt.line * -lineHeight}px`);
    cueContainer.getDomElement().css(direction, 'unset');

    setVttLineAlign(cueContainer, vtt, DirectionPair.get(direction));
  }
};

/**
 * Defines the writing direction of the Cue Box
 * https://w3.org/TR/webvtt1/#webvtt-cue-writing-direction
 */
const setVttWritingDirection = (cueContainer: SubtitleCueBoxContainer | SubtitleRegionContainer, vtt: VTTProperties) => {
  if (vtt.vertical === '') {
    cueContainer.getDomElement().css('writing-mode', 'horizontal-tb');
    setVttLine(cueContainer, vtt, 'top');
  } else if (vtt.vertical === 'lr') {
    cueContainer.getDomElement().css('writing-mode', 'vertical-lr');
    cueContainer.getDomElement().css('left', 'unset');
    cueContainer.getDomElement().css('right', '0');

    setVttLine(cueContainer, vtt, 'right');
  } else if (vtt.vertical === 'rl') {
    cueContainer.getDomElement().css('writing-mode', 'vertical-rl');
    cueContainer.getDomElement().css('left', '0');
    cueContainer.getDomElement().css('right', 'unset');

    setVttLine(cueContainer, vtt, 'left');
  }
};

/**
 * Defines the Cue position alignment
 * https://w3.org/TR/webvtt1/#webvtt-cue-position-alignment
 */
const setVttPositionAlign = (cueContainer: SubtitleCueBoxContainer | SubtitleRegionContainer, vtt: VTTProperties, direction: Direction) => {
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
      break;
  }
};

export const setVttCueBoxStyles = (cueContainer: SubtitleCueBoxContainer | SubtitleRegionContainer, vtt: VTTProperties) => {
  setDefaultVttStyles(cueContainer);

  setVttWritingDirection(cueContainer, vtt);

  // https://w3.org/TR/webvtt1/#webvtt-cue-text-alignment
  const textAlign = vtt.align === 'middle' ? 'center' : vtt.align;
  cueContainer.getDomElement().css('text-align', textAlign);

  // https://w3.org/TR/webvtt1/#webvtt-cue-size
  const containerSize = vtt.size;
  if (vtt.position !== 'auto' && vtt.vertical == null) {
    cueContainer.getDomElement().css('width', `${containerSize}%`);
    cueContainer.getDomElement().css('left', 'unset');
    cueContainer.getDomElement().css('right', 'unset');
    setVttPositionAlign(cueContainer, vtt, 'left');
  } else if (vtt.position !== 'auto' && vtt.vertical != null) {
    cueContainer.getDomElement().css('height', `${containerSize}%`);
    setVttPositionAlign(cueContainer, vtt, 'top');
  }
};

// https://www.w3.org/TR/webvtt1/#regions
export const setVttRegionStyles = (regionContainer: SubtitleRegionContainer | SubtitleRegionContainer, region: VTTRegionProperties, overlaySize: {width: number, height: number}) => {
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
