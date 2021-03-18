/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.dialog = {
    vue: function (el, data, isIFrame = false) {
        let widgetName = 'Dialog';
        let dialogClassName = data.wid;

        try {
            let $this = $(el);
            let containerClass = 'materialdesign-vuetify-dialog';

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            setTimeout(function () {
                if (data.showDialogMethod === 'button') {
                    $this.css('overflow', 'visible');

                    if (data.buttonStyle === 'icon') {
                        $this.find('.materialdesign-button').removeClass('materialdesign-button').addClass('materialdesign-icon-button')
                        let $btn = $this.find('.materialdesign-icon-button');

                        vis.binds.materialdesign.button.initialize($btn, data, 'navigation_icon');
                        vis.binds.materialdesign.addRippleEffect($btn.children(), data, true);

                        delete data.buttonStyle;
                    } else {
                        if (data.imageColor === '#mdwTheme:vis-materialdesign.0.colors.button.icon.icon_off') {
                            delete data.imageColor;
                        }
                        let $btn = $this.find('.materialdesign-button');
                        vis.binds.materialdesign.button.initialize($btn, data, 'navigation_default');
                        vis.binds.materialdesign.addRippleEffect($btn.children(), data, false);
                    }
                } else {
                    dialogClassName = data.showDialogOid.replace(/\./g, '_')
                    if (vis.editMode) {
                        $this.append(_('dialogUsingDatapoint'));
                    } else {
                        $this.hide();
                    }
                }

                let wishHeight = 0;
                let fullscreen = false;

                if ($(`.dialog_${dialogClassName}`).parent().length > 0) {
                    // bei Änderungen am Widget, wird Widget neu erzeugt. Dialog hängt aber unter vis app, deshalb zu erst entfernen damit nicht doppelt
                    $(`.dialog_${dialogClassName}`).parent().remove();
                    $("body").find('.v-overlay__scrim').not(':first').remove();
                    $("body").find('.v-overlay').not(':first').remove();
                }

                $this.append(`
                    <div class="${containerClass}" style="width: 100%; height: 100%; z-index: ${myMdwHelper.getNumberFromData(data.z_index - 2, 202)}">
                        <v-dialog
                            v-model="showDialog"
                            max-width="${myMdwHelper.getValueFromData(data.dialogMaxWidth, undefined) ? data.dialogMaxWidth : 'auto'}"
                            :fullscreen="fullscreen"
                            :transition="transition"
                            :overlay-color="overlayColor"
                            :overlay-opacity="overlayOpacity"
                            content-class="dialog_${dialogClassName}"
                            :persistent="persistent"
                            :no-click-animation="persistentClickAnimation"
                            eager
                            ${myMdwHelper.getBooleanFromData(data.closingClickOutside, false) ? '' : 'persistent'}
                            >

                            <v-card id="dialog_card_${dialogClassName}" height="auto" style="background: ${myMdwHelper.getValueFromData(data.backgroundColor, '')}">

                                <v-toolbar flat v-show="showToolbar" height="${myMdwHelper.getNumberFromData(data.headerHeight, 64)}">
                                    <v-toolbar-title class="v-dialog-toolbar-my-title-layout" v-html="title"></v-toolbar-title>    
                                    <v-btn class="v-dialog-toolbar-my-btn-layout" icon @click="closeButton" style="text-indent: 0;">
                                        <v-icon class="dialog-fullscreen-close-icon">mdi-${myMdwHelper.getValueFromData(data.fullscreenCloseIcon, 'close')}</v-icon>
                                    </v-btn>
                                </v-toolbar>

                                ${myMdwHelper.getBooleanFromData(data.showTitle, false) ? `<v-card-title class="v-dialog-my-title-layout" v-html="title" v-show="!showToolbar" style="height: ${myMdwHelper.getNumberFromData(data.headerHeight, 50)}px;"></v-card-title>` : ''} 

                                <v-card-text class="v-dialog-view-container" id="viewContainer_${dialogClassName}">
                                    ${(isIFrame) ? `<iframe class="iFrame_container" src="${data.src}" ${(data.noSandbox) ? '' : 'sandbox="allow-modals allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"'} style="position: relative; border: 0; padding: 0; margin: 0; width: 100%; height: 100%; ${(data.scrollX) ? 'overflow-x: scroll;' : 'overflow-x: hidden;'} ${(data.scrollY) ? 'overflow-y: scroll;' : 'overflow-y: hidden;'}" ${(data.seamless) ? 'seamless' : ''}></iframe>` : ''}
                                </v-card-text>

                                <div class="v-dialog-footer" v-show="!showToolbar" style="height: ${myMdwHelper.getNumberFromData(data.footerHeight, myMdwHelper.getBooleanFromData(data.showTitle, false) ? 61 : 56)}px">
                                    ${myMdwHelper.getBooleanFromData(data.showDivider, false) ? `<div class="dialog-footer-divider" style="width: 100%; height: 1px; background: ${myMdwHelper.getValueFromData(data.dividerColor, 'lightgray')}; margin-top: 4px;"></div>` : ''}
                                    <v-card-actions class="v-dialog-my-card-actions" style="justify-content: ${data.buttonPosition};">
                                        <v-btn color="primary" class="materialdesign-dialog-footer-button"
                                            text
                                            ${(data.buttonSize !== 'medium') ? data.buttonSize : ''}
                                            ${(myMdwHelper.getBooleanFromData(data.buttonFullWidth, false)) ? 'block ' : ''}
                                            @click="closeButton"
                                            v-html="closeText"
                                            ></v-btn>
                                    </v-card-actions>
                                </div>
                            </v-card>
                        </v-dialog>
                `);

                myMdwHelper.oidNeedSubscribe(data.showDialogOid, data.wid, 'Dialog', true);

                myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Dialog', function () {
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
                                        transition: (fullscreen) ? 'dialog-bottom-transition' : 'dialog-transition',
                                        persistent: fullscreen ? true : false,
                                        persistentClickAnimation: fullscreen ? true : false,
                                        overlayColor: myMdwHelper.getValueFromData(data.overlayColor, ''),
                                        overlayOpacity: myMdwHelper.getNumberFromData(data.overlayOpacity, 0.6)
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
                                            myMdwHelper.setValue(data.showDialogOid, val);
                                        }
                                    }
                                }
                            });

                            if (data.showDialogMethod === 'button') {
                                let button = $this;
                                button.context.style.setProperty("--materialdesign-color-primary", myMdwHelper.getValueFromData(data.mdwButtonPrimaryColor, ''));
                                button.context.style.setProperty("--materialdesign-color-secondary", myMdwHelper.getValueFromData(data.mdwButtonSecondaryColor, ''));
                                button.context.style.setProperty("--materialdesign-color-button-pressed", myMdwHelper.getValueFromData(data.mdwButtonColorPress, ''));
                                button.context.style.setProperty("--materialdesign-font-button", myMdwHelper.getValueFromData(data.textFontFamily, ''));
                                button.context.style.setProperty("--materialdesign-font-size-button", myMdwHelper.getStringFromNumberData(data.textFontSize, 'inherit', '', 'px'));

                                $this.find('.materialdesign-icon-image').css('color', myMdwHelper.getValueFromData(data.imageColor, '#44739e'));

                                if (data.buttonStyle === 'icon') {
                                    mdc.iconButton.MDCIconButtonToggle.attachTo(button.get(0));
                                    button.context.style.setProperty("--materialdesign-color-icon-button-hover", myMdwHelper.getValueFromData(data.mdwButtonColorPress, ''));
                                } else {
                                    button.context.style.setProperty("--materialdesign-color-button-pressed", myMdwHelper.getValueFromData(data.mdwButtonColorPress, ''));
                                    mdc.ripple.MDCRipple.attachTo(button.get(0));
                                }

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

                                myMdwHelper.waitForElement($("body"), `#dialog_card_${dialogClassName}`, data.wid, 'Dialog', function () {
                                    let $dialog = $("body").find(`#dialog_card_${dialogClassName}`);

                                    $(document).on("mdwSubscribe", function (e, oids) {
                                        if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                                            setStyle();
                                        }
                                    });

                                    vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                                        setStyle();
                                    });

                                    vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                                        setStyle();
                                    });

                                    setStyle();
                                    function setStyle() {
                                        $dialog.get(0).style.setProperty("--vue-dialog-view-container-distance-to-border", myMdwHelper.getNumberFromData(data.viewDistanceToBorder, 24) + 'px');

                                        $dialog.get(0).style.setProperty("--vue-dialog-title-font-size", myMdwHelper.getNumberFromData(data.titleFontSize, 20) + 'px');
                                        $dialog.get(0).style.setProperty("--vue-dialog-title-font-color", myMdwHelper.getValueFromData(data.titleColor, ''));
                                        $dialog.get(0).style.setProperty("--vue-dialog-title-font-family", myMdwHelper.getValueFromData(data.titleFont, 'inherit'));

                                        $dialog.get(0).style.setProperty("--vue-dialog-footer-background-color", myMdwHelper.getValueFromData(data.footerBackgroundColor, ''));

                                        if (fullscreen) {
                                            $dialog.get(0).style.setProperty("--vue-toolbar-background-color", myMdwHelper.getValueFromData(data.headerBackgroundColor, '#44739e'));
                                            $dialog.get(0).style.setProperty("--vue-ripple-effect-color", myMdwHelper.getValueFromData(data.fullscreenCloseIconPressColor, '#ffffff'));
                                            $dialog.get(0).style.setProperty("--vue-dialog-fullscreen-color-icon", myMdwHelper.getValueFromData(data.fullscreenCloseIconColor, '#ffffff'));
                                        } else {
                                            $dialog.get(0).style.setProperty("--vue-toolbar-background-color", myMdwHelper.getValueFromData(data.headerBackgroundColor, 'initial'));
                                            $dialog.get(0).style.setProperty("--vue-ripple-effect-color", myMdwHelper.getValueFromData(data.pressColor, ''));
                                        }

                                        $dialog.css('background', myMdwHelper.getValueFromData(data.backgroundColor, ''));

                                        $dialog.find('.v-card').css('background', myMdwHelper.getValueFromData(data.backgroundColor, ''));


                                        $dialog.get(0).style.setProperty("--dialog-footer-button-text-color", myMdwHelper.getValueFromData(data.buttonFontColor, ''));
                                        $dialog.get(0).style.setProperty("--dialog-footer-button-text-font", myMdwHelper.getValueFromData(data.buttonFont, 'inherit'));
                                        $dialog.get(0).style.setProperty("--dialog-footer-button-text-font-size", myMdwHelper.getNumberFromData(data.buttonFontSize, 20) + 'px');

                                        $dialog.find('.dialog-footer-divider').css('background', myMdwHelper.getValueFromData(data.dividerColor, 'lightgray'));

                                        vueDialog.overlayColor = myMdwHelper.getValueFromData(data.overlayColor, '');
                                        vueDialog.overlayOpacity = myMdwHelper.getNumberFromData(data.overlayOpacity, 0.6);

                                        // Overlay
                                        $("body").find('.v-overlay__scrim').not(':first').off().remove();
                                        $("body").find('.v-overlay').not(':first').off().remove();
                                    }

                                    calcHeight();

                                    let view = data.contains_view;
                                    if ($dialog.find('#visview_' + view).length < 1) {
                                        if (!isIFrame) {
                                            if (vis.views[view]) {
                                                vis.renderView(view, view, true, function (_view) {
                                                    $('#visview_' + _view).css('position', 'relative').css('height', wishHeight + 'px').appendTo($dialog.find(`#viewContainer_${dialogClassName}`)).show().data('persistent', true);
                                                });
                                            }
                                        } else {
                                            vis.binds.basic.iframeRefresh($dialog, data, view)
                                        }

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
                                let $dialog = $("body").find(`#dialog_card_${dialogClassName}`);
                                let windowHeight = $(window).height();

                                wishHeight = myMdwHelper.getValueFromData(data.viewHeight, '100%');

                                if (wishHeight.indexOf('%') >= 0) {
                                    wishHeight = windowHeight * parseFloat(wishHeight.replace('%', '')) / 100;
                                } else {
                                    wishHeight = parseFloat(wishHeight.replace('px', ''));
                                }

                                if (fullscreen) {
                                    let toolBarHeight = $dialog.find('.v-toolbar__content').height();
                                    wishHeight = Math.floor(windowHeight - toolBarHeight - 1);

                                } else {
                                    let titleHeight = $dialog.find('.v-card__title').outerHeight();
                                    let footerHeight = $dialog.find('.v-dialog-footer').height();

                                    wishHeight = wishHeight - titleHeight - footerHeight - 5;

                                    if (wishHeight > windowHeight * 0.9 || (wishHeight + titleHeight + footerHeight) > windowHeight * 0.9) {
                                        // wenn höhe größer als screen -> dann auf screen begrenzen um responsiv zu sein
                                        wishHeight = Math.floor(windowHeight * 0.9 - footerHeight - titleHeight - 5);
                                    }
                                }

                                if (fullscreen) {
                                    $dialog.get(0).style.setProperty("--vue-toolbar-background-color", myMdwHelper.getValueFromData(data.headerBackgroundColor, '#44739e'));
                                    $dialog.get(0).style.setProperty("--vue-ripple-effect-color", myMdwHelper.getValueFromData(data.fullscreenCloseIconPressColor, '#ffffff'));
                                } else {
                                    $dialog.get(0).style.setProperty("--vue-toolbar-background-color", myMdwHelper.getValueFromData(data.headerBackgroundColor, 'initial'));
                                    $dialog.get(0).style.setProperty("--vue-ripple-effect-color", myMdwHelper.getValueFromData(data.pressColor, ''));
                                }

                                if (!isIFrame) {
                                    $dialog.find('#visview_' + data.contains_view).css('height', wishHeight + 'px');
                                } else {
                                    $dialog.find('.iFrame_container').css('height', (wishHeight - 2) + 'px');
                                }
                            }
                        });
                    });
                });
            }, 1);
        } catch (ex) {
            console.error(`[Dialog - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};