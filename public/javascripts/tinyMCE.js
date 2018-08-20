$(document).ready(() => {
  tinymce.init({
    selector: '#job-description-textarea',
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
    toolbar: 'link undo redo styleselect bold italic outdent indent bullist numlist',
    content_css: [
      'http://englishinchina.co/stylesheets/style.css',
    ],
  });
});
