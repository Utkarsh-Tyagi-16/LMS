import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ input, setInput }) => {
  const editorRef = useRef(null);

  const handleEditorChange = (content) => {
    setInput((prev) => ({ ...prev, description: content }));
  };

  useEffect(() => {
    if (editorRef.current && input.description !== editorRef.current.getContent()) {
      editorRef.current.setContent(input.description || '');
    }
  }, [input.description]);

  return (
    <Editor
      apiKey="5tjh5irtb25hmb9n7l6sgwsf2fghz5je4nzyj9kqv6akpbzy"
      value={input.description} // Bind to the state so the editor gets the correct content
      onEditorChange={handleEditorChange}
      onInit={(evt, editor) => {
        editorRef.current = editor;
      }}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
          'image', 'link', 'lists', 'media', 'searchreplace', 'table',
          'visualblocks', 'wordcount', 'checklist', 'mediaembed', 'casechange',
          'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker',
          'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage',
          'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents',
          'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss',
          'markdown', 'importword', 'exportword', 'exportpdf'
        ],
        toolbar:
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
          'link image media table mergetags | addcomment showcomments | ' +
          'spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | ' +
          'emoticons charmap | removeformat',
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        mergetags_list: [
          { value: 'First.Name', title: 'First Name' },
          { value: 'Email', title: 'Email' },
        ],
        ai_request: (request, respondWith) =>
          respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
      }}
    />
  );
};

export default RichTextEditor;
