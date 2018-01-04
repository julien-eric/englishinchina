$(document).ready(() => {
  tinymce.init({
    selector: '#description-textarea',
    menubar: false,
    style_formats: [
      {title: 'Header', format: 'h3'},
    ],
    setup(editor) {
      editor.on('change', () => {
        editor.save();
      });
    },
    toolbar: 'undo redo styleselect bold italic outdent indent bullist numlist',
    content_css: [
      'http://englishinchina.co/stylesheets/style.css',
    ],
  });
});
