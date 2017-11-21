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
    plugins: 'link paste',
    paste_as_text: true,
    toolbar: 'link undo redo styleselect bold italic outdent indent bullist numlist',
    content_css: [
      'http://englishinchina.co/stylesheets/style.css',
    ],
  });
});
