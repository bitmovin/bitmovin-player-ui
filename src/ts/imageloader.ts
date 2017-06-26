import {DOM} from './dom';

export interface ImageLoadedCallback {
  (url: string, width: number, height: number): void;
}

interface ImageLoaderState {
  url: string,
  image: DOM;
  loadedCallback: ImageLoadedCallback;
  loaded: boolean;
  width: number;
  height: number;
}

/**
 * Tracks the loading state of images.
 */
export class ImageLoader {

  private state: { [url: string]: ImageLoaderState; } = {};

  /**
   * Loads an image and call the callback once the image is loaded. If the image is already loaded, the callback
   * is called immediately, else it is called once loading has finished. Calling this method multiple times for the
   * same image while it is loading calls only let callback passed into the last call.
   * @param url The url to the image to load
   * @param loadedCallback The callback that is called when the image is loaded
   */
  load(url: string, loadedCallback: ImageLoadedCallback): void {
    if (!this.state[url]) {
      // When the image was never attempted to be loaded before, we create a state and store it in the state map
      // for later use when the same image is requested to be loaded again.
      let state: ImageLoaderState = {
        url: url,
        image: new DOM('img', {}),
        loadedCallback: loadedCallback,
        loaded: false,
        width: 0,
        height: 0,
      };
      this.state[url] = state;

      // We need to add the image element to the DOM to get the size of the loaded image
      new DOM('body').append(state.image);

      // Listen to the load event, update the state and call the callback once the image is loaded
      state.image.on('load', (e) => {
        state.loaded = true;
        state.width = state.image.width();
        state.height = state.image.height();

        // We can safely remove the image from the DOM once the image is loaded and the size extracted
        state.image.remove();

        this.callLoadedCallback(state);
      });

      // Set the image URL to start the loading
      state.image.attr('src', state.url);
    } else {
      // We have a state for the requested image, so it is either already loaded or currently loading
      let state = this.state[url];

      // We overwrite the callback to make sure that only the callback of the latest call gets executed.
      // Earlier callbacks become invalid once a new load call arrives, and they are not called as long as the image
      // is not loaded.
      state.loadedCallback = loadedCallback;

      // When the image is already loaded, we directly execute the callback instead of waiting for the load event
      if(state.loaded) {
        this.callLoadedCallback(state);
      }
    }
  }

  private callLoadedCallback(state: ImageLoaderState): void {
    state.loadedCallback(state.url, state.width, state.height);
  }
}
