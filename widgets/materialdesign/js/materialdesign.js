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
    toggle: function (el, oid) {
        var $this = $(el);
        oid = oid || $this.data('oid');
        var min = $this.data('min');
        var max = $this.data('max');
        var urlTrue = $this.data('url-true');
        var urlFalse = $this.data('url-false');
        var oidTrue = $this.data('oid-true');
        var oidFalse = $this.data('oid-false');
        var oidTrueVal = $this.data('oid-true-value');
        var oidFalseVal = $this.data('oid-false-value');
        var readOnly = $this.data('read-only');
        if (min === '') min = undefined;
        if (max === '') max = undefined;
        if ((oid || oidTrue || urlTrue) && !vis.editMode && !readOnly) {
            var moved = false;
            $this.on('click touchend', function () {
                // Protect against two events
                if (vis.detectBounce(this)) return;
                if (moved) return;
                var val;
                if (oidTrue || urlTrue) {
                    if (!oidFalse && oidTrue) oidFalse = oidTrue;
                    if (!urlFalse && urlTrue) urlFalse = urlTrue;
                    if (!oid || oid === 'nothing_selected') {
                        val = !$(this).data('state');
                        // remember state
                        $(this).data('state', val);
                    } else {
                        val = vis.states[oid + '.val'];
                        if (max !== undefined) {
                            if (max === 'true') max = true;
                            if (max === 'false') max = false;
                            if (val === 'true') val = true;
                            if (val === 'false') val = false;
                            val = (val == max);
                        } else {
                            val = (val === 1 || val === '1' || val === true || val === 'true');
                        }
                        val = !val; // invert
                    }
                    if (min === undefined || min === 'false' || min === null) min = false;
                    if (max === undefined || max === 'true' || max === null) max = true;
                    if (oidTrue) {
                        if (val) {
                            if (oidTrueVal === undefined || oidTrueVal === null) oidTrueVal = max;
                            if (oidTrueVal === 'false') oidTrueVal = false;
                            if (oidTrueVal === 'true') oidTrueVal = true;
                            var f = parseFloat(oidTrueVal);
                            if (f.toString() == oidTrueVal) oidTrueVal = f;
                            vis.setValue(oidTrue, oidTrueVal);
                        } else {
                            if (oidFalseVal === undefined || oidFalseVal === null) oidFalseVal = min;
                            if (oidFalseVal === 'false') oidFalseVal = false;
                            if (oidFalseVal === 'true') oidFalseVal = true;
                            var f = parseFloat(oidFalseVal);
                            if (f.toString() == oidFalseVal) oidFalseVal = f;
                            vis.setValue(oidFalse, oidFalseVal);
                        }
                    }
                    if (urlTrue) {
                        if (val) {
                            vis.conn.httpGet(urlTrue)
                        } else {
                            vis.conn.httpGet(urlFalse);
                        }
                    }
                    // show new state
                    if (!oid || oid === 'nothing_selected') {
                        var img = $(this).data('img-class');
                        if (val) {
                            if ($(this).data('as-button')) $(this).addClass('ui-state-active');
                            val = $(this).data('img-true');
                        } else {
                            val = $(this).data('img-false');
                            if ($(this).data('as-button')) $(this).removeClass('ui-state-active');
                        }
                        $(this).find('.' + img).attr('src', val);
                    }
                } else {
                    var val = vis.states[oid + '.val'];
                    if ((min === undefined && (val === null || val === '' || val === undefined || val === false || val === 'false')) ||
                        (min !== undefined && min == val)) {
                        vis.setValue(oid, max !== undefined ? max : true);
                    } else
                        if ((max === undefined && (val === true || val === 'true')) ||
                            (max !== undefined && val == max)) {
                            vis.setValue(oid, min !== undefined ? min : false);
                        } else {
                            val = parseFloat(val);
                            if (min !== undefined && max !== undefined) {
                                if (val >= (max - min) / 2) {
                                    val = min;
                                } else {
                                    val = max;
                                }
                            } else {
                                if (val >= 0.5) {
                                    val = 0;
                                } else {
                                    val = 1;
                                }
                            }
                            vis.setValue(oid, val);
                        }
                }
            }).on('touchmove', function () {
                moved = true;
            }).on('touchstart', function () {
                moved = false;
            }).data('destroy', function (id, $widget) {
                $widget.off('click touchend').off('touchmove').off('touchstart');
            });
        }
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
};

vis.binds["materialdesign"].showVersion();