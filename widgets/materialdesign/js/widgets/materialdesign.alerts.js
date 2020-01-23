/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.46"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.alerts =
    function (el, data) {
        try {
            let $this = $(el);
            let containerClass = 'materialdesign-vuetify-alerts';

            let borderLayout = '';
            if (myMdwHelper.getValueFromData(data.alertBorderLayout, null) !== null) {
                borderLayout = `border="${data.alertBorderLayout}"`;
            }


            let elements = []
            

            for (var i = 0; i <= data.showMaxAlerts - 1; i++) {
                let icon = 'home';
                let image = '';

                elements.push(`
                    <v-alert 
                        id="alert${i.toString()}"
                        :value="showAlert"
                        elevation="${myMdwHelper.getNumberFromData(data.alertElevation, 0)}"
                        ${data.alertLayouts}
                        ${borderLayout}
                        transition="scale-transition"
                    >
                    ${i.toString()}
                    Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Sed in libero ut nibh placerat accumsan.. Curabitur blandit mollis lacus. Curabitur blandit mollis lacus.
    
                    <template v-slot:append>
                        <div class="materialdesign-icon-button" index="${i}" style="position: relative; width: 30px; height: 30px;">
                            <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                                <span class="mdi mdi-${myMdwHelper.getValueFromData(data.closeIcon, 'close-circle-outline')} materialdesign-icon-image " style="font-size: 20px; color: var(--vue-alerts-button-close-color);"></span>                    
                            </div>
                        </div>
                    </template>

                    <template v-slot:prepend>
                       ${(icon !== '')? `<v-icon class="materialdesign-v-alerts-icon-prepand">${icon}</v-icon>`: ''}
                       ${(image !== '')? `<img class="materialdesign-v-alerts-image-prepand" src="${image}" />`: ''}
                    </template>                    
    
                    </v-alert>`)
            }

            $this.append(`
                <div class="${containerClass}" style="width: 100%; height: 100%;">
                    ${elements.join('')}
                </div>
            `);

            myMdwHelper.waitForElement($this, `.${containerClass}`, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    Vue.use(VueTheMask);
                    let alert = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            return {
                                showAlert: true,
                            }
                        }
                    });


                    let iconButtons = $this.find('.materialdesign-icon-button');
                    for(var b = 0;b <= iconButtons.length -1; b++){
                        // set ripple effect to icon buttons
                        new mdc.iconButton.MDCIconButtonToggle($this.find('.materialdesign-icon-button').get(b));
                    }

                    $this.find('.materialdesign-icon-button').click(function () {
                        let index = $(this).attr('index')
                        $this.find(`#alert${index}`).fadeOut('normal');
                    });

                    vis.states.bind(data.oid + '.lc', function (e, newVal, oldVal) {
                        $this.find(`.v-alert`).show();
                    });
                    
                    $this.context.style.setProperty("--vue-alerts-background-color", myMdwHelper.getValueFromData(data.alertBackgroundColor, ''));

                    $this.context.style.setProperty("--vue-alerts-border-color", myMdwHelper.getValueFromData(data.alertBorderColor, ''));
                    $this.context.style.setProperty("--vue-alerts-border-outlined-color", myMdwHelper.getValueFromData(data.alertBorderOutlinedColor, ''));
                    
                    $this.context.style.setProperty("--vue-alerts-button-close-color", myMdwHelper.getValueFromData(data.closeIconColor, ''));
                    $this.context.style.setProperty("--mdc-theme-primary", myMdwHelper.getValueFromData(data.closeIconPressColor, ''));

                    $this.context.style.setProperty("--vue-alerts-text-font-family", myMdwHelper.getValueFromData(data.alertFontFamily, 'inherit'));
                    $this.context.style.setProperty("--vue-alerts-text-font-color", myMdwHelper.getValueFromData(data.alertFontColor, 'inherit'));
                    $this.context.style.setProperty("--vue-alerts-text-size", myMdwHelper.getNumberFromData(data.alertFontSize, '16') + 'px');

                });
            });

        } catch (ex) {
            console.error(`[Vuetify Alerts]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };