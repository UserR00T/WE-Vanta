const effects = [
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
// Keeps track of the current effect
let current;
// Current effect name in format like effects
let effect;
// Props that are for a different effect than the one currently active, most likely a sign that the effect has been changed and will require props in the near future
let newProps = {};

window.wallpaperPropertyListener = {
  applyUserProperties: (properties) => {
    // If the effect property was provided, make sure to configure it
    if (properties.effect) {
      // If a effect has already been loaded, destroy first
      if (current) {
        current.destroy();
      }
      // Load the current effect and place a reference to it in the "current" variable
      current = VANTA[properties.effect.value]('#vanta');
      effect = properties.effect.value;

      // Load any props that were set before this (effect) property was set
      if (newProps && Object.keys(newProps).length) {
        // Can safely overwrite as 'effect' will be the only property listed in this event
        properties = newProps;
        newProps = {};
      }
    }
    for (const [key, value] of Object.entries(properties)) {
      const parts = key.split('_');
      // Each key has the effect name in the first part of the key, so that it can be checked if it's a valid config option
      if (!effects.includes(parts[0].toUpperCase())) {
        continue;
      }
      // Current effect not set, invalid state; short
      if (!current) {
        continue;
      }
      // Not for this currently applied effect, can however be saved for upcoming effect
      if (parts[0].toUpperCase() !== effect) {
        newProps[key] = value;
        continue;
      }
      // Copy object reference to local variable to make it a bit easier to modify
      const options = current.options;
      // If value type is a color, "Un-normalize" color value
      if (value.type === 'color') {
        const customColor = value.value.split(' ').map((c) => {
          return Math.ceil(c * 255);
        });
        value.value = `rgb(${customColor})`;
      }
      // Execute a case insensitive search on the options key as Wallpaper Engine converts all keys to lowercase, even when camelCase is used
      options[Object.keys(options).find((k) => k.toLowerCase() === parts[1].toLowerCase())] = value.value;
      // Ask VantaJS to set our new options
      current.setOptions(options);
    }
  },
};
