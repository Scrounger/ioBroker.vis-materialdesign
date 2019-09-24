/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.0.1"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// add translations for edit mode
$.get("adapter/vis-materialdesign/words.js", function (script) {
    let translation = script.substring(script.indexOf('{'), script.length);
    translation = translation.substring(0, translation.lastIndexOf(';'));
    $.extend(systemDictionary, JSON.parse(translation));
});

// this code can be placed directly in materialdesign.html
vis.binds["materialdesign"] = {
    version: "0.0.1",
    showVersion: function () {
        if (vis.binds["materialdesign"].version) {
            console.log('Version vis-materialdesign: ' + vis.binds["materialdesign"].version);
            vis.binds["materialdesign"].version = null;
        }
    },
    createWidget: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds["materialdesign"].createWidget(widgetID, view, data, style);
            }, 100);
        }

        var text = '';
        text += 'OID: ' + data.oid + '</div><br>';
        text += 'OID value: <span class="myset-value">' + vis.states[data.oid + '.val'] + '</span><br>';
        text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + '</span><br>';
        text += 'extraAttr: ' + data.extraAttr + '<br>';
        text += 'Browser instance: ' + vis.instance + '<br>';
        text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || '') + '</textarea><br>';

        $('#' + widgetID).html(text);

        // subscribe on updates of value
        if (data.oid) {
            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                $div.find('.materialdesign-value').html(newVal);
            });
        }
    },
    addRippleEffect: function (el) {
        var $this = $(el).parent();
        mdc.ripple.MDCRipple.attachTo($this.context);
    },
    itoggle: function (el, data) {
        var $this = $(el).parent();
        var oid = $this.parent().attr('data-oid');
        if (oid) {
            oid += '.val';
        }
        var val = vis.states.attr(oid);
        var activeVal = $this.parent().data('val');
        if (activeVal === '' || activeVal === undefined) activeVal = null;
        if (activeVal !== null) {
            if (val === null || val === undefined) val = '';
            if (activeVal.toString() === val.toString()) {

                $this.find('.imgToggleFalse').hide();
                $this.find('.imgToggleTrue').show();

                $this.find('.labelToggleFalse').hide();
                $this.find('.labelToggleTrue').show();

                // True -> colorBgTrue color nehmen
                (data.colorBgTrue !== '') ? $this.css('background', data.colorBgTrue) : (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                (data.labelColorBgTrue !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgTrue) : (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
            }
        } else {
            if (val === 'false') val = false;
            if (val === 'true') val = true;
            if (typeof val === 'string') {
                var f = parseFloat(val);
                if (f == val) {
                    val = f;
                } else {
                    val = val !== '';
                }
            }
            if (val > 0) {
                $this.find('.imgToggleFalse').hide();
                $this.find('.imgToggleTrue').show();

                $this.find('.labelToggleFalse').hide();
                $this.find('.labelToggleTrue').show();

                // True -> colorBgTrue color nehmen
                (data.colorBgTrue !== '') ? $this.css('background', data.colorBgTrue) : (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                (data.labelColorBgTrue !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgTrue) : (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
            }
        }
        function onChange(e, val) {
            if (activeVal !== null) {
                if (activeVal.toString() === val.toString()) {
                    $this.find('.imgToggleFalse').hide();
                    $this.find('.imgToggleTrue').show();

                    $this.find('.labelToggleFalse').hide();
                    $this.find('.labelToggleTrue').show();

                    // True -> colorBgTrue color nehmen
                    (data.colorBgTrue !== '') ? $this.css('background', data.colorBgTrue) : (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                    (data.labelColorBgTrue !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgTrue) : (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                } else {
                    $this.find('.imgToggleTrue').hide();
                    $this.find('.imgToggleFalse').show();

                    $this.find('.labelToggleTrue').hide();
                    $this.find('.labelToggleFalse').show();

                    // False -> css color nehmen
                    (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                    (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                }
            } else {
                if (val === true || val === 'true' || parseFloat(val) > 0) {
                    $this.find('.imgToggleFalse').hide();
                    $this.find('.imgToggleTrue').show();

                    $this.find('.labelToggleFalse').hide();
                    $this.find('.labelToggleTrue').show();

                    // True -> colorBgTrue color nehmen
                    (data.colorBgTrue !== '') ? $this.css('background', data.colorBgTrue) : (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                    (data.labelColorBgTrue !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgTrue) : (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                } else {
                    $this.find('.imgToggleTrue').hide();
                    $this.find('.imgToggleFalse').show();

                    $this.find('.labelToggleTrue').hide();
                    $this.find('.labelToggleFalse').show();

                    // False -> css color nehmen
                    (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                    (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                }
            }
        }
        if (oid) {
            vis.states.bind(oid, onChange);
            // remember all ids, that bound
            $this.parent()
                .data('bound', [oid])
                // remember bind handler
                .data('bindHandler', onChange);
        }
    },
    mdcSwitch: function (el) {
        var $this = $(el);
        var oid = $this.data('oid'); // Object ID
        var wid = $this.data('oid-working'); // Work ID

        // root element
        let mdcSwitch = mdc.switchControl.MDCSwitch.attachTo($this.parents('.mdc-switch')[0]);

        function onChange() {
            let val = vis.states.attr(oid + '.val');
            mdcSwitch.checked = val;

            if (val === true) {
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchPrepandFalse').hide();
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchPrepandTrue').show();

                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchAppendFalse').hide();
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchAppendTrue').show();
            } else {
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchPrepandTrue').hide();
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchPrepandFalse').show();

                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchAppendTrue').hide();
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchAppendFalse').show();
            }
        }

        if (oid) {
            var bound = [];
            vis.states.bind(oid + '.val', onChange);
            bound.push(oid + '.val');
            if (wid) {
                vis.states.bind(wid + '.val', onChange);
                bound.push(wid + '.val');
            }
            // remember all ids, that bound
            $this.closest('.vis-widget')
                .data('bound', bound)
                // remember bind handler
                .data('bindHandler', onChange);


            let val = vis.states.attr(oid + '.val');
            mdcSwitch.checked = val;

            if (val === true || val === 'true') {
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchPrepandFalse').hide();
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchPrepandTrue').show();

                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchAppendFalse').hide();
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchAppendTrue').show();
            } else {
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchPrepandTrue').hide();
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchPrepandFalse').show();

                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchAppendTrue').hide();
                $this.parents('.materialdesign.vis-widget-body').find('.labelSwitchAppendFalse').show();
            }
        }

        if (!vis.editMode) {
            $this.change(function () {
                var $this_ = $(this);
                if ($this_.prop('checked')) {
                    vis.setValue($this_.data('oid'), true);
                } else {
                    vis.setValue($this_.data('oid'), false);
                }
            });
        }
    },
};

vis.binds["materialdesign"].showVersion();