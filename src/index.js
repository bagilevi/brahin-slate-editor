if (window.Memonite) {
  console.log('memonite-slate: Memonite defined')
  require('./index-memonite')
} else {
  console.log('memonite-slate: Memonite not defined, using development mode')
  require('./index-development')
}
