    import tomplate from 'tomplate';
    const KEY_ENTER = 13;

    export function createImageInput (image) {
        let imageInputDivision = tomplate(
            '<rd-image-input class="imageInput" contenteditable="false" ondrop="{onDrop()}" ondragover="{onDragOver()}" ondragleave="{onDragLeave()}">' +
            '<div class="block-control">' +
            '<button class="block-control-remove" onclick="{onRemove()}"><i class="mdi mdi-minus"></i></button>' +
            '</div>' +
            '<span>Importer une image</span>' +
            '<div class="imageInput-linkUrlDiv">' +
            '<input type="url" class="imageInput-linkUrl" placeholder="Depuis une URL" onpaste="{onPaste()}" onkeyup="{onKeyup()}" oninput="{onInput()}"/>' +
            '<button class="imageInput-linkUrlBtn" onclick="{onValid()}" disabled="disabled"><i class="mdi mdi-check mdi-24px"></i></button>' +
            '</div>' +
            '<span>ou</span>' +
            '<input type="file" class="imageFile" name="imageFile" id="imageFile" accept="image/*" onchange="{onChange()}" onclick="{onFileClick()}"/>' +
            '<label class="imageFile-label" for="imageFile">Depuis un fichier</label>' +
            '</rd-image-input>',
            {
                onDrop: function (event) {
                    dragAndDrop(event.dataTransfer, image);
                },
                onDragOver: function (event) {
                    imageInputDivision.classList.add('dragover');
                    event.preventDefault();
                },
                onDragLeave: function (event) {
                    if (isMouseInDivBound(event, imageInputDivision)) {
                        imageInputDivision.classList.remove('dragover');
                    }
                    event.preventDefault();
                },
                onRemove: function () {
                    Redige.setSelectionToPreviousSection(imageInputDivision);
                    Redige.patch({ action: 'deleteSection', sectionsIds: [image.id] });
                },
                // Input type URL functions
                onPaste: function (event) {
                    event.preventDefault();
                    inputUrl.value = extractPlainText(event);
                    insertImage(event.srcElement, image);
                },
                onKeyup: function (event) {
                    if (isEnter(event)) {
                        if (!insertImage(event.srcElement, image)) {
                            event.target.parentNode.classList.add('imageInput-linkUrlDiv-notValid');
                        }
                    } else {
                        event.target.parentNode.classList.remove('imageInput-linkUrlDiv-notValid');
                    }
                },
                onInput: function (event) {
                    // Disable button if URL input is empty
                    event.target.nextSibling.disabled = (inputUrl.value.length > 0) ? '' : 'disabled';
                },
                onValid: function (event) {
                    if (!insertImage(inputUrl, image)) {
                        event.target.parentNode.classList.add('imageInput-linkUrlDiv-notValid');
                    }
                },
                // Input type file functions
                onFileClick: function () {
                    inputUrl.value = null;
                },
                onChange: function () {
                    insertImage(inputFile, image);
                }
            });
        const inputUrl = imageInputDivision.querySelector(".imageInput-linkUrl");
        const inputFile = imageInputDivision.querySelector(".imageFile");

        setTimeout(function () {
            imageInputDivision.classList.add("imageInput-created");
            inputUrl.focus();
            Redige.dispatchEventByName('selectionChange');
        }, 0);

        return imageInputDivision;
    }

    function dragAndDrop(data, image) {
        const dataType = data.getData('text/plain');
        if (data.files.length > 0 && isImagePath(data.files[0].name)) {
            insertFromFile(data.files[0], image);
        } else if (dataType !== '') {
            insertFromUrl(dataType, image);
        } else {
            console.log("WTF ? nothing dragged");
        }
    }

    function insertImage(src, image) {
        if (src.files && src.files.length > 0 && isImagePath(src.files[0].name)) {
            insertFromFile(src.files[0], image);
        } else if (src.value) {
            insertFromUrl(src.value, image);
        } else {
            console.error("WTF ? input not an image");
        }
    }

    function insertFromFile(file, image) {
        Redige.patch({ action: 'updateSection', section: { id: image.id, data: file.path } }).then(function () {
            setSelectionAfterInsert(image);
            Redige.dispatchEventByName("rdg-fileInserted-event", "", { 'fileId': image.id, 'filePath': file.path });
        });
    }

    function insertFromUrl(url, image) {
        Redige.patch({ action: 'updateSection', section: { id: image.id, data: url } }).then(function () {
            setSelectionAfterInsert(image);
            Redige.dispatchEventByName("rdg-fileInserted-event", "", { 'fileId': image.id, 'filePath': url });
        });
    }

    function setSelectionAfterInsert(image) {
        Redige._editor.focus();
        Redige.setSelectionToNextSection(image);
    }

    function isImagePath(imgPath) {
        return (imgPath.toLowerCase().match(/\.(jpeg|jpg|gif|svg|png)$/i) !== null);
    }

    function isEnter(event) {
        return event.which === KEY_ENTER && event.ctrlKey === false;
    }

    function extractPlainText(event) {
        return event.clipboardData.getData("text/plain");
    }

    function isMouseInDivBound(event, element) {
        let rect = element.getBoundingClientRect();
        return event.x > rect.left + rect.width || event.x < rect.left || event.y > rect.top + rect.height || event.y < rect.top;
    }
