(function () {
    "use strict";

    const imageInput = require('../features/images/ImageInput');

    module.exports = function (Redige) {
        Redige.Image = (function () {

            const proto = Object.create(HTMLDivElement.prototype);
            proto.createdCallback = function () {
                this.id = Redige.getGUID();
                this.className = "section image";
                this.setAttribute("type", "image");
                this.setAttribute("contenteditable", "false");
                this._data = "";

                this._removeButton = buildBlockControlElements(this);
                this._editForm = imageInput.createImageInput(this);
                this._imageElm = buildImgElement(this);
                this.appendChild(this._imageElm);
                this._imageElm.appendChild(this._removeButton);
                Object.defineProperty(this, 'data', {
                    get: function () {
                        return this._data;
                    },
                    set: function (newData) {
                        this._data = newData;
                        if (isImageRelativeUrl(newData)) {
                            this._imageElm.firstChild.src = Redige.getDocument().file.workingDirectory + "/" + this._data;
                        } else {
                            this._imageElm.firstChild.src = this._data;
                        }
                    }
                });
            };

            const rdImage = document.registerElement('rd-image', { prototype: proto });

            rdImage.prototype.init = function (data) {
                if (data.id) {
                    this.id = data.id;
                }
                if (data.data) {
                    this.data = data.data;
                }
                if (data.url) {
                    this.url = data.url;
                }
                return this;
            };

            rdImage.prototype.parse = function () {
                return {
                    id: this.id,
                    data: this._data,
                    url: this.url,
                    type: 'image'
                };
            };

            proto.refreshContent = function () {
                this.render();
            };

            function isImageRelativeUrl(imgPath) {
                return (imgPath.toLowerCase().match(/^(?!(\/|http|https))(\.\.\/)*(\.?\/)?(.)*(jpeg|jpg|gif|svg|png)$/i) !== null);
            }

            function buildImgElement(elem) {
                const imageElement = tomplate(
                    '<div class="image-wrapper"><img src="' + elem._data + '" onerror="{onError()}"/></div>',
                    {
                        onError: function () {
                            imageElement.firstChild.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADICAYAAABS39xVAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUZCBgNzdiTGwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAUj0lEQVR42u3de3hU9Z3H8c/3zEwICZgEqFZqV6tysY/VWuuDgo/KkqA0yuNCSeaSG7e69VJvravVuse1q273WbtFd7uKQkjmlqCUFtCFhKVKvdTLY9vttiC21cdWCgpJ0Fxn5nz3j0wwhFxmmDv5vP7ySU5m5vzOOe/zO+eECBARERERERERERERERERERERERERERERERERERERERERERERERFljnAIckPrptapkbzI6aJymiEGt1sKWGqpih6w9dn2ly4pPcQRYbAoRqoqLVtbFkGwBCrXQXAqRyWdGwAHIboFik1l15Y9LyLKQWGwaBg7frbjSog8AsGlHI2siNerUL174eKFL3AwGCwaNKtq3db6XQUe5LbJvs0jwPdKy0sf4myLweLRoCot23auA7SOo5HVh0x9WfmCFYxWZhgcgiy5DHyu9V7GKidOLXX924o4wxqntm/bfoWo8XNujxyaEIt11dXlV7/IoeAMa9xdCooaP2CscutEL2r8QFW5zRis8aVla8siAHM4EjlnTnTbEYM1ri7Kl3AQuO2IwcqRa0K5joPAbUcMVtZr3dQ6lb/BntMzrFNbN7VO5UAwWOPjBD1Bp3MUuA2JwcoNFoo4CNyGxGAREYNFRMRgERExWETEYBERMVhERAwWETFYREQMFhERg0VEDBYREYNFRMRgERGDRUTEYBERg0VExGARETFYRMRgERExWEREDBYRMVhEI9h/kqzHO9yUDBad1PQZR6H9bECfyenVEKx3FNrPg2A9tymDRSdtrByu+fPn9zgKHa6cjZZg/cuvv7Rq/vz54fbOttWMFoNFJ2+swgAwf/78cE5GS7C+vbNttWmaFgBUVFRE2jvbVgNSz23MYNFJGKsBuRctqW/vbFtdUVERGfzVioqKSHvX4VWMFoNFJ2msci9aUt/edXjV0FgNjZYKGrjNGSwaLQk21VyMVe5ESzeMFqvB0erobFvBaDFYNIqXX3v5ley78RtbrLI9WipoaO9qXzlWrIZGC4pG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';
                        }
                    });
                return imageElement;
            }

            rdImage.prototype.edit = function () {
                this._imageElm.style.display = 'none';
                this._removeButton.style.display = 'none';
                this.appendChild(this._editForm);
                this.classList.add('edit');
            };

            rdImage.prototype.render = function () {
                this.classList.remove('edit');
                if (this._editForm.parentNode === this) {
                    this.removeChild(this._editForm);
                }
                this._imageElm.style.display = '';
                this._removeButton.style.display = '';
            };

            function buildBlockControlElements(elem) {
                return tomplate(
                    '<div class="block-control" contenteditable="false">' +
                    '<button class="block-control-remove" onclick="{onRemove()}"><i class="mdi mdi-minus"></i></button>' +
                    '</div>',
                    {
                        onRemove: function () {
                            Redige.setSelectionToPreviousSection(elem);
                            Redige.patch({ action: 'deleteSection', sectionsIds: [elem.id] });
                        }
                    });
            }

            return rdImage;
        })();
    };
})();