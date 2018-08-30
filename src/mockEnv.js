const env = {
  ui: {
    prompt: (title, defaultValue) => Promise.resolve(window.prompt(title, defaultValue)),
  },
  linking: {
    getLinkPropertiesForInsertion: () => (new Promise((resolve, reject) => {
      resolve({
        label: window.prompt('label'),
        href: window.prompt('href'),
      })
    })),
    followLink: (link, opts = {}) => {
      if (opts.ifNewResource) return;
      window.location.href = link.href;
    },
  },
  editDiagram: (() => { alert('editDiagram stub not implemented') }),
}
export default env;
