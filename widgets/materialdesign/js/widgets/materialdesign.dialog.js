/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.66"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

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
            console.error(`[Dialog] initialize: error: ${ex.message}, stack: ${ex.stack}`);
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
            console.error(`[Dialog] handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    vue: function (el, data) {
        try {
            let $this = $(el);
            let containerClass = 'materialdesign-vuetify-dialog';
            let wishHeight = 0;
            let fullscreen = false;

            console.log($(window).width());

            $this.append(`
            <div class="${containerClass}" style="width: 100%; height: 100%;">

                ${(data.showDialogMethod === 'button') ? `
                    <div class="materialdesign-button materialdesign-vuetify-dialog-button" id="dialog-button">
                        <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                            <span class="materialdesign-vuetify-calendar-control-button-icon mdi mdi-calendar-arrow-left"></span>
                            <span class="materialdesign-vuetify-calendar-control-button-text">open Dialog</span>
                        </div>
                    </div>
                ` : ''}


                <v-dialog
                    v-model="showDialog"
                    max-width="${myMdwHelper.getValueFromData(data.dialogMaxWidth, undefined) ? data.dialogMaxWidth : 'auto'}"
                    color="green"
                    :fullscreen="fullscreen"
                    :transition="transition"
                    >
                    <v-card height="auto">

                        <v-toolbar flat v-show="showToolbar" height="${myMdwHelper.getNumberFromData(data.fullscreenToolbarHeight, 64)}">
                            <v-btn class="v-dialog-toolbar-my-btn-layout" icon @click="closeButton">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                            <v-toolbar-title class="v-dialog-toolbar-my-title-layout" v-html="title"></v-toolbar-title>
                        </v-toolbar>

                        ${myMdwHelper.getBooleanFromData(data.showTitle, false) ? `<v-card-title class="v-dialog-my-title-layout" v-html="title" v-show="!showToolbar"></v-card-title>` : ''} 

                        <v-card-text class="v-dialog-view-container" id="viewContainer_${data.wid}"></v-card-text>

                        <div class="v-dialog-footer" v-show="!showToolbar">
                            <v-divider></v-divider>
                            <v-card-actions style="justify-content: ${data.buttonPosition};">
                                <v-spacer></v-spacer>
                                <v-btn color="primary"
                                    text
                                    ${(data.buttonSize !== 'medium') ? data.buttonSize : ''}
                                    ${(myMdwHelper.getBooleanFromData(data.buttonFullWidth, false)) ? 'block ' : ''}
                                    @click="closeButton" 
                                    v-html="closeText"
                                    style="color: ${myMdwHelper.getValueFromData(data.buttonFontColor, '#44739e')}; font-family: ${myMdwHelper.getValueFromData(data.buttonFont, 'inherit')}; font-size: ${myMdwHelper.getNumberFromData(data.buttonFontSize, 20)}px;"
                                    ></v-btn>
                            </v-card-actions>
                        </div>
                    </v-card>
                </v-dialog>
            `);

            // fullscreen
            // transition="dialog-bottom-transition"

            myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, 'Dialog', function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, 'Dialog', function () {

                    let vueDialog = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            fullscreen = $(window).width() <= myMdwHelper.getNumberFromData(data.fullscreenResolutionLower, 0);
                            return {
                                showDialog: false,
                                title: myMdwHelper.getValueFromData(data.title, myMdwHelper.getValueFromData(data.contains_view, '')),
                                closeText: myMdwHelper.getValueFromData(data.buttonText, _('close')),
                                showToolbar: fullscreen,
                                fullscreen: fullscreen,
                                transition: (fullscreen) ? 'dialog-bottom-transition' : 'dialog-transition'
                            }
                        },
                        methods: {
                            closeButton(value) {
                                vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
                                this.showDialog = false;
                            }
                        },
                        watch: {
                            showDialog(val) {
                                if (data.showDialogMethod === 'datapoint') {
                                    vis.setValue(data.showDialogOid, val);
                                }
                            }
                        }
                    });

                    if (data.showDialogMethod === 'button') {
                        let button = $this.find('.materialdesign-vuetify-dialog-button')
                        mdc.ripple.MDCRipple.attachTo(button.get(0));

                        button.click(function () {
                            vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);

                            if (!vueDialog.showDialog) {
                                showDialog(true);
                            }
                        });
                    } else {
                        vis.states.bind(data.showDialogOid + '.ts', function (e, newVal, oldVal) {
                            let val = vis.states.attr(data.showDialogOid + '.val');

                            if (!vueDialog.showDialog && (val === true || val === 'true')) {
                                showDialog(true)
                            } else if (vueDialog.showDialog && (val === false || val === 'false')) {
                                showDialog(false)
                            }
                        });
                    }

                    $(window).resize(function () {
                        setLayout();
                    });

                    function showDialog(show) {
                        setLayout();
                        vueDialog.showDialog = show;

                        myMdwHelper.waitForElement($("body"), '.v-dialog__content', data.wid, 'Dialog', function () {
                            let $dialog = $("body").find("#materialdesign-vuetify-container .v-dialog__content .v-dialog");

                            $dialog.get(0).style.setProperty("--vue-dialog-view-container-distance-to-border", myMdwHelper.getNumberFromData(data.viewDistanceToBorder, 24) + 'px');

                            $dialog.get(0).style.setProperty("--vue-dialog-title-font-size", myMdwHelper.getNumberFromData(data.titleFontSize, 20) + 'px');
                            $dialog.get(0).style.setProperty("--vue-dialog-title-font-color", myMdwHelper.getValueFromData(data.titleColor, ''));
                            $dialog.get(0).style.setProperty("--vue-dialog-title-font-family", myMdwHelper.getValueFromData(data.titleFont, 'inherit'));

                            $dialog.get(0).style.setProperty("--vue-toolbar-background-color", myMdwHelper.getValueFromData(data.fullscreenToolbarColor, ''));

                            $dialog.get(0).style.setProperty("--vue-ripple-effect-color", myMdwHelper.getValueFromData(data.pressColor, ''));

                            calcHeight();

                            let view = data.contains_view;
                            if (vis.views[view]) {
                                vis.renderView(view, view, true, function (_view) {
                                    $('#visview_' + _view).css('position', 'relative').css('height', wishHeight + 'px').appendTo($dialog.find(`#viewContainer_${data.wid}`)).show().data('persistent', true);
                                });
                            }
                        });
                    }

                    function setLayout() {
                        fullscreen = $(window).width() <= myMdwHelper.getNumberFromData(data.fullscreenResolutionLower, 0);
                        vueDialog.showToolbar = fullscreen;
                        vueDialog.fullscreen = fullscreen;
                        vueDialog.transition = (fullscreen) ? 'dialog-bottom-transition' : 'dialog-transition'

                        calcHeight();
                    }

                    function calcHeight() {
                        let $dialog = $("body").find("#materialdesign-vuetify-container .v-dialog__content .v-dialog");

                        wishHeight = myMdwHelper.getNumberFromData(data.viewHeight, 5000);

                        if (fullscreen) {
                            console.log('fullscreen');
                            let toolBarHeight = $dialog.find('.v-toolbar__content').height();
                            console.log(toolBarHeight);

                            console.log($(window).height());
                            wishHeight = $(window).height() - toolBarHeight - 1;

                            console.log(wishHeight);
                        } else {
                            console.log('not fullscreen');
                            let titleHeight = $dialog.find('.v-card__title').height();
                            let footerHeight = $dialog.find('.v-dialog-footer').height();

                            if (wishHeight > $(window).height() * 0.9) {
                                // wenn höhe größer als screen -> dann auf screen begrenzen um responsiv zu sein
                                wishHeight = $(window).height() * 0.9 - footerHeight - titleHeight - 35;
                            }
                        }

                        $dialog.find('.vis-view').css('height', wishHeight + 'px');
                    }
                });
            });
        } catch (ex) {
            console.error(`[Vuetify Dialog ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};