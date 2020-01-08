/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.34"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.dialog = {
    initialize: function (data, isIFrame = false) {
        try {
            let title = myMdwHelper.getValueFromData(data.title, '');
            let titleTextSize = myMdwHelper.getFontSize(data.titleTextSize);
            let buttonText = myMdwHelper.getValueFromData(data.buttonText, '');

            return `<div class="mdc-dialog"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="my-dialog-title"
                        aria-describedby="my-dialog-content"
                        style="z-index: ${myMdwHelper.getNumberFromData(data.z_index, 1000)}">
                        <div class="mdc-dialog__container">
                        <div class="mdc-dialog__surface">
                            <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
                            <h2 class="mdc-dialog__title ${titleTextSize.class}" id="my-dialog-title" style="${(title === '') ? 'display: none;' : ''}${titleTextSize.style}" >${myMdwHelper.getValueFromData(data.title, '')}</h2>
                            <div class="mdc-dialog__content" id="my-dialog-content">
                                ${(vis.editMode && !isIFrame) ? `<div data-vis-contains="${data.contains_view}" class="vis-widget-body vis-view-container" style="position: relative"></div>` : ''}
                                <!-- vis container for view generated at runtime --!>
                                
                                ${(isIFrame) ? `<iframe src="${data.src}" ${(data.noSandbox) ? '' : 'sandbox="allow-modals allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"'} style="position: relative; border: 0; padding: 0; margin: 0; width: 100%; height: 100%; ${(data.scrollX) ? 'overflow-x: scroll;' : 'overflow-x: hidden;'} ${(data.scrollY) ? 'overflow-y: scroll;' : 'overflow-y: hidden;'}" ${(data.seamless) ? 'seamless' : ''}></iframe>` : ''}
                            </div>
                            <footer class="mdc-dialog__actions" ${(buttonText === '') ? 'style="display: none"' : ''}>
                            <button type="button" class="mdc-button mdc-dialog__button" ${(!vis.editMode) ? 'data-mdc-dialog-action="close"' : ''} >
                            <span class="mdc-button__label">${buttonText}</span>
                            </button>
                        </footer>
                        </div>
                        </div>
                        <div class="mdc-dialog__scrim"></div>
                    </div>`;
        } catch (ex) {
            console.exception(`initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handle: function (el, data, isIFrame = false) {
        try {
            setTimeout(function () {
                var $this = $(el);
                let dialog = $this.find('.mdc-dialog');

                let widgetWidth = window.getComputedStyle($this.context, null).width;
                let widgetHeight = window.getComputedStyle($this.context, null).height;

                dialog.get(0).style.setProperty("--materialdesign-color-dialog-background", myMdwHelper.getValueFromData(data.colorBackground, ''));
                dialog.get(0).style.setProperty("--materialdesign-color-dialog-title-background", myMdwHelper.getValueFromData(data.colorTitleBackground, ''));
                dialog.get(0).style.setProperty("--materialdesign-color-dialog-title", myMdwHelper.getValueFromData(data.colorTitle, ''));

                dialog.get(0).style.setProperty("--materialdesign-color-dialog-button-background", myMdwHelper.getValueFromData(data.colorButtonBackground, ''));
                dialog.get(0).style.setProperty("--materialdesign-color-dialog-button-text", myMdwHelper.getValueFromData(data.colorButtonText, ''));
                dialog.get(0).style.setProperty("--materialdesign-color-dialog-button-hover", myMdwHelper.getValueFromData(data.colorButtonHover, ''));

                const mdcDialog = new mdc.dialog.MDCDialog(dialog.get(0));
                const button = mdc.ripple.MDCRipple.attachTo(dialog.find('.mdc-button').get(0));

                mdcDialog.escapeKeyAction = '';
                mdcDialog.scrimClickAction = '';

                if (vis.editMode && data.showInEditor) {
                    dialog.find('.mdc-dialog__container').css('width', '100%').css('height', '100%');
                    dialog.find('.mdc-dialog__surface').css('width', '100%').css('height', '100%');
                    dialog.css('position', 'relative');
                    dialog.find('.mdc-dialog__scrim').hide();

                    mdcDialog.open();

                } else if (!vis.editMode) {
                    dialog.find('.mdc-dialog__container').css('width', widgetWidth.replace('px', '')).css('height', widgetHeight.replace('px', ''));
                    dialog.find('.mdc-dialog__surface').css('width', '100%').css('height', '100%');

                    if (!data.showInCenterOfScreen) {
                        dialog.css('position', 'absolute');
                    }

                    vis.states.bind(data.showDialogOid + '.ts', function (e, newVal, oldVal) {
                        let val = vis.states.attr(data.showDialogOid + '.val');

                        if (!mdcDialog.isOpen && (val === true || val === 'true')) {
                            mdcDialog.open();
                        } else if (mdcDialog.isOpen && (val === false || val === 'false')) {
                            mdcDialog.close();
                        }
                    });

                    if (!vis.editMode) {
                        mdcDialog.listen('MDCDialog:closing', function () {                            
                            vis.setValue(data.showDialogOid, false);
                            vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
                        });
                    }

                    mdcDialog.listen('MDCDialog:opened', () => {
                        // generate vis view
                        if (!isIFrame) {
                            let view = data.contains_view;
                            if (vis.views[view]) {
                                vis.renderView(view, view, true, function (_view) {
                                    $('#visview_' + _view).css('position', 'relative').appendTo(dialog.find('.mdc-dialog__content')).show().data('persistent', true);
                                });
                            }
                        } else {
                            vis.binds.basic.iframeRefresh(dialog, data, this.view)
                        }
                    });
                }
            }, 1);

        } catch (ex) {
            console.exception(`handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};