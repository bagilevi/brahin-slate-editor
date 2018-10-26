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

  storage: {
    saveFile: (file) => (new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        const dataURL = reader.result
        console.log('dataURL', dataURL)
        resolve({ url: dataURL })
      })
      reader.readAsDataURL(file)
    })),
  }
}
export default env;
