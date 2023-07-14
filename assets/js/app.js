class WEVanta {
  properties = {};
  get typeConverters() {
    return {
      color: (value) => {
        const unNormalized = value.split(' ').map((c) => {
          return Math.ceil(c * 255);
        });
        return `rgb(${unNormalized})`;
      },
    };
  }
  get #effects() {
    return [
      'FOG',
      'WAVES',
      'CELLS',
      'CLOUDS',
      'CLOUDS2',
      'BIRDS',
      'NET',
      'GLOBE',
      'DOTS',
      'RINGS',
      'HALO',
      'RIPPLE',
      // 'TRUNK', // -> constructor error
      // 'TOPOLOGY', // -> constructor error
    ];
  }

  constructor() {
    window.wallpaperPropertyListener = {
      applyUserProperties: (p) => this.updated(p),
    };
  }

  updated(properties) {
    console.debug('updated', properties);
    // Re-render vanta in the event the 'effect' property was changed
    if (properties.effect) {
      this.updatedEffect(properties.effect);
    }
    // Select all properties to update if effect changed - properties.effect set, & provided properties is exactly 1 (not a reset properties/init event), & this.properties is not empty
    for (const [key, data] of Object.entries(
      properties.effect && Object.keys(properties).length === 1 && Object.keys(this.properties || {}).length ? this.properties : properties
    )) {
      this.properties[key] = data;
      this.updatedSingle(key, data);
    }
  }

  updatedEffect({ value }) {
    if (VANTA.current) {
      VANTA.current.destroy();
    }
    VANTA[value]('#vanta');
    // This should be done by Vanta, but unfortunately does not seem to be implemented as of writing this
    VANTA.current.name = value;

    // Monkey patch the onMouseMove event, as this does not seem to abide the `mouseControls` property.
    // In a perfect world this should instead just unsubscribe from the event, but it was late and patching some code upstream always sounds fun.
    const original = VANTA.current.onMouseMove.bind(VANTA.current);
    VANTA.current.onMouseMove = (e) => {
      if (!VANTA.current.options.mouseControls) {
        return;
      }

      original(e);
    }
  }

  updatedSingle(key, { type, value }) {
    // Current effect not set, invalid state; short
    if (!VANTA.current) {
      return;
    }
    // Each key has the effect name in the first part of the key, so that it can be checked if it's a valid config option
    const [effectName, keyUpdate] = key.split('_').map((x) => x.toUpperCase());
    if (effectName !== 'ANY' && !this.#effects.includes(effectName)) {
      return;
    }
    // Not for this currently applied effect
    if (effectName !== 'ANY' && effectName !== VANTA.current.name) {
      return;
    }
    // Copy object reference to local variable to make it a bit easier to modify
    const { options } = VANTA.current;
    // Convert if type converter was found
    if (type in this.typeConverters) {
      value = this.typeConverters[type](value);
    }
    // Execute a case insensitive search on the options key as Wallpaper Engine converts all keys to lowercase, even when camelCase is used
    options[Object.keys(options).find((k) => k.toUpperCase() === keyUpdate)] = value;
    // Ask VantaJS to set our new options
    VANTA.current.setOptions(options);
  }
}

window.WEVanta = new WEVanta();
