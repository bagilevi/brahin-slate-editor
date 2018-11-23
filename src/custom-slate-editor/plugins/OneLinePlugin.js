const isEnter = (e) => e.keyCode === 13;

const plugins = [
  {
    onKeyDownTODO: (event, change) => {
      if (isEnter(event)) {
        event.preventDefault();
        event.stopPropagation();
        return change;
      }
    },

  }
]

export default function ImagePlugin(options) {
  return {
    plugins,
  }
}
