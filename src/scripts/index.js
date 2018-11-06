import '../styles/index.scss';
import * as Quill from 'quill';
import {RdImageBlot} from './rd-image/rd-image';

const quill = new Quill('#editor', {
    theme: 'snow',
});
window.quill = quill;

Quill.register(RdImageBlot);

let a = false;
document.querySelector('body').addEventListener('click', function () {
    if (!a) {
        let range = quill.getSelection(true);
        quill.insertText(range.index, '\n', Quill.sources.USER);
        quill.insertEmbed(range.index + 1, 'rd-image', {coucou:3}, Quill.sources.USER);
        quill.setSelection(range.index + 2, Quill.sources.SILENT);
        a = true;
    }
});
