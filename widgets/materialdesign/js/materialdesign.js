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
    mdcSlider: function (el, options) {
        try {
            setTimeout(function () {
                // timeout damit slider funktioniert notwendig
                let $this = $(el);
                var oid = $this.attr('data-oid');
                var wid = $this.attr('data-oid-working');

                const mdcSlider = new mdc.slider.MDCSlider($this.context);

                var min = (options.min === undefined || options.min === null || options.min === '') ? 0.00 : parseFloat(options.min);
                var max = (options.max === undefined || options.min === null || options.max === '') ? 1.00 : parseFloat(options.max);
                var unit = (options.max === undefined || options.min === null || options.max === '') ? '' : '&nbsp;' + options.unit;

                if (max < min) {
                    var tmp = max;
                    max = min;
                    min = tmp;
                }

                var val = vis.states.attr(oid + '.val');
                if (val === true || val === 'true') val = max;
                if (val === false || val === 'false') val = min;
                val = parseFloat(val);
                if (isNaN(val)) val = min;

                if (val < min) val = min;
                if (val > max) val = max;

                options.min = min;
                options.max = max;
                options.simRange = 100;
                options.range    = options.max - options.min;
                options.factor   = options.simRange / options.range;
                val = Math.floor((val - options.min) * options.factor);

                if (!vis.states.attr(wid + '.val')) {
                    mdcSlider.value = val;
                    $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html(val + unit);
                }

                mdcSlider.listen('MDCSlider:change', function () {
                    val = (parseFloat(val) / options.factor) + options.min;
                    if (options.step) {
                        val = Math.round(val / options.step) * options.step;
                    }
                    if (options.digits !== undefined && options.digits !== null && options.digits !== '') {
                        vis.setValue(oid, mdcSlider.value.toFixed(options.digits));
                    } else {
                        vis.setValue(oid, mdcSlider.value);
                    }
                });

                vis.states.bind(oid + '.val', function (e, newVal, oldVal) {

                    var val = vis.states.attr(oid + '.val');
                    if (val === true  || val === 'true')  val = options.max;
                    if (val === false || val === 'false') val = options.min;
                    val = parseFloat(val);
                    if (isNaN(val)) val = options.min;
                    if (val < options.min) val = options.min;
                    if (val > options.max) val = options.max;
                    val = Math.floor((val - options.min) * options.factor);
                    try {
                        if (!vis.states.attr(wid + '.val')) {
                            mdcSlider.value = val;
                            $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html(val + unit);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                });

            }, 1);
        } catch (err) {
            console.log(`mdcSlider: ${err.message} ${err.stack}`);
        }
    },
    mdcProgress: function (el, options) {
        let $this = $(el);
        var oid = $this.attr('data-oid');

        const mdcProgress = new mdc.linearProgress.MDCLinearProgress($this.context);

        var min = (options.min === undefined || options.min === null || options.min === '') ? 0.00 : parseFloat(options.min);
        var max = (options.max === undefined || options.min === null || options.max === '') ? 1.00 : parseFloat(options.max);
        var unit = (options.max === undefined || options.min === null || options.max === '') ? '' : '&nbsp;' + options.unit;
        var decimals = (options.maxDecimals === undefined || options.maxDecimals === null || options.maxDecimals === '') ? 0 :  options.maxDecimals;
        var reverse = (options.reverse === undefined || options.reverse === null || options.reverse === '') ? false :  options.reverse;

        if (max < min) {
            var tmp = max;
            max = min;
            min = tmp;
        }

        var val = vis.states.attr(oid + '.val');
        if (val === true || val === 'true') val = max;
        if (val === false || val === 'false') val = min;
        val = parseFloat(val);
        if (isNaN(val)) val = min;

        if (val < min) val = min;
        if (val > max) val = max;

        options.min = min;
        options.max = max;
        options.simRange = 100;
        options.range = options.max - options.min;
        options.factor = options.simRange / options.range;
        val = Math.floor((val - options.min) * options.factor);

        mdcProgress.progress = val / 100;
        mdcProgress.reverse = reverse;
        
        let valueLabel = Math.round(vis.states.attr(oid + '.val') * Math.pow(10, decimals)) / Math.pow(10, decimals)
        $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html('&nbsp;' + valueLabel  + unit + '&nbsp;');

        vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
            var val = vis.states.attr(oid + '.val');
            if (val === true || val === 'true') val = options.max;
            if (val === false || val === 'false') val = options.min;
            val = parseFloat(val);
            if (isNaN(val)) val = options.min;
            if (val < options.min) val = options.min;
            if (val > options.max) val = options.max;
            val = Math.floor((val - options.min) * options.factor);
            try {
                mdcProgress.progress = val / 100;
                let valueLabel = Math.round(vis.states.attr(oid + '.val') * Math.pow(10, decimals)) / Math.pow(10, decimals)
                $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html('&nbsp;' + valueLabel  + unit + '&nbsp;');
            } catch (e) {
                console.error(e);
            }
        });
    },
};

vis.binds["materialdesign"].showVersion();