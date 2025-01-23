import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

export default class CustomEditor extends ClassicEditor {
     static  builtinPlugins = [
        Essentials,
        Paragraph,
        Bold,
        Italic,
        Alignment
    ];

    public static override defaultConfig = {
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                '|',
                'alignment',
                '|',
                'undo',
                'redo'
            ]
        },
        alignment: {
            options: ['left', 'right', 'center', 'justify']
        }
    };
}
